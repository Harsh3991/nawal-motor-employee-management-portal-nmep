import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  DollarSign,
  FileText,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader,
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { DEPARTMENTS, DESIGNATIONS } from '../utils/constants';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Step 2: Job Details
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: 'full-time',
    workLocation: '',
    reportingTo: '',
    
    // Step 3: Salary & Benefits
    salaryType: 'Monthly',
    basicSalary: '',
    hra: '',
    otherAllowances: '',
    pfApplicable: true,
    esiApplicable: true,
    pfNumber: '',
    esiNumber: '',
    uanNumber: '',
    
    // Step 4: Documents
    aadhaarNumber: '',
    panNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Job Details', icon: Briefcase },
    { number: 3, title: 'Salary', icon: DollarSign },
    { number: 4, title: 'Documents', icon: FileText },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone) {
          toast.error('Please fill all required fields');
          return false;
        }
        // Validate phone number
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          toast.error('Phone number must be at least 10 digits');
          return false;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        break;
      case 2:
        if (!formData.department || !formData.designation || !formData.joiningDate) {
          toast.error('Please fill all required fields');
          return false;
        }
        break;
      case 3:
        if (!formData.basicSalary) {
          toast.error('Please enter basic salary');
          return false;
        }
        if (parseFloat(formData.basicSalary) <= 0) {
          toast.error('Basic salary must be greater than 0');
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      // Transform flat data to nested structure expected by backend
      const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;
      
      // Sanitize phone number (remove non-digits, ensure 10 digits)
      const sanitizePhone = (phone) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, ''); // Remove all non-digits
        // If it starts with country code (91), remove it
        if (digits.length === 12 && digits.startsWith('91')) {
          return digits.slice(2);
        }
        // If it has +91 prefix, it's already removed by replace
        return digits.slice(-10); // Take last 10 digits
      };
      
      const transformedData = {
        selfDetails: {
          firstName,
          lastName,
          email: formData.email,
          phone: sanitizePhone(formData.phone),
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : undefined,
          aadhaarNumber: formData.aadhaarNumber || undefined,
          panNumber: formData.panNumber || undefined,
          alternatePhone: formData.emergencyPhone ? sanitizePhone(formData.emergencyPhone) : undefined,
          currentAddress: formData.address ? {
            line1: formData.address,
            city: formData.city || undefined,
            state: formData.state || undefined,
          } : undefined,
          bankDetails: {
            accountNumber: formData.accountNumber || undefined,
            ifscCode: formData.ifscCode || undefined,
            bankName: formData.bankName || undefined,
          }
        },
        familyDetails: {
          maritalStatus: formData.maritalStatus ? formData.maritalStatus.charAt(0).toUpperCase() + formData.maritalStatus.slice(1) : undefined,
        },
        jobDetails: {
          department: formData.department,
          designation: formData.designation,
          dateOfJoining: formData.joiningDate,
          employmentType: formData.employmentType === 'full-time' ? 'Permanent' : 
                         formData.employmentType === 'contract' ? 'Contract' : 
                         'Temporary',
          salaryType: formData.salaryType,
          basicSalary: parseFloat(formData.basicSalary),
          hra: formData.hra ? parseFloat(formData.hra) : undefined,
          otherAllowances: formData.otherAllowances ? parseFloat(formData.otherAllowances) : undefined,
          pfNumber: formData.pfNumber || undefined,
          esiNumber: formData.esiNumber || undefined,
          uanNumber: formData.uanNumber || undefined,
        }
      };

      console.log('Submitting employee data:', transformedData);
      await apiService.employee.create(transformedData);
      toast.success('Employee added successfully!');
      navigate('/employees');
    } catch (error) {
      console.error('Error adding employee:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} handleChange={handleInputChange} />;
      case 2:
        return <JobDetailsStep formData={formData} handleChange={handleInputChange} />;
      case 3:
        return <SalaryStep formData={formData} handleChange={handleInputChange} />;
      case 4:
        return <DocumentsStep formData={formData} handleChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Employees
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Employee</h1>
        <p className="text-gray-600">Complete all steps to add employee</p>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100"
      >
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </motion.div>
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-gray-800' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Form Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Previous</span>
          </motion.button>

          {currentStep < 4 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <span className="font-medium">Next</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Adding...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Add Employee</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Step Components
const PersonalInfoStep = ({ formData, handleChange }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter 10-digit mobile number"
          maxLength={15}
        />
        <p className="text-xs text-gray-500 mt-1">Format: 9876543210 or 98765-43210</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
        <select
          name="maritalStatus"
          value={formData.maritalStatus}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">Select status</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter city"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter state"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
        <input
          type="text"
          name="emergencyContact"
          value={formData.emergencyContact}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Contact name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
        <input
          type="tel"
          name="emergencyPhone"
          value={formData.emergencyPhone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Contact phone"
        />
      </div>
    </div>
  </div>
);

const JobDetailsStep = ({ formData, handleChange }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Job Details</h2>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <p className="text-sm text-blue-800">
        <strong>Note:</strong> Employee ID will be auto-generated after submission.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">Select department</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Designation <span className="text-red-500">*</span>
        </label>
        <select
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">Select designation</option>
          {DESIGNATIONS.map((des) => (
            <option key={des} value={des}>
              {des}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Joining Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
        <select
          name="employmentType"
          value={formData.employmentType}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Work Location</label>
        <input
          type="text"
          name="workLocation"
          value={formData.workLocation}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="e.g., Nagpur"
        />
      </div>
    </div>
  </div>
);

const SalaryStep = ({ formData, handleChange }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Salary & Benefits</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Salary Type <span className="text-red-500">*</span>
        </label>
        <select
          name="salaryType"
          value={formData.salaryType}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="Monthly">Monthly</option>
          <option value="Daily">Daily</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Basic Salary <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="basicSalary"
          value={formData.basicSalary}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter basic salary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">HRA</label>
        <input
          type="number"
          name="hra"
          value={formData.hra}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter HRA"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Other Allowances</label>
        <input
          type="number"
          name="otherAllowances"
          value={formData.otherAllowances}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter other allowances"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">PF Number</label>
        <input
          type="text"
          name="pfNumber"
          value={formData.pfNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter PF number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ESI Number</label>
        <input
          type="text"
          name="esiNumber"
          value={formData.esiNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter ESI number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">UAN Number</label>
        <input
          type="text"
          name="uanNumber"
          value={formData.uanNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter UAN number"
        />
      </div>

      <div className="md:col-span-2 space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="pfApplicable"
            checked={formData.pfApplicable}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">PF Applicable</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="esiApplicable"
            checked={formData.esiApplicable}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">ESI Applicable</span>
        </label>
      </div>
    </div>
  </div>
);

const DocumentsStep = ({ formData, handleChange }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Documents & Bank Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
        <input
          type="text"
          name="aadhaarNumber"
          value={formData.aadhaarNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter Aadhaar number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
        <input
          type="text"
          name="panNumber"
          value={formData.panNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter PAN number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter bank name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter account number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
        <input
          type="text"
          name="ifscCode"
          value={formData.ifscCode}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter IFSC code"
        />
      </div>
    </div>

    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800">
        <strong>Note:</strong> After adding the employee, you can upload documents (Aadhaar, PAN, etc.) from the employee details page.
      </p>
    </div>
  </div>
);

export default AddEmployee;
