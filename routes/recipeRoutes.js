const express = require('express');

const router = express.Router();

const {
	createRecipe,
	getAllRecipe,
	getRecipe,
	updateRecipe,
	deleteRecipe
} = require('../controllers/recipeControllers');

router.post('/', createRecipe);
router.get('/', getAllRecipe);
router.get('/:recipeId', getRecipe);
router.patch('/:recipeId', updateRecipe);
router.delete('/:recipeId', deleteRecipe);

module.exports = router;
