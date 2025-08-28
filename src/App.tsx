import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateCampaign from "./pages/dashboard/CreateCampaign";
import CampaignList from "./pages/dashboard/CampaignList";
import CampaignDetails from "./pages/dashboard/CampaignDetails";
import AttendeePage from "./pages/AttendeePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={
              <ProtectedRoute requireAuth={false}>
                <SignUp />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/create" element={
              <ProtectedRoute>
                <CreateCampaign />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/campaigns" element={
              <ProtectedRoute>
                <CampaignList />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/campaigns/:id" element={
              <ProtectedRoute>
                <CampaignDetails />
              </ProtectedRoute>
            } />
            <Route path="/campaign/:id" element={<AttendeePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
