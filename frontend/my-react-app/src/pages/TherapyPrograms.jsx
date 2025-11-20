import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, Users, Baby, Brain, ClipboardList } from 'lucide-react';
import { therapyProgramsManager } from '../utils/dataManager';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';

const TherapyPrograms = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const loadPrograms = () => {
      const allPrograms = therapyProgramsManager.getAll();
      setPrograms(allPrograms);
    };

    loadPrograms();

    // Listen for updates
    const handleProgramsUpdate = () => {
      loadPrograms();
    };

    window.addEventListener('therapyProgramsUpdated', handleProgramsUpdate);
    return () => {
      window.removeEventListener('therapyProgramsUpdated', handleProgramsUpdate);
    };
  }, []);

  // Map icon string to component
  const getIconComponent = (iconName) => {
    const iconMap = {
      MessageCircle,
      Users,
      Baby,
      Brain,
      ClipboardList,
    };
    return iconMap[iconName] || MessageCircle;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="Therapy Programs"
        subtitle="برامج العلاج والخدمات المتخصصة"
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Services', path: '/services' }, { label: 'Therapy Programs' }]} />

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => {
            const Icon = getIconComponent(program.icon);
            return (
              <div
                key={program.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImagePlaceholder
                    src={program.image || program.imageUrl}
                    alt={program.title}
                    name={program.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-white p-3 rounded-full shadow-lg">
                      <Icon className="w-6 h-6 text-[#4C9A8F]" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6" dir="rtl">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {program.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button 
            onClick={() => navigate('/reservation', { replace: true })}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Calendar size={20} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Become a member and be part of our growing professional community
            </p>
            <a href="/apply-membership" className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapyPrograms;