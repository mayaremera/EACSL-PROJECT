import React, { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { filterMembers } from '../data/members';
import { membersManager } from '../utils/dataManager';
import MemberCard from '../components/cards/MemberCard';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';

function MembersOverviewPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);

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

  // Filter members using helper function
  const filteredMembers = filterMembers({
    searchTerm: searchTerm
  }, members);

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
                  placeholder="Search members by name, role... | ابحث عن الأعضاء بالاسم أو الدور..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <MemberCard key={member.id} {...member} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No members found matching your criteria</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
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