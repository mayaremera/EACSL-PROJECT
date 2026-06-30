import React from 'react';

/**
 * Loading spinner shown while fetching fresh data from Supabase.
 *
 * @param {'fullPage' | 'section' | 'inline'} variant
 * @param {string} label - Optional text below the spinner
 */
const PageLoader = ({ variant = 'fullPage', label = 'Loading...' }) => {
  const wrapperClass =
    variant === 'fullPage'
      ? 'min-h-screen bg-gray-50 flex items-center justify-center'
      : variant === 'section'
        ? 'w-full py-20 flex items-center justify-center'
        : 'w-full flex items-center justify-center min-h-[200px]';

  return (
    <div className={wrapperClass} role="status" aria-live="polite" aria-label={label}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 border-4 border-[#5A9B8E]/30 border-t-[#5A9B8E] rounded-full animate-spin"
          aria-hidden="true"
        />
        {label && <p className="text-gray-600 text-sm font-medium">{label}</p>}
      </div>
    </div>
  );
};

export default PageLoader;
