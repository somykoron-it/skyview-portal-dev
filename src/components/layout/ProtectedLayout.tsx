import { ReactNode } from "react";
import { MainLayout } from "./MainLayout";
import { AuthWrapper } from "../version2/auth/AuthWrapper";

type ProtectedLayoutProps = {
  children: ReactNode;
  adminOnly?: boolean;
  withFooter?: boolean;
};

export function ProtectedLayout({ 
  children, 
  adminOnly = false,
  withFooter = false
}: ProtectedLayoutProps) {
  return (
    <AuthWrapper requireAuth={true} adminOnly={adminOnly}>
      <MainLayout withFooter={withFooter}>
        {children}
      </MainLayout>
    </AuthWrapper>
  );
}