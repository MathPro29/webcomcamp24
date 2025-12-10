import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  isRegistrationOpen: {
    type: Boolean,
    default: true
  },
  maxCapacity: {
    type: Number,
    default: 100
  },
  certificateDownloadDate: {
    type: Date,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.getSettings();
  Object.assign(settings, updates);
  settings.lastUpdated = new Date();
  await settings.save();
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
