import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
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
    X,
    Calendar,
    Edit,
    Trash2,
    Archive,
    Brain,
    MessageCircle,
    Baby,
    ClipboardList,
    Menu,
} from "lucide-react";
import { coursesManager, membersManager, eventsManager, articlesManager, therapyProgramsManager, forParentsManager, initializeData } from '../utils/dataManager';
import { supabase } from '../lib/supabase';
import { membershipFormsService } from '../services/membershipFormsService';
import { contactFormsService } from '../services/contactFormsService';
import { reservationsService } from '../services/reservationsService';
import CourseCard from '../components/cards/CourseCard';
import MemberCard from '../components/cards/MemberCard';
import CourseEditForm from '../components/dashboard/CourseEditForm';
import MemberEditForm from '../components/dashboard/MemberEditForm';
import EventEditForm from '../components/dashboard/EventEditForm';
import ArticleEditForm from '../components/dashboard/ArticleEditForm';
import TherapyProgramEditForm from '../components/dashboard/TherapyProgramEditForm';
import ForParentEditForm from '../components/dashboard/ForParentEditForm';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';

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
    
    // Map Supabase data to local format
    mapSupabaseToLocal(supabaseReg) {
        return {
            id: supabaseReg.id.toString(),
            type: 'eventRegistration',
            eventId: supabaseReg.event_id,
            fullName: supabaseReg.full_name,
            email: supabaseReg.email,
            phone: supabaseReg.phone,
            organization: supabaseReg.organization || '',
            membershipType: supabaseReg.membership_type,
            selectedTracks: supabaseReg.selected_tracks || [],
            specialRequirements: supabaseReg.special_requirements || '',
            registrationFee: parseFloat(supabaseReg.registration_fee),
            status: supabaseReg.status,
            submittedAt: supabaseReg.submitted_at,
            reviewedAt: supabaseReg.reviewed_at,
            reviewNotes: supabaseReg.review_notes || '',
            reviewedBy: supabaseReg.reviewed_by
        };
    },
    
    async getAll() {
        try {
            // Ensure supabase is available
            if (!supabase) {
                console.error('Supabase client is not available');
                return this.getAllFromLocalStorage();
            }
            
            // Try to fetch from Supabase first
            const { data, error } = await supabase
                .from('event_registrations')
                .select('*')
                .order('submitted_at', { ascending: false });

            if (error) {
                // If table doesn't exist, fall back to localStorage
                if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
                    console.warn('Event registrations table not found in Supabase. Using localStorage fallback.');
                    return this.getAllFromLocalStorage();
                }
                console.error('Error fetching event registrations from Supabase:', error);
                return this.getAllFromLocalStorage();
            }

            // Map Supabase data to local format
            this.data = data ? data.map(reg => this.mapSupabaseToLocal(reg)) : [];
            
            // Also sync to localStorage as backup
            try {
                localStorage.setItem('eventRegistrations', JSON.stringify(this.data));
            } catch (e) {
                console.warn('Could not save to localStorage backup:', e);
            }
            
            return this.data;
        } catch (err) {
            console.error('Exception fetching event registrations:', err);
            return this.getAllFromLocalStorage();
        }
    },
    
    getAllFromLocalStorage() {
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
    
    async updateStatus(id, status, notes = '') {
        try {
            // Ensure supabase is available
            if (!supabase) {
                console.error('Supabase client is not available');
                // Fall back to localStorage
                const registration = this.data.find(r => r.id === id);
                if (registration) {
                    registration.status = status;
                    registration.reviewNotes = notes;
                    registration.reviewedAt = new Date().toISOString();
                    this.save();
                }
                return;
            }
            
            // Update in Supabase
            const { error } = await supabase
                .from('event_registrations')
                .update({
                    status: status,
                    review_notes: notes || null,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', parseInt(id));

            if (error) {
                console.error('Error updating registration status in Supabase:', error);
                // Fall back to localStorage
                const registration = this.data.find(r => r.id === id);
                if (registration) {
                    registration.status = status;
                    registration.reviewNotes = notes;
                    registration.reviewedAt = new Date().toISOString();
                    this.save();
                }
            } else {
                // Update local data
                const registration = this.data.find(r => r.id === id);
                if (registration) {
                    registration.status = status;
                    registration.reviewNotes = notes;
                    registration.reviewedAt = new Date().toISOString();
                    this.save();
                }
                // Refresh from Supabase to get latest data
                await this.getAll();
                window.dispatchEvent(new CustomEvent('eventRegistrationsUpdated', { detail: this.data }));
            }
        } catch (err) {
            console.error('Exception updating registration status:', err);
            // Fall back to localStorage
            const registration = this.data.find(r => r.id === id);
            if (registration) {
                registration.status = status;
                registration.reviewNotes = notes;
                registration.reviewedAt = new Date().toISOString();
                this.save();
            }
        }
    },
    
    async delete(id) {
        try {
            // Ensure supabase is available
            if (!supabase) {
                console.error('Supabase client is not available');
                // Fall back to localStorage
                this.data = this.data.filter(r => r.id !== id);
                this.save();
                return;
            }
            
            // Delete from Supabase
            const { error } = await supabase
                .from('event_registrations')
                .delete()
                .eq('id', parseInt(id));

            if (error) {
                console.error('Error deleting registration from Supabase:', error);
                // Fall back to localStorage
                this.data = this.data.filter(r => r.id !== id);
                this.save();
            } else {
                // Update local data
                this.data = this.data.filter(r => r.id !== id);
                this.save();
                window.dispatchEvent(new CustomEvent('eventRegistrationsUpdated', { detail: this.data }));
            }
        } catch (err) {
            console.error('Exception deleting registration:', err);
            // Fall back to localStorage
            this.data = this.data.filter(r => r.id !== id);
            this.save();
        }
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
        // Handle both string and number IDs for compatibility
        const form = this.data.find(f => String(f.id) === String(id) || Number(f.id) === Number(id));
        if (form) {
            form.status = status;
            form.reviewNotes = notes;
            form.reviewedAt = new Date().toISOString();
            this.save();
        }
    },
    
    delete(id) {
        // Handle both string and number IDs for compatibility
        const idStr = String(id);
        const idNum = Number(id);
        this.data = this.data.filter(f => {
            const formIdStr = String(f.id);
            const formIdNum = Number(f.id);
            // Keep items that don't match (filter out the one that matches)
            return !(formIdStr === idStr || formIdNum === idNum || formIdStr === String(idNum) || formIdNum === Number(idStr));
        });
        this.save();
    }
};

// Reservations manager
const reservationsManager = {
    data: [],
    
    getAll() {
        const stored = localStorage.getItem('reservations');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                if (!Array.isArray(this.data)) {
                    this.data = [];
                }
            } catch (e) {
                console.error('Error parsing stored reservations:', e);
                this.data = [];
            }
        } else {
            this.data = [];
        }
        return this.data;
    },
    
    save() {
        localStorage.setItem('reservations', JSON.stringify(this.data));
        window.dispatchEvent(new CustomEvent('reservationsUpdated', { detail: this.data }));
    },
    
    updateStatus(id, status, notes = '') {
        const reservation = this.data.find(r => r.id === id);
        if (reservation) {
            reservation.status = status;
            reservation.reviewNotes = notes;
            reservation.reviewedAt = new Date().toISOString();
            this.save();
        }
    },
    
    delete(id) {
        this.data = this.data.filter(r => r.id !== id);
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

    // Function to download file from base64 data or Supabase Storage
    const handleDownload = async (file, label) => {
        if (!file) {
            alert('File not available for download');
            return;
        }

        try {
            // If file is in Supabase Storage, download from URL
            if (file.uploaded && file.url) {
                // Open in new tab or download
                const link = document.createElement('a');
                link.href = file.url;
                link.download = file.name;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }

            // If file has base64 data, convert and download
            if (file.data) {
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
                return;
            }

            // If file has storage path but no URL, try to get signed URL
            if (file.storagePath) {
                // Use the statically imported supabase instead of dynamic import
                if (!supabase) {
                    console.error('Supabase client is not available');
                    return;
                }
                const { data, error } = await supabase.storage
                    .from('MemberBucket')
                    .createSignedUrl(file.storagePath, 3600); // 1 hour expiry

                if (error) {
                    throw error;
                }

                if (data?.signedUrl) {
                    const link = document.createElement('a');
                    link.href = data.signedUrl;
                    link.download = file.name;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    return;
                }
            }

            alert('File data not available. This file was submitted before the download feature was added.');
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

// Reservation Details Modal Component
const ReservationModal = ({ reservation, onClose, onApprove, onReject }) => {
    const [reviewNotes, setReviewNotes] = useState(reservation.reviewNotes || '');

    const handleApprove = () => {
        onApprove(reservation.id, reviewNotes);
        onClose();
    };

    const handleReject = () => {
        onReject(reservation.id, reviewNotes);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reservation Details</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Submitted on {new Date(reservation.submittedAt).toLocaleDateString()}
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
                            reservation.status === 'approved' ? 'bg-green-100 text-green-700' :
                            reservation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Child's Name</p>
                                <p className="text-gray-900 font-medium">{reservation.kidsName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Parent/Guardian Name</p>
                                <p className="text-gray-900 font-medium">{reservation.yourName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                                <p className="text-gray-900 font-medium">{reservation.phoneNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Requested Assessments */}
                    {reservation.selectedAssessments && reservation.selectedAssessments.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requested Assessments</h3>
                            <div className="flex flex-wrap gap-2">
                                {reservation.selectedAssessments.map((assessment, index) => (
                                    <span key={index} className="px-4 py-2 bg-[#5A9B8E] text-white rounded-full text-sm">
                                        {assessment}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Concern/Description */}
                    {reservation.concern && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Child's Condition Description</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{reservation.concern}</p>
                        </div>
                    )}

                    {/* Review Notes */}
                    {reservation.status !== 'pending' && reservation.reviewNotes && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Notes</h3>
                            <p className="text-gray-700 leading-relaxed">{reservation.reviewNotes}</p>
                            <p className="text-sm text-gray-500 mt-3">
                                Reviewed on {new Date(reservation.reviewedAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {/* Action Section (only for pending) */}
                    {reservation.status === 'pending' && (
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
                                        Approve Reservation
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        <XCircle size={20} />
                                        Reject Reservation
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
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    
    // Get tab from URL, default to "courses"
    const getTabFromURL = () => {
        const tab = searchParams.get('tab');
        const validTabs = ['courses', 'members', 'events', 'articles', 'therapy-programs', 'for-parents', 'applications', 'settings'];
        return tab && validTabs.includes(tab) ? tab : 'courses';
    };
    
    const [activeTab, setActiveTab] = useState(getTabFromURL());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Update URL when tab changes (but don't push to history to avoid back button issues)
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        // Update URL without adding to history stack
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('tab', newTab);
        // Use replace to avoid adding to history
        window.history.replaceState({}, '', `${location.pathname}?${newSearchParams.toString()}`);
        // Close sidebar on mobile when tab changes
        setIsSidebarOpen(false);
    };
    
    // Set initial URL if no tab param exists (only on mount)
    useEffect(() => {
        if (!searchParams.get('tab')) {
            const newSearchParams = new URLSearchParams();
            newSearchParams.set('tab', activeTab);
            window.history.replaceState({}, '', `${location.pathname}?${newSearchParams.toString()}`);
        }
    }, []); // Only run on mount
    
    // Restore tab from URL when URL changes (e.g., browser back/forward or refresh)
    useEffect(() => {
        const tabFromURL = getTabFromURL();
        if (tabFromURL !== activeTab) {
            setActiveTab(tabFromURL);
        }
    }, [searchParams]);
    const [courses, setCourses] = useState([]);
    const [members, setMembers] = useState([]);
    const [forms, setForms] = useState([]);
    const [eventRegistrations, setEventRegistrations] = useState([]);
    const [contactForms, setContactForms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [formSearchTerm, setFormSearchTerm] = useState("");
    const [eventSearchTerm, setEventSearchTerm] = useState("");
    const [contactSearchTerm, setContactSearchTerm] = useState("");
    const [reservationSearchTerm, setReservationSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [eventStatusFilter, setEventStatusFilter] = useState("all");
    const [contactStatusFilter, setContactStatusFilter] = useState("all");
    const [reservationStatusFilter, setReservationStatusFilter] = useState("all");
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingMember, setEditingMember] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingArticle, setEditingArticle] = useState(null);
    const [editingTherapyProgram, setEditingTherapyProgram] = useState(null);
    const [editingForParent, setEditingForParent] = useState(null);
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [isAddingArticle, setIsAddingArticle] = useState(false);
    const [isAddingTherapyProgram, setIsAddingTherapyProgram] = useState(false);
    const [isAddingForParent, setIsAddingForParent] = useState(false);
    const [events, setEvents] = useState({ upcoming: [], past: [] });
    const [articles, setArticles] = useState([]);
    const [therapyPrograms, setTherapyPrograms] = useState([]);
    const [forParentsArticles, setForParentsArticles] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [selectedEventRegistration, setSelectedEventRegistration] = useState(null);
    const [selectedContactForm, setSelectedContactForm] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);

    // Initialize data and load
    useEffect(() => {
        initializeData();
        // loadCourses() is now async and fetches from Supabase first
        loadCourses().catch(err => {
            console.error('Failed to load courses:', err);
        });
        // loadMembers() is now async and fetches from Supabase first
        loadMembers().catch(err => {
            console.error('Failed to load members:', err);
        });
        loadForms();
        loadEventRegistrations();
        loadContactForms();
        // Load events after initialization (now async, fetches from Supabase first)
        setTimeout(() => {
            loadEvents().catch(err => {
                console.error('Failed to load events:', err);
            });
        }, 100);
        loadArticles().catch(err => {
            console.error('Failed to load articles:', err);
        });
        loadTherapyPrograms().catch(err => {
            console.error('Failed to load therapy programs:', err);
        });
        loadForParentsArticles().catch(err => {
            console.error('Failed to load for parents articles:', err);
        });
        
        // Set up real-time subscription for members
        const unsubscribeMembers = membersManager.subscribe((updatedMembers, payload) => {
            console.log('Real-time members update received:', payload.eventType);
            setMembers(updatedMembers);
        });
        
        // Set up real-time subscription for events
        const unsubscribeEvents = eventsManager.subscribe(async (updatedEvents, payload) => {
            console.log('Real-time events update received:', payload.eventType);
            setEvents(updatedEvents);
        });
        
        // Set up real-time subscription for courses
        const unsubscribeCourses = coursesManager.subscribe((updatedCourses, payload) => {
            console.log('Real-time courses update received:', payload.eventType);
            setCourses(updatedCourses);
        });
        
        // Set up real-time subscription for articles
        const unsubscribeArticles = articlesManager.subscribe(async (updatedArticles, payload) => {
            console.log('Real-time articles update received:', payload.eventType);
            setArticles(updatedArticles);
        });
        
        // Set up real-time subscription for therapy programs
        const unsubscribeTherapyPrograms = therapyProgramsManager.subscribe(async (updatedPrograms, payload) => {
            console.log('Real-time therapy programs update received:', payload.eventType);
            setTherapyPrograms(updatedPrograms);
        });
        
        // Set up real-time subscription for for parents articles
        const unsubscribeForParents = forParentsManager.subscribe(async (updatedArticles, payload) => {
            console.log('Real-time for parents articles update received:', payload.eventType);
            setForParentsArticles(updatedArticles);
        });

        // Sync event registrations from Supabase on initial load (silently fail if table doesn't exist)
        setTimeout(async () => {
            try {
                await loadEventRegistrations();
            } catch (err) {
                // Silently handle errors on initial load
                console.warn('Could not load event registrations on initial load:', err);
            }
        }, 600);
        
        // Cleanup subscriptions on unmount
        return () => {
            if (unsubscribeMembers) {
                unsubscribeMembers();
            }
            membersManager.unsubscribe();
            if (unsubscribeEvents) {
                unsubscribeEvents();
            }
            eventsManager.unsubscribe();
            if (unsubscribeCourses) {
                unsubscribeCourses();
            }
            coursesManager.unsubscribe();
            if (unsubscribeArticles) {
                unsubscribeArticles();
            }
            articlesManager.unsubscribe();
            if (unsubscribeTherapyPrograms) {
                unsubscribeTherapyPrograms();
            }
            therapyProgramsManager.unsubscribe();
            if (unsubscribeForParents) {
                unsubscribeForParents();
            }
            forParentsManager.unsubscribe();
        };
        loadReservations();

        // Listen for updates
        window.addEventListener('coursesUpdated', handleCoursesUpdate);
        window.addEventListener('membersUpdated', handleMembersUpdate);
        window.addEventListener('formsUpdated', handleFormsUpdate);
        window.addEventListener('eventRegistrationsUpdated', handleEventRegistrationsUpdate);
        window.addEventListener('contactFormsUpdated', handleContactFormsUpdate);
        window.addEventListener('reservationsUpdated', handleReservationsUpdate);
        window.addEventListener('eventsUpdated', handleEventsUpdate);
        window.addEventListener('articlesUpdated', handleArticlesUpdate);
        window.addEventListener('therapyProgramsUpdated', handleTherapyProgramsUpdate);
        window.addEventListener('forParentsUpdated', handleForParentsUpdate);

        return () => {
            window.removeEventListener('coursesUpdated', handleCoursesUpdate);
            window.removeEventListener('membersUpdated', handleMembersUpdate);
            window.removeEventListener('formsUpdated', handleFormsUpdate);
            window.removeEventListener('eventRegistrationsUpdated', handleEventRegistrationsUpdate);
            window.removeEventListener('contactFormsUpdated', handleContactFormsUpdate);
            window.removeEventListener('reservationsUpdated', handleReservationsUpdate);
            window.removeEventListener('eventsUpdated', handleEventsUpdate);
            window.removeEventListener('articlesUpdated', handleArticlesUpdate);
            window.removeEventListener('therapyProgramsUpdated', handleTherapyProgramsUpdate);
            window.removeEventListener('forParentsUpdated', handleForParentsUpdate);
        };
    }, []);

    // Reload events when switching to events tab
    useEffect(() => {
        if (activeTab === 'events') {
            loadEvents().catch(err => {
                console.error('Failed to load events:', err);
            });
        }
        if (activeTab === 'articles') {
            loadArticles().catch(err => {
                console.error('Failed to load articles:', err);
            });
        }
        if (activeTab === 'therapy-programs') {
            loadTherapyPrograms().catch(err => {
                console.error('Failed to load therapy programs:', err);
            });
        }
        if (activeTab === 'for-parents') {
            loadForParentsArticles().catch(err => {
                console.error('Failed to load for parents articles:', err);
            });
        }
        if (activeTab === 'applications') {
            loadForms();
            loadReservations();
        }
    }, [activeTab]);

    const handleCoursesUpdate = (e) => {
        setCourses(e.detail);
    };

    const handleMembersUpdate = (e) => {
        setMembers(e.detail);
        // If we're editing a member, refresh the editingMember with latest data
        if (editingMember && editingMember.id) {
            const updatedMember = e.detail.find(m => m.id === editingMember.id);
            if (updatedMember) {
                setEditingMember(updatedMember);
            }
        }
    };

    const handleFormsUpdate = (e) => {
        setForms(e.detail);
    };

    const handleEventRegistrationsUpdate = async (e) => {
        // If detail is provided, use it (for localStorage fallback)
        // Otherwise, refresh from Supabase
        if (e.detail) {
            setEventRegistrations(e.detail);
        } else {
            // Refresh from Supabase
            await loadEventRegistrations();
        }
    };

    const handleContactFormsUpdate = (e) => {
        setContactForms(e.detail);
    };

    const handleReservationsUpdate = (e) => {
        setReservations(e.detail);
    };

    const handleEventsUpdate = (e) => {
        console.log('Events updated event received:', e.detail);
        const eventsData = {
            upcoming: Array.isArray(e.detail.upcoming) ? e.detail.upcoming : [],
            past: Array.isArray(e.detail.past) ? e.detail.past : []
        };
        console.log('Setting events from update:', eventsData);
        setEvents(eventsData);
    };

    const handleArticlesUpdate = (e) => {
        setArticles(e.detail || []);
    };

    const handleTherapyProgramsUpdate = (e) => {
        setTherapyPrograms(e.detail || []);
    };

    const handleForParentsUpdate = (e) => {
        setForParentsArticles(e.detail || []);
    };

    const loadArticles = async () => {
        try {
            // getAll() is now async and fetches from Supabase first
            const allArticles = await articlesManager.getAll();
            setArticles(allArticles);
        } catch (error) {
            console.error('Error loading articles:', error);
            // Fallback to cached data
            const cachedArticles = articlesManager._getAllFromLocalStorage();
            setArticles(cachedArticles);
        }
    };

    const loadTherapyPrograms = async () => {
        try {
            // getAll() is now async and fetches from Supabase first
            const allPrograms = await therapyProgramsManager.getAll();
            setTherapyPrograms(allPrograms);
        } catch (error) {
            console.error('Error loading therapy programs:', error);
            // Fallback to cached data
            const cachedPrograms = therapyProgramsManager._getAllFromLocalStorage();
            setTherapyPrograms(cachedPrograms);
        }
    };

    const loadForParentsArticles = async () => {
        try {
            // getAll() is now async and fetches from Supabase first
            const allArticles = await forParentsManager.getAll();
            setForParentsArticles(allArticles);
        } catch (error) {
            console.error('Error loading for parents articles:', error);
            // Fallback to cached data
            const cachedArticles = forParentsManager._getAllFromLocalStorage();
            setForParentsArticles(cachedArticles);
        }
    };

    const loadCourses = async () => {
        try {
            // getAll() is now async and fetches from Supabase first
            const allCourses = await coursesManager.getAll();
            setCourses(allCourses);
        } catch (error) {
            console.error('Error loading courses:', error);
            // Fallback to cached data
            const cachedCourses = coursesManager._getAllFromLocalStorage();
            setCourses(cachedCourses);
        }
    };

    const loadMembers = async () => {
        try {
            // getAll() is now async and fetches from Supabase first
            const allMembers = await membersManager.getAll();
            setMembers(allMembers);
        } catch (error) {
            console.error('Error loading members:', error);
            // Fallback to cached data
            const cachedMembers = membersManager._getAllFromLocalStorage();
            setMembers(cachedMembers);
        }
    };

    const loadForms = async () => {
        // Try to load from Supabase first
        try {
            const result = await membershipFormsService.getAll();
            if (result.data && !result.error) {
                // Update localStorage for backward compatibility
                formsManager.data = result.data;
                formsManager.save();
                setForms(result.data);
                return;
            }
        } catch (error) {
            console.warn('Could not load forms from Supabase, using localStorage:', error);
        }
        
        // Fallback to localStorage
        const allForms = formsManager.getAll();
        setForms(allForms);
    };

    // Sync membership forms from Supabase
    const syncFormsFromSupabase = async () => {
        try {
            const result = await membershipFormsService.getAll();
            
            if (result.error) {
                if (result.error.code === 'TABLE_NOT_FOUND') {
                    alert(
                        '❌ Membership Forms Table Not Found\n\n' +
                        'The membership_forms table does not exist in Supabase.\n\n' +
                        'To fix this:\n' +
                        '1. Go to Supabase Dashboard → SQL Editor\n' +
                        '2. Run the SQL script from CREATE_MEMBERSHIP_FORMS_TABLE.sql\n' +
                        '3. Try syncing again\n\n' +
                        'See MEMBERSHIP_FORMS_SUPABASE_SETUP.md for detailed instructions.'
                    );
                    return;
                }
                alert(`Error syncing forms from Supabase: ${result.error.message || 'Unknown error'}`);
                return;
            }

            if (result.data && Array.isArray(result.data)) {
                // Update localStorage for backward compatibility
                formsManager.data = result.data;
                formsManager.save();
                setForms(result.data);
                alert(`✅ Successfully synced ${result.data.length} form(s) from Supabase!`);
            } else {
                setForms([]);
                alert('No forms found in Supabase.');
            }
        } catch (error) {
            console.error('Error syncing forms from Supabase:', error);
            alert(`Error syncing forms: ${error.message || 'Unknown error'}`);
        }
    };

    const loadEventRegistrations = async () => {
        try {
            const allRegistrations = await eventRegistrationsManager.getAll();
            setEventRegistrations(allRegistrations);
        } catch (error) {
            console.error('Error loading event registrations:', error);
            // Fallback to localStorage if async call fails
            const allRegistrations = eventRegistrationsManager.getAllFromLocalStorage();
            setEventRegistrations(allRegistrations);
        }
    };

    const [isSyncingEventRegistrations, setIsSyncingEventRegistrations] = useState(false);

    const handleSyncEventRegistrations = async () => {
        setIsSyncingEventRegistrations(true);
        try {
            await loadEventRegistrations();
            // Show success message
            alert('Event registrations synced successfully from Supabase!');
        } catch (error) {
            console.error('Error syncing event registrations:', error);
            alert('Failed to sync event registrations. Please check the console for details.');
        } finally {
            setIsSyncingEventRegistrations(false);
        }
    };

    const loadContactForms = async () => {
        // Try to load from Supabase first, fallback to localStorage
        try {
            const result = await contactFormsService.getAll();
            if (result.data && !result.error) {
                // Update localStorage for backward compatibility
                contactFormsManager.data = result.data;
                contactFormsManager.save();
                setContactForms(result.data);
            } else {
                // Fallback to localStorage if Supabase fails or table doesn't exist
                const allContactForms = contactFormsManager.getAll();
                setContactForms(allContactForms);
            }
        } catch (error) {
            console.warn('Error loading contact forms from Supabase, using localStorage:', error);
            // Fallback to localStorage
            const allContactForms = contactFormsManager.getAll();
            setContactForms(allContactForms);
        }
    };

    // Sync contact forms from Supabase
    const syncContactFormsFromSupabase = async () => {
        try {
            const result = await contactFormsService.getAll();
            
            if (result.error) {
                if (result.error.code === 'TABLE_NOT_FOUND') {
                    alert(
                        '❌ Contact Forms Table Not Found\n\n' +
                        'The contact_forms table does not exist in Supabase.\n\n' +
                        'To fix this:\n' +
                        '1. Go to Supabase Dashboard → SQL Editor\n' +
                        '2. Run the SQL script from CREATE_CONTACT_FORMS_TABLE.sql\n' +
                        '3. Try syncing again\n\n' +
                        'See CONTACT_FORMS_SUPABASE_SETUP.md for detailed instructions.'
                    );
                    return;
                }
                alert(`Error syncing contact forms from Supabase: ${result.error.message || 'Unknown error'}`);
                return;
            }

            if (result.data && Array.isArray(result.data)) {
                // Update localStorage for backward compatibility
                contactFormsManager.data = result.data;
                contactFormsManager.save();
                setContactForms(result.data);
                alert(`✅ Successfully synced ${result.data.length} contact form(s) from Supabase!`);
            } else {
                setContactForms([]);
                alert('No contact forms found in Supabase.');
            }
        } catch (error) {
            console.error('Error syncing contact forms from Supabase:', error);
            alert(`Error syncing contact forms: ${error.message || 'Unknown error'}`);
        }
    };

    const loadReservations = async () => {
        // Try to load from Supabase first
        try {
            const result = await reservationsService.getAll();
            if (result.data && !result.error) {
                // Update localStorage for backward compatibility
                reservationsManager.data = result.data;
                reservationsManager.save();
                setReservations(result.data);
                return;
            }
        } catch (error) {
            console.warn('Could not load reservations from Supabase, using localStorage:', error);
        }
        
        // Fallback to localStorage
        const allReservations = reservationsManager.getAll();
        setReservations(allReservations);
    };

    // Sync reservations from Supabase
    const syncReservationsFromSupabase = async () => {
        try {
            const result = await reservationsService.getAll();
            
            if (result.error) {
                if (result.error.code === 'TABLE_NOT_FOUND') {
                    alert(
                        '❌ Reservations Table Not Found\n\n' +
                        'The reservations table does not exist in Supabase.\n\n' +
                        'To fix this:\n' +
                        '1. Go to Supabase Dashboard → SQL Editor\n' +
                        '2. Run the SQL script from CREATE_RESERVATIONS_TABLE.sql\n' +
                        '3. Try syncing again\n\n' +
                        'See RESERVATIONS_SUPABASE_SETUP.md for detailed instructions.'
                    );
                    return;
                }
                alert(`Error syncing reservations from Supabase: ${result.error.message || 'Unknown error'}`);
                return;
            }

            if (result.data && Array.isArray(result.data)) {
                // Update localStorage for backward compatibility
                reservationsManager.data = result.data;
                reservationsManager.save();
                setReservations(result.data);
                alert(`✅ Successfully synced ${result.data.length} reservation(s) from Supabase!`);
            } else {
                setReservations([]);
                alert('No reservations found in Supabase.');
            }
        } catch (error) {
            console.error('Error syncing reservations from Supabase:', error);
            alert(`Error syncing reservations: ${error.message || 'Unknown error'}`);
        }
    };

    // Sync localStorage data TO Supabase (upload)
    const syncToSupabase = async () => {
        const results = {
            memberForms: { synced: 0, skipped: 0, errors: 0 },
            contactForms: { synced: 0, skipped: 0, errors: 0 },
            reservations: { synced: 0, skipped: 0, errors: 0 },
            eventRegistrations: { synced: 0, skipped: 0, errors: 0 }
        };

        try {
            // 1. Sync Member Forms
            const localMemberForms = formsManager.getAll();
            if (localMemberForms.length > 0) {
                // Get existing forms from Supabase to check for duplicates
                const existingFormsResult = await membershipFormsService.getAll();
                const existingEmails = new Set();
                if (existingFormsResult.data && !existingFormsResult.error) {
                    existingFormsResult.data.forEach(form => {
                        if (form.email) existingEmails.add(form.email.toLowerCase());
                    });
                }

                for (const form of localMemberForms) {
                    try {
                        // Check if form already exists (by email)
                        if (form.email && existingEmails.has(form.email.toLowerCase())) {
                            results.memberForms.skipped++;
                            continue;
                        }

                        // Check if form has Supabase ID (already synced)
                        if (form.id && !isNaN(parseInt(form.id)) && parseInt(form.id) > 1000) {
                            // Likely a Supabase ID, skip
                            results.memberForms.skipped++;
                            continue;
                        }

                        const result = await membershipFormsService.add(form);
                        if (result.error) {
                            if (result.error.code === 'DUPLICATE_EMAIL' || result.error.code === '23505') {
                                results.memberForms.skipped++;
                            } else {
                                results.memberForms.errors++;
                                console.error('Error syncing member form:', result.error);
                            }
                        } else {
                            results.memberForms.synced++;
                        }
                    } catch (error) {
                        results.memberForms.errors++;
                        console.error('Error syncing member form:', error);
                    }
                }
            }

            // 2. Sync Contact Forms
            const localContactForms = contactFormsManager.getAll();
            if (localContactForms.length > 0) {
                // Get existing forms from Supabase to check for duplicates
                const existingFormsResult = await contactFormsService.getAll();
                const existingEmails = new Set();
                if (existingFormsResult.data && !existingFormsResult.error) {
                    existingFormsResult.data.forEach(form => {
                        if (form.email) existingEmails.add(form.email.toLowerCase());
                    });
                }

                for (const form of localContactForms) {
                    try {
                        // Check if form already exists (by email and subject)
                        const key = `${form.email?.toLowerCase()}_${form.subject}`;
                        if (form.email && existingEmails.has(form.email.toLowerCase())) {
                            // Check if same subject exists
                            const existing = existingFormsResult.data?.find(
                                f => f.email?.toLowerCase() === form.email?.toLowerCase() && 
                                f.subject === form.subject
                            );
                            if (existing) {
                                results.contactForms.skipped++;
                                continue;
                            }
                        }

                        // Check if form has Supabase ID (already synced)
                        if (form.id && !isNaN(parseInt(form.id)) && parseInt(form.id) > 1000) {
                            results.contactForms.skipped++;
                            continue;
                        }

                        const result = await contactFormsService.add(form);
                        if (result.error) {
                            results.contactForms.errors++;
                            console.error('Error syncing contact form:', result.error);
                        } else {
                            results.contactForms.synced++;
                        }
                    } catch (error) {
                        results.contactForms.errors++;
                        console.error('Error syncing contact form:', error);
                    }
                }
            }

            // 3. Sync Reservations
            const localReservations = reservationsManager.getAll();
            if (localReservations.length > 0) {
                // Get existing reservations from Supabase to check for duplicates
                const existingReservationsResult = await reservationsService.getAll();
                const existingKeys = new Set();
                if (existingReservationsResult.data && !existingReservationsResult.error) {
                    existingReservationsResult.data.forEach(res => {
                        const key = `${res.phoneNumber}_${res.yourName}_${res.submittedAt}`;
                        existingKeys.add(key);
                    });
                }

                for (const reservation of localReservations) {
                    try {
                        // Check if reservation already exists
                        const key = `${reservation.phoneNumber}_${reservation.yourName}_${reservation.submittedAt}`;
                        if (existingKeys.has(key)) {
                            results.reservations.skipped++;
                            continue;
                        }

                        // Check if reservation has Supabase ID (already synced)
                        if (reservation.id && !isNaN(parseInt(reservation.id)) && parseInt(reservation.id) > 1000) {
                            results.reservations.skipped++;
                            continue;
                        }

                        const result = await reservationsService.add(reservation);
                        if (result.error) {
                            results.reservations.errors++;
                            console.error('Error syncing reservation:', result.error);
                        } else {
                            results.reservations.synced++;
                        }
                    } catch (error) {
                        results.reservations.errors++;
                        console.error('Error syncing reservation:', error);
                    }
                }
            }

            // 4. Sync Event Registrations
            const localEventRegistrations = eventRegistrationsManager.getAllFromLocalStorage();
            if (localEventRegistrations.length > 0) {
                // Get existing registrations from Supabase to check for duplicates
                let existingRegistrations = [];
                try {
                    const { data, error } = await supabase
                        .from('event_registrations')
                        .select('*');
                    if (!error && data) {
                        existingRegistrations = data;
                    }
                } catch (err) {
                    console.warn('Could not fetch existing event registrations:', err);
                }

                const existingEmails = new Set();
                existingRegistrations.forEach(reg => {
                    if (reg.email) existingEmails.add(reg.email.toLowerCase());
                });

                for (const registration of localEventRegistrations) {
                    try {
                        // Check if registration already exists (by email)
                        if (registration.email && existingEmails.has(registration.email.toLowerCase())) {
                            results.eventRegistrations.skipped++;
                            continue;
                        }

                        // Check if registration has Supabase ID (already synced)
                        if (registration.id && !isNaN(parseInt(registration.id)) && parseInt(registration.id) > 1000) {
                            results.eventRegistrations.skipped++;
                            continue;
                        }

                        // Map local format to Supabase format
                        const supabaseReg = {
                            event_id: registration.eventId || null,
                            full_name: registration.fullName,
                            email: registration.email,
                            phone: registration.phone,
                            organization: registration.organization || null,
                            membership_type: registration.membershipType,
                            selected_tracks: Array.isArray(registration.selectedTracks) ? registration.selectedTracks : [],
                            special_requirements: registration.specialRequirements || null,
                            registration_fee: registration.registrationFee || 0,
                            status: registration.status || 'pending',
                            submitted_at: registration.submittedAt || new Date().toISOString(),
                            reviewed_at: registration.reviewedAt || null,
                            reviewed_by: registration.reviewedBy || null,
                            review_notes: registration.reviewNotes || null
                        };

                        const { error } = await supabase
                            .from('event_registrations')
                            .insert([supabaseReg]);

                        if (error) {
                            if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
                                alert('Event registrations table not found in Supabase. Please create it first.');
                                break;
                            }
                            results.eventRegistrations.errors++;
                            console.error('Error syncing event registration:', error);
                        } else {
                            results.eventRegistrations.synced++;
                        }
                    } catch (error) {
                        results.eventRegistrations.errors++;
                        console.error('Error syncing event registration:', error);
                    }
                }
            }

            // Show summary
            const totalSynced = results.memberForms.synced + results.contactForms.synced + 
                              results.reservations.synced + results.eventRegistrations.synced;
            const totalSkipped = results.memberForms.skipped + results.contactForms.skipped + 
                               results.reservations.skipped + results.eventRegistrations.skipped;
            const totalErrors = results.memberForms.errors + results.contactForms.errors + 
                              results.reservations.errors + results.eventRegistrations.errors;

            let message = '✅ Sync to Supabase Complete!\n\n';
            message += `📤 Synced: ${totalSynced} item(s)\n`;
            message += `⏭️ Skipped (already exists): ${totalSkipped} item(s)\n`;
            if (totalErrors > 0) {
                message += `❌ Errors: ${totalErrors} item(s)\n`;
            }
            message += '\nDetails:\n';
            message += `• Member Forms: ${results.memberForms.synced} synced, ${results.memberForms.skipped} skipped, ${results.memberForms.errors} errors\n`;
            message += `• Contact Forms: ${results.contactForms.synced} synced, ${results.contactForms.skipped} skipped, ${results.contactForms.errors} errors\n`;
            message += `• Reservations: ${results.reservations.synced} synced, ${results.reservations.skipped} skipped, ${results.reservations.errors} errors\n`;
            message += `• Event Registrations: ${results.eventRegistrations.synced} synced, ${results.eventRegistrations.skipped} skipped, ${results.eventRegistrations.errors} errors`;

            alert(message);

            // Refresh data from Supabase after sync
            await loadForms();
            await loadContactForms();
            await loadReservations();
            await loadEventRegistrations();

        } catch (error) {
            console.error('Error syncing to Supabase:', error);
            alert(`Error syncing to Supabase: ${error.message || 'Unknown error'}`);
        }
    };

    const loadEvents = async () => {
        try {
            // getAll() is now async and fetches from Supabase first
            const allEvents = await eventsManager.getAll();
            // Ensure we have the correct structure
            const eventsData = {
                upcoming: Array.isArray(allEvents.upcoming) ? allEvents.upcoming : [],
                past: Array.isArray(allEvents.past) ? allEvents.past : []
            };
            
            console.log('✅ Loaded events from Supabase:', {
                upcoming: eventsData.upcoming.length,
                past: eventsData.past.length
            });
            
            setEvents(eventsData);
        } catch (error) {
            console.error('Error loading events:', error);
            // Fallback to cached data
            const cachedEvents = eventsManager._getAllFromLocalStorage();
            const eventsData = {
                upcoming: Array.isArray(cachedEvents.upcoming) ? cachedEvents.upcoming : [],
                past: Array.isArray(cachedEvents.past) ? cachedEvents.past : []
            };
            setEvents(eventsData);
        }
    };

    const handleApproveForm = async (id, notes) => {
        // Get the form data - try Supabase first, fallback to localStorage
        let form = null;
        try {
            const result = await membershipFormsService.getById(parseInt(id));
            if (result.data) {
                form = result.data;
            }
        } catch (error) {
            console.warn('Could not fetch form from Supabase, trying localStorage:', error);
        }

        // Fallback to localStorage if Supabase fails
        if (!form) {
            form = formsManager.getAll().find(f => f.id === id || f.id === id.toString());
        }

        if (!form) {
            alert('Form not found');
            return;
        }

        // Validate email before proceeding
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email || !emailRegex.test(form.email)) {
            alert('Invalid email address in the application. Please check the email before approving.');
            return;
        }

        // Confirm approval
        const confirmApprove = window.confirm(
            `Approve this application?\n\n` +
            `This will create TWO accounts:\n\n` +
            `1. Authentication Account:\n` +
            `   - For login capability\n` +
            `   - Regular member (not admin)\n` +
            `   - Appears in Authentication tab\n` +
            `   - Confirmation email sent automatically\n\n` +
            `2. Member Account:\n` +
            `   - Profile information\n` +
            `   - Linked to auth account\n` +
            `   - Appears in Members tab\n` +
            `   - Status: PENDING until email confirmed\n\n` +
            `After email confirmation:\n` +
            `- Member can log in to view their profile\n` +
            `- Member status becomes ACTIVE\n\n` +
            `Continue?`
        );

        if (!confirmApprove) {
            return;
        }

        try {
            // Import the approval service
            const { memberApprovalService } = await import('../services/memberApprovalService');
            
            // Approve the application (creates account and member)
            const result = await memberApprovalService.approveApplication(form);

            if (result.success) {
                // Update form status in Supabase
                try {
                    await membershipFormsService.updateStatus(parseInt(id), 'approved', notes);
                } catch (error) {
                    console.warn('Could not update form status in Supabase, updating localStorage:', error);
                formsManager.updateStatus(id, 'approved', notes);
                }
                
                loadForms();
                loadMembers(); // Refresh members list

                // Show detailed message from service (includes member ID and status)
                alert(result.message || 
                    `✅ Application Approved Successfully!\n\n` +
                    `Member: ${form.username} (${form.email})\n` +
                    `Member ID: ${result.memberId || 'N/A'}\n\n` +
                    `✅ Member added to Members table\n` +
                    `✅ Authentication account created (for login)\n` +
                    `✅ Confirmation email sent\n\n` +
                    `The member can now log in and access their profile.`
                );
            } else {
                alert(`❌ Failed to approve application:\n\n${result.error}\n\nPlease try again or contact support.`);
            }
        } catch (error) {
            console.error('Error approving application:', error);
            alert(`❌ Error approving application:\n\n${error.message}\n\nPlease try again.`);
        }
    };

    const handleRejectForm = async (id, notes) => {
        try {
            // Update in Supabase
            await membershipFormsService.updateStatus(parseInt(id), 'rejected', notes);
            loadForms();
        } catch (error) {
            console.warn('Could not update form status in Supabase, updating localStorage:', error);
        formsManager.updateStatus(id, 'rejected', notes);
        loadForms();
        }
    };

    const handleDeleteForm = async (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                // Delete from Supabase
                await membershipFormsService.delete(parseInt(id));
                loadForms();
            } catch (error) {
                console.warn('Could not delete form from Supabase, deleting from localStorage:', error);
            formsManager.delete(id);
            loadForms();
            }
        }
    };

    const handleApproveEventRegistration = async (id, notes) => {
        await eventRegistrationsManager.updateStatus(id, 'approved', notes);
        await loadEventRegistrations();
    };

    const handleRejectEventRegistration = async (id, notes) => {
        await eventRegistrationsManager.updateStatus(id, 'rejected', notes);
        await loadEventRegistrations();
    };

    const handleDeleteEventRegistration = async (id) => {
        if (window.confirm('Are you sure you want to delete this event registration?')) {
            await eventRegistrationsManager.delete(id);
            await loadEventRegistrations();
        }
    };

    const handleApproveContactForm = async (id, notes) => {
        try {
            // Update in Supabase
            await contactFormsService.updateStatus(parseInt(id), 'approved', notes);
            loadContactForms();
        } catch (error) {
            console.warn('Could not update contact form status in Supabase, updating localStorage:', error);
        contactFormsManager.updateStatus(id, 'approved', notes);
        loadContactForms();
        }
    };

    const handleRejectContactForm = async (id, notes) => {
        try {
            // Update in Supabase
            await contactFormsService.updateStatus(parseInt(id), 'rejected', notes);
            loadContactForms();
        } catch (error) {
            console.warn('Could not update contact form status in Supabase, updating localStorage:', error);
        contactFormsManager.updateStatus(id, 'rejected', notes);
        loadContactForms();
        }
    };

    const handleDeleteContactForm = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact message?')) {
            try {
                // Convert ID to number for Supabase (it expects integer)
                const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
                
                // Delete from Supabase
                const result = await contactFormsService.delete(numericId);
                
                if (result.error) {
                    // If Supabase delete failed, try localStorage as fallback
                    console.warn('Could not delete contact form from Supabase, deleting from localStorage:', result.error);
                    contactFormsManager.delete(id.toString()); // Ensure string for localStorage
                } else {
                    // Successfully deleted from Supabase, also remove from localStorage
                    console.log('✅ Successfully deleted contact form from Supabase');
                    contactFormsManager.delete(id.toString()); // Ensure string for localStorage
                }
                
                // Reload contact forms to reflect changes (will reload from Supabase)
                await loadContactForms();
            } catch (error) {
                console.error('Exception deleting contact form:', error);
                // Fallback to localStorage
                contactFormsManager.delete(id.toString());
                await loadContactForms();
            }
        }
    };

    const handleApproveReservation = async (id, notes) => {
        try {
            // Update in Supabase
            await reservationsService.updateStatus(parseInt(id), 'approved', notes);
            loadReservations();
        } catch (error) {
            console.warn('Could not update reservation status in Supabase, updating localStorage:', error);
            reservationsManager.updateStatus(id, 'approved', notes);
            loadReservations();
        }
    };

    const handleRejectReservation = async (id, notes) => {
        try {
            // Update in Supabase
            await reservationsService.updateStatus(parseInt(id), 'rejected', notes);
            loadReservations();
        } catch (error) {
            console.warn('Could not update reservation status in Supabase, updating localStorage:', error);
            reservationsManager.updateStatus(id, 'rejected', notes);
            loadReservations();
        }
    };

    const handleDeleteReservation = async (id) => {
        if (window.confirm('Are you sure you want to delete this reservation?')) {
            try {
                // Delete from Supabase
                await reservationsService.delete(parseInt(id));
                loadReservations();
            } catch (error) {
                console.warn('Could not delete reservation from Supabase, deleting from localStorage:', error);
                reservationsManager.delete(id);
                loadReservations();
            }
        }
    };

    const handleSaveCourse = async (courseData) => {
        try {
            if (editingCourse) {
                await coursesManager.update(editingCourse.id, courseData);
            } else {
                await coursesManager.add(courseData);
            }
            await loadCourses();
            setEditingCourse(null);
            setIsAddingCourse(false);
        } catch (error) {
            console.error('Error saving course:', error);
            alert(
                `Failed to save course: ${error.message || 'Unknown error'}\n\n` +
                'Please check the console for more details and try again.'
            );
            // Re-throw so the form can handle it (it will clear loading state in finally block)
            throw error;
        }
    };

    const handleDeleteCourse = async (id) => {
        try {
            await coursesManager.delete(id);
            await loadCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const handleSaveMember = async (memberData) => {
        console.log('handleSaveMember called with:', memberData);
        console.log('Editing member:', editingMember);
        
        const { createAuthAccount, ...memberDataWithoutFlag } = memberData;
        
        try {
            if (editingMember) {
                console.log('Updating member with ID:', editingMember.id);
                console.log('Update data:', memberDataWithoutFlag);
                const result = await membersManager.update(editingMember.id, memberDataWithoutFlag);
                console.log('Update result:', result);
                
                // Reload members to ensure UI updates (getAll is now async)
                await loadMembers();
                
                alert('✅ Member updated successfully!');
            } else {
                // Add the member first
                const createdMember = await membersManager.add(memberDataWithoutFlag);
                console.log('Member created:', createdMember);
                
                // If createAuthAccount is checked, create auth account and send password email
                if (createAuthAccount && memberData.email) {
                    try {
                        const { memberAuthService } = await import('../services/memberAuthService');
                        const result = await memberAuthService.createAuthAccountAndSendPasswordEmail(
                            memberData.email,
                            memberData.name
                        );
                        
                        if (result.success && result.userId) {
                            // Link the auth account to the member
                            const updatedMember = {
                                ...createdMember,
                                supabaseUserId: result.userId
                            };
                            await membersManager.update(createdMember.id, updatedMember);
                            
                            // Reload members to ensure UI updates
                            await loadMembers();
                            
                            // Show success message
                            alert(`✅ Member created successfully!\n\n${result.message || 'Authentication account created and password setup email sent.'}`);
                        } else if (result.success && result.warning) {
                            // Account created but email failed
                            await loadMembers();
                            alert(`✅ Member created successfully!\n\n⚠️ ${result.warning}`);
                        } else {
                            // Auth account creation failed
                            await loadMembers();
                            alert(`✅ Member created successfully!\n\n⚠️ Failed to create authentication account: ${result.error || 'Unknown error'}\n\nThe member can still use "Forgot Password" to set up their account later.`);
                        }
                    } catch (error) {
                        console.error('Error creating auth account:', error);
                        await loadMembers();
                        alert(`✅ Member created successfully!\n\n⚠️ Failed to create authentication account. The member can use "Forgot Password" to set up their account later.`);
                    }
                } else {
                    // Reload members to ensure UI updates
                    await loadMembers();
                    alert('✅ Member created successfully!');
                }
            }
        } catch (error) {
            console.error('Error saving member:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`❌ Failed to save member: ${errorMessage}\n\nPlease check your connection and try again.`);
            return;
        }
        
        // Dispatch event to update all listeners
        try {
            const allMembers = await membersManager.getAll();
            window.dispatchEvent(new CustomEvent('membersUpdated', { detail: allMembers }));
        } catch (err) {
            console.warn('Could not dispatch membersUpdated event:', err);
        }
        
        setEditingMember(null);
        setIsAddingMember(false);
    };

    const handleDeleteMember = async (id) => {
        if (window.confirm('Are you sure you want to delete this member? This will also remove them from Supabase.')) {
            try {
                await membersManager.delete(id);
                await loadMembers();
                alert('✅ Member deleted successfully!');
            } catch (error) {
                console.error('Error deleting member:', error);
                const errorMessage = error.message || 'Unknown error occurred';
                alert(`❌ Failed to delete member: ${errorMessage}\n\nPlease check your connection and try again.`);
            }
        }
    };

    const handleSyncMembers = async () => {
        try {
            // First, try to sync from Supabase (download) - force sync to bypass cooldown
            const result = await membersManager.syncFromSupabase({ force: true });
            
            // Check if sync was skipped due to cooldown
            if (result.skipped) {
                const secondsLeft = Math.ceil((result.nextAllowedIn || 0) / 1000);
                alert(`⏱️ Sync is on cooldown. Please wait ${secondsLeft} second(s) before syncing again.`);
                return;
            }
            
            if (result.synced) {
                // Reload members to reflect changes
                loadMembers();
                
                // Show detailed sync results
                let message = `✅ Successfully synced from Supabase!\n\n`;
                message += `📊 Supabase members: ${result.count}\n`;
                message += `💾 Local members before: ${result.localCount || 'N/A'}\n`;
                // Get count from cache (synchronous access)
                const afterCount = membersManager._getAllFromLocalStorage().length;
                message += `💾 Local members after: ${afterCount}\n`;
                
                if (result.removed > 0) {
                    message += `\n🗑️ Removed ${result.removed} deleted member(s) from local storage.`;
                }
                
                if (result.count > 0) {
                    alert(message);
                } else {
                    // If no members in Supabase, offer to push local members
                    const localMembers = membersManager._getAllFromLocalStorage();
                    if (localMembers.length > 0) {
                        const pushToSupabase = window.confirm(
                            `${message}\n\nNo members found in Supabase. Would you like to upload ${localMembers.length} local member(s) to Supabase?`
                        );
                        if (pushToSupabase) {
                            const pushResult = await membersManager.syncToSupabase();
                            if (pushResult.synced) {
                                loadMembers();
                                alert(`Successfully uploaded ${pushResult.syncedCount} member(s) to Supabase!`);
                            } else {
                                alert(`Failed to upload members: ${pushResult.error?.message || 'Unknown error'}`);
                            }
                        }
                    } else {
                        alert(message + '\n\nNo members found locally either.');
                    }
                }
            } else {
                // Handle errors
                const errorMessage = result.error?.userMessage || result.error?.message || 'Failed to sync members from Supabase.';
                alert(`${errorMessage}\n\nCheck SUPABASE_SETUP.md for instructions on creating the members table.`);
            }
        } catch (err) {
            console.error('Error syncing members:', err);
            alert(`An unexpected error occurred while syncing: ${err.message || 'Unknown error'}`);
        }
    };

    const handleSyncCourses = async () => {
        // First, try to sync from Supabase (download)
        const result = await coursesManager.syncFromSupabase();
        if (result.synced) {
            // Reload courses to reflect changes
            await loadCourses();
            
            // Show detailed sync results
            let message = `✅ Successfully synced from Supabase!\n\n`;
            message += `📊 Supabase courses: ${result.count}\n`;
            
            if (result.count > 0) {
                alert(message);
            } else {
                // If no courses in Supabase, offer to push local courses
                const localCourses = coursesManager._getAllFromLocalStorage();
                if (localCourses.length > 0) {
                    const pushToSupabase = window.confirm(
                        `${message}\n\nNo courses found in Supabase. Would you like to upload ${localCourses.length} local course(s) to Supabase?`
                    );
                    if (pushToSupabase) {
                        const pushResult = await coursesManager.syncToSupabase();
                        if (pushResult.synced) {
                            alert(`✅ Successfully uploaded ${pushResult.syncedCount} course(s) to Supabase!`);
                            await loadCourses();
                        } else {
                            alert(`❌ Failed to upload courses: ${pushResult.error?.message || 'Unknown error'}`);
                        }
                    }
                } else {
                    alert(message);
                }
            }
        } else {
            alert(`❌ Failed to sync courses: ${result.error?.message || 'Unknown error'}`);
        }
    };

    const handleSyncEvents = async () => {
        // First, try to sync from Supabase (download)
        const result = await eventsManager.syncFromSupabase();
        if (result.synced) {
            // Reload events to reflect changes
            await loadEvents();
            
            // Show detailed sync results
            let message = `✅ Successfully synced from Supabase!\n\n`;
            message += `📊 Supabase events: ${result.count}\n`;
            message += `📅 Upcoming events: ${result.upcomingCount || 0}\n`;
            message += `📆 Past events: ${result.pastCount || 0}\n`;
            
            if (result.count > 0) {
                alert(message);
            } else {
                // If no events in Supabase, offer to push local events
                const localEvents = eventsManager._getAllFromLocalStorage();
                const allLocalEvents = [...(localEvents.upcoming || []), ...(localEvents.past || [])];
                if (allLocalEvents.length > 0) {
                    const pushToSupabase = window.confirm(
                        `${message}\n\nNo events found in Supabase. Would you like to upload ${allLocalEvents.length} local event(s) to Supabase?`
                    );
                    if (pushToSupabase) {
                        const pushResult = await eventsManager.syncToSupabase();
                        if (pushResult.synced) {
                            alert(`✅ Successfully uploaded ${pushResult.syncedCount} event(s) to Supabase!`);
                            await loadEvents();
                        } else {
                            alert(`❌ Failed to upload events: ${pushResult.error?.message || 'Unknown error'}`);
                        }
                    }
                } else {
                    alert(message);
                }
            }
        } else {
            // Sync failed
            if (result.error?.code === 'TABLE_NOT_FOUND') {
                alert(`⚠️ Events table does not exist in Supabase.\n\nPlease create it using the SQL script from EVENTS_SUPABASE_SETUP.md`);
            } else {
                alert(`❌ Failed to sync: ${result.error?.message || result.error?.userMessage || 'Unknown error'}`);
            }
        }
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

    const filteredReservations = reservations.filter(reservation => {
        const matchesSearch = 
            reservation.kidsName.toLowerCase().includes(reservationSearchTerm.toLowerCase()) ||
            reservation.yourName.toLowerCase().includes(reservationSearchTerm.toLowerCase()) ||
            reservation.phoneNumber.toLowerCase().includes(reservationSearchTerm.toLowerCase()) ||
            (reservation.concern && reservation.concern.toLowerCase().includes(reservationSearchTerm.toLowerCase()));
        
        const matchesStatus = reservationStatusFilter === 'all' || reservation.status === reservationStatusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const handleSaveEvent = async (eventData) => {
        let savedEvent;
        if (editingEvent) {
            savedEvent = await eventsManager.update(editingEvent.id, eventData);
        } else {
            savedEvent = await eventsManager.add(eventData);
        }
        await loadEvents();
        
        // Update URL to show the saved event
        if (savedEvent && savedEvent.id) {
            // Don't navigate away from dashboard - keep user in dashboard
            // window.history.pushState({}, '', `/upcoming-events/${savedEvent.id}`);
        }
        
        setEditingEvent(null);
        setIsAddingEvent(false);
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            await eventsManager.delete(id);
            await loadEvents();
        }
    };

    const handleMoveToPast = async (id) => {
        if (window.confirm('Move this event to past events? You can move it back later if needed.')) {
            await eventsManager.moveToPast(id);
            await loadEvents();
        }
    };

    const handleMoveToUpcoming = async (id) => {
        if (window.confirm('Move this event back to upcoming events?')) {
            await eventsManager.moveToUpcoming(id);
            await loadEvents();
        }
    };

    const handleSaveArticle = async (articleData) => {
        if (editingArticle) {
            await articlesManager.update(editingArticle.id, articleData);
        } else {
            await articlesManager.add(articleData);
        }
        loadArticles();
        setEditingArticle(null);
        setIsAddingArticle(false);
    };

    const handleDeleteArticle = async (id) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            await articlesManager.delete(id);
            await loadArticles();
        }
    };

    const handleSyncArticles = async () => {
        // First, try to sync from Supabase (download)
        const result = await articlesManager.syncFromSupabase();
        if (result.synced) {
            // Reload articles to reflect changes
            await loadArticles();
            
            // Show detailed sync results
            let message = `✅ Successfully synced from Supabase!\n\n`;
            message += `📊 Supabase articles: ${result.count}\n`;
            
            if (result.count > 0) {
                alert(message);
            } else {
                // If no articles in Supabase, offer to push local articles
                const localArticles = articlesManager._getAllFromLocalStorage();
                if (localArticles.length > 0) {
                    const pushToSupabase = window.confirm(
                        `${message}\n\nNo articles found in Supabase. Would you like to upload ${localArticles.length} local article(s) to Supabase?`
                    );
                    if (pushToSupabase) {
                        const pushResult = await articlesManager.syncToSupabase();
                        if (pushResult.synced) {
                            alert(`✅ Successfully uploaded ${pushResult.syncedCount} article(s) to Supabase!`);
                            await loadArticles();
                        } else {
                            alert(`❌ Failed to upload articles: ${pushResult.error?.message || 'Unknown error'}`);
                        }
                    }
                } else {
                    alert(message);
                }
            }
        } else {
            // Sync failed
            if (result.error?.code === 'TABLE_NOT_FOUND') {
                alert(`⚠️ Articles table does not exist in Supabase.\n\nPlease create it using the SQL script from ARTICLES_SUPABASE_SETUP.md`);
            } else {
                alert(`❌ Failed to sync: ${result.error?.message || result.error?.userMessage || 'Unknown error'}`);
            }
        }
    };

    const handleSaveTherapyProgram = async (programData) => {
        if (editingTherapyProgram) {
            await therapyProgramsManager.update(editingTherapyProgram.id, programData);
        } else {
            await therapyProgramsManager.add(programData);
        }
        loadTherapyPrograms();
        setEditingTherapyProgram(null);
        setIsAddingTherapyProgram(false);
    };

    const handleDeleteTherapyProgram = async (id) => {
        if (window.confirm('Are you sure you want to delete this therapy program?')) {
            await therapyProgramsManager.delete(id);
            await loadTherapyPrograms();
        }
    };

    const handleSyncTherapyPrograms = async () => {
        // First, try to sync from Supabase (download)
        const result = await therapyProgramsManager.syncFromSupabase();
        if (result.synced) {
            // Reload programs to reflect changes
            await loadTherapyPrograms();
            
            // Show detailed sync results
            let message = `✅ Successfully synced from Supabase!\n\n`;
            message += `📊 Supabase therapy programs: ${result.count}\n`;
            
            if (result.count > 0) {
                alert(message);
            } else {
                // If no programs in Supabase, offer to push local programs
                const localPrograms = therapyProgramsManager._getAllFromLocalStorage();
                if (localPrograms.length > 0) {
                    const pushToSupabase = window.confirm(
                        `${message}\n\nNo therapy programs found in Supabase. Would you like to upload ${localPrograms.length} local program(s) to Supabase?`
                    );
                    if (pushToSupabase) {
                        const pushResult = await therapyProgramsManager.syncToSupabase();
                        if (pushResult.synced) {
                            alert(`✅ Successfully uploaded ${pushResult.syncedCount} program(s) to Supabase!`);
                            await loadTherapyPrograms();
                        } else {
                            alert(`❌ Failed to upload programs: ${pushResult.error?.message || 'Unknown error'}`);
                        }
                    }
                } else {
                    alert(message);
                }
            }
        } else {
            // Sync failed
            if (result.error?.code === 'TABLE_NOT_FOUND') {
                alert(`⚠️ Therapy programs table does not exist in Supabase.\n\nPlease create it using the SQL script from THERAPY_PROGRAMS_SUPABASE_SETUP.md`);
            } else {
                alert(`❌ Failed to sync: ${result.error?.message || result.error?.userMessage || 'Unknown error'}`);
            }
        }
    };

    const handleSaveForParent = async (articleData) => {
        if (editingForParent) {
            await forParentsManager.update(editingForParent.id, articleData);
        } else {
            await forParentsManager.add(articleData);
        }
        loadForParentsArticles();
        setEditingForParent(null);
        setIsAddingForParent(false);
    };

    const handleDeleteForParent = async (id) => {
        if (window.confirm('Are you sure you want to delete this parent article?')) {
            await forParentsManager.delete(id);
            await loadForParentsArticles();
        }
    };

    const handleSyncForParents = async () => {
        // First, try to sync from Supabase (download)
        const result = await forParentsManager.syncFromSupabase();
        if (result.synced) {
            // Reload articles to reflect changes
            await loadForParentsArticles();
            
            // Show detailed sync results
            let message = `✅ Successfully synced from Supabase!\n\n`;
            message += `📊 Supabase for parents articles: ${result.count}\n`;
            
            if (result.count > 0) {
                alert(message);
            } else {
                // If no articles in Supabase, offer to push local articles
                const localArticles = forParentsManager._getAllFromLocalStorage();
                if (localArticles.length > 0) {
                    const pushToSupabase = window.confirm(
                        `${message}\n\nNo for parents articles found in Supabase. Would you like to upload ${localArticles.length} local article(s) to Supabase?`
                    );
                    if (pushToSupabase) {
                        const pushResult = await forParentsManager.syncToSupabase();
                        if (pushResult.synced) {
                            alert(`✅ Successfully uploaded ${pushResult.syncedCount} article(s) to Supabase!`);
                            await loadForParentsArticles();
                        } else {
                            alert(`❌ Failed to upload articles: ${pushResult.error?.message || 'Unknown error'}`);
                        }
                    }
                } else {
                    alert(message);
                }
            }
        } else {
            // Sync failed
            if (result.error?.code === 'TABLE_NOT_FOUND') {
                alert(`⚠️ For parents table does not exist in Supabase.\n\nPlease create it using the SQL script from FOR_PARENTS_SUPABASE_SETUP.md`);
            } else {
                alert(`❌ Failed to sync: ${result.error?.message || result.error?.userMessage || 'Unknown error'}`);
            }
        }
    };

    const menuItems = [
        { icon: BookOpen, label: "Courses", tab: "courses" },
        { icon: Users, label: "Members", tab: "members" },
        { icon: Calendar, label: "Events", tab: "events" },
        { icon: FileText, label: "Articles", tab: "articles" },
        { icon: Brain, label: "Therapy Programs", tab: "therapy-programs" },
        { icon: BookOpen, label: "For Parents", tab: "for-parents" },
        { icon: FileText, label: "Applications", tab: "applications" },
        { icon: Settings, label: "Settings", tab: "settings" },
    ];

    return (
        <div className="flex h-screen bg-gray-50 relative">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
                {/* Logo/Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#5A9B8E]">EACSL Admin</h1>
                        <p className="text-sm text-gray-500 mt-1">Dashboard</p>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
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
                                        onClick={() => handleTabChange(item.tab)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                                ? "bg-teal-50 text-[#5A9B8E] font-medium"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <Icon
                                            size={20}
                                            className={isActive ? "text-[#5A9B8E]" : "text-gray-400"}
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
                        <div className="w-10 h-10 rounded-full bg-[#5A9B8E] flex items-center justify-center">
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
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between gap-4 mb-4 md:mb-0">
                            <div className="flex items-center gap-4 flex-1">
                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="md:hidden p-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors shadow-md"
                                >
                                    <Menu size={28} />
                                </button>
                                <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                    {activeTab === 'courses' ? 'Courses Management' :
                                        activeTab === 'members' ? 'Members Management' :
                                        activeTab === 'events' ? 'Events Management' :
                                        activeTab === 'articles' ? 'Articles Management' :
                                        activeTab === 'therapy-programs' ? 'Therapy Programs Management' :
                                        activeTab === 'for-parents' ? 'For Parents Management' :
                                        activeTab === 'applications' ? 'All Applications' :
                                        'Settings'}
                                </h1>
                                <p className="text-gray-600 text-sm md:text-base">
                                    {activeTab === 'courses' ? 'Manage all courses on the website' :
                                        activeTab === 'members' ? 'Manage all members on the website' :
                                        activeTab === 'events' ? 'Manage upcoming and past events' :
                                        activeTab === 'articles' ? 'Manage articles and resources' :
                                        activeTab === 'therapy-programs' ? 'Manage therapy programs and services' :
                                        activeTab === 'for-parents' ? 'Manage articles and resources for parents' :
                                        activeTab === 'applications' ? 'Review and manage all form submissions' :
                                            'Dashboard settings and configuration'}
                                </p>
                                </div>
                            </div>
                            {/* Desktop buttons on the right */}
                            {activeTab === 'courses' && (
                                <div className="hidden md:flex items-center gap-2 md:gap-3">
                                    <button
                                        onClick={loadCourses}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Refresh Courses"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button
                                        onClick={handleSyncCourses}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                        title="Sync from Supabase"
                                    >
                                        <RefreshCw size={18} />
                                        Sync
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const localCourses = coursesManager._getAllFromLocalStorage();
                                            if (localCourses.length === 0) {
                                                alert('No courses in localStorage to sync.');
                                                return;
                                            }
                                            const confirmed = window.confirm(
                                                `Sync ${localCourses.length} course(s) from localStorage to Supabase?\n\n` +
                                                `This will upload any courses that don't already exist in Supabase, or update existing ones.`
                                            );
                                            if (!confirmed) return;

                                            try {
                                                const result = await coursesManager.syncToSupabase();
                                                if (result.synced) {
                                                    await loadCourses();
                                                    let message = `✅ Sync Complete!\n\n`;
                                                    message += `📤 Synced: ${result.syncedCount} course(s)\n`;
                                                    message += `📊 Total: ${result.total} course(s)\n`;
                                                    if (result.errorCount > 0) {
                                                        message += `❌ Errors: ${result.errorCount} course(s)\n`;
                                                    }
                                                    alert(message);
                                                } else {
                                                    alert(`❌ Failed to sync: ${result.error?.message || 'Unknown error'}`);
                                                }
                                            } catch (error) {
                                                console.error('Error syncing courses to Supabase:', error);
                                                alert(`❌ Error: ${error.message || 'Unknown error'}`);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        title="Sync to Supabase (Upload from localStorage)"
                                    >
                                        <RefreshCw size={18} className="rotate-180" />
                                        Sync to Supabase
                                    </button>
                                    <button
                                        onClick={() => setIsAddingCourse(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors shadow-md"
                                    >
                                        <Plus size={20} />
                                        Add Course
                                    </button>
                                </div>
                            )}
                            {activeTab === 'members' && (
                                <div className="hidden md:flex items-center gap-2 md:gap-3">
                                    <button
                                        onClick={loadMembers}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Refresh Members"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button
                                        onClick={handleSyncMembers}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                        title="Sync from Supabase"
                                    >
                                        <RefreshCw size={18} />
                                        Sync
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const localMembers = membersManager._getAllFromLocalStorage();
                                            if (localMembers.length === 0) {
                                                alert('No members in localStorage to sync.');
                                                return;
                                            }
                                            const confirmed = window.confirm(
                                                `Sync ${localMembers.length} member(s) from localStorage to Supabase?\n\n` +
                                                `This will upload any members that don't already exist in Supabase, or update existing ones.`
                                            );
                                            if (!confirmed) return;

                                            try {
                                                const result = await membersManager.syncToSupabase();
                                                if (result.synced) {
                                                    loadMembers();
                                                    let message = `✅ Sync Complete!\n\n`;
                                                    message += `📤 Synced: ${result.syncedCount} member(s)\n`;
                                                    message += `📊 Total: ${result.total} member(s)\n`;
                                                    if (result.errorCount > 0) {
                                                        message += `❌ Errors: ${result.errorCount} member(s)\n`;
                                                    }
                                                    if (result.errors && result.errors.length > 0) {
                                                        message += `\nFailed members:\n`;
                                                        result.errors.slice(0, 5).forEach(err => {
                                                            message += `• ${err.member}\n`;
                                                        });
                                                        if (result.errors.length > 5) {
                                                            message += `... and ${result.errors.length - 5} more\n`;
                                                        }
                                                    }
                                                    alert(message);
                                                } else {
                                                    alert(`Failed to sync members: ${result.error?.message || 'Unknown error'}`);
                                                }
                                            } catch (error) {
                                                console.error('Error syncing members to Supabase:', error);
                                                alert(`Error syncing members: ${error.message || 'Unknown error'}`);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        title="Sync to Supabase (Upload from localStorage)"
                                    >
                                        <RefreshCw size={18} className="rotate-180" />
                                        Sync to Supabase
                                    </button>
                                    <button
                                        onClick={() => setIsAddingMember(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors shadow-md"
                                    >
                                        <Plus size={20} />
                                        Add Member
                                    </button>
                                </div>
                            )}
                        </div>
                        {activeTab === 'courses' && (
                            <>
                            <div className="md:hidden flex items-center gap-2 mb-3 flex-wrap">
                                <button
                                    onClick={loadCourses}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                    title="Refresh Courses"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button
                                    onClick={handleSyncCourses}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                    title="Sync from Supabase"
                                >
                                    <RefreshCw size={18} />
                                    Sync
                                </button>
                                <button
                                    onClick={async () => {
                                        const localCourses = coursesManager._getAllFromLocalStorage();
                                        if (localCourses.length === 0) {
                                            alert('No courses in localStorage to sync.');
                                            return;
                                        }
                                        const confirmed = window.confirm(
                                            `Sync ${localCourses.length} course(s) from localStorage to Supabase?\n\n` +
                                            `This will upload any courses that don't already exist in Supabase, or update existing ones.`
                                        );
                                        if (!confirmed) return;

                                        try {
                                            const result = await coursesManager.syncToSupabase();
                                            if (result.synced) {
                                                await loadCourses();
                                                let message = `✅ Sync Complete!\n\n`;
                                                message += `📤 Synced: ${result.syncedCount} course(s)\n`;
                                                message += `📊 Total: ${result.total} course(s)\n`;
                                                if (result.errorCount > 0) {
                                                    message += `❌ Errors: ${result.errorCount} course(s)\n`;
                                                }
                                                alert(message);
                                            } else {
                                                alert(`❌ Failed to sync: ${result.error?.message || 'Unknown error'}`);
                                            }
                                        } catch (error) {
                                            console.error('Error syncing courses to Supabase:', error);
                                            alert(`❌ Error: ${error.message || 'Unknown error'}`);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                    title="Sync to Supabase (Upload from localStorage)"
                                >
                                    <RefreshCw size={18} className="rotate-180" />
                                    Sync to Supabase
                                </button>
                            </div>
                            <div className="md:hidden w-full">
                                <button
                                    onClick={() => setIsAddingCourse(true)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors shadow-md"
                                >
                                    <Plus size={20} />
                                    Add Course
                                </button>
                            </div>
                            </>
                        )}
                        {activeTab === 'members' && (
                            <>
                            <div className="md:hidden flex items-center gap-2 mb-3 flex-wrap">
                                <button
                                    onClick={loadMembers}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                    title="Refresh Members"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button
                                    onClick={handleSyncMembers}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                    title="Sync from Supabase"
                                >
                                    <RefreshCw size={18} />
                                    Sync
                                </button>
                                <button
                                    onClick={async () => {
                                        const localMembers = membersManager._getAllFromLocalStorage();
                                        if (localMembers.length === 0) {
                                            alert('No members in localStorage to sync.');
                                            return;
                                        }
                                        const confirmed = window.confirm(
                                            `Sync ${localMembers.length} member(s) from localStorage to Supabase?\n\n` +
                                            `This will upload any members that don't already exist in Supabase, or update existing ones.`
                                        );
                                        if (!confirmed) return;

                                        try {
                                            const result = await membersManager.syncToSupabase();
                                            if (result.synced) {
                                                loadMembers();
                                                let message = `✅ Sync Complete!\n\n`;
                                                message += `📤 Synced: ${result.syncedCount} member(s)\n`;
                                                message += `📊 Total: ${result.total} member(s)\n`;
                                                if (result.errorCount > 0) {
                                                    message += `❌ Errors: ${result.errorCount} member(s)\n`;
                                                }
                                                if (result.errors && result.errors.length > 0) {
                                                    message += `\nFailed members:\n`;
                                                    result.errors.slice(0, 5).forEach(err => {
                                                        message += `• ${err.member}\n`;
                                                    });
                                                    if (result.errors.length > 5) {
                                                        message += `... and ${result.errors.length - 5} more\n`;
                                                    }
                                                }
                                                alert(message);
                                            } else {
                                                alert(`Failed to sync members: ${result.error?.message || 'Unknown error'}`);
                                            }
                                        } catch (error) {
                                            console.error('Error syncing members to Supabase:', error);
                                            alert(`Error syncing members: ${error.message || 'Unknown error'}`);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    title="Sync to Supabase (Upload from localStorage)"
                                >
                                    <RefreshCw size={18} className="rotate-180" />
                                    Sync to Supabase
                                </button>
                            </div>
                            <div className="md:hidden w-full">
                                <button
                                    onClick={() => setIsAddingMember(true)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors shadow-md"
                                >
                                    <Plus size={20} />
                                    Add Member
                                </button>
                            </div>
                            </>
                        )}
                        {activeTab === 'articles' && (
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                <button
                                    onClick={loadArticles}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Refresh Articles"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button
                                    onClick={handleSyncArticles}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Sync from Supabase"
                                >
                                    <RefreshCw size={18} />
                                    Sync
                                </button>
                                <button
                                    onClick={() => setIsAddingArticle(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors shadow-md"
                                >
                                    <Plus size={20} />
                                    Add Article
                                </button>
                            </div>
                        )}
                        {activeTab === 'therapy-programs' && (
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                <button
                                    onClick={loadTherapyPrograms}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Refresh Therapy Programs"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button
                                    onClick={handleSyncTherapyPrograms}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Sync from Supabase"
                                >
                                    <RefreshCw size={18} />
                                    Sync
                                </button>
                                <button
                                    onClick={() => setIsAddingTherapyProgram(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors shadow-md"
                                >
                                    <Plus size={20} />
                                    Add Program
                                </button>
                            </div>
                        )}
                        {activeTab === 'for-parents' && (
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                <button
                                    onClick={loadForParentsArticles}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Refresh For Parents Articles"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button
                                    onClick={handleSyncForParents}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Sync from Supabase"
                                >
                                    <RefreshCw size={18} />
                                    Sync
                                </button>
                                <button
                                    onClick={() => setIsAddingForParent(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors shadow-md"
                                >
                                    <Plus size={20} />
                                    Add Article
                                </button>
                            </div>
                        )}
                        {activeTab === 'events' && (
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                <button
                                    onClick={loadEvents}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Refresh Events"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button
                                    onClick={handleSyncEvents}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Sync from Supabase"
                                >
                                    <RefreshCw size={18} />
                                    Sync
                                </button>
                                <button
                                    onClick={() => setIsAddingEvent(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors shadow-md"
                                >
                                    <Plus size={20} />
                                    Add Event
                                </button>
                            </div>
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
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Courses</p>
                                    <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Filtered Results</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredCourses.length}</p>
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
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Members</p>
                                    <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Filtered Results</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredMembers.length}</p>
                                </div>
                            </div>

                            {/* Members Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredMembers.map((member) => (
                                    <MemberCard
                                        key={member.id}
                                        {...member}
                                        isDashboard={true}
                                        onEdit={async (memberData) => {
                                            // Refresh member data from membersManager before opening edit form
                                            try {
                                                const allMembers = await membersManager.getAll();
                                                const latestMember = allMembers.find(m => m.id === memberData.id);
                                                setEditingMember(latestMember || memberData);
                                            } catch (err) {
                                                console.warn('Could not refresh member data, using provided data:', err);
                                                setEditingMember(memberData);
                                            }
                                        }}
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

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Upcoming Events</p>
                                    <p className="text-2xl font-bold text-gray-900">{events.upcoming?.length || 0}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Past Events</p>
                                    <p className="text-2xl font-bold text-gray-900">{events.past?.length || 0}</p>
                                </div>
                            </div>

                            {/* Upcoming Events */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                                    {events.upcoming && events.upcoming.length > 0 && (
                                        <span className="text-sm text-gray-500">
                                            {events.upcoming.length} event{events.upcoming.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                {events.upcoming && events.upcoming.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {events.upcoming.map((event) => (
                                            <div key={event.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-xl font-bold text-gray-900 flex-1">{event.title || 'Untitled Event'}</h3>
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium ml-2">
                                                        Upcoming
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.subtitle || 'No description'}</p>
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Member Fee:</span>
                                                        <span className="font-semibold text-gray-900">{event.memberFee || 0} EGP</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Guest Fee:</span>
                                                        <span className="font-semibold text-gray-900">{event.guestFee || 0} EGP</span>
                                                    </div>
                                                    {event.tracks && event.tracks.length > 0 && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-500">Tracks:</span>
                                                            <span className="font-semibold text-gray-900">{event.tracks.length}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                                    <button
                                                        onClick={() => {
                                                            setEditingEvent(event);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm font-medium"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveToPast(event.id)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                                                    >
                                                        <Archive size={16} />
                                                        Archive
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <a
                                                        href={`/upcoming-events/${event.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-[#5A9B8E] hover:text-[#4A8B7E] font-medium"
                                                    >
                                                        View Event Page →
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-2">No upcoming events</p>
                                        <p className="text-sm text-gray-400 mb-4">Click "Add Event" to create your first upcoming event</p>
                                    </div>
                                )}
                            </div>

                            {/* Past Events */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Past Events</h2>
                                    <div className="flex items-center gap-2">
                                        {events.past && events.past.length > 0 && (
                                            <span className="text-sm text-gray-500">
                                                {events.past.length} event{events.past.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {/* Debug info */}
                                        <span className="text-xs text-gray-400">
                                            (State: {events.past ? 'exists' : 'null'}, Length: {events.past?.length || 0})
                                        </span>
                                    </div>
                                </div>
                                {(() => {
                                    console.log('Rendering Past Events section');
                                    console.log('events.past:', events.past);
                                    console.log('events.past type:', typeof events.past);
                                    console.log('events.past is array:', Array.isArray(events.past));
                                    console.log('events.past length:', events.past?.length);
                                    return null;
                                })()}
                                {events.past && Array.isArray(events.past) && events.past.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {events.past.map((event) => (
                                            <div key={event.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-xl font-bold text-gray-900 flex-1">{event.title || 'Untitled Event'}</h3>
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium ml-2">
                                                        Past
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.subtitle || 'No description'}</p>
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Member Fee:</span>
                                                        <span className="font-semibold text-gray-900">{event.memberFee || 0} EGP</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Guest Fee:</span>
                                                        <span className="font-semibold text-gray-900">{event.guestFee || 0} EGP</span>
                                                    </div>
                                                    {event.tracks && event.tracks.length > 0 && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-500">Tracks:</span>
                                                            <span className="font-semibold text-gray-900">{event.tracks.length}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                                    <button
                                                        onClick={() => setEditingEvent(event)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm font-medium"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveToUpcoming(event.id)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                                    >
                                                        <Archive size={16} />
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No past events</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Articles Tab */}
                    {activeTab === 'articles' && (
                        <div>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Articles</p>
                                    <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
                                </div>
                            </div>

                            {/* Articles Grid */}
                            {articles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {articles.map((article) => (
                                        <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                                            <div className="aspect-video bg-gray-100 overflow-hidden">
                                                <ImagePlaceholder
                                                    src={article.image}
                                                    alt={article.titleEn}
                                                    name={article.titleEn}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 bg-teal-50 text-[#5A9B8E] text-xs font-medium rounded-full">
                                                        {article.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                                                    {article.titleEn}
                                                </h3>
                                                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                                                    {article.excerptEn}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                    <span>{article.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                                    <button
                                                        onClick={() => setEditingArticle(article)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm font-medium"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteArticle(article.id)}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                        title="Delete Article"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Yet</h3>
                                    <p className="text-gray-600 mb-4">Get started by adding your first article</p>
                                    <button
                                        onClick={() => setIsAddingArticle(true)}
                                        className="px-6 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium"
                                    >
                                        Add Article
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Therapy Programs Tab */}
                    {activeTab === 'therapy-programs' && (
                        <div>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Programs</p>
                                    <p className="text-2xl font-bold text-gray-900">{therapyPrograms.length}</p>
                                </div>
                            </div>

                            {/* Programs Grid */}
                            {therapyPrograms.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {therapyPrograms.map((program) => {
                                        const iconMap = {
                                            MessageCircle: MessageCircle,
                                            Users: Users,
                                            Baby: Baby,
                                            Brain: Brain,
                                            ClipboardList: ClipboardList,
                                        };
                                        const Icon = iconMap[program.icon] || MessageCircle;
                                        
                                        return (
                                            <div key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                                                <div className="aspect-video bg-gray-100 overflow-hidden">
                                                    <ImagePlaceholder
                                                        src={program.image || program.imageUrl}
                                                        alt={program.title}
                                                        name={program.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="p-2 bg-teal-50 rounded-full">
                                                            <Icon className="w-5 h-5 text-[#5A9B8E]" />
                                                        </div>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" dir="rtl">
                                                        {program.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-3" dir="rtl">
                                                        {program.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                                        <button
                                                            onClick={() => setEditingTherapyProgram(program)}
                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm font-medium"
                                                        >
                                                            <Edit size={16} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTherapyProgram(program.id)}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                            title="Delete Program"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                    <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Therapy Programs Yet</h3>
                                    <p className="text-gray-600 mb-4">Get started by adding your first therapy program</p>
                                    <button
                                        onClick={() => setIsAddingTherapyProgram(true)}
                                        className="px-6 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium"
                                    >
                                        Add Program
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* For Parents Tab */}
                    {activeTab === 'for-parents' && (
                        <div>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Articles</p>
                                    <p className="text-2xl font-bold text-gray-900">{forParentsArticles.length}</p>
                                </div>
                            </div>

                            {/* Articles Grid */}
                            {forParentsArticles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {forParentsArticles.map((article) => (
                                        <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                                            <div className="aspect-video bg-gray-100 overflow-hidden">
                                                <ImagePlaceholder
                                                    src={article.image || article.imageUrl}
                                                    alt={article.title}
                                                    name={article.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-2 bg-teal-50 rounded-full">
                                                        <BookOpen className="w-5 h-5 text-[#5A9B8E]" />
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" dir="rtl">
                                                    {article.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2" dir="rtl">
                                                    {article.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                    <span>{article.author}</span>
                                                    <span>{article.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                                    <button
                                                        onClick={() => setEditingForParent(article)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors text-sm font-medium"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteForParent(article.id)}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                                        title="Delete Article"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No For Parents Articles Yet</h3>
                                    <p className="text-gray-600 mb-4">Get started by adding your first article for parents</p>
                                    <button
                                        onClick={() => setIsAddingForParent(true)}
                                        className="px-6 py-2 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium"
                                    >
                                        Add Article
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Applications Tab */}
                    {activeTab === 'applications' && (
                        <div className="space-y-6 md:space-y-8">
                            {/* Main Sync All Button */}
                            <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Sync All Data to Supabase</h3>
                                        <p className="text-xs md:text-sm text-gray-600">
                                            Upload all localStorage data (Member Forms, Contact Forms, Reservations, Event Registrations) to Supabase
                                        </p>
                                    </div>
                                    <button
                                        onClick={syncToSupabase}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md text-sm md:text-base"
                                        title="Sync all localStorage data to Supabase"
                                    >
                                        <RefreshCw size={18} className="rotate-180" />
                                        Sync All to Supabase
                                    </button>
                                </div>
                            </div>

                            {/* Section 1: Member Applications */}
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Member Applications</h2>
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                        <div className="flex gap-2 text-xs md:text-sm">
                                            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">Total: {forms.length}</span>
                                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">Pending: {forms.filter(f => f.status === 'pending').length}</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                                            <button
                                                onClick={syncFormsFromSupabase}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium"
                                                title="Sync from Supabase"
                                            >
                                                <RefreshCw size={18} />
                                                Sync from Supabase
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const localForms = formsManager.getAll();
                                                    if (localForms.length === 0) {
                                                        alert('No member forms in localStorage to sync.');
                                                        return;
                                                    }
                                                    const confirmed = window.confirm(
                                                        `Sync ${localForms.length} member form(s) from localStorage to Supabase?\n\n` +
                                                        `This will upload any forms that don't already exist in Supabase.`
                                                    );
                                                    if (!confirmed) return;

                                                    const results = { synced: 0, skipped: 0, errors: 0 };
                                                    const existingFormsResult = await membershipFormsService.getAll();
                                                    const existingEmails = new Set();
                                                    if (existingFormsResult.data && !existingFormsResult.error) {
                                                        existingFormsResult.data.forEach(form => {
                                                            if (form.email) existingEmails.add(form.email.toLowerCase());
                                                        });
                                                    }

                                                    for (const form of localForms) {
                                                        try {
                                                            if (form.email && existingEmails.has(form.email.toLowerCase())) {
                                                                results.skipped++;
                                                                continue;
                                                            }
                                                            if (form.id && !isNaN(parseInt(form.id)) && parseInt(form.id) > 1000) {
                                                                results.skipped++;
                                                                continue;
                                                            }
                                                            const result = await membershipFormsService.add(form);
                                                            if (result.error) {
                                                                if (result.error.code === 'DUPLICATE_EMAIL' || result.error.code === '23505') {
                                                                    results.skipped++;
                                                                } else {
                                                                    results.errors++;
                                                                }
                                                            } else {
                                                                results.synced++;
                                                            }
                                                        } catch (error) {
                                                            results.errors++;
                                                        }
                                                    }

                                                    alert(
                                                        `✅ Sync Complete!\n\n` +
                                                        `📤 Synced: ${results.synced}\n` +
                                                        `⏭️ Skipped: ${results.skipped}\n` +
                                                        (results.errors > 0 ? `❌ Errors: ${results.errors}` : '')
                                                    );
                                                    await loadForms();
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                title="Sync to Supabase (Upload from localStorage)"
                                            >
                                                <RefreshCw size={18} className="rotate-180" />
                                                Sync to Supabase
                                            </button>
                                            <button
                                                onClick={loadForms}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                                title="Refresh Member Applications"
                                            >
                                                <RefreshCw size={18} />
                                                Refresh
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search by name, email, or specialty..."
                                                value={formSearchTerm}
                                                onChange={(e) => setFormSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
                                            />
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setStatusFilter(status)}
                                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                                                        statusFilter === status
                                                            ? 'bg-[#5A9B8E] text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Applications Table - Desktop / Cards - Mobile */}
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
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
                                                                    className="p-2 text-[#5A9B8E] hover:bg-[#5A9B8E]/10 rounded-lg transition-colors"
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

                                    {/* Mobile Cards */}
                                    <div className="md:hidden divide-y divide-gray-200">
                                        {filteredForms.map((form) => (
                                            <div key={form.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-base mb-1">{form.username}</h3>
                                                        <p className="text-sm text-gray-600 mb-2">{form.email}</p>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs text-gray-500">Submitted:</span>
                                                            <span className="text-sm text-gray-700 font-medium">
                                                                {new Date(form.submittedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                        form.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        form.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {form.status === 'approved' && <CheckCircle size={16} />}
                                                        {form.status === 'rejected' && <XCircle size={16} />}
                                                        {form.status === 'pending' && <Clock size={16} />}
                                                        {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-xs text-gray-500 mb-1.5">Specialty:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {form.specialty.map((spec, idx) => (
                                                            <span key={idx} className="px-2.5 py-1 bg-[#5A9B8E]/10 text-[#5A9B8E] text-xs rounded-full font-medium">
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => setSelectedForm(form)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium text-sm"
                                                    >
                                                        <Eye size={18} />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteForm(form.id)}
                                                        className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                        title="Delete"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Event Registrations</h2>
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                        <div className="flex gap-2 text-xs md:text-sm">
                                            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">Total: {eventRegistrations.length}</span>
                                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">Pending: {eventRegistrations.filter(r => r.status === 'pending').length}</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                                            <button
                                                onClick={handleSyncEventRegistrations}
                                                disabled={isSyncingEventRegistrations}
                                                className={`flex items-center justify-center gap-2 text-sm text-white px-4 py-2.5 rounded-lg transition-colors font-medium ${
                                                    isSyncingEventRegistrations
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-[#5A9B8E] hover:bg-[#4A8B7E]'
                                                }`}
                                                title="Sync from Supabase"
                                            >
                                                <RefreshCw 
                                                    size={18} 
                                                    className={isSyncingEventRegistrations ? 'animate-spin' : ''} 
                                                />
                                                {isSyncingEventRegistrations ? 'Syncing...' : 'Sync from Supabase'}
                                            </button>
                                        <button
                                            onClick={async () => {
                                                const localRegs = eventRegistrationsManager.getAllFromLocalStorage();
                                                if (localRegs.length === 0) {
                                                    alert('No event registrations in localStorage to sync.');
                                                    return;
                                                }
                                                const confirmed = window.confirm(
                                                    `Sync ${localRegs.length} event registration(s) from localStorage to Supabase?\n\n` +
                                                    `This will upload any registrations that don't already exist in Supabase.`
                                                );
                                                if (!confirmed) return;

                                                const results = { synced: 0, skipped: 0, errors: 0 };
                                                let existingRegistrations = [];
                                                try {
                                                    const { data, error } = await supabase
                                                        .from('event_registrations')
                                                        .select('*');
                                                    if (!error && data) {
                                                        existingRegistrations = data;
                                                    }
                                                } catch (err) {
                                                    console.warn('Could not fetch existing event registrations:', err);
                                                }

                                                const existingEmails = new Set();
                                                existingRegistrations.forEach(reg => {
                                                    if (reg.email) existingEmails.add(reg.email.toLowerCase());
                                                });

                                                for (const registration of localRegs) {
                                                    try {
                                                        if (registration.email && existingEmails.has(registration.email.toLowerCase())) {
                                                            results.skipped++;
                                                            continue;
                                                        }
                                                        if (registration.id && !isNaN(parseInt(registration.id)) && parseInt(registration.id) > 1000) {
                                                            results.skipped++;
                                                            continue;
                                                        }
                                                        const supabaseReg = {
                                                            event_id: registration.eventId || null,
                                                            full_name: registration.fullName,
                                                            email: registration.email,
                                                            phone: registration.phone,
                                                            organization: registration.organization || null,
                                                            membership_type: registration.membershipType,
                                                            selected_tracks: Array.isArray(registration.selectedTracks) ? registration.selectedTracks : [],
                                                            special_requirements: registration.specialRequirements || null,
                                                            registration_fee: registration.registrationFee || 0,
                                                            status: registration.status || 'pending',
                                                            submitted_at: registration.submittedAt || new Date().toISOString(),
                                                            reviewed_at: registration.reviewedAt || null,
                                                            reviewed_by: registration.reviewedBy || null,
                                                            review_notes: registration.reviewNotes || null
                                                        };
                                                        const { error } = await supabase
                                                            .from('event_registrations')
                                                            .insert([supabaseReg]);
                                                        if (error) {
                                                            if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
                                                                alert('Event registrations table not found in Supabase. Please create it first.');
                                                                break;
                                                            }
                                                            results.errors++;
                                                        } else {
                                                            results.synced++;
                                                        }
                                                    } catch (error) {
                                                        results.errors++;
                                                    }
                                                }

                                                alert(
                                                    `✅ Sync Complete!\n\n` +
                                                    `📤 Synced: ${results.synced}\n` +
                                                    `⏭️ Skipped: ${results.skipped}\n` +
                                                    (results.errors > 0 ? `❌ Errors: ${results.errors}` : '')
                                                );
                                                await loadEventRegistrations();
                                            }}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            title="Sync to Supabase (Upload from localStorage)"
                                        >
                                            <RefreshCw size={18} className="rotate-180" />
                                            Sync to Supabase
                                        </button>
                                            <button
                                                onClick={loadEventRegistrations}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                                title="Refresh Event Registrations"
                                            >
                                                <RefreshCw size={18} />
                                                Refresh
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search by name, email, phone, or organization..."
                                                value={eventSearchTerm}
                                                onChange={(e) => setEventSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
                                            />
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setEventStatusFilter(status)}
                                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                                                        eventStatusFilter === status
                                                            ? 'bg-[#5A9B8E] text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Event Registrations Table - Desktop / Cards - Mobile */}
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
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
                                                                    className="p-2 text-[#5A9B8E] hover:bg-[#5A9B8E]/10 rounded-lg transition-colors"
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

                                    {/* Mobile Cards */}
                                    <div className="md:hidden divide-y divide-gray-200">
                                        {filteredEventRegistrations.map((registration) => (
                                            <div key={registration.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-base mb-1">{registration.fullName}</h3>
                                                        <p className="text-sm text-gray-600 mb-1">{registration.email}</p>
                                                        <p className="text-sm text-gray-600 mb-2">{registration.phone}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className="text-xs text-gray-500">Type:</span>
                                                            <span className="text-sm text-gray-700 font-medium">
                                                                {registration.membershipType === 'member' ? 'Member' : 'Guest'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500">Fee:</span>
                                                            <span className="text-sm font-semibold text-gray-900">{registration.registrationFee} EGP</span>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                        registration.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        registration.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {registration.status === 'approved' && <CheckCircle size={16} />}
                                                        {registration.status === 'rejected' && <XCircle size={16} />}
                                                        {registration.status === 'pending' && <Clock size={16} />}
                                                        {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => setSelectedEventRegistration(registration)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium text-sm"
                                                    >
                                                        <Eye size={18} />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEventRegistration(registration.id)}
                                                        className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                        title="Delete"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Contact Messages</h2>
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                        <div className="flex gap-2 text-xs md:text-sm">
                                            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">Total: {contactForms.length}</span>
                                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">Pending: {contactForms.filter(f => f.status === 'pending').length}</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                                            <button
                                                onClick={syncContactFormsFromSupabase}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium"
                                                title="Sync from Supabase"
                                            >
                                                <RefreshCw size={18} />
                                                Sync from Supabase
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const localForms = contactFormsManager.getAll();
                                                    if (localForms.length === 0) {
                                                        alert('No contact forms in localStorage to sync.');
                                                        return;
                                                    }
                                                    const confirmed = window.confirm(
                                                        `Sync ${localForms.length} contact form(s) from localStorage to Supabase?\n\n` +
                                                        `This will upload any forms that don't already exist in Supabase.`
                                                    );
                                                    if (!confirmed) return;

                                                    const results = { synced: 0, skipped: 0, errors: 0 };
                                                    const existingFormsResult = await contactFormsService.getAll();
                                                    const existingEmails = new Set();
                                                    if (existingFormsResult.data && !existingFormsResult.error) {
                                                        existingFormsResult.data.forEach(form => {
                                                            if (form.email) existingEmails.add(form.email.toLowerCase());
                                                        });
                                                    }

                                                    for (const form of localForms) {
                                                        try {
                                                            if (form.email && existingEmails.has(form.email.toLowerCase())) {
                                                                const existing = existingFormsResult.data?.find(
                                                                    f => f.email?.toLowerCase() === form.email?.toLowerCase() && 
                                                                    f.subject === form.subject
                                                                );
                                                                if (existing) {
                                                                    results.skipped++;
                                                                    continue;
                                                                }
                                                            }
                                                            if (form.id && !isNaN(parseInt(form.id)) && parseInt(form.id) > 1000) {
                                                                results.skipped++;
                                                                continue;
                                                            }
                                                            const result = await contactFormsService.add(form);
                                                            if (result.error) {
                                                                results.errors++;
                                                            } else {
                                                                results.synced++;
                                                            }
                                                        } catch (error) {
                                                            results.errors++;
                                                        }
                                                    }

                                                    alert(
                                                        `✅ Sync Complete!\n\n` +
                                                        `📤 Synced: ${results.synced}\n` +
                                                        `⏭️ Skipped: ${results.skipped}\n` +
                                                        (results.errors > 0 ? `❌ Errors: ${results.errors}` : '')
                                                    );
                                                    await loadContactForms();
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                title="Sync to Supabase (Upload from localStorage)"
                                            >
                                                <RefreshCw size={18} className="rotate-180" />
                                                Sync to Supabase
                                            </button>
                                            <button
                                                onClick={loadContactForms}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                                title="Refresh Contact Messages"
                                            >
                                                <RefreshCw size={18} />
                                                Refresh
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search by name, email, subject, or message..."
                                                value={contactSearchTerm}
                                                onChange={(e) => setContactSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
                                            />
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setContactStatusFilter(status)}
                                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                                                        contactStatusFilter === status
                                                            ? 'bg-[#5A9B8E] text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Forms Table - Desktop / Cards - Mobile */}
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
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
                                                                    className="p-2 text-[#5A9B8E] hover:bg-[#5A9B8E]/10 rounded-lg transition-colors"
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

                                    {/* Mobile Cards */}
                                    <div className="md:hidden divide-y divide-gray-200">
                                        {filteredContactForms.map((form) => (
                                            <div key={form.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-base mb-1">{form.name}</h3>
                                                        <p className="text-sm text-gray-600 mb-1">{form.email}</p>
                                                        <p className="text-sm font-medium text-gray-900 mb-2">{form.subject}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">Submitted:</span>
                                                            <span className="text-sm text-gray-700 font-medium">
                                                                {new Date(form.submittedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                        form.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        form.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {form.status === 'approved' && <CheckCircle size={16} />}
                                                        {form.status === 'rejected' && <XCircle size={16} />}
                                                        {form.status === 'pending' && <Clock size={16} />}
                                                        {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => setSelectedContactForm(form)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium text-sm"
                                                    >
                                                        <Eye size={18} />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteContactForm(form.id)}
                                                        className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                        title="Delete"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredContactForms.length === 0 && (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No contact messages found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 4: Reservations */}
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Assessment Reservations</h2>
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                        <div className="flex gap-2 text-xs md:text-sm">
                                            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">Total: {reservations.length}</span>
                                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">Pending: {reservations.filter(r => r.status === 'pending').length}</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                                            <button
                                                onClick={syncReservationsFromSupabase}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium"
                                                title="Sync from Supabase"
                                            >
                                                <RefreshCw size={18} />
                                                Sync from Supabase
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const localReservations = reservationsManager.getAll();
                                                    if (localReservations.length === 0) {
                                                        alert('No reservations in localStorage to sync.');
                                                        return;
                                                    }
                                                    const confirmed = window.confirm(
                                                        `Sync ${localReservations.length} reservation(s) from localStorage to Supabase?\n\n` +
                                                        `This will upload any reservations that don't already exist in Supabase.`
                                                    );
                                                    if (!confirmed) return;

                                                    const results = { synced: 0, skipped: 0, errors: 0 };
                                                    const existingReservationsResult = await reservationsService.getAll();
                                                    const existingKeys = new Set();
                                                    if (existingReservationsResult.data && !existingReservationsResult.error) {
                                                        existingReservationsResult.data.forEach(res => {
                                                            const key = `${res.phoneNumber}_${res.yourName}_${res.submittedAt}`;
                                                            existingKeys.add(key);
                                                        });
                                                    }

                                                    for (const reservation of localReservations) {
                                                        try {
                                                            const key = `${reservation.phoneNumber}_${reservation.yourName}_${reservation.submittedAt}`;
                                                            if (existingKeys.has(key)) {
                                                                results.skipped++;
                                                                continue;
                                                            }
                                                            if (reservation.id && !isNaN(parseInt(reservation.id)) && parseInt(reservation.id) > 1000) {
                                                                results.skipped++;
                                                                continue;
                                                            }
                                                            const result = await reservationsService.add(reservation);
                                                            if (result.error) {
                                                                results.errors++;
                                                            } else {
                                                                results.synced++;
                                                            }
                                                        } catch (error) {
                                                            results.errors++;
                                                        }
                                                    }

                                                    alert(
                                                        `✅ Sync Complete!\n\n` +
                                                        `📤 Synced: ${results.synced}\n` +
                                                        `⏭️ Skipped: ${results.skipped}\n` +
                                                        (results.errors > 0 ? `❌ Errors: ${results.errors}` : '')
                                                    );
                                                    await loadReservations();
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                title="Sync to Supabase (Upload from localStorage)"
                                            >
                                                <RefreshCw size={18} className="rotate-180" />
                                                Sync to Supabase
                                            </button>
                                            <button
                                                onClick={loadReservations}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                                title="Refresh Reservations"
                                            >
                                                <RefreshCw size={18} />
                                                Refresh
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search by child's name, parent name, phone, or concern..."
                                                value={reservationSearchTerm}
                                                onChange={(e) => setReservationSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A9B8E] focus:border-transparent outline-none text-sm md:text-base"
                                            />
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setReservationStatusFilter(status)}
                                                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                                                        reservationStatusFilter === status
                                                            ? 'bg-[#5A9B8E] text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Reservations Table - Desktop / Cards - Mobile */}
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Child's Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parent/Guardian</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assessments</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredReservations.map((reservation) => (
                                                    <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-gray-900">{reservation.kidsName}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{reservation.yourName}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{reservation.phoneNumber}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {reservation.selectedAssessments && reservation.selectedAssessments.length > 0 ? (
                                                                    reservation.selectedAssessments.slice(0, 2).map((assessment, idx) => (
                                                                        <span key={idx} className="px-2 py-1 bg-[#5A9B8E]/10 text-[#5A9B8E] text-xs rounded-full">
                                                                            {assessment.substring(0, 15)}...
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">None</span>
                                                                )}
                                                                {reservation.selectedAssessments && reservation.selectedAssessments.length > 2 && (
                                                                    <span className="text-xs text-gray-500">+{reservation.selectedAssessments.length - 2} more</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">
                                                                {new Date(reservation.submittedAt).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                                reservation.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                reservation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {reservation.status === 'approved' && <CheckCircle size={14} />}
                                                                {reservation.status === 'rejected' && <XCircle size={14} />}
                                                                {reservation.status === 'pending' && <Clock size={14} />}
                                                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setSelectedReservation(reservation)}
                                                                    className="p-2 text-[#5A9B8E] hover:bg-[#5A9B8E]/10 rounded-lg transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteReservation(reservation.id)}
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

                                    {/* Mobile Cards */}
                                    <div className="md:hidden divide-y divide-gray-200">
                                        {filteredReservations.map((reservation) => (
                                            <div key={reservation.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-base mb-1">{reservation.kidsName}</h3>
                                                        <p className="text-sm text-gray-600 mb-1">Parent: {reservation.yourName}</p>
                                                        <p className="text-sm text-gray-600 mb-2">{reservation.phoneNumber}</p>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs text-gray-500">Submitted:</span>
                                                            <span className="text-sm text-gray-700 font-medium">
                                                                {new Date(reservation.submittedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                        reservation.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        reservation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {reservation.status === 'approved' && <CheckCircle size={16} />}
                                                        {reservation.status === 'rejected' && <XCircle size={16} />}
                                                        {reservation.status === 'pending' && <Clock size={16} />}
                                                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                    </span>
                                                </div>
                                                {reservation.selectedAssessments && reservation.selectedAssessments.length > 0 && (
                                                    <div className="mb-3">
                                                        <p className="text-xs text-gray-500 mb-1.5">Assessments:</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {reservation.selectedAssessments.map((assessment, idx) => (
                                                                <span key={idx} className="px-2.5 py-1 bg-[#5A9B8E]/10 text-[#5A9B8E] text-xs rounded-full font-medium">
                                                                    {assessment}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => setSelectedReservation(reservation)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5A9B8E] text-white rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium text-sm"
                                                    >
                                                        <Eye size={18} />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReservation(reservation.id)}
                                                        className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                        title="Delete"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredReservations.length === 0 && (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No reservations found</p>
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

            {/* Event Edit Form Modal */}
            {(isAddingEvent || editingEvent) && (
                <EventEditForm
                    event={editingEvent}
                    onSave={(eventData) => {
                        handleSaveEvent(eventData);
                        // After saving, update URL to show the event being edited
                        if (editingEvent && editingEvent.id) {
                            setTimeout(() => {
                                // Don't navigate away from dashboard - keep user in dashboard
                                // window.history.pushState({}, '', `/upcoming-events/${editingEvent.id}`);
                            }, 100);
                        } else {
                            // For new events, wait for the event to be saved and get its ID
                            setTimeout(async () => {
                                const allEvents = await eventsManager.getAll();
                                const latestEvent = allEvents.upcoming[allEvents.upcoming.length - 1];
                                if (latestEvent && latestEvent.id) {
                                    // Don't navigate away from dashboard - keep user in dashboard
                                    // window.history.pushState({}, '', `/upcoming-events/${latestEvent.id}`);
                                }
                            }, 200);
                        }
                    }}
                    onCancel={() => {
                        setEditingEvent(null);
                        setIsAddingEvent(false);
                    }}
                />
            )}

            {/* Article Edit Form Modal */}
            {(isAddingArticle || editingArticle) && (
                <ArticleEditForm
                    article={editingArticle}
                    onSave={handleSaveArticle}
                    onCancel={() => {
                        setEditingArticle(null);
                        setIsAddingArticle(false);
                    }}
                />
            )}

            {/* Therapy Program Edit Form */}
            {(isAddingTherapyProgram || editingTherapyProgram) && (
                <TherapyProgramEditForm
                    program={editingTherapyProgram}
                    onSave={handleSaveTherapyProgram}
                    onCancel={() => {
                        setEditingTherapyProgram(null);
                        setIsAddingTherapyProgram(false);
                    }}
                />
            )}

            {/* For Parent Edit Form */}
            {(isAddingForParent || editingForParent) && (
                <ForParentEditForm
                    article={editingForParent}
                    onSave={handleSaveForParent}
                    onCancel={() => {
                        setEditingForParent(null);
                        setIsAddingForParent(false);
                    }}
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

            {/* Reservation Details Modal */}
            {selectedReservation && (
                <ReservationModal
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    onApprove={handleApproveReservation}
                    onReject={handleRejectReservation}
                />
            )}
        </div>
    );
};

export default Dashboard;
