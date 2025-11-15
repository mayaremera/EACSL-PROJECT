import { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { membersManager } from '../../utils/dataManager';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [emailExistsError, setEmailExistsError] = useState(false);

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
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
      } else {
        // Sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        // Check if email already exists before attempting signup (same method as become member)
        console.log('Checking if email exists before signup...');
        setEmailExistsError(false);
        
        // Check in existing members
        const existingMembers = membersManager.getAll();
        const existingMember = existingMembers.find(m => 
            m.email && m.email.toLowerCase() === email.toLowerCase()
        );
        
        if (existingMember) {
            console.log('Email already exists in members:', existingMember);
            setLoading(false);
            setEmailExistsError(true);
            setError(`An account with email ${email} already exists in our system. Please sign in instead.`);
            return;
        }
        
        // Check in pending applications (localStorage)
        try {
            const stored = localStorage.getItem('memberForms');
            if (stored) {
                const existingForms = JSON.parse(stored);
                const pendingApplication = existingForms.find(
                    form => form.email && 
                    form.email.toLowerCase() === email.toLowerCase() && 
                    form.status === 'pending'
                );
                
                if (pendingApplication) {
                    console.log('Email already has pending application:', pendingApplication);
                    setLoading(false);
                    setEmailExistsError(true);
                    setError(`You already have a pending application with email ${email}. Please wait for your current application to be reviewed or sign in if you already have an account.`);
                    return;
                }
            }
        } catch (error) {
            console.warn('Error checking pending applications:', error);
            // Continue with signup if we can't check
        }

        // Email doesn't exist locally, attempt signup with Supabase
        console.log('Email check passed, attempting signup with Supabase...');
        const { data, error } = await signUp(email, password, {
          full_name: fullName,
        });

        if (error) {
          // Check if error indicates user already exists
          const errorMsg = error.message?.toLowerCase() || '';
          const errorCode = error.code || '';
          
          if (error.code === 'USER_ALREADY_EXISTS' || 
              errorMsg.includes('already exists') ||
              errorMsg.includes('already registered') ||
              errorMsg.includes('user already registered') ||
              errorMsg.includes('email already registered')) {
            setEmailExistsError(true);
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setEmailExistsError(false);
            setError(error.message);
          }
        } else if (data?.user) {
          // Check if user was created or if it's an existing user
          // If session exists immediately, user might already exist
          if (data.session) {
            // User already exists and was signed in
            setEmailExistsError(true);
            setError('An account with this email already exists. You have been signed in.');
          } else {
            // Check if user was just created (new signup) or if it's an existing user
            // New signups typically don't have email_confirmed_at set immediately
            // If email_confirmed_at exists and user was created more than a few seconds ago, it's likely existing
            const userCreatedAt = data.user.created_at ? new Date(data.user.created_at) : null;
            const now = new Date();
            const isRecentSignup = userCreatedAt && (now - userCreatedAt) < 5000; // Less than 5 seconds ago
            
            if (data.user.email_confirmed_at && !isRecentSignup) {
              // User exists with confirmed email and wasn't just created
              setEmailExistsError(true);
              setError('An account with this email already exists. Please sign in instead.');
            } else {
              // New user created successfully
              setEmailExistsError(false);
              setSuccessMessage('Account created successfully! Please check your email to verify your account.');
              setTimeout(() => {
                setIsLogin(true);
                resetForm();
              }, 2000);
            }
          }
        } else {
          // No user returned - this shouldn't happen, but handle it
          setEmailExistsError(false);
          setError('Failed to create account. Please try again.');
        }
      }
    } catch (err) {
      // Check if error is about existing user
      const errMsg = err.message?.toLowerCase() || '';
      if (errMsg.includes('already') || errMsg.includes('exists') || errMsg.includes('registered')) {
        setEmailExistsError(true);
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setEmailExistsError(false);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setError('');
    setSuccessMessage('');
    setEmailExistsError(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
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
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isLogin
              ? 'Welcome back! Please sign in to your account.'
              : 'Join us today! Create your account to get started.'}
          </p>
        </div>

        {/* Form */}
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
            <div className={`mb-4 p-4 border-l-4 rounded-lg flex items-start gap-3 ${
              emailExistsError 
                ? 'bg-amber-50 border-amber-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                emailExistsError ? 'text-amber-600' : 'text-red-600'
              }`} />
              <div className="flex-1">
                <p className={`font-medium text-sm ${
                  emailExistsError ? 'text-amber-800' : 'text-red-800'
                }`}>
                  {emailExistsError ? 'Email Already Exists' : 'Error'}
                </p>
                <p className={`text-sm mt-1 ${
                  emailExistsError ? 'text-amber-700' : 'text-red-700'
                }`}>
                  {error}
                </p>
                {emailExistsError && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setEmail(email); // Keep the email for sign in
                      setError('');
                      setEmailExistsError(false);
                    }}
                    className="mt-2 text-sm font-semibold text-amber-700 hover:text-amber-800 underline"
                  >
                    Switch to Sign In
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Full Name (Sign Up Only) */}
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Clear email exists error when user types
                  if (emailExistsError) {
                    setEmailExistsError(false);
                    setError('');
                  }
                }}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  emailExistsError 
                    ? 'border-amber-300 focus:ring-amber-500' 
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
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

          {/* Confirm Password (Sign Up Only) */}
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4C9A8F] hover:bg-[#57A79B] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          {/* Switch Mode */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={switchMode}
                className="text-[#4C9A8F] hover:text-[#57A79B] font-semibold transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

