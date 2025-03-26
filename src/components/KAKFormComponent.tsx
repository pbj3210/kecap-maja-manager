
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2, PlusCircle, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { KAK, KAKItem } from "@/contexts/KAKContext";

// Define form types for this component
type JenisKAK = "Belanja Bahan" | "Belanja Honor" | "Belanja Modal" | "Belanja Paket Meeting" | "Belanja Perjalanan Dinas";
type ProgramPembebanan = "Program Penyediaan dan Pelayanan Informasi Statistik (054.01.GG)" | "Program Dukungan Manajemen (054.01.WA)";

// Constant data
const jenisKAKOptions: JenisKAK[] = [
  "Belanja Bahan",
  "Belanja Honor",
  "Belanja Modal",
  "Belanja Paket Meeting",
  "Belanja Perjalanan Dinas"
];

const programPembebananOptions: ProgramPembebanan[] = [
  "Program Penyediaan dan Pelayanan Informasi Statistik (054.01.GG)",
  "Program Dukungan Manajemen (054.01.WA)"
];

const kegiatanGGOptions = [
  "Pengembangan dan Analisis Statistik (2896)",
  "Pelayanan dan Pengembangan Diseminasi Informasi Statistik (2897)",
  "Penyediaan dan Pengembangan Statistik Neraca Pengeluaran (2898)",
  "Penyediaan dan Pengembangan Statistik Neraca Produksi (2899)",
  "Pengembangan Metodologi Sensus dan Survei (2900)",
  "Pengembangan Sistem Informasi Statistik (2901)",
  "Penyediaan dan Pengembangan Statistik Distribusi (2902)",
  "Penyediaan dan Pengembangan Statistik Harga (2903)",
  "Penyediaan dan Pengembangan Statistik Industri, Pertambangan dan Penggalian, Energi, dan Konstruksi (2904)",
  "Penyediaan dan Pengembangan Statistik Kependudukan dan Ketenagakerjaan (2905)",
  "Penyediaan dan Pengembangan Statistik Kesejahteraan Rakyat (2906)",
  "Penyediaan dan Pengembangan Statistik Ketahanan Sosial (2907)",
  "Penyediaan dan Pengembangan Statistik Keuangan, Teknologi Informasi, dan Pariwisata (2908)",
  "Penyediaan dan Pengembangan Statistik Peternakan, Perikanan, dan Kehutanan (2909)",
  "Penyediaan dan Pengembangan Statistik Tanaman Pangan, Hortikultura, dan Perkebunan (2910)"
];

const kegiatanWAOptions = [
  "Dukungan Manajemen dan Pelaksanaan Tugas Teknis Lainnya BPS Provinsi (2886)"
];

const rincianOutputMap: Record<string, string[]> = {
  // Mapping for Kegiatan 2896
  "Pengembangan dan Analisis Statistik (2896)": ["Data dan Informasi Publik (2896.BMA)"],
  
  // Mapping for Kegiatan 2897
  "Pelayanan dan Pengembangan Diseminasi Informasi Statistik (2897)": [
    "Data dan Informasi Publik (2897.BMA)",
    "Fasilitasi dan Pembinaan Lembaga (2897.QDB)"
  ],
  
  // Mapping for Kegiatan 2898
  "Penyediaan dan Pengembangan Statistik Neraca Pengeluaran (2898)": ["Data dan Informasi Publik (2898.BMA)"],
  
  // Mapping for Kegiatan 2899
  "Penyediaan dan Pengembangan Statistik Neraca Produksi (2899)": ["Data dan Informasi Publik (2899.BMA)"],
  
  // Mapping for Kegiatan 2900
  "Pengembangan Metodologi Sensus dan Survei (2900)": ["Data dan Informasi Publik (2900.BMA)"],
  
  // Mapping for Kegiatan 2901
  "Pengembangan Sistem Informasi Statistik (2901)": ["Sarana Bidang Teknologi Informasi dan Komunikasi (2901.CAN)"],
  
  // Mapping for Kegiatan 2902
  "Penyediaan dan Pengembangan Statistik Distribusi (2902)": ["Data dan Informasi Publik (2902.BMA)"],
  
  // Mapping for Kegiatan 2903
  "Penyediaan dan Pengembangan Statistik Harga (2903)": [
    "Data dan Informasi Publik (2903.BMA)",
    "Data dan Informasi Publik (2903.QMA)"
  ],
  
  // Mapping for Kegiatan 2904
  "Penyediaan dan Pengembangan Statistik Industri, Pertambangan dan Penggalian, Energi, dan Konstruksi (2904)": ["Data dan Informasi Publik (2904.BMA)"],
  
  // Mapping for Kegiatan 2905
  "Penyediaan dan Pengembangan Statistik Kependudukan dan Ketenagakerjaan (2905)": ["Data dan Informasi Publik (2905.BMA)"],
  
  // Mapping for Kegiatan 2906
  "Penyediaan dan Pengembangan Statistik Kesejahteraan Rakyat (2906)": ["Data dan Informasi Publik (2906.BMA)"],
  
  // Mapping for Kegiatan 2907
  "Penyediaan dan Pengembangan Statistik Ketahanan Sosial (2907)": ["Data dan Informasi Publik (2907.BMA)"],
  
  // Mapping for Kegiatan 2908
  "Penyediaan dan Pengembangan Statistik Keuangan, Teknologi Informasi, dan Pariwisata (2908)": ["Data dan Informasi Publik (2908.BMA)"],
  
  // Mapping for Kegiatan 2909
  "Penyediaan dan Pengembangan Statistik Peternakan, Perikanan, dan Kehutanan (2909)": ["Data dan Informasi Publik (2909.BMA)"],
  
  // Mapping for Kegiatan 2910
  "Penyediaan dan Pengembangan Statistik Tanaman Pangan, Hortikultura, dan Perkebunan (2910)": ["Data dan Informasi Publik (2910.BMA)"],
  
  // Mapping for Kegiatan 2886
  "Dukungan Manajemen dan Pelaksanaan Tugas Teknis Lainnya BPS Provinsi (2886)": ["Data dan Informasi Publik (2886.EBA)"]
};

const komponenOutputMap: Record<string, string[]> = {
  // Mapping for 2896.BMA
  "Data dan Informasi Publik (2896.BMA)": ["PUBLIKASI/LAPORAN ANALISIS DAN PENGEMBANGAN STATISTIK (2896.BMA.004)"],
  
  // Mapping for 2897.BMA
  "Data dan Informasi Publik (2897.BMA)": ["LAPORAN DISEMINASI DAN METADATA STATISTIK (2897.BMA.004)"],
  
  // Mapping for 2897.QDB
  "Fasilitasi dan Pembinaan Lembaga (2897.QDB)": ["PENGUATAN PENYELENGGARAAN PEMBINAAN STATISTIK SEKTORAL (2897.QDB.003)"],
  
  // Mapping for 2898.BMA
  "Data dan Informasi Publik (2898.BMA)": ["PUBLIKASI/LAPORAN STATISTIK NERACA PENGELUARAN (2898.BMA.007)"],
  
  // Mapping for 2899.BMA
  "Data dan Informasi Publik (2899.BMA)": ["PUBLIKASI/LAPORAN NERACA PRODUKSI (2899.BMA.006)"],
  
  // Mapping for 2900.BMA
  "Data dan Informasi Publik (2900.BMA)": ["DOKUMEN/LAPORAN PENGEMBANGAN METODOLOGI KEGIATAN STATISTIK (2900.BMA.005)"],
  
  // Mapping for 2901.CAN
  "Sarana Bidang Teknologi Informasi dan Komunikasi (2901.CAN)": ["Pengembangan Infrastruktur dan Layanan Teknologi Informasi dan Komunikasi (2901.CAN.004)"],
  
  // Mapping for 2902.BMA
  "Data dan Informasi Publik (2902.BMA)": [
    "PUBLIKASI/LAPORAN STATISTIK DISTRIBUSI (2902.BMA.004)",
    "PUBLIKASI/LAPORAN SENSUS EKONOMI (2902.BMA.006)"
  ],
  
  // Mapping for 2903.BMA
  "Data dan Informasi Publik (2903.BMA)": ["PUBLIKASI/LAPORAN STATISTIK HARGA (2903.BMA.009)"],
  
  // Mapping for 2903.QMA
  "Data dan Informasi Publik (2903.QMA)": ["PUBLIKASI/LAPORAN PENYUSUNAN INFLASI (2903.QMA.006)"],
  
  // Mapping for 2904.BMA
  "Data dan Informasi Publik (2904.BMA)": ["PUBLIKASI/LAPORAN STATISTIK INDUSTRI, PERTAMBANGAN DAN PENGGALIAN, ENERGI, DAN KONSTRUKSI (2904.BMA.006)"],
  
  // Mapping for 2905.BMA
  "Data dan Informasi Publik (2905.BMA)": [
    "PUBLIKASI/LAPORAN SAKERNAS (2905.BMA.004)",
    "PUBLIKASI/LAPORAN SURVEI PENDUDUK ANTAR SENSUS (2905.BMA.006)"
  ],
  
  // Mapping for 2906.BMA
  "Data dan Informasi Publik (2906.BMA)": [
    "PUBLIKASI/LAPORAN STATISTIK KESEJAHTERAAN RAKYAT (2906.BMA.003)",
    "PUBLIKASI/LAPORAN SUSENAS (2906.BMA.006)"
  ],
  
  // Mapping for 2907.BMA
  "Data dan Informasi Publik (2907.BMA)": [
    "PUBLIKASI/LAPORAN STATISTIK KETAHANAN SOSIAL (2907.BMA.006)",
    "PUBLIKASI/LAPORAN PENDATAAN PODES (2907.BMA.008)"
  ],
  
  // Mapping for 2908.BMA
  "Data dan Informasi Publik (2908.BMA)": [
    "PUBLIKASI/LAPORAN STATISTIK KEUANGAN, TEKNOLOGI INFORMASI, DAN PARIWISATA (2908.BMA.004)",
    "PUBLIKASI/LAPORAN STATISTIK E-COMMERCE (2908.BMA.009)"
  ],
  
  // Mapping for 2909.BMA
  "Data dan Informasi Publik (2909.BMA)": ["PUBLIKASI/LAPORAN STATISTIK PETERNAKAN, PERIKANAN, DAN KEHUTANAN (2909.BMA.005)"],
  
  // Mapping for 2910.BMA
  "Data dan Informasi Publik (2910.BMA)": [
    "PUBLIKASI/ LAPORAN STATISTIK TANAMAN PANGAN (2910.BMA.007)",
    "PUBLIKASI/LAPORAN STATISTIK HORTIKULTURA DAN PERKEBUNAN (2910.BMA.008)"
  ],
  
  // Mapping for 2886.EBA
  "Data dan Informasi Publik (2886.EBA)": [
    "Layanan BMN (2886.EBA.956)",
    "Layanan Umum (2886.EBA.962)",
    "Layanan Perkantoran (2886.EBA.994)"
  ]
};

const subKomponenOptions = {
  "Program Penyediaan dan Pelayanan Informasi Statistik (054.01.GG)": [
    "Dukungan Penyelenggaraan Tugas dan Fungsi Unit (005)",
    "PERSIAPAN (051)",
    "PENGUMPULAN DATA (052)",
    "PENGOLAHAN DAN ANALISIS (053)",
    "DISEMINASI DAN EVALUASI (054)",
    "Pengembangan Infrastruktur dan Layanan Teknologi Informasi dan Komunikasi (056)",
    "Pemutakhiran Kerangka Geospasial dan Muatan Wilkerstat (506)",
    "Updating Direktori Usaha/Perusahaan Ekonomi Lanjutan (516)",
    "Penyusunan Bahan Publisitas (519)"
  ],
  "Program Dukungan Manajemen (054.01.WA)": [
    "Tanpa Komponen (051)",
    "Gaji dan Tunjangan (001)",
    "Operasional dan Pemeliharaan Kantor (002)"
  ]
};

const akunBelanjaOptions = {
  "Belanja Honor": [
    "Belanja Honor Output Kegiatan (521213)",
    "Belanja Jasa Profesi (522151)",
    "Belanja Honor Operasional Satuan Kerja (521115)"
  ],
  "Belanja Bahan": [
    "Belanja Honor Bahan (521211)",
    "Belanja Barang Persediaan Barang Konsumsi (521811)",
    "Belanja Barang Operasional Lainnya (521119)",
    "Belanja Barang Non Operasional Lainnya (521219)",
    "Belanja Keperluan Perkantoran (521111)",
    "Belanja Pemeliharaan Peralatan dan Mesin (523121)"
  ],
  "Belanja Modal": [
    "Belanja Modal Peralatan dan Mesin (532111)",
    "Belanja Modal Gedung dan Bangunan (533111)"
  ],
  "Belanja Perjalanan Dinas": [
    "Belanja Perjalanan Dinas Biasa (524111)",
    "Belanja Perjalanan Dinas Dalam Kota (524113)"
  ],
  "Belanja Paket Meeting": [
    "Belanja Perjalanan Dinas Paket Meeting Dalam Kota (524114)",
    "Belanja Perjalanan Dinas Paket Meeting Luar Kota (524119)"
  ]
};

const satuanOptions = [
  "BLN", "BS", "Desa", "Dok", "liter", "Lmbr", "M2", "OB", "OK", "OP", "OJP", "Paket", "Pasar", "RT", "Sls", "Stel", "Tahun"
];

interface KAKFormComponentProps {
  initialData?: KAK;
  onSave: (kakData: Omit<KAK, "id">) => void;
  mode: "create" | "edit";
}

const KAKFormComponent: React.FC<KAKFormComponentProps> = ({ initialData, onSave, mode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Set up form state with initial data or defaults
  const [formData, setFormData] = useState({
    jenisKAK: initialData?.jenisKAK || "",
    programPembebanan: initialData?.programPembebanan || "",
    kegiatan: initialData?.kegiatan || "",
    rincianOutput: initialData?.rincianOutput || "",
    komponenOutput: initialData?.komponenOutput || "",
    subKomponen: initialData?.subKomponen || "",
    akunBelanja: initialData?.akunBelanja || "",
    paguAnggaran: initialData?.paguAnggaran || 0,
    paguDigunakan: initialData?.paguDigunakan || 0,
    tanggalMulai: initialData?.tanggalMulai || "",
    tanggalAkhir: initialData?.tanggalAkhir || "",
    tanggalPengajuan: initialData?.tanggalPengajuan || ""
  });
  
  const [items, setItems] = useState<KAKItem[]>(
    initialData?.items || [{ id: "1", nama: "", volume: 0, satuan: "", hargaSatuan: 0, subtotal: 0 }]
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to calculate total of items
  useEffect(() => {
    const totalItems = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    setFormData(prev => ({ ...prev, paguDigunakan: totalItems }));
    
    // Validate pagu anggaran against pagu digunakan
    if (formData.paguAnggaran > 0 && totalItems > formData.paguAnggaran) {
      setErrors(prev => ({
        ...prev,
        paguAnggaran: "Pagu Anggaran harus lebih besar dari total yang digunakan"
      }));
    } else if (errors.paguAnggaran && !(totalItems > formData.paguAnggaran)) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.paguAnggaran;
        return newErrors;
      });
    }
  }, [items, formData.paguAnggaran]);

  // Handle date selection
  const handleDateChange = (field: "tanggalMulai" | "tanggalAkhir" | "tanggalPengajuan", date: Date) => {
    setFormData({
      ...formData,
      [field]: date.toISOString().split("T")[0]
    });
    
    // Clear related date errors when a date is selected
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Validate dates
    validateDates(field, date.toISOString().split("T")[0]);
  };

  // Validate date relationships
  const validateDates = (changedField: string, value: string) => {
    const newErrors: Record<string, string> = {};
    
    if (changedField === "tanggalPengajuan" || changedField === "tanggalMulai") {
      if (formData.tanggalMulai && value && changedField === "tanggalPengajuan") {
        const pengajuan = new Date(value);
        const mulai = new Date(formData.tanggalMulai);
        
        if (pengajuan > mulai) {
          newErrors.tanggalPengajuan = "Tanggal pengajuan harus sebelum tanggal mulai";
        }
      } else if (formData.tanggalPengajuan && value && changedField === "tanggalMulai") {
        const pengajuan = new Date(formData.tanggalPengajuan);
        const mulai = new Date(value);
        
        if (pengajuan > mulai) {
          newErrors.tanggalMulai = "Tanggal mulai harus setelah tanggal pengajuan";
        }
      }
    }
    
    if (changedField === "tanggalMulai" || changedField === "tanggalAkhir") {
      if (formData.tanggalAkhir && value && changedField === "tanggalMulai") {
        const mulai = new Date(value);
        const akhir = new Date(formData.tanggalAkhir);
        
        if (mulai > akhir) {
          newErrors.tanggalMulai = "Tanggal mulai harus sebelum tanggal akhir";
        }
      } else if (formData.tanggalMulai && value && changedField === "tanggalAkhir") {
        const mulai = new Date(formData.tanggalMulai);
        const akhir = new Date(value);
        
        if (mulai > akhir) {
          newErrors.tanggalAkhir = "Tanggal akhir harus setelah tanggal mulai";
        }
      }
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
  };

  // Handle form field changes
  const handleChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear related error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Special validation for pagu anggaran
    if (field === "paguAnggaran") {
      const paguValue = typeof value === 'string' ? parseFloat(value) : value;
      if (paguValue <= 0) {
        setErrors(prev => ({
          ...prev,
          paguAnggaran: "Pagu Anggaran harus lebih dari 0"
        }));
      } else if (paguValue < formData.paguDigunakan) {
        setErrors(prev => ({
          ...prev,
          paguAnggaran: "Pagu Anggaran harus lebih besar dari total yang digunakan"
        }));
      }
    }
    
    // Special handling for interdependent fields
    if (field === "programPembebanan") {
      setFormData(prev => ({
        ...prev,
        kegiatan: "",
        rincianOutput: "",
        komponenOutput: "",
        subKomponen: ""
      }));
    } else if (field === "kegiatan") {
      setFormData(prev => ({
        ...prev,
        rincianOutput: "",
        komponenOutput: ""
      }));
    } else if (field === "rincianOutput") {
      setFormData(prev => ({
        ...prev,
        komponenOutput: ""
      }));
    } else if (field === "jenisKAK") {
      setFormData(prev => ({
        ...prev,
        akunBelanja: ""
      }));
    }
  };

  // Handle item changes
  const handleItemChange = (index: number, field: keyof KAKItem, value: string | number) => {
    const updatedItems = [...items];
    
    if (field === "volume" || field === "hargaSatuan") {
      // Parse to number
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: numValue,
      };
      
      // Calculate subtotal
      const volume = field === "volume" ? numValue : updatedItems[index].volume;
      const hargaSatuan = field === "hargaSatuan" ? numValue : updatedItems[index].hargaSatuan;
      updatedItems[index].subtotal = volume * hargaSatuan;
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }
    
    setItems(updatedItems);
  };

  // Add new item
  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), nama: "", volume: 0, satuan: "", hargaSatuan: 0, subtotal: 0 }
    ]);
  };

  // Remove item
  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast({
        title: "Tidak dapat menghapus",
        description: "Harus ada minimal satu item kegiatan",
        variant: "destructive",
      });
      return;
    }
    
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  // Form validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Check required fields
    if (!formData.jenisKAK) newErrors.jenisKAK = "Jenis KAK harus dipilih";
    if (!formData.programPembebanan) newErrors.programPembebanan = "Program pembebanan harus dipilih";
    if (!formData.kegiatan) newErrors.kegiatan = "Kegiatan harus dipilih";
    if (!formData.rincianOutput) newErrors.rincianOutput = "Rincian output harus dipilih";
    if (!formData.komponenOutput) newErrors.komponenOutput = "Komponen output harus dipilih";
    if (!formData.subKomponen) newErrors.subKomponen = "Sub komponen harus dipilih";
    if (!formData.akunBelanja) newErrors.akunBelanja = "Akun belanja harus dipilih";
    if (!formData.paguAnggaran || formData.paguAnggaran <= 0) 
      newErrors.paguAnggaran = "Pagu anggaran harus diisi dan lebih dari 0";
    if (formData.paguAnggaran < formData.paguDigunakan)
      newErrors.paguAnggaran = "Pagu anggaran harus lebih besar dari total yang digunakan";
    if (!formData.tanggalMulai) newErrors.tanggalMulai = "Tanggal mulai harus diisi";
    if (!formData.tanggalAkhir) newErrors.tanggalAkhir = "Tanggal akhir harus diisi";
    if (!formData.tanggalPengajuan) newErrors.tanggalPengajuan = "Tanggal pengajuan harus diisi";
    
    // Validate dates
    if (formData.tanggalPengajuan && formData.tanggalMulai) {
      const pengajuan = new Date(formData.tanggalPengajuan);
      const mulai = new Date(formData.tanggalMulai);
      
      if (pengajuan > mulai) {
        newErrors.tanggalPengajuan = "Tanggal pengajuan harus sebelum tanggal mulai";
      }
    }
    
    if (formData.tanggalMulai && formData.tanggalAkhir) {
      const mulai = new Date(formData.tanggalMulai);
      const akhir = new Date(formData.tanggalAkhir);
      
      if (mulai > akhir) {
        newErrors.tanggalAkhir = "Tanggal akhir harus setelah tanggal mulai";
      }
    }
    
    // Validate items
    let hasItemErrors = false;
    items.forEach((item, index) => {
      if (!item.nama) {
        newErrors[`item_${index}_nama`] = "Nama item harus diisi";
        hasItemErrors = true;
      }
      if (!item.volume || item.volume <= 0) {
        newErrors[`item_${index}_volume`] = "Volume harus lebih dari 0";
        hasItemErrors = true;
      }
      if (!item.satuan) {
        newErrors[`item_${index}_satuan`] = "Satuan harus dipilih";
        hasItemErrors = true;
      }
      if (!item.hargaSatuan || item.hargaSatuan <= 0) {
        newErrors[`item_${index}_hargaSatuan`] = "Harga satuan harus lebih dari 0";
        hasItemErrors = true;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap periksa kembali formulir Anda",
        variant: "destructive",
      });
      
      // Scroll to first error
      if (hasItemErrors) {
        document.getElementById("item-section")?.scrollIntoView({ behavior: "smooth" });
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare KAK data
      const kakData = {
        ...formData,
        items,
        createdBy: {
          name: user?.name || "Unknown",
          role: user?.role || "Unknown"
        }
      };
      
      // Call the save handler
      onSave(kakData);
      
      // Redirect after save
      navigate("/kak");
      
      toast({
        title: `KAK berhasil ${mode === "create" ? "dibuat" : "diperbarui"}`,
        description: `KAK ${formData.jenisKAK} telah berhasil ${mode === "create" ? "disimpan" : "diperbarui"}`,
      });
    } catch (error) {
      console.error("Error saving KAK:", error);
      toast({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan KAK",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
          <CardDescription>
            Masukkan informasi dasar Kerangka Acuan Kerja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Jenis KAK */}
          <div className="space-y-2">
            <Label htmlFor="jenisKAK">Jenis KAK</Label>
            <Select
              value={formData.jenisKAK}
              onValueChange={(value) => handleChange("jenisKAK", value)}
            >
              <SelectTrigger id="jenisKAK" className={errors.jenisKAK ? "border-destructive" : ""}>
                <SelectValue placeholder="Pilih jenis KAK" />
              </SelectTrigger>
              <SelectContent>
                {jenisKAKOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jenisKAK && (
              <p className="text-sm text-destructive">{errors.jenisKAK}</p>
            )}
          </div>

          {/* Program Pembebanan */}
          <div className="space-y-2">
            <Label htmlFor="programPembebanan">Program Pembebanan</Label>
            <Select
              value={formData.programPembebanan}
              onValueChange={(value) => handleChange("programPembebanan", value)}
            >
              <SelectTrigger id="programPembebanan" className={errors.programPembebanan ? "border-destructive" : ""}>
                <SelectValue placeholder="Pilih program pembebanan" />
              </SelectTrigger>
              <SelectContent>
                {programPembebananOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.programPembebanan && (
              <p className="text-sm text-destructive">{errors.programPembebanan}</p>
            )}
          </div>

          {/* Kegiatan (conditional based on Program Pembebanan) */}
          {formData.programPembebanan && (
            <div className="space-y-2">
              <Label htmlFor="kegiatan">Kegiatan</Label>
              <Select
                value={formData.kegiatan}
                onValueChange={(value) => handleChange("kegiatan", value)}
              >
                <SelectTrigger id="kegiatan" className={errors.kegiatan ? "border-destructive" : ""}>
                  <SelectValue placeholder="Pilih kegiatan" />
                </SelectTrigger>
                <SelectContent>
                  {formData.programPembebanan === "Program Penyediaan dan Pelayanan Informasi Statistik (054.01.GG)"
                    ? kegiatanGGOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))
                    : kegiatanWAOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
              {errors.kegiatan && (
                <p className="text-sm text-destructive">{errors.kegiatan}</p>
              )}
            </div>
          )}

          {/* Rincian Output (conditional based on Kegiatan) */}
          {formData.kegiatan && (
            <div className="space-y-2">
              <Label htmlFor="rincianOutput">Rincian Output</Label>
              <Select
                value={formData.rincianOutput}
                onValueChange={(value) => handleChange("rincianOutput", value)}
              >
                <SelectTrigger id="rincianOutput" className={errors.rincianOutput ? "border-destructive" : ""}>
                  <SelectValue placeholder="Pilih rincian output" />
                </SelectTrigger>
                <SelectContent>
                  {rincianOutputMap[formData.kegiatan]?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rincianOutput && (
                <p className="text-sm text-destructive">{errors.rincianOutput}</p>
              )}
            </div>
          )}

          {/* Komponen Output (conditional based on Rincian Output) */}
          {formData.rincianOutput && (
            <div className="space-y-2">
              <Label htmlFor="komponenOutput">Komponen Output</Label>
              <Select
                value={formData.komponenOutput}
                onValueChange={(value) => handleChange("komponenOutput", value)}
              >
                <SelectTrigger id="komponenOutput" className={errors.komponenOutput ? "border-destructive" : ""}>
                  <SelectValue placeholder="Pilih komponen output" />
                </SelectTrigger>
                <SelectContent>
                  {komponenOutputMap[formData.rincianOutput]?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.komponenOutput && (
                <p className="text-sm text-destructive">{errors.komponenOutput}</p>
              )}
            </div>
          )}

          {/* Sub Komponen (based on Program Pembebanan) */}
          {formData.programPembebanan && (
            <div className="space-y-2">
              <Label htmlFor="subKomponen">Sub Komponen</Label>
              <Select
                value={formData.subKomponen}
                onValueChange={(value) => handleChange("subKomponen", value)}
              >
                <SelectTrigger id="subKomponen" className={errors.subKomponen ? "border-destructive" : ""}>
                  <SelectValue placeholder="Pilih sub komponen" />
                </SelectTrigger>
                <SelectContent>
                  {subKomponenOptions[formData.programPembebanan as ProgramPembebanan]?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subKomponen && (
                <p className="text-sm text-destructive">{errors.subKomponen}</p>
              )}
            </div>
          )}

          {/* Akun Belanja (based on Jenis KAK) */}
          {formData.jenisKAK && (
            <div className="space-y-2">
              <Label htmlFor="akunBelanja">Akun Belanja</Label>
              <Select
                value={formData.akunBelanja}
                onValueChange={(value) => handleChange("akunBelanja", value)}
              >
                <SelectTrigger id="akunBelanja" className={errors.akunBelanja ? "border-destructive" : ""}>
                  <SelectValue placeholder="Pilih akun belanja" />
                </SelectTrigger>
                <SelectContent>
                  {akunBelanjaOptions[formData.jenisKAK as JenisKAK]?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.akunBelanja && (
                <p className="text-sm text-destructive">{errors.akunBelanja}</p>
              )}
            </div>
          )}

          {/* Pagu Anggaran (Manual Input) */}
          <div className="space-y-2">
            <Label htmlFor="paguAnggaran">Pagu Anggaran (Rp)</Label>
            <Input
              id="paguAnggaran"
              type="number"
              value={formData.paguAnggaran}
              onChange={(e) => handleChange("paguAnggaran", e.target.value)}
              min="0"
              step="1"
              placeholder="0"
              className={errors.paguAnggaran ? "border-destructive" : ""}
            />
            {errors.paguAnggaran && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {errors.paguAnggaran}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Item Kegiatan Card */}
      <Card id="item-section">
        <CardHeader>
          <CardTitle>Item Kegiatan</CardTitle>
          <CardDescription>
            Tambahkan item-item kegiatan yang diperlukan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, index) => (
              <AccordionItem key={item.id} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center text-sm">
                    <span>
                      Item {index + 1}: {item.nama || "Item Kegiatan Baru"}
                    </span>
                    {item.subtotal > 0 && (
                      <span className="ml-2 text-muted-foreground">
                        (
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(item.subtotal)}
                        )
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Nama Item */}
                    <div className="space-y-2">
                      <Label htmlFor={`item-${index}-nama`}>Nama Item Kegiatan</Label>
                      <Input
                        id={`item-${index}-nama`}
                        value={item.nama}
                        onChange={(e) => handleItemChange(index, "nama", e.target.value)}
                        placeholder="Masukkan nama item"
                        className={errors[`item_${index}_nama`] ? "border-destructive" : ""}
                      />
                      {errors[`item_${index}_nama`] && (
                        <p className="text-sm text-destructive">{errors[`item_${index}_nama`]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Volume */}
                      <div className="space-y-2">
                        <Label htmlFor={`item-${index}-volume`}>Volume</Label>
                        <Input
                          id={`item-${index}-volume`}
                          type="number"
                          value={item.volume}
                          onChange={(e) => handleItemChange(index, "volume", e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0"
                          className={errors[`item_${index}_volume`] ? "border-destructive" : ""}
                        />
                        {errors[`item_${index}_volume`] && (
                          <p className="text-sm text-destructive">{errors[`item_${index}_volume`]}</p>
                        )}
                      </div>

                      {/* Satuan */}
                      <div className="space-y-2">
                        <Label htmlFor={`item-${index}-satuan`}>Satuan</Label>
                        <Select
                          value={item.satuan}
                          onValueChange={(value) => handleItemChange(index, "satuan", value)}
                        >
                          <SelectTrigger 
                            id={`item-${index}-satuan`}
                            className={errors[`item_${index}_satuan`] ? "border-destructive" : ""}
                          >
                            <SelectValue placeholder="Pilih satuan" />
                          </SelectTrigger>
                          <SelectContent>
                            {satuanOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`item_${index}_satuan`] && (
                          <p className="text-sm text-destructive">{errors[`item_${index}_satuan`]}</p>
                        )}
                      </div>

                      {/* Harga Satuan */}
                      <div className="space-y-2">
                        <Label htmlFor={`item-${index}-harga`}>Harga Satuan (Rp)</Label>
                        <Input
                          id={`item-${index}-harga`}
                          type="number"
                          value={item.hargaSatuan}
                          onChange={(e) => handleItemChange(index, "hargaSatuan", e.target.value)}
                          min="0"
                          step="1"
                          placeholder="0"
                          className={errors[`item_${index}_hargaSatuan`] ? "border-destructive" : ""}
                        />
                        {errors[`item_${index}_hargaSatuan`] && (
                          <p className="text-sm text-destructive">{errors[`item_${index}_hargaSatuan`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Subtotal (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor={`item-${index}-subtotal`}>Subtotal</Label>
                      <Input
                        id={`item-${index}-subtotal`}
                        value={new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(item.subtotal)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    {/* Remove Item Button */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus Item
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Add Item Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full md:w-auto"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Item Kegiatan
            </Button>
          </div>

          {/* Total Pagu Terpakai (Read-only) */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="paguDigunakan">Total Anggaran yang Digunakan</Label>
            <Input
              id="paguDigunakan"
              value={new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(formData.paguDigunakan)}
              readOnly
              className="bg-muted text-lg font-semibold"
            />
            {formData.paguAnggaran > 0 && (
              <div className={cn(
                "text-sm mt-2 flex items-center gap-1",
                formData.paguDigunakan > formData.paguAnggaran ? "text-destructive" : "text-green-600"
              )}>
                {formData.paguDigunakan > formData.paguAnggaran ? (
                  <>
                    <AlertCircle className="h-4 w-4" /> 
                    Melebihi pagu anggaran sebesar {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(formData.paguDigunakan - formData.paguAnggaran)}
                  </>
                ) : (
                  <>
                    <span className="i-lucide-check-circle h-4 w-4" />
                    Sisa pagu anggaran: {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(formData.paguAnggaran - formData.paguDigunakan)}
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tanggal Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tanggal</CardTitle>
          <CardDescription>
            Tentukan tanggal mulai, akhir, dan pengajuan KAK
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tanggal Pengajuan */}
            <div className="space-y-2">
              <Label htmlFor="tanggalPengajuan">Tanggal Pengajuan</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="tanggalPengajuan"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.tanggalPengajuan && "text-muted-foreground",
                      errors.tanggalPengajuan && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.tanggalPengajuan ? (
                      format(new Date(formData.tanggalPengajuan), "dd MMMM yyyy", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.tanggalPengajuan ? new Date(formData.tanggalPengajuan) : undefined}
                    onSelect={(date) => date && handleDateChange("tanggalPengajuan", date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.tanggalPengajuan && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {errors.tanggalPengajuan}
                </p>
              )}
            </div>

            {/* Tanggal Mulai */}
            <div className="space-y-2">
              <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="tanggalMulai"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.tanggalMulai && "text-muted-foreground",
                      errors.tanggalMulai && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.tanggalMulai ? (
                      format(new Date(formData.tanggalMulai), "dd MMMM yyyy", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.tanggalMulai ? new Date(formData.tanggalMulai) : undefined}
                    onSelect={(date) => date && handleDateChange("tanggalMulai", date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.tanggalMulai && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {errors.tanggalMulai}
                </p>
              )}
            </div>

            {/* Tanggal Akhir */}
            <div className="space-y-2">
              <Label htmlFor="tanggalAkhir">Tanggal Akhir</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="tanggalAkhir"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.tanggalAkhir && "text-muted-foreground",
                      errors.tanggalAkhir && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.tanggalAkhir ? (
                      format(new Date(formData.tanggalAkhir), "dd MMMM yyyy", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.tanggalAkhir ? new Date(formData.tanggalAkhir) : undefined}
                    onSelect={(date) => date && handleDateChange("tanggalAkhir", date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.tanggalAkhir && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {errors.tanggalAkhir}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/kak")}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan KAK" : "Perbarui KAK"}
        </Button>
      </div>
    </form>
  );
};

export default KAKFormComponent;
