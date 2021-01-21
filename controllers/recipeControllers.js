const { query } = require('express');
const Recipe = require('../models/recipeModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

const sendRes = (statusCode, status, data, res, len) => {
	if (len) {
		res.status(statusCode).json({
			status: status,
			result: len,
			data
		});
	} else {
		res.status(statusCode).json({
			status: status,
			data
		});
	}
};

// @desc        create recipe.
// @route       POST /auth
// @access      Private
exports.createRecipe = catchAsync(async (req, res, next) => {
	req.body.publisher = req.user._id;
	const recipe = await Recipe.create(req.body);

	sendRes(201, 'success', recipe, res);
});

// @desc        Get All recipes.
// @route       GET /auth
// @access      Public
exports.getAllRecipe = catchAsync(async (req, res, next) => {
	// BUILD QUERY
	// 1) Filtering
	const queryObj = { ...req.query };
	const excludedFields = ['page', 'sort', 'limit', 'fields'];
	excludedFields.forEach(el => delete queryObj[el]);

	// 2) Advance filtering
	let queryStr = JSON.stringify(queryObj);
	queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
	// console.log(JSON.parse(queryStr));
	// console.log(queryStr);

	let query = Recipe.find(JSON.parse(queryStr));

	// 3) Sorting
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		console.log(sortBy);
		query = query.sort(sortBy);
	} else {
		query = query.sort('createdAt');
	}
	// console.log(req.query);

	// EXECUTE QUERY
	const recipes = await query;
	sendRes(200, 'success', recipes, res, recipes.length);
});

// @desc        Get recipe.
// @route       GET /recipes/:recipeId
// @access      Public
exports.getRecipe = catchAsync(async (req, res, next) => {
	const recipe = await Recipe.findById(req.params.recipeId);
	if (!recipe) {
		return next(new AppError('No Recipe found with the ID', 404));
	}

	sendRes(200, 'success', recipe, res);
});

// @desc        Update recipe.
// @route       PATCH /recipes/:recipeId
// @access      Private
exports.updateRecipe = catchAsync(async (req, res, next) => {
	const recipe = await Recipe.findByIdAndUpdate(req.params.recipeId, req.body, {
		new: true,
		runValidators: true
	});

	sendRes(200, 'success', recipe, res);
});

// @desc        Delete Recipe.
// @route       DELETE /recipes/:recipeId
// @access      Private
exports.deleteRecipe = catchAsync(async (req, res, next) => {
	await Recipe.findByIdAndDelete(req.params.recipeId);

	sendRes(204, 'success', 'Recipe deleted successfully', res);
});

// // @desc        Get Logged in user.
// // @route       GET /auth
// // @access      Private
// exports.getLoggedInUser = catchAsync(async (req, res, next) => {
// 	console.log('tolu');
// 	const user = await User.findById(req.user.id).select('-password');
// 	res.json(user);
// });
