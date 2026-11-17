import React, { useState } from 'react';
import { Pengumuman, UserRole } from '../types/sikma';
import { BellRing, Calendar, User, Download, AlertCircle, FileText, CheckCircle2, Plus, Trash2, X, Upload, Megaphone } from 'lucide-react';

interface PengumumanViewProps {
  pengumumanList: Pengumuman[];
  currentUserRole: UserRole | string;
  currentUserName: string;
  onAddPengumuman: (pengumuman: Pengumuman) => void;
  onDeletePengumuman: (id: string) => void;
}

export const PengumumanView: React.FC<PengumumanViewProps> = ({
  pengumumanList,
  currentUserRole,
  currentUserName,
  onAddPengumuman,
  onDeletePengumuman
}) => {
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Form state for new announcement
  const [judul, setJudul] = useState<string>('');
  const [kategori, setKategori] = useState<Pengumuman['kategori']>('Akademik');
  const [isi, setIsi] = useState<string>('');
  const [penting, setPenting] = useState<boolean>(false);
  const [lampiranNama, setLampiranNama] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isAdminOrSuperAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin';

  const filtered = pengumumanList.filter((p) => {
    if (selectedKategori === 'Semua') return true;
    return p.kategori === selectedKategori;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) {
      alert('Mohon lengkapi Judul dan Isi Pengumuman terlebih dahulu!');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const newAnnouncement: Pengumuman = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      judul: judul.trim(),
      kategori,
      tanggal: formattedDate,
      penulis: currentUserName || (currentUserRole === 'super_admin' ? 'Super Admin SIKMA UB' : 'Admin Akademik Kimia UB'),
      isi: isi.trim(),
      penting
    };

    onAddPengumuman(newAnnouncement);
    setJudul('');
    setIsi('');
    setPenting(false);
    setLampiranNama('');
    setIsUploadModalOpen(false);
    setSuccessToast('Pengumuman baru berhasil dipublikasikan ke portal SIKMA Kimia UB!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <BellRing className="w-4 h-4 text-[#002B49]" />
            <span>Papan Informasi & Dokumen Resmi</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Pengumuman & Dokumen Akademik Kimia UB
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Departemen Kimia FSTeM Universitas Brawijaya • Surat edaran, pedoman skripsi, dan informasi akademik
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Upload Button for Admin & Super Admin */}
          {isAdminOrSuperAdmin && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#D4AF37]" />
              <span>Upload / Buat Pengumuman</span>
            </button>
          )}

          <div className="flex flex-wrap gap-1.5 text-xs">
            {['Semua', 'Akademik', 'Laboratorium', 'Skripsi', 'Beasiswa', 'Lowongan'].map((kat) => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                  selectedKategori === kat
                    ? 'bg-[#002B49] text-[#D4AF37] font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Download Center Quick Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
          Dokumen & Panduan Skripsi Kimia UB (Format Baku)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold text-slate-900">Pedoman Penulisan Skripsi Kimia</div>
                <div className="text-[11px] text-slate-500">PDF • Revisi 2026</div>
              </div>
            </div>
            <button
              onClick={() => alert('Mengunduh Pedoman Penulisan Skripsi Kimia FSTeM UB...')}
              className="p-2 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-bold text-slate-900">SOP Keselamatan Lab & Limbah B3</div>
                <div className="text-[11px] text-slate-500">PDF • FSTeM UB</div>
              </div>
            </div>
            <button
              onClick={() => alert('Mengunduh SOP Pengelolaan Limbah Laboratorium Kimia...')}
              className="p-2 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900">Template Proposal Skripsi Kimia</div>
                <div className="text-[11px] text-slate-500">DOCX • Siap Pakai</div>
              </div>
            </div>
            <button
              onClick={() => alert('Mengunduh Template Naskah Proposal Skripsi Kimia...')}
              className="p-2 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-[#002B49] rounded-full flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Belum Ada Pengumuman</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Belum ada pengumuman atau surat edaran yang dipublikasikan dalam kategori ini. {isAdminOrSuperAdmin ? 'Silakan klik tombol "Upload / Buat Pengumuman" di atas untuk menambahkan informasi baru.' : ''}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-6 rounded-xl border shadow-sm space-y-2 text-xs relative ${
                item.penting ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.kategori === 'Skripsi'
                        ? 'bg-amber-100 text-amber-800'
                        : item.kategori === 'Laboratorium'
                        ? 'bg-purple-100 text-purple-800'
                        : item.kategori === 'Beasiswa'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.kategori}
                  </span>
                  {item.penting && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Penting / Pengumuman Utama
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.tanggal}</span>
                  </div>

                  {isAdminOrSuperAdmin && (
                    <button
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus pengumuman "${item.judul}"?`)) {
                          onDeletePengumuman(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug">{item.judul}</h3>
              <p className="text-slate-700 leading-relaxed pt-1 text-[12px] whitespace-pre-line">{item.isi}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-[#002B49]">{item.penulis}</span>
                <span className="text-slate-400">SIKMA Kimia UB</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload / Create Announcement Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-[#002B49] text-[#D4AF37] rounded-xl flex items-center justify-center font-bold shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Upload / Buat Pengumuman Baru</h3>
                  <p className="text-[11px] text-slate-500">Siarkan informasi atau surat edaran ke seluruh pengguna SIKMA Kimia UB</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Judul Pengumuman <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Pengumuman Jadwal Seminar Hasil & Ujian Skripsi Periode..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002B49] text-xs outline-none bg-white font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kategori Pengumuman <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as Pengumuman['kategori'])}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002B49] text-xs font-bold text-slate-800 bg-white outline-none"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Laboratorium">Laboratorium</option>
                    <option value="Skripsi">Skripsi</option>
                    <option value="Beasiswa">Beasiswa</option>
                    <option value="Lowongan">Lowongan / Karir</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Penulis / Instansi Pengirim
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={currentUserName || (currentUserRole === 'super_admin' ? 'Super Admin SIKMA UB' : 'Admin Akademik Kimia UB')}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 text-xs font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Isi / Deskripsi Pengumuman <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  placeholder="Tuliskan detail pengumuman, instruksi, tautan, atau ketentuan penting yang perlu diketahui mahasiswa dan dosen..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002B49] text-xs outline-none bg-white leading-relaxed text-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="checkbox-penting"
                  checked={penting}
                  onChange={(e) => setPenting(e.target.checked)}
                  className="w-4 h-4 text-[#002B49] rounded border-slate-300 focus:ring-[#002B49] cursor-pointer"
                />
                <label htmlFor="checkbox-penting" className="font-bold text-slate-800 cursor-pointer">
                  Tandai sebagai Pengumuman Penting / Utama (sorot khusus)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#D4AF37]" />
                  <span>Publikasikan Pengumuman</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
