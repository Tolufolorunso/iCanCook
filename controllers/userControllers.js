const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const sendRes = (statusCode, status, data, res) => {
	res.status(statusCode).json({
		status: status,
		data: {
			user: data
		}
	});
};

// ADMIN AREA

// @desc        Get all users.
// @route       GET /users
// @access      Private
exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();

	sendRes(200, 'success', users, res);
});

// @desc        Get one user.
// @route       GET /users/:userId
// @access      Private
exports.getUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.userId);

	if (!user) {
		return next(new AppError('User not found', 400));
	}

	sendRes(200, 'success', user, res);
});

// @desc        create user.
// @route       POST /users
// @access      Private
exports.createUser = catchAsync(async (req, res, next) => {
	console.log('create user');
});

// @desc        Update users.
// @route       POST /users/:userId
// @access      Private
exports.updateUser = catchAsync(async (req, res, next) => {
	console.log('user updated');
});

// @desc        Delete User by the Admin.
// @route       DELETE /users/:userId
// @access      Private
exports.deleteUser = catchAsync(async (req, res, next) => {
	const user = await User.findOneAndDelete({
		_id: req.params.userId
	});

	sendRes(204, 'success', 'User deleted successfully', res);
});

// User area
const filteredObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes[el]) newObj[el] = obj[el];
	});

	return newObj;
};

// @desc        Update users.
// @route       POST /users/updateme
// @access      Private
exports.updateMe = catchAsync(async (req, res, next) => {
	// 1) create error if user posts password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password updates. Please use /updatepassword',
				400
			)
		);
	}

	// 2) update user data
	const filteredBody = filteredObj(req.body, 'name', 'email');
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true
	});

	sendRes(200, 'success', updatedUser, res);
});

// @desc        delete users.
// @route       DELETE /users/deleteme
// @access      Private
exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user._id, { active: false });
	sendRes(204, 'success', null, res);
});
