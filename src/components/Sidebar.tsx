import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  FileUp
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-secondary border-r border-border",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-16 items-center justify-between px-3 border-b border-border">
        <div className="flex items-center">
          {!isCollapsed && (
            <span className="text-xl font-bold text-orange-500">Kecap Maja</span>
          )}
          {isCollapsed && (
            <span className="text-xl font-bold text-orange-500">KM</span>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <div className="px-3 py-2">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center p-2 rounded-md text-sm group transition-colors hover:bg-orange-600/10",
                  "hover:text-orange-600",
                  isActive ? "bg-orange-100 text-orange-600 font-medium" : "text-muted-foreground"
                )
              }
            >
              <LayoutDashboard className={cn("mr-3 h-5 w-5", isCollapsed && "mr-0")} />
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/kak"
              className={({ isActive }) =>
                cn(
                  "flex items-center p-2 rounded-md text-sm group transition-colors hover:bg-orange-600/10",
                  "hover:text-orange-600",
                  isActive ? "bg-orange-100 text-orange-600 font-medium" : "text-muted-foreground"
                )
              }
            >
              <FileText className={cn("mr-3 h-5 w-5", isCollapsed && "mr-0")} />
              {!isCollapsed && <span>Daftar KAK</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/templates"
              className={({ isActive }) =>
                cn(
                  "flex items-center p-2 rounded-md text-sm group transition-colors hover:bg-orange-600/10",
                  "hover:text-orange-600",
                  isActive ? "bg-orange-100 text-orange-600 font-medium" : "text-muted-foreground"
                )
              }
            >
              <FileUp className={cn("mr-3 h-5 w-5", isCollapsed && "mr-0")} />
              {!isCollapsed && <span>Template</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center p-2 rounded-md text-sm group transition-colors hover:bg-orange-600/10",
                  "hover:text-orange-600",
                  isActive ? "bg-orange-100 text-orange-600 font-medium" : "text-muted-foreground"
                )
              }
            >
              <Settings className={cn("mr-3 h-5 w-5", isCollapsed && "mr-0")} />
              {!isCollapsed && <span>Pengaturan</span>}
            </NavLink>
          </li>
        </ul>
      </div>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border">
        {!isCollapsed && (
          <div className="p-3">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold mr-2">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        )}
        {isCollapsed && (
          <div className="p-3">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm"
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};

export default Sidebar;
