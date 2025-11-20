import React from 'react';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Briefcase } from 'lucide-react';

function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="Services"
        subtitle="Comprehensive speech-language pathology services and programs"
        icon={<Briefcase className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Services' }]} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-lg text-gray-600">Services page content will be added here.</p>
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;
