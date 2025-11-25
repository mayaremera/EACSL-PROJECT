import React from "react";
import { Link } from "react-router-dom";
import halfCircle from "../../assets/halfLogo.png";
import aboutPageImage from "../../assets/aboutpagesectionimage.png";

const AboutUsSection = () => {
  return (
    <section className="bg-white py-12 sm:py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[10rem] items-center">
          
          {/* Left Content */}
          <div>
            {/* About Us Label */}
            <div className="mb-6 sm:mb-3 inline-block pt-2 sm:pt-0">
              <span className="text-sm font-bold tracking-wider text-black block mb-[-0.1rem]">
                ABOUT US
              </span>
              <div className="h-[0.18rem] w-[3.5rem] bg-[#5A9B8E]"></div>
            </div>

            {/* Title With Logo */}
            <div className="flex items-left justify-left lg:justify-start mb-5 lg:mb-7 mt-[0.5rem] lg:mt-0">
              <img
                src={halfCircle}
                alt="Logo"
                className="w-[3.5rem] h-[4.5rem] flex-shrink-0"
              />
              <h2 className="text-[1.8rem] md:text-5xl lg:text-[2.5rem] font-semibold text-black leading-tight lg:leading-[2.3rem] ml-1 lg:ml-0">
                <span className="block">Get to know</span>
                <span className="block">us better</span>
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-6 text-gray-600 text-base text-center lg:text-left leading-relaxed mb-5">
              <p>
                The Egyptian Association for Communication Sciences and
                Linguistics (EACSL) was founded by graduates from the Phonetics
                and Linguistics Department Faculty of Arts Alexandria University
                in Alexandria, Egypt, 2012. (EACSL) aims to serve professionals
                and students dedicated to speech-language pathology and related
                special education fields. The EACSL aspires to deliver exceptional services in speech and language disorders
                rehabilitation.
              </p>
            </div>

            {/* Learn More Button */}
            <div className="text-center lg:text-left">
              <Link
                to="/about"
                className="text-[0.8rem] px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300 inline-block"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Image — Updated Styling */}
          <div className="relative">
            <div className="relative bg-transparent">
              <img
                src="https://plus.unsplash.com/premium_photo-1661724579910-96f4dba073ac?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Team working together"
                className="w-full h-auto object-cover rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;


