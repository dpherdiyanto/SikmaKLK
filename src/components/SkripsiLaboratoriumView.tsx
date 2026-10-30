import React, { useState } from 'react';
import { Mahasiswa, LogbookLabItem, Dosen, LabRiset, UserRole } from '../types/sikma';
import {
  FlaskConical,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  AlertCircle,
  ShieldCheck,
  CheckSquare,
  Square,
  Printer,
  X,
  MessageSquare
} from 'lucide-react';

interface SkripsiLaboratoriumViewProps {
  currentRole: UserRole;
  student: Mahasiswa;
  dosenList: Dosen[];
  logbooks: LogbookLabItem[];
  onAddLogbook: (item: LogbookLabItem) => void;
  onVerifyLogbook: (id: string, catatan: string, status: LogbookLabItem['statusVerifikasi']) => void;
  initialTab?: 'alur' | 'logbook' | 'bebas-lab';
}

export const SkripsiLaboratoriumView: React.FC<SkripsiLaboratoriumViewProps> = ({
  currentRole,
  student,
  dosenList,
  logbooks,
  onAddLogbook,
  onVerifyLogbook,
  initialTab = 'alur'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'alur' | 'logbook' | 'bebas-lab'>(initialTab);

  // New Logbook modal
  const [isAddLogbookOpen, setIsAddLogbookOpen] = useState(false);
  const [verifyModalItem, setVerifyModalItem] = useState<LogbookLabItem | null>(null);
  const [dosenCatatan, setDosenCatatan] = useState('');

  // Logbook form state
  const [logForm, setLogForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    aktivitas: '',
    lab: student.labPenelitian || 'Laboratorium Kimia Organik & Bahan Alam',
    instrumen: 'FTIR, Rotary Evaporator',
    bahanKimiaUtama: '',
    hasilDanTemuan: ''
  });

  // Bebas Lab state
  const [bebasLabState, setBebasLabState] = useState({
    alatLengkap: true,
    bebasGantiPecah: true,
    limbahB3Dibersihkan: true,
    logbookLengkap: logbooks.length >= 4,
    sampelDiserahkan: true,
    status: 'Terverifikasi Laboran' as 'Belum Lengkap' | 'Terverifikasi Laboran' | 'Disahkan Kepala Lab'
  });

  const handleCreateLogbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.aktivitas || !logForm.hasilDanTemuan) {
      alert('Harap isi aktivitas dan hasil temuan riset.');
      return;
    }

    const newItem: LogbookLabItem = {
      id: `log-${Date.now()}`,
      mahasiswaId: student.id,
      mahasiswaNama: student.nama,
      nim: student.nim,
      tanggal: logForm.tanggal,
      aktivitas: logForm.aktivitas,
      lab: logForm.lab as LabRiset,
      instrumenDigunakan: logForm.instrumen.split(',').map((s) => s.trim()).filter(Boolean),
      bahanKimiaUtama: logForm.bahanKimiaUtama,
      hasilDanTemuan: logForm.hasilDanTemuan,
      statusVerifikasi: 'Menunggu Verifikasi',
      dosenVerifikator: student.dosenPembimbing1Nama
    };

    onAddLogbook(newItem);
    setIsAddLogbookOpen(false);
    setLogForm({
      tanggal: new Date().toISOString().split('T')[0],
      aktivitas: '',
      lab: student.labPenelitian || 'Laboratorium Kimia Organik & Bahan Alam',
      instrumen: 'FTIR, Rotary Evaporator',
      bahanKimiaUtama: '',
      hasilDanTemuan: ''
    });
  };

  const handleVerifySubmit = (status: LogbookLabItem['statusVerifikasi']) => {
    if (!verifyModalItem) return;
    onVerifyLogbook(verifyModalItem.id, dosenCatatan, status);
    setVerifyModalItem(null);
    setDosenCatatan('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              <FlaskConical className="w-4 h-4 text-[#002B49]" />
              <span>Departemen Kimia FSTeM Universitas Brawijaya</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Alur Tugas Akhir, Riset Laboratorium & Bebas Lab
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pengelolaan tahapan skripsi mahasiswa S1 Kimia, pencatatan instrumen karakterisasi, dan verifikasi pembimbing
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddLogbookOpen(true)}
              className="px-4 py-2 bg-[#002B49] text-[#D4AF37] font-bold rounded-lg text-xs hover:bg-[#003865] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Input Logbook Riset Lab</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 mt-6 -mb-6 pt-2">
          <button
            onClick={() => setActiveSubTab('alur')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'alur'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Alur & Dokumen Skripsi</span>
          </button>
          <button
            onClick={() => setActiveSubTab('logbook')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'logbook'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Logbook Penelitian Lab ({logbooks.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('bebas-lab')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'bebas-lab'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Checklist & Surat Bebas Lab</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ALUR SKRIPSI */}
      {activeSubTab === 'alur' && (
        <div className="space-y-6">
          {/* Active Thesis Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#002B49]" />
                Rincian Usulan Skripsi Mahasiswa
              </h3>
              <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold">
                Tahap: {student.tahapSkripsi}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Judul Tugas Akhir Disetujui
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                &ldquo;{student.judulSkripsi}&rdquo;
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Dosen Pembimbing I:</span>
                <strong className="text-slate-900 block mt-0.5">{student.dosenPembimbing1Nama}</strong>
                <span className="text-emerald-700 font-semibold text-[10px]">✓ Disetujui KBK</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Dosen Pembimbing II:</span>
                <strong className="text-slate-900 block mt-0.5">{student.dosenPembimbing2Nama}</strong>
                <span className="text-emerald-700 font-semibold text-[10px]">✓ Disetujui KBK</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Laboratorium Riset:</span>
                <strong className="text-slate-900 block mt-0.5">{student.labPenelitian}</strong>
                <span className="text-blue-700 font-semibold text-[10px]">Lokasi Gedung Kimia Lt. 2</span>
              </div>
            </div>

            {/* Stages Breakdown */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Persyaratan & Berkas Ujian
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Seminar Proposal (Sempro)</div>
                    <div className="text-[11px] text-emerald-800">Lulus pada 18 Mei 2026 (Nilai: 88.5 / A)</div>
                  </div>
                  <span className="text-emerald-700 font-bold text-sm">✓ Selesai</span>
                </div>
                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Penelitian & Logbook Lab</div>
                    <div className="text-[11px] text-blue-800">Minimal 8 kali sesi laboratorium & verifikasi</div>
                  </div>
                  <span className="text-blue-700 font-bold text-sm">4/8 Sesi</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Seminar Hasil (Semhas)</div>
                    <div className="text-[11px] text-slate-500">Syarat: Draft Bab 1-5 & ACC Pembimbing</div>
                  </div>
                  <span className="text-slate-400 font-bold text-xs">Tahap Selanjutnya</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Ujian Skripsi / Sidang</div>
                    <div className="text-[11px] text-slate-500">Syarat: Bebas Lab & Naskah Publikasi Ilmiah</div>
                  </div>
                  <span className="text-slate-400 font-bold text-xs">Menunggu Semhas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LOGBOOK RISET LAB KIMIA */}
      {activeSubTab === 'logbook' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-4 h-4 text-[#002B49]" />
              <span className="font-bold text-slate-800">
                Catatan Eksperimen Laboratorium Kimia UB
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">
                Total {logbooks.length} catatan aktivitas tercatat
              </span>
            </div>
            <button
              onClick={() => setIsAddLogbookOpen(true)}
              className="px-3 py-1.5 bg-[#002B49] text-[#D4AF37] font-bold rounded hover:bg-[#003865] flex items-center gap-1 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sesi Lab</span>
            </button>
          </div>

          <div className="space-y-3">
            {logbooks.map((log) => (
              <div
                key={log.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#002B49]/40 transition-colors text-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2.5 gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-slate-900 font-mono">{log.tanggal}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-[#002B49]">{log.lab}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.statusVerifikasi === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.statusVerifikasi === 'Perlu Perbaikan'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.statusVerifikasi}
                    </span>
                    {(currentRole === 'dosen' || currentRole === 'admin' || currentRole === 'super_admin') && (
                      <button
                        onClick={() => {
                          setVerifyModalItem(log);
                          setDosenCatatan(log.catatanDosen || '');
                        }}
                        className="px-2 py-0.5 rounded bg-[#002B49] text-white text-[10px] font-bold hover:bg-[#003865]"
                      >
                        Verifikasi Dosen
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 text-sm leading-snug">
                    {log.aktivitas}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-slate-700">
                  <div>
                    <strong className="text-[11px] text-slate-500 block">Instrumen Lab:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {log.instrumenDigunakan.map((ins, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-medium">
                          {ins}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong className="text-[11px] text-slate-500 block">Bahan Kimia Utama:</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">{log.bahanKimiaUtama || '-'}</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <strong className="text-[11px] text-emerald-900 block">Hasil & Temuan Analisis:</strong>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{log.hasilDanTemuan}</p>
                </div>

                {log.catatanDosen && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-900 flex items-start space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Catatan Pembimbing ({log.dosenVerifikator}):</span>
                      <p className="mt-0.5 text-slate-700">{log.catatanDosen}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BEBAS LABORATORIUM */}
      {activeSubTab === 'bebas-lab' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Formulir Validasi Bebas Laboratorium Kimia FSTeM UB
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Syarat mutlak pendaftaran Ujian Skripsi, Yudisium, dan Pengambilan Ijazah Sarjana Kimia
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak Surat Bebas Lab</span>
              </button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3 text-xs">
              <div
                onClick={() => setBebasLabState({ ...bebasLabState, alatLengkap: !bebasLabState.alatLengkap })}
                className="p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {bebasLabState.alatLengkap ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900">
                      Pemeriksaan Alat Gelas & Instrumen Laboratorium
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Seluruh buret, labu ukur, kondensor, dan corong pisah dalam keadaan bersih dan lengkap.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {bebasLabState.alatLengkap ? 'Terverifikasi' : 'Belum'}
                </span>
              </div>

              <div
                onClick={() =>
                  setBebasLabState({ ...bebasLabState, bebasGantiPecah: !bebasLabState.bebasGantiPecah })
                }
                className="p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {bebasLabState.bebasGantiPecah ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900">Bebas Tanggungan Ganti Alat Pecah</div>
                    <div className="text-slate-500 text-[11px]">
                      Tidak memiliki tunggakan penggantian alat gelas pecah pada register laboran.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {bebasLabState.bebasGantiPecah ? 'Lunas / Bebas' : 'Ada Tunggakan'}
                </span>
              </div>

              <div
                onClick={() =>
                  setBebasLabState({
                    ...bebasLabState,
                    limbahB3Dibersihkan: !bebasLabState.limbahB3Dibersihkan
                  })
                }
                className="p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {bebasLabState.limbahB3Dibersihkan ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900">Pengelolaan & Penyerahan Limbah Kimia B3</div>
                    <div className="text-slate-500 text-[11px]">
                      Limbah pelarut organik terhalogenasi dan sisa logam berat telah ditampung pada jerigen B3 UPT Lab.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {bebasLabState.limbahB3Dibersihkan ? 'Bebas Limbah' : 'Belum'}
                </span>
              </div>

              <div
                onClick={() =>
                  setBebasLabState({ ...bebasLabState, sampelDiserahkan: !bebasLabState.sampelDiserahkan })
                }
                className="p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {bebasLabState.sampelDiserahkan ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900">
                      Penyerahan Isolat / Kristal Sampel Sintesis
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Vial sampel hasil sintesis telah berlabel lengkap dan diserahkan kepada Dosen Pembimbing.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {bebasLabState.sampelDiserahkan ? 'Diserahkan' : 'Belum'}
                </span>
              </div>
            </div>

            {/* Status Pengesahan */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Status Pengesahan Lab</div>
                <div className="text-sm font-bold text-emerald-700 mt-0.5">
                  ✓ Memenuhi Syarat Bebas Laboratorium Kimia FSTeM UB
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Laboran Pemeriksa: Slamet Widodo, A.Md (PLP Ahli Pertama Kimia)
                </div>
              </div>
              <button
                onClick={() => alert('Surat Keterangan Bebas Lab telah disahkan secara digital.')}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700"
              >
                Sahkan Surat Bebas Lab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT LOGBOOK LAB */}
      {isAddLogbookOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-[#D4AF37]" />
                  Input Logbook Penelitian Laboratorium Kimia
                </h3>
                <p className="text-[11px] text-slate-300">
                  Catat aktivitas sintesis, preparasi, maupun uji instrumen
                </p>
              </div>
              <button onClick={() => setIsAddLogbookOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLogbook} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Percobaan *</label>
                  <input
                    type="date"
                    required
                    value={logForm.tanggal}
                    onChange={(e) => setLogForm({ ...logForm, tanggal: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Laboratorium Riset *</label>
                  <select
                    value={logForm.lab}
                    onChange={(e) => setLogForm({ ...logForm, lab: e.target.value as LabRiset })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] bg-white"
                  >
                    <option value="Laboratorium Kimia Organik & Bahan Alam">Kimia Organik & Bahan Alam</option>
                    <option value="Laboratorium Kimia Anorganik & Material">Kimia Anorganik & Material</option>
                    <option value="Laboratorium Kimia Analitik & Instrumentasi">Kimia Analitik & Instrumentasi</option>
                    <option value="Laboratorium Kimia Fisik & Elektrokimia">Kimia Fisik & Elektrokimia</option>
                    <option value="Laboratorium Biokimia & Enzim">Biokimia & Enzim</option>
                    <option value="Laboratorium Kimia Lingkungan">Kimia Lingkungan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Aktivitas Riset / Eksperimen *
                </label>
                <textarea
                  required
                  rows={2}
                  value={logForm.aktivitas}
                  onChange={(e) => setLogForm({ ...logForm, aktivitas: e.target.value })}
                  placeholder="Contoh: Reaksi sintesis eugenil asetat dengan metode esterifikasi anhidrida asetat..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instrumen Laboratorium yang Digunakan
                </label>
                <input
                  type="text"
                  value={logForm.instrumen}
                  onChange={(e) => setLogForm({ ...logForm, instrumen: e.target.value })}
                  placeholder="FTIR Shimadzu, GC-MS Agilent, Rotary Evaporator, KLT UV Cabinet"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bahan Kimia Utama</label>
                <input
                  type="text"
                  value={logForm.bahanKimiaUtama}
                  onChange={(e) => setLogForm({ ...logForm, bahanKimiaUtama: e.target.value })}
                  placeholder="Isolat Eugenol, Anhidrida Asetat p.a, Piridin, Heksana, Etil Asetat"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hasil & Temuan Analisis *</label>
                <textarea
                  required
                  rows={3}
                  value={logForm.hasilDanTemuan}
                  onChange={(e) => setLogForm({ ...logForm, hasilDanTemuan: e.target.value })}
                  placeholder="Deskripsikan pengamatan, perubahan warna/fasa, rendemen (%), atau data spektroskopi..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddLogbookOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002B49] text-[#D4AF37] font-bold rounded hover:bg-[#003865]"
                >
                  Simpan Catatan Logbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI DOSEN PEMBIMBING */}
      {verifyModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="font-bold text-sm">Verifikasi Logbook oleh Dosen</h3>
                <p className="text-[11px] text-[#D4AF37]">
                  Mahasiswa: {verifyModalItem.mahasiswaNama} ({verifyModalItem.nim})
                </p>
              </div>
              <button onClick={() => setVerifyModalItem(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-semibold text-slate-900">{verifyModalItem.aktivitas}</div>
                <div className="text-slate-500 text-[11px] mt-1">{verifyModalItem.hasilDanTemuan}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan / Masukan Dosen Pembimbing:
                </label>
                <textarea
                  rows={3}
                  value={dosenCatatan}
                  onChange={(e) => setDosenCatatan(e.target.value)}
                  placeholder="Tuliskan saran perbaikan eksperimen atau konfirmasi data spektroskopi..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => handleVerifySubmit('Perlu Perbaikan')}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded font-bold hover:bg-rose-700"
                >
                  Minta Perbaikan
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifySubmit('Disetujui')}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700"
                >
                  ✓ Setujui Logbook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
