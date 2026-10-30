import React, { useState } from 'react';
import { Pengumuman } from '../types/sikma';
import { BellRing, Calendar, User, Download, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface PengumumanViewProps {
  pengumumanList: Pengumuman[];
}

export const PengumumanView: React.FC<PengumumanViewProps> = ({ pengumumanList }) => {
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');

  const filtered = pengumumanList.filter((p) => {
    if (selectedKategori === 'Semua') return true;
    return p.kategori === selectedKategori;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <BellRing className="w-4 h-4 text-[#002B49]" />
            <span>Papan Informasi & Unduhan Resmi</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Pengumuman & Dokumen Akademik Kimia UB
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Departemen Kimia FSTeM Universitas Brawijaya • Surat edaran, pedoman skripsi, dan keselamatan kerja laboratorium
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {['Semua', 'Akademik', 'Laboratorium', 'Skripsi'].map((kat) => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                selectedKategori === kat
                  ? 'bg-[#002B49] text-[#D4AF37] font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* Download Center Quick Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
          Dokumen & Panduan Skripsi Kimia UB (Format Baku)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold text-slate-900">Pedoman Penulisan Skripsi Kimia</div>
                <div className="text-[11px] text-slate-500">PDF • Revisi 2026</div>
              </div>
            </div>
            <button
              onClick={() => alert('Mengunduh Pedoman Penulisan Skripsi Kimia FSTeM UB...')}
              className="p-2 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-bold text-slate-900">SOP Keselamatan Lab & Limbah B3</div>
                <div className="text-[11px] text-slate-500">PDF • FSTeM UB</div>
              </div>
            </div>
            <button
              onClick={() => alert('Mengunduh SOP Pengelolaan Limbah Laboratorium Kimia...')}
              className="p-2 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900">Template Proposal Skripsi Kimia</div>
                <div className="text-[11px] text-slate-500">DOCX • Siap Pakai</div>
              </div>
            </div>
            <button
              onClick={() => alert('Mengunduh Template Naskah Proposal Skripsi Kimia...')}
              className="p-2 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  item.kategori === 'Skripsi'
                    ? 'bg-amber-100 text-amber-800'
                    : item.kategori === 'Laboratorium'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {item.kategori}
              </span>
              <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.tanggal}</span>
              </div>
            </div>

            <h3 className="font-bold text-sm text-slate-900 leading-snug">{item.judul}</h3>
            <p className="text-slate-700 leading-relaxed pt-1 text-[12px]">{item.isi}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-[#002B49]">{item.penulis}</span>
              <span className="text-slate-400">SIKMA Kimia UB</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
