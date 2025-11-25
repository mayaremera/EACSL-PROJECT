import React, { useState, useEffect } from 'react';
import { BookOpen, X, ExternalLink, Calendar, User } from 'lucide-react';
import { forParentsManager } from '../utils/dataManager';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';

const ForParentsPage = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        // getAll() is now async and fetches from Supabase first
        const allArticles = await forParentsManager.getAll();
        setArticles(allArticles);
      } catch (error) {
        console.error('Error loading for parents articles:', error);
        // Fallback to cached data
        const cachedArticles = forParentsManager._getAllFromLocalStorage();
        setArticles(cachedArticles);
      }
    };

    loadArticles();

    // Listen for updates
    const handleArticlesUpdate = async () => {
      try {
        const allArticles = await forParentsManager.getAll();
        setArticles(allArticles);
      } catch (error) {
        console.error('Error loading for parents articles:', error);
        // Fallback to cached data
        const cachedArticles = forParentsManager._getAllFromLocalStorage();
        setArticles(cachedArticles);
      }
    };

    window.addEventListener('forParentsUpdated', handleArticlesUpdate);
    return () => {
      window.removeEventListener('forParentsUpdated', handleArticlesUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="For Parents"
        subtitle="مقالات ونصائح حول التربية الصحيحة"
        icon={<BookOpen className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'For Parents' }]} />

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
                <ImagePlaceholder
                  src={article.image || article.imageUrl}
                  alt={article.title}
                  name={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-white p-2 rounded-full shadow-lg">
                    <BookOpen className="w-5 h-5 text-[#5A9B8E]" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5" dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#5A9B8E] transition-colors" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '18px' }}>
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}>
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                    <User size={14} />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
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
            style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex-1 ml-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '24px' }}>
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                    <User size={16} />
                    <span>{selectedArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-1" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
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
              <ImagePlaceholder
                src={selectedArticle.image || selectedArticle.imageUrl}
                alt={selectedArticle.title}
                name={selectedArticle.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '18px' }}>
                  {selectedArticle.excerpt}
                </p>
                
                <div className="bg-teal-50 border-r-4 border-[#5A9B8E] p-6 rounded-lg">
                  <p className="text-gray-700 mb-4" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}>
                    لقراءة المقال كاملاً، يرجى زيارة الرابط أدناه:
                  </p>
                  <a
                    href={selectedArticle.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white font-semibold rounded-lg transition-colors duration-200"
                    style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}
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
                className="w-full px-6 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] hover:bg-[#5A9B8E] hover:text-white font-semibold rounded-lg transition-colors duration-200"
                style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}
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
          <div className="bg-[#5A9B8E] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Become a member and be part of our growing professional community
            </p>
            <a 
              href="/apply-membership"
              className="inline-block bg-white text-[#5A9B8E] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
            >
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForParentsPage;