import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, Award, BookOpen, MapPin, Clock, X, Mic, GraduationCap, Briefcase } from 'lucide-react';
import { eventsManager } from '../utils/dataManager';
import { eventParticipantsService } from '../services/eventParticipantsService';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';

export default function PastEventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pastEvents, setPastEvents] = useState([]);
  const [eventParticipants, setEventParticipants] = useState({});
  const loadingParticipants = useRef(new Set());

  useEffect(() => {
    const loadPastEvents = async () => {
      // First, load from cache for immediate display
      const cachedEvents = eventsManager.getPastSync();
      setPastEvents(cachedEvents);
      
      // Then refresh from Supabase in the background
      try {
        const events = await eventsManager.getPast();
        setPastEvents(events);
      } catch (error) {
        console.error('Error loading past events:', error);
      }
    };

    loadPastEvents();

    // Listen for event updates
    const handleEventsUpdate = async () => {
      console.log('PastEventsPage: Events updated event received');
      try {
        const events = await eventsManager.getPast();
        setPastEvents(events);
      } catch (error) {
        console.error('Error loading past events:', error);
      }
    };

    window.addEventListener('eventsUpdated', handleEventsUpdate);
    return () => {
      window.removeEventListener('eventsUpdated', handleEventsUpdate);
    };
  }, []);

  // Load participants when selected event changes
  useEffect(() => {
    const loadParticipants = async () => {
      if (selectedEvent && selectedEvent.id) {
        const eventId = selectedEvent.id;
        
        // Check if already loaded or currently loading
        setEventParticipants(prev => {
          if (prev[eventId] || loadingParticipants.current.has(eventId)) {
            return prev; // Already loaded or loading
          }
          
          // Mark as loading
          loadingParticipants.current.add(eventId);
          
          // Load participants
          eventParticipantsService.getByEventId(eventId)
            .then(participantsResult => {
              if (participantsResult.data && !participantsResult.error) {
                setEventParticipants(prevState => {
                  // Double-check it's still not loaded (race condition protection)
                  if (prevState[eventId]) {
                    loadingParticipants.current.delete(eventId);
                    return prevState;
                  }
                  loadingParticipants.current.delete(eventId);
                  return {
                    ...prevState,
                    [eventId]: participantsResult.data
                  };
                });
              } else {
                loadingParticipants.current.delete(eventId);
              }
            })
            .catch(error => {
              console.error('Error loading participants:', error);
              loadingParticipants.current.delete(eventId);
            });
          
          return prev; // Return unchanged
        });
      }
    };

    loadParticipants();
  }, [selectedEvent]);

  if (pastEvents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <PageHero
          title="Past Events"
          subtitle="Explore our previous conferences, programs, and professional development events"
          icon={<Calendar className="w-12 h-12" />}
        />

        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Events', path: '/upcoming-events' }, { label: 'Past Events' }]} />

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12 bg-white rounded-lg">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Past Events</h2>
            <p className="text-gray-600">
              There are no past events to display at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="Past Events"
        subtitle="Explore our previous conferences, programs, and professional development events"
        icon={<Calendar className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Past Events' }]} />

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8">
          {pastEvents.map((event) => {
            // Format date from movedToPastAt or createdAt
            const eventDate = event.movedToPastAt 
              ? new Date(event.movedToPastAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
              : event.createdAt 
              ? new Date(event.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
              : 'Past Event';
            
            const eventYear = event.movedToPastAt 
              ? new Date(event.movedToPastAt).getFullYear()
              : event.createdAt 
              ? new Date(event.createdAt).getFullYear()
              : new Date().getFullYear();

            return (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Event Image */}
                  <div className="lg:col-span-1 h-64 lg:h-auto">
                    {event.heroImageUrl ? (
                      <img
                        src={event.heroImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#5A9B8E] flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-[#5A9B8E] opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="lg:col-span-2 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-teal-50 text-[#5A9B8E] text-sm font-semibold rounded-full">
                        {eventYear}
                      </span>
                      <span className="text-sm text-gray-500">Past Event</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.title || 'Untitled Event'}</h2>
                    <p className="text-lg text-gray-600 mb-4">{event.subtitle || 'No description available'}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {event.memberFee !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Member Fee:</span>
                          <span>{event.memberFee} EGP</span>
                        </div>
                      )}
                      {event.studentFee !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Student Fee:</span>
                          <span>{event.studentFee} EGP</span>
                        </div>
                      )}
                      {event.guestFee !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Guest Fee:</span>
                          <span>{event.guestFee} EGP</span>
                        </div>
                      )}
                      {event.tracks && event.tracks.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-[#5A9B8E]" />
                          <span>{event.tracks.length} Track{event.tracks.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-[#5A9B8E]" />
                        <span>{eventDate}</span>
                      </div>
                    </div>

                    {event.scheduleDay1 && event.scheduleDay1.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Schedule:</strong> {event.day1Title || 'Day 1'} & {event.day2Title || 'Day 2'}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="px-6 py-2.5 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full my-8 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="sticky top-4 float-right mr-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Modal Header */}
            <div className="p-8 pb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedEvent.title || 'Untitled Event'}</h2>
              <p className="text-xl text-gray-600 mb-4">{selectedEvent.subtitle || 'No description available'}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {selectedEvent.memberFee !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Member Fee:</span>
                    <span>{selectedEvent.memberFee} EGP</span>
                  </div>
                )}
                {selectedEvent.studentFee !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Student Fee:</span>
                    <span>{selectedEvent.studentFee} EGP</span>
                  </div>
                )}
                {selectedEvent.guestFee !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Guest Fee:</span>
                    <span>{selectedEvent.guestFee} EGP</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Speakers Section */}
            {eventParticipants[selectedEvent.id]?.speakers && eventParticipants[selectedEvent.id].speakers.length > 0 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Mic className="w-6 h-6 text-[#5A9B8E]" />
                  <h3 className="text-2xl font-bold text-gray-900">Speakers</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {eventParticipants[selectedEvent.id].speakers.map((speaker) => (
                    <div
                      key={speaker.id}
                      className="flex flex-col items-center"
                    >
                      <div className="mb-3">
                        <ImagePlaceholder
                          src={speaker.imageUrl}
                          alt={speaker.name}
                          name={speaker.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
                        />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 text-center">{speaker.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scientific Committee Section */}
            {eventParticipants[selectedEvent.id]?.scientific_committee && eventParticipants[selectedEvent.id].scientific_committee.length > 0 && (
              <div className="p-8 bg-gray-50">
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="w-6 h-6 text-[#5A9B8E]" />
                  <h3 className="text-2xl font-bold text-gray-900">Scientific Committee</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {eventParticipants[selectedEvent.id].scientific_committee.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col items-center"
                    >
                      <div className="mb-3">
                        <ImagePlaceholder
                          src={member.imageUrl}
                          alt={member.name}
                          name={member.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
                        />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 text-center">{member.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organizing Committee Section */}
            {eventParticipants[selectedEvent.id]?.organizing_committee && eventParticipants[selectedEvent.id].organizing_committee.length > 0 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="w-6 h-6 text-[#5A9B8E]" />
                  <h3 className="text-2xl font-bold text-gray-900">Organizing Committee</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {eventParticipants[selectedEvent.id].organizing_committee.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col items-center"
                    >
                      <div className="mb-3">
                        <ImagePlaceholder
                          src={member.imageUrl}
                          alt={member.name}
                          name={member.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
                        />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 text-center">{member.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracks */}
            {selectedEvent.tracks && selectedEvent.tracks.length > 0 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-[#5A9B8E]" />
                  <h3 className="text-2xl font-bold text-gray-900">Conference Tracks</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEvent.tracks.map((track, idx) => (
                    <div key={idx} className="p-4 bg-teal-50 rounded-lg">
                      <p className="font-semibold text-gray-900">{track}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Day 1 */}
            {selectedEvent.scheduleDay1 && selectedEvent.scheduleDay1.length > 0 && (
              <div className="p-8 bg-gray-50">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-[#5A9B8E]" />
                  <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.day1Title || 'Day One'}</h3>
                </div>
                <div className="space-y-3">
                  {selectedEvent.scheduleDay1.map((slot, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="font-semibold text-[#5A9B8E] mb-2">{slot.time}</div>
                      {selectedEvent.tracks && selectedEvent.tracks.map((track, trackIdx) => {
                        const trackKey = `track${String.fromCharCode(65 + trackIdx)}`;
                        return slot[trackKey] ? (
                          <div key={trackIdx} className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">{track}:</span> {slot[trackKey]}
                          </div>
                        ) : null;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Day 2 */}
            {selectedEvent.scheduleDay2 && selectedEvent.scheduleDay2.length > 0 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-[#5A9B8E]" />
                  <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.day2Title || 'Day Two'}</h3>
                </div>
                <div className="space-y-3">
                  {selectedEvent.scheduleDay2.map((slot, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="font-semibold text-[#5A9B8E] mb-2">{slot.time}</div>
                      {selectedEvent.tracks && selectedEvent.tracks.map((track, trackIdx) => {
                        const trackKey = `track${String.fromCharCode(65 + trackIdx)}`;
                        return slot[trackKey] ? (
                          <div key={trackIdx} className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">{track}:</span> {slot[trackKey]}
                          </div>
                        ) : null;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#5A9B8E] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Become a member and be part of our growing professional community
            </p>
            <a 
              href="/apply-membership"
              className="inline-block bg-white text-[#5A9B8E] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
            >
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
