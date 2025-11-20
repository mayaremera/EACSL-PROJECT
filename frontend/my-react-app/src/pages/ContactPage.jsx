import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create form submission object
    const formSubmission = {
      id: Date.now().toString(),
      type: 'contactMessage',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Get existing contact forms from localStorage
    let existingForms = [];
    try {
      const stored = localStorage.getItem('contactForms');
      existingForms = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      existingForms = [];
    }
    
    // Add new submission
    existingForms.push(formSubmission);
    
    // Save back to localStorage
    try {
      localStorage.setItem('contactForms', JSON.stringify(existingForms));
      // Dispatch event to notify dashboard
      window.dispatchEvent(new CustomEvent('contactFormsUpdated', { detail: existingForms }));
    } catch (error) {
      console.error('Error saving contact form:', error);
      alert('Failed to save your message. Please try again.');
      return;
    }
    
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Our Office',
      content: '23 Galal Hammad Street Alexandria, Egypt',
      link: 'https://maps.app.goo.gl/QiXXLmAZyD61wkjA9'
    },
    {
      icon: Clock,
      title: 'Working Days',
      content: 'Saturday to Wednesday',
      link: null
    },
    {
      icon: Phone,
      title: 'Contacts',
      content: '+201061162520 - +201062048067',
      link: 'tel:+201061162520'
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for contacting us! Our team will get back to you as soon as possible.
          </p>
          <div className="bg-teal-50 border-l-4 border-[#4C9A8F] p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Name:</strong> {formData.name}<br />
              <strong>Email:</strong> {formData.email}<br />
              {formData.phone && (
                <>
                  <strong>Phone:</strong> {formData.phone}<br />
                </>
              )}
              <strong>Subject:</strong> {formData.subject}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#4C9A8F] hover:bg-[#3d8178] text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Back to Contact Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto">
              Get in touch with us for any inquiries or information about our programs
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <a href="#" className="hover:text-[#4C9A8F] transition-colors">Home</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Contact</span>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-full mb-4">
                  <Icon className="text-[#4C9A8F]" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {info.title}
                </h3>
                {info.link ? (
                  <a
                    href={info.link}
                    target={info.link.startsWith('http') ? '_blank' : '_self'}
                    rel={info.link.startsWith('http') ? 'noopener noreferrer' : ''}
                    className="text-gray-600 hover:text-[#4C9A8F] transition-colors text-sm leading-relaxed"
                  >
                    {info.content}
                  </a>
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {info.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent transition-colors"
                  placeholder="+20 XXX XXX XXXX"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent transition-colors"
                  placeholder="What is your inquiry about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-[#4C9A8F] hover:bg-[#3d8178] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Send size={20} />
                Send Message
              </button>
            </div>
          </div>

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
        </div>
      </div>

      {/* Footer CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Become a member and be part of our growing professional community
            </p>
            <button className="bg-white text-[#4C9A8F] hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
              Become a Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;