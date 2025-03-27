
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from 'file-saver';
import { toast } from "@/hooks/use-toast";
import { formatDate } from './utils';

// Function to upload template to Supabase storage
export async function uploadTemplate(file: File): Promise<string | null> {
  try {
    // Create a unique filename
    const fileName = `template_${new Date().getTime()}.docx`;
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from('templates')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Error uploading template:', error);
      toast({
        title: "Gagal mengunggah template",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    
    return data.path;
  } catch (error) {
    console.error('Unexpected error uploading template:', error);
    toast({
      title: "Terjadi kesalahan",
      description: "Gagal mengunggah template. Silakan coba lagi.",
      variant: "destructive",
    });
    return null;
  }
}

// Function to download template from Supabase storage
export async function downloadTemplate(path: string): Promise<Blob | null> {
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
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error downloading template:', error);
    toast({
      title: "Terjadi kesalahan",
      description: "Gagal mengunduh template. Silakan coba lagi.",
      variant: "destructive",
    });
    return null;
  }
}

// Function to generate a document from template with KAK data
export async function generateDocFromTemplate(kak: any, templatePath?: string): Promise<void> {
  try {
    // Use default template if no specific template is provided
    const defaultTemplatePath = 'default_template.docx';
    const path = templatePath || defaultTemplatePath;
    
    // Download the template
    const templateBlob = await downloadTemplate(path);
    if (!templateBlob) {
      throw new Error("Template tidak ditemukan");
    }
    
    // For this implementation, we're using docxtemplater that will be added as a dependency
    // We need to convert the KAK data into a format suitable for the template
    const data = {
      jenisKAK: kak.jenisKAK,
      programPembebanan: kak.programPembebanan,
      kegiatan: kak.kegiatan,
      komponenOutput: kak.komponenOutput,
      subKomponen: kak.subKomponen,
      akunBelanja: kak.akunBelanja,
      paguAnggaran: formatCurrency(kak.paguAnggaran),
      paguDigunakan: formatCurrency(kak.paguDigunakan || calculateTotal(kak.items)),
      createdByName: kak.createdBy.name,
      createdByRole: kak.createdBy.role,
      tanggalPengajuan: formatDate(new Date(kak.tanggalPengajuan)),
      tanggalMulai: formatDate(new Date(kak.tanggalMulai)),
      tanggalAkhir: formatDate(new Date(kak.tanggalAkhir)),
      items: kak.items.map((item: any, index: number) => ({
        no: index + 1,
        nama: item.nama,
        volume: item.volume,
        satuan: item.satuan,
        hargaSatuan: formatCurrency(item.hargaSatuan),
        subtotal: formatCurrency(item.subtotal)
      }))
    };
    
    // Forward to the API for processing
    const formData = new FormData();
    formData.append('template', templateBlob, 'template.docx');
    formData.append('data', JSON.stringify(data));
    
    // In a real implementation, we would send this to a server for processing
    // For now, we'll use a mock implementation that simply downloads the template
    saveAs(templateBlob, `KAK_${kak.jenisKAK.replace(/\s+/g, '_')}_${kak.id.slice(0, 8)}.docx`);
    
    toast({
      title: "Dokumen berhasil dibuat",
      description: "Template berhasil diunduh. Silakan buka dan periksa hasilnya.",
    });
  } catch (error) {
    console.error('Error generating document from template:', error);
    toast({
      title: "Gagal membuat dokumen",
      description: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat dokumen",
      variant: "destructive",
    });
  }
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to calculate total from items
function calculateTotal(items: any[]): number {
  return items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
}
