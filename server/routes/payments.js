import express from 'express';
import User from '../models/users.js';
import Payment from '../models/payment.js';
import { limitPaymentCheck } from '../middleware/ratelimit.js';
import { verifyAdmin } from '../middleware/auth.js';
import { strictOriginCheck, validateOrigin } from '../middleware/originCheck.js';
import { logPayment, logPaymentStatusChange, logAdminAction } from '../utils/logger.js';

const router = express.Router();

// Check if user exists and if payment already submitted
router.get('/check', limitPaymentCheck, validateOrigin, async (req, res) => {
  try {
    const { name, phone } = req.query;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Missing name or phone' });
    }

    // Find user by name and phone
    // Split full name into parts for searching
    const nameParts = name.trim().split(/\s+/);
    let user = null;

    // Try different search strategies
    if (nameParts.length === 2) {
      // If two names provided, try firstName + lastName
      user = await User.findOne({
        firstName: { $regex: nameParts[0], $options: 'i' },
        lastName: { $regex: nameParts[1], $options: 'i' },
        phone: phone
      });
    }

    // If not found, try matching any word in the name
    if (!user) {
      user = await User.findOne({
        $or: [
          { firstName: { $regex: name, $options: 'i' } },
          { lastName: { $regex: name, $options: 'i' } },
          ...nameParts.map(part => ({ firstName: { $regex: part, $options: 'i' } })),
          ...nameParts.map(part => ({ lastName: { $regex: part, $options: 'i' } }))
        ],
        phone: phone
      });
    }

    // User doesn't exist in database
    if (!user) {
      return res.json({
        exists: false,
        userExists: false,
        message: 'ไม่พบชื่อและเบอร์โทรนี้ในรายชื่อผู้สมัคร'
      });
    }

    // Check if payment already exists for this user
    const payment = await Payment.findOne({ userId: user._id });

    return res.json({
      exists: !!payment,
      userExists: true,
      user: {
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        school: user.school
      },
      message: payment ? 'ได้ชำระเงินแล้ว' : 'ยังไม่ได้ชำระเงิน'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check payment' });
  }
});

// Upload payment slip
router.post('/', strictOriginCheck, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const file = req.files?.slip;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Missing name or phone' });
    }

    if (!file) {
      return res.status(400).json({ error: 'Missing slip file' });
    }

    // Find user by name and phone
    // Split full name into parts for searching
    const nameParts = name.trim().split(/\s+/);
    let user = null;

    // Try different search strategies
    if (nameParts.length === 2) {
      // If two names provided, try firstName + lastName
      user = await User.findOne({
        firstName: { $regex: nameParts[0], $options: 'i' },
        lastName: { $regex: nameParts[1], $options: 'i' },
        phone: phone
      });
    }

    // If not found, try matching any word in the name
    if (!user) {
      user = await User.findOne({
        $or: [
          { firstName: { $regex: name, $options: 'i' } },
          { lastName: { $regex: name, $options: 'i' } },
          ...nameParts.map(part => ({ firstName: { $regex: part, $options: 'i' } })),
          ...nameParts.map(part => ({ lastName: { $regex: part, $options: 'i' } }))
        ],
        phone: phone
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ userId: user._id });
    if (existingPayment) {
      return res.status(409).json({ message: 'Payment already submitted' });
    }

    // Convert file to base64
    const imageBase64 = file.data.toString('base64');
    const mimeType = file.mimetype || 'image/jpeg';
    const slipImage = `data:${mimeType};base64,${imageBase64}`;

    // Create payment record
    const payment = new Payment({
      userId: user._id,
      name: user.firstName + ' ' + user.lastName,
      phone: phone,
      slipImage: slipImage,
      status: 'pending'
    });

    await payment.save();
    logPayment(req, { name: user.firstName + ' ' + user.lastName, phone }, true);
    res.json({ success: true, message: 'Payment submitted successfully', payment });
  } catch (err) {
    console.error(err);
    logPayment(req, { name: req.body.name, phone: req.body.phone }, false, err.message);
    res.status(500).json({ error: 'Failed to upload payment' });
  }
});

// Get all payments (for admin)
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('userId', 'firstName lastName email phone school')
      .sort({ uploadDate: -1 })
      .lean();

    const mapped = payments.map(p => ({
      id: p._id,
      userId: p.userId._id,
      userName: p.userId.firstName + ' ' + p.userId.lastName,
      email: p.userId.email,
      phone: p.phone,
      school: p.userId.school,
      slipImage: p.slipImage,
      uploadDate: p.uploadDate,
      status: p.status,
      note: p.note || ''
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Update payment status (admin only)
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update payment status
    const payment = await Payment.findByIdAndUpdate(
      id,
      { status, note },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Map payment status to user status
    // payment status: pending, approved, rejected
    // user status: pending, success, declined
    let userStatus = 'pending';
    if (status === 'approved') {
      userStatus = 'success';
    } else if (status === 'rejected') {
      userStatus = 'declined';
    }

    // Also update the associated user's status
    if (payment.userId) {
      console.log(`[STATUS] Updating user ${payment.userId} status to ${userStatus}`);
      await User.findByIdAndUpdate(
        payment.userId,
        { status: userStatus },
        { new: true }
      );
    }

    const userName = payment.userId ? `${payment.userId.firstName} ${payment.userId.lastName}` : 'unknown';
    logPaymentStatusChange(req, id, payment.status, status, userName);
    console.log(`[STATUS] Payment ${id} status changed to ${status}, user status updated to ${userStatus}`);
    res.json({ success: true, payment, userStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const removeUser = req.query.removeUser === 'true';

    console.log(`[DELETE] Attempting to delete payment ${id}, removeUser=${removeUser}`);

    // Find payment first
    const payment = await Payment.findById(id);
    if (!payment) {
      console.warn(`[DELETE] Payment ${id} not found`);
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log(`[DELETE] Found payment: ${payment._id}, userId: ${payment.userId}`);

    // Delete payment FIRST (this is critical)
    const deletedPayment = await Payment.deleteOne({ _id: id });
    
    if (deletedPayment.deletedCount === 0) {
      console.error(`[DELETE] Failed to delete payment ${id}`);
      return res.status(500).json({ error: 'Failed to delete payment from database' });
    }
    
    console.log(`[DELETE] Successfully deleted payment ${id}`);

    // Optionally delete associated user (non-critical, don't fail if this fails)
    let userDeleted = false;
    if (removeUser && payment.userId) {
      try {
        console.log(`[DELETE] Attempting to delete user ${payment.userId}`);
        const result = await User.deleteOne({ _id: payment.userId });
        userDeleted = result.deletedCount > 0;
        if (userDeleted) {
          console.log(`[DELETE] Successfully deleted user ${payment.userId}`);
        } else {
          console.warn(`[DELETE] User ${payment.userId} not found or already deleted`);
        }
      } catch (e) {
        console.error(`[DELETE] Error deleting user ${payment.userId}:`, e.message);
        // Don't fail the whole request if user deletion fails
        // (payment is already deleted successfully)
      }
    }

    console.log(`[DELETE] Delete complete: paymentDeleted=true, userDeleted=${userDeleted}`);
    logAdminAction(req, 'DELETE-PAYMENT', `PaymentID: ${id}, UserDeleted: ${userDeleted}`);
    return res.json({
      success: true,
      message: 'Payment deleted successfully',
      paymentDeleted: true,
      userDeleted
    });
  } catch (err) {
    console.error('[DELETE] Unexpected error:', err);
    res.status(500).json({ error: 'Failed to delete payment', details: err.message });
  }
});

export default router;
