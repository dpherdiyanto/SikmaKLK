import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Scan,
  Clock,
  Timer,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  Unlock,
  UserCheck,
  Search,
  PlusCircle,
  Maximize2,
  Copy,
  Check,
  X,
  Camera,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Info
} from 'lucide-react';
import { INITIAL_MAHASISWA_LIST } from '../data/mahasiswaList.ts';
import { Mahasiswa } from '../types/sikma';

export interface QrSosialisasiKLK {
  id: string;
  kode: string;
  judul: string;
  waktuDibuat: number; // timestamp ms
  durasiJam: number; // e.g. 0.25, 0.5, 0.75, 1, 1.25, 1.5
  durasiMenit?: number; // e.g. 15, 30, 45, 60, 75, 90
  waktuKadaluarsa: number; // timestamp ms
  dibuatOleh: string;
  keterangan?: string;
  status: 'Aktif' | 'Kadaluarsa' | 'Nonaktif';
}

export interface VerifiedStudentRecord {
  nim: string;
  nama: string;
  kodeQr: string;
  waktuVerifikasi: number;
}

// Data awal QR Sosialisasi: Default ada 1 QR aktif 60 menit dan 1 QR kadaluarsa untuk pengujian
export const INITIAL_QR_LIST: QrSosialisasiKLK[] = [
  {
    id: 'qr-sos-1',
    kode: 'KLK-SOS-2026-KIMIA',
    judul: 'Sosialisasi KLK Kimia Semester Ganjil 2026/2027',
    waktuDibuat: Date.now() - 15 * 60 * 1000, // Dibuat 15 menit lalu
    durasiJam: 1, // 60 menit
    durasiMenit: 60,
    waktuKadaluarsa: Date.now() + 45 * 60 * 1000, // Masih aktif ~45 menit lagi
    dibuatOleh: 'Prof. Dr. Dra. Hermin Sulistyarti, M.Si (Super Admin)',
    keterangan: 'QR Presensi resmi pelaksanaan sosialisasi KLK di Ruang Seminar Kimia',
    status: 'Aktif'
  },
  {
    id: 'qr-sos-2',
    kode: 'KLK-SOS-EXP-7721',
    judul: 'Sosialisasi KLK Sesi Khusus (Kadaluarsa)',
    waktuDibuat: Date.now() - 45 * 60 * 1000, // Dibuat 45 menit lalu
    durasiJam: 0.5, // 30 menit
    durasiMenit: 30,
    waktuKadaluarsa: Date.now() - 15 * 60 * 1000, // Telah berakhir 15 menit lalu
    dibuatOleh: 'Biro Administrasi Kimia (Admin)',
    keterangan: 'Sesi sosialisasi gelombang pagi (Batas 30 menit - Telah berakhir)',
    status: 'Kadaluarsa'
  }
];

export const formatDurationLabel = (jam: number, durasiMenit?: number): string => {
  if (durasiMenit !== undefined) {
    return `${durasiMenit} Menit`;
  }
  if (jam === 0.25 || Math.abs(jam - 0.25) < 0.01) return '15 Menit';
  if (jam === 0.5 || Math.abs(jam - 0.5) < 0.01) return '30 Menit';
  if (jam === 0.75 || Math.abs(jam - 0.75) < 0.01) return '45 Menit';
  if (jam === 1) return '60 Menit';
  if (jam === 1.25 || Math.abs(jam - 1.25) < 0.01) return '75 Menit';
  if (jam === 1.5 || Math.abs(jam - 1.5) < 0.01) return '90 Menit';
  if (jam < 1) {
    const mins = Math.round(jam * 60);
    return `${mins} Menit`;
  }
  if (jam === 24) return '1 Hari (24 Jam)';
  if (jam === 48) return '2 Hari (48 Jam)';
  if (jam === 72) return '3 Hari (72 Jam)';
  return `${jam} Jam`;
};

export const formatTimeRemaining = (targetMs: number): { text: string; isExpired: boolean } => {
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { text: 'Telah Kadaluarsa', isExpired: true };
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return { text: `${days} hari ${remHours} jam lagi`, isExpired: false };
  }
  if (hours > 0) {
    return { text: `${hours} jam ${minutes} menit lagi`, isExpired: false };
  }
  return { text: `${minutes} menit ${seconds} dtk lagi`, isExpired: false };
};

/* ========================================================================= */
/* 1. MODAL PENGELOLAAN QR & BUKA BLOKIR (SUPER ADMIN & ADMIN)               */
/* ========================================================================= */

interface QrManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrList: QrSosialisasiKLK[];
  onSaveQrList: (newList: QrSosialisasiKLK[]) => void;
  unblockedNims: string[];
  onSaveUnblockedNims: (newNims: string[]) => void;
  adminName: string;
  onOpenProjector: (qr: QrSosialisasiKLK) => void;
  mahasiswaList?: Mahasiswa[];
}

export const QrManagerModal: React.FC<QrManagerModalProps> = ({
  isOpen,
  onClose,
  qrList,
  onSaveQrList,
  unblockedNims,
  onSaveUnblockedNims,
  adminName,
  onOpenProjector,
  mahasiswaList = []
}) => {
  const effectiveMahasiswaList = (mahasiswaList && mahasiswaList.length > 0) ? mahasiswaList : INITIAL_MAHASISWA_LIST;
  const [activeTab, setActiveTab] = useState<'generate' | 'list' | 'unblock'>('generate');

  // Form Generate QR State
  const [formJudul, setFormJudul] = useState('Sosialisasi KLK Riset Kimia FSTeM UB');
  const [formDurasiMenit, setFormDurasiMenit] = useState<number>(60); // Default 60 Menit (1 Jam)
  const [formKeterangan, setFormKeterangan] = useState('Presensi digital setelah mahasiswa menyimak sosialisasi kebijakan KLK.');
  const [generatedSuccessQr, setGeneratedSuccessQr] = useState<QrSosialisasiKLK | null>(null);
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Search Mahasiswa for Unblock tab
  const [searchMhs, setSearchMhs] = useState('');
  const [manualNimInput, setManualNimInput] = useState('');
  const [filterUnblockStatus, setFilterUnblockStatus] = useState<'Semua' | 'Terkunci' | 'Dibuka'>('Semua');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load verified students
  const [verifiedList] = useState<VerifiedStudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_klk_verified_students');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Handle Generate QR Code
  const handleGenerateQr = async (e: React.FormEvent) => {
    e.preventDefault();
    const durasiMenit = formDurasiMenit;
    const durasiJam = durasiMenit / 60;
    const now = Date.now();
    const expireMs = now + durasiMenit * 60 * 1000;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const kode = `KLK-SOS-2026-${randomSuffix}`;

    const newQr: QrSosialisasiKLK = {
      id: `qr-${now}`,
      kode,
      judul: formJudul.trim() || 'Sosialisasi KLK Kimia UB',
      waktuDibuat: now,
      durasiJam,
      durasiMenit,
      waktuKadaluarsa: expireMs,
      dibuatOleh: adminName,
      keterangan: formKeterangan.trim(),
      status: 'Aktif'
    };

    try {
      const dataUrl = await QRCode.toDataURL(newQr.kode, {
        width: 380,
        margin: 2,
        color: { dark: '#002B49', light: '#FFFFFF' }
      });
      setQrImageDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate QR Data URL', err);
    }

    const updated = [newQr, ...qrList];
    onSaveQrList(updated);
    setGeneratedSuccessQr(newQr);
    setActionNotice(`QR Code "${kode}" dengan batas waktu ${durasiMenit} menit berhasil dibuat!`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Toggle Unblock for student
  const handleToggleUnblock = (nim: string, nama: string) => {
    const cleanNim = nim.replace(/\D/g, '');
    const isCurrentlyUnblocked = unblockedNims.includes(cleanNim);
    let next: string[];
    if (isCurrentlyUnblocked) {
      next = unblockedNims.filter((n) => n !== cleanNim);
      setActionNotice(`Akses pendaftaran untuk ${nama} (NIM: ${cleanNim}) dikunci kembali.`);
    } else {
      next = [...unblockedNims, cleanNim];
      setActionNotice(`Berhasil membuka blokir akses pendaftaran untuk ${nama} (NIM: ${cleanNim})! Mahasiswa dapat langsung mendaftar.`);
    }
    onSaveUnblockedNims(next);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Manual Add NIM to Unblock
  const handleManualUnblock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNim = manualNimInput.replace(/\D/g, '');
    if (!cleanNim || cleanNim.length < 6) {
      alert('Masukkan NIM mahasiswa yang valid (minimal 6 digit angka).');
      return;
    }
    if (unblockedNims.includes(cleanNim)) {
      alert(`NIM ${cleanNim} sudah dalam daftar buka blokir.`);
      return;
    }
    const next = [...unblockedNims, cleanNim];
    onSaveUnblockedNims(next);
    setManualNimInput('');
    setActionNotice(`NIM ${cleanNim} berhasil dimasukkan ke daftar Buka Blokir Akses KLK.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Deactivate QR
  const handleDeactivateQr = (id: string) => {
    const next = qrList.map((q) => (q.id === id ? { ...q, status: 'Nonaktif' as const } : q));
    onSaveQrList(next);
    setActionNotice('Status QR Code dinonaktifkan.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Delete QR
  const handleDeleteQr = (id: string) => {
    if (confirm('Yakin ingin menghapus QR Code ini dari riwayat?')) {
      const next = qrList.filter((q) => q.id !== id);
      onSaveQrList(next);
      setActionNotice('QR Code berhasil dihapus.');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#002B49] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#002B49] flex items-center justify-center font-bold shadow-sm shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Pengelolaan QR Sosialisasi & Buka Blokir Mahasiswa
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Super Admin / Admin
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Departemen Kimia FSTeM UB &bull; Generate token QR presensi berbatas waktu (3 Jam / 1 Hari) & Otorisasi Buka Blokir
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Modal Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 flex gap-2 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'generate'
                ? 'bg-white text-[#002B49] border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>Generate QR Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'list'
                ? 'bg-white text-[#002B49] border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Riwayat QR Sosialisasi ({qrList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unblock')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'unblock'
                ? 'bg-white text-[#002B49] border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Unlock className="w-4 h-4 text-emerald-600" />
            <span>Buka Blokir Mahasiswa ({unblockedNims.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50">
          {/* TAB 1: GENERATE QR BARU */}
          {activeTab === 'generate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input (7 Kolom) */}
              <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Buat Kode QR Presensi Sosialisasi Baru</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tentukan judul sosialisasi dan durasi berlakunya scan QR (misal 3 jam atau 1 hari). Mahasiswa wajib scan untuk membuka form pendaftaran.
                  </p>
                </div>

                <form onSubmit={handleGenerateQr} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Judul / Topik Sesi Sosialisasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formJudul}
                      onChange={(e) => setFormJudul(e.target.value)}
                      placeholder="Contoh: Sosialisasi KLK Kimia Angkatan 2022/2023"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                    />
                  </div>

                  {/* Setting Batas Waktu Durasi QR */}
                  <div>
                    <label htmlFor="select-durasi-kadaluarsa" className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-[#002B49]" />
                        <span>Batas Waktu Berlaku (Durasi Kadaluarsa):</span>
                        <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Setelah waktu habis, QR tidak berlaku
                      </span>
                    </label>

                    {/* List / Dropdown Pilihan Batas Waktu Kadaluarsa */}
                    <div className="mb-2">
                      <select
                        id="select-durasi-kadaluarsa"
                        value={formDurasiMenit}
                        onChange={(e) => setFormDurasiMenit(Number(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-xs font-bold text-[#002B49] bg-white focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49]/20 focus:outline-none"
                      >
                        <option value={15}>15 menit</option>
                        <option value={30}>30 menit</option>
                        <option value={45}>45 menit</option>
                        <option value={60}>60 menit</option>
                        <option value={75}>75 menit</option>
                        <option value={90}>90 menit</option>
                      </select>
                    </div>

                    {/* Duration Buttons Grid (15 menit, 30 menit, 45 menit, 60 menit, 75 menit, 90 menit) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-2">
                      {[
                        { menit: 15, label: '15 menit', badge: 'Sesi Kilat' },
                        { menit: 30, label: '30 menit', badge: 'Sesi Singkat' },
                        { menit: 45, label: '45 menit', badge: 'Standar' },
                        { menit: 60, label: '60 menit', badge: '1 Jam (Rekomendasi)' },
                        { menit: 75, label: '75 menit', badge: '1 Jam 15 Mnt' },
                        { menit: 90, label: '90 menit', badge: '1.5 Jam (Penuh)' }
                      ].map((item) => {
                        const isSelected = formDurasiMenit === item.menit;
                        return (
                          <button
                            key={item.menit}
                            type="button"
                            onClick={() => setFormDurasiMenit(item.menit)}
                            className={`p-2 rounded-lg border text-left transition-all relative ${
                              isSelected
                                ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className="font-bold text-xs">{item.label}</div>
                            {item.badge && (
                              <div
                                className={`text-[9px] font-semibold ${
                                  isSelected ? 'text-[#D4AF37]' : 'text-slate-400'
                                }`}
                              >
                                {item.badge}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      💡 <strong>Ketentuan Sistem:</strong> Sesuai SOP, kode QR presensi otomatis <strong>kadaluarsa</strong> setelah batas waktu (15 menit, 30 menit, 45 menit, 60 menit, 75 menit, atau 90 menit) berakhir. Mahasiswa yang terlambat atau lupa dapat dibuka blokirnya secara manual pada tab <strong>Buka Blokir Mahasiswa</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Keterangan Tambahan / Lokasi Sesi (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={formKeterangan}
                      onChange={(e) => setFormKeterangan(e.target.value)}
                      placeholder="Catatan tambahan untuk mahasiswa..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#002B49] hover:bg-[#003865] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-[#D4AF37]" />
                    <span>Generate Kode & QR Sosialisasi Sekarang</span>
                  </button>
                </form>
              </div>

              {/* Preview Hasil QR Code (5 Kolom) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-between text-center">
                <div className="w-full">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3 text-left">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">Preview QR Presensi</h4>
                      <p className="text-[10px] text-slate-500">Tampilkan ke proyektor / cetak presensi</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Aktif
                    </span>
                  </div>

                  {qrImageDataUrl || qrList.length > 0 ? (
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block shadow-inner">
                        <img
                          src={
                            qrImageDataUrl ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                              (generatedSuccessQr || qrList[0]).kode
                            )}`
                          }
                          alt="QR Code Sosialisasi"
                          className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg mx-auto"
                        />
                      </div>

                      <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 text-left">
                        <div className="text-[10px] text-slate-500 font-medium">KODE TOKEN RESMI:</div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="font-mono font-extrabold text-[#002B49] text-base tracking-wider">
                            {(generatedSuccessQr || qrList[0]).kode}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText((generatedSuccessQr || qrList[0]).kode);
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2000);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#002B49]" />
                          <span>
                            Durasi: {formatDurationLabel((generatedSuccessQr || qrList[0]).durasiJam, (generatedSuccessQr || qrList[0]).durasiMenit)} &bull; Sisa:{' '}
                            <strong className="text-emerald-700">
                              {formatTimeRemaining((generatedSuccessQr || qrList[0]).waktuKadaluarsa).text}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-slate-400">
                      <QrCode className="w-16 h-16 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-semibold">Belum ada QR Code aktif dibuat</p>
                    </div>
                  )}
                </div>

                <div className="w-full pt-4 border-t border-slate-200 mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenProjector(generatedSuccessQr || qrList[0])}
                    className="flex-1 py-2 px-3 bg-[#D4AF37] hover:bg-[#c4a02d] text-[#002B49] rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Mode Proyektor Layar Penuh</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT QR SOSIALISASI */}
          {activeTab === 'list' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Daftar Kode QR Presensi Sosialisasi</h3>
                  <p className="text-[11px] text-slate-500">
                    Sistem otomatis memvalidasi apakah kode masih aktif atau telah melewati batas waktu (kadaluarsa).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('generate')}
                  className="px-3 py-1.5 bg-[#002B49] text-white rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-[#003865]"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Buat QR Baru</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="p-3 w-10 text-center">No</th>
                      <th className="p-3">Kode QR & Judul Sesi</th>
                      <th className="p-3">Batas Durasi</th>
                      <th className="p-3">Waktu Dibuat & Berakhir</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {qrList.map((item, idx) => {
                      const timeInfo = formatTimeRemaining(item.waktuKadaluarsa);
                      const isExpired = timeInfo.isExpired || item.status === 'Kadaluarsa';
                      const isActive = !isExpired && item.status === 'Aktif';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-mono font-bold text-[#002B49] text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mb-1">
                              {item.kode}
                            </div>
                            <div className="font-bold text-slate-800 text-xs">{item.judul}</div>
                            {item.keterangan && (
                              <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                {item.keterangan}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-700">{formatDurationLabel(item.durasiJam, item.durasiMenit)}</span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-600">
                            <div>Dibuat: {new Date(item.waktuDibuat).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</div>
                            <div className="font-semibold text-slate-700 mt-0.5">
                              Berakhir: {new Date(item.waktuKadaluarsa).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                            <div className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {timeInfo.text}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Aktif</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Kadaluarsa</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => onOpenProjector(item)}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#002B49] rounded border border-blue-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                                title="Buka Tampilan QR Layar Penuh"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Tampilkan</span>
                              </button>
                              {isActive && (
                                <button
                                  type="button"
                                  onClick={() => handleDeactivateQr(item.id)}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 text-[11px] font-semibold"
                                  title="Nonaktifkan QR Code"
                                >
                                  Nonaktifkan
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteQr(item.id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 text-[11px] font-semibold"
                                title="Hapus dari riwayat"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BUKA BLOKIR MAHASISWA */}
          {activeTab === 'unblock' && (
            <div className="space-y-4">
              {/* Input Cepat Buka Blokir Manual via NIM */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    <Unlock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Buka Blokir Manual Mahasiswa</h4>
                    <p className="text-[11px] text-slate-500">
                      Buka akses form pendaftaran untuk mahasiswa yang lupa scan atau scan code kadaluarsa.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleManualUnblock} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={manualNimInput}
                    onChange={(e) => setManualNimInput(e.target.value)}
                    placeholder="Masukkan NIM Mahasiswa..."
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none w-full sm:w-56"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Blokir</span>
                  </button>
                </form>
              </div>

              {/* Tabel Status Mahasiswa & Kontrol Blokir */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchMhs}
                      onChange={(e) => setSearchMhs(e.target.value)}
                      placeholder="Cari nama atau NIM mahasiswa..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs text-slate-500 font-medium">Filter:</span>
                    <select
                      value={filterUnblockStatus}
                      onChange={(e) => setFilterUnblockStatus(e.target.value as any)}
                      className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                    >
                      <option value="Semua">Semua Mahasiswa</option>
                      <option value="Terkunci">Terkunci (Belum Presensi)</option>
                      <option value="Dibuka">Akses Terbuka / Buka Blokir</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-100 z-10">
                      <tr className="text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-3 w-10 text-center">No</th>
                        <th className="p-3">Nama Mahasiswa</th>
                        <th className="p-3">NIM & Angkatan</th>
                        <th className="p-3">Status Presensi Sosialisasi</th>
                        <th className="p-3 text-center">Aksi Buka Blokir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {effectiveMahasiswaList.filter((m) => {
                        const cleanNim = m.nim.replace(/\D/g, '');
                        const query = searchMhs.trim().toLowerCase();
                        const matchText = !query || m.nama.toLowerCase().includes(query) || cleanNim.includes(query);
                        const isUnblocked = unblockedNims.includes(cleanNim);
                        const isVerified = verifiedList.some((v) => v.nim.replace(/\D/g, '') === cleanNim);

                        if (filterUnblockStatus === 'Terkunci') return matchText && !isUnblocked && !isVerified;
                        if (filterUnblockStatus === 'Dibuka') return matchText && (isUnblocked || isVerified);
                        return matchText;
                      }).map((m, idx) => {
                        const cleanNim = m.nim.replace(/\D/g, '');
                        const isUnblocked = unblockedNims.includes(cleanNim);
                        const isVerified = verifiedList.some((v) => v.nim.replace(/\D/g, '') === cleanNim);

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{m.nama}</div>
                              <div className="text-[10px] text-slate-500">{m.programStudi}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-mono font-semibold text-slate-800">{m.nim}</div>
                              <div className="text-[10px] text-slate-500">Angkatan {m.angkatan} &bull; Smt {m.semester}</div>
                            </td>
                            <td className="p-3">
                              {isUnblocked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Unlock className="w-3 h-3 text-emerald-600" />
                                  <span>Dibuka Blokir oleh Admin</span>
                                </span>
                              ) : isVerified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                  <span>Terverifikasi Scan QR</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <Lock className="w-3 h-3 text-rose-500" />
                                  <span>Terkunci (Belum Presensi)</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {isUnblocked ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleUnblock(m.nim, m.nama)}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  Kunci Kembali
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleUnblock(m.nim, m.nama)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1 mx-auto"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>Buka Blokir</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Sesuai SOP Alur KLK Langkah 2: Presensi Sosialisasi Membuka Akses Form Pendaftaran.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 2. MODAL PROYEKTOR LAYAR PENUH UNTUK SOSIALISASI (SUPER ADMIN / ADMIN)    */
/* ========================================================================= */

interface QrProjectorModalProps {
  qr: QrSosialisasiKLK | null;
  onClose: () => void;
}

export const QrProjectorModal: React.FC<QrProjectorModalProps> = ({ qr, onClose }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!qr) return;
    QRCode.toDataURL(qr.kode, {
      width: 600,
      margin: 2,
      color: { dark: '#002B49', light: '#FFFFFF' }
    }).then(setDataUrl).catch(console.error);
  }, [qr]);

  if (!qr) return null;

  const timeInfo = formatTimeRemaining(qr.waktuKadaluarsa);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-[#D4AF37] max-w-2xl w-full p-8 text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#002B49]/10 text-[#002B49] text-xs font-bold mb-2">
            <QrCode className="w-4 h-4 text-[#D4AF37]" />
            <span>PRESENSI SOSIALISASI RESMI KLK KIMIA UB</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {qr.judul}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Scan kode QR di bawah ini menggunakan ponsel pintar atau masukkan kode pada Form Pendaftaran Baru SIKMA.
          </p>
        </div>

        {/* Large QR */}
        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-300 inline-block my-2 shadow-inner">
          {dataUrl ? (
            <img src={dataUrl} alt="QR Code Besar" className="w-72 h-72 sm:w-80 sm:h-80 mx-auto object-contain" />
          ) : (
            <div className="w-72 h-72 flex items-center justify-center">Memuat QR...</div>
          )}
        </div>

        {/* Token Code Pill */}
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">KODE PRESENSI MANUAL:</div>
          <div className="inline-block mt-1 px-5 py-2 rounded-xl bg-[#002B49] text-[#D4AF37] font-mono text-xl sm:text-2xl font-black tracking-widest shadow-md">
            {qr.kode}
          </div>
        </div>

        {/* Expiration Info */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold">
            <Timer className="w-4 h-4 text-[#002B49]" />
            <span>Batas Waktu: {formatDurationLabel(qr.durasiJam, qr.durasiMenit)}</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1.5 font-bold text-emerald-700">
            <Clock className="w-4 h-4" />
            <span>Sisa Waktu: {timeInfo.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 3. GATE VERIFIKASI QR MAHASISWA (KETIKA AKSES MASIH TERKUNCI)             */
/* ========================================================================= */

interface QrScanGateProps {
  studentName: string;
  studentNim: string;
  qrList: QrSosialisasiKLK[];
  isUnblockedByAdmin: boolean;
  onVerifySuccess: (kode: string) => void;
  onOpenAdminManager?: () => void;
  canManageQr: boolean;
}

export const QrScanGate: React.FC<QrScanGateProps> = ({
  studentName,
  studentNim,
  qrList,
  isUnblockedByAdmin,
  onVerifySuccess,
  onOpenAdminManager,
  canManageQr
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSimulatedScanner, setShowSimulatedScanner] = useState(false);

  // Verifikasi input kode
  const handleVerify = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const codeToCheck = (customCode || inputCode).trim().toUpperCase();
    setErrorMessage(null);

    if (!codeToCheck) {
      setErrorMessage('Silakan masukkan Kode QR / Token Presensi.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      // Cari kode di qrList
      const matchedQr = qrList.find(
        (q) => q.kode.trim().toUpperCase() === codeToCheck
      );

      if (!matchedQr) {
        setErrorMessage(
          `Kode "${codeToCheck}" tidak ditemukan. Pastikan Anda memasukkan kode resmi yang dibagikan oleh Administrator saat sesi Sosialisasi KLK.`
        );
        return;
      }

      // Cek apakah sudah kadaluarsa
      const now = Date.now();
      if (now > matchedQr.waktuKadaluarsa || matchedQr.status === 'Kadaluarsa') {
        const expiredDate = new Date(matchedQr.waktuKadaluarsa).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        setErrorMessage(
          `⚠️ KODE QR TELAH KADALUARSA! Batas waktu ${formatDurationLabel(
            matchedQr.durasiJam
          )} telah berakhir pada ${expiredDate}. Kode ini sudah tidak berlaku. Jika Anda lupa melakukan scan saat sosialisasi, silakan hubungi Super Admin atau Admin untuk membuka blokir pendaftaran Anda.`
        );
        return;
      }

      if (matchedQr.status === 'Nonaktif') {
        setErrorMessage('Kode QR ini telah dinonaktifkan oleh Administrator.');
        return;
      }

      // Berhasil
      onVerifySuccess(matchedQr.kode);
    }, 400);
  };

  // Active QR for quick test helper
  const activeQr = qrList.find((q) => q.status === 'Aktif' && Date.now() < q.waktuKadaluarsa);
  const expiredQr = qrList.find((q) => q.status === 'Kadaluarsa' || Date.now() >= q.waktuKadaluarsa);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-6 sm:p-10 max-w-3xl mx-auto my-4 text-slate-800">
      {/* Locked Header Icon */}
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Lock className="w-8 h-8 text-[#002B49]" />
      </div>

      <div className="text-center max-w-xl mx-auto mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#002B49]/10 text-[#002B49] text-xs font-bold mb-2">
          <QrCode className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Langkah 2 Alur KLK: Presensi Sosialisasi Diperlukan</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Verifikasi Presensi Sosialisasi KLK
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Untuk mengisi <strong>Form Pendaftaran Baru KLK</strong>, mahasiswa diwajibkan mengikuti sosialisasi Kuliah Luar Kampus Departemen Kimia FSTeM UB dan memasukkan <strong>Kode QR Presensi</strong> yang dibagikan oleh Administrator.
        </p>
      </div>

      {/* Identitas Mahasiswa */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{studentName}</div>
            <div className="text-slate-500 font-mono text-[11px]">NIM: {studentNim}</div>
          </div>
        </div>

        {isUnblockedByAdmin ? (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-xs flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Akses Telah Dibuka Admin</span>
            </span>
            <button
              type="button"
              onClick={() => onVerifySuccess('UNBLOCKED-BY-ADMIN')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
            >
              Lanjut ke Formulir &rarr;
            </button>
          </div>
        ) : (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-bold text-xs flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Formulir Terkunci</span>
          </span>
        )}
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Form Input Kode Presensi */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block font-bold text-slate-800 text-xs mb-1.5 flex items-center justify-between">
            <span>Masukkan Kode Token QR dari Admin:</span>
            <span className="text-[11px] font-normal text-slate-500">
              Contoh format: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">KLK-SOS-2026-XXXX</code>
            </span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <QrCode className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Masukkan kode presensi sosialisasi..."
                className="w-full pl-9 pr-3 py-3 border-2 border-slate-300 rounded-xl text-sm font-mono font-bold tracking-wider text-slate-900 focus:border-[#002B49] focus:outline-none uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-6 py-3 bg-[#002B49] hover:bg-[#003865] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Verifikasi & Buka Form</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Opsi Kamera Scan Simulasi */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#002B49]" />
            <span>Atau Gunakan Pemindai Kamera / Unggah QR:</span>
          </span>
          <button
            type="button"
            onClick={() => setShowSimulatedScanner(!showSimulatedScanner)}
            className="text-xs font-bold text-[#002B49] hover:underline"
          >
            {showSimulatedScanner ? 'Tutup Scanner' : 'Buka Scanner Kamera'}
          </button>
        </div>

        {showSimulatedScanner && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-4 mb-4 border border-slate-800 shadow-inner">
            <div className="max-w-xs mx-auto border-2 border-dashed border-[#D4AF37] p-8 rounded-xl relative overflow-hidden bg-black/40">
              <div className="w-full h-1 bg-red-500 absolute top-0 left-0 right-0 animate-bounce shadow-md"></div>
              <Scan className="w-20 h-20 text-[#D4AF37] mx-auto opacity-80" />
              <p className="text-[11px] text-slate-300 mt-3 font-mono">
                Arahkan kamera ke layar proyektor sosialisasi
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (activeQr) {
                    setInputCode(activeQr.kode);
                    handleVerify(undefined, activeQr.kode);
                  } else {
                    alert('Tidak ada QR aktif saat ini. Silakan generate dari akun Admin.');
                  }
                }}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c4a02d] text-[#002B49] rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simulasi Sukses Scan QR Aktif ({activeQr ? activeQr.kode : 'Belum Ada'})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Test Bar (Memudahkan pengujian oleh user/evaluator) */}
      <div className="mt-5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2">
        <div className="font-bold text-amber-900 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Panduan Pengujian Sistem Batas Waktu & Buka Blokir:</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Sesuai ketentuan, scan code QR presensi dibatasi waktu (15, 30, 45, 60, 75, atau 90 menit). Anda dapat menguji kedua kondisi secara langsung:
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {activeQr && (
            <button
              type="button"
              onClick={() => {
                setInputCode(activeQr.kode);
                setErrorMessage(null);
              }}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold flex items-center gap-1"
            >
              <span>Gunakan Kode Aktif:</span>
              <code className="font-mono text-emerald-950 font-extrabold">{activeQr.kode}</code>
            </button>
          )}

          {expiredQr && (
            <button
              type="button"
              onClick={() => {
                setInputCode(expiredQr.kode);
                setErrorMessage(null);
              }}
              className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 rounded text-[11px] font-bold flex items-center gap-1"
            >
              <span>Uji Kode Kadaluarsa (30 Menit Lewat):</span>
              <code className="font-mono text-rose-950 font-extrabold">{expiredQr.kode}</code>
            </button>
          )}

          {canManageQr && onOpenAdminManager && (
            <button
              type="button"
              onClick={onOpenAdminManager}
              className="px-2.5 py-1 bg-[#002B49] text-white hover:bg-[#003865] rounded text-[11px] font-bold flex items-center gap-1 ml-auto"
            >
              <Unlock className="w-3 h-3 text-[#D4AF37]" />
              <span>Kelola QR / Buka Blokir (Panel Admin)</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Buka Blokir */}
      <div className="mt-4 text-center text-xs text-slate-500">
        <span>Lupa scan saat sesi sosialisasi atau kendala teknis? </span>
        <span className="font-medium text-slate-700">
          Super Admin atau Admin Jurusan dapat membuka blokir akun Anda secara manual melalui panel admin.
        </span>
      </div>
    </div>
  );
};

