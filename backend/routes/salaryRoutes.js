const express = require('express');
const router = express.Router();
const {
  generateSalary,
  getAllSalaries,
  getSalary,
  updateSalaryStatus,
  addIncentive,
  addDeduction,
  addAdvance,
  addIncrement
} = require('../controllers/salaryController');
const { protect, authorize, checkHRPermission } = require('../middleware/auth');
const {
  salaryValidation,
  incentiveValidation,
  deductionValidation,
  advanceValidation,
  incrementValidation,
  validate
} = require('../middleware/validation');

// Salary generation
router.post('/generate', protect, checkHRPermission('canManageSalary'), salaryValidation, validate, generateSalary);

// Add components
router.post('/incentive', protect, checkHRPermission('canManageSalary'), incentiveValidation, validate, addIncentive);
router.post('/deduction', protect, checkHRPermission('canManageSalary'), deductionValidation, validate, addDeduction);
router.post('/advance', protect, checkHRPermission('canManageSalary'), advanceValidation, validate, addAdvance);
router.post('/increment', protect, authorize('admin'), incrementValidation, validate, addIncrement);

// Main routes
router.route('/')
  .get(protect, getAllSalaries);

router.route('/:id')
  .get(protect, getSalary);

router.put('/:id/status', protect, checkHRPermission('canManageSalary'), updateSalaryStatus);

module.exports = router;
