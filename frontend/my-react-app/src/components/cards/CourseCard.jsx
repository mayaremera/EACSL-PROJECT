import React from 'react';
import { BookOpen, Clock, Users, Edit, Trash2 } from 'lucide-react';
import ImagePlaceholder from '../ui/ImagePlaceholder';

const CourseCard = ({
  course,
  onClick,
  onEdit,
  onDelete,
  isDashboard = false
}) => {
  if (!course) return null;

  const handleCardClick = (e) => {
    // Don't trigger onClick if clicking edit/delete buttons
    if (e.target.closest('.dashboard-actions')) {
      return;
    }
    if (onClick) onClick();
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden relative"
      onClick={handleCardClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {isDashboard && (
        <div className="absolute top-2 right-2 z-10 dashboard-actions flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit(course);
            }}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            title="Edit Course"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete && window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
                onDelete(course.id);
              }
            }}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
            title="Delete Course"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <div className="relative h-40 overflow-hidden">
        <ImagePlaceholder
          src={course.image}
          alt={course.title}
          name={course.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-[#5A9B8E] text-white text-xs font-semibold rounded">
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
        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 truncate">
          {course.title}
        </h3>

        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#5A9B8E]" />
            <span>{course.lessons} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#5A9B8E]" />
            <span>{course.duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Users className="w-3.5 h-3.5" />
            <span>{course.students} students</span>
          </div>
        </div>

        <div className="border-t pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImagePlaceholder
              src={course.instructorImage}
              alt={course.instructor}
              name={course.instructor}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="text-xs font-semibold text-gray-900">{course.instructor}</span>
          </div>
          <span className="text-sm font-bold text-[#5A9B8E]">{course.price}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
