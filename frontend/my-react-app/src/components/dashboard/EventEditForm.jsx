import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Upload } from 'lucide-react';
import { eventsService } from '../../services/eventsService';

const EventEditForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    memberFee: 500,
    guestFee: 800,
    tracks: ['Track A: Speech & Swallowing', 'Track B: Language Disorders', 'Track C: Audiology'],
    scheduleDay1: [
      { time: '4:00 - 5:00 PM', trackA: 'Opening Ceremony & Welcome Address - Conference Chair', trackB: 'All Attendees', trackC: 'All Attendees' },
      { time: '5:00 - 7:00 PM', trackA: 'Session 1A: Advances in Aphasia Rehabilitation', trackB: 'Session 1B: Translating Research into Practice', trackC: 'Session 1C: Digital Tools in SLP Education' },
      { time: '7:00 - 7:30 PM', trackA: 'Break / Networking / Exhibits', trackB: 'Break / Networking / Exhibits', trackC: 'Break / Networking / Exhibits' },
      { time: '7:30 - 9:30 PM', trackA: 'Session 2A: Pediatric Speech Disorders', trackB: 'Session 2B: Motor Speech Disorders Symposium', trackC: 'Session 2C: Clinical Education Innovations' }
    ],
    scheduleDay2: [
      { time: '4:00 - 6:00 PM', trackA: 'Session 3A: Leadership in SLP Practice', trackB: 'Session 3B: Voice and Fluency Disorders', trackC: 'Session 3C: Advocacy & Ethical Practice' },
      { time: '6:00 - 6:30 PM', trackA: 'Break / Networking', trackB: 'Break / Networking', trackC: 'Break / Networking' },
      { time: '6:30 - 8:30 PM', trackA: 'Session 4A: Excellence in Clinical Documentation', trackB: 'Session 4B: Best Practices in Research Forum', trackC: 'Session 4C: The Future of Public Health in Telepractice' },
      { time: '8:30 PM', trackA: 'Closing Ceremony & Conference Summary', trackB: 'All Attendees', trackC: 'All Attendees' }
    ],
    heroImageUrl: '',
    day1Title: 'Day One - Knowledge and Innovation',
    day2Title: 'Day Two - Collaboration and Future Directions'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        subtitle: event.subtitle || '',
        memberFee: event.memberFee || 500,
        guestFee: event.guestFee || 800,
        tracks: event.tracks || ['Track A: Speech & Swallowing', 'Track B: Language Disorders', 'Track C: Audiology'],
        scheduleDay1: event.scheduleDay1 || [],
        scheduleDay2: event.scheduleDay2 || [],
        heroImageUrl: event.heroImageUrl || '',
        day1Title: event.day1Title || 'Day One - Knowledge and Innovation',
        day2Title: event.day2Title || 'Day Two - Collaboration and Future Directions'
      });
      // Set preview if image exists
      if (event.heroImageUrl) {
        setImagePreview(event.heroImageUrl);
      }
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'memberFee' || name === 'guestFee' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleTrackChange = (index, value) => {
    setFormData(prev => {
      const newTracks = [...prev.tracks];
      newTracks[index] = value;
      return { ...prev, tracks: newTracks };
    });
  };

  const addTrack = () => {
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, `Track ${String.fromCharCode(65 + prev.tracks.length)}: New Track`]
    }));
  };

  const removeTrack = (index) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index)
    }));
  };

  const handleScheduleChange = (day, index, field, value) => {
    setFormData(prev => {
      const scheduleKey = day === 1 ? 'scheduleDay1' : 'scheduleDay2';
      const newSchedule = [...prev[scheduleKey]];
      if (!newSchedule[index]) {
        newSchedule[index] = { time: '', trackA: '', trackB: '', trackC: '' };
      }
      newSchedule[index][field] = value;
      return { ...prev, [scheduleKey]: newSchedule };
    });
  };

  const addScheduleSlot = (day) => {
    setFormData(prev => {
      const scheduleKey = day === 1 ? 'scheduleDay1' : 'scheduleDay2';
      return {
        ...prev,
        [scheduleKey]: [...prev[scheduleKey], { time: '', trackA: '', trackB: '', trackC: '' }]
      };
    });
  };

  const removeScheduleSlot = (day, index) => {
    setFormData(prev => {
      const scheduleKey = day === 1 ? 'scheduleDay1' : 'scheduleDay2';
      return {
        ...prev,
        [scheduleKey]: prev[scheduleKey].filter((_, i) => i !== index)
      };
    });
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
      heroImageUrl: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalImageUrl = formData.heroImageUrl;

      // If a new file was uploaded, upload it to EventBucket
      if (imageFile) {
        const uploadResult = await eventsService.uploadImage(imageFile, imageFile.name);
        if (uploadResult.data && !uploadResult.error) {
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
        heroImageUrl: finalImageUrl
      };

      await onSave(dataToSave);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F]"
                placeholder="Conference Schedule"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle/Description *
              </label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F]"
                placeholder="Advancing Practice and Research in Speech-Language Pathology: Bridging Science and Clinical Impact"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Fee (EGP) *
                </label>
                <input
                  type="number"
                  name="memberFee"
                  value={formData.memberFee}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F]"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Fee (EGP) *
                </label>
                <input
                  type="number"
                  name="guestFee"
                  value={formData.guestFee}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F]"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Hero Image Upload - Drag and Drop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Image (optional)
              </label>
              
              {/* Drag and Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-[#4C9A8F] bg-[#4C9A8F]/5'
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
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop an image here, or click to select
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Supports: JPG, PNG, GIF, WebP
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="hero-image-upload"
                    />
                    <label
                      htmlFor="hero-image-upload"
                      className="inline-block px-4 py-2 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors cursor-pointer"
                    >
                      Select Image
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tracks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Conference Tracks</h3>
              <button
                type="button"
                onClick={addTrack}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors text-sm"
              >
                <Plus size={16} />
                Add Track
              </button>
            </div>

            {formData.tracks.map((track, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={track}
                  onChange={(e) => handleTrackChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F]"
                  placeholder={`Track ${String.fromCharCode(65 + index)}: ...`}
                />
                {formData.tracks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTrack(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Schedule Day 1 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Day 1 Schedule</h3>
                <input
                  type="text"
                  value={formData.day1Title}
                  onChange={(e) => setFormData(prev => ({ ...prev, day1Title: e.target.value }))}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F]"
                  placeholder="Day One - Knowledge and Innovation"
                />
              </div>
              <button
                type="button"
                onClick={() => addScheduleSlot(1)}
                className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors text-sm"
              >
                <Plus size={16} />
                Add Slot
              </button>
            </div>

            {formData.scheduleDay1.map((slot, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Slot {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeScheduleSlot(1, index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={slot.time}
                  onChange={(e) => handleScheduleChange(1, index, 'time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] text-sm"
                  placeholder="4:00 - 5:00 PM"
                />
                {formData.tracks.map((track, trackIndex) => {
                  const trackKey = `track${String.fromCharCode(65 + trackIndex)}`;
                  return (
                    <input
                      key={trackIndex}
                      type="text"
                      value={slot[trackKey] || ''}
                      onChange={(e) => handleScheduleChange(1, index, trackKey, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] text-sm"
                      placeholder={track}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Schedule Day 2 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Day 2 Schedule</h3>
                <input
                  type="text"
                  value={formData.day2Title}
                  onChange={(e) => setFormData(prev => ({ ...prev, day2Title: e.target.value }))}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F]"
                  placeholder="Day Two - Collaboration and Future Directions"
                />
              </div>
              <button
                type="button"
                onClick={() => addScheduleSlot(2)}
                className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors text-sm"
              >
                <Plus size={16} />
                Add Slot
              </button>
            </div>

            {formData.scheduleDay2.map((slot, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Slot {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeScheduleSlot(2, index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={slot.time}
                  onChange={(e) => handleScheduleChange(2, index, 'time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] text-sm"
                  placeholder="4:00 - 6:00 PM"
                />
                {formData.tracks.map((track, trackIndex) => {
                  const trackKey = `track${String.fromCharCode(65 + trackIndex)}`;
                  return (
                    <input
                      key={trackIndex}
                      type="text"
                      value={slot[trackKey] || ''}
                      onChange={(e) => handleScheduleChange(2, index, trackKey, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] text-sm"
                      placeholder={track}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isUploading ? 'Uploading...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventEditForm;

