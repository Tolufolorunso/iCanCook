const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authorize, authorizeFor } = require('../controllers/authController');

const {
	postComment,
	deleteComment
} = require('../controllers/commentController');

router.post(
	'/comments/:recipeID',
	[check('comment', 'Comment is required').not().isEmpty()],
	authorize,
	postComment
);

router.delete('/comments/:recipeID/:commentID', authorize, deleteComment);
// router.put('/like/:postId', protect, likePost);
// router.put('/unlike/:postId', protect, unLikePost);

module.exports = router;
