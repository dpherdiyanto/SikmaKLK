import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  FileCheck2,
  FileX2,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { InstansiItem, UserRole } from '../types/sikma';
import { DAFTAR_PROVINSI_INDONESIA, INITIAL_INSTANSI_LIST } from '../data/instansiList';

interface InstansiConfigViewProps {
  currentRole: UserRole;
}

export const InstansiConfigView: React.FC<InstansiConfigViewProps> = ({ currentRole }) => {
  if (currentRole === 'mahasiswa') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas: Menu Instansi</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          Menu <strong>Instansi Mitra</strong> tidak dapat diakses oleh peran <strong>Mahasiswa</strong>. Menu ini hanya dapat diakses oleh Administrator dan Dosen.
        </p>
      </div>
    );
  }

  // Persistence via localStorage
  const [instansiList, setInstansiList] = useState<InstansiItem[]>(() => {
    const saved = localStorage.getItem('sikma_instansi_data');
    if (saved) {
      try {
        const parsed: InstansiItem[] = JSON.parse(saved);
        const requestedNames = [
          'pt. saraswanti indo genetech surabaya',
          'pt brawijaya multi usaha',
          'dinas lingkungan hidup kabupaten jombang',
          'department of chemistry and biotechnology; aachen university of applied science; fh aachen'
        ];
        const existingNames = new Set(parsed.map((p) => p.namaInstansi.toLowerCase()));
        const missingNew = INITIAL_INSTANSI_LIST.filter(
          (item) =>
            requestedNames.includes(item.namaInstansi.toLowerCase()) &&
            !existingNames.has(item.namaInstansi.toLowerCase())
        );
        if (missingNew.length > 0) {
          const merged = [...missingNew, ...parsed];
          localStorage.setItem('sikma_instansi_data', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch {
        return INITIAL_INSTANSI_LIST;
      }
    }
    return INITIAL_INSTANSI_LIST;
  });

  // Modal State for Tambah / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InstansiItem | null>(null);

  // Form Fields State
  const [formNamaInstansi, setFormNamaInstansi] = useState<string>('');
  const [formProvinsi, setFormProvinsi] = useState<string>('Jawa Timur');
  const [formAlamat, setFormAlamat] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formNamaPimpinan, setFormNamaPimpinan] = useState<string>('');
  const [formNoTelpPimpinan, setFormNoTelpPimpinan] = useState<string>('');
  const [formPks, setFormPks] = useState<'Ya' | 'Tidak'>('Ya');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');
  const [formKeterangan, setFormKeterangan] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedDetailItem, setSelectedDetailItem] = useState<InstansiItem | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<InstansiItem | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterProvinsi, setFilterProvinsi] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterPks, setFilterPks] = useState<string>('Semua');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveList = (updated: InstansiItem[]) => {
    setInstansiList(updated);
    localStorage.setItem('sikma_instansi_data', JSON.stringify(updated));
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormNamaInstansi('');
    setFormProvinsi('Jawa Timur');
    setFormAlamat('');
    setFormEmail('');
    setFormNamaPimpinan('');
    setFormNoTelpPimpinan('');
    setFormPks('Ya');
    setFormStatus('Aktif');
    setFormKeterangan('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: InstansiItem) => {
    setEditingItem(item);
    setFormNamaInstansi(item.namaInstansi);
    setFormProvinsi(item.provinsi || 'Jawa Timur');
    setFormAlamat(item.alamat);
    setFormEmail(item.email);
    setFormNamaPimpinan(item.namaPimpinan);
    setFormNoTelpPimpinan(item.noTelpPimpinan);
    setFormPks(item.pks);
    setFormStatus(item.status);
    setFormKeterangan(item.keterangan || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError(null);
  };

  // Handle Form Submit (Tambah / Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanNama = formNamaInstansi.trim();
    const cleanAlamat = formAlamat.trim();
    const cleanEmail = formEmail.trim();
    const cleanPimpinan = formNamaPimpinan.trim();
    const cleanTelp = formNoTelpPimpinan.trim();

    if (!cleanNama) {
      setFormError('Nama Instansi wajib diisi.');
      return;
    }
    if (!cleanAlamat) {
      setFormError('Alamat instansi wajib diisi.');
      return;
    }
    if (!cleanEmail) {
      setFormError('Email instansi wajib diisi.');
      return;
    }
    if (!cleanPimpinan) {
      setFormError('Nama Pimpinan wajib diisi.');
      return;
    }
    if (!cleanTelp) {
      setFormError('Nomor Telepon Pimpinan wajib diisi.');
      return;
    }

    if (editingItem) {
      // Update existing item
      const updatedList = instansiList.map((inst) =>
        inst.id === editingItem.id
          ? {
              ...inst,
              namaInstansi: cleanNama,
              provinsi: formProvinsi,
              alamat: cleanAlamat,
              email: cleanEmail,
              namaPimpinan: cleanPimpinan,
              noTelpPimpinan: cleanTelp,
              pks: formPks,
              status: formStatus,
              keterangan: formKeterangan.trim(),
              updatedAt: new Date().toISOString()
            }
          : inst
      );
      saveList(updatedList);
      showToast(`Data instansi "${cleanNama}" berhasil diperbarui.`);
    } else {
      // Add new item
      const newItem: InstansiItem = {
        id: `inst-${Date.now()}`,
        namaInstansi: cleanNama,
        provinsi: formProvinsi,
        alamat: cleanAlamat,
        email: cleanEmail,
        namaPimpinan: cleanPimpinan,
        noTelpPimpinan: cleanTelp,
        pks: formPks,
        status: formStatus,
        keterangan: formKeterangan.trim(),
        createdAt: new Date().toISOString()
      };
      saveList([newItem, ...instansiList]);
      showToast(`Instansi "${cleanNama}" berhasil ditambahkan.`);
    }

    handleCloseModal();
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
    const targetName = deleteConfirmItem.namaInstansi;
    const updatedList = instansiList.filter((item) => item.id !== deleteConfirmItem.id);
    saveList(updatedList);
    setDeleteConfirmItem(null);
    if (selectedDetailItem?.id === deleteConfirmItem.id) {
      setSelectedDetailItem(null);
    }
    showToast(`Instansi "${targetName}" berhasil dihapus.`);
  };

  // Reset to initial data
  const handleResetDefault = () => {
    if (window.confirm('Kembalikan data instansi ke daftar default? Data perubahan manual akan direset.')) {
      saveList(INITIAL_INSTANSI_LIST);
      showToast('Data instansi telah direset ke daftar default.');
    }
  };

  // Filtered & Searched Data
  const filteredList = useMemo(() => {
    return instansiList.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = item.namaInstansi.toLowerCase().includes(q);
        const matchAlamat = item.alamat.toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchPimpinan = item.namaPimpinan.toLowerCase().includes(q);
        const matchProv = (item.provinsi || '').toLowerCase().includes(q);
        if (!matchNama && !matchAlamat && !matchEmail && !matchPimpinan && !matchProv) return false;
      }

      // Filter Provinsi
      if (filterProvinsi !== 'Semua' && item.provinsi !== filterProvinsi) {
        return false;
      }

      // Filter Status
      if (filterStatus !== 'Semua' && item.status !== filterStatus) {
        return false;
      }

      // Filter PKS
      if (filterPks !== 'Semua' && item.pks !== filterPks) {
        return false;
      }

      return true;
    });
  }, [instansiList, searchQuery, filterProvinsi, filterStatus, filterPks]);

  // Statistics
  const totalCount = instansiList.length;
  const pksCount = instansiList.filter((i) => i.pks === 'Ya').length;
  const aktifCount = instansiList.filter((i) => i.status === 'Aktif').length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-80 max-w-md bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER UTAMA CONFIG INSTANSI */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/60 shadow-xs">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002B49] tracking-tight">
                    Instansi
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Config Mitra
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Departemen Kimia FSTeM Universitas Brawijaya • Direktori Instansi, Industri, & Lembaga Riset Mitra
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar Header */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefault}
              className="h-10 inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-xs font-semibold transition-all cursor-pointer"
              title="Reset ke data default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>

            {/* BUTTON TAMBAH INSTANSI WARNA HIJAU SESUAI PERMINTAAN USER */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="h-10 inline-flex items-center gap-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tambah Instansi</span>
            </button>
          </div>
        </div>

        {/* STATISTIK RINGKAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Instansi
              </p>
              <p className="text-2xl font-black text-[#002B49] mt-0.5">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Memiliki PKS
              </p>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">{pksCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status Aktif
              </p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">{aktifCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TABEL / FORM UTAMA INSTANSI
          Fields:
          1. Nama Instansi
          2. Alamat
          3. Email
          4. Status
          5. Action (berisi button Edit dan button Hapus)
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Sub-header Filter & Pencarian */}
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#002B49] flex flex-wrap items-center gap-2">
                <span>Daftar Instansi & Lembaga Mitra</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {filteredList.length} dari {totalCount} Data
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Limit 10 per Halaman
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Data fields tersinkronisasi otomatis dari input tombol Tambah Instansi
              </p>
            </div>

            {/* Button Tambah Instansi removed from this box per user request */}
          </div>

          {/* Bar Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* 1. Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari instansi, alamat, email, pimpinan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2. Filter Provinsi */}
            <div>
              <select
                value={filterProvinsi}
                onChange={(e) => {
                  setFilterProvinsi(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Semua">Semua Provinsi (38 Provinsi)</option>
                {DAFTAR_PROVINSI_INDONESIA.map((prov, idx) => (
                  <option key={idx} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Filter Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            {/* 4. Filter PKS */}
            <div>
              <select
                value={filterPks}
                onChange={(e) => {
                  setFilterPks(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Semua">Semua Status PKS</option>
                <option value="Ya">PKS: Ya (Memiliki PKS)</option>
                <option value="Tidak">PKS: Tidak (Belum PKS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Fields */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-[260px]">Nama Instansi</th>
                <th className="py-3 px-4 min-w-[280px]">Alamat</th>
                <th className="py-3 px-4 w-[200px]">Email</th>
                <th className="py-3 px-4 text-center w-[130px]">Status</th>
                <th className="py-3 px-4 text-center w-[160px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada data instansi yang cocok</p>
                    <p className="text-[11px] mt-0.5 text-slate-400">
                      Silakan sesuaikan filter pencarian atau klik tombol Tambah Instansi.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const isAktif = item.status === 'Aktif';
                  const hasPks = item.pks === 'Ya';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* 1. Nama Instansi */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-sm leading-snug">
                            {item.namaInstansi}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {item.provinsi && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                <MapPin className="w-2.5 h-2.5" />
                                <span>{item.provinsi}</span>
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                hasPks
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {hasPks ? (
                                <FileCheck2 className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <FileX2 className="w-2.5 h-2.5 text-amber-600" />
                              )}
                              <span>PKS: {item.pks}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Alamat */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="leading-relaxed text-slate-600 line-clamp-2" title={item.alamat}>
                          {item.alamat}
                        </div>
                        {item.namaPimpinan && (
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <span className="font-medium text-slate-500">Pimpinan:</span>
                            <span className="text-slate-700 font-semibold">{item.namaPimpinan}</span>
                            {item.noTelpPimpinan && (
                              <span className="text-slate-400 font-mono">({item.noTelpPimpinan})</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 3. Email */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <a
                          href={`mailto:${item.email}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          title={`Kirim email ke ${item.email}`}
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[170px]">{item.email}</span>
                        </a>
                      </td>

                      {/* 4. Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isAktif
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAktif ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* 5. Action (berisi button Edit dan button Hapus) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Button Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-2xs hover:shadow transition-all cursor-pointer"
                            title={`Edit data instansi ${item.namaInstansi}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Button Hapus */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 hover:text-rose-800 border border-rose-200 font-bold text-xs transition-all cursor-pointer"
                            title={`Hapus instansi ${item.namaInstansi}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Hapus</span>
                          </button>

                          {/* Quick View Details Icon */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

        {/* Footer & Paginasi Tabel Fields */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <span className="font-bold text-slate-800">
              {filteredList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            s/d{' '}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * pageSize, filteredList.length)}
            </span>{' '}
            dari <span className="font-bold text-slate-800">{filteredList.length}</span> data instansi
          </div>

          {/* Pagination Controls bila data list mencapai limit 10 list */}
          {(filteredList.length >= 10 || totalPages > 1) && (
            <div className="flex items-center gap-1 self-center sm:self-auto">
              <span className="text-[11px] text-slate-500 font-medium mr-1 hidden sm:inline">
                Halaman:
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: FORM TAMBAH / EDIT INSTANSI
          List fields sesuai spesifikasi user:
          1. Nama Instansi
          2. Provinsi (select dari semua provinsi di Indonesia)
          3. Alamat
          4. Email
          5. Nama Pimpinan
          6. No Telp Pimpinan
          7. PKS (dengan opsi Ya atau Tidak)
          8. Status (Aktif / Tidak Aktif)
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8 flex flex-col">
            {/* Header Modal */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingItem ? 'Edit Data Instansi' : 'Tambah Instansi Baru'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Form Pendaftaran & Manajemen Mitra Departemen Kimia FSTeM UB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Nama Instansi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Instansi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PT Petrokimia Gresik / Pusat Riset Kimia BRIN"
                  value={formNamaInstansi}
                  onChange={(e) => setFormNamaInstansi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* 2. Provinsi (select dari semua provinsi di Indonesia) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Provinsi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formProvinsi}
                  onChange={(e) => setFormProvinsi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                  required
                >
                  {DAFTAR_PROVINSI_INDONESIA.map((prov, idx) => (
                    <option key={idx} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Pilihan mencakup seluruh 38 provinsi di Indonesia.
                </span>
              </div>

              {/* 3. Alamat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Jl. Jenderal Ahmad Yani, Karangturi, Kec. Gresik, Jawa Timur 61119"
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none font-medium"
                  required
                />
              </div>

              {/* 4. Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Contoh: kerjasama@petrokimia-gresik.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* 5. Nama Pimpinan & 6. No Telp Pimpinan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Pimpinan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Contoh: Ir. Dwi Satriyo Annurogo, M.T."
                      value={formNamaPimpinan}
                      onChange={(e) => setFormNamaPimpinan(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    No Telp Pimpinan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Contoh: (031) 3981811 / 08123456789"
                      value={formNoTelpPimpinan}
                      onChange={(e) => setFormNoTelpPimpinan(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 7. PKS (opsi Ya atau Tidak) & 8. Status (Aktif / Tidak Aktif) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    PKS (Perjanjian Kerja Sama) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formPks}
                    onChange={(e) => setFormPks(e.target.value as 'Ya' | 'Tidak')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                    required
                  >
                    <option value="Ya">Ya (Memiliki PKS)</option>
                    <option value="Tidak">Tidak (Belum PKS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                    required
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              {/* Keterangan Tambahan (Opsional) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Keterangan Kerja Sama (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan bidang riset, magang, analisis lab, atau kontak penghubung..."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Instansi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DETAIL LENGKAP INSTANSI
          ========================================================================= */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Rincian Informasi Instansi</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Nama Instansi</span>
                <span className="font-bold text-slate-900 text-base block mt-0.5">
                  {selectedDetailItem.namaInstansi}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Provinsi</span>
                  <span className="font-bold text-blue-700 block mt-0.5">
                    {selectedDetailItem.provinsi || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Status PKS</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded border mt-0.5 ${
                      selectedDetailItem.pks === 'Ya'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {selectedDetailItem.pks === 'Ya' ? 'PKS Aktif (Ya)' : 'Belum PKS (Tidak)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Nama Pimpinan</span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {selectedDetailItem.namaPimpinan || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Kontak Pimpinan</span>
                  <span className="font-mono font-medium text-slate-700 block mt-0.5">
                    {selectedDetailItem.noTelpPimpinan || '-'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px] font-semibold">Email Resmi</span>
                  <a
                    href={`mailto:${selectedDetailItem.email}`}
                    className="font-medium text-blue-600 hover:underline block mt-0.5"
                  >
                    {selectedDetailItem.email}
                  </a>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px] font-semibold">Status Instansi</span>
                  <span
                    className={`inline-flex items-center gap-1.5 font-bold text-[11px] px-2.5 py-0.5 rounded-full border mt-0.5 ${
                      selectedDetailItem.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedDetailItem.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <span>{selectedDetailItem.status}</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Alamat Lengkap</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed mt-1">
                  {selectedDetailItem.alamat}
                </p>
              </div>

              {selectedDetailItem.keterangan && (
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Keterangan Kerja Sama</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed mt-1">
                    {selectedDetailItem.keterangan}
                  </p>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const item = selectedDetailItem;
                    setSelectedDetailItem(null);
                    handleOpenEditModal(item);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Instansi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDetailItem(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL KONFIRMASI HAPUS
          ========================================================================= */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-rose-200 overflow-hidden my-8 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  Konfirmasi Hapus Instansi
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus data instansi{' '}
                  <strong className="text-rose-700">{deleteConfirmItem.namaInstansi}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Instansi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
