
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from 'file-saver';
import { toast } from "@/hooks/use-toast";
import { formatDate } from './utils';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

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
    
    // After successful upload, store template metadata in the templates table
    const { error: dbError } = await supabase
      .from('templates')
      .insert({
        name: file.name,
        file_path: fileName,
        description: `Template uploaded on ${new Date().toLocaleDateString()}`
      });
      
    if (dbError) {
      console.error('Error storing template metadata:', dbError);
      toast({
        title: "Gagal menyimpan metadata template",
        description: dbError.message,
        variant: "destructive",
      });
      // We don't return null here because the file was uploaded successfully
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

// Helper function to convert numbers to words (Terbilang)
function numberToWords(num: number): string {
  const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  
  if (num < 0) return `minus ${numberToWords(Math.abs(num))}`;
  if (num < 12) return units[num];
  if (num < 20) return `${units[num % 10]} belas`;
  if (num < 100) return `${units[Math.floor(num / 10)]} puluh ${units[num % 10]}`;
  if (num < 200) return `seratus ${numberToWords(num % 100)}`;
  if (num < 1000) return `${units[Math.floor(num / 100)]} ratus ${numberToWords(num % 100)}`;
  if (num < 2000) return `seribu ${numberToWords(num % 1000)}`;
  if (num < 1000000) return `${numberToWords(Math.floor(num / 1000))} ribu ${numberToWords(num % 1000)}`;
  if (num < 1000000000) return `${numberToWords(Math.floor(num / 1000000))} juta ${numberToWords(num % 1000000)}`;
  return `${numberToWords(Math.floor(num / 1000000000))} milyar ${numberToWords(num % 1000000000)}`;
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
    
    // Convert template blob to array buffer
    const templateContent = await templateBlob.arrayBuffer();
    
    // Calculate total amount
    const totalAmount = calculateTotal(kak.items);
    
    // We need to convert the KAK data into a format suitable for the template
    const data = {
      jenisKAK: kak.jenisKAK,
      programPembebanan: kak.programPembebanan,
      kegiatan: kak.kegiatan,
      komponenOutput: kak.komponenOutput,
      subKomponen: kak.subKomponen,
      akunBelanja: kak.akunBelanja,
      paguAnggaran: formatCurrency(kak.paguAnggaran),
      paguAnggaranTerbilang: numberToWords(kak.paguAnggaran),
      paguDigunakan: formatCurrency(kak.paguDigunakan || totalAmount),
      paguDigunakanTerbilang: numberToWords(kak.paguDigunakan || totalAmount),
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
      })),
      total: formatCurrency(totalAmount),
      totalTerbilang: numberToWords(totalAmount)
    };

    try {
      // Load the docx file as binary content
      const zip = new PizZip(templateContent);
      
      // Initialize the template with PizZip instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      
      // Render the document with the provided data
      doc.render(data);
      
      // Generate the output as a blob
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        compression: 'DEFLATE',
      });
      
      // Save the output file
      saveAs(out, `KAK_${kak.jenisKAK.replace(/\s+/g, '_')}_${kak.id.slice(0, 8)}.docx`);
      
      toast({
        title: "Dokumen berhasil dibuat",
        description: "Template berhasil diunduh. Silakan buka dan periksa hasilnya.",
      });
    } catch (error: any) {
      console.error('Error rendering template:', error);
      if (error.properties && error.properties.errors) {
        console.error('Template error details:', error.properties.errors);
      }
      throw new Error(`Gagal menghasilkan dokumen: ${error.message}`);
    }
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
