import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Upload, Mic, GraduationCap, Briefcase, FileText } from 'lucide-react';
import { eventsService } from '../../services/eventsService';
import { eventParticipantsService } from '../../services/eventParticipantsService';
import ImagePlaceholder from '../ui/ImagePlaceholder';

const EventEditForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroDescription: '',
    title: '',
    subtitle: '',
    headerInfo1: 'Two Days Conference',
    headerInfo2: 'All Attendees Welcome',
    overviewDescription: '',
    durationText: 'Two Full Days',
    tracksDescription: '3 Parallel Sessions',
    memberFee: 500,
    guestFee: 800,
    studentFee: 300,
    bookletUrl: '',
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
    day2Title: 'Day Two - Collaboration and Future Directions',
    eventDate: '',
    heroCardSpeakers: [] // Array of objects with {id, role} to display on hero card
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [bookletFile, setBookletFile] = useState(null);
  const [bookletPreview, setBookletPreview] = useState(null);
  const [bookletDragActive, setBookletDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Participants state
  const [participants, setParticipants] = useState({
    speakers: [],
    scientific_committee: [],
    organizing_committee: []
  });
  const [newParticipant, setNewParticipant] = useState({
    role: 'speaker',
    name: '',
    bio: '',
    linkedinUrl: '',
    imageFile: null,
    imagePreview: null
  });
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [isUploadingParticipantImage, setIsUploadingParticipantImage] = useState(false);

  useEffect(() => {
    if (event) {
      // Format eventDate for date input (YYYY-MM-DD format)
      let formattedDate = '';
      if (event.eventDate) {
        try {
          const date = new Date(event.eventDate);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error formatting event date:', e);
        }
      }

      setFormData({
        heroTitle: event.heroTitle || '',
        heroDescription: event.heroDescription || '',
        title: event.title || '',
        subtitle: event.subtitle || '',
        headerInfo1: event.headerInfo1 || 'Two Days Conference',
        headerInfo2: event.headerInfo2 || 'All Attendees Welcome',
        overviewDescription: event.overviewDescription || '',
        durationText: event.durationText || 'Two Full Days',
        tracksDescription: event.tracksDescription || '3 Parallel Sessions',
        memberFee: event.memberFee || 500,
        guestFee: event.guestFee || 800,
        studentFee: event.studentFee || 300,
        bookletUrl: event.bookletUrl || '',
        tracks: event.tracks || ['Track A: Speech & Swallowing', 'Track B: Language Disorders', 'Track C: Audiology'],
        scheduleDay1: event.scheduleDay1 || [],
        scheduleDay2: event.scheduleDay2 || [],
        heroImageUrl: event.heroImageUrl || '',
        day1Title: event.day1Title || 'Day One - Knowledge and Innovation',
        day2Title: event.day2Title || 'Day Two - Collaboration and Future Directions',
        eventDate: formattedDate,
        heroCardSpeakers: event.heroCardSpeakers || (event.hero_card_speakers ? 
          (Array.isArray(event.hero_card_speakers) && event.hero_card_speakers.length > 0 && typeof event.hero_card_speakers[0] === 'object' 
            ? event.hero_card_speakers 
            : event.hero_card_speakers.map(id => ({ id, role: '' }))
          ) : []
        )
      });
      // Set preview if image exists
      if (event.heroImageUrl) {
        setImagePreview(event.heroImageUrl);
      }
      
      // Set booklet preview if exists
      if (event.bookletUrl) {
        setBookletPreview(event.bookletUrl);
      }
      
      // Load participants for this event
      if (event && event.id) {
        loadParticipants(event.id);
      }
    }

    // Cleanup function to revoke blob URLs on unmount
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      if (bookletPreview && bookletPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bookletPreview);
      }
      if (newParticipant.imagePreview && newParticipant.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(newParticipant.imagePreview);
      }
    };
  }, [event, imagePreview, bookletPreview, newParticipant.imagePreview]);

  const loadParticipants = async (eventId) => {
    try {
      const result = await eventParticipantsService.getByEventId(eventId);
      if (result.data && !result.error) {
        setParticipants(result.data);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'memberFee' || name === 'guestFee' || name === 'studentFee'
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

  const handleBookletFileChange = (file) => {
    if (file) {
      const isValidPDF = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      
      if (isValidPDF) {
        // Clean up old preview URL if it exists
        if (bookletPreview && bookletPreview.startsWith('blob:')) {
          URL.revokeObjectURL(bookletPreview);
        }
        
        // Create preview URL for the uploaded file
        const previewUrl = URL.createObjectURL(file);
        setBookletPreview(previewUrl);
        setBookletFile(file);
      } else {
        alert('Please upload only PDF files.');
      }
    }
  };

  const handleBookletDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setBookletDragActive(true);
    } else if (e.type === "dragleave") {
      setBookletDragActive(false);
    }
  };

  const handleBookletDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookletDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleBookletFileChange(file);
    }
  };

  const handleBookletFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleBookletFileChange(e.target.files[0]);
    }
  };

  const removeBooklet = () => {
    // Clean up preview URL
    if (bookletPreview && bookletPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bookletPreview);
    }
    setBookletPreview(null);
    setBookletFile(null);
    setFormData(prev => ({
      ...prev,
      bookletUrl: ''
    }));
  };

  const handleParticipantImageChange = (file) => {
    if (file) {
      const isValidImage = file.type.startsWith('image/') || 
                          /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
      
      if (isValidImage) {
        if (newParticipant.imagePreview && newParticipant.imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(newParticipant.imagePreview);
        }
        
        const previewUrl = URL.createObjectURL(file);
        setNewParticipant(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: previewUrl
        }));
      } else {
        alert('Please upload only image files (JPG, PNG, GIF, etc.)');
      }
    }
  };

  const handleAddParticipant = async () => {
    if (!newParticipant.name.trim()) {
      alert('Please enter a name for the participant.');
      return;
    }

    if (!event || !event.id) {
      alert('Please save the event first before adding participants.');
      return;
    }

    setIsUploadingParticipantImage(true);

    try {
      let imageUrl = null;
      let imagePath = null;

      // Upload image if provided
      if (newParticipant.imageFile) {
        const uploadResult = await eventParticipantsService.uploadImage(
          newParticipant.imageFile,
          newParticipant.imageFile.name
        );
        if (uploadResult.data && !uploadResult.error) {
          imageUrl = uploadResult.data.url;
          imagePath = uploadResult.data.path;
        } else {
          alert('Failed to upload image. Please try again.');
          setIsUploadingParticipantImage(false);
          return;
        }
      }

      // Clean up preview URL if it was a blob
      if (newParticipant.imagePreview && newParticipant.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(newParticipant.imagePreview);
      }

      // Add participant
      const participantData = {
        eventId: event.id,
        name: newParticipant.name.trim(),
        bio: newParticipant.bio.trim() || null,
        linkedinUrl: newParticipant.linkedinUrl.trim() || null,
        role: newParticipant.role,
        imageUrl: imageUrl,
        imagePath: imagePath
      };

      const result = await eventParticipantsService.add(participantData);
      
      if (result.data && !result.error) {
        // Reload participants
        await loadParticipants(event.id);
        
        // Reset form but keep the same role and keep form open
        setNewParticipant({
          role: newParticipant.role, // Keep the same role
          name: '',
          bio: '',
          linkedinUrl: '',
          imageFile: null,
          imagePreview: null
        });
        
        // Keep the form open for adding another participant
        // No alert - just continue smoothly
      } else {
        alert('Failed to add participant. Please try again.');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('Failed to add participant. Please try again.');
    } finally {
      setIsUploadingParticipantImage(false);
    }
  };

  const handleEditParticipant = (participant) => {
    setEditingParticipant(participant);
    setNewParticipant({
      role: participant.role,
      name: participant.name || '',
      bio: participant.bio || '',
      linkedinUrl: participant.linkedinUrl || '',
      imageFile: null,
      imagePreview: participant.imageUrl || null
    });
    setIsAddingParticipant(true);
  };

  const handleUpdateParticipant = async () => {
    if (!newParticipant.name.trim()) {
      alert('Please enter a name for the participant.');
      return;
    }

    if (!editingParticipant) {
      return;
    }

    setIsUploadingParticipantImage(true);

    try {
      let imageUrl = editingParticipant.imageUrl;
      let imagePath = editingParticipant.imagePath;

      // Upload new image if provided
      if (newParticipant.imageFile) {
        // Delete old image if exists
        if (editingParticipant.imagePath) {
          await eventParticipantsService.deleteImage(editingParticipant.imagePath);
        }

        const uploadResult = await eventParticipantsService.uploadImage(
          newParticipant.imageFile,
          newParticipant.imageFile.name
        );
        if (uploadResult.data && !uploadResult.error) {
          imageUrl = uploadResult.data.url;
          imagePath = uploadResult.data.path;
        } else {
          alert('Failed to upload image. Please try again.');
          setIsUploadingParticipantImage(false);
          return;
        }
      }

      // Clean up preview URL if it was a blob
      if (newParticipant.imagePreview && newParticipant.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(newParticipant.imagePreview);
      }

      // Update participant
      const participantData = {
        name: newParticipant.name.trim(),
        bio: newParticipant.bio.trim() || null,
        linkedinUrl: newParticipant.linkedinUrl.trim() || null,
        role: newParticipant.role,
        imageUrl: imageUrl,
        imagePath: imagePath
      };

      const result = await eventParticipantsService.update(editingParticipant.id, participantData);
      
      if (result.data && !result.error) {
        // Reload participants
        await loadParticipants(event.id);
        
        // Reset form
        setEditingParticipant(null);
        setNewParticipant({
          role: 'speaker',
          name: '',
          bio: '',
          linkedinUrl: '',
          imageFile: null,
          imagePreview: null
        });
        setIsAddingParticipant(false);
      } else {
        alert('Failed to update participant. Please try again.');
      }
    } catch (error) {
      console.error('Error updating participant:', error);
      alert('Failed to update participant. Please try again.');
    } finally {
      setIsUploadingParticipantImage(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingParticipant(null);
    setNewParticipant({
      role: 'speaker',
      name: '',
      bio: '',
      linkedinUrl: '',
      imageFile: null,
      imagePreview: null
    });
    setIsAddingParticipant(false);
  };

  const handleDeleteParticipant = async (participantId, imagePath) => {
    if (!window.confirm('Are you sure you want to delete this participant?')) {
      return;
    }

    try {
      // Delete image if exists
      if (imagePath) {
        await eventParticipantsService.deleteImage(imagePath);
      }

      // Delete participant
      const result = await eventParticipantsService.delete(participantId);
      
      if (!result.error) {
        // Reload participants
        await loadParticipants(event.id);
      } else {
        alert('Failed to delete participant. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('Failed to delete participant. Please try again.');
    }
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

      // Upload booklet PDF if a new file was uploaded
      let finalBookletUrl = formData.bookletUrl;
      if (bookletFile) {
        const uploadResult = await eventsService.uploadImage(bookletFile, bookletFile.name);
        if (uploadResult.data && !uploadResult.error) {
          finalBookletUrl = uploadResult.data.url;
        } else {
          alert('Failed to upload booklet PDF. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      // Clean up preview URLs if they were blobs
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      if (bookletPreview && bookletPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bookletPreview);
      }

      // Prepare data to save
      const dataToSave = {
        ...formData,
        heroImageUrl: finalImageUrl,
        bookletUrl: finalBookletUrl
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
          {/* Hero Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Hero Section</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Title *
              </label>
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                placeholder="Advancing Speech-Language Pathology 2025"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Description *
              </label>
              <textarea
                name="heroDescription"
                value={formData.heroDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                placeholder="Join leading experts for a two-day conference focused on advancing clinical practice, enhancing research impact, and exploring innovation across speech, swallowing, language disorders, and audiology."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
              />
              <p className="mt-1 text-xs text-gray-500">
                This date will be displayed in the hero section badge instead of "TBA" and "2025"
              </p>
            </div>
          </div>

          {/* Event Card Hero Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Event Card Hero Section</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date (for Card)
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
              />
              <p className="mt-1 text-xs text-gray-500">
                The event date displayed on the hero card badge
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Speakers (for Hero Card)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select up to 4 speakers and assign a role for each. The role will be displayed on the hero card instead of bio.
              </p>
              {participants.speakers && participants.speakers.length > 0 ? (
                <div className="space-y-3">
                  {/* Speaker Selection */}
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {participants.speakers.map((speaker) => {
                      const isSelected = formData.heroCardSpeakers.some(s => s.id === speaker.id);
                      return (
                        <label
                          key={speaker.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Limit to 4 speakers
                                if (formData.heroCardSpeakers.length < 4) {
                                  setFormData({
                                    ...formData,
                                    heroCardSpeakers: [...formData.heroCardSpeakers, { id: speaker.id, role: '' }]
                                  });
                                } else {
                                  alert('You can only select up to 4 speakers for the hero card.');
                                }
                              } else {
                                setFormData({
                                  ...formData,
                                  heroCardSpeakers: formData.heroCardSpeakers.filter(s => s.id !== speaker.id)
                                });
                              }
                            }}
                            className="w-4 h-4 text-[#5A9B8E] border-gray-300 rounded focus:ring-[#5A9B8E]"
                          />
                          <ImagePlaceholder
                            src={speaker.imageUrl}
                            alt={speaker.name}
                            name={speaker.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{speaker.name}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Selected Speakers with Role Input */}
                  {formData.heroCardSpeakers.length > 0 && (
                    <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="text-xs font-medium text-gray-700 mb-2">Assign roles for selected speakers:</p>
                      {formData.heroCardSpeakers.map((selectedSpeaker, index) => {
                        const speaker = participants.speakers.find(s => s.id === selectedSpeaker.id);
                        return (
                          <div key={selectedSpeaker.id} className="flex items-center gap-3">
                            <ImagePlaceholder
                              src={speaker?.imageUrl}
                              alt={speaker?.name}
                              name={speaker?.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 mb-1">{speaker?.name}</p>
                              <input
                                type="text"
                                placeholder="e.g., Keynote Speaker, Program Director"
                                value={selectedSpeaker.role || ''}
                                onChange={(e) => {
                                  const updated = [...formData.heroCardSpeakers];
                                  updated[index].role = e.target.value;
                                  setFormData({
                                    ...formData,
                                    heroCardSpeakers: updated
                                  });
                                }}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">
                  No speakers added yet. Add speakers in the "Event Participants" section first.
                </div>
              )}
              <div className="mt-2 flex items-center justify-between">
                {formData.heroCardSpeakers.length > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    {formData.heroCardSpeakers.length} speaker{formData.heroCardSpeakers.length !== 1 ? 's' : ''} selected
                  </p>
                )}
                {formData.heroCardSpeakers.length === 4 && (
                  <p className="text-xs text-amber-600 font-medium">
                    Maximum reached (4/4)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Header Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Header Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                placeholder="Advancing Practice and Research in Speech-Language Pathology: Bridging Science and Clinical Impact"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Header Info 1 (e.g., "Two Days Conference")
                </label>
                <input
                  type="text"
                  name="headerInfo1"
                  value={formData.headerInfo1}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                  placeholder="Two Days Conference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Header Info 2 (e.g., "All Attendees Welcome")
                </label>
                <input
                  type="text"
                  name="headerInfo2"
                  value={formData.headerInfo2}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                  placeholder="All Attendees Welcome"
                />
              </div>
            </div>
          </div>

          {/* Event Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Event Overview</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overview Description (optional)
              </label>
              <textarea
                name="overviewDescription"
                value={formData.overviewDescription}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                placeholder="Brief description about the event overview"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration Text
                </label>
                <input
                  type="text"
                  name="durationText"
                  value={formData.durationText}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                  placeholder="Two Full Days"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracks Description
                </label>
                <input
                  type="text"
                  name="tracksDescription"
                  value={formData.tracksDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                  placeholder="3 Parallel Sessions"
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Fee (EGP) *
                </label>
                <input
                  type="number"
                  name="memberFee"
                  value={formData.memberFee}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Fee (EGP) *
                </label>
                <input
                  type="number"
                  name="studentFee"
                  value={formData.studentFee}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Event Booklet PDF Upload - Drag and Drop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Booklet PDF (optional)
              </label>
              
              {/* Drag and Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  bookletDragActive
                    ? 'border-[#5A9B8E] bg-[#5A9B8E]/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleBookletDrag}
                onDragLeave={handleBookletDrag}
                onDragOver={handleBookletDrag}
                onDrop={handleBookletDrop}
              >
                {bookletPreview ? (
                  <div className="relative">
                    <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="w-8 h-8 text-[#5A9B8E] flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {bookletFile ? bookletFile.name : 'Booklet PDF'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {bookletFile ? `${(bookletFile.size / 1024).toFixed(2)} KB` : 'PDF file uploaded'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeBooklet}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop a PDF here, or click to select
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Supports: PDF files only
                    </p>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleBookletFileInput}
                      className="hidden"
                      id="booklet-pdf-upload"
                    />
                    <label
                      htmlFor="booklet-pdf-upload"
                      className="inline-block px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors cursor-pointer"
                    >
                      Select PDF
                    </label>
                  </>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Upload the event booklet PDF file. This will appear as a "Download Booklet" button on the event page.
              </p>
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
                      className="inline-block px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors cursor-pointer"
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
                className="flex items-center gap-2 px-3 py-1.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
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
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                  placeholder="Day One - Knowledge and Innovation"
                />
              </div>
              <button
                type="button"
                onClick={() => addScheduleSlot(1)}
                className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E] text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E] text-sm"
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
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                  placeholder="Day Two - Collaboration and Future Directions"
                />
              </div>
              <button
                type="button"
                onClick={() => addScheduleSlot(2)}
                className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E] text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E] text-sm"
                      placeholder={track}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Participants Management */}
          {event && event.id && (
            <div className="space-y-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Event Participants</h3>
                {!isAddingParticipant && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingParticipant(null);
                      setNewParticipant({
                        role: 'speaker',
                        name: '',
                        bio: '',
                        linkedinUrl: '',
                        imageFile: null,
                        imagePreview: null
                      });
                      setIsAddingParticipant(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Add Participant
                  </button>
                )}
              </div>

              {/* Add/Edit Participant Form */}
              {isAddingParticipant && (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
                    </h4>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={newParticipant.role}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                    >
                      <option value="speaker">Speaker</option>
                      <option value="scientific_committee">Scientific Committee</option>
                      <option value="organizing_committee">Organizing Committee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                      placeholder="Participant Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio/Description
                    </label>
                    <textarea
                      value={newParticipant.bio}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                      placeholder="Participant biography or description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={newParticipant.linkedinUrl}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>
                    {newParticipant.imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={newParticipant.imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newParticipant.imagePreview && newParticipant.imagePreview.startsWith('blob:')) {
                              URL.revokeObjectURL(newParticipant.imagePreview);
                            }
                            setNewParticipant(prev => ({ ...prev, imageFile: null, imagePreview: null }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleParticipantImageChange(e.target.files[0]);
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E]"
                      />
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={editingParticipant ? handleUpdateParticipant : handleAddParticipant}
                      disabled={isUploadingParticipantImage}
                      className="flex-1 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingParticipantImage ? 'Saving...' : (editingParticipant ? 'Update Participant' : 'Add Participant')}
                    </button>
                    {!editingParticipant && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewParticipant({
                            role: newParticipant.role,
                            name: '',
                            bio: '',
                            linkedinUrl: '',
                            imageFile: null,
                            imagePreview: null
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Display Existing Participants */}
              <div className="space-y-6">
                {/* Speakers */}
                {participants.speakers && participants.speakers.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Mic className="w-5 h-5 text-[#5A9B8E]" />
                      <h4 className="font-semibold text-gray-900">Speakers ({participants.speakers.length})</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {participants.speakers.map((speaker) => (
                        <div key={speaker.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-3 mb-2">
                            <ImagePlaceholder
                              src={speaker.imageUrl}
                              alt={speaker.name}
                              name={speaker.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{speaker.name}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => handleEditParticipant(speaker)}
                              className="flex-1 px-3 py-1.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParticipant(speaker.id, speaker.imagePath)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scientific Committee */}
                {participants.scientific_committee && participants.scientific_committee.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="w-5 h-5 text-[#5A9B8E]" />
                      <h4 className="font-semibold text-gray-900">Scientific Committee ({participants.scientific_committee.length})</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {participants.scientific_committee.map((member) => (
                        <div key={member.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-3 mb-2">
                            <ImagePlaceholder
                              src={member.imageUrl}
                              alt={member.name}
                              name={member.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => handleEditParticipant(member)}
                              className="flex-1 px-3 py-1.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParticipant(member.id, member.imagePath)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organizing Committee */}
                {participants.organizing_committee && participants.organizing_committee.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-[#5A9B8E]" />
                      <h4 className="font-semibold text-gray-900">Organizing Committee ({participants.organizing_committee.length})</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {participants.organizing_committee.map((member) => (
                        <div key={member.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-3 mb-2">
                            <ImagePlaceholder
                              src={member.imageUrl}
                              alt={member.name}
                              name={member.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => handleEditParticipant(member)}
                              className="flex-1 px-3 py-1.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteParticipant(member.id, member.imagePath)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
              className="px-6 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

