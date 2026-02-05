import { supabase } from '@/lib/supabase';

export interface PDFDocument {
    id: string;
    user_id: string;
    title: string;
    file_url: string;
    file_size?: number;
    page_count?: number;
    created_at: string;
    updated_at: string;
}

export interface PDFAnnotation {
    id: string;
    document_id: string;
    user_id: string;
    page_number: number;
    annotation_type: 'highlight' | 'drawing' | 'text' | 'note';
    annotation_data: any;
    color?: string;
    created_at: string;
    updated_at: string;
}

class PDFService {
    /**
     * Upload a PDF file to Supabase Storage
     */
    async uploadPDF(file: File, userId: string): Promise<{ url: string; path: string }> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('pdfs')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading PDF:', error);
            throw new Error(`Failed to upload PDF: ${error.message}`);
        }

        const { data: urlData } = supabase.storage
            .from('pdfs')
            .getPublicUrl(filePath);

        return {
            url: urlData.publicUrl,
            path: filePath
        };
    }

    /**
     * Create a PDF document record in the database
     */
    async createPDFDocument(
        userId: string,
        title: string,
        fileUrl: string,
        fileSize?: number,
        pageCount?: number
    ): Promise<PDFDocument> {
        const { data, error } = await supabase
            .from('pdf_documents')
            .insert({
                user_id: userId,
                title,
                file_url: fileUrl,
                file_size: fileSize,
                page_count: pageCount
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating PDF document:', error);
            throw new Error(`Failed to create PDF document: ${error.message}`);
        }

        return data;
    }

    /**
     * Get all PDF documents for a user
     */
    async getUserPDFs(userId: string): Promise<PDFDocument[]> {
        const { data, error } = await supabase
            .from('pdf_documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching PDFs:', error);
            throw new Error(`Failed to fetch PDFs: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get a single PDF document
     */
    async getPDFDocument(documentId: string): Promise<PDFDocument | null> {
        const { data, error } = await supabase
            .from('pdf_documents')
            .select('*')
            .eq('id', documentId)
            .single();

        if (error) {
            console.error('Error fetching PDF document:', error);
            return null;
        }

        return data;
    }

    /**
     * Delete a PDF document and its file
     */
    async deletePDFDocument(documentId: string, filePath: string): Promise<void> {
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('pdfs')
            .remove([filePath]);

        if (storageError) {
            console.error('Error deleting PDF file:', storageError);
        }

        // Delete from database (annotations will be cascade deleted)
        const { error: dbError } = await supabase
            .from('pdf_documents')
            .delete()
            .eq('id', documentId);

        if (dbError) {
            console.error('Error deleting PDF document:', dbError);
            throw new Error(`Failed to delete PDF document: ${dbError.message}`);
        }
    }

    /**
     * Save an annotation for a PDF
     */
    async saveAnnotation(
        documentId: string,
        userId: string,
        pageNumber: number,
        annotationType: PDFAnnotation['annotation_type'],
        annotationData: any,
        color?: string
    ): Promise<PDFAnnotation> {
        const { data, error } = await supabase
            .from('pdf_annotations')
            .insert({
                document_id: documentId,
                user_id: userId,
                page_number: pageNumber,
                annotation_type: annotationType,
                annotation_data: annotationData,
                color: color || '#FFFF00'
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving annotation:', error);
            throw new Error(`Failed to save annotation: ${error.message}`);
        }

        return data;
    }

    /**
     * Get all annotations for a PDF document
     */
    async getAnnotations(documentId: string): Promise<PDFAnnotation[]> {
        const { data, error } = await supabase
            .from('pdf_annotations')
            .select('*')
            .eq('document_id', documentId)
            .order('page_number', { ascending: true });

        if (error) {
            console.error('Error fetching annotations:', error);
            throw new Error(`Failed to fetch annotations: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get annotations for a specific page
     */
    async getPageAnnotations(documentId: string, pageNumber: number): Promise<PDFAnnotation[]> {
        const { data, error } = await supabase
            .from('pdf_annotations')
            .select('*')
            .eq('document_id', documentId)
            .eq('page_number', pageNumber);

        if (error) {
            console.error('Error fetching page annotations:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Update an annotation
     */
    async updateAnnotation(
        annotationId: string,
        annotationData: any,
        color?: string
    ): Promise<PDFAnnotation> {
        const updateData: any = { annotation_data: annotationData };
        if (color) updateData.color = color;

        const { data, error } = await supabase
            .from('pdf_annotations')
            .update(updateData)
            .eq('id', annotationId)
            .select()
            .single();

        if (error) {
            console.error('Error updating annotation:', error);
            throw new Error(`Failed to update annotation: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete an annotation
     */
    async deleteAnnotation(annotationId: string): Promise<void> {
        const { error } = await supabase
            .from('pdf_annotations')
            .delete()
            .eq('id', annotationId);

        if (error) {
            console.error('Error deleting annotation:', error);
            throw new Error(`Failed to delete annotation: ${error.message}`);
        }
    }

    /**
     * Delete all annotations for a page
     */
    async deletePageAnnotations(documentId: string, pageNumber: number): Promise<void> {
        const { error } = await supabase
            .from('pdf_annotations')
            .delete()
            .eq('document_id', documentId)
            .eq('page_number', pageNumber);

        if (error) {
            console.error('Error deleting page annotations:', error);
            throw new Error(`Failed to delete page annotations: ${error.message}`);
        }
    }
}

export const pdfService = new PDFService();
