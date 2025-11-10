// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import PastEvents from "../pages/PastEvents";
import SpeakersPage from "../pages/SpeakersPage";
import ScientificCommitteePage from "../pages/ScientificCommitteePage";
import OrganizingCommitteePage from "../pages/OrganizingCommitteePage";
import SeminarsPage from "../pages/SeminarsPage";
import RegistrationPage from "../pages/RegistrationPage";
import GalleryPage from "../pages/GalleryPage";
import EducationPage from "../pages/EducationPage";
import OnlineCoursesPage from "../pages/OnlineCoursesPage";
import ArticlesPage from "../pages/ArticlesPage";
import MembersOverviewPage from "../pages/MembersOverviewPage";
import ApplyMembershipPage from "../pages/ApplyMembershipPage";
import ActiveMembersPage from "../pages/ActiveMembersPage";
import ServicesPage from "../pages/ServicesPage";
import TherapyPrograms from "../pages/TherapyPrograms";
import ForParentsPage from "../pages/ForParentsPage";
import ReservationPage from "../pages/ReservationPage";
import ContactPage from "../pages/ContactPage";
import NotFoundPage from "../pages/NotFoundPage";
import Dashboard from "../pages/Dashboard";
import MemberProfile from "../pages/MemberProfile";
import LiveEventsPage from './../pages/LiveEventsPage';
import ContinuingEducationMember from "../pages/ContinuingEducationMember";
import UpcomingEventsPage from "./../pages/UpcomingEventsPage";
import PastEventsPage from "./../pages/PastEventsPage";
import CourseDetailsPage from './../pages/CourseDetailsPage';

// Layout
import Layout from "../components/layout/Layout";


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}> {/* Header/Footer wrap all pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/past-events" element={<PastEvents />} />
          <Route path="/speakers" element={<SpeakersPage />} />
          <Route path="/scientific-committee" element={<ScientificCommitteePage />} />
          <Route path="/organizing-committee" element={<OrganizingCommitteePage />} />
          <Route path="/seminars" element={<SeminarsPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/online-courses" element={<OnlineCoursesPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/members-overview" element={<MembersOverviewPage />} />
          <Route path="/apply-membership" element={<ApplyMembershipPage />} />
          <Route path="/active-members" element={<ActiveMembersPage />} />
          <Route path="/services" element={<ServicesPage/>} />
          <Route path="/therapy-programs" element={<TherapyPrograms />} />
          <Route path="/for-parents" element={<ForParentsPage />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/member-profile" element={<MemberProfile />} />
          <Route path="/continuing-education" element={<ContinuingEducationMember />} />
          <Route path="/upcoming-events" element={<UpcomingEventsPage />} />
          <Route path="/past-events" element={<PastEventsPage />} />
          <Route path="/course-details" element={<CourseDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
