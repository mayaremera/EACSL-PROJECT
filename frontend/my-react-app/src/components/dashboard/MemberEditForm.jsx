import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Upload, Check, AlertCircle, BookOpen, Plus, Trash2 } from 'lucide-react';
import { membersManager, coursesManager } from '../../utils/dataManager';
import { membersService } from '../../services/membersService';
import ImagePlaceholder from '../ui/ImagePlaceholder';

const MemberEditForm = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Member',
    displayRole: '', // Public-facing role (editable in dashboard)
    description: '',
    fullDescription: '',
    email: '',
    isActive: true,
    activeTill: '',
    certificates: [], // Array of {title, image, imagePath}
    specialty: [], // Array of specialty strings
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    image: '',
    totalMoneySpent: '0 EGP',
    coursesEnrolled: 0,
    totalHoursLearned: 0,
    activeCourses: [],
    completedCourses: [],
    customCourses: [] // Array of {title, image, imagePath}
  });
  const [newCertificate, setNewCertificate] = useState({ title: '', imageFile: null, imagePreview: null });
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [isUploadingCertificateImage, setIsUploadingCertificateImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [emailExistsError, setEmailExistsError] = useState(null); // null, 'member', or 'pending'
  const [createAuthAccount, setCreateAuthAccount] = useState(false); // Checkbox for creating auth account
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedActiveCourse, setSelectedActiveCourse] = useState('');
  const [selectedCompletedCourse, setSelectedCompletedCourse] = useState('');
  const [newCustomCourse, setNewCustomCourse] = useState({ title: '', imageFile: null, imagePreview: null });
  const [editingCustomCourse, setEditingCustomCourse] = useState(null);
  const [isUploadingCustomCourseImage, setIsUploadingCustomCourseImage] = useState(false);
  
  // Available specialties (matching BecomeMemberForm)
  const availableSpecialties = [
    'Speech sound disorder (children)',
    'Language disorder (children)',
    'Neurogenic communication disorders',
    'Voice and upper respiratory disorders',
    'Fluency disorders',
    'Craniofacial and velopharyngeal disorders',
    'Hearing and balance sciences disorders'
  ];

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      // Cleanup custom course preview URLs
      if (newCustomCourse.imagePreview && newCustomCourse.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(newCustomCourse.imagePreview);
      }
      // Cleanup certificate preview URLs
      if (newCertificate.imagePreview && newCertificate.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(newCertificate.imagePreview);
      }
      // Cleanup any custom courses with blob previews
      if (formData.customCourses) {
        formData.customCourses.forEach(course => {
          if (course.imagePreview && course.imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(course.imagePreview);
          }
        });
      }
    };
  }, [imagePreview, newCustomCourse.imagePreview, newCertificate.imagePreview, formData.customCourses]);

  useEffect(() => {
    if (member) {
      // Ensure all fields are properly initialized from member data
      // IMPORTANT: Preserve exact isActive value (false should stay false, true should stay true)
      // Check if isActive exists and convert to boolean properly
      let memberIsActive = true; // Default to true
      if (member.hasOwnProperty('isActive')) {
        // Explicitly check for false (including string "false", 0, null, etc.)
        if (member.isActive === false || member.isActive === 'false' || member.isActive === 0) {
          memberIsActive = false;
        } else if (member.isActive === true || member.isActive === 'true' || member.isActive === 1) {
          memberIsActive = true;
        } else {
          // For any other truthy value, set to true
          memberIsActive = Boolean(member.isActive);
        }
      }
      
      // Determine displayRole: use member.displayRole if set, otherwise fall back to role
      const initialDisplayRole = (member.displayRole && String(member.displayRole).trim() !== '') 
        ? String(member.displayRole).trim() 
        : (member.role || 'Member');
      
      // Handle certificates: convert old string format to object format if needed
      let certificates = [];
      if (member.certificates && Array.isArray(member.certificates)) {
        certificates = member.certificates.map(cert => {
          // If it's already an object with title/image, use it
          if (typeof cert === 'object' && cert !== null && cert.title) {
            return cert;
          }
          // If it's a string (old format), convert to object
          if (typeof cert === 'string') {
            return { title: cert, image: '', imagePath: '' };
          }
          return cert;
        });
      }
      
      // Debug logging for specialty
      console.log('🔍 Loading member data:', {
        memberId: member.id,
        memberName: member.name,
        specialtyFromMember: member.specialty,
        specialtyType: typeof member.specialty,
        isArray: Array.isArray(member.specialty)
      });
      
      setFormData({
        name: member.name || '',
        role: member.role || 'Member',
        displayRole: initialDisplayRole, // Public-facing role (defaults to role if not set)
        description: member.description || '',
        fullDescription: member.fullDescription || '',
        email: member.email || '',
        isActive: memberIsActive, // Use the preserved value
        activeTill: member.activeTill || '',
        certificates: certificates,
        specialty: Array.isArray(member.specialty) ? member.specialty : [],
        phone: member.phone || '',
        location: member.location || '',
        website: member.website || '',
        linkedin: member.linkedin || '',
        image: member.image || '',
        totalMoneySpent: member.totalMoneySpent || '0 EGP',
        coursesEnrolled: member.coursesEnrolled || 0,
        totalHoursLearned: member.totalHoursLearned || 0,
        // Ensure activeCourses and completedCourses are always arrays
        activeCourses: Array.isArray(member.activeCourses) ? member.activeCourses : [],
        completedCourses: Array.isArray(member.completedCourses) ? member.completedCourses : [],
        customCourses: Array.isArray(member.customCourses) ? member.customCourses : []
      });
      setEmailExistsError(null); // Reset error when editing existing member
    } else {
      // Reset to defaults when adding new member
      // For new members, displayRole defaults to role
      setFormData({
        name: '',
        role: 'Member',
        displayRole: 'Member', // Default to 'Member' for new members
        description: '',
        fullDescription: '',
        email: '',
        isActive: true,
        activeTill: '',
        certificates: [],
        specialty: [],
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        image: '',
        totalMoneySpent: '0 EGP',
        coursesEnrolled: 0,
        totalHoursLearned: 0,
        activeCourses: [],
        completedCourses: [],
        customCourses: []
      });
      setEmailExistsError(null); // Reset error when adding new member
    }
  }, [member]);

  // Listen for member updates and refresh form data
  useEffect(() => {
    const handleMemberUpdate = () => {
      if (member && member.id) {
        // Get the latest member data from membersManager (use cached data for fast access)
        const updatedMember = membersManager._getAllFromLocalStorage().find(m => m.id === member.id);
        if (updatedMember) {
          // Update form data with latest member data
          let memberIsActive = true;
          if (updatedMember.hasOwnProperty('isActive')) {
            if (updatedMember.isActive === false || updatedMember.isActive === 'false' || updatedMember.isActive === 0) {
              memberIsActive = false;
            } else if (updatedMember.isActive === true || updatedMember.isActive === 'true' || updatedMember.isActive === 1) {
              memberIsActive = true;
            } else {
              memberIsActive = Boolean(updatedMember.isActive);
            }
          }
          
          // Handle certificates: convert old string format to object format if needed
          let updatedCertificates = [];
          if (updatedMember.certificates && Array.isArray(updatedMember.certificates)) {
            updatedCertificates = updatedMember.certificates.map(cert => {
              if (typeof cert === 'object' && cert !== null && cert.title) {
                return cert;
              }
              if (typeof cert === 'string') {
                return { title: cert, image: '', imagePath: '' };
              }
              return cert;
            });
          }
          
          // Debug logging for specialty update
          console.log('🔍 Updating member data:', {
            memberId: updatedMember.id,
            memberName: updatedMember.name,
            specialtyFromUpdated: updatedMember.specialty,
            specialtyType: typeof updatedMember.specialty,
            isArray: Array.isArray(updatedMember.specialty)
          });
          
          setFormData({
            name: updatedMember.name || '',
            role: updatedMember.role || 'Member',
            description: updatedMember.description || '',
            fullDescription: updatedMember.fullDescription || '',
            email: updatedMember.email || '',
            isActive: memberIsActive,
            activeTill: updatedMember.activeTill || '',
            certificates: updatedCertificates,
            specialty: Array.isArray(updatedMember.specialty) ? updatedMember.specialty : [],
            phone: updatedMember.phone || '',
            location: updatedMember.location || '',
            website: updatedMember.website || '',
            linkedin: updatedMember.linkedin || '',
            image: updatedMember.image || '',
            totalMoneySpent: updatedMember.totalMoneySpent || '0 EGP',
            coursesEnrolled: updatedMember.coursesEnrolled || 0,
            totalHoursLearned: updatedMember.totalHoursLearned || 0,
            // Ensure activeCourses and completedCourses are always arrays
            activeCourses: Array.isArray(updatedMember.activeCourses) ? updatedMember.activeCourses : [],
            completedCourses: Array.isArray(updatedMember.completedCourses) ? updatedMember.completedCourses : [],
            customCourses: Array.isArray(updatedMember.customCourses) ? updatedMember.customCourses : []
          });
        }
      }
    };

    window.addEventListener('membersUpdated', handleMemberUpdate);
    return () => {
      window.removeEventListener('membersUpdated', handleMemberUpdate);
    };
  }, [member]);

  // Load available courses
  useEffect(() => {
    const loadCourses = async () => {
      // First, load from cache for immediate display
      const cachedCourses = coursesManager._getAllFromLocalStorage();
      setAvailableCourses(cachedCourses);
      
      // Then refresh from Supabase in the background
      try {
        const courses = await coursesManager.getAll();
        setAvailableCourses(courses);
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    
    loadCourses();
  }, []);

  // Roles available in the system (Admin is NOT in this list - it's set directly in Supabase)
  // Admin role is for authentication only and should not be selectable in the dropdown
  const roles = ['Member', 'Affiliated Member', 'Board Member', 'Honorary President', 'Founder'];
  
  // Display roles (what shows on the website)
  const displayRoles = ['Member', 'Affiliated Member', 'Board Member', 'Honorary President', 'Founder'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? 0 : parseFloat(value) || 0) : value)
    }));
    // Reset email error when email changes
    if (name === 'email') {
      setEmailExistsError(null);
    }
  };

  const handleCertificateImageChange = (file) => {
    if (file) {
      const isValidImage = file.type.startsWith('image/') || 
                          /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
      
      if (isValidImage) {
        if (editingCertificate !== null) {
          // Editing existing certificate
          const previewUrl = URL.createObjectURL(file);
          setFormData(prev => {
            const updated = [...(prev.certificates || [])];
            updated[editingCertificate] = {
              ...updated[editingCertificate],
              imageFile: file,
              imagePreview: previewUrl
            };
            return { ...prev, certificates: updated };
          });
        } else {
          // Adding new certificate
          const previewUrl = URL.createObjectURL(file);
          setNewCertificate(prev => ({
            ...prev,
            imageFile: file,
            imagePreview: previewUrl
          }));
        }
      } else {
        alert('Please upload only image files (JPG, PNG, GIF, etc.)');
      }
    }
  };

  const handleAddCertificate = async () => {
    if (!newCertificate.title.trim()) {
      alert('Please enter a certificate title');
      return;
    }

    setIsUploadingCertificateImage(true);
    try {
      let imageUrl = '';
      let imagePath = '';

      if (newCertificate.imageFile) {
        const uploadResult = await membersService.uploadImage(
          newCertificate.imageFile,
          `certificate-${Date.now()}-${newCertificate.imageFile.name}`
        );
        if (uploadResult.data && !uploadResult.error) {
          imageUrl = uploadResult.data.url;
          imagePath = uploadResult.data.path;
        }
      }

      const certificateToAdd = {
        title: newCertificate.title.trim(),
        image: imageUrl,
        imagePath: imagePath
      };

      setFormData(prev => ({
        ...prev,
        certificates: [...(prev.certificates || []), certificateToAdd]
      }));

      // Clean up preview URL
      if (newCertificate.imagePreview) {
        URL.revokeObjectURL(newCertificate.imagePreview);
      }

      // Reset form
      setNewCertificate({ title: '', imageFile: null, imagePreview: null });
    } catch (error) {
      console.error('Error uploading certificate image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingCertificateImage(false);
    }
  };

  const handleEditCertificate = (index) => {
    const certificate = formData.certificates[index];
    setEditingCertificate(index);
    setNewCertificate({
      title: certificate.title || '',
      imageFile: null,
      imagePreview: certificate.image || null
    });
  };

  const handleUpdateCertificate = async () => {
    if (!newCertificate.title.trim()) {
      alert('Please enter a certificate title');
      return;
    }

    if (editingCertificate === null) return;

    setIsUploadingCertificateImage(true);
    try {
      const certificate = formData.certificates[editingCertificate];
      let imageUrl = certificate.image || '';
      let imagePath = certificate.imagePath || '';

      // If new image file is uploaded
      if (newCertificate.imageFile) {
        // Delete old image if exists
        if (certificate.imagePath) {
          try {
            await membersService.deleteImage(certificate.imagePath);
          } catch (err) {
            console.warn('Could not delete old image:', err);
          }
        }

        const uploadResult = await membersService.uploadImage(
          newCertificate.imageFile,
          `certificate-${Date.now()}-${newCertificate.imageFile.name}`
        );
        if (uploadResult.data && !uploadResult.error) {
          imageUrl = uploadResult.data.url;
          imagePath = uploadResult.data.path;
        }
      }

      const updated = [...(formData.certificates || [])];
      updated[editingCertificate] = {
        title: newCertificate.title.trim(),
        image: imageUrl,
        imagePath: imagePath
      };

    setFormData(prev => ({
      ...prev,
        certificates: updated
      }));

      // Clean up preview URL if it was a blob
      if (newCertificate.imagePreview && newCertificate.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(newCertificate.imagePreview);
      }

      // Reset
      setEditingCertificate(null);
      setNewCertificate({ title: '', imageFile: null, imagePreview: null });
    } catch (error) {
      console.error('Error updating certificate:', error);
      alert('Failed to update certificate. Please try again.');
    } finally {
      setIsUploadingCertificateImage(false);
    }
  };

  const handleDeleteCertificate = async (index) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    const certificate = formData.certificates[index];
    
    // Delete image from storage if exists
    if (certificate.imagePath) {
      try {
        await membersService.deleteImage(certificate.imagePath);
      } catch (err) {
        console.warn('Could not delete certificate image:', err);
      }
    }

    setFormData(prev => ({
      ...prev,
      certificates: (prev.certificates || []).filter((_, i) => i !== index)
    }));
  };

  const handleCancelEditCertificate = () => {
    // Clean up preview URL if it was a blob
    if (newCertificate.imagePreview && newCertificate.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(newCertificate.imagePreview);
    }
    setEditingCertificate(null);
    setNewCertificate({ title: '', imageFile: null, imagePreview: null });
  };

  const handleSpecialtyChange = (specialty) => {
    const newSpecialty = formData.specialty.includes(specialty)
      ? formData.specialty.filter(s => s !== specialty)
      : [...formData.specialty, specialty];
    
    setFormData(prev => ({
      ...prev,
      specialty: newSpecialty
    }));
  };

  const handleAddActiveCourse = () => {
    if (selectedActiveCourse) {
      const course = availableCourses.find(c => c.id === parseInt(selectedActiveCourse));
      if (course && !(formData.activeCourses || []).some(ac => ac.id === course.id)) {
        setFormData(prev => ({
          ...prev,
          activeCourses: [...(prev.activeCourses || []), { ...course, enrolledDate: new Date().toISOString() }]
        }));
        setSelectedActiveCourse('');
      }
    }
  };

  const handleRemoveActiveCourse = (courseId) => {
    setFormData(prev => ({
      ...prev,
      activeCourses: (prev.activeCourses || []).filter(ac => ac.id !== courseId)
    }));
  };

  const handleAddCompletedCourse = () => {
    if (selectedCompletedCourse) {
      const course = availableCourses.find(c => c.id === parseInt(selectedCompletedCourse));
      if (course && !(formData.completedCourses || []).some(cc => cc.id === course.id)) {
        setFormData(prev => ({
          ...prev,
          completedCourses: [...(prev.completedCourses || []), { ...course, completedDate: new Date().toISOString() }]
        }));
        setSelectedCompletedCourse('');
      }
    }
  };

  const handleRemoveCompletedCourse = (courseId) => {
    setFormData(prev => ({
      ...prev,
      completedCourses: (prev.completedCourses || []).filter(cc => cc.id !== courseId)
    }));
  };

  const handleCustomCourseImageChange = (file) => {
    if (file) {
      const isValidImage = file.type.startsWith('image/') || 
                          /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
      
      if (isValidImage) {
        if (editingCustomCourse !== null) {
          // Editing existing course
          const previewUrl = URL.createObjectURL(file);
          setFormData(prev => {
            const updated = [...(prev.customCourses || [])];
            updated[editingCustomCourse] = {
              ...updated[editingCustomCourse],
              imageFile: file,
              imagePreview: previewUrl
            };
            return { ...prev, customCourses: updated };
          });
        } else {
          // Adding new course
          const previewUrl = URL.createObjectURL(file);
          setNewCustomCourse(prev => ({
            ...prev,
            imageFile: file,
            imagePreview: previewUrl
          }));
        }
      } else {
        alert('Please upload only image files (JPG, PNG, GIF, etc.)');
      }
    }
  };

  const handleAddCustomCourse = async () => {
    if (!newCustomCourse.title.trim()) {
      alert('Please enter a course title');
      return;
    }

    setIsUploadingCustomCourseImage(true);
    try {
      let imageUrl = '';
      let imagePath = '';

      if (newCustomCourse.imageFile) {
        const uploadResult = await membersService.uploadImage(
          newCustomCourse.imageFile,
          `custom-course-${Date.now()}-${newCustomCourse.imageFile.name}`
        );
        if (uploadResult.data && !uploadResult.error) {
          imageUrl = uploadResult.data.url;
          imagePath = uploadResult.data.path;
        }
      }

      const courseToAdd = {
        title: newCustomCourse.title.trim(),
        image: imageUrl,
        imagePath: imagePath
      };

      setFormData(prev => ({
        ...prev,
        customCourses: [...(prev.customCourses || []), courseToAdd]
      }));

      // Clean up preview URL
      if (newCustomCourse.imagePreview) {
        URL.revokeObjectURL(newCustomCourse.imagePreview);
      }

      // Reset form
      setNewCustomCourse({ title: '', imageFile: null, imagePreview: null });
    } catch (error) {
      console.error('Error uploading custom course image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingCustomCourseImage(false);
    }
  };

  const handleEditCustomCourse = (index) => {
    const course = formData.customCourses[index];
    setEditingCustomCourse(index);
    setNewCustomCourse({
      title: course.title || '',
      imageFile: null,
      imagePreview: course.image || null
    });
  };

  const handleUpdateCustomCourse = async () => {
    if (!newCustomCourse.title.trim()) {
      alert('Please enter a course title');
      return;
    }

    if (editingCustomCourse === null) return;

    setIsUploadingCustomCourseImage(true);
    try {
      const course = formData.customCourses[editingCustomCourse];
      let imageUrl = course.image || '';
      let imagePath = course.imagePath || '';

      // If new image file is uploaded
      if (newCustomCourse.imageFile) {
        // Delete old image if exists
        if (course.imagePath) {
          try {
            await membersService.deleteImage(course.imagePath);
          } catch (err) {
            console.warn('Could not delete old image:', err);
          }
        }

        const uploadResult = await membersService.uploadImage(
          newCustomCourse.imageFile,
          `custom-course-${Date.now()}-${newCustomCourse.imageFile.name}`
        );
        if (uploadResult.data && !uploadResult.error) {
          imageUrl = uploadResult.data.url;
          imagePath = uploadResult.data.path;
        }
      }

      const updated = [...(formData.customCourses || [])];
      updated[editingCustomCourse] = {
        title: newCustomCourse.title.trim(),
        image: imageUrl,
        imagePath: imagePath
      };

      setFormData(prev => ({
        ...prev,
        customCourses: updated
      }));

      // Clean up preview URL if it was a blob
      if (newCustomCourse.imagePreview && newCustomCourse.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(newCustomCourse.imagePreview);
      }

      // Reset
      setEditingCustomCourse(null);
      setNewCustomCourse({ title: '', imageFile: null, imagePreview: null });
    } catch (error) {
      console.error('Error updating custom course:', error);
      alert('Failed to update course. Please try again.');
    } finally {
      setIsUploadingCustomCourseImage(false);
    }
  };

  const handleDeleteCustomCourse = async (index) => {
    if (!window.confirm('Are you sure you want to delete this custom course?')) {
      return;
    }

    const course = formData.customCourses[index];
    
    // Delete image from storage if exists
    if (course.imagePath) {
      try {
        await membersService.deleteImage(course.imagePath);
      } catch (err) {
        console.warn('Could not delete course image:', err);
      }
    }

    setFormData(prev => ({
      ...prev,
      customCourses: (prev.customCourses || []).filter((_, i) => i !== index)
    }));
  };

  const handleCancelEditCustomCourse = () => {
    // Clean up preview URL if it was a blob
    if (newCustomCourse.imagePreview && newCustomCourse.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(newCustomCourse.imagePreview);
    }
    setEditingCustomCourse(null);
    setNewCustomCourse({ title: '', imageFile: null, imagePreview: null });
  };

  const handleFileChange = (field, file) => {
    if (file) {
      // Check if it's an image file by MIME type or extension
      const isValidImage = file.type.startsWith('image/') || 
                          /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
      
      if (isValidImage) {
        // Clean up old preview URL if it exists
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setFormData(prev => ({ ...prev, [field]: file }));
        // Create preview URL for the uploaded file
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
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

  const removeFile = async (field, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Immediately update UI to prevent "stuck" feeling
    setFormData(prev => ({ ...prev, [field]: '' }));
    
    // Clean up object URL if it exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    
    // Delete from storage in background (don't block UI)
    if (field === 'image' && member && member.image) {
      if (member.image.includes('dashboardmemberimages')) {
        // Image is in storage - delete it (async, don't wait)
        membersService.deleteImage(member.image)
          .then(() => {
            console.log('✅ Deleted image from storage');
          })
          .catch((deleteError) => {
            console.warn('Could not delete image from storage:', deleteError);
            // Don't show error to user - image is already removed from form
          });
      }
    }
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
    setEmailExistsError(null); // Reset error state
    
    console.log('Form submitted with data:', formData);
    console.log('Member being edited:', member);
    
    try {
      // Check if email already exists (only when adding new member, not editing)
      if (!member) {
        console.log('Checking if email exists before adding member...');
        
        // Check in existing members (use cached data for fast access)
        const existingMembers = membersManager._getAllFromLocalStorage();
        const existingMember = existingMembers.find(m => 
          m.email && m.email.toLowerCase() === formData.email.toLowerCase()
        );
        
        if (existingMember) {
          console.log('Email already exists in members:', existingMember);
          setIsLoading(false);
          setEmailExistsError('member');
          return;
        }
        
        // Check in pending applications (localStorage)
        try {
          const stored = localStorage.getItem('memberForms');
          if (stored) {
            const existingForms = JSON.parse(stored);
            const pendingApplication = existingForms.find(
              form => form.email && 
              form.email.toLowerCase() === formData.email.toLowerCase() &&
              form.status === 'pending'
            );
            
            if (pendingApplication) {
              console.log('Email already has pending application:', pendingApplication);
              setIsLoading(false);
              setEmailExistsError('pending');
              return;
            }
          }
        } catch (error) {
          console.warn('Error checking pending applications:', error);
          // Continue with save if we can't check
        }
      }

      // Handle image upload - try Supabase Storage first, fallback to base64
      let imageDataUrl = '';
      if (formData.image instanceof File) {
        // New file uploaded - try to upload to Supabase Storage
        try {
          console.log('📤 Uploading image to Supabase Storage...');
          console.log('File details:', {
            name: formData.image.name,
            size: formData.image.size,
            type: formData.image.type
          });
          
          const uploadResult = await membersService.uploadImage(formData.image, formData.image.name);
          
          console.log('Upload result:', uploadResult);
          
          if (uploadResult.data && uploadResult.data.url) {
            // Successfully uploaded to Supabase Storage
            imageDataUrl = uploadResult.data.url;
            console.log('✅ Image uploaded to Supabase Storage:', imageDataUrl);
            console.log('✅ Image path:', uploadResult.data.path);
            
            // If member had an old image, delete it (from storage or it will be replaced in localStorage)
            if (member && member.image) {
              if (member.image.includes('dashboardmemberimages')) {
                // Old image is in storage - delete it
                try {
                  await membersService.deleteImage(member.image);
                  console.log('✅ Deleted old image from storage');
                } catch (deleteError) {
                  console.warn('Could not delete old image from storage:', deleteError);
                }
              } else if (member.image.startsWith('data:image')) {
                // Old image is base64 - it will be replaced in localStorage (no need to delete separately)
                console.log('✅ Old base64 image will be replaced in localStorage');
              }
            }
          } else {
            // Storage upload failed - check error type
            const error = uploadResult.error;
            const errorMessage = error?.message || error?.error || 'Unknown error';
            
            console.error('Upload failed. Full error:', error);
            
            if (errorMessage.includes('Bucket not found') || 
                errorMessage.includes('not found') ||
                error?.statusCode === 404) {
              console.warn('Supabase Storage bucket "dashboardmemberimages" not found.');
              alert('⚠️ Storage bucket not found.\n\nTo fix:\n1. Go to Supabase Dashboard → Storage\n2. Create bucket "dashboardmemberimages"\n3. Set it to Public\n4. Try uploading again');
              imageDataUrl = '';
            } else if (errorMessage.includes('row-level security') || 
                       errorMessage.includes('RLS') ||
                       errorMessage.includes('policy') ||
                       error?.statusCode === 403) {
              console.warn('RLS policy blocking upload.');
              alert('⚠️ Upload blocked: Bucket is Private\n\nTo fix:\n1. Go to Supabase Dashboard → Storage\n2. Find "dashboardmemberimages" bucket\n3. Click Settings icon (⚙️) next to the bucket\n4. Toggle "Public bucket" to ON\n5. Click Save\n6. Refresh and try again\n\nSee FIX_RLS_ERROR.md for detailed steps.');
              imageDataUrl = '';
            } else {
              // Other error - show the actual error
              console.warn('Failed to upload to Supabase Storage:', error);
              alert(`⚠️ Upload failed: ${errorMessage}\n\nPlease check:\n1. Bucket "dashboardmemberimages" exists\n2. Bucket is set to Public\n3. Check browser console for details`);
              imageDataUrl = '';
            }
          }
        } catch (uploadError) {
          console.error('Exception uploading image. Image will not be saved:', uploadError);
          // Don't save to avoid localStorage quota issues
          alert('⚠️ Error uploading image. Please create the "dashboardmemberimages" bucket in Supabase Storage.\n\nImage will show placeholder.');
          imageDataUrl = '';
        }
      } else if (formData.image === '') {
        // Image was explicitly removed - delete from storage if it exists
        if (member && member.image && member.image.includes('dashboardmemberimages')) {
          try {
            await membersService.deleteImage(member.image);
            console.log('✅ Deleted removed image from storage');
          } catch (deleteError) {
            console.warn('Could not delete removed image from storage:', deleteError);
          }
        }
        imageDataUrl = '';
      } else if (formData.image && typeof formData.image === 'string' && formData.image.trim() !== '') {
        // Existing image (data URL or URL) - keep it
        imageDataUrl = formData.image.trim();
      } else if (member && member.image) {
        // No new image provided, but member has existing image - preserve it
        imageDataUrl = member.image;
      } else {
        // No image at all
        imageDataUrl = '';
      }

      // Ensure all fields are properly saved, especially isActive as boolean
      // Note: role is read-only and comes from Supabase, but we preserve it
      // displayRole is required and will default to role if not set
      const dataToSave = {
        name: formData.name || '',
        role: formData.role || 'Member', // Preserved from Supabase (read-only)
        displayRole: formData.displayRole || formData.role || 'Member', // Public-facing role (required, falls back to role)
        description: formData.description || '',
        fullDescription: formData.fullDescription || '',
        email: formData.email || '',
        isActive: Boolean(formData.isActive), // Always convert to boolean
        activeTill: formData.activeTill || '',
        certificates: Array.isArray(formData.certificates) ? formData.certificates : [],
        specialty: Array.isArray(formData.specialty) ? formData.specialty : [],
        phone: formData.phone || '',
        location: formData.location || '',
        website: formData.website || '',
        linkedin: formData.linkedin || '',
        image: imageDataUrl, // Always include image, even if empty
        totalMoneySpent: formData.totalMoneySpent || '0 EGP',
        coursesEnrolled: formData.coursesEnrolled || 0,
        totalHoursLearned: formData.totalHoursLearned || 0,
        // Ensure activeCourses and completedCourses are always arrays when saving
        activeCourses: Array.isArray(formData.activeCourses) ? formData.activeCourses : [],
        completedCourses: Array.isArray(formData.completedCourses) ? formData.completedCourses : [],
        customCourses: Array.isArray(formData.customCourses) ? formData.customCourses : [],
        createAuthAccount: !member && createAuthAccount // Only for new members
      };
      
      console.log('Data to save:', dataToSave);
      console.log('Certificates being saved:', dataToSave.certificates);
      console.log('Number of certificates:', dataToSave.certificates.length);
      console.log('Specialty being saved:', dataToSave.specialty);
      console.log('Number of specialties:', dataToSave.specialty.length);
      await onSave(dataToSave);
      console.log('Save completed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="bg-white rounded-none md:rounded-xl max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex items-center justify-between z-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {member ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-w-0">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name ?? ''}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role <span className="text-xs text-gray-500 font-normal">(Read-only - set in Supabase)</span>
              </label>
              <select
                name="role"
                value={formData.role ?? 'Member'}
                onChange={handleChange}
                disabled
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed outline-none text-sm md:text-base"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
                {formData.role && !roles.includes(formData.role) && (
                  <option value={formData.role}>{formData.role}</option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Role is managed in Supabase. Use Display Role to control what shows on the website.
              </p>
            </div>

            {/* Display Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Role * <span className="text-xs text-gray-500 font-normal">(Shown on website)</span>
              </label>
              <select
                name="displayRole"
                value={formData.displayRole || formData.role || 'Member'}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
              >
                {displayRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This is what visitors see on the website. Required field.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email ?? ''}
                onChange={handleChange}
                required
                className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base ${
                  emailExistsError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {emailExistsError && (
                <div className={`mt-3 p-3 md:p-4 rounded-lg border flex gap-2 md:gap-3 ${
                  emailExistsError === 'member' 
                    ? 'bg-amber-50 border-amber-500' 
                    : 'bg-blue-50 border-blue-500'
                }`}>
                  <AlertCircle className={`w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0 ${
                    emailExistsError === 'member' ? 'text-amber-600' : 'text-blue-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-xs md:text-sm ${
                      emailExistsError === 'member' ? 'text-amber-800' : 'text-blue-800'
                    }`}>
                      {emailExistsError === 'member' 
                        ? 'Email Already Exists' 
                        : 'Pending Application Exists'}
                    </p>
                    <p className={`text-xs md:text-sm mt-1 break-words ${
                      emailExistsError === 'member' ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                      {emailExistsError === 'member' 
                        ? `An account with email ${formData.email} already exists in our system. If you already have an account, please sign in instead. If you believe this is an error, please contact support.`
                        : `You already have a pending application with email ${formData.email}. Please wait for your current application to be reviewed before submitting again.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone ?? ''}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location ?? ''}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>

            {/* Active Till */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Active Till
              </label>
              <input
                type="text"
                name="activeTill"
                value={formData.activeTill ?? ''}
                onChange={handleChange}
                placeholder="e.g., 2025"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Active Status *
              </label>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, isActive: true }));
                  }}
                  className={`flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base ${
                    Boolean(formData.isActive) === true
                      ? 'bg-green-500 text-white shadow-md ring-2 ring-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ✓ Active
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, isActive: false }));
                  }}
                  className={`flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base ${
                    Boolean(formData.isActive) === false
                      ? 'bg-red-500 text-white shadow-md ring-2 ring-red-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ✗ Inactive
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Current status: <span className={`font-semibold ${Boolean(formData.isActive) ? 'text-green-600' : 'text-red-600'}`}>
                  {Boolean(formData.isActive) ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Member Image <span className="text-red-500">*</span>
              </label>
              <div
                onDragEnter={(e) => handleDrag(e, 'image')}
                onDragLeave={(e) => handleDrag(e, 'image')}
                onDragOver={(e) => handleDrag(e, 'image')}
                onDrop={(e) => handleDrop(e, 'image')}
                className={`border-2 border-dashed rounded-lg p-4 md:p-6 text-center transition-all duration-300 cursor-pointer ${
                  dragActive['image'] 
                    ? 'border-[#5A9B8E] bg-[#5A9B8E]/10 scale-[1.02]' 
                    : 'border-gray-300 hover:border-[#5A9B8E] bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  document.getElementById('member-image').click();
                }}
              >
                {(formData.image instanceof File || (typeof formData.image === 'string' && formData.image.trim() !== '')) ? (
                  <div className="flex items-center justify-between bg-white p-3 md:p-4 rounded-lg shadow-sm min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      {formData.image instanceof File ? (
                        <>
                          <img 
                            src={imagePreview || URL.createObjectURL(formData.image)} 
                            alt="Preview" 
                            className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-xs md:text-sm text-gray-700 font-medium truncate">{formData.image.name}</p>
                            <p className="text-xs text-gray-500">{(formData.image.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImagePlaceholder
                            src={formData.image}
                            alt="Preview"
                            name={formData.name || 'Member'}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex-shrink-0"
                          />
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-xs md:text-sm text-gray-700 font-medium">Current Image</p>
                            <p className="text-xs text-gray-500">Click to replace</p>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={(e) => removeFile('image', e)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                      title="Remove image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-lg overflow-hidden">
                      <ImagePlaceholder
                        text={formData.name || 'Member'}
                        className="w-full h-full"
                        textClassName="text-2xl"
                      />
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
                      id="member-image"
                    />
                    <div className="inline-block px-4 md:px-6 py-2 bg-[#5A9B8E] text-white text-xs md:text-sm rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium">
                      Browse Files
                    </div>
                    <p className="text-gray-400 text-xs mt-3 md:mt-4">Accepts: Images only (JPG, PNG, GIF, etc.)</p>
                    <p className="text-gray-400 text-xs">(Maximum file size: 2MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website ?? ''}
                onChange={handleChange}
                placeholder="www.example.com"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin ?? ''}
                onChange={handleChange}
                placeholder="linkedin.com/in/username"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description *
              </label>
              <textarea
                name="description"
                value={formData.description ?? ''}
                onChange={handleChange}
                required
                rows="2"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>

            {/* Full Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description *
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription ?? ''}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>

            {/* Specializations */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Specializations
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select the member's specializations. These are also collected from the "Become a Member" form.
              </p>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                {availableSpecialties.map((specialty, index) => (
                  <label key={index} className="flex items-center mb-3 last:mb-0 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.specialty.includes(specialty)}
                      onChange={() => handleSpecialtyChange(specialty)}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-all ${
                      formData.specialty.includes(specialty)
                        ? 'border-[#5A9B8E] bg-[#5A9B8E]'
                        : 'border-gray-400 group-hover:border-[#5A9B8E]'
                    }`}>
                      {formData.specialty.includes(specialty) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      {specialty}
                    </span>
                  </label>
                ))}
              </div>
              {formData.specialty.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  {formData.specialty.length} specialization{formData.specialty.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Certificates & Qualifications */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Certificates & Qualifications
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add certificates with title and image. These are separate from specializations.
              </p>
              
              {/* Add/Edit Certificate Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Title *
                    </label>
                <input
                  type="text"
                      value={newCertificate.title}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                      placeholder="e.g., Advanced Speech Therapy Certification"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Image
                    </label>
                    {newCertificate.imagePreview ? (
                      <div className="relative">
                        <img
                          src={newCertificate.imagePreview}
                          alt="Certificate preview"
                          className="w-full h-48 object-cover object-top rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCertificate.imagePreview && newCertificate.imagePreview.startsWith('blob:')) {
                              URL.revokeObjectURL(newCertificate.imagePreview);
                            }
                            setNewCertificate(prev => ({ ...prev, imageFile: null, imagePreview: null }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleCertificateImageChange(e.target.files[0]);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                      />
                    )}
                  </div>

                  <div className="flex gap-2">
                    {editingCertificate !== null ? (
                      <>
                        <button
                          type="button"
                          onClick={handleUpdateCertificate}
                          disabled={isUploadingCertificateImage}
                          className="flex-1 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploadingCertificateImage ? 'Uploading...' : 'Update Certificate'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditCertificate}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                <button
                  type="button"
                  onClick={handleAddCertificate}
                        disabled={isUploadingCertificateImage}
                        className="flex-1 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                        {isUploadingCertificateImage ? 'Uploading...' : 'Add Certificate'}
                </button>
                    )}
              </div>
                </div>
              </div>

              {/* Display Certificates */}
              <div className="space-y-3">
                {(formData.certificates || []).map((certificate, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                    {certificate.image && (
                      <ImagePlaceholder
                        src={certificate.image}
                        alt={certificate.title}
                        name={certificate.title}
                        className="w-20 h-20 rounded-lg object-cover object-top flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{certificate.title}</h4>
                    </div>
                    <div className="flex gap-2">
                    <button
                      type="button"
                        onClick={() => handleEditCertificate(index)}
                        className="px-3 py-1.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCertificate(index)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                  </div>
                ))}
                {(!formData.certificates || formData.certificates.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No certificates added yet. Add certificates using the form above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Continuing Education Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-[#5A9B8E]" />
              <h3 className="text-xl font-bold text-gray-900">Continuing Education</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              {/* Courses Enrolled */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Courses Enrolled
                </label>
                <input
                  type="number"
                  name="coursesEnrolled"
                  value={formData.coursesEnrolled ?? 0}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
                />
              </div>

              {/* Hours Learned */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hours Learned
                </label>
                <input
                  type="number"
                  name="totalHoursLearned"
                  value={formData.totalHoursLearned ?? 0}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
                />
              </div>
            </div>

            {/* Active Courses */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Active Courses
              </label>
              <div className="flex gap-2 mb-3">
                <select
                  value={selectedActiveCourse}
                  onChange={(e) => setSelectedActiveCourse(e.target.value)}
                  className="flex-1 min-w-0 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
                >
                  <option value="">Select a course to add...</option>
                  {availableCourses
                    .filter(course => !(formData.activeCourses || []).some(ac => ac.id === course.id))
                    .map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddActiveCourse}
                  disabled={!selectedActiveCourse}
                  className="flex-shrink-0 px-3 md:px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(formData.activeCourses || []).map((course) => (
                  <div key={course.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      {course.image && (
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-10 h-10 md:w-12 md:h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {course.category} • {course.level}
                          {course.price && course.price !== '0' && String(course.price).trim() !== '' && ` • ${course.price}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveActiveCourse(course.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                      title="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!formData.activeCourses || formData.activeCourses.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No active courses. Add courses from the dropdown above.
                  </p>
                )}
              </div>
            </div>

            {/* Completed Courses */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Completed Courses
              </label>
              <div className="flex gap-2 mb-3">
                <select
                  value={selectedCompletedCourse}
                  onChange={(e) => setSelectedCompletedCourse(e.target.value)}
                  className="flex-1 min-w-0 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
                >
                  <option value="">Select a course to add...</option>
                  {availableCourses
                    .filter(course => !(formData.completedCourses || []).some(cc => cc.id === course.id))
                    .map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddCompletedCourse}
                  disabled={!selectedCompletedCourse}
                  className="flex-shrink-0 px-3 md:px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(formData.completedCourses || []).map((course) => (
                  <div key={course.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      {course.image && (
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-10 h-10 md:w-12 md:h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {course.category} • {course.level}
                          {course.price && course.price !== '0' && String(course.price).trim() !== '' && ` • ${course.price}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompletedCourse(course.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                      title="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!formData.completedCourses || formData.completedCourses.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No completed courses. Add courses from the dropdown above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Custom Courses Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[#5A9B8E]" />
              <h3 className="text-lg font-semibold text-gray-900">Custom Courses</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add custom courses with title and image to showcase on the member profile. These are separate from the website's courses.
            </p>

            {/* Add/Edit Custom Course Form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={newCustomCourse.title}
                    onChange={(e) => setNewCustomCourse(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                    placeholder="e.g., Advanced Speech Therapy Techniques"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Image
                  </label>
                  {newCustomCourse.imagePreview ? (
                    <div className="relative">
                      <img
                        src={newCustomCourse.imagePreview}
                        alt="Course preview"
                        className="w-full h-48 object-cover object-top rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCustomCourse.imagePreview && newCustomCourse.imagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(newCustomCourse.imagePreview);
                          }
                          setNewCustomCourse(prev => ({ ...prev, imageFile: null, imagePreview: null }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleCustomCourseImageChange(e.target.files[0]);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  {editingCustomCourse !== null ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdateCustomCourse}
                        disabled={isUploadingCustomCourseImage}
                        className="flex-1 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingCustomCourseImage ? 'Uploading...' : 'Update Course'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditCustomCourse}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddCustomCourse}
                      disabled={isUploadingCustomCourseImage}
                      className="flex-1 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingCustomCourseImage ? 'Uploading...' : 'Add Course'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Display Custom Courses */}
            <div className="space-y-3">
              {(formData.customCourses || []).map((course, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  {course.image && (
                    <ImagePlaceholder
                      src={course.image}
                      alt={course.title}
                      name={course.title}
                      className="w-20 h-20 rounded-lg object-cover object-top flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{course.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditCustomCourse(index)}
                      className="px-3 py-1.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomCourse(index)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(!formData.customCourses || formData.customCourses.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                  No custom courses added yet. Add courses using the form above.
                </p>
              )}
            </div>
          </div>

          {/* Create Authentication Account Checkbox (only for new members) */}
          {!member && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
              <label className="flex items-start gap-2 md:gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAuthAccount}
                  onChange={(e) => setCreateAuthAccount(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#5A9B8E] border-gray-300 rounded focus:ring-[#5A9B8E] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-blue-900 text-xs md:text-sm">
                    Create Authentication Account
                  </div>
                  <div className="text-blue-700 text-xs mt-1 break-words">
                    Check this to create a login account for this member. They will receive an email to set their password and can then log in to the website.
                  </div>
                </div>
              </label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberEditForm;

