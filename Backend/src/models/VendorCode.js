const mongoose = require('mongoose');

const vendorCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    length: 6
  },
  vendorType: {
    type: String,
    required: true,
    enum: ['canteen-vendor', 'stationary-vendor']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - MongoDB will auto-delete expired documents
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
vendorCodeSchema.index({ code: 1, isActive: 1 });
vendorCodeSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('VendorCode', vendorCodeSchema);
