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
        <section className="bg-gray-50 py-12 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Left Text */}
                    <div className="lg:w-1/[50%]">
                        <h3 className="text-[1.5rem] lg:text-3xl text-center lg:text-left font-semibold text-gray-800">
                            Trusted by the best in the world
                        </h3>
                    </div>

                    {/* Brand Logos */}
                    <div className="lg:w-[50%] flex flex-wrap items-center justify-center lg:justify-end gap-8 lg:gap-12">
                        {brands.map((brand, index) => (
                            <div
                                key={index}
                                className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="h-12 lg:h-16 w-auto object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedBrandsSection;