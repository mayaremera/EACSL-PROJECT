// import React from "react";
// import { ArrowRight } from "lucide-react";
// import ServiceCard1 from "../../assets/servicecard1.png";
// import ServiceCard2 from "../../assets/servicecard2.png";
// import ServiceCard3 from "../../assets/servicecard3.png";

// const ServicesSection = () => {
//   return (
//     <section className="bg-gray-100 py-20 px-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//           {/* Left Content */}
//           <div>
//             <h2 className="text-6xl font-bold text-black leading-tight mb-8">
//               Check out
//               <br />
//               the big
//               <br />
//               variation of
//               <br />
//               services!
//             </h2>

//             <a
//               href="#"
//               className="inline-flex items-center gap-2 text-[#5A9B8E] text-lg font-semibold group"
//             >
//               <span className="relative">
//                 View All Services
//                 <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#5A9B8E] group-hover:w-full transition-all duration-300"></span>
//               </span>
//               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
//             </a>
//           </div>

//           {/* Right Images Container */}
//           <div className="relative w-full h-[500px]">
//             {/* Container for absolute cards */}
//             <div className="relative w-full h-full">
//               {/* Card 1 */}
//               <div className="absolute top-[3rem] left-1/2 -translate-x-1/2 w-80 h-56 group cursor-pointer">
//                 <div className="relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-105">
//                   <img
//                     src={ServiceCard3}
//                     alt="إعادة تأهيل"
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
//                     <h3 className="text-white text-3xl font-bold drop-shadow-lg">
//                       إعادة تأهيل
//                     </h3>
//                   </div>
//                 </div>
//               </div>

//               {/* Card 2 */}
//               <div className="absolute -bottom-[0.2rem] left-0 w-80 h-56 group cursor-pointer">
//                 <div className="relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-105">
//                   <img
//                     src={ServiceCard2}
//                     alt="احجز الآن"
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
//                     <h3 className="text-white text-3xl font-bold drop-shadow-lg">
//                       احجز الآن
//                     </h3>
//                   </div>
//                 </div>
//               </div>

//               {/* Card 3 */}
//               <div className="absolute bottom-[2rem] -right-[2.4rem] w-80 h-56 group cursor-pointer">
//                 <div className="relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-105">
//                   <img
//                     src={ServiceCard1}
//                     alt="للآباء"
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
//                     <h3 className="text-white text-3xl font-bold drop-shadow-lg">
//                       للآباء
//                     </h3>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ServicesSection;

import React from "react";
import { ArrowRight } from "lucide-react";
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

            <a
              href="#"
              className="inline-flex items-center gap-2 text-[#5A9B8E] text-lg font-semibold group"
            >
              <span className="relative">
                View All Services
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#5A9B8E] group-hover:w-full transition-all duration-300"></span>
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
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
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                      إعادة تأهيل
                    </h3>
                  </div>
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
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                      احجز الآن
                    </h3>
                  </div>
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
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300">
                    <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                      للآباء
                    </h3>
                  </div>
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
