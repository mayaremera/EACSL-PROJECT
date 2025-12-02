import { useState } from 'react';
import { X, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Sign in
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Successfully signed in!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMessage('');
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!forgotPasswordEmail.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await resetPassword(forgotPasswordEmail.trim());
      
      // Log for debugging
      console.log('Password reset response:', { data, error });
      
      if (error) {
        // Provide more detailed error messages
        let errorMessage = error.message || 'Failed to send password reset email.';
        
        // Handle specific error cases
        if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
          errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
        } else if (error.message?.includes('not found') || error.message?.includes('user')) {
          errorMessage = 'No account found with this email address. Please check your email or sign up.';
        } else if (error.message?.includes('email')) {
          errorMessage = 'Email error: ' + error.message;
        }
        
        setError(errorMessage);
        console.error('Password reset error:', error);
      } else {
        // Success - Supabase always returns success even if email fails to send
        // So we show success message but also warn about checking spam
        setSuccessMessage('Password reset email sent! Please check your inbox (and spam folder) and follow the instructions to reset your password.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordEmail('');
        }, 5000);
      }
    } catch (err) {
      console.error('Password reset exception:', err);
      setError('An unexpected error occurred: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          {showForgotPassword && (
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
                setError('');
                setSuccessMessage('');
              }}
              className="mb-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-800">
            {showForgotPassword ? 'Reset Password' : 'Sign In'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {showForgotPassword
              ? 'Enter your email address and we\'ll send you a link to reset your password.'
              : 'Welcome back! Please sign in to your account.'}
          </p>
        </div>

        {/* Form */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="px-6 py-4">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-green-800 font-medium text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-red-800">
                    Error
                  </p>
                  <p className="text-sm mt-1 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5A9B8E] hover:bg-[#57A79B] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-green-800 font-medium text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-red-800">
                    Error
                  </p>
                  <p className="text-sm mt-1 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-sm text-[#5A9B8E] hover:text-[#57A79B] font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5A9B8E] hover:bg-[#57A79B] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>

            {/* Become a Member Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="/apply-membership"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    navigate('/apply-membership');
                  }}
                  className="text-[#5A9B8E] hover:text-[#57A79B] font-semibold transition-colors"
                >
                  Become a member
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

