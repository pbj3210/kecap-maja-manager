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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Edit, Trash2, Copy, MoreHorizontal, Search, Plus, FileDown, SortAsc, SortDesc, ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { generateDocFromTemplate } from "@/lib/templateUtils";
import { formatDate } from '@/lib/utils';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

type SortColumn = 'jenisKAK' | 'komponenOutput' | 'tanggalPengajuan' | 'paguAnggaran' | 'createdBy.name';
type SortDirection = 'asc' | 'desc';

const KAKList = () => {
  const { kaks, loading, deleteKAK, duplicateKAK, fetchKAKs } = useKAK();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredKAKs, setFilteredKAKs] = useState(kaks);
  const [filterType, setFilterType] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [kakToDelete, setKakToDelete] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('tanggalPengajuan');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  useEffect(() => {
    fetchKAKs();
  }, []);

  useEffect(() => {
    let filtered = [...kaks];
    
    if (filterType !== "all") {
      filtered = filtered.filter(kak => kak.jenisKAK === filterType);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(kak =>
        kak.jenisKAK.toLowerCase().includes(query) ||
        kak.programPembebanan.toLowerCase().includes(query) ||
        kak.komponenOutput.toLowerCase().includes(query) ||
        kak.createdBy.name.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      if (sortColumn === 'createdBy.name') {
        valueA = a.createdBy.name;
        valueB = b.createdBy.name;
      } else if (sortColumn === 'tanggalPengajuan') {
        valueA = new Date(a[sortColumn]).getTime();
        valueB = new Date(b[sortColumn]).getTime();
      } else {
        valueA = a[sortColumn];
        valueB = b[sortColumn];
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return sortDirection === 'asc' 
          ? (valueA > valueB ? 1 : -1) 
          : (valueA < valueB ? 1 : -1);
      }
    });
    
    setFilteredKAKs(filtered);
  }, [kaks, searchQuery, filterType, sortColumn, sortDirection]);

  const uniqueKAKTypes = Array.from(new Set(kaks.map(kak => kak.jenisKAK)));

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowDown className="h-4 w-4 opacity-30" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-orange-500" /> 
      : <ArrowDown className="h-4 w-4 text-orange-500" />;
  };

  const confirmDelete = (id: string) => {
    setKakToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (kakToDelete) {
      try {
        await deleteKAK(kakToDelete);
        setIsDeleteDialogOpen(false);
        setKakToDelete(null);
      } catch (error) {
        console.error("Error deleting KAK:", error);
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateKAK(id);
    } catch (error) {
      console.error("Error duplicating KAK:", error);
    }
  };

  const handleDownload = async (kak: any) => {
    try {
      const defaultTemplatePath = localStorage.getItem('defaultTemplatePath');
      await generateDocFromTemplate(kak, defaultTemplatePath || undefined);
    } catch (error) {
      console.error("Error generating document:", error);
      toast({
        title: "Gagal mengunduh dokumen",
        description: "Terjadi kesalahan saat membuat file dokumen",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
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
          
          {filteredKAKs.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada data KAK</h3>
              <p className="text-muted-foreground mb-6">
                Belum ada KAK yang ditambahkan atau sesuai dengan filter yang dipilih
              </p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
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
                    <TableHead onClick={() => handleSort('jenisKAK')} className="cursor-pointer">
                      <div className="flex items-center">
                        Jenis KAK {renderSortIcon('jenisKAK')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('komponenOutput')} className="cursor-pointer">
                      <div className="flex items-center">
                        Komponen Output {renderSortIcon('komponenOutput')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('tanggalPengajuan')} className="cursor-pointer">
                      <div className="flex items-center">
                        Tanggal Pengajuan {renderSortIcon('tanggalPengajuan')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('paguAnggaran')} className="cursor-pointer">
                      <div className="flex items-center">
                        Pagu Anggaran {renderSortIcon('paguAnggaran')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('createdBy.name')} className="cursor-pointer">
                      <div className="flex items-center">
                        Pembuat {renderSortIcon('createdBy.name')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKAKs.map((kak) => (
                    <TableRow key={kak.id} className="hover-scale">
                      <TableCell className="font-medium">{kak.jenisKAK}</TableCell>
                      <TableCell className="max-w-[280px] whitespace-normal break-words">
                        {kak.komponenOutput}
                      </TableCell>
                      <TableCell>{formatDate(new Date(kak.tanggalPengajuan))}</TableCell>
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
                              className="text-orange-600"
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
