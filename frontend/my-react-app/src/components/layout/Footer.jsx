import React from 'react';
import { Facebook, Instagram, Twitter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import whiteLogo from '../../assets/white-eacsl-logo.png';

const Footer = () => {
  const footerSections = [
    {
      title: null,
      content: (
        <>
          <Link to="/" className="mb-6 lg:mb-5 flex justify-center lg:justify-start">
            <img 
              src={whiteLogo} 
              alt="Company Logo" 
              className="h-16 sm:h-20 w-auto lg:h-16 lg:w-auto"
            />
          </Link> 
          <div className="flex gap-4 justify-center lg:justify-start">
            <a 
              href="https://www.facebook.com/share/1DL2TuQqH3/" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://www.instagram.com/eacsl2012?igsh=MTUyNW95c3dmM21tYQ==" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://x.com/Eacslphonetics?fbclid=IwVERDUAOMj0NleHRuA2FlbQIxMABzcnRjBmFwcF9pZAwzNTA2ODU1MzE3MjgAAR6hCe2xNn9WcvrAymTP3X-RmtZThkAUffCLo6jM5E4p1uXUwrXx3oFYnrAjPg_aem_yBGW3SHpJKv40n_gaOsD9g" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
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
                href="https://www.facebook.com/share/1DL2TuQqH3/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a 
                href="https://www.instagram.com/eacsl2012?igsh=MTUyNW95c3dmM21tYQ==" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a 
                href="https://x.com/Eacslphonetics?fbclid=IwVERDUAOMj0NleHRuA2FlbQIxMABzcnRjBmFwcF9pZAwzNTA2ODU1MzE3MjgAAR6hCe2xNn9WcvrAymTP3X-RmtZThkAUffCLo6jM5E4p1uXUwrXx3oFYnrAjPg_aem_yBGW3SHpJKv40n_gaOsD9g" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Company Info and Events Row */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {footerSections.slice(1, 3).map((section, index) => (
              <div key={index} className="text-left">
                <h3 className="text-white text-xl font-bold mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        to={link.href} 
                        className="text-white/80 text-base hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Members & Education and Services Row */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {footerSections.slice(3, 5).map((section, index) => (
              <div key={index} className="text-left">
                <h3 className="text-white text-xl font-bold mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        to={link.href} 
                        className="text-white/80 text-base hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
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

        {/* Desktop Layout - Grid with 5 columns */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-8">
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
                      <Link 
                        to={link.href} 
                        className="text-white/80 text-base hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
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