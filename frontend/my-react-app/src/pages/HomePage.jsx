import React from 'react';
import { Users, Code, Smartphone, TrendingUp, Award, CheckCircle, Star, MessageSquare, Target, Zap } from 'lucide-react';
import HeroSection from '../components/sections/HeroSection';
import AboutUsSection from '../components/sections/AboutUsSection'
import MemberSection from '../components/sections/MemberSection'
import TrustedBrandsSection from '../components/sections/TrustedBrandsSection';
import ServicesSection from '../components/sections/ServicesSection';
import CoursesSection from '../components/sections/CoursesSection';

export default function HomePage() {
    return (
        <div>
            <HeroSection />
            <AboutUsSection/>
            <CoursesSection/>
            <TrustedBrandsSection/>
            <MemberSection/>
            <ServicesSection/>
        </div>

    );
}