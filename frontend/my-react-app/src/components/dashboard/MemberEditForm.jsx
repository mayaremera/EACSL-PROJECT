import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Upload, Check, AlertCircle } from 'lucide-react';
import { membersManager } from '../../utils/dataManager';

const MemberEditForm = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Member',
    description: '',
    fullDescription: '',
    email: '',
    isActive: true,
    activeTill: '',
    certificates: [],
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    image: ''
  });
  const [certificateInput, setCertificateInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [emailExistsError, setEmailExistsError] = useState(null); // null, 'member', or 'pending'
  const [createAuthAccount, setCreateAuthAccount] = useState(false); // Checkbox for creating auth account

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
      
      setFormData({
        name: member.name || '',
        role: member.role || 'Member',
        description: member.description || '',
        fullDescription: member.fullDescription || '',
        email: member.email || '',
        isActive: memberIsActive, // Use the preserved value
        activeTill: member.activeTill || '',
        certificates: member.certificates || [],
        phone: member.phone || '',
        location: member.location || '',
        website: member.website || '',
        linkedin: member.linkedin || '',
        image: member.image || ''
      });
      setEmailExistsError(null); // Reset error when editing existing member
    } else {
      // Reset to defaults when adding new member
      setFormData({
        name: '',
        role: 'Member',
        description: '',
        fullDescription: '',
        email: '',
        isActive: true,
        activeTill: '',
        certificates: [],
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        image: ''
      });
      setEmailExistsError(null); // Reset error when adding new member
    }
  }, [member]);

  const roles = ['Board Member', 'Vice President', 'Secretary General', 'Treasurer', 'Research Director', 'Member'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Reset email error when email changes
    if (name === 'email') {
      setEmailExistsError(null);
    }
  };

  const handleAddCertificate = () => {
    if (certificateInput.trim()) {
      setFormData(prev => ({
        ...prev,
        certificates: [...prev.certificates, certificateInput.trim()]
      }));
      setCertificateInput('');
    }
  };

  const handleRemoveCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
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

  const removeFile = (field, e) => {
    e.stopPropagation();
    // Clean up object URL if it exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
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
    setEmailExistsError(null); // Reset error state
    
    try {
      // Check if email already exists (only when adding new member, not editing)
      if (!member) {
        console.log('Checking if email exists before adding member...');
        
        // Check in existing members
        const existingMembers = membersManager.getAll();
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

      // Convert File object to data URL
      const imageDataUrl = formData.image instanceof File
        ? await fileToDataURL(formData.image)
        : (formData.image || '');

      // Ensure all fields are properly saved, especially isActive as boolean
      const dataToSave = {
        name: formData.name || '',
        role: formData.role || 'Member',
        description: formData.description || '',
        fullDescription: formData.fullDescription || '',
        email: formData.email || '',
        isActive: Boolean(formData.isActive), // Always convert to boolean
        activeTill: formData.activeTill || '',
        certificates: formData.certificates || [],
        phone: formData.phone || '',
        location: formData.location || '',
        website: formData.website || '',
        linkedin: formData.linkedin || '',
        image: imageDataUrl,
        createAuthAccount: !member && createAuthAccount // Only for new members
      };
      await onSave(dataToSave);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {member ? 'Edit Member' : 'Add New Member'}
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
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none ${
                  emailExistsError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {emailExistsError && (
                <div className={`mt-3 p-4 rounded-lg border flex gap-3 ${
                  emailExistsError === 'member' 
                    ? 'bg-amber-50 border-amber-500' 
                    : 'bg-blue-50 border-blue-500'
                }`}>
                  <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    emailExistsError === 'member' ? 'text-amber-600' : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      emailExistsError === 'member' ? 'text-amber-800' : 'text-blue-800'
                    }`}>
                      {emailExistsError === 'member' 
                        ? 'Email Already Exists' 
                        : 'Pending Application Exists'}
                    </p>
                    <p className={`text-sm mt-1 ${
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
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
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
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
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
                value={formData.activeTill}
                onChange={handleChange}
                placeholder="e.g., 2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Active Status *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, isActive: true }));
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
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
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
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
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${
                  dragActive['image'] 
                    ? 'border-[#4C9A8F] bg-[#4C9A8F]/10 scale-[1.02]' 
                    : 'border-gray-300 hover:border-[#4C9A8F] bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  document.getElementById('member-image').click();
                }}
              >
                {(formData.image instanceof File || (typeof formData.image === 'string' && formData.image)) ? (
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      {formData.image instanceof File ? (
                        <>
                          <img 
                            src={imagePreview || URL.createObjectURL(formData.image)} 
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
                      dragActive['image'] ? 'bg-[#4C9A8F]/20' : 'bg-gray-200'
                    }`}>
                      <Upload className={`w-8 h-8 ${dragActive['image'] ? 'text-[#4C9A8F]' : 'text-gray-500'}`} />
                    </div>
                    <p className={`text-sm mb-1 font-medium ${dragActive['image'] ? 'text-[#4C9A8F]' : 'text-gray-700'}`}>
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
                    <div className="inline-block px-6 py-2 bg-[#4C9A8F] text-white text-sm rounded-lg hover:bg-[#3d8178] transition-colors font-medium">
                      Browse Files
                    </div>
                    <p className="text-gray-400 text-xs mt-4">Accepts: Images only (JPG, PNG, GIF, etc.)</p>
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
                value={formData.website}
                onChange={handleChange}
                placeholder="www.example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
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
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="linkedin.com/in/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
              />
            </div>

            {/* Full Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description *
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
              />
            </div>

            {/* Certificates */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Certificates & Qualifications
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={certificateInput}
                  onChange={(e) => setCertificateInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertificate())}
                  placeholder="Add a certificate..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCertificate}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.certificates.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700">{cert}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Create Authentication Account Checkbox (only for new members) */}
          {!member && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAuthAccount}
                  onChange={(e) => setCreateAuthAccount(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#4C9A8F] border-gray-300 rounded focus:ring-[#4C9A8F]"
                />
                <div className="flex-1">
                  <div className="font-semibold text-blue-900 text-sm">
                    Create Authentication Account
                  </div>
                  <div className="text-blue-700 text-xs mt-1">
                    Check this to create a login account for this member. They will receive an email to set their password and can then log in to the website.
                  </div>
                </div>
              </label>
            </div>
          )}

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
              className="px-6 py-2 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors flex items-center gap-2 disabled:opacity-50"
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

