// src/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
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

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update total amount when items are modified
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    if (item.type === 'rent') {
      const days = Math.ceil((item.rentalDuration.endDate - item.rentalDuration.startDate) / (1000 * 60 * 60 * 24));
      return total + (item.price * days * item.quantity);
    }
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;