import React from "react";

const SecondFooter = () => {
    return (
        <div className="bg-[#f4f5f8] border-t border-gray-200 py-3 md:py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center" dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                    <p className="text-gray-700 text-sm md:text-base font-medium mb-1" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                    الجمعية المصرية لعلوم الاتصال واللغويات
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm" style={{ fontFamily: "'Cairo', 'Tajawal', 'Almarai', 'Segoe UI', 'Arial', sans-serif" }}>
                        رقم الإيداع ٣٠٦٠ لسنة ٢٠١٢
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SecondFooter;
