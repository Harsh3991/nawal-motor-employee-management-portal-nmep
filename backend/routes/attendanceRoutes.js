const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummary,
  markBulkAttendance
} = require('../controllers/attendanceController');
const { protect, authorize, checkHRPermission } = require('../middleware/auth');
const { attendanceValidation, validate } = require('../middleware/validation');

// Bulk marking route
router.post('/bulk', protect, checkHRPermission('canManageAttendance'), markBulkAttendance);

// Summary route
router.get('/summary/:employeeId', protect, getAttendanceSummary);

// Main routes
router.route('/')
  .get(protect, getAttendance)
  .post(protect, checkHRPermission('canManageAttendance'), markAttendance);

router.route('/:id')
  .put(protect, checkHRPermission('canManageAttendance'), updateAttendance)
  .delete(protect, authorize('admin'), deleteAttendance);

module.exports = router;
