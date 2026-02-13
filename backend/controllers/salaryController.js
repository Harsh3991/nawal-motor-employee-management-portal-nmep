const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Incentive = require('../models/Incentive');
const Deduction = require('../models/Deduction');
const Advance = require('../models/Advance');
const Increment = require('../models/Increment');
const { syncSalaryToSheets } = require('../utils/googleSheets');
const { getWorkingDaysInMonth, getPaginationParams, createPaginationResponse } = require('../utils/helpers');

// @desc    Generate salary
// @route   POST /api/salary/generate
// @access  Private (Admin/HR with permission)
exports.generateSalary = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.body;

    // Check if salary already generated
    const employee = await Employee.findOne({ employeeId });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check profile completion
    if (!employee.profileStatus.isComplete) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate salary for incomplete profile',
        missingFields: employee.profileStatus.missingFields
      });
    }

    const existing = await Salary.findOne({
      employee: employee._id,
      month,
      year
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Salary already generated for this month'
      });
    }

    // Get attendance summary
    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      }
    });

    const attendanceSummary = {
      totalWorkingDays: getWorkingDaysInMonth(month, year),
      presentDays: attendanceRecords.filter(a => a.status === 'Present').length,
      absentDays: attendanceRecords.filter(a => a.status === 'Absent').length,
      halfDays: attendanceRecords.filter(a => a.status === 'Half Day').length,
      leaves: attendanceRecords.filter(a => a.status === 'Leave').length,
      holidays: attendanceRecords.filter(a => a.status === 'Holiday').length
    };

    // Get incentives
    const incentives = await Incentive.find({
      employee: employee._id,
      month,
      year,
      status: 'Approved'
    });
    const totalIncentives = incentives.reduce((sum, inc) => sum + inc.amount, 0);

    // Get deductions
    const deductions = await Deduction.find({
      employee: employee._id,
      month,
      year,
      status: 'Approved'
    });
    const totalDeductions = deductions.reduce((sum, ded) => sum + ded.amount, 0);

    // Get pending advances
    const advances = await Advance.find({
      employee: employee._id,
      approvalStatus: 'Approved',
      repaymentStatus: { $in: ['Not Started', 'In Progress'] }
    });

    // Calculate advance deduction (installment amount)
    let totalAdvances = 0;
    for (const advance of advances) {
      if (advance.repaymentMode === 'Salary Deduction' && advance.installmentAmount) {
        totalAdvances += advance.installmentAmount;
        
        // Record this repayment
        advance.repayments.push({
          month,
          year,
          amount: advance.installmentAmount,
          paidDate: new Date()
        });
        advance.paidAmount += advance.installmentAmount;
        advance.calculateRemaining();
        await advance.save();
      }
    }

    // Calculate salary components
    let basicSalary = employee.jobDetails.basicSalary;
    
    // For daily wage, calculate based on attendance
    if (employee.jobDetails.salaryType === 'Daily') {
      const workingDays = attendanceSummary.presentDays + (attendanceSummary.halfDays * 0.5);
      basicSalary = (employee.jobDetails.basicSalary * workingDays);
    }

    // Calculate HRA (40% of basic for monthly, included in daily rate)
    const hra = employee.jobDetails.salaryType === 'Monthly' 
      ? (employee.jobDetails.hra || basicSalary * 0.4) 
      : 0;

    const otherAllowances = employee.jobDetails.otherAllowances || 0;

    // Calculate night duty allowance
    const nightDutyDays = attendanceRecords.filter(a => a.isNightDuty).length;
    const nightDutyAllowance = nightDutyDays * 200; // ₹200 per night duty

    // Calculate statutory deductions
    const providentFund = employee.jobDetails.salaryType === 'Monthly' ? (basicSalary * 0.12) : 0;
    const esi = (basicSalary + hra) <= 21000 ? ((basicSalary + hra) * 0.0075) : 0;

    // Create salary record
    const salary = await Salary.create({
      employee: employee._id,
      month,
      year,
      basicSalary,
      hra,
      otherAllowances,
      nightDutyAllowance,
      incentives: incentives.map(i => i._id),
      totalIncentives,
      providentFund,
      esi,
      advances: advances.map(a => a._id),
      totalAdvances,
      deductions: deductions.map(d => d._id),
      totalDeductions,
      attendanceSummary,
      generatedBy: req.user._id
    });

    // Update incentives and deductions status
    await Incentive.updateMany(
      { _id: { $in: incentives.map(i => i._id) } },
      { status: 'Paid', paidInSalary: salary._id }
    );

    await Deduction.updateMany(
      { _id: { $in: deductions.map(d => d._id) } },
      { status: 'Deducted', deductedInSalary: salary._id }
    );

    // Sync to Google Sheets
    await syncSalaryToSheets(salary, employee);

    res.status(201).json({
      success: true,
      message: 'Salary generated successfully',
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all salaries
// @route   GET /api/salary
// @access  Private
exports.getAllSalaries = async (req, res, next) => {
  try {
    const { employee, month, year, paymentStatus, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams(page, limit);

    let query = {};

    // Employee can only see their own salary
    if (req.user.role === 'employee') {
      query.employee = req.user.employee;
    } else if (employee) {
      const emp = await Employee.findOne({ employeeId: employee });
      if (emp) query.employee = emp._id;
    }

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const salaries = await Salary.find(query)
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('employee', 'employeeId selfDetails.firstName selfDetails.lastName jobDetails.department jobDetails.designation')
      .populate('generatedBy', 'employeeId email');

    const total = await Salary.countDocuments(query);

    res.status(200).json({
      success: true,
      ...createPaginationResponse(salaries, total, pageNum, limitNum)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single salary
// @route   GET /api/salary/:id
// @access  Private
exports.getSalary = async (req, res, next) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate('employee')
      .populate('incentives')
      .populate('deductions')
      .populate('advances')
      .populate('generatedBy', 'employeeId email')
      .populate('approvedBy', 'employeeId email');

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      });
    }

    // Check access
    if (req.user.role === 'employee' && req.user.employee.toString() !== salary.employee._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update salary status
// @route   PUT /api/salary/:id/status
// @access  Private (Admin/HR)
exports.updateSalaryStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentDate, paymentMode, transactionId } = req.body;

    let salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      });
    }

    salary.paymentStatus = paymentStatus;
    if (paymentStatus === 'Paid') {
      salary.paymentDate = paymentDate || new Date();
      salary.paymentMode = paymentMode;
      salary.transactionId = transactionId;
      salary.approvedBy = req.user._id;
    }

    await salary.save();

    res.status(200).json({
      success: true,
      message: 'Salary status updated successfully',
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add incentive
// @route   POST /api/salary/incentive
// @access  Private (Admin/HR)
exports.addIncentive = async (req, res, next) => {
  try {
    const { employee, month, year, amount, type, description, remarks } = req.body;

    const emp = await Employee.findOne({ employeeId: employee });
    
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const incentive = await Incentive.create({
      employee: emp._id,
      month,
      year,
      amount,
      type,
      description,
      remarks,
      addedBy: req.user._id,
      status: 'Approved' // Auto-approve if added by Admin/HR
    });

    res.status(201).json({
      success: true,
      message: 'Incentive added successfully',
      data: incentive
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add deduction
// @route   POST /api/salary/deduction
// @access  Private (Admin/HR)
exports.addDeduction = async (req, res, next) => {
  try {
    const { employee, month, year, amount, type, reason, remarks } = req.body;

    const emp = await Employee.findOne({ employeeId: employee });
    
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const deduction = await Deduction.create({
      employee: emp._id,
      month,
      year,
      amount,
      type,
      reason,
      remarks,
      addedBy: req.user._id,
      status: 'Approved'
    });

    res.status(201).json({
      success: true,
      message: 'Deduction added successfully',
      data: deduction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add salary advance
// @route   POST /api/salary/advance
// @access  Private (Admin/HR)
exports.addAdvance = async (req, res, next) => {
  try {
    const { employee, amount, reason, installments, remarks } = req.body;

    const emp = await Employee.findOne({ employeeId: employee });
    
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const advance = await Advance.create({
      employee: emp._id,
      amount,
      reason,
      installments,
      remarks,
      approvalStatus: 'Approved',
      approvedBy: req.user._id,
      approvalDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Advance added successfully',
      data: advance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add increment
// @route   POST /api/salary/increment
// @access  Private (Admin only)
exports.addIncrement = async (req, res, next) => {
  try {
    const { employee, effectiveDate, newSalary, reason, remarks } = req.body;

    const emp = await Employee.findOne({ employeeId: employee });
    
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const previousSalary = emp.jobDetails.basicSalary;

    const increment = await Increment.create({
      employee: emp._id,
      effectiveDate,
      previousSalary,
      newSalary,
      reason,
      remarks,
      approvedBy: req.user._id,
      status: 'Approved'
    });

    // Update employee salary
    emp.jobDetails.basicSalary = newSalary;
    await emp.save();

    res.status(201).json({
      success: true,
      message: 'Increment added and employee salary updated',
      data: increment
    });
  } catch (error) {
    next(error);
  }
};
