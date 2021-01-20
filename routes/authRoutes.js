const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();

const {
	signup,
	login,
	authorize,
	forgotPassword,
	resetPassword,
	updatePassword
} = require('../controllers/authController');

router.post(
	'/signup',
	[
		check('email')
			.isEmail()
			.withMessage('Please enter a valid email')
			.normalizeEmail()
			.trim(),
		body('name', 'Your name is required and at least 3 characters'),
		body(
			'password',
			'Please enter a password with only numbers and text and at least 8 characters'
		)
			.isLength({ min: 3 })
			.isAlphanumeric()
			.trim(),
		body('passwordConfirm')
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Please, passwords have to match!');
				}
				return true;
			})
			.trim()
	],
	signup
);

router.post(
	'/login',
	[
		check('email')
			.isEmail()
			.withMessage('Please enter a valid email')
			.normalizeEmail()
			.trim(),
		body('name', 'Your name is required and at least 3 characters'),
		body(
			'password',
			'Please enter a password with only numbers and text and at least 8 characters'
		)
			.isLength({ min: 3 })
			.isAlphanumeric()
			.trim(),
		body('passwordConfirm')
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Please, passwords have to match!');
				}
				return true;
			})
			.trim()
	],
	login
);

router.post(
	'/forgotpassword',
	check('email')
		.isEmail()
		.withMessage('Please enter a valid email')
		.normalizeEmail()
		.trim(),
	forgotPassword
);

router.patch(
	'/resetpassword/:token',
	[
		body(
			'password',
			'Please enter a password with only numbers and text and at least 8 characters'
		)
			.isLength({ min: 3 })
			.isAlphanumeric()
			.trim(),
		body('passwordConfirm')
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Please, passwords have to match!');
				}
				return true;
			})
			.trim()
	],
	resetPassword
);

router.patch(
	'/updatepassword',
	authorize,
	[
		body(
			'password',
			'Please enter a password with only numbers and text and at least 8 characters'
		)
			.isLength({ min: 3 })
			.isAlphanumeric()
			.trim(),
		body('passwordConfirm')
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Please, passwords have to match!');
				}
				return true;
			})
			.trim()
	],
	updatePassword
);

module.exports = router;
