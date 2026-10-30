import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Mahasiswa, Dosen, UserRole, LabRiset, PengajuanKLK } from '../types/sikma';
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Clock,
  X,
  UserCheck,
  Award,
  BookOpen,
  FlaskConical,
  Filter,
  Download,
  AlertCircle,
  Building2,
  Layers,
  Calendar,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface MahasiswaManagementProps {
  currentRole: UserRole;
  mahasiswaList: Mahasiswa[];
  onAddMahasiswa: (mhs: Mahasiswa) => void;
  onUpdateMahasiswa: (mhs: Mahasiswa) => void;
  onDeleteMahasiswa: (id: string) => void;
  dosenList?: Dosen[];
  klkList?: PengajuanKLK[];
}

export const MahasiswaManagement: React.FC<MahasiswaManagementProps> = ({
  currentRole,
  mahasiswaList,
  onAddMahasiswa,
  onUpdateMahasiswa,
  onDeleteMahasiswa,
  dosenList = [],
  klkList = []
}) => {
  const canManage = currentRole === 'super_admin' || currentRole === 'admin';

  // Helper pencarian data KLK mahasiswa secara sinkron
  const getMahasiswaKlk = (m: Mahasiswa): PengajuanKLK | undefined => {
    if (!klkList || klkList.length === 0) return undefined;
    const cleanNim = (m.nim || '').replace(/\D/g, '');
    const cleanNama = (m.nama || '').trim().toLowerCase();
    return klkList.find(
      (k) =>
        k.mahasiswaId === m.id ||
        (cleanNim && (k.nim || '').replace(/\D/g, '') === cleanNim) ||
        (cleanNama && (k.mahasiswaNama || '').trim().toLowerCase() === cleanNama)
    );
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState<string>('Semua');
  const [filterSemester, setFilterSemester] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterTahapSkripsi, setFilterTahapSkripsi] = useState<string>('Semua');
  const [filterKlkStatus, setFilterKlkStatus] = useState<string>('Semua');

  // Pagination State (Limit 10 baris per halaman)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterAngkatan, filterSemester, filterStatus, filterTahapSkripsi, filterKlkStatus]);

  // Modals
  const [detailMhs, setDetailMhs] = useState<Mahasiswa | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMhs, setEditingMhs] = useState<Mahasiswa | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isRekapModalOpen, setIsRekapModalOpen] = useState(false);

  // Flash Notice
  const [flashMessage, setFlashMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showFlash = (type: 'success' | 'error', text: string) => {
    setFlashMessage({ type, text });
    setTimeout(() => setFlashMessage(null), 4000);
  };

  // Initial Form State
  const initialFormState: {
    nim: string;
    nama: string;
    angkatan: string;
    programStudi: string;
    dosenPANama: string;
    status: Mahasiswa['status'];
    semester: number;
    ipk: number;
    totalSks: number;
    tahapSkripsi: Mahasiswa['tahapSkripsi'];
    judulSkripsi: string;
    labPenelitian: LabRiset;
  } = {
    nim: '',
    nama: '',
    angkatan: '2023',
    programStudi: 'S1 Kimia - FMIPA Universitas Brawijaya',
    dosenPANama: dosenList[0]?.nama || 'Dr. Dra. Hermin Sulistyarti, M.Si',
    status: 'Aktif',
    semester: 3,
    ipk: 3.65,
    totalSks: 72,
    tahapSkripsi: 'Belum Mengambil',
    judulSkripsi: '',
    labPenelitian: 'Laboratorium Kimia Analitik & Instrumentasi'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Distinct Angkatan from list
  const angkatanOptions = useMemo(() => {
    const list = Array.from(new Set(mahasiswaList.map((m) => m.angkatan))).sort();
    return list;
  }, [mahasiswaList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return mahasiswaList.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.nama.toLowerCase().includes(q) ||
        m.nim.toLowerCase().includes(q) ||
        (m.judulSkripsi && m.judulSkripsi.toLowerCase().includes(q)) ||
        (m.labPenelitian && m.labPenelitian.toLowerCase().includes(q)) ||
        m.dosenPANama.toLowerCase().includes(q);

      const matchAngkatan = filterAngkatan === 'Semua' || m.angkatan === filterAngkatan;
      const matchSemester =
        filterSemester === 'Semua' || m.semester.toString() === filterSemester;
      const matchStatus = filterStatus === 'Semua' || m.status === filterStatus;
      const matchTahap =
        filterTahapSkripsi === 'Semua' || m.tahapSkripsi === filterTahapSkripsi;

      const mhsKlk = getMahasiswaKlk(m);
      const matchKlk =
        filterKlkStatus === 'Semua' ||
        (filterKlkStatus === 'Belum Ada KLK' && !mhsKlk) ||
        (filterKlkStatus === 'Ada KLK' && !!mhsKlk) ||
        (mhsKlk && mhsKlk.status === filterKlkStatus);

      return matchSearch && matchAngkatan && matchSemester && matchStatus && matchTahap && matchKlk;
    });
  }, [
    mahasiswaList,
    searchQuery,
    filterAngkatan,
    filterSemester,
    filterStatus,
    filterTahapSkripsi,
    filterKlkStatus,
    klkList
  ]);

  // Pagination Calculation (Limit 10 baris per halaman)
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
    const total = mahasiswaList.length;
    const aktif = mahasiswaList.filter((m) => m.status === 'Aktif').length;
    const cuti = mahasiswaList.filter((m) => m.status === 'Cuti').length;
    const lulus = mahasiswaList.filter((m) => m.status === 'Lulus').length;
    const terdaftarKlk = mahasiswaList.filter((m) => !!getMahasiswaKlk(m)).length;
    const avgIpk =
      total > 0
        ? (mahasiswaList.reduce((acc, m) => acc + (m.ipk || 0), 0) / total).toFixed(2)
        : '0.00';
    const sedangSkripsi = mahasiswaList.filter(
      (m) =>
        m.tahapSkripsi !== 'Belum Mengambil' &&
        m.tahapSkripsi !== 'Selesai / Lulus'
    ).length;

    return { total, aktif, cuti, lulus, terdaftarKlk, avgIpk, sedangSkripsi };
  }, [mahasiswaList, klkList]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (m: Mahasiswa) => {
    setEditingMhs(m);
    setFormData({
      nim: m.nim,
      nama: m.nama,
      angkatan: m.angkatan,
      programStudi: m.programStudi,
      dosenPANama: m.dosenPANama,
      status: m.status,
      semester: m.semester,
      ipk: m.ipk,
      totalSks: m.totalSks,
      tahapSkripsi: m.tahapSkripsi,
      judulSkripsi: m.judulSkripsi || '',
      labPenelitian:
        m.labPenelitian || 'Laboratorium Kimia Analitik & Instrumentasi'
    });
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.nim.trim()) {
      showFlash('error', 'Nama mahasiswa dan NIM wajib diisi!');
      return;
    }

    if (editingMhs) {
      const updated: Mahasiswa = {
        ...editingMhs,
        ...formData,
        nim: formData.nim.trim(),
        nama: formData.nama.trim(),
        judulSkripsi: formData.judulSkripsi.trim() || undefined
      };
      onUpdateMahasiswa(updated);
      showFlash('success', `Data mahasiswa ${updated.nama} berhasil diperbarui.`);
      setEditingMhs(null);
    } else {
      const newMhs: Mahasiswa = {
        id: `mhs-${Date.now()}`,
        ...formData,
        nim: formData.nim.trim(),
        nama: formData.nama.trim(),
        dosenPAId: 'dos-1',
        judulSkripsi: formData.judulSkripsi.trim() || undefined
      };
      onAddMahasiswa(newMhs);
      showFlash('success', `Mahasiswa baru ${newMhs.nama} (${newMhs.nim}) berhasil ditambahkan.`);
      setIsAddModalOpen(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    const target = mahasiswaList.find((m) => m.id === deleteConfirmId);
    onDeleteMahasiswa(deleteConfirmId);
    showFlash('success', `Data mahasiswa ${target ? target.nama : ''} berhasil dihapus dari sistem.`);
    setDeleteConfirmId(null);
  };

  // Download Rekap Mahasiswa (Excel .xlsx)
  const handleDownloadRekapExcel = () => {
    const tanggalCetak = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const rows: (string | number)[][] = [
      ['KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI'],
      ['UNIVERSITAS BRAWIJAYA - FAKULTAS MIPA'],
      ['DEPARTEMEN KIMIA'],
      ['REKAPITULASI DATA POKOK MAHASISWA JURUSAN KIMIA'],
      [`Tanggal Unduh: ${tanggalCetak} | Total Data: ${filteredList.length} Mahasiswa`],
      []
    ];

    rows.push([
      'No',
      'NIM',
      'Nama Mahasiswa',
      'Angkatan',
      'Program Studi',
      'Semester',
      'Status Akademik',
      'IPK Kumulatif',
      'Total SKS',
      'Dosen Pembimbing Akademik (PA)',
      'Tahap Skripsi',
      'Laboratorium Penelitian',
      'Judul Skripsi / Riset',
      'Status KLK',
      'Mitra KLK'
    ]);

    filteredList.forEach((m, idx) => {
      const klk = getMahasiswaKlk(m);
      rows.push([
        idx + 1,
        m.nim,
        m.nama,
        m.angkatan,
        m.programStudi,
        m.semester,
        m.status,
        m.ipk,
        m.totalSks,
        m.dosenPANama,
        m.tahapSkripsi,
        m.labPenelitian || '-',
        m.judulSkripsi || '-',
        klk ? klk.status : 'Belum KLK',
        klk ? klk.namaMitra : '-'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Auto-fit column widths
    const colWidths = [
      { wch: 5 },   // No
      { wch: 18 },  // NIM
      { wch: 30 },  // Nama
      { wch: 10 },  // Angkatan
      { wch: 32 },  // Prodi
      { wch: 10 },  // Semester
      { wch: 14 },  // Status
      { wch: 14 },  // IPK
      { wch: 12 },  // Total SKS
      { wch: 34 },  // Dosen PA
      { wch: 24 },  // Tahap Skripsi
      { wch: 38 },  // Lab Riset
      { wch: 55 },  // Judul Skripsi
      { wch: 18 },  // Status KLK
      { wch: 32 }   // Mitra KLK
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap_Mahasiswa');
    const filename = `Rekap_Data_Mahasiswa_Kimia_UB_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    showFlash('success', `Rekap Mahasiswa (${filename}) berhasil diunduh dalam format Excel!`);
  };

  // Download Rekap CSV format
  const handleDownloadRekapCSV = () => {
    const headers = [
      'No',
      'NIM',
      'Nama Lengkap',
      'Angkatan',
      'Program Studi',
      'Semester',
      'Status',
      'IPK',
      'Total SKS',
      'Dosen PA',
      'Tahap Skripsi',
      'Lab Riset',
      'Judul Skripsi',
      'Status KLK',
      'Mitra KLK'
    ];

    const csvContent = [
      headers.join(';'),
      ...filteredList.map((m, idx) => {
        const klk = getMahasiswaKlk(m);
        return [
          idx + 1,
          `"${m.nim}"`,
          `"${m.nama}"`,
          `"${m.angkatan}"`,
          `"${m.programStudi}"`,
          m.semester,
          `"${m.status}"`,
          m.ipk,
          m.totalSks,
          `"${m.dosenPANama}"`,
          `"${m.tahapSkripsi}"`,
          `"${m.labPenelitian || '-'}"`,
          `"${(m.judulSkripsi || '-').replace(/"/g, '""')}"`,
          `"${klk ? klk.status : 'Belum KLK'}"`,
          `"${klk ? (klk.namaMitra || '-').replace(/"/g, '""') : '-'}"`
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Rekap_Data_Mahasiswa_Kimia_UB_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showFlash('success', 'Rekap Mahasiswa berhasil diunduh dalam format CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003B66] to-[#001D33] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#002B49]/40">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#D4AF37] font-semibold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Sumber Daya Manusia — Mahasiswa Departemen Kimia</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Data Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pangkalan data seluruh mahasiswa aktif, cuti, dan lulus Departemen Kimia FSTeM Universitas Brawijaya. Pantau kemajuan studi, IPK kumulatif, Dosen PA, dan progres tugas akhir.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Button Rekap Mahasiswa */}
          <button
            type="button"
            id="btn-rekap-mahasiswa"
            onClick={handleDownloadRekapExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#002B49] rounded-xl text-xs font-black shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="Download Rekapitulasi Data Mahasiswa (.xlsx)"
          >
            <Download className="w-4 h-4 text-[#002B49]" />
            <span>Rekap Mahasiswa</span>
          </button>

          <button
            type="button"
            id="btn-rekap-preview"
            onClick={() => setIsRekapModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 cursor-pointer"
            title="Buka Pratinjau & Opsi Rekap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Pratinjau Rekap</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 cursor-pointer"
            title="Cetak Halaman"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Cetak</span>
          </button>

          {canManage && (
            <button
              type="button"
              id="btn-tambah-mahasiswa"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mahasiswa</span>
            </button>
          )}
        </div>
      </div>

      {/* Flash Message */}
      {flashMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs ${
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

      {/* Summary Stats Cards */}
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Mahasiswa</div>
          <div className="text-xl font-black text-[#002B49] mt-0.5">{stats.total} Orang</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Departemen Kimia</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700">Status Aktif</div>
          <div className="text-xl font-black text-emerald-600 mt-0.5">{stats.aktif} Mahasiswa</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Kuliah & Riset</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700">Status Cuti</div>
          <div className="text-xl font-black text-amber-600 mt-0.5">{stats.cuti} Mahasiswa</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Izin Akademik</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700">Telah Lulus</div>
          <div className="text-xl font-black text-blue-600 mt-0.5">{stats.lulus} Alumni</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Gelar S.Si.</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700">Rata-rata IPK</div>
          <div className="text-xl font-black text-purple-700 mt-0.5">{stats.avgIpk}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Skala 4.00</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-indigo-700">Sedang Skripsi</div>
          <div className="text-xl font-black text-indigo-700 mt-0.5">{stats.sedangSkripsi} Mhs</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tugas Akhir / Lab</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-teal-700">Terdaftar KLK</div>
          <div className="text-xl font-black text-teal-700 mt-0.5">{stats.terdaftarKlk} Mhs</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Kegiatan Luar Kampus</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mahasiswa berdasarkan Nama, NIM, judul skripsi, lab, atau Dosen PA..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49]"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Angkatan */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Angkatan:</span>
              <select
                value={filterAngkatan}
                onChange={(e) => setFilterAngkatan(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49] bg-white font-medium"
              >
                <option value="Semua">Semua Angkatan</option>
                {angkatanOptions.map((ang) => (
                  <option key={ang} value={ang}>
                    Angkatan {ang}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Semester */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Semester:</span>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49] bg-white font-medium"
              >
                <option value="Semua">Semua Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49] bg-white font-medium"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Lulus">Lulus</option>
              </select>
            </div>

            {/* Filter Tahap Skripsi */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Skripsi:</span>
              <select
                value={filterTahapSkripsi}
                onChange={(e) => setFilterTahapSkripsi(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49] bg-white font-medium"
              >
                <option value="Semua">Semua Tahap Skripsi</option>
                <option value="Belum Mengambil">Belum Mengambil</option>
                <option value="Seminar Proposal">Seminar Proposal</option>
                <option value="Penelitian Laboratorium">Penelitian Lab</option>
                <option value="Seminar Hasil">Seminar Hasil</option>
                <option value="Ujian Skripsi">Ujian Skripsi</option>
                <option value="Selesai / Lulus">Selesai / Lulus</option>
              </select>
            </div>

            {/* Filter Status KLK */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">KLK:</span>
              <select
                value={filterKlkStatus}
                onChange={(e) => setFilterKlkStatus(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#002B49] bg-white font-medium"
              >
                <option value="Semua">Semua KLK</option>
                <option value="Ada KLK">Terdaftar KLK</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai & Dinilai">Selesai & Dinilai</option>
                <option value="Belum Ada KLK">Belum Ada KLK</option>
              </select>
            </div>

            {(searchQuery ||
              filterAngkatan !== 'Semua' ||
              filterSemester !== 'Semua' ||
              filterStatus !== 'Semua' ||
              filterTahapSkripsi !== 'Semua' ||
              filterKlkStatus !== 'Semua') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterAngkatan('Semua');
                  setFilterSemester('Semua');
                  setFilterStatus('Semua');
                  setFilterTahapSkripsi('Semua');
                  setFilterKlkStatus('Semua');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 hover:bg-rose-50 rounded transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <div>
            Menampilkan <strong className="text-slate-800">{filteredList.length}</strong> dari{' '}
            <strong className="text-slate-800">{mahasiswaList.length}</strong> mahasiswa terdaftar dalam sistem.
          </div>
          <div className="text-slate-400">
            Akses Hak Istimewa: <span className="font-bold text-[#002B49]">{currentRole.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#002B49] text-white font-bold border-b border-slate-200 text-[11px]">
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 min-w-[200px]">Mahasiswa & NIM</th>
                <th className="p-3 min-w-[120px]">Angkatan & Smt</th>
                <th className="p-3 min-w-[190px]">Dosen Pembimbing Akademik</th>
                <th className="p-3 text-center min-w-[100px]">IPK / SKS</th>
                <th className="p-3 min-w-[220px]">Tahap Skripsi & Laboratorium</th>
                <th className="p-3 text-center min-w-[130px]">Status KLK</th>
                <th className="p-3 text-center min-w-[90px]">Status</th>
                <th className="p-3 text-center min-w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedList.map((m, idx) => {
                const klk = getMahasiswaKlk(m);
                return (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-center text-slate-500 font-bold">{startIndex + idx + 1}</td>

                  {/* Mahasiswa Info */}
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#002B49] text-[#D4AF37] font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                        {m.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate" title={m.nama}>
                          {m.nama}
                        </div>
                        <div className="text-[11px] font-mono font-medium text-slate-500">
                          {m.nim}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {m.programStudi}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Angkatan & Semester */}
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#002B49] font-bold rounded border border-blue-200 text-[10px]">
                      Angkatan {m.angkatan}
                    </span>
                    <div className="text-slate-600 font-medium text-[11px] mt-1">
                      Semester {m.semester}
                    </div>
                  </td>

                  {/* Dosen PA */}
                  <td className="p-3">
                    <div className="font-semibold text-slate-800 text-xs line-clamp-1" title={m.dosenPANama}>
                      {m.dosenPANama}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Dosen Pembimbing Akademik
                    </div>
                  </td>

                  {/* IPK / SKS */}
                  <td className="p-3 text-center">
                    <div className="font-mono font-black text-xs text-[#002B49]">
                      {m.ipk.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {m.totalSks} SKS
                    </div>
                  </td>

                  {/* Tahap Skripsi */}
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.tahapSkripsi === 'Belum Mengambil'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : m.tahapSkripsi === 'Selesai / Lulus'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {m.tahapSkripsi}
                    </span>
                    {m.judulSkripsi && (
                      <div className="text-[10px] text-slate-600 line-clamp-1 mt-1 font-medium italic" title={m.judulSkripsi}>
                        "{m.judulSkripsi}"
                      </div>
                    )}
                    {m.labPenelitian && (
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1">
                        <FlaskConical className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{m.labPenelitian}</span>
                      </div>
                    )}
                  </td>

                  {/* Status KLK (Sinkron dengan KLK) */}
                  <td className="p-3 text-center">
                    {!klk ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Belum KLK
                      </span>
                    ) : klk.status === 'Disetujui' ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Disetujui</span>
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px] mx-auto font-medium" title={klk.namaMitra}>
                          {klk.namaMitra}
                        </div>
                      </div>
                    ) : klk.status === 'Diproses' ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Diproses</span>
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px] mx-auto font-medium" title={klk.namaMitra}>
                          {klk.namaMitra}
                        </div>
                      </div>
                    ) : klk.status === 'Selesai & Dinilai' ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          <Award className="w-3 h-3 text-blue-600" />
                          <span>Selesai ({klk.nilaiAkhirHuruf || 'A'})</span>
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px] mx-auto font-medium" title={klk.namaMitra}>
                          {klk.namaMitra}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        {klk.status}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        m.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : m.status === 'Cuti'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailMhs(m)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#002B49] rounded-lg border border-blue-200 transition-colors cursor-pointer"
                        title="Lihat Detail Profil Mahasiswa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                            title="Edit Data Mahasiswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(m.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                            title="Hapus Mahasiswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-500">
                    <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <div className="font-bold text-slate-700 text-sm">
                      Tidak ada data mahasiswa ditemukan
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba sesuaikan kata kunci pencarian atau ubah filter angkatan / status.
                    </p>
                  </td>
                </tr>
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
            <span>mahasiswa</span>
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

      {/* ========================================================================= */}
      {/* MODAL DETAIL MAHASISWA                                                    */}
      {/* ========================================================================= */}
      {detailMhs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#002B49] flex items-center justify-center font-black text-sm shrink-0">
                  {detailMhs.nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold">{detailMhs.nama}</h3>
                  <p className="text-xs text-slate-300 font-mono">NIM: {detailMhs.nim} &bull; Angkatan {detailMhs.angkatan}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailMhs(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Status Akademik:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      detailMhs.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : detailMhs.status === 'Cuti'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {detailMhs.status}
                  </span>
                </div>
                <div className="text-slate-600">
                  Semester: <strong className="text-slate-900 font-bold">{detailMhs.semester}</strong>
                </div>
              </div>

              {/* Data Akademik Pokok */}
              <div>
                <h4 className="font-bold text-[#002B49] text-xs uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                  <span>I. Data Akademik Mahasiswa</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Program Studi</span>
                    <strong className="text-slate-900 font-semibold">{detailMhs.programStudi}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dosen Pembimbing Akademik (PA)</span>
                    <strong className="text-slate-900 font-semibold">{detailMhs.dosenPANama}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Indeks Prestasi Kumulatif (IPK)</span>
                    <strong className="text-slate-900 font-mono text-sm font-black text-[#002B49]">
                      {detailMhs.ipk.toFixed(2)}
                    </strong>
                    <span className="text-slate-500 text-[11px]"> / 4.00</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total SKS Tempuh</span>
                    <strong className="text-slate-900 font-mono text-sm font-black">
                      {detailMhs.totalSks} SKS
                    </strong>
                  </div>
                </div>
              </div>

              {/* Data Tugas Akhir / Skripsi */}
              <div>
                <h4 className="font-bold text-[#002B49] text-xs uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span>II. Progres Tugas Akhir / Skripsi</span>
                </h4>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Tahap Skripsi Saat Ini</span>
                    <span className="inline-block mt-1 px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 text-xs">
                      {detailMhs.tahapSkripsi}
                    </span>
                  </div>
                  {detailMhs.judulSkripsi && (
                    <div>
                      <span className="text-slate-500 block">Judul Usulan Skripsi</span>
                      <p className="text-slate-900 font-medium mt-0.5 italic">
                        "{detailMhs.judulSkripsi}"
                      </p>
                    </div>
                  )}
                  {detailMhs.labPenelitian && (
                    <div>
                      <span className="text-slate-500 block">Laboratorium Riset</span>
                      <strong className="text-slate-900 font-semibold flex items-center gap-1.5 mt-0.5">
                        <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                        <span>{detailMhs.labPenelitian}</span>
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Kegiatan Luar Kampus (KLK) */}
              {(() => {
                const klkData = getMahasiswaKlk(detailMhs);
                return (
                  <div>
                    <h4 className="font-bold text-[#002B49] text-xs uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#D4AF37]" />
                        <span>III. Status Kegiatan Luar Kampus (KLK)</span>
                      </span>
                      {klkData ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          klkData.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : klkData.status === 'Diproses'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : klkData.status === 'Selesai & Dinilai'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {klkData.status}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Belum Terdaftar
                        </span>
                      )}
                    </h4>

                    {klkData ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-500 block">Mitra Instansi / Industri</span>
                          <strong className="text-slate-900 font-bold block">{klkData.namaMitra}</strong>
                          <span className="text-[10px] text-slate-500">{klkData.alamatMitra}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Skema & SKS Diakui</span>
                          <strong className="text-slate-900 font-semibold block">{klkData.skema}</strong>
                          <span className="text-xs font-bold text-[#002B49]">{klkData.sksDiakui} SKS Konversi</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Dosen Pembimbing KLK</span>
                          <strong className="text-slate-900 font-semibold block">{klkData.dosenPembimbingKLK || '-'}</strong>
                          <span className="text-[10px] text-slate-500">Mentor Lapangan: {klkData.mentorIndustri || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Periode & Nomor Surat Tugas</span>
                          <strong className="text-slate-900 font-medium block">
                            {klkData.tanggalMulai} s.d. {klkData.tanggalSelesai}
                          </strong>
                          <span className="text-[10px] font-mono text-slate-600">
                            {klkData.nomorSuratTugas || 'Surat tugas belum terbit'}
                          </span>
                        </div>
                        {klkData.nilaiAkhirHuruf && (
                          <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="font-semibold text-slate-700">Hasil Evaluasi / Nilai Akhir:</span>
                            <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold rounded text-xs shadow-xs">
                              Nilai {klkData.nilaiAkhirHuruf} (Dosen: {klkData.nilaiDosen || '-'}, Industri: {klkData.nilaiIndustri || '-'})
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                        Mahasiswa ini belum mengajukan pendaftaran Kuliah Lapangan Kimia (KLK).
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Pangkalan Data SIM-SIKMA Kimia FSTeM UB
              </span>
              <button
                type="button"
                onClick={() => setDetailMhs(null)}
                className="px-4 py-1.5 bg-[#002B49] text-white font-bold rounded-lg text-xs hover:bg-[#003865] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PRATINJAU & OPSI REKAP MAHASISWA                                     */}
      {/* ========================================================================= */}
      {isRekapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#002B49] flex items-center justify-center font-bold shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Pratinjau Rekapitulasi Data Mahasiswa</h3>
                  <p className="text-xs text-slate-300">
                    Departemen Kimia FSTeM UB &bull; Unduh data rekapitulasi lengkap dalam format Excel atau CSV
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRekapModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50/80 rounded-xl border border-blue-200 text-slate-800">
                <div>
                  <div className="font-bold text-[#002B49] text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{filteredList.length} Mahasiswa Terfilter untuk Rekap</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    File memuat identitas NIM, nama, angkatan, semester, IPK kumulatif, total SKS, Dosen PA, serta tahap skripsi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadRekapExcel}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadRekapCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-semibold border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[45vh] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10 text-[11px] text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-10">No</th>
                      <th className="p-2.5">NIM</th>
                      <th className="p-2.5">Nama Mahasiswa</th>
                      <th className="p-2.5">Angkatan</th>
                      <th className="p-2.5 text-center">Semester</th>
                      <th className="p-2.5 text-center">IPK</th>
                      <th className="p-2.5 text-center">SKS</th>
                      <th className="p-2.5">Dosen PA</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredList.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-2 font-mono font-semibold text-slate-800">{m.nim}</td>
                        <td className="p-2 font-bold text-slate-900">{m.nama}</td>
                        <td className="p-2">{m.angkatan}</td>
                        <td className="p-2 text-center">{m.semester}</td>
                        <td className="p-2 text-center font-mono font-bold text-[#002B49]">{m.ipk.toFixed(2)}</td>
                        <td className="p-2 text-center">{m.totalSks}</td>
                        <td className="p-2 text-slate-700">{m.dosenPANama}</td>
                        <td className="p-2 text-center font-bold text-[10px]">{m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Pangkalan Data Mahasiswa &bull; SIKMA Kimia Universitas Brawijaya
              </span>
              <button
                type="button"
                onClick={() => setIsRekapModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL TAMBAH / EDIT MAHASISWA                                              */}
      {/* ========================================================================= */}
      {(isAddModalOpen || editingMhs) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#002B49] flex items-center justify-center font-bold shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingMhs ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Departemen Kimia FSTeM Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMhs(null);
                }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Induk Mahasiswa (NIM) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Contoh: 215090200111012"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama lengkap beserta gelar jika ada"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tahun Angkatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.angkatan}
                    onChange={(e) => setFormData({ ...formData, angkatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white font-medium"
                  >
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Semester Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Akademik <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Mahasiswa['status'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dosen Pembimbing Akademik (PA) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.dosenPANama}
                    onChange={(e) => setFormData({ ...formData, dosenPANama: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white font-medium"
                  >
                    {dosenList.map((d) => (
                      <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                        {d.nama}, {d.gelar} ({d.bidang})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program Studi</label>
                  <input
                    type="text"
                    value={formData.programStudi}
                    onChange={(e) => setFormData({ ...formData, programStudi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    IPK Kumulatif (Skala 4.00)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    max="4.00"
                    value={formData.ipk}
                    onChange={(e) => setFormData({ ...formData, ipk: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Total SKS yang Telah Ditempuh
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={160}
                    value={formData.totalSks}
                    onChange={(e) => setFormData({ ...formData, totalSks: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              {/* Bagian Tugas Akhir */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#002B49]" />
                  <span>Informasi Skripsi / Tugas Akhir (Opsional)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tahap Skripsi</label>
                    <select
                      value={formData.tahapSkripsi}
                      onChange={(e) => setFormData({ ...formData, tahapSkripsi: e.target.value as Mahasiswa['tahapSkripsi'] })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="Belum Mengambil">Belum Mengambil</option>
                      <option value="Pengajuan Judul">Pengajuan Judul</option>
                      <option value="Seminar Proposal">Seminar Proposal</option>
                      <option value="Penelitian Laboratorium">Penelitian Laboratorium</option>
                      <option value="Seminar Hasil">Seminar Hasil</option>
                      <option value="Ujian Skripsi">Ujian Skripsi</option>
                      <option value="Revisi & Bebas Lab">Revisi & Bebas Lab</option>
                      <option value="Selesai / Lulus">Selesai / Lulus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Laboratorium Riset</label>
                    <select
                      value={formData.labPenelitian}
                      onChange={(e) => setFormData({ ...formData, labPenelitian: e.target.value as LabRiset })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="Laboratorium Kimia Analitik & Instrumentasi">Laboratorium Kimia Analitik & Instrumentasi</option>
                      <option value="Laboratorium Kimia Organik & Bahan Alam">Laboratorium Kimia Organik & Bahan Alam</option>
                      <option value="Laboratorium Kimia Anorganik & Material">Laboratorium Kimia Anorganik & Material</option>
                      <option value="Laboratorium Kimia Fisik & Elektrokimia">Laboratorium Kimia Fisik & Elektrokimia</option>
                      <option value="Laboratorium Biokimia & Enzim">Laboratorium Biokimia & Enzim</option>
                      <option value="Laboratorium Kimia Lingkungan">Laboratorium Kimia Lingkungan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Skripsi</label>
                  <textarea
                    rows={2}
                    value={formData.judulSkripsi}
                    onChange={(e) => setFormData({ ...formData, judulSkripsi: e.target.value })}
                    placeholder="Judul skripsi / penelitian mahasiswa..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMhs(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002B49] hover:bg-[#003865] text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  {editingMhs ? 'Simpan Perubahan' : 'Tambahkan Mahasiswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI HAPUS                                                    */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hapus Data Mahasiswa?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini tidak dapat dibatalkan. Data mahasiswa yang bersangkutan akan dihapus dari sistem SIKMA.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
