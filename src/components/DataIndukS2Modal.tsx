import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  GraduationCap,
  BookOpen,
  Save,
  Printer,
  RotateCcw,
  Building,
  Calendar,
  ExternalLink,
  Users,
  Award
} from 'lucide-react';
import { DataIndukMahasiswaS2, TesisMahasiswaItem } from '../types/sikma';
import { getDefaultDataIndukS2, INITIAL_DATA_INDUK_S2_MAP } from '../data/dataIndukS2List';

interface DataIndukS2ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent?: TesisMahasiswaItem | null;
  studentList: TesisMahasiswaItem[];
  dosenOptions: string[];
  onSaveSuccess?: (data: DataIndukMahasiswaS2) => void;
}

export const DataIndukS2Modal: React.FC<DataIndukS2ModalProps> = ({
  isOpen,
  onClose,
  selectedStudent,
  studentList,
  dosenOptions,
  onSaveSuccess
}) => {
  const [selectedNim, setSelectedNim] = useState<string>(selectedStudent?.nim || '');
  const [formData, setFormData] = useState<DataIndukMahasiswaS2>(() => {
    return getDefaultDataIndukS2(selectedStudent?.nim, selectedStudent?.namaMahasiswa);
  });
  const [notification, setNotification] = useState<string | null>(null);
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Sync when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      setSelectedNim(selectedStudent.nim);
      loadStudentData(selectedStudent.nim, selectedStudent);
    } else if (studentList.length > 0 && !selectedNim) {
      setSelectedNim(studentList[0].nim);
      loadStudentData(studentList[0].nim, studentList[0]);
    }
  }, [selectedStudent, studentList]);

  // Load student data from localStorage or initial map
  const loadStudentData = (nim: string, thesisItem?: TesisMahasiswaItem | null) => {
    try {
      const savedStore = localStorage.getItem('sikma_data_induk_s2');
      if (savedStore) {
        const parsed = JSON.parse(savedStore);
        if (parsed && parsed[nim]) {
          setFormData(parsed[nim]);
          return;
        }
      }
    } catch {
      // fallback
    }

    if (INITIAL_DATA_INDUK_S2_MAP[nim]) {
      setFormData({ ...INITIAL_DATA_INDUK_S2_MAP[nim] });
      return;
    }

    // fallback to thesisItem or default
    const item = thesisItem || studentList.find((s) => s.nim === nim);
    const defaults = getDefaultDataIndukS2(nim, item?.namaMahasiswa);
    if (item) {
      defaults.judul = item.judul || defaults.judul;
      defaults.judulInggris = item.judulInggris || defaults.judulInggris;
      defaults.dosenPembimbing1 = item.dosenPembimbing || defaults.dosenPembimbing1;
      defaults.dosenPembimbing2 = item.dosenPembimbing2 || defaults.dosenPembimbing2;
    }
    setFormData(defaults);
  };

  const handleSelectStudentChange = (newNim: string) => {
    setSelectedNim(newNim);
    loadStudentData(newNim);
  };

  const handleChange = <K extends keyof DataIndukMahasiswaS2>(field: K, value: DataIndukMahasiswaS2[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.nama || !formData.nim) {
      setNotification('Nama dan NIM wajib diisi.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const existing = localStorage.getItem('sikma_data_induk_s2');
      const store = existing ? JSON.parse(existing) : {};
      store[formData.nim] = formData;
      localStorage.setItem('sikma_data_induk_s2', JSON.stringify(store));
    } catch {
      // ignore
    }

    setNotification(`Data Induk Mahasiswa S2 (${formData.nama}) berhasil disimpan!`);
    setTimeout(() => setNotification(null), 3500);

    if (onSaveSuccess) {
      onSaveSuccess(formData);
    }
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan data ke nilai awal?')) {
      loadStudentData(selectedNim);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-auto border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Toast Notification */}
        {notification && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-white hover:text-emerald-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#002B49] via-[#003865] to-[#001f35] text-white flex items-center justify-between border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">Data Induk Mahasiswa S2</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                  Magister Kimia
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Biodata Pribadi, Riwayat Pendidikan Sarjana, dan Data Akhir Pendidikan Tesis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrintPreview(!isPrintPreview)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/15"
              title="Pratinjau / Cetak Lembar Data Induk"
            >
              <Printer className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">{isPrintPreview ? 'Edit Form' : 'Cetak Dokumen'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Student Switcher Bar */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-slate-700">Pilih Data Mahasiswa:</span>
            <select
              value={selectedNim}
              onChange={(e) => handleSelectStudentChange(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#002B49] focus:outline-none cursor-pointer max-w-xs truncate"
            >
              {studentList.map((m) => (
                <option key={m.nim} value={m.nim}>
                  {m.nim} - {m.namaMahasiswa}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tersinkronisasi dengan Database Tesis Mahasiswa</span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-slate-50/50">
          {isPrintPreview ? (
            /* PRINT PREVIEW / OFFICIAL SHEET */
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6 print:m-0 print:border-none print:shadow-none text-slate-900">
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h4 className="text-xs uppercase tracking-widest font-bold text-slate-600">
                  Kementerian Pendidikan Tinggi, Sains, dan Teknologi
                </h4>
                <h3 className="text-base font-extrabold uppercase text-slate-900">
                  Universitas Brawijaya • Fakultas Sains dan Teknologi Terapan
                </h3>
                <h2 className="text-sm font-black uppercase text-[#002B49] mt-1">
                  Departemen Kimia • Program Studi Magister (S2) Kimia
                </h2>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded text-xs font-bold uppercase tracking-wider text-slate-800">
                  Lembar Data Induk Mahasiswa S2
                </div>
              </div>

              {/* Box 1 Print */}
              <div className="space-y-2">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 rounded">
                  1. Data Pribadi
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-1/3 py-1 text-slate-500 font-semibold">Nama Lengkap</td>
                      <td className="w-2/3 py-1 font-bold text-slate-900">{formData.nama}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">NIM</td>
                      <td className="py-1 font-mono font-bold text-slate-900">{formData.nim}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Tempat, Tanggal Lahir</td>
                      <td className="py-1">{formData.tempatLahir}, {formData.tanggalLahir}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Agama / Jenis Kelamin</td>
                      <td className="py-1">{formData.agama} / {formData.jenisKelamin}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Status Perkawinan</td>
                      <td className="py-1">{formData.statusPerkawinan}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Alamat di Malang</td>
                      <td className="py-1">{formData.alamatDiMalang}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Nama Orang Tua (Ayah / Ibu)</td>
                      <td className="py-1">{formData.namaAyah} / {formData.namaIbu}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">No. Kartu Keluarga (KK)</td>
                      <td className="py-1 font-mono">{formData.noKk}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Instansi Asal</td>
                      <td className="py-1">{formData.instansiAsal}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-500 font-semibold">Link Korlap</td>
                      <td className="py-1 text-blue-600 underline">{formData.linkKorlap}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Box 2 Print */}
              <div className="space-y-2">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 rounded">
                  2. Riwayat Pendidikan Sarjana
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-1/3 py-1 text-slate-500 font-semibold">Perguruan Tinggi Asal</td>
                      <td className="w-2/3 py-1 font-bold text-slate-900">{formData.universitas}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Program Studi / Gelar</td>
                      <td className="py-1">{formData.programStudiSarjana} ({formData.gelar})</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Tahun Kelulusan / IPK / SKS</td>
                      <td className="py-1">Tahun {formData.tahunLulus} • IPK: {formData.ipk} • {formData.sks} SKS</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Box 3 Print */}
              <div className="space-y-2">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 rounded">
                  3. Data Akhir Pendidikan (Magister)
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-1/3 py-1 text-slate-500 font-semibold">Departemen / Program Studi</td>
                      <td className="w-2/3 py-1 font-bold text-slate-900">{formData.departemen} / {formData.programStudi}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Judul Tesis (Bahasa Indonesia)</td>
                      <td className="py-1 font-semibold text-slate-900">{formData.judul}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Judul Tesis (in English)</td>
                      <td className="py-1 italic text-slate-700">{formData.judulInggris}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-semibold">Dosen Pembimbing 1 (Utama)</td>
                      <td className="py-1 font-semibold text-slate-900">{formData.dosenPembimbing1}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-500 font-semibold">Dosen Pembimbing 2</td>
                      <td className="py-1 font-semibold text-slate-900">{formData.dosenPembimbing2}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-6 border-t border-slate-300 flex justify-end gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#002B49] text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-yellow-400" />
                  <span>Cetak Lembar Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintPreview(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Kembali ke Form
                </button>
              </div>
            </div>
          ) : (
            /* 3 BOXES FORM */
            <form onSubmit={handleSave} className="space-y-6">
              {/* ======================================================== */}
              {/* 1. DATA PRIBADI (BOX 1) */}
              {/* ======================================================== */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                      <User className="w-4 h-4 text-[#002B49]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">1. Data Pribadi</h4>
                      <p className="text-[11px] text-slate-500">Identitas kependudukan dan biodata mahasiswa S2</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    Box 1
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Nama */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => handleChange('nama', e.target.value)}
                      placeholder="Nama lengkap mahasiswa dan gelar"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* NiM */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      NIM <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nim}
                      onChange={(e) => handleChange('nim', e.target.value)}
                      placeholder="Nomor Induk Mahasiswa S2"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Tempat Lahir */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.tempatLahir}
                      onChange={(e) => handleChange('tempatLahir', e.target.value)}
                      placeholder="Kota/Kabupaten kelahiran"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tanggal Lahir</span>
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalLahir}
                      onChange={(e) => handleChange('tanggalLahir', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Agama (select : Islam, Kristen, Katolik, Hindu, Budha, Khonghucu) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agama</label>
                    <select
                      value={formData.agama}
                      onChange={(e) => handleChange('agama', e.target.value as DataIndukMahasiswaS2['agama'])}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Budha">Budha</option>
                      <option value="Khonghucu">Khonghucu</option>
                    </select>
                  </div>

                  {/* Jenis Kelamin (select : Perempuan, Laki-Laki) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={formData.jenisKelamin}
                      onChange={(e) => handleChange('jenisKelamin', e.target.value as DataIndukMahasiswaS2['jenisKelamin'])}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                    >
                      <option value="Perempuan">Perempuan</option>
                      <option value="Laki-Laki">Laki-Laki</option>
                    </select>
                  </div>

                  {/* Status Perkawinan (select : Belum Menikah, Menikah, Cerai Hidup, Cerai Mati) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Perkawinan</label>
                    <select
                      value={formData.statusPerkawinan}
                      onChange={(e) =>
                        handleChange('statusPerkawinan', e.target.value as DataIndukMahasiswaS2['statusPerkawinan'])
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                    >
                      <option value="Belum Menikah">Belum Menikah</option>
                      <option value="Menikah">Menikah</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                  </div>

                  {/* No KK */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No KK</label>
                    <input
                      type="text"
                      value={formData.noKk}
                      onChange={(e) => handleChange('noKk', e.target.value)}
                      placeholder="Nomor Kartu Keluarga (16 digit)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Link Korlap */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                        <span>Link Korlap</span>
                      </span>
                      {formData.linkKorlap && (
                        <a
                          href={formData.linkKorlap}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline"
                        >
                          Buka Link
                        </a>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.linkKorlap}
                      onChange={(e) => handleChange('linkKorlap', e.target.value)}
                      placeholder="https://korlap.ub.ac.id/mhs/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px] focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Nama Ayah */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Ayah</label>
                    <input
                      type="text"
                      value={formData.namaAyah}
                      onChange={(e) => handleChange('namaAyah', e.target.value)}
                      placeholder="Nama lengkap ayah kandung"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Nama Ibu */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Ibu</label>
                    <input
                      type="text"
                      value={formData.namaIbu}
                      onChange={(e) => handleChange('namaIbu', e.target.value)}
                      placeholder="Nama lengkap ibu kandung"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Instansi Asal (Bila Tugas/Ijin Belajar) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Instansi Asal <span className="text-[10px] font-normal text-slate-500">(Bila Tugas/Ijin Belajar)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.instansiAsal}
                      onChange={(e) => handleChange('instansiAsal', e.target.value)}
                      placeholder="Contoh: BRIN / PT Pupuk Indonesia / - "
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Alamat di Malang */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">Alamat di Malang</label>
                    <textarea
                      rows={2}
                      value={formData.alamatDiMalang}
                      onChange={(e) => handleChange('alamatDiMalang', e.target.value)}
                      placeholder="Alamat domisili atau tempat tinggal kos/kontrak di Malang"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* 2. RIWAYAT PENDIDIKAN SARJANA (BOX 2) */}
              {/* ======================================================== */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">2. Riwayat Pendidikan Sarjana</h4>
                      <p className="text-[11px] text-slate-500">
                        Data kelulusan jenjang sarjana (S1 / D4) sebelumnya
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                    Box 2
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Tahun Lulus */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tahun Lulus</label>
                    <input
                      type="text"
                      value={formData.tahunLulus}
                      onChange={(e) => handleChange('tahunLulus', e.target.value)}
                      placeholder="Contoh: 2023"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* IPK */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">IPK</label>
                    <input
                      type="text"
                      value={formData.ipk}
                      onChange={(e) => handleChange('ipk', e.target.value)}
                      placeholder="Contoh: 3.85"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-amber-800 focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* SKS */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SKS</label>
                    <input
                      type="text"
                      value={formData.sks}
                      onChange={(e) => handleChange('sks', e.target.value)}
                      placeholder="Contoh: 144"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Gelar */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gelar</label>
                    <input
                      type="text"
                      value={formData.gelar}
                      onChange={(e) => handleChange('gelar', e.target.value)}
                      placeholder="Contoh: S.Si. / S.T. / S.Pd."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Program Studi */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Program Studi</label>
                    <input
                      type="text"
                      value={formData.programStudiSarjana}
                      onChange={(e) => handleChange('programStudiSarjana', e.target.value)}
                      placeholder="Contoh: S1 Kimia"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>

                  {/* Universitas */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>Universitas</span>
                    </label>
                    <input
                      type="text"
                      value={formData.universitas}
                      onChange={(e) => handleChange('universitas', e.target.value)}
                      placeholder="Nama Perguruan Tinggi asal"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* 3. DATA AKHIR PENDIDIKAN (BOX 3) */}
              {/* ======================================================== */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">3. Data Akhir Pendidikan</h4>
                      <p className="text-[11px] text-slate-500">
                        Departemen, Program Studi, Judul Tesis (ID &amp; EN), dan Dosen Pembimbing S2
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Box 3
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Departemen */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Departemen</label>
                      <input
                        type="text"
                        value={formData.departemen}
                        onChange={(e) => handleChange('departemen', e.target.value)}
                        placeholder="Contoh: Kimia"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-[#002B49] bg-white"
                      />
                    </div>

                    {/* Program Studi */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Program Studi</label>
                      <input
                        type="text"
                        value={formData.programStudi}
                        onChange={(e) => handleChange('programStudi', e.target.value)}
                        placeholder="Contoh: Magister Kimia (S2)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-[#002B49] bg-white"
                      />
                    </div>
                  </div>

                  {/* Judul Tesis (Bahasa Indonesia) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Judul</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.judul}
                      onChange={(e) => handleChange('judul', e.target.value)}
                      placeholder="Judul Tesis dalam Bahasa Indonesia"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white resize-y"
                    />
                  </div>

                  {/* Judul (in English) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <span className="italic font-bold text-slate-800">Judul (in English)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.judulInggris}
                      onChange={(e) => handleChange('judulInggris', e.target.value)}
                      placeholder="Thesis Title in English"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium italic focus:ring-2 focus:ring-[#002B49] bg-white resize-y text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dosen Pembimbing 1 */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Dosen Pembimbing 1 (Utama)
                      </label>
                      <div className="space-y-1">
                        <select
                          value={
                            dosenOptions.includes(formData.dosenPembimbing1)
                              ? formData.dosenPembimbing1
                              : '__custom__'
                          }
                          onChange={(e) => {
                            if (e.target.value !== '__custom__') {
                              handleChange('dosenPembimbing1', e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                        >
                          <option value="">-- Pilih dari Database Dosen --</option>
                          {dosenOptions.map((dos) => (
                            <option key={dos} value={dos}>
                              {dos}
                            </option>
                          ))}
                          <option value="__custom__">-- Masukkan Manual / Lainnya --</option>
                        </select>
                        <input
                          type="text"
                          value={formData.dosenPembimbing1}
                          onChange={(e) => handleChange('dosenPembimbing1', e.target.value)}
                          placeholder="Nama lengkap Dosen Pembimbing 1 dengan gelar"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* Dosen Pembimbing 2 */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Dosen Pembimbing 2
                      </label>
                      <div className="space-y-1">
                        <select
                          value={
                            dosenOptions.includes(formData.dosenPembimbing2)
                              ? formData.dosenPembimbing2
                              : '__custom__'
                          }
                          onChange={(e) => {
                            if (e.target.value !== '__custom__') {
                              handleChange('dosenPembimbing2', e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                        >
                          <option value="">-- Pilih dari Database Dosen --</option>
                          {dosenOptions.map((dos) => (
                            <option key={dos} value={dos}>
                              {dos}
                            </option>
                          ))}
                          <option value="__custom__">-- Masukkan Manual / Lainnya --</option>
                        </select>
                        <input
                          type="text"
                          value={formData.dosenPembimbing2}
                          onChange={(e) => handleChange('dosenPembimbing2', e.target.value)}
                          placeholder="Nama lengkap Dosen Pembimbing 2 dengan gelar"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Nilai Awal</span>
                </button>

                <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4 text-yellow-400" />
                    <span>Simpan Data Induk</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
