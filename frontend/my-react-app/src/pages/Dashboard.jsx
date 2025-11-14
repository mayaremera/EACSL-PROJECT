import React, { useState, useEffect } from "react";
import {
    BookOpen,
    Users,
    Settings,
    Plus,
    Search,
    RefreshCw,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Download,
    X
} from "lucide-react";
import { coursesManager, membersManager, initializeData } from '../utils/dataManager';
import CourseCard from '../components/cards/CourseCard';
import MemberCard from '../components/cards/MemberCard';
import CourseEditForm from '../components/dashboard/CourseEditForm';
import MemberEditForm from '../components/dashboard/MemberEditForm';

// Forms manager for member applications
const formsManager = {
    data: [],
    
    getAll() {
        const stored = localStorage.getItem('memberForms');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                // Ensure data is an array
                if (!Array.isArray(this.data)) {
                    this.data = [];
                }
            } catch (e) {
                console.error('Error parsing stored forms:', e);
                this.data = [];
            }
        } else {
            // Only generate mock data if localStorage is completely empty
            // This helps with initial testing, but real submissions will replace it
            this.data = [];
        }
        return this.data;
    },
    
    save() {
        localStorage.setItem('memberForms', JSON.stringify(this.data));
        window.dispatchEvent(new CustomEvent('formsUpdated', { detail: this.data }));
    },
    
    updateStatus(id, status, notes = '') {
        const form = this.data.find(f => f.id === id);
        if (form) {
            form.status = status;
            form.reviewNotes = notes;
            form.reviewedAt = new Date().toISOString();
            this.save();
        }
    },
    
    delete(id) {
        this.data = this.data.filter(f => f.id !== id);
        this.save();
    }
};

// Event registrations manager
const eventRegistrationsManager = {
    data: [],
    
    getAll() {
        const stored = localStorage.getItem('eventRegistrations');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                if (!Array.isArray(this.data)) {
                    this.data = [];
                }
            } catch (e) {
                console.error('Error parsing stored event registrations:', e);
                this.data = [];
            }
        } else {
            this.data = [];
        }
        return this.data;
    },
    
    save() {
        localStorage.setItem('eventRegistrations', JSON.stringify(this.data));
        window.dispatchEvent(new CustomEvent('eventRegistrationsUpdated', { detail: this.data }));
    },
    
    updateStatus(id, status, notes = '') {
        const registration = this.data.find(r => r.id === id);
        if (registration) {
            registration.status = status;
            registration.reviewNotes = notes;
            registration.reviewedAt = new Date().toISOString();
            this.save();
        }
    },
    
    delete(id) {
        this.data = this.data.filter(r => r.id !== id);
        this.save();
    }
};

// Contact forms manager
const contactFormsManager = {
    data: [],
    
    getAll() {
        const stored = localStorage.getItem('contactForms');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                if (!Array.isArray(this.data)) {
                    this.data = [];
                }
            } catch (e) {
                console.error('Error parsing stored contact forms:', e);
                this.data = [];
            }
        } else {
            this.data = [];
        }
        return this.data;
    },
    
    save() {
        localStorage.setItem('contactForms', JSON.stringify(this.data));
        window.dispatchEvent(new CustomEvent('contactFormsUpdated', { detail: this.data }));
    },
    
    updateStatus(id, status, notes = '') {
        const form = this.data.find(f => f.id === id);
        if (form) {
            form.status = status;
            form.reviewNotes = notes;
            form.reviewedAt = new Date().toISOString();
            this.save();
        }
    },
    
    delete(id) {
        this.data = this.data.filter(f => f.id !== id);
        this.save();
    }
};

// Form Details Modal Component
const FormDetailsModal = ({ form, onClose, onApprove, onReject }) => {
    const [reviewNotes, setReviewNotes] = useState(form.reviewNotes || '');

    const handleApprove = () => {
        onApprove(form.id, reviewNotes);
        onClose();
    };

    const handleReject = () => {
        onReject(form.id, reviewNotes);
        onClose();
    };

    // Function to download file from base64 data
    const handleDownload = (file, label) => {
        if (!file) {
            alert('File not available for download');
            return;
        }

        // Check if file has base64 data (new format) or just metadata (old format)
        if (!file.data) {
            alert('File data not available. This file was submitted before the download feature was added.');
            return;
        }

        try {
            // Convert base64 to blob
            const base64Data = file.data;
            // Handle both formats: with or without data URL prefix
            const base64String = base64Data.includes(',') 
                ? base64Data.split(',')[1] 
                : base64Data;
            
            const byteCharacters = atob(base64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Error downloading file. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Submitted on {new Date(form.submittedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">Status:</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            form.status === 'approved' ? 'bg-green-100 text-green-700' :
                            form.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                        </span>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Username</p>
                                <p className="text-gray-900 font-medium">{form.username}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <p className="text-gray-900 font-medium">{form.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Specialty */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialty</h3>
                        <div className="flex flex-wrap gap-2">
                            {form.specialty.map((spec, index) => (
                                <span key={index} className="px-4 py-2 bg-[#5A9B8E] text-white rounded-full text-sm">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Previous Work */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Work Experience</h3>
                        <p className="text-gray-700 leading-relaxed">{form.previousWork}</p>
                    </div>

                    {/* Uploaded Files */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                                const documents = [
                                    { label: 'Profile Image', file: form.profileImage },
                                    { label: 'ID Card', file: form.idImage },
                                    { label: 'Graduation Certificate', file: form.graduationCert },
                                    { label: 'CV', file: form.cv }
                                ];
                                const uploadedDocs = documents.filter(item => item.file);
                                const missingDocs = documents.filter(item => !item.file);
                                
                                return (
                                    <>
                                        {uploadedDocs.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-8 h-8 text-[#5A9B8E]" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {item.file.name} ({(item.file.size / 1024).toFixed(2)} KB)
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDownload(item.file, item.label)}
                                                    className="text-[#5A9B8E] hover:text-[#4A8B7E] transition-colors p-2 hover:bg-[#5A9B8E]/10 rounded-lg"
                                                    title="Download file"
                                                >
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        {missingDocs.length > 0 && (
                                            <div className="col-span-full text-sm text-gray-500 italic">
                                                Some documents were not uploaded with this application.
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Review Notes */}
                    {form.status !== 'pending' && form.reviewNotes && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Notes</h3>
                            <p className="text-gray-700 leading-relaxed">{form.reviewNotes}</p>
                            <p className="text-sm text-gray-500 mt-3">
                                Reviewed on {new Date(form.reviewedAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {/* Action Section (only for pending) */}
                    {form.status === 'pending' && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Action</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Review Notes (Optional)
                                    </label>
                                    <textarea
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Add notes about your decision..."
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none resize-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApprove}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        <CheckCircle size={20} />
                                        Approve Application
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        <XCircle size={20} />
                                        Reject Application
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Event Registration Details Modal Component
const EventRegistrationModal = ({ registration, onClose, onApprove, onReject }) => {
    const [reviewNotes, setReviewNotes] = useState(registration.reviewNotes || '');

    const handleApprove = () => {
        onApprove(registration.id, reviewNotes);
        onClose();
    };

    const handleReject = () => {
        onReject(registration.id, reviewNotes);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Event Registration Details</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Submitted on {new Date(registration.submittedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">Status:</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            registration.status === 'approved' ? 'bg-green-100 text-green-700' :
                            registration.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </span>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                                <p className="text-gray-900 font-medium">{registration.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <p className="text-gray-900 font-medium">{registration.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Phone</p>
                                <p className="text-gray-900 font-medium">{registration.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Organization</p>
                                <p className="text-gray-900 font-medium">{registration.organization || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Registration Details */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Membership Type</p>
                                <p className="text-gray-900 font-medium">
                                    {registration.membershipType === 'member' ? 'EACSL Member' : 'Guest'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Registration Fee</p>
                                <p className="text-gray-900 font-medium">{registration.registrationFee} EGP</p>
                            </div>
                        </div>
                    </div>

                    {/* Selected Tracks */}
                    {registration.selectedTracks && registration.selectedTracks.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Tracks</h3>
                            <div className="flex flex-wrap gap-2">
                                {registration.selectedTracks.map((track, index) => (
                                    <span key={index} className="px-4 py-2 bg-[#5A9B8E] text-white rounded-full text-sm">
                                        {track}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Special Requirements */}
                    {registration.specialRequirements && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
                            <p className="text-gray-700 leading-relaxed">{registration.specialRequirements}</p>
                        </div>
                    )}

                    {/* Review Notes */}
                    {registration.status !== 'pending' && registration.reviewNotes && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Notes</h3>
                            <p className="text-gray-700 leading-relaxed">{registration.reviewNotes}</p>
                            <p className="text-sm text-gray-500 mt-3">
                                Reviewed on {new Date(registration.reviewedAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {/* Action Section (only for pending) */}
                    {registration.status === 'pending' && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Action</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Review Notes (Optional)
                                    </label>
                                    <textarea
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Add notes about your decision..."
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none resize-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApprove}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        <CheckCircle size={20} />
                                        Approve Registration
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        <XCircle size={20} />
                                        Reject Registration
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Contact Form Details Modal Component
const ContactFormModal = ({ form, onClose, onApprove, onReject }) => {
    const [reviewNotes, setReviewNotes] = useState(form.reviewNotes || '');

    const handleApprove = () => {
        onApprove(form.id, reviewNotes);
        onClose();
    };

    const handleReject = () => {
        onReject(form.id, reviewNotes);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Contact Message Details</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Submitted on {new Date(form.submittedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">Status:</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            form.status === 'approved' ? 'bg-green-100 text-green-700' :
                            form.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                        </span>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Name</p>
                                <p className="text-gray-900 font-medium">{form.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <p className="text-gray-900 font-medium">{form.email}</p>
                            </div>
                            {form.phone && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                                    <p className="text-gray-900 font-medium">{form.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message Details */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Message</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Subject</p>
                                <p className="text-gray-900 font-medium">{form.subject}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Message</p>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{form.message}</p>
                            </div>
                        </div>
                    </div>

                    {/* Review Notes */}
                    {form.status !== 'pending' && form.reviewNotes && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Notes</h3>
                            <p className="text-gray-700 leading-relaxed">{form.reviewNotes}</p>
                            <p className="text-sm text-gray-500 mt-3">
                                Reviewed on {new Date(form.reviewedAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {/* Action Section (only for pending) */}
                    {form.status === 'pending' && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Action</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Review Notes (Optional)
                                    </label>
                                    <textarea
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Add notes about your decision..."
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none resize-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApprove}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        <CheckCircle size={20} />
                                        Mark as Resolved
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        <XCircle size={20} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

    const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("courses");
    const [courses, setCourses] = useState([]);
    const [members, setMembers] = useState([]);
    const [forms, setForms] = useState([]);
    const [eventRegistrations, setEventRegistrations] = useState([]);
    const [contactForms, setContactForms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [formSearchTerm, setFormSearchTerm] = useState("");
    const [eventSearchTerm, setEventSearchTerm] = useState("");
    const [contactSearchTerm, setContactSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [eventStatusFilter, setEventStatusFilter] = useState("all");
    const [contactStatusFilter, setContactStatusFilter] = useState("all");
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingMember, setEditingMember] = useState(null);
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [selectedEventRegistration, setSelectedEventRegistration] = useState(null);
    const [selectedContactForm, setSelectedContactForm] = useState(null);

    // Initialize data and load
    useEffect(() => {
        initializeData();
        loadCourses();
        loadMembers();
        loadForms();
        loadEventRegistrations();
        loadContactForms();

        // Listen for updates
        window.addEventListener('coursesUpdated', handleCoursesUpdate);
        window.addEventListener('membersUpdated', handleMembersUpdate);
        window.addEventListener('formsUpdated', handleFormsUpdate);
        window.addEventListener('eventRegistrationsUpdated', handleEventRegistrationsUpdate);
        window.addEventListener('contactFormsUpdated', handleContactFormsUpdate);

        return () => {
            window.removeEventListener('coursesUpdated', handleCoursesUpdate);
            window.removeEventListener('membersUpdated', handleMembersUpdate);
            window.removeEventListener('formsUpdated', handleFormsUpdate);
            window.removeEventListener('eventRegistrationsUpdated', handleEventRegistrationsUpdate);
            window.removeEventListener('contactFormsUpdated', handleContactFormsUpdate);
        };
    }, []);

    const handleCoursesUpdate = (e) => {
        setCourses(e.detail);
    };

    const handleMembersUpdate = (e) => {
        setMembers(e.detail);
    };

    const handleFormsUpdate = (e) => {
        setForms(e.detail);
    };

    const handleEventRegistrationsUpdate = (e) => {
        setEventRegistrations(e.detail);
    };

    const handleContactFormsUpdate = (e) => {
        setContactForms(e.detail);
    };

    const loadCourses = () => {
        const allCourses = coursesManager.getAll();
        setCourses(allCourses);
    };

    const loadMembers = () => {
        const allMembers = membersManager.getAll();
        setMembers(allMembers);
    };

    const loadForms = () => {
        const allForms = formsManager.getAll();
        setForms(allForms);
    };

    const loadEventRegistrations = () => {
        const allRegistrations = eventRegistrationsManager.getAll();
        setEventRegistrations(allRegistrations);
    };

    const loadContactForms = () => {
        const allContactForms = contactFormsManager.getAll();
        setContactForms(allContactForms);
    };

    const handleApproveForm = (id, notes) => {
        formsManager.updateStatus(id, 'approved', notes);
        loadForms();
    };

    const handleRejectForm = (id, notes) => {
        formsManager.updateStatus(id, 'rejected', notes);
        loadForms();
    };

    const handleDeleteForm = (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            formsManager.delete(id);
            loadForms();
        }
    };

    const handleApproveEventRegistration = (id, notes) => {
        eventRegistrationsManager.updateStatus(id, 'approved', notes);
        loadEventRegistrations();
    };

    const handleRejectEventRegistration = (id, notes) => {
        eventRegistrationsManager.updateStatus(id, 'rejected', notes);
        loadEventRegistrations();
    };

    const handleDeleteEventRegistration = (id) => {
        if (window.confirm('Are you sure you want to delete this event registration?')) {
            eventRegistrationsManager.delete(id);
            loadEventRegistrations();
        }
    };

    const handleApproveContactForm = (id, notes) => {
        contactFormsManager.updateStatus(id, 'approved', notes);
        loadContactForms();
    };

    const handleRejectContactForm = (id, notes) => {
        contactFormsManager.updateStatus(id, 'rejected', notes);
        loadContactForms();
    };

    const handleDeleteContactForm = (id) => {
        if (window.confirm('Are you sure you want to delete this contact message?')) {
            contactFormsManager.delete(id);
            loadContactForms();
        }
    };

    const handleSaveCourse = async (courseData) => {
        if (editingCourse) {
            coursesManager.update(editingCourse.id, courseData);
        } else {
            coursesManager.add(courseData);
        }
        loadCourses();
        setEditingCourse(null);
        setIsAddingCourse(false);
    };

    const handleDeleteCourse = (id) => {
        coursesManager.delete(id);
        loadCourses();
    };

    const handleSaveMember = async (memberData) => {
        if (editingMember) {
            membersManager.update(editingMember.id, memberData);
        } else {
            membersManager.add(memberData);
        }
        loadMembers();
        setEditingMember(null);
        setIsAddingMember(false);
    };

    const handleDeleteMember = (id) => {
        membersManager.delete(id);
        loadMembers();
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredForms = forms.filter(form => {
        const matchesSearch = 
            form.username.toLowerCase().includes(formSearchTerm.toLowerCase()) ||
            form.email.toLowerCase().includes(formSearchTerm.toLowerCase()) ||
            form.specialty.some(s => s.toLowerCase().includes(formSearchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const filteredEventRegistrations = eventRegistrations.filter(registration => {
        const matchesSearch = 
            registration.fullName.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
            registration.email.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
            registration.phone.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
            (registration.organization && registration.organization.toLowerCase().includes(eventSearchTerm.toLowerCase()));
        
        const matchesStatus = eventStatusFilter === 'all' || registration.status === eventStatusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const filteredContactForms = contactForms.filter(form => {
        const matchesSearch = 
            form.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
            form.email.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
            form.subject.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
            form.message.toLowerCase().includes(contactSearchTerm.toLowerCase());
        
        const matchesStatus = contactStatusFilter === 'all' || form.status === contactStatusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const menuItems = [
        { icon: BookOpen, label: "Courses", tab: "courses" },
        { icon: Users, label: "Members", tab: "members" },
        { icon: FileText, label: "Applications", tab: "applications" },
        { icon: Settings, label: "Settings", tab: "settings" },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg flex flex-col">
                {/* Logo/Header */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-[#4C9A8F]">EACSL Admin</h1>
                    <p className="text-sm text-gray-500 mt-1">Dashboard</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.tab;

                            return (
                                <li key={item.tab}>
                                    <button
                                        onClick={() => setActiveTab(item.tab)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                                ? "bg-teal-50 text-[#4C9A8F] font-medium"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <Icon
                                            size={20}
                                            className={isActive ? "text-[#4C9A8F]" : "text-gray-400"}
                                        />
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">AD</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">Admin</p>
                            <p className="text-xs text-gray-500">admin@eacsl.net</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {activeTab === 'courses' ? 'Courses Management' :
                                    activeTab === 'members' ? 'Members Management' :
                                    activeTab === 'applications' ? 'All Applications' :
                                        'Settings'}
                            </h1>
                            <p className="text-gray-600">
                                {activeTab === 'courses' ? 'Manage all courses on the website' :
                                    activeTab === 'members' ? 'Manage all members on the website' :
                                    activeTab === 'applications' ? 'Review and manage all form submissions' :
                                        'Dashboard settings and configuration'}
                            </p>
                        </div>
                        {activeTab === 'courses' && (
                            <button
                                onClick={() => setIsAddingCourse(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors shadow-md"
                            >
                                <Plus size={20} />
                                Add Course
                            </button>
                        )}
                        {activeTab === 'members' && (
                            <button
                                onClick={() => setIsAddingMember(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors shadow-md"
                            >
                                <Plus size={20} />
                                Add Member
                            </button>
                        )}
                    </div>

                    {/* Courses Tab */}
                    {activeTab === 'courses' && (
                        <div>
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Courses</p>
                                    <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Filtered Results</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredCourses.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <button
                                        onClick={loadCourses}
                                        className="flex items-center gap-2 text-sm text-[#4C9A8F] hover:text-[#3d8178]"
                                    >
                                        <RefreshCw size={16} />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>

                            {/* Courses Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        isDashboard={true}
                                        onEdit={setEditingCourse}
                                        onDelete={handleDeleteCourse}
                                    />
                                ))}
                            </div>

                            {filteredCourses.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-lg">
                                    <p className="text-gray-500">No courses found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div>
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Members</p>
                                    <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Filtered Results</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredMembers.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <button
                                        onClick={loadMembers}
                                        className="flex items-center gap-2 text-sm text-[#4C9A8F] hover:text-[#3d8178]"
                                    >
                                        <RefreshCw size={16} />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>

                            {/* Members Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredMembers.map((member) => (
                                    <MemberCard
                                        key={member.id}
                                        {...member}
                                        isDashboard={true}
                                        onEdit={setEditingMember}
                                        onDelete={handleDeleteMember}
                                    />
                                ))}
                            </div>

                            {filteredMembers.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-lg">
                                    <p className="text-gray-500">No members found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Applications Tab */}
                    {activeTab === 'applications' && (
                        <div className="space-y-8">
                            {/* Section 1: Member Applications */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Member Applications</h2>
                                    <div className="flex gap-2 text-sm">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Total: {forms.length}</span>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pending: {forms.filter(f => f.status === 'pending').length}</span>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search by name, email, or specialty..."
                                                value={formSearchTerm}
                                                onChange={(e) => setFormSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setStatusFilter(status)}
                                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                                        statusFilter === status
                                                            ? 'bg-[#4C9A8F] text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Applications Table */}
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialty</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredForms.map((form) => (
                                                    <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-gray-900">{form.username}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{form.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {form.specialty.map((spec, idx) => (
                                                                    <span key={idx} className="px-2 py-1 bg-[#5A9B8E]/10 text-[#5A9B8E] text-xs rounded-full">
                                                                        {spec.split(' ')[0]}...
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">
                                                                {new Date(form.submittedAt).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                                form.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                form.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {form.status === 'approved' && <CheckCircle size={14} />}
                                                                {form.status === 'rejected' && <XCircle size={14} />}
                                                                {form.status === 'pending' && <Clock size={14} />}
                                                                {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setSelectedForm(form)}
                                                                    className="p-2 text-[#4C9A8F] hover:bg-[#4C9A8F]/10 rounded-lg transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteForm(form.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredForms.length === 0 && (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No member applications found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Event Registrations */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Event Registrations</h2>
                                    <div className="flex gap-2 text-sm">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Total: {eventRegistrations.length}</span>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pending: {eventRegistrations.filter(r => r.status === 'pending').length}</span>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search by name, email, phone, or organization..."
                                                value={eventSearchTerm}
                                                onChange={(e) => setEventSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setEventStatusFilter(status)}
                                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                                        eventStatusFilter === status
                                                            ? 'bg-[#4C9A8F] text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Event Registrations Table */}
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Membership Type</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredEventRegistrations.map((registration) => (
                                                    <tr key={registration.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-gray-900">{registration.fullName}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{registration.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{registration.phone}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">
                                                                {registration.membershipType === 'member' ? 'Member' : 'Guest'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{registration.registrationFee} EGP</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                                registration.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                registration.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {registration.status === 'approved' && <CheckCircle size={14} />}
                                                                {registration.status === 'rejected' && <XCircle size={14} />}
                                                                {registration.status === 'pending' && <Clock size={14} />}
                                                                {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setSelectedEventRegistration(registration)}
                                                                    className="p-2 text-[#4C9A8F] hover:bg-[#4C9A8F]/10 rounded-lg transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteEventRegistration(registration.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredEventRegistrations.length === 0 && (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No event registrations found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 3: Contact Forms */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
                                    <div className="flex gap-2 text-sm">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Total: {contactForms.length}</span>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pending: {contactForms.filter(f => f.status === 'pending').length}</span>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search by name, email, subject, or message..."
                                                value={contactSearchTerm}
                                                onChange={(e) => setContactSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setContactStatusFilter(status)}
                                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                                        contactStatusFilter === status
                                                            ? 'bg-[#4C9A8F] text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Forms Table */}
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredContactForms.map((form) => (
                                                    <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-gray-900">{form.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{form.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900 max-w-xs truncate">{form.subject}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">
                                                                {new Date(form.submittedAt).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                                form.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                form.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {form.status === 'approved' && <CheckCircle size={14} />}
                                                                {form.status === 'rejected' && <XCircle size={14} />}
                                                                {form.status === 'pending' && <Clock size={14} />}
                                                                {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setSelectedContactForm(form)}
                                                                    className="p-2 text-[#4C9A8F] hover:bg-[#4C9A8F]/10 rounded-lg transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteContactForm(form.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredContactForms.length === 0 && (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No contact messages found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard Settings</h2>
                            <p className="text-gray-600">Settings and configuration options will be available here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Forms */}
            {editingCourse && (
                <CourseEditForm
                    course={editingCourse}
                    onSave={handleSaveCourse}
                    onCancel={() => setEditingCourse(null)}
                />
            )}

            {isAddingCourse && (
                <CourseEditForm
                    course={null}
                    onSave={handleSaveCourse}
                    onCancel={() => setIsAddingCourse(false)}
                />
            )}

            {editingMember && (
                <MemberEditForm
                    member={editingMember}
                    onSave={handleSaveMember}
                    onCancel={() => setEditingMember(null)}
                />
            )}

            {isAddingMember && (
                <MemberEditForm
                    member={null}
                    onSave={handleSaveMember}
                    onCancel={() => setIsAddingMember(false)}
                />
            )}

            {/* Form Details Modal */}
            {selectedForm && (
                <FormDetailsModal
                    form={selectedForm}
                    onClose={() => setSelectedForm(null)}
                    onApprove={handleApproveForm}
                    onReject={handleRejectForm}
                />
            )}

            {/* Event Registration Details Modal */}
            {selectedEventRegistration && (
                <EventRegistrationModal
                    registration={selectedEventRegistration}
                    onClose={() => setSelectedEventRegistration(null)}
                    onApprove={handleApproveEventRegistration}
                    onReject={handleRejectEventRegistration}
                />
            )}

            {/* Contact Form Details Modal */}
            {selectedContactForm && (
                <ContactFormModal
                    form={selectedContactForm}
                    onClose={() => setSelectedContactForm(null)}
                    onApprove={handleApproveContactForm}
                    onReject={handleRejectContactForm}
                />
            )}
        </div>
    );
};

export default Dashboard;
