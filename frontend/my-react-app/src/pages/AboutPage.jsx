import React from 'react';
import { Target, Eye, Users, Calendar, Award, ExternalLink, Info } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import SaharAAlsamahi from '../assets/MembersImages/sahar-samahi.png';
import OsamaElsayed from '../assets/MembersImages/osama-sayed.avif';
import RehamAli from '../assets/MembersImages/reham-ali.avif';
import EmanMostafa from '../assets/MembersImages/eman-moustafa.avif';
import MohamedBahaa from '../assets/MembersImages/mohamed-bahaa.avif';
import SaraAlhenawy from '../assets/MembersImages/sara-henawy.webp';
import MohamedAbdelMola from '../assets/MembersImages/mohammed-abdelmola.avif';
import MohamedGwida from '../assets/MembersImages/mohamed-gwida.avif';
import NahlaAssem from '../assets/MembersImages/nahla-assem.avif';
import SamehAlsaghir from '../assets/MembersImages/sameh-elsagheer.jpg';
import AhmedFawzy from '../assets/MembersImages/ahmed-fawzy.avif';
import SohaSamy from '../assets/MembersImages/soha-samy.jpg';
import SaniNaiim from '../assets/MembersImages/sami-naiim.jpg';
import DrWaelAlDakroury from '../assets/MembersImages/dr-wael.avif';

const AboutPage = () => {
  const boardMembers = [
    { name: "Sahar A.Alsamahi", role: "EACSL President/ SLP", image: SaharAAlsamahi },
    { name: "Osama Elsayed", role: "Board member/SLP", image: OsamaElsayed },
    { name: "Reham Ali", role: "Board member/SLP", image: RehamAli },
    { name: "Eman Mostafa", role: "Board member/SLP", image: EmanMostafa },
    { name: "Mohamed Bahaa", role: "Board member/ legal consultant", image: MohamedBahaa },
  ];

  const founders = [
    { name: "Dr.Sara Alhenawy", image: SaraAlhenawy },
    { name: "Osama Elsayed", image: OsamaElsayed },
    { name: "Mohamed Abdel-Mola", image: MohamedAbdelMola },
    { name: "Reham Ali", image: RehamAli },
    { name: "Mohamed Gwida", image: MohamedGwida },
    { name: "Nahla Assem", image: NahlaAssem },
    { name: "Sameh Alsaghir", image: SamehAlsaghir },
    { name: "Ahmed Fawzy", image: AhmedFawzy },
    { name: "Soha Samy", image: SohaSamy },
    { name: "Sani Naiim", image: SaniNaiim },
    { name: "Alshaimaa Salem"},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="About Us"
        subtitle="Egyptian Association for Communication Sciences and Its Disorders"
        icon={<Users className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'About' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        <div className="bg-white rounded-xl shadow-md p-8 md:p-10 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-[#4C9A8F]" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Established 2012</h2>
              <p className="text-sm text-gray-600">University of Alexandria, Egypt</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg">
          The Egyptian Association for Communication Sciences and Linguistics (EACSL) was founded  by graduates from the Phonetics and Linguistics Department Faculty of Arts Alexandria University  in Alexandria, Egypt, 2012. (EACSL) aims to serve professionals and students dedicated to speech-language pathology and related special education fields. The EACSL aspires to deliver exceptional services in speech and language disorders rehabilitation.
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-[#4C9A8F]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Fostering effective communication skills through professional development in speech-language pathology and audiology to promote high standards of care and practice.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-[#4C9A8F]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To ensure each individual has access to excellent communication services, creating a career of excellence for Egypt through improving treatment services.
            </p>
          </div>
        </div>

        {/* Honorary President Section */}
        <div className="bg-white rounded-xl shadow-md p-8 md:p-10 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-[#4C9A8F]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Honorary President</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="w-full max-w-xs overflow-hidden rounded-xl shadow-lg mb-4 aspect-[3/4] bg-gray-100">
                <ImagePlaceholder 
                  src={DrWaelAlDakroury}
                  alt="Dr. Wael A. Al-Dakroury"
                  name="Dr. Wael A. Al-Dakroury"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center">Dr. Wael A. Al-Dakroury</h3>
              <p className="text-sm text-gray-600 text-center mb-2">Ph.D., CCC-SLP</p>
              <p className="text-sm text-[#4C9A8F] font-medium text-center mb-3">Honorary President</p>
              <a 
                href="https://www.linkedin.com/in/waelslp/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#4C9A8F] hover:text-[#3d8178] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                LinkedIn Profile
              </a>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Dr. Wael A. Al-Dakroury is an International Consultant and Speaker and a highly experienced bilingual pediatric Speech-Language Pathologist. He currently serves as the International Speech-Language Pathology Ambassador for the American Speech-Language and Hearing Association (ASHA) and is a Member of the ASHA SIG 17 Coordinating Committee.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Dr. Al-Dakroury is Co-Founder and Director of the Communication Disorders Department at Psych Care Clinics and Associate Professor at the Faculty of Medicine, Alfaisal University, Riyadh. Recognized for his outstanding international contributions, he received a certificate of recognition award from ASHA in 2023.
              </p>

              <p className="text-gray-700 leading-relaxed">
                With over 30 years of experience, Dr. Wael has worked as a Consultant Speech-Language Pathologist, Clinical Supervisor, and Professional Trainer for numerous medical, rehabilitation, and educational institutions. He has participated in various symposia, forums, and conferences as director, coordinator, and member of scientific committees, including the ASHA Annual Convention Scientific Committee.
              </p>

              <p className="text-gray-700 leading-relaxed">
                His research focuses on pragmatic disorders in children with ADHD and Autism Spectrum Disorder, as well as language disorders in pediatrics. Dr. Al-Dakroury serves as an Editorial Board Member and Reviewer for several leading peer-reviewed journals, including the Journal of Speech, Language, and Hearing Research (JSLHR).
              </p>
            </div>
          </div>
        </div>

        {/* Board Members */}
        <div className="bg-white rounded-xl shadow-md p-8 md:p-10 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#4C9A8F]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Leadership Team</h2>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-6">Board of Directors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
            {boardMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-3 overflow-hidden rounded-lg shadow-md aspect-[3/4] bg-gray-100">
                  <ImagePlaceholder 
                    src={member.image} 
                    alt={member.name}
                    name={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-300"
                  />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{member.name}</h4>
                <p className="text-xs text-[#4C9A8F] font-medium">{member.role}</p>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-6 pt-6 border-t border-gray-200">Founders</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {founders.map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 overflow-hidden rounded-lg shadow-md aspect-square bg-gray-100">
                  <ImagePlaceholder 
                    src={member.image} 
                    alt={member.name}
                    name={member.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-semibold text-gray-900 text-xs">{member.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Become a member and be part of our growing professional community
            </p>
            <a 
              href="/apply-membership"
              className="inline-block bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
            >
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;