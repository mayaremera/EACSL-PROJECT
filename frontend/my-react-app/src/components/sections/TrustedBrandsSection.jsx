import React from 'react';
import kabaLogo from '../../assets/kaba.png';
import ashaLogo from '../../assets/asha.png';
import slpipLogo from '../../assets/slpip.png';
import talktoolsLogo from '../../assets/talktools.png';
import saudiLogo from '../../assets/saudi.png';

const TrustedBrandsSection = () => {
    const brands = [
        {
            name: 'KABA',
            logo: kabaLogo
        },
        {
            name: 'ASHA',
            logo: ashaLogo
        },
        {
            name: 'SLPIP',
            logo: slpipLogo
        },
        {
            name: 'TalkTools',
            logo: talktoolsLogo
        },
        {
            name: 'Saudi',
            logo: saudiLogo
        }
    ];

    return (
        <section className="bg-white py-10 sm:py-12 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
                    {/* Left Text */}
                    <div className="lg:w-1/[50%] text-center lg:text-left">
                        <h3 className="text-xl sm:text-[1.5rem] lg:text-3xl font-semibold text-gray-800">
                            Trusted by the best in the world
                        </h3>
                    </div>

                    {/* Brand Logos - 3 per row on mobile, flex on desktop */}
                    <div className="lg:w-[50%] w-full">
                        {/* Mobile: Grid with 3 columns */}
                        <div className="grid grid-cols-3 gap-8 sm:gap-6 lg:hidden items-center justify-items-center">
                            {brands.map((brand, index) => (
                                <div
                                    key={index}
                                    className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                >
                                    <img
                                        src={brand.logo}
                                        alt={brand.name}
                                        className="h-16 sm:h-20 w-auto object-contain"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Desktop: Flex layout */}
                        <div className="hidden lg:flex items-center justify-end gap-8 xl:gap-12">
                            {brands.map((brand, index) => (
                                <div
                                    key={index}
                                    className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                >
                                    <img
                                        src={brand.logo}
                                        alt={brand.name}
                                        className="h-16 w-auto object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedBrandsSection;