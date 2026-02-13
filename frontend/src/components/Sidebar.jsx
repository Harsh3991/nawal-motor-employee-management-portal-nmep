import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  DollarSign,
  FileText,
  FolderOpen,
  User,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiService.auth.logout();
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'hr', 'employee'] },
    { icon: Users, label: 'Employees', path: '/employees', roles: ['admin', 'hr'] },
    { icon: ClipboardList, label: 'Attendance', path: '/attendance', roles: ['admin', 'hr', 'employee'] },
    { icon: DollarSign, label: 'Salary', path: '/salary', roles: ['admin', 'hr'] },
    { icon: FileText, label: 'Reports', path: '/reports', roles: ['admin', 'hr'] },
    { icon: FolderOpen, label: 'Documents', path: '/documents', roles: ['admin', 'hr', 'employee'] },
    { icon: User, label: 'My Space', path: '/my-space', roles: ['admin', 'hr', 'employee'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin', 'hr', 'employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-lg"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">NMEP</h2>
            <p className="text-xs text-gray-500">HR Portal</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
