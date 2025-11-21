import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Breadcrumb Component
 * Provides consistent breadcrumb navigation across all pages
 * 
 * @param {Array} items - Array of breadcrumb items: [{ label: string, path?: string }]
 *                        If path is not provided, the item is rendered as plain text (current page)
 */
const Breadcrumbs = ({ items = [] }) => {
  // Ensure Home is always first
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    ...items
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center text-sm text-gray-600">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="mx-2">/</span>}
              {item.path ? (
                <Link 
                  to={item.path} 
                  className="hover:text-[#5A9B8E] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs;

