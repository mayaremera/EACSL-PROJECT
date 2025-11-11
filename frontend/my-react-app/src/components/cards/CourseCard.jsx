import React from 'react';
import { BookOpen, Clock, Users, Star } from 'lucide-react';

const CourseCard = ({
  course,
  onClick
}) => {
  if (!course) return null;

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
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
  );
};

export default CourseCard;
