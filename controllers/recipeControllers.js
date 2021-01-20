const { query } = require('express');
const Recipe = require('../models/recipeModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

// @desc        create recipe.
// @route       POST /auth
// @access      Private
exports.createRecipe = catchAsync(async (req, res, next) => {
	const recipe = await Recipe.create(req.body);
	res.status(201).json({
		status: 'success',
		message: recipe
	});
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
	// console.log(recipes);

	res.status(200).json({
		status: 'success',
		result: recipes.lenght,
		message: recipes
	});
});

// @desc        Get recipe.
// @route       GET /auth
// @access      Public
exports.getRecipe = catchAsync(async (req, res, next) => {
	const recipe = await Recipe.findById(req.params.recipeId);
	if (!recipe) {
		console.log(!recipe);
		return next(new AppError('No Recipe found with the ID', 404));
	}
	res.status(200).json({
		status: 'success',
		message: recipe
	});
});

// @desc        Update recipe.
// @route       PATCH /auth
// @access      Private
exports.updateRecipe = catchAsync(async (req, res, next) => {
	const recipe = await Recipe.findByIdAndUpdate(req.params.recipeId, req.body, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		status: 'success',
		message: recipe
	});
});

// @desc        Delete Recipe.
// @route       DELETE /auth
// @access      Private
exports.deleteRecipe = catchAsync(async (req, res, next) => {
	await Recipe.findByIdAndDelete(req.params.recipeId);
	res.status(204).json({
		status: 'success',
		message: 'Deleted successfuly'
	});
});

// // @desc        Get Logged in user.
// // @route       GET /auth
// // @access      Private
// exports.getLoggedInUser = catchAsync(async (req, res, next) => {
// 	console.log('tolu');
// 	const user = await User.findById(req.user.id).select('-password');
// 	res.json(user);
// });
