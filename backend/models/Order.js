// src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['purchase', 'rent'],
    required: true
  },
  rentalDuration: {
    startDate: {
      type: Date,
      required: function() {
        return this.type === 'rent';
      }
    },
    endDate: {
      type: Date,
      required: function() {
        return this.type === 'rent';
      }
    }
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  hasRated: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 100
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
