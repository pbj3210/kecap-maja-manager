
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";

const Layout = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Main content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          isSidebarCollapsed ? "ml-[70px]" : "ml-[250px]",
          "px-2" // Reduced padding to move content closer to sidebar
        )}>
          <div className="w-full mx-auto py-6">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className={cn(
          "bg-secondary py-6 transition-all duration-300",
          isSidebarCollapsed ? "ml-[70px]" : "ml-[250px]"
        )}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} Kecap Maja - BPS Kabupaten Majalengka
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Maju Aman Jeung Amanah</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
