import React, { useState } from 'react';
import { CI3_SOURCE_FILES, CI3CodeFile } from '../data/ci3SourceCode';
import {
  Code2,
  FileCode,
  Database,
  Copy,
  Check,
  Download,
  FolderTree,
  Terminal,
  Server,
  Layers
} from 'lucide-react';

export const Ci3CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CI3CodeFile>(CI3_SOURCE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    // Generate combined bundle script or SQL
    const fullBundle = CI3_SOURCE_FILES.map(
      (f) => `/* ==========================================================\n * FILE: ${f.path}\n * ========================================================== */\n\n${f.code}\n\n`
    ).join('\n');

    const blob = new Blob([fullBundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SIKMA_KIMIA_UB_CodeIgniter3_Package.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Code2 className="w-4 h-4 text-red-600" />
            <span>Pusat Arsitektur & Source Code CodeIgniter 3</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Struktur Kode Sumber MVC CodeIgniter 3 (CI 3.1.x)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Implementasi resmi arsitektur Model-View-Controller (MVC) untuk SIKMA Kimia FSTeM Universitas Brawijaya
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 bg-[#002B49] text-[#D4AF37] font-bold rounded-lg text-xs hover:bg-[#003865] transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Seluruh Berkas CI3 (.txt / .sql)</span>
          </button>
        </div>
      </div>

      {/* Deployment & Setup Guide Box */}
      <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-[#D4AF37] font-bold">
          <Server className="w-4 h-4" />
          <span>Panduan Deployment CodeIgniter 3 di Web Server Kampus UB (Apache / Nginx / XAMPP):</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed pl-2">
          <li>Salin direktori ini ke root web server Anda: <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">/var/www/html/sikmakimia/</code> atau <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">C:/xampp/htdocs/sikmakimia/</code></li>
          <li>Impor database relasional: <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">mysql -u root -p db_sikma_kimia_ub &lt; database/db_sikma_kimia_ub.sql</code></li>
          <li>Konfigurasi database pada <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">application/config/database.php</code> sesuaikan username & password MySQL Anda.</li>
          <li>Buka di peramban: <code className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">https://sikmakimia.ub.ac.id/dosen</code></li>
        </ol>
      </div>

      {/* Code Browser Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* File Navigator Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-100 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#002B49]" />
            <span>Pohon Berkas CI3</span>
          </div>

          <div className="p-2 space-y-1 flex-1 overflow-y-auto max-h-[500px]">
            {CI3_SOURCE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-start space-x-2.5 ${
                    isSelected
                      ? 'bg-[#002B49] text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {file.type === 'sql' ? (
                    <Database
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        isSelected ? 'text-[#D4AF37]' : 'text-emerald-600'
                      }`}
                    />
                  ) : (
                    <FileCode
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        isSelected ? 'text-[#D4AF37]' : 'text-blue-600'
                      }`}
                    />
                  )}
                  <div className="overflow-hidden">
                    <div className="font-mono text-[11px] truncate leading-tight">
                      {file.name}
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {file.type.toUpperCase()} • {file.path.split('/')[1] || 'root'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Editor Preview */}
        <div className="lg:col-span-3 bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col">
          {/* Top file meta bar */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-emerald-400 font-bold">
                {selectedFile.path}
              </span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {selectedFile.type}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
              <button
                onClick={handleDownloadSingle}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </button>
            </div>
          </div>

          <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-800 text-[11px] text-slate-400">
            {selectedFile.description}
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="p-4 overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-200 bg-slate-900 max-h-[580px] overflow-y-auto">
            <pre className="whitespace-pre">{selectedFile.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
