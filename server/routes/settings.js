import express from 'express';
import Settings from '../models/settings.js';
import User from '../models/users.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get current settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get registration status (public endpoint - no auth required)
router.get('/registration-status', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    const currentCount = await User.countDocuments({ status: { $ne: 'declined' } });
    
    res.json({
      isOpen: settings.isRegistrationOpen,
      currentCount: currentCount,
      maxCapacity: settings.maxCapacity
    });
  } catch (error) {
    console.error('Error fetching registration status:', error);
    res.status(500).json({ error: 'Failed to fetch registration status' });
  }
});

// Update settings (admin only)
router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { isRegistrationOpen, maxCapacity, certificateDownloadDate } = req.body;
    
    const updates = {};
    if (typeof isRegistrationOpen !== 'undefined') {
      updates.isRegistrationOpen = isRegistrationOpen;
    }
    if (typeof maxCapacity !== 'undefined') {
      updates.maxCapacity = maxCapacity;
    }
    if (typeof certificateDownloadDate !== 'undefined') {
      updates.certificateDownloadDate = certificateDownloadDate;
    }
    
    const settings = await Settings.updateSettings(updates);
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
