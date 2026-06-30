import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getFeaturedCourses } from '../../data/courses';
import { coursesManager } from '../../utils/dataManager';
import CourseCard from '../cards/CourseCard';
import PageLoader from '../ui/PageLoader';
import { SUPABASE_FETCH_OPTIONS } from '../../utils/supabaseFetch';

const CoursesSection = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const loadCourses = async () => {
            setIsLoading(true);
            try {
                const allCourses = await coursesManager.getAll(SUPABASE_FETCH_OPTIONS);
                if (mounted) setCourses(allCourses);
            } catch (error) {
                console.error('Error loading courses:', error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        
        loadCourses();
        const handleCoursesUpdated = (e) => {
            if (e.detail && Array.isArray(e.detail)) {
                setCourses(e.detail);
            } else {
                loadCourses();
            }
        };
        window.addEventListener('coursesUpdated', handleCoursesUpdated);

        return () => {
            mounted = false;
            window.removeEventListener('coursesUpdated', handleCoursesUpdated);
        };
    }, []);

    // Get featured courses dynamically from data
    const featuredCourses = getFeaturedCourses(6, courses);

    // Scroll functions for mobile slider
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const cardWidth = scrollContainerRef.current.querySelector('.course-card')?.offsetWidth || 320;
            scrollContainerRef.current.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const cardWidth = scrollContainerRef.current.querySelector('.course-card')?.offsetWidth || 320;
            scrollContainerRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-gray-50 py-7 sm:py-16 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 sm:mb-12">
                    <div className="inline-block">
                        <h2 className="text-lg sm:text-xl font-bold text-black mb-[-0.15rem]">
                            POPULAR COURSES
                        </h2>
                        <div className="h-[0.2rem] w-[6rem] sm:w-[7.5rem] bg-[#5A9B8E]"></div>
                    </div>
                    <Link
                        to="/online-courses"
                        className="text-sm sm:text-base text-gray-700 font-medium hover:text-[#5A9B8E] transition-colors duration-300"
                    >
                        View All
                    </Link>
                </div>

                {isLoading ? (
                    <PageLoader variant="section" label="Loading courses..." />
                ) : (
                <>
                {/* Mobile Slider - Only visible on mobile */}
                <div className="md:hidden relative">
                    {/* Navigation Buttons */}
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={24} className="text-[#5A9B8E]" />
                    </button>
                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={24} className="text-[#5A9B8E]" />
                    </button>

                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
                        style={{
                            scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {featuredCourses.map((course) => (
                            <div
                                key={course.id}
                                className="course-card flex-shrink-0 w-[85vw] max-w-[320px]"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                <CourseCard
                                    course={course}
                                    onClick={() => navigate(`/course-details/${course.id}`, { replace: location.pathname !== '/' })}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tablet & Desktop Grid - Hidden on mobile */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onClick={() => navigate(`/course-details/${course.id}`, { replace: location.pathname !== '/' })}
                        />
                    ))}
                </div>
                </>
                )}
            </div>
        </section>
    );
};

export default CoursesSection;
