import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsManager } from "../../utils/dataManager";
import { eventParticipantsService } from "../../services/eventParticipantsService";
import ImagePlaceholder from "../ui/ImagePlaceholder";

// ----------------------------
// Event Card (unchanged)
// ----------------------------
const EventCard = () => {
  const [eventData, setEventData] = useState(null);
  const [heroCardSpeakers, setHeroCardSpeakers] = useState([]);

  useEffect(() => {
    const loadHeroCardSpeakers = async (event) => {
      if (!event || !event.id || !event.heroCardSpeakers || event.heroCardSpeakers.length === 0) {
        setHeroCardSpeakers([]);
        return;
      }

      try {
        // Get all participants for this event
        const participantsResult = await eventParticipantsService.getByEventId(event.id);
        if (participantsResult.data && !participantsResult.error) {
          const allSpeakers = participantsResult.data.speakers || [];
          
          // Handle both old format (array of IDs) and new format (array of objects with id and role)
          const heroCardSpeakersData = event.heroCardSpeakers.map(item => {
            if (typeof item === 'object' && item.id) {
              return item; // New format: {id, role}
            } else {
              return { id: item, role: '' }; // Old format: just ID
            }
          });
          
          // Filter to only include speakers in heroCardSpeakers array
          const featuredSpeakers = heroCardSpeakersData
            .map(heroSpeaker => {
              const speaker = allSpeakers.find(s => s.id === heroSpeaker.id);
              if (speaker) {
                return {
                  ...speaker,
                  role: heroSpeaker.role || ''
                };
              }
              return null;
            })
            .filter(Boolean)
            .slice(0, 4); // Limit to 4 speakers
          
          setHeroCardSpeakers(featuredSpeakers);
        }
      } catch (error) {
        console.error('Error loading hero card speakers:', error);
        setHeroCardSpeakers([]);
      }
    };

    const loadEvent = async () => {
      // First, load from cache for immediate display
      const cachedUpcoming = eventsManager.getUpcomingSync();
      if (cachedUpcoming && cachedUpcoming.length > 0) {
        setEventData(cachedUpcoming[0]);
        await loadHeroCardSpeakers(cachedUpcoming[0]);
      } else {
        // If no upcoming events, try to get the most recent past event
        const cachedPast = eventsManager.getPastSync();
        if (cachedPast && cachedPast.length > 0) {
          setEventData(cachedPast[0]);
          await loadHeroCardSpeakers(cachedPast[0]);
        }
      }
      
      // Then refresh from Supabase in the background
      try {
        const upcomingEvents = await eventsManager.getUpcoming();
        if (upcomingEvents && upcomingEvents.length > 0) {
          setEventData(upcomingEvents[0]);
          await loadHeroCardSpeakers(upcomingEvents[0]);
        } else {
          // If no upcoming events, get the most recent past event
          const pastEvents = await eventsManager.getPast();
          if (pastEvents && pastEvents.length > 0) {
            setEventData(pastEvents[0]);
            await loadHeroCardSpeakers(pastEvents[0]);
          }
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    loadEvent();

    // Listen for event updates
    const handleEventsUpdate = async () => {
      try {
        const upcomingEvents = await eventsManager.getUpcoming();
        if (upcomingEvents && upcomingEvents.length > 0) {
          setEventData(upcomingEvents[0]);
          await loadHeroCardSpeakers(upcomingEvents[0]);
        } else {
          // If no upcoming events, get the most recent past event
          const pastEvents = await eventsManager.getPast();
          if (pastEvents && pastEvents.length > 0) {
            setEventData(pastEvents[0]);
            await loadHeroCardSpeakers(pastEvents[0]);
          }
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    window.addEventListener('eventsUpdated', handleEventsUpdate);
    return () => {
      window.removeEventListener('eventsUpdated', handleEventsUpdate);
    };
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return { dayMonth: 'TBA', year: new Date().getFullYear().toString() };

    try {
      // Handle both YYYY-MM-DD format and ISO date strings
      let date;
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Parse YYYY-MM-DD format directly to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return { dayMonth: 'TBA', year: new Date().getFullYear().toString() };
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear().toString();

      // Format as "18 Jul" for compact display in badge
      return { dayMonth: `${day} ${month}`, year };
    } catch (e) {
      console.error('Error formatting date:', e, dateString);
      return { dayMonth: 'TBA', year: new Date().getFullYear().toString() };
    }
  };

  const dateInfo = eventData?.eventDate ? formatDate(eventData.eventDate) : { dayMonth: 'TBA', year: new Date().getFullYear().toString() };
  const eventImage = eventData?.heroImageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2072";
  const eventTitle = eventData?.title || "SLPIP";
  const eventSubtitle = eventData?.subtitle || "Speech Language Pathology International Program";

  return (
    <div className="w-full max-w-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 p-6">
      {/* Image Section */}
      <div className="relative">
        <img
          src={eventImage}
          alt={eventTitle}
          className="w-full h-[300px] object-cover rounded-2xl"
        />

        {/* Date Badge */}
        <div className="absolute top-0 left-0 bg-[#8B0000] text-white rounded-tr-3xl rounded-br-full w-[6.5rem] h-[6.5rem]">
          <div
            className="absolute text-[1.1rem] lg:text-[1.1rem] font-bold leading-none"
            style={{ top: "1.5rem", left: "40%", transform: "translateX(-50%)" }}
          >
            {dateInfo.dayMonth}
          </div>
          <div
            className="absolute text-sm font-medium"
            style={{
              top: "3rem",
              left: "40%",
              transform: "translateX(-50%)",
            }}
          >
            {dateInfo.year}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="pt-6">
        {/* Title */}
        <h1 className="text-5xl md:text-3xl font-extrabold text-black mb-2 leading-tight text-center">
          {eventTitle}
        </h1>

        {/* Subtitle */}
        <p className="text-[0.8rem] md:text-sm font-medium text-gray-700 mb-6 leading-snug text-center">
          {eventSubtitle}
        </p>

        {/* Speakers Section */}
        {heroCardSpeakers && heroCardSpeakers.length > 0 && (
          <div className="mt-4 flex justify-center">
            {/* Speakers Grid - 2 columns, 2 rows - Perfectly centered */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:gap-x-10 md:gap-y-4 place-items-center">
              {heroCardSpeakers.slice(0, 4).map((speaker) => (
                <div key={speaker.id} className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <ImagePlaceholder
                    src={speaker.imageUrl}
                    alt={speaker.name}
                    name={speaker.name}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover object-top flex-shrink-0"
            />
                  <div className="min-w-0 max-w-[120px] md:max-w-[140px]">
                    <div className="text-[0.7rem] md:text-sm font-bold text-black truncate" title={speaker.name}>
                      {speaker.name}
                    </div>
                    {speaker.role && (
                      <div className="text-[0.55rem] md:text-[0.7rem] text-gray-600 truncate" title={speaker.role}>
                        {speaker.role}
                      </div>
                    )}
                  </div>
          </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------
// HERO SECTION (updated)
// ----------------------------
const HeroSection = () => {
  const [currentEvent, setCurrentEvent] = React.useState(null);

  React.useEffect(() => {
    const loadEvent = async () => {
      // First, load from cache for immediate display
      const cachedUpcoming = eventsManager.getUpcomingSync();
      if (cachedUpcoming && cachedUpcoming.length > 0) {
        setCurrentEvent(cachedUpcoming[0]);
      } else {
        // If no upcoming events, try to get the most recent past event
        const cachedPast = eventsManager.getPastSync();
        if (cachedPast && cachedPast.length > 0) {
          setCurrentEvent(cachedPast[0]);
        }
      }
      
      // Then refresh from Supabase in the background
      try {
        const upcomingEvents = await eventsManager.getUpcoming();
        if (upcomingEvents && upcomingEvents.length > 0) {
          setCurrentEvent(upcomingEvents[0]);
        } else {
          // If no upcoming events, get the most recent past event
          const pastEvents = await eventsManager.getPast();
          if (pastEvents && pastEvents.length > 0) {
            setCurrentEvent(pastEvents[0]);
          }
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    loadEvent();

    // Listen for event updates
    const handleEventsUpdate = async () => {
      try {
        const upcomingEvents = await eventsManager.getUpcoming();
        if (upcomingEvents && upcomingEvents.length > 0) {
          setCurrentEvent(upcomingEvents[0]);
        } else {
          // If no upcoming events, get the most recent past event
          const pastEvents = await eventsManager.getPast();
          if (pastEvents && pastEvents.length > 0) {
            setCurrentEvent(pastEvents[0]);
          }
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    window.addEventListener('eventsUpdated', handleEventsUpdate);
    return () => {
      window.removeEventListener('eventsUpdated', handleEventsUpdate);
    };
  }, []);

  const getEnrollUrl = () => {
    if (currentEvent && currentEvent.id) {
      // If it's a past event, link to past events page, otherwise upcoming events
      if (currentEvent.status === 'past') {
        return '/past-events';
      }
      return `/upcoming-events/${currentEvent.id}`;
    }
    return '/upcoming-events';
  };

  // Get dynamic title and description from current event's hero section fields
  const heroTitle = currentEvent?.heroTitle || "Advancing Speech-Language Pathology 2025";
  const heroDescription = currentEvent?.heroDescription || "Join leading experts for a two-day conference focused on advancing clinical practice, enhancing research impact, and exploring innovation across speech, swallowing, language disorders, and audiology.";

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#f7f8fa] py-20">
      {/* Container */}
      <div className="relative z-10 max-w-[84rem] w-full mx-auto grid lg:grid-cols-[64%_35%] items-center gap-8 lg:gap-5 px-4 sm:px-8">

        {/* Left Side - Order first on mobile, second on desktop */}
        <div className="space-y-6 flex flex-col items-center lg:items-start order-1 lg:order-1">

          {/* Dynamic Title from Current Event */}
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 leading-smug text-center lg:text-left">
            {heroTitle}
          </h1>

          {/* Dynamic Description from Current Event */}
          <p className="text-base md:text-lg lg:text-[1rem] font-normal text-[#5a6270] max-w-[40rem] text-center lg:text-left">
            {heroDescription}
          </p>

          {/* Enroll Button - Links to Current Event */}
          <Link 
            to={getEnrollUrl()}
            className="text-sm md:text-base px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300 w-fit text-center lg:text-left"
          >
            {currentEvent?.status === 'past' ? 'View Event' : 'Enroll Now'}
          </Link>
        </div>

        {/* Right Side — Card - Order second on mobile, first on desktop */}
        <div className="relative flex items-center justify-center lg:justify-end order-2 lg:order-2">
          <EventCard />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
