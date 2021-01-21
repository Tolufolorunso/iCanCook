const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authorize, authorizeFor } = require('../controllers/authController');

const {
	postComment,
	deleteComment
} = require('../controllers/commentController');

router.post(
	'/:recipeID',
	[check('comment', 'Comment is required').not().isEmpty()],
	authorize,
	postComment
);

router.delete('/:recipeID/:commentID', authorize, deleteComment);

module.exports = router;
