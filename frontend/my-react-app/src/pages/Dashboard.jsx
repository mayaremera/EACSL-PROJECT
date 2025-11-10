import React, { useState, useEffect } from "react";
import {
    Home,
    BookOpen,
    Users,
    Settings,
    Plus,
    Search,
    RefreshCw
} from "lucide-react";
import { coursesManager, membersManager, initializeData } from '../utils/dataManager';
import CourseCard from '../components/cards/CourseCard';
import MemberCard from '../components/cards/MemberCard';
import CourseEditForm from '../components/dashboard/CourseEditForm';
import MemberEditForm from '../components/dashboard/MemberEditForm';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("courses");
    const [courses, setCourses] = useState([]);
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingMember, setEditingMember] = useState(null);
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);

    // Initialize data and load
    useEffect(() => {
        initializeData();
        loadCourses();
        loadMembers();

        // Listen for updates
        window.addEventListener('coursesUpdated', handleCoursesUpdate);
        window.addEventListener('membersUpdated', handleMembersUpdate);

        return () => {
            window.removeEventListener('coursesUpdated', handleCoursesUpdate);
            window.removeEventListener('membersUpdated', handleMembersUpdate);
        };
    }, []);

    const handleCoursesUpdate = (e) => {
        setCourses(e.detail);
    };

    const handleMembersUpdate = (e) => {
        setMembers(e.detail);
    };

    const loadCourses = () => {
        const allCourses = coursesManager.getAll();
        setCourses(allCourses);
    };

    const loadMembers = () => {
        const allMembers = membersManager.getAll();
        setMembers(allMembers);
    };

    const handleSaveCourse = async (courseData) => {
        if (editingCourse) {
            coursesManager.update(editingCourse.id, courseData);
        } else {
            coursesManager.add(courseData);
        }
        loadCourses();
        setEditingCourse(null);
        setIsAddingCourse(false);
    };

    const handleDeleteCourse = (id) => {
        coursesManager.delete(id);
        loadCourses();
    };

    const handleSaveMember = async (memberData) => {
        if (editingMember) {
            membersManager.update(editingMember.id, memberData);
        } else {
            membersManager.add(memberData);
        }
        loadMembers();
        setEditingMember(null);
        setIsAddingMember(false);
    };

    const handleDeleteMember = (id) => {
        membersManager.delete(id);
        loadMembers();
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const menuItems = [
        { icon: BookOpen, label: "Courses", tab: "courses" },
        { icon: Users, label: "Members", tab: "members" },
        { icon: Settings, label: "Settings", tab: "settings" },
    ];

    const handleMenuClick = (item) => {
        setActiveItem(item.label);
        navigate(item.path);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg flex flex-col">
                {/* Logo/Header */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-[#4C9A8F]">EACSL Admin</h1>
                    <p className="text-sm text-gray-500 mt-1">Dashboard</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.tab;

                            return (
                                <li key={item.tab}>
                                    <button
                                        onClick={() => setActiveTab(item.tab)}
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
                            <span className="text-white font-semibold text-sm">AD</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">Admin</p>
                            <p className="text-xs text-gray-500">admin@eacsl.net</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {activeTab === 'courses' ? 'Courses Management' :
                                    activeTab === 'members' ? 'Members Management' :
                                        'Settings'}
                            </h1>
                            <p className="text-gray-600">
                                {activeTab === 'courses' ? 'Manage all courses on the website' :
                                    activeTab === 'members' ? 'Manage all members on the website' :
                                        'Dashboard settings and configuration'}
                            </p>
                        </div>
                        {activeTab === 'courses' && (
                            <button
                                onClick={() => setIsAddingCourse(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors shadow-md"
                            >
                                <Plus size={20} />
                                Add Course
                            </button>
                        )}
                        {activeTab === 'members' && (
                            <button
                                onClick={() => setIsAddingMember(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#4C9A8F] text-white rounded-lg hover:bg-[#3d8178] transition-colors shadow-md"
                            >
                                <Plus size={20} />
                                Add Member
                            </button>
                        )}
                    </div>

                    {/* Courses Tab */}
                    {activeTab === 'courses' && (
                        <div>
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Courses</p>
                                    <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Filtered Results</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredCourses.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <button
                                        onClick={loadCourses}
                                        className="flex items-center gap-2 text-sm text-[#4C9A8F] hover:text-[#3d8178]"
                                    >
                                        <RefreshCw size={16} />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>

                            {/* Courses Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        isDashboard={true}
                                        onEdit={setEditingCourse}
                                        onDelete={handleDeleteCourse}
                                    />
                                ))}
                            </div>

                            {filteredCourses.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-lg">
                                    <p className="text-gray-500">No courses found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div>
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4C9A8F] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Members</p>
                                    <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Filtered Results</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredMembers.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <button
                                        onClick={loadMembers}
                                        className="flex items-center gap-2 text-sm text-[#4C9A8F] hover:text-[#3d8178]"
                                    >
                                        <RefreshCw size={16} />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>

                            {/* Members Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredMembers.map((member) => (
                                    <MemberCard
                                        key={member.id}
                                        {...member}
                                        isDashboard={true}
                                        onEdit={setEditingMember}
                                        onDelete={handleDeleteMember}
                                    />
                                ))}
                            </div>

                            {filteredMembers.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-lg">
                                    <p className="text-gray-500">No members found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard Settings</h2>
                            <p className="text-gray-600">Settings and configuration options will be available here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Forms */}
            {editingCourse && (
                <CourseEditForm
                    course={editingCourse}
                    onSave={handleSaveCourse}
                    onCancel={() => setEditingCourse(null)}
                />
            )}

            {isAddingCourse && (
                <CourseEditForm
                    course={null}
                    onSave={handleSaveCourse}
                    onCancel={() => setIsAddingCourse(false)}
                />
            )}

            {editingMember && (
                <MemberEditForm
                    member={editingMember}
                    onSave={handleSaveMember}
                    onCancel={() => setEditingMember(null)}
                />
            )}

            {isAddingMember && (
                <MemberEditForm
                    member={null}
                    onSave={handleSaveMember}
                    onCancel={() => setIsAddingMember(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
