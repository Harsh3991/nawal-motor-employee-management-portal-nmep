const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  uploadMultipleDocuments,
  getEmployeeDocuments,
  deleteDocument,
  getPendingVerification
} = require('../controllers/documentController');
const { protect, authorize, checkHRPermission } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// Pending verification
router.get('/pending-verification', protect, authorize('admin', 'hr'), getPendingVerification);

// Get employee documents
router.get('/:employeeId', protect, getEmployeeDocuments);

// Upload routes
router.post('/upload', protect, checkHRPermission('canViewDocuments'), uploadSingle, uploadDocument);
router.post('/upload-multiple', protect, checkHRPermission('canViewDocuments'), uploadMultiple, uploadMultipleDocuments);

// Delete document
router.delete('/:employeeId/:documentType', protect, authorize('admin', 'hr'), deleteDocument);

module.exports = router;
