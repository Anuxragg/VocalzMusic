const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ success: false, errors: errors.array() });
	}
	return next();
};

router.post(
	'/register',
	authLimiter,
	[
		body('username').trim().isLength({ min: 3 }),
		body('email').isEmail(),
		body('password').isLength({ min: 6 }),
	],
	validate,
	authController.register
);

router.post(
	'/login',
	authLimiter,
	[
		body('email').isEmail(),
		body('password').isLength({ min: 6 }),
	],
	validate,
	authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.get('/session', authController.getSession);
router.post('/google', authLimiter, authController.googleLogin);


module.exports = router;
