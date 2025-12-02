import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    Globe,
    Linkedin,
    Award,
    Briefcase,
    FileText,
    Calendar,
    BookOpen,
    CheckCircle,
    User
} from 'lucide-react';
import { membersManager, initializeData } from '../utils/dataManager';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import { getDisplayRole } from '../utils/roleDisplay';

function MemberProfile() {
    const { memberId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('about');
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMember = async () => {
            initializeData();
            try {
                const allMembers = await membersManager.getAll();
                const memberData = allMembers.find(m => m.id === parseInt(memberId));
                if (memberData) {
                    setMember(memberData);
                }
            } catch (error) {
                console.error('Error loading member:', error);
                // Fallback to cached data
                const cachedMembers = membersManager._getAllFromLocalStorage();
                const memberData = cachedMembers.find(m => m.id === parseInt(memberId));
                if (memberData) {
                    setMember(memberData);
                }
            } finally {
                setLoading(false);
            }
        };

        loadMember();

        const handleMemberUpdate = (e) => {
            if (e.detail && Array.isArray(e.detail)) {
                const updatedMember = e.detail.find(m => m.id === parseInt(memberId));
                if (updatedMember) {
                    setMember(updatedMember);
                }
            } else {
                loadMember();
            }
        };

        window.addEventListener('membersUpdated', handleMemberUpdate);
        return () => {
            window.removeEventListener('membersUpdated', handleMemberUpdate);
        };
    }, [memberId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A9B8E] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading member profile...</p>
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Member Not Found</h1>
                    <p className="text-gray-600 mb-6">The member profile you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/members-overview')}
                        className="px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors"
                    >
                        Back to Members
                    </button>
                </div>
            </div>
        );
    }

    const profile = {
        name: member.name || '',
        title: getDisplayRole(member.role || '', member.displayRole || null),
        image: member.image || '',
        coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=1200",
        location: member.location || '',
        email: member.email || '',
        phone: member.phone || '',
        website: member.website || '',
        linkedin: member.linkedin || '',
        activeTill: member.activeTill || '',
        about: member.fullDescription || member.description || '',
        specializations: member.certificates || []
    };

    const certificates = (member.certificates || []).map(cert => ({
        name: cert,
        issuer: "EACSL",
        date: member.membershipDate || '',
        verified: true
    }));

    const experience = member.experience || [];
    const courses = member.courses || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <PageHero
                title={profile.name || "Member Profile"}
                subtitle={profile.title || "Professional Profile"}
                icon={<User className="w-12 h-12" />}
            />

            {/* Breadcrumb */}
            <Breadcrumbs items={[
                { label: 'Our Members', path: '/members-overview' },
                { label: profile.name || 'Member Profile' }
            ]} />

            {/* Profile Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="relative mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Profile Picture */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto md:mx-0">
                                    <ImagePlaceholder
                                        src={profile.image}
                                        alt={profile.name}
                                        name={profile.name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 justify-center md:justify-start mb-2 flex-wrap">
                                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                                {profile.name}
                                            </h1>
                                            {member.isActive !== false ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="text-xs font-semibold whitespace-nowrap">Active</span>
                                                    </div>
                                                    {profile.activeTill && (
                                                        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                            <Calendar className="w-4 h-4" />
                                                            <span className="text-xs font-semibold whitespace-nowrap">Till {profile.activeTill}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-xs font-semibold whitespace-nowrap">Inactive</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xl text-[#5A9B8E] font-semibold mb-4">
                                            {profile.title}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 justify-center md:justify-start">
                                            {profile.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-[#5A9B8E]" />
                                                    <span>{profile.location}</span>
                                                </div>
                                            )}
                                            {/* Removed duplicate "Active Till" badge here */}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                                    {profile.email && (
                                        <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#5A9B8E] transition-colors">
                                            <Mail className="w-4 h-4" />
                                            <span>{profile.email}</span>
                                        </a>
                                    )}
                                    {profile.phone && (
                                        <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#5A9B8E] transition-colors">
                                            <Phone className="w-4 h-4" />
                                            <span>{profile.phone}</span>
                                        </a>
                                    )}
                                    {profile.website && (
                                        <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#5A9B8E] transition-colors">
                                            <Globe className="w-4 h-4" />
                                            <span>{profile.website}</span>
                                        </a>
                                    )}
                                    {profile.linkedin && (
                                        <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#5A9B8E] transition-colors">
                                            <Linkedin className="w-4 h-4" />
                                            <span>LinkedIn</span>
                                        </a>
                                    )}
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
                            { id: 'certificates', label: 'Certificates', icon: Award },
                            { id: 'courses', label: 'Courses', icon: BookOpen }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors duration-200 border-b-2 ${activeTab === tab.id
                                        ? 'border-[#5A9B8E] text-[#5A9B8E]'
                                        : 'border-transparent text-gray-600 hover:text-[#5A9B8E]'
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
                                        <div className="w-2 h-2 rounded-full bg-[#5A9B8E] mt-2 flex-shrink-0"></div>
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
                            {experience.length === 0 ? (
                                <div className="text-center py-12">
                                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No experience information available</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {experience.map((job, index) => (
                                        <div key={index} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-0 last:pb-0">
                                            <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-[#5A9B8E] -ml-[9px] border-4 border-white"></div>
                                            <div className="bg-gray-50 rounded-lg p-5">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                                                <div className="flex items-center gap-2 text-[#5A9B8E] font-semibold mb-2">
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
                            )}
                        </div>
                    )}

                    {/* Certificates Section */}
                    {activeTab === 'certificates' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Certificates & Qualifications</h2>
                            {certificates.length === 0 ? (
                                <div className="text-center py-12">
                                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No certificates available</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {certificates.map((cert, index) => (
                                        <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <Award className="w-8 h-8 text-[#5A9B8E] flex-shrink-0" />
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
                            )}
                        </div>
                    )}

                    {/* Courses Section */}
                    {activeTab === 'courses' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">EACSL Courses & Training</h2>
                            {courses.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No courses information available</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {courses.map((course, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-[#5A9B8E] transition-colors duration-200">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <BookOpen className="w-4 h-4 text-[#5A9B8E]" />
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
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MemberProfile;
