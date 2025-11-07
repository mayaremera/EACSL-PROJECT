import React, { useState } from 'react';
import { Mail, Briefcase, X, Award, Calendar } from 'lucide-react';

const MemberCard = ({
    image,
    name,
    role,
    nationality,
    flagCode,
    description,
    fullDescription,
    email,
    membershipDate,
    certificates
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* Vertical Member Card */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 w-full max-w-xs border-2 border-gray-200">
                {/* Member Image */}
                <div className="relative h-40 overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover object-top"
                    />
                </div>

                {/* Card Content */}
                <div className="p-4">
                    {/* Role Tag */}
                    <div className="mb-3">
                        <span className="bg-[#5A9B8E] text-white px-3 py-1 text-xs font-semibold rounded inline-block">
                            {role}
                        </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
                        {name}
                    </h3>
                    
                    {/* Info */}
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <img 
                                src={`https://flagcdn.com/w40/${flagCode}.png`}
                                alt={`${nationality} Flag`}
                                className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            />
                            <span>{nationality}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-[#5A9B8E] flex-shrink-0 mt-0.5" />
                            <a href={`mailto:${email}`} className="hover:text-[#5A9B8E] transition-colors line-clamp-1">
                                {email}
                            </a>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {description}
                    </p>

                    {/* View More Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full text-sm px-4 py-2 border border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-lg hover:bg-[#5A9B8E] hover:text-white transition-all duration-300"
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
                                <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 shadow-lg mx-auto sm:mx-0">
                                    <img
                                        src={image}
                                        alt={name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex items-center gap-3 justify-center sm:justify-start mb-2 flex-wrap">
                                        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
                                        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                            </svg>
                                            <span className="text-xs font-semibold whitespace-nowrap">Active till 2025</span>
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold text-[#5A9B8E] mb-4">{role}</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <img 
                                                src={`https://flagcdn.com/w40/${flagCode}.png`}
                                                alt={`${nationality} Flag`}
                                                className="w-8 h-5 object-cover rounded-sm shadow-sm"
                                            />
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

// Main component with multiple members
const MembersGrid = () => {
    const members = [
        {
            image: "https://images.unsplash.com/photo-1637059824899-a441006a6875?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
            name: "Dr. Ahmed Hassan",
            role: "Board Member",
            nationality: "Egyptian",
            flagCode: "eg",
            description: "Experienced surgeon specializing in advanced cardiac procedures.",
            fullDescription: "Dr. Ahmed Hassan is an experienced cardiothoracic surgeon with over 15 years of expertise in advanced cardiac procedures. He specializes in minimally invasive techniques and has performed over 500 successful surgeries. His dedication to patient care and innovative surgical approaches has made him a respected figure in the medical community.",
            email: "ahmed.hassan@eacsl.net",
            membershipDate: "January 2020",
            certificates: [
                "Board Certified Cardiothoracic Surgeon",
                "Advanced Cardiac Life Support (ACLS)",
                "Fellow of the American College of Surgeons",
                "European Board of Thoracic Surgery"
            ]
        },
        {
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600",
            name: "Dr. Sarah Mitchell",
            role: "Vice President",
            nationality: "American",
            flagCode: "us",
            description: "Leading expert in pediatric cardiology with focus on congenital heart defects.",
            fullDescription: "Dr. Sarah Mitchell is a renowned pediatric cardiologist with 18 years of experience treating congenital heart defects in children. She has pioneered several innovative non-invasive diagnostic techniques and has published over 40 research papers in prestigious medical journals. Her compassionate approach and expertise have helped thousands of families.",
            email: "sarah.mitchell@eacsl.net",
            membershipDate: "March 2018",
            certificates: [
                "Board Certified Pediatric Cardiologist",
                "Pediatric Advanced Life Support (PALS)",
                "Fellow of the American Academy of Pediatrics",
                "European Society of Cardiology Member"
            ]
        },
        {
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600",
            name: "Dr. Yuki Tanaka",
            role: "Research Director",
            nationality: "Japanese",
            flagCode: "jp",
            description: "Pioneering researcher in cardiovascular regenerative medicine and stem cell therapy.",
            fullDescription: "Dr. Yuki Tanaka is a leading researcher in cardiovascular regenerative medicine with groundbreaking work in stem cell therapy for heart disease. With a PhD from Tokyo University and post-doctoral research at Stanford, Dr. Tanaka has contributed significantly to advancing treatments for heart failure through innovative cellular therapies.",
            email: "yuki.tanaka@eacsl.net",
            membershipDate: "September 2019",
            certificates: [
                "PhD in Cardiovascular Medicine",
                "Board Certified in Internal Medicine",
                "International Society for Stem Cell Research Fellow",
                "Japanese Circulation Society Senior Member"
            ]
        },
        {
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600",
            name: "Dr. Maria Santos",
            role: "Secretary General",
            nationality: "Brazilian",
            flagCode: "br",
            description: "Expert in interventional cardiology with specialization in complex coronary procedures.",
            fullDescription: "Dr. Maria Santos is an accomplished interventional cardiologist with 20 years of expertise in complex coronary interventions. She has trained numerous fellows and residents in advanced catheterization techniques and is known for her exceptional skills in high-risk PCI procedures. Her work has significantly improved patient outcomes in acute coronary syndromes.",
            email: "maria.santos@eacsl.net",
            membershipDate: "June 2017",
            certificates: [
                "Board Certified Interventional Cardiologist",
                "Advanced Cardiovascular Life Support (ACLS)",
                "Fellow of the Society for Cardiovascular Angiography",
                "Latin American Society of Interventional Cardiology Member"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pl-6">
                    {members.map((member, index) => (
                        <MemberCard key={index} {...member} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MembersGrid;