import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import { articlesService } from '../../services/articlesService';

const ArticleEditForm = ({ article, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    titleEn: '',
    category: 'Autism',
    date: new Date().toISOString().split('T')[0],
    image: '',
    imageUrl: '',
    imagePath: '',
    modalImage: '',
    modalImageUrl: '',
    modalImagePath: '',
    excerptEn: '',
    url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modalImageFile, setModalImageFile] = useState(null);
  const [modalImagePreview, setModalImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [modalDragActive, setModalDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (article) {
      console.log('📝 ArticleEditForm - Loading article data:', article);
      const formDataToSet = {
        titleEn: article.titleEn || '',
        category: article.category || 'Autism',
        date: article.date || new Date().toISOString().split('T')[0],
        image: article.image || '',
        imageUrl: article.imageUrl || article.image || '',
        imagePath: article.imagePath || '',
        modalImage: article.modalImage || '',
        modalImageUrl: article.modalImageUrl || article.modalImage || '',
        modalImagePath: article.modalImagePath || '',
        excerptEn: article.excerptEn || '',
        url: article.url || ''
      };
      console.log('📝 ArticleEditForm - Setting form data:', formDataToSet);
      setFormData(formDataToSet);
      
      // Set preview if image exists (check all possible image sources)
      const previewImage = article.imageUrl || article.image || (article.imagePath ? 
        `https://jwhvfugznhwtpfurdkxm.supabase.co/storage/v1/object/public/ArticlesBucket/${article.imagePath}` : null);
      if (previewImage) {
        console.log('📝 ArticleEditForm - Setting image preview:', previewImage);
        setImagePreview(previewImage);
      } else {
        console.log('📝 ArticleEditForm - No image found for preview');
        setImagePreview(null);
      }
      
      // Set modal image preview
      const previewModalImage = article.modalImageUrl || article.modalImage || (article.modalImagePath ? 
        `https://jwhvfugznhwtpfurdkxm.supabase.co/storage/v1/object/public/ArticlesBucket/${article.modalImagePath}` : null);
      if (previewModalImage) {
        console.log('📝 ArticleEditForm - Setting modal image preview:', previewModalImage);
        setModalImagePreview(previewModalImage);
      } else {
        console.log('📝 ArticleEditForm - No modal image found for preview');
        setModalImagePreview(null);
      }
    } else {
      console.log('📝 ArticleEditForm - No article provided (adding new)');
      // Reset form when no article (adding new)
      setFormData({
        titleEn: '',
        category: 'Autism',
        date: new Date().toISOString().split('T')[0],
        image: '',
        imageUrl: '',
        imagePath: '',
        modalImage: '',
        modalImageUrl: '',
        modalImagePath: '',
        excerptEn: '',
        url: ''
      });
      setImagePreview(null);
      setModalImagePreview(null);
    }
  }, [article]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const categories = [
    { value: 'Autism', label: 'Autism' },
    { value: 'Aphasia', label: 'Aphasia' },
    { value: 'Speech Therapy', label: 'Speech Therapy' },
    { value: 'Dysphagia', label: 'Dysphagia' },
    { value: 'Fluency Disorders', label: 'Fluency Disorders' },
    { value: 'Language Development', label: 'Language Development' },
    { value: 'Voice Disorders', label: 'Voice Disorders' }
  ];

  const handleCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value
    }));
  };

  const handleFileChange = (file) => {
    if (file) {
      // Check if it's an image file
      const isValidImage = file.type.startsWith('image/') || 
                          /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
      
      if (isValidImage) {
        // Clean up old preview URL if it exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        
        // Create preview URL for the uploaded file
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setImageFile(file);
      } else {
        alert('Please upload only image files (JPG, PNG, GIF, etc.)');
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const removeImage = () => {
    // Clean up preview URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      image: '',
      imageUrl: '',
      imagePath: ''
    }));
  };

  const handleModalFileChange = (file) => {
    if (file) {
      // Check if it's an image file
      const isValidImage = file.type.startsWith('image/') || 
                          /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
      
      if (isValidImage) {
        // Clean up old preview URL if it exists
        if (modalImagePreview && modalImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(modalImagePreview);
        }
        
        // Create preview URL for the uploaded file
        const previewUrl = URL.createObjectURL(file);
        setModalImagePreview(previewUrl);
        setModalImageFile(file);
      } else {
        alert('Please upload only image files (JPG, PNG, GIF, etc.)');
      }
    }
  };

  const handleModalDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setModalDragActive(true);
    } else if (e.type === "dragleave") {
      setModalDragActive(false);
    }
  };

  const handleModalDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleModalFileChange(file);
    }
  };

  const handleModalFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleModalFileChange(e.target.files[0]);
    }
  };

  const removeModalImage = () => {
    // Clean up preview URL
    if (modalImagePreview && modalImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(modalImagePreview);
    }
    setModalImagePreview(null);
    setModalImageFile(null);
    setFormData(prev => ({
      ...prev,
      modalImage: '',
      modalImageUrl: '',
      modalImagePath: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalImageUrl = formData.imageUrl;
      let finalImagePath = formData.imagePath;
      let finalModalImageUrl = formData.modalImageUrl;
      let finalModalImagePath = formData.modalImagePath;

      // If a new file was uploaded, upload it to ArticlesBucket
      if (imageFile) {
        const uploadResult = await articlesService.uploadImage(imageFile, imageFile.name);
        if (uploadResult.data && !uploadResult.error) {
          finalImagePath = uploadResult.data.path;
          finalImageUrl = uploadResult.data.url;
        } else {
          alert('Failed to upload image. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // If a new modal image file was uploaded, upload it to ArticlesBucket
      if (modalImageFile) {
        const uploadResult = await articlesService.uploadImage(modalImageFile, `modal-${modalImageFile.name}`);
        if (uploadResult.data && !uploadResult.error) {
          finalModalImagePath = uploadResult.data.path;
          finalModalImageUrl = uploadResult.data.url;
        } else {
          alert('Failed to upload modal image. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // Clean up preview URLs if they were blobs
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      if (modalImagePreview && modalImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(modalImagePreview);
      }

      // Prepare data to save
      const dataToSave = {
        ...formData,
        image: finalImageUrl || finalImagePath || formData.image, // For backward compatibility
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
        modalImage: finalModalImageUrl || finalModalImagePath || formData.modalImage, // For backward compatibility
        modalImageUrl: finalModalImageUrl,
        modalImagePath: finalModalImagePath
      };

      console.log('💾 ArticleEditForm - Saving article data:', dataToSave);
      console.log('💾 ArticleEditForm - Article ID:', article?.id);
      await onSave(dataToSave);
      console.log('✅ ArticleEditForm - Save completed');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {article ? 'Edit Article' : 'Add New Article'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title (English) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="titleEn"
              value={formData.titleEn}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              placeholder="Article Title"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
            />
          </div>

          {/* Image Upload - Drag and Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Image *
            </label>
            
            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-[#5A9B8E] bg-[#5A9B8E]/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supports: JPG, PNG, GIF, WebP
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] cursor-pointer transition-colors"
                  >
                    Select Image
                  </label>
                </>
              )}
            </div>

            {/* Fallback: Image URL input (for external URLs) */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Or use external image URL (optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                  if (e.target.value && !imageFile) {
                    setImagePreview(e.target.value);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Modal Image Upload - Drag and Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modal Image (for article modal display)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Optional: A separate image that will be displayed in the article modal. If not provided, the main article image will be used.
            </p>
            
            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                modalDragActive
                  ? 'border-[#5A9B8E] bg-[#5A9B8E]/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleModalDrag}
              onDragLeave={handleModalDrag}
              onDragOver={handleModalDrag}
              onDrop={handleModalDrop}
            >
              {modalImagePreview ? (
                <div className="relative">
                  <img
                    src={modalImagePreview}
                    alt="Modal Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeModalImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop a modal image here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supports: JPG, PNG, GIF, WebP
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleModalFileInput}
                    className="hidden"
                    id="modal-image-upload"
                  />
                  <label
                    htmlFor="modal-image-upload"
                    className="inline-block px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] cursor-pointer transition-colors"
                  >
                    Select Modal Image
                  </label>
                </>
              )}
            </div>

            {/* Fallback: Modal Image URL input (for external URLs) */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Or use external modal image URL (optional)
              </label>
              <input
                type="url"
                name="modalImageUrl"
                value={formData.modalImageUrl}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, modalImageUrl: e.target.value }));
                  if (e.target.value && !modalImageFile) {
                    setModalImagePreview(e.target.value);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                placeholder="https://example.com/modal-image.jpg"
              />
            </div>
          </div>

          {/* Excerpt (English) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt *
            </label>
            <textarea
              name="excerptEn"
              value={formData.excerptEn}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none resize-none"
              placeholder="Article excerpt"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article URL *
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              placeholder="https://example.com/article"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isUploading ? 'Uploading...' : (article ? 'Update Article' : 'Add Article')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleEditForm;

