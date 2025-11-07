
import React, { useState } from 'react';
import { Mail, Globe, Briefcase, X, Award, Calendar } from 'lucide-react';
import DrWael from '../../assets/MembersImages/drWael.avif'

const MemberCard = ({
    image = "https://images.unsplash.com/photo-1637059824899-a441006a6875?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
    name = "Dr. Ahmed Hassan",
    role = "Board Member",
    nationality = "Egyptian",
    description = "Experienced surgeon specializing in advanced cardiac procedures.",
    fullDescription = "Dr. Ahmed Hassan is an experienced cardiothoracic surgeon with over 15 years of expertise in advanced cardiac procedures. He specializes in minimally invasive techniques and has performed over 500 successful surgeries. His dedication to patient care and innovative surgical approaches has made him a respected figure in the medical community.",
    email = "ahmed.hassan@eacsl.net",
    membershipDate = "January 2020",
    certificates = [
        "Board Certified Cardiothoracic Surgeon",
        "Advanced Cardiac Life Support (ACLS)",
        "Fellow of the American College of Surgeons",
        "European Board of Thoracic Surgery"
    ]
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* Vertical Member Card */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 w-full max-w-xs">
                {/* Member Image */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute top-3 right-3">
                        <span className="bg-[#5A9B8E] text-white px-3 py-1 text-xs font-semibold rounded shadow-lg">
                            {role}
                        </span>
                    </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1">
                        {name}
                    </h3>
                    
                    {/* Info */}
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Globe className="w-3.5 h-3.5 text-[#5A9B8E] flex-shrink-0" />
                            <span>{nationality}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-[#5A9B8E] flex-shrink-0 mt-0.5" />
                            <a href={`mailto:${email}`} className="hover:text-[#5A9B8E] transition-colors line-clamp-1">
                                {email}
                            </a>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 line-clamp-3 mb-4">
                        {description}
                    </p>

                    {/* View More Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full text-xs px-4 py-2 border border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-lg hover:bg-[#5A9B8E] hover:text-white transition-all duration-300"
                    >
                        View More
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Member Profile</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Member Header */}
                            <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-lg mx-auto sm:mx-0">
                                    <img
                                        src={image}
                                        alt={name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
                                    <p className="text-lg font-semibold text-[#5A9B8E] mb-4">{role}</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Globe className="w-4 h-4 text-[#5A9B8E]" />
                                            <span><strong>Nationality:</strong> {nationality}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 text-[#5A9B8E]" />
                                            <span><strong>Member Since:</strong> {membershipDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                                            <Mail className="w-4 h-4 text-[#5A9B8E]" />
                                            <a href={`mailto:${email}`} className="hover:text-[#5A9B8E] transition-colors">
                                                {email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Full Description */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-[#5A9B8E]" />
                                    About
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {fullDescription}
                                </p>
                            </div>

                            {/* Certificates */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-[#5A9B8E]" />
                                    Certificates & Qualifications
                                </h4>
                                <ul className="space-y-2">
                                    {certificates.map((cert, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#5A9B8E] mt-2 flex-shrink-0"></div>
                                            <span>{cert}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full px-6 py-3 bg-[#5A9B8E] text-white font-semibold rounded-lg hover:bg-[#4a8a7e] transition-colors duration-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MemberCard;
