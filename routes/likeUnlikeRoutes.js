const express = require('express');
const router = express.Router();
const { authorize } = require('../controllers/authController');

const {
	likeRecipe,
	unLikeRecipe
} = require('../controllers/likeUnlikeController');

router.put('/like/:recipeID', authorize, likeRecipe);
router.put('/unlike/:recipeID', authorize, unLikeRecipe);

module.exports = router;
