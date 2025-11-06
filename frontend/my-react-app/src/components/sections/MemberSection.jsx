import React from 'react';

const MemberSection = () => {
    return (
        <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-8">
                <h2 className="text-[2.5rem] lg:text-5xl font-semibold text-white mb-8 leading-tight">
                    Want to become a member<br />of EACSL?
                </h2>

                <button className="text-[1rem] lg:text-lg px-10 py-4 bg-[#5A9B8E] text-white font-semibold rounded-md hover:bg-[#4A8B7E] transition-all duration-300 shadow-lg">
                    Become a member
                </button>
            </div>
        </section>
    );
};

export default MemberSection;