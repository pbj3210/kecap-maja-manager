
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { uploadTemplate } from "@/lib/templateUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Download, File, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TemplateManager = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('templates')
        .list();
        
      if (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: "Gagal mengambil daftar template",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Unexpected error fetching templates:', error);
    }
  };
  
  // Use useEffect instead of useState for running side effects
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if it's a valid Word document
    if (!file.name.endsWith('.docx')) {
      toast({
        title: "Format file tidak didukung",
        description: "Hanya file Word (.docx) yang dapat diunggah sebagai template.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    try {
      await uploadTemplate(file);
      toast({
        title: "Template berhasil diunggah",
        description: "Template telah berhasil diunggah dan siap digunakan.",
      });
      fetchTemplates(); // Refresh the template list
    } catch (error) {
      console.error('Error handling file upload:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSetDefaultTemplate = async (path: string) => {
    try {
      // Store the default template path in localStorage
      localStorage.setItem('defaultTemplatePath', path);
      toast({
        title: "Template default berhasil diatur",
        description: "Template ini akan digunakan untuk semua dokumen baru.",
      });
    } catch (error) {
      console.error('Error setting default template:', error);
      toast({
        title: "Gagal mengatur template default",
        description: "Terjadi kesalahan saat mengatur template default.",
        variant: "destructive",
      });
    }
  };
  
  const confirmDelete = (path: string) => {
    setTemplateToDelete(path);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      const { error } = await supabase.storage
        .from('templates')
        .remove([templateToDelete]);
        
      if (error) {
        console.error('Error deleting template:', error);
        toast({
          title: "Gagal menghapus template",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Template berhasil dihapus",
        description: "Template telah berhasil dihapus dari sistem.",
      });
      
      // Check if the deleted template was the default
      const defaultPath = localStorage.getItem('defaultTemplatePath');
      if (defaultPath === templateToDelete) {
        localStorage.removeItem('defaultTemplatePath');
      }
      
      fetchTemplates(); // Refresh the template list
    } catch (error) {
      console.error('Unexpected error deleting template:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };
  
  const handleDownload = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('templates')
        .download(path);
        
      if (error) {
        console.error('Error downloading template:', error);
        toast({
          title: "Gagal mengunduh template",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Create a blob URL and trigger a download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'template.docx';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast({
        title: "Template berhasil diunduh",
        description: "Template telah berhasil diunduh ke perangkat Anda.",
      });
    } catch (error) {
      console.error('Unexpected error downloading template:', error);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Template</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Unggah Template Baru</CardTitle>
          <CardDescription>
            Unggah file template Word (.docx) untuk digunakan dalam pembuatan dokumen KAK
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-file">File Template</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="template-file"
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button disabled={isUploading}>
                  {isUploading ? "Mengunggah..." : "Unggah"}
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Template harus berupa file Word (.docx) dengan placeholder dalam format mustache &#123;&#123;namaVariabel&#125;&#125;
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Template yang Tersedia</CardTitle>
          <CardDescription>
            Kelola template yang telah diunggah
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum ada template</h3>
              <p className="text-muted-foreground mb-6">
                Unggah template Word (.docx) untuk mulai menggunakan fitur ini
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Template</TableHead>
                    <TableHead>Ukuran</TableHead>
                    <TableHead>Terakhir Diubah</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => {
                    const isDefault = localStorage.getItem('defaultTemplatePath') === template.name;
                    return (
                      <TableRow key={template.name}>
                        <TableCell className="font-medium">
                          {template.name}
                          {isDefault && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatFileSize(template.metadata?.size || 0)}</TableCell>
                        <TableCell>{new Date(template.created_at).toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(template.name)}
                              title="Unduh Template"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {!isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultTemplate(template.name)}
                                title="Jadikan Default"
                              >
                                Jadikan Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmDelete(template.name)}
                              className="text-destructive hover:text-destructive"
                              title="Hapus Template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
              Apakah Anda yakin ingin menghapus template ini? Tindakan ini tidak dapat dibatalkan.
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

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default TemplateManager;
