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

function ContinuingEducationMember() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
    const memberData = membersManager.getAll().find(m => m.id === parseInt(memberId));
    if (memberData) {
      setMember(memberData);
    }
    setLoading(false);

    const handleMemberUpdate = () => {
      const updatedMember = membersManager.getAll().find(m => m.id === parseInt(memberId));
      if (updatedMember) {
        setMember(updatedMember);
      }
    };

    window.addEventListener('membersUpdated', handleMemberUpdate);
    return () => {
      window.removeEventListener('membersUpdated', handleMemberUpdate);
    };
  }, [memberId]);

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Member Not Found</h1>
          <p className="text-gray-600 mb-6">The member profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/active-members')}
            className="px-6 py-3 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

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

  // Map member data to accountData format for stats
  const accountData = {
    name: member.name || '',
    email: member.email || '',
    phone: member.phone || '',
    location: member.location || '',
    memberSince: member.membershipDate || '',
    specialty: member.role || '',
    image: member.image || '',
    coursesEnrolled: member.coursesEnrolled || 0,
    coursesCompleted: member.coursesCompleted || 0,
    activeCourses: member.activeCourses || 0,
    totalHoursLearned: member.totalHoursLearned || 0,
    totalMoneySpent: member.totalMoneySpent || "0 EGP",
    certificatesEarned: member.certificates?.length || 0,
    ceUnitsLeft: member.ceUnitsLeft || 0
  };

  const activeCourses = [
    {
      id: 1,
      titleAr: "أساسيات علاج النطق واللغة",
      titleEn: "Fundamentals of Speech and Language Therapy",
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
      instructor: "Dr. Sarah Ahmed",
      instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      lessonsCompleted: 16,
      totalLessons: 24,
      hoursCompleted: 12,
      totalHours: 18,
      dueDate: "Dec 15, 2024",
      price: "2,500 EGP"
    },
    {
      id: 2,
      titleAr: "اضطرابات طيف التوحد: التقييم والتدخل",
      titleEn: "Autism Spectrum Disorders: Assessment & Intervention",
      image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80",
      instructor: "Dr. Mohamed Hassan",
      instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      lessonsCompleted: 12,
      totalLessons: 30,
      hoursCompleted: 8,
      totalHours: 20,
      dueDate: "Jan 10, 2025",
      price: "3,200 EGP"
    }
  ];

  const completedCourses = [
    {
      id: 5,
      titleAr: "تطور اللغة عند الأطفال",
      titleEn: "Child Language Development",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
      instructor: "Dr. Fatima Khaled",
      completedDate: "Oct 15, 2024",
      totalHours: 12,
      certificate: true,
      price: "2,300 EGP"
    },
    {
      id: 6,
      titleAr: "اضطرابات الصوت والحنجرة",
      titleEn: "Voice and Laryngeal Disorders",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
      instructor: "Dr. Karim Nasser",
      completedDate: "Sep 20, 2024",
      totalHours: 14,
      certificate: true,
      price: "3,000 EGP"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4 p-5">
                    <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <img 
                        src={course.image} 
                        alt={course.titleEn}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {course.titleAr}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        {course.titleEn}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <BookOpen className="w-4 h-4 text-[#4C9A8F]" />
                          <span>{course.lessonsCompleted}/{course.totalLessons} Lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-4 h-4 text-[#4C9A8F]" />
                          <span>{course.hoursCompleted}/{course.totalHours}h</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <img 
                            src={course.instructorImage} 
                            alt={course.instructor}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs text-gray-600">{course.instructor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Courses */}
        {activeTab === 'completed' && (
          <div className="pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.titleEn}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.titleAr}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-1">
                      {course.titleEn}
                    </p>

                    <div className="bg-purple-50 rounded-lg p-3 text-center mb-4">
                      <p className="text-xs text-gray-600 mb-1">Hours</p>
                      <p className="text-xl font-bold text-purple-600">{course.totalHours}h</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{course.completedDate}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{course.price}</span>
                    </div>

                    {course.certificate && (
                      <button className="w-full bg-[#4C9A8F] hover:bg-[#3d8178] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download Certificate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContinuingEducationMember;
