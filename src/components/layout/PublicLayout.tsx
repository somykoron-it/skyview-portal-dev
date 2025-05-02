import { ReactNode } from "react";
import { MainLayout } from "./MainLayout";
import { AuthWrapper } from "../version2/auth/AuthWrapper";

type PublicLayoutProps = {
  children: ReactNode;
  withNav?: boolean;
  withFooter?: boolean;
};

export function PublicLayout({ 
  children, 
  withNav = true,
  withFooter = true
}: PublicLayoutProps) {
  return (
    <AuthWrapper requireAuth={false}>
      {withNav ? (
        <MainLayout withFooter={withFooter}>
          {children}
        </MainLayout>
      ) : (
        // For auth pages that don't need nav/footer
        <div className="min-h-screen">
          {children}
        </div>
      )}
    </AuthWrapper>
  );
}