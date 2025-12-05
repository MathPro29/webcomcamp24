import express from 'express';
import Settings from '../models/settings.js';
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

// Update settings (admin only)
router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { isRegistrationOpen, maxCapacity } = req.body;
    
    const updates = {};
    if (typeof isRegistrationOpen !== 'undefined') {
      updates.isRegistrationOpen = isRegistrationOpen;
    }
    if (typeof maxCapacity !== 'undefined') {
      updates.maxCapacity = maxCapacity;
    }
    
    const settings = await Settings.updateSettings(updates);
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
