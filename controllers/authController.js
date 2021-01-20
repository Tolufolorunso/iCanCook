const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const sendEmail = require('../utils/email');

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});
};

const createAndSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user
		}
	});
};

// @desc        SignUp user.
// @route       POST users/auth/signup
// @access      Public
exports.signup = catchAsync(async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({
			errorMessage: errors.array()
		});
	}

	const userExists = await User.findOne({
		email: req.body.email
	});

	if (userExists) {
		return next(new AppError('User with that email is already exists', 400));
	}

	const newUser = await User.create(req.body);

	createAndSendToken(newUser, 201, res);
});

// @desc        Login user.
// @route       users/auth/login
// @access      Public
exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return next(new AppError('Please provide email and password!', 400));
	}

	// check if user exists
	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password'));
	}

	// if everything is right
	createAndSendToken(user, 200, res);
});

// @desc        Authorize user.
// @route
// @access      Private
exports.authorize = catchAsync(async (req, res, next) => {
	// 1) Getting token and check of its there
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(new AppError('You are not logged in, please log in', 401));
	}

	// 2) Verify token gotten from the client
	const decodedToken = await promisify(jwt.verify)(
		token,
		process.env.JWT_SECRET
	);

	// 3) Check if the user still exist
	const currentUser = await User.findById(decodedToken.id);
	if (!currentUser) {
		return next(new AppError('The user doesnt exists', 401));
	}

	// 4) Check if user changed password after the token
	if (currentUser.changedPasswordAfter(decodedToken.iat)) {
		return next(
			new AppError('User recently changed password! please log in again', 401)
		);
	}
	// Grant access to protected route
	req.user = currentUser; // Add user to req Obj
	next();
});

// @desc        Give permission to user.
// @route
// @access      Private
exports.authorizeFor = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError('You do not have permission to perform this action', 403)
			);
		}
		next();
	};
};

// @desc        Forgot password.
// @route       POST users/auth/forgotpassword
// @access      Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on Posted email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError('There is no user with email adress.', 404));
	}

	// 2) Generate the random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	// 3) Send it to user's email
	// Create reset url
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/users/auth/resetpassword/${resetToken}`;

	const message = `Reset your password, it will expire in 10 minutes: \n\n ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password reset token',
			message
		});
		res
			.status(200)
			.json({ status: 'success', data: 'Email sent, check your mailbox' });
	} catch (error) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new AppError('Email could not be sent. Try again later', 500));
	}
});

// @desc        Reset password.
// @route       POST users/auth/resetpassword/:token
// @access      Public
exports.resetPassword = catchAsync(async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({
			errorMessage: errors.array()
		});
	}
	// 1) Get user based on the token
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() }
	});

	// 2) if token has not expired, and there is user, set the new password
	if (!user) {
		return next(new AppError('Invalid token or token expires', 400));
	}
	// Set new password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;

	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;

	// 3) update changedPasswordAt property for the user
	await user.save({
		validateBeforeSave: false
	});

	res.status(200).json({
		status: 'success',
		data: 'Login with the new password'
	});
});

// @desc        Update password.
// @route       PATCH users/auth/update
// @access      Private
exports.updatePassword = catchAsync(async (req, res, next) => {
	// 1) Get user from collection
	const user = await User.findById(req.user._id).select('+password');

	// 2) check if Posted password is correct
	if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
		return next(new AppError('Incorrect password', 401));
	}

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({
			errorMessage: errors.array()
		});
	}

	// 3) if the password is correct, update password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;

	await user.save();

	// 4) Log user in, send jwt
	// if everything is right
	createAndSendToken(user, 200, res);
});
