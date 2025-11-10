// import React from 'react';
// import { BookOpen, Clock, Users, ArrowRight } from 'lucide-react';

// const CourseCard = ({
//     image,
//     category,
//     title,
//     lessonCount,
//     duration,
//     studentCount,
//     instructorName,
//     instructorImage,
//     onEnroll
// }) => {
//     return (
//         <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
//             {/* Course Image */}
//             <div className="relative h-48 overflow-hidden group">
//                 <img
//                     src={image}
//                     alt={title}
//                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                 />
//                 <div className="absolute top-3 left-3">
//                     <span className="bg-black text-white px-3 py-1.5 text-xs font-semibold rounded">
//                         {category}
//                     </span>
//                 </div>
//             </div>

//             {/* Card Content */}
//             <div className="p-5">
//                 {/* Title */}
//                 <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug hover:text-[#5A9B8E] transition-colors duration-300 cursor-pointer min-h-[56px]">
//                     {title}
//                 </h3>

//                 {/* Course Info */}
//                 <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
//                     <div className="flex items-center gap-1.5">
//                         <BookOpen className="w-3.5 h-3.5 text-[#5A9B8E]" />
//                         <span>Lesson {lessonCount}</span>
//                     </div>
//                     <div className="flex items-center gap-1.5">
//                         <Clock className="w-3.5 h-3.5 text-[#5A9B8E]" />
//                         <span>{duration}</span>
//                     </div>
//                     <div className="flex items-center gap-1.5">
//                         <Users className="w-3.5 h-3.5 text-[#5A9B8E]" />
//                         <span>Students {studentCount}</span>
//                     </div>
//                 </div>

//                 {/* Divider */}
//                 <div className="border-t border-gray-200 mb-4"></div>

//                 {/* Footer */}
//                 <div className="flex items-center justify-between">
//                     {/* Instructor */}
//                     <div className="flex items-center gap-2">
//                         <img
//                             src={instructorImage}
//                             alt={instructorName}
//                             className="w-8 h-8 rounded-full object-cover"
//                         />
//                         <span className="text-sm font-semibold text-gray-900">
//                             {instructorName}
//                         </span>
//                     </div>

//                     {/* Enroll Button */}
//                     <button
//                         onClick={onEnroll}
//                         className="flex items-center gap-1.5 px-4 py-1.5 border-2 border-[#5A9B8E] text-[#5A9B8E] text-sm font-semibold rounded hover:bg-[#5A9B8E] hover:text-white transition-all duration-300 group"
//                     >
//                         <span>Enroll</span>
//                         <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const CoursesSection = () => {
//     const courses = [
//         {
//             id: 1,
//             image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
//             category: "Digital Marketing",
//             title: "It Statistics Data Science And Business Analysis",
//             lessonCount: 10,
//             duration: "19h 30m",
//             studentCount: "20+",
//             instructorName: "Samantha",
//             instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
//         },
//         {
//             id: 2,
//             image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
//             category: "Digital Marketing",
//             title: "Bilginer Adobe Illustrator For Graphic Design",
//             lessonCount: 10,
//             duration: "19h 30m",
//             studentCount: "20+",
//             instructorName: "Charles",
//             instructorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
//         },
//         {
//             id: 3,
//             image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
//             category: "Digital Marketing",
//             title: "Starting SEO As Your Home Based Business",
//             lessonCount: 10,
//             duration: "19h 30m",
//             studentCount: "20+",
//             instructorName: "Morgan",
//             instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
//         },
//         {
//             id: 4,
//             image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
//             category: "Digital Marketing",
//             title: "Bilginer Adobe Illustrator For Graphic Design",
//             lessonCount: 10,
//             duration: "19h 30m",
//             studentCount: "20+",
//             instructorName: "Brian Brewer",
//             instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
//         },
//         {
//             id: 5,
//             image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&q=80",
//             category: "Digital Marketing",
//             title: "It Statistics Data Science And Business Analysis",
//             lessonCount: 10,
//             duration: "19h 30m",
//             studentCount: "20+",
//             instructorName: "Rodriquez",
//             instructorImage: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop"
//         },
//         {
//             id: 6,
//             image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
//             category: "Digital Marketing",
//             title: "Starting SEO As Your Home Based Business",
//             lessonCount: 10,
//             duration: "19h 30m",
//             studentCount: "20+",
//             instructorName: "Morgan",
//             instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
//         }
//     ];

//     return (
//         <section className="bg-gray-50 py-16 px-8">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-12">
//                     <h2 className="text-3xl font-bold text-black">
//                         TOP POPULAR COURSE
//                     </h2>
//                     <a
//                         href="#"
//                         className="text-gray-700 font-medium hover:text-[#5A9B8E] transition-colors duration-300"
//                     >
//                         View All
//                     </a>
//                 </div>

//                 {/* Courses Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {courses.map((course) => (
//                         <CourseCard
//                             key={course.id}
//                             {...course}
//                             onEnroll={() => console.log(`Enrolled in ${course.title}`)}
//                         />
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default CoursesSection;











import React from 'react';
import { BookOpen, Clock, Users, ArrowRight } from 'lucide-react';

const CourseCard = ({
    image,
    category,
    title,
    lessonCount,
    duration,
    studentCount,
    instructorName,
    instructorImage,
    onEnroll
}) => {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
            {/* Course Image */}
            <div className="relative h-56 overflow-hidden group">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-black text-white px-4 py-2 text-sm font-semibold rounded">
                        {category}
                    </span>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-6 leading-snug hover:text-[#5A9B8E] transition-colors duration-300 cursor-pointer min-h-[56px]">
                    {title}
                </h3>

                {/* Course Info */}
                <div className="flex items-center gap-5 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#5A9B8E]" />
                        <span>Lesson {lessonCount}</span>
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
                        className="flex items-center gap-2 px-5 py-2 border-2 border-[#5A9B8E] text-[#5A9B8E] text-sm font-semibold rounded hover:bg-[#5A9B8E] hover:text-white transition-all duration-300 group"
                    >
                        <span>Enroll</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const CoursesSection = () => {
    const courses = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
            category: "Digital Marketing",
            title: "It Statistics Data Science And Business Analysis",
            lessonCount: 10,
            duration: "19h 30m",
            studentCount: "20+",
            instructorName: "Samantha",
            instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
            category: "Digital Marketing",
            title: "Bilginer Adobe Illustrator For Graphic Design",
            lessonCount: 10,
            duration: "19h 30m",
            studentCount: "20+",
            instructorName: "Charles",
            instructorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
            category: "Digital Marketing",
            title: "Starting SEO As Your Home Based Business",
            lessonCount: 10,
            duration: "19h 30m",
            studentCount: "20+",
            instructorName: "Morgan",
            instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
        },
        {
            id: 4,
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
            category: "Digital Marketing",
            title: "Bilginer Adobe Illustrator For Graphic Design",
            lessonCount: 10,
            duration: "19h 30m",
            studentCount: "20+",
            instructorName: "Brian Brewer",
            instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
        },
        {
            id: 5,
            image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&q=80",
            category: "Digital Marketing",
            title: "It Statistics Data Science And Business Analysis",
            lessonCount: 10,
            duration: "19h 30m",
            studentCount: "20+",
            instructorName: "Rodriquez",
            instructorImage: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop"
        },
        {
            id: 6,
            image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
            category: "Digital Marketing",
            title: "Starting SEO As Your Home Based Business",
            lessonCount: 10,
            duration: "19h 30m",
            studentCount: "20+",
            instructorName: "Morgan",
            instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
        }
    ];

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
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            {...course}
                            onEnroll={() => console.log(`Enrolled in ${course.title}`)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CoursesSection;