import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, ArrowLeft, CheckCircle, Calendar } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { reservationsService } from '../services/reservationsService';

const ReservationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    kidsName: '',
    yourName: '',
    phoneNumber: '',
    speechAssessment: false,
    skillsAssessment: false,
    academicAssessment: false,
    iqTests: false,
    concern: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get selected assessments
      const selectedAssessments = [];
      if (formData.speechAssessment) selectedAssessments.push('تقييم النطق');
      if (formData.skillsAssessment) selectedAssessments.push('تقييم المهارات');
      if (formData.academicAssessment) selectedAssessments.push('التقييم الأكاديمي');
      if (formData.iqTests) selectedAssessments.push('اختبار الذكاء أو اختبارات أخرى');

      // Prepare form submission data
      const formSubmission = {
        kidsName: formData.kidsName,
        yourName: formData.yourName,
        phoneNumber: formData.phoneNumber,
        selectedAssessments: selectedAssessments,
        concern: formData.concern,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Save to Supabase instead of localStorage
      const result = await reservationsService.add(formSubmission);

      if (result.error) {
        // Handle specific errors
        if (result.error.code === 'TABLE_NOT_FOUND') {
          alert(
            '❌ Database Table Not Found\n\n' +
            'The reservations table does not exist in Supabase.\n\n' +
            'To fix this:\n' +
            '1. Go to Supabase Dashboard → SQL Editor\n' +
            '2. Run the SQL script from CREATE_RESERVATIONS_TABLE.sql\n' +
            '3. Try submitting again\n\n' +
            'See RESERVATIONS_SUPABASE_SETUP.md for detailed instructions.'
          );
          setIsSubmitting(false);
          return;
        }

        throw new Error(
          result.error.message || 'Failed to save your reservation. Please try again.'
        );
      }

      // Dispatch event to notify dashboard
      window.dispatchEvent(new CustomEvent('reservationsUpdated', { detail: [result.data] }));
      
      console.log('Reservation submitted successfully:', result.data);
      setSubmittedData({
        kidsName: formData.kidsName,
        yourName: formData.yourName,
        phoneNumber: formData.phoneNumber,
        selectedAssessments: selectedAssessments
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting reservation:', error);
      alert(
        `Failed to save your reservation: ${error.message || 'Unknown error'}\n\n` +
        'Please try again or contact support if the issue persists.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const officeInfo = [
    {
      icon: MapPin,
      title: 'Our Office',
      content: '23 Galal Hammad Street Alexandria, Egypt',
      link: 'https://maps.app.goo.gl/QiXXLmAZyD61wkjA9'
    },
    {
      icon: Clock,
      title: 'Days',
      content: 'Saturday to Wednesday',
      link: null
    },
    {
      icon: Phone,
      title: 'Contacts',
      phones: [
        { number: '+201061162520', link: 'tel:+201061162520' },
        { number: '+201062048067', link: 'tel:+201062048067' }
      ]
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@eacsl.net',
      link: 'mailto:info@eacsl.net'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Reservation Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            شكراً لك! سنتواصل معك قريباً لتأكيد موعدك.
          </p>
          <div className="bg-teal-50 border-l-4 border-[#4C9A8F] p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Child's Name:</strong> {submittedData?.kidsName}<br />
              <strong>Your Name:</strong> {submittedData?.yourName}<br />
              <strong>Phone:</strong> {submittedData?.phoneNumber}<br />
              {submittedData?.selectedAssessments && submittedData.selectedAssessments.length > 0 && (
                <>
                  <strong>Requested Assessments:</strong> {submittedData.selectedAssessments.join(', ')}
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Back to Reservation Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PageHero
        title="Book an Assessment"
        subtitle="Schedule your appointment with our professional team"
        icon={<Calendar className="w-12 h-12" />}
      />

      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Reservation' }]} />

      {/* Office Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {officeInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-full mb-4">
                  <Icon className="text-[#4C9A8F]" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                {info.phones ? (
                  <div className="flex flex-row gap-3 justify-center flex-wrap">
                    {info.phones.map((phone, phoneIndex) => (
                      <a
                        key={phoneIndex}
                        href={phone.link}
                        className="text-gray-600 hover:text-[#4C9A8F] transition-colors text-sm leading-relaxed"
                      >
                        {phone.number}
                      </a>
                    ))}
                  </div>
                ) : info.link ? (
                  <a
                    href={info.link}
                    target={info.link.startsWith('http') ? '_blank' : '_self'}
                    rel={info.link.startsWith('http') ? 'noopener noreferrer' : ''}
                    className="text-gray-600 hover:text-[#4C9A8F] transition-colors text-sm leading-relaxed"
                  >
                    {info.content}
                  </a>
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">{info.content}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content Grid (Map on the Left, Form on the Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Map */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-full min-h-[600px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3410.4703002587653!2d29.993074803357448!3d31.263083860726432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f5daa30a053b4f%3A0xccecf40391be2264!2s23%20Ahmed%20Galal%20Hammad%2C%20Sidi%20Beshr%20Bahri%2C%20Montaza%201%2C%20Alexandria%20Governorate%205517230%2C%20Egypt!5e0!3m2!1sen!2sus!4v1762491764890!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="EACSL Office Location"
            ></iframe>
          </div>

          {/* Reservation Form */}
          <div 
            className="bg-white rounded-lg shadow-md p-8" 
            dir="rtl"
            style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>احجز تقييماً</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="kidsName" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                  اسم الطفل *
                </label>
                <input
                  type="text"
                  id="kidsName"
                  name="kidsName"
                  value={formData.kidsName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent transition-colors"
                  placeholder="أدخل اسم الطفل"
                  style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}
                />
              </div>

              <div>
                <label htmlFor="yourName" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                  اسمك *
                </label>
                <input
                  type="text"
                  id="yourName"
                  name="yourName"
                  value={formData.yourName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent transition-colors"
                  placeholder="أدخل اسمك الكامل"
                  style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent transition-colors"
                  placeholder="+20 XXX XXX XXXX"
                  style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>التقييمات المطلوبة</label>
                <div className="space-y-3">
                  {[
                    { name: 'speechAssessment', label: 'تقييم النطق' },
                    { name: 'skillsAssessment', label: 'تقييم المهارات' },
                    { name: 'academicAssessment', label: 'التقييم الأكاديمي' },
                    { name: 'iqTests', label: 'اختبار الذكاء أو اختبارات أخرى' }
                  ].map((item, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name={item.name}
                        checked={formData[item.name]}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#4C9A8F] border-gray-300 rounded focus:ring-[#4C9A8F]"
                      />
                      <span className="text-sm text-gray-700" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="concern" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                  وصف حالة الطفل *
                </label>
                <textarea
                  id="concern"
                  name="concern"
                  rows={5}
                  value={formData.concern}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent transition-colors resize-none"
                  placeholder="اكتب تفاصيل حالة الطفل أو أي استفسار..."
                  style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full bg-[#4C9A8F] hover:bg-[#3d8178] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif", fontSize: '16px' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    إرسال الطلب
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join Our Community</h2>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Become a member and be part of our growing professional community
            </p>
            <a href="/apply-membership" className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
              Become a Member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
