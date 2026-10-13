import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { membersManager } from '../../utils/dataManager';
import { membersService } from '../../services/membersService';

// Cache admin check results to prevent excessive Supabase requests
const adminCheckCache = new Map();
const ADMIN_CHECK_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ACCESS_DENIED_REDIRECT_MS = 2500;

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, getMemberByUserId } = useAuth();
  const navigate = useNavigate();
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Reset admin check when the user changes (login / logout / account switch)
  useEffect(() => {
    setIsAdmin(false);
    setAdminCheckComplete(false);
    setCheckingAdmin(false);
  }, [user?.id]);

  // Check admin status only when a logged-in user hits an admin route
  useEffect(() => {
    if (loading || !user || !requireAdmin || adminCheckComplete) {
      return;
    }

    let cancelled = false;

    const checkAdminStatus = async () => {
      setCheckingAdmin(true);

      try {
        const cacheKey = user.id;
        const cached = adminCheckCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < ADMIN_CHECK_CACHE_DURATION) {
          if (!cancelled) {
            setIsAdmin(cached.isAdmin);
            setCheckingAdmin(false);
            setAdminCheckComplete(true);
          }
          return;
        }

        let member = getMemberByUserId(user.id);

        if (!member) {
          const allMembers = membersManager._getAllFromLocalStorage();
          member = allMembers.find(m => m.email === user.email);
        }

        if (member && member.role === 'Admin') {
          const adminStatus = true;
          adminCheckCache.set(cacheKey, {
            isAdmin: adminStatus,
            timestamp: Date.now()
          });

          // Verify with Supabase in background (non-blocking)
          membersService.getByUserId(user.id).then(({ data: supabaseMember, error }) => {
            if (!error && supabaseMember) {
              const mappedMember = membersService.mapSupabaseToLocal(supabaseMember);
              if (mappedMember.role === 'Admin') {
                const existingMembers = membersManager._getAllFromLocalStorage();
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
          }).catch(() => {});

          if (!cancelled) {
            setIsAdmin(adminStatus);
            setCheckingAdmin(false);
            setAdminCheckComplete(true);
          }
          return;
        }

        const { data: supabaseMember, error: fetchError } = await membersService.getByUserId(user.id);

        if (supabaseMember && !fetchError) {
          member = membersService.mapSupabaseToLocal(supabaseMember);

          const existingMembers = membersManager._getAllFromLocalStorage();
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
        } else if (!member) {
          const { data: allMembers, error: allError } = await membersService.getAll();

          if (!allError && allMembers) {
            const mappedMembers = allMembers.map(m => membersService.mapSupabaseToLocal(m));
            member = mappedMembers.find(m =>
              m.email === user.email ||
              m.supabaseUserId === user.id
            );

            if (member) {
              const existingMembers = membersManager._getAllFromLocalStorage();
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

        const adminStatus = member?.role === 'Admin' ||
          user.user_metadata?.role === 'Admin' ||
          member?.role?.toLowerCase() === 'admin';

        adminCheckCache.set(cacheKey, {
          isAdmin: adminStatus,
          timestamp: Date.now()
        });

        if (!cancelled) {
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        if (!cancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingAdmin(false);
          setAdminCheckComplete(true);
        }
      }
    };

    checkAdminStatus();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading, requireAdmin, adminCheckComplete]);

  // Logged-in non-admin: show Access Denied, then send them home
  useEffect(() => {
    if (loading || !user || !requireAdmin || !adminCheckComplete || isAdmin) {
      return;
    }

    const timeoutId = setTimeout(() => {
      navigate('/', { replace: true });
    }, ACCESS_DENIED_REDIRECT_MS);

    return () => clearTimeout(timeoutId);
  }, [loading, user, requireAdmin, adminCheckComplete, isAdmin, navigate]);

  // Wait only for auth session resolution
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A9B8E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Guest: redirect home immediately (no admin check, no infinite spinner)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in + admin route: wait for role check
  if (requireAdmin && !adminCheckComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A9B8E] mx-auto mb-4"></div>
          <p className="text-gray-600">{checkingAdmin ? 'Checking admin status...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You need admin privileges to access this page. Redirecting you to the home page…
          </p>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
