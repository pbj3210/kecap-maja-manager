
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface User {
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const users = [
  { username: "PPK3210", password: "bellamy", name: "Andries Kurniawan", role: "PPK" },
  { username: "SOSIAL3210", password: "BPS3210", name: "Fungsi Sosial", role: "Sosial" },
  { username: "NERACA3210", password: "BPS3210", name: "Fungsi Neraca", role: "Neraca" },
  { username: "PRODUKSI3210", password: "BPS3210", name: "Fungsi Produksi", role: "Produksi" },
  { username: "DISTRIBUSI3210", password: "BPS3210", name: "Fungsi Distibusi", role: "Distribusi" },
  { username: "IPDS3210", password: "BPS3210", name: "Fungsi IPDS", role: "IPDS" },
  { username: "TU3210", password: "BPS3210", name: "Tata Usaha", role: "TU" },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData = {
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${foundUser.name}`,
        variant: "default",
      });
      
      return true;
    } else {
      toast({
        title: "Login gagal",
        description: "Username atau password salah",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari aplikasi",
      variant: "default",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
