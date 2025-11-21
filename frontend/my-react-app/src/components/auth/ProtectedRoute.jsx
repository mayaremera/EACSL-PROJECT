import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { membersManager } from '../../utils/dataManager';
import { membersService } from '../../services/membersService';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, getMemberByUserId } = useAuth();
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Sync from Supabase and check admin status
  useEffect(() => {
    // Skip if already checked or if conditions aren't met
    if (adminCheckComplete || loading || !user) {
      if (!requireAdmin && !loading && user) {
        // For non-admin routes, mark as complete immediately
        setAdminCheckComplete(true);
      }
      return;
    }

    // Only check admin status if required
    if (!requireAdmin) {
      setAdminCheckComplete(true);
      return;
    }

    const checkAdminStatus = async () => {
      setCheckingAdmin(true);
      
      try {
        // First, sync from Supabase to get latest data (only once per user session)
        // Use force: false to respect cooldown and prevent excessive requests
        await membersManager.syncFromSupabase({ force: false });
        
        // Get member from local storage (now synced)
        let member = getMemberByUserId(user.id);
        
        // If not found by userId, try by email
        if (!member) {
          const allMembers = membersManager.getAll();
          member = allMembers.find(m => m.email === user.email);
        }
        
        // If still not found, try fetching directly from Supabase
        if (!member) {
          const { data: supabaseMember, error } = await membersService.getByUserId(user.id);
          if (supabaseMember && !error) {
            const mappedMember = membersService.mapSupabaseToLocal(supabaseMember);
            member = mappedMember;
            // Add to local storage for future use
            const existingMembers = membersManager.getAll();
            const exists = existingMembers.some(m => m.id === mappedMember.id);
            if (!exists) {
              membersManager.saveAll([...existingMembers, mappedMember]);
            }
          }
        }
        
        // Check admin status
        const adminStatus = member?.role === 'Admin' || 
                           user.user_metadata?.role === 'Admin' ||
                           member?.role?.toLowerCase() === 'admin';
        
        console.log('Admin check:', {
          userId: user.id,
          userEmail: user.email,
          memberFound: !!member,
          memberRole: member?.role,
          isAdmin: adminStatus
        });
        
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
        setAdminCheckComplete(true);
      }
    };

    checkAdminStatus();
    // Only depend on user.id (stable) and loading/requireAdmin, not the entire user object or function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading, requireAdmin]);

  if (loading || (requireAdmin && !adminCheckComplete)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4C9A8F] mx-auto mb-4"></div>
          <p className="text-gray-600">{checkingAdmin ? 'Checking admin status...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-2"><strong>Debug Info:</strong></p>
            <p className="text-xs text-gray-600">User ID: {user.id}</p>
            <p className="text-xs text-gray-600">Email: {user.email}</p>
            <p className="text-xs text-gray-600">To fix: Make sure your member record in Supabase has <code className="bg-gray-100 px-1 rounded">role = 'Admin'</code> and is linked to your auth account.</p>
          </div>
          <a
            href="/"
            className="px-6 py-3 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors inline-block"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

