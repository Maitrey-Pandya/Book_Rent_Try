const User = require('../models/User');
const Publisher = require('../models/Publisher');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/jwt');
const { emailValidator } = require('../utils/validators');
const AppError = require('../utils/AppError');

exports.login = async (req, res, next) => {
    try {
        console.log('Login attempt - Request body:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        if (!emailValidator(email)) {
            throw new AppError('Invalid email format', 400);
        }

        //const user = await User.findOne({ email }) || await Publisher.findOne({ email });
        const user = await User.findOne({ email }).select('+password') || await Publisher.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = generateToken({
            userId: user._id,
            role: user instanceof Publisher ? 'publisher' : 'user'
        });

        // Set cookie
        setTokenCookie(res, token);

        // Remove password from output
        user.password = undefined;

        res.json({
            status: 'success',
            user: {
                id: user._id,
                email: user.email,
                role: user instanceof Publisher ? 'publisher' : 'user',
                name: user instanceof Publisher ? user.publisherName : user.name,
                token: token
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = (req, res) => {
    clearTokenCookie(res);
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
};

// Optional: Add refresh token functionality
exports.refreshToken = async (req, res, next) => {
    try {
        const currentUser = req.user; // This would come from your auth middleware

        if (!currentUser) {
            throw new AppError('Please log in to get a new token', 401);
        }

        const newToken = generateToken({
            userId: currentUser._id,
            role: currentUser instanceof Publisher ? 'publisher' : 'user'
        });

        res.cookie('auth_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });

        res.status(200).json({
            status: 'success',
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Optional: Add password reset functionality
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new AppError('Please provide your email address', 400);
        }

        const user = await User.findOne({ email }) || await Publisher.findOne({ email });

        if (!user) {
            throw new AppError('No account found with that email address', 404);
        }

        // Generate password reset token (you'll need to implement this in your User/Publisher model)
        const resetToken = await user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Here you would typically send an email with the reset token
        // For development, we'll just send it in the response
        res.status(200).json({
            status: 'success',
            message: 'Password reset token generated',
            resetToken // In production, remove this and send via email instead
        });
    } catch (error) {
        next(error);
    }
};