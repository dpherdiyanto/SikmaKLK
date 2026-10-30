import React, { useState } from 'react';
import { JadwalSeminar, Dosen, UserRole } from '../types/sikma';
import {
  CalendarCheck,
  Search,
  Plus,
  Clock,
  Building,
  User,
  BookOpen,
  CheckCircle,
  X
} from 'lucide-react';

interface JadwalSeminarViewProps {
  currentRole: UserRole;
  seminarList: JadwalSeminar[];
  dosenList: Dosen[];
  onAddSeminar: (item: JadwalSeminar) => void;
}

export const JadwalSeminarView: React.FC<JadwalSeminarViewProps> = ({
  currentRole,
  seminarList,
  dosenList,
  onAddSeminar
}) => {
  const [filterJenis, setFilterJenis] = useState<string>('Semua');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    jenis: 'Seminar Proposal' as JadwalSeminar['jenis'],
    mahasiswaNama: '',
    nim: '',
    judul: '',
    dosenPembimbing: dosenList[0]?.nama || '',
    dosenPenguji1: dosenList[1]?.nama || '',
    dosenPenguji2: dosenList[2]?.nama || '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '09.00 - 10.30 WIB',
    ruangan: 'Ruang Seminar Kimia FSTeM Lt. 2'
  });

  const filtered = seminarList.filter((s) => {
    const matchSearch =
      s.mahasiswaNama.toLowerCase().includes(search.toLowerCase()) ||
      s.nim.includes(search) ||
      s.judul.toLowerCase().includes(search.toLowerCase()) ||
      s.dosenPembimbing.toLowerCase().includes(search.toLowerCase());

    const matchJenis = filterJenis === 'Semua' || s.jenis === filterJenis;
    return matchSearch && matchJenis;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mahasiswaNama || !form.judul) {
      alert('Harap isi nama mahasiswa dan judul skripsi.');
      return;
    }

    const newItem: JadwalSeminar = {
      id: `sem-${Date.now()}`,
      jenis: form.jenis,
      mahasiswaNama: form.mahasiswaNama,
      nim: form.nim,
      judul: form.judul,
      dosenPembimbing: form.dosenPembimbing,
      dosenPenguji1: form.dosenPenguji1,
      dosenPenguji2: form.dosenPenguji2,
      tanggal: form.tanggal,
      waktu: form.waktu,
      ruangan: form.ruangan,
      status: 'Terjadwal'
    };

    onAddSeminar(newItem);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4 text-[#002B49]" />
            <span>Jadwal Ujian & Kolokium Departemen Kimia</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Jadwal Seminar Proposal, Hasil & Ujian Skripsi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Departemen Kimia FSTeM Universitas Brawijaya • Monitoring ruang sidang dan susunan dewan penguji
          </p>
        </div>

        {(currentRole === 'admin' || currentRole === 'dosen' || currentRole === 'super_admin') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#002B49] text-[#D4AF37] font-bold rounded-lg text-xs hover:bg-[#003865] transition-colors shadow-sm flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Jadwalkan Seminar Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mahasiswa, judul, atau dosen..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49]"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['Semua', 'Seminar Proposal', 'Seminar Hasil', 'Ujian Skripsi'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterJenis(tab)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${
                filterJenis === tab
                  ? 'bg-[#002B49] text-[#D4AF37] font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List of Seminars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((sem) => (
          <div
            key={sem.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#002B49]/40 transition-colors text-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  sem.jenis === 'Seminar Proposal'
                    ? 'bg-blue-100 text-blue-800'
                    : sem.jenis === 'Seminar Hasil'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {sem.jenis}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  sem.status === 'Selesai'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {sem.status}
              </span>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm leading-snug">
                &ldquo;{sem.judul}&rdquo;
              </div>
              <div className="text-slate-600 mt-1 font-semibold">
                Mahasiswa: {sem.mahasiswaNama} ({sem.nim})
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-[11px] text-slate-700 border border-slate-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-[#002B49]" />
                <span>
                  {sem.tanggal} • {sem.waktu}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="w-3.5 h-3.5 text-[#002B49]" />
                <span>{sem.ruangan}</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <div>
                <strong>Pembimbing:</strong> {sem.dosenPembimbing}
              </div>
              <div>
                <strong>Penguji 1:</strong> {sem.dosenPenguji1}
              </div>
              <div>
                <strong>Penguji 2:</strong> {sem.dosenPenguji2}
              </div>
            </div>

            {sem.nilaiAkhir && (
              <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 font-bold flex justify-between items-center text-[11px]">
                <span>Nilai Akhir Ujian:</span>
                <span>{sem.nilaiAkhir} / 100 (Nilai A)</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL JADWAL BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between rounded-t-xl">
              <h3 className="font-bold text-sm">Penjadwalan Ujian / Seminar Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Sidang</label>
                  <select
                    value={form.jenis}
                    onChange={(e) => setForm({ ...form, jenis: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Seminar Proposal">Seminar Proposal</option>
                    <option value="Seminar Hasil">Seminar Hasil</option>
                    <option value="Ujian Skripsi">Ujian Skripsi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Mahasiswa</label>
                  <input
                    type="text"
                    required
                    value={form.mahasiswaNama}
                    onChange={(e) => setForm({ ...form, mahasiswaNama: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIM</label>
                  <input
                    type="text"
                    required
                    value={form.nim}
                    onChange={(e) => setForm({ ...form, nim: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Skripsi</label>
                <textarea
                  required
                  rows={2}
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    value={form.waktu}
                    onChange={(e) => setForm({ ...form, waktu: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ruangan</label>
                  <input
                    type="text"
                    value={form.ruangan}
                    onChange={(e) => setForm({ ...form, ruangan: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002B49] text-[#D4AF37] font-bold rounded hover:bg-[#003865]"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
