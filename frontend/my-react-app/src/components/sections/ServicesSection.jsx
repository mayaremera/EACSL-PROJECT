import React from 'react';
import { ArrowRight } from 'lucide-react';

const ServicesSection = () => {
    const services = [
        {
            title: 'إعادة تأهيل',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
            position: 'top-0 left-1/2 -translate-x-1/2',
            size: 'w-80 h-56'
        },
        {
            title: 'احجز الآن',
            image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80',
            position: 'bottom-0 left-0',
            size: 'w-80 h-56'
        },
        {
            title: 'للآباء',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
            position: 'bottom-0 right-0',
            size: 'w-80 h-56'
        }
    ];

    return (
        <section className="bg-gray-100 py-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div>
                        <h2 className="text-6xl font-bold text-black leading-tight mb-8">
                            Check out<br />
                            the big<br />
                            variation of<br />
                            services!
                        </h2>

                        <a
                            href="#"
                            className="inline-flex items-center gap-2 text-[#5A9B8E] text-lg font-semibold group"
                        >
                            <span className="relative">
                                View All Services
                                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#5A9B8E] group-hover:w-full transition-all duration-300"></span>
                            </span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </a>
                    </div>

                    {/* Right Images Grid */}
                    <div className="relative h-[500px]">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className={`absolute ${service.position} ${service.size} group cursor-pointer`}
                            >
                                <div className="relative w-full h-full rounded-xl overflow-hidden border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <h3 className="text-white text-3xl font-bold drop-shadow-lg">
                                            {service.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;