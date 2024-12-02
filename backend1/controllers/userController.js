const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validateUserInput } = require('../utils/validators');
const AppError = require('../utils/AppError');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');

exports.signup = async (req, res, next) => {
    try {
        console.log(req.body)
        const validationResult = validateUserInput(req.body);
        if (!validationResult.isValid) {
            throw new AppError(validationResult.errors.join(', '), 400);
        }

        const { email, phone } = req.body;
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            throw new AppError(
                existingUser.email === email ?
                    'Email already registered' :
                    'Phone number already registered',
                400
            );
        }

        const newUser = await User.create(req.body);
        const token = generateToken({
            userId: newUser._id,
            role: 'user'
        });

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });

        res.status(201).json({
            status: 'success',
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name
            }
        });
    } catch (error) {
        next(error);
    }
};

// Add the missing getProfile method
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// Add the missing updateProfile method
exports.updateProfile = async (req, res, next) => {
    try {
        // Fields that are not allowed to be updated
        const restrictedFields = ['password', 'role', 'email'];
        
        // Check if any restricted field is being updated
        const updates = Object.keys(req.body);
        const isRestrictedUpdate = updates.some(update => restrictedFields.includes(update));
        
        if (isRestrictedUpdate) {
            throw new AppError('Cannot update restricted fields', 400);
        }

        // Find and update the user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.rateUser = catchAsync(async (req, res, next) => {
  console.log('Rate user request:', {
    body: req.body,
    params: req.params,
    userId: req.params.userId
  });

  const { rating, orderId } = req.body;
  const sellerId = req.params.userId;

  if (!rating || !orderId) {
    return next(new AppError('Rating and orderId are required', 400));
  }

  // Find the order and verify uploader
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    status: 'delivered',
    hasRated: false
  }).populate('items.book items.book.uploader');

  console.log('Found order:', {
    orderId,
    userId: req.user._id,
    order,
    itemUploaders: order?.items?.map(item => ({
      bookId: item.book?._id,
      uploaderId: item.book?.uploader?._id
    }))
  });

  if (!order) {
    return next(new AppError('Invalid order or already rated', 400));
  }

  // Verify the uploader is part of this order
  const orderItem = order.items.find(item => 
    item.book?.uploader?._id?.toString() === sellerId
  );

  if (!orderItem) {
    return next(new AppError('Uploader not found in this order', 400));
  }

  // Update the seller's rating
  const seller = await User.findById(sellerId);
  console.log('Found seller:', {
    sellerId,
    sellerFound: !!seller,
    currentScore: seller?.readersScore,
    totalRatings: seller?.totalRatings
  });

  if (!seller) {
    return next(new AppError('Seller not found', 404));
  }

  const currentScore = seller.readersScore || 0;
  const totalRatings = seller.totalRatings || 0;
  const newScore = Math.round(((currentScore * totalRatings) + rating) / (totalRatings + 1));

  try {
    await Promise.all([
      User.findByIdAndUpdate(sellerId, {
        readersScore: newScore,
        totalRatings: totalRatings + 1
      }),
      Order.findByIdAndUpdate(orderId, {
        hasRated: true,
        rating: rating
      })
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    return next(new AppError('Failed to update rating', 500));
  }
});
