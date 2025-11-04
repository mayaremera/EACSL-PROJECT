import React from 'react';
import halfCircle from '../../assets/halfLogo.png'

const AboutUsSection = () => {
    return (
        <section className="bg-white py-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div>
                        {/* About Us Label */}
                        <div className="mb-6">
                            <span className="text-sm font-bold tracking-wider text-black">
                                ABOUT US
                            </span>
                        </div>

                        {/* Title with Logo */}
                        <div className="flex items-start mb-8">
                            <img
                                src={halfCircle}
                                alt="Logo"
                                className="w-20 h-20 mt-4"
                            />
                            <h2 className="text-5xl font-bold text-black leading-tight">
                                Learning Business For The Future
                            </h2>
                        </div>

                        {/* Description Paragraphs */}
                        <div className="space-y-6 text-gray-600 text-base leading-relaxed mb-8">
                            <p>
                                Nisl Quisque Nunc At Cras Tristique. Lectus Scelerisque Sed Id Nisi Vitae Venenatis.Nisl Quisque Nunc At Cras Tristique. Lectus Scelerisque Sed Id Nisi Vitae Venenatis.Nisl Quisque Nunc At Cras Tristique. Lectus Scelerisque Sed Id Nisi Vitae Venenatis.Nisl Scelerisque Sed Id Nisi Vitae Venenatis.Nisl
                            </p>
                        </div>

                        {/* View More Button */}
                        <button className="px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300">
                            View More
                        </button>
                    </div>

                    {/* Right Image */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                                alt="Team working together"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUsSection;