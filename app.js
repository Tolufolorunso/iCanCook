const express = require('express');
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController.js');

const AppError = require('./utils/appError');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV === 'developmente') {
	app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV);
app.use(express.json());

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
app.use('/users/auth', authRouter);
app.use('/users', userRouter);
app.use('/recipes', recipeRouter);

app.all('*', (req, res, next) => {
	// res.status(404).json({
	// 	status: 'fail',
	// 	message: `Can't find ${req.originalUrl} on this server!`
	// });
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 400));
});

app.use(globalErrorHandler);

module.exports = app;
