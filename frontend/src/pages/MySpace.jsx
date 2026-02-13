import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/helpers';

const MySpace = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMyData();
  }, [activeTab]);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      // Get employee ID from user (string like "NM889399454")
      const employeeId = user.employeeId;
      // Get employee MongoDB _id for queries that need ObjectId
      const employeeObjectId = typeof user.employee === 'object' ? user.employee._id : user.employee;
      
      if (activeTab === 'profile') {
        const response = await apiService.employee.getById(employeeObjectId);
        setProfile(response.data.data || response.data);
      } else if (activeTab === 'attendance') {
        const response = await apiService.attendance.getAll({ employee: employeeObjectId });
        setAttendance(response.data.data || []);
      } else if (activeTab === 'salary') {
        const response = await apiService.salary.getAll({ employee: employeeObjectId });
        setSalaries(response.data.data || []);
      } else if (activeTab === 'documents') {
        // Documents controller expects employeeId string, not ObjectId
        const response = await apiService.document.getEmployeeDocuments(employeeId);
        const docData = response.data.data || {};
        // Ensure documents is always an array
        const docs = Array.isArray(docData.documents) ? docData.documents : [];
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      // Reset to empty array on error to prevent rendering issues
      if (activeTab === 'documents') {
        setDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'salary', label: 'My Salary', icon: DollarSign },
    { id: 'documents', label: 'My Documents', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Space</h1>
          <p className="text-gray-600">Your personal employee portal</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-2 border border-gray-100"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center space-x-2 p-4 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'}`}
                />
                <span
                  className={`font-medium ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && <ProfileTab profile={profile} />}
          {activeTab === 'attendance' && <AttendanceTab attendance={attendance} />}
          {activeTab === 'salary' && <SalaryTab salaries={salaries} />}
          {activeTab === 'documents' && <DocumentsTab documents={documents} />}
        </motion.div>
      )}
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ profile }) => {
  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border-4 border-white/30">
            <span className="text-4xl font-bold">
              {profile.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">{profile.fullName}</h2>
            <p className="text-blue-100 text-lg">{profile.designation}</p>
            <p className="text-blue-100">{profile.department} Department</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <User className="w-6 h-6 mr-2 text-blue-600" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem icon={User} label="Employee ID" value={profile.employeeId} />
          <InfoItem icon={Mail} label="Email" value={profile.email} />
          <InfoItem icon={Phone} label="Phone" value={profile.phone} />
          <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
          <InfoItem icon={User} label="Gender" value={profile.gender} />
          <InfoItem icon={MapPin} label="Address" value={profile.address} />
        </div>
      </div>

      {/* Job Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
          Job Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem icon={Briefcase} label="Department" value={profile.department} />
          <InfoItem icon={Briefcase} label="Designation" value={profile.designation} />
          <InfoItem icon={Calendar} label="Join Date" value={formatDate(profile.joiningDate)} />
          <InfoItem icon={User} label="Employment Type" value={profile.employmentType} />
          <InfoItem
            icon={CheckCircle}
            label="Status"
            value={
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  profile.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {profile.status}
              </span>
            }
          />
        </div>
      </div>

      {/* Salary Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
          Salary Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem icon={DollarSign} label="Basic Salary" value={formatCurrency(profile.basicSalary)} />
          <InfoItem icon={DollarSign} label="HRA" value={formatCurrency(profile.hra)} />
          <InfoItem icon={DollarSign} label="Other Allowances" value={formatCurrency(profile.otherAllowances)} />
          <InfoItem icon={DollarSign} label="Gross Salary" value={formatCurrency(profile.grossSalary)} />
        </div>
      </div>

      {/* Emergency Contact */}
      {profile.emergencyContact && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem icon={User} label="Name" value={profile.emergencyContact.name} />
            <InfoItem icon={User} label="Relationship" value={profile.emergencyContact.relationship} />
            <InfoItem icon={Phone} label="Phone" value={profile.emergencyContact.phone} />
          </div>
        </div>
      )}
    </div>
  );
};

// Attendance Tab Component
const AttendanceTab = ({ attendance }) => {
  const stats = {
    total: attendance.length,
    present: attendance.filter((a) => a.status === 'Present').length,
    absent: attendance.filter((a) => a.status === 'Absent').length,
    halfDay: attendance.filter((a) => a.status === 'Half-day').length,
    leave: attendance.filter((a) => a.status === 'Leave').length,
  };

  const attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Days" value={stats.total} color="bg-blue-500" />
        <StatCard title="Present" value={stats.present} color="bg-green-500" />
        <StatCard title="Absent" value={stats.absent} color="bg-red-500" />
        <StatCard title="Half Day" value={stats.halfDay} color="bg-yellow-500" />
        <StatCard title="Leave" value={stats.leave} color="bg-purple-500" />
      </div>

      {/* Attendance Rate */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mb-2">Attendance Rate</p>
            <p className="text-4xl font-bold text-gray-800">{attendanceRate}%</p>
          </div>
          <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Attendance History</h3>
        </div>
        {attendance.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No attendance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Check In</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Check Out</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Working Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.map((record, index) => (
                  <motion.tr
                    key={record._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-gray-700">{formatDate(record.date)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-700'
                            : record.status === 'Absent'
                            ? 'bg-red-100 text-red-700'
                            : record.status === 'Half-day'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{record.checkIn || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{record.checkOut || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{record.workingHours || '-'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Salary Tab Component
const SalaryTab = ({ salaries }) => {
  const totalPaid = salaries
    .filter((s) => s.paymentStatus === 'Paid')
    .reduce((sum, s) => sum + (s.netSalary || 0), 0);
  const totalPending = salaries
    .filter((s) => s.paymentStatus === 'Pending')
    .reduce((sum, s) => sum + (s.netSalary || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Earned"
          value={formatCurrency(totalPaid + totalPending)}
          color="bg-blue-500"
        />
        <StatCard title="Paid" value={formatCurrency(totalPaid)} color="bg-green-500" />
        <StatCard title="Pending" value={formatCurrency(totalPending)} color="bg-yellow-500" />
      </div>

      {/* Salary Records */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Salary History</h3>
        </div>
        {salaries.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No salary records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Period</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Basic</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Additions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Deductions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Net Salary</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salaries.map((salary, index) => (
                  <motion.tr
                    key={salary._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-gray-700">
                      {salary.month}/{salary.year}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatCurrency(salary.basicSalary)}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium">
                      +{formatCurrency(salary.totalAdditions || 0)}
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      -{formatCurrency(salary.totalDeductions || 0)}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {formatCurrency(salary.netSalary)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          salary.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {salary.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Documents Tab Component
const DocumentsTab = ({ documents }) => {
  // Ensure documents is always an array
  const documentList = Array.isArray(documents) ? documents : [];
  
  return (
    <div className="space-y-6">
      {documentList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No documents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentList.map((doc, index) => (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-12 h-12 text-blue-600" />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    doc.status === 'Verified'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {doc.status || 'Pending'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">{doc.name || 'Document'}</h4>
              <p className="text-sm text-gray-600 mb-4">
                Uploaded: {formatDate(doc.uploadedAt || doc.createdAt)}
              </p>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">View</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Download</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Info Item Component
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <div className="p-2 bg-blue-50 rounded-lg">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value || 'N/A'}</p>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
  >
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
      <span className="text-white text-xl font-bold">{typeof value === 'number' && value}</span>
    </div>
    <p className="text-sm text-gray-600 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </motion.div>
);

export default MySpace;
