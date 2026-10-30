import React, { useState } from 'react';
import {
  CalendarDays,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Edit2,
  Trash2,
  Download,
  Filter,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { UserRole, SemesterItem } from '../types/sikma';
import { INITIAL_SEMESTER_LIST } from '../data/semesterList';

interface SemesterConfigViewProps {
  currentRole: UserRole;
  onSelectActiveSemester?: (namaSemester: string) => void;
}

export const SemesterConfigView: React.FC<SemesterConfigViewProps> = ({
  currentRole,
  onSelectActiveSemester
}) => {
  if (currentRole === 'mahasiswa') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas: Menu Semester</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          Menu <strong>Semester Akademik</strong> tidak dapat diakses oleh peran <strong>Mahasiswa</strong>. Menu ini hanya dapat diakses oleh Administrator dan Dosen.
        </p>
      </div>
    );
  }

  // State for semester list with localStorage persistence
  const [semesterList, setSemesterList] = useState<SemesterItem[]>(() => {
    const saved = localStorage.getItem('sikma_semesters');
    return saved ? JSON.parse(saved) : INITIAL_SEMESTER_LIST;
  });

  // Manual typing input state
  const [manualInputNama, setManualInputNama] = useState('');
  const [manualTahunAjaran, setManualTahunAjaran] = useState('');
  const [manualTipe, setManualTipe] = useState<'Ganjil' | 'Genap' | 'Antara'>('Ganjil');
  const [manualStatus, setManualStatus] = useState<'Aktif' | 'Arsip' | 'Mendatang'>('Mendatang');
  const [manualTglMulai, setManualTglMulai] = useState('');
  const [manualTglSelesai, setManualTglSelesai] = useState('');
  const [manualKeterangan, setManualKeterangan] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Notification feedback
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveList = (updated: SemesterItem[]) => {
    setSemesterList(updated);
    localStorage.setItem('sikma_semesters', JSON.stringify(updated));
  };

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // Auto-fill auxiliary fields when user types in the semester name
  const handleNamaSemesterChange = (val: string) => {
    setManualInputNama(val);

    // Auto-detect tipe (Ganjil / Genap)
    const lower = val.toLowerCase();
    if (lower.includes('ganjil') || lower.includes('gasal')) {
      setManualTipe('Ganjil');
    } else if (lower.includes('genap')) {
      setManualTipe('Genap');
    } else if (lower.includes('antara') || lower.includes('pendek')) {
      setManualTipe('Antara');
    }

    // Auto-detect tahun ajaran from pattern like 2023 / 2024 or 2023/2024
    const matchTahun = val.match(/(\d{4})\s*[\/\-]\s*(\d{4})/);
    if (matchTahun) {
      setManualTahunAjaran(`${matchTahun[1]}/${matchTahun[2]}`);
    }
  };

  // Handle Form Submit (Tambah / Simpan Manual)
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNama = manualInputNama.trim();
    if (!cleanNama) {
      showAlert('Mohon ketikkan Nama Semester terlebih dahulu.', 'error');
      return;
    }

    // Check duplicate if not editing
    if (!editingId) {
      const exists = semesterList.some(
        (s) => s.namaSemester.toLowerCase() === cleanNama.toLowerCase()
      );
      if (exists) {
        showAlert(`Semester dengan nama "${cleanNama}" sudah ada dalam daftar.`, 'error');
        return;
      }
    }

    if (editingId) {
      // Update existing
      const updated = semesterList.map((item) => {
        if (item.id === editingId) {
          // If set to Aktif, deactivate others
          return {
            ...item,
            namaSemester: cleanNama,
            tahunAjaran: manualTahunAjaran || '2026/2027',
            tipe: manualTipe,
            status: manualStatus,
            tanggalMulai: manualTglMulai,
            tanggalSelesai: manualTglSelesai,
            keterangan: manualKeterangan
          };
        }
        if (manualStatus === 'Aktif') {
          return { ...item, status: 'Arsip' as const };
        }
        return item;
      });
      saveList(updated);
      showAlert(`Semester "${cleanNama}" berhasil diperbarui.`);
      setEditingId(null);
    } else {
      // Insert new
      const newId = `sem-${Date.now().toString().slice(-4)}`;
      let updatedList = [...semesterList];

      if (manualStatus === 'Aktif') {
        updatedList = updatedList.map((s) => ({ ...s, status: 'Arsip' as const }));
      }

      const newItem: SemesterItem = {
        id: newId,
        namaSemester: cleanNama,
        tahunAjaran: manualTahunAjaran || '2026/2027',
        tipe: manualTipe,
        status: manualStatus,
        tanggalMulai: manualTglMulai,
        tanggalSelesai: manualTglSelesai,
        keterangan: manualKeterangan || 'Input manual semester oleh admin'
      };

      saveList([...updatedList, newItem]);
      showAlert(`Semester baru "${cleanNama}" berhasil ditambahkan.`);
    }

    // Reset manual input form
    resetForm();
  };

  const resetForm = () => {
    setManualInputNama('');
    setManualTahunAjaran('');
    setManualTipe('Ganjil');
    setManualStatus('Mendatang');
    setManualTglMulai('');
    setManualTglSelesai('');
    setManualKeterangan('');
    setEditingId(null);
  };

  const handleEditClick = (item: SemesterItem) => {
    setEditingId(item.id);
    setManualInputNama(item.namaSemester);
    setManualTahunAjaran(item.tahunAjaran);
    setManualTipe(item.tipe);
    setManualStatus(item.status);
    setManualTglMulai(item.tanggalMulai || '');
    setManualTglSelesai(item.tanggalSelesai || '');
    setManualKeterangan(item.keterangan || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus semester "${nama}"?`)) {
      const updated = semesterList.filter((s) => s.id !== id);
      saveList(updated);
      showAlert(`Semester "${nama}" berhasil dihapus.`);
    }
  };

  const handleSetActiveSemester = (id: string, nama: string) => {
    const updated = semesterList.map((s) => ({
      ...s,
      status: (s.id === id ? 'Aktif' : s.status === 'Aktif' ? 'Arsip' : s.status) as 'Aktif' | 'Arsip' | 'Mendatang'
    }));
    saveList(updated);
    if (onSelectActiveSemester) {
      onSelectActiveSemester(nama);
    }
    showAlert(`Semester "${nama}" sekarang berstatus AKTIF.`);
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan daftar semester ke rentang bawaan (Ganjil 2023 / 2024 s.d. Ganjil 2030 / 2031)?')) {
      saveList(INITIAL_SEMESTER_LIST);
      showAlert('Daftar semester berhasil direset ke rentang Ganjil 2023 / 2024 s.d. Ganjil 2030 / 2031.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Semester', 'Tipe', 'Tahun Ajaran', 'Status', 'Tanggal Mulai', 'Tanggal Selesai', 'Keterangan'];
    const rows = semesterList.map((s) => [
      s.id,
      `"${s.namaSemester}"`,
      s.tipe,
      `"${s.tahunAjaran}"`,
      s.status,
      s.tanggalMulai || '',
      s.tanggalSelesai || '',
      `"${s.keterangan || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sikma_semester_list_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List
  const filteredList = semesterList.filter((s) => {
    const matchSearch =
      s.namaSemester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tahunAjaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.keterangan && s.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTipe = filterTipe === 'all' || s.tipe === filterTipe;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchTipe && matchStatus;
  });

  const activeSemester = semesterList.find((s) => s.status === 'Aktif');

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span className="text-[#002B49] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold">CONFIG</span>
              <span>/</span>
              <span className="text-[#D4AF37] font-bold">SEMESTER</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#002B49] flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-[#D4AF37]" />
              Konfigurasi Periode Semester
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Manajemen master data semester akademik Departemen Kimia FSTeM Universitas Brawijaya.
              Mendukung input manual nama semester dari <span className="font-semibold text-slate-800">Ganjil 2023 / 2024</span> hingga <span className="font-semibold text-slate-800">Ganjil 2030 / 2031</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-sm"
              title="Ekspor CSV Data Semester"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handleResetToDefault}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-sm"
              title="Reset ke daftar default 2023/2024 s.d. 2030/2031"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Reset Rentang</span>
            </button>
          </div>
        </div>

        {/* Alert notification */}
        {alertMessage && (
          <div
            className={`mt-4 p-3.5 rounded-lg text-xs flex items-center justify-between border ${
              alertMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{alertMessage.text}</span>
            </div>
            <button onClick={() => setAlertMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Status Highlight Banner */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#002B49] to-[#003c66] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37] text-[#002B49] flex items-center justify-center font-bold text-sm shadow-md shrink-0">
              UB
            </div>
            <div>
              <div className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-wider">
                Semester Berjalan Aktif SIKMA
              </div>
              <div className="text-base sm:text-lg font-extrabold tracking-tight">
                {activeSemester ? activeSemester.namaSemester : 'Belum Ada Semester Aktif'}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-200 sm:text-right">
            <div>Tahun Akademik: <span className="font-semibold text-white">{activeSemester?.tahunAjaran || '-'}</span></div>
            <div className="text-[11px] text-slate-300">{activeSemester?.keterangan || 'Aktif untuk seluruh civitas'}</div>
          </div>
        </div>
      </div>

      {/* FORM INPUT MANUAL NAMA SEMESTER */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#002B49]">
                {editingId ? 'Ubah Data Semester (Ketik Manual)' : 'Input Nama Semester (Ketik Manual)'}
              </h2>
              <p className="text-xs text-slate-500">
                Ketikkan nama semester secara manual seperti contoh: <span className="font-mono font-semibold text-slate-700">Ganjil 2023 / 2024</span> s.d. <span className="font-mono font-semibold text-slate-700">Ganjil 2030 / 2031</span>.
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batal Edit</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmitManual} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input Ketikan Manual Nama Semester */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Input Nama Semester (Ketik Manual) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  id="input-nama-semester-manual"
                  value={manualInputNama}
                  onChange={(e) => handleNamaSemesterChange(e.target.value)}
                  placeholder="Ketik manual, contoh: Ganjil 2023 / 2024 atau Genap 2026 / 2027"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                Ketik manual nama semester. Sistem akan otomatis mendeteksi tipe dan tahun ajaran.
              </p>
            </div>

            {/* Tahun Ajaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Ajaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={manualTahunAjaran}
                onChange={(e) => setManualTahunAjaran(e.target.value)}
                placeholder="misal: 2023/2024"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tipe Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipe Semester
              </label>
              <select
                value={manualTipe}
                onChange={(e) => setManualTipe(e.target.value as 'Ganjil' | 'Genap' | 'Antara')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              >
                <option value="Ganjil">Semester Ganjil (Gasal)</option>
                <option value="Genap">Semester Genap</option>
                <option value="Antara">Semester Antara (Pendek)</option>
              </select>
            </div>

            {/* Status Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Semester
              </label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value as 'Aktif' | 'Arsip' | 'Mendatang')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              >
                <option value="Mendatang">Mendatang (Rencana)</option>
                <option value="Aktif">Aktif (Sedang Berjalan)</option>
                <option value="Arsip">Arsip (Telah Selesai)</option>
              </select>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan / Catatan
              </label>
              <input
                type="text"
                value={manualKeterangan}
                onChange={(e) => setManualKeterangan(e.target.value)}
                placeholder="misal: Periode perkuliahan & skripsi"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai Periode (Opsional)
              </label>
              <input
                type="date"
                value={manualTglMulai}
                onChange={(e) => setManualTglMulai(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Selesai Periode (Opsional)
              </label>
              <input
                type="date"
                value={manualTglSelesai}
                onChange={(e) => setManualTglSelesai(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>
          </div>

          {/* Quick manual typing chips for requested range (Ganjil 2023/2024 to Ganjil 2030/2031) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <span>Pilihan Cepat Rentang Semester (Klik untuk mengisi otomatis):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Ganjil 2023 / 2024',
                'Genap 2023 / 2024',
                'Ganjil 2024 / 2025',
                'Genap 2024 / 2025',
                'Ganjil 2025 / 2026',
                'Genap 2025 / 2026',
                'Ganjil 2026 / 2027',
                'Genap 2026 / 2027',
                'Ganjil 2027 / 2028',
                'Genap 2027 / 2028',
                'Ganjil 2028 / 2029',
                'Genap 2028 / 2029',
                'Ganjil 2029 / 2030',
                'Genap 2029 / 2030',
                'Ganjil 2030 / 2031'
              ].map((namaSem) => (
                <button
                  key={namaSem}
                  type="button"
                  onClick={() => handleNamaSemesterChange(namaSem)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-[#002B49] hover:text-[#D4AF37] text-slate-700 transition-colors border border-slate-200"
                >
                  {namaSem}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#002B49] hover:bg-[#003865] text-[#D4AF37] font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm ring-1 ring-[#D4AF37]/30"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? 'Simpan Perubahan Semester' : 'Simpan Semester Baru'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* TABEL DAFTAR SEMESTER */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              Daftar Periode Semester SIKMA ({filteredList.length} Semester)
            </h3>
            <p className="text-xs text-slate-500">
              Daftar semester akademik terdaftar, dimulai dari Ganjil 2023 / 2024 s.d. Ganjil 2030 / 2031.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari semester..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>

            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            >
              <option value="all">Semua Tipe</option>
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
              <option value="Antara">Antara</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Mendatang">Mendatang</option>
              <option value="Arsip">Arsip</option>
            </select>
          </div>
        </div>

        {/* Semester Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#002B49] text-white uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Semester</th>
                <th className="py-3 px-4">Tipe & Tahun Ajaran</th>
                <th className="py-3 px-4">Rentang Tanggal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada semester yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isCurrentActive = item.status === 'Aktif';
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrentActive ? 'bg-emerald-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold ${isCurrentActive ? 'text-emerald-900' : 'text-slate-900'}`}>
                            {item.namaSemester}
                          </span>
                          {isCurrentActive && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Sedang Aktif
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.tipe === 'Ganjil'
                                ? 'bg-blue-100 text-blue-800'
                                : item.tipe === 'Genap'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.tipe}
                          </span>
                          <span className="font-mono text-slate-600">{item.tahunAjaran}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {item.tanggalMulai && item.tanggalSelesai ? (
                          `${item.tanggalMulai} s.d. ${item.tanggalSelesai}`
                        ) : (
                          <span className="text-slate-400 italic">Belum diatur</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : item.status === 'Mendatang'
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {item.status === 'Aktif' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : item.status === 'Mendatang' ? (
                            <Clock className="w-3 h-3 text-sky-600" />
                          ) : (
                            <Archive className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{item.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate" title={item.keterangan}>
                        {item.keterangan || '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isCurrentActive && (
                            <button
                              onClick={() => handleSetActiveSemester(item.id, item.namaSemester)}
                              title="Set sebagai semester berjalan aktif"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-bold border border-emerald-300 transition-colors"
                            >
                              Aktifkan
                            </button>
                          )}

                          <button
                            onClick={() => handleEditClick(item)}
                            title="Edit data semester"
                            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.namaSemester)}
                            title="Hapus semester"
                            disabled={isCurrentActive}
                            className={`p-1.5 rounded transition-colors ${
                              isCurrentActive ? 'text-slate-300 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
