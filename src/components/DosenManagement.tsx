import React, { useState, useMemo, useEffect } from 'react';
import { Dosen, BidangKeahlianKimia, LabRiset, UserRole } from '../types/sikma';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Printer,
  CheckCircle,
  AlertCircle,
  X,
  UserPlus,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface DosenManagementProps {
  dosenList: Dosen[];
  currentRole?: UserRole;
  onAddDosen: (dosen: Dosen) => void;
  onUpdateDosen: (dosen: Dosen) => void;
  onDeleteDosen: (id: string) => void;
}

export const DosenManagement: React.FC<DosenManagementProps> = ({
  dosenList,
  currentRole = 'admin',
  onAddDosen,
  onUpdateDosen,
  onDeleteDosen
}) => {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidang, setSelectedBidang] = useState<string>('Semua');
  const [selectedLab, setSelectedLab] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Pagination State (Limit 10 baris per halaman)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBidang, selectedLab]);

  // Modals state
  const [detailDosen, setDetailDosen] = useState<Dosen | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDosen, setEditingDosen] = useState<Dosen | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetDosen, setAssignTargetDosen] = useState<Dosen | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNim, setNewStudentNim] = useState('');

  // Flash message (CI3 flashdata simulation)
  const [flashMessage, setFlashMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showFlash = (type: 'success' | 'error', text: string) => {
    setFlashMessage({ type, text });
    setTimeout(() => setFlashMessage(null), 5000);
  };

  // Form State for Add / Edit
  const initialFormState = {
    nip: '',
    nidn: '',
    nama: '',
    gelar: 'M.Si',
    bidang: 'Kimia Organik' as BidangKeahlianKimia,
    lab: 'Laboratorium Kimia Organik & Bahan Alam' as LabRiset,
    email: '',
    jabatanAkademik: 'Lektor' as Dosen['jabatanAkademik'],
    status: 'Aktif Mengajar' as Dosen['status'],
    kuotaBimbingan: 8,
    ruangKantor: 'Gedung Kimia Lt. 2 R.201',
    telepon: '0341-575838',
    matakuliahInput: 'Kimia Dasar, Kimia Organik I',
    topikRisetInput: 'Sintesis Senyawa Organik, Bahan Alam Minyak Atsiri'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filtered List
  const filteredDosen = useMemo(() => {
    return dosenList.filter((d) => {
      const matchSearch =
        d.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.nidn.includes(searchQuery) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.bidang.toLowerCase().includes(searchQuery.toLowerCase());

      const matchBidang = selectedBidang === 'Semua' || d.bidang === selectedBidang;
      const matchLab = selectedLab === 'Semua' || d.lab === selectedLab;

      return matchSearch && matchBidang && matchLab;
    });
  }, [dosenList, searchQuery, selectedBidang, selectedLab]);

  // Pagination calculations (Limit 10 baris per halaman)
  const totalFiltered = filteredDosen.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedDosen = useMemo(() => {
    return filteredDosen.slice(startIndex, endIndex);
  }, [filteredDosen, startIndex, endIndex]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = dosenList.length;
    const totalKuota = dosenList.reduce((acc, d) => acc + d.kuotaBimbingan, 0);
    const totalTerisi = dosenList.reduce((acc, d) => acc + d.jumlahBimbingan, 0);
    const sisaKuota = totalKuota - totalTerisi;
    return { total, totalKuota, totalTerisi, sisaKuota };
  }, [dosenList]);

  // Handle Save New Dosen
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'mahasiswa' || currentRole === 'dosen') return;

    if (!formData.nama || !formData.email) {
      showFlash('error', 'Harap isi Nama Lengkap dan Email Dosen.');
      return;
    }

    const newDosen: Dosen = {
      id: `dos-${Date.now()}`,
      nip: '',
      nidn: formData.nidn || '',
      nama: formData.nama,
      gelar: formData.gelar,
      bidang: formData.bidang,
      lab: formData.lab,
      email: formData.email.includes('@') ? formData.email : `${formData.email}@ub.ac.id`,
      jabatanAkademik: formData.jabatanAkademik,
      status: formData.status,
      kuotaBimbingan: Number(formData.kuotaBimbingan) || 8,
      jumlahBimbingan: 0,
      matakuliah: formData.matakuliahInput.split(',').map((s) => s.trim()).filter(Boolean),
      topikRiset: formData.topikRisetInput.split(',').map((s) => s.trim()).filter(Boolean),
      ruangKantor: formData.ruangKantor,
      telepon: formData.telepon
    };

    onAddDosen(newDosen);
    setIsAddModalOpen(false);
    setFormData(initialFormState);
    showFlash('success', `Data Dosen ${newDosen.nama}, ${newDosen.gelar} berhasil disimpan ke database.`);
  };

  // Open Edit Modal
  const handleOpenEdit = (d: Dosen) => {
    if (currentRole === 'mahasiswa') return;
    setEditingDosen(d);
    setFormData({
      nip: '',
      nidn: d.nidn,
      nama: d.nama,
      gelar: d.gelar,
      bidang: d.bidang,
      lab: d.lab,
      email: d.email,
      jabatanAkademik: d.jabatanAkademik,
      status: d.status,
      kuotaBimbingan: d.kuotaBimbingan,
      ruangKantor: d.ruangKantor,
      telepon: d.telepon,
      matakuliahInput: d.matakuliah.join(', '),
      topikRisetInput: d.topikRiset.join(', ')
    });
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'mahasiswa' || !editingDosen) return;

    const updated: Dosen = {
      ...editingDosen,
      nip: '',
      nidn: formData.nidn,
      nama: formData.nama,
      gelar: formData.gelar,
      bidang: formData.bidang,
      lab: formData.lab,
      email: formData.email,
      jabatanAkademik: formData.jabatanAkademik,
      status: formData.status,
      kuotaBimbingan: Number(formData.kuotaBimbingan),
      matakuliah: formData.matakuliahInput.split(',').map((s) => s.trim()).filter(Boolean),
      topikRiset: formData.topikRisetInput.split(',').map((s) => s.trim()).filter(Boolean),
      ruangKantor: formData.ruangKantor,
      telepon: formData.telepon
    };

    onUpdateDosen(updated);
    setEditingDosen(null);
    showFlash('success', `Perubahan data dosen ${updated.nama} berhasil diperbarui.`);
  };

  // Handle Delete
  const handleDelete = (d: Dosen) => {
    if (currentRole === 'mahasiswa' || currentRole === 'dosen') return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus data Dosen ${d.nama}, ${d.gelar} dari SIKMA Kimia UB?`)) {
      onDeleteDosen(d.id);
      showFlash('success', `Data Dosen ${d.nama} telah dihapus.`);
    }
  };

  // Handle Assign Mahasiswa
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'mahasiswa' || !assignTargetDosen) return;
    if (!newStudentName || !newStudentNim) {
      alert('Nama mahasiswa dan NIM wajib diisi.');
      return;
    }

    if (assignTargetDosen.jumlahBimbingan >= assignTargetDosen.kuotaBimbingan) {
      alert(`Kuota bimbingan untuk ${assignTargetDosen.nama} sudah penuh (${assignTargetDosen.kuotaBimbingan} mahasiswa).`);
      return;
    }

    const updated: Dosen = {
      ...assignTargetDosen,
      jumlahBimbingan: assignTargetDosen.jumlahBimbingan + 1
    };

    onUpdateDosen(updated);
    setIsAssignModalOpen(false);
    setNewStudentName('');
    setNewStudentNim('');
    showFlash(
      'success',
      `Mahasiswa ${newStudentName} (${newStudentNim}) berhasil ditugaskan ke Dosen Pembimbing ${updated.nama}. Kuota tersisa: ${updated.kuotaBimbingan - updated.jumlahBimbingan}.`
    );
  };

  // Print Report Handler
  const handlePrintDosen = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Flash Notice ala CodeIgniter 3 */}
      {flashMessage && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs font-semibold ${
            flashMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {flashMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{flashMessage.text}</span>
          </div>
          <button onClick={() => setFlashMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-[#002B49]" />
            <span>Pangkalan Data Tenaga Pendidik Kimia UB</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Manajemen Data Dosen & Penasihat Akademik (PA)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Departemen Kimia FSTeM Universitas Brawijaya • Monitoring beban bimbingan skripsi & bidang keahlian (KBK)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentRole !== 'mahasiswa' && currentRole !== 'dosen' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              id="btn-tambah-dosen"
              className="px-4 py-2 bg-[#002B49] text-white rounded-lg text-xs font-bold hover:bg-[#003865] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Tambah Dosen Baru</span>
            </button>
          )}
          <button
            onClick={handlePrintDosen}
            className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors border border-slate-300 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap Dosen</span>
          </button>
        </div>
      </div>

      {/* Baris Ringkasan Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium">Total Dosen Tetap</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.total} Orang</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium">Total Kuota Bimbingan</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.totalKuota} Mahasiswa</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium">Bimbingan Berjalan</div>
          <div className="text-lg font-bold text-amber-700 mt-0.5">{stats.totalTerisi} Mahasiswa</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium">Sisa Slot Bimbingan</div>
          <div className="text-lg font-bold text-emerald-700 mt-0.5">{stats.sisaKuota} Slot Tersedia</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="search-dosen-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Dosen (Nama, NIP, NIDN, Email, atau Kepakaran)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-all"
            />
          </div>

          {/* Filter KBK Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
            >
              <option value="Semua">Semua Bidang Keahlian (KBK)</option>
              <option value="Kimia Organik">Kimia Organik</option>
              <option value="Kimia Anorganik">Kimia Anorganik</option>
              <option value="Kimia Analitik">Kimia Analitik</option>
              <option value="Kimia Fisik">Kimia Fisik</option>
              <option value="Biokimia">Biokimia</option>
            </select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded font-medium ${
                  viewMode === 'table' ? 'bg-[#002B49] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Tabel
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded font-medium ${
                  viewMode === 'cards' ? 'bg-[#002B49] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Kartu
              </button>
            </div>
          </div>
        </div>

        {/* KBK Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1">KBK Kimia:</span>
          {['Semua', 'Kimia Organik', 'Kimia Anorganik', 'Kimia Analitik', 'Kimia Fisik', 'Biokimia'].map((kbk) => (
            <button
              key={kbk}
              onClick={() => setSelectedBidang(kbk)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedBidang === kbk
                  ? 'bg-[#002B49] text-[#D4AF37] font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {kbk}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table View or Cards View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002B49] text-white font-semibold">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">No</th>
                  <th className="px-4 py-3.5">Identitas & Gelar Dosen</th>
                  {currentRole !== 'mahasiswa' && (
                    <th className="px-4 py-3.5">NIDN</th>
                  )}
                  <th className="px-4 py-3.5">Bidang Keahlian (KBK)</th>
                  <th className="px-4 py-3.5">Laboratorium Riset</th>
                  <th className="px-4 py-3.5 text-center">Status Bimbingan</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDosen.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole === 'mahasiswa' ? 6 : 7} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data dosen yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedDosen.map((d, index) => {
                    const isFull = d.jumlahBimbingan >= d.kuotaBimbingan;
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-center text-slate-400 font-medium">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 leading-tight">
                            {d.nama}, {d.gelar}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{d.email}</span>
                          </div>
                          {currentRole !== 'mahasiswa' && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {d.jabatanAkademik} • {d.ruangKantor}
                            </div>
                          )}
                        </td>
                        {currentRole !== 'mahasiswa' && (
                          <td className="px-4 py-3">
                            <div className="font-mono text-slate-800 font-medium">{d.nidn || '-'}</div>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              d.bidang === 'Kimia Organik'
                                ? 'bg-amber-100 text-amber-800'
                                : d.bidang === 'Kimia Anorganik'
                                ? 'bg-blue-100 text-blue-800'
                                : d.bidang === 'Kimia Analitik'
                                ? 'bg-purple-100 text-purple-800'
                                : d.bidang === 'Kimia Fisik'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {d.bidang}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 max-w-[200px]">
                          <div className="line-clamp-1 font-medium">{d.lab}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {d.topikRiset.slice(0, 2).join(', ')}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center space-x-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                isFull
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {d.jumlahBimbingan} / {d.kuotaBimbingan}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {isFull ? 'Kuota Penuh' : `${d.kuotaBimbingan - d.jumlahBimbingan} Slot`}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* Button View: dapat diakses semua role (Mahasiswa, Dosen, Admin, Super Admin) */}
                            <button
                              onClick={() => setDetailDosen(d)}
                              title="Lihat Detail Profil & Riset"
                              className="p-1.5 rounded bg-slate-100 hover:bg-[#002B49] hover:text-white text-slate-600 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Button Tugaskan Mahasiswa: dapat diakses Dosen, Admin, dan Super Admin (tidak terlihat pada Mahasiswa) */}
                            {currentRole !== 'mahasiswa' && (
                              <button
                                onClick={() => {
                                  setAssignTargetDosen(d);
                                  setIsAssignModalOpen(true);
                                }}
                                title="Tugaskan Mahasiswa Bimbingan Skripsi"
                                className="p-1.5 rounded bg-slate-100 hover:bg-[#D4AF37] hover:text-[#002B49] text-slate-600 transition-colors"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Button Edit Data Dosen: dapat diakses Dosen, Admin, dan Super Admin (tidak terlihat pada Mahasiswa) */}
                            {currentRole !== 'mahasiswa' && (
                              <button
                                onClick={() => handleOpenEdit(d)}
                                title="Edit Data Dosen"
                                className="p-1.5 rounded bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-600 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Button Hapus: hanya untuk Admin & Super Admin (tidak bisa diakses / disembunyikan pada Mahasiswa & Dosen) */}
                            {currentRole !== 'mahasiswa' && currentRole !== 'dosen' && (
                              <button
                                onClick={() => handleDelete(d)}
                                title="Hapus Data"
                                className="p-1.5 rounded bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
          {/* Pagination Controls (Limit 10 baris per halaman) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-slate-200 bg-slate-50/70 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600">
              <span>Menampilkan</span>
              <span className="font-bold text-slate-900">
                {totalFiltered === 0 ? 0 : startIndex + 1} - {endIndex}
              </span>
              <span>dari</span>
              <span className="font-bold text-slate-900">{totalFiltered}</span>
              <span>dosen</span>
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
      ) : (
        /* Cards Grid View */
        <div className="space-y-4">
          {filteredDosen.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
              Tidak ada data dosen yang sesuai dengan kriteria pencarian.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedDosen.map((d) => (
                <div
                  key={d.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#002B49]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.bidang === 'Kimia Organik'
                            ? 'bg-amber-100 text-amber-800'
                            : d.bidang === 'Kimia Anorganik'
                            ? 'bg-blue-100 text-blue-800'
                            : d.bidang === 'Kimia Analitik'
                            ? 'bg-purple-100 text-purple-800'
                            : d.bidang === 'Kimia Fisik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.bidang}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {d.jumlahBimbingan} / {d.kuotaBimbingan} Mhs
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {d.nama}, {d.gelar}
                      </h3>
                      {currentRole !== 'mahasiswa' && (
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIDN: {d.nidn || '-'}</p>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-2 text-[11px]">
                        <FlaskConical className="w-3.5 h-3.5 text-[#002B49] flex-shrink-0" />
                        <span className="line-clamp-1">{d.lab}</span>
                      </div>
                      {currentRole !== 'mahasiswa' && (
                        <div className="flex items-center space-x-2 text-[11px]">
                          <Building className="w-3.5 h-3.5 text-[#002B49] flex-shrink-0" />
                          <span>{d.ruangKantor}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-[#002B49] flex-shrink-0" />
                        <span className="line-clamp-1">{d.email}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Topik Riset Kimia:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {d.topikRiset.slice(0, 2).map((topik, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                          >
                            {topik}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setDetailDosen(d)}
                      className="text-xs font-bold text-[#002B49] hover:underline"
                    >
                      Detail Profil &rarr;
                    </button>
                    <div className="flex items-center space-x-1">
                      {currentRole !== 'mahasiswa' && (
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="p-1.5 rounded hover:bg-amber-100 text-amber-700 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {currentRole !== 'mahasiswa' && currentRole !== 'dosen' && (
                        <button
                          onClick={() => handleDelete(d)}
                          className="p-1.5 rounded hover:bg-rose-100 text-rose-700 cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cards Pagination Controls (Limit 10 baris per halaman) */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600">
              <span>Menampilkan</span>
              <span className="font-bold text-slate-900">
                {totalFiltered === 0 ? 0 : startIndex + 1} - {endIndex}
              </span>
              <span>dari</span>
              <span className="font-bold text-slate-900">{totalFiltered}</span>
              <span>dosen</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Kartu per hal:</span>
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
      )}

      {/* MODAL 1: Tambah Dosen Baru */}
      {isAddModalOpen && currentRole !== 'mahasiswa' && currentRole !== 'dosen' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-5 bg-[#002B49] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#D4AF37]" />
                  Tambah Tenaga Pendidik Kimia UB
                </h3>
                <p className="text-xs text-slate-300">
                  Pendaftaran dosen ke dalam sistem SIKMA Departemen Kimia FSTeM UB
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIDN (Nomor Induk Dosen Nasional)</label>
                <input
                  type="text"
                  value={formData.nidn}
                  onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                  placeholder="Contoh: 0001018001"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap (tanpa gelar) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Dr. Ir. Budi Santoso"
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gelar Akademik *</label>
                  <input
                    type="text"
                    required
                    value={formData.gelar}
                    onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                    placeholder="Contoh: M.Si., Ph.D"
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelompok Bidang Keahlian (KBK) *</label>
                  <select
                    value={formData.bidang}
                    onChange={(e) => setFormData({ ...formData, bidang: e.target.value as BidangKeahlianKimia })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white"
                  >
                    <option value="Kimia Organik">Kimia Organik</option>
                    <option value="Kimia Anorganik">Kimia Anorganik</option>
                    <option value="Kimia Analitik">Kimia Analitik</option>
                    <option value="Kimia Fisik">Kimia Fisik</option>
                    <option value="Biokimia">Biokimia</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Laboratorium Riset Utama *</label>
                  <select
                    value={formData.lab}
                    onChange={(e) => setFormData({ ...formData, lab: e.target.value as LabRiset })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white"
                  >
                    <option value="Laboratorium Kimia Organik & Bahan Alam">Laboratorium Kimia Organik & Bahan Alam</option>
                    <option value="Laboratorium Kimia Anorganik & Material">Laboratorium Kimia Anorganik & Material</option>
                    <option value="Laboratorium Kimia Analitik & Instrumentasi">Laboratorium Kimia Analitik & Instrumentasi</option>
                    <option value="Laboratorium Kimia Fisik & Elektrokimia">Laboratorium Kimia Fisik & Elektrokimia</option>
                    <option value="Laboratorium Biokimia & Enzim">Laboratorium Biokimia & Enzim</option>
                    <option value="Laboratorium Kimia Lingkungan">Laboratorium Kimia Lingkungan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Resmi UB *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@ub.ac.id"
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan Fungsional</label>
                  <select
                    value={formData.jabatanAkademik}
                    onChange={(e) => setFormData({ ...formData, jabatanAkademik: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white"
                  >
                    <option value="Asisten Ahli">Asisten Ahli</option>
                    <option value="Lektor">Lektor</option>
                    <option value="Lektor Kepala">Lektor Kepala</option>
                    <option value="Guru Besar (Profesor)">Guru Besar (Profesor)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maks. Kuota Bimbingan</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={formData.kuotaBimbingan}
                    onChange={(e) => setFormData({ ...formData, kuotaBimbingan: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ruang Kantor di Gedung Kimia</label>
                  <input
                    type="text"
                    value={formData.ruangKantor}
                    onChange={(e) => setFormData({ ...formData, ruangKantor: e.target.value })}
                    placeholder="Gedung Kimia Lt. 2 R.205"
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telepon / Ext.</label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="0341-575838 ext 205"
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Kuliah Diampu (pisahkan koma)</label>
                <input
                  type="text"
                  value={formData.matakuliahInput}
                  onChange={(e) => setFormData({ ...formData, matakuliahInput: e.target.value })}
                  placeholder="Kimia Organik I, Sintesis Senyawa Organik"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topik Riset & Kepakaran (pisahkan koma)</label>
                <input
                  type="text"
                  value={formData.topikRisetInput}
                  onChange={(e) => setFormData({ ...formData, topikRisetInput: e.target.value })}
                  placeholder="Katalis Ramah Lingkungan, Minyak Atsiri, Isolasi Flavonoid"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] text-[#D4AF37] font-bold rounded hover:bg-[#003865] transition-colors"
                >
                  Simpan Data Dosen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Dosen */}
      {editingDosen && currentRole !== 'mahasiswa' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-5 bg-amber-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-200" />
                  Edit Data Dosen: {editingDosen.nama}
                </h3>
                <p className="text-xs text-amber-100">
                  Perbarui biodata, kuota bimbingan, atau penugasan laboratorium riset
                </p>
              </div>
              <button
                onClick={() => setEditingDosen(null)}
                className="text-amber-100 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIDN (Nomor Induk Dosen Nasional)</label>
                <input
                  type="text"
                  value={formData.nidn}
                  onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gelar Akademik</label>
                  <input
                    type="text"
                    required
                    value={formData.gelar}
                    onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bidang Keahlian (KBK)</label>
                  <select
                    value={formData.bidang}
                    onChange={(e) => setFormData({ ...formData, bidang: e.target.value as BidangKeahlianKimia })}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Kimia Organik">Kimia Organik</option>
                    <option value="Kimia Anorganik">Kimia Anorganik</option>
                    <option value="Kimia Analitik">Kimia Analitik</option>
                    <option value="Kimia Fisik">Kimia Fisik</option>
                    <option value="Biokimia">Biokimia</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Laboratorium Riset</label>
                  <select
                    value={formData.lab}
                    onChange={(e) => setFormData({ ...formData, lab: e.target.value as LabRiset })}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Laboratorium Kimia Organik & Bahan Alam">Laboratorium Kimia Organik & Bahan Alam</option>
                    <option value="Laboratorium Kimia Anorganik & Material">Laboratorium Kimia Anorganik & Material</option>
                    <option value="Laboratorium Kimia Analitik & Instrumentasi">Laboratorium Kimia Analitik & Instrumentasi</option>
                    <option value="Laboratorium Kimia Fisik & Elektrokimia">Laboratorium Kimia Fisik & Elektrokimia</option>
                    <option value="Laboratorium Biokimia & Enzim">Laboratorium Biokimia & Enzim</option>
                    <option value="Laboratorium Kimia Lingkungan">Laboratorium Kimia Lingkungan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email UB</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Mengajar</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Aktif Mengajar">Aktif Mengajar</option>
                    <option value="Tugas Belajar">Tugas Belajar</option>
                    <option value="Cuti Riset">Cuti Riset</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maks. Kuota Bimbingan</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.kuotaBimbingan}
                    onChange={(e) => setFormData({ ...formData, kuotaBimbingan: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topik Riset & Kepakaran</label>
                <input
                  type="text"
                  value={formData.topikRisetInput}
                  onChange={(e) => setFormData({ ...formData, topikRisetInput: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingDosen(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white font-bold rounded hover:bg-amber-800 transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Detail Profil & Kepakaran Dosen */}
      {detailDosen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-5 bg-[#002B49] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                  Profil Dosen Departemen Kimia
                </span>
                <h3 className="font-bold text-lg leading-snug text-white">
                  {detailDosen.nama}, {detailDosen.gelar}
                </h3>
              </div>
              <button
                onClick={() => setDetailDosen(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Badge info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">NIDN</div>
                  <div className="font-mono font-bold text-slate-900">{detailDosen.nidn || '-'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Bidang (KBK)</div>
                  <div className="font-bold text-[#002B49]">{detailDosen.bidang}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Jabatan</div>
                  <div className="font-bold text-slate-800">{detailDosen.jabatanAkademik}</div>
                </div>
              </div>

              {/* Lab & Kontak */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b pb-1">Afiliasi & Laboratorium</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <strong>Laboratorium:</strong>
                    <p className="text-slate-600">{detailDosen.lab}</p>
                  </div>
                  <div>
                    <strong>Ruang Kantor:</strong>
                    <p className="text-slate-600">{detailDosen.ruangKantor}</p>
                  </div>
                  <div>
                    <strong>Email UB:</strong>
                    <p className="text-slate-600 font-mono">{detailDosen.email}</p>
                  </div>
                  <div>
                    <strong>Telepon / Ext.:</strong>
                    <p className="text-slate-600 font-mono">{detailDosen.telepon}</p>
                  </div>
                </div>
              </div>

              {/* Status Beban Bimbingan Skripsi */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b pb-1 flex items-center justify-between">
                  <span>Beban Bimbingan Tugas Akhir</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Kuota: {detailDosen.jumlahBimbingan} dari {detailDosen.kuotaBimbingan} Mahasiswa
                  </span>
                </h4>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-[#D4AF37] h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((detailDosen.jumlahBimbingan / detailDosen.kuotaBimbingan) * 100)
                      )}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Mata Kuliah Pengampu */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 border-b pb-1">Mata Kuliah yang Diampu</h4>
                <div className="flex flex-wrap gap-1.5">
                  {detailDosen.matakuliah.map((mk, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded text-[11px] font-medium"
                    >
                      {mk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Topik Riset */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 border-b pb-1">Fokus Riset & Kepakaran</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {detailDosen.topikRiset.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setDetailDosen(null)}
                  className="px-4 py-2 bg-[#002B49] text-white rounded font-semibold hover:bg-[#003865]"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Tugaskan Mahasiswa Bimbingan */}
      {isAssignModalOpen && assignTargetDosen && currentRole !== 'mahasiswa' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="font-bold text-sm">Penugasan Mahasiswa Bimbingan</h3>
                <p className="text-[11px] text-[#D4AF37]">
                  Dosen: {assignTargetDosen.nama}, {assignTargetDosen.gelar}
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-5 space-y-3 text-xs">
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-800 text-[11px]">
                Status kuota saat ini: <strong>{assignTargetDosen.jumlahBimbingan}</strong> dari{' '}
                <strong>{assignTargetDosen.kuotaBimbingan}</strong> mahasiswa.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIM Mahasiswa</label>
                <input
                  type="text"
                  required
                  value={newStudentNim}
                  onChange={(e) => setNewStudentNim(e.target.value)}
                  placeholder="Contoh: 215090200111044"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Mahasiswa</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Contoh: Siti Aisyah Nurhaliza"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#002B49] text-[#D4AF37] font-bold rounded hover:bg-[#003865]"
                >
                  Tugaskan & Tambah Kuota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
