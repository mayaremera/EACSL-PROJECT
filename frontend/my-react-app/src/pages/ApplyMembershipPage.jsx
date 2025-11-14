import React from 'react';
import Header from '../components/layout/Header'
import BecomeMemberForm from '../components/forms/BecomeMemberForm';

const ApplyMembershipPage = () => {

  // Helper function to convert File to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFormSubmit = async (data) => {
    try {
      // Convert File objects to base64 for storage
      const convertFile = async (file) => {
        if (!file) return null;
        try {
          const base64 = await fileToBase64(file);
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64 // Store base64 data for downloading
          };
        } catch (error) {
          console.error('Error converting file to base64:', error);
          throw new Error(`Failed to process ${file.name}. Please try again.`);
        }
      };

      // Convert all files to base64
      const [profileImage, idImage, graduationCert, cv] = await Promise.all([
        convertFile(data.profileImage),
        convertFile(data.idImage),
        convertFile(data.graduationCert),
        convertFile(data.cv)
      ]);

      const formSubmission = {
        id: Date.now().toString(), // Generate unique ID
        username: data.username,
        email: data.email,
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
      
      // Add new submission
      existingForms.push(formSubmission);
      
      // Save back to localStorage with error handling
      try {
        const dataToStore = JSON.stringify(existingForms);
        // Check approximate size (base64 is ~33% larger than original)
        const estimatedSize = new Blob([dataToStore]).size;
        if (estimatedSize > 4 * 1024 * 1024) { // 4MB warning
          console.warn('Large data size detected:', estimatedSize);
        }
        
        localStorage.setItem('memberForms', dataToStore);
      } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
          throw new Error('Storage limit exceeded. The files you uploaded are too large. Please reduce file sizes and try again.');
        } else {
          throw new Error('Failed to save form submission. Please try again.');
        }
      }
      
      // Dispatch event to notify dashboard
      window.dispatchEvent(new CustomEvent('formsUpdated', { detail: existingForms }));
      
      // Success modal is shown by the form component itself
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