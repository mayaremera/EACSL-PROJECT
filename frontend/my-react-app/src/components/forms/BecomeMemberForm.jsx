import React, { useState } from 'react';
import { Upload, Eye, EyeOff, Mail, Lock, AlertCircle, X, Check } from 'lucide-react';

const BecomeMemberForm = ({ onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dragActive, setDragActive] = useState({});
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

    const validateField = (name, value) => {
        switch (name) {
            case 'profileImage':
            case 'idImage':
            case 'graduationCert':
            case 'cv':
                return value ? '' : 'This file is required';
            case 'username':
                return value.trim() ? '' : 'Username is required';
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) ? '' : 'Valid email is required';
            case 'password':
                return value.length >= 6 ? '' : 'Password must be at least 6 characters';
            case 'confirmPassword':
                return value === formData.password ? '' : 'Passwords do not match';
            case 'specialty':
                return value.length > 0 ? '' : 'Select at least one specialty';
            case 'previousWork':
                return value.trim() ? '' : 'Previous work description is required';
            default:
                return '';
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
    };

    const handleSpecialtyChange = (specialty) => {
        const newSpecialty = formData.specialty.includes(specialty)
            ? formData.specialty.filter(s => s !== specialty)
            : [...formData.specialty, specialty];
        
        setFormData(prev => ({ ...prev, specialty: newSpecialty }));
        if (touched.specialty) {
            setErrors(prev => ({ ...prev, specialty: validateField('specialty', newSpecialty) }));
        }
    };

    const handleFileChange = (field, file) => {
        if (file && file.type.startsWith('image/')) {
            setFormData(prev => ({ ...prev, [field]: file }));
            setTouched(prev => ({ ...prev, [field]: true }));
            setErrors(prev => ({ ...prev, [field]: '' }));
        } else if (file) {
            alert('Please upload only image files (JPG, PNG, etc.)');
        }
    };

    const handleDrag = (e, field) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(prev => ({ ...prev, [field]: true }));
        } else if (e.type === "dragleave") {
            setDragActive(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleDrop = (e, field) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [field]: false }));
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            handleFileChange(field, file);
        }
    };

    const removeFile = (field, e) => {
        e.stopPropagation();
        setFormData(prev => ({ ...prev, [field]: null }));
        setErrors(prev => ({ ...prev, [field]: validateField(field, null) }));
    };

    const handleSubmit = () => {
        const newErrors = {};
        const newTouched = {};
        
        Object.keys(formData).forEach(key => {
            newTouched[key] = true;
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        setTouched(newTouched);
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            if (onSubmit) onSubmit(formData);
        }
    };

    const FileUploadBox = ({ field, label, acceptTypes = "image/*" }) => {
        const hasError = touched[field] && errors[field];
        const hasFile = formData[field];

        return (
            <div className="mb-6">
                <label className="block text-gray-800 text-sm font-semibold mb-3">
                    {label} <span className="text-red-500">*</span>
                </label>
                <div
                    onDragEnter={(e) => handleDrag(e, field)}
                    onDragLeave={(e) => handleDrag(e, field)}
                    onDragOver={(e) => handleDrag(e, field)}
                    onDrop={(e) => handleDrop(e, field)}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
                        dragActive[field] 
                            ? 'border-[#5A9B8E] bg-[#5A9B8E]/10 scale-[1.02]' 
                            : hasError 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 hover:border-[#5A9B8E] bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => !hasFile && document.getElementById(field).click()}
                >
                    {hasFile ? (
                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-gray-700 font-medium">{hasFile.name}</p>
                                    <p className="text-xs text-gray-500">{(hasFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => removeFile(field, e)}
                                className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                hasError ? 'bg-red-100' : dragActive[field] ? 'bg-[#5A9B8E]/20' : 'bg-gray-200'
                            }`}>
                                <Upload className={`w-8 h-8 ${hasError ? 'text-red-500' : dragActive[field] ? 'text-[#5A9B8E]' : 'text-gray-500'}`} />
                            </div>
                            <p className={`text-sm mb-1 font-medium ${hasError ? 'text-red-600' : dragActive[field] ? 'text-[#5A9B8E]' : 'text-gray-700'}`}>
                                {dragActive[field] ? 'Drop your image here' : 'Drag and drop your image here'}
                            </p>
                            <p className="text-gray-500 text-xs mb-4">or</p>
                            <input
                                type="file"
                                accept={acceptTypes}
                                onChange={(e) => handleFileChange(field, e.target.files?.[0])}
                                onBlur={() => handleBlur(field)}
                                className="hidden"
                                id={field}
                            />
                            <div className="inline-block px-6 py-2 bg-[#5A9B8E] text-white text-sm rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium">
                                Browse Files
                            </div>
                            <p className="text-gray-400 text-xs mt-4">Accepts: Images only (JPG, PNG, GIF, etc.)</p>
                            <p className="text-gray-400 text-xs">(Maximum file size: 2MB)</p>
                        </>
                    )}
                </div>
                {hasError && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors[field]}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200">
            {/* Profile Image Upload */}
            <FileUploadBox 
                field="profileImage" 
                label="Upload your account image"
            />

            {/* ID Card Upload */}
            <FileUploadBox 
                field="idImage" 
                label="Upload your ID Card (Front & Back) Image"
            />

            {/* Username */}
            <div className="mb-6">
                <label className="block text-gray-800 text-sm font-semibold mb-2">
                    Username <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    onBlur={() => handleBlur('username')}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                        touched.username && errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
                    }`}
                />
                {touched.username && errors.username && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.username}</span>
                    </div>
                )}
            </div>

            {/* Email */}
            <div className="mb-6">
                <label className="block text-gray-800 text-sm font-semibold mb-2">
                    Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        placeholder="example@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onBlur={() => handleBlur('email')}
                        className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                            touched.email && errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
                        }`}
                    />
                </div>
                {touched.email && errors.email && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                    </div>
                )}
            </div>

            {/* Password */}
            <div className="mb-6">
                <label className="block text-gray-800 text-sm font-semibold mb-2">
                    Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onBlur={() => handleBlur('password')}
                        className={`w-full pl-12 pr-12 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                            touched.password && errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {touched.password && errors.password && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.password}</span>
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
                <label className="block text-gray-800 text-sm font-semibold mb-2">
                    Retype Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={`w-full pl-12 pr-12 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                            touched.confirmPassword && errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.confirmPassword}</span>
                    </div>
                )}
            </div>

            {/* Specialty */}
            <div className="mb-6">
                <label className="block text-gray-800 text-sm font-semibold mb-3">
                    Specialty <span className="text-red-500">*</span>
                </label>
                <div className={`bg-gray-50 border rounded-lg p-4 transition-all ${
                    touched.specialty && errors.specialty ? 'border-red-500' : 'border-gray-300'
                }`}>
                    {specialties.map((specialty, index) => (
                        <label key={index} className="flex items-center mb-3 last:mb-0 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.specialty.includes(specialty)}
                                onChange={() => handleSpecialtyChange(specialty)}
                                onBlur={() => handleBlur('specialty')}
                                className="hidden"
                            />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-all ${
                                formData.specialty.includes(specialty)
                                    ? 'border-[#5A9B8E] bg-[#5A9B8E]'
                                    : 'border-gray-400 group-hover:border-[#5A9B8E]'
                            }`}>
                                {formData.specialty.includes(specialty) && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </div>
                            <span className="text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
                                {specialty}
                            </span>
                        </label>
                    ))}
                </div>
                {touched.specialty && errors.specialty && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.specialty}</span>
                    </div>
                )}
            </div>

            {/* Previous Work */}
            <div className="mb-6">
                <label className="block text-gray-800 text-sm font-semibold mb-2">
                    Talk about your previous work briefly <span className="text-red-500">*</span>
                </label>
                <textarea
                    placeholder="Your message here"
                    value={formData.previousWork}
                    onChange={(e) => setFormData({ ...formData, previousWork: e.target.value })}
                    onBlur={() => handleBlur('previousWork')}
                    rows="4"
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all resize-none ${
                        touched.previousWork && errors.previousWork ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
                    }`}
                ></textarea>
                {touched.previousWork && errors.previousWork && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.previousWork}</span>
                    </div>
                )}
            </div>

            {/* Graduation Certificate */}
            <FileUploadBox 
                field="graduationCert" 
                label="Upload your graduation certificate"
            />

            {/* CV Upload */}
            <FileUploadBox 
                field="cv" 
                label="Upload your CV"
            />

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="w-full py-4 bg-[#5A9B8E] text-white font-bold rounded-lg hover:bg-[#4A8B7E] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
                Become A Member
            </button>
        </div>
    );
};

export default BecomeMemberForm;