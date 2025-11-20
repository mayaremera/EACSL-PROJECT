import React, { useRef } from 'react';
import Header from '../components/layout/Header'
import BecomeMemberForm from '../components/forms/BecomeMemberForm';

const ApplyMembershipPage = () => {

  // Helper function to upload file to Supabase Storage
  const uploadFileToStorage = async (file, folder, fileName) => {
    if (!file) return null;
    
    try {
      const { supabase } = await import('../lib/supabase');
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${fileName}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from('MemberBucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // Check for specific error types
        if (error.message?.includes('bucket') || error.message?.includes('not found')) {
          console.warn('Supabase Storage bucket not found:', error);
          return null;
        }
        if (error.message?.includes('new row violates row-level security') || 
            error.message?.includes('RLS') ||
            error.message?.includes('row-level security policy')) {
          console.warn('Storage bucket RLS policy error:', error);
          // Return a special error object so we can show a helpful message
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            uploaded: false,
            error: 'RLS_POLICY_REQUIRED',
            errorMessage: 'Bucket requires RLS policies for public uploads. See STORAGE_RLS_POLICIES.sql'
          };
        }
        if (error.message?.includes('The resource already exists')) {
          // File already exists, try with different name
          const retryFileName = `${fileName}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const retryPath = `${folder}/${retryFileName}`;
          const { data: retryData, error: retryError } = await supabase.storage
            .from('MemberBucket')
            .upload(retryPath, file, { cacheControl: '3600', upsert: false });
          
          if (retryError) {
            console.warn('Retry upload failed:', retryError);
            return null;
          }
          
          const { data: urlData } = supabase.storage
            .from('MemberBucket')
            .getPublicUrl(retryPath);
          
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            storagePath: retryPath,
            url: urlData?.publicUrl || null,
            uploaded: true
          };
        }
        console.warn('Storage upload error:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('MemberBucket')
        .getPublicUrl(filePath);

      return {
        name: file.name,
        size: file.size,
        type: file.type,
        storagePath: filePath,
        url: urlData?.publicUrl || null,
        uploaded: true
      };
    } catch (error) {
      console.error('Exception uploading file to storage:', error);
      return null;
    }
  };

  // Helper function to convert File to base64 (fallback)
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
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

      // Check if we have RLS policy errors
      const hasRLSError = [profileImage, idImage, graduationCert, cv].some(
        file => file?.error === 'RLS_POLICY_REQUIRED'
      );

      if (hasRLSError) {
        throw new Error(
          `❌ Storage Upload Failed: Row-Level Security (RLS) Policy Required\n\n` +
          `Your MemberBucket has RLS enabled but doesn't allow public uploads.\n\n` +
          `To fix this, choose ONE of these options:\n\n` +
          `OPTION 1 (Easiest):\n` +
          `1. Go to Supabase Dashboard → Storage\n` +
          `2. Find MemberBucket\n` +
          `3. Click the bucket settings\n` +
          `4. Change visibility to "Public"\n\n` +
          `OPTION 2 (If you need Private bucket):\n` +
          `1. Go to Supabase Dashboard → SQL Editor\n` +
          `2. Run the SQL script from STORAGE_RLS_POLICIES.sql\n` +
          `3. This will add policies to allow public uploads\n\n` +
          `After fixing, try submitting the form again.`
        );
      }

      // Only use base64 fallback if storage failed AND files are small enough
      if (storageUploadFailed) {
        const totalSize = [
          data.profileImage?.size || 0,
          data.idImage?.size || 0,
          data.graduationCert?.size || 0,
          data.cv?.size || 0
        ].reduce((sum, size) => sum + size, 0);

        const maxTotalSizeForBase64 = 5 * 1024 * 1024; // 5MB max for base64 fallback (reduced to avoid localStorage issues)
        
        if (totalSize > maxTotalSizeForBase64) {
          throw new Error(
            `Unable to upload files to storage. Total file size (${(totalSize / (1024 * 1024)).toFixed(2)} MB) is too large for local storage.\n\n` +
            `Please:\n` +
            `1. Ensure MemberBucket is set to Public in Supabase Storage\n` +
            `2. Or run STORAGE_RLS_POLICIES.sql if bucket is Private\n` +
            `3. Or reduce total file size to under 5MB\n` +
            `4. Contact support if the issue persists`
          );
        }

        // Fallback to base64 for small files only
        const convertFile = async (file) => {
          if (!file) return null;
          try {
            const base64 = await fileToBase64(file);
            return {
              name: file.name,
              size: file.size,
              type: file.type,
              data: base64,
              uploaded: false
            };
          } catch (error) {
            console.error('Error converting file to base64:', error);
            throw new Error(`Failed to process ${file.name}. Please try again.`);
          }
        };

        // Fill in any missing files with base64 conversion
        if (!profileImage && data.profileImage) profileImage = await convertFile(data.profileImage);
        if (!idImage && data.idImage) idImage = await convertFile(data.idImage);
        if (!graduationCert && data.graduationCert) graduationCert = await convertFile(data.graduationCert);
        if (!cv && data.cv) cv = await convertFile(data.cv);
      } else {
        // All files uploaded to storage - only store metadata (no base64 data)
        // This keeps localStorage small
        if (!profileImage && data.profileImage) {
          profileImage = {
            name: data.profileImage.name,
            size: data.profileImage.size,
            type: data.profileImage.type,
            uploaded: false,
            error: 'Upload failed'
          };
        }
        if (!idImage && data.idImage) {
          idImage = {
            name: data.idImage.name,
            size: data.idImage.size,
            type: data.idImage.type,
            uploaded: false,
            error: 'Upload failed'
          };
        }
        if (!graduationCert && data.graduationCert) {
          graduationCert = {
            name: data.graduationCert.name,
            size: data.graduationCert.size,
            type: data.graduationCert.type,
            uploaded: false,
            error: 'Upload failed'
          };
        }
        if (!cv && data.cv) {
          cv = {
            name: data.cv.name,
            size: data.cv.size,
            type: data.cv.type,
            uploaded: false,
            error: 'Upload failed'
          };
        }
      }

      const formSubmission = {
        id: Date.now().toString(), // Generate unique ID
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

      // Get existing forms from localStorage
      let existingForms = [];
      try {
        const stored = localStorage.getItem('memberForms');
        existingForms = stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        existingForms = [];
      }
      
      // Check for duplicate submission (same email with pending status)
      const duplicateSubmission = existingForms.find(
        form => form.email === formSubmission.email && form.status === 'pending'
      );
      
      if (duplicateSubmission) {
        throw new Error(
          `You already have a pending application with email ${formSubmission.email}.\n\n` +
          `Please wait for your current application to be reviewed before submitting again.`
        );
      }
      
      // Add new submission
      existingForms.push(formSubmission);
      
      // Save back to localStorage with error handling
      // Note: If files are in Supabase Storage, we only store metadata (URLs) - much smaller
      try {
        const dataToStore = JSON.stringify(existingForms);
        const estimatedSize = new Blob([dataToStore]).size;
        
        // Check if we're storing base64 data (larger) vs storage URLs (smaller)
        const hasBase64Data = existingForms.some(form => 
          form.profileImage?.data || form.idImage?.data || 
          form.graduationCert?.data || form.cv?.data
        );
        
        if (hasBase64Data && estimatedSize > 5 * 1024 * 1024) { // 5MB warning for base64
          console.warn('Large data size detected (base64):', estimatedSize);
        }
        
        localStorage.setItem('memberForms', dataToStore);
      } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
          throw new Error(
            'Storage limit exceeded. The files you uploaded are too large.\n\n' +
            'This usually means files failed to upload to Supabase Storage.\n\n' +
            'Please:\n' +
            '1. Ensure MemberBucket is set to Public in Supabase Storage\n' +
            '2. Reduce file sizes (compress images, use smaller PDFs)\n' +
            '3. Try submitting again\n' +
            '4. Contact support if the issue persists'
          );
        } else {
          throw new Error('Failed to save form submission. Please try again.');
        }
      }
      
      // Dispatch event to notify dashboard
      window.dispatchEvent(new CustomEvent('formsUpdated', { detail: existingForms }));
      
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
    <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Apply for Membership</h1>
            <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto">
              Explore moments from our events, educational programs, and community activities
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <a href="#" className="hover:text-[#4C9A8F] transition-colors">Home</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Apply for Membership</span>
          </div>
        </div>
      </div>
      

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