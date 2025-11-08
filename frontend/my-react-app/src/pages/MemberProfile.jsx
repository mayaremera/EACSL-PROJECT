import React, { useState } from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Globe,
    Linkedin,
    Award,
    Briefcase,
    GraduationCap,
    FileText,
    Calendar,
    Download,
    ExternalLink,
    BookOpen,
    CheckCircle
} from 'lucide-react';

function MemberProfile() {
    const [activeTab, setActiveTab] = useState('about');

    // Dummy profile data
    const profile = {
        name: "Dr. Ahmed Hassan",
        title: "Board Certified Cardiothoracic Surgeon",
        image: "https://images.unsplash.com/photo-1637059824899-a441006a6875?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600",
        coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=1200",
        location: "Cairo, Egypt",
        email: "ahmed.hassan@eacsl.net",
        phone: "+20 123 456 7890",
        website: "www.drahmedhassan.com",
        linkedin: "linkedin.com/in/ahmedhassan",
        memberSince: "January 2020",
        about: "Experienced cardiothoracic surgeon with over 15 years of expertise in advanced cardiac procedures. Specializing in minimally invasive techniques with a track record of over 500 successful surgeries. Passionate about advancing cardiac care through innovative surgical approaches and dedicated patient care.",
        specializations: [
            "Minimally Invasive Cardiac Surgery",
            "Coronary Artery Bypass Grafting",
            "Heart Valve Repair & Replacement",
            "Aortic Surgery",
            "Cardiac Tumor Surgery"
        ]
    };

    const experience = [
        {
            title: "Senior Consultant Cardiothoracic Surgeon",
            company: "Cairo Heart Institute",
            location: "Cairo, Egypt",
            period: "2018 - Present",
            description: "Leading cardiac surgical procedures and managing a team of 12 medical professionals. Pioneered minimally invasive techniques that reduced patient recovery time by 40%."
        },
        {
            title: "Consultant Cardiothoracic Surgeon",
            company: "National Heart Center",
            location: "Cairo, Egypt",
            period: "2015 - 2018",
            description: "Performed complex cardiac surgeries and mentored junior surgeons. Established new protocols for post-operative care resulting in improved patient outcomes."
        },
        {
            title: "Associate Surgeon",
            company: "Alexandria Medical Center",
            location: "Alexandria, Egypt",
            period: "2012 - 2015",
            description: "Assisted in major cardiac procedures and developed expertise in minimally invasive surgical techniques."
        }
    ];

    const education = [
        {
            degree: "Fellowship in Cardiothoracic Surgery",
            institution: "Harvard Medical School",
            location: "Boston, USA",
            year: "2011 - 2012"
        },
        {
            degree: "MD in General Surgery",
            institution: "Cairo University Faculty of Medicine",
            location: "Cairo, Egypt",
            year: "2005 - 2010"
        },
        {
            degree: "Bachelor of Medicine and Surgery (MBBS)",
            institution: "Alexandria University",
            location: "Alexandria, Egypt",
            year: "1998 - 2004"
        }
    ];

    const certificates = [
        {
            name: "Board Certified Cardiothoracic Surgeon",
            issuer: "Egyptian Medical Syndicate",
            date: "2012",
            verified: true
        },
        {
            name: "Advanced Cardiac Life Support (ACLS)",
            issuer: "American Heart Association",
            date: "2023",
            verified: true
        },
        {
            name: "Fellow of the American College of Surgeons",
            issuer: "American College of Surgeons",
            date: "2015",
            verified: true
        },
        {
            name: "European Board of Thoracic Surgery",
            issuer: "European Board of Thoracic Surgery",
            date: "2014",
            verified: true
        },
        {
            name: "Minimally Invasive Cardiac Surgery Certification",
            issuer: "Society of Thoracic Surgeons",
            date: "2016",
            verified: true
        }
    ];

    const courses = [
        {
            title: "Advanced Techniques in Minimally Invasive Cardiac Surgery",
            provider: "EACSL",
            date: "September 2024",
            status: "Completed",
            hours: "40 hours"
        },
        {
            title: "Robotic-Assisted Cardiac Surgery Workshop",
            provider: "EACSL",
            date: "June 2024",
            status: "Completed",
            hours: "24 hours"
        },
        {
            title: "Heart Failure Management Masterclass",
            provider: "EACSL",
            date: "March 2024",
            status: "Completed",
            hours: "32 hours"
        },
        {
            title: "Innovation in Cardiovascular Medicine 2025",
            provider: "EACSL",
            date: "January 2025",
            status: "In Progress",
            hours: "48 hours"
        }
    ];

    const publications = [
        {
            title: "Outcomes of Minimally Invasive Mitral Valve Repair: A 5-Year Retrospective Study",
            journal: "Journal of Cardiac Surgery",
            year: "2023",
            link: "#"
        },
        {
            title: "Innovative Approaches to Aortic Valve Replacement in High-Risk Patients",
            journal: "European Heart Journal",
            year: "2022",
            link: "#"
        },
        {
            title: "Reducing Recovery Time Through Enhanced Surgical Protocols",
            journal: "International Journal of Cardiology",
            year: "2021",
            link: "#"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Cover Image */}
            <div className="relative h-64 bg-gradient-to-r from-[#4C9A8F] to-[#3d8178]">
                <img
                    src={profile.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-30"
                />
            </div>

            {/* Profile Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-20 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Profile Picture */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto md:mx-0">
                                    <img
                                        src={profile.image}
                                        alt={profile.name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                            {profile.name}
                                        </h1>
                                        <p className="text-xl text-[#4C9A8F] font-semibold mb-4">
                                            {profile.title}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 justify-center md:justify-start">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-[#4C9A8F]" />
                                                <span>{profile.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-[#4C9A8F]" />
                                                <span>Member Since {profile.memberSince}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="flex items-center gap-2 bg-[#4C9A8F] text-white px-6 py-3 rounded-lg hover:bg-[#3d8178] transition-colors duration-200 font-semibold shadow-md">
                                        <Download className="w-4 h-4" />
                                        Download CV
                                    </button>
                                </div>

                                {/* Contact Info */}
                                <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                                    <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                                        <Mail className="w-4 h-4" />
                                        <span>{profile.email}</span>
                                    </a>
                                    <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                                        <Phone className="w-4 h-4" />
                                        <span>{profile.phone}</span>
                                    </a>
                                    <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                                        <Globe className="w-4 h-4" />
                                        <span>{profile.website}</span>
                                    </a>
                                    <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4C9A8F] transition-colors">
                                        <Linkedin className="w-4 h-4" />
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
                    <div className="flex border-b border-gray-200 min-w-max">
                        {[
                            { id: 'about', label: 'About', icon: FileText },
                            { id: 'experience', label: 'Experience', icon: Briefcase },
                            { id: 'education', label: 'Education', icon: GraduationCap },
                            { id: 'certificates', label: 'Certificates', icon: Award },
                            { id: 'courses', label: 'Courses', icon: BookOpen },
                            { id: 'publications', label: 'Publications', icon: FileText }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors duration-200 border-b-2 ${activeTab === tab.id
                                            ? 'border-[#4C9A8F] text-[#4C9A8F]'
                                            : 'border-transparent text-gray-600 hover:text-[#4C9A8F]'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Sections */}
                <div className="pb-12">
                    {/* About Section */}
                    {activeTab === 'about' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
                            <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                                {profile.about}
                            </p>

                            <h3 className="text-xl font-bold text-gray-900 mb-4">Specializations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {profile.specializations.map((spec, index) => (
                                    <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                                        <div className="w-2 h-2 rounded-full bg-[#4C9A8F] mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-700">{spec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience Section */}
                    {activeTab === 'experience' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Experience</h2>
                            <div className="space-y-6">
                                {experience.map((job, index) => (
                                    <div key={index} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-0 last:pb-0">
                                        <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-[#4C9A8F] -ml-[9px] border-4 border-white"></div>
                                        <div className="bg-gray-50 rounded-lg p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                                            <div className="flex items-center gap-2 text-[#4C9A8F] font-semibold mb-2">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{job.company}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{job.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{job.period}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{job.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education Section */}
                    {activeTab === 'education' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
                            <div className="space-y-6">
                                {education.map((edu, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-6 border-l-4 border-[#4C9A8F]">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{edu.degree}</h3>
                                        <div className="flex items-center gap-2 text-[#4C9A8F] font-semibold mb-2">
                                            <GraduationCap className="w-5 h-5" />
                                            <span>{edu.institution}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{edu.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{edu.year}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certificates Section */}
                    {activeTab === 'certificates' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Certificates & Qualifications</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {certificates.map((cert, index) => (
                                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <Award className="w-8 h-8 text-[#4C9A8F] flex-shrink-0" />
                                            {cert.verified && (
                                                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Verified
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
                                        <p className="text-sm text-gray-600 mb-1">{cert.issuer}</p>
                                        <p className="text-sm text-gray-500">{cert.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Courses Section */}
                    {activeTab === 'courses' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">EACSL Courses & Training</h2>
                            <div className="space-y-4">
                                {courses.map((course, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-[#4C9A8F] transition-colors duration-200">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <BookOpen className="w-4 h-4 text-[#4C9A8F]" />
                                                    <span>{course.provider}</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${course.status === 'Completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {course.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{course.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Award className="w-4 h-4" />
                                                <span>{course.hours}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Publications Section */}
                    {activeTab === 'publications' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Publications & Research</h2>
                            <div className="space-y-4">
                                {publications.map((pub, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-5 border-l-4 border-[#4C9A8F] hover:shadow-md transition-shadow duration-200">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{pub.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            <span className="font-semibold">{pub.journal}</span> • {pub.year}
                                        </p>
                                        <a
                                            href={pub.link}
                                            className="inline-flex items-center gap-1 text-sm text-[#4C9A8F] hover:text-[#3d8178] font-semibold transition-colors"
                                        >
                                            View Publication
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MemberProfile;