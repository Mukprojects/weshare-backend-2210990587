const mongoose = require('mongoose');

const downloadLogSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true,
    index: true
  },
  fileUuid: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
downloadLogSchema.index({ fileId: 1, timestamp: -1 });
downloadLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('DownloadLog', downloadLogSchema);