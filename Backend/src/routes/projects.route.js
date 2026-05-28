const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, inviteMember, removeMember,acceptInvite,rejectInvite,leaveProject
} = require('../controllers/project.controller');

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);
router.post('/:id/accept-invite',acceptInvite);
router.post('/:id/reject-invite', rejectInvite)
router.post('/:id/leave', leaveProject);    ;




module.exports = router;