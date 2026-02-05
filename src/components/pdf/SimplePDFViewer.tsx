import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Set up PDF.js worker - using react-pdf's bundled worker to avoid version mismatch
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface SimplePDFViewerProps {
    fileUrl: string;
    onClose?: () => void;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ fileUrl, onClose }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.2);
    const { toast } = useToast();

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        toast({
            title: 'PDF Loaded',
            description: `Successfully loaded ${numPages} pages`,
        });
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('PDF Load Error:', error);
        toast({
            title: 'Failed to load PDF',
            description: 'Please check if the file exists and try again',
            variant: 'destructive',
        });
    };

    const changePage = (offset: number) => {
        setCurrentPage(prevPage => Math.min(Math.max(1, prevPage + offset), numPages));
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.2, 3.0));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.2, 0.5));
    };

    return (
        <div className="flex flex-col h-full bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {onClose && (
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4 mr-2" />
                                Close
                            </Button>
                        )}
                        <span className="text-white font-medium">PDF Viewer</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleZoomOut}>
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-white text-sm min-w-[60px] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button variant="outline" size="sm" onClick={handleZoomIn}>
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-auto bg-gray-800 p-8">
                <div className="flex justify-center">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex items-center justify-center h-96">
                                <div className="text-white">Loading PDF...</div>
                            </div>
                        }
                        error={
                            <div className="flex items-center justify-center h-96">
                                <div className="text-red-500">Failed to load PDF</div>
                            </div>
                        }
                    >
                        <Page
                            pageNumber={currentPage}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </Document>
                </div>
            </div>

            {/* Footer Controls */}
            <div className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changePage(-1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-white text-sm min-w-[120px] text-center">
                        Page {currentPage} of {numPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changePage(1)}
                        disabled={currentPage >= numPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
