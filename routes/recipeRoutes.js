const express = require('express');

const router = express.Router();

const { authorize, authorizeFor } = require('../controllers/authController');

const {
	createRecipe,
	getAllRecipe,
	getRecipe,
	updateRecipe,
	deleteRecipe
} = require('../controllers/recipeControllers');

router.post('/', authorize, createRecipe);
router.get('/', getAllRecipe);
router.get('/:recipeId', getRecipe);
router.patch('/:recipeId', authorize, updateRecipe);
router.delete('/:recipeId', deleteRecipe);

module.exports = router;
