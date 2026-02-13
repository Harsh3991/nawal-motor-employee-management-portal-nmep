import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.auth.login(formData);
      login(response.data.user, response.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel - Visual & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden items-center justify-center">
        {/* Abstract Background Shapes - Subtle */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.25, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/15 blur-[120px]"
            animate={{ 
              scale: [1, 1.08, 1],
              opacity: [0.15, 0.2, 0.15]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[50px_50px]"></div>

        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>

        <div className="relative z-10 p-12 text-white max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Manage Your Workforce <br />
              <span className="text-blue-400">Efficiently.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Streamline employee management, track performance, and organize your company structure with the Nawal Motor Employee Management Portal.
            </p>

            <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Secure System
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                Real-time Analytics
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 lg:p-24 relative bg-white">
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-slate-900 tracking-tight"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-600 mt-2 text-base"
            >
              Please enter your details to sign in.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 bg-white hover:border-slate-300 shadow-sm"
                  placeholder="name@company.com"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 bg-white hover:border-slate-300 shadow-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 border-2 border-slate-300 rounded cursor-pointer transition-all"
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm text-slate-700 font-medium cursor-pointer">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="group w-full flex justify-center items-center py-3.5 px-4 border-0 rounded-xl shadow-lg shadow-blue-600/20 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/otp-login"
                className="w-full flex items-center justify-center px-4 py-3.5 border-2 border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <Mail className="h-5 w-5 mr-2.5 text-slate-500" />
                Login with One-Time Password
              </Link>
            </div>

            <p className="mt-8 text-xs text-center text-slate-400 font-medium">
              Nawal Motor &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
