import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home,
    CreditCard,
    Users,
    TrendingUp,
    DollarSign,
    BookOpen,
    Settings,
    Wrench,
    Award,
} from "lucide-react";

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState("Dashboard");

    const menuItems = [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: CreditCard, label: "Courses", path: "/dashboard-course-editor" },
        { icon: Users, label: "Accounts", path: "/accounts" },
        { icon: TrendingUp, label: "Investments", path: "/investments" },
        { icon: DollarSign, label: "Credit Cards", path: "/credit-cards" },
        { icon: BookOpen, label: "Loans", path: "/loans" },
        { icon: Wrench, label: "Services", path: "/services" },
        { icon: Award, label: "My Privileges", path: "/privileges" },
        { icon: Settings, label: "Setting", path: "/settings" },
    ];

    const handleMenuClick = (item) => {
        setActiveItem(item.label);
        navigate(item.path);
    };

    return (
        
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg flex flex-col">
                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.label;

                            return (
                                <li key={item.label}>
                                    <button
                                        onClick={() => handleMenuClick(item)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                                ? "bg-teal-50 text-[#4C9A8F] font-medium"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <Icon
                                            size={20}
                                            className={isActive ? "text-[#4C9A8F]" : "text-gray-400"}
                                        />
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">JD</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">John Doe</p>
                            <p className="text-xs text-gray-500">john@example.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Demo */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
                    <p className="text-gray-600 mb-8">
                        Welcome back! Here's what's happening with your courses today.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
