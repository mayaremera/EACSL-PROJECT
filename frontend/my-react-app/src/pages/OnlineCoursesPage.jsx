import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, X, Clock, Users, Search, ChevronDown, Star, ArrowRight, Filter } from 'lucide-react';

const OnlineCoursesPage = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedCourse(null);
      }
    };

    if (selectedCourse) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedCourse]);

  const courses = [
    {
      id: 1,
      title: "Fundamentals of Speech and Language Therapy",
      category: "Speech Therapy",
      level: "Beginner",
      duration: "8 weeks",
      lessons: 24,
      students: 156,
      rating: 4.8,
      price: "2,500 EGP",
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
      instructor: "Dr. Sarah Ahmed",
      instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      description: "Comprehensive course covering speech and language therapy fundamentals for beginners"
    },
    {
      id: 2,
      title: "Autism Spectrum Disorders: Assessment & Intervention",
      category: "Autism",
      level: "Intermediate",
      duration: "10 weeks",
      lessons: 30,
      students: 203,
      rating: 4.9,
      price: "3,200 EGP",
      image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80",
      instructor: "Dr. Mohamed Hassan",
      instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      description: "Advanced course in autism spectrum disorder assessment and treatment"   
    },
    {
      id: 3,
      title: "Dysphagia Management",
      category: "Dysphagia",
      level: "Advanced",
      duration: "6 weeks",
      lessons: 18,
      students: 89,
      rating: 4.7,
      price: "2,800 EGP",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
      instructor: "Dr. Layla Ibrahim",
      instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      description: "Advanced techniques in dysphagia diagnosis and treatment"
    },
    {
      id: 4,
      title: "Fluency Disorders and Stuttering",
      category: "Fluency Disorders",
      level: "Intermediate",
      duration: "8 weeks",
      lessons: 22,
      students: 134,
      rating: 4.6,
      price: "2,700 EGP",
      image: "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?w=600&q=80",
      instructor: "Dr. Ahmed Ali",
      instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      description: "Comprehensive course in fluency disorder assessment and treatment"
    },
    {
      id: 5,
      title: "Child Language Development",
      category: "Language Development",
      level: "Beginner",
      duration: "6 weeks",
      lessons: 20,
      students: 245,
      rating: 4.8,
      price: "2,300 EGP",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
      instructor: "Dr. Fatima Khaled",
      instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      description: "Study of normal language development stages in children"
    },
    {
      id: 6,
      title: "Voice and Laryngeal Disorders",
      category: "Voice Disorders",
      level: "Advanced",
      duration: "7 weeks",
      lessons: 21,
      students: 98,
      rating: 4.7,
      price: "3,000 EGP",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
      instructor: "Dr. Karim Nasser",
      instructorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      description: "Diagnosis and treatment of voice and laryngeal disorders"
    },
    {
      id: 7,
      title: "Aphasia: Diagnosis and Rehabilitation",
      category: "Aphasia",
      level: "Intermediate",
      duration: "9 weeks",
      lessons: 27,
      students: 167,
      rating: 4.9,
      price: "3,100 EGP",
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
      instructor: "Dr. Nour Hassan",
      instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      description: "Comprehensive program in aphasia diagnosis and rehabilitation"
    },
    {
      id: 8,
      title: "Augmentative and Alternative Communication",
      category: "AAC",
      level: "Intermediate",
      duration: "7 weeks",
      lessons: 19,
      students: 112,
      rating: 4.8,
      price: "2,900 EGP",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
      instructor: "Dr. Maha Fathy",
      instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      description: "Using AAC techniques in therapy"
    },
    {
      id: 9,
      title: "Speech Therapy for Hearing Impaired Children",
      category: "Hearing Impairment",
      level: "Advanced",
      duration: "10 weeks",
      lessons: 28,
      students: 145,
      rating: 4.9,
      price: "3,400 EGP",
      image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&q=80",
      instructor: "Dr. Omar Saleh",
      instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      description: "Specialized speech therapy techniques for hearing impaired children"
    }
  ];

  const categories = [
    { value: 'all', label: 'All Courses' },
    { value: 'Speech Therapy', label: 'Speech Therapy' },
    { value: 'Autism', label: 'Autism' },
    { value: 'Dysphagia', label: 'Dysphagia' },
    { value: 'Fluency Disorders', label: 'Fluency' },
    { value: 'Language Development', label: 'Language Dev' },
    { value: 'Voice Disorders', label: 'Voice' },
    { value: 'Aphasia', label: 'Aphasia' },
    { value: 'AAC', label: 'AAC' }
  ];

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <BookOpen className="w-12 h-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Online Courses</h1>
            <p className="text-base text-teal-50">
              Professional Development Courses
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <a href="#" className="hover:text-[#4C9A8F]">Home</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Courses</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none appearance-none bg-white text-sm pr-10"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Level Dropdown */}
            <div className="relative w-full lg:w-44">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none appearance-none bg-white text-sm pr-10"
              >
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5">
          <p className="text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              onClick={() => setSelectedCourse(course)}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-[#4C9A8F] text-white text-xs font-semibold rounded">
                    {course.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 bg-white/90 text-gray-800 text-xs font-semibold rounded">
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 leading-snug">
                  {course.title}
                </h3>

                <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#4C9A8F]" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#4C9A8F]" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold text-gray-900">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Users className="w-3.5 h-3.5" />
                    <span>{course.students} students</span>
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={course.instructorImage}
                      alt={course.instructor}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-gray-900">{course.instructor}</span>
                  </div>
                  <span className="text-sm font-bold text-[#4C9A8F]">{course.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No courses found</p>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center z-10 shadow-md"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <div className="relative h-56 overflow-hidden">
              <img
                src={selectedCourse.image}
                alt={selectedCourse.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-teal-50 text-[#4C9A8F] text-xs font-semibold rounded-full">
                  {selectedCourse.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                  {selectedCourse.level}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{selectedCourse.rating}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedCourse.title}
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-[#4C9A8F]" />
                  <span className="text-gray-700">{selectedCourse.lessons} Lessons</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[#4C9A8F]" />
                  <span className="text-gray-700">{selectedCourse.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-[#4C9A8F]" />
                  <span className="text-gray-700">{selectedCourse.students} Students</span>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-gray-700">{selectedCourse.description}</p>
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCourse.instructorImage}
                    alt={selectedCourse.instructor}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Instructor</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedCourse.instructor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#4C9A8F]">{selectedCourse.price}</p>
                  <button className="mt-2 bg-[#4C9A8F] hover:bg-[#3d8178] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                    Enroll Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="bg-white border-t py-10 mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Join Our Learning Community
            </h2>
            <p className="text-teal-50 mb-5">
              Start your professional development journey today
            </p>
            <button className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-6 py-2.5 rounded-lg font-semibold transition-colors">
              Become a Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineCoursesPage;