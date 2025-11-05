import React from 'react';
import { BookOpen, Clock, Users, ArrowRight } from 'lucide-react';

const CourseCard = ({
    image = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    category = "Digital Marketing",
    title = "Bilginer Adobe Illustrator For Graphic Design",
    lessonCount = 10,
    duration = "19h 30m",
    studentCount = "20+",
    instructorName = "Brian Brewer",
    instructorImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    onEnroll
}) => {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-full max-w-md">
            {/* Course Image */}
            <div className="relative h-64 overflow-hidden group">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-black text-white px-4 py-2 text-sm font-semibold rounded-md">
                        {category}
                    </span>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-6 leading-snug hover:text-[#5A9B8E] transition-colors duration-300 cursor-pointer">
                    {title}
                </h3>

                {/* Course Info */}
                <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#5A9B8E]" />
                        <span>{lessonCount} Lesson</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#5A9B8E]" />
                        <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#5A9B8E]" />
                        <span>Students {studentCount}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-6"></div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    {/* Instructor */}
                    <div className="flex items-center gap-3">
                        <img
                            src={instructorImage}
                            alt={instructorName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                            {instructorName}
                        </span>
                    </div>

                    {/* Enroll Button */}
                    <button
                        onClick={onEnroll}
                        className="flex items-center gap-2 px-5 py-2 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300 group"
                    >
                        <span>Enroll</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;