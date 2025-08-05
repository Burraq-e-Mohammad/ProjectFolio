import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "./pages/Home";
import About from "./pages/About";
import WhyUs from "./pages/WhyUs";
import Instructions from "./pages/Instructions";
import Contact from "./pages/Contact";
import Browse from "./pages/Browse";
import PostAd from "./pages/PostAd";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Cart from "./pages/Cart";
import ProjectDetails from "./pages/ProjectDetails";
import VerifyEmail from "./pages/VerifyEmail";
import MyProjects from "./pages/MyProjects";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import PaymentInstructions from "./pages/PaymentInstructions";
import EditPaymentOrder from './pages/EditPaymentOrder';
import PaymentOrders from "./pages/PaymentOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/why-us" element={<WhyUs />} />
              <Route path="/instructions" element={<Instructions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/post-ad" element={
                <ProtectedRoute>
                  <PostAd />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={
                <ProtectedRoute requireAdmin={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/my-projects" element={
                <ProtectedRoute>
                  <MyProjects />
                </ProtectedRoute>
              } />
              <Route path="/payment-orders" element={
                <ProtectedRoute>
                  <PaymentOrders />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/checkout-success" element={
                <ProtectedRoute>
                  <CheckoutSuccess />
                </ProtectedRoute>
              } />
              <Route path="/payment-instructions" element={
                <ProtectedRoute>
                  <PaymentInstructions />
                </ProtectedRoute>
              } />
              <Route path="/edit-payment-order" element={<EditPaymentOrder />} />
              <Route path="/project/:id" element={<ProjectDetails />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
