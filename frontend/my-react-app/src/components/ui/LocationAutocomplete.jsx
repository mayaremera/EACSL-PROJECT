import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { getAllLocations } from '../../data/locations';

const LocationAutocomplete = ({
  value,
  onChange,
  onBlur,
  placeholder = "Select your location",
  disabled = false,
  error = null,
  touched = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locations] = useState(() => getAllLocations());
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle location selection
  const handleSelectLocation = (location) => {
    onChange(location);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onBlur) {
      onBlur();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => {
          const newIndex = prev < locations.length - 1 ? prev + 1 : prev;
          // Scroll into view
          if (scrollContainerRef.current && newIndex >= 0) {
            const item = scrollContainerRef.current.children[newIndex];
            if (item) {
              item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : 0;
          // Scroll into view
          if (scrollContainerRef.current && newIndex >= 0) {
            const item = scrollContainerRef.current.children[newIndex];
            if (item) {
              item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < locations.length) {
          handleSelectLocation(locations[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setHighlightedIndex(-1);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button/Dropdown Trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        disabled={disabled}
        className={`w-full px-4 py-3 pr-10 bg-white border rounded-lg text-left text-gray-800 focus:outline-none transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${
          touched && error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#5A9B8E]'
        } ${!value ? 'text-gray-400' : ''} ${className}`}
      >
        <span className="block truncate">
          {value || placeholder}
        </span>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div
            ref={scrollContainerRef}
            className="max-h-60 overflow-y-auto article-modal-scroll"
          >
            {locations.map((location, index) => (
              <button
                key={location}
                type="button"
                onClick={() => handleSelectLocation(location)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-4 py-2 hover:bg-[#5A9B8E] hover:text-white transition-colors ${
                  highlightedIndex === index ? 'bg-[#5A9B8E] text-white' : 'text-gray-800'
                } ${value === location ? 'bg-teal-50 font-semibold' : ''}`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {touched && error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;

