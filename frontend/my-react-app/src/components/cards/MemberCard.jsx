import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Briefcase, X, Award, Calendar, Edit, Trash2, CheckCircle } from 'lucide-react';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import { getDisplayRole } from '../../utils/roleDisplay';

const MemberCard = ({
    image,
    name,
    role,
    displayRole: memberDisplayRole, // Public-facing role from database
    description,
    fullDescription,
    email,
    certificates,
    activeTill,
    isActive,
    phone,
    location,
    website,
    linkedin,
    onClick,
    onEdit,
    onDelete,
    isDashboard = false,
    compact = false,
    id
}) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Get display role
    // In Dashboard, show actual role (including Admin). On public pages, use displayRole field or mapped role.
    const displayRole = isDashboard ? role : getDisplayRole(role, memberDisplayRole);

    const handleCardClick = (e) => {
        // Don't trigger onClick if clicking edit/delete buttons
        if (e.target.closest('.dashboard-actions')) {
            return;
        }
        // In dashboard, never navigate - only call onClick if provided
        if (isDashboard) {
            if (onClick) {
                onClick();
            }
            return; // Never navigate in dashboard
        }
        // Outside dashboard, navigate to profile or call onClick
        if (onClick) {
            onClick();
        } else if (id) {
            // Navigate to member profile page
            navigate(`/member-profile/${id}`);
        }
    };

    // Compact version for overview page
    if (compact) {
        return (
            <div 
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 relative group cursor-pointer h-full"
                onClick={handleCardClick}
            >
                {/* Compact Card Layout */}
                <div className="p-3 h-full flex flex-col">
                    {/* Image and Basic Info */}
                    <div className="flex gap-3 mb-2">
                        {/* Small Image */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            <ImagePlaceholder
                                src={image}
                                alt={name}
                                name={name}
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                        
                        {/* Name and Role */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 mb-0.5 line-clamp-2 group-hover:text-[#5A9B8E] transition-colors leading-tight">
                                {name}
                            </h3>
                            <p className="text-xs text-[#5A9B8E] font-semibold line-clamp-1">
                                {displayRole}
                            </p>
                        </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="space-y-1 flex-1">
                        {/* Location */}
                        {location && (
                            <p className="text-xs text-gray-600 line-clamp-1 flex items-center gap-1">
                                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{location}</span>
                            </p>
                        )}
                        
                        {/* Email (truncated) */}
                        {email && (
                            <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{email}</span>
                            </p>
                        )}
                    </div>
                    
                    {/* Active Status - Bottom */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        {isActive !== false ? (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-medium">
                                <CheckCircle className="w-2.5 h-2.5" />
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
                                <CheckCircle className="w-2.5 h-2.5" />
                                Inactive
                            </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-medium">View →</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Vertical Member Card */}
            <div 
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 w-full md:max-w-xs border-2 border-gray-200 relative"
                onClick={handleCardClick}
                style={{ cursor: onClick ? 'pointer' : 'default' }}
            >
                {isDashboard && (
                    <div className="absolute top-2 right-2 z-10 dashboard-actions flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) {
                                    // Pass all member properties including isActive
                                    onEdit({ 
                                        id, 
                                        image, 
                                        name, 
                                        role, 
                                        description, 
                                        fullDescription, 
                                        email, 
                                        certificates, 
                                        activeTill,
                                        isActive,
                                        phone,
                                        location,
                                        website,
                                        linkedin
                                    });
                                }
                            }}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                            title="Edit Member"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onDelete && window.confirm(`Are you sure you want to delete "${name}"?`)) {
                                    onDelete(id);
                                }
                            }}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                            title="Delete Member"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
                {/* Member Image */}
                <div className="relative h-52 overflow-hidden">
                    <ImagePlaceholder
                        src={image}
                        alt={name}
                        name={name}
                        className="w-full h-full object-cover object-top"
                    />
                </div>

                {/* Card Content */}
                <div className="p-4">
                    {/* Role Tag and Active Status */}
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                        <span className="bg-[#5A9B8E] text-white px-2 py-1 text-[10px] font-semibold rounded inline-block max-w-[30%] truncate flex-shrink-0" title={displayRole}>
                            {displayRole}
                        </span>
                        {isActive !== false ? (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    <span className="text-xs font-semibold whitespace-nowrap">Active</span>
                                </div>
                                {activeTill && (
                                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-xs font-semibold whitespace-nowrap">Till {activeTill}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                <span className="text-xs font-semibold whitespace-nowrap">Inactive</span>
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
                        {name}
                    </h3>
                    
                    {/* Info */}
                    <div className="space-y-2 mb-3">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-[#5A9B8E] flex-shrink-0 mt-0.5" />
                            <a href={`mailto:${email}`} className="hover:text-[#5A9B8E] transition-colors line-clamp-1">
                                {email}
                            </a>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[4.5rem]">
                        {description || '\u00A0'}
                    </p>

                    {/* View More Button */}
                    <button
                        onClick={() => {
                            if (onClick) {
                                onClick();
                            } else if (id) {
                                navigate(`/member-profile/${id}`);
                            } else {
                                setIsModalOpen(true);
                            }
                        }}
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
                                    <ImagePlaceholder
                                        src={image}
                                        alt={name}
                                        name={name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex items-center gap-3 justify-center sm:justify-start mb-2 flex-wrap">
                                        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
                                        {activeTill && (
                                            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                </svg>
                                                <span className="text-xs font-semibold whitespace-nowrap">Active till {activeTill}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-lg font-semibold text-[#5A9B8E] mb-4">{displayRole}</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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