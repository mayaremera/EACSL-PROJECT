import React, { useState, useEffect } from 'react';
import { Search, Globe } from 'lucide-react';
import { filterMembers, getNationalities } from '../data/members';
import { membersManager } from '../utils/dataManager';
import MemberCard from '../components/cards/MemberCard';
import { useActiveMembersCount } from '../hooks/useActiveMembersCount';

function ActiveMembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('all');
  const [members, setMembers] = useState([]);
  const { count: activeMembersCount } = useActiveMembersCount();

  useEffect(() => {
    const loadMembers = () => {
      setMembers(membersManager.getAll());
    };
    
    loadMembers();
    
    const handleMembersUpdated = (e) => {
      setMembers(e.detail);
    };
    
    window.addEventListener('membersUpdated', handleMembersUpdated);

    return () => {
      window.removeEventListener('membersUpdated', handleMembersUpdated);
    };
  }, []);

  // Get all active members
  const allActiveMembers = members.filter(m => m.isActive);

  // Get nationalities dynamically from data
  const nationalities = getNationalities();

  // Filter active members
  const filteredMembers = filterMembers({
    nationality: selectedNationality,
    searchTerm: searchTerm,
    isActive: true
  }, members);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Active Members</h1>
            <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto mb-4">
              Meet our active members who are making a difference in the field
            </p>
            <div className="text-3xl md:text-4xl font-bold text-white">
              {activeMembersCount} Active Members
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <a href="/" className="hover:text-[#4C9A8F] transition-colors">Home</a>
            <span className="mx-2">/</span>
            <a href="/members-overview" className="hover:text-[#4C9A8F] transition-colors">Members</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Active Members</span>
          </div>
        </div>
      </div>

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
                  placeholder="Search active members by name, role... | ابحث عن الأعضاء النشطين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Nationality Filter Dropdown */}
            <div className="md:w-72">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedNationality}
                  onChange={(e) => setSelectedNationality(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none text-sm appearance-none bg-white cursor-pointer"
                >
                  {nationalities.map((nat) => (
                    <option key={nat.value} value={nat.value}>
                      {nat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredMembers.length} of {allActiveMembers.length} active members
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
              <p className="text-gray-500 text-lg">No active members found matching your criteria</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
            </div>
          )}
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
            <a 
              href="/apply-membership"
              className="inline-block bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
            >
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActiveMembersPage;
