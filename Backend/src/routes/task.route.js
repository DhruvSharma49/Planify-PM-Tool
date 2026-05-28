const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { getTasks, getTask, createTask, updateTask, deleteTask, moveTask,getArrivedTasks } = require('../controllers/taskcontroller');

router.use(authenticate);

router.get('/arrived', getArrivedTasks);
router.get('/project/:projectId', getTasks);
router.post('/project/:projectId', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.patch('/:id/move', moveTask);
router.delete('/:id', deleteTask);


module.exports = router;