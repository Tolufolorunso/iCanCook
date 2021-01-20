const AppError = require('../utils/appError');

const handleCastErrorDB = err =>  new AppError(`Invalid ${err.path}: ${err.value}`, 404);

const handleDuplicateFieldsDB = err => {
	// const value = err.errmsg.match(//)
	// const message = `Duplicate fields value:`;
};

const handleJWTError = _ => new AppError('Invalid token, please login again', 401);
const handleJWTExpiredError = _ => new AppError('Your token has expired, please login again', 401);


const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack
	});
};

const sendErrorProd = (err, res) => {
	// Operational, trusted error: send message to client
	// console.log(err);
	// console.log('24', err.status);
	// console.log('24', err.isOperational);
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		});

		// Programming or other unknown error: don't leak error details'
	} else {
		// 1) Log error
		console.error(`ERROR 💥`, err);

		// 2) Send generic message
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong!'
		});
	}
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 1100) error = handleDuplicateFieldsDB(error);
		if(error.name === 'JsonWebTokenError') error = handleJWTError(error)
		if(error.name === 'TokenExpiredError') error = handleJWTExpiredError(error)
		sendErrorProd(error, res);
	}
};
