import React from 'react';
import { Users, Code, Smartphone, TrendingUp, Award, CheckCircle, Star, MessageSquare, Target, Zap } from 'lucide-react';
import HeroSection from '../components/sections/HeroSection';
import AboutUsSection from '../components/sections/AboutUsSection'
import MemberSection from '../components/sections/MemberSection'
import TrustedBrandsSection from '../components/sections/TrustedBrandsSection';

export default function HomePage() {
    return (
        <div>
            <HeroSection />
            <AboutUsSection/>
            <TrustedBrandsSection/>
            <MemberSection/>

        </div>

    );
}