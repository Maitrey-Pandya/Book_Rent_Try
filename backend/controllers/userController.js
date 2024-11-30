const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validateUserInput } = require('../utils/validators');
const AppError = require('../utils/AppError');

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