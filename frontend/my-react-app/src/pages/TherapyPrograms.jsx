import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MessageCircle, Users, Baby, Brain, ClipboardList, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';
import { therapyProgramsManager } from '../utils/dataManager';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useNavigate, Link } from 'react-router-dom';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import { eventsManager } from '../utils/dataManager';
import { useAuth } from '../contexts/AuthContext';

const TherapyPrograms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        // First, load from cache for immediate display
        const cachedPrograms = therapyProgramsManager._getAllFromLocalStorage();
        if (cachedPrograms && cachedPrograms.length > 0) {
          setPrograms(cachedPrograms);
        }
        
        // Then refresh from Supabase in the background
        const allPrograms = await therapyProgramsManager.getAll();
        setPrograms(allPrograms);
      } catch (error) {
        console.error('Error loading therapy programs:', error);
        // Fallback to cached data
        const cachedPrograms = therapyProgramsManager._getAllFromLocalStorage();
        setPrograms(cachedPrograms);
      }
    };

    const loadEvent = async () => {
      try {
        // First, load from cache for immediate display
        const cachedEvents = eventsManager.getUpcomingSync();
        if (cachedEvents && cachedEvents.length > 0) {
          setCurrentEvent(cachedEvents[0]);
        }
        
        // Then refresh from Supabase in the background
        const upcomingEvents = await eventsManager.getUpcoming();
        if (upcomingEvents && upcomingEvents.length > 0) {
          setCurrentEvent(upcomingEvents[0]);
        }
      } catch (error) {
        console.error('Error loading upcoming events:', error);
      }
    };

    loadPrograms();
    loadEvent();

    // Listen for updates
    const handleProgramsUpdate = async () => {
      try {
        const allPrograms = await therapyProgramsManager.getAll();
        setPrograms(allPrograms);
      } catch (error) {
        console.error('Error loading therapy programs:', error);
        // Fallback to cached data
        const cachedPrograms = therapyProgramsManager._getAllFromLocalStorage();
        setPrograms(cachedPrograms);
      }
    };

    const handleEventsUpdate = () => {
      loadEvent();
    };

    window.addEventListener('therapyProgramsUpdated', handleProgramsUpdate);
    window.addEventListener('eventsUpdated', handleEventsUpdate);
    return () => {
      window.removeEventListener('therapyProgramsUpdated', handleProgramsUpdate);
      window.removeEventListener('eventsUpdated', handleEventsUpdate);
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

  // Scroll functions for mobile slider
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.therapy-card')?.offsetWidth || 320;
      scrollContainerRef.current.scrollBy({ left: -cardWidth - 32, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.therapy-card')?.offsetWidth || 320;
      scrollContainerRef.current.scrollBy({ left: cardWidth + 32, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="Therapy Programs"
        subtitle="برامج العلاج والخدمات المتخصصة"
        icon={<HeartHandshake className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Therapy Programs' }]} />

      {/* Programs Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {programs.length > 0 ? (
          <>
            {/* Mobile Slider - Only visible on mobile */}
            <div className="md:hidden relative">
              {/* Navigation Buttons */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} className="text-[#5A9B8E]" />
              </button>
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={24} className="text-[#5A9B8E]" />
              </button>

              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-8 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {programs.map((program) => {
                  const Icon = getIconComponent(program.icon);
                  return (
                    <div
                      key={program.id}
                      className="therapy-card flex-shrink-0 w-[85vw] max-w-[320px]"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
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
                              <Icon className="w-6 h-6 text-[#5A9B8E]" />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                          <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '20px' }}>
                            {program.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-sm" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}>
                            {program.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tablet & Desktop Grid - Hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                          <Icon className="w-6 h-6 text-[#5A9B8E]" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '20px' }}>
                        {program.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}>
                        {program.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <HeartHandshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No therapy programs available</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link 
            to="/reservation"
            className="text-sm md:text-base px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300 w-fit"
          >
            Book an Assesment
          </Link>
        </div>
      </div>

      {/* Footer CTA Section - Only show for non-signed-in users */}
      {!user && (
        <div className="bg-white border-t border-gray-200 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#5A9B8E] rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Join Our Community
              </h2>
              <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
                Become a member and be part of our growing professional community
              </p>
              <a 
                href="/apply-membership"
                className="inline-block bg-white text-[#5A9B8E] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                Become a Member
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyPrograms;