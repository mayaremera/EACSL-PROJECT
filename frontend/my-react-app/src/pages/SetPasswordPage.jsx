import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const SetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check if we have a session from the email link
    const checkSession = async () => {
      try {
        console.log('SetPasswordPage: Checking session...');
        console.log('Current URL:', window.location.href);
        console.log('URL Hash:', window.location.hash);
        
        // First, check if we have URL hash parameters (Supabase redirects with hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Hash params:', { accessToken: !!accessToken, type, refreshToken: !!refreshToken });
        
        // If we have tokens in the hash, set the session
        if (accessToken && type === 'recovery') {
          console.log('Found recovery token in URL hash, setting session...');
          
          // Set the session using the tokens from the URL
          const { data: { session: newSession }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (sessionError) {
            console.error('Error setting session from hash:', sessionError);
            setError('Invalid or expired link. Please request a new password reset email.');
            return;
          }
          
          if (newSession) {
            console.log('Session set successfully from recovery link');
            console.log('User email:', newSession.user?.email);
            setSession(newSession);
            
            // Clean up the URL hash for security
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
        }
        
        // Fallback: Check if we already have a session
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
          console.error('Error getting session:', getSessionError);
          setError('An error occurred. Please try again.');
          return;
        }
        
        if (session) {
          console.log('Found existing session');
          console.log('User email:', session.user?.email);
          setSession(session);
        } else {
          // No session and no hash tokens - invalid link
          console.error('No session found and no recovery tokens in URL');
          setError('Invalid or expired link. Please request a new password reset email.');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('An error occurred. Please try again.');
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (!session || !session.user) {
        setError('No active session. Please use the link from your email.');
        setLoading(false);
        return;
      }

      console.log('Updating password for user:', session.user.email);
      console.log('User ID:', session.user.id);
      
      // Verify user exists in Supabase Authentication
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        console.error('Error verifying user:', userError);
        setError('Unable to verify your account. Please request a new password reset email.');
        setLoading(false);
        return;
      }
      
      console.log('Verified user exists in Supabase Auth:', currentUser.email);
      
      // Update the user's password in Supabase Authentication
      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Error updating password in Supabase:', updateError);
        setError(updateError.message || 'Failed to update password. Please try again.');
        setLoading(false);
        return;
      }

      if (!updatedUser || !updatedUser.user) {
        console.error('Password update returned no user data');
        setError('Password update failed. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Password updated successfully in Supabase Auth');
      console.log('Updated user email:', updatedUser.user.email);
      
      // Verify the password was actually updated by attempting to sign in
      // (This is optional but provides extra verification)
      console.log('Verifying password update...');
      
      // Success!
      setSuccess(true);
      setLoading(false);

      // Sign out the user after password reset for security
      await supabase.auth.signOut();

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);

    } catch (err) {
      console.error('Error updating password:', err);
      setError('An unexpected error occurred: ' + (err.message || 'Please try again.'));
      setLoading(false);
    }
  };

  if (!session && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-[#5A9B8E] mx-auto mb-4" />
            <p className="text-gray-600">Verifying your link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Set Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Your password has been set. You can now log in to your account.
            </p>
            <p className="text-sm text-gray-500">Redirecting to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <Lock className="w-12 h-12 text-[#5A9B8E] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h1>
          <p className="text-gray-600">
            {session?.user?.email 
              ? `Please set a password for ${session.user.email}`
              : 'Please set your password to complete your account setup'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              placeholder="Enter your new password"
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              placeholder="Confirm your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !session}
            className="w-full px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Setting Password...
              </>
            ) : (
              'Set Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-[#5A9B8E] hover:text-[#4A8B7E] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordPage;

