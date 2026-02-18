const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { getNotifications, markNotificationRead, markAllRead } = require('../controllers/user.controller');

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllRead);

module.exports = router;