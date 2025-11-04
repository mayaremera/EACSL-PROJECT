import React from "react";
// import { Play } from "lucide-react";
import EventCard from "../cards/EventCard";

const HeroSection = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#f7f8fa] py-20">
            {/* Curved white shape on the right */}
            {/* <div className="absolute top-0 right-0 h-full w-[65%] lg:w-[55%] rounded-l-[10rem] bg-white shadow-sm"></div> */}

            {/* Content container */}
            <div className="relative z-10 max-w-7xl w-full mx-auto grid lg:grid-cols-2 items-center gap-16 px-6 md:px-12 lg:px-8">
                {/* LEFT SIDE */} 
                <div className="space-y-8">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Learning Business <br /> For The Future
                    </h1>
                    <p className="text-lg text-[#5a6270] max-w-md">
                        Nisl Quisque Nunc At Cras Tristique. Lectus Scelerisque Sed Id Nisi Vitae
                        Venenatis.
                    </p>
                    {/* <button className="px-8 py-3 border border-[#4c9a8f] text-[#4c9a8f] rounded-full font-medium transition-all duration-300 hover:bg-[#4c9a8f]/10">
                        Register Now
                    </button> */}
                    <button className="px-8 py-3 border-2 border-[#5A9B8E] text-[#5A9B8E] font-semibold rounded-md hover:bg-[#5A9B8E] hover:text-white transition-all duration-300">
                            Register Now
                        </button>
                </div>

                {/* RIGHT SIDE */}
                <div className="relative flex items-center justify-center h-[420px]">
                    <EventCard/>
                    
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
