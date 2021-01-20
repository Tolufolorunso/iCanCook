const express = require('express');

const router = express.Router();

const { authorize, authorizeFor } = require('../controllers/authController');

// router.param('userId', (req, res, next, val) => {
// 	console.log(val);
// 	next();
// });

const {
	getAllUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser
} = require('../controllers/userControllers');
router.get('/', authorize, getAllUsers);
router.get('/:userId', getUser);
router.post('/', createUser);
router.patch('/', updateUser);
router.delete('/:userId', authorize, authorizeFor('admin'), deleteUser);

module.exports = router;
