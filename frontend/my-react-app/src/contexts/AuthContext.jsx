import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { membersManager } from '../utils/dataManager';

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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Sync user to members list if they exist
      if (session?.user) {
        const existingMembers = membersManager.getAll();
        // Check by supabaseUserId first, then by email as fallback
        let existingMember = existingMembers.find(m => m.supabaseUserId === session.user.id);
        
        if (!existingMember && session.user.email) {
          // Fallback: check by email to avoid duplicates
          existingMember = existingMembers.find(m => m.email === session.user.email);
          
          // If found by email but missing supabaseUserId, update it
          if (existingMember && !existingMember.supabaseUserId) {
            const updatedMember = { ...existingMember, supabaseUserId: session.user.id };
            membersManager.update(existingMember.id, updatedMember);
            existingMember = updatedMember;
          }
        }
        
        // If user's email is confirmed and member exists but is inactive, activate them
        if (session.user.email_confirmed_at && existingMember && !existingMember.isActive) {
          const activatedMember = { ...existingMember, isActive: true };
          membersManager.update(existingMember.id, activatedMember);
          existingMember = activatedMember;
        }
        
        if (!existingMember) {
          // Only create member record if it truly doesn't exist
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
          
          membersManager.add(newMember);
        }
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Sync user to members list when they sign in or confirm email
      if (session?.user) {
        const existingMembers = membersManager.getAll();
        // Check by supabaseUserId first, then by email as fallback
        let existingMember = existingMembers.find(m => m.supabaseUserId === session.user.id);
        
        if (!existingMember && session.user.email) {
          // Fallback: check by email to avoid duplicates
          existingMember = existingMembers.find(m => m.email === session.user.email);
          
          // If found by email but missing supabaseUserId, update it
          if (existingMember && !existingMember.supabaseUserId) {
            const updatedMember = { ...existingMember, supabaseUserId: session.user.id };
            membersManager.update(existingMember.id, updatedMember);
            existingMember = updatedMember;
          }
        }
        
        // If email was just confirmed, activate pending member
        // Check if email is confirmed (either on SIGNED_IN after confirmation or USER_UPDATED)
        if (session.user.email_confirmed_at && existingMember && !existingMember.isActive) {
          // User confirmed their email - activate the member
          const activatedMember = { ...existingMember, isActive: true };
          membersManager.update(existingMember.id, activatedMember);
          existingMember = activatedMember;
        }
        
        if (!existingMember) {
          // Only create member record if it truly doesn't exist
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
          
          membersManager.add(newMember);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    // If signup successful, create member record
    if (data?.user && !error) {
      const fullName = metadata.full_name || email.split('@')[0];
      const currentDate = new Date();
      const membershipDate = currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      // Check if member already exists for this user
      const existingMembers = membersManager.getAll();
      const existingMember = existingMembers.find(m => m.supabaseUserId === data.user.id);
      
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
        
        membersManager.add(newMember);
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

      const existingMembers = membersManager.getAll();
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
      
      const createdMember = membersManager.add(newMember);
      return { member: createdMember, created: true };
    } catch (err) {
      console.error('Error syncing user to member:', err);
      return { error: err.message };
    }
  };

  // Get member by Supabase user ID
  const getMemberByUserId = (userId) => {
    const members = membersManager.getAll();
    return members.find(m => m.supabaseUserId === userId);
  };

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

