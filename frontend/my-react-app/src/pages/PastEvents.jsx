import React, { useState } from 'react';
import { Calendar, Users, Award, BookOpen, MapPin, Clock, X } from 'lucide-react';

const PastEvents = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = [
    {
      id: 1,
      name: "SLPIP",
      fullName: "Speech Language Pathology International Program",
      year: "2024-2025",
      date: "August 2024 - June 2025",
      location: "Online & Cairo, Egypt",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
      description: "An international program for speech-language pathologists focusing on professional development, cultural responsiveness, and evidence-based practices.",
      highlights: [
        "20+ International Speakers",
        "15 Professional Seminars",
        "300+ Participants Worldwide",
        "Cultural Responsiveness Focus"
      ],
      honoraryPresident: {
        name: "Dr. Wael A. Al-Dakroury",
        title: "Ph.D., CCC-SLP",
        role: "Honorary President & Program Director",
        image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=300&h=400&fit=crop",
        bio: "International Consultant and Speaker, ASHA International Ambassador, Associate Professor at Alfaisal University"
      },
      committees: {
        scientific: [
          { name: "Dr. Wael A. Al-Dakroury", role: "Chair" },
          { name: "Dr. Sylvia Martínez", role: "Member" },
          { name: "Dr. Fadl Alkhelaifi", role: "Member" },
          { name: "Dr. Nadia Ahmed", role: "Member" }
        ],
        organizing: [
          { name: "Wael AlDakroury", role: "Program Director" },
          { name: "Osama Elsayed", role: "General Coordinator" },
          { name: "Sahar A. Alsamah", role: "General Coordinator" },
          { name: "Mohamed Gweida", role: "Kuwait Committee" }
        ]
      },
      seminars: [
        {
          title: "Cultural Responsiveness in Speech Pathology",
          speaker: "Dr. Ben Spikey",
          date: "September 15, 2024",
          topic: "Understanding alternative models of practice in speech pathology and cultural responsiveness"
        },
        {
          title: "Multilingualism and Language Disorder",
          speaker: "Dr. Wael A. Al-Dakroury",
          date: "November 20, 2024",
          topic: "Identifying Developmental Language Disorder in multilingual children"
        },
        {
          title: "Voice and Laryngeal Disorders",
          speaker: "Dr. Karim Nasser",
          date: "January 10, 2025",
          topic: "Advanced techniques in voice therapy and assessment"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Past Events</h1>
            <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto">
              Explore our previous conferences, programs, and professional development events
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
            <span className="text-gray-900 font-medium">Past Events</span>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Event Image */}
                <div className="lg:col-span-1 h-64 lg:h-auto">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Event Info */}
                <div className="lg:col-span-2 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-teal-50 text-[#4C9A8F] text-sm font-semibold rounded-full">
                      {event.year}
                    </span>
                    <span className="text-sm text-gray-500">Past Event</span>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h2>
                  <p className="text-lg text-gray-600 mb-4">{event.fullName}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-[#4C9A8F]" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-[#4C9A8F]" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {event.highlights.map((highlight, idx) => (
                      <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900">{highlight}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="px-6 py-2.5 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full my-8 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="sticky top-4 float-right mr-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Modal Header */}
            <div className="p-8 pb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedEvent.name}</h2>
              <p className="text-xl text-gray-600 mb-4">{selectedEvent.fullName}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4C9A8F]" />
                  <span>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4C9A8F]" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Honorary President */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-[#4C9A8F]" />
                <h3 className="text-2xl font-bold text-gray-900">Honorary President</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl">
                <div className="w-32 h-40 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0 shadow-md">
                  <img
                    src={selectedEvent.honoraryPresident.image}
                    alt={selectedEvent.honoraryPresident.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {selectedEvent.honoraryPresident.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">{selectedEvent.honoraryPresident.title}</p>
                  <p className="text-sm text-[#4C9A8F] font-semibold mb-3">
                    {selectedEvent.honoraryPresident.role}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedEvent.honoraryPresident.bio}
                  </p>
                </div>
              </div>
            </div>

            {/* Committees */}
            <div className="p-8 bg-gray-50">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-[#4C9A8F]" />
                <h3 className="text-2xl font-bold text-gray-900">Committees</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scientific Committee */}
                <div className="bg-white p-5 rounded-lg shadow-sm">
                  <h4 className="font-bold text-lg text-gray-900 mb-4">Scientific Committee</h4>
                  <div className="space-y-3">
                    {selectedEvent.committees.scientific.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-900 font-medium">{member.name}</span>
                        <span className="text-xs text-gray-500">{member.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organizing Committee */}
                <div className="bg-white p-5 rounded-lg shadow-sm">
                  <h4 className="font-bold text-lg text-gray-900 mb-4">Organizing Committee</h4>
                  <div className="space-y-3">
                    {selectedEvent.committees.organizing.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-900 font-medium">{member.name}</span>
                        <span className="text-xs text-gray-500">{member.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Seminars */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-[#4C9A8F]" />
                <h3 className="text-2xl font-bold text-gray-900">Featured Seminars</h3>
              </div>
              
              <div className="space-y-4">
                {selectedEvent.seminars.map((seminar, idx) => (
                  <div key={idx} className="p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-[#4C9A8F]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">{seminar.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{seminar.topic}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="font-medium">Speaker: {seminar.speaker}</span>
                          <span>•</span>
                          <span>{seminar.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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

export default PastEvents;
