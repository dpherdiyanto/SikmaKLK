import React, { useState, useMemo, useEffect } from 'react';
import { PembimbingLapanganStaff, UserRole, PengajuanKLK } from '../types/sikma';
import {
  UserCheck,
  Search,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Building2,
  Briefcase,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap
} from 'lucide-react';

interface PembimbingLapanganManagementProps {
  currentRole: UserRole;
  pembimbingLapanganList: PembimbingLapanganStaff[];
  klkList?: PengajuanKLK[];
  onUpdatePembimbingLapangan?: (pbl: PembimbingLapanganStaff) => void;
  onDeletePembimbingLapangan?: (id: string) => void;
  onBulkDeletePembimbingLapangan?: (ids: string[]) => void;
}

export const PembimbingLapanganManagement: React.FC<PembimbingLapanganManagementProps> = ({
  currentRole,
  pembimbingLapanganList,
  klkList = [],
  onUpdatePembimbingLapangan,
  onDeletePembimbingLapangan,
  onBulkDeletePembimbingLapangan
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Pagination State (Limit 10 baris per halaman)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Modals state
  const [detailItem, setDetailItem] = useState<PembimbingLapanganStaff | null>(null);
  const [editingItem, setEditingItem] = useState<PembimbingLapanganStaff | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const canBulkDelete = currentRole === 'super_admin' || currentRole === 'admin';
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Flash message
  const [flashMessage, setFlashMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showFlash = (type: 'success' | 'error', text: string) => {
    setFlashMessage({ type, text });
    setTimeout(() => setFlashMessage(null), 4000);
  };

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    idMitra: '',
    nama: '',
    gelar: '',
    jabatan: 'Pembimbing Lapangan',
    namaMitra: '',
    email: '',
    telepon: '',
    status: 'Aktif' as PembimbingLapanganStaff['status'],
    alamatInstansi: ''
  });

  const handleOpenEdit = (item: PembimbingLapanganStaff) => {
    setEditingItem(item);
    setEditFormData({
      idMitra: item.idMitra || '',
      nama: item.nama || '',
      gelar: item.gelar || '',
      jabatan: item.jabatan || 'Pembimbing Lapangan',
      namaMitra: item.namaMitra || '',
      email: item.email || '',
      telepon: item.telepon || '',
      status: item.status || 'Aktif',
      alamatInstansi: item.alamatInstansi || ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editFormData.nama.trim()) {
      showFlash('error', 'Nama Pembimbing Lapangan wajib diisi!');
      return;
    }

    const updated: PembimbingLapanganStaff = {
      ...editingItem,
      idMitra: editFormData.idMitra.trim() || editingItem.idMitra,
      nama: editFormData.nama.trim(),
      gelar: editFormData.gelar.trim(),
      jabatan: editFormData.jabatan.trim(),
      namaMitra: editFormData.namaMitra.trim() || editingItem.namaMitra,
      email: editFormData.email.trim(),
      telepon: editFormData.telepon.trim(),
      status: editFormData.status,
      alamatInstansi: editFormData.alamatInstansi.trim()
    };

    if (onUpdatePembimbingLapangan) {
      onUpdatePembimbingLapangan(updated);
    }
    if (detailItem && detailItem.id === updated.id) {
      setDetailItem(updated);
    }
    setEditingItem(null);
    showFlash('success', `Data Pembimbing Lapangan "${updated.nama}" berhasil diperbarui!`);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    const target = pembimbingLapanganList.find((p) => p.id === deleteConfirmId);
    if (onDeletePembimbingLapangan) {
      onDeletePembimbingLapangan(deleteConfirmId);
    }
    setDeleteConfirmId(null);
    showFlash('success', `Data Pembimbing Lapangan "${target?.nama || 'Petugas'}" berhasil dihapus.`);
  };

  const safePembimbingList = useMemo(() => {
    if (!Array.isArray(pembimbingLapanganList)) return [];
    return pembimbingLapanganList.filter((item): item is PembimbingLapanganStaff => Boolean(item && typeof item === 'object'));
  }, [pembimbingLapanganList]);

  const activeDetailItem = useMemo(
    () => (detailItem ? safePembimbingList.find((p) => p.id === detailItem.id) ?? detailItem : null),
    [detailItem, safePembimbingList]
  );

  const safeKlkList = useMemo(() => {
    if (!Array.isArray(klkList)) return [];
    return klkList.filter((k): k is PengajuanKLK => Boolean(k && typeof k === 'object'));
  }, [klkList]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID/NIP Mitra', 'Nama Pembimbing', 'Gelar', 'Jabatan', 'Instansi/Mitra', 'Email', 'No Telepon', 'Status'];
    const rows = safePembimbingList.map((p) => [
      p.idMitra || '',
      p.nama || '',
      p.gelar || '',
      p.jabatan || '',
      p.namaMitra || '',
      p.email || '',
      p.telepon || '',
      p.status || 'Aktif'
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_pembimbing_lapangan_klk_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFlash('success', 'Data Pembimbing Lapangan berhasil diekspor ke CSV!');
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return safePembimbingList.filter((item) => {
      if (!item) return false;
      const q = (searchQuery || '').trim().toLowerCase();
      const matchSearch =
        !q ||
        (typeof item.nama === 'string' && item.nama.toLowerCase().includes(q)) ||
        (typeof item.namaMitra === 'string' && item.namaMitra.toLowerCase().includes(q)) ||
        (typeof item.email === 'string' && item.email.toLowerCase().includes(q)) ||
        (typeof item.telepon === 'string' && item.telepon.includes(searchQuery)) ||
        (typeof item.idMitra === 'string' && item.idMitra.toLowerCase().includes(q));

      const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
      return Boolean(matchSearch && matchStatus);
    });
  }, [safePembimbingList, searchQuery, filterStatus]);

  // Pagination calculations (Limit 10 baris per halaman)
  const totalFiltered = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedList = useMemo(() => {
    return filteredList.slice(startIndex, endIndex);
  }, [filteredList, startIndex, endIndex]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => safePembimbingList.some((p) => p.id === id)));
  }, [safePembimbingList]);

  const filteredIds = useMemo(() => filteredList.map((p) => p.id).filter(Boolean), [filteredList]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleConfirmBulkDelete = () => {
    if (!canBulkDelete || selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (onBulkDeletePembimbingLapangan) {
      onBulkDeletePembimbingLapangan(selectedIds);
    } else if (onDeletePembimbingLapangan) {
      selectedIds.forEach((id) => onDeletePembimbingLapangan(id));
    }
    setSelectedIds([]);
    setBulkDeleteConfirmOpen(false);
    showFlash('success', `${count} data pembimbing lapangan terpilih berhasil dihapus.`);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = safePembimbingList.length;
    const aktif = safePembimbingList.filter((p) => p.status === 'Aktif').length;
    const totalMitra = new Set(safePembimbingList.map((p) => p.namaMitra).filter(Boolean)).size;
    return { total, aktif, totalMitra };
  }, [safePembimbingList]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#002B49] text-white p-6 rounded-2xl shadow-lg border border-[#D4AF37]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Pangkalan Data Pembimbing Lapangan / Mentor Mitra Industri KLK</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Data Pembimbing Lapangan & Mentor Industri
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Departemen Kimia FSTeM Universitas Brawijaya • Monitoring Pembimbing Lapangan dari Perusahaan & Instansi Terhubung User Eksternal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Ekspor CSV</span>
          </button>
          <button
            id="btn-print-pembimbing-lapangan"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 cursor-pointer"
            title="Cetak Halaman"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Flash Message */}
      {flashMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-fadeIn ${
            flashMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{flashMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFlashMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-[11px] font-medium">Total Pembimbing Lapangan</div>
          <div className="text-xl font-bold text-[#002B49] mt-0.5">{stats.total} Personel</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Terdaftar via User Eksternal</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-[11px] font-medium">Instansi / Perusahaan Mitra</div>
          <div className="text-xl font-bold text-amber-700 mt-0.5">{stats.totalMitra} Mitra</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tempat KLK Mahasiswa</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-slate-500 text-[11px] font-medium">Status Akun Aktif</div>
          <div className="text-xl font-bold text-emerald-700 mt-0.5">{stats.aktif} Personel</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Siap Menilai & Verifikasi Presensi</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pembimbing, instansi, email, atau telepon..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label className="text-xs font-semibold text-slate-600">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {canBulkDelete && selectedIds.length > 0 && (
          <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-rose-900 font-semibold">
              <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>{selectedIds.length}</strong> data pembimbing lapangan terpilih untuk dihapus
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
              >
                Batal Pilih
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#002B49] text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Pembimbing</th>
                <th className="py-3 px-4">ID / Kode Mitra</th>
                <th className="py-3 px-4">Instansi / Perusahaan Tempat KLK</th>
                <th className="py-3 px-4">Kontak Resmi</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>Aksi</span>
                    {canBulkDelete && filteredIds.length > 0 && (
                      <label
                        className="inline-flex items-center gap-1 cursor-pointer select-none normal-case tracking-normal"
                        title="Pilih semua data untuk hapus massal"
                      >
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleSelectAllFiltered}
                          className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer accent-[#D4AF37]"
                        />
                        <span className="text-[10px] font-normal text-slate-200">Semua</span>
                      </label>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data pembimbing lapangan yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const safeNama = (typeof item.nama === 'string' && item.nama.trim()) ? item.nama.trim() : 'Pembimbing Lapangan';
                  const mhsAssigned = safeKlkList.filter(
                    (k) =>
                      typeof k.mentorIndustri === 'string' &&
                      k.mentorIndustri.toLowerCase().includes(safeNama.toLowerCase())
                  );

                  return (
                    <tr key={item.id || `${safeNama}-${item.idMitra}`} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                            {safeNama.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{safeNama}{item.gelar ? `, ${item.gelar}` : ''}</div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              <span>{item.jabatan || 'Pembimbing Lapangan'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                        {item.idMitra || 'IDP-8829101'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{item.namaMitra}</span>
                        </div>
                        {item.alamatInstansi && (
                          <div className="text-[10px] text-slate-500 truncate max-w-xs">{item.alamatInstansi}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{item.email}</span>
                        </div>
                        {item.telepon && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="font-mono text-[11px]">{item.telepon}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailItem(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canBulkDelete && (
                            <>
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Data"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <label
                                className="inline-flex items-center justify-center p-1 cursor-pointer"
                                title={`Pilih ${safeNama} untuk hapus massal`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(item.id)}
                                  onChange={() => toggleSelectRow(item.id)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer accent-rose-600"
                                />
                              </label>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              Menampilkan {startIndex + 1} hingga {endIndex} dari {totalFiltered} data pembimbing
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold text-slate-800">
                Halaman {safeCurrentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail View */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm border border-blue-200">
                  {((activeDetailItem.nama || 'PL').trim() || 'PL').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {activeDetailItem.nama || 'Pembimbing Lapangan'}{activeDetailItem.gelar ? `, ${activeDetailItem.gelar}` : ''}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{activeDetailItem.idMitra || 'IDP-8829101'}</p>
                </div>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Jabatan Fungsional:</span>
                  <strong className="text-slate-900 font-bold">{activeDetailItem.jabatan || '-'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Instansi / Perusahaan Tempat KLK:</span>
                  <strong className="text-amber-800 font-bold">{activeDetailItem.namaMitra || '-'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Email Resmi:</span>
                  <span className="font-mono text-slate-900">{activeDetailItem.email || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">No. WhatsApp / HP:</span>
                  <span className="font-mono text-slate-900">{activeDetailItem.telepon || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Akun:</span>
                  <span
                    className={`font-bold ${
                      activeDetailItem.status === 'Aktif'
                        ? 'text-emerald-700'
                        : activeDetailItem.status === 'Cuti'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {activeDetailItem.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-slate-800">
                <div className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Alamat Instansi / Lokasi KLK:</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{activeDetailItem.alamatInstansi || '-'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = activeDetailItem;
                  setDetailItem(null);
                  handleOpenEdit(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Data</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 bg-[#002B49] text-white rounded-lg text-xs font-bold hover:bg-[#003865] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit View */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#002B49] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>Edit Data Pembimbing Lapangan</span>
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="my-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editFormData.nama}
                  onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gelar</label>
                  <input
                    type="text"
                    value={editFormData.gelar}
                    onChange={(e) => setEditFormData({ ...editFormData, gelar: e.target.value })}
                    placeholder="misal: M.Si. / S.T."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ID / Kode Mitra *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.idMitra}
                    onChange={(e) => setEditFormData({ ...editFormData, idMitra: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instansi / Perusahaan Tempat KLK *</label>
                <input
                  type="text"
                  required
                  value={editFormData.namaMitra}
                  onChange={(e) => setEditFormData({ ...editFormData, namaMitra: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={editFormData.telepon}
                    onChange={(e) => setEditFormData({ ...editFormData, telepon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.jabatan}
                    onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status *</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as PembimbingLapanganStaff['status'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Instansi / Lokasi KLK</label>
                <textarea
                  rows={2}
                  value={editFormData.alamatInstansi}
                  onChange={(e) => setEditFormData({ ...editFormData, alamatInstansi: e.target.value })}
                  placeholder="Contoh: Jl. Industri Kimia No. 12, Surabaya"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] text-[#D4AF37] font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Konfirmasi Hapus</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data Pembimbing Lapangan ini?
              </p>
              <div className="flex justify-center gap-2 pt-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Hapus Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Massal Confirmation */}
      {canBulkDelete && bulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Konfirmasi Hapus Massal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>{selectedIds.length}</strong> data Pembimbing Lapangan yang dipilih? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setBulkDeleteConfirmOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBulkDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  Hapus Semua Terpilih
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
