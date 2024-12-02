const Publisher = require('../models/Publisher');
const { generateToken } = require('../utils/jwt');
const { validatePublisherInput } = require('../utils/validators');
const AppError = require('../utils/AppError');

exports.signup = async (req, res, next) => {
    try {
        const validationResult = validatePublisherInput(req.body);
        if (!validationResult.isValid) {
            throw new AppError(validationResult.errors.join(', '), 400);
        }

        const { email, publisherName } = req.body;
        const existingPublisher = await Publisher.findOne({
            $or: [{ email }, { publisherName }]
        });

        if (existingPublisher) {
            throw new AppError(
                existingPublisher.email === email ?
                    'Email already registered' :
                    'Publisher name already exists',
                400
            );
        }

        const newPublisher = await Publisher.create(req.body);
        const token = generateToken({
            userId: newPublisher._id,
            role: 'publisher'
        });

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });

        res.status(201).json({
            status: 'success',
            publisher: {
                id: newPublisher._id,
                email: newPublisher.email,
                publisherName: newPublisher.publisherName
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const publisher = await Publisher.findById(req.user.id)
            .select('-password');

        if (!publisher) {
            throw new AppError('Publisher profile not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: {
                publisher: {
                    id: publisher._id,
                    email: publisher.email,
                    publisherName: publisher.publisherName,
                    companyName: publisher.companyName,
                    address: publisher.address,
                    phone: publisher.phone,
                    description: publisher.description,
                    website: publisher.website,
                    createdAt: publisher.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        // Fields that cannot be updated
        const restrictedFields = ['email', 'publisherName', 'password', 'role'];
        
        // Check for restricted fields in the update
        const requestedUpdates = Object.keys(req.body);
        const hasRestrictedFields = requestedUpdates.some(field => 
            restrictedFields.includes(field)
        );

        if (hasRestrictedFields) {
            throw new AppError('Cannot update restricted fields (email, publisherName, password, role)', 400);
        }

        // Allowed fields for update
        const allowedUpdates = {
            companyName: req.body.companyName,
            address: req.body.address,
            phone: req.body.phone,
            description: req.body.description,
            website: req.body.website
        };

        // Remove undefined fields
        Object.keys(allowedUpdates).forEach(key => 
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        const updatedPublisher = await Publisher.findByIdAndUpdate(
            req.user.id,
            allowedUpdates,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!updatedPublisher) {
            throw new AppError('Publisher not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: {
                publisher: {
                    id: updatedPublisher._id,
                    email: updatedPublisher.email,
                    publisherName: updatedPublisher.publisherName,
                    companyName: updatedPublisher.companyName,
                    address: updatedPublisher.address,
                    phone: updatedPublisher.phone,
                    description: updatedPublisher.description,
                    website: updatedPublisher.website,
                    updatedAt: updatedPublisher.updatedAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};