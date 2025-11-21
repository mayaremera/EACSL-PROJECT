import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, DollarSign, CheckCircle, User, Mail, Phone, Building2 } from 'lucide-react';
import { eventsManager } from '../utils/dataManager';
import { supabase } from '../lib/supabase';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const UpcomingEventsPage = () => {
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
  const [eventData, setEventData] = useState(null);
  const [hasNoEvents, setHasNoEvents] = useState(false);

  useEffect(() => {
    const loadEvent = () => {
      let event = null;
      
      // If eventId is provided, get that specific event
      if (eventId) {
        event = eventsManager.getById(parseInt(eventId));
        // If event is found but it's a past event, redirect to past events
        if (event && event.status === 'past') {
          navigate(`/past-events`, { replace: true });
          return;
        }
      }
      
      // If no eventId or event not found, get the first upcoming event
      if (!event) {
        const upcomingEvents = eventsManager.getUpcoming();
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
    };

    loadEvent();

    // Listen for event updates
    const handleEventsUpdate = () => {
      loadEvent();
    };

    window.addEventListener('eventsUpdated', handleEventsUpdate);
    return () => {
      window.removeEventListener('eventsUpdated', handleEventsUpdate);
    };
  }, [eventId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields (Name, Email, WhatsApp Phone).');
      return;
    }
    
    try {
      // Prepare data for Supabase
      const registrationData = {
        event_id: eventData.id && typeof eventData.id === 'number' ? eventData.id : null,
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        organization: formData.organization?.trim() || null,
        membership_type: formData.membershipType,
        selected_tracks: formData.selectedTracks || [],
        special_requirements: formData.specialRequirements?.trim() || null,
        registration_fee: currentFee,
        status: 'pending'
      };

      console.log('Submitting registration to Supabase:', registrationData);

      // Insert into Supabase
      const { data, error } = await supabase
        .from('event_registrations')
        .insert([registrationData])
        .select()
        .single();

      if (error) {
        console.error('Error saving registration to Supabase:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Check if table doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          alert(
            'Registration table not found. Please create the event_registrations table in Supabase first.\n\n' +
            'See CREATE_EVENT_REGISTRATIONS_TABLE.sql for instructions.'
          );
          return;
        }
        
        // Check for RLS policy errors
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('new row violates row-level security')) {
          alert(
            'Permission denied. The event_registrations table may have incorrect RLS policies.\n\n' +
            'Please ensure the "Allow public insert" policy is enabled in Supabase.\n\n' +
            'Falling back to localStorage for now.'
          );
        }
        
        // Fallback to localStorage if Supabase fails
        console.warn('Falling back to localStorage due to Supabase error');
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
        
        // Still show success message even if Supabase failed (since we saved to localStorage)
        setIsSubmitted(true);
        return;
      } else {
        // Successfully saved to Supabase
        console.log('Registration submitted to Supabase:', data);
        
        // Also dispatch event to notify dashboard
        window.dispatchEvent(new CustomEvent('eventRegistrationsUpdated'));
        
        // Optionally save to localStorage as backup
        try {
          const formSubmission = {
            id: data.id.toString(),
            type: 'eventRegistration',
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            organization: formData.organization,
            membershipType: formData.membershipType,
            selectedTracks: formData.selectedTracks,
            specialRequirements: formData.specialRequirements,
            registrationFee: currentFee,
            submittedAt: data.submitted_at,
            status: 'pending'
          };

          let existingRegistrations = [];
          const stored = localStorage.getItem('eventRegistrations');
          existingRegistrations = stored ? JSON.parse(stored) : [];
          existingRegistrations.push(formSubmission);
          localStorage.setItem('eventRegistrations', JSON.stringify(existingRegistrations));
        } catch (err) {
          console.warn('Could not save to localStorage backup:', err);
        }
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Unexpected error submitting registration:', error);
      alert('Failed to submit registration. Please try again.');
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
              className="px-8 py-3 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
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
  const currentFee = formData.membershipType === 'member' ? memberFee : guestFee;

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
          <div className="bg-teal-50 border-l-4 border-[#4C9A8F] p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Registration Fee:</strong> {currentFee} EGP<br />
              <strong>Email:</strong> {formData.email}<br />
              <strong>Membership Type:</strong> {formData.membershipType === 'member' ? 'Member' : 'Guest'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200"
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
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold">LIVE EVENT</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{eventData.title || 'Conference Schedule'}</h1>
            <p className="text-xl md:text-2xl text-teal-50 max-w-3xl mx-auto mb-6">
              {eventData.subtitle || 'Advancing Practice and Research in Speech-Language Pathology: Bridging Science and Clinical Impact'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-teal-100">
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
                      <Clock className="w-5 h-5 text-[#4C9A8F]" />
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
                      <Users className="w-5 h-5 text-[#4C9A8F]" />
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
                    <div className="w-8 h-8 bg-[#4C9A8F] text-white rounded-full flex items-center justify-center font-bold text-sm">
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
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Time</th>
                      {tracks.map((track, index) => (
                        <th key={index} className="text-left py-3 px-2 font-semibold text-gray-900">{track}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleDay1.map((slot, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-2 font-medium text-[#4C9A8F]">{slot.time}</td>
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
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Time</th>
                      {tracks.map((track, index) => (
                        <th key={index} className="text-left py-3 px-2 font-semibold text-gray-900">{track}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleDay2.map((slot, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-2 font-medium text-[#4C9A8F]">{slot.time}</td>
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
          </div>

          {/* Sidebar - Registration Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Register Now</h3>
              
              {/* Pricing */}
              <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-[#4C9A8F]" />
                  <h4 className="font-semibold text-gray-900">Registration Fees</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-bold text-[#4C9A8F]">{memberFee} EGP</span>
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent"
                      placeholder="john@example.com"
                      required
                    />
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent"
                      placeholder="+20 XXX XXX XXXX"
                      required
                    />
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent"
                    required
                  >
                    <option value="member">EACSL Member ({memberFee} EGP)</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent resize-none"
                    placeholder="Any additional notes or comments..."
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-700">Total Fee:</span>
                    <span className="text-2xl font-bold text-[#4C9A8F]">{currentFee} EGP</span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
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

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Questions About the Event?
            </h2>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Contact us for more information about the conference
            </p>
            <a className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg" href='/contact'>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEventsPage;