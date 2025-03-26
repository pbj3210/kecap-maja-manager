
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  LayoutDashboard, 
  FileText, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari aplikasi",
    });
  };

  const navItems = [
    { path: "/", label: "Beranda", icon: <Home size={20} /> },
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/kak", label: "Kerangka Acuan Kerja", icon: <FileText size={20} /> },
  ];

  return (
    <aside className={cn(
      "h-screen bg-sidebar sticky top-0 flex flex-col border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-[70px]" : "w-[250px]"
    )}>
      {/* Sidebar Header */}
      <div className="p-4 flex items-center border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/fff856ca-c3ac-427d-910f-fb9cd30460d2.png" 
            alt="Kecap Maja Logo" 
            className="w-10 h-10 object-contain"
          />
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Kecap Maja</h1>
              <p className="text-xs text-sidebar-foreground/70">Keuangan Cekatan Anggaran Pengadaan</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Collapse button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-16 bg-sidebar border border-sidebar-border rounded-full h-6 w-6 p-0 flex items-center justify-center shadow-md z-10"
        onClick={toggleSidebar}
      >
        {isCollapsed ? 
          <ChevronRight className="h-4 w-4 text-sidebar-foreground" /> : 
          <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
        }
      </Button>
      
      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User info and logout */}
      {user && (
        <div className={cn(
          "p-4 border-t border-sidebar-border",
          isCollapsed ? "text-center" : ""
        )}>
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
              {user.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="ml-2">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/70">{user.role}</p>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size={isCollapsed ? "icon" : "default"}
            className="w-full border-orange-300 hover:bg-orange-100 hover:text-orange-700"
            onClick={handleLogout}
          >
            <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
