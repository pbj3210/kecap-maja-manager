
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useKAK } from "@/contexts/KAKContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Edit, Trash2, Copy, MoreHorizontal, Search, Plus, FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const KAKList = () => {
  const { kaks, deleteKAK, duplicateKAK } = useKAK();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredKAKs, setFilteredKAKs] = useState(kaks);
  const [filterType, setFilterType] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [kakToDelete, setKakToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Filter KAKs based on search query and filter type
    let filtered = kaks;
    
    // Filter by type if not "all"
    if (filterType !== "all") {
      filtered = filtered.filter(kak => kak.jenisKAK === filterType);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(kak =>
        kak.jenisKAK.toLowerCase().includes(query) ||
        kak.programPembebanan.toLowerCase().includes(query) ||
        kak.komponenOutput.toLowerCase().includes(query)
      );
    }
    
    setFilteredKAKs(filtered);
  }, [kaks, searchQuery, filterType]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get unique KAK types for filter
  const uniqueKAKTypes = Array.from(new Set(kaks.map(kak => kak.jenisKAK)));

  const confirmDelete = (id: string) => {
    setKakToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (kakToDelete) {
      deleteKAK(kakToDelete);
      setIsDeleteDialogOpen(false);
      setKakToDelete(null);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateKAK(id);
    toast({
      title: "KAK berhasil diduplikasi",
      description: "Salinan KAK telah dibuat",
    });
  };

  const handleDownload = (kak: any) => {
    // In a real implementation, this would generate a proper document
    // For now, just show a toast
    toast({
      title: "Dokumen sedang diunduh",
      description: "KAK sedang diproses untuk diunduh",
    });

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Dokumen berhasil diunduh",
        description: "KAK telah berhasil diunduh",
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse h-24 w-24 bg-secondary rounded-full mx-auto flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Memuat Data</h2>
          <p className="text-muted-foreground">Menyiapkan daftar KAK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Rekap Kerangka Acuan Kerja</h1>
        <Button asChild>
          <Link to="/kak/new">
            <Plus className="mr-2 h-4 w-4" />
            Buat KAK Baru
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar KAK</CardTitle>
          <CardDescription>
            Kelola Kerangka Acuan Kerja yang telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari KAK..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={filterType}
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Jenis KAK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {uniqueKAKTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* KAK Table */}
          {filteredKAKs.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada data KAK</h3>
              <p className="text-muted-foreground mb-6">
                Belum ada KAK yang ditambahkan atau sesuai dengan filter yang dipilih
              </p>
              <Button asChild>
                <Link to="/kak/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat KAK Baru
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis KAK</TableHead>
                    <TableHead>Komponen Output</TableHead>
                    <TableHead>Tanggal Pengajuan</TableHead>
                    <TableHead>Pagu Anggaran</TableHead>
                    <TableHead>Pembuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKAKs.map((kak) => (
                    <TableRow key={kak.id} className="hover-scale">
                      <TableCell className="font-medium">{kak.jenisKAK}</TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        {kak.komponenOutput}
                      </TableCell>
                      <TableCell>{formatDate(kak.tanggalPengajuan)}</TableCell>
                      <TableCell>{formatCurrency(kak.paguAnggaran)}</TableCell>
                      <TableCell>{kak.createdBy.name}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Buka menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDuplicate(kak.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              <span>Duplikat</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/kak/edit/${kak.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(kak)}
                              className="text-primary"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              <span>Download</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => confirmDelete(kak.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Hapus</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus KAK ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KAKList;
