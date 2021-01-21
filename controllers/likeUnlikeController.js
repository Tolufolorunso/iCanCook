const catchAsync = require('../utils/catchAsync');
const Recipe = require('../models/recipeModel');

const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// @desc        Like a post.
// @route       PUT /recipes/like/:recipeID
// @access      Private
exports.likeRecipe = catchAsync(async (req, res, next) => {
	const recipe = await Recipe.findById(req.params.recipeID);

	if (!recipe) {
		return next(new AppError('Recipe not found', 404));
	}
	// Check if post has already been liked by current user
	if (
		recipe.likes.filter(
			like => like.user.toString() === req.user._id.toString()
		).length > 0
	) {
		// return next(new AppError('Post already liked', 400));
		const removeIndex = recipe.likes
			.map(like => like.user.toString())
			.indexOf(req.user._id);

		recipe.likes.splice(removeIndex, 1);
		await recipe.save();
		return res.status(200).json({
			status: 'success',
			message: recipe.likes
		});
	}

	// Check if post has already been unliked by current user
	if (
		recipe.unlikes.filter(
			like => like.user.toString() === req.user._id.toString()
		).length > 0
	) {
		const removeIndex = recipe.unlikes
			.map(unlike => unlike.user.toString())
			.indexOf(req.user._id);
		recipe.unlikes.splice(removeIndex, 1);
	}

	recipe.likes.unshift({ user: req.user._id });

	await recipe.save();

	res.status(200).json({
		status: 'success',
		message: recipe.likes
	});
});

// @desc        unlike a post.
// @route       PUT /posts/unlike/:recipeID
// @access      Private
exports.unLikeRecipe = catchAsync(async (req, res, next) => {
	const recipe = await Recipe.findById(req.params.recipeID);

	if (!recipe) {
		return next(new AppError('Recipe not found', 404));
	}

	// Check if post has already been unliked by current user
	if (
		recipe.unlikes.filter(
			unlike => unlike.user.toString() === req.user._id.toString()
		).length > 0
	) {
		const removeIndex = recipe.unlikes
			.map(unlike => unlike.user.toString())
			.indexOf(req.user._id);

		recipe.unlikes.splice(removeIndex, 1);
		await recipe.save();

		return res.status(200).json({
			status: 'success',
			message: recipe.unlikes
		});
		// return next(new AppError('recipe already unliked', 400));
	}

	// Check if recipe has already been liked by current user
	if (
		recipe.likes.filter(like => like.user.toString() === req.user.id.toString())
			.length > 0
	) {
		const removeIndex = recipe.likes
			.map(like => like.user.toString())
			.indexOf(req.user.id);
		recipe.likes.splice(removeIndex, 1);
	}

	recipe.unlikes.unshift({ user: req.user.id });

	await recipe.save();

	res.status(200).json({
		status: 'success',
		message: recipe.unlikes
	});
});
