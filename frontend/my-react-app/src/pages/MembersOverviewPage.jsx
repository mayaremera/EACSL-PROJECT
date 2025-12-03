import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, ChevronLeft, ChevronRight, MapPin, Briefcase } from 'lucide-react';
import { filterMembers, getLocations, getSpecialties } from '../data/members';
import { membersManager } from '../utils/dataManager';
import MemberCard from '../components/cards/MemberCard';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';

function MembersOverviewPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [members, setMembers] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        // First, load from cache for immediate display
        const cachedMembers = membersManager._getAllFromLocalStorage();
        if (cachedMembers && cachedMembers.length > 0) {
          setMembers(cachedMembers);
        }
        
        // Then refresh from Supabase in the background
        const allMembers = await membersManager.getAll();
        setMembers(allMembers);
      } catch (error) {
        console.error('Error loading members:', error);
        // Fallback to cached data
        const cachedMembers = membersManager._getAllFromLocalStorage();
        setMembers(cachedMembers);
      }
    };
    
    loadMembers();
    
    const handleMembersUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setMembers(e.detail);
      } else {
        loadMembers();
      }
    };
    
    window.addEventListener('membersUpdated', handleMembersUpdate);

    return () => {
      window.removeEventListener('membersUpdated', handleMembersUpdate);
    };
  }, []);

  // Get available locations and specialties from current members
  const availableLocations = getLocations(members);
  const availableSpecialties = getSpecialties();

  // Filter members using helper function
  const filteredMembers = filterMembers({
    searchTerm: searchTerm,
    location: locationFilter,
    specialty: specialtyFilter
  }, members);

  // Scroll functions for mobile slider
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.member-card')?.offsetWidth || 320;
      scrollContainerRef.current.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.member-card')?.offsetWidth || 320;
      scrollContainerRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="Our Members"
        subtitle="Meet our professional community of speech-language pathologists and experts"
        icon={<Users className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Our Members' }]} />

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search members by name, role, location... | ابحث عن الأعضاء بالاسم أو الدور أو الموقع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            
            {/* Location Filter */}
            {availableLocations.length > 1 && (
              <div className="md:w-64">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm appearance-none bg-white cursor-pointer"
                  >
                    {availableLocations.map((location) => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Specialty Filter */}
            <div className="md:w-64">
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm appearance-none bg-white cursor-pointer"
                >
                  {availableSpecialties.map((specialty) => (
                    <option key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
            {(locationFilter !== 'all' || specialtyFilter !== 'all') && (
              <span className="ml-2 text-[#5A9B8E] font-medium">
                • Filters: 
                {locationFilter !== 'all' && (
                  <span> {availableLocations.find(l => l.value === locationFilter)?.label || locationFilter}</span>
                )}
                {specialtyFilter !== 'all' && (
                  <span>{locationFilter !== 'all' ? ', ' : ' '}{availableSpecialties.find(s => s.value === specialtyFilter)?.label || specialtyFilter}</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Members Cards */}
        {filteredMembers.length > 0 ? (
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
                className="flex gap-6 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="member-card flex-shrink-0 w-[75vw] max-w-[280px]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <MemberCard {...member} compact={true} />
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet & Desktop Grid - Hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3">
              {filteredMembers.map((member) => (
                <MemberCard key={member.id} {...member} compact={true} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No members found matching your criteria</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Footer CTA Section */}
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
    </div>
  );
}

export default MembersOverviewPage;