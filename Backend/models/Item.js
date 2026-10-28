const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an item title'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify whether the item is Lost or Found'],
    enum: ['Lost', 'Found']
  },
  category: {
    type: String,
    required: [true, 'Please select an item category'],
    enum: ['Electronics', 'ID Cards', 'Keys', 'Books', 'Clothing', 'Wallets', 'Other']
  },
  location: {
    type: String,
    required: [true, 'Please specify the campus location'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  contactName: {
    type: String,
    required: [true, 'Please provide a contact name'],
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Please provide a contact email'],
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Please provide a contact phone number'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Recovered'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search queries on title, description, and location
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);
