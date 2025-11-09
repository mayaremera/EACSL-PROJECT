import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import whiteLogo from '../../assets/white-eacsl-logo.png';

const Footer = () => {
  const footerSections = [
    {
      title: null,
      content: (
        <>
          <a className="mb-6 lg:mb-5 flex justify-center lg:justify-start" href='/'>
            <img 
              src={whiteLogo} 
              alt="Company Logo" 
              className="h-16 sm:h-20 w-auto lg:h-16 lg:w-auto"
            />
          </a> 
          <div className="flex gap-4 justify-center lg:justify-start">
            <a 
              href="#" 
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5 text-white" />
            </a>
          </div>
        </>
      )
    },
    {
      title: 'Company Info',
      links: ['About Us', 'Carrier', 'We are hiring', 'Blog']
    },
    {
      title: 'Features',
      links: ['Business Marketing', 'User Analytic', 'Live Chat', 'Unlimited Support']
    },
    {
      title: 'Resources',
      links: ['IOS & Android', 'Watch a Demo', 'Customers', 'API']
    }
  ];

  return (
    <footer className="bg-[#5A9B8E] py-16 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Logo and Social Icons - Top */}
          <div className="mb-12 flex flex-col items-center space-y-6">
            <div className="flex justify-center">
              <img 
                src={whiteLogo} 
                alt="Company Logo" 
                className="h-[4.5rem] w-auto lg:h-20 lg:w-auto"
              />
            </div>
            <div className="flex gap-4 justify-center">
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Company Info and Features Row */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {footerSections.slice(1, 3).map((section, index) => (
              <div key={index} className="text-left">
                <h3 className="text-white text-xl font-bold mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href="#" 
                        className="text-white/80 text-base hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Resources Row */}
          <div className="text-left">
            <h3 className="text-white text-xl font-bold mb-6">
              {footerSections[3].title}
            </h3>
            <ul className="space-y-3">
              {footerSections[3].links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a 
                    href="#" 
                    className="text-white/80 text-base hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Desktop Layout - Original Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-12">
          {footerSections.map((section, index) => (
            <div key={index}>
              {section.title && (
                <h3 className="text-white text-xl font-bold mb-6">
                  {section.title}
                </h3>
              )}
              
              {section.content ? (
                section.content
              ) : (
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href="#" 
                        className="text-white/80 text-base hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;