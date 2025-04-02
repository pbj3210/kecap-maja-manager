
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from 'file-saver';
import { toast } from "@/hooks/use-toast";
import { formatDate } from './utils';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

// Function to upload template to Supabase storage
export async function uploadTemplate(file: File): Promise<string | null> {
  try {
    const fileName = `template_${new Date().getTime()}.docx`;
    
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

// Fetch the template from Google Docs or other URL
async function fetchTemplateFromUrl(url: string): Promise<ArrayBuffer | null> {
  try {
    // Handle Google Docs URL - convert to export URL if needed
    let fetchUrl = url;
    
    if (url.includes('docs.google.com/document') && !url.includes('export=download')) {
      // Extract document ID
      const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (idMatch && idMatch[1]) {
        const docId = idMatch[1];
        fetchUrl = `https://docs.google.com/document/d/${docId}/export?format=docx`;
      }
    }
    
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching template from URL:', error);
    return null;
  }
}

// Function to generate a document from template with KAK data
export async function generateDocFromTemplate(kak: any, templatePath?: string): Promise<void> {
  try {
    let templateContent: ArrayBuffer | null = null;
    
    // First try to use the Google Docs URL provided
    const googleDocsUrl = "https://docs.google.com/document/d/17AHhACqveyB7N_6GJ0ZLoUdso4w3JziePDCRr-Xhpdo/edit?usp=sharing";
    templateContent = await fetchTemplateFromUrl(googleDocsUrl);
    
    // If Google Docs template fails, try the Supabase template
    if (!templateContent && templatePath) {
      // Make sure the templates bucket exists
      const bucketExists = await ensureTemplateBucketExists();
      if (!bucketExists) {
        toast({
          title: "Tidak dapat mengakses storage",
          description: "Gagal menggunakan template dari Supabase",
          variant: "destructive",
        });
        return;
      }
      
      const templateBlob = await downloadTemplate(templatePath);
      if (templateBlob) {
        templateContent = await templateBlob.arrayBuffer();
      }
    }
    
    // If both options fail, fallback to the secondary Google Docs URL
    if (!templateContent) {
      const fallbackUrl = "https://docs.google.com/document/d/1l6UqGaR9xq4eMGFV9mv-J2eAQRsTiyQF/edit?usp=sharing&ouid=103425813951174435708&rtpof=true&sd=true";
      templateContent = await fetchTemplateFromUrl(fallbackUrl);
      
      if (!templateContent) {
        toast({
          title: "Gagal mengunduh template",
          description: "Tidak dapat mengakses template dokumen",
          variant: "destructive",
        });
        return;
      }
    }
    
    const totalAmount = calculateTotal(kak.items);
    
    // Prepare data to match template fields with {{namakolom}} format
    const data = {
      // Basic KAK information
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
      
      // People information
      createdByName: kak.createdBy.name,
      createdByRole: kak.createdBy.role,
      
      // Dates
      tanggalPengajuan: formatDate(new Date(kak.tanggalPengajuan)),
      tanggalMulai: formatDate(new Date(kak.tanggalMulai)),
      tanggalAkhir: formatDate(new Date(kak.tanggalAkhir)),
      
      // Items and totals
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
      console.log('Rendering template with data:', data);
      const zip = new PizZip(templateContent);
      
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      
      // Render the document with data
      doc.render(data);
      
      // Generate and download the document
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        compression: 'DEFLATE',
      });
      
      // Use a more descriptive filename with date
      const currentDate = new Date().toISOString().slice(0, 10);
      saveAs(out, `KAK_${kak.jenisKAK.replace(/\s+/g, '_')}_${currentDate}.docx`);
      
      toast({
        title: "Dokumen berhasil dibuat",
        description: "Dokumen KAK berhasil diunduh dengan data yang telah diisi.",
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

// Function to check if a storage bucket exists and create it if it doesn't
async function ensureTemplateBucketExists(): Promise<boolean> {
  try {
    // Check if the templates bucket exists
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }
    
    const templateBucketExists = buckets.some(bucket => bucket.name === 'templates');
    
    if (!templateBucketExists) {
      // If the bucket doesn't exist, create it
      const { error: createBucketError } = await supabase
        .storage
        .createBucket('templates', {
          public: true
        });
      
      if (createBucketError) {
        console.error('Error creating templates bucket:', createBucketError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring template bucket exists:', error);
    return false;
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
