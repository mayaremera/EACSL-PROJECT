import React from 'react';
import { getFeaturedCourses } from '../../data/courses';
import CourseCard from '../cards/CourseCard';

const CoursesSection = () => {
    // Get featured courses dynamically from data
    const featuredCourses = getFeaturedCourses(6);

    return (
        <section className="bg-gray-50 py-16 px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold text-black">
                        TOP POPULAR COURSE
                    </h2>
                    <a
                        href="/online-courses"
                        className="text-gray-700 font-medium hover:text-[#5A9B8E] transition-colors duration-300"
                    >
                        View All
                    </a>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onClick={() => window.location.href = `/online-courses`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CoursesSection;
