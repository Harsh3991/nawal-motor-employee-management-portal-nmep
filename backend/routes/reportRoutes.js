const express = require('express');
const router = express.Router();
const {
  getSalaryReport,
  getAttendanceReport,
  getPFESIReport,
  getIncentiveReport,
  getIncrementReport,
  getAdvanceReport,
  getDeductionReport,
  getEmployeeReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// All report routes are protected and only accessible by Admin/HR
router.use(protect, authorize('admin', 'hr'));

router.get('/salary', getSalaryReport);
router.get('/attendance', getAttendanceReport);
router.get('/pf-esi', getPFESIReport);
router.get('/incentives', getIncentiveReport);
router.get('/increments', getIncrementReport);
router.get('/advances', getAdvanceReport);
router.get('/deductions', getDeductionReport);
router.get('/employees', getEmployeeReport);

module.exports = router;
