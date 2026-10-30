import React, { useState, useMemo, useEffect } from 'react';
import { AdminStaff, UserRole } from '../types/sikma';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building2,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  X,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  MapPin,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface AdminManagementProps {
  currentRole: UserRole;
  adminList: AdminStaff[];
  onAddAdmin: (admin: AdminStaff) => void;
  onUpdateAdmin: (admin: AdminStaff) => void;
  onDeleteAdmin: (id: string) => void;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({
  currentRole,
  adminList,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Pagination State (Limit 10 baris per halaman)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Modals state
  const [detailAdmin, setDetailAdmin] = useState<AdminStaff | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminStaff | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Flash message
  const [flashMessage, setFlashMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showFlash = (type: 'success' | 'error', text: string) => {
    setFlashMessage({ type, text });
    setTimeout(() => setFlashMessage(null), 4000);
  };

  // Form State
  const initialFormState = {
    nip: '',
    nama: '',
    gelar: 'S.AP.',
    jabatan: '',
    unit: 'Sub-Bagian Akademik & Administrasi Departemen Kimia',
    tupoksiInput: '',
    email: '',
    telepon: '',
    ruangKantor: 'Gedung Kimia FSTeM Lt. 1 R.102',
    status: 'Aktif' as AdminStaff['status'],
    pendidikanTerakhir: 'S1 Ilmu Administrasi'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filtered list
  const filteredList = useMemo(() => {
    return adminList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [adminList, searchQuery, filterStatus]);

  // Pagination calculations (Limit 10 baris per halaman)
  const totalFiltered = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedList = useMemo(() => {
    return filteredList.slice(startIndex, endIndex);
  }, [filteredList, startIndex, endIndex]);

  // Statistics
  const stats = useMemo(() => {
    const total = adminList.length;
    const aktif = adminList.filter((a) => a.status === 'Aktif').length;
    const cuti = adminList.filter((a) => a.status === 'Cuti').length;
    return { total, aktif, cuti };
  }, [adminList]);

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      showFlash('error', 'Nama lengkap wajib diisi!');
      return;
    }

    const tupoksiArray = formData.tupoksiInput
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingAdmin) {
      const updated: AdminStaff = {
        ...editingAdmin,
        nip: '',
        nama: formData.nama,
        gelar: formData.gelar,
        jabatan: formData.jabatan,
        unit: formData.unit,
        tupoksi: tupoksiArray.length > 0 ? tupoksiArray : editingAdmin.tupoksi,
        email: formData.email,
        telepon: formData.telepon,
        ruangKantor: formData.ruangKantor,
        status: formData.status,
        pendidikanTerakhir: formData.pendidikanTerakhir
      };
      onUpdateAdmin(updated);
      showFlash('success', `Data admin ${updated.nama} berhasil diperbarui.`);
      setEditingAdmin(null);
    } else {
      const newAdmin: AdminStaff = {
        id: `adm-${Date.now()}`,
        nip: '',
        nama: formData.nama,
        gelar: formData.gelar,
        jabatan: formData.jabatan,
        unit: formData.unit,
        tupoksi:
          tupoksiArray.length > 0
            ? tupoksiArray
            : ['Pengelolaan administrasi & layanan dokumen akademik'],
        email: formData.email || `${formData.nama.toLowerCase().replace(/\s+/g, '.')}@ub.ac.id`,
        telepon: formData.telepon || '0812-0000-0000',
        ruangKantor: formData.ruangKantor,
        status: formData.status,
        pendidikanTerakhir: formData.pendidikanTerakhir
      };
      onAddAdmin(newAdmin);
      showFlash('success', `Admin baru ${newAdmin.nama} berhasil ditambahkan.`);
      setIsAddModalOpen(false);
    }
  };

  const handleOpenEdit = (admin: AdminStaff) => {
    setEditingAdmin(admin);
    setFormData({
      nip: '',
      nama: admin.nama,
      gelar: admin.gelar,
      jabatan: admin.jabatan,
      unit: admin.unit,
      tupoksiInput: admin.tupoksi.join('\n'),
      email: admin.email,
      telepon: admin.telepon,
      ruangKantor: admin.ruangKantor,
      status: admin.status,
      pendidikanTerakhir: admin.pendidikanTerakhir
    });
  };

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Nama', 'Gelar', 'Jabatan', 'Unit', 'Email', 'Telepon', 'Ruang Kantor', 'Status'];
    const rows = filteredList.map((a) => [
      `"${a.nama}"`,
      `"${a.gelar}"`,
      `"${a.jabatan}"`,
      `"${a.unit}"`,
      `"${a.email}"`,
      `"${a.telepon}"`,
      `"${a.ruangKantor}"`,
      `"${a.status}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daftar_Staf_Admin_Kimia_UB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003B66] to-[#001D33] rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#002B49]/40">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#D4AF37] font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Sumber Daya Manusia — Tenaga Kependidikan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Manajemen Data Admin & Tenaga Kependidikan
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Pangkalan data staf administrasi, pengelola sistem SIKMA, kearsipan persuratan, dan tata usaha Departemen Kimia FSTeM Universitas Brawijaya.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-export-admin"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            title="Ekspor CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            id="btn-print-admin"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            title="Cetak Halaman"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>Cetak</span>
          </button>
          {(currentRole === 'admin' || currentRole === 'super_admin') && (
            <button
              id="btn-tambah-admin"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#002B49] rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Staf Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Flash Message */}
      {flashMessage && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs font-medium ${
            flashMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{flashMessage.text}</span>
          </div>
          <button onClick={() => setFlashMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Staf Administrasi</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B49] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Departemen Kimia FSTeM UB</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Staf Status Aktif</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.aktif}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 mt-2">Siap melayani kebutuhan akademik</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Cuti / Tugas Khusus</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.cuti}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Izin / dinas luar / cuti berkala</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-admin"
              type="text"
              placeholder="Cari berdasarkan nama, NIP, jabatan, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002B49]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Status:</span>
            <select
              id="filter-status-admin"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49] bg-white"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Cuti">Cuti</option>
              <option value="Purna Tugas">Purna Tugas</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3 w-[50px] text-center">No</th>
                <th className="p-3 min-w-[240px]">Nama & Identitas NIP</th>
                <th className="p-3 min-w-[220px]">Jabatan & Unit Kerja</th>
                <th className="p-3 min-w-[200px]">Tupoksi Layanan</th>
                <th className="p-3 min-w-[180px]">Kontak & Kantor</th>
                <th className="p-3 text-center w-[90px]">Status</th>
                <th className="p-3 text-center w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada data staf admin yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedList.map((admin, idx) => (
                  <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-500 font-mono">{startIndex + idx + 1}</td>
                    <td className="p-3 align-top">
                      <div className="font-bold text-slate-900 text-xs">
                        {admin.nama}{admin.gelar ? `, ${admin.gelar}` : ''}
                      </div>
                      {admin.nip && (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          NIP. {admin.nip}
                        </div>
                      )}
                      {currentRole !== 'mahasiswa' && admin.pendidikanTerakhir && (
                        <div className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-1 font-medium border border-blue-100">
                          {admin.pendidikanTerakhir}
                        </div>
                      )}
                    </td>

                    <td className="p-3 align-top">
                      <div className="font-semibold text-slate-800 text-xs leading-snug">
                        {admin.jabatan}
                      </div>
                      {currentRole !== 'mahasiswa' && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[220px]">{admin.unit}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-3 align-top">
                      <ul className="space-y-0.5">
                        {admin.tupoksi.slice(0, 2).map((t, i) => (
                          <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1 leading-tight">
                            <span className="text-[#002B49] font-bold">•</span>
                            <span className="line-clamp-1">{t}</span>
                          </li>
                        ))}
                        {admin.tupoksi.length > 2 && (
                          <li className="text-[10px] text-slate-400 italic">
                            +{admin.tupoksi.length - 2} tupoksi lainnya...
                          </li>
                        )}
                      </ul>
                    </td>

                    <td className="p-3 align-top">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{admin.email}</span>
                        </div>
                        {currentRole !== 'mahasiswa' && (
                          <>
                            <div className="flex items-center gap-1 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{admin.telepon}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                              <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate max-w-[150px]">{admin.ruangKantor}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-center align-top">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          admin.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : admin.status === 'Cuti'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>

                    <td className="p-3 text-center align-top">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          id={`btn-detail-admin-${admin.id}`}
                          onClick={() => setDetailAdmin(admin)}
                          className="p-1.5 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                          title="Lihat Detail Lengkap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {(currentRole === 'admin' || currentRole === 'super_admin') && (
                          <>
                            <button
                              id={`btn-edit-admin-${admin.id}`}
                              onClick={() => handleOpenEdit(admin)}
                              className="p-1.5 text-amber-700 hover:bg-amber-100 rounded transition-colors"
                              title="Edit Data Admin"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-admin-${admin.id}`}
                              onClick={() => setDeleteConfirmId(admin.id)}
                              className="p-1.5 text-rose-700 hover:bg-rose-100 rounded transition-colors"
                              title="Hapus Data Admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls (Limit 10 baris per halaman) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-slate-200 bg-slate-50/70 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span>Menampilkan</span>
            <span className="font-bold text-slate-900">
              {totalFiltered === 0 ? 0 : startIndex + 1} - {endIndex}
            </span>
            <span>dari</span>
            <span className="font-bold text-slate-900">{totalFiltered}</span>
            <span>staf admin</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Baris per hal:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className={`p-1.5 rounded border ${
                safeCurrentPage === 1
                  ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                  : 'text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
              } transition-colors`}
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage === 1}
              className={`px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1 ${
                safeCurrentPage === 1
                  ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                  : 'text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
              } transition-colors`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - safeCurrentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | string)[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                    acc.push(`dots-${page}`);
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item) => {
                  if (typeof item === 'string') {
                    return (
                      <span key={item} className="px-1.5 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  const isActive = item === safeCurrentPage;
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`min-w-7 h-7 px-2 rounded text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#002B49] text-[#D4AF37] shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage === totalPages}
              className={`px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1 ${
                safeCurrentPage === totalPages
                  ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                  : 'text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                } transition-colors`}
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className={`p-1.5 rounded border ${
                safeCurrentPage === totalPages
                  ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                  : 'text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
              } transition-colors`}
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Admin */}
      {detailAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">Detail Staf Administrasi SIKMA</h3>
              </div>
              <button
                onClick={() => setDetailAdmin(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {detailAdmin.nama}, {detailAdmin.gelar}
                  </h4>
                  <p className="text-xs font-medium text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    {detailAdmin.jabatan}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    detailAdmin.status === 'Aktif'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {detailAdmin.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {currentRole !== 'mahasiswa' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="text-slate-400 font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Unit Kerja
                    </div>
                    <div className="text-slate-800 font-semibold mt-1">{detailAdmin.unit}</div>
                  </div>
                )}

                {currentRole !== 'mahasiswa' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" /> Ruang Kantor
                    </div>
                    <div className="text-slate-800 font-semibold mt-1">{detailAdmin.ruangKantor}</div>
                  </div>
                )}

                <div className={`p-3 bg-slate-50 rounded-lg border border-slate-200/80 ${currentRole === 'mahasiswa' ? 'sm:col-span-2' : ''}`}>
                  <div className="text-slate-400 font-medium flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email Resmi UB
                  </div>
                  <div className="text-slate-800 font-semibold mt-1">{detailAdmin.email}</div>
                </div>

                {currentRole !== 'mahasiswa' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Kontak WhatsApp / Telepon
                    </div>
                    <div className="text-slate-800 font-semibold mt-1">{detailAdmin.telepon}</div>
                  </div>
                )}
              </div>

              {currentRole !== 'mahasiswa' && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                  <div className="text-slate-400 font-medium flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-[#002B49]" /> Riwayat Pendidikan Terakhir
                  </div>
                  <div className="text-slate-800 font-semibold mt-1">{detailAdmin.pendidikanTerakhir}</div>
                </div>
              )}

              <div>
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#002B49]" />
                  <span>Tugas Pokok & Fungsi (Tupoksi):</span>
                </div>
                <ul className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {detailAdmin.tupoksi.map((t, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-[#002B49] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDetailAdmin(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Admin */}
      {(isAddModalOpen || editingAdmin) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">
                  {editingAdmin ? 'Edit Data Staf Administrasi' : 'Tambah Staf Administrasi Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingAdmin(null);
                }}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Slamet Widodo"
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gelar Akademik
                  </label>
                  <input
                    type="text"
                    value={formData.gelar}
                    onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                    placeholder="Contoh: S.AP., M.AP."
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Status Staf
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminStaff['status'] })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Purna Tugas">Purna Tugas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Jabatan / Posisi Tugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  placeholder="Contoh: Pengelola Administrasi Akademik & Ujian Skripsi"
                  className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Unit Kerja
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Contoh: Sub-Bagian Akademik & Administrasi Kimia"
                  className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Resmi UB
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@ub.ac.id"
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    No. Handphone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ruang Kantor
                  </label>
                  <input
                    type="text"
                    value={formData.ruangKantor}
                    onChange={(e) => setFormData({ ...formData, ruangKantor: e.target.value })}
                    placeholder="Gedung Kimia Lt. 1 R.102"
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pendidikan Terakhir
                  </label>
                  <input
                    type="text"
                    value={formData.pendidikanTerakhir}
                    onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                    placeholder="Contoh: S1 Ilmu Administrasi Negara"
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tupoksi Utama (Satu tugas per baris)
                </label>
                <textarea
                  rows={3}
                  value={formData.tupoksiInput}
                  onChange={(e) => setFormData({ ...formData, tupoksiInput: e.target.value })}
                  placeholder="Verifikasi berkas yudisium&#10;Pengelolaan pendaftaran ujian skripsi&#10;Pelayanan legalisir ijazah"
                  className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingAdmin(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] hover:bg-[#003B66] text-white rounded-md text-xs font-semibold"
                >
                  {editingAdmin ? 'Simpan Perubahan' : 'Tambah Staf Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Delete */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Konfirmasi Hapus Data Admin</h3>
            <p className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus staf admin ini dari pangkalan data? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteAdmin(deleteConfirmId);
                  showFlash('success', 'Data admin berhasil dihapus.');
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
