import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, X, Tag, ExternalLink, Search, Filter, ChevronLeft, ChevronRight, Facebook, Instagram, Share2 } from 'lucide-react';
import { articlesManager } from '../utils/dataManager';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import { useAuth } from '../contexts/AuthContext';

const ArticlesPage = () => {
  const { user } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        // First, load from cache for immediate display
        const cachedArticles = articlesManager._getAllFromLocalStorage();
        if (cachedArticles && cachedArticles.length > 0) {
          setArticles(cachedArticles);
        }
        
        // Then refresh from Supabase in the background
        const allArticles = await articlesManager.getAll();
        setArticles(allArticles);
      } catch (error) {
        console.error('Error loading articles:', error);
        // Fallback to cached data
        const cachedArticles = articlesManager._getAllFromLocalStorage();
        setArticles(cachedArticles);
      }
    };

    loadArticles();

    // Listen for article updates
    const handleArticlesUpdate = async () => {
      try {
        const allArticles = await articlesManager.getAll();
        setArticles(allArticles);
      } catch (error) {
        console.error('Error loading articles:', error);
        // Fallback to cached data
        const cachedArticles = articlesManager._getAllFromLocalStorage();
        setArticles(cachedArticles);
      }
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

  // Scroll functions for mobile slider
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.article-card')?.offsetWidth || 320;
      scrollContainerRef.current.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.article-card')?.offsetWidth || 320;
      scrollContainerRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  // Share functions
  const shareOnFacebook = (e) => {
    e.stopPropagation();
    if (selectedArticle?.url) {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedArticle.url)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const shareOnTwitter = (e) => {
    e.stopPropagation();
    if (selectedArticle) {
      const text = selectedArticle.titleEn || 'Check out this article';
      const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(selectedArticle.url || window.location.href)}&text=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const shareOnInstagram = async (e) => {
    e.stopPropagation();
    if (selectedArticle?.url) {
      try {
        await navigator.clipboard.writeText(selectedArticle.url);
        // Show a temporary notification (you could enhance this with a toast library)
        alert('Article link copied to clipboard! You can now paste it in Instagram.');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = selectedArticle.url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Article link copied to clipboard! You can now paste it in Instagram.');
      }
    }
  };

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
                <Search className="w-4 h-4 text-[#5A9B8E]" />
                <h3 className="text-sm font-semibold text-gray-700">Search Articles</h3>
              </div>
              <input
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Filter Section */}
            <div className="p-5 md:min-w-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-[#5A9B8E]" />
                <h3 className="text-sm font-semibold text-gray-700">Category</h3>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none transition-all bg-white"
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
                className="text-xs text-[#5A9B8E] hover:text-[#4A8B7E] font-medium ml-auto"
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

        {/* Articles Cards */}
        {filteredArticles.length > 0 ? (
          <>
            {/* Mobile Slider - Only visible on mobile */}
            <div className="md:hidden relative mb-8">
              {/* Navigation Buttons */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} className="text-[#5A9B8E]" />
              </button>
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={24} className="text-[#5A9B8E]" />
              </button>

              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="article-card flex-shrink-0 w-[85vw] max-w-[320px]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full"
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
                          <span className="px-3 py-1 bg-teal-50 text-[#5A9B8E] text-sm font-medium rounded-full">
                            {article.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                          {article.titleEn}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 h-16 line-clamp-3 overflow-hidden">
                          {article.excerptEn}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-sm text-gray-500">{article.date}</span>
                          <button className="text-[#5A9B8E] hover:text-[#4A8B7E] text-sm font-medium flex items-center gap-1">
                            Read More
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet & Desktop Grid - Hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                      <span className="px-3 py-1 bg-teal-50 text-[#5A9B8E] text-sm font-medium rounded-full">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {article.titleEn}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 h-16 line-clamp-3 overflow-hidden">
                      {article.excerptEn}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-500">{article.date}</span>
                      <button className="text-[#5A9B8E] hover:text-[#4A8B7E] text-sm font-medium flex items-center gap-1">
                        Read More
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No articles found | لم يتم العثور على مقالات</p>
          </div>
        )}
      </div>

      {/* Article Modal - Enhanced for Long Articles */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] my-8 relative shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-xl z-10 flex-shrink-0">
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="px-3 py-1 bg-teal-50 text-[#5A9B8E] text-xs font-medium rounded-full">
                        {selectedArticle.category}
                      </span>
                      <span className="text-xs text-gray-500">{selectedArticle.date}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontSize: '24px', lineHeight: '1.4' }}>
                      {selectedArticle.titleEn}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-md border border-gray-200"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain article-modal-scroll">
              {/* Article Image - Larger for modal */}
              {(selectedArticle.modalImage || selectedArticle.modalImageUrl || selectedArticle.image) && (
                <div className="w-full h-80 sm:h-96 bg-gray-100 overflow-hidden">
                  <ImagePlaceholder
                    src={selectedArticle.modalImage || selectedArticle.modalImageUrl || selectedArticle.image}
                    alt={selectedArticle.titleEn}
                    name={selectedArticle.titleEn}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="p-6 sm:p-8">
                <div className="prose prose-lg max-w-none">
                  {selectedArticle.excerptEn && (
                    <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.8' }}>
                        {selectedArticle.excerptEn}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-xl p-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white px-6 py-3 rounded-lg text-base font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Read Full Article</span>
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    This will open the original article in a new tab
                  </p>
                </div>
                
                {/* Share Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium hidden sm:inline">Share:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={shareOnFacebook}
                      className="w-10 h-10 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                      aria-label="Share on Facebook"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button
                      onClick={shareOnTwitter}
                      className="w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-lg flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                      aria-label="Share on X (Twitter)"
                      title="Share on X (Twitter)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={shareOnInstagram}
                      className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                      aria-label="Copy link for Instagram"
                      title="Copy link for Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA Section - Only show for non-signed-in users */}
      {!user && (
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
      )}
    </div>
  );
};

export default ArticlesPage;