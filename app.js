const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const globalErrorHandler = require('./controllers/errorController.js');

const AppError = require('./utils/appError');

const app = express();

// 1) GLOBAL MIDDLEWARE
app.use(helmet());

if (process.env.NODE_ENV === 'developmente') {
	app.use(morgan('dev'));
}

const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/', limiter);

app.use(express.json({ limit: '50kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
	hpp({
		whitelist: ['rating']
	})
);

app.use((req, res, next) => {
	const date = new Date().getFullYear();
	req.date = date;
	next();
});

app.get('/', (req, res) => {
	res
		.status(200)
		.json({ message: 'hello from the server side', app: 'iCanCook' });
});

const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const recipeRouter = require('./routes/recipeRoutes');
const commentRouter = require('./routes/commentRoutes');
app.use('/users/auth', authRouter);
app.use('/users', userRouter);
app.use('/recipes', recipeRouter);
app.use('/recipes', commentRouter);

app.all('*', (req, res, next) => {
	// res.status(404).json({
	// 	status: 'fail',
	// 	message: `Can't find ${req.originalUrl} on this server!`
	// });
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 400));
});

app.use(globalErrorHandler);

module.exports = app;
