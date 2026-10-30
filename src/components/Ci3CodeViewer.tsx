import React, { useState } from 'react';
import { CI3_SOURCE_FILES, CI3CodeFile } from '../data/ci3SourceCode';
import {
  Code2,
  FileCode,
  Database,
  FolderTree
} from 'lucide-react';

export const Ci3CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CI3CodeFile>(CI3_SOURCE_FILES[0]);

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
            Implementasi arsitektur Model-View-Controller (MVC) untuk SIKMA Kimia FSTeM Universitas Brawijaya
          </p>
        </div>
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
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-emerald-400 font-bold">
                {selectedFile.path}
              </span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {selectedFile.type}
              </span>
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
