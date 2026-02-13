import { motion } from 'framer-motion';
import { Mail, Phone, Briefcase, MapPin, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeCard = ({ employee }) => {
  const navigate = useNavigate();

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {employee.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{employee.fullName}</h3>
            <p className="text-sm text-gray-500">{employee.employeeId}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(employee.status)}`}>
          {employee.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          <span>{employee.designation} • {employee.department}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          <span>{employee.phone}</span>
        </div>
        {employee.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="truncate">{employee.location}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/employees/${employee._id}`)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span className="font-medium">View</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/employees/${employee._id}?edit=true`)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span className="font-medium">Edit</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;
