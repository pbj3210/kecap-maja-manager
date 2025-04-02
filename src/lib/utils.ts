
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Generate a Word document from a template and data
 * @param templateContent The template content as an ArrayBuffer
 * @param data The data to inject into the template
 * @param outputFilename The name of the output file
 */
export function generateWordDoc(
  templateContent: ArrayBuffer,
  data: Record<string, any>,
  outputFilename: string
): void {
  try {
    console.log('Generating Word document with data:', JSON.stringify(data, null, 2));
    
    // Log all data keys being provided to template
    console.log('Data keys being provided to template:', Object.keys(data));
    
    // Handle array data that might be used for tables
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        console.log(`Array data for key "${key}" has items with properties:`, 
          Object.keys(value[0]));
      }
    });
    
    // Pre-processing validation for Google Docs templates
    const textDecoder = new TextDecoder('utf-8');
    const templateText = textDecoder.decode(templateContent.slice(0, 200)); // Check first 200 bytes
    const isGoogleDocs = templateText.includes('Google') || templateText.includes('Docs');
    if (isGoogleDocs) {
      console.log('Detected Google Docs template format');
    }
    
    // Load the docx file as binary content
    const zip = new PizZip(templateContent);
    
    // List files in the zip to debug template structure
    console.log('Files in template zip:', Object.keys(zip.files));
    
    // Initialize the template with PizZip instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Add error handling using try-catch
    try {
      // Render the document with the provided data
      doc.render(data);
      
      // Generate the output as a blob
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        compression: 'DEFLATE',
      });
      
      // Save the output file
      saveAs(out, outputFilename);
      console.log('Document generated and saved as:', outputFilename);
    } catch (error: any) {
      console.error('Docxtemplater error in utils:', error);
      
      // Detailed error information
      if (error.properties && error.properties.errors) {
        console.error('Error details in utils:', error.properties.errors);
        
        // Extract specific error messages for tag issues
        const errors = error.properties.errors;
        let errorDetails = "Error details:";
        
        if (Array.isArray(errors)) {
          errors.forEach((err: any) => {
            if (err.properties) {
              errorDetails += `\n- Error ${err.properties.id}: ${err.properties.explanation}`;
              if (err.properties.xtag) {
                errorDetails += `\n  Problem tag: ${err.properties.xtag}`;
              }
              if (err.properties.offset) {
                errorDetails += `\n  At position: ${err.properties.offset}`;
              }
              if (err.properties.actual) {
                errorDetails += `\n  Found: "${err.properties.actual}"`;
              }
            }
          });
        }
        
        console.error(errorDetails);
      }
      
      // Log message and full error object for debugging
      console.error('Full error object:', JSON.stringify(error, null, 2));
      throw error;
    }
  } catch (error) {
    console.error('Error generating Word document in utils:', error);
    throw error;
  }
}
