import React from "react";
import halfCircle from "../../assets/halfLogo.png";
import aboutPageImage from "../../assets/aboutpagesectionimage.png";

const AboutUsSection = () => {
  return (
    <section className="bg-white py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[10rem] items-center">
          {/* Left Content */}
          <div>
            {/* About Us Label with underline */}
            <div className="mb-6 inline-block">
              <span className="text-sm font-bold tracking-wider text-black block mb-[-0.1rem]">
                ABOUT US
              </span>
              <div className="h-[0.17rem] w-[3.5rem] bg-[#5A9B8E]"></div>
            </div>

            {/* Title with Logo */}
            <div className="flex items-start mb-5 lg:mb-7 mt-[0.5rem] lg:mt-0">
              <img
                src={halfCircle}
                alt="Logo"
                className="w-[3.5rem] h-[4.5rem] -mt-[0.3rem] lg:mt-[0.65rem]"
              />
              <h2 className="text-[1.8rem] md:text-5xl lg:text-[3.2rem] font-bold text-black lg:leading-[2.9rem]">
                Get to know us better
              </h2>
            </div>

            {/* Description Paragraphs */}
            <div className="space-y-6 text-gray-600 text-base text-center md:text-left leading-relaxed mb-8">
              <p>
                The Egyptian Association for Communication Sciences and
                Linguistics (EACSL) was founded by graduates from the Phonetics
                and Linguistics Department Faculty of Arts Alexandria University
                in Alexandria, Egypt, 2012. (EACSL) aims to serve professionals
                and students dedicated to speech-language pathology and related
                special education fields. The EACSL aspires to deliver
                exceptional services in speech and language disorders
                rehabilitation.
              </p>
            </div>

            {/* View More Button */}
            <button className="text-[0.8rem] px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300 mx-auto block lg:mx-0 lg:inline-block">
              Learn More
            </button>
          </div>

          {/* Right Image with decorative lines */}
          <div className="relative">
            <div className="relative bg-transparent">
              <img
                src={aboutPageImage}
                alt="Team working together"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
