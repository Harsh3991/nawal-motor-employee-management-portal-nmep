const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const Advance = require('../models/Advance');

// @desc    Get dashboard metrics
// @route   GET /api/dashboard/metrics
// @access  Private (Admin/HR)
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total employees
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });

    // Today's attendance
    const todayAttendance = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const presentToday = todayAttendance.find(a => a._id === 'Present')?.count || 0;
    const absentToday = todayAttendance.find(a => a._id === 'Absent')?.count || 0;

    // Incomplete profiles
    const incompleteProfiles = await Employee.countDocuments({
      status: 'Active',
      'profileStatus.isComplete': false
    });

    // Pending salary for current month
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    const pendingSalary = await Salary.countDocuments({
      month: currentMonth,
      year: currentYear,
      paymentStatus: 'Pending'
    });

    // Pending advances
    const pendingAdvances = await Advance.countDocuments({
      approvalStatus: 'Pending'
    });

    // Recent activities (last 7 days)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newEmployees = await Employee.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        incompleteProfiles,
        pendingSalary,
        pendingAdvances,
        newEmployees
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly summary
// @route   GET /api/dashboard/monthly-summary
// @access  Private (Admin/HR)
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Attendance summary
    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(targetYear, targetMonth - 1, 1),
            $lt: new Date(targetYear, targetMonth, 1)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Salary summary
    const salarySummary = await Salary.aggregate([
      {
        $match: { month: targetMonth, year: targetYear }
      },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netSalary' }
        }
      }
    ]);

    // Total payroll
    const totalPayroll = await Salary.aggregate([
      {
        $match: { month: targetMonth, year: targetYear }
      },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$grossSalary' },
          totalDeductions: { $sum: '$totalDeductionsAmount' },
          totalNet: { $sum: '$netSalary' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        attendance: attendanceSummary,
        salary: salarySummary,
        payroll: totalPayroll[0] || { totalGross: 0, totalDeductions: 0, totalNet: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department-wise summary
// @route   GET /api/dashboard/department-summary
// @access  Private (Admin/HR)
exports.getDepartmentSummary = async (req, res, next) => {
  try {
    const summary = await Employee.aggregate([
      {
        $match: { status: 'Active' }
      },
      {
        $group: {
          _id: '$jobDetails.department',
          totalEmployees: { $sum: 1 },
          avgSalary: { $avg: '$jobDetails.basicSalary' },
          totalSalary: { $sum: '$jobDetails.basicSalary' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance trend
// @route   GET /api/dashboard/attendance-trend
// @access  Private (Admin/HR)
exports.getAttendanceTrend = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const trend = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: trend
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming tasks
// @route   GET /api/dashboard/tasks
// @access  Private (Admin/HR)
exports.getUpcomingTasks = async (req, res, next) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Employees with birthdays this month
    const birthdays = await Employee.find({
      status: 'Active',
      $expr: {
        $eq: [{ $month: '$selfDetails.dateOfBirth' }, currentMonth]
      }
    })
    .select('employeeId selfDetails.firstName selfDetails.lastName selfDetails.dateOfBirth')
    .limit(5);

    // Pending approvals
    const pendingApprovals = {
      advances: await Advance.countDocuments({ approvalStatus: 'Pending' }),
      incompleteProfiles: await Employee.countDocuments({
        status: 'Active',
        'profileStatus.isComplete': false
      })
    };

    res.status(200).json({
      success: true,
      data: {
        birthdays,
        pendingApprovals
      }
    });
  } catch (error) {
    next(error);
  }
};
