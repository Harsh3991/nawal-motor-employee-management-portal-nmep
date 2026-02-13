import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  FileText,
  Edit,
  Save,
  X,
  Trash2,
  User,
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { formatDate, formatCurrency } from '../utils/helpers';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(searchParams.get('edit') === 'true');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response = await apiService.employee.getById(id);
      const employeeData = response.data.data || response.data;
      setEmployee(employeeData);
      setFormData(employeeData);
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to fetch employee details');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.employee.update(id, formData);
      toast.success('Employee updated successfully');
      setEmployee(formData);
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await apiService.employee.delete(id);
      toast.success('Employee deleted successfully');
      navigate('/employees');
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
      case 'terminated':
      case 'resigned':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Employee not found</h2>
          <button
            onClick={() => navigate('/employees')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Employees
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-3xl">
                {employee.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{employee.fullName}</h1>
              <p className="text-gray-600">
                {employee.designation} • {employee.employeeId}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                employee.status
              )}`}
            >
              {employee.status}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {editMode ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditMode(false);
                    setFormData(employee);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                label="Email"
                value={employee.email}
                icon={Mail}
                editMode={editMode}
                name="email"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Phone"
                value={employee.phone}
                icon={Phone}
                editMode={editMode}
                name="phone"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Date of Birth"
                value={formatDate(employee.dateOfBirth)}
                icon={Calendar}
                editMode={editMode}
                name="dateOfBirth"
                type="date"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Gender"
                value={employee.gender}
                editMode={editMode}
                name="gender"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Marital Status"
                value={employee.maritalStatus}
                editMode={editMode}
                name="maritalStatus"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Location"
                value={employee.location}
                icon={MapPin}
                editMode={editMode}
                name="location"
                formData={formData}
                onChange={handleInputChange}
              />
            </div>
          </motion.div>

          {/* Job Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Job Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                label="Employee ID"
                value={employee.employeeId}
                editMode={false}
              />
              <InfoField
                label="Department"
                value={employee.department}
                editMode={editMode}
                name="department"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Designation"
                value={employee.designation}
                editMode={editMode}
                name="designation"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Joining Date"
                value={formatDate(employee.joiningDate)}
                icon={Calendar}
                editMode={editMode}
                name="joiningDate"
                type="date"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Employment Type"
                value={employee.employmentType}
                editMode={editMode}
                name="employmentType"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Work Location"
                value={employee.workLocation}
                editMode={editMode}
                name="workLocation"
                formData={formData}
                onChange={handleInputChange}
              />
            </div>
          </motion.div>

          {/* Salary Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Salary Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                label="Basic Salary"
                value={formatCurrency(employee.basicSalary)}
                editMode={editMode}
                name="basicSalary"
                type="number"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="HRA"
                value={formatCurrency(employee.hra)}
                editMode={editMode}
                name="hra"
                type="number"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Other Allowances"
                value={formatCurrency(employee.otherAllowances)}
                editMode={editMode}
                name="otherAllowances"
                type="number"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="PF Number"
                value={employee.pfNumber}
                editMode={editMode}
                name="pfNumber"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="ESI Number"
                value={employee.esiNumber}
                editMode={editMode}
                name="esiNumber"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="UAN Number"
                value={employee.uanNumber}
                editMode={editMode}
                name="uanNumber"
                formData={formData}
                onChange={handleInputChange}
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Documents
            </h2>
            <div className="space-y-3">
              <InfoField
                label="Aadhaar Number"
                value={employee.aadhaarNumber || 'Not provided'}
                editMode={editMode}
                name="aadhaarNumber"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="PAN Number"
                value={employee.panNumber || 'Not provided'}
                editMode={editMode}
                name="panNumber"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Bank Name"
                value={employee.bankName || 'Not provided'}
                editMode={editMode}
                name="bankName"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Account Number"
                value={employee.accountNumber || 'Not provided'}
                editMode={editMode}
                name="accountNumber"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="IFSC Code"
                value={employee.ifscCode || 'Not provided'}
                editMode={editMode}
                name="ifscCode"
                formData={formData}
                onChange={handleInputChange}
              />
            </div>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Emergency Contact</h2>
            <div className="space-y-3">
              <InfoField
                label="Contact Name"
                value={employee.emergencyContact || 'Not provided'}
                editMode={editMode}
                name="emergencyContact"
                formData={formData}
                onChange={handleInputChange}
              />
              <InfoField
                label="Contact Phone"
                value={employee.emergencyPhone || 'Not provided'}
                editMode={editMode}
                name="emergencyPhone"
                formData={formData}
                onChange={handleInputChange}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying/editing fields
const InfoField = ({ label, value, icon: Icon, editMode, name, type = 'text', formData, onChange }) => {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      {editMode && name ? (
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
        />
      ) : (
        <div className="flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
          <p className="text-gray-800 font-medium">{value || 'N/A'}</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
