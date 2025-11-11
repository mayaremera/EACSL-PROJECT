import React, { useState } from 'react';
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
  Edit2
} from 'lucide-react';

function ContinuingEducationMember() {
  const [activeTab, setActiveTab] = useState('active');

  // User account data
  const accountData = {
    name: "Dr. Ahmed Hassan",
    email: "ahmed.hassan@eacsl.net",
    phone: "+20 123 456 7890",
    location: "Cairo, Egypt",
    memberSince: "January 2020",
    specialty: "Cardiothoracic Surgery",
    image: "https://images.unsplash.com/photo-1637059824899-a441006a6875?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600",
    coursesEnrolled: 12,
    coursesCompleted: 8,
    activeCourses: 4,
    totalHoursLearned: 245,
    totalMoneySpent: "28,500 EGP",
    certificatesEarned: 8,
    ceUnitsLeft: 15
  };

  // Active courses with progress
  const activeCourses = [
    {
      id: 1,
      titleAr: "أساسيات علاج النطق واللغة",
      titleEn: "Fundamentals of Speech and Language Therapy",
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
      instructor: "Dr. Sarah Ahmed",
      instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      progress: 65,
      lessonsCompleted: 16,
      totalLessons: 24,
      hoursCompleted: 12,
      totalHours: 18,
      nextLesson: "Advanced Articulation Techniques",
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
      progress: 40,
      lessonsCompleted: 12,
      totalLessons: 30,
      hoursCompleted: 8,
      totalHours: 20,
      nextLesson: "Behavioral Intervention Strategies",
      dueDate: "Jan 10, 2025",
      price: "3,200 EGP"
    },
    {
      id: 3,
      titleAr: "علاج اضطرابات البلع",
      titleEn: "Dysphagia Management",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
      instructor: "Dr. Layla Ibrahim",
      instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      progress: 80,
      lessonsCompleted: 14,
      totalLessons: 18,
      hoursCompleted: 10,
      totalHours: 12,
      nextLesson: "Clinical Assessment Protocol",
      dueDate: "Nov 30, 2024",
      price: "2,800 EGP"
    },
    {
      id: 4,
      titleAr: "اضطرابات الطلاقة والتلعثم",
      titleEn: "Fluency Disorders and Stuttering",
      image: "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?w=600&q=80",
      instructor: "Dr. Ahmed Ali",
      instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      progress: 25,
      lessonsCompleted: 5,
      totalLessons: 22,
      hoursCompleted: 4,
      totalHours: 16,
      nextLesson: "Stuttering Modification Techniques",
      dueDate: "Jan 25, 2025",
      price: "2,700 EGP"
    }
  ];

  // Completed courses
  const completedCourses = [
    {
      id: 5,
      titleAr: "تطور اللغة عند الأطفال",
      titleEn: "Child Language Development",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
      instructor: "Dr. Fatima Khaled",
      completedDate: "Oct 15, 2024",
      totalHours: 12,
      grade: "98%",
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
      grade: "95%",
      certificate: true,
      price: "3,000 EGP"
    },
    {
      id: 7,
      titleAr: "الحبسة الكلامية: التشخيص والتأهيل",
      titleEn: "Aphasia: Diagnosis and Rehabilitation",
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
      instructor: "Dr. Nour Hassan",
      completedDate: "Aug 10, 2024",
      totalHours: 18,
      grade: "97%",
      certificate: true,
      price: "3,100 EGP"
    },
    {
      id: 8,
      titleAr: "تقنيات التواصل البديل والمعزز",
      titleEn: "Augmentative and Alternative Communication",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
      instructor: "Dr. Maha Fathy",
      completedDate: "Jul 5, 2024",
      totalHours: 14,
      grade: "92%",
      certificate: true,
      price: "2,900 EGP"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Section */}
      <div className="relative h-48 bg-gradient-to-r from-[#4C9A8F] to-[#3d8178]">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img 
                    src={accountData.image} 
                    alt={accountData.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#4C9A8F] text-white rounded-full flex items-center justify-center hover:bg-[#3d8178] transition-colors shadow-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {accountData.name}
                    </h1>
                    <p className="text-lg text-[#4C9A8F] font-semibold mb-3">
                      {accountData.specialty}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#4C9A8F]" />
                        <span>{accountData.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#4C9A8F]" />
                        <span>Member Since {accountData.memberSince}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <a href={`mailto:${accountData.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>{accountData.email}</span>
                  </a>
                  <a href={`tel:${accountData.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>{accountData.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{accountData.coursesEnrolled}</p>
            <p className="text-xs text-gray-600">Total Enrolled</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{accountData.coursesCompleted}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <PlayCircle className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{accountData.activeCourses}</p>
            <p className="text-xs text-gray-600">In Progress</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{accountData.totalHoursLearned}</p>
            <p className="text-xs text-gray-600">Total Hours</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{accountData.certificatesEarned}</p>
            <p className="text-xs text-gray-600">Certificates</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-teal-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{accountData.ceUnitsLeft}</p>
            <p className="text-xs text-gray-600">CE Units Left</p>
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
                    {/* Course Image */}
                    <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <img 
                        src={course.image} 
                        alt={course.titleEn}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Course Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {course.titleAr}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        {course.titleEn}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold text-[#4C9A8F]">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#4C9A8F] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Course Stats */}
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

                      {/* Next Lesson */}
                      <div className="bg-blue-50 rounded-lg p-2.5 mb-3">
                        <p className="text-xs text-gray-600 mb-0.5">Next Lesson:</p>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{course.nextLesson}</p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <img 
                            src={course.instructorImage} 
                            alt={course.instructor}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs text-gray-600">{course.instructor}</span>
                        </div>
                        <button className="text-sm font-semibold text-[#4C9A8F] hover:text-[#3d8178] transition-colors">
                          Continue →
                        </button>
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

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 mb-1">Grade</p>
                        <p className="text-xl font-bold text-blue-600">{course.grade}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-600 mb-1">Hours</p>
                        <p className="text-xl font-bold text-purple-600">{course.totalHours}h</p>
                      </div>
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