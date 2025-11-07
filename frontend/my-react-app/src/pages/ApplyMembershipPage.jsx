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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      

      {/* Hero Section with Title */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src="/path-to-your-half-circle-logo.png" 
              alt="Logo" 
              className="w-16 h-16"
            />
            <h1 className="text-6xl font-bold text-black">
              Registration
            </h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-[#5A9B8E] py-4">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-2 text-white text-sm">
            <a href="#" className="hover:underline">Homepage</a>
            <span>//</span>
            <a href="#" className="hover:underline">Registration</a>
            <span>//</span>
            <span className="underline">Registration signup form</span>
          </div>
        </div>
      </div>

      {/* Form Section Title */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-black">
            Registration Signup Form
          </h2>
        </div>
      </div>

      {/* Form Container with Background */}
      <div className="relative py-16 px-8">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <BecomeMemberForm onSubmit={handleFormSubmit} />
          {/* <BecomeMemberForm onSubmit={handleFormSubmit} /> */}
          
          <div className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
            <p className="text-white text-center text-lg">
              ⬆️ Import BecomeMemberForm component here ⬆️
              <br /><br />
              In your project, uncomment the import at the top and use:
              <br />
              <code className="bg-black/40 px-3 py-1 rounded text-sm">
                &lt;BecomeMemberForm onSubmit={`{handleFormSubmit}`} /&gt;
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyMembershipPage;