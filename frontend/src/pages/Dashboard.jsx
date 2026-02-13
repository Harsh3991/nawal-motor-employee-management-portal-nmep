import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    totalSalary: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.dashboard.getMetrics();
      const metricsData = response.data.data || response.data;
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Employees',
      value: metrics.totalEmployees || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Present Today',
      value: metrics.presentToday || 0,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Absent Today',
      value: metrics.absentToday || 0,
      icon: Clock,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'New Employees',
      value: metrics.newEmployees || 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Pending Tasks',
      value: (metrics.pendingSalary || 0) + (metrics.pendingAdvances || 0),
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8"
      >
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-3xl font-bold text-gray-800 mb-1"
            >
              {card.value}
            </motion.h3>
            <p className="text-sm text-gray-600">{card.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6">What's Happening Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all"
          >
            <p className="text-gray-600 text-sm mb-1">Employees on Leave</p>
            <p className="text-2xl font-bold text-gray-800">{metrics.absentToday || 0}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-all"
          >
            <p className="text-gray-600 text-sm mb-1">Working Today</p>
            <p className="text-2xl font-bold text-gray-800">{metrics.presentToday || 0}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-all"
          >
            <p className="text-gray-600 text-sm mb-1">Pending Actions</p>
            <p className="text-2xl font-bold text-gray-800">{(metrics.pendingSalary || 0) + (metrics.pendingAdvances || 0)}</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
