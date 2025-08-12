import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import VerificationResult from "@/pages/VerificationResult";
import MerchantLogin from "@/pages/MerchantLogin";
import MerchantRegister from "@/pages/MerchantRegister";
import MerchantDashboard from "@/pages/MerchantDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import ReportIssue from "@/pages/ReportIssue";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify/:batchId" element={<VerificationResult />} />
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/register" element={<MerchantRegister />} />
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="*" element={<div className="text-center text-xl py-16">Page Not Found</div>} />
      </Routes>
    </Router>
  );
}
