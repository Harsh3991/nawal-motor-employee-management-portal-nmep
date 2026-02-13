const Employee = require('../models/Employee');
const Salary = require('../models/Salary');
const Attendance = require('../models/Attendance');
const Incentive = require('../models/Incentive');
const Increment = require('../models/Increment');
const Deduction = require('../models/Deduction');
const Advance = require('../models/Advance');

// @desc    Get salary report
// @route   GET /api/reports/salary
// @access  Private (Admin/HR)
exports.getSalaryReport = async (req, res, next) => {
  try {
    const { month, year, department, paymentStatus } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    let query = {
      month: parseInt(month),
      year: parseInt(year)
    };

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const salaries = await Salary.find(query)
      .populate({
        path: 'employee',
        select: 'employeeId selfDetails jobDetails',
        match: department ? { 'jobDetails.department': department } : {}
      })
      .sort({ 'employee.employeeId': 1 });

    // Filter out null employees (if department filter applied)
    const filteredSalaries = salaries.filter(s => s.employee);

    // Calculate totals
    const totals = {
      count: filteredSalaries.length,
      totalGrossSalary: filteredSalaries.reduce((sum, s) => sum + s.grossSalary, 0),
      totalDeductions: filteredSalaries.reduce((sum, s) => sum + s.totalDeductionsAmount, 0),
      totalNetSalary: filteredSalaries.reduce((sum, s) => sum + s.netSalary, 0),
      totalIncentives: filteredSalaries.reduce((sum, s) => sum + s.totalIncentives, 0),
      totalAdvances: filteredSalaries.reduce((sum, s) => sum + s.totalAdvances, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        salaries: filteredSalaries,
        totals,
        filters: { month, year, department, paymentStatus }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance report
// @route   GET /api/reports/attendance
// @access  Private (Admin/HR)
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, employeeId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    let employeeQuery = { status: 'Active' };
    
    if (department) {
      employeeQuery['jobDetails.department'] = department;
    }

    if (employeeId) {
      employeeQuery.employeeId = employeeId;
    }

    const employees = await Employee.find(employeeQuery)
      .select('employeeId selfDetails jobDetails');

    const report = [];

    for (const employee of employees) {
      const attendance = await Attendance.find({
        employee: employee._id,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      });

      const summary = {
        employee: {
          id: employee.employeeId,
          name: employee.fullName,
          department: employee.jobDetails.department,
          designation: employee.jobDetails.designation
        },
        present: attendance.filter(a => a.status === 'Present').length,
        absent: attendance.filter(a => a.status === 'Absent').length,
        halfDay: attendance.filter(a => a.status === 'Half Day').length,
        leave: attendance.filter(a => a.status === 'Leave').length,
        holiday: attendance.filter(a => a.status === 'Holiday').length,
        totalWorkingHours: attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0)
      };

      report.push(summary);
    }

    res.status(200).json({
      success: true,
      data: {
        report,
        filters: { startDate, endDate, department, employeeId }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get PF/ESI report
// @route   GET /api/reports/pf-esi
// @access  Private (Admin/HR)
exports.getPFESIReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    const salaries = await Salary.find({
      month: parseInt(month),
      year: parseInt(year)
    }).populate('employee', 'employeeId selfDetails jobDetails');

    const report = salaries.map(salary => ({
      employeeId: salary.employee.employeeId,
      name: salary.employee.fullName,
      pfNumber: salary.employee.jobDetails.pfNumber,
      esiNumber: salary.employee.jobDetails.esiNumber,
      uanNumber: salary.employee.jobDetails.uanNumber,
      basicSalary: salary.basicSalary,
      hra: salary.hra,
      pfEmployee: salary.providentFund,
      pfEmployer: salary.providentFund, // Usually same as employee contribution
      esi: salary.esi,
      grossSalary: salary.grossSalary
    }));

    const totals = {
      totalPFEmployee: report.reduce((sum, r) => sum + r.pfEmployee, 0),
      totalPFEmployer: report.reduce((sum, r) => sum + r.pfEmployer, 0),
      totalESI: report.reduce((sum, r) => sum + r.esi, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        report,
        totals,
        filters: { month, year }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incentive report
// @route   GET /api/reports/incentives
// @access  Private (Admin/HR)
exports.getIncentiveReport = async (req, res, next) => {
  try {
    const { month, year, type, status } = req.query;
    
    let query = {};
    
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (type) query.type = type;
    if (status) query.status = status;

    const incentives = await Incentive.find(query)
      .populate('employee', 'employeeId selfDetails jobDetails')
      .populate('addedBy', 'employeeId email')
      .sort({ createdAt: -1 });

    const totalAmount = incentives.reduce((sum, inc) => sum + inc.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        incentives,
        totalAmount,
        count: incentives.length,
        filters: { month, year, type, status }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get increment report
// @route   GET /api/reports/increments
// @access  Private (Admin/HR)
exports.getIncrementReport = async (req, res, next) => {
  try {
    const { year, reason, employeeId } = req.query;
    
    let query = {};
    
    if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      query.effectiveDate = { $gte: startDate, $lte: endDate };
    }
    
    if (reason) query.reason = reason;
    
    if (employeeId) {
      const employee = await Employee.findOne({ employeeId });
      if (employee) query.employee = employee._id;
    }

    const increments = await Increment.find(query)
      .populate('employee', 'employeeId selfDetails jobDetails')
      .populate('approvedBy', 'employeeId email')
      .sort({ effectiveDate: -1 });

    const totalIncrementAmount = increments.reduce((sum, inc) => sum + inc.incrementAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        increments,
        totalIncrementAmount,
        count: increments.length,
        filters: { year, reason, employeeId }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get advance report
// @route   GET /api/reports/advances
// @access  Private (Admin/HR)
exports.getAdvanceReport = async (req, res, next) => {
  try {
    const { status, repaymentStatus, employeeId } = req.query;
    
    let query = {};
    
    if (status) query.approvalStatus = status;
    if (repaymentStatus) query.repaymentStatus = repaymentStatus;
    
    if (employeeId) {
      const employee = await Employee.findOne({ employeeId });
      if (employee) query.employee = employee._id;
    }

    const advances = await Advance.find(query)
      .populate('employee', 'employeeId selfDetails jobDetails')
      .populate('approvedBy', 'employeeId email')
      .sort({ requestDate: -1 });

    const totals = {
      totalAmount: advances.reduce((sum, adv) => sum + adv.amount, 0),
      totalPaid: advances.reduce((sum, adv) => sum + adv.paidAmount, 0),
      totalRemaining: advances.reduce((sum, adv) => sum + adv.remainingAmount, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        advances,
        totals,
        count: advances.length,
        filters: { status, repaymentStatus, employeeId }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get deduction report
// @route   GET /api/reports/deductions
// @access  Private (Admin/HR)
exports.getDeductionReport = async (req, res, next) => {
  try {
    const { month, year, type, status } = req.query;
    
    let query = {};
    
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (type) query.type = type;
    if (status) query.status = status;

    const deductions = await Deduction.find(query)
      .populate('employee', 'employeeId selfDetails jobDetails')
      .populate('addedBy', 'employeeId email')
      .sort({ createdAt: -1 });

    const totalAmount = deductions.reduce((sum, ded) => sum + ded.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        deductions,
        totalAmount,
        count: deductions.length,
        filters: { month, year, type, status }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee report
// @route   GET /api/reports/employees
// @access  Private (Admin/HR)
exports.getEmployeeReport = async (req, res, next) => {
  try {
    const { department, status, salaryType } = req.query;
    
    let query = {};
    
    if (department) query['jobDetails.department'] = department;
    if (status) query.status = status;
    if (salaryType) query['jobDetails.salaryType'] = salaryType;

    const employees = await Employee.find(query)
      .select('employeeId selfDetails jobDetails profileStatus createdAt')
      .sort({ 'jobDetails.department': 1, employeeId: 1 });

    // Group by department
    const byDepartment = await Employee.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$jobDetails.department',
          count: { $sum: 1 },
          avgSalary: { $avg: '$jobDetails.basicSalary' },
          totalSalary: { $sum: '$jobDetails.basicSalary' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        employees,
        summary: byDepartment,
        totalCount: employees.length,
        filters: { department, status, salaryType }
      }
    });
  } catch (error) {
    next(error);
  }
};
