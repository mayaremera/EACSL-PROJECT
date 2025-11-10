import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, Calendar, Award, CheckCircle, PlayCircle, FileText, MessageCircle, Globe, Video } from 'lucide-react';
import { courses } from '../data/courses';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [courseData, setCourseData] = useState(null);

    // Helper function to generate default curriculum
    const generateDefaultCurriculum = useCallback((lessonCount) => {
        const sections = Math.ceil(lessonCount / 5);
        const curriculum = [];
        for (let i = 0; i < sections; i++) {
            const lessonsInSection = i === sections - 1 ? lessonCount - (i * 5) : 5;
            curriculum.push({
                title: `Section ${i + 1}: Course Content`,
                lessons: Array.from({ length: lessonsInSection }, (_, j) => ({
                    name: `Lesson ${i * 5 + j + 1}`,
                    duration: "15:00",
                    type: "video"
                }))
            });
        }
        return curriculum;
    }, []);

    // Helper function to generate default learning outcomes
    const generateDefaultLearningOutcomes = useCallback((course) => {
        return [
            `Master the fundamentals of ${course.category}`,
            `Understand key concepts and best practices in ${course.category}`,
            `Apply learned techniques in real-world scenarios`,
            `Develop practical skills through hands-on exercises`,
            `Build confidence in ${course.category} applications`
        ];
    }, []);

    // Helper function to generate default reviews
    const generateDefaultReviews = useCallback(() => {
        return [
            {
                name: "Ahmed Hassan",
                rating: 5,
                date: "2 weeks ago",
                comment: "Excellent course! The instructor explains everything clearly and the content is very practical.",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
            },
            {
                name: "Sarah Mohamed",
                rating: 5,
                date: "1 month ago",
                comment: "Best course I've taken. The pace is perfect and the content is up-to-date.",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
            },
            {
                name: "Omar Khaled",
                rating: 4,
                date: "1 month ago",
                comment: "Great course with lots of hands-on practice. Would recommend to anyone starting out.",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
            }
        ];
    }, []);

    useEffect(() => {
        const course = courses.find(c => c.id === parseInt(courseId));
        if (course) {
            // Map course data to the expected structure with defaults for missing fields
            setCourseData({
                titleAr: course.titleAr || course.title,
                titleEn: course.title,
                category: course.category,
                categoryAr: course.categoryAr || course.category,
                level: course.level,
                rating: course.rating,
                lessons: course.lessons,
                duration: course.duration,
                students: course.students,
                enrolled: course.enrolled || course.students,
                lectures: course.lectures || course.lessons,
                skillLevel: course.skillLevel || course.level,
                language: course.language || "English",
                classTime: course.classTime || "4:00 PM - 6:00 PM",
                startDate: course.startDate || "Monday-Friday",
                price: course.price,
                moneyBackGuarantee: course.moneyBackGuarantee || "30-Day Money-Back Guarantee",
                image: course.image,
                instructor: course.instructor,
                instructorImage: course.instructorImage,
                instructorTitle: course.instructorTitle || `Expert in ${course.category}`,
                instructorBio: course.instructorBio || `Experienced professional in ${course.category} with a passion for teaching and helping students succeed.`,
                descriptionShort: course.descriptionShort || course.description,
                description: course.description,
                curriculum: course.curriculum || generateDefaultCurriculum(course.lessons),
                learningOutcomes: course.learningOutcomes || generateDefaultLearningOutcomes(course),
                requirements: course.requirements || [
                    "A computer with internet connection",
                    "Basic understanding of the subject area",
                    "Willingness to learn and practice regularly"
                ],
                reviews: course.reviews || generateDefaultReviews()
            });
        }
    }, [courseId, generateDefaultCurriculum, generateDefaultLearningOutcomes, generateDefaultReviews]);

    // Show loading or not found state
    if (!courseData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
                    <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/online-courses')}
                        className="bg-[#4C9A8F] hover:bg-[#3d8178] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
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
                                {courseData.description || courseData.descriptionShort}
                            </p>
                            {courseData.description && courseData.descriptionShort && courseData.description !== courseData.descriptionShort && (
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {courseData.descriptionShort}
                                </p>
                            )}
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
                                                        className={`w-4 h-4 ${i < review.rating
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
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold">COURSE DETAILS</h1>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center text-sm text-gray-600">
                        <Link to="/" className="hover:text-[#4C9A8F]">Homepage</Link>
                        <span className="mx-2">/</span>
                        <Link to="/online-courses" className="hover:text-[#4C9A8F]">Courses</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">{courseData.titleEn}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
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
                                                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === tab.id
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

        </div>
    );
};

export default CourseDetailPage;