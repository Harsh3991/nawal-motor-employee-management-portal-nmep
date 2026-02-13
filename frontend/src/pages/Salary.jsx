import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/helpers';

const Salary = () => {
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [componentType, setComponentType] = useState(''); // 'incentive', 'deduction', 'advance'
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: '',
  });

  useEffect(() => {
    fetchSalaryRecords();
    fetchEmployees();
  }, [filters]);

  const fetchSalaryRecords = async () => {
    setLoading(true);
    try {
      const response = await apiService.salary.getAll(filters);
      const data = response.data.data || [];
      setSalaryRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching salary records:', error);
      toast.error('Failed to fetch salary records');
      setSalaryRecords([]);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Processing':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const stats = {
    total: salaryRecords.reduce((sum, record) => sum + (record.netSalary || 0), 0),
    paid: salaryRecords
      .filter((r) => r.paymentStatus === 'Paid')
      .reduce((sum, record) => sum + (record.netSalary || 0), 0),
    pending: salaryRecords
      .filter((r) => r.paymentStatus === 'Pending')
      .reduce((sum, record) => sum + (record.netSalary || 0), 0),
    count: salaryRecords.length,
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Salary Management</h1>
          <p className="text-gray-600">Manage employee salaries and payments</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Generate Salary</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
      >
        <StatsCard
          title="Total Salary"
          value={formatCurrency(stats.total)}
          icon={DollarSign}
          color="from-blue-500 to-blue-600"
          bgColor="bg-blue-50"
        />
        <StatsCard
          title="Paid"
          value={formatCurrency(stats.paid)}
          icon={CheckCircle}
          color="from-green-500 to-green-600"
          bgColor="bg-green-50"
        />
        <StatsCard
          title="Pending"
          value={formatCurrency(stats.pending)}
          icon={Clock}
          color="from-yellow-500 to-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatsCard
          title="Employees"
          value={stats.count}
          icon={DollarSign}
          color="from-purple-500 to-purple-600"
          bgColor="bg-purple-50"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            icon={TrendingUp}
            label="Add Incentive"
            color="text-green-600"
            onClick={() => {
              setComponentType('incentive');
              setShowComponentModal(true);
            }}
          />
          <QuickActionButton
            icon={TrendingDown}
            label="Add Deduction"
            color="text-red-600"
            onClick={() => {
              setComponentType('deduction');
              setShowComponentModal(true);
            }}
          />
          <QuickActionButton
            icon={DollarSign}
            label="Add Advance"
            color="text-blue-600"
            onClick={() => {
              setComponentType('advance');
              setShowComponentModal(true);
            }}
          />
          <QuickActionButton
            icon={Download}
            label="Export"
            color="text-purple-600"
            onClick={() => toast.success('Exporting salary data...')}
          />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Salary Records Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : salaryRecords.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-12 text-center"
        >
          <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No salary records</h3>
          <p className="text-gray-600 mb-6">Generate salaries to see records here</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerateModal(true)}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg"
          >
            Generate Salary
          </motion.button>
        </motion.div>
      ) : (
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
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Basic Salary
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Additions
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Deductions
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Net Salary
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salaryRecords.map((record, index) => (
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
                          <p className="text-sm text-gray-500">{record.employee?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {monthNames[record.month - 1]} {record.year}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatCurrency(record.basicSalary)}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium">
                      +{formatCurrency(record.totalAdditions || 0)}
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      -{formatCurrency(record.totalDeductions || 0)}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.paymentStatus)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            record.paymentStatus
                          )}`}
                        >
                          {record.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showGenerateModal && (
          <GenerateSalaryModal
            employees={employees}
            onClose={() => setShowGenerateModal(false)}
            onSuccess={() => {
              setShowGenerateModal(false);
              fetchSalaryRecords();
            }}
          />
        )}
        {showComponentModal && (
          <AddComponentModal
            type={componentType}
            employees={employees}
            onClose={() => setShowComponentModal(false)}
            onSuccess={() => {
              setShowComponentModal(false);
              fetchSalaryRecords();
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
    className={`${bgColor} rounded-xl p-6 border border-gray-100 shadow-lg`}
  >
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-8 h-8 text-gray-600" />
    </div>
    <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
    <p className="text-sm text-gray-600">{title}</p>
  </motion.div>
);

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-all"
  >
    <Icon className={`w-8 h-8 ${color} mb-2`} />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </motion.button>
);

// Generate Salary Modal
const GenerateSalaryModal = ({ employees, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.salary.generate(formData);
      toast.success('Salary generated successfully');
      onSuccess();
    } catch (error) {
      console.error('Salary generation error:', error.response?.data);
      const errorData = error.response?.data;
      
      if (errorData?.missingFields && errorData.missingFields.length > 0) {
        toast.error(`Profile incomplete! Missing: ${errorData.missingFields.join(', ')}`, {
          duration: 5000
        });
      } else {
        toast.error(errorData?.message || 'Failed to generate salary');
      }
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Salary</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.fullName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate'}
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

// Add Component Modal (Incentive/Deduction/Advance)
const AddComponentModal = ({ type, employees, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee: '',
    amount: '',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'incentive') {
        await apiService.salary.addIncentive(formData);
      } else if (type === 'deduction') {
        await apiService.salary.addDeduction(formData);
      } else {
        await apiService.salary.addAdvance(formData);
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to add ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    incentive: 'Add Incentive',
    deduction: 'Add Deduction',
    advance: 'Add Advance',
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{titles[type]}</h2>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter amount"
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter reason..."
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
              {loading ? 'Adding...' : 'Add'}
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

export default Salary;
