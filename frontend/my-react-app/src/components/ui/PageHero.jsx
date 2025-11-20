import React from 'react';

/**
 * Reusable Page Hero Component
 * Provides consistent hero section styling across all pages
 * 
 * @param {string} title - Main title text
 * @param {string} subtitle - Optional subtitle text
 * @param {React.ReactNode} icon - Optional icon component
 * @param {string} className - Additional CSS classes
 */
const PageHero = ({ title, subtitle, icon, className = '' }) => {
  return (
    <div className={`bg-gradient-to-r from-[#4C9A8F] to-[#3d8178] text-white py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {icon && (
            <div className="flex justify-center mb-4">
              {icon}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-teal-50 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHero;

