import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceCard1 from "../../assets/servicecard1.png";
import ServiceCard2 from "../../assets/servicecard2.png";
import ServiceCard3 from "../../assets/servicecard3.png";

const ServicesSection = () => {
  const scrollContainerRef = useRef(null);

  const services = [
    {
      id: 1,
      image: ServiceCard3,
      alt: "إعادة تأهيل",
      title: "برامج العلاج",
      link: "/therapy-programs"
    },
    {
      id: 2,
      image: ServiceCard2,
      alt: "احجز الآن",
      title: "احجز الآن",
      link: "/reservation"
    },
    {
      id: 3,
      image: ServiceCard1,
      alt: "للآباء",
      title: "للآباء",
      link: "/for-parents"
    }
  ];

  // Scroll functions for mobile slider
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.service-card')?.offsetWidth || 320;
      scrollContainerRef.current.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.service-card')?.offsetWidth || 320;
      scrollContainerRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gray-100 py-12 sm:py-16 lg:py-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-5xl sm:text-4xl lg:text-6xl font-bold text-black leading-tight mb-6 sm:mb-8">
              Check out <br /> the big variation of
              <br />
              services!
            </h2>
          </div>

          {/* Mobile Slider - Only visible on mobile */}
          <div className="lg:hidden relative">
            {/* Navigation Buttons */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} className="text-[#5A9B8E]" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} className="text-[#5A9B8E]" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  className="service-card flex-shrink-0 w-[85vw] max-w-[320px]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="relative w-full h-56 group cursor-pointer">
                    <div className="relative w-full h-full overflow-hidden rounded-lg transition-all duration-300 hover:scale-1000">
                      <img
                        src={service.image}
                        alt={service.alt}
                        className="w-full h-full object-cover object-top"
                      />
                      <Link to={service.link} className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
                        <h3 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg">
                          {service.title}
                        </h3>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Images Container - Hidden on mobile */}
          <div className="hidden lg:block relative w-full h-[500px]">
            <div className="relative w-full h-full">
              {/* Card 1 */}
              <div className="absolute top-[3rem] left-1/2 -translate-x-1/2 w-80 h-56 group cursor-pointer">
                <div className="relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-105">
                  <img
                    src={ServiceCard3}
                    alt="إعادة تأهيل"
                    className="w-full h-full object-cover object-top"
                  />
                  <Link to="/therapy-programs" className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                      برامج العلاج
                    </h3>
                  </Link>
                </div>
              </div>

              {/* Card 2 */}
              <div className="absolute -bottom-[0rem] -left-[2.3rem] w-80 h-56 group cursor-pointer">
                <div className="relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-105">
                  <img
                    src={ServiceCard2}
                    alt="احجز الآن"
                    className="w-full h-full object-cover object-top"
                  />
                  <Link to="/reservation" className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                      احجز الآن
                    </h3>
                  </Link>
                </div>
              </div>

              {/* Card 3 */}
              <div className="absolute bottom-[2.5rem] -right-[0rem] w-80 h-56 group cursor-pointer">
                <div className="relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-105">
                  <img
                    src={ServiceCard1}
                    alt="للآباء"
                    className="w-full h-full object-cover object-top"
                  />
                  <Link to="/for-parents" className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                      للآباء
                    </h3>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
