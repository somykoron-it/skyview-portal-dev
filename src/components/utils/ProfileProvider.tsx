import React, { createContext, useContext, useEffect } from "react";
import { useProfileLoader } from "@/hooks/account-management/useProfileLoader";
import { Profile } from "@/hooks/account-management/types";
import { User } from "@supabase/supabase-js";
import { useLocation } from "react-router-dom";

interface ProfileContextType {
  isProfileLoading: boolean;
  profileLoadError: string | null;
  userEmail: string | null;
  profile: Profile | null;
  authUser: User | null;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};

// List of public routes that should not redirect on auth failure
const PUBLIC_ROUTES = [
  '/',
  '/login', 
  '/signup', 
  '/forgot-password', 
  '/reset-password',
  '/about',
  '/privacy-policy',
  '/refunds',
  '/release-notes',
  '/help'
];

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine if we should redirect on auth failure based on current path
  const shouldRedirect = !PUBLIC_ROUTES.includes(currentPath);
  
  const {
    isLoading: isProfileLoading,
    loadError: profileLoadError,
    userEmail,
    profile,
    authUser,
    retryLoading: refreshProfile
  } = useProfileLoader({ redirectOnFailure: shouldRedirect });

  useEffect(() => {
    if (profile) {
      console.log("Global profile loaded:", profile.id);
    }
  }, [profile]);

  return (
    <ProfileContext.Provider
      value={{
        isProfileLoading,
        profileLoadError,
        userEmail,
        profile,
        authUser,
        refreshProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};