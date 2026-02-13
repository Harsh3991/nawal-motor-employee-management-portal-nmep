const Employee = require('../models/Employee');
const { uploadToCloudinary, deleteFromCloudinary, uploadMultipleToCloudinary } = require('../utils/fileUpload');

// @desc    Upload single document
// @route   POST /api/documents/upload
// @access  Private (Admin/HR)
exports.uploadDocument = async (req, res, next) => {
  try {
    const { employeeId, documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const folder = `nmep/employees/${employeeId}/${documentType}`;
    const result = await uploadToCloudinary(req.file.buffer, folder);

    // Update employee document
    switch (documentType) {
      case 'photograph':
        employee.selfDetails.photograph = result.url;
        break;
      case 'aadhaarCard':
        employee.documents.aadhaarCard = result.url;
        break;
      case 'panCard':
        employee.documents.panCard = result.url;
        break;
      case 'drivingLicense':
        employee.selfDetails.drivingLicense.documentUrl = result.url;
        break;
      case 'applicationHindi':
        employee.documents.applicationHindi = result.url;
        break;
      case 'applicationEnglish':
        employee.documents.applicationEnglish = result.url;
        break;
      default:
        employee.documents.otherDocuments.push({
          name: req.file.originalname,
          url: result.url,
          uploadedAt: new Date()
        });
    }

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple documents
// @route   POST /api/documents/upload-multiple
// @access  Private (Admin/HR)
exports.uploadMultipleDocuments = async (req, res, next) => {
  try {
    const { employeeId, documentType } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const folder = `nmep/employees/${employeeId}/${documentType}`;
    const results = await uploadMultipleToCloudinary(req.files, folder);

    // Update employee documents
    if (documentType === 'educationCertificates') {
      employee.documents.educationCertificates = [
        ...employee.documents.educationCertificates,
        ...results.map(r => r.url)
      ];
    } else {
      results.forEach(result => {
        employee.documents.otherDocuments.push({
          name: documentType,
          url: result.url,
          uploadedAt: new Date()
        });
      });
    }

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee documents
// @route   GET /api/documents/:employeeId
// @access  Private
exports.getEmployeeDocuments = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findOne({ employeeId })
      .select('employeeId documents selfDetails.photograph selfDetails.drivingLicense');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check access - employees can only see their own documents
    if (req.user.role === 'employee' && req.user.employeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        photograph: employee.selfDetails.photograph,
        drivingLicense: employee.selfDetails.drivingLicense?.documentUrl,
        documents: employee.documents
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:employeeId/:documentType
// @access  Private (Admin/HR)
exports.deleteDocument = async (req, res, next) => {
  try {
    const { employeeId, documentType } = req.params;

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Remove document reference
    switch (documentType) {
      case 'photograph':
        employee.selfDetails.photograph = undefined;
        break;
      case 'aadhaarCard':
        employee.documents.aadhaarCard = undefined;
        break;
      case 'panCard':
        employee.documents.panCard = undefined;
        break;
      case 'drivingLicense':
        employee.selfDetails.drivingLicense.documentUrl = undefined;
        break;
      case 'applicationHindi':
        employee.documents.applicationHindi = undefined;
        break;
      case 'applicationEnglish':
        employee.documents.applicationEnglish = undefined;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid document type'
        });
    }

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents requiring verification
// @route   GET /api/documents/pending-verification
// @access  Private (Admin/HR)
exports.getPendingVerification = async (req, res, next) => {
  try {
    const employees = await Employee.find({
      status: 'Active',
      'profileStatus.isComplete': false
    }).select('employeeId selfDetails.firstName selfDetails.lastName documents profileStatus');

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};
