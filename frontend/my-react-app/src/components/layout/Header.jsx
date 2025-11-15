import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Menu, X, ChevronDown, LogOut, User, Calendar, UserCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import { membersManager } from '../../utils/dataManager';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, signOut, getMemberByUserId } = useAuth();
  
  // Get member data for logged-in user
  useEffect(() => {
    if (user) {
      const member = getMemberByUserId(user.id);
      if (member) {
        setMemberData(member);
      } else {
        // Try to find by email as fallback
        const allMembers = membersManager.getAll();
        const memberByEmail = allMembers.find(m => m.email === user.email);
        if (memberByEmail) {
          setMemberData(memberByEmail);
        }
      }
    } else {
      setMemberData(null);
    }
  }, [user, getMemberByUserId]);

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
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
  };

  // Build navigation links based on user login status
  const navLinks = useMemo(() => {
    const educationDropdown = [
      { name: 'Online Courses', href: '/online-courses' },
      { name: 'Articles', href: '/articles' },
    ];
    
    // Only show Continuing Education for logged-in users
    if (user && memberData) {
      educationDropdown.unshift({
        name: 'Continuing Education',
        href: `/continuing-education/${memberData.id}`,
      });
    }

    return [
      { name: 'Home', href: '/' },
      {
        name: 'Events',
        dropdown: [
          { name: 'Upcoming Events', href: '/upcoming-events' },
          { name: 'Past Events', href: '/past-events' },
        ],
      },
      {
        name: 'Members',
        dropdown: [
          { name: 'Active Members', href: '/members-overview' },
          { name: 'Become a Member', href: '/apply-membership' },
        ],
      },
      {
        name: 'Education',
        dropdown: educationDropdown,
      },
      {
        name: 'Services',
        dropdown: [
          { name: 'Therapy Programs', href: '/therapy-programs' },
          { name: 'Reservation', href: '/reservation' },
          { name: 'For Parents', href: '/for-parents' },
        ],
      },
      { name: 'Contact', href: '/contact' },
    ];
  }, [user, memberData]);

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
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <User size={18} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">
                    {memberData?.name || user.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-700 transition-transform duration-300 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-56">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {memberData?.name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.email}
                      </p>
                    </div>
                    {memberData && (
                      <>
                        <a
                          href={`/member-profile/${memberData.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/member-profile/${memberData.id}`);
                            setUserDropdownOpen(false);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                        >
                          <UserCircle size={16} />
                          <span>Profile</span>
                        </a>
                        <a
                          href={`/continuing-education/${memberData.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/continuing-education/${memberData.id}`);
                            setUserDropdownOpen(false);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                        >
                          <BookOpen size={16} />
                          <span>Continuing Education</span>
                        </a>
                        {memberData.activeTill && (
                          <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>Active till {memberData.activeTill}</span>
                          </div>
                        )}
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-gray-200 mt-2"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-gray-700 hover:text-[#4C9A8F] px-4 py-2 text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                >
                  Login/Signup
                </button>
                <a className="bg-[#4C9A8F] hover:bg-[#57A79B] text-white border border-[#4c9a8f] px-6 py-2.5 text-[0.8rem] rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap" href="/apply-membership">
                  Become a member
                </a>
              </>
            )}
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
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900">
                        {memberData?.name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.email}
                      </p>
                    </div>
                    {memberData && (
                      <>
                        <a
                          href={`/member-profile/${memberData.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/member-profile/${memberData.id}`);
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center space-x-2 bg-teal-50 hover:bg-teal-100 text-teal-600 px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
                        >
                          <UserCircle size={18} />
                          <span>Profile</span>
                        </a>
                        <a
                          href={`/continuing-education/${memberData.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/continuing-education/${memberData.id}`);
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center space-x-2 bg-teal-50 hover:bg-teal-100 text-teal-600 px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
                        >
                          <BookOpen size={18} />
                          <span>Continuing Education</span>
                        </a>
                        {memberData.activeTill && (
                          <div className="px-4 py-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar size={16} />
                              <span>Active till {memberData.activeTill}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
                    >
                      Login/Signup
                    </button>
                    <a
                      href="/apply-membership"
                      className="block w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 text-center"
                    >
                      Become a member
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};

export default Header;
 