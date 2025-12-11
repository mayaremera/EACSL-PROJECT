import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, DollarSign, CheckCircle, User, Mail, Phone, Building2, Mic, GraduationCap, Briefcase, FileText } from 'lucide-react';
import { eventsManager } from '../utils/dataManager';
import { eventRegistrationsService } from '../services/eventRegistrationsService';
import { eventParticipantsService } from '../services/eventParticipantsService';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ParticipantModal from '../components/events/ParticipantModal';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import { useAuth } from '../contexts/AuthContext';

const UpcomingEventsPage = () => {
  const { user } = useAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    membershipType: 'member',
    selectedTracks: [],
    specialRequirements: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [hasNoEvents, setHasNoEvents] = useState(false);
  const [participants, setParticipants] = useState({
    speakers: [],
    scientific_committee: [],
    organizing_committee: []
  });
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState({
    months: 3,
    days: 6,
    hours: 21,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const loadEvent = async () => {
      // First, load from cache for immediate display
      let event = null;
      
      // If eventId is provided, get that specific event
      if (eventId) {
        event = eventsManager.getByIdSync(parseInt(eventId));
        // If event is found but it's a past event, redirect to past events
        if (event && event.status === 'past') {
          navigate(`/past-events`, { replace: true });
          return;
        }
      }
      
      // If no eventId or event not found, get the first upcoming event
      if (!event) {
        const upcomingEvents = eventsManager.getUpcomingSync();
        if (upcomingEvents && upcomingEvents.length > 0) {
          event = upcomingEvents[0];
          // Update URL if we're showing a different event than requested
          if (eventId && event.id !== parseInt(eventId)) {
            navigate(`/upcoming-events/${event.id}`, { replace: true });
          } else if (!eventId) {
            navigate(`/upcoming-events/${event.id}`, { replace: true });
          }
          setHasNoEvents(false);
        } else {
          // No upcoming events available
          setHasNoEvents(true);
          setEventData(null);
          return;
        }
      } else {
        setHasNoEvents(false);
      }
      
      setEventData(event);
      
      // Load participants for this event
      if (event && event.id) {
        try {
          const participantsResult = await eventParticipantsService.getByEventId(event.id);
          if (participantsResult.data && !participantsResult.error) {
            setParticipants(participantsResult.data);
          }
        } catch (error) {
          console.error('Error loading participants:', error);
        }
      }
      
      // Refresh from Supabase in the background
      try {
        if (eventId) {
          const freshEvent = await eventsManager.getById(parseInt(eventId));
          if (freshEvent) {
            setEventData(freshEvent);
            if (freshEvent.status === 'past') {
              navigate(`/past-events`, { replace: true });
              return;
            }
            // Reload participants for fresh event
            try {
              const participantsResult = await eventParticipantsService.getByEventId(freshEvent.id);
              if (participantsResult.data && !participantsResult.error) {
                setParticipants(participantsResult.data);
              }
            } catch (error) {
              console.error('Error loading participants:', error);
            }
          }
        } else {
          const upcomingEvents = await eventsManager.getUpcoming();
          if (upcomingEvents && upcomingEvents.length > 0) {
            const firstEvent = upcomingEvents[0];
            setEventData(firstEvent);
            navigate(`/upcoming-events/${firstEvent.id}`, { replace: true });
            // Load participants for first event
            try {
              const participantsResult = await eventParticipantsService.getByEventId(firstEvent.id);
              if (participantsResult.data && !participantsResult.error) {
                setParticipants(participantsResult.data);
              }
            } catch (error) {
              console.error('Error loading participants:', error);
            }
          } else {
            setHasNoEvents(true);
            setEventData(null);
          }
        }
      } catch (error) {
        console.error('Error refreshing event from Supabase:', error);
      }
    };

    loadEvent();

    // Listen for event updates
    const handleEventsUpdate = async () => {
      try {
        if (eventId) {
          const freshEvent = await eventsManager.getById(parseInt(eventId));
          if (freshEvent) {
            setEventData(freshEvent);
            if (freshEvent.status === 'past') {
              navigate(`/past-events`, { replace: true });
            }
          }
        } else {
          const upcomingEvents = await eventsManager.getUpcoming();
          if (upcomingEvents && upcomingEvents.length > 0) {
            const firstEvent = upcomingEvents[0];
            setEventData(firstEvent);
            navigate(`/upcoming-events/${firstEvent.id}`, { replace: true });
          } else {
            setHasNoEvents(true);
            setEventData(null);
          }
        }
      } catch (error) {
        console.error('Error refreshing event from Supabase:', error);
      }
    };

    window.addEventListener('eventsUpdated', handleEventsUpdate);
    return () => {
      window.removeEventListener('eventsUpdated', handleEventsUpdate);
    };
  }, [eventId, navigate]);

  // Countdown timer effect
  useEffect(() => {
    // Calculate target date: 3 months, 6 days, and 21 hours from now
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setMonth(targetDate.getMonth() + 3);
    targetDate.setDate(targetDate.getDate() + 6);
    targetDate.setHours(targetDate.getHours() + 21);

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        setCountdown({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // Calculate months by comparing dates
      let months = 0;
      let days = 0;
      let tempDate = new Date(now);
      
      // Calculate months
      while (tempDate.getMonth() !== targetDate.getMonth() || tempDate.getFullYear() !== targetDate.getFullYear()) {
        tempDate.setMonth(tempDate.getMonth() + 1);
        if (tempDate <= targetDate) {
          months++;
        } else {
          tempDate.setMonth(tempDate.getMonth() - 1);
          break;
        }
      }
      
      // Calculate remaining days, hours, minutes, seconds
      const remaining = targetDate - tempDate;
      days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setCountdown({ months, days, hours, minutes, seconds });
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(value.trim())) {
          error = 'Please enter a valid phone number';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData({
          ...formData,
          selectedTracks: [...formData.selectedTracks, value]
        });
      } else {
        setFormData({
          ...formData,
          selectedTracks: formData.selectedTracks.filter(track => track !== value)
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Validate on blur for better UX
      if (e.type === 'blur') {
        const error = validateField(name, value);
        if (error) {
          setErrors(prev => ({ ...prev, [name]: error }));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    const newErrors = {};
    
    const nameError = validateField('fullName', formData.fullName);
    if (nameError) newErrors.fullName = nameError;
    
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validateField('phone', formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error field
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    
    try {
      // Prevent duplicate submissions
      if (isSubmitting) {
        return;
      }
      setIsSubmitting(true);
      
      // Prepare data in local format (service will map to Supabase format)
      const registrationData = {
        eventId: eventData.id && typeof eventData.id === 'number' ? eventData.id : null,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        organization: formData.organization?.trim() || null,
        membershipType: formData.membershipType,
        selectedTracks: formData.selectedTracks || [],
        specialRequirements: formData.specialRequirements?.trim() || null,
        registrationFee: currentFee,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      console.log('💾 Saving event registration to Supabase...');

      // Save to Supabase FIRST (source of truth) using service
      const result = await eventRegistrationsService.add(registrationData);

      if (result.error) {
        // Handle specific errors
        if (result.error.code === 'TABLE_NOT_FOUND') {
          alert(
            '❌ Database Table Not Found\n\n' +
            'The event_registrations table does not exist in Supabase.\n\n' +
            'To fix this:\n' +
            '1. Go to Supabase Dashboard → SQL Editor\n' +
            '2. Run the SQL script from CREATE_EVENT_REGISTRATIONS_TABLE.sql\n' +
            '3. Try submitting again\n\n' +
            'See EVENT_REGISTRATIONS_SUPABASE_SETUP.md for detailed instructions.'
          );
          return;
        }
        
        if (result.error.code === 'RLS_POLICY_ERROR') {
          alert(
            '❌ Permission Denied\n\n' +
            result.error.message + '\n\n' +
            'Falling back to localStorage for now.'
          );
          // Fallback to localStorage if RLS policy error
          const formSubmission = {
            id: Date.now().toString(),
            type: 'eventRegistration',
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            organization: formData.organization,
            membershipType: formData.membershipType,
            selectedTracks: formData.selectedTracks,
            specialRequirements: formData.specialRequirements,
            registrationFee: currentFee,
            submittedAt: new Date().toISOString(),
            status: 'pending'
          };

          let existingRegistrations = [];
          try {
            const stored = localStorage.getItem('eventRegistrations');
            existingRegistrations = stored ? JSON.parse(stored) : [];
          } catch (err) {
            console.error('Error reading from localStorage:', err);
          }
          
          existingRegistrations.push(formSubmission);
          localStorage.setItem('eventRegistrations', JSON.stringify(existingRegistrations));
          window.dispatchEvent(new CustomEvent('eventRegistrationsUpdated', { detail: existingRegistrations }));
          
          setIsSubmitted(true);
          return;
        }

        throw new Error(
          result.error.message || 'Failed to save your registration. Please try again.'
        );
      }

      // Successfully saved to Supabase
      console.log('✅ Registration successfully saved to Supabase:', result.data);
      
      // Clear any errors
      setErrors({});
      
      // Dispatch event to notify dashboard
      window.dispatchEvent(new CustomEvent('eventRegistrationsUpdated'));
      
      // Optionally save to localStorage as backup cache
      try {
        const formSubmission = eventRegistrationsService.mapSupabaseToLocal(result.data);
        let existingRegistrations = [];
        const stored = localStorage.getItem('eventRegistrations');
        if (stored) {
          existingRegistrations = JSON.parse(stored);
        }
        // Check if already exists to avoid duplicates
        const exists = existingRegistrations.some(r => r.id === formSubmission.id);
        if (!exists) {
          existingRegistrations.push(formSubmission);
          localStorage.setItem('eventRegistrations', JSON.stringify(existingRegistrations));
        }
      } catch (err) {
        console.warn('Could not save to localStorage backup:', err);
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Unexpected error submitting registration:', error);
      alert(
        `Failed to submit registration: ${error.message || 'Unknown error'}\n\n` +
        'Please try again or contact support if the issue persists.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasNoEvents) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <PageHero
          title="Events"
          subtitle="Stay updated with our latest conferences and professional development events"
          icon={<Calendar className="w-12 h-12" />}
        />

        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Events' }]} />

        {/* Empty State */}
        <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              No Currently Live Event or Upcoming Event
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              There is no currently live event or upcoming event coming soon. Check out our past events to see what we've been up to!
            </p>
            <button
              onClick={() => navigate('/past-events')}
              className="px-8 py-3 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              View Past Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading event information...</p>
        </div>
      </div>
    );
  }

  const scheduleDay1 = eventData.scheduleDay1 || [];
  const scheduleDay2 = eventData.scheduleDay2 || [];
  const tracks = eventData.tracks || [];
  const memberFee = eventData.memberFee || 500;
  const guestFee = eventData.guestFee || 800;
  const studentFee = eventData.studentFee || 300;
  const currentFee = formData.membershipType === 'member' ? memberFee : 
                     formData.membershipType === 'student' ? studentFee : guestFee;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for registering for our conference! Our admin team will contact you shortly with Instapay payment details.
          </p>
          <div className="bg-teal-50 border-l-4 border-[#5A9B8E] p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Registration Fee:</strong> {currentFee} EGP<br />
              <strong>Email:</strong> {formData.email}<br />
              <strong>Membership Type:</strong> {formData.membershipType === 'member' ? 'Member' : formData.membershipType === 'student' ? 'Student' : 'Guest'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Back to Event Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-black/90 text-white py-20 overflow-hidden">
        {eventData.heroImageUrl && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url(${eventData.heroImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Countdown Timer */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                {countdown.months > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="text-3xl md:text-4xl font-bold text-white">{String(countdown.months).padStart(2, '0')}</div>
                    <div className="text-xs md:text-sm text-teal-200 uppercase tracking-wide mt-1">Months</div>
                  </div>
                )}
                <div className="flex flex-col items-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{String(countdown.days).padStart(2, '0')}</div>
                  <div className="text-xs md:text-sm text-teal-200 uppercase tracking-wide mt-1">Days</div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white/50">:</div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{String(countdown.hours).padStart(2, '0')}</div>
                  <div className="text-xs md:text-sm text-teal-200 uppercase tracking-wide mt-1">Hours</div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white/50">:</div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{String(countdown.minutes).padStart(2, '0')}</div>
                  <div className="text-xs md:text-sm text-teal-200 uppercase tracking-wide mt-1">Minutes</div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white/50">:</div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{String(countdown.seconds).padStart(2, '0')}</div>
                  <div className="text-xs md:text-sm text-teal-200 uppercase tracking-wide mt-1">Seconds</div>
                </div>
              </div>
            </div>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold">LIVE EVENT</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{eventData.title || 'Conference Schedule'}</h1>
            <p className="text-xl md:text-2xl text-teal-50 max-w-3xl mx-auto mb-6">
              {eventData.subtitle || 'Advancing Practice and Research in Speech-Language Pathology: Bridging Science and Clinical Impact'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-teal-100 mb-6">
              {eventData.headerInfo1 && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{eventData.headerInfo1}</span>
                </div>
              )}
              {eventData.headerInfo2 && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{eventData.headerInfo2}</span>
                </div>
              )}
            </div>
            {eventData.bookletUrl && (
              <a
                href={eventData.bookletUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-white border border-1 border-white rounded-lg hover:text-[#5A9B8E] hover:bg-white transition-colors font-semibold shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Download Booklet
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: eventData.title || 'Conference Schedule' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Overview */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Overview</h2>
              {eventData.overviewDescription && (
                <p className="text-gray-700 mb-6">{eventData.overviewDescription}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventData.durationText && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#5A9B8E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Duration</h3>
                      <p className="text-sm text-gray-600">{eventData.durationText}</p>
                    </div>
                  </div>
                )}
                {eventData.tracksDescription && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-[#5A9B8E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Tracks</h3>
                      <p className="text-sm text-gray-600">{eventData.tracksDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracks */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Conference Tracks</h2>
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                    <div className="w-8 h-8 bg-[#5A9B8E] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium text-gray-900">{track}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Day 1 */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{eventData.day1Title || 'Day One - Knowledge and Innovation'}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Time</th>
                      {tracks.map((track, index) => (
                        <th key={index} className="text-left py-3 px-2 font-semibold text-gray-900">{track}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleDay1.map((slot, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-2 font-medium text-[#5A9B8E]">{slot.time}</td>
                        {tracks.map((track, trackIndex) => {
                          const trackKey = `track${String.fromCharCode(65 + trackIndex)}`;
                          return (
                            <td key={trackIndex} className="py-3 px-2 text-gray-700">{slot[trackKey] || ''}</td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schedule Day 2 */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{eventData.day2Title || 'Day Two - Collaboration and Future Directions'}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Time</th>
                      {tracks.map((track, index) => (
                        <th key={index} className="text-left py-3 px-2 font-semibold text-gray-900">{track}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleDay2.map((slot, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-2 font-medium text-[#5A9B8E]">{slot.time}</td>
                        {tracks.map((track, trackIndex) => {
                          const trackKey = `track${String.fromCharCode(65 + trackIndex)}`;
                          return (
                            <td key={trackIndex} className="py-3 px-2 text-gray-700">{slot[trackKey] || ''}</td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scientific Committee Section */}
            {participants.scientific_committee && participants.scientific_committee.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-8 mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="w-6 h-6 text-[#5A9B8E]" />
                  <h2 className="text-2xl font-bold text-gray-900">Scientific Committee</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {participants.scientific_committee.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedParticipant(member)}
                      className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                    >
                      <div className="mb-3">
                        <ImagePlaceholder
                          src={member.imageUrl}
                          alt={member.name}
                          name={member.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 hover:border-gray-200 transition-colors"
                        />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 text-center">{member.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organizing Committee Section */}
            {participants.organizing_committee && participants.organizing_committee.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="w-6 h-6 text-[#5A9B8E]" />
                  <h2 className="text-2xl font-bold text-gray-900">Organizing Committee</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {participants.organizing_committee.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedParticipant(member)}
                      className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                    >
                      <div className="mb-3">
                        <ImagePlaceholder
                          src={member.imageUrl}
                          alt={member.name}
                          name={member.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 hover:border-gray-200 transition-colors"
                        />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 text-center">{member.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers Section */}
            {participants.speakers && participants.speakers.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Mic className="w-6 h-6 text-[#5A9B8E]" />
                  <h2 className="text-2xl font-bold text-gray-900">Speakers</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {participants.speakers.map((speaker) => (
                    <div
                      key={speaker.id}
                      onClick={() => setSelectedParticipant(speaker)}
                      className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                    >
                      <div className="mb-3">
                        <ImagePlaceholder
                          src={speaker.imageUrl}
                          alt={speaker.name}
                          name={speaker.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 hover:border-gray-200 transition-colors"
                        />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 text-center">{speaker.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Registration Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Register Now</h3>
              
              {/* Pricing */}
              <div className="mb-6 p-4 bg-[#5A9B8E]/10 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-[#5A9B8E]" />
                  <h4 className="font-semibold text-gray-900">Registration Fees</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-bold text-[#5A9B8E]">{memberFee} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-bold text-[#5A9B8E]">{studentFee} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-bold text-gray-700">{guestFee} EGP</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.fullName 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-[#5A9B8E] focus:border-transparent'
                      }`}
                      placeholder="John Doe"
                      required
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-[#5A9B8E] focus:border-transparent'
                      }`}
                      placeholder="john@example.com"
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.phone 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-[#5A9B8E] focus:border-transparent'
                      }`}
                      placeholder="+20 XXX XXX XXXX"
                      required
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent"
                      placeholder="Your Organization"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Type *
                  </label>
                  <select
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent"
                    required
                  >
                    <option value="member">EACSL Member ({memberFee} EGP)</option>
                    <option value="student">Student ({studentFee} EGP)</option>
                    <option value="guest">Guest ({guestFee} EGP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Notes
                  </label>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent resize-none"
                    placeholder="Any additional notes or comments..."
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-700">Total Fee:</span>
                    <span className="text-2xl font-bold text-[#5A9B8E]">{currentFee} EGP</span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Register Now
                  </button>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Payment via Instapay. Our admin will contact you with payment details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Modal */}
      {selectedParticipant && (
        <ParticipantModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}

      {/* Footer CTA Section - Only show for non-signed-in users */}
      {!user && (
        <div className="bg-white border-t border-gray-100 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#5A9B8E] rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Questions About the Event?
              </h2>
              <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
                Contact us for more information about the conference
              </p>
              <a 
                href='/contact'
                className="inline-block bg-white text-[#5A9B8E] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingEventsPage;