
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export interface KAKItem {
  id: string;
  volume: number;
  satuan: string;
  nama: string;
  hargaSatuan: number;
  subtotal: number;
}

export interface KAK {
  id: string;
  jenisKAK: string;
  programPembebanan: string;
  kegiatan: string;
  rincianOutput: string;
  komponenOutput: string;
  subKomponen: string;
  akunBelanja: string;
  paguAnggaran: number;
  tanggalMulai: string;
  tanggalAkhir: string;
  tanggalPengajuan: string;
  items: KAKItem[];
  createdBy: {
    name: string;
    role: string;
  };
}

interface KAKContextType {
  kaks: KAK[];
  addKAK: (kak: Omit<KAK, "id">) => void;
  updateKAK: (kak: KAK) => void;
  deleteKAK: (id: string) => void;
  duplicateKAK: (id: string) => void;
  getKAKById: (id: string) => KAK | undefined;
}

const KAKContext = createContext<KAKContextType | undefined>(undefined);

// Load initial data from localStorage or use empty array
const loadInitialData = (): KAK[] => {
  const savedKAKs = localStorage.getItem("kaks");
  if (savedKAKs) {
    try {
      return JSON.parse(savedKAKs);
    } catch (e) {
      console.error("Failed to parse KAKs from localStorage:", e);
      return [];
    }
  }
  return [];
};

export const KAKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kaks, setKAKs] = useState<KAK[]>(loadInitialData);
  const { toast } = useToast();

  // Save to localStorage whenever kaks change
  useEffect(() => {
    localStorage.setItem("kaks", JSON.stringify(kaks));
  }, [kaks]);

  const addKAK = (kak: Omit<KAK, "id">) => {
    const newKAK = {
      ...kak,
      id: uuidv4(),
    };
    
    setKAKs(prevKAKs => [...prevKAKs, newKAK]);
    
    toast({
      title: "KAK berhasil ditambahkan",
      description: `KAK ${kak.jenisKAK} telah berhasil disimpan`,
      variant: "default",
    });
  };

  const updateKAK = (kak: KAK) => {
    setKAKs(prevKAKs => 
      prevKAKs.map(k => (k.id === kak.id ? kak : k))
    );
    
    toast({
      title: "KAK berhasil diperbarui",
      description: `KAK ${kak.jenisKAK} telah berhasil diperbarui`,
      variant: "default",
    });
  };

  const deleteKAK = (id: string) => {
    const kakToDelete = kaks.find(k => k.id === id);
    
    setKAKs(prevKAKs => prevKAKs.filter(k => k.id !== id));
    
    toast({
      title: "KAK berhasil dihapus",
      description: kakToDelete 
        ? `KAK ${kakToDelete.jenisKAK} telah berhasil dihapus` 
        : "KAK telah berhasil dihapus",
      variant: "default",
    });
  };

  const duplicateKAK = (id: string) => {
    const kakToDuplicate = kaks.find(k => k.id === id);
    
    if (!kakToDuplicate) {
      toast({
        title: "Gagal menduplikasi KAK",
        description: "KAK tidak ditemukan",
        variant: "destructive",
      });
      return;
    }
    
    const newKAK = {
      ...kakToDuplicate,
      id: uuidv4(),
    };
    
    setKAKs(prevKAKs => [...prevKAKs, newKAK]);
    
    toast({
      title: "KAK berhasil diduplikasi",
      description: `KAK ${kakToDuplicate.jenisKAK} telah berhasil diduplikasi`,
      variant: "default",
    });
  };

  const getKAKById = (id: string) => {
    return kaks.find(k => k.id === id);
  };

  return (
    <KAKContext.Provider 
      value={{ 
        kaks, 
        addKAK, 
        updateKAK, 
        deleteKAK,
        duplicateKAK,
        getKAKById
      }}
    >
      {children}
    </KAKContext.Provider>
  );
};

export const useKAK = () => {
  const context = useContext(KAKContext);
  if (!context) {
    throw new Error("useKAK must be used within a KAKProvider");
  }
  return context;
};
