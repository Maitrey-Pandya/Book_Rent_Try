// src/controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createOrder = catchAsync(async (req, res, next) => {
  console.log('Create Order Request:', {
    body: req.body,
    user: req.user?.id
  });

  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart || cart.items.length === 0) {
    return next(new AppError('No items in cart', 400));
  }

  // Verify each book and get uploader (seller) information
  const verifiedItems = await Promise.all(cart.items.map(async (item) => {
    const book = await Book.findById(item.book)
      .populate({
        path: 'uploader',
        select: '_id name email'
      });
    
    console.log('Book Details:', {
      bookId: book._id,
      title: book.title,
      uploaderInfo: book.uploader,
      uploaderType: book.uploaderType,
      type: item.type,
      rentalDuration: item.rentalDuration
    });

    if (!book) {
      throw new AppError(`Book not found: ${item.book}`, 404);
    }

    if (!book.uploader) {
      throw new AppError(`No uploader found for book: ${book.title}`, 400);
    }

    // Create order item with rental information if type is 'rent'
    const orderItem = {
      book: book._id,
      uploader: book.uploader._id,
      quantity: item.quantity,
      price: item.price,
      type: item.type
    };

    // Add rental duration for rented items
    if (item.type === 'rent') {
      if (!item.rentalDuration) {
        throw new AppError(`Rental duration is required for book: ${book.title}`, 400);
      }
      
      orderItem.rentalDuration = {
        startDate: item.rentalDuration.startDate || new Date(),
        endDate: item.rentalDuration.endDate
      };
    }

    return orderItem;
  }));

  const order = await Order.create({
    user: req.user.id,
    items: verifiedItems,
    totalAmount: cart.totalAmount,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod
  });

  // Populate the order response with uploader information
  const populatedOrder = await Order.findById(order._id)
    .populate({
      path: 'items.book',
      select: 'title author price uploader uploaderType',
      populate: {
        path: 'uploader',
        select: '_id name email'
      }
    });

  // Add after order creation
  const updateBookStatus = async (orderItem) => {
    const book = await Book.findById(orderItem.book);
    book.status = orderItem.type === 'rent' ? 'rented' : 'sold';
    book.currentTransaction = order._id;
    if (orderItem.type === 'rent') {
      book.rentalInfo = {
        rentedTo: req.user.id,
        startDate: orderItem.rentalDuration.startDate,
        endDate: orderItem.rentalDuration.endDate
      };
    }
    await book.save();
  };

  // Update books after order creation
  await Promise.all(order.items.map(updateBookStatus));

  await Cart.findByIdAndDelete(cart._id);

  res.status(201).json({
    status: 'success',
    data: {
      order: populatedOrder
    }
  });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
  console.log('Fetching orders for user:', req.user._id);

  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items.book',
        select: 'title author price uploader uploaderType',
        populate: {
          path: 'uploader',
          select: '_id name email'
        }
      })
      .sort({ createdAt: -1 });

    // Add debug logging
    orders.forEach(order => {
      console.log('Order:', {
        orderId: order._id,
        items: order.items.map(item => ({
          bookId: item.book?._id,
          bookTitle: item.book?.title,
          uploaderId: item.book?.uploader?._id
        }))
      });
    });

    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    console.error('Population error:', error);
    throw error;
  }
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('items.book');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  // Validate status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.status = status;
  await order.save();

  // Optionally notify the user about status change
  // ... notification logic ...

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

exports.completeRental = catchAsync(async (req, res, next) => {
  const { orderId, bookId } = req.body;
  
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const orderItem = order.items.find(item => 
    item.book.toString() === bookId && item.type === 'rent'
  );
  
  if (!orderItem) {
    return next(new AppError('Rental item not found', 404));
  }

  // Update book status
  await Book.findByIdAndUpdate(bookId, {
    status: 'available',
    currentTransaction: null,
    rentalInfo: null
  });

  // Update order item status
  orderItem.status = 'completed';
  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Rental completed successfully'
  });
});