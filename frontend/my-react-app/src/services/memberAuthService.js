import { supabase } from '../lib/supabase';

/**
 * Service for managing member authentication accounts
 */
export const memberAuthService = {
  /**
   * Create an authentication account for a member and send password setup email
   * @param {string} email - Member's email address
   * @param {string} name - Member's name
   * @returns {Promise<{success: boolean, userId?: string, error?: string}>}
   */
  async createAuthAccountAndSendPasswordEmail(email, name) {
    try {
      // Validate email
      if (!email || !email.trim()) {
        return { success: false, error: 'Email is required' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Generate a secure random temporary password
      // This password will be immediately reset via email, so it doesn't matter
      const tempPassword = this.generateSecurePassword();

      // Step 1: Create the auth account with signUp
      // This creates the account but requires email confirmation
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/set-password`,
          data: {
            full_name: name || email.split('@')[0],
            role: 'Member',
          }
        }
      });

      if (signUpError) {
        // Check if user already exists
        const errorMsg = signUpError.message?.toLowerCase() || '';
        if (errorMsg.includes('already') || 
            errorMsg.includes('registered') || 
            errorMsg.includes('exists') ||
            signUpError.status === 400) {
          // User already exists - try to send password reset email instead
          console.log('User already exists, sending password reset email instead...');
          return await this.sendPasswordResetEmail(email);
        }
        return { success: false, error: signUpError.message || 'Failed to create authentication account' };
      }

      if (!signUpData?.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Step 2: Send password reset email so they can set their own password
      // This will send an email with a link to set their password
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/set-password`,
      });

      if (resetError) {
        console.warn('Failed to send password reset email:', resetError);
        // Account was created, but email sending failed
        // Still return success since the account exists and they can use "Forgot Password"
        return { 
          success: true, 
          userId: signUpData.user.id,
          warning: 'Account created but password email failed. User can use "Forgot Password" to set their password.'
        };
      }

      return { 
        success: true, 
        userId: signUpData.user.id,
        message: 'Authentication account created and password setup email sent successfully'
      };

    } catch (err) {
      console.error('Exception creating auth account:', err);
      return { success: false, error: err.message || 'An unexpected error occurred' };
    }
  },

  /**
   * Send password reset email to existing user
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendPasswordResetEmail(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/set-password`,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to send password reset email' };
      }

      return { 
        success: true, 
        message: 'Password setup email sent successfully. The user can set their password via the email link.'
      };
    } catch (err) {
      console.error('Exception sending password reset email:', err);
      return { success: false, error: err.message || 'An unexpected error occurred' };
    }
  },

  /**
   * Generate a secure random password
   * @returns {string}
   */
  generateSecurePassword() {
    // Generate a secure random password (32 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    for (let i = 0; i < 32; i++) {
      password += chars[array[i] % chars.length];
    }
    return password;
  },

  /**
   * Check if an email already has an authentication account
   * @param {string} email - Email to check
   * @returns {Promise<{exists: boolean, error?: string}>}
   */
  async checkAuthAccountExists(email) {
    try {
      // Try to sign in with a dummy password to check if account exists
      // This is a workaround since we can't directly check from frontend
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: 'dummy_check_password_12345!@#$'
      });

      // If error is "Invalid login credentials", account exists but password is wrong
      // If error is "Email not confirmed", account exists
      // If error is "User not found", account doesn't exist
      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('invalid') || errorMsg.includes('wrong') || errorMsg.includes('not confirmed')) {
          return { exists: true };
        }
        if (errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
          return { exists: false };
        }
      }

      // If no error, account exists (shouldn't happen with dummy password)
      return { exists: true };
    } catch (err) {
      console.error('Exception checking auth account:', err);
      return { exists: false, error: err.message };
    }
  }
};

