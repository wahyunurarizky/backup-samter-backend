const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');

const userRoutes = require('./routes/userRoutes');
const jenisKendaraanRoutes = require('./routes/jenisKendaraanRoutes');
const kendaraanRoutes = require('./routes/kendaraanRoutes');
const tpsRoutes = require('./routes/tpsRoutes');
const tpaRoutes = require('./routes/tpaRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const bakRoutes = require('./routes/bakRoutes');
const globalErrHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// Allow Cross-Origin requests
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API
const limiter = rateLimit({
  max: 150,
  windowMs: 60 * 60 * 1000,
  message: 'Too Many Request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '15kb',
  })
);

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// cookie parser
app.use(cookieParser());

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use(compression());

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/jenis-kendaraan', jenisKendaraanRoutes);
app.use('/api/v1/kendaraan', kendaraanRoutes);
app.use('/api/v1/tps', tpsRoutes);
app.use('/api/v1/tpa', tpaRoutes);
app.use('/api/v1/pickup', pickupRoutes);
app.use('/api/v1/bak', bakRoutes);

// handling unhandled routes
app.all('*', (req, res, next) => {
  // if the next(args) recieve arguments, express assume that is an error,
  // and will be pass all middleware stack and go straight to middleware error in below
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrHandler);

module.exports = app;
