const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadTime: {
    type: Date,
    default: Date.now
  },
  expiryTime: {
    type: Date,
    required: true,
    index: true
  },
  senderEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  receiverEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for cleanup queries
fileSchema.index({ expiryTime: 1, isActive: 1 });

// Virtual for checking if file is expired
fileSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryTime;
});

// Method to increment download count
fileSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

module.exports = mongoose.model('File', fileSchema);