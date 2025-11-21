import React from 'react';
import { Facebook, Instagram, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import whiteLogo from '../../assets/white-eacsl-logo.png';

const Footer = () => {
  const footerSections = [
    {
      title: null,
      content: (
        <>
          <Link to="/" className="mb-6 flex justify-center lg:justify-start">
            <img 
              src={whiteLogo} 
              alt="EACSL Logo" 
              className="h-20 w-auto"
            />
          </Link> 
          <div className="flex gap-3 justify-center lg:justify-start">
            <a 
              href="https://www.facebook.com/share/1DL2TuQqH3/" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://www.instagram.com/eacsl2012?igsh=MTUyNW95c3dmM21tYQ==" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://x.com/Eacslphonetics?fbclid=IwVERDUAOMj0NleHRuA2FlbQIxMABzcnRjBmFwcF9pZAwzNTA2ODU1MzE3MjgAAR6hCe2xNn9WcvrAymTP3X-RmtZThkAUffCLo6jM5E4p1uXUwrXx3oFYnrAjPg_aem_yBGW3SHpJKv40n_gaOsD9g" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
              aria-label="Twitter"
            >
              <X className="w-5 h-5 text-white" />
            </a>
          </div>
        </>
      )
    },
    {
      title: 'Company Info',
      links: [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Gallery', href: '/gallery' }
      ]
    },
    {
      title: 'Events',
      links: [
        { name: 'Upcoming Events', href: '/upcoming-events' },
        { name: 'Past Events', href: '/past-events' },
      ]
    },
    {
      title: 'Members & Education',
      links: [
        // { name: 'Active Members', href: '/active-members' },
        { name: 'Become a Member', href: '/apply-membership' },
        { name: 'Members Overview', href: '/members-overview' },
        { name: 'Online Courses', href: '/online-courses' },
        { name: 'Articles', href: '/articles' },
      ]
    },
    {
      title: 'Services',
      links: [
        { name: 'Therapy Programs', href: '/therapy-programs' },
        { name: 'For Parents', href: '/for-parents' },
        { name: 'Reservation', href: '/reservation' }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-[#4C9A8F] to-[#3d8178] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-10">
          {/* Logo and Social Icons */}
          <div className="flex flex-col items-center space-y-6 pb-8 border-b border-white/20">
            <Link to="/" className="flex justify-center">
              <img 
                src={whiteLogo} 
                alt="EACSL Logo" 
                className="h-20 w-auto"
              />
            </Link>
            <div className="flex gap-4 justify-center">
              <a 
                href="https://www.facebook.com/share/1DL2TuQqH3/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a 
                href="https://www.instagram.com/eacsl2012?igsh=MTUyNW95c3dmM21tYQ==" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a 
                href="https://x.com/Eacslphonetics?fbclid=IwVERDUAOMj0NleHRuA2FlbQIxMABzcnRjBmFwcF9pZAwzNTA2ODU1MzE3MjgAAR6hCe2xNn9WcvrAymTP3X-RmtZThkAUffCLo6jM5E4p1uXUwrXx3oFYnrAjPg_aem_yBGW3SHpJKv40n_gaOsD9g" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Twitter"
              >
                <X className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Footer Links Grid */}
          <div className="grid grid-cols-2 gap-8">
            {footerSections.slice(1).map((section, index) => (
              <div key={index}>
                <h3 className="text-white text-lg font-bold mb-4 pb-2 border-b border-white/10">
                  {section.title}
                </h3>
                <ul className="space-y-2.5 mt-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        to={link.href} 
                        className="text-white/80 text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-8 xl:gap-12">
          {footerSections.map((section, index) => (
            <div key={index} className={index === 0 ? 'lg:col-span-1' : ''}>
              {section.title && (
                <h3 className="text-white text-lg font-bold mb-5 pb-3 border-b border-white/20">
                  {section.title}
                </h3>
              )}
              
              {section.content ? (
                <div className="space-y-4">
                  {section.content}
                </div>
              ) : (
                <ul className="space-y-2.5 mt-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        to={link.href} 
                        className="text-white/80 text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {link.name}
                      </Link>
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