import React from 'react';

const Button = React.forwardRef(({ className = '', asChild = false, children, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const combinedClasses = `${baseClasses} ${className}`;
  
  if (asChild) {
    return React.cloneElement(children, {
      className: combinedClasses,
      ref,
      ...props
    });
  }
  
  return (
    <button
      className={combinedClasses}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };