import React from 'react';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { GraduationCap } from 'lucide-react';

function EducationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="Education"
        subtitle="Professional development courses, training programs, and educational resources"
        icon={<GraduationCap className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Education' }]} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-lg text-gray-600">Education page content will be added here.</p>
        </div>
      </div>
    </div>
  );
}

export default EducationPage;
