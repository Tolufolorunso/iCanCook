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
	deleteUser,
	updateMe,
	deleteMe
} = require('../controllers/userControllers');
router.get('/', authorize, getAllUsers);
router.get('/:userId', getUser);
router.post('/', createUser);
router.patch('/', updateUser);
router.delete('/', authorize, authorizeFor('admin'), deleteUser);

router.patch('/updateme', authorize, updateMe);
router.delete('/deleteme', authorize, deleteMe);

module.exports = router;
