require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');
const publisherRoutes = require('./routes/publisherRoutes');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const path = require('path');

const app = express();

// Security middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(cors({
    origin: ['https://book-rent-try-backend.onrender.com', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Make sure this comes BEFORE your routes
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Connect to MongoDB with updated options
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Book Swap App!',
        version: '1.0.0',
        routes: {
            userRoutes: '/api/user',
            publisherRoutes: '/api/publisher',
            authRoutes: '/api/auth',
            bookRoutes: '/api/v1/books',
            cartRoutes: '/api/v1/cart',
            orderRoutes: '/api/v1/orders',
            reviewRoutes: '/api/v1/reviews',
        },
        documentation: 'https://your-api-documentation-link.com' // Add a link to your API documentation if available
    });
});
// Routes
app.use('/api/user', userRoutes);
app.use('/api/publisher', publisherRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
// Error handling middleware
app.use(errorHandler);

// Add this before your routes
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message
  });
});

// Define port
const PORT = process.env.PORT || 3000;

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;