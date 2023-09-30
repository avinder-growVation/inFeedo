const router = require('express').Router()

const controller = require('../controllers/tasks')

router.post('/', controller.createTask)
router.get('/metrics-by-status', controller.fetchMetricsByStatus)
router.get('/metrics-by-timeline', controller.fetchMetricsByTimeline)
router.get('/', controller.fetchTasks)
router.patch('/', controller.updateTask)

module.exports = router
