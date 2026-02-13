import { format, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr);
  } catch (error) {
    return '';
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-IN').format(number || 0);
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
};

export const validateAadhaar = (aadhaar) => {
  const re = /^\d{12}$/;
  return re.test(aadhaar);
};

export const validatePAN = (pan) => {
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan);
};

export const getStatusColor = (status) => {
  const colors = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
    Terminated: 'bg-red-100 text-red-800',
    Resigned: 'bg-yellow-100 text-yellow-800',
    Present: 'bg-green-100 text-green-800',
    Absent: 'bg-red-100 text-red-800',
    'Half Day': 'bg-yellow-100 text-yellow-800',
    Leave: 'bg-blue-100 text-blue-800',
    Holiday: 'bg-purple-100 text-purple-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Processing: 'bg-blue-100 text-blue-800',
    Paid: 'bg-green-100 text-green-800',
    Hold: 'bg-red-100 text-red-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const downloadCSV = (data, filename) => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const convertToCSV = (data) => {
  if (!data || !data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};
