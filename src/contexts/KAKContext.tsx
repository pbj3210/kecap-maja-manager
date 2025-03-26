
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

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
  paguDigunakan: number;
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
  loading: boolean;
  addKAK: (kak: Omit<KAK, "id">) => Promise<string>;
  updateKAK: (kak: KAK) => Promise<void>;
  deleteKAK: (id: string) => Promise<void>;
  duplicateKAK: (id: string) => Promise<void>;
  getKAKById: (id: string) => KAK | undefined;
  fetchKAKs: () => Promise<void>;
}

const KAKContext = createContext<KAKContextType | undefined>(undefined);

// Map database object to frontend object
const mapDbToKAK = (kakDb: any, itemsDb: any[]): KAK => {
  return {
    id: kakDb.id,
    jenisKAK: kakDb.jenis_kak,
    programPembebanan: kakDb.program_pembebanan,
    kegiatan: kakDb.kegiatan,
    rincianOutput: kakDb.rincian_output,
    komponenOutput: kakDb.komponen_output,
    subKomponen: kakDb.sub_komponen,
    akunBelanja: kakDb.akun_belanja,
    paguAnggaran: parseFloat(kakDb.pagu_anggaran),
    paguDigunakan: parseFloat(kakDb.pagu_digunakan),
    tanggalMulai: kakDb.tanggal_mulai,
    tanggalAkhir: kakDb.tanggal_akhir,
    tanggalPengajuan: kakDb.tanggal_pengajuan,
    createdBy: {
      name: kakDb.created_by_name,
      role: kakDb.created_by_role,
    },
    items: itemsDb.map(item => ({
      id: item.id,
      volume: parseFloat(item.volume),
      satuan: item.satuan,
      nama: item.nama,
      hargaSatuan: parseFloat(item.harga_satuan),
      subtotal: parseFloat(item.subtotal),
    })),
  };
};

// Map frontend object to database object
const mapKAKToDb = (kak: Omit<KAK, "id"> | KAK) => {
  return {
    id: 'id' in kak ? kak.id : undefined,
    jenis_kak: kak.jenisKAK,
    program_pembebanan: kak.programPembebanan,
    kegiatan: kak.kegiatan,
    rincian_output: kak.rincianOutput,
    komponen_output: kak.komponenOutput,
    sub_komponen: kak.subKomponen,
    akun_belanja: kak.akunBelanja,
    pagu_anggaran: kak.paguAnggaran,
    pagu_digunakan: kak.paguDigunakan || kak.items.reduce((sum, item) => sum + item.subtotal, 0),
    tanggal_mulai: kak.tanggalMulai,
    tanggal_akhir: kak.tanggalAkhir,
    tanggal_pengajuan: kak.tanggalPengajuan,
    created_by_name: kak.createdBy.name,
    created_by_role: kak.createdBy.role
  };
};

const mapItemToDb = (item: KAKItem, kakId: string) => {
  return {
    kak_id: kakId,
    nama: item.nama,
    volume: item.volume,
    satuan: item.satuan,
    harga_satuan: item.hargaSatuan,
    subtotal: item.subtotal
  };
};

export const KAKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kaks, setKAKs] = useState<KAK[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch KAKs from Supabase
  const fetchKAKs = async () => {
    setLoading(true);
    try {
      // Fetch all KAKs
      const { data: kaksData, error: kaksError } = await supabase
        .from('kak')
        .select('*')
        .order('created_at', { ascending: false });

      if (kaksError) {
        console.error('Error fetching KAKs:', kaksError);
        toast({
          title: "Gagal memuat data KAK",
          description: kaksError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Fetch all items
      const { data: itemsData, error: itemsError } = await supabase
        .from('kak_items')
        .select('*');

      if (itemsError) {
        console.error('Error fetching KAK items:', itemsError);
        toast({
          title: "Gagal memuat data item KAK",
          description: itemsError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Group items by KAK ID
      const itemsByKakId = itemsData.reduce((acc: Record<string, any[]>, item) => {
        if (!acc[item.kak_id]) {
          acc[item.kak_id] = [];
        }
        acc[item.kak_id].push(item);
        return acc;
      }, {});

      // Map database objects to frontend objects
      const mappedKAKs: KAK[] = kaksData.map(kak => 
        mapDbToKAK(kak, itemsByKakId[kak.id] || [])
      );

      setKAKs(mappedKAKs);
    } catch (error) {
      console.error('Unexpected error fetching KAKs:', error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal memuat data KAK",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load KAKs on initial render
  useEffect(() => {
    fetchKAKs();
  }, []);

  const addKAK = async (kak: Omit<KAK, "id">): Promise<string> => {
    try {
      // Create KAK record
      const kakDb = mapKAKToDb(kak);
      const { data: newKak, error: kakError } = await supabase
        .from('kak')
        .insert(kakDb)
        .select()
        .single();

      if (kakError) throw kakError;

      // Create KAK items
      const kakId = newKak.id;
      const itemsDb = kak.items.map(item => mapItemToDb(item, kakId));
      
      const { error: itemsError } = await supabase
        .from('kak_items')
        .insert(itemsDb);

      if (itemsError) throw itemsError;

      // Fetch the items we just created
      const { data: createdItems, error: fetchItemsError } = await supabase
        .from('kak_items')
        .select('*')
        .eq('kak_id', kakId);

      if (fetchItemsError) throw fetchItemsError;

      // Create the full KAK object with items
      const newKAKWithItems = mapDbToKAK(newKak, createdItems);
      
      // Update state
      setKAKs(prevKAKs => [newKAKWithItems, ...prevKAKs]);

      toast({
        title: "KAK berhasil ditambahkan",
        description: `KAK ${kak.jenisKAK} telah berhasil disimpan`,
        variant: "default",
      });

      return kakId;
    } catch (error: any) {
      console.error('Error adding KAK:', error);
      toast({
        title: "Gagal menambahkan KAK",
        description: error.message || "Terjadi kesalahan saat menyimpan KAK",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateKAK = async (kak: KAK): Promise<void> => {
    try {
      // Update KAK record
      const kakDb = mapKAKToDb(kak);
      const { error: kakError } = await supabase
        .from('kak')
        .update(kakDb)
        .eq('id', kak.id);

      if (kakError) throw kakError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('kak_items')
        .delete()
        .eq('kak_id', kak.id);

      if (deleteError) throw deleteError;

      // Create new items
      const itemsDb = kak.items.map(item => mapItemToDb(item, kak.id));
      const { error: itemsError } = await supabase
        .from('kak_items')
        .insert(itemsDb);

      if (itemsError) throw itemsError;

      // Update state
      setKAKs(prevKAKs => 
        prevKAKs.map(k => (k.id === kak.id ? kak : k))
      );
      
      toast({
        title: "KAK berhasil diperbarui",
        description: `KAK ${kak.jenisKAK} telah berhasil diperbarui`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error updating KAK:', error);
      toast({
        title: "Gagal memperbarui KAK",
        description: error.message || "Terjadi kesalahan saat memperbarui KAK",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteKAK = async (id: string): Promise<void> => {
    const kakToDelete = kaks.find(k => k.id === id);
    
    try {
      // Delete KAK record (this will cascade delete items due to foreign key constraint)
      const { error } = await supabase
        .from('kak')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state
      setKAKs(prevKAKs => prevKAKs.filter(k => k.id !== id));
      
      toast({
        title: "KAK berhasil dihapus",
        description: kakToDelete 
          ? `KAK ${kakToDelete.jenisKAK} telah berhasil dihapus` 
          : "KAK telah berhasil dihapus",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error deleting KAK:', error);
      toast({
        title: "Gagal menghapus KAK",
        description: error.message || "Terjadi kesalahan saat menghapus KAK",
        variant: "destructive",
      });
      throw error;
    }
  };

  const duplicateKAK = async (id: string): Promise<void> => {
    const kakToDuplicate = kaks.find(k => k.id === id);
    
    if (!kakToDuplicate) {
      toast({
        title: "Gagal menduplikasi KAK",
        description: "KAK tidak ditemukan",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create new KAK based on the one to duplicate (without the ID)
      const { id: _id, ...kakWithoutId } = kakToDuplicate;
      const newKakId = await addKAK(kakWithoutId);
      
      toast({
        title: "KAK berhasil diduplikasi",
        description: `KAK ${kakToDuplicate.jenisKAK} telah berhasil diduplikasi`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error duplicating KAK:', error);
      toast({
        title: "Gagal menduplikasi KAK",
        description: error.message || "Terjadi kesalahan saat menduplikasi KAK",
        variant: "destructive",
      });
    }
  };

  const getKAKById = (id: string) => {
    return kaks.find(k => k.id === id);
  };

  return (
    <KAKContext.Provider 
      value={{ 
        kaks, 
        loading,
        addKAK, 
        updateKAK, 
        deleteKAK,
        duplicateKAK,
        getKAKById,
        fetchKAKs
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
