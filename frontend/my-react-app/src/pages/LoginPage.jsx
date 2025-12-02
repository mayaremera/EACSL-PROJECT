import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = React.useState(true);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // If there's a redirect path in state, go there, otherwise go to home
      const redirectTo = location.state?.redirectTo || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Listen for successful login (check user state after login)
  useEffect(() => {
    if (user && isModalOpen) {
      // User just logged in, redirect to intended page
      const redirectTo = location.state?.redirectTo || '/';
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 500);
    }
  }, [user, isModalOpen, navigate, location.state]);

  const handleClose = () => {
    setIsModalOpen(false);
    // After closing without login, redirect to home
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access this content.
          </p>
        </div>
        <AuthModal 
          isOpen={isModalOpen} 
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default LoginPage;

