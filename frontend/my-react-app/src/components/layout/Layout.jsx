// src/components/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Container from "./Container";
import SecondFooter from "./SecondFooter";
import DeveloperFooter from "./DeveloperFooter";

function Layout() {
  return (
    <>
      <Header />
      <Container>
        <Outlet /> 
      </Container>
      <Footer />
      <SecondFooter />
      <DeveloperFooter />
    </>
  );
}

export default Layout;
