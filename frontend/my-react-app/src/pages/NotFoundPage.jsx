import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="404"
        subtitle="Page Not Found"
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: '404' }]} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-block bg-[#5A9B8E] text-white rounded-full p-8 mb-6">
              <Search className="w-24 h-24 mx-auto" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] hover:bg-[#5A9B8E] hover:text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/" className="text-[#5A9B8E] hover:text-[#4A8B7E] transition-colors">Home</Link>
              <Link to="/about" className="text-[#5A9B8E] hover:text-[#4A8B7E] transition-colors">About</Link>
              <Link to="/upcoming-events" className="text-[#5A9B8E] hover:text-[#4A8B7E] transition-colors">Events</Link>
              <Link to="/members-overview" className="text-[#5A9B8E] hover:text-[#4A8B7E] transition-colors">Members</Link>
              <Link to="/education" className="text-[#5A9B8E] hover:text-[#4A8B7E] transition-colors">Education</Link>
              <Link to="/services" className="text-[#5A9B8E] hover:text-[#4A8B7E] transition-colors">Services</Link>
              <Link to="/contact" className="text-[#5A9B8E] hover:text-[#4A8B7E] transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
