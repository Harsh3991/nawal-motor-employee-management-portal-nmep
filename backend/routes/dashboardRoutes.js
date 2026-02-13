const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getMonthlySummary,
  getDepartmentSummary,
  getAttendanceTrend,
  getUpcomingTasks
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// All dashboard routes are protected and only accessible by Admin/HR
router.use(protect, authorize('admin', 'hr'));

router.get('/metrics', getDashboardMetrics);
router.get('/monthly-summary', getMonthlySummary);
router.get('/department-summary', getDepartmentSummary);
router.get('/attendance-trend', getAttendanceTrend);
router.get('/tasks', getUpcomingTasks);

module.exports = router;
