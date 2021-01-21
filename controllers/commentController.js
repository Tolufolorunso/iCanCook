const catchAsync = require('../utils/catchAsync');
const Recipe = require('../models/recipeModel');

const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const sendRes = (statusCode, status, data, res) => {
	res.status(statusCode).json({
		status: status,
		data
	});
};

// @desc        Create a comment.
// @route       POST /recipes/comments/:recipeID
// @access      Private
exports.postComment = catchAsync(async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// return res.status(422).json({
		// 	errorMessage: errors.array()
		// });
		return sendRes(422, 'error', errors.array(), res);
	}

	// const user = await User.findById(req.user.id);
	const recipe = await Recipe.findById(req.params.recipeID);
	if (!recipe) {
		return next(
			new AppError('Recipe not found, please check and try again', 404)
		);
	}

	const { comment, avatar } = req.body;
	const commentObj = {
		comment,
		avatar,
		name: req.user.name,
		user: req.user._id
	};
	recipe.comments.unshift(commentObj);
	await recipe.save();
	console.log('43', recipe.comment);

	sendRes(201, 'success', recipe.comments, res);
});

// @desc        Delete a comment.
// @route       Delete /recipe/comments/:recipeID/:commentID
// @access      Private
exports.deleteComment = catchAsync(async (req, res, next) => {
	const recipe = await Recipe.findById(req.params.recipeID);
	// Get comment out
	const comment = recipe.comments.find(
		comment => comment.id === req.params.commentID
	);

	// check if comment exist
	if (!comment) {
		return next(new AppError('Comment does not exist anymore', 400));
	}

	// check if user permission to delete comment
	if (comment.user.toString() !== req.user._id.toString()) {
		return next(new AppError('User not authorized', 400));
	}

	const removeIndex = recipe.comments
		.map(comment => comment.user.toString())
		.indexOf(req.user._id);

	recipe.comments.splice(removeIndex, 1);
	await recipe.save();

	sendRes(204, 'success', 'Comment deleted', res);
});
