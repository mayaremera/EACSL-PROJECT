import React, { useState } from 'react';
import { BookOpen, X, Clock, Tag, ExternalLink, Search, Filter } from 'lucide-react';

const ArticlesPage = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const articles = [
    {
      id: 1,
      titleAr: "تطوير مهارات التواصل لدى الأطفال المصابين بالتوحد",
      titleEn: "Developing Communication Skills in Children with Autism",
      category: "Autism",
      categoryAr: "التوحد",
      date: "2024-10-15",
      readTime: "8 min",
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=500&fit=crop",
      excerptAr: "استراتيجيات فعالة لتحسين مهارات التواصل الاجتماعي واللغوي للأطفال ذوي اضطراب طيف التوحد.",
      excerptEn: "Effective strategies to improve social and linguistic communication skills in children with autism spectrum disorder.",
      url: "https://www.autismspeaks.org/tool-kit/atnair-p-guide-communication"
    },
    {
      id: 2,
      titleAr: "الحبسة الكلامية: الأسباب والعلاج",
      titleEn: "Aphasia: Causes and Treatment",
      category: "Aphasia",
      categoryAr: "الحبسة الكلامية",
      date: "2024-09-28",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=500&fit=crop",
      excerptAr: "فهم شامل للحبسة الكلامية، أنواعها المختلفة، وأحدث طرق العلاج المستخدمة.",
      excerptEn: "Comprehensive understanding of aphasia, its types, and the latest treatment methods used.",
      url: "https://www.asha.org/public/speech/disorders/aphasia/"
    },
    {
      id: 3,
      titleAr: "أهمية التدخل المبكر في علاج اضطرابات النطق",
      titleEn: "The Importance of Early Intervention in Speech Disorders",
      category: "Speech Therapy",
      categoryAr: "علاج النطق",
      date: "2024-11-01",
      readTime: "7 min",
      image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=500&fit=crop",
      excerptAr: "دراسة شاملة تبرز أهمية الكشف المبكر والتدخل العلاجي المبكر في علاج اضطرابات النطق.",
      excerptEn: "Comprehensive study highlighting the importance of early detection and intervention in speech disorders.",
      url: "https://www.asha.org/public/speech/development/early-intervention/"
    },
    {
      id: 4,
      titleAr: "اضطرابات البلع: التشخيص والعلاج",
      titleEn: "Swallowing Disorders: Diagnosis and Treatment",
      category: "Dysphagia",
      categoryAr: "عسر البلع",
      date: "2024-08-20",
      readTime: "9 min",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop",
      excerptAr: "نظرة متعمقة على اضطرابات البلع، أسبابها المختلفة، وطرق التشخيص والعلاج الحديثة.",
      excerptEn: "In-depth look at swallowing disorders, their causes, and modern diagnosis and treatment methods.",
      url: "https://www.asha.org/public/speech/swallowing/swallowing-disorders-in-adults/"
    },
    {
      id: 5,
      titleAr: "علاج التلعثم عند الأطفال والبالغين",
      titleEn: "Stuttering Treatment in Children and Adults",
      category: "Fluency Disorders",
      categoryAr: "اضطرابات الطلاقة",
      date: "2024-10-05",
      readTime: "10 min",
      image: "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?w=800&h=500&fit=crop",
      excerptAr: "دليل شامل لفهم التلعثم، أسبابه، والتقنيات العلاجية الحديثة المثبتة علمياً.",
      excerptEn: "Comprehensive guide to understanding stuttering, its causes, and scientifically proven modern treatment techniques.",
      url: "https://www.stutteringhelp.org/what-stuttering"
    },
    {
      id: 6,
      titleAr: "تطوير اللغة عند الأطفال ثنائيي اللغة",
      titleEn: "Language Development in Bilingual Children",
      category: "Language Development",
      categoryAr: "تطور اللغة",
      date: "2024-09-10",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop",
      excerptAr: "استكشاف فوائد وتحديات تربية الأطفال ثنائيي اللغة ودعم التطور اللغوي الصحي.",
      excerptEn: "Exploring the benefits and challenges of raising bilingual children and supporting healthy language development.",
      url: "https://www.asha.org/public/speech/development/learning-two-languages/"
    },
    {
      id: 7,
      titleAr: "اضطرابات الصوت: الأسباب والوقاية",
      titleEn: "Voice Disorders: Causes and Prevention",
      category: "Voice Disorders",
      categoryAr: "اضطرابات الصوت",
      date: "2024-07-18",
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=500&fit=crop",
      excerptAr: "معلومات حول أسباب اضطرابات الصوت وطرق الوقاية منها والحفاظ على صحة الحنجرة.",
      excerptEn: "Information about causes of voice disorders, prevention methods, and maintaining vocal health.",
      url: "https://www.asha.org/public/speech/disorders/voice/"
    },
    {
      id: 8,
      titleAr: "تأخر الكلام واللغة عند الأطفال",
      titleEn: "Speech and Language Delays in Children",
      category: "Language Development",
      categoryAr: "تطور اللغة",
      date: "2024-08-05",
      readTime: "8 min",
      image: "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=800&h=500&fit=crop",
      excerptAr: "دليل الأهل لفهم علامات تأخر الكلام واللغة ومتى يجب طلب المساعدة المتخصصة.",
      excerptEn: "Parent's guide to understanding signs of speech and language delays and when to seek professional help.",
      url: "https://www.asha.org/public/speech/development/late-bloomer/"
    }
  ];

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
      article.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerptAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerptEn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <BookOpen className="w-12 h-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Articles & Resources</h1>
            <p className="text-base md:text-lg text-teal-50 max-w-2xl mx-auto">
              مقالات ومصادر علمية | Scientific Articles and Resources
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.titleEn}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-teal-50 text-[#4C9A8F] text-xs font-medium rounded-full">
                    {article.categoryAr}
                  </span>
                  <span className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                  {article.titleAr}
                </h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                  {article.titleEn}
                </p>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {article.excerptAr}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{article.date}</span>
                  <button className="text-[#4C9A8F] hover:text-[#3d8178] text-xs font-medium flex items-center gap-1">
                    Read More
                    <ExternalLink className="w-3 h-3" />
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
              <img
                src={selectedArticle.image}
                alt={selectedArticle.titleEn}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-teal-50 text-[#4C9A8F] text-xs font-medium rounded-full">
                  {selectedArticle.categoryAr}
                </span>
                <span className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {selectedArticle.readTime}
                </span>
                <span className="text-xs text-gray-500">{selectedArticle.date}</span>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {selectedArticle.titleAr}
              </h2>
              <h3 className="text-sm text-gray-600 mb-4">
                {selectedArticle.titleEn}
              </h3>

              <div className="mb-5">
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
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
            <button className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-6 py-2.5 rounded-lg font-semibold transition-colors duration-200 shadow-lg text-sm">
              Become a Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;