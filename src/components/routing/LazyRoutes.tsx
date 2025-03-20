
import { lazy } from "react";

// Fix lazy loading to handle named exports vs default exports
export const Index = lazy(() => import("@/pages/Index"));

// For Login component which is now a default export
export const Login = lazy(() => import("@/pages/Login").then(module => ({ default: module.default })));

export const SignUp = lazy(() => import("@/pages/SignUp"));
export const Chat = lazy(() => import("@/pages/Chat"));
export const Account = lazy(() => import("@/pages/Account"));
export const Settings = lazy(() => import("@/pages/Settings"));
export const Dashboard = lazy(() => import("@/pages/Dashboard"));
export const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
export const About = lazy(() => import("@/pages/About"));
export const ReleaseNotes = lazy(() => import("@/pages/ReleaseNotes"));
export const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
export const Refunds = lazy(() => import("@/pages/Refunds"));
export const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const HelpCenter = lazy(() => import("@/pages/HelpCenter"));
