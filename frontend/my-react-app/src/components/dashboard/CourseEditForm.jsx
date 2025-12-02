import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader, Upload, Check, Plus, Trash2, FileText } from 'lucide-react';
import { coursesService } from '../../services/coursesService';

const CourseEditForm = ({ course, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    titleAr: '',
    category: 'Speech Therapy',
    categoryAr: '',
    level: 'Beginner',
    skillLevel: 'Beginner',
    duration: '',
    lessons: 0,
    lectures: 0,
    students: 0,
    enrolled: 0,
    price: '',
    moneyBackGuarantee: '30-Day Money-Back Guarantee',
    image: '',
    instructor: '',
    instructorImage: '',
    instructorTitle: '',
    instructorBio: '',
    description: '',
    descriptionShort: '',
    language: 'English',
    quiz: '',
    learningOutcomes: [],
    curriculum: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const imagePreviewsRef = useRef(imagePreviews);

  // Keep ref in sync with state
  useEffect(() => {
    imagePreviewsRef.current = imagePreviews;
  }, [imagePreviews]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imagePreviewsRef.current).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  useEffect(() => {
    if (course) {
      // Ensure arrays are properly initialized and are actual arrays
      const learningOutcomes = Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [];
      // Ensure curriculum sections have proper structure with lessons arrays
      const curriculum = Array.isArray(course.curriculum) 
        ? course.curriculum.map(section => ({
            ...section,
            lessons: Array.isArray(section.lessons) ? section.lessons : []
          }))
        : [];
      
      setFormData({
        title: course.title || '',
        titleEn: course.titleEn || course.title || '',
        titleAr: course.titleAr || course.title || '',
        category: course.category || 'Speech Therapy',
        categoryAr: course.categoryAr || course.category || '',
        level: course.level || 'Beginner',
        skillLevel: course.skillLevel || course.level || 'Beginner',
        duration: course.duration || '',
        lessons: course.lessons || 0,
        lectures: course.lectures || course.lessons || 0,
        students: course.students || 0,
        enrolled: course.enrolled || course.students || 0,
        price: (course.price && course.price !== '0' && String(course.price).trim() !== '') ? course.price : '',
        moneyBackGuarantee: course.moneyBackGuarantee || '30-Day Money-Back Guarantee',
        image: course.image || '',
        instructor: course.instructor || '',
        instructorImage: course.instructorImage || '',
        instructorTitle: course.instructorTitle || '',
        instructorBio: course.instructorBio || '',
        description: course.description || '',
        descriptionShort: course.descriptionShort || course.description || '',
        language: course.language || 'English',
        quiz: course.quiz || '',
        learningOutcomes: learningOutcomes,
        curriculum: curriculum
      });
    }
  }, [course]);

  const categories = [
    'Speech Therapy', 'Autism', 'Dysphagia', 'Fluency Disorders',
    'Language Development', 'Voice Disorders', 'Aphasia', 'AAC', 'Hearing Impairment'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'lessons' || name === 'students' || name === 'lectures' || name === 'enrolled'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...(prev[field] || [])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleCurriculumSectionChange = (sectionIndex, field, value) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      if (!newCurriculum[sectionIndex]) {
        newCurriculum[sectionIndex] = { title: '', lessons: [] };
      }
      newCurriculum[sectionIndex][field] = value;
      return { ...prev, curriculum: newCurriculum };
    });
  };

  // Helper function to convert YouTube watch URLs to embed URLs
  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    
    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Extract video ID from different YouTube URL formats
    let videoId = '';
    
    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
    
    // If we found a video ID, convert to embed URL
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // If no match, return original URL (might be a direct video URL)
    return url;
  };

  const handleCurriculumLessonChange = (sectionIndex, lessonIndex, field, value) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      if (!newCurriculum[sectionIndex]) {
        newCurriculum[sectionIndex] = { title: '', lessons: [] };
      }
      if (!newCurriculum[sectionIndex].lessons[lessonIndex]) {
        newCurriculum[sectionIndex].lessons[lessonIndex] = { name: '', duration: '', type: 'video', videoUrl: '', pdfUrl: '', quizUrl: '' };
      }
      
      // Auto-convert YouTube URLs to embed format when videoUrl is changed
      if (field === 'videoUrl' && value && value.includes('youtube.com')) {
        value = convertToEmbedUrl(value);
      }
      
      newCurriculum[sectionIndex].lessons[lessonIndex][field] = value;
      return { ...prev, curriculum: newCurriculum };
    });
  };

  const addCurriculumSection = () => {
    setFormData(prev => ({
      ...prev,
      curriculum: [...(prev.curriculum || []), { title: '', lessons: [] }]
    }));
  };

  const removeCurriculumSection = (sectionIndex) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      newCurriculum.splice(sectionIndex, 1);
      return { ...prev, curriculum: newCurriculum };
    });
  };

  const addCurriculumLesson = (sectionIndex) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      if (!newCurriculum[sectionIndex]) {
        newCurriculum[sectionIndex] = { title: '', lessons: [] };
      }
      newCurriculum[sectionIndex].lessons = [
        ...(newCurriculum[sectionIndex].lessons || []),
        { name: '', duration: '', type: 'video', videoUrl: '', pdfUrl: '', quizUrl: '' }
      ];
      return { ...prev, curriculum: newCurriculum };
    });
  };

  const removeCurriculumLesson = (sectionIndex, lessonIndex) => {
    setFormData(prev => {
      const newCurriculum = [...(prev.curriculum || [])];
      if (newCurriculum[sectionIndex] && newCurriculum[sectionIndex].lessons) {
        newCurriculum[sectionIndex].lessons.splice(lessonIndex, 1);
      }
      return { ...prev, curriculum: newCurriculum };
    });
  };

  const handleFileChange = (field, file) => {
    if (file) {
      // Check if it's an image file by MIME type or extension
      const isValidImage = file.type.startsWith('image/') || 
                          /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
      
      if (isValidImage) {
        // Clean up old preview URL if it exists
        setImagePreviews(prev => {
          if (prev[field]) {
            URL.revokeObjectURL(prev[field]);
          }
          // Create preview URL for the uploaded file
          const previewUrl = URL.createObjectURL(file);
          return { ...prev, [field]: previewUrl };
        });
        setFormData(prev => ({ ...prev, [field]: file }));
      } else {
        alert('Please upload only image files (JPG, PNG, GIF, etc.)');
      }
    }
  };

  const handleDrag = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [field]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange(field, file);
    }
  };

  const removeFile = (field, e) => {
    e.stopPropagation();
    // Clean up object URL if it exists
    if (imagePreviews[field]) {
      URL.revokeObjectURL(imagePreviews[field]);
      setImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[field];
        return newPreviews;
      });
    }
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  // Helper function to convert File to data URL
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      if (!file || !(file instanceof File)) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Upload images to Supabase Storage if they are File objects
      let imageUrl = formData.image || '';
      let imagePath = formData.image_path || '';
      let instructorImageUrl = formData.instructorImage || '';
      let instructorImagePath = formData.instructor_image_path || '';

      // Upload course image if it's a new File
      if (formData.image instanceof File) {
        console.log('📤 Uploading course image to storage...');
        const uploadResult = await coursesService.uploadCourseImage(formData.image, formData.image.name);
        if (uploadResult.error) {
          alert(`Failed to upload course image: ${uploadResult.error.message || 'Unknown error'}`);
          setIsLoading(false);
          return;
        }
        imageUrl = uploadResult.data.url;
        imagePath = uploadResult.data.path;
        console.log('✅ Course image uploaded:', { url: imageUrl, path: imagePath });
      } else if (typeof formData.image === 'string' && formData.image.startsWith('data:')) {
        // If it's a data URL (old format), we should still try to upload it
        // But for now, we'll skip it and use the existing URL
        console.warn('⚠️ Course image is a data URL. Consider uploading to storage.');
      }

      // Upload instructor image if it's a new File
      if (formData.instructorImage instanceof File) {
        console.log('📤 Uploading instructor image to storage...');
        const uploadResult = await coursesService.uploadInstructorImage(formData.instructorImage, formData.instructorImage.name);
        if (uploadResult.error) {
          alert(`Failed to upload instructor image: ${uploadResult.error.message || 'Unknown error'}`);
          setIsLoading(false);
          return;
        }
        instructorImageUrl = uploadResult.data.url;
        instructorImagePath = uploadResult.data.path;
        console.log('✅ Instructor image uploaded:', { url: instructorImageUrl, path: instructorImagePath });
      } else if (typeof formData.instructorImage === 'string' && formData.instructorImage.startsWith('data:')) {
        // If it's a data URL (old format), we should still try to upload it
        // But for now, we'll skip it and use the existing URL
        console.warn('⚠️ Instructor image is a data URL. Consider uploading to storage.');
      }

      // Clean price: if it's '0', empty, or just whitespace, set it to empty string
      const cleanedPrice = formData.price && formData.price !== '0' && String(formData.price).trim() !== '' 
        ? String(formData.price).trim() 
        : '';

      // Prepare data to save with storage URLs and paths
      const dataToSave = {
        ...formData,
        price: cleanedPrice,
        image: imageUrl,
        image_url: imageUrl,
        image_path: imagePath,
        instructorImage: instructorImageUrl,
        instructor_image_url: instructorImageUrl,
        instructor_image_path: instructorImagePath,
      };
      
      await onSave(dataToSave);
    } catch (error) {
      console.error('Error submitting course form:', error);
      alert(`Failed to save course: ${error.message || 'Unknown error'}`);
      // Re-throw so Dashboard can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {course ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Level *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 8 weeks"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              />
            </div>

            {/* Lessons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Lessons *
              </label>
              <input
                type="number"
                name="lessons"
                value={formData.lessons}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              />
            </div>

            {/* Students */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Students
              </label>
              <input
                type="number"
                name="students"
                value={formData.students}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 2,500 EGP (leave empty to hide price)"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
                {formData.price && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, price: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove price"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Course Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Image <span className="text-red-500">*</span>
              </label>
              <div
                onDragEnter={(e) => handleDrag(e, 'image')}
                onDragLeave={(e) => handleDrag(e, 'image')}
                onDragOver={(e) => handleDrag(e, 'image')}
                onDrop={(e) => handleDrop(e, 'image')}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${
                  dragActive['image'] 
                    ? 'border-[#5A9B8E] bg-[#5A9B8E]/10 scale-[1.02]' 
                    : 'border-gray-300 hover:border-[#5A9B8E] bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  document.getElementById('course-image').click();
                }}
              >
                {(formData.image instanceof File || (typeof formData.image === 'string' && formData.image)) ? (
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      {formData.image instanceof File ? (
                        <>
                          <img 
                            src={imagePreviews['image'] || URL.createObjectURL(formData.image)} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="text-left">
                            <p className="text-sm text-gray-700 font-medium">{formData.image.name}</p>
                            <p className="text-xs text-gray-500">{(formData.image.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="text-left">
                            <p className="text-sm text-gray-700 font-medium">Current Image</p>
                            <p className="text-xs text-gray-500">Click to replace</p>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={(e) => removeFile('image', e)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      dragActive['image'] ? 'bg-[#5A9B8E]/20' : 'bg-gray-200'
                    }`}>
                      <Upload className={`w-8 h-8 ${dragActive['image'] ? 'text-[#5A9B8E]' : 'text-gray-500'}`} />
                    </div>
                    <p className={`text-sm mb-1 font-medium ${dragActive['image'] ? 'text-[#5A9B8E]' : 'text-gray-700'}`}>
                      {dragActive['image'] ? 'Drop your image here' : 'Drag and drop your image here'}
                    </p>
                    <p className="text-gray-500 text-xs mb-4">or</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('image', e.target.files?.[0])}
                      className="hidden"
                      id="course-image"
                    />
                    <div className="inline-block px-6 py-2 bg-[#5A9B8E] text-white text-sm rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium">
                      Browse Files
                    </div>
                    <p className="text-gray-400 text-xs mt-4">Accepts: Images only (JPG, PNG, GIF, etc.)</p>
                    <p className="text-gray-400 text-xs">(Maximum file size: 2MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Instructor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instructor Name *
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              />
            </div>

            {/* Instructor Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instructor Image <span className="text-red-500">*</span>
              </label>
              <div
                onDragEnter={(e) => handleDrag(e, 'instructorImage')}
                onDragLeave={(e) => handleDrag(e, 'instructorImage')}
                onDragOver={(e) => handleDrag(e, 'instructorImage')}
                onDrop={(e) => handleDrop(e, 'instructorImage')}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${
                  dragActive['instructorImage'] 
                    ? 'border-[#5A9B8E] bg-[#5A9B8E]/10 scale-[1.02]' 
                    : 'border-gray-300 hover:border-[#5A9B8E] bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  document.getElementById('instructor-image').click();
                }}
              >
                {(formData.instructorImage instanceof File || (typeof formData.instructorImage === 'string' && formData.instructorImage)) ? (
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      {formData.instructorImage instanceof File ? (
                        <>
                          <img 
                            src={imagePreviews['instructorImage'] || URL.createObjectURL(formData.instructorImage)} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="text-left">
                            <p className="text-sm text-gray-700 font-medium">{formData.instructorImage.name}</p>
                            <p className="text-xs text-gray-500">{(formData.instructorImage.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <img 
                            src={formData.instructorImage} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="text-left">
                            <p className="text-sm text-gray-700 font-medium">Current Image</p>
                            <p className="text-xs text-gray-500">Click to replace</p>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={(e) => removeFile('instructorImage', e)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      dragActive['instructorImage'] ? 'bg-[#5A9B8E]/20' : 'bg-gray-200'
                    }`}>
                      <Upload className={`w-8 h-8 ${dragActive['instructorImage'] ? 'text-[#5A9B8E]' : 'text-gray-500'}`} />
                    </div>
                    <p className={`text-sm mb-1 font-medium ${dragActive['instructorImage'] ? 'text-[#5A9B8E]' : 'text-gray-700'}`}>
                      {dragActive['instructorImage'] ? 'Drop your image here' : 'Drag and drop your image here'}
                    </p>
                    <p className="text-gray-500 text-xs mb-4">or</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('instructorImage', e.target.files?.[0])}
                      className="hidden"
                      id="instructor-image"
                    />
                    <div className="inline-block px-6 py-2 bg-[#5A9B8E] text-white text-sm rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium">
                      Browse Files
                    </div>
                    <p className="text-gray-400 text-xs mt-4">Accepts: Images only (JPG, PNG, GIF, etc.)</p>
                    <p className="text-gray-400 text-xs">(Maximum file size: 2MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Course Details Page Section */}
          <div className="border-t-2 border-[#5A9B8E] pt-6 mt-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#5A9B8E] mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Course Details Page Information
              </h3>
              <p className="text-sm text-gray-600">Edit all information displayed on the course details page</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title English */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title (English)
                </label>
                <input
                  type="text"
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleChange}
                  placeholder="English title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Title Arabic */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title (Arabic)
                </label>
                <input
                  type="text"
                  name="titleAr"
                  value={formData.titleAr}
                  onChange={handleChange}
                  placeholder="Arabic title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Category Arabic */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category (Arabic)
                </label>
                <input
                  type="text"
                  name="categoryAr"
                  value={formData.categoryAr}
                  onChange={handleChange}
                  placeholder="Arabic category"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Skill Level
                </label>
                <select
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Lectures */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Lectures
                </label>
                <input
                  type="number"
                  name="lectures"
                  value={formData.lectures}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Enrolled */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enrolled Students
                </label>
                <input
                  type="number"
                  name="enrolled"
                  value={formData.enrolled}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Money Back Guarantee */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Money Back Guarantee
                </label>
                <input
                  type="text"
                  name="moneyBackGuarantee"
                  value={formData.moneyBackGuarantee}
                  onChange={handleChange}
                  placeholder="e.g., 30-Day Money-Back Guarantee"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Language
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  placeholder="e.g., English"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Quizzes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quizzes
                </label>
                <input
                  type="text"
                  name="quiz"
                  value={formData.quiz}
                  onChange={handleChange}
                  placeholder="e.g., Quiz 1, Quiz 2, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Instructor Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instructor Bio
                </label>
                <textarea
                  name="instructorBio"
                  value={formData.instructorBio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Instructor biography"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Description Short */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description
                </label>
                <textarea
                  name="descriptionShort"
                  value={formData.descriptionShort}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief description for course details page"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                />
              </div>

              {/* Learning Outcomes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Learning Outcomes
                </label>
                <div className="space-y-2">
                  {formData.learningOutcomes && formData.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => handleArrayChange('learningOutcomes', index, e.target.value)}
                        placeholder={`Learning outcome ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('learningOutcomes', index)}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('learningOutcomes', '')}
                    className="flex items-center gap-2 px-4 py-2 text-[#5A9B8E] hover:bg-[#5A9B8E]/10 rounded-lg transition-colors border border-[#5A9B8E]"
                  >
                    <Plus className="w-4 h-4" />
                    Add Learning Outcome
                  </button>
                </div>
              </div>

              {/* Curriculum */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Curriculum
                </label>
                <div className="space-y-4">
                  {formData.curriculum && formData.curriculum.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => handleCurriculumSectionChange(sectionIndex, 'title', e.target.value)}
                          placeholder={`Section ${sectionIndex + 1} Title`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeCurriculumSection(sectionIndex)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-4 ml-4">
                        {Array.isArray(section.lessons) && section.lessons.length > 0 && section.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="border border-gray-300 rounded-lg p-4 bg-white">
                            <div className="flex gap-2 mb-3">
                              <input
                                type="text"
                                value={lesson.name || ''}
                                onChange={(e) => handleCurriculumLessonChange(sectionIndex, lessonIndex, 'name', e.target.value)}
                                placeholder="Lesson name"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                              />
                              <input
                                type="text"
                                value={lesson.duration || ''}
                                onChange={(e) => handleCurriculumLessonChange(sectionIndex, lessonIndex, 'duration', e.target.value)}
                                placeholder="Duration"
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                              />
                              <select
                                value={lesson.type || 'video'}
                                onChange={(e) => handleCurriculumLessonChange(sectionIndex, lessonIndex, 'type', e.target.value)}
                                className="w-36 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                              >
                                <option value="video">Video</option>
                                <option value="pdf">PDF</option>
                                <option value="quiz_link">Quiz Link</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeCurriculumLesson(sectionIndex, lessonIndex)}
                                className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Video URL Input */}
                            {lesson.type === 'video' && (
                              <div className="mb-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Video URL (YouTube embed URL or direct video URL)
                                </label>
                                <input
                                  type="text"
                                  value={lesson.videoUrl || ''}
                                  onChange={(e) => handleCurriculumLessonChange(sectionIndex, lessonIndex, 'videoUrl', e.target.value)}
                                  placeholder="https://www.youtube.com/embed/... or https://..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Paste any YouTube URL (watch or embed) - it will be converted automatically. 
                                  Example: https://www.youtube.com/watch?v=VIDEO_ID
                                </p>
                              </div>
                            )}
                            
                            {/* PDF URL Input */}
                            {lesson.type === 'pdf' && (
                              <div className="mb-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  PDF URL or File Path
                                </label>
                                <input
                                  type="text"
                                  value={lesson.pdfUrl || ''}
                                  onChange={(e) => handleCurriculumLessonChange(sectionIndex, lessonIndex, 'pdfUrl', e.target.value)}
                                  placeholder="https://... or /path/to/file.pdf"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                                />
                              </div>
                            )}
                            
                            {/* Quiz Link URL Input */}
                            {lesson.type === 'quiz_link' && (
                              <div className="mb-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Quiz Link URL
                                </label>
                                <input
                                  type="text"
                                  value={lesson.quizUrl || ''}
                                  onChange={(e) => handleCurriculumLessonChange(sectionIndex, lessonIndex, 'quizUrl', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addCurriculumLesson(sectionIndex)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-[#5A9B8E] hover:bg-[#5A9B8E]/10 rounded-lg transition-colors border border-[#5A9B8E]"
                        >
                          <Plus className="w-3 h-3" />
                          Add Lesson
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCurriculumSection}
                    className="flex items-center gap-2 px-4 py-2 text-[#5A9B8E] hover:bg-[#5A9B8E]/10 rounded-lg transition-colors border border-[#5A9B8E]"
                  >
                    <Plus className="w-4 h-4" />
                    Add Curriculum Section
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEditForm;
