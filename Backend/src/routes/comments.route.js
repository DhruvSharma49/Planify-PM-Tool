const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { getComments, createComment, updateComment, deleteComment } = require('../controllers/comment.controller');

router.use(authenticate);

router.get('/task/:taskId', getComments);
router.post('/task/:taskId', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;