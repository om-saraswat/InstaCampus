const express = require('express');
const router = express.Router();
const VendorCode = require('../models/VendorCode');
const {adminAuth} = require('../middleware/auth');

// Generate a random 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST - Generate new vendor code (Admin only)
router.post('/generate', adminAuth, async (req, res) => {
  try {
    const { vendorType } = req.body;

    // Validate vendor type
    if (!vendorType || !['canteen-vendor', 'stationary-vendor'].includes(vendorType)) {
      return res.status(400).json({ error: 'Invalid vendor type' });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    
    while (!isUnique) {
      code = generateCode();
      const existingCode = await VendorCode.findOne({ code });
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Set expiry to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create new vendor code
    const vendorCode = new VendorCode({
      code,
      vendorType,
      createdBy: req.user._id,
      expiresAt
    });

    await vendorCode.save();

    res.status(201).json({
      success: true,
      message: 'Vendor code generated successfully',
      data: vendorCode
    });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// GET - Get all active vendor codes (Admin only)
router.get('/active', adminAuth, async (req, res) => {
  try {
    const codes = await VendorCode.find({
      isActive: true,
      used: false,
      expiresAt: { $gt: new Date() }
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: codes.length,
      data: codes
    });
  } catch (error) {
    console.error('Error fetching codes:', error);
    res.status(500).json({ error: 'Failed to fetch codes' });
  }
});

// GET - Get all vendor codes with filters (Admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const { used, vendorType, isActive } = req.query;
    
    const filter = {};
    if (used !== undefined) filter.used = used === 'true';
    if (vendorType) filter.vendorType = vendorType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const codes = await VendorCode.find(filter)
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: codes.length,
      data: codes
    });
  } catch (error) {
    console.error('Error fetching codes:', error);
    res.status(500).json({ error: 'Failed to fetch codes' });
  }
});

// POST - Verify vendor code (Public - for vendor registration)
router.post('/verify', async (req, res) => {
  try {
    const { code, vendorType } = req.body;

    if (!code || !vendorType) {
      return res.status(400).json({ 
        success: false,
        error: 'Code and vendor type are required' 
      });
    }

    // Find the code
    const vendorCode = await VendorCode.findOne({
      code,
      vendorType,
      isActive: true,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!vendorCode) {
      return res.status(404).json({ 
        success: false,
        error: 'Invalid, expired, or already used code' 
      });
    }

    res.json({
      success: true,
      message: 'Code is valid',
      data: {
        code: vendorCode.code,
        vendorType: vendorCode.vendorType,
        expiresAt: vendorCode.expiresAt
      }
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// POST - Mark code as used (Called during vendor registration)
router.post('/use', async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Code and userId are required' });
    }

    const vendorCode = await VendorCode.findOne({
      code,
      isActive: true,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!vendorCode) {
      return res.status(404).json({ error: 'Invalid or expired code' });
    }

    // Mark as used
    vendorCode.used = true;
    vendorCode.usedBy = userId;
    vendorCode.usedAt = new Date();
    await vendorCode.save();

    res.json({
      success: true,
      message: 'Code marked as used',
      data: vendorCode
    });
  } catch (error) {
    console.error('Error using code:', error);
    res.status(500).json({ error: 'Failed to use code' });
  }
});

// DELETE - Delete a vendor code (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const vendorCode = await VendorCode.findByIdAndDelete(id);

    if (!vendorCode) {
      return res.status(404).json({ error: 'Code not found' });
    }

    res.json({
      success: true,
      message: 'Code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting code:', error);
    res.status(500).json({ error: 'Failed to delete code' });
  }
});

// PATCH - Deactivate a vendor code (Admin only)
router.patch('/deactivate/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const vendorCode = await VendorCode.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!vendorCode) {
      return res.status(404).json({ error: 'Code not found' });
    }

    res.json({
      success: true,
      message: 'Code deactivated successfully',
      data: vendorCode
    });
  } catch (error) {
    console.error('Error deactivating code:', error);
    res.status(500).json({ error: 'Failed to deactivate code' });
  }
});

// GET - Get code statistics (Admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalCodes = await VendorCode.countDocuments();
    const activeCodes = await VendorCode.countDocuments({ 
      isActive: true, 
      used: false,
      expiresAt: { $gt: new Date() }
    });
    const usedCodes = await VendorCode.countDocuments({ used: true });
    const expiredCodes = await VendorCode.countDocuments({ 
      expiresAt: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        total: totalCodes,
        active: activeCodes,
        used: usedCodes,
        expired: expiredCodes
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
