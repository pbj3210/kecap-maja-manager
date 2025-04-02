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
        console.log('Using Google Docs export URL:', fetchUrl);
      }
    }
    
    console.log('Fetching template from URL:', fetchUrl);
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

// Function to validate template for common Google Docs issues
function validateGoogleDocsTemplate(templateContent: ArrayBuffer): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  try {
    // Basic size validation
    if (templateContent.byteLength < 2000) {
      issues.push("Template file terlalu kecil, kemungkinan tidak valid");
    }
    
    // Check if file is a valid ZIP (DOCX files are ZIP archives)
    try {
      new PizZip(templateContent);
    } catch (e) {
      issues.push("File bukan dokumen Word yang valid");
      return { valid: issues.length === 0, issues };
    }
    
    // Further validation could be added here
    return { valid: issues.length === 0, issues };
  } catch (error) {
    issues.push("Gagal memvalidasi template");
    return { valid: false, issues };
  }
}

/**
 * Generate a document from template with KAK data
 */
export async function generateDocFromTemplate(kak: any, templatePath?: string): Promise<void> {
  try {
    let templateContent: ArrayBuffer | null = null;
    
    // First try to use the Google Docs URL provided
    const googleDocsUrl = "https://docs.google.com/document/d/17AHhACqveyB7N_6GJ0ZLoUdso4w3JziePDCRr-Xhpdo/edit?usp=sharing";
    console.log('Attempting to fetch from primary Google Docs URL:', googleDocsUrl);
    templateContent = await fetchTemplateFromUrl(googleDocsUrl);
    
    // If Google Docs template fails, try the Supabase template
    if (!templateContent && templatePath) {
      console.log('Primary Google Docs template failed, trying Supabase template:', templatePath);
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
      console.log('Both primary Google Docs and Supabase templates failed, trying fallback URL:', fallbackUrl);
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
    
    // Validate the template before processing
    const validation = validateGoogleDocsTemplate(templateContent);
    if (!validation.valid) {
      toast({
        title: "Template tidak valid",
        description: validation.issues.join('. '),
        variant: "destructive",
      });
      return;
    }
    
    const totalAmount = calculateTotal(kak.items);
    
    // Create a log of the template data structure
    console.log('Template data structure based on screenshot:');
    console.log('program_pembebanan, kegiatan, rincian_output, komponen_output, nama, volume, satuan, harga_satuan, subtotal');
    
    // Prepare data to exactly match template fields from the screenshot
    // IMPORTANT: Keys must match exactly what's in the template - using underscore notation as shown in screenshot
    const data = {
      // Basic KAK information - using exact template tag names from screenshot
      program_pembebanan: kak.programPembebanan || '',
      kegiatan: kak.kegiatan || '',
      rincian_output: kak.rincianOutput || '',
      komponen_output: kak.komponenOutput || '',
      subKomponen: kak.subKomponen || '',
      akunBelanja: kak.akunBelanja || '',
      
      // Financial information
      paguAnggaran: formatCurrency(kak.paguAnggaran || 0),
      paguAnggaranTerbilang: numberToWords(kak.paguAnggaran || 0),
      paguDigunakan: formatCurrency(kak.paguDigunakan || totalAmount || 0),
      paguDigunakanTerbilang: numberToWords(kak.paguDigunakan || totalAmount || 0),
      
      // People information
      createdByName: kak.createdBy?.name || '',
      createdByRole: kak.createdBy?.role || '',
      
      // Dates
      tanggalPengajuan: kak.tanggalPengajuan ? formatDate(new Date(kak.tanggalPengajuan)) : '',
      tanggalMulai: kak.tanggalMulai ? formatDate(new Date(kak.tanggalMulai)) : '',
      tanggalAkhir: kak.tanggalAkhir ? formatDate(new Date(kak.tanggalAkhir)) : '',
      
      // Items for table rows - match screenshot showing nama, volume, satuan, harga_satuan, subtotal
      items: Array.isArray(kak.items) ? kak.items.map((item: any, index: number) => ({
        no: index + 1,
        nama: item.nama || '',
        volume: item.volume || 0,
        satuan: item.satuan || '',
        harga_satuan: formatCurrency(item.hargaSatuan || 0), // Match tag in screenshot: {{harga_satuan}}
        subtotal: formatCurrency(item.subtotal || 0)  // Match tag in screenshot: {{subtotal}}
      })) : [],
      total: formatCurrency(totalAmount || 0),
      totalTerbilang: numberToWords(totalAmount || 0)
    };

    console.log('Rendering template with data keys:', Object.keys(data));
    console.log('Item fields for table:', Object.keys(data.items[0] || {}));
    
    try {
      console.log('Template content size:', templateContent.byteLength, 'bytes');
      
      const zip = new PizZip(templateContent);
      
      // List all files in the zip to debug
      const zipFiles = Object.keys(zip.files);
      console.log('Files in template zip:', zipFiles);
      
      // Configure docxtemplater with explicit error handling for Google Docs
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      
      try {
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
        const filename = `KAK_${kak.jenisKAK.replace(/\s+/g, '_')}_${currentDate}.docx`;
        console.log('Downloading file as:', filename);
        saveAs(out, filename);
        
        toast({
          title: "Dokumen berhasil dibuat",
          description: "Dokumen KAK berhasil diunduh dengan data yang telah diisi.",
        });
      } catch (error: any) {
        console.error('Error rendering template:', error);
        
        // Extra defensive Google Docs specific error debugging
        let errorMessage = "Terjadi kesalahan saat memproses template Google Docs.";
        
        if (error.properties && error.properties.errors) {
          console.error('Template error details:', JSON.stringify(error.properties.errors, null, 2));
          
          // Create a more detailed error analysis
          const errors = error.properties.errors;
          
          if (Array.isArray(errors)) {
            // Group errors by type
            const tagIssues = errors.filter((e: any) => 
              e.properties && [
                'unopened_tag', 
                'unclosed_tag',
                'duplicate_open_tag',
                'duplicate_close_tag'
              ].includes(e.properties.id)
            );
            
            if (tagIssues.length > 0) {
              // Extract all problematic tags
              const problemTags = tagIssues
                .filter((e: any) => e.properties && e.properties.xtag)
                .map((e: any) => e.properties.xtag);
              
              // Group by error type for better reporting
              const unopenedTags = tagIssues
                .filter((e: any) => e.properties && e.properties.id === 'unopened_tag')
                .map((e: any) => e.properties.xtag);
                
              const unclosedTags = tagIssues
                .filter((e: any) => e.properties && e.properties.id === 'unclosed_tag')
                .map((e: any) => e.properties.xtag);
              
              const duplicateTags = tagIssues
                .filter((e: any) => e.properties && 
                  (e.properties.id === 'duplicate_open_tag' || e.properties.id === 'duplicate_close_tag'))
                .map((e: any) => e.properties.xtag);
              
              // Build a user-friendly error message
              errorMessage = "Template Google Docs memiliki kesalahan format tag:";
              
              if (unopenedTags.length > 0) {
                errorMessage += `\n- Tag tidak dibuka dengan benar: ${unopenedTags.join(', ')}`;
              }
              
              if (unclosedTags.length > 0) {
                errorMessage += `\n- Tag tidak ditutup dengan benar: ${unclosedTags.join(', ')}`;
              }
              
              if (duplicateTags.length > 0) {
                errorMessage += `\n- Tag duplikat: ${duplicateTags.join(', ')}`;
              }
              
              errorMessage += "\n\nPastikan semua tag menggunakan format {{nama}} dengan tepat tanpa spasi atau karakter tambahan di antara kurung kurawal.";
            }
          }
        }
        
        // Log and display the error
        console.error('Detailed error message:', errorMessage);
        toast({
          title: "Format template Google Docs tidak valid",
          description: errorMessage,
          variant: "destructive",
        });
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error generating document from template:', error);
      throw error;
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
  if (!Array.isArray(items)) {
    console.warn('Items is not an array:', items);
    return 0;
  }
  return items.reduce((sum: number, item: any) => sum + (Number(item.subtotal) || 0), 0);
}
