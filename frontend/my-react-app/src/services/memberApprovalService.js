import { supabase } from '../lib/supabase';
import { membersService } from './membersService';
import { membersManager } from '../utils/dataManager';

/**
 * Service to handle member application approval
 * Creates TWO types of accounts:
 * 
 * 1. Authentication Account (in auth.users):
 *    - For login capability only
 *    - Regular member (not admin/privileged)
 *    - Appears in Authentication tab
 *    - Sends confirmation email automatically
 * 
 * 2. Member Record (in members table):
 *    - Profile information
 *    - Linked to auth account via supabaseUserId
 *    - Status: PENDING until email confirmed
 *    - Status: ACTIVE after email confirmation
 *    - Appears in Members tab
 * 
 * Flow:
 * - Approval creates both accounts
 * - Confirmation email sent automatically
 * - Member status: PENDING until email confirmed
 * - Once confirmed, member can log in and view profile
 * - Member is regular (not privileged/admin)
 */
export const memberApprovalService = {
  /**
   * Approve a member application
   * @param {Object} formData - The application form data
   * @returns {Promise<{success: boolean, error?: string, memberId?: number}>}
   */
  async approveApplication(formData) {
    try {
      const { email, username, specialty, location, previousWork, profileImage, password } = formData;

      // Validate required fields
      if (!email || !username) {
        return { success: false, error: 'Missing required fields: email or username' };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if member already exists (use cached data for fast access)
      const existingMembers = membersManager._getAllFromLocalStorage();
      const existingMember = existingMembers.find(m => m.email === email);
      
      if (existingMember) {
        return { 
          success: false, 
          error: 'A member with this email already exists in the members table.' 
        };
      }

      // STEP 1: Create authentication account (for login capability)
      // This automatically sends a confirmation email
      if (!password || password.length < 6) {
        return { 
          success: false, 
          error: 'Password is required and must be at least 6 characters long.' 
        };
      }

      // Use signUp to create auth account (automatically sends confirmation email)
      // Note: This creates the account but requires email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/continuing-education`,
          data: {
            full_name: username,
            role: 'Member', // Regular member, not admin
          }
        }
      });

      if (authError) {
        console.error('Error creating authentication account:', authError);
        // Check if user already exists
        if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
          return { 
            success: false, 
            error: 'An authentication account with this email already exists.' 
          };
        }
        return { 
          success: false, 
          error: `Failed to create authentication account: ${authError.message}` 
        };
      }

      if (!authData?.user) {
        return { 
          success: false, 
          error: 'Failed to create authentication account: No user data returned' 
        };
      }

      const authUserId = authData.user.id;
      console.log('Authentication account created:', authUserId);

      // STEP 2: Create member record in members table (linked to auth account)
      const currentDate = new Date();
      const membershipDate = currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      // Extract image URL from storage or base64
      let imageUrl = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600';
      if (profileImage?.url) {
        // Use storage URL if available
        imageUrl = profileImage.url;
      } else if (profileImage?.data) {
        // Fallback to base64 if storage URL not available
        imageUrl = profileImage.data;
      }

      const memberData = {
        supabaseUserId: authUserId, // Link to authentication account
        name: username,
        email: email,
        role: 'Member', // Regular member (not admin/privileged)
        nationality: 'Egyptian', // Default, can be updated later
        flagCode: 'eg',
        description: `Member of EACSL since ${membershipDate}. ${specialty?.join(', ') || 'Member'}.`,
        fullDescription: previousWork || `${username} is a valued member of the EACSL community.`,
        membershipDate: membershipDate,
        isActive: false, // PENDING until email is confirmed
        activeTill: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).getFullYear().toString(),
        certificates: [], // Certificates are separate from specialties
        specialty: specialty || [], // Store specialties from form in specialty field
        phone: '',
        location: location || '',
        website: '',
        linkedin: '',
        image: imageUrl,
      };

      // Add member to Supabase members table (linked to auth account)
      const { data: memberResult, error: memberError } = await membersService.add(memberData);
      
      if (memberError && memberError.code !== 'TABLE_NOT_FOUND') {
        console.error('Error creating member record:', memberError);
        return { 
          success: false, 
          error: `Failed to create member record: ${memberError.message}` 
        };
      }

      // Add to local storage for immediate UI update
      // IMPORTANT: Use saveAll directly to avoid double-syncing (membersManager.add() would sync again)
      // Use cached data for fast synchronous access
      if (memberResult) {
        const mappedMember = membersService.mapSupabaseToLocal(memberResult);
        const existingMembers = membersManager._getAllFromLocalStorage();
        
        // Check if member already exists (by email or ID) to prevent duplicates
        const alreadyExists = existingMembers.some(
          m => m.email === mappedMember.email || m.id === mappedMember.id
        );
        
        if (!alreadyExists) {
          const updated = [...existingMembers, mappedMember];
          membersManager.saveAll(updated);
        }
      } else {
        // If Supabase table doesn't exist, add to local storage only
        const existingMembers = membersManager._getAllFromLocalStorage();
        const alreadyExists = existingMembers.some(m => m.email === memberData.email);
        
        if (!alreadyExists) {
          const tempId = existingMembers.length > 0 ? Math.max(...existingMembers.map(m => m.id)) + 1 : 1;
          const newMember = { ...memberData, id: tempId };
          const updated = [...existingMembers, newMember];
          membersManager.saveAll(updated);
        }
      }

      // Get the member ID (from Supabase or local storage)
      const finalMemberId = memberResult?.id || 
        (memberResult ? membersService.mapSupabaseToLocal(memberResult).id : null);

      // Build success message
      let successMessage = `Member approved successfully!\n\n`;
      successMessage += `✅ Authentication account created (ID: ${authUserId})\n`;
      successMessage += `✅ Member record created (ID: ${finalMemberId || 'N/A'})\n`;
      successMessage += `✅ Confirmation email sent to ${email}\n\n`;
      successMessage += `Account Status: PENDING (until email is confirmed)\n\n`;
      successMessage += `What happens next:\n`;
      successMessage += `1. Member receives confirmation email\n`;
      successMessage += `2. Member clicks confirmation link\n`;
      successMessage += `3. Member status changes to ACTIVE\n`;
      successMessage += `4. Member can log in and view their profile\n\n`;
      successMessage += `Account Types:\n`;
      successMessage += `- Authentication Account: Regular member (for login only)\n`;
      successMessage += `- Member Account: Profile information (linked to auth account)\n`;
      successMessage += `- Both accounts are regular members (not admin/privileged)\n`;

      return { 
        success: true, 
        memberId: finalMemberId,
        message: successMessage
      };

    } catch (error) {
      console.error('Exception in approveApplication:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred while approving the application' 
      };
    }
  },

};

