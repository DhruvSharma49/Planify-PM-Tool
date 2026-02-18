const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { searchUsers, updateProfile } = require('../controllers/user.controller');

router.use(authenticate);

router.get('/search', searchUsers);
router.put('/profile', updateProfile);

module.exports = router;