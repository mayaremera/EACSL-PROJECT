import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { membersManager } from '../utils/dataManager';
import { membersService } from '../services/membersService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Sync user to members list if they exist
      if (session?.user) {
        // Use cached data for fast synchronous access
        const existingMembers = membersManager._getAllFromLocalStorage();
        // Check by supabaseUserId first, then by email as fallback
        let existingMember = existingMembers.find(m => m.supabaseUserId === session.user.id);
        
        if (!existingMember && session.user.email) {
          // Fallback: check by email to avoid duplicates
          existingMember = existingMembers.find(m => m.email === session.user.email);
          
          // If found by email but missing supabaseUserId, update it
          if (existingMember && !existingMember.supabaseUserId) {
            const updatedMember = { ...existingMember, supabaseUserId: session.user.id };
            await membersManager.update(existingMember.id, updatedMember);
            existingMember = updatedMember;
          }
        }
        
        // If user's email is confirmed and member exists but is inactive, activate them
        if (session.user.email_confirmed_at && existingMember && !existingMember.isActive) {
          const activatedMember = { ...existingMember, isActive: true };
          await membersManager.update(existingMember.id, activatedMember);
          existingMember = activatedMember;
        }
        
        if (!existingMember) {
          // Not found in local storage - check Supabase before creating
          const { data: supabaseMember, error: fetchError } = await membersService.getByUserId(session.user.id);
          
          if (supabaseMember && !fetchError) {
            // Found in Supabase - sync to local storage
            const mappedMember = membersService.mapSupabaseToLocal(supabaseMember);
            
            // Add to local storage
            const allMembers = membersManager.getAll();
            const exists = allMembers.some(m => 
              m.id === mappedMember.id || 
              m.supabaseUserId === mappedMember.supabaseUserId ||
              m.email === mappedMember.email
            );
            
            if (!exists) {
              allMembers.push(mappedMember);
              membersManager.saveAll(allMembers);
              window.dispatchEvent(new CustomEvent('membersUpdated', { detail: allMembers }));
            } else {
              // Update existing member
              const existingIndex = allMembers.findIndex(m => 
                m.id === mappedMember.id || 
                m.supabaseUserId === mappedMember.supabaseUserId ||
                m.email === mappedMember.email
              );
              if (existingIndex >= 0) {
                allMembers[existingIndex] = mappedMember;
                membersManager.saveAll(allMembers);
                window.dispatchEvent(new CustomEvent('membersUpdated', { detail: allMembers }));
              }
            }
          } else if (!supabaseMember) {
            // Not found in Supabase either - only now create a new member
            const fullName = session.user.user_metadata?.full_name || 
                            session.user.email?.split('@')[0] || 
                            'Member';
            const currentDate = new Date();
            const membershipDate = currentDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            });
            
            const newMember = {
              supabaseUserId: session.user.id,
              name: fullName,
              email: session.user.email || '',
              role: 'Member',
              nationality: session.user.user_metadata?.nationality || 'Egyptian',
              flagCode: session.user.user_metadata?.flagCode || 'eg',
              description: `Member of EACSL since ${membershipDate}`,
              fullDescription: `${fullName} is a valued member of the EACSL community.`,
              membershipDate: membershipDate,
              isActive: session.user.email_confirmed_at ? true : false, // Active only if email confirmed
              activeTill: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).getFullYear().toString(),
              certificates: [],
              phone: session.user.user_metadata?.phone || '',
              location: session.user.user_metadata?.location || '',
              website: session.user.user_metadata?.website || '',
              linkedin: session.user.user_metadata?.linkedin || '',
              image: session.user.user_metadata?.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600',
            };
            
            await membersManager.add(newMember);
            // Trigger UI update
            const allMembers = membersManager.getAll();
            window.dispatchEvent(new CustomEvent('membersUpdated', { detail: allMembers }));
          }
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      // Only log non-token-refresh events to reduce console spam
      if (event !== 'TOKEN_REFRESHED') {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
      }
      
      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        // Only clear session/user on explicit sign out
        setSession(null);
        setUser(null);
        setLoading(false);
        return; // Don't continue with member sync on sign out
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refreshed - update session but preserve user state
        // IMPORTANT: Skip member sync on token refresh to avoid delays and race conditions
        if (session) {
          setSession(session);
          setUser(session.user);
        }
        // Don't clear user if session is temporarily null during refresh
        // The refresh should complete quickly
        if (mounted) {
          setLoading(false);
        }
        return; // CRITICAL: Don't run member sync on token refresh
      } else if (event === 'INITIAL_SESSION') {
        // INITIAL_SESSION is already handled by getSession() above
        // Just update state and skip member sync to avoid duplicate work
        if (session) {
          setSession(session);
          setUser(session.user);
        }
        if (mounted) {
          setLoading(false);
        }
        return; // Skip member sync - already handled in initial getSession
      } else {
        // For other events (SIGNED_IN, USER_UPDATED, etc.)
        // Only update if we have a session, or if it's an explicit sign-in event
        if (session) {
          setSession(session);
          setUser(session.user);
        } else if (event === 'SIGNED_IN') {
          // If SIGNED_IN event but no session, something went wrong
          // Don't clear user state though - keep existing state
          console.warn('SIGNED_IN event but no session provided');
        }
      }
      
      // Sync user to members list when they sign in or confirm email
      if (session?.user) {
        // Small delay to ensure any member creation from signUp has completed
        // This prevents race conditions where onAuthStateChange runs before signUp finishes
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use cached data for fast synchronous access
        const existingMembers = membersManager._getAllFromLocalStorage();
        // Check by supabaseUserId first, then by email as fallback
        let existingMember = existingMembers.find(m => m.supabaseUserId === session.user.id);
        
        if (!existingMember && session.user.email) {
          // Fallback: check by email to avoid duplicates
          existingMember = existingMembers.find(m => m.email === session.user.email);
          
          // If found by email but missing supabaseUserId, update it
          if (existingMember && !existingMember.supabaseUserId) {
            const updatedMember = { ...existingMember, supabaseUserId: session.user.id };
            await membersManager.update(existingMember.id, updatedMember);
            existingMember = updatedMember;
          }
        }
        
        // If email was just confirmed, activate pending member
        // Check if email is confirmed (either on SIGNED_IN after confirmation or USER_UPDATED)
        if (session.user.email_confirmed_at && existingMember && !existingMember.isActive) {
          // User confirmed their email - activate the member
          const activatedMember = { ...existingMember, isActive: true };
          await membersManager.update(existingMember.id, activatedMember);
          existingMember = activatedMember;
        }
        
        if (!existingMember) {
          // Not found in local storage - check Supabase before creating
          console.log('onAuthStateChange: Member not found locally, checking Supabase...');
          const { data: supabaseMember, error: fetchError } = await membersService.getByUserId(session.user.id);
          
          if (supabaseMember && !fetchError) {
            // Found in Supabase - sync to local storage
            const mappedMember = membersService.mapSupabaseToLocal(supabaseMember);
            console.log('✅ Found member in Supabase, syncing to local storage:', {
              id: mappedMember.id,
              email: mappedMember.email,
              role: mappedMember.role
            });
            
            // Add to local storage (use cached data for fast access)
            const allMembers = membersManager._getAllFromLocalStorage();
            const exists = allMembers.some(m => 
              m.id === mappedMember.id || 
              m.supabaseUserId === mappedMember.supabaseUserId ||
              m.email === mappedMember.email
            );
            
            if (!exists) {
              allMembers.push(mappedMember);
              membersManager.saveAll(allMembers);
              window.dispatchEvent(new CustomEvent('membersUpdated', { detail: allMembers }));
            } else {
              // Update existing member
              const existingIndex = allMembers.findIndex(m => 
                m.id === mappedMember.id || 
                m.supabaseUserId === mappedMember.supabaseUserId ||
                m.email === mappedMember.email
              );
              if (existingIndex >= 0) {
                allMembers[existingIndex] = mappedMember;
                membersManager.saveAll(allMembers);
                window.dispatchEvent(new CustomEvent('membersUpdated', { detail: allMembers }));
              }
            }
          } else if (!supabaseMember) {
            // Not found in Supabase either - only now create a new member
            // This is a fallback for new signups where member wasn't created during signup
            const fullName = session.user.user_metadata?.full_name || 
                            session.user.email?.split('@')[0] || 
                            'Member';
            const currentDate = new Date();
            const membershipDate = currentDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            });
            
            const newMember = {
              supabaseUserId: session.user.id,
              name: fullName,
              email: session.user.email || '',
              role: 'Member',
              nationality: session.user.user_metadata?.nationality || 'Egyptian',
              flagCode: session.user.user_metadata?.flagCode || 'eg',
              description: `Member of EACSL since ${membershipDate}`,
              fullDescription: `${fullName} is a valued member of the EACSL community.`,
              membershipDate: membershipDate,
              isActive: true, // Active for new signups (not from approval flow)
              activeTill: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).getFullYear().toString(),
              certificates: [],
              phone: session.user.user_metadata?.phone || '',
              location: session.user.user_metadata?.location || '',
              website: session.user.user_metadata?.website || '',
              linkedin: session.user.user_metadata?.linkedin || '',
              image: session.user.user_metadata?.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600',
            };
            
            console.log('onAuthStateChange: Creating new member record (not found in Supabase):', session.user.email);
            await membersManager.add(newMember);
            // Trigger UI update (use cached data for fast access)
            const allMembers = membersManager._getAllFromLocalStorage();
            window.dispatchEvent(new CustomEvent('membersUpdated', { detail: allMembers }));
          } else {
            // Error fetching from Supabase - log but don't fail
            console.warn('onAuthStateChange: Error checking Supabase for member:', fetchError);
          }
        } else {
          console.log('onAuthStateChange: Member already exists locally for user:', session.user.email);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    // Check if error indicates user already exists
    if (error) {
      const errorMsg = error.message?.toLowerCase() || '';
      const errorCode = error.status || error.code || '';
      
      // Supabase returns various error messages for existing users
      // Common ones: "User already registered", "Email already registered", etc.
      if (errorMsg.includes('already') || 
          errorMsg.includes('registered') ||
          errorMsg.includes('exists') ||
          errorMsg.includes('duplicate') ||
          errorCode === 'user_already_registered' ||
          errorCode === 'email_already_registered' ||
          errorCode === 'signup_disabled' ||
          error.status === 400) {
        return { 
          data: null, 
          error: { 
            message: 'An account with this email already exists. Please sign in instead.',
            code: 'USER_ALREADY_EXISTS'
          } 
        };
      }
      // Return other errors as-is
      return { data, error };
    }
    
    // If we got a user but also a session, it might mean the user already existed
    // (Supabase sometimes returns existing users when signup is attempted)
    if (data?.user && data?.session) {
      // User already exists and is signed in
      return {
        data: null,
        error: {
          message: 'An account with this email already exists. You have been signed in.',
          code: 'USER_ALREADY_EXISTS'
        }
      };
    }
    
    // Additional check: If user exists but email is already confirmed, it's an existing user
    // New signups typically have email_confirmed_at as null
    if (data?.user && data.user.email_confirmed_at && !data.session) {
      // This is suspicious - user exists with confirmed email but no session
      // This usually means the user already exists
      return {
        data: null,
        error: {
          message: 'An account with this email already exists. Please sign in instead.',
          code: 'USER_ALREADY_EXISTS'
        }
      };
    }
    
    // Check if user was created recently (within last 5 seconds) - if not, it's likely an existing user
    if (data?.user && !data.session) {
      const userCreatedAt = data.user.created_at ? new Date(data.user.created_at) : null;
      const now = new Date();
      if (userCreatedAt && (now - userCreatedAt) > 5000) {
        // User was created more than 5 seconds ago - likely an existing user
        // This handles cases where Supabase returns an existing user without an error
        return {
          data: null,
          error: {
            message: 'An account with this email already exists. Please sign in instead.',
            code: 'USER_ALREADY_EXISTS'
          }
        };
      }
    }

    // If signup successful, create member record IMMEDIATELY
    // This must happen before onAuthStateChange fires to avoid race conditions
    if (data?.user && !error) {
      try {
        const fullName = metadata.full_name || email.split('@')[0];
        const currentDate = new Date();
        const membershipDate = currentDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        
        // Check if member already exists for this user (use cached data for fast access)
        const existingMembers = membersManager._getAllFromLocalStorage();
        const existingMember = existingMembers.find(m => m.supabaseUserId === data.user.id || m.email === email);
        
        if (!existingMember) {
          // Create new member record
          const newMember = {
            supabaseUserId: data.user.id, // Link to Supabase user
            name: fullName,
            email: email,
            role: 'Member',
            nationality: metadata.nationality || 'Egyptian',
            flagCode: metadata.flagCode || 'eg',
            description: `Member of EACSL since ${membershipDate}`,
            fullDescription: `${fullName} is a valued member of the EACSL community.`,
            membershipDate: membershipDate,
            isActive: true,
            activeTill: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).getFullYear().toString(),
            certificates: [],
            phone: metadata.phone || '',
            location: metadata.location || '',
            website: metadata.website || '',
            linkedin: metadata.linkedin || '',
            image: metadata.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600', // Default placeholder image
          };
          
          console.log('Creating member record for new user:', email);
          // Await member creation to ensure it's added to both localStorage and Supabase
          const createdMember = await membersManager.add(newMember);
          console.log('Member created successfully:', createdMember);
          
          // Verify member was added and trigger UI update (use cached data for fast access)
          const allMembers = membersManager._getAllFromLocalStorage();
          const verifyMember = allMembers.find(m => m.supabaseUserId === data.user.id || m.email === email);
          if (verifyMember) {
            console.log('Member verified in localStorage:', verifyMember);
            // Force a UI update by dispatching the event again to ensure all listeners are notified
            window.dispatchEvent(new CustomEvent('membersUpdated', { detail: allMembers }));
          } else {
            console.error('ERROR: Member was not found in localStorage after creation!');
          }
        } else {
          console.log('Member already exists for this user:', existingMember);
        }
      } catch (memberError) {
        console.error('Error creating member record during signup:', memberError);
        // Don't fail the signup if member creation fails, but log it
      }
    }

    return { data, error };
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Reset password
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  // Sync current user to members list (creates member record if doesn't exist)
  const syncCurrentUserToMember = async () => {
    try {
      if (!user) {
        return { error: 'No user logged in' };
      }

      // Use cached data for fast synchronous access
      const existingMembers = membersManager._getAllFromLocalStorage();
      const existingMember = existingMembers.find(m => m.supabaseUserId === user.id);
      
      if (existingMember) {
        return { member: existingMember, created: false };
      }

      // Create member record for current user
      const fullName = user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      'Member';
      const currentDate = new Date();
      const membershipDate = currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      const newMember = {
        supabaseUserId: user.id,
        name: fullName,
        email: user.email || '',
        role: 'Member',
        nationality: user.user_metadata?.nationality || 'Egyptian',
        flagCode: user.user_metadata?.flagCode || 'eg',
        description: `Member of EACSL since ${membershipDate}`,
        fullDescription: `${fullName} is a valued member of the EACSL community.`,
        membershipDate: membershipDate,
        isActive: true,
        activeTill: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).getFullYear().toString(),
        certificates: [],
        phone: user.user_metadata?.phone || '',
        location: user.user_metadata?.location || '',
        website: user.user_metadata?.website || '',
        linkedin: user.user_metadata?.linkedin || '',
        image: user.user_metadata?.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600',
      };
      
      const createdMember = await membersManager.add(newMember);
      return { member: createdMember, created: true };
    } catch (err) {
      console.error('Error syncing user to member:', err);
      return { error: err.message };
    }
  };

  // Get member by Supabase user ID (memoized to prevent unnecessary re-renders)
  const getMemberByUserId = useCallback((userId) => {
    // Use cached data for fast synchronous access
    const members = membersManager._getAllFromLocalStorage();
    return members.find(m => m.supabaseUserId === userId);
  }, []);

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    syncCurrentUserToMember,
    getMemberByUserId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};