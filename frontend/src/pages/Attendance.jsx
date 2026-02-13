import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Plus,
  Users,
  List,
  Grid3x3,
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';
import { ATTENDANCE_STATUS } from '../utils/constants';

const Attendance = () => {
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({
    status: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [filters.date]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await apiService.attendance.getAll({
        date: filters.date,
        status: filters.status,
      });
      const data = response.data.data || [];
      setAttendanceData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiService.employee.getAll({ limit: 1000 });
      const employeesData = response.data.data || [];
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Half-day':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'Leave':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Absent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Half-day':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Leave':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter((a) => a.status === 'Present').length,
    absent: attendanceData.filter((a) => a.status === 'Absent').length,
    halfDay: attendanceData.filter((a) => a.status === 'Half Day').length,
    leave: attendanceData.filter((a) => a.status === 'Leave').length,
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance</h1>
          <p className="text-gray-600">Track and manage employee attendance</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMarkModal(true)}
          className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Mark Attendance</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
      >
        <StatsCard
          title="Total"
          value={stats.total}
          icon={Users}
          color="from-gray-500 to-gray-600"
          bgColor="bg-gray-50"
        />
        <StatsCard
          title="Present"
          value={stats.present}
          icon={CheckCircle}
          color="from-green-500 to-green-600"
          bgColor="bg-green-50"
        />
        <StatsCard
          title="Absent"
          value={stats.absent}
          icon={XCircle}
          color="from-red-500 to-red-600"
          bgColor="bg-red-50"
        />
        <StatsCard
          title="Half Day"
          value={stats.halfDay}
          icon={AlertCircle}
          color="from-yellow-500 to-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatsCard
          title="On Leave"
          value={stats.leave}
          icon={Clock}
          color="from-blue-500 to-blue-600"
          bgColor="bg-blue-50"
        />
      </motion.div>

      {/* Filters and View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">Leave</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.success('Exporting attendance data...')}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-5 h-5" />
            </motion.button>

            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={`p-2 ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`p-2 ${
                  view === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : view === 'list' ? (
        <AttendanceList
          data={attendanceData}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
        />
      ) : (
        <CalendarView data={attendanceData} getStatusColor={getStatusColor} />
      )}

      {/* Mark Attendance Modal */}
      <AnimatePresence>
        {showMarkModal && (
          <MarkAttendanceModal
            employees={employees}
            selectedDate={selectedDate}
            onClose={() => setShowMarkModal(false)}
            onSuccess={() => {
              setShowMarkModal(false);
              fetchAttendance();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`${bgColor} rounded-xl p-4 border border-gray-100 shadow-lg`}
  >
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-8 h-8 text-gray-600" />
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-600">{title}</p>
  </motion.div>
);

// Attendance List Component
const AttendanceList = ({ data, getStatusIcon, getStatusColor }) => {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-12 text-center"
      >
        <CalendarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No attendance records</h3>
        <p className="text-gray-600">Mark attendance to see records here</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Employee
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Employee ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Check In
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Check Out
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Working Hours
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((record, index) => (
              <motion.tr
                key={record._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {record.employee?.fullName?.charAt(0).toUpperCase() || 'E'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {record.employee?.fullName || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">{record.employee?.designation}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{record.employee?.employeeId}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(record.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {record.checkInTime
                    ? new Date(record.checkInTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {record.checkOutTime
                    ? new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {record.workingHours ? `${record.workingHours.toFixed(1)}h` : '-'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// Calendar View Component (Simplified)
const CalendarView = ({ data, getStatusColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
  >
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((record, index) => (
        <motion.div
          key={record._id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className={`p-4 rounded-lg border-2 ${getStatusColor(record.status)}`}
        >
          <p className="font-semibold text-gray-800 mb-1">{record.employee?.fullName}</p>
          <p className="text-sm text-gray-600 mb-2">{record.employee?.employeeId}</p>
          <span className="text-xs font-medium">{record.status}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Mark Attendance Modal Component
const MarkAttendanceModal = ({ employees, selectedDate, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee: '',
    date: selectedDate,
    status: 'Present',
    checkInTime: '',
    checkOutTime: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date with times if provided
      const attendanceData = {
        employee: formData.employee,
        date: formData.date,
        status: formData.status,
        remarks: formData.remarks || undefined
      };

      // Add check-in time if provided
      if (formData.checkInTime) {
        const [hours, minutes] = formData.checkInTime.split(':');
        const checkInDate = new Date(formData.date);
        checkInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        attendanceData.checkInTime = checkInDate.toISOString();
      }

      // Add check-out time if provided
      if (formData.checkOutTime) {
        const [hours, minutes] = formData.checkOutTime.split(':');
        const checkOutDate = new Date(formData.date);
        checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        attendanceData.checkOutTime = checkOutDate.toISOString();
      }

      console.log('Submitting attendance:', attendanceData);
      await apiService.attendance.mark(attendanceData);
      toast.success('Attendance marked successfully');
      onSuccess();
    } catch (error) {
      console.error('Attendance error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mark Attendance</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
            <select
              value={formData.employee}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
              <input
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check Out</label>
              <input
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Optional remarks..."
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Marking...' : 'Mark Attendance'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Attendance;
