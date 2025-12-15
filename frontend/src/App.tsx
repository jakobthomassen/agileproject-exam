import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SetupTemplates from "./pages/SetupTemplates";
import SetupMethod from "./pages/SetupMethod";
import SetupManual from "./pages/SetupManual";
import SetupAI from "./pages/SetupAI";
import SetupSummary from "./pages/SetupSummary";
import Dashboard from "./pages/Dashboard";
import DashboardEdit from "./pages/DashboardEdit";
import { Navbar } from "./components/layout/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop";



export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<SetupTemplates />} />
        <Route path="/setup/method" element={<SetupMethod />} />
        <Route path="/setup/manual" element={<SetupManual />} />
        {/* 1. New Event Route */}
        <Route path="/setup/ai" element={<SetupAI />} />
        
        {/* 2. Existing Event Route (CRITICAL FOR BACK BUTTON) */}
        <Route path="/event/:eventId/setup/ai" element={<SetupAI />} />
        
        {/* 1. EXISTING: For creating a NEW event (in-memory wizard) */}
        <Route path="/setup/summary" element={<SetupSummary />} />

        {/* 2. NEW: For viewing an EXISTING event from Dashboard (DB fetch) */}
        <Route path="/event/:eventId/setup/summary" element={<SetupSummary />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/edit/:id" element={<DashboardEdit />} />
      </Routes>
    </>
  );
}