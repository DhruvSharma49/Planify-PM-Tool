const router = require('express').Router();
const { register, login, refresh, logout, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;