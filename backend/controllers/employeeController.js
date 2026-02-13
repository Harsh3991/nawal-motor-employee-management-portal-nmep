const Employee = require('../models/Employee');
const User = require('../models/User');
const { generateEmployeeId, getPaginationParams, createPaginationResponse } = require('../utils/helpers');
const { syncEmployeeToSheets } = require('../utils/googleSheets');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/fileUpload');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin/HR)
exports.getAllEmployees = async (req, res, next) => {
  try {
    const { page, limit, search, department, status, sortBy } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams(page, limit);

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { 'selfDetails.firstName': { $regex: search, $options: 'i' } },
        { 'selfDetails.lastName': { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query['jobDetails.department'] = department;
    }

    if (status) {
      query.status = status;
    }

    // Sorting
    let sort = {};
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      sort[field] = order === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 };
    }

    const employees = await Employee.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'employeeId email')
      .populate('updatedBy', 'employeeId email');

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      ...createPaginationResponse(employees, total, pageNum, limitNum)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('createdBy', 'employeeId email')
      .populate('updatedBy', 'employeeId email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin/HR)
exports.createEmployee = async (req, res, next) => {
  try {
    const employeeData = req.body;

    // Generate unique employee ID
    let employeeId = generateEmployeeId();
    let exists = await Employee.findOne({ employeeId });
    
    while (exists) {
      employeeId = generateEmployeeId();
      exists = await Employee.findOne({ employeeId });
    }

    employeeData.employeeId = employeeId;
    employeeData.createdBy = req.user._id;

    const employee = await Employee.create(employeeData);

    // Sync to Google Sheets
    await syncEmployeeToSheets(employee);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin/HR with permission)
exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update employee
    req.body.updatedBy = req.user._id;
    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Sync to Google Sheets
    await syncEmployeeToSheets(employee);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Mark as terminated instead of deleting
    employee.status = 'Terminated';
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee marked as terminated'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload employee documents
// @route   POST /api/employees/:id/documents
// @access  Private (Admin/HR)
exports.uploadDocuments = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const folder = `nmep/employees/${employee.employeeId}`;
    const uploadedDocs = {};

    // Upload each document type
    for (const [key, files] of Object.entries(req.files)) {
      const fileArray = Array.isArray(files) ? files : [files];
      
      if (fileArray.length === 1) {
        const result = await uploadToCloudinary(fileArray[0].buffer, folder);
        uploadedDocs[key] = result.url;
      } else {
        const results = await Promise.all(
          fileArray.map(file => uploadToCloudinary(file.buffer, folder))
        );
        uploadedDocs[key] = results.map(r => r.url);
      }
    }

    // Update employee documents
    if (uploadedDocs.photograph) employee.selfDetails.photograph = uploadedDocs.photograph;
    if (uploadedDocs.aadhaarCard) employee.documents.aadhaarCard = uploadedDocs.aadhaarCard;
    if (uploadedDocs.panCard) employee.documents.panCard = uploadedDocs.panCard;
    if (uploadedDocs.drivingLicense) employee.selfDetails.drivingLicense.documentUrl = uploadedDocs.drivingLicense;
    if (uploadedDocs.applicationHindi) employee.documents.applicationHindi = uploadedDocs.applicationHindi;
    if (uploadedDocs.applicationEnglish) employee.documents.applicationEnglish = uploadedDocs.applicationEnglish;
    if (uploadedDocs.educationCertificates) employee.documents.educationCertificates = uploadedDocs.educationCertificates;

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incomplete profiles
// @route   GET /api/employees/incomplete
// @access  Private (Admin/HR)
exports.getIncompleteProfiles = async (req, res, next) => {
  try {
    const employees = await Employee.find({
      'profileStatus.isComplete': false
    }).select('employeeId selfDetails.firstName selfDetails.lastName profileStatus');

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Private (Admin/HR)
exports.getEmployeeStats = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const byDepartment = await Employee.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$jobDetails.department', count: { $sum: 1 } } }
    ]);
    const byDesignation = await Employee.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$jobDetails.designation', count: { $sum: 1 } } }
    ]);
    const incompleteProfiles = await Employee.countDocuments({
      status: 'Active',
      'profileStatus.isComplete': false
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        byDepartment,
        byDesignation,
        incompleteProfiles
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search employees
// @route   GET /api/employees/search
// @access  Private
exports.searchEmployees = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const employees = await Employee.find({
      $or: [
        { 'selfDetails.firstName': { $regex: q, $options: 'i' } },
        { 'selfDetails.lastName': { $regex: q, $options: 'i' } },
        { employeeId: { $regex: q, $options: 'i' } },
        { 'selfDetails.email': { $regex: q, $options: 'i' } }
      ],
      status: 'Active'
    })
    .select('employeeId selfDetails.firstName selfDetails.lastName selfDetails.photograph jobDetails.department jobDetails.designation')
    .limit(10);

    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};
