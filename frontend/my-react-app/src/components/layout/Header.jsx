import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Menu, X, ChevronDown, LogOut, User, Calendar, UserCircle, BookOpen, Users, FileText, GraduationCap, Brain, Baby, Loader2 } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import { membersManager } from '../../utils/dataManager';
import { searchService } from '../../services/searchService';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, getMemberByUserId } = useAuth();
  
  // Get member data for logged-in user
  useEffect(() => {
      if (user) {
      const member = getMemberByUserId(user.id);
      if (member) {
        setMemberData(member);
      } else {
        // Try to find by email as fallback (use cached data for fast access)
        const allMembers = membersManager._getAllFromLocalStorage();
        const memberByEmail = allMembers.find(m => m.email === user.email);
        if (memberByEmail) {
          setMemberData(memberByEmail);
        }
      }
    } else {
      setMemberData(null);
    }
  }, [user, getMemberByUserId]);

  // Handle scroll behavior for sticky header
  // Completely disable sticky behavior on mobile/tablet
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 80; // Start sticky behavior after 80px
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      
      // On mobile/tablet, completely disable sticky behavior - always use relative positioning
      if (isMobile) {
        setIsScrolled(false);
        setIsVisible(true);
        return;
      }
      
      // Desktop behavior
      if (currentScrollY < scrollThreshold) {
        // At the top - show header in normal position
        setIsScrolled(false);
        setIsVisible(true);
      } else {
        // Past threshold - use sticky behavior
        setIsScrolled(true);
        
        const scrollDelta = currentScrollY - lastScrollYRef.current;
        
        if (scrollDelta > 0) {
          // Scrolling down - show header (it follows you)
          setIsVisible(true);
        } else if (scrollDelta < 0) {
          // Scrolling up - hide header smoothly
          setIsVisible(false);
        }
      }
      
      lastScrollYRef.current = currentScrollY;
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Handle window resize to update mobile detection
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        // Reset to relative positioning on mobile
        setIsScrolled(false);
        setIsVisible(true);
      } else {
        // Re-check scroll position on desktop
        handleScroll();
      }
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        // Add timeout to prevent hanging
        const searchPromise = searchService.searchAll(searchQuery);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Search timeout')), 10000)
        );
        
        const results = await Promise.race([searchPromise, timeoutPromise]);
        setSearchResults(results);
        setIsSearching(false);
        setShowSearchDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({
          members: [],
          events: [],
          articles: [],
          courses: [],
          therapyPrograms: [],
          forParents: [],
          total: 0,
          error: error.message || 'Search failed. Please try again.'
        });
        setIsSearching(false);
        setShowSearchDropdown(true);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    };

    // Handle both mouse and touch events for mobile
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Handle search result click
  const handleSearchResultClick = (url, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(url);
  };

  // Get category icon
  const getCategoryIcon = (type) => {
    switch (type) {
      case 'member':
        return <Users size={16} className="text-[#5A9B8E]" />;
      case 'event':
        return <Calendar size={16} className="text-blue-600" />;
      case 'article':
        return <FileText size={16} className="text-purple-600" />;
      case 'course':
        return <GraduationCap size={16} className="text-orange-600" />;
      case 'therapy-program':
        return <Brain size={16} className="text-pink-600" />;
      case 'for-parents':
        return <Baby size={16} className="text-green-600" />;
      default:
        return <Search size={16} className="text-gray-600" />;
    }
  };


  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        // Still close dropdown and clear UI even if API call fails
        // The AuthContext will handle clearing local state
      }
      setUserDropdownOpen(false);
      setIsMenuOpen(false);
      // Redirect to home page after sign out
      window.location.href = '/';
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      setUserDropdownOpen(false);
      setIsMenuOpen(false);
      window.location.href = '/';
    }
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
          { name: 'Our Members', href: '/members-overview' },
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
    <header 
      className={`bg-white shadow-sm z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? `fixed top-0 left-0 right-0 shadow-lg ${
              isVisible 
                ? 'translate-y-0 opacity-100 pointer-events-auto' 
                : '-translate-y-full opacity-0 pointer-events-none'
            }` 
          : 'relative'
      }`}
      style={{
        willChange: isScrolled ? 'transform, opacity' : 'auto',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="EACSL Logo" className="h-12" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" ref={dropdownRef}>
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {!link.dropdown ? (
                  <Link
                    to={link.href}
                    className="text-base font-semibold text-gray-700 hover:text-[#5A9B8E] transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleDropdown(link.name)}
                      className="flex items-center gap-1 text-gray-700 hover:text-[#5A9B8E] font-semibold transition-colors duration-200"
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
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-[#5A9B8E] transition-all duration-200"
                          >
                            {item.name}
                          </Link>
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
            <div className="relative" ref={searchRef}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Anything"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 2) {
                    setShowSearchDropdown(true);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2 && searchResults) {
                    setShowSearchDropdown(true);
                  }
                }}
                className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <Loader2 size={20} className="text-[#5A9B8E] animate-spin" />
                ) : (
                  <Search size={20} className="text-gray-400" />
                )}
              </div>

              {/* Search Dropdown */}
              {showSearchDropdown && searchQuery.trim().length >= 2 && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-96 max-h-[600px] overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <Loader2 size={24} className="animate-spin text-[#5A9B8E] mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Searching...</p>
                    </div>
                  ) : searchResults && searchResults.error ? (
                    <div className="p-8 text-center">
                      <Search size={32} className="text-red-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-red-600 mb-1">Search Error</p>
                      <p className="text-xs text-gray-500">{searchResults.error}</p>
                    </div>
                  ) : searchResults && searchResults.total > 0 ? (
                    <div className="py-2">
                      {/* Members */}
                      {searchResults.members.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <Users size={14} className="text-[#5A9B8E]" />
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Members ({searchResults.members.length})
                            </span>
                          </div>
                          {searchResults.members.map((item) => (
                            <button
                              key={`member-${item.id}`}
                              onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="w-full px-4 py-3 hover:bg-teal-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.title}
                                  </p>
                                  {item.subtitle && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Events */}
                      {searchResults.events.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <Calendar size={14} className="text-blue-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Events ({searchResults.events.length})
                            </span>
                          </div>
                          {searchResults.events.map((item) => (
                            <button
                              key={`event-${item.id}`}
                              onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.title}
                                  </p>
                                  {item.subtitle && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Articles */}
                      {searchResults.articles.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <FileText size={14} className="text-purple-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Articles ({searchResults.articles.length})
                            </span>
                          </div>
                          {searchResults.articles.map((item) => (
                            <button
                              key={`article-${item.id}`}
                              onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.title}
                                  </p>
                                  {item.subtitle && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Courses */}
                      {searchResults.courses.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <GraduationCap size={14} className="text-orange-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Courses ({searchResults.courses.length})
                            </span>
                          </div>
                          {searchResults.courses.map((item) => (
                            <button
                              key={`course-${item.id}`}
                              onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="w-full px-4 py-3 hover:bg-orange-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.title}
                                  </p>
                                  {item.subtitle && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Therapy Programs */}
                      {searchResults.therapyPrograms.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <Brain size={14} className="text-pink-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Therapy Programs ({searchResults.therapyPrograms.length})
                            </span>
                          </div>
                          {searchResults.therapyPrograms.map((item) => (
                            <button
                              key={`therapy-${item.id}`}
                              onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="w-full px-4 py-3 hover:bg-pink-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.title}
                                  </p>
                                  {item.subtitle && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* For Parents */}
                      {searchResults.forParents.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <Baby size={14} className="text-green-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              For Parents ({searchResults.forParents.length})
                            </span>
                          </div>
                          {searchResults.forParents.map((item) => (
                            <button
                              key={`parent-${item.id}`}
                              onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="w-full px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.title}
                                  </p>
                                  {item.subtitle && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Search size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600 mb-1">No results found</p>
                      <p className="text-xs text-gray-500">Try different keywords</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
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
                        <Link
                          to={`/member-profile/${memberData.id}`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-[#5A9B8E] transition-all duration-200"
                        >
                          <UserCircle size={16} />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to={`/continuing-education/${memberData.id}`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-[#5A9B8E] transition-all duration-200"
                        >
                          <BookOpen size={16} />
                          <span>Continuing Education</span>
                        </Link>
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
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border-t border-gray-200 mt-2 rounded-lg hover:scale-[1.02] active:scale-95"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-[#5A9B8E] text-white hover:bg-[#4A8B7E] px-10 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-700 hover:text-[#5A9B8E] transition-colors"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 relative overflow-visible">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {!link.dropdown ? (
                    <Link
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-base font-medium text-gray-700 hover:text-[#5A9B8E] py-2 block transition-all duration-200"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <details className="group">
                      <summary className="cursor-pointer text-gray-700 hover:text-[#5A9B8E] text-base font-medium flex justify-between items-center py-2">
                        {link.name}
                        <ChevronDown size={18} className="group-open:rotate-180 transition-transform duration-200" />
                      </summary>
                      <div className="pl-4 mt-2 space-y-2">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-sm font-medium text-gray-600 hover:text-[#5A9B8E] hover:bg-teal-50 transition-all duration-200 py-1 px-2 rounded-lg"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
              {/* Mobile Search and CTA */}
              <div className="pt-4 space-y-4">
                <div className="relative" ref={searchRef}>
                  <input
                    type="text"
                    placeholder="Search Anything"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim().length >= 2) {
                        setShowSearchDropdown(true);
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.trim().length >= 2 && searchResults) {
                        setShowSearchDropdown(true);
                      }
                    }}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {isSearching ? (
                      <Loader2 size={20} className="text-[#5A9B8E] animate-spin" />
                    ) : (
                      <Search size={20} className="text-gray-400" />
                    )}
                  </div>
                  {/* Mobile Search Results */}
                  {showSearchDropdown && searchQuery.trim().length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[400px] overflow-y-auto z-[100]">
                      {isSearching ? (
                        <div className="p-8 text-center">
                          <Loader2 size={24} className="animate-spin text-[#5A9B8E] mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Searching...</p>
                        </div>
                      ) : searchResults && searchResults.error ? (
                        <div className="p-8 text-center">
                          <Search size={32} className="text-red-300 mx-auto mb-2" />
                          <p className="text-sm font-medium text-red-600 mb-1">Search Error</p>
                          <p className="text-xs text-gray-500">{searchResults.error}</p>
                        </div>
                      ) : searchResults && searchResults.total > 0 ? (
                        <div className="py-2">
                          {/* Members */}
                          {searchResults.members.length > 0 && (
                            <div className="mb-2">
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <Users size={14} className="text-[#5A9B8E]" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  Members ({searchResults.members.length})
                                </span>
                              </div>
                              {searchResults.members.map((item) => (
                                <button
                                  key={`mobile-member-${item.id}`}
                                  onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  className="w-full px-4 py-3 hover:bg-teal-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.title}
                                      </p>
                                      {item.subtitle && (
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                          {item.subtitle}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Events */}
                          {searchResults.events.length > 0 && (
                            <div className="mb-2">
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <Calendar size={14} className="text-blue-600" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  Events ({searchResults.events.length})
                                </span>
                              </div>
                              {searchResults.events.map((item) => (
                                <button
                                  key={`mobile-event-${item.id}`}
                                  onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.title}
                                      </p>
                                      {item.subtitle && (
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                          {item.subtitle}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Articles */}
                          {searchResults.articles.length > 0 && (
                            <div className="mb-2">
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <FileText size={14} className="text-purple-600" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  Articles ({searchResults.articles.length})
                                </span>
                              </div>
                              {searchResults.articles.map((item) => (
                                <button
                                  key={`mobile-article-${item.id}`}
                                  onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.title}
                                      </p>
                                      {item.subtitle && (
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                          {item.subtitle}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Courses */}
                          {searchResults.courses.length > 0 && (
                            <div className="mb-2">
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <GraduationCap size={14} className="text-orange-600" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  Courses ({searchResults.courses.length})
                                </span>
                              </div>
                              {searchResults.courses.map((item) => (
                                <button
                                  key={`mobile-course-${item.id}`}
                                  onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  className="w-full px-4 py-3 hover:bg-orange-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.title}
                                      </p>
                                      {item.subtitle && (
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                          {item.subtitle}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Therapy Programs */}
                          {searchResults.therapyPrograms.length > 0 && (
                            <div className="mb-2">
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <Brain size={14} className="text-pink-600" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  Therapy Programs ({searchResults.therapyPrograms.length})
                                </span>
                              </div>
                              {searchResults.therapyPrograms.map((item) => (
                                <button
                                  key={`mobile-therapy-${item.id}`}
                                  onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  className="w-full px-4 py-3 hover:bg-pink-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.title}
                                      </p>
                                      {item.subtitle && (
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                          {item.subtitle}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          {/* For Parents */}
                          {searchResults.forParents.length > 0 && (
                            <div className="mb-2">
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                <Baby size={14} className="text-green-600" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  For Parents ({searchResults.forParents.length})
                                </span>
                              </div>
                              {searchResults.forParents.map((item) => (
                                <button
                                  key={`mobile-parent-${item.id}`}
                                  onMouseDown={(e) => handleSearchResultClick(item.url, e)}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  className="w-full px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getCategoryIcon(item.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.title}
                                      </p>
                                      {item.subtitle && (
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                          {item.subtitle}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Search size={32} className="text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600 mb-1">No results found</p>
                          <p className="text-xs text-gray-500">Try different keywords</p>
                        </div>
                      )}
                    </div>
                  )}
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
                        <Link
                          to={`/member-profile/${memberData.id}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl font-medium bg-teal-50 hover:bg-teal-100 text-[#5A9B8E] transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          <UserCircle size={18} />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to={`/continuing-education/${memberData.id}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl font-medium bg-teal-50 hover:bg-teal-100 text-[#5A9B8E] transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          <BookOpen size={18} />
                          <span>Continuing Education</span>
                        </Link>
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
                      className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-[#5A9B8E] hover:bg-[#4A8B7E] text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    Login
                  </button>
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
 