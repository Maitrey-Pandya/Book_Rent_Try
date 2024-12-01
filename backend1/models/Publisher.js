// src/models/Publisher.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const publisherSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  publisherName: {
    type: String,
    required: [true, 'Publisher name is required'],
    unique: true,
    trim: true,
    minlength: 2
  },
  publicationAddress: {
    type: String,
    required: [true, 'Publication address is required'],
    trim: true
  },
  officeContact: {
    type: String,
    required: [true, 'Office contact is required'],
    trim: true
  },
  zipcode: {
    type: String,
    required: [true, 'Zipcode is required'],
    trim: true,
    match: [/^\d{5,6}$/, 'Please enter a valid zipcode']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

publisherSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

publisherSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Publisher', publisherSchema);