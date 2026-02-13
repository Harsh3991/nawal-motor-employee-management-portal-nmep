import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(error.response.data.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }
    return Promise.reject(error);
  }
);

export default api;

// API Service methods
const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.put(`/auth/reset-password/${data.token}`, { password: data.password }),
};

const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  search: (query) => api.get(`/employees/search?q=${query}`),
  getStats: () => api.get('/employees/stats'),
  getIncomplete: () => api.get('/employees/incomplete'),
  uploadDocuments: (id, formData) => api.post(`/employees/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

const attendanceService = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  markBulk: (data) => api.post('/attendance/bulk', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getSummary: (employeeId, params) => api.get(`/attendance/summary/${employeeId}`, { params }),
};

const salaryService = {
  getAll: (params) => api.get('/salary', { params }),
  getById: (id) => api.get(`/salary/${id}`),
  generate: (data) => api.post('/salary/generate', data),
  updateStatus: (id, data) => api.put(`/salary/${id}/status`, data),
  addIncentive: (data) => api.post('/salary/incentive', data),
  addDeduction: (data) => api.post('/salary/deduction', data),
  addAdvance: (data) => api.post('/salary/advance', data),
  addIncrement: (data) => api.post('/salary/increment', data),
};

const dashboardService = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getMonthlySummary: (params) => api.get('/dashboard/monthly-summary', { params }),
  getDepartmentSummary: () => api.get('/dashboard/department-summary'),
  getAttendanceTrend: (params) => api.get('/dashboard/attendance-trend', { params }),
  getTasks: () => api.get('/dashboard/tasks'),
};

const reportService = {
  getReport: (type, params) => {
    const reportMap = {
      salary: '/reports/salary',
      attendance: '/reports/attendance',
      pfesi: '/reports/pf-esi',
      incentive: '/reports/incentives',
      increment: '/reports/increments',
      advance: '/reports/advances',
      deduction: '/reports/deductions',
      employee: '/reports/employees',
    };
    return api.get(reportMap[type] || '/reports/salary', { params });
  },
  getSalaryReport: (params) => api.get('/reports/salary', { params }),
  getAttendanceReport: (params) => api.get('/reports/attendance', { params }),
  getPFESIReport: (params) => api.get('/reports/pf-esi', { params }),
  getIncentiveReport: (params) => api.get('/reports/incentives', { params }),
  getIncrementReport: (params) => api.get('/reports/increments', { params }),
  getAdvanceReport: (params) => api.get('/reports/advances', { params }),
  getDeductionReport: (params) => api.get('/reports/deductions', { params }),
  getEmployeeReport: (params) => api.get('/reports/employees', { params }),
};

const documentService = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (formData) => api.post('/documents/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getEmployeeDocuments: (employeeId) => api.get(`/documents/${employeeId}`),
  delete: (employeeId, documentType) => api.delete(`/documents/${employeeId}/${documentType}`),
  getPendingVerification: () => api.get('/documents/pending-verification'),
};

// Combined API service export
export const apiService = {
  auth: authService,
  employee: employeeService,
  attendance: attendanceService,
  salary: salaryService,
  dashboard: dashboardService,
  report: reportService,
  document: documentService,
};
