import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';
import { XMarkIcon, ArrowDownTrayIcon } from './Icons';

// Setup PDF.js worker. It's crucial for performance and to avoid loading issues.
// Using a full CDN URL for robustness in different environments.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
    data: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [pdf, setPdf] = useState<any>(null); // Using 'any' for pdfjs.PDFDocumentProxy
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dataURLToUint8Array = (dataUrl: string) => {
        try {
            const base64 = dataUrl.split(',')[1];
            if (!base64) throw new Error("Invalid data URL");
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        } catch (e) {
            console.error("Failed to decode base64 data URL", e);
            throw new Error("Failed to decode file data.");
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadPdf = async () => {
            if (!isMounted) return;
            setIsLoading(true);
            setError(null);
            try {
                const pdfData = dataURLToUint8Array(data);
                const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                const pdfDoc = await loadingTask.promise;
                if (isMounted) {
                    setPdf(pdfDoc);
                    setNumPages(pdfDoc.numPages);
                }
            } catch (err: any) {
                console.error("Failed to load PDF", err);
                if (isMounted) {
                    setError(err.message || "Failed to load PDF. It may be corrupted or unsupported.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadPdf();
        
        return () => { isMounted = false; };
    }, [data]);

    useEffect(() => {
        if (!pdf || !canvasRef.current || currentPage > numPages || currentPage < 1) return;
        
        let isRenderCancelled = false;
        
        const renderPage = async () => {
            try {
                const page = await pdf.getPage(currentPage);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = canvasRef.current;
                if (!canvas || isRenderCancelled) return;

                const context = canvas.getContext('2d');
                if (!context) return;
                
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = { canvasContext: context, viewport: viewport };
                await page.render(renderContext).promise;
            } catch (err) {
                console.error('Error rendering page:', err);
                setError("An error occurred while rendering the PDF page.");
            }
        };

        renderPage();
        
        return () => { isRenderCancelled = true; };
    }, [pdf, currentPage, numPages]);

    const goToPreviousPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const goToNextPage = () => setCurrentPage(p => Math.min(numPages, p + 1));

    if (isLoading) {
        return <div className="text-center p-8 text-slate-600 dark:text-slate-400">Loading PDF preview...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>;
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {numPages > 1 && (
                <div className="flex items-center gap-4 p-2 bg-slate-200 dark:bg-slate-700 rounded-lg sticky top-0 z-10">
                    <button onClick={goToPreviousPage} disabled={currentPage <= 1} className="px-3 py-1 bg-sky-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-sky-600">
                        Prev
                    </button>
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                        Page {currentPage} of {numPages}
                    </span>
                    <button onClick={goToNextPage} disabled={currentPage >= numPages} className="px-3 py-1 bg-sky-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-sky-600">
                        Next
                    </button>
                </div>
            )}
            <canvas ref={canvasRef} className="rounded-md shadow-md" />
        </div>
    );
};


interface AttachmentPreviewModalProps {
  attachment: {
    name: string;
    data: string;
  };
  onClose: () => void;
}

const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({ attachment, onClose }) => {
  const getMimeType = (dataUrl: string) => {
    if (!dataUrl.startsWith('data:')) return 'application/octet-stream';
    return dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
  };

  const mimeType = getMimeType(attachment.data);
  const isImage = mimeType.startsWith('image/');
  const isPdf = mimeType === 'application/pdf';

  const renderPreview = () => {
    if (isImage) {
      return (
        <img
          src={attachment.data}
          alt={attachment.name}
          className="max-w-full max-h-[70vh] object-contain mx-auto"
        />
      );
    }
    if (isPdf) {
      return <PdfPreview data={attachment.data} />;
    }
    return (
      <div className="text-center py-12 px-6">
        <p className="text-slate-600 dark:text-slate-400">
          No preview available for this file type. You can download it to view.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate pr-4" title={attachment.name}>
            {attachment.name}
          </h2>
          <div className="flex items-center gap-2">
            <a
              href={attachment.data}
              download={attachment.name}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg shadow-md hover:bg-sky-600 transition-all duration-200"
              aria-label="Download File"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close Preview">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main className="p-4 flex-grow overflow-auto flex justify-center items-center bg-slate-50 dark:bg-slate-900/50">
          {renderPreview()}
        </main>
      </div>
    </div>
  );
};

export default AttachmentPreviewModal;