import React from 'react';

function Container({ children }) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}

export default Container;
