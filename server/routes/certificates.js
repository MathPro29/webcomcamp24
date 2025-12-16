import express from 'express';
import Settings from '../models/certificate.js';

const settingsRouter = express.Router();

// Get settings
settingsRouter.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // สร้าง settings ถ้ายังไม่มี
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
settingsRouter.put('/', async (req, res) => {
  try {
    const updates = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(updates);
    } else {
      Object.assign(settings, updates);
    }
    
    await settings.save();
    
    console.log('✅ Settings updated:', updates);
    res.json({ success: true, settings });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Update certificate release date
settingsRouter.put('/certificate-release', async (req, res) => {
  try {
    const { releaseDate } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }
    
    // Parse the datetime string as Thailand local time (UTC+7)
    // Append timezone offset to ensure correct interpretation
    const dateTimeWithTZ = releaseDate && (releaseDate.includes('+') || releaseDate.includes('Z'))
      ? releaseDate 
      : releaseDate + '+07:00';
    settings.certificateReleaseDate = releaseDate ? new Date(dateTimeWithTZ) : null;
    await settings.save();
    
    console.log('✅ Certificate release date updated:', releaseDate);
    res.json({ success: true, settings });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Failed to update certificate release date' });
  }
});


export default settingsRouter;