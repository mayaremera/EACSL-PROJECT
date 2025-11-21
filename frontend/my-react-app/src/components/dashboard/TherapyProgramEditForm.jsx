import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import { therapyProgramsService } from '../../services/therapyProgramsService';
import { MessageCircle, Users, Baby, Brain, ClipboardList } from 'lucide-react';

const TherapyProgramEditForm = ({ program, onSave, onCancel }) => {
  const iconOptions = [
    { value: 'MessageCircle', label: 'Message Circle', Icon: MessageCircle },
    { value: 'Users', label: 'Users', Icon: Users },
    { value: 'Baby', label: 'Baby', Icon: Baby },
    { value: 'Brain', label: 'Brain', Icon: Brain },
    { value: 'ClipboardList', label: 'Clipboard List', Icon: ClipboardList },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'MessageCircle',
    image: '',
    imageUrl: '',
    imagePath: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (program) {
      setFormData({
        title: program.title || '',
        description: program.description || '',
        icon: program.icon || 'MessageCircle',
        image: program.image || '',
        imageUrl: program.imageUrl || program.image || '',
        imagePath: program.imagePath || '',
      });
      // Set preview if image exists
      if (program.image) {
        setImagePreview(program.image);
      }
    }
  }, [program]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalImageUrl = formData.imageUrl;
      let finalImagePath = formData.imagePath;

      // If a new file was uploaded, upload it to TherapyBucket
      if (imageFile) {
        const uploadResult = await therapyProgramsService.uploadImage(imageFile, imageFile.name);
        if (uploadResult.data && !uploadResult.error) {
          finalImagePath = uploadResult.data.path;
          finalImageUrl = uploadResult.data.url;
        } else {
          alert('Failed to upload image. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // Clean up preview URL if it was a blob
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      // Prepare data to save
      const dataToSave = {
        ...formData,
        image: finalImageUrl || finalImagePath || formData.image, // For backward compatibility
        imageUrl: finalImageUrl,
        imagePath: finalImagePath
      };

      await onSave(dataToSave);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const selectedIcon = iconOptions.find(opt => opt.value === formData.icon);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {program ? 'Edit Therapy Program' : 'Add New Therapy Program'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title * <span className="text-xs text-gray-500">(Arabic)</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              placeholder="عنوان البرنامج"
              dir="rtl"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description * <span className="text-xs text-gray-500">(Arabic)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none resize-none"
              placeholder="وصف البرنامج"
              dir="rtl"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon *
            </label>
            <div className="grid grid-cols-5 gap-3">
              {iconOptions.map((option) => {
                const IconComponent = option.Icon;
                const isSelected = formData.icon === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: option.value }))}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-[#5A9B8E] bg-[#5A9B8E]/10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <IconComponent
                      className={`w-6 h-6 mx-auto ${
                        isSelected ? 'text-[#5A9B8E]' : 'text-gray-400'
                      }`}
                    />
                    <p className={`text-xs mt-2 ${
                      isSelected ? 'text-[#5A9B8E] font-medium' : 'text-gray-500'
                    }`}>
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload - Drag and Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Image *
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
              {isUploading ? 'Uploading...' : (program ? 'Update Program' : 'Add Program')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TherapyProgramEditForm;

