const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG), PDFs, and DOC/DOCX files are allowed'));
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter,
});

// Export different upload configurations
exports.uploadSingle = upload.single('file');
exports.uploadMultiple = upload.array('files', 10); // Max 10 files
exports.uploadFields = upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'educationCertificates', maxCount: 5 },
  { name: 'applicationHindi', maxCount: 1 },
  { name: 'applicationEnglish', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 10 }
]);
