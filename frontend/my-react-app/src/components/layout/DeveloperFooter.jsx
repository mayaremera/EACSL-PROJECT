import React from "react";

const DeveloperFooter = () => {
  return (
    <div className="bg-[#e8eaef] border-t border-gray-300 py-2.5 md:py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a
          href="https://youssefashour.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-gray-600 text-xs md:text-sm hover:text-gray-800 transition-colors duration-200"
        >
          © 2025 All rights reserved · Designed & Developed by{" "}
          <span className="font-semibold text-[#5A9B8E] hover:underline">
            Youssef Ashour
          </span>
        </a>
      </div>
    </div>
  );
};

export default DeveloperFooter;
