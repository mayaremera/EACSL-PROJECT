import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import logo from '../../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    {
      name: 'Events',
      dropdown: [
        { name: 'Upcoming Events', href: '/upcoming-events' },
        { name: 'Live Events', href: '/live-events' },
        { name: 'Past Events', href: '/past-events' },
      ],
    },
    {
      name: 'Members',
      dropdown: [
        { name: 'Active Members', href: '/members-overview' },
        { name: 'Become a Member', href: '/apply-membership' },
        { name: 'Member Login', href: '/' },
      ],
    },
    {
      name: 'Education',
      dropdown: [
        { name: 'Continuing Education', href: '/continuing-education' },
        { name: 'Online Courses', href: '/online-courses' },
        { name: 'Articles', href: '/articles' },
      ],
    },
    {
      name: 'Services',
      dropdown: [
        { name: 'Reservation', href: '/reservation' },
        { name: 'Therapy Programs', href: '/therapy-programs' },
        { name: 'For Parents', href: '/for-parents' },
      ],
    },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={logo} alt="EACSL Logo" className="h-12" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" ref={dropdownRef}>
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {!link.dropdown ? (
                  <a
                    href={link.href}
                    className="text-gray-700 hover:text-teal-600 transition-colors duration-200 text-base font-semibold"
                  >
                    {link.name}
                  </a>
                ) : (
                  <>
                    <button
                      onClick={() => toggleDropdown(link.name)}
                      className="flex items-center gap-1 text-gray-700 hover:text-teal-600 font-semibold transition-colors duration-200"
                    >
                      {link.name}
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${
                          activeDropdown === link.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === link.name && (
                      <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-56">
                        {link.dropdown.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors text-sm font-medium"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Search and CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Anything"
                className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors">
                <Search size={20} />
              </button>
            </div>
            <a className="bg-[#4C9A8F] hover:bg-[#57A79B] text-white border border-[#4c9a8f] px-6 py-2.5 text-[0.8rem] rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap" href="/apply-membership">
              Become a member
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-700 hover:text-teal-600 transition-colors"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {!link.dropdown ? (
                    <a
                      href={link.href}
                      className="text-gray-700 hover:text-teal-600 transition-colors duration-200 text-base font-medium py-2 block"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <details className="group">
                      <summary className="cursor-pointer text-gray-700 hover:text-teal-600 text-base font-medium flex justify-between items-center py-2">
                        {link.name}
                        <ChevronDown size={18} className="group-open:rotate-180 transition-transform duration-200" />
                      </summary>
                      <div className="pl-4 mt-2 space-y-2">
                        {link.dropdown.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="block text-gray-600 hover:text-teal-600 text-sm font-medium transition-colors"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
              {/* Mobile Search and CTA */}
              <div className="pt-4 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Anything"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors">
                    <Search size={20} />
                  </button>
                </div>
                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200">
                  Become a member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
 