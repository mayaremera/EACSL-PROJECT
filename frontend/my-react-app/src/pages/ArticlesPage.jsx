import React, { useState, useEffect } from 'react';
import { BookOpen, X, Tag, ExternalLink, Search, Filter } from 'lucide-react';
import { articlesManager } from '../utils/dataManager';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';

const ArticlesPage = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const loadArticles = () => {
      const allArticles = articlesManager.getAll();
      setArticles(allArticles);
    };

    loadArticles();

    // Listen for article updates
    const handleArticlesUpdate = () => {
      loadArticles();
    };

    window.addEventListener('articlesUpdated', handleArticlesUpdate);
    return () => {
      window.removeEventListener('articlesUpdated', handleArticlesUpdate);
    };
  }, []);

  const categories = [
    { value: 'all', labelAr: 'الكل', labelEn: 'All' },
    { value: 'Autism', labelAr: 'التوحد', labelEn: 'Autism' },
    { value: 'Aphasia', labelAr: 'الحبسة الكلامية', labelEn: 'Aphasia' },
    { value: 'Speech Therapy', labelAr: 'علاج النطق', labelEn: 'Speech Therapy' },
    { value: 'Dysphagia', labelAr: 'عسر البلع', labelEn: 'Dysphagia' },
    { value: 'Fluency Disorders', labelAr: 'اضطرابات الطلاقة', labelEn: 'Fluency Disorders' },
    { value: 'Language Development', labelAr: 'تطور اللغة', labelEn: 'Language Development' },
    { value: 'Voice Disorders', labelAr: 'اضطرابات الصوت', labelEn: 'Voice Disorders' }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      article.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerptEn?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="Articles & Resources"
        subtitle="مقالات ومصادر علمية | Scientific Articles and Resources"
        icon={<BookOpen className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Articles' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section - New Elegant Design */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="grid md:grid-cols-[1fr_auto] divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Search Section */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-[#4C9A8F]" />
                <h3 className="text-sm font-semibold text-gray-700">Search Articles</h3>
              </div>
              <input
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Filter Section */}
            <div className="p-5 md:min-w-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-[#4C9A8F]" />
                <h3 className="text-sm font-semibold text-gray-700">Category</h3>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none transition-all bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.labelEn} - {cat.labelAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== 'all') && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs">
                  Category: {categories.find(c => c.value === selectedCategory)?.labelEn}
                  <button onClick={() => setSelectedCategory('all')} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-[#4C9A8F] hover:text-[#3d8178] font-medium ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <ImagePlaceholder
                  src={article.image}
                  alt={article.titleEn}
                  name={article.titleEn}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-teal-50 text-[#4C9A8F] text-sm font-medium rounded-full">
                    {article.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {article.titleEn}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {article.excerptEn}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">{article.date}</span>
                  <button className="text-[#4C9A8F] hover:text-[#3d8178] text-sm font-medium flex items-center gap-1">
                    Read More
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No articles found | لم يتم العثور على مقالات</p>
          </div>
        )}
      </div>

      {/* Article Modal - Smaller and More Compact */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full my-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors z-10 shadow-md"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="aspect-video bg-gray-100 overflow-hidden rounded-t-xl">
              <ImagePlaceholder
                src={selectedArticle.image}
                alt={selectedArticle.titleEn}
                name={selectedArticle.titleEn}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-teal-50 text-[#4C9A8F] text-xs font-medium rounded-full">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-gray-500">{selectedArticle.date}</span>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2" dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '20px' }}>
                {selectedArticle.titleAr}
              </h2>
              <h3 className="text-sm text-gray-600 mb-4">
                {selectedArticle.titleEn}
              </h3>

              <div className="mb-5">
                <p className="text-gray-700 text-sm leading-relaxed mb-3" dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}>
                  {selectedArticle.excerptAr}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedArticle.excerptEn}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#4C9A8F] hover:bg-[#3d8178] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '14px' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Full Article | اقرأ المقال كاملاً
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  This will open the original article in a new tab
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
              Join Our Community
            </h2>
            <p className="text-teal-50 mb-4 max-w-2xl mx-auto text-sm">
              Become a member and be part of our growing professional community
            </p>
            <a href="/apply-membership" className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-6 py-2.5 rounded-lg font-semibold transition-colors duration-200 shadow-lg text-sm">
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;