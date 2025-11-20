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
        const loadCourses = () => {
            const allCourses = coursesManager.getAll();
            setCourses(allCourses);
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
                    <h2 className="text-3xl font-bold text-black">
                        TOP POPULAR COURSE
                    </h2>
                    <Link
                        to="/online-courses"
                        className="text-gray-700 font-medium hover:text-[#5A9B8E] transition-colors duration-300"
                    >
                        View All
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
