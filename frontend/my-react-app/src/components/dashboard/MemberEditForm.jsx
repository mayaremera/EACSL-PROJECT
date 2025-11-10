import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';

const MemberEditForm = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Member',
    nationality: 'Egyptian',
    flagCode: 'eg',
    description: '',
    fullDescription: '',
    email: '',
    membershipDate: '',
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

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        certificates: member.certificates || []
      });
    }
  }, [member]);

  const nationalities = [
    { value: 'Egyptian', flag: 'eg' },
    { value: 'Saudi', flag: 'sa' },
    { value: 'Emirati', flag: 'ae' },
    { value: 'Kuwaiti', flag: 'kw' },
    { value: 'Jordanian', flag: 'jo' },
    { value: 'Lebanese', flag: 'lb' },
    { value: 'Palestinian', flag: 'ps' },
    { value: 'American', flag: 'us' },
    { value: 'Japanese', flag: 'jp' },
    { value: 'Brazilian', flag: 'br' }
  ];

  const roles = ['Board Member', 'Vice President', 'Secretary General', 'Treasurer', 'Research Director', 'Member'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-update flag code when nationality changes
    if (name === 'nationality') {
      const selected = nationalities.find(n => n.value === value);
      if (selected) {
        setFormData(prev => ({ ...prev, flagCode: selected.flag }));
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
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

            {/* Nationality */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nationality *
              </label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
              >
                {nationalities.map(nat => (
                  <option key={nat.value} value={nat.value}>{nat.value}</option>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
              />
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

            {/* Membership Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Membership Date *
              </label>
              <input
                type="text"
                name="membershipDate"
                value={formData.membershipDate}
                onChange={handleChange}
                placeholder="e.g., January 2020"
                required
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

            {/* Is Active */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#4C9A8F] border-gray-300 rounded focus:ring-[#4C9A8F]"
                />
                <span className="text-sm font-semibold text-gray-700">Active Member</span>
              </label>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Member Image URL *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
              />
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

