const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { syncAttendanceToSheets } = require('../utils/googleSheets');
const { getPaginationParams, createPaginationResponse } = require('../utils/helpers');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Admin/HR)
exports.markAttendance = async (req, res, next) => {
  try {
    const { employee, date, status, checkInTime, checkOutTime, isNightDuty, remarks } = req.body;

    // Validate required fields
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee is required'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status value
    const validStatuses = ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if attendance already marked for this date
    const existingAttendance = await Attendance.findOne({
      employee,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date'
      });
    }

    // Calculate working hours if both times are provided
    let workingHours;
    if (checkInTime && checkOutTime) {
      const checkIn = new Date(checkInTime);
      const checkOut = new Date(checkOutTime);
      workingHours = (checkOut - checkIn) / (1000 * 60 * 60); // Convert to hours
    }

    const attendance = await Attendance.create({
      employee,
      date,
      status,
      checkInTime: checkInTime || undefined,
      checkOutTime: checkOutTime || undefined,
      workingHours,
      isNightDuty,
      remarks,
      markedBy: req.user._id
    });

    // Get employee details for sheets sync
    const employeeData = await Employee.findById(employee);
    
    // Sync to Google Sheets (don't fail if this errors)
    try {
      await syncAttendanceToSheets(attendance, employeeData);
    } catch (syncError) {
      console.error('Google Sheets sync failed:', syncError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    next(error);
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { employee, startDate, endDate, status, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams(page, limit);

    let query = {};

    // If employee role, only show their own attendance
    if (req.user.role === 'employee') {
      query.employee = req.user.employee;
    } else if (employee) {
      query.employee = employee;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('employee', 'employeeId selfDetails.firstName selfDetails.lastName jobDetails.department')
      .populate('markedBy', 'employeeId email');

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      ...createPaginationResponse(attendance, total, pageNum, limitNum)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Admin/HR)
exports.updateAttendance = async (req, res, next) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Calculate working hours if updated
    if (req.body.checkInTime && req.body.checkOutTime) {
      const checkIn = new Date(req.body.checkInTime);
      const checkOut = new Date(req.body.checkOutTime);
      req.body.workingHours = (checkOut - checkIn) / (1000 * 60 * 60);
    }

    attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (Admin only)
exports.deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attendance deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance summary for employee
// @route   GET /api/attendance/summary/:employeeId
// @access  Private
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const employee = await Employee.findOne({ employeeId });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check access rights
    if (req.user.role === 'employee' && req.user.employee.toString() !== employee._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const summary = await Attendance.aggregate([
      {
        $match: {
          employee: employee._id,
          date: {
            $gte: new Date(targetYear, targetMonth - 1, 1),
            $lt: new Date(targetYear, targetMonth, 1)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$workingHours' }
        }
      }
    ]);

    // Calculate totals
    const totalPresent = summary.find(s => s._id === 'Present')?.count || 0;
    const totalAbsent = summary.find(s => s._id === 'Absent')?.count || 0;
    const totalHalfDay = summary.find(s => s._id === 'Half Day')?.count || 0;
    const totalLeaves = summary.find(s => s._id === 'Leave')?.count || 0;
    const totalHolidays = summary.find(s => s._id === 'Holiday')?.count || 0;
    
    const totalWorkingHours = summary.reduce((sum, s) => sum + (s.totalHours || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        employee: {
          id: employee.employeeId,
          name: employee.fullName
        },
        month: targetMonth,
        year: targetYear,
        summary: {
          present: totalPresent,
          absent: totalAbsent,
          halfDay: totalHalfDay,
          leaves: totalLeaves,
          holidays: totalHolidays,
          totalWorkingHours: Math.round(totalWorkingHours * 100) / 100
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark bulk attendance
// @route   POST /api/attendance/bulk
// @access  Private (Admin/HR)
exports.markBulkAttendance = async (req, res, next) => {
  try {
    const { date, attendanceRecords } = req.body; // attendanceRecords: [{ employee, status }]

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No attendance records provided'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const record of attendanceRecords) {
      try {
        // Check if already exists
        const existing = await Attendance.findOne({
          employee: record.employee,
          date: new Date(date)
        });

        if (existing) {
          results.failed.push({
            employee: record.employee,
            reason: 'Already marked'
          });
          continue;
        }

        const attendance = await Attendance.create({
          employee: record.employee,
          date,
          status: record.status,
          markedBy: req.user._id
        });

        results.success.push(attendance);
      } catch (error) {
        results.failed.push({
          employee: record.employee,
          reason: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Marked ${results.success.length} attendance records`,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
