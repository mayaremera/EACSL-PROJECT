import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Calendar, Award, CheckCircle, PlayCircle, FileText, Globe, Video, ExternalLink, Download } from 'lucide-react';
import { coursesManager, initializeData } from '../utils/dataManager';
import { useAuth } from '../contexts/AuthContext';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('details');
    const [courseData, setCourseData] = useState(null);

    // Helper function to convert YouTube watch URLs to embed URLs
    const convertToEmbedUrl = (url) => {
        if (!url) return '';
        
        // If already an embed URL, return as is
        if (url.includes('youtube.com/embed/')) {
            return url;
        }
        
        // Extract video ID from different YouTube URL formats
        let videoId = '';
        
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (watchMatch) {
            videoId = watchMatch[1];
        }
        
        // If we found a video ID, convert to embed URL
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        
        // If no match, return original URL (might be a direct video URL)
        return url;
    };

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
                    type: "video",
                    videoUrl: "",
                    pdfUrl: "",
                    quizUrl: ""
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


    useEffect(() => {
        // Initialize data and load course
        initializeData();
        
        const loadCourse = async () => {
            // First, load from cache for immediate display
            const cachedCourses = coursesManager._getAllFromLocalStorage();
            let course = cachedCourses.find(c => c.id === parseInt(courseId));
            
            if (course) {
                // Set course data immediately from cache
                setCourseData({
                    titleAr: course.titleAr || course.title,
                    titleEn: course.title,
                    category: course.category,
                    categoryAr: course.categoryAr || course.category,
                    level: course.level,
                    lessons: course.lessons,
                    duration: course.duration,
                    students: course.students,
                    enrolled: course.enrolled || course.students,
                    lectures: course.lectures || course.lessons,
                    skillLevel: course.skillLevel || course.level,
                    language: course.language || "English",
                    quiz: course.quiz || '',
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
                    ]
                });
            } else {
                setCourseData(null);
            }
            
            // Then refresh from Supabase in the background
            try {
                const courses = await coursesManager.getAll();
                const freshCourse = courses.find(c => c.id === parseInt(courseId));
                if (freshCourse) {
                    setCourseData({
                        titleAr: freshCourse.titleAr || freshCourse.title,
                        titleEn: freshCourse.title,
                        category: freshCourse.category,
                        categoryAr: freshCourse.categoryAr || freshCourse.category,
                        level: freshCourse.level,
                        lessons: freshCourse.lessons,
                        duration: freshCourse.duration,
                        students: freshCourse.students,
                        enrolled: freshCourse.enrolled || freshCourse.students,
                        lectures: freshCourse.lectures || freshCourse.lessons,
                        skillLevel: freshCourse.skillLevel || freshCourse.level,
                        language: freshCourse.language || "English",
                        quiz: freshCourse.quiz || '',
                        price: freshCourse.price,
                        moneyBackGuarantee: freshCourse.moneyBackGuarantee || "30-Day Money-Back Guarantee",
                        image: freshCourse.image,
                        instructor: freshCourse.instructor,
                        instructorImage: freshCourse.instructorImage,
                        instructorTitle: freshCourse.instructorTitle || `Expert in ${freshCourse.category}`,
                        instructorBio: freshCourse.instructorBio || `Experienced professional in ${freshCourse.category} with a passion for teaching and helping students succeed.`,
                        descriptionShort: freshCourse.descriptionShort || freshCourse.description,
                        description: freshCourse.description,
                        curriculum: freshCourse.curriculum || generateDefaultCurriculum(freshCourse.lessons),
                        learningOutcomes: freshCourse.learningOutcomes || generateDefaultLearningOutcomes(freshCourse),
                        requirements: freshCourse.requirements || [
                            "A computer with internet connection",
                            "Basic understanding of the subject area",
                            "Willingness to learn and practice regularly"
                        ]
                    });
                } else {
                    setCourseData(null);
                }
            } catch (error) {
                console.error('Error refreshing course from Supabase:', error);
            }
        };

        loadCourse();

        // Listen for course updates from dashboard
        window.addEventListener('coursesUpdated', loadCourse);

        return () => {
            window.removeEventListener('coursesUpdated', loadCourse);
        };
    }, [courseId, generateDefaultCurriculum, generateDefaultLearningOutcomes]);

    // Check authentication - redirect to login if not signed in
    useEffect(() => {
        if (!authLoading && !user) {
            // Redirect to login page with the course details URL to return to after login
            navigate('/login', { 
                replace: true,
                state: { 
                    redirectTo: `/course-details/${courseId}` 
                } 
            });
        }
    }, [user, authLoading, navigate, courseId]);

    // Show loading state while checking auth or loading course
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A9B8E] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, don't render (redirect will happen)
    if (!user) {
        return null;
    }

    // Show loading or not found state
    if (!courseData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
                    <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/online-courses')}
                        className="bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'details', label: 'Course Details', icon: BookOpen },
        { id: 'learn', label: 'You\'ll Learn', icon: Award },
        { id: 'curriculum', label: 'Curriculum', icon: FileText },
        { id: 'instructor', label: 'Instructor', icon: Users }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
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
                    </div>
                );

            case 'learn':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">WHAT WILL I LEARN FROM THIS COURSE?</h3>
                            <div className="space-y-3">
                                {courseData.learningOutcomes.map((outcome, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-[#5A9B8E] flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-700">{outcome}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'curriculum':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h3>
                        {courseData.curriculum && courseData.curriculum.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="bg-gradient-to-r from-[#5A9B8E] to-[#4A8B7E] px-5 py-4">
                                    <h4 className="font-semibold text-white text-lg">{section.title}</h4>
                                </div>
                                {section.lessons && section.lessons.length > 0 && (
                                    <div className="px-5 py-4 space-y-4">
                                        {section.lessons.map((lesson, lessonIndex) => (
                                            <div key={lessonIndex} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                {/* Lesson Header */}
                                                <div className="flex items-start gap-3 mb-3">
                                                    {lesson.type === 'video' && <Video className="w-5 h-5 text-[#5A9B8E] flex-shrink-0 mt-0.5" />}
                                                    {lesson.type === 'pdf' && <FileText className="w-5 h-5 text-[#5A9B8E] flex-shrink-0 mt-0.5" />}
                                                    {lesson.type === 'quiz_link' && <Award className="w-5 h-5 text-[#5A9B8E] flex-shrink-0 mt-0.5" />}
                                                    <div className="flex-1">
                                                        <p className="text-gray-900 font-semibold text-base">{lesson.name}</p>
                                                        {lesson.duration && (
                                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                                <Clock className="w-3 h-3" />
                                                                {lesson.duration}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Video Player */}
                                                {lesson.type === 'video' && lesson.videoUrl && (
                                                    <div className="mt-3">
                                                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                                            <iframe
                                                                src={convertToEmbedUrl(lesson.videoUrl)}
                                                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                                title={lesson.name}
                                                            ></iframe>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* PDF Viewer/Download */}
                                                {lesson.type === 'pdf' && lesson.pdfUrl && (
                                                    <div className="mt-3">
                                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-5 h-5 text-[#5A9B8E]" />
                                                                    <span className="text-sm text-gray-700">PDF Document</span>
                                                                </div>
                                                                <a
                                                                    href={lesson.pdfUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm font-semibold"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    View PDF
                                                                </a>
                                                            </div>
                                                            {lesson.pdfUrl.startsWith('http') && (
                                                                <div className="mt-3" style={{ height: '300px' }}>
                                                                    <iframe
                                                                        src={lesson.pdfUrl}
                                                                        className="w-full h-full rounded-lg border border-gray-300"
                                                                        title={lesson.name}
                                                                    ></iframe>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Quiz Link */}
                                                {lesson.type === 'quiz_link' && lesson.quizUrl && (
                                                    <div className="mt-3">
                                                        <a
                                                            href={lesson.quizUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5A9B8E] to-[#4A8B7E] text-white rounded-lg hover:from-[#4A8B7E] hover:to-[#3A7B6E] transition-all shadow-md hover:shadow-lg font-semibold"
                                                        >
                                                            <Award className="w-5 h-5" />
                                                            Take Quiz
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                )}
                                                
                                                {/* Show message if content URL is missing */}
                                                {((lesson.type === 'video' && !lesson.videoUrl) || 
                                                  (lesson.type === 'pdf' && !lesson.pdfUrl) || 
                                                  (lesson.type === 'quiz_link' && !lesson.quizUrl)) && (
                                                    <div className="mt-3 text-sm text-gray-500 italic">
                                                        Content URL not provided
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'instructor':
                return (
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">About the Instructor</h3>
                        <div className="flex items-start gap-6 mb-6">
                            <ImagePlaceholder
                                src={courseData.instructorImage}
                                alt={courseData.instructor}
                                name={courseData.instructor}
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <h4 className="text-2xl font-bold text-gray-900 mb-3">{courseData.instructor}</h4>
                                <div className="flex items-center gap-6 text-sm text-gray-600">
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

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <PageHero
                title="Course Details"
                subtitle={courseData.titleEn || "Course Information"}
            />

            {/* Breadcrumb */}
            <Breadcrumbs items={[
                { label: 'Courses', path: '/online-courses' },
                { label: courseData.titleEn || 'Course Details' }
            ]} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Course Title */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {courseData.titleEn}
                            </h2>
                            <div className="flex items-center gap-2 mt-4">
                                <ImagePlaceholder
                                    src={courseData.instructorImage}
                                    alt={courseData.instructor}
                                    name={courseData.instructor}
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
                                                        ? 'text-white bg-[#5A9B8E]'
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
                                <ImagePlaceholder
                                    src={courseData.image}
                                    alt={courseData.titleEn}
                                    name={courseData.titleEn}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>

                            {/* Price */}
                            {courseData.price && courseData.price !== '0' && String(courseData.price).trim() !== '' && (
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold text-[#5A9B8E] mb-2">{courseData.price}</div>
                                    {courseData.moneyBackGuarantee && (
                                        <p className="text-sm text-gray-600">{courseData.moneyBackGuarantee}</p>
                                    )}
                                </div>
                            )}

                            {/* Buy Button */}
                            <button className="w-full bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white py-3 rounded-lg font-semibold transition-colors mb-6">
                                BUY NOW
                            </button>

                            {/* Course Info */}
                            <div className="space-y-4 mb-6">
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
                                    <span className="text-gray-600">Language</span>
                                    <span className="font-semibold text-gray-900">{courseData.language}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <span className="text-gray-600">Quizzes</span>
                                    <span className="font-semibold text-gray-900">{courseData.quiz}</span>
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