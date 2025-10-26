"use client";

import { useEffect, useState } from "react";
import { LandingNavbar } from "@/components/landing-page/landing-navbar";
import { LandingFooter } from "@/components/landing-page/landing-footer";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Mark as loaded after component mounts to enable animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    // Add page transition style
    const style = document.createElement('style');
    style.textContent = `
      .bg-grid-pattern {
        background-image: 
          linear-gradient(to right, rgba(var(--primary) / 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(var(--primary) / 0.05) 1px, transparent 1px);
        background-size: 24px 24px;
      }
      
      @media (prefers-color-scheme: dark) {
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      clearTimeout(timer);
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Add decorative blobs for visual interest */}
      <div className="fixed right-0 top-1/4 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl -z-10 opacity-50" />
      <div className="fixed left-0 bottom-1/4 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl -z-10 opacity-50" />
      
      {/* Navbar with spacing for fixed position */}
      <LandingNavbar />
      <div className="h-16 md:h-20"></div>
      
      {/* Main content with fade-in animation */}
      <main 
        className={`flex-1 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </main>
      
      {/* Footer */}
      <LandingFooter />
    </div>
  );
}