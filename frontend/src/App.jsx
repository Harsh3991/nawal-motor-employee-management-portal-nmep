import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useStore';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import OTPLogin from './pages/auth/OTPLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import AddEmployee from './pages/AddEmployee';
import Attendance from './pages/Attendance';
import Salary from './pages/Salary';
import Reports from './pages/Reports';
import MySpace from './pages/MySpace';
import Documents from './pages/Documents';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/otp-login"
            element={
              <PublicRoute>
                <OTPLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Employee Routes */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr']}>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/add"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr']}>
                <AddEmployee />
              </ProtectedRoute>
            }
          />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          
          {/* Attendance Routes */}
          <Route path="/attendance" element={<Attendance />} />
          
          {/* Salary Routes */}
          <Route path="/salary" element={<Salary />} />
          
          {/* Reports Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          
          {/* Documents Routes */}
          <Route path="/documents" element={<Documents />} />
          
          {/* My Space Route */}
          <Route path="/my-space" element={<MySpace />} />
          
          {/* Settings Route */}
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
