
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
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
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
    // Refresh data from the database
    fetchKAKs();
  }, []);

  useEffect(() => {
    // Filter and sort KAKs based on search query, filter type, and sort options
    let filtered = [...kaks];
    
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
        kak.komponenOutput.toLowerCase().includes(query) ||
        kak.createdBy.name.toLowerCase().includes(query)
      );
    }
    
    // Sort the data
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      // Handle nested properties like createdBy.name
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
      
      // Compare values
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

  // Get unique KAK types for filter
  const uniqueKAKTypes = Array.from(new Set(kaks.map(kak => kak.jenisKAK)));

  // Sort handling
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, set default direction to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Render sort indicator
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

  const handleDownload = (kak: any) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set font size and add title
      doc.setFontSize(16);
      doc.text("KERANGKA ACUAN KERJA (KAK)", 105, 20, { align: 'center' });
      
      // Add content
      doc.setFontSize(12);
      doc.text(`Jenis KAK: ${kak.jenisKAK}`, 20, 40);
      doc.text(`Program Pembebanan: ${kak.programPembebanan}`, 20, 50);
      doc.text(`Kegiatan: ${kak.kegiatan}`, 20, 60);
      doc.text(`Komponen Output: ${kak.komponenOutput}`, 20, 70);
      doc.text(`Sub Komponen: ${kak.subKomponen}`, 20, 80);
      doc.text(`Akun Belanja: ${kak.akunBelanja}`, 20, 90);
      doc.text(`Pagu Anggaran: ${formatCurrency(kak.paguAnggaran)}`, 20, 100);
      doc.text(`Diajukan oleh: ${kak.createdBy.name}`, 20, 110);
      doc.text(`Tanggal Pengajuan: ${formatDate(new Date(kak.tanggalPengajuan))}`, 20, 120);
      doc.text(`Tanggal Mulai: ${formatDate(new Date(kak.tanggalMulai))}`, 20, 130);
      doc.text(`Tanggal Akhir: ${formatDate(new Date(kak.tanggalAkhir))}`, 20, 140);
      
      // Add items table
      let yPos = 160;
      doc.text("RINCIAN KEGIATAN:", 20, yPos);
      yPos += 10;
      
      // Table headers
      doc.setFontSize(10);
      doc.text("No", 20, yPos);
      doc.text("Nama Item", 35, yPos);
      doc.text("Volume", 110, yPos);
      doc.text("Satuan", 130, yPos);
      doc.text("Harga Satuan", 150, yPos);
      doc.text("Subtotal", 180, yPos);
      
      yPos += 5;
      doc.line(20, yPos, 190, yPos); // Draw a line
      yPos += 5;
      
      // Table rows
      kak.items.forEach((item: any, index: number) => {
        // Add page if needed
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${index + 1}`, 20, yPos);
        doc.text(item.nama, 35, yPos);
        doc.text(item.volume.toString(), 110, yPos);
        doc.text(item.satuan, 130, yPos);
        doc.text(formatCurrency(item.hargaSatuan), 150, yPos);
        doc.text(formatCurrency(item.subtotal), 180, yPos);
        
        yPos += 10;
      });
      
      yPos += 5;
      doc.line(20, yPos, 190, yPos); // Draw a line
      yPos += 10;
      
      // Total
      doc.setFontSize(12);
      doc.text(`Total: ${formatCurrency(kak.paguDigunakan || kak.items.reduce((sum: number, item: any) => sum + item.subtotal, 0))}`, 150, yPos);
      
      // Save the PDF
      doc.save(`KAK_${kak.jenisKAK.replace(/\s+/g, '_')}_${kak.id.slice(0, 8)}.pdf`);
      
      toast({
        title: "Dokumen berhasil diunduh",
        description: "KAK telah berhasil diunduh sebagai file PDF",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Gagal mengunduh dokumen",
        description: "Terjadi kesalahan saat membuat file PDF",
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
