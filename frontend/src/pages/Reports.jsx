import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/helpers';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('salary');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department: '',
    status: '',
  });

  const reportTypes = [
    { id: 'salary', label: 'Salary Report', icon: DollarSign, color: 'text-blue-600' },
    { id: 'attendance', label: 'Attendance Report', icon: Clock, color: 'text-green-600' },
    { id: 'pfesi', label: 'PF/ESI Report', icon: FileText, color: 'text-purple-600' },
    { id: 'incentive', label: 'Incentive Report', icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'increment', label: 'Increment Report', icon: BarChart3, color: 'text-orange-600' },
    { id: 'advance', label: 'Advance Report', icon: AlertCircle, color: 'text-red-600' },
    { id: 'deduction', label: 'Deduction Report', icon: TrendingUp, color: 'text-yellow-600' },
    { id: 'employee', label: 'Employee Report', icon: Users, color: 'text-indigo-600' },
  ];

  useEffect(() => {
    fetchReportData();
  }, [activeTab, filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Different reports need different parameters
      let params = {};
      
      if (activeTab === 'salary') {
        // Salary report needs month and year
        params = {
          month: filters.month,
          year: filters.year,
          department: filters.department,
          paymentStatus: filters.status,
        };
      } else if (activeTab === 'attendance') {
        // Attendance report needs startDate and endDate
        params = {
          startDate: filters.startDate,
          endDate: filters.endDate,
          department: filters.department,
        };
      } else if (activeTab === 'pfesi') {
        // PF/ESI report needs month and year
        params = {
          month: filters.month,
          year: filters.year,
          department: filters.department,
        };
      } else if (activeTab === 'incentive' || activeTab === 'deduction') {
        // These reports can use month/year (optional)
        params = {
          month: filters.month,
          year: filters.year,
          department: filters.department,
          status: filters.status,
        };
      } else if (activeTab === 'increment') {
        // Increment report uses year (optional)
        params = {
          year: filters.year,
          department: filters.department,
        };
      } else if (activeTab === 'advance') {
        // Advance report doesn't require date params
        params = {
          status: filters.status,
          department: filters.department,
        };
      } else if (activeTab === 'employee') {
        // Employee report needs status and department
        params = {
          status: filters.status || 'Active',
          department: filters.department,
        };
      }
      
      const response = await apiService.report.getReport(activeTab, params);
      setReportData(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to fetch report data');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Exporting report...');
    // Export logic would go here
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports for your organization</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">Export CSV</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Printer className="w-4 h-4" />
            <span className="font-medium">Print</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Report Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-2 border border-gray-100"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(type.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                  activeTab === type.id
                    ? 'bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <Icon
                  className={`w-6 h-6 mb-1 ${
                    activeTab === type.id ? 'text-blue-600' : type.color
                  }`}
                />
                <span
                  className={`text-xs font-medium text-center ${
                    activeTab === type.id ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {type.label.replace(' Report', '')}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Show month/year for salary, PF/ESI, incentive, deduction, and increment reports */}
          {(activeTab === 'salary' || activeTab === 'pfesi' || activeTab === 'incentive' || activeTab === 'deduction' || activeTab === 'increment') ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
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
            </>
          ) : activeTab === 'attendance' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="Accounts">Accounts</option>
              <option value="Operations">Operations</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              {activeTab === 'employee' && (
                <>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </>
              )}
              {(activeTab === 'salary' || activeTab === 'advance') && (
                <>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </>
              )}
              {(activeTab === 'incentive' || activeTab === 'deduction') && (
                <>
                  <option value="Active">Active</option>
                  <option value="Processed">Processed</option>
                </>
              )}
              {activeTab === 'advance' && (
                <>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </>
              )}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Report Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-96"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'salary' && <SalaryReport data={reportData} />}
            {activeTab === 'attendance' && <AttendanceReport data={reportData} />}
            {activeTab === 'pfesi' && <PFESIReport data={reportData} />}
            {activeTab === 'incentive' && <IncentiveReport data={reportData} />}
            {activeTab === 'increment' && <IncrementReport data={reportData} />}
            {activeTab === 'advance' && <AdvanceReport data={reportData} />}
            {activeTab === 'deduction' && <DeductionReport data={reportData} />}
            {activeTab === 'employee' && <EmployeeReport data={reportData} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Salary Report Component
const SalaryReport = ({ data }) => {
  const chartData = data?.chartData || [
    { month: 'Jan', total: 450000, paid: 440000, pending: 10000 },
    { month: 'Feb', total: 460000, paid: 460000, pending: 0 },
    { month: 'Mar', total: 470000, paid: 450000, pending: 20000 },
    { month: 'Apr', total: 480000, paid: 480000, pending: 0 },
    { month: 'May', total: 490000, paid: 470000, pending: 20000 },
    { month: 'Jun', total: 500000, paid: 500000, pending: 0 },
  ];

  const summary = data?.summary || {
    totalSalary: 2850000,
    totalPaid: 2800000,
    totalPending: 50000,
    employeeCount: 45,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Salary"
          value={formatCurrency(summary.totalSalary)}
          icon={DollarSign}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Total Paid"
          value={formatCurrency(summary.totalPaid)}
          icon={DollarSign}
          color="from-green-500 to-green-600"
        />
        <StatsCard
          title="Total Pending"
          value={formatCurrency(summary.totalPending)}
          icon={Clock}
          color="from-yellow-500 to-yellow-600"
        />
        <StatsCard
          title="Employees"
          value={summary.employeeCount}
          icon={Users}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Salary Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="total" fill="#3B82F6" name="Total Salary" />
            <Bar dataKey="paid" fill="#10B981" name="Paid" />
            <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <DataTable
        title="Detailed Salary Records"
        columns={['Employee', 'Department', 'Basic Salary', 'Additions', 'Deductions', 'Net Salary', 'Status']}
        data={data?.records || []}
      />
    </div>
  );
};

// Attendance Report Component
const AttendanceReport = ({ data }) => {
  const chartData = data?.chartData || [
    { month: 'Jan', present: 900, absent: 50, halfDay: 30, leave: 20 },
    { month: 'Feb', present: 850, absent: 40, halfDay: 25, leave: 35 },
    { month: 'Mar', present: 920, absent: 30, halfDay: 35, leave: 15 },
    { month: 'Apr', present: 880, absent: 45, halfDay: 40, leave: 35 },
    { month: 'May', present: 910, absent: 35, halfDay: 30, leave: 25 },
    { month: 'Jun', present: 895, absent: 42, halfDay: 38, leave: 25 },
  ];

  const summary = data?.summary || {
    totalPresent: 5355,
    totalAbsent: 242,
    totalHalfDay: 198,
    totalLeave: 155,
    attendanceRate: 92.5,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatsCard
          title="Present"
          value={summary.totalPresent}
          icon={Clock}
          color="from-green-500 to-green-600"
        />
        <StatsCard
          title="Absent"
          value={summary.totalAbsent}
          icon={AlertCircle}
          color="from-red-500 to-red-600"
        />
        <StatsCard
          title="Half Day"
          value={summary.totalHalfDay}
          icon={Clock}
          color="from-yellow-500 to-yellow-600"
        />
        <StatsCard
          title="Leave"
          value={summary.totalLeave}
          icon={Calendar}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Attendance Rate"
          value={`${summary.attendanceRate}%`}
          icon={TrendingUp}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Attendance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} name="Present" />
            <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} name="Absent" />
            <Line type="monotone" dataKey="halfDay" stroke="#F59E0B" strokeWidth={2} name="Half Day" />
            <Line type="monotone" dataKey="leave" stroke="#3B82F6" strokeWidth={2} name="Leave" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <DataTable
        title="Detailed Attendance Records"
        columns={['Employee', 'Present', 'Absent', 'Half Day', 'Leave', 'Attendance %']}
        data={data?.records || []}
      />
    </div>
  );
};

// PF/ESI Report Component
const PFESIReport = ({ data }) => {
  const pieData = data?.pieData || [
    { name: 'PF Employee', value: 120000 },
    { name: 'PF Employer', value: 120000 },
    { name: 'ESI Employee', value: 25000 },
    { name: 'ESI Employer', value: 65000 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const summary = data?.summary || {
    totalPF: 240000,
    totalESI: 90000,
    employeeCount: 45,
    complianceRate: 100,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total PF"
          value={formatCurrency(summary.totalPF)}
          icon={DollarSign}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Total ESI"
          value={formatCurrency(summary.totalESI)}
          icon={DollarSign}
          color="from-green-500 to-green-600"
        />
        <StatsCard
          title="Employees"
          value={summary.employeeCount}
          icon={Users}
          color="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Compliance"
          value={`${summary.complianceRate}%`}
          icon={TrendingUp}
          color="from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">PF/ESI Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <DataTable
        title="Detailed PF/ESI Records"
        columns={['Employee', 'Basic Salary', 'PF Employee', 'PF Employer', 'ESI Employee', 'ESI Employer', 'Total']}
        data={data?.records || []}
      />
    </div>
  );
};

// Incentive Report Component
const IncentiveReport = ({ data }) => {
  const chartData = data?.chartData || [
    { month: 'Jan', amount: 25000, count: 8 },
    { month: 'Feb', amount: 30000, count: 10 },
    { month: 'Mar', amount: 28000, count: 9 },
    { month: 'Apr', amount: 35000, count: 12 },
    { month: 'May', amount: 32000, count: 11 },
    { month: 'Jun', amount: 38000, count: 13 },
  ];

  const summary = data?.summary || {
    totalIncentives: 188000,
    totalEmployees: 63,
    avgIncentive: 2984,
    topPerformer: 'John Doe',
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Incentives"
          value={formatCurrency(summary.totalIncentives)}
          icon={TrendingUp}
          color="from-green-500 to-green-600"
        />
        <StatsCard
          title="Employees Rewarded"
          value={summary.totalEmployees}
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Avg Incentive"
          value={formatCurrency(summary.avgIncentive)}
          icon={DollarSign}
          color="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Top Performer"
          value={summary.topPerformer}
          icon={TrendingUp}
          color="from-emerald-500 to-emerald-600"
          isText
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Incentive Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value, name) => name === 'amount' ? formatCurrency(value) : value} />
            <Legend />
            <Bar yAxisId="left" dataKey="amount" fill="#10B981" name="Total Amount" />
            <Bar yAxisId="right" dataKey="count" fill="#3B82F6" name="Employee Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <DataTable
        title="Detailed Incentive Records"
        columns={['Employee', 'Department', 'Date', 'Reason', 'Amount']}
        data={data?.records || []}
      />
    </div>
  );
};

// Increment Report Component
const IncrementReport = ({ data }) => {
  const chartData = data?.chartData || [
    { month: 'Jan', amount: 45000, count: 5 },
    { month: 'Feb', amount: 0, count: 0 },
    { month: 'Mar', amount: 60000, count: 7 },
    { month: 'Apr', amount: 35000, count: 4 },
    { month: 'May', amount: 0, count: 0 },
    { month: 'Jun', amount: 52000, count: 6 },
  ];

  const summary = data?.summary || {
    totalIncrements: 192000,
    totalEmployees: 22,
    avgIncrement: 8727,
    avgPercentage: 12.5,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Increments"
          value={formatCurrency(summary.totalIncrements)}
          icon={TrendingUp}
          color="from-orange-500 to-orange-600"
        />
        <StatsCard
          title="Employees"
          value={summary.totalEmployees}
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Avg Increment"
          value={formatCurrency(summary.avgIncrement)}
          icon={DollarSign}
          color="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Avg Percentage"
          value={`${summary.avgPercentage}%`}
          icon={BarChart3}
          color="from-green-500 to-green-600"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Increment Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="amount" fill="#F97316" name="Total Increment Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <DataTable
        title="Detailed Increment Records"
        columns={['Employee', 'Department', 'Previous Salary', 'New Salary', 'Increment', 'Percentage', 'Date']}
        data={data?.records || []}
      />
    </div>
  );
};

// Advance Report Component
const AdvanceReport = ({ data }) => {
  const summary = data?.summary || {
    totalAdvances: 350000,
    totalPending: 180000,
    totalRepaid: 170000,
    employeeCount: 18,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Advances"
          value={formatCurrency(summary.totalAdvances)}
          icon={DollarSign}
          color="from-red-500 to-red-600"
        />
        <StatsCard
          title="Pending"
          value={formatCurrency(summary.totalPending)}
          icon={Clock}
          color="from-yellow-500 to-yellow-600"
        />
        <StatsCard
          title="Repaid"
          value={formatCurrency(summary.totalRepaid)}
          icon={TrendingUp}
          color="from-green-500 to-green-600"
        />
        <StatsCard
          title="Employees"
          value={summary.employeeCount}
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
      </div>

      {/* Data Table */}
      <DataTable
        title="Detailed Advance Records"
        columns={['Employee', 'Amount', 'Date', 'Repaid', 'Pending', 'Status']}
        data={data?.records || []}
      />
    </div>
  );
};

// Deduction Report Component
const DeductionReport = ({ data }) => {
  const summary = data?.summary || {
    totalDeductions: 125000,
    employeeCount: 25,
    avgDeduction: 5000,
    mostCommon: 'Late Coming',
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Deductions"
          value={formatCurrency(summary.totalDeductions)}
          icon={TrendingUp}
          color="from-red-500 to-red-600"
        />
        <StatsCard
          title="Employees"
          value={summary.employeeCount}
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Avg Deduction"
          value={formatCurrency(summary.avgDeduction)}
          icon={DollarSign}
          color="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Most Common"
          value={summary.mostCommon}
          icon={AlertCircle}
          color="from-yellow-500 to-yellow-600"
          isText
        />
      </div>

      {/* Data Table */}
      <DataTable
        title="Detailed Deduction Records"
        columns={['Employee', 'Department', 'Type', 'Amount', 'Reason', 'Date']}
        data={data?.records || []}
      />
    </div>
  );
};

// Employee Report Component
const EmployeeReport = ({ data }) => {
  const departmentData = data?.departmentData || [
    { name: 'Sales', value: 15 },
    { name: 'Accounts', value: 8 },
    { name: 'Operations', value: 12 },
    { name: 'HR', value: 5 },
    { name: 'IT', value: 5 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const summary = data?.summary || {
    total: 45,
    active: 42,
    inactive: 3,
    newJoinees: 5,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={summary.total}
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Active"
          value={summary.active}
          icon={TrendingUp}
          color="from-green-500 to-green-600"
        />
        <StatsCard
          title="Inactive"
          value={summary.inactive}
          icon={AlertCircle}
          color="from-red-500 to-red-600"
        />
        <StatsCard
          title="New Joinees"
          value={summary.newJoinees}
          icon={Users}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Department Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={departmentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {departmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <DataTable
        title="Employee Directory"
        columns={['Name', 'Employee ID', 'Department', 'Designation', 'Join Date', 'Status']}
        data={data?.records || []}
      />
    </div>
  );
};

// Reusable Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, isText = false }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
  >
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-8 h-8 text-gray-600" />
    </div>
    <p className={`text-2xl font-bold text-gray-800 mb-1 ${isText ? 'truncate' : ''}`}>{value}</p>
    <p className="text-sm text-gray-600">{title}</p>
  </motion.div>
);

// Reusable Data Table Component
const DataTable = ({ title, columns, data }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
    <div className="p-6">
      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-6 py-4 text-sm text-gray-700">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No data available for this report</p>
        </div>
      )}
    </div>
  </div>
);

export default Reports;
