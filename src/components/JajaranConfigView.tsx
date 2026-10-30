import React, { useState } from 'react';
import {
  Award,
  Users,
  Edit,
  PlusCircle,
  CheckCircle2,
  X,
  Search,
  Download,
  RotateCcw,
  Building2,
  Mail,
  FileCheck,
  ShieldCheck,
  Trash2,
  Briefcase
} from 'lucide-react';
import { UserRole, PejabatJajaranItem } from '../types/sikma';
import { INITIAL_JAJARAN_PEJABAT } from '../data/jajaranList';

interface JajaranConfigViewProps {
  currentRole: UserRole;
}

export const JajaranConfigView: React.FC<JajaranConfigViewProps> = ({ currentRole }) => {
  // State for Jajaran with localStorage persistence
  const [jajaranList, setJajaranList] = useState<PejabatJajaranItem[]>(() => {
    const saved = localStorage.getItem('sikma_jajaran_pejabat');
    return saved ? JSON.parse(saved) : INITIAL_JAJARAN_PEJABAT;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Aktif' | 'Nonaktif'>('all');

  // Modal State for CRUD Edit & Add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PejabatJajaranItem | null>(null);

  // Form inputs
  const [formJabatan, setFormJabatan] = useState('');
  const [formNamaPejabat, setFormNamaPejabat] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPeriode, setFormPeriode] = useState('2023 - 2027');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formSk, setFormSk] = useState('');
  const [formRuang, setFormRuang] = useState('');

  // Notification feedback
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const saveList = (updated: PejabatJajaranItem[]) => {
    setJajaranList(updated);
    localStorage.setItem('sikma_jajaran_pejabat', JSON.stringify(updated));
  };

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: PejabatJajaranItem) => {
    if (currentRole === 'mahasiswa') {
      showAlert('Role Mahasiswa tidak memiliki izin untuk mengedit data jabatan pimpinan.', 'error');
      return;
    }
    setEditingItem(item);
    setFormJabatan(item.jabatan);
    setFormNamaPejabat(item.namaPejabat);
    setFormNip(item.nip);
    setFormEmail(item.email);
    setFormPeriode(item.periode);
    setFormStatus(item.status);
    setFormSk(item.skPengangkatan || '');
    setFormRuang(item.ruangKantor || '');
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    if (currentRole === 'mahasiswa') {
      showAlert('Role Mahasiswa tidak memiliki izin untuk menambah jabatan.', 'error');
      return;
    }
    setEditingItem(null);
    setFormJabatan('');
    setFormNamaPejabat('');
    setFormNip('');
    setFormEmail('');
    setFormPeriode('2023 - 2027');
    setFormStatus('Aktif');
    setFormSk('');
    setFormRuang('');
    setIsModalOpen(true);
  };

  // Handle Form Submit (Create / Update)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formJabatan.trim() || !formNamaPejabat.trim()) {
      showAlert('Jabatan dan Nama Pejabat wajib diisi.', 'error');
      return;
    }

    if (editingItem) {
      // Update existing item
      const updated = jajaranList.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            jabatan: formJabatan.trim(),
            namaPejabat: formNamaPejabat.trim(),
            nip: formNip.trim(),
            email: formEmail.trim(),
            periode: formPeriode.trim(),
            status: formStatus,
            skPengangkatan: formSk.trim(),
            ruangKantor: formRuang.trim()
          };
        }
        return item;
      });
      saveList(updated);
      showAlert(`Data pejabat "${formJabatan}" (${formNamaPejabat}) berhasil diperbarui.`);
    } else {
      // Add new item
      const newItem: PejabatJajaranItem = {
        id: `jajaran-${Date.now()}`,
        jabatan: formJabatan.trim(),
        namaPejabat: formNamaPejabat.trim(),
        nip: formNip.trim() || '-',
        email: formEmail.trim() || 'kimia@ub.ac.id',
        periode: formPeriode.trim() || '2023 - 2027',
        status: formStatus,
        skPengangkatan: formSk.trim() || 'SK Rektor UB',
        ruangKantor: formRuang.trim() || 'Gedung Jurusan Kimia FSTeM UB'
      };
      saveList([...jajaranList, newItem]);
      showAlert(`Jabatan "${formJabatan}" dengan pejabat "${formNamaPejabat}" berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
  };

  // Delete item
  const handleDelete = (id: string, jabatan: string, nama: string) => {
    if (currentRole === 'mahasiswa') {
      showAlert('Role Mahasiswa tidak memiliki izin untuk menghapus jabatan.', 'error');
      return;
    }
    if (confirm(`Hapus jabatan "${jabatan}" yang dijabat oleh "${nama}"?`)) {
      const updated = jajaranList.filter((item) => item.id !== id);
      saveList(updated);
      showAlert(`Jabatan "${jabatan}" berhasil dihapus.`);
    }
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    if (currentRole === 'mahasiswa') {
      showAlert('Role Mahasiswa tidak memiliki izin untuk mengubah status jabatan.', 'error');
      return;
    }
    const updated = jajaranList.map((item) => {
      if (item.id === id) {
        const nextStatus = item.status === 'Aktif' ? ('Nonaktif' as const) : ('Aktif' as const);
        return { ...item, status: nextStatus };
      }
      return item;
    });
    saveList(updated);
    showAlert('Status jabatan berhasil diperbarui.');
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (currentRole === 'mahasiswa') {
      showAlert('Role Mahasiswa tidak memiliki izin untuk mereset data jajaran.', 'error');
      return;
    }
    if (confirm('Kembalikan susunan jajaran pejabat ke data resmi Departemen Kimia UB?')) {
      saveList(INITIAL_JAJARAN_PEJABAT);
      showAlert('Susunan jajaran pejabat telah dikembalikan ke data awal.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No', 'Jabatan', 'Nama Pejabat', 'NIP', 'Email', 'Periode', 'Status', 'SK Pengangkatan', 'Ruang Kantor'];
    const rows = jajaranList.map((j, idx) => [
      idx + 1,
      `"${j.jabatan}"`,
      `"${j.namaPejabat}"`,
      `"${j.nip}"`,
      `"${j.email}"`,
      `"${j.periode}"`,
      j.status,
      `"${j.skPengangkatan || ''}"`,
      `"${j.ruangKantor || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `jajaran_pejabat_kimia_ub_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered list
  const filteredList = jajaranList.filter((item) => {
    const matchSearch =
      item.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.namaPejabat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip.includes(searchTerm) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span className="text-[#002B49] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold">CONFIG</span>
              <span>/</span>
              <span className="text-[#D4AF37] font-bold">JAJARAN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#002B49] flex items-center gap-2">
              <Award className="w-6 h-6 text-[#D4AF37]" />
              Jajaran Pimpinan & Pejabat Departemen Kimia
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Manajemen master data struktur organisasi, jabatan struktural, dan nama pejabat pimpinan Departemen Kimia FSTeM Universitas Brawijaya.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentRole !== 'mahasiswa' && (
              <button
                onClick={handleOpenAdd}
                id="btn-tambah-jajaran"
                className="px-3 py-2 bg-[#002B49] hover:bg-[#003865] text-[#D4AF37] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ring-1 ring-[#D4AF37]/30 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Jabatan</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-sm cursor-pointer"
              title="Ekspor CSV Jajaran"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Ekspor</span>
            </button>
            {currentRole !== 'mahasiswa' && (
              <button
                onClick={handleResetToDefault}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-sm cursor-pointer"
                title="Reset ke data awal resmi"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {alert && (
          <div
            className={`mt-4 p-3.5 rounded-lg text-xs flex items-center justify-between border ${
              alert.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{alert.message}</span>
            </div>
            <button onClick={() => setAlert(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* HIGHLIGHT 5 JABATAN UTAMA (Kadep, Sekdep, KPS S1, S2, S3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jajaranList.slice(0, 5).map((pejabat) => {
          return (
            <div
              key={pejabat.id}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#002B49] text-[#D4AF37] tracking-wider">
                    {pejabat.jabatan}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pejabat.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {pejabat.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1 line-clamp-2">
                  {pejabat.namaPejabat}
                </h3>

                <div className="space-y-1 text-[11px] text-slate-600 mt-2">
                  {currentRole !== 'mahasiswa' && (
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400">NIP:</span>
                      <span className="font-semibold text-slate-700">{pejabat.nip}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600">{pejabat.email}</span>
                  </div>
                  {currentRole !== 'mahasiswa' && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-500 truncate">{pejabat.ruangKantor || 'Departemen Kimia FSTeM UB'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  Periode: <strong className="text-slate-700">{pejabat.periode}</strong>
                </span>
                {currentRole !== 'mahasiswa' && (
                  <button
                    onClick={() => handleOpenEdit(pejabat)}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded text-xs font-bold flex items-center gap-1 transition-colors border border-amber-200 cursor-pointer"
                  >
                    <Edit className="w-3 h-3 text-amber-700" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DAFTAR LENGKAP TABEL & CRUD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              Tabel Jabatan dan Nama Pejabat ({filteredList.length} Pejabat)
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan seluruh jajaran struktur kepemimpinan dengan fitur CRUD edit langsung.
            </p>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari jabatan / nama pejabat..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'Aktif' | 'Nonaktif')}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#002B49] text-white uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Nama Pejabat</th>
                <th className="py-3 px-4">NIP & Kontak</th>
                <th className="py-3 px-4">Periode</th>
                {currentRole !== 'mahasiswa' && (
                  <th className="py-3 px-4">SK Pengangkatan</th>
                )}
                <th className="py-3 px-4">Status</th>
                {currentRole !== 'mahasiswa' && (
                  <th className="py-3 px-4 text-right">Aksi Edit</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentRole === 'mahasiswa' ? 6 : 8}
                    className="py-8 text-center text-slate-400"
                  >
                    Tidak ada data jajaran yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#002B49] flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{item.jabatan}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {item.namaPejabat}
                      </div>
                      {currentRole !== 'mahasiswa' && (
                        <div className="text-[10px] text-slate-500">
                          {item.ruangKantor || 'FSTeM Universitas Brawijaya'}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {currentRole !== 'mahasiswa' && (
                        <div className="font-mono text-slate-700 text-[11px]">
                          {item.nip}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-600 font-medium">
                        {item.email}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {item.periode}
                    </td>

                    {/* Field SK Pengangkatan - disembunyikan untuk role mahasiswa */}
                    {currentRole !== 'mahasiswa' && (
                      <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate" title={item.skPengangkatan}>
                        <span className="flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.skPengangkatan || '-'}</span>
                        </span>
                      </td>
                    )}

                    <td className="py-3 px-4">
                      {currentRole === 'mahasiswa' ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{item.status}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            item.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'
                          }`}
                          title="Klik untuk ubah status"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{item.status}</span>
                        </button>
                      )}
                    </td>

                    {/* Field Aksi Edit - disembunyikan untuk role mahasiswa */}
                    {currentRole !== 'mahasiswa' && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-bold border border-amber-300 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Edit Jabatan dan Nama Pejabat"
                          >
                            <Edit className="w-3 h-3 text-amber-700" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.jabatan, item.namaPejabat)}
                            className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Jabatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRUD EDIT & TAMBAH PEJABAT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold text-sm">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#002B49]">
                    {editingItem ? 'Edit Data Jajaran Pejabat' : 'Tambah Jajaran Pejabat Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Departemen Kimia FSTeM Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 mt-4">
              {/* Jabatan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nama Jabatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formJabatan}
                  onChange={(e) => setFormJabatan(e.target.value)}
                  placeholder="Contoh: Kepala Departemen, Ketua Program Studi Sarjana"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Pilihan Cepat:</span>
                  {[
                    'Kepala Departemen',
                    'Sekretaris Departemen',
                    'Ketua Program Studi Sarjana',
                    'Ketua Program Studi Magister',
                    'Ketua Program Studi Doktor'
                  ].map((jbt) => (
                    <button
                      key={jbt}
                      type="button"
                      onClick={() => setFormJabatan(jbt)}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-[#002B49] hover:text-[#D4AF37] text-slate-700 rounded transition-colors"
                    >
                      {jbt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Pejabat */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nama Pejabat (Lengkap dengan Gelar) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNamaPejabat}
                  onChange={(e) => setFormNamaPejabat(e.target.value)}
                  placeholder="Contoh: Prof. Dr. Dra. Hermin Sulistyarti, M.Si"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                />
              </div>

              {/* NIP & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NIK Pejabat
                  </label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="Contoh: 196403211989032001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Resmi UB
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Contoh: nama@ub.ac.id"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              {/* Periode & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Periode Masa Jabatan
                  </label>
                  <input
                    type="text"
                    value={formPeriode}
                    onChange={(e) => setFormPeriode(e.target.value)}
                    placeholder="Contoh: 2023 - 2027"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Jabatan
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* SK Pengangkatan & Ruang Kantor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SK Pengangkatan Rektor
                  </label>
                  <input
                    type="text"
                    value={formSk}
                    onChange={(e) => setFormSk(e.target.value)}
                    placeholder="Contoh: SK Rektor UB No. 1284/UN10/KP/2023"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ruang Kantor
                  </label>
                  <input
                    type="text"
                    value={formRuang}
                    onChange={(e) => setFormRuang(e.target.value)}
                    placeholder="Contoh: Gedung Jurusan Kimia Lt. 1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002B49] hover:bg-[#003865] text-[#D4AF37] font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm ring-1 ring-[#D4AF37]/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Pejabat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
