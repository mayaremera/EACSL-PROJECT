import React, { useState } from 'react';
import { X, ZoomIn, Images } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';

// ✅ Import all your local images properly
import gallery1 from '../../src/assets/GalleryImages/gallery1.jpg';
import gallery2 from '../../src/assets/GalleryImages/gallery2.jpg';
import gallery3 from '../../src/assets/GalleryImages/gallery3.webp';
import gallery4 from '../../src/assets/GalleryImages/gallery4.jpg';
import gallery5 from '../../src/assets/GalleryImages/gallery5.jpg';
import gallery6 from '../../src/assets/GalleryImages/gallery6.jpg';
import gallery7 from '../../src/assets/GalleryImages/gallery7.jpg';
import gallery8 from '../../src/assets/GalleryImages/gallery8.jpg';
import gallery9 from '../../src/assets/GalleryImages/gallery9.jpg';
import gallery10 from '../../src/assets/GalleryImages/gallery10.jpg';
import gallery11 from '../../src/assets/GalleryImages/gallery11.jpg';
import gallery12 from '../../src/assets/GalleryImages/gallery12.jpg';
import gallery13 from '../../src/assets/GalleryImages/gallery13.jpg';
import gallery14 from '../../src/assets/GalleryImages/gallery14.jpg';
import gallery15 from '../../src/assets/GalleryImages/gallery15.jpg';
import gallery16 from '../../src/assets/GalleryImages/gallery16.jpg';
// import gallery17 from '../../src/assets/GalleryImages/gallery17.jpg';
// import gallery18 from '../../src/assets/GalleryImages/gallery18.jpg';

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Now using imported local images
  const galleryImages = [
    { id: 1, url: gallery2, size: 'tall' },
    { id: 2, url: gallery1, size: 'wide' },
    { id: 3, url: gallery3, size: 'regular' },
    { id: 4, url: gallery4, size: 'wide' },
    { id: 5, url: gallery10, size: 'tall' },
    { id: 6, url: gallery6, size: 'wide' },
    { id: 7, url: gallery7, size: 'regular' },
    { id: 8, url: gallery8, size: 'regular' },
    { id: 9, url: gallery9, size: 'tall' },
    { id: 10, url: gallery5, size: 'wide' },
    { id: 11, url: gallery11, size: 'regular' },
    { id: 12, url: gallery12, size: 'regular' },
    { id: 13, url: gallery13, size: 'regular' },
    { id: 14, url: gallery14, size: 'wide' },
    { id: 15, url: gallery15, size: 'regular' },
    { id: 16, url: gallery16, size: 'regular' },
    // { id: 17, url: gallery17, size: 'tall' },
    // { id: 18, url: gallery18, size: 'regular' },
  ];

  const getSizeClass = (size) => {
    switch (size) {
      case 'tall':
        return 'row-span-2';
      case 'wide':
        return 'col-span-2';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="Our Gallery"
        subtitle="Explore moments from our events, educational programs, and community activities"
        icon={<Images className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Gallery' }]} />

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className={`relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${getSizeClass(image.size)}`}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.url}
                alt={`Gallery image ${image.id}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                  <span className="text-white text-sm font-medium">View Image</span>
                  <ZoomIn className="text-white" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage.url}
            alt={`Gallery image ${selectedImage.id}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Become a member and be part of our growing professional community
            </p>
            <a href="/apply-membership" className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
