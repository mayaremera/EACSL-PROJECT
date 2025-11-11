import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, X, Clock, Users, Search, ChevronDown, Star, ArrowRight, Filter } from 'lucide-react';
import { getCategories, getLevels } from '../data/courses';
import { coursesManager } from '../utils/dataManager';
import CourseCard from '../components/cards/CourseCard';

const OnlineCoursesPage = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    const loadCourses = () => {
      setCourses(coursesManager.getAll());
    };
    
    loadCourses();
    window.addEventListener('coursesUpdated', (e) => {
      setCourses(e.detail);
    });

    return () => {
      window.removeEventListener('coursesUpdated', loadCourses);
    };
  }, []);

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

  // Dynamic categories and levels from data
  const categories = [
    { value: 'all', label: 'All Courses' },
    ...getCategories()
  ];

  const levels = [
    { value: 'all', label: 'All Levels' },
    ...getLevels()
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
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => setSelectedCourse(course)}
            />
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