import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Award, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  PlayCircle,
  Download,
  Calendar,
  Target,
  BarChart3,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Globe,
  Linkedin
} from 'lucide-react';
import { membersManager, initializeData } from '../utils/dataManager';
import { useAuth } from '../contexts/AuthContext';

function ContinuingEducationMember() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user, getMemberByUserId } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMember = async () => {
      await initializeData();
      
      // Import membersManager at the start
      const { membersManager } = await import('../utils/dataManager');
      
      // If user is logged in and no memberId provided, use logged-in user's member data
      if (user && !memberId) {
        // First, try to sync from Supabase to ensure we have the latest data
        try {
          await membersManager.syncFromSupabase();
        } catch (error) {
          console.warn('Could not sync from Supabase:', error);
        }
        
        // Get member by Supabase user ID
        let memberData = getMemberByUserId(user.id);
        if (memberData) {
          setMember(memberData);
          setLoading(false);
          return;
        }
        
        // If member doesn't exist, try to find by email
        const allMembers = membersManager.getAll();
        memberData = allMembers.find(m => m.email === user.email);
        if (memberData) {
          setMember(memberData);
          setLoading(false);
          return;
        }
        
        // If still not found, try to fetch directly from Supabase
        try {
          const { membersService } = await import('../services/membersService');
          const { data: supabaseMember } = await membersService.getByUserId(user.id);
          if (supabaseMember) {
            const mappedMember = membersService.mapSupabaseToLocal(supabaseMember);
            setMember(mappedMember);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Could not fetch member from Supabase:', error);
        }
        
        // If still not found, create temporary member for logged-in users immediately
        const tempMember = {
          id: null,
          supabaseUserId: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
          email: user.email || '',
          role: 'Member',
          nationality: 'Egyptian',
          flagCode: 'eg',
          description: 'Member profile is being set up.',
          fullDescription: 'Your member profile is being created. Please check back in a moment.',
          membershipDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          isActive: false,
          activeTill: new Date().getFullYear().toString(),
          certificates: [],
          phone: '',
          location: '',
          website: '',
          linkedin: '',
          image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600',
          coursesEnrolled: 0,
          coursesCompleted: 0,
          activeCourses: [],
          completedCourses: [],
          totalHoursLearned: 0,
          totalMoneySpent: "0 EGP",
          ceUnitsLeft: 0
        };
        setMember(tempMember);
        setLoading(false);
        return;
      } else if (memberId) {
        // Use memberId from URL
        const memberData = membersManager.getAll().find(m => m.id === parseInt(memberId));
        if (memberData) {
          setMember(memberData);
        }
        setLoading(false);
      } else {
        // No user and no memberId - redirect or show error
        setLoading(false);
      }
    };
    
    loadMember();

    const handleMemberUpdate = () => {
      let updatedMember = null;
      if (user && !memberId) {
        updatedMember = getMemberByUserId(user.id);
        if (!updatedMember) {
          const allMembers = membersManager.getAll();
          updatedMember = allMembers.find(m => m.email === user.email);
        }
      } else if (memberId) {
        updatedMember = membersManager.getAll().find(m => m.id === parseInt(memberId));
      }
      if (updatedMember) {
        setMember(updatedMember);
      }
    };

    window.addEventListener('membersUpdated', handleMemberUpdate);
    return () => {
      window.removeEventListener('membersUpdated', handleMemberUpdate);
    };
  }, [memberId, user, getMemberByUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4C9A8F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading member profile...</p>
        </div>
      </div>
    );
  }


  if (!member) {
    if (!user) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
            <p className="text-gray-600 mb-6">You need to be signed in to view your continuing education profile.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    
    // Still loading or creating temp member
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4C9A8F] mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Show warning banner if member is temporary (no ID)
  const isTemporaryMember = member && member.id === null;

  // Map member data to profile format (same as MemberProfile)
  const profile = {
    name: member.name || '',
    title: member.role || '',
    image: member.image || '',
    location: member.location || '',
    email: member.email || '',
    phone: member.phone || '',
    website: member.website || '',
    linkedin: member.linkedin || '',
    activeTill: member.activeTill || '',
    memberSince: member.membershipDate || '',
  };

  // Get active and completed courses from member data
  const activeCourses = Array.isArray(member.activeCourses) ? member.activeCourses : [];
  const completedCourses = Array.isArray(member.completedCourses) ? member.completedCourses : [];

  // Map member data to accountData format for stats
  const accountData = {
    name: member.name || '',
    email: member.email || '',
    phone: member.phone || '',
    location: member.location || '',
    memberSince: member.membershipDate || '',
    specialty: member.role || '',
    image: member.image || '',
    coursesEnrolled: member.coursesEnrolled || activeCourses.length + completedCourses.length || 0,
    coursesCompleted: member.coursesCompleted !== undefined ? member.coursesCompleted : completedCourses.length,
    activeCourses: activeCourses.length,
    totalHoursLearned: member.totalHoursLearned || 0,
    totalMoneySpent: member.totalMoneySpent || "0 EGP",
    certificatesEarned: member.certificates?.length || 0,
    ceUnitsLeft: member.ceUnitsLeft || 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show warning banner if temporary member */}
      {isTemporaryMember && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-yellow-800">Member Profile Setup</h2>
                <p className="text-xs text-yellow-700 mt-1">
                  Your member profile is being created. Some features may be limited until your profile is fully set up.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cover Image */}
      <div className="relative h-64 bg-[#40867C]">
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto md:mx-0">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-2 flex-wrap">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {profile.name}
                      </h1>
                      {member.isActive !== false ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-semibold whitespace-nowrap">Active</span>
                          </div>
                          {profile.activeTill && (
                            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs font-semibold whitespace-nowrap">Till {profile.activeTill}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold whitespace-nowrap">Inactive</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xl text-[#4C9A8F] font-semibold mb-4">
                      {profile.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 justify-center md:justify-start">
                      {profile.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#4C9A8F]" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button className="flex items-center gap-2 bg-[#4C9A8F] text-white px-6 py-3 rounded-lg hover:bg-[#3d8178] transition-colors duration-200 font-semibold shadow-md">
                    <Download className="w-4 h-4" />
                    Download CV
                  </button>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </a>
                  )}
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </a>
                  )}
                  {profile.website && (
                    <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                      <Globe className="w-4 h-4" />
                      <span>{profile.website}</span>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-5 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Money Spent</p>
              <p className="text-2xl font-bold text-gray-900">{accountData.totalMoneySpent}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-5 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Courses Enrolled</p>
              <p className="text-2xl font-bold text-gray-900">{accountData.coursesEnrolled}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-5 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Hours Learned</p>
              <p className="text-2xl font-bold text-gray-900">{accountData.totalHoursLearned}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors duration-200 border-b-2 ${
                activeTab === 'active'
                  ? 'border-[#4C9A8F] text-[#4C9A8F]'
                  : 'border-transparent text-gray-600 hover:text-[#4C9A8F]'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Active Courses ({activeCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors duration-200 border-b-2 ${
                activeTab === 'completed'
                  ? 'border-[#4C9A8F] text-[#4C9A8F]'
                  : 'border-transparent text-gray-600 hover:text-[#4C9A8F]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Completed ({completedCourses.length})
            </button>
          </div>
        </div>

        {/* Active Courses */}
        {activeTab === 'active' && (
          <div className="pb-12">
            {activeCourses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Courses</h3>
                <p className="text-gray-600">You don't have any active courses yet. Contact an administrator to enroll in courses.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4 p-5">
                    <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      {course.image ? (
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        {course.category} • {course.level}
                      </p>

                      {course.lessons && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <BookOpen className="w-4 h-4 text-[#4C9A8F]" />
                            <span>{course.lessons} Lessons</span>
                          </div>
                          {course.duration && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Clock className="w-4 h-4 text-[#4C9A8F]" />
                              <span>{course.duration}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        {course.instructor && (
                          <div className="flex items-center gap-2">
                            {course.instructorImage && (
                              <img 
                                src={course.instructorImage} 
                                alt={course.instructor}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            <span className="text-xs text-gray-600">{course.instructor}</span>
                          </div>
                        )}
                        {course.price && (
                          <span className="text-xs font-semibold text-gray-900">{course.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* Completed Courses */}
        {activeTab === 'completed' && (
          <div className="pb-12">
            {completedCourses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Completed Courses</h3>
                <p className="text-gray-600">You haven't completed any courses yet. Complete your active courses to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    {course.image ? (
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-1">
                      {course.category} • {course.level}
                    </p>

                    {course.duration && (
                      <div className="bg-purple-50 rounded-lg p-3 text-center mb-4">
                        <p className="text-xs text-gray-600 mb-1">Duration</p>
                        <p className="text-xl font-bold text-purple-600">{course.duration}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                      {course.completedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(course.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                      {course.price && (
                        <span className="font-semibold text-gray-900">{course.price}</span>
                      )}
                    </div>

                    <button className="w-full bg-[#4C9A8F] hover:bg-[#3d8178] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Certificate
                    </button>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContinuingEducationMember;
