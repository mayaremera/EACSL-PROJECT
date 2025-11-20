import React from "react";
import ServiceCard1 from "../../assets/servicecard1.png";
import ServiceCard2 from "../../assets/servicecard2.png";
import ServiceCard3 from "../../assets/servicecard3.png";

const ServicesSection = () => {
  return (
    <section className="bg-gray-100 py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-6xl font-bold text-black leading-tight mb-8">
              Check out the <br /> big variation of
              <br />
              services!
            </h2>
          </div>

          {/* Right Images Container */}
          <div className="relative w-full h-[500px]">
            <div className="relative w-full h-full">
              {/* Card 1 */}
              <div className="absolute top-[3rem] left-1/2 -translate-x-1/2 w-80 h-56 group cursor-pointer">
                <div className="relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-105">
                  <img
                    src={ServiceCard3}
                    alt="إعادة تأهيل"
                    className="w-full h-full object-contain"
                  />
                  <a className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300" href="/therapy-programs">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                      برامج العلاج
                    </h3>
                  </a>
                </div>
              </div>

              {/* Card 2 */}
              <div className="absolute -bottom-[0rem] -left-[2.3rem] w-80 h-56 group cursor-pointer">
                <div className="relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-105">
                  <img
                    src={ServiceCard2}
                    alt="احجز الآن"
                    className="w-full h-full object-contain"
                  />
                  <a className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300" href="/reservation">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                      احجز الآن
                    </h3>
                  </a>
                </div>
              </div>

              {/* Card 3 */}
              <div className="absolute bottom-[2.5rem] -right-[0rem] w-80 h-56 group cursor-pointer">
                <div className="relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-105">
                  <img
                    src={ServiceCard1}
                    alt="للآباء"
                    className="w-full h-full object-contain"
                  />
                  <a className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300" href="/for-parents">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                      للآباء
                    </h3>
                  </a>
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
