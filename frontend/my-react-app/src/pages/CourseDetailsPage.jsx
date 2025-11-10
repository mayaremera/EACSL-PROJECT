import React, { useState } from 'react';
import { BookOpen, Clock, Users, Star, Calendar, Award, CheckCircle, PlayCircle, FileText, MessageCircle, Globe, Video } from 'lucide-react';

const CourseDetailPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const courseData = {
    titleAr: "الدليل الكامل لتطوير المواقع الإلكترونية",
    titleEn: "Web Development Fully Complete Guideline",
    category: "Speech Therapy",
    categoryAr: "علاج النطق",
    level: "Basic",
    rating: 4.7,
    lessons: 10,
    duration: "19h 30m",
    students: 20,
    enrolled: 100,
    lectures: 80,
    skillLevel: "Basic",
    language: "English",
    classTime: "4:00 Pm 6:00 Pm",
    startDate: "Monday-Friday",
    price: "2,900 EGP",
    moneyBackGuarantee: "29-Da Money-Back Guarantee",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    instructor: "Morgan",
    instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    instructorTitle: "Senior Web Developer",
    instructorBio: "With over 10 years of experience in web development, Morgan has taught thousands of students worldwide and helped them launch successful careers in tech.",
    descriptionShort: "Master the fundamentals of modern web development with this comprehensive course designed for beginners.",
    curriculum: [
      {
        title: "Introduction to Web Development",
        lessons: [
          { name: "Welcome to the Course", duration: "5:30", type: "video" },
          { name: "Setting Up Your Environment", duration: "12:45", type: "video" },
          { name: "Understanding the Web", duration: "8:20", type: "video" }
        ]
      },
      {
        title: "HTML Fundamentals",
        lessons: [
          { name: "HTML Basics", duration: "15:30", type: "video" },
          { name: "Semantic HTML", duration: "10:15", type: "video" },
          { name: "Forms and Input", duration: "18:40", type: "video" },
          { name: "HTML Best Practices", duration: "9:25", type: "video" }
        ]
      },
      {
        title: "CSS Styling",
        lessons: [
          { name: "CSS Fundamentals", duration: "20:30", type: "video" },
          { name: "Flexbox Layout", duration: "25:15", type: "video" },
          { name: "Grid Layout", duration: "22:40", type: "video" },
          { name: "Responsive Design", duration: "28:25", type: "video" }
        ]
      },
      {
        title: "JavaScript Basics",
        lessons: [
          { name: "JavaScript Introduction", duration: "16:30", type: "video" },
          { name: "Variables and Data Types", duration: "14:15", type: "video" },
          { name: "Functions and Scope", duration: "19:40", type: "video" },
          { name: "DOM Manipulation", duration: "23:25", type: "video" }
        ]
      },
      {
        title: "Building Projects",
        lessons: [
          { name: "Project 1: Landing Page", duration: "45:30", type: "video" },
          { name: "Project 2: Portfolio Site", duration: "52:15", type: "video" },
          { name: "Project 3: Interactive App", duration: "60:40", type: "video" }
        ]
      }
    ],
    learningOutcomes: [
      "Build responsive websites from scratch using HTML, CSS, and JavaScript",
      "Understand modern web development best practices and workflows",
      "Create interactive user interfaces with JavaScript",
      "Deploy and maintain professional web projects",
      "Master CSS Flexbox and Grid for advanced layouts",
      "Develop problem-solving skills for real-world challenges"
    ],
    requirements: [
      "A computer with internet connection",
      "No prior programming experience required",
      "Willingness to learn and practice regularly",
      "Basic computer skills (browsing, file management)"
    ],
    reviews: [
      {
        name: "Ahmed Hassan",
        rating: 5,
        date: "2 weeks ago",
        comment: "Excellent course! The instructor explains everything clearly and the projects are very practical.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
      },
      {
        name: "Sarah Mohamed",
        rating: 5,
        date: "1 month ago",
        comment: "Best web development course I've taken. The pace is perfect and the content is up-to-date.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
      },
      {
        name: "Omar Khaled",
        rating: 4,
        date: "1 month ago",
        comment: "Great course with lots of hands-on practice. Would recommend to anyone starting out.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
      }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'curriculum', label: 'Curriculum', icon: FileText },
    { id: 'instructor', label: 'Instructor', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: MessageCircle }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">COURSE DESCRIPTION</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">WHAT WILL I LEARN FROM THIS COURSE?</h3>
              <div className="space-y-3">
                {courseData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#4C9A8F] flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'curriculum':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h3>
            {courseData.curriculum.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">{section.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{section.lessons.length} lessons</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <div key={lessonIndex} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-[#4C9A8F]" />
                        <span className="text-gray-700">{lesson.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'instructor':
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">About the Instructor</h3>
            <div className="flex items-start gap-6 mb-6">
              <img
                src={courseData.instructorImage}
                alt={courseData.instructor}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-1">{courseData.instructor}</h4>
                <p className="text-[#4C9A8F] font-semibold mb-3">{courseData.instructorTitle}</p>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{courseData.rating} Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{courseData.students}+ Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    <span>{courseData.lessons} Courses</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {courseData.instructorBio}
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        );

      case 'reviews':
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Student Reviews</h3>
            <div className="space-y-6">
              {courseData.reviews.map((review, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{review.name}</h5>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">COURSE Details</h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <a href="#" className="hover:text-[#4C9A8F]">Homepage</a>
            <span className="mx-2">/</span>
            <a href="#" className="hover:text-[#4C9A8F]">Course</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{courseData.titleEn}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <img
                src={courseData.image}
                alt={courseData.titleEn}
                className="w-full h-80 object-cover"
              />
            </div>

            {/* Course Title and Rating */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-lg font-semibold text-gray-900">({courseData.rating})</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {courseData.titleEn}
              </h2>
              <div className="flex items-center gap-2 mt-4">
                <img
                  src={courseData.instructorImage}
                  alt={courseData.instructor}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold text-gray-900">{courseData.instructor}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="border-b border-gray-200">
                <div className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                          activeTab === tab.id
                            ? 'text-white bg-[#4C9A8F]'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              {/* Course Image in Sidebar */}
              <div className="mb-6">
                <img
                  src={courseData.image}
                  alt={courseData.titleEn}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-[#4C9A8F] mb-2">{courseData.price}</div>
                <p className="text-sm text-gray-600">{courseData.moneyBackGuarantee}</p>
              </div>

              {/* Buy Button */}
              <button className="w-full bg-[#4C9A8F] hover:bg-[#3d8178] text-white py-3 rounded-lg font-semibold transition-colors mb-6">
                BUY NOW
              </button>

              {/* Course Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-semibold text-gray-900">{courseData.startDate}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Enrolled</span>
                  <span className="font-semibold text-gray-900">{courseData.enrolled}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Lectures</span>
                  <span className="font-semibold text-gray-900">{courseData.lectures}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Skill Level</span>
                  <span className="font-semibold text-gray-900">{courseData.skillLevel}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Class/Name Day</span>
                  <span className="font-semibold text-gray-900">{courseData.startDate}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Language</span>
                  <span className="font-semibold text-gray-900">{courseData.language}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">{courseData.classTime}</span>
                  <span className="font-semibold text-gray-900">{courseData.classTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              Join Our Learning Community
            </h2>
            <p className="text-lg text-teal-50 mb-6">
              Start your professional development journey today
            </p>
            <button className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors text-lg">
              Become a Member
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#4C9A8F] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-8 h-8" />
                <span className="text-xl font-bold">EACSL</span>
              </div>
              <p className="text-teal-50 text-sm leading-relaxed mb-4">
                Egyptian Association For<br />
                Communication and Speech<br />
                Language
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-bold text-lg mb-4">Features</h3>
              <ul className="space-y-2 text-teal-50 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Business Marketing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">User Analytic</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Live Chat</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Unlimited Support</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2 text-teal-50 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">IOS & Android</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Watch a Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Customers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright */}
      <div className="bg-[#3d8178] text-center py-4">
        <p className="text-teal-50 text-sm">
          Made With Love By Figmaland All Right Reserved
        </p>
      </div>
    </div>
  );
};

export default CourseDetailPage;