import React from "react";

// EventCard component embedded
const EventCard = () => {
    return (
        <div className="w-full max-w-[460px] bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 p-6">
            {/* Image Section */}
            <div className="relative">
                <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                    alt="Workspace"
                    className="w-full h-[300px] object-cover rounded-2xl"
                />

                {/* Date Badge */}
                <div className="absolute top-0 left-0 bg-[#8B0000] text-white rounded-tr-3xl rounded-br-full w-[110px] h-[110px]">
                    <div className="absolute text-2xl font-bold leading-none" style={{ top: '1.3rem', left: '41%', transform: 'translateX(-50%)' }}>2025</div>
                    <div className="absolute text-sm font-medium" style={{ top: '2.8rem', left: '41%', transform: 'translateX(-50%)' }}>25, June</div>
                </div>
            </div>

            {/* Content Section */}
            <div className="pt-6">
                {/* Title */}
                <h1 className="text-4xl font-extrabold text-black mb-2 leading-tight">
                    SLPIP
                </h1>

                {/* Subtitle */}
                <p className="text-base font-medium text-gray-700 mb-6 leading-snug">
                    Speech Language Pathology International Program
                </p>

                {/* Team Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Person 1 */}
                    <div className="flex items-center gap-2">
                        <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
                            alt="Dr Jacob Jones"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="text-sm font-bold text-black">Dr/ Jacob Jones</div>
                            <div className="text-xs text-gray-600">Photography Expert</div>
                        </div>
                    </div>

                    {/* Person 2 */}
                    <div className="flex items-center gap-2">
                        <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
                            alt="Dr Jacob Jones"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="text-sm font-bold text-black">Dr/ Jacob Jones</div>
                            <div className="text-xs text-gray-600">Photography Expert</div>
                        </div>
                    </div>

                    {/* Person 3 */}
                    <div className="flex items-center gap-2">
                        <img
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
                            alt="Dr Jacob Jones"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="text-sm font-bold text-black">Dr/ Jacob Jones</div>
                            <div className="text-xs text-gray-600">Photography Expert</div>
                        </div>
                    </div>

                    {/* Person 4 */}
                    <div className="flex items-center gap-2">
                        <img
                            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
                            alt="Dr Jacob Jones"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="text-sm font-bold text-black">Dr/ Jacob Jones</div>
                            <div className="text-xs text-gray-600">Photography Expert</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HeroSection = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#f7f8fa] py-20">
            {/* Content container */}
            <div className="relative z-10 max-w-[1400px] w-full mx-auto grid lg:grid-cols-[65%_35%] items-center gap-5 px-6 md:px-12 lg:px-[7rem]">
                {/* LEFT SIDE - 70% */} 
                <div className="space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                        Learning Business <br /> For The Future
                    </h1>
                    <p className="text-lg text-[#5a6270] max-w-md">
                        Nisl Quisque Nunc At Cras Tristique. Lectus Scelerisque Sed Id Nisi Vitae
                        Venenatis.
                    </p>
                    
                    <button className="px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300">
                        Register Now
                    </button>
                </div>

                {/* RIGHT SIDE - 30% */}
                <div className="relative flex items-center justify-end">
                    <EventCard/>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;