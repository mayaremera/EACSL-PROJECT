import React, { useState, useEffect } from "react";
import WaelAlDakroury from "../../assets/waelaldakroury.png";
import OsamaElsayed from "../../assets/osamaelsayed.png";
import SaharAAlsamahi from "../../assets/saharalsamahi.png";
import MohamedGweda from "../../assets/mohamedgwida.png";
import Booklet from "../../assets/booklet.png";
import { eventsManager } from "../../utils/dataManager";

// EventCard component embedded
const EventCard = () => {
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const loadEvent = () => {
      const upcomingEvents = eventsManager.getUpcoming();
      if (upcomingEvents && upcomingEvents.length > 0) {
        setEventData(upcomingEvents[0]);
      }
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
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return { dayMonth: 'TBA', year: new Date().getFullYear().toString() };

    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear().toString();

      // Format as "18 Jul" for compact display in badge
      return { dayMonth: `${day} ${month}`, year };
    } catch (e) {
      return { dayMonth: 'TBA', year: new Date().getFullYear().toString() };
    }
  };

  const dateInfo = eventData?.eventDate ? formatDate(eventData.eventDate) : { dayMonth: 'TBA', year: new Date().getFullYear().toString() };
  const eventImage = eventData?.heroImageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2072";
  const eventTitle = eventData?.title || "SLPIP";
  const eventSubtitle = eventData?.subtitle || "Speech Language Pathology International Program";

  return (
    <div className="w-full max-w-[460px] bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 p-6">
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
            className="absolute text-2xl lg:text-[1.3rem] font-bold leading-none"
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

        {/* Team Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {/* Person 1 */}
          <div className="flex items-center gap-1 md:gap-2">
            <img
              src={WaelAlDakroury}
              alt="Wael AlDakroury"
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[0.8rem] md:text-sm font-bold text-black whitespace-nowrap">
                Wael AlDakroury
              </div>
              <div className="text-[0.6rem] md:text-[0.8rem] text-gray-600">
                Program Director
              </div>
            </div>
          </div>

          {/* Person 2 */}
          <div className="flex items-center gap-1 md:gap-2">
            <img
              src={OsamaElsayed}
              alt="Osama Elsayed"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <div className="text-[0.8rem] md:text-sm font-bold text-black">
                Osama Elsayed
              </div>
              <div className="text-[0.7rem] md:text-[0.8rem] text-gray-600">
                General Coordination
              </div>
            </div>
          </div>

          {/* Person 3 */}
          <div className="flex items-center gap-1 md:gap-2">
            <img
              src={SaharAAlsamahi}
              alt="Sahar A.Alsamahi"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <div className="text-[0.8rem] md:text-sm font-bold text-black">
                Sahar A.Alsamahi
              </div>
              <div className="text-[0.6rem] md:text-[0.8rem] text-gray-600">
                General Coordination
              </div>
            </div>
          </div>

          {/* Person 4 */}
          <div className="flex items-center gap-1 md:gap-2">
            <img
              src={MohamedGweda}
              alt="Mohamed Gwida"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <div className="text-[0.8rem] md:text-sm font-bold text-black">
                Mohamed Gwida
              </div>
              <div className="text-[0.6rem] md:text-[0.8rem] text-gray-600">
                Kuwait Committee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const [currentEvent, setCurrentEvent] = React.useState(null);

  React.useEffect(() => {
    const loadEvent = () => {
      const upcomingEvents = eventsManager.getUpcoming();
      if (upcomingEvents && upcomingEvents.length > 0) {
        setCurrentEvent(upcomingEvents[0]);
      }
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
  }, []);

  const getEnrollUrl = () => {
    if (currentEvent && currentEvent.id) {
      return `/upcoming-events/${currentEvent.id}`;
    }
    return '/upcoming-events';
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#f7f8fa] py-20">
      {/* Content container */}
      <div className="relative z-10 max-w-[1400px] w-full mx-auto grid lg:grid-cols-[65%_35%] items-center gap-8 lg:gap-5 px-6 md:px-12 lg:px-[7rem]">
        {/* LEFT SIDE - 70% */}
        <div className="space-y-6 flex flex-col items-center md:items-start">
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 leading-tight text-center md:text-left">
            Speech Language Pathology International Program
          </h1>
          <p className="text-base md:text-lg lg:text-[1.1rem] font-normal text-[#5a6270] max-w-[42rem] text-center md:text-left">
            EACSL aims to serve professionals and students dedicated to
            speech-language pathology and related special education fields. The
            EACSL aspires to deliver exceptional services in speech and language
            disorders rehabilitation
          </p>

          <a className="text-sm md:text-base px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300 w-fit" href={getEnrollUrl()}>
            Enroll Now
          </a>
        </div>

        {/* RIGHT SIDE - 30% */}
        <div className="relative flex items-center justify-end">
          <EventCard />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
