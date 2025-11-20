// import React, { useState } from 'react';
// import { BookOpen, X, ExternalLink, Calendar, User } from 'lucide-react';

// const ForParentsPage = () => {
//   const [selectedArticle, setSelectedArticle] = useState(null);

//   const articles = [
//     {
//       id: 1,
//       title: "كيفية تعزيز الثقة بالنفس لدى الأطفال",
//       excerpt: "نصائح عملية لبناء ثقة طفلك بنفسه منذ الصغر",
//       image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
//       date: "15 أكتوبر 2024",
//       author: "د. سارة أحمد",
//       articleUrl: "https://www.example.com/article1"
//     },
//     {
//       id: 2,
//       title: "التواصل الفعال مع الأطفال",
//       excerpt: "أساليب التواصل الصحيحة التي تبني علاقة قوية مع طفلك",
//       image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
//       date: "10 أكتوبر 2024",
//       author: "د. محمد حسن",
//       articleUrl: "https://www.example.com/article2"
//     },
//     {
//       id: 3,
//       title: "التعامل مع نوبات الغضب عند الأطفال",
//       excerpt: "استراتيجيات فعالة للتعامل مع الغضب والانفعالات",
//       image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
//       date: "5 أكتوبر 2024",
//       author: "د. ليلى إبراهيم",
//       articleUrl: "https://www.example.com/article3"
//     },
//     {
//       id: 4,
//       title: "أهمية اللعب في نمو الطفل",
//       excerpt: "كيف يساهم اللعب في التطور المعرفي والاجتماعي للطفل",
//       image: "https://images.unsplash.com/photo-1587616211892-c1c8c6b76d4c?w=600&q=80",
//       date: "1 أكتوبر 2024",
//       author: "د. فاطمة علي",
//       articleUrl: "https://www.example.com/article4"
//     },
//     {
//       id: 5,
//       title: "تنمية المهارات اللغوية للطفل",
//       excerpt: "طرق فعالة لتطوير مهارات النطق واللغة عند الأطفال",
//       image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80",
//       date: "28 سبتمبر 2024",
//       author: "د. خالد محمود",
//       articleUrl: "https://www.example.com/article5"
//     },
//     {
//       id: 6,
//       title: "التربية الإيجابية وأثرها على الطفل",
//       excerpt: "مبادئ التربية الإيجابية وكيفية تطبيقها في حياتك اليومية",
//       image: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&q=80",
//       date: "25 سبتمبر 2024",
//       author: "د. منى سالم",
//       articleUrl: "https://www.example.com/article6"
//     },
//     {
//       id: 7,
//       title: "كيفية بناء روتين يومي صحي للأطفال",
//       excerpt: "أهمية الروتين اليومي وكيفية إنشائه بطريقة فعالة",
//       image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
//       date: "20 سبتمبر 2024",
//       author: "د. أحمد يوسف",
//       articleUrl: "https://www.example.com/article7"
//     },
//     {
//       id: 8,
//       title: "التعامل مع التنمر والتحديات الاجتماعية",
//       excerpt: "كيف تحمي طفلك من التنمر وتعزز مهاراته الاجتماعية",
//       image: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=600&q=80",
//       date: "15 سبتمبر 2024",
//       author: "د. نادية فريد",
//       articleUrl: "https://www.example.com/article8"
//     },
//     {
//       id: 9,
//       title: "تطوير الذكاء العاطفي عند الأطفال",
//       excerpt: "طرق لمساعدة طفلك على فهم وإدارة مشاعره بشكل صحي",
//       image: "https://images.unsplash.com/photo-1571442463800-1337d7af9d2f?w=600&q=80",
//       date: "10 سبتمبر 2024",
//       author: "د. طارق سمير",
//       articleUrl: "https://www.example.com/article9"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50" dir="rtl">
//       {/* Hero Section */}
//       <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">مقالات للآباء</h1>
//             <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto">
//               مقالات ونصائح حول التربية الصحيحة وحماية ونمو أطفالك
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Breadcrumb */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center text-sm text-gray-600">
//             <a href="#" className="hover:text-[#4C9A8F] transition-colors">الرئيسية</a>
//             <span className="mx-2">/</span>
//             <span className="text-gray-900 font-medium">مقالات للآباء</span>
//           </div>
//         </div>
//       </div>

//       {/* Articles Grid */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {articles.map((article) => (
//             <div
//               key={article.id}
//               className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
//               onClick={() => setSelectedArticle(article)}
//             >
//               {/* Image */}
//               <div className="relative h-48 overflow-hidden">
//                 <img
//                   src={article.image}
//                   alt={article.title}
//                   className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
//                 />
//                 <div className="absolute top-3 right-3">
//                   <div className="bg-white p-2 rounded-full shadow-lg">
//                     <BookOpen className="w-5 h-5 text-[#4C9A8F]" />
//                   </div>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-5">
//                 <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#4C9A8F] transition-colors">
//                   {article.title}
//                 </h3>
//                 <p className="text-sm text-gray-600 mb-4 line-clamp-2">
//                   {article.excerpt}
//                 </p>

//                 {/* Meta Info */}
//                 <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
//                   <div className="flex items-center gap-1">
//                     <User size={14} />
//                     <span>{article.author}</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <Calendar size={14} />
//                     <span>{article.date}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Article Modal */}
//       {selectedArticle && (
//         <div
//           className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
//           onClick={() => setSelectedArticle(null)}
//         >
//           <div
//             className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header */}
//             <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
//               <div className="flex-1 ml-4">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                   {selectedArticle.title}
//                 </h2>
//                 <div className="flex items-center gap-4 text-sm text-gray-600">
//                   <div className="flex items-center gap-1">
//                     <User size={16} />
//                     <span>{selectedArticle.author}</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <Calendar size={16} />
//                     <span>{selectedArticle.date}</span>
//                   </div>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setSelectedArticle(null)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6">
//               <img
//                 src={selectedArticle.image}
//                 alt={selectedArticle.title}
//                 className="w-full h-64 object-cover rounded-xl mb-6"
//               />
              
//               <div className="prose prose-lg max-w-none">
//                 <p className="text-gray-700 leading-relaxed mb-6">
//                   {selectedArticle.excerpt}
//                 </p>
                
//                 <div className="bg-teal-50 border-r-4 border-[#4C9A8F] p-6 rounded-lg">
//                   <p className="text-gray-700 mb-4">
//                     لقراءة المقال كاملاً، يرجى زيارة الرابط أدناه:
//                   </p>
//                   <a
//                     href={selectedArticle.articleUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center gap-2 px-6 py-3 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200"
//                   >
//                     <span>اقرأ المقال الكامل</span>
//                     <ExternalLink size={18} />
//                   </a>
//                 </div>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="border-t border-gray-200 p-6 bg-gray-50">
//               <button
//                 onClick={() => setSelectedArticle(null)}
//                 className="w-full px-6 py-3 border-2 border-[#4C9A8F] text-[#4C9A8F] hover:bg-[#4C9A8F] hover:text-white font-semibold rounded-lg transition-colors duration-200"
//               >
//                 إغلاق
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Footer CTA Section */}
//       <div className="bg-white border-t border-gray-200 py-12 mt-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-8 md:p-12 text-center">
//             <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
//               انضم إلى مجتمعنا
//             </h2>
//             <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
//               كن عضوًا وكن جزءًا من مجتمعنا المهني المتنامي
//             </p>
//             <button className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
//               سجل كعضو
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForParentsPage;















import React, { useState, useEffect } from 'react';
import { BookOpen, X, ExternalLink, Calendar, User } from 'lucide-react';
import { forParentsManager } from '../utils/dataManager';

const ForParentsPage = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const loadArticles = () => {
      const allArticles = forParentsManager.getAll();
      setArticles(allArticles);
    };

    loadArticles();

    // Listen for updates
    const handleArticlesUpdate = () => {
      loadArticles();
    };

    window.addEventListener('forParentsUpdated', handleArticlesUpdate);
    return () => {
      window.removeEventListener('forParentsUpdated', handleArticlesUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">For Parents</h1>
            <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto">
              مقالات ونصائح حول التربية الصحيحة
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <a href="#" className="hover:text-[#4C9A8F] transition-colors">Home</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Articles</span>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image || article.imageUrl || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80"}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-white p-2 rounded-full shadow-lg">
                    <BookOpen className="w-5 h-5 text-[#4C9A8F]" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5" dir="rtl">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#4C9A8F] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex-1 ml-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    <span>{selectedArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{selectedArticle.date}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <img
                src={selectedArticle.image || selectedArticle.imageUrl || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80"}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedArticle.excerpt}
                </p>
                
                <div className="bg-teal-50 border-r-4 border-[#4C9A8F] p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    لقراءة المقال كاملاً، يرجى زيارة الرابط أدناه:
                  </p>
                  <a
                    href={selectedArticle.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    <span>اقرأ المقال الكامل</span>
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-full px-6 py-3 border-2 border-[#4C9A8F] text-[#4C9A8F] hover:bg-[#4C9A8F] hover:text-white font-semibold rounded-lg transition-colors duration-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ForParentsPage;