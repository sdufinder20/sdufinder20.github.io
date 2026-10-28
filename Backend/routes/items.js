const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Item = require('../models/Item');
const upload = require('../middleware/upload');

// @route   GET /api/items
// @desc    Get all items with optional filtering and search
router.get('/', async (req, res) => {
  try {
    const { type, category, location, search, status, sort } = req.query;
    const query = {};

    // Filter by Lost / Found
    if (type && type !== 'all') {
      query.type = { $regex: new RegExp(`^${type}$`, 'i') };
    }

    // Filter by Category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by Location
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by Status (Active / Recovered)
    if (status && status !== 'all') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    // Keyword Search
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'title') sortOption = { title: 1 };

    const items = await Item.find(query).sort(sortOption);
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ success: false, message: 'Server error fetching items', error: err.message });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Item ID format' });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching single item:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   POST /api/items
// @desc    Create a new lost or found item report (multipart or JSON)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      location,
      date,
      description,
      contactName,
      contactEmail,
      contactPhone,
      imageUrl
    } = req.body;

    // Validate required fields
    if (!title || !type || !category || !location || !contactName || !contactEmail || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (title, type, category, location, contactName, contactEmail, contactPhone)'
      });
    }

    // Determine imageUrl: uploaded file takes precedence, then imageUrl string
    let finalImageUrl = '';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl && typeof imageUrl === 'string') {
      finalImageUrl = imageUrl.trim();
    }

    const newItem = new Item({
      title: title.trim(),
      type,
      category,
      location: location.trim(),
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : '',
      imageUrl: finalImageUrl,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone.trim(),
      status: 'Active'
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      success: true,
      message: 'Item reported successfully!',
      data: savedItem
    });
  } catch (err) {
    console.error('Error creating item report:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error creating report', error: err.message });
  }
});

// @route   PUT /api/items/:id/status
// @desc    Update status of an item report (e.g. "Recovered" or "Active")
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Item ID format' });
    }

    if (!status || !['Active', 'Recovered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be either "Active" or "Recovered"'
      });
    }

    const item = await Item.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({
      success: true,
      message: `Item status updated to ${status}`,
      data: item
    });
  } catch (err) {
    console.error('Error updating item status:', err);
    res.status(500).json({ success: false, message: 'Server error updating status', error: err.message });
  }
});

// @route   PUT /api/items/:id
// @desc    Update full item details
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Item ID format' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    const item = await Item.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item updated successfully', data: item });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item report
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Item ID format' });
    }

    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Attempt to delete local uploaded file if exists
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      const filename = path.basename(item.imageUrl);
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn('Could not remove file on delete:', unlinkErr.message);
        }
      }
    }

    res.json({ success: true, message: 'Item report deleted successfully', data: item });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ success: false, message: 'Server error deleting report', error: err.message });
  }
});

module.exports = router;
