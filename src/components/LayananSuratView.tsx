import React, { useState } from 'react';
import { SuratPengajuan, Mahasiswa, UserRole } from '../types/sikma';
import {
  FileText,
  Plus,
  Printer,
  CheckCircle,
  Clock,
  Send,
  Building,
  QrCode,
  X,
  FileCheck2
} from 'lucide-react';

interface LayananSuratViewProps {
  currentRole: UserRole;
  student: Mahasiswa;
  suratList: SuratPengajuan[];
  onAddSurat: (surat: SuratPengajuan) => void;
}

export const LayananSuratView: React.FC<LayananSuratViewProps> = ({
  currentRole,
  student,
  suratList,
  onAddSurat
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewSurat, setPreviewSurat] = useState<SuratPengajuan | null>(null);

  const [formData, setFormData] = useState({
    jenis: 'Surat Izin Penelitian Laboratorium' as SuratPengajuan['jenis'],
    tujuan: '',
    keperluan: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tujuan || !formData.keperluan) {
      alert('Harap lengkapi tujuan instansi dan rincian keperluan surat.');
      return;
    }

    const newSurat: SuratPengajuan = {
      id: `srt-${Date.now()}`,
      nomorSurat: `${Math.floor(1000 + Math.random() * 9000)}/UN10.F09/AK/2026`,
      jenis: formData.jenis,
      mahasiswaId: student.id,
      mahasiswaNama: student.nama,
      nim: student.nim,
      tujuan: formData.tujuan,
      keperluan: formData.keperluan,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      status: 'Diajukan'
    };

    onAddSurat(newSurat);
    setIsModalOpen(false);
    setFormData({
      jenis: 'Surat Izin Penelitian Laboratorium',
      tujuan: '',
      keperluan: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#002B49]" />
            <span>Layanan Administrasi Akademik Departemen Kimia</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Layanan Surat Izin & Pengantar Akademik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan surat pengantar izin instrumen laboratorium, magang industri kimia, dan surat keterangan resmi
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#002B49] text-[#D4AF37] font-bold rounded-lg text-xs hover:bg-[#003865] transition-colors shadow-sm flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Surat Baru</span>
        </button>
      </div>

      {/* Surat List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-[#002B49] text-white flex justify-between items-center text-xs">
          <span className="font-bold flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#D4AF37]" />
            Riwayat Pengajuan Surat Akademik Mahasiswa
          </span>
          <span>{suratList.length} Berkas Tercatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">No</th>
                <th className="px-4 py-3">Nomor Surat</th>
                <th className="px-4 py-3">Jenis Permohonan Surat</th>
                <th className="px-4 py-3">Instansi / Laboratorium Tujuan</th>
                <th className="px-4 py-3">Tanggal Pengajuan</th>
                <th className="px-4 py-3 text-center">Status Berkas</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suratList.map((srt, idx) => (
                <tr key={srt.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-center font-medium text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    {srt.nomorSurat || 'Sedang Diproses'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{srt.jenis}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[220px]">
                    <div className="line-clamp-1 font-medium">{srt.tujuan}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{srt.keperluan}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{srt.tanggalPengajuan}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        srt.status.includes('Disetujui')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {srt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPreviewSurat(srt)}
                      className="px-2.5 py-1 bg-[#002B49] text-white rounded text-[11px] font-semibold hover:bg-[#003865]"
                    >
                      Lihat & Cetak
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PENGAJUAN SURAT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  Permohonan Surat Akademik Kimia UB
                </h3>
                <p className="text-[11px] text-slate-300">
                  Layanan administrasi online Departemen Kimia FSTeM
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Surat</label>
                <select
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49] bg-white"
                >
                  <option value="Surat Izin Penelitian Laboratorium">
                    Surat Izin Penelitian Laboratorium (UPT / Lab Eksternal)
                  </option>
                  <option value="Surat Pengantar PKL/Magang">
                    Surat Pengantar Praktik Kerja Lapangan (PKL) / Industri
                  </option>
                  <option value="Surat Keterangan Bebas Lab">
                    Surat Keterangan Bebas Laboratorium Kimia
                  </option>
                  <option value="Surat Aktif Kuliah">
                    Surat Keterangan Mahasiswa Aktif
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instansi / Pihak / Laboratorium Tujuan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tujuan}
                  onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                  placeholder="Contoh: Kepala Pusat Riset Kimia - BRIN Cibinong"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keperluan / Rincian Instrumen / Judul Riset *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.keperluan}
                  onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                  placeholder="Contoh: Analisis spektroskopi NMR 500 MHz dan HRMS untuk sampel fraksi isolat bahan alam minyak cengkeh..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#002B49]"
                />
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
                  Kirim Permohonan Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW SURAT RESMI KOP UB */}
      {previewSurat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 text-slate-900">
            {/* Top Toolbar */}
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between">
              <div className="font-bold text-xs">
                Pratinjau Dokumen Resmi: {previewSurat.nomorSurat}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-[#D4AF37] text-[#002B49] rounded font-bold text-xs hover:bg-[#c8961e] flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat</span>
                </button>
                <button
                  onClick={() => setPreviewSurat(null)}
                  className="text-slate-300 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Letter Paper */}
            <div className="p-8 space-y-6 text-xs font-serif leading-relaxed bg-white">
              {/* Kop Surat Universitas Brawijaya */}
              <div className="border-b-2 border-slate-900 pb-3 text-center space-y-0.5">
                <div className="text-[11px] font-sans font-bold tracking-wider text-slate-800 uppercase">
                  Kementerian Pendidikan Tinggi, Sains, dan Teknologi
                </div>
                <div className="text-sm font-sans font-extrabold text-[#002B49] tracking-tight">
                  UNIVERSITAS BRAWIJAYA
                </div>
                <div className="text-xs font-sans font-bold text-slate-900">
                  FAKULTAS MATEMATIKA DAN ILMU PENGETAHUAN ALAM
                </div>
                <div className="text-xs font-sans font-extrabold text-[#002B49]">
                  DEPARTEMEN KIMIA
                </div>
                <div className="text-[10px] font-sans text-slate-600">
                  Gedung Kimia FSTeM UB, Jl. Veteran Malang 65145 • Telp: (0341) 575838 • Email: kimia@ub.ac.id
                </div>
              </div>

              {/* Nomor Surat & Tanggal */}
              <div className="flex justify-between items-start pt-2">
                <div className="space-y-0.5">
                  <div><strong>Nomor :</strong> {previewSurat.nomorSurat}</div>
                  <div><strong>Lampiran :</strong> -</div>
                  <div><strong>Perihal :</strong> Permohonan {previewSurat.jenis}</div>
                </div>
                <div>Malang, {previewSurat.tanggalPengajuan}</div>
              </div>

              {/* Penerima */}
              <div>
                <div>Kepada Yth.</div>
                <div className="font-bold">{previewSurat.tujuan}</div>
                <div>di Tempat</div>
              </div>

              {/* Isi Surat */}
              <div className="space-y-3 text-justify">
                <p>
                  Dengan hormat,
                </p>
                <p>
                  Sehubungan dengan pelaksanaan kegiatan penelitian Tugas Akhir / Skripsi mahasiswa
                  Program Studi S1 Kimia FSTeM Universitas Brawijaya, bersama ini kami memohonkan izin
                  bagi mahasiswa berikut:
                </p>

                <div className="pl-6 space-y-1 font-sans">
                  <div><strong>Nama :</strong> {student.nama}</div>
                  <div><strong>NIM :</strong> {student.nim}</div>
                  <div><strong>Program Studi :</strong> S1 Kimia FSTeM Universitas Brawijaya</div>
                  <div><strong>Dosen Pembimbing :</strong> {student.dosenPembimbing1Nama}</div>
                </div>

                <p>
                  Untuk dapat diizinkan melaksanakan kegiatan analisis laboratorium / keperluan:
                </p>
                <div className="p-3 bg-slate-50 border rounded font-sans italic">
                  &ldquo;{previewSurat.keperluan}&rdquo;
                </div>

                <p>
                  Demikian surat permohonan ini kami sampaikan. Atas perhatian, bantuan, dan kerja sama
                  yang baik kami ucapkan terima kasih.
                </p>
              </div>

              {/* Tanda Tangan & QR Verification */}
              <div className="pt-6 flex justify-between items-end font-sans">
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-16 border border-slate-300 p-1 rounded bg-white">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    <div>Dokumen ini sah secara digital</div>
                    <div>SIKMA Kimia UB (CodeIgniter 3)</div>
                  </div>
                </div>

                <div className="text-right">
                  <div>Ketua Departemen Kimia</div>
                  <div>FSTeM Universitas Brawijaya</div>
                  <div className="h-12 flex items-center justify-end">
                    <span className="text-emerald-700 font-bold text-xs italic">
                      [Tanda Tangan Digital Tersertifikasi]
                    </span>
                  </div>
                  <div className="font-bold text-[#002B49]">Masruri, S.Si., M.Si., Ph.D</div>
                  <div className="text-[10px] text-slate-500">NIP. 197008121997021001</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
