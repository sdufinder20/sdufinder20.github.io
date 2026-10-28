const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// @route   GET /api/stats
// @desc    Get summary statistics for dashboard and admin metrics
router.get('/', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const activeLost = await Item.countDocuments({ type: 'Lost', status: 'Active' });
    const activeFound = await Item.countDocuments({ type: 'Found', status: 'Active' });
    const totalRecovered = await Item.countDocuments({ status: 'Recovered' });

    // Category breakdown
    const categoryStats = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly or recent activity
    const recentItems = await Item.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type category location status createdAt');

    res.json({
      success: true,
      data: {
        totalItems,
        activeLost,
        activeFound,
        totalRecovered,
        recoveryRate: totalItems > 0 ? Math.round((totalRecovered / totalItems) * 100) : 0,
        categoryStats,
        recentItems
      }
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ success: false, message: 'Server error fetching stats', error: err.message });
  }
});

module.exports = router;
