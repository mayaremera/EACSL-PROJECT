import React from 'react';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700">
          Go Home
        </a>
      </div>
    </div>
  );
}

export default NotFoundPage;
