import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { membersManager } from '../../utils/dataManager';
import { membersService } from '../../services/membersService';

// Cache admin check results to prevent excessive Supabase requests
const adminCheckCache = new Map();
const ADMIN_CHECK_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
        // Check cache first to avoid excessive Supabase requests
        const cacheKey = user.id;
        const cached = adminCheckCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < ADMIN_CHECK_CACHE_DURATION) {
          console.log('✅ Using cached admin check result');
          setIsAdmin(cached.isAdmin);
          setCheckingAdmin(false);
          setAdminCheckComplete(true);
          return;
        }

        // First, check local storage (fastest, no network request)
        let member = getMemberByUserId(user.id);
        
        if (!member) {
          const allMembers = membersManager.getAll();
          member = allMembers.find(m => m.email === user.email);
        }

        // If found in local storage and has Admin role, use it (but still verify with Supabase in background)
        if (member && member.role === 'Admin') {
          console.log('✅ Found admin member in local storage, using cached result');
          const adminStatus = true;
          setIsAdmin(adminStatus);
          
          // Cache the result
          adminCheckCache.set(cacheKey, {
            isAdmin: adminStatus,
            timestamp: Date.now()
          });
          
          // Verify with Supabase in background (non-blocking)
          membersService.getByUserId(user.id).then(({ data: supabaseMember, error }) => {
            if (!error && supabaseMember) {
              const mappedMember = membersService.mapSupabaseToLocal(supabaseMember);
              // Update local storage if Supabase has newer data
              if (mappedMember.role === 'Admin') {
                const existingMembers = membersManager.getAll();
                const existingIndex = existingMembers.findIndex(m => 
                  m.id === mappedMember.id || 
                  m.supabaseUserId === mappedMember.supabaseUserId ||
                  m.email === mappedMember.email
                );
                
                if (existingIndex >= 0) {
                  existingMembers[existingIndex] = mappedMember;
                } else {
                  existingMembers.push(mappedMember);
                }
                membersManager.saveAll(existingMembers);
              }
            }
          }).catch(err => {
            console.warn('Background Supabase verification failed:', err);
            // Don't fail the admin check if background verification fails
          });
          
          setCheckingAdmin(false);
          setAdminCheckComplete(true);
          return;
        }

        // If not found in local storage or not admin, fetch from Supabase
        console.log('🔄 Fetching member from Supabase...');
        const { data: supabaseMember, error: fetchError } = await membersService.getByUserId(user.id);
        
        if (supabaseMember && !fetchError) {
          // Found in Supabase - map and use it
          member = membersService.mapSupabaseToLocal(supabaseMember);
          console.log('✅ Found member in Supabase:', {
            id: member.id,
            email: member.email,
            role: member.role,
            supabaseUserId: member.supabaseUserId
          });
          
          // Update local storage with the latest data from Supabase
          const existingMembers = membersManager.getAll();
          const existingIndex = existingMembers.findIndex(m => 
            m.id === member.id || 
            m.supabaseUserId === member.supabaseUserId ||
            m.email === member.email
          );
          
          if (existingIndex >= 0) {
            // Update existing member
            existingMembers[existingIndex] = member;
          } else {
            // Add new member
            existingMembers.push(member);
          }
          membersManager.saveAll(existingMembers);
        } else if (!member) {
          // Not found by userId, try by email (only if we don't have local data)
          console.log('⚠️ Member not found by userId, trying email...');
          const { data: allMembers, error: allError } = await membersService.getAll();
          
          if (!allError && allMembers) {
            const mappedMembers = allMembers.map(m => membersService.mapSupabaseToLocal(m));
            member = mappedMembers.find(m => 
              m.email === user.email || 
              m.supabaseUserId === user.id
            );
            
            if (member) {
              console.log('✅ Found member by email:', {
                id: member.id,
                email: member.email,
                role: member.role
              });
              
              // Update local storage
              const existingMembers = membersManager.getAll();
              const existingIndex = existingMembers.findIndex(m => 
                m.id === member.id || 
                m.supabaseUserId === member.supabaseUserId ||
                m.email === member.email
              );
              
              if (existingIndex >= 0) {
                existingMembers[existingIndex] = member;
              } else {
                existingMembers.push(member);
              }
              membersManager.saveAll(existingMembers);
            }
          }
        }
        
        // Check admin status
        const adminStatus = member?.role === 'Admin' || 
                           user.user_metadata?.role === 'Admin' ||
                           member?.role?.toLowerCase() === 'admin';
        
        console.log('🔍 Admin check result:', {
          userId: user.id,
          userEmail: user.email,
          memberFound: !!member,
          memberId: member?.id,
          memberRole: member?.role,
          isAdmin: adminStatus
        });
        
        // Cache the result
        adminCheckCache.set(cacheKey, {
          isAdmin: adminStatus,
          timestamp: Date.now()
        });
        
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('❌ Error checking admin status:', error);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A9B8E] mx-auto mb-4"></div>
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
            className="px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors inline-block"
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

