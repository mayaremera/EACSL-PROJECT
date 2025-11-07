import React from 'react';
import { Search } from 'lucide-react';
import Header from '../components/layout/Header'
import BecomeMemberForm from '../components/forms/BecomeMemberForm';

const ApplyMembershipPage = () => {
  const handleFormSubmit = (data) => {
    console.log('Form submitted:', data);
    // Handle form submission logic here
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