import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { dataUrlToUint8Array } from '../utils/suratBalasanMitraHelpers';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfCanvasViewerProps {
  dataUrl: string;
  fileName: string;
  onFallbackToStructured?: () => void;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  dataUrl,
  fileName,
  onFallbackToStructured
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageCount, setPageCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    const renderPdf = async () => {
      setLoading(true);
      setErrorMsg(null);
      setPageCount(0);

      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
      }

      const bytes = dataUrlToUint8Array(dataUrl);
      if (!bytes || bytes.length === 0) {
        if (!cancelled) {
          setErrorMsg('Berkas PDF tidak dapat dibaca atau format base64 tidak valid.');
          setLoading(false);
        }
        return;
      }

      try {
        loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdfDoc = await loadingTask.promise;
        if (cancelled) return;

        setPageCount(pdfDoc.numPages);

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          if (cancelled) break;
          const page = await pdfDoc.getPage(pageNum);
          if (cancelled) break;

          const baseViewport = page.getViewport({ scale: 1 });
          const targetCssWidth = Math.min(680, Math.max(320, (container?.clientWidth || 640) - 24));
          const displayScale = targetCssWidth / baseViewport.width;
          const outputScale = Math.min(window.devicePixelRatio || 1.5, 2);
          const renderViewport = page.getViewport({ scale: displayScale * outputScale });

          const pageWrapper = document.createElement('div');
          pageWrapper.className =
            'bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden mx-auto flex flex-col items-center';
          pageWrapper.style.width = `${Math.round(baseViewport.width * displayScale)}px`;

          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(renderViewport.width);
          canvas.height = Math.floor(renderViewport.height);
          canvas.style.width = `${Math.round(baseViewport.width * displayScale)}px`;
          canvas.style.height = `${Math.round(baseViewport.height * displayScale)}px`;
          canvas.className = 'block bg-white';

          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({
              canvasContext: ctx,
              canvas,
              viewport: renderViewport
            }).promise;
          }

          if (pdfDoc.numPages > 1) {
            const caption = document.createElement('div');
            caption.className =
              'w-full text-center text-[10px] font-semibold text-slate-500 bg-slate-50 border-t border-slate-200 py-1';
            caption.textContent = `Halaman ${pageNum} dari ${pdfDoc.numPages}`;
            pageWrapper.appendChild(canvas);
            pageWrapper.appendChild(caption);
          } else {
            pageWrapper.appendChild(canvas);
          }

          if (!cancelled && containerRef.current) {
            containerRef.current.appendChild(pageWrapper);
          }
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setErrorMsg(
            'Dokumen PDF tidak dapat dirender langsung di pratinjau. Anda tetap dapat mengunduh berkas asli atau melihat ringkasan surat terstruktur.'
          );
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
      if (loadingTask) {
        loadingTask.destroy().catch(() => {});
      }
    };
  }, [dataUrl]);

  return (
    <div className="bg-slate-200/80 border border-slate-300 rounded-xl p-3 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white px-3 py-2 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#002B49] shrink-0" />
          <span className="font-bold text-slate-800 truncate">{fileName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pageCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
              {pageCount} Halaman PDF
            </span>
          )}
          {onFallbackToStructured && (
            <button
              type="button"
              onClick={onFallbackToStructured}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-[#002B49] border border-slate-300 transition cursor-pointer"
            >
              Lihat Ringkasan Surat
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-slate-200 gap-2.5 text-slate-600">
          <Loader2 className="w-6 h-6 text-[#002B49] animate-spin" />
          <span className="text-xs font-semibold">Memuat halaman dokumen PDF...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-950 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMsg}</p>
          </div>
          {onFallbackToStructured && (
            <button
              type="button"
              onClick={onFallbackToStructured}
              className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003865] text-white font-bold text-xs rounded-lg cursor-pointer transition"
            >
              Tampilkan Ringkasan Surat Terstruktur
            </button>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={`space-y-3 max-h-[56vh] overflow-y-auto pr-1 ${loading && !pageCount ? 'hidden' : ''}`}
      />
    </div>
  );
};
