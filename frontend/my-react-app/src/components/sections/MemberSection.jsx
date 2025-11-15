import React from 'react';
import { useActiveMembersCount } from '../../hooks/useActiveMembersCount';

const MemberSection = () => {
    const { count } = useActiveMembersCount();

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
                <div className="mb-6">
                    <div className="text-5xl lg:text-6xl font-bold text-white mb-2">
                        {count}+
                    </div>
                    <div className="text-lg lg:text-xl text-teal-200 font-medium">
                        Active Members
                    </div>
                </div>
                <h2 className="text-[2.5rem] lg:text-5xl font-semibold text-white mb-8 leading-tight">
                    Want to become a member<br />of EACSL?
                </h2>

                <a className="text-[1rem] lg:text-lg px-10 py-4 bg-[#5A9B8E] text-white font-semibold rounded-md hover:bg-[#4A8B7E] transition-all duration-300 shadow-lg" href='/apply-membership'>
                    Become a member
                </a>
            </div>
        </section>
    );
};

export default MemberSection;