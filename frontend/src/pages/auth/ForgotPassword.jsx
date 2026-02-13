import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.auth.forgotPassword({ email });
      toast.success('Password reset link sent to your email!');
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Visual & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10 p-12 text-white max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Secure Your <br />
              <span className="text-blue-400">Account Access.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              We take security seriously. Follow the steps to reset your password and regain access to your dashboard.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center lg:text-left">
            <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6 mx-auto lg:mx-0"
            >
              {sent ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Mail className="w-8 h-8 text-blue-600" />
              )}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-slate-900 tracking-tight"
            >
              {sent ? 'Check your email' : 'Forgot password?'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 mt-2"
            >
              {sent
                ? 'We have sent a password reset link to your email address.'
                : 'No worries, we\'ll send you reset instructions.'}
            </motion.p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                    placeholder="Enter your email"
                  />
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <p className="text-sm text-slate-600">
                Didn't receive the email? Check your spam folder or try again with a different email address.
              </p>

              <button
                onClick={() => setSent(false)}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all"
              >
                Try use another email
              </button>
            </motion.div>
          )}

          <div className="flex justify-center lg:justify-start">
            <p className="text-xs text-slate-400">
              Nawal Motor &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
