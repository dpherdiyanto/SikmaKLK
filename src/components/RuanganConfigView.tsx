import React, { useState, useId } from 'react';
import { RuanganItem, KategoriRuangan, StatusRuangan, UserRole } from '../types/sikma';
import { INITIAL_RUANGAN_LIST } from '../data/ruanganList';
import {
  DoorOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Users,
  FlaskConical,
  Building,
  Sparkles,
  Info,
  X,
  AlertTriangle,
  Download,
  ShieldAlert
} from 'lucide-react';

interface RuanganConfigViewProps {
  currentRole: UserRole;
}

export const RuanganConfigView: React.FC<RuanganConfigViewProps> = ({ currentRole }) => {
  if (currentRole === 'mahasiswa') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas: Menu Ruangan</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          Menu <strong>Ruangan & Fasilitas</strong> tidak dapat diakses oleh peran <strong>Mahasiswa</strong>. Menu ini hanya dapat diakses oleh Administrator dan Dosen.
        </p>
      </div>
    );
  }

  // Persistence via localStorage
  const [ruanganList, setRuanganList] = useState<RuanganItem[]>(() => {
    const saved = localStorage.getItem('sikma_ruangan_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_RUANGAN_LIST;
      }
    }
    return INITIAL_RUANGAN_LIST;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RuanganItem | null>(null);

  // Form Field State
  const [formNama, setFormNama] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formKapasitas, setFormKapasitas] = useState<number | ''>(30);
  const [formKategori, setFormKategori] = useState<KategoriRuangan>('Umum');
  const [formStatus, setFormStatus] = useState<StatusRuangan>('Aktif');
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<RuanganItem | null>(null);

  // Success Notification Banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const namaInputId = useId();
  const kapasitasInputId = useId();
  const kategoriSelectId = useId();
  const statusSelectId = useId();
  const keteranganInputId = useId();

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const saveToStorage = (newList: RuanganItem[]) => {
    setRuanganList(newList);
    localStorage.setItem('sikma_ruangan_list', JSON.stringify(newList));
  };

  // Open Edit Modal
  const handleOpenEdit = (item: RuanganItem) => {
    setEditingItem(item);
    setFormNama(item.namaRuangan);
    setFormKeterangan(item.keterangan || '');
    setFormKapasitas(item.kapasitas);
    setFormKategori(item.kategori);
    setFormStatus(item.status);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormNama('');
    setFormKeterangan('');
    setFormKapasitas(30);
    setFormKategori('Umum');
    setFormStatus('Aktif');
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Form (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama Ruangan wajib diisi!');
      return;
    }
    if (formKapasitas === '' || Number(formKapasitas) <= 0) {
      setFormError('Kapasitas harus berupa angka lebih dari 0!');
      return;
    }

    if (editingItem) {
      // Update existing
      const updated = ruanganList.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              namaRuangan: formNama.trim(),
              keterangan: formKeterangan.trim(),
              kapasitas: Number(formKapasitas),
              kategori: formKategori,
              status: formStatus
            }
          : item
      );
      saveToStorage(updated);
      showNotification(`Ruangan "${formNama.trim()}" berhasil diperbarui.`);
    } else {
      // Add new
      const newItem: RuanganItem = {
        id: `ruang-${Date.now()}`,
        namaRuangan: formNama.trim(),
        keterangan: formKeterangan.trim(),
        kapasitas: Number(formKapasitas),
        kategori: formKategori,
        status: formStatus
      };
      saveToStorage([newItem, ...ruanganList]);
      showNotification(`Ruangan baru "${formNama.trim()}" berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDeleteConfirm = () => {
    if (!deleteConfirmItem) return;
    const filtered = ruanganList.filter((item) => item.id !== deleteConfirmItem.id);
    saveToStorage(filtered);
    showNotification(`Ruangan "${deleteConfirmItem.namaRuangan}" berhasil dihapus.`);
    setDeleteConfirmItem(null);
  };

  // Reset to default initial list
  const handleResetDefault = () => {
    if (window.confirm('Kembalikan data daftar ruangan ke master default Departemen Kimia FSTeM UB?')) {
      saveToStorage(INITIAL_RUANGAN_LIST);
      showNotification('Data ruangan berhasil di-reset ke konfigurasi bawaan.', 'info');
    }
  };

  // Filtered List
  const filteredList = ruanganList.filter((item) => {
    const matchSearch =
      item.namaRuangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.kategori.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === 'Semua' || item.kategori === filterKategori;
    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
    return matchSearch && matchKategori && matchStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Ruangan', 'Kapasitas', 'Kategori', 'Status', 'Keterangan'];
    const rows = filteredList.map((r) => [
      r.id,
      `"${r.namaRuangan.replace(/"/g, '""')}"`,
      r.kapasitas,
      r.kategori,
      r.status,
      `"${(r.keterangan || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Ruangan_Kimia_UB_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Stats
  const totalRuangan = ruanganList.length;
  const totalAktif = ruanganList.filter((r) => r.status === 'Aktif').length;
  const totalLab = ruanganList.filter((r) => r.kategori === 'Lab').length;
  const totalKapasitas = ruanganList.reduce((acc, curr) => acc + (curr.kapasitas || 0), 0);

  // Badge styling helper for Kategori
  const getKategoriBadge = (kategori: KategoriRuangan) => {
    switch (kategori) {
      case 'Umum':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Lab':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Khusus':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Other':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003865] to-[#001D33] text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-700/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider mb-2">
            <DoorOpen className="w-4 h-4" />
            <span>Config & Fasilitas Akademik • Departemen Kimia UB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Data Ruangan & Fasilitas
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
            Kelola master data ruangan perkuliahan umum, laboratorium riset kimia, ruang sidang, dan fasilitas departemen. 
            Mendukung pengaturan kapasitas, kategori (Umum, Lab, Khusus, Other), dan status operasional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-tambah-ruangan"
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#b8952b] text-[#002B49] px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ruangan</span>
          </button>

          <button
            id="btn-reset-ruangan"
            onClick={handleResetDefault}
            title="Reset ke master bawaan Departemen Kimia"
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            id="btn-export-ruangan-csv"
            onClick={handleExportCSV}
            title="Ekspor CSV"
            className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between animate-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <DoorOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Ruangan</div>
            <div className="text-xl font-extrabold text-slate-900">{totalRuangan}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Ruang Aktif</div>
            <div className="text-xl font-extrabold text-emerald-700">{totalAktif}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Laboratorium</div>
            <div className="text-xl font-extrabold text-amber-800">{totalLab} Lab</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Daya Tampung</div>
            <div className="text-xl font-extrabold text-purple-900">{totalKapasitas} Orang</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter & Search Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-ruangan"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama ruangan, keterangan..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Kategori */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500">Kategori:</span>
              <select
                id="filter-kategori-ruangan"
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Umum">Umum</option>
                <option value="Lab">Lab</option>
                <option value="Khusus">Khusus</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                id="filter-status-ruangan"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* The Exact Table as requested:
            Kolom: Nama Ruangan, Kapasitas, Kategori, Status, Action
        */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[240px]">Nama Ruangan</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Kapasitas</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Kategori</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Status</th>
                <th className="py-3 px-4 min-w-[140px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <DoorOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm">Tidak ada data ruangan ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba ubah kata kunci pencarian atau filter kategori/status di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* No */}
                    <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    {/* Field 1: Nama Ruangan */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#002B49] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#002B49] group-hover:text-white transition-colors">
                          <DoorOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {item.namaRuangan}
                          </div>
                          {item.keterangan && (
                            <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                              {item.keterangan}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Field 2: Kapasitas */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.kapasitas} Kursi / Orang</span>
                      </span>
                    </td>

                    {/* Field 3: Kategori (Umum, Lab, Khusus, Other) */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getKategoriBadge(
                          item.kategori
                        )}`}
                      >
                        {item.kategori}
                      </span>
                    </td>

                    {/* Field 4: Status (Aktif, Tidak Aktif) */}
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'Aktif' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Tidak Aktif</span>
                        </span>
                      )}
                    </td>

                    {/* Field 5: Action (Edit & Hapus) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Tombol Edit */}
                        <button
                          id={`btn-edit-ruangan-${item.id}`}
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Ruangan"
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          id={`btn-delete-ruangan-${item.id}`}
                          onClick={() => setDeleteConfirmItem(item)}
                          title="Hapus Ruangan"
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <strong>{filteredList.length}</strong> dari <strong>{ruanganList.length}</strong> total ruangan
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Aktif ({totalAktif})</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>Tidak Aktif ({ruanganList.length - totalAktif})</span>
            </span>
          </div>
        </div>
      </div>

      {/* FORM MODAL: EDIT / TAMBAH RUANGAN
          Sesuai instruksi:
          "Kilk tombol edit akan muncul form : Edit Ruangan, yang terdiri dari : 
           Nama Ruangan, Keterangan, Kapasitas, Kategori (terdiri dari pilihan : Umum, Lab, Khusus, Other), 
           Status (terdiri dari pilihan : Aktif dan Tidak Aktif)"
      */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002B49] to-[#003865] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DoorOpen className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-extrabold text-base tracking-tight">
                  {editingItem ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Field 1: Nama Ruangan */}
              <div>
                <label htmlFor={namaInputId} className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  id={namaInputId}
                  type="text"
                  value={formNama}
                  onChange={(e) => {
                    setFormNama(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Contoh: Ruang Kuliah K.1.1 atau Lab. Kimia Analitik"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Field 2: Kapasitas & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kapasitas */}
                <div>
                  <label htmlFor={kapasitasInputId} className="block text-xs font-bold text-slate-800 mb-1.5">
                    Kapasitas (Kursi / Orang) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={kapasitasInputId}
                    type="number"
                    min="1"
                    max="500"
                    value={formKapasitas}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setFormKapasitas(val);
                      if (formError) setFormError('');
                    }}
                    placeholder="Misal: 40"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Kategori (Umum, Lab, Khusus, Other) */}
                <div>
                  <label htmlFor={kategoriSelectId} className="block text-xs font-bold text-slate-800 mb-1.5">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id={kategoriSelectId}
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as KategoriRuangan)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Lab">Lab</option>
                    <option value="Khusus">Khusus</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Field 3: Status (Aktif dan Tidak Aktif) */}
              <div>
                <label htmlFor={statusSelectId} className="block text-xs font-bold text-slate-800 mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  id={statusSelectId}
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as StatusRuangan)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              {/* Field 4: Keterangan */}
              <div>
                <label htmlFor={keteranganInputId} className="block text-xs font-bold text-slate-800 mb-1.5">
                  Keterangan
                </label>
                <textarea
                  id={keteranganInputId}
                  rows={3}
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Informasi lokasi gedung, spesifikasi instrumen/fasilitas ruangan..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-ruangan"
                  className="px-5 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#003865] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambahkan Ruangan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: HAPUS RUANGAN
          "Kilih tombol Hapus akan menghapus data input."
      */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Hapus Data Ruangan?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data ruangan:
            </p>
            <div className="my-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-900 text-xs">
                {deleteConfirmItem.namaRuangan}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Kapasitas: {deleteConfirmItem.kapasitas} • Kategori: {deleteConfirmItem.kategori}
              </div>
            </div>
            <p className="text-[11px] text-rose-600 font-medium">
              Data input ini akan dihapus dari daftar ruangan sistem.
            </p>

            <div className="mt-5 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-ruangan"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
