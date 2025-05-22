
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/layout/AppLayout";
import LandingPage from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import ResumeBuilder from "@/pages/ResumeBuilder";
import ResumeScannerPage from "@/pages/ResumeScanner";
import CoverLetterGenerator from "@/pages/CoverLetterGenerator";
import SkillGapAnalyzer from "@/pages/SkillGapAnalyzer";
import MockInterview from "@/pages/MockInterview";


const App = () => {
  // Create a new QueryClient instance inside the component
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="resume-builder" element={<ResumeBuilder />} />
                <Route path="resume-scanner" element={<ResumeScannerPage />} />
                <Route path="cover-letter" element={<CoverLetterGenerator />} />
                <Route path="skill-gap" element={<SkillGapAnalyzer />} />
                <Route path="mock-interview" element={<MockInterview />} />
                
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
