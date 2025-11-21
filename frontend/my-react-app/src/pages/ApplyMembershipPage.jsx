import React, { useRef } from 'react';
import Header from '../components/layout/Header'
import BecomeMemberForm from '../components/forms/BecomeMemberForm';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { UserPlus } from 'lucide-react';
import { membershipFormsService } from '../services/membershipFormsService';

const ApplyMembershipPage = () => {

  // Helper function to upload file to Supabase Storage using the service
  const uploadFileToStorage = async (file, folder, fileName) => {
    if (!file) return null;
    
    try {
      const result = await membershipFormsService.uploadFile(file, folder, fileName);
      
      if (result.error) {
        // Return error info so caller can handle it
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          uploaded: false,
          error: result.error.code || 'UPLOAD_ERROR',
          errorMessage: result.error.message || 'Upload failed',
          bucketName: 'member-forms-bucket'
        };
      }
      
      if (result.path && result.url) {
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          storagePath: result.path,
          url: result.url,
          uploaded: true
        };
      }
      
      return null;
    } catch (error) {
      console.error('Exception uploading file to storage:', error);
      return null;
    }
  };


  // Add a ref to track last submission time to prevent rapid duplicate submissions
  const lastSubmissionRef = useRef(null);
  
  const handleFormSubmit = async (data) => {
    try {
      // Prevent duplicate submissions within 2 seconds
      const now = Date.now();
      if (lastSubmissionRef.current && (now - lastSubmissionRef.current) < 2000) {
        throw new Error('Please wait a moment before submitting again.');
      }
      lastSubmissionRef.current = now;
      
      // PRIORITY: Upload files to Supabase Storage first
      // This avoids localStorage size limits
      let profileImage, idImage, graduationCert, cv;
      let storageUploadFailed = false;
      
      try {
        const uploadPromises = [
          uploadFileToStorage(data.profileImage, 'profile-images', 'profile'),
          uploadFileToStorage(data.idImage, 'id-cards', 'id'),
          uploadFileToStorage(data.graduationCert, 'certificates', 'cert'),
          uploadFileToStorage(data.cv, 'cvs', 'cv')
        ];
        
        [profileImage, idImage, graduationCert, cv] = await Promise.all(uploadPromises);
        
        // Check if any uploads failed
        const files = [data.profileImage, data.idImage, data.graduationCert, data.cv];
        const uploads = [profileImage, idImage, graduationCert, cv];
        storageUploadFailed = files.some((file, index) => file && !uploads[index]);
        
      } catch (storageError) {
        console.error('Storage upload error:', storageError);
        storageUploadFailed = true;
      }

      // Check if we have bucket not found errors
      const hasBucketError = [profileImage, idImage, graduationCert, cv].some(
        file => file?.error === 'BUCKET_NOT_FOUND'
      );
      
      if (hasBucketError) {
        throw new Error(
          `❌ Storage Bucket Not Found\n\n` +
          `The bucket "member-forms-bucket" does not exist in Supabase Storage.\n\n` +
          `To fix this:\n` +
          `1. Go to Supabase Dashboard → Storage\n` +
          `2. Create a new bucket named: "member-forms-bucket"\n` +
          `3. Set it to Public\n` +
          `4. Try submitting again\n\n` +
          `See MEMBERSHIP_FORMS_SUPABASE_SETUP.md for detailed instructions.`
        );
      }

      // Check if we have RLS policy errors
      const hasRLSError = [profileImage, idImage, graduationCert, cv].some(
        file => file?.error === 'RLS_POLICY_REQUIRED'
      );

      if (hasRLSError) {
        throw new Error(
          `❌ Storage Upload Failed: Row-Level Security (RLS) Policy Required\n\n` +
          `Your storage bucket has RLS enabled but doesn't allow public uploads.\n\n` +
          `To fix this, choose ONE of these options:\n\n` +
          `OPTION 1 (Easiest):\n` +
          `1. Go to Supabase Dashboard → Storage\n` +
          `2. Find member-forms-bucket\n` +
          `3. Click the bucket settings\n` +
          `4. Change visibility to "Public"\n\n` +
          `OPTION 2 (If you need Private bucket):\n` +
          `1. Go to Supabase Dashboard → Storage → Policies\n` +
          `2. Create policies to allow public uploads\n` +
          `3. See MEMBERSHIP_FORMS_SUPABASE_SETUP.md for details\n\n` +
          `After fixing, try submitting the form again.`
        );
      }

      // All files must be uploaded to storage - no base64 fallback
      // Check if any required file failed to upload
      const requiredFiles = [
        { file: data.profileImage, upload: profileImage, name: 'Profile Image' },
        { file: data.idImage, upload: idImage, name: 'ID Card' },
        { file: data.graduationCert, upload: graduationCert, name: 'Graduation Certificate' },
        { file: data.cv, upload: cv, name: 'CV' }
      ];

      const failedFiles = requiredFiles.filter(
        ({ file, upload }) => file && (!upload || !upload.uploaded)
      );

      if (failedFiles.length > 0) {
        const failedNames = failedFiles.map(f => f.name).join(', ');
        throw new Error(
          `Failed to upload the following files: ${failedNames}\n\n` +
          `Please ensure:\n` +
          `1. The "member-forms-bucket" exists in Supabase Storage\n` +
          `2. The bucket is set to Public\n` +
          `3. Your internet connection is stable\n` +
          `4. File sizes are within limits (max 5MB each)\n\n` +
          `Please try again.`
        );
      }

      // Prepare form submission data
      const formSubmission = {
        username: data.username,
        email: data.email,
        password: data.password, // Store password for account creation on approval
        specialty: data.specialty,
        previousWork: data.previousWork,
        submittedAt: new Date().toISOString(),
        status: 'pending', // All new submissions start as pending
        profileImage,
        idImage,
        graduationCert,
        cv
      };

      // Save to Supabase instead of localStorage
      const result = await membershipFormsService.add(formSubmission);

      if (result.error) {
        // Handle specific errors
        if (result.error.code === 'TABLE_NOT_FOUND') {
          throw new Error(
            `❌ Database Table Not Found\n\n` +
            `The membership_forms table does not exist in Supabase.\n\n` +
            `To fix this:\n` +
            `1. Go to Supabase Dashboard → SQL Editor\n` +
            `2. Run the SQL script from CREATE_MEMBERSHIP_FORMS_TABLE.sql\n` +
            `3. Try submitting again\n\n` +
            `See MEMBERSHIP_FORMS_SUPABASE_SETUP.md for detailed instructions.`
          );
        }
        
        if (result.error.code === 'DUPLICATE_EMAIL') {
          throw new Error(result.error.message);
        }

        throw new Error(
          `Failed to save form submission: ${result.error.message || 'Unknown error'}\n\n` +
          `Please try again or contact support.`
        );
      }

      // Dispatch event to notify dashboard
      window.dispatchEvent(new CustomEvent('formsUpdated', { detail: [result.data] }));
      
      // Return success - form component will show success message
      return { success: true };
    } catch (error) {
      console.error('Form submission error:', error);
      // Re-throw the error so the form component can handle it
      throw error;
    }
  };

  return (

    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <PageHero
        title="Apply for Membership"
        subtitle="Join our professional community and become part of EACSL"
        icon={<UserPlus className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Become a Member' }]} />
      

      {/* Form Container with Background */}
      <div className="relative py-16 px-8">
        <div className="relative z-10 max-w-7xl mx-auto bg-white ">
          <BecomeMemberForm onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default ApplyMembershipPage;