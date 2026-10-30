import React, { useState, useMemo, useEffect } from 'react';
import { PLPStaff, UserRole, LabRiset } from '../types/sikma';
import {
  FlaskConical,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Microscope,
  ShieldCheck,
  Building2,
  Wrench,
  Award,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface PlpManagementProps {
  currentRole: UserRole;
  plpList: PLPStaff[];
  onAddPLP: (plp: PLPStaff) => void;
  onUpdatePLP: (plp: PLPStaff) => void;
  onDeletePLP: (id: string) => void;
}

export const PlpManagement: React.FC<PlpManagementProps> = ({
  currentRole,
  plpList,
  onAddPLP,
  onUpdatePLP,
  onDeletePLP
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLab, setFilterLab] = useState<string>('Semua');
  const [filterJenjang, setFilterJenjang] = useState<string>('Semua');

  // Pagination State (Limit 10 baris per halaman)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterLab, filterJenjang]);

  // Modals state
  const [detailPLP, setDetailPLP] = useState<PLPStaff | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPLP, setEditingPLP] = useState<PLPStaff | null>(null);
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

  // Initial Form State
  const initialFormState = {
    nip: '',
    nama: '',
    gelar: 'A.Md., S.Si.',
    jenjang: 'PLP Ahli Pertama' as PLPStaff['jenjang'],
    labUtama: 'Laboratorium Kimia Analitik & Instrumentasi' as LabRiset,
    spesialisasiInput: 'Spektrofotometer UV-Vis, AAS, HPLC',
    tupoksiUtama: 'Pemeliharaan dan operasional instrumen laboratorium serta verifikasi bebas tanggungan alat riset mahasiswa.',
    email: '',
    telepon: '',
    ruangLab: 'Gedung Kimia Lt. 2',
    status: 'Aktif' as PLPStaff['status'],
    verifikatorBebasLab: true
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filtered List
  const filteredList = useMemo(() => {
    return plpList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.labUtama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.spesialisasiInstrumen.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchLab = filterLab === 'Semua' || item.labUtama === filterLab;
      const matchJenjang = filterJenjang === 'Semua' || item.jenjang === filterJenjang;

      return matchSearch && matchLab && matchJenjang;
    });
  }, [plpList, searchQuery, filterLab, filterJenjang]);

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
    const total = plpList.length;
    const aktif = plpList.filter((p) => p.status === 'Aktif').length;
    const verifikator = plpList.filter((p) => p.verifikatorBebasLab).length;
    return { total, aktif, verifikator };
  }, [plpList]);

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      showFlash('error', 'Nama lengkap wajib diisi!');
      return;
    }

    const instrumenArray = formData.spesialisasiInput
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (editingPLP) {
      const updated: PLPStaff = {
        ...editingPLP,
        nip: '',
        nama: formData.nama,
        gelar: formData.gelar,
        jenjang: formData.jenjang,
        labUtama: formData.labUtama,
        spesialisasiInstrumen: instrumenArray.length > 0 ? instrumenArray : editingPLP.spesialisasiInstrumen,
        tupoksiUtama: formData.tupoksiUtama,
        email: formData.email,
        telepon: formData.telepon,
        ruangLab: formData.ruangLab,
        status: formData.status,
        verifikatorBebasLab: formData.verifikatorBebasLab
      };
      onUpdatePLP(updated);
      showFlash('success', `Data PLP ${updated.nama} berhasil diperbarui.`);
      setEditingPLP(null);
    } else {
      const newPLP: PLPStaff = {
        id: `plp-${Date.now()}`,
        nip: '',
        nama: formData.nama,
        gelar: formData.gelar,
        jenjang: formData.jenjang,
        labUtama: formData.labUtama,
        spesialisasiInstrumen:
          instrumenArray.length > 0 ? instrumenArray : ['Instrumen Analisis Kimia Standar'],
        tupoksiUtama: formData.tupoksiUtama,
        email: formData.email || `${formData.nama.toLowerCase().replace(/\s+/g, '.')}@ub.ac.id`,
        telepon: formData.telepon || '0812-0000-0000',
        ruangLab: formData.ruangLab,
        status: formData.status,
        verifikatorBebasLab: formData.verifikatorBebasLab
      };
      onAddPLP(newPLP);
      showFlash('success', `Tenaga PLP ${newPLP.nama} berhasil ditambahkan.`);
      setIsAddModalOpen(false);
    }
  };

  const handleOpenEdit = (plp: PLPStaff) => {
    setEditingPLP(plp);
    setFormData({
      nip: '',
      nama: plp.nama,
      gelar: plp.gelar,
      jenjang: plp.jenjang,
      labUtama: plp.labUtama as LabRiset,
      spesialisasiInput: plp.spesialisasiInstrumen.join(', '),
      tupoksiUtama: plp.tupoksiUtama,
      email: plp.email,
      telepon: plp.telepon,
      ruangLab: plp.ruangLab,
      status: plp.status,
      verifikatorBebasLab: plp.verifikatorBebasLab
    });
  };

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Nama', 'Gelar', 'Jenjang PLP', 'Laboratorium Utama', 'Spesialisasi Instrumen', 'Email', 'Telepon', 'Verifikator Bebas Lab', 'Status'];
    const rows = filteredList.map((p) => [
      `"${p.nama}"`,
      `"${p.gelar}"`,
      `"${p.jenjang}"`,
      `"${p.labUtama}"`,
      `"${p.spesialisasiInstrumen.join('; ')}"`,
      `"${p.email}"`,
      `"${p.telepon}"`,
      `"${p.verifikatorBebasLab ? 'Ya' : 'Tidak'}"`,
      `"${p.status}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daftar_PLP_Kimia_UB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#0b3c61] to-[#002B49] rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#002B49]/40">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#D4AF37] font-semibold uppercase tracking-wider mb-1">
            <Microscope className="w-4 h-4" />
            <span>Sumber Daya Manusia — Pranata Laboratorium Pendidikan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Data Manajemen PLP (Pranata Laboratorium Pendidikan)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Pangkalan data fungsional PLP / Laboran, spesialisasi pengoperasian instrumen canggih (AAS, HPLC, FTIR, GC-MS), penempatan laboratorium, dan verifikator bebas tanggungan alat skripsi.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-export-plp"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            title="Ekspor CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            id="btn-print-plp"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            title="Cetak Halaman"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>Cetak</span>
          </button>
          {(currentRole === 'admin' || currentRole === 'super_admin') && (
            <button
              id="btn-tambah-plp"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#002B49] rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tenaga PLP</span>
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
              <p className="text-xs text-slate-500 font-medium">Total Fungsional PLP</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B49] flex items-center justify-center">
              <Microscope className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Laboran riset & praktikum Kimia UB</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">PLP Aktif Bertugas</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.aktif}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 mt-2">Mendampingi riset & instrumen lab</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Verifikator Bebas Lab</p>
              <p className="text-2xl font-bold text-[#002B49] mt-1">{stats.verifikator}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#D4AF37] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Otoritas surat bebas pinjam alat</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/70">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-plp"
              type="text"
              placeholder="Cari nama PLP, NIP, instrumen (AAS, HPLC), lab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002B49]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600">Lab:</span>
            <select
              id="filter-lab-plp"
              value={filterLab}
              onChange={(e) => setFilterLab(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49] bg-white max-w-[200px]"
            >
              <option value="Semua">Semua Laboratorium</option>
              <option value="Laboratorium Kimia Analitik & Instrumentasi">Kimia Analitik</option>
              <option value="Laboratorium Kimia Organik & Bahan Alam">Kimia Organik</option>
              <option value="Laboratorium Kimia Anorganik & Material">Kimia Anorganik</option>
              <option value="Laboratorium Kimia Fisik & Elektrokimia">Kimia Fisik</option>
              <option value="Laboratorium Biokimia & Enzim">Biokimia</option>
              <option value="Laboratorium Kimia Lingkungan">Kimia Lingkungan</option>
            </select>

            <span className="text-xs text-slate-600">Jenjang:</span>
            <select
              id="filter-jenjang-plp"
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49] bg-white"
            >
              <option value="Semua">Semua Jenjang</option>
              <option value="PLP Terampil">PLP Terampil</option>
              <option value="PLP Mahir">PLP Mahir</option>
              <option value="PLP Penyelia">PLP Penyelia</option>
              <option value="PLP Ahli Pertama">PLP Ahli Pertama</option>
              <option value="PLP Ahli Muda">PLP Ahli Muda</option>
              <option value="PLP Ahli Madya">PLP Ahli Madya</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3 w-[50px] text-center">No</th>
                <th className="p-3 min-w-[240px]">Nama & Jenjang PLP</th>
                <th className="p-3 min-w-[230px]">Penempatan Laboratorium</th>
                <th className="p-3 min-w-[220px]">Spesialisasi Instrumen</th>
                <th className="p-3 min-w-[180px]">Kontak & Ruang</th>
                <th className="p-3 text-center w-[120px]">Verifikator Bebas Lab</th>
                <th className="p-3 text-center w-[110px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada data Pranata Laboratorium Pendidikan (PLP) yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedList.map((plp, idx) => (
                  <tr key={plp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-500 font-mono">{startIndex + idx + 1}</td>

                    <td className="p-3 align-top">
                      <div className="font-bold text-slate-900 text-xs">
                        {plp.nama}{plp.gelar ? `, ${plp.gelar}` : ''}
                      </div>
                      {currentRole !== 'mahasiswa' && (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-[#002B49] rounded text-[10px] font-bold mt-1">
                          {plp.jenjang}
                        </span>
                      )}
                    </td>

                    <td className="p-3 align-top">
                      <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5 text-[#002B49] shrink-0" />
                        <span className="leading-snug">{plp.labUtama}</span>
                      </div>
                      {currentRole !== 'mahasiswa' && plp.labTambahan && plp.labTambahan.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-1 pl-4">
                          Tambahan: {plp.labTambahan.join(', ')}
                        </div>
                      )}
                    </td>

                    <td className="p-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        {plp.spesialisasiInstrumen.map((inst, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 font-medium"
                          >
                            {inst}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3 align-top">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{plp.email}</span>
                        </div>
                        {currentRole !== 'mahasiswa' && (
                          <>
                            <div className="flex items-center gap-1 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{plp.telepon}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {plp.ruangLab}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-center align-top">
                      {plp.verifikatorBebasLab ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verifikator</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px]">
                          Non-Verifikator
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center align-top">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          id={`btn-detail-plp-${plp.id}`}
                          onClick={() => setDetailPLP(plp)}
                          className="p-1.5 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                          title="Lihat Detail Lengkap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {(currentRole === 'admin' || currentRole === 'super_admin') && (
                          <>
                            <button
                              id={`btn-edit-plp-${plp.id}`}
                              onClick={() => handleOpenEdit(plp)}
                              className="p-1.5 text-amber-700 hover:bg-amber-100 rounded transition-colors"
                              title="Edit Data PLP"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-plp-${plp.id}`}
                              onClick={() => setDeleteConfirmId(plp.id)}
                              className="p-1.5 text-rose-700 hover:bg-rose-100 rounded transition-colors"
                              title="Hapus Data PLP"
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
            <span>staf PLP</span>
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

      {/* Modal Detail PLP */}
      {detailPLP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">Profil Fungsional PLP Laboratorium Kimia</h3>
              </div>
              <button
                onClick={() => setDetailPLP(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {detailPLP.nama}, {detailPLP.gelar}
                  </h4>
                  {currentRole !== 'mahasiswa' && (
                    <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-[#002B49] rounded-md text-xs font-bold mt-1">
                      {detailPLP.jenjang}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      detailPLP.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {detailPLP.status}
                  </span>
                  {detailPLP.verifikatorBebasLab && (
                    <div className="text-[10px] text-emerald-700 font-bold mt-1">
                      ✓ Verifikator Bebas Lab
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-slate-400 font-medium flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5 text-[#002B49]" /> Laboratorium Utama
                  </div>
                  <div className="text-slate-800 font-semibold mt-1">{detailPLP.labUtama}</div>
                </div>

                {currentRole !== 'mahasiswa' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="text-slate-400 font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" /> Lokasi Ruang Lab
                    </div>
                    <div className="text-slate-800 font-semibold mt-1">{detailPLP.ruangLab}</div>
                  </div>
                )}

                <div className={`p-3 bg-slate-50 rounded-lg border border-slate-200/80 ${currentRole === 'mahasiswa' ? 'sm:col-span-2' : ''}`}>
                  <div className="text-slate-400 font-medium flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email Resmi UB
                  </div>
                  <div className="text-slate-800 font-semibold mt-1">{detailPLP.email}</div>
                </div>

                {currentRole !== 'mahasiswa' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Kontak Telepon / WA
                    </div>
                    <div className="text-slate-800 font-semibold mt-1">{detailPLP.telepon}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#002B49]" />
                  <span>Keahlian & Spesialisasi Instrumen Laboratorium:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {detailPLP.spesialisasiInstrumen.map((inst, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white rounded-md text-xs font-semibold text-slate-800 border border-slate-200 shadow-2xs"
                    >
                      🧪 {inst}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#002B49]" />
                  <span>Tugas Pokok & Tanggung Jawab Operasional:</span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {detailPLP.tupoksiUtama}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDetailPLP(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit PLP */}
      {(isAddModalOpen || editingPLP) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">
                  {editingPLP ? 'Edit Data Tenaga PLP' : 'Tambah Tenaga PLP Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPLP(null);
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
                    placeholder="Contoh: Bambang Sutejo"
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gelar
                  </label>
                  <input
                    type="text"
                    value={formData.gelar}
                    onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                    placeholder="Contoh: A.Md., S.Si."
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Jenjang PLP
                  </label>
                  <select
                    value={formData.jenjang}
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as PLPStaff['jenjang'] })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  >
                    <option value="PLP Terampil">PLP Terampil</option>
                    <option value="PLP Mahir">PLP Mahir</option>
                    <option value="PLP Penyelia">PLP Penyelia</option>
                    <option value="PLP Ahli Pertama">PLP Ahli Pertama</option>
                    <option value="PLP Ahli Muda">PLP Ahli Muda</option>
                    <option value="PLP Ahli Madya">PLP Ahli Madya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Penempatan Laboratorium Utama <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.labUtama}
                  onChange={(e) => setFormData({ ...formData, labUtama: e.target.value as LabRiset })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                >
                  <option value="Laboratorium Kimia Analitik & Instrumentasi">Laboratorium Kimia Analitik & Instrumentasi</option>
                  <option value="Laboratorium Kimia Organik & Bahan Alam">Laboratorium Kimia Organik & Bahan Alam</option>
                  <option value="Laboratorium Kimia Anorganik & Material">Laboratorium Kimia Anorganik & Material</option>
                  <option value="Laboratorium Kimia Fisik & Elektrokimia">Laboratorium Kimia Fisik & Elektrokimia</option>
                  <option value="Laboratorium Biokimia & Enzim">Laboratorium Biokimia & Enzim</option>
                  <option value="Laboratorium Kimia Lingkungan">Laboratorium Kimia Lingkungan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Spesialisasi Instrumen Laboratorium (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.spesialisasiInput}
                  onChange={(e) => setFormData({ ...formData, spesialisasiInput: e.target.value })}
                  placeholder="Contoh: AAS, HPLC, Spektrofotometer UV-Vis, GC-MS"
                  className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tupoksi & Tanggung Jawab Operasional
                </label>
                <textarea
                  rows={2}
                  value={formData.tupoksiUtama}
                  onChange={(e) => setFormData({ ...formData, tupoksiUtama: e.target.value })}
                  placeholder="Tuliskan tugas utama dan wewenang laboratorium..."
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
                    placeholder="nama.lab@ub.ac.id"
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
                    placeholder="0815-xxxx-xxxx"
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ruang Laboratorium / Kantor
                  </label>
                  <input
                    type="text"
                    value={formData.ruangLab}
                    onChange={(e) => setFormData({ ...formData, ruangLab: e.target.value })}
                    placeholder="Gedung Kimia Lt. 3 R.304"
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Status Staf
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PLPStaff['status'] })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B49]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Tugas Belajar">Tugas Belajar</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.verifikatorBebasLab}
                    onChange={(e) => setFormData({ ...formData, verifikatorBebasLab: e.target.checked })}
                    className="w-4 h-4 text-[#002B49] rounded border-slate-300 focus:ring-[#002B49]"
                  />
                  <span>Diberikan kewenangan sebagai Petugas Verifikator Bebas Laboratorium</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPLP(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] hover:bg-[#003B66] text-white rounded-md text-xs font-semibold"
                >
                  {editingPLP ? 'Simpan Perubahan' : 'Tambah Tenaga PLP'}
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
            <h3 className="font-bold text-sm text-slate-900">Konfirmasi Hapus Data PLP</h3>
            <p className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus tenaga PLP ini dari pangkalan data? Tindakan ini tidak dapat dibatalkan.
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
                  onDeletePLP(deleteConfirmId);
                  showFlash('success', 'Data PLP berhasil dihapus.');
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
