// import React from "react";

// const EventCard = () => {
//     return (
//         <div className="w-full max-w-[380px] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
//             {/* Image Section */}
//             <div className="relative">
//                 <img
//                     src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
//                     alt="Workspace"
//                     className="w-full h-[200px] object-cover"
//                 />

//                 {/* Date Badge */}
//                 <div className="absolute top-0 left-0 bg-[#8B0000] text-white rounded-tr-2xl rounded-br-full w-[90px] h-[90px] flex flex-col items-center justify-center">
//                     <div className="text-xl font-bold">2025</div>
//                     <div className="text-xs font-medium">25, June</div>
//                 </div>
//             </div>

//             {/* Content Section */}
//             <div className="px-5 py-6">
//                 {/* Title */}
//                 <h1 className="text-3xl font-extrabold text-black mb-1 leading-tight">
//                     SLPIP
//                 </h1>

//                 {/* Subtitle */}
//                 <p className="text-sm font-medium text-gray-700 mb-5">
//                     Speech Language Pathology International Program
//                 </p>

//                 {/* Team Grid */}
//                 <div className="grid grid-cols-2 gap-4">
//                     {/* Person 1 */}
//                     <div className="flex items-center gap-2">
//                         <img
//                             src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
//                             alt="Dr Jacob Jones"
//                             className="w-8 h-8 rounded-full object-cover"
//                         />
//                         <div>
//                             <div className="text-xs font-bold text-black">Dr/ Jacob Jones</div>
//                             <div className="text-[10px] text-gray-600">Photography Expert</div>
//                         </div>
//                     </div>

//                     {/* Person 2 */}
//                     <div className="flex items-center gap-2">
//                         <img
//                             src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
//                             alt="Dr Jacob Jones"
//                             className="w-8 h-8 rounded-full object-cover"
//                         />
//                         <div>
//                             <div className="text-xs font-bold text-black">Dr/ Jacob Jones</div>
//                             <div className="text-[10px] text-gray-600">Photography Expert</div>
//                         </div>
//                     </div>

//                     {/* Person 3 */}
//                     <div className="flex items-center gap-2">
//                         <img
//                             src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
//                             alt="Dr Jacob Jones"
//                             className="w-8 h-8 rounded-full object-cover"
//                         />
//                         <div>
//                             <div className="text-xs font-bold text-black">Dr/ Jacob Jones</div>
//                             <div className="text-[10px] text-gray-600">Photography Expert</div>
//                         </div>
//                     </div>

//                     {/* Person 4 */}
//                     <div className="flex items-center gap-2">
//                         <img
//                             src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
//                             alt="Dr Jacob Jones"
//                             className="w-8 h-8 rounded-full object-cover"
//                         />
//                         <div>
//                             <div className="text-xs font-bold text-black">Dr/ Jacob Jones</div>
//                             <div className="text-[10px] text-gray-600">Photography Expert</div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EventCard;
















import React from "react";

const EventCard = () => {
    return (
        <div className="w-full max-w-[460px] bg-gray-100 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
            {/* Image Section */}
            <div className="relative">
                <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                    alt="Workspace"
                    className="w-full h-[300px] object-cover"
                />

                {/* Date Badge */}
                <div className="absolute top-0 left-0 bg-[#8B0000] text-white rounded-tr-3xl rounded-br-full w-[110px] h-[110px] flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold leading-none">2025</div>
                    <div className="text-sm font-medium">25, June</div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-6">
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

export default EventCard;
