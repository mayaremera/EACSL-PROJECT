import React from 'react';
import { Target, Eye, Users, Calendar, Award, ExternalLink } from 'lucide-react';

const AboutPage = () => {
  const boardMembers = [
    { name: "Sehar A.Alswaieh", role: "EACSL President", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop" },
    { name: "Osama Elseied", role: "Vice President", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop" },
    { name: "Mohamed Roken", role: "General Secretary", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" },
    { name: "Reham Ali", role: "Board Member", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop" },
    { name: "Eman Mostafa", role: "Board Member", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop" },
  ];

  const executiveBoard = [
    { name: "Dr. Ahmed Hassan", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop" },
    { name: "Dr. Sara Mohamed", image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&h=300&fit=crop" },
    { name: "Dr. Khaled Ibrahim", image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&h=300&fit=crop" },
    { name: "Dr. Layla Ahmed", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" },
    { name: "Dr. Fatima Ali", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop" },
    { name: "Dr. Omar Youssef", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" },
    { name: "Dr. Nadia Farid", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop" },
    { name: "Dr. Tarek Samir", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop" },
    { name: "Dr. Hanan Mustafa", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop" },
    { name: "Dr. Mona Salem", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop" },
    { name: "Dr. Yasser Nabil", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About EACSL</h1>
            <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto">
              Egyptian Association for Communication Sciences and Its Disorders
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <a href="#" className="hover:text-[#4C9A8F] transition-colors">Home</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">About</span>
          </div>
        </div>
      </div>

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
                <img 
                  src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=314,h=314,fit=crop/m5KvEjaDo4UxePa2/wael-egypt-YZ9bbVKwprs7Ekrr.jpg"
                  alt="Dr. Wael A. Al-Dakroury"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center">Dr. Wael A. Al-Dakroury</h3>
              <p className="text-sm text-gray-600 text-center mb-2">Ph.D., CCC-SLP</p>
              <p className="text-sm text-[#4C9A8F] font-medium text-center mb-3">Honorary President</p>
              <a 
                href="https://linkedin.com/in/waelslp" 
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
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{member.name}</h4>
                <p className="text-xs text-[#4C9A8F] font-medium">{member.role}</p>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-6 pt-6 border-t border-gray-200">Executive Board Members</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {executiveBoard.map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 overflow-hidden rounded-lg shadow-md aspect-square bg-gray-100">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
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
            <button className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
              Become a Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;