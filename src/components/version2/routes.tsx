import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

// Import your page components
import Home from "@/pages/New/Home";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/New/SignUp";
import { PublicLayout } from "../layout/PublicLayout";
import { ProtectedLayout } from "../layout/ProtectedLayout";
import Dashboard from "@/pages/New/Dashboard";
import Chat from "@/pages/New/Chat";
import { AuthProvider } from "./auth/AuthContext";
import Login from "@/pages/New/Login";

// Add more page imports as needed

export function AppRoutes() {
  return (
    <AuthProvider>
      {/* Global components */}
      <Toaster />
      
      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } 
        />
        
        {/* Auth pages - without nav/footer */}
        <Route 
          path="/login" 
          element={
            <PublicLayout withNav={false} withFooter={false}>
              <Login />
            </PublicLayout>
          } 
        />
        <Route 
          path="/registration" 
          element={
              <SignUp />
          } 
        />
        <Route 
          path="/signup" 
          element={
              <SignUp />
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            <PublicLayout withNav={false} withFooter={false}>
              <SignUp />
            </PublicLayout>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } 
        />
  <Route 
          path="/chat" 
          element={
            <ProtectedLayout>
              <Chat />
            </ProtectedLayout>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}