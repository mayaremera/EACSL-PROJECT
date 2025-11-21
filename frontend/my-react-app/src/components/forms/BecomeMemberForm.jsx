// import React, { useState, useRef } from 'react';
// import { Upload, Eye, EyeOff, Mail, Lock, AlertCircle, X, Check, CheckCircle, Loader2 } from 'lucide-react';

// const BecomeMemberForm = ({ onSubmit }) => {
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [touched, setTouched] = useState({});
//     const [dragActive, setDragActive] = useState({});
//     const [isSubmitted, setIsSubmitted] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const isSubmittingRef = useRef(false);
//     const buttonRef = useRef(null);
//     const [formData, setFormData] = useState({
//         profileImage: null,
//         idImage: null,
//         username: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//         specialty: [],
//         previousWork: '',
//         graduationCert: null,
//         cv: null
//     });

//     const specialties = [
//         'Phonetics and linguistics',
//         'Speech and language therapy department'
//     ];

//     const validateField = (name, value) => {
//         switch (name) {
//             case 'profileImage':
//             case 'idImage':
//             case 'graduationCert':
//             case 'cv':
//                 return value ? '' : 'This file is required';
//             case 'username':
//                 return value.trim() ? '' : 'Username is required';
//             case 'email':
//                 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//                 return emailRegex.test(value) ? '' : 'Valid email is required';
//             case 'password':
//                 return value.length >= 6 ? '' : 'Password must be at least 6 characters';
//             case 'confirmPassword':
//                 return value === formData.password ? '' : 'Passwords do not match';
//             case 'specialty':
//                 return value.length > 0 ? '' : 'Select at least one specialty';
//             case 'previousWork':
//                 return value.trim() ? '' : 'Previous work description is required';
//             default:
//                 return '';
//         }
//     };

//     const handleBlur = (field) => {
//         setTouched(prev => ({ ...prev, [field]: true }));
//         setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
//     };

//     const handleSpecialtyChange = (specialty) => {
//         const newSpecialty = formData.specialty.includes(specialty)
//             ? formData.specialty.filter(s => s !== specialty)
//             : [...formData.specialty, specialty];
        
//         setFormData(prev => ({ ...prev, specialty: newSpecialty }));
//         if (touched.specialty) {
//             setErrors(prev => ({ ...prev, specialty: validateField('specialty', newSpecialty) }));
//         }
//     };

//     const handleFileChange = (field, file) => {
//         if (!file) return;
        
//         // Maximum file size: 5MB (5 * 1024 * 1024 bytes)
//         const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
        
//         // Check file size
//         if (file.size > maxFileSize) {
//             const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
//             alert(`File size (${fileSizeMB} MB) exceeds the maximum allowed size of 5 MB. Please choose a smaller file.`);
//             return;
//         }
        
//         // CV field accepts PDFs, other fields accept images
//         const isValidFile = field === 'cv' 
//             ? file.type === 'application/pdf'
//             : file.type.startsWith('image/');
        
//         if (isValidFile) {
//             setFormData(prev => ({ ...prev, [field]: file }));
//             setTouched(prev => ({ ...prev, [field]: true }));
//             setErrors(prev => ({ ...prev, [field]: '' }));
//         } else {
//             const errorMsg = field === 'cv' 
//                 ? 'Please upload only PDF files'
//                 : 'Please upload only image files (JPG, PNG, etc.)';
//             alert(errorMsg);
//         }
//     };

//     const handleDrag = (e, field) => {
//         e.preventDefault();
//         e.stopPropagation();
//         if (e.type === "dragenter" || e.type === "dragover") {
//             setDragActive(prev => ({ ...prev, [field]: true }));
//         } else if (e.type === "dragleave") {
//             setDragActive(prev => ({ ...prev, [field]: false }));
//         }
//     };

//     const handleDrop = (e, field) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(prev => ({ ...prev, [field]: false }));
        
//         if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//             const file = e.dataTransfer.files[0];
//             handleFileChange(field, file);
//         }
//     };

//     const removeFile = (field, e) => {
//         e.stopPropagation();
//         setFormData(prev => ({ ...prev, [field]: null }));
//         setErrors(prev => ({ ...prev, [field]: validateField(field, null) }));
//     };

//     const handleSubmit = async (e) => {
//         if (e) {
//             e.preventDefault();
//             e.stopPropagation();
//         }
        
//         // Check if already submitting
//         if (isSubmittingRef.current) {
//             return;
//         }
        
//         // Set submitting flag immediately
//         isSubmittingRef.current = true;
//         setIsSubmitting(true);
        
//         // Validate all fields
//         const newErrors = {};
//         const newTouched = {};
        
//         Object.keys(formData).forEach(key => {
//             newTouched[key] = true;
//             const error = validateField(key, formData[key]);
//             if (error) {
//                 newErrors[key] = error;
//             }
//         });

//         setTouched(newTouched);
//         setErrors(newErrors);

//         // If validation fails, reset submitting state
//         if (Object.keys(newErrors).length > 0) {
//             setIsSubmitting(false);
//             isSubmittingRef.current = false;
//             const errorMessages = Object.entries(newErrors)
//                 .map(([field, error]) => `${field}: ${error}`)
//                 .join('\n');
//             alert(`⚠️ Please fix the following errors:\n\n${errorMessages}`);
//             return;
//         }

//         // Validation passed, submit the form
//         try {
//             if (onSubmit) {
//                 await onSubmit(formData);
//             }
//             setIsSubmitted(true);
//         } catch (error) {
//             console.error('Error submitting form:', error);
//             const errorMessage = error.message || 'An error occurred while submitting the form. Please try again.';
//             alert(`❌ Submission Failed\n\n${errorMessage}`);
//             // Reset on error so user can retry
//             setIsSubmitting(false);
//             isSubmittingRef.current = false;
//         }
//     };

//     const FileUploadBox = ({ field, label, acceptTypes = "image/*" }) => {
//         const hasError = touched[field] && errors[field];
//         const hasFile = formData[field];

//         return (
//             <div className="mb-6">
//                 <label className="block text-gray-800 text-sm font-semibold mb-3">
//                     {label} <span className="text-red-500">*</span>
//                 </label>
//                 <div
//                     onDragEnter={(e) => !isSubmitting && handleDrag(e, field)}
//                     onDragLeave={(e) => !isSubmitting && handleDrag(e, field)}
//                     onDragOver={(e) => !isSubmitting && handleDrag(e, field)}
//                     onDrop={(e) => !isSubmitting && handleDrop(e, field)}
//                     className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
//                         isSubmitting 
//                             ? 'cursor-not-allowed opacity-50'
//                             : 'cursor-pointer'
//                     } ${
//                         dragActive[field] 
//                             ? 'border-[#5A9B8E] bg-[#5A9B8E]/10 scale-[1.02]' 
//                             : hasError 
//                             ? 'border-red-500 bg-red-50' 
//                             : 'border-gray-300 hover:border-[#5A9B8E] bg-gray-50 hover:bg-gray-100'
//                     }`}
//                     onClick={() => !isSubmitting && !hasFile && document.getElementById(field).click()}
//                 >
//                     {hasFile ? (
//                         <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                                     <Check className="w-6 h-6 text-green-600" />
//                                 </div>
//                                 <div className="text-left">
//                                     <p className="text-sm text-gray-700 font-medium">{hasFile.name}</p>
//                                     <p className="text-xs text-gray-500">
//                                         {hasFile.size >= 1024 * 1024 
//                                             ? `${(hasFile.size / (1024 * 1024)).toFixed(2)} MB`
//                                             : `${(hasFile.size / 1024).toFixed(2)} KB`}
//                                     </p>
//                                 </div>
//                             </div>
//                             <button
//                                 type="button"
//                                 onClick={(e) => !isSubmitting && removeFile(field, e)}
//                                 disabled={isSubmitting}
//                                 className={`transition-colors p-2 rounded-full ${
//                                     isSubmitting 
//                                         ? 'text-gray-400 cursor-not-allowed' 
//                                         : 'text-red-500 hover:text-red-700 hover:bg-red-50'
//                                 }`}
//                             >
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>
//                     ) : (
//                         <>
//                             <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
//                                 hasError ? 'bg-red-100' : dragActive[field] ? 'bg-[#5A9B8E]/20' : 'bg-gray-200'
//                             }`}>
//                                 <Upload className={`w-8 h-8 ${hasError ? 'text-red-500' : dragActive[field] ? 'text-[#5A9B8E]' : 'text-gray-500'}`} />
//                             </div>
//                             <p className={`text-sm mb-1 font-medium ${hasError ? 'text-red-600' : dragActive[field] ? 'text-[#5A9B8E]' : 'text-gray-700'}`}>
//                                 {dragActive[field] 
//                                     ? `Drop your ${acceptTypes === "application/pdf" ? "PDF" : "image"} here` 
//                                     : `Drag and drop your ${acceptTypes === "application/pdf" ? "PDF" : "image"} here`}
//                             </p>
//                             <p className="text-gray-500 text-xs mb-4">or</p>
//                             <input
//                                 type="file"
//                                 accept={acceptTypes}
//                                 onChange={(e) => handleFileChange(field, e.target.files?.[0])}
//                                 onBlur={() => handleBlur(field)}
//                                 disabled={isSubmitting}
//                                 className="hidden"
//                                 id={field}
//                             />
//                             <div className="inline-block px-6 py-2 bg-[#5A9B8E] text-white text-sm rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium">
//                                 Browse Files
//                             </div>
//                             <p className="text-gray-400 text-xs mt-4">
//                                 Accepts: {acceptTypes === "application/pdf" ? "PDF files only" : "Images only (JPG, PNG, GIF, etc.)"}
//                             </p>
//                             <p className="text-gray-400 text-xs">(Maximum file size: 5MB)</p>
//                         </>
//                     )}
//                 </div>
//                 {hasError && (
//                     <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
//                         <AlertCircle className="w-4 h-4" />
//                         <span>{errors[field]}</span>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     if (isSubmitted) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//                 <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl w-full text-center">
//                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                         <CheckCircle className="w-12 h-12 text-green-600" />
//                     </div>
//                     <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h2>
//                     <p className="text-gray-600 mb-6 leading-relaxed">
//                         Thank you for applying to EACSL! You will receive an email within a week regarding the result of your application.
//                     </p>
//                     <div className="bg-teal-50 border-l-4 border-[#5A9B8E] p-4 mb-6">
//                         <p className="text-sm text-gray-700">
//                             <strong>Username:</strong> {formData.username}<br />
//                             <strong>Email:</strong> {formData.email}<br />
//                             <strong>Specialty:</strong> {formData.specialty.join(', ')}
//                         </p>
//                     </div>
//                     <button
//                         onClick={() => window.location.reload()}
//                         className="px-8 py-3 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white font-semibold rounded-lg transition-colors duration-200"
//                     >
//                         Back to Application Page
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200 relative">
//             {/* Loading Overlay - Show immediately when ref is true OR state is true */}
//             {(isSubmitting || isSubmittingRef.current) && (
//                 <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-50">
//                     <Loader2 className="w-16 h-16 text-[#5A9B8E] animate-spin mb-4" />
//                     <p className="text-xl font-semibold text-gray-700">Submitting your application...</p>
//                     <p className="text-sm text-gray-500 mt-2">Please wait, this may take a moment</p>
//                 </div>
//             )}
            
//             {/* Blocking overlay - prevents all interactions when submitting */}
//             {(isSubmitting || isSubmittingRef.current) && (
//                 <div 
//                     className="absolute inset-0 z-40 cursor-not-allowed"
//                     style={{ pointerEvents: 'auto' }}
//                     onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         e.stopImmediatePropagation();
//                     }}
//                     onMouseDown={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                     }}
//                 />
//             )}
            
//             {/* Profile Image Upload */}
//             <FileUploadBox 
//                 field="profileImage" 
//                 label="Upload your account image"
//             />

//             {/* ID Card Upload */}
//             <FileUploadBox 
//                 field="idImage" 
//                 label="Upload your ID Card (Front & Back) Image"
//             />

//             {/* Username */}
//             <div className="mb-6">
//                 <label className="block text-gray-800 text-sm font-semibold mb-2">
//                     Username <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                     type="text"
//                     placeholder="Enter your name"
//                     value={formData.username}
//                     onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                     onBlur={() => handleBlur('username')}
//                     disabled={isSubmitting}
//                     className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
//                         isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//                     } ${
//                         touched.username && errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
//                     }`}
//                 />
//                 {touched.username && errors.username && (
//                     <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
//                         <AlertCircle className="w-4 h-4" />
//                         <span>{errors.username}</span>
//                     </div>
//                 )}
//             </div>

//             {/* Email */}
//             <div className="mb-6">
//                 <label className="block text-gray-800 text-sm font-semibold mb-2">
//                     Email Address <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                         type="email"
//                         placeholder="example@example.com"
//                         value={formData.email}
//                         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                         onBlur={() => handleBlur('email')}
//                         disabled={isSubmitting}
//                         className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
//                             isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//                         } ${
//                             touched.email && errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
//                         }`}
//                     />
//                 </div>
//                 {touched.email && errors.email && (
//                     <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
//                         <AlertCircle className="w-4 h-4" />
//                         <span>{errors.email}</span>
//                     </div>
//                 )}
//             </div>

//             {/* Password */}
//             <div className="mb-6">
//                 <label className="block text-gray-800 text-sm font-semibold mb-2">
//                     Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                         type={showPassword ? "text" : "password"}
//                         placeholder="Enter password"
//                         value={formData.password}
//                         onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                         onBlur={() => handleBlur('password')}
//                         disabled={isSubmitting}
//                         className={`w-full pl-12 pr-12 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
//                             isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//                         } ${
//                             touched.password && errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
//                         }`}
//                     />
//                     <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                         {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                 </div>
//                 {touched.password && errors.password && (
//                     <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
//                         <AlertCircle className="w-4 h-4" />
//                         <span>{errors.password}</span>
//                     </div>
//                 )}
//             </div>

//             {/* Confirm Password */}
//             <div className="mb-6">
//                 <label className="block text-gray-800 text-sm font-semibold mb-2">
//                     Retype Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                         type={showConfirmPassword ? "text" : "password"}
//                         placeholder="Enter password"
//                         value={formData.confirmPassword}
//                         onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                         onBlur={() => handleBlur('confirmPassword')}
//                         disabled={isSubmitting}
//                         className={`w-full pl-12 pr-12 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
//                             isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//                         } ${
//                             touched.confirmPassword && errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
//                         }`}
//                     />
//                     <button
//                         type="button"
//                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                         {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                 </div>
//                 {touched.confirmPassword && errors.confirmPassword && (
//                     <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
//                         <AlertCircle className="w-4 h-4" />
//                         <span>{errors.confirmPassword}</span>
//                     </div>
//                 )}
//             </div>

//             {/* Specialty */}
//             <div className="mb-6">
//                 <label className="block text-gray-800 text-sm font-semibold mb-3">
//                     Specialty <span className="text-red-500">*</span>
//                 </label>
//                 <div className={`bg-gray-50 border rounded-lg p-4 transition-all ${
//                     touched.specialty && errors.specialty ? 'border-red-500' : 'border-gray-300'
//                 }`}>
//                     {specialties.map((specialty, index) => (
//                         <label key={index} className="flex items-center mb-3 last:mb-0 cursor-pointer group">
//                             <input
//                                 type="checkbox"
//                                 checked={formData.specialty.includes(specialty)}
//                                 onChange={() => handleSpecialtyChange(specialty)}
//                                 onBlur={() => handleBlur('specialty')}
//                                 disabled={isSubmitting}
//                                 className="hidden"
//                             />
//                             <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-all ${
//                                 formData.specialty.includes(specialty)
//                                     ? 'border-[#5A9B8E] bg-[#5A9B8E]'
//                                     : 'border-gray-400 group-hover:border-[#5A9B8E]'
//                             }`}>
//                                 {formData.specialty.includes(specialty) && (
//                                     <Check className="w-3 h-3 text-white" />
//                                 )}
//                             </div>
//                             <span className="text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
//                                 {specialty}
//                             </span>
//                         </label>
//                     ))}
//                 </div>
//                 {touched.specialty && errors.specialty && (
//                     <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
//                         <AlertCircle className="w-4 h-4" />
//                         <span>{errors.specialty}</span>
//                     </div>
//                 )}
//             </div>

//             {/* Previous Work */}
//             <div className="mb-6">
//                 <label className="block text-gray-800 text-sm font-semibold mb-2">
//                     Talk about your previous work briefly <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                     placeholder="Your message here"
//                     value={formData.previousWork}
//                     onChange={(e) => setFormData({ ...formData, previousWork: e.target.value })}
//                     onBlur={() => handleBlur('previousWork')}
//                     disabled={isSubmitting}
//                     rows="4"
//                     className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all resize-none ${
//                         isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//                     } ${
//                         touched.previousWork && errors.previousWork ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
//                     }`}
//                 ></textarea>
//                 {touched.previousWork && errors.previousWork && (
//                     <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
//                         <AlertCircle className="w-4 h-4" />
//                         <span>{errors.previousWork}</span>
//                     </div>
//                 )}
//             </div>

//             {/* Graduation Certificate */}
//             <FileUploadBox 
//                 field="graduationCert" 
//                 label="Upload your graduation certificate"
//             />

//             {/* CV Upload */}
//             <FileUploadBox 
//                 field="cv" 
//                 label="Upload your CV"
//                 acceptTypes="application/pdf"
//             />

//             {/* Submit Button */}
//             <button
//                 ref={buttonRef}
//                 type="button"
//                 onClick={(e) => {
//                     // CRITICAL: Check ref FIRST - synchronous check
//                     if (isSubmittingRef.current) {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         e.stopImmediatePropagation();
//                         return false;
//                     }
                    
//                     // Set ref IMMEDIATELY - synchronous operation
//                     isSubmittingRef.current = true;
                    
//                     // Disable button via DOM immediately
//                     if (buttonRef.current) {
//                         buttonRef.current.disabled = true;
//                         buttonRef.current.style.pointerEvents = 'none';
//                         buttonRef.current.style.opacity = '0.5';
//                         buttonRef.current.style.cursor = 'not-allowed';
//                     }
                    
//                     // Force React to show loading immediately
//                     setIsSubmitting(true);
                    
//                     // Now call handleSubmit
//                     handleSubmit(e);
//                 }}
//                 disabled={isSubmitting || isSubmitted}
//                 className={`w-full py-4 font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 ${
//                     isSubmitting || isSubmitted || isSubmittingRef.current
//                         ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50'
//                         : 'bg-[#5A9B8E] text-white hover:bg-[#4A8B7E] hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300'
//                 }`}
//                 style={{
//                     pointerEvents: (isSubmitting || isSubmitted || isSubmittingRef.current) ? 'none' : 'auto'
//                 }}
//             >
//                 {(isSubmitting || isSubmittingRef.current) && <Loader2 className="w-5 h-5 animate-spin" />}
//                 {(isSubmitting || isSubmittingRef.current) ? 'Submitting...' : isSubmitted ? 'Submitted ✓' : 'Become A Member'}
//             </button>
//         </div>
//     );
// };

// export default BecomeMemberForm;

import React, { useState, useRef } from 'react';
import { Upload, Eye, EyeOff, Mail, Lock, AlertCircle, X, Check, CheckCircle, Loader2 } from 'lucide-react';
import { membersManager } from '../../utils/dataManager';

const BecomeMemberForm = ({ onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dragActive, setDragActive] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailExistsError, setEmailExistsError] = useState(null); // null, 'member', or 'pending'
    const isSubmittingRef = useRef(false);
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
        'Phonetics and linguistics',
        'Speech and language therapy department'
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
        if (!file) return;
        
        const maxFileSize = 5 * 1024 * 1024;
        
        if (file.size > maxFileSize) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            alert(`File size (${fileSizeMB} MB) exceeds the maximum allowed size of 5 MB. Please choose a smaller file.`);
            return;
        }
        
        const isValidFile = field === 'cv' 
            ? file.type === 'application/pdf'
            : file.type.startsWith('image/');
        
        if (isValidFile) {
            setFormData(prev => ({ ...prev, [field]: file }));
            setTouched(prev => ({ ...prev, [field]: true }));
            setErrors(prev => ({ ...prev, [field]: '' }));
        } else {
            const errorMsg = field === 'cv' 
                ? 'Please upload only PDF files'
                : 'Please upload only image files (JPG, PNG, etc.)';
            alert(errorMsg);
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

    const handleSubmit = async () => {
        // Prevent duplicate submissions
        if (isSubmittingRef.current) {
            console.log('Already submitting, ignoring click');
            return;
        }
        
        // Set both ref and state immediately
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        
        console.log('Starting form submission...');
        
        // Validate all fields
        const newErrors = {};
        const newTouched = {};
        
        Object.keys(formData).forEach(key => {
            newTouched[key] = true;
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
            }
        });

        setTouched(newTouched);
        setErrors(newErrors);

        // If validation fails, reset submitting state
        if (Object.keys(newErrors).length > 0) {
            console.log('Validation failed:', newErrors);
            setIsSubmitting(false);
            isSubmittingRef.current = false;
            const errorMessages = Object.entries(newErrors)
                .map(([field, error]) => `${field}: ${error}`)
                .join('\n');
            alert(`⚠️ Please fix the following errors:\n\n${errorMessages}`);
            return;
        }

        // Check if email already exists before submitting
        console.log('Validation passed, checking if email exists...');
        setEmailExistsError(null); // Reset error state
        
        // Check in existing members
        const existingMembers = membersManager.getAll();
        const existingMember = existingMembers.find(m => 
            m.email && m.email.toLowerCase() === formData.email.toLowerCase()
        );
        
        if (existingMember) {
            console.log('Email already exists in members:', existingMember);
            setIsSubmitting(false);
            isSubmittingRef.current = false;
            setEmailExistsError('member');
            return;
        }
        
        // Check in pending applications (localStorage)
        try {
            const stored = localStorage.getItem('memberForms');
            if (stored) {
                const existingForms = JSON.parse(stored);
                const pendingApplication = existingForms.find(
                    form => form.email && 
                    form.email.toLowerCase() === formData.email.toLowerCase() && 
                    form.status === 'pending'
                );
                
                if (pendingApplication) {
                    console.log('Email already has pending application:', pendingApplication);
                    setIsSubmitting(false);
                    isSubmittingRef.current = false;
                    setEmailExistsError('pending');
                    return;
                }
            }
        } catch (error) {
            console.warn('Error checking pending applications:', error);
            // Continue with submission if we can't check
        }
        
        // Validation passed and email doesn't exist, submit the form
        console.log('Email check passed, calling onSubmit...');
        try {
            if (onSubmit) {
                await onSubmit(formData);
                console.log('onSubmit completed successfully');
            }
            setIsSubmitted(true);
            setIsSubmitting(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            const errorMessage = error.message || 'An error occurred while submitting the form. Please try again.';
            alert(`❌ Submission Failed\n\n${errorMessage}`);
            setIsSubmitting(false);
            isSubmittingRef.current = false;
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
                    onDragEnter={(e) => !isSubmitting && handleDrag(e, field)}
                    onDragLeave={(e) => !isSubmitting && handleDrag(e, field)}
                    onDragOver={(e) => !isSubmitting && handleDrag(e, field)}
                    onDrop={(e) => !isSubmitting && handleDrop(e, field)}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                        isSubmitting 
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                    } ${
                        dragActive[field] 
                            ? 'border-[#5A9B8E] bg-[#5A9B8E]/10 scale-[1.02]' 
                            : hasError 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 hover:border-[#5A9B8E] bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => !isSubmitting && !hasFile && document.getElementById(field).click()}
                >
                    {hasFile ? (
                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-gray-700 font-medium">{hasFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {hasFile.size >= 1024 * 1024 
                                            ? `${(hasFile.size / (1024 * 1024)).toFixed(2)} MB`
                                            : `${(hasFile.size / 1024).toFixed(2)} KB`}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => !isSubmitting && removeFile(field, e)}
                                disabled={isSubmitting}
                                className={`transition-colors p-2 rounded-full ${
                                    isSubmitting 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                }`}
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
                                {dragActive[field] 
                                    ? `Drop your ${acceptTypes === "application/pdf" ? "PDF" : "image"} here` 
                                    : `Drag and drop your ${acceptTypes === "application/pdf" ? "PDF" : "image"} here`}
                            </p>
                            <p className="text-gray-500 text-xs mb-4">or</p>
                            <input
                                type="file"
                                accept={acceptTypes}
                                onChange={(e) => handleFileChange(field, e.target.files?.[0])}
                                onBlur={() => handleBlur(field)}
                                disabled={isSubmitting}
                                className="hidden"
                                id={field}
                            />
                            <div className="inline-block px-6 py-2 bg-[#5A9B8E] text-white text-sm rounded-lg hover:bg-[#4A8B7E] transition-colors font-medium">
                                Browse Files
                            </div>
                            <p className="text-gray-400 text-xs mt-4">
                                Accepts: {acceptTypes === "application/pdf" ? "PDF files only" : "Images only (JPG, PNG, GIF, etc.)"}
                            </p>
                            <p className="text-gray-400 text-xs">(Maximum file size: 5MB)</p>
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

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Thank you for applying to EACSL! You will receive an email within a week regarding the result of your application.
                    </p>
                    <div className="bg-teal-50 border-l-4 border-[#5A9B8E] p-4 mb-6">
                        <p className="text-sm text-gray-700">
                            <strong>Username:</strong> {formData.username}<br />
                            <strong>Email:</strong> {formData.email}<br />
                            <strong>Specialty:</strong> {formData.specialty.join(', ')}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                        Back to Application Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200 relative">
            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-50">
                    <Loader2 className="w-16 h-16 text-[#5A9B8E] animate-spin mb-4" />
                    <p className="text-xl font-semibold text-gray-700">Submitting your application...</p>
                    <p className="text-sm text-gray-500 mt-2">Please wait, this may take a moment</p>
                </div>
            )}
            
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
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
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
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            // Clear email exists error when user types
                            if (emailExistsError) {
                                setEmailExistsError(null);
                            }
                        }}
                        onBlur={() => handleBlur('email')}
                        disabled={isSubmitting}
                        className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                            emailExistsError 
                                ? 'border-amber-500 focus:border-amber-500' 
                                : touched.email && errors.email 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:border-[#5A9B8E]'
                        }`}
                    />
                </div>
                {touched.email && errors.email && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                    </div>
                )}
                {emailExistsError && (
                    <div className={`mt-3 p-4 border-l-4 rounded-lg flex items-start gap-3 ${
                        emailExistsError === 'member' 
                            ? 'bg-amber-50 border-amber-500' 
                            : 'bg-blue-50 border-blue-500'
                    }`}>
                        <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            emailExistsError === 'member' ? 'text-amber-600' : 'text-blue-600'
                        }`} />
                        <div className="flex-1">
                            <p className={`font-medium text-sm ${
                                emailExistsError === 'member' ? 'text-amber-800' : 'text-blue-800'
                            }`}>
                                {emailExistsError === 'member' 
                                    ? 'Email Already Exists' 
                                    : 'Pending Application Exists'}
                            </p>
                            <p className={`text-sm mt-1 ${
                                emailExistsError === 'member' ? 'text-amber-700' : 'text-blue-700'
                            }`}>
                                {emailExistsError === 'member' 
                                    ? `An account with email ${formData.email} already exists in our system. If you already have an account, please sign in instead. If you believe this is an error, please contact support.`
                                    : `You already have a pending application with email ${formData.email}. Please wait for your current application to be reviewed before submitting again.`}
                            </p>
                        </div>
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
                        disabled={isSubmitting}
                        className={`w-full pl-12 pr-12 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                            touched.password && errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
                        disabled={isSubmitting}
                        className={`w-full pl-12 pr-12 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                            touched.confirmPassword && errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
                        <label key={index} className={`flex items-center mb-3 last:mb-0 group ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                checked={formData.specialty.includes(specialty)}
                                onChange={() => !isSubmitting && handleSpecialtyChange(specialty)}
                                onBlur={() => handleBlur('specialty')}
                                disabled={isSubmitting}
                                className="hidden"
                            />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-all ${
                                isSubmitting 
                                    ? 'opacity-50'
                                    : formData.specialty.includes(specialty)
                                    ? 'border-[#5A9B8E] bg-[#5A9B8E]'
                                    : 'border-gray-400 group-hover:border-[#5A9B8E]'
                            }`}>
                                {formData.specialty.includes(specialty) && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </div>
                            <span className={`text-sm transition-colors ${
                                isSubmitting 
                                    ? 'text-gray-500'
                                    : 'text-gray-700 group-hover:text-gray-900'
                            }`}>
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
                    disabled={isSubmitting}
                    rows="4"
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all resize-none ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
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
                acceptTypes="application/pdf"
            />

            {/* Submit Button */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isSubmitted}
                className={`w-full py-4 font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                    isSubmitting || isSubmitted
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-[#5A9B8E] text-white hover:bg-[#4A8B7E] hover:shadow-xl transform hover:scale-[1.02]'
                }`}
            >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSubmitting ? 'Submitting...' : isSubmitted ? 'Submitted ✓' : 'Become A Member'}
            </button>
        </div>
    );
};

export default BecomeMemberForm;