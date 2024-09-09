const router = require('express').Router();
const { postTasks } = require('../controllers/postTasks');

router.post('/post_tasks', postTasks);

module.exports = router;
