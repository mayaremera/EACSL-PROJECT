import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getFeaturedCourses } from '../../data/courses';
import { coursesManager } from '../../utils/dataManager';
import CourseCard from '../cards/CourseCard';

const CoursesSection = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loadCourses = async () => {
            // First, load from cache for immediate display
            const cachedCourses = coursesManager._getAllFromLocalStorage();
            setCourses(cachedCourses);
            
            // Then refresh from Supabase in the background
            try {
                const allCourses = await coursesManager.getAll();
                setCourses(allCourses);
            } catch (error) {
                console.error('Error loading courses:', error);
            }
        };
        
        loadCourses();
        window.addEventListener('coursesUpdated', (e) => {
            setCourses(e.detail);
        });

        return () => {
            window.removeEventListener('coursesUpdated', loadCourses);
        };
    }, []);

    // Get featured courses dynamically from data
    const featuredCourses = getFeaturedCourses(6, courses);

    return (
        <section className="bg-gray-50 py-16 px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="inline-block">
                        <h2 className="text-xl font-bold text-black mb-[-0.15rem]">
                            POPULAR COURSES
                        </h2>
                        <div className="h-[0.2rem] w-[7.5rem] bg-[#5A9B8E]"></div>
                    </div>
                    <Link
                        to="/online-courses"
                        className="text-gray-700 font-medium hover:text-[#5A9B8E] transition-colors duration-300"
                    >
                        View Al
                    </Link>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onClick={() => navigate(`/course-details/${course.id}`, { replace: location.pathname !== '/' })}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CoursesSection;
