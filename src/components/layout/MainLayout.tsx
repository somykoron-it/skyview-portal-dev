import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "../landing/Footer";

type MainLayoutProps = {
  children: ReactNode;
  withFooter?: boolean;
};

export function MainLayout({ children, withFooter = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {children}
      </main>
      
      {withFooter && <Footer />}
    </div>
  );
}