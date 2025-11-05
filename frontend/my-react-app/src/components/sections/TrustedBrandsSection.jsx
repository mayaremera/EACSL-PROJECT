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
                    <div className="lg:w-1/4">
                        <h3 className="text-xl font-bold text-gray-800">
                            Trusted by the best in the world
                        </h3>
                    </div>

                    {/* Brand Logos */}
                    <div className="lg:w-3/4 flex flex-wrap items-center justify-center lg:justify-end gap-8 lg:gap-12">
                        {brands.map((brand, index) => (
                            <div
                                key={index}
                                className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className={`${brand.name === 'Walmart' ? 'h-8' : 'h-6'} w-auto object-contain`}
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