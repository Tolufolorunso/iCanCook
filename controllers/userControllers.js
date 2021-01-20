const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');

// @desc        Get all users.
// @route       GET /users
// @access      Private
exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();

	console.log(users);

	res.status(200).json({
		status: 'success',
		result: users.length,
		data: {
			users
		}
	});
});

// @desc        Get one user.
// @route       GET /users/:userId
// @access      Private
exports.getUser = (req, res, next) => {
	res.status(200).json({
		message: 'get one user'
	});
};

// @desc        create user.
// @route       POST /users
// @access      Private
exports.createUser = (req, res, next) => {
	console.log('what');
};

// @desc        Update users.
// @route       POST /users/:userId
// @access      Private
exports.updateUser = (req, res, next) => {
	console.log('user updated');
};

// @desc        Delete User by the Admin.
// @route       DELETE /users/:userId
// @access      Private
exports.deleteUser = catchAsync(async (req, res, next) => {
	console.log(req.params.userId);
	const user = await User.findOneAndDelete({
		_id: req.params.userId
	});
	console.log(user);
	res.status(204).json({
		status: 'success',
		message: 'Deleted successfully'
	});
});
