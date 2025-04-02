
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
    
    // Pre-processing validation for Google Docs templates
    const textDecoder = new TextDecoder('utf-8');
    const templateText = textDecoder.decode(templateContent.slice(0, 200)); // Check first 200 bytes
    const isGoogleDocs = templateText.includes('Google') || templateText.includes('Docs');
    if (isGoogleDocs) {
      console.log('Detected Google Docs template format');
    }
    
    // Load the docx file as binary content
    const zip = new PizZip(templateContent);
    
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
      if (error.properties && error.properties.errors) {
        console.error('Error details in utils:', error.properties.errors);
        
        // Extract specific error messages for tag issues
        const errors = error.properties.errors;
        if (Array.isArray(errors)) {
          errors.forEach((err: any) => {
            if (err.properties) {
              console.error(`Tag error: ${err.properties.id} - ${err.properties.explanation}`);
              if (err.properties.xtag) {
                console.error(`Problem tag: ${err.properties.xtag}`);
              }
            }
          });
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error generating Word document in utils:', error);
    throw error;
  }
}
