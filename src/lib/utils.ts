
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
    saveAs(out, outputFilename);
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
}
