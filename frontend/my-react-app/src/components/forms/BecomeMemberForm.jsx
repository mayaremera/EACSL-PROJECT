import React, { useState } from 'react';
import { Upload, Eye, EyeOff, Mail, Lock } from 'lucide-react';

const BecomeMemberForm = ({ onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        profileImage: null,
        idImage: null,
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        specialty: [],
        previousWork: '',
        graduationCert: null,
        cv: null
    });

    const specialties = [
        'Speech sound disorder (children)',
        'Language disorder (children)',
        'Neurogenic communication disorder',
        'Voice and upper respiratory disorders',
        'Fluency disorders',
        'Craniofacial and velopharyngeal disorders'
    ];

    const handleSpecialtyChange = (specialty) => {
        setFormData(prev => ({
            ...prev,
            specialty: prev.specialty.includes(specialty)
                ? prev.specialty.filter(s => s !== specialty)
                : [...prev.specialty, specialty]
        }));
    };

    const handleFileChange = (field, file) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const handleSubmit = () => {
        if (onSubmit) onSubmit(formData);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-black/60 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
            {/* Profile Image Upload */}
            <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-3">
                    Upload your accounts image
                </label>
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-[#5A9B8E] transition-colors duration-300">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-300 text-sm mb-1">Drag and drop your file here</p>
                    <p className="text-gray-400 text-xs mb-3">or browse to choose a file</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('profileImage', e.target.files?.[0])}
                        className="hidden"
                        id="profileImage"
                    />
                    <label
                        htmlFor="profileImage"
                        className="text-gray-400 text-xs cursor-pointer hover:text-[#5A9B8E] transition-colors"
                    >
                        Accepts: image/*, jpeg, .pdf, docx
                    </label>
                    <p className="text-gray-500 text-xs mt-2">(Upload files up to 2MB)</p>
                </div>
            </div>

            {/* ID Card Upload */}
            <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-3">
                    Upload your ID Card (Front & Back) Image
                </label>
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-[#5A9B8E] transition-colors duration-300">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-300 text-sm mb-1">Drag and drop your file here</p>
                    <p className="text-gray-400 text-xs mb-3">or browse to choose a file</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('idImage', e.target.files?.[0])}
                        className="hidden"
                        id="idImage"
                    />
                    <label
                        htmlFor="idImage"
                        className="text-gray-400 text-xs cursor-pointer hover:text-[#5A9B8E] transition-colors"
                    >
                        Accepts: image/*, jpeg, .pdf, docx
                    </label>
                    <p className="text-gray-500 text-xs mt-2">(Upload files up to 2MB)</p>
                </div>
            </div>

            {/* Username */}
            <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-2">
                    Username
                </label>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5A9B8E] transition-colors"
                />
            </div>

            {/* Email */}
            <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-2">
                    Email Address
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        placeholder="example@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-transparent border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5A9B8E] transition-colors"
                    />
                </div>
            </div>

            {/* Password */}
            <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-2">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-transparent border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5A9B8E] transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-2">
                    Retype Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-transparent border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5A9B8E] transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Specialty */}
            <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-3">
                    Specialty
                </label>
                <div className="bg-black/40 border border-gray-500 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {specialties.map((specialty, index) => (
                        <label key={index} className="flex items-center mb-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.specialty.includes(specialty)}
                                onChange={() => handleSpecialtyChange(specialty)}
                                className="hidden"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all ${formData.specialty.includes(specialty)
                                    ? 'border-[#5A9B8E] bg-[#5A9B8E]'
                                    : 'border-gray-400 group-hover:border-[#5A9B8E]'
                                }`}>
                                {formData.specialty.includes(specialty) && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>
                            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                                {specialty}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Previous Work */}
            <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-2">
                    Talk about your previous work briefly
                </label>
                <textarea
                    placeholder="Your message here"
                    value={formData.previousWork}
                    onChange={(e) => setFormData({ ...formData, previousWork: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5A9B8E] transition-colors resize-none"
                ></textarea>
            </div>

            {/* Graduation Certificate */}
            <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-2">
                    Upload your graduation certificate
                </label>
                <div className="relative">
                    <input
                        type="file"
                        onChange={(e) => handleFileChange('graduationCert', e.target.files?.[0])}
                        className="hidden"
                        id="graduationCert"
                    />
                    <label
                        htmlFor="graduationCert"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                        Upload File
                    </label>
                </div>
            </div>

            {/* CV Upload */}
            <div className="mb-8">
                <label className="block text-white text-sm font-semibold mb-2">
                    Upload your CV
                </label>
                <div className="relative">
                    <input
                        type="file"
                        onChange={(e) => handleFileChange('cv', e.target.files?.[0])}
                        className="hidden"
                        id="cv"
                    />
                    <label
                        htmlFor="cv"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                        Upload File
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="w-full py-4 bg-[#5A9B8E] text-white font-bold rounded-lg hover:bg-[#4A8B7E] transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
                Become A Member
            </button>
        </div>
    );
};

export default BecomeMemberForm;