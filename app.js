const path = require('path');
// const EventEmitter = require('events');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');
// const schedule = require('node-schedule');

const { CronJob } = require('cron');
const userRoutes = require('./routes/userRoutes');
const jenisKendaraanRoutes = require('./routes/jenisKendaraanRoutes');
const kendaraanRoutes = require('./routes/kendaraanRoutes');
const tpsRoutes = require('./routes/tpsRoutes');
const tpaRoutes = require('./routes/tpaRoutes');
const bakRoutes = require('./routes/bakRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const tagihanRoutes = require('./routes/tagihanRoutes');
const bankRoutes = require('./routes/bankRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const { getFileStream } = require('./utils/s3UploadClient');
const tagihanController = require('./controllers/tagihanController');
const globalErrHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// eslint-disable-next-line no-new
new CronJob(
  '*/10 1-5 1 1 * *',
  tagihanController.createTagihanMonthly,
  null,
  true,
  'Asia/Jakarta'
);
// eslint-disable-next-line no-new
new CronJob(
  '1 12 23 17 * *',
  tagihanController.createTagihanMonthly,
  null,
  true,
  'Asia/Jakarta'
);

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

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp({ whitelist: ['pickup_time, arrival_time', 'status', 'time'] }));

app.use(compression());

app.post('/handling-midtrans', tagihanController.notificationCheckout);

app.get('/img/:key([^/]+/[^/]+)', (req, res, next) => {
  const readStream = getFileStream(req.params.key);

  readStream.on('error', (err) => next(err)).pipe(res);
});

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/jenis-kendaraan', jenisKendaraanRoutes);
app.use('/api/v1/kendaraan', kendaraanRoutes);
app.use('/api/v1/tps', tpsRoutes);
app.use('/api/v1/tpa', tpaRoutes);
app.use('/api/v1/bak', bakRoutes);
app.use('/api/v1/pickup', pickupRoutes);
app.use('/api/v1/tagihan', tagihanRoutes);
app.use('/api/v1/bank', bankRoutes);
app.use('/api/v1/complaint', complaintRoutes);

// handling unhandled routes
app.all('*', (req, res, next) => {
  // if the next(args) recieve arguments, express assume that is an error,
  // and will be pass all middleware stack and go straight to middleware error in below
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrHandler);

module.exports = app;
