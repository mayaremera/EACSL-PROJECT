import React from 'react';
import { ArrowLeft, Calendar, MessageCircle, Users, Baby, Brain, ClipboardList } from 'lucide-react';

const TherapyPrograms = () => {
  const programs = [
    {
      icon: MessageCircle,
      title: "جلسات علاج النطق للأطفال",
      description: "توفير جلسات للأطفال لعلاج مجموعة متنوعة من الاضطرابات والإعاقات باستخدام تقنيات حديثة مثل التوحد واضطرابات السمع والشلل الدماغي ومتلازمة داون",
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80"
    },
    {
      icon: Users,
      title: "جلسات علاج النطق للبالغين",
      description: "توفير جلسات علاج النطق للبالغين الذين يعانون من اضطرابات النطق والطلاقة",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80"
    },
    {
      icon: Brain,
      title: "تنمية المهارات",
      description: "العمل مع الأطفال لتعزيز الذاكرة والانتباه والمهارات البصرية ومهارات الحياة والمهارات الأكاديمية",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80"
    },
    {
      icon: Baby,
      title: "التدخل المبكر",
      description: "توفير التدخل المبكر لتحسين إنتاج الكلام والمهارات العامة للأطفال",
      image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80"
    },
    {
      icon: Users,
      title: "الدعم النفسي والأسري",
      description: "نحن نقدم لك الدعم الذي تحتاجه لتحسين حياتك وحياة طفلك خاصة من يعانون من تحديات سلوكية",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80"
    },
    {
      icon: ClipboardList,
      title: "الاختبارات والتقييمات",
      description: "نحن نجري أنواعًا مختلفة من التقييمات والاختبارات مثل اختبار الذكاء واختبار CARS والمزيد",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Therapy Programs</h1>
            <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto">
              برامج العلاج والخدمات المتخصصة
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <a href="#" className="hover:text-[#4C9A8F] transition-colors">Home</a>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">Therapy Programs</span>
            </div>
            <button className="flex items-center gap-2 text-sm text-[#4C9A8F] hover:text-[#3d8178] font-semibold transition-colors">
              <ArrowLeft size={16} />
              <span>Back to Services</span>
            </button>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-white p-3 rounded-full shadow-lg">
                      <Icon className="w-6 h-6 text-[#4C9A8F]" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6" dir="rtl">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {program.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
            <Calendar size={20} />
            <span>Book Appointment</span>
          </button>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 border-2 border-[#4C9A8F] text-[#4C9A8F] hover:bg-[#4C9A8F] hover:text-white font-semibold rounded-lg transition-colors duration-200">
            <ArrowLeft size={20} />
            <span>Back to Services</span>
          </button>
        </div>
      </div>

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Become a member and be part of our growing professional community
            </p>
            <button className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
              Become a Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapyPrograms;