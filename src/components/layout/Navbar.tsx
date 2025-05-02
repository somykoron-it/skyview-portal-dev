import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../version2/auth/AuthContext";
export function Navbar() {
  const { isAuthenticated, user, profile, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Helper function to get user initials for avatar fallback
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <nav className="bg-[#1B375F] backdrop-blur-sm sticky top-0 z-50 border-b border-border/40">
      <div className="container mx-auto lg:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Nav Items */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200"
              aria-label="SkyGuide"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center"
              >
                <img
                  src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png"
                  alt="SkyGuide Logo - Your trusted companion for contract interpretation"
                  className="h-6 w-auto md:h-8"
                  style={{
                    filter: "drop-shadow(0 0 5px rgba(212, 175, 55, 0.3))",
                    transition: "filter 0.3s ease",
                  }}
                />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-foreground text-xl md:text-2xl font-bold rich-text"
              >
                SkyGuide
              </motion.span>
            </Link>
          </div>

          {/* Auth and User Menu */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                {/* Notifications */}
                {/* <NotificationsMenu /> */}
                {/* Desktop Navigation */}
                <div className="hidden md:block ml-10">
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/dashboard"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    {/* Add more nav links as needed */}
                  </div>
                </div>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative rounded-full h-8 w-8 p-0 ml-2"
                    >
                      <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-brand-gold/20 text-brand-gold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{profile?.full_name || "User"}</span>
                        <span className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin"
                          className="flex items-center cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white"
                  >
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <Button
                onClick={toggleMobileMenu}
                variant="ghost"
                size="sm"
                className="text-gray-300"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/90 border-b border-white/10">
          <Link
            to="/dashboard"
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={toggleMobileMenu}
          >
            Dashboard
          </Link>
          {/* Add more mobile nav links as needed */}

          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMobileMenu}
              >
                Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMobileMenu}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  signOut();
                  toggleMobileMenu();
                }}
                className="text-gray-300 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
