import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsManager } from "../../utils/dataManager";
import { eventParticipantsService } from "../../services/eventParticipantsService";
import ImagePlaceholder from "../ui/ImagePlaceholder";
import PageLoader from "../ui/PageLoader";
import { SUPABASE_FETCH_OPTIONS } from "../../utils/supabaseFetch";

const fetchFeaturedEvent = async () => {
  const { upcoming, past } = await eventsManager.getAll(SUPABASE_FETCH_OPTIONS);
  if (upcoming?.length > 0) return upcoming[0];
  if (past?.length > 0) return past[0];
  return null;
};

const loadHeroCardSpeakers = async (event) => {
  if (!event?.id || !event.heroCardSpeakers?.length) return [];

  try {
    const participantsResult = await eventParticipantsService.getByEventId(event.id);
    if (!participantsResult.data || participantsResult.error) return [];

    const allSpeakers = participantsResult.data.speakers || [];
    const heroCardSpeakersData = event.heroCardSpeakers.map((item) =>
      typeof item === "object" && item.id ? item : { id: item, role: "" }
    );

    return heroCardSpeakersData
      .map((heroSpeaker) => {
        const speaker = allSpeakers.find((s) => s.id === heroSpeaker.id);
        return speaker ? { ...speaker, role: heroSpeaker.role || "" } : null;
      })
      .filter(Boolean)
      .slice(0, 4);
  } catch (error) {
    console.error("Error loading hero card speakers:", error);
    return [];
  }
};

const EventCard = ({ eventData, heroCardSpeakers }) => {
  if (!eventData) return null;

  return (
    <div className="w-full max-w-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 p-6">
      <div className="relative">
        {eventData.heroImageUrl && (
          <img
            src={eventData.heroImageUrl}
            alt={eventData.title || "Event"}
            className="w-full h-[300px] object-cover rounded-2xl"
          />
        )}
      </div>

      <div className="pt-6">
        <h1 className="text-5xl md:text-3xl font-extrabold text-black mb-2 leading-tight text-center">
          {eventData.title}
        </h1>

        {eventData.subtitle && (
          <p className="text-[0.8rem] md:text-sm font-medium text-gray-700 mb-6 leading-snug text-center">
            {eventData.subtitle}
          </p>
        )}

        {heroCardSpeakers.length > 0 && (
          <div className="mt-4 flex justify-center">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:gap-x-10 md:gap-y-4 place-items-center">
              {heroCardSpeakers.map((speaker) => (
                <div key={speaker.id} className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <ImagePlaceholder
                    src={speaker.imageUrl}
                    alt={speaker.name}
                    name={speaker.name}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover object-top flex-shrink-0"
                  />
                  <div className="min-w-0 max-w-[120px] md:max-w-[140px]">
                    <div
                      className="text-[0.7rem] md:text-sm font-bold text-black truncate"
                      title={speaker.name}
                    >
                      {speaker.name}
                    </div>
                    {speaker.role && (
                      <div
                        className="text-[0.55rem] md:text-[0.7rem] text-gray-600 truncate"
                        title={speaker.role}
                      >
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

const HeroSection = () => {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [heroCardSpeakers, setHeroCardSpeakers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadEvent = async () => {
      setIsLoading(true);
      try {
        const event = await fetchFeaturedEvent();
        if (!mounted) return;

        setCurrentEvent(event);
        const speakers = event ? await loadHeroCardSpeakers(event) : [];
        if (mounted) setHeroCardSpeakers(speakers);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadEvent();

    const handleEventsUpdate = async (e) => {
      const events = e.detail;
      if (!events) return;

      const featured = events.upcoming?.[0] || events.past?.[0] || null;
      setCurrentEvent(featured);
      const speakers = featured ? await loadHeroCardSpeakers(featured) : [];
      setHeroCardSpeakers(speakers);
    };

    window.addEventListener("eventsUpdated", handleEventsUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("eventsUpdated", handleEventsUpdate);
    };
  }, []);

  if (isLoading) {
    return (
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#f7f8fa] py-20">
        <PageLoader variant="section" label="Loading..." />
      </section>
    );
  }

  const getEnrollUrl = () => {
    if (currentEvent?.id) {
      return currentEvent.status === "past"
        ? "/past-events"
        : `/upcoming-events/${currentEvent.id}`;
    }
    return "/upcoming-events";
  };

  const heroTitle =
    currentEvent?.heroTitle || "Advancing Speech-Language Pathology 2025";
  const heroDescription =
    currentEvent?.heroDescription ||
    "Join leading experts for a two-day conference focused on advancing clinical practice, enhancing research impact, and exploring innovation across speech, swallowing, language disorders, and audiology.";

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#f7f8fa] py-20">
      <div className="relative z-10 max-w-[84rem] w-full mx-auto grid lg:grid-cols-[64%_35%] items-center gap-8 lg:gap-5 px-4 sm:px-8">
        <div className="space-y-6 flex flex-col items-center lg:items-start order-1 lg:order-1">
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 leading-smug text-center lg:text-left">
            {heroTitle}
          </h1>

          <p className="text-base md:text-lg lg:text-[1rem] font-normal text-[#5a6270] max-w-[40rem] text-center lg:text-left">
            {heroDescription}
          </p>

          <Link
            to={getEnrollUrl()}
            className="text-sm md:text-base px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300 w-fit text-center lg:text-left"
          >
            {currentEvent?.status === "past" ? "View Event" : "Enroll Now"}
          </Link>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end order-2 lg:order-2">
          {currentEvent && (
            <EventCard eventData={currentEvent} heroCardSpeakers={heroCardSpeakers} />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
