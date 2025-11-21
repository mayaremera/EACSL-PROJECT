import React, { useState } from 'react';

/**
 * ImagePlaceholder component that displays a colored background with the first letter
 * when no image is provided or when image fails to load
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} name - Name/text to extract first letter from (defaults to alt text)
 * @param {string} className - Additional CSS classes
 * @param {string} placeholderColor - Background color for placeholder (default: #5A9B8E)
 * @param {function} onError - Optional error handler
 * @param {object} ...props - Other img tag props
 */
const ImagePlaceholder = ({ 
    src, 
    alt = '', 
    name, 
    className = '', 
    placeholderColor,
    onError,
    ...props 
}) => {
    const [imageError, setImageError] = useState(!src);

    // Get the first letter from name or alt text
    const getFirstLetter = () => {
        const text = name || alt || '?';
        return text.charAt(0).toUpperCase();
    };

    // Generate a color based on the first letter for consistency
    const getColorForLetter = (letter) => {
        const colors = [
            '#5A9B8E', '#5A9B8E', '#4A8B7E', '#2d6b61', 
            '#6B8E23', '#4682B4', '#8B4513', '#708090',
            '#CD5C5C', '#9370DB', '#20B2AA', '#FF6347'
        ];
        const index = letter.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const letter = getFirstLetter();
    const bgColor = placeholderColor || getColorForLetter(letter);

    const handleError = (e) => {
        setImageError(true);
        if (onError) {
            onError(e);
        }
    };

    // If no src or image failed to load, show placeholder
    if (!src || imageError) {
        return (
            <div 
                className={`flex items-center justify-center ${className}`}
                style={{ backgroundColor: bgColor }}
            >
                <span 
                    className="text-white font-bold"
                    style={{ 
                        fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    {letter}
                </span>
            </div>
        );
    }

    // Show image with fallback
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={handleError}
            {...props}
        />
    );
};

export default ImagePlaceholder;

