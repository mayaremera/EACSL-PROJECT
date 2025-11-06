import React from 'react';

const TrustedBrandsSection = () => {
    const brands = [
        {
            name: 'Google',
            logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'
        },
        {
            name: 'Atlassian',
            logo: 'https://wac-cdn.atlassian.com/dam/jcr:e33efd9e-e0b8-4d61-a24d-68a48ef99ed5/Atlassian-horizontal-blue-rgb.svg'
        },
        {
            name: 'Microsoft',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'
        },
        {
            name: 'Walmart',
            logo: 'https://www.vectorlogo.zone/logos/walmart/walmart-ar21.svg'
        },
        {
            name: 'Amazon',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png'
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
                    <div className="lg:w-[50%] flex flex-wrap items-center justify-center lg:justify-end gap-6 lg:gap-6">
                        {brands
                            .filter(brand => brand.name !== 'Walmart' && brand.name !== 'Amazon')
                            .map((brand, index) => (
                                <div
                                    key={index}
                                    className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                >
                                    <img
                                        src={brand.logo}
                                        alt={brand.name}
                                        className="h-6 w-auto object-contain"
                                    />
                                </div>
                            ))}
                        {/* Walmart Logo - Manually placed for custom sizing */}
                        <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                            <img
                                src="https://www.vectorlogo.zone/logos/walmart/walmart-ar21.svg"
                                alt="Walmart"
                                className="h-[3.7rem] w-auto object-contain"
                            />
                        </div>
                        {/* Amazon Logo - Manually placed for custom sizing and positioning */}
                        <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png"
                                alt="Amazon"
                                className="mt-2 h-6 w-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedBrandsSection;