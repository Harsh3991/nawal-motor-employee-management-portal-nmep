const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadDocuments,
  getIncompleteProfiles,
  getEmployeeStats,
  searchEmployees
} = require('../controllers/employeeController');
const { protect, authorize, checkHRPermission, canAccessEmployee } = require('../middleware/auth');
const { employeeValidation, validate } = require('../middleware/validation');
const { uploadFields } = require('../middleware/upload');

// Search route (must be before :id routes)
router.get('/search', protect, searchEmployees);

// Stats route
router.get('/stats', protect, authorize('admin', 'hr'), getEmployeeStats);

// Incomplete profiles
router.get('/incomplete', protect, authorize('admin', 'hr'), getIncompleteProfiles);

// Main CRUD routes
router.route('/')
  .get(protect, authorize('admin', 'hr'), getAllEmployees)
  .post(protect, authorize('admin', 'hr'), createEmployee);

router.route('/:id')
  .get(protect, canAccessEmployee, getEmployee)
  .put(protect, checkHRPermission('canEdit'), updateEmployee)
  .delete(protect, authorize('admin'), deleteEmployee);

// Document upload
router.post(
  '/:id/documents',
  protect,
  authorize('admin', 'hr'),
  uploadFields,
  uploadDocuments
);

module.exports = router;
