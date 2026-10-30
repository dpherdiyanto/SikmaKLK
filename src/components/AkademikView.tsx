import React, { useState, useMemo, useEffect } from 'react';
import { Mahasiswa, MataKuliah, NilaiKHS, UserRole, BidangKeahlianKimia } from '../types/sikma';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  QrCode,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  Building2,
  User,
  X,
  ExternalLink,
  Award,
  Check,
  Info,
  Pencil,
  AlertTriangle,
  Layers,
  MapPin
} from 'lucide-react';

interface AkademikViewProps {
  currentRole: UserRole;
  student: Mahasiswa;
  availableCourses: MataKuliah[];
  transcript: NilaiKHS[];
}

export const AkademikView: React.FC<AkademikViewProps> = ({
  currentRole,
  student,
  availableCourses,
  transcript
}) => {
  const [subTab, setSubTab] = useState<'krs' | 'khs'>('krs');
  const [selectedSemesterKHS, setSelectedSemesterKHS] = useState<number | 'Semua'>('Semua');
  const [searchKHS, setSearchKHS] = useState<string>('');

  // Manage transcript in state with persistent storage
  const [transcriptList, setTranscriptList] = useState<NilaiKHS[]>(() => {
    const saved = localStorage.getItem('sikma_transkrip_nilai');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return transcript;
  });

  useEffect(() => {
    localStorage.setItem('sikma_transkrip_nilai', JSON.stringify(transcriptList));
  }, [transcriptList]);

  // Edit and Delete state for Transcript
  const [editingTranscriptItem, setEditingTranscriptItem] = useState<{
    originalKode: string;
    originalSemester: number;
    form: {
      kode: string;
      nama: string;
      semester: number;
      sks: number;
      nilaiHuruf: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'E';
      nilaiAngka: number;
    };
  } | null>(null);

  const [deletingTranscriptItem, setDeletingTranscriptItem] = useState<NilaiKHS | null>(null);

  const getNilaiAngkaFromHuruf = (huruf: string): number => {
    switch (huruf) {
      case 'A':
        return 4.0;
      case 'B+':
        return 3.5;
      case 'B':
        return 3.0;
      case 'C+':
        return 2.5;
      case 'C':
        return 2.0;
      case 'D':
        return 1.0;
      case 'E':
        return 0.0;
      default:
        return 4.0;
    }
  };

  const handleOpenEditModal = (item: NilaiKHS) => {
    setEditingTranscriptItem({
      originalKode: item.kode,
      originalSemester: item.semester,
      form: {
        kode: item.kode,
        nama: item.nama,
        semester: item.semester,
        sks: item.sks,
        nilaiHuruf: item.nilaiHuruf,
        nilaiAngka: item.nilaiAngka
      }
    });
  };

  const handleSaveEditTranscript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTranscriptItem) return;
    const { originalKode, originalSemester, form } = editingTranscriptItem;
    setTranscriptList((prev) =>
      prev.map((item) =>
        item.kode === originalKode && item.semester === originalSemester
          ? { ...form }
          : item
      )
    );
    setKrsNotice(`Data mata kuliah [${form.kode}] ${form.nama} berhasil diperbarui.`);
    setEditingTranscriptItem(null);
  };

  const handleConfirmDeleteTranscript = () => {
    if (!deletingTranscriptItem) return;
    setTranscriptList((prev) =>
      prev.filter(
        (item) =>
          !(
            item.kode === deletingTranscriptItem.kode &&
            item.semester === deletingTranscriptItem.semester
          )
      )
    );
    setKrsNotice(
      `Mata kuliah [${deletingTranscriptItem.kode}] ${deletingTranscriptItem.nama} berhasil dihapus dari transkrip nilai.`
    );
    setDeletingTranscriptItem(null);
  };

  // Enrolled courses state for interactive KRS (Semester 7)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([
    'mk-1', // MAK62505 - Kimia Organik Bahan Alam (3 SKS)
    'mk-2', // MAK62204 - Teknik Pemisahan Analitik & Kromatografi Lanjut (3 SKS)
    'mk-5', // MAK60001 - Metodologi Penelitian Kimia & Etika Riset (2 SKS)
    'mk-6'  // MAK60099 - Tugas Akhir / Skripsi Kimia (6 SKS)
  ]);

  // Manage all available elective courses in state with localStorage persistence
  const [electiveCoursesList, setElectiveCoursesList] = useState<MataKuliah[]>(() => {
    const saved = localStorage.getItem('sikma_available_courses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return availableCourses;
  });

  useEffect(() => {
    localStorage.setItem('sikma_available_courses', JSON.stringify(electiveCoursesList));
  }, [electiveCoursesList]);

  // State Modal Tambah Mata Kuliah Pilihan
  const [isAddElectiveModalOpen, setIsAddElectiveModalOpen] = useState(false);
  const [electiveForm, setElectiveForm] = useState({
    kode: '',
    nama: '',
    kbk: 'Kimia Organik' as BidangKeahlianKimia,
    sks: 3,
    dosenPengampu: 'Masruri, S.Si., M.Si., Ph.D',
    waktuHari: 'Senin',
    waktuJamMulai: '08.00',
    waktuJamSelesai: '10.30',
    ruang: 'R. Kuliah Kimia 1.1 FMIPA'
  });
  const [formElectiveError, setFormElectiveError] = useState<string | null>(null);

  const resetElectiveForm = () => {
    setElectiveForm({
      kode: '',
      nama: '',
      kbk: 'Kimia Organik',
      sks: 3,
      dosenPengampu: 'Masruri, S.Si., M.Si., Ph.D',
      waktuHari: 'Senin',
      waktuJamMulai: '08.00',
      waktuJamSelesai: '10.30',
      ruang: 'R. Kuliah Kimia 1.1 FMIPA'
    });
    setFormElectiveError(null);
  };

  const handleOpenAddElectiveModal = () => {
    resetElectiveForm();
    setIsAddElectiveModalOpen(true);
  };

  const handleSubmitAddElective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!electiveForm.kode.trim()) {
      setFormElectiveError('Kode Mata Kuliah wajib diisi.');
      return;
    }
    if (!electiveForm.nama.trim()) {
      setFormElectiveError('Nama Mata Kuliah Pilihan wajib diisi.');
      return;
    }
    if (!electiveForm.dosenPengampu.trim()) {
      setFormElectiveError('Nama Dosen Pengampu wajib diisi.');
      return;
    }

    // Check duplicate code
    const cleanKode = electiveForm.kode.trim().toUpperCase();
    const existing = electiveCoursesList.find(
      (c) => c.kode.toUpperCase() === cleanKode
    );
    if (existing) {
      setFormElectiveError(`Kode mata kuliah ${cleanKode} sudah terdaftar (${existing.nama}).`);
      return;
    }

    const newElective: MataKuliah = {
      id: `mk-custom-${Date.now()}`,
      kode: cleanKode,
      nama: electiveForm.nama.trim(),
      sks: Number(electiveForm.sks) || 3,
      semester: 7,
      sifat: 'Pilihan',
      kbk: electiveForm.kbk,
      dosenPengampu: electiveForm.dosenPengampu.trim(),
      jadwal: `${electiveForm.waktuHari}, ${electiveForm.waktuJamMulai} - ${electiveForm.waktuJamSelesai} WIB`,
      ruang: electiveForm.ruang.trim()
    };

    setElectiveCoursesList((prev) => [newElective, ...prev]);
    setKrsNotice(`Mata kuliah pilihan baru [${newElective.kode}] ${newElective.nama} (${newElective.kbk}) berhasil ditambahkan dan disinkronkan ke daftar pilihan.`);
    setIsAddElectiveModalOpen(false);
    resetElectiveForm();
  };

  const [selectedKbkFilter, setSelectedKbkFilter] = useState<string>('Semua');
  const [searchKrsAvailable, setSearchKrsAvailable] = useState<string>('');
  const [krsStatus, setKrsStatus] = useState<'Disetujui Dosen PA' | 'Menunggu Verifikasi PA'>('Disetujui Dosen PA');
  const [krsNotice, setKrsNotice] = useState<string | null>(null);

  // Modal print preview
  const [showPrintModal, setShowPrintModal] = useState<'krs' | 'transkrip' | null>(null);

  // Compute Enrolled list
  const enrolledCourses = useMemo(() => {
    return electiveCoursesList.filter((mk) => enrolledCourseIds.includes(mk.id));
  }, [electiveCoursesList, enrolledCourseIds]);

  const totalSksKRS = useMemo(() => {
    return enrolledCourses.reduce((acc, mk) => acc + mk.sks, 0);
  }, [enrolledCourses]);

  // Handle Add course to KRS
  const handleEnrollCourse = (courseId: string) => {
    const course = electiveCoursesList.find((c) => c.id === courseId);
    if (!course) return;

    if (totalSksKRS + course.sks > 24) {
      alert('Batas beban studi maksimum mahasiswa adalah 24 SKS per semester.');
      return;
    }

    setEnrolledCourseIds((prev) => [...prev, courseId]);
    setKrsStatus('Menunggu Verifikasi PA');
    setKrsNotice(`Mata kuliah [${course.kode}] ${course.nama} (${course.sks} SKS) berhasil ditambahkan ke KRS. Menunggu verifikasi Dosen PA.`);
  };

  // Handle Drop course from KRS
  const handleDropCourse = (courseId: string) => {
    const course = electiveCoursesList.find((c) => c.id === courseId);
    if (!course) return;

    if (
      course.kode === 'MAK60099' ||
      course.kode === 'MAK6099' ||
      course.nama.toLowerCase().includes('skripsi')
    ) {
      if (
        !window.confirm(
          'Apakah Anda yakin ingin membatalkan Tugas Akhir / Skripsi Kimia dari KRS semester ini? Pembatalan skripsi membutuhkan persetujuan Dosen Pembimbing dan KPS.'
        )
      ) {
        return;
      }
    }

    setEnrolledCourseIds((prev) => prev.filter((id) => id !== courseId));
    setKrsStatus('Menunggu Verifikasi PA');
    setKrsNotice(`Mata kuliah [${course.kode}] ${course.nama} dibatalkan dari KRS.`);
  };

  // PA Approval action for Dosen/Admin role
  const handleApproveKRS = () => {
    setKrsStatus('Disetujui Dosen PA');
    setKrsNotice('KRS Mahasiswa telah berhasil disahkan & diverifikasi oleh Penasihat Akademik (PA).');
  };

  // Filtered KHS Transcript
  const filteredTranscript = useMemo(() => {
    let list = transcriptList;
    if (selectedSemesterKHS !== 'Semua') {
      list = transcriptList.filter((n) => n.semester === selectedSemesterKHS);
    }
    if (searchKHS.trim()) {
      const q = searchKHS.toLowerCase();
      list = list.filter(
        (n) => n.kode.toLowerCase().includes(q) || n.nama.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transcriptList, selectedSemesterKHS, searchKHS]);

  // Statistics for KHS
  const statsKHS = useMemo(() => {
    let totalSks = 0;
    let totalBobot = 0;
    const gradeDist: Record<string, number> = { A: 0, 'B+': 0, B: 0, 'C+': 0, C: 0, D: 0, E: 0 };

    transcriptList.forEach((item) => {
      totalSks += item.sks;
      totalBobot += item.sks * item.nilaiAngka;
      gradeDist[item.nilaiHuruf] = (gradeDist[item.nilaiHuruf] || 0) + item.sks;
    });

    const ipk = totalSks > 0 ? (totalBobot / totalSks).toFixed(2) : '0.00';
    return { totalSks, ipk, gradeDist };
  }, [transcriptList]);

  // Stats for currently filtered semester in KHS
  const semesterStats = useMemo(() => {
    if (selectedSemesterKHS === 'Semua') {
      return {
        label: 'Seluruh Semester (Kumulatif 1 - 6)',
        sks: statsKHS.totalSks,
        ip: statsKHS.ipk,
        isCumulative: true
      };
    }
    if (selectedSemesterKHS === 7) {
      return {
        label: 'Semester 7 (KRS Berjalan)',
        sks: totalSksKRS,
        ip: 'Dalam Proses',
        isCumulative: false
      };
    }
    const semCourses = transcriptList.filter((n) => n.semester === selectedSemesterKHS);
    let sSks = 0;
    let sBobot = 0;
    semCourses.forEach((n) => {
      sSks += n.sks;
      sBobot += n.sks * n.nilaiAngka;
    });
    const ips = sSks > 0 ? (sBobot / sSks).toFixed(2) : '0.00';
    return {
      label: `Semester ${selectedSemesterKHS}`,
      sks: sSks,
      ip: ips,
      isCumulative: false
    };
  }, [selectedSemesterKHS, transcriptList, statsKHS, totalSksKRS]);

  // Filtered available electives in KRS tab
  const filteredAvailableElectives = useMemo(() => {
    return electiveCoursesList
      .filter((c) => !enrolledCourseIds.includes(c.id))
      .filter((c) => {
        if (selectedKbkFilter === 'Semua') return true;
        return c.kbk === selectedKbkFilter;
      })
      .filter((c) => {
        if (!searchKrsAvailable.trim()) return true;
        const q = searchKrsAvailable.toLowerCase();
        return (
          c.kode.toLowerCase().includes(q) ||
          c.nama.toLowerCase().includes(q) ||
          c.dosenPengampu.toLowerCase().includes(q)
        );
      });
  }, [electiveCoursesList, enrolledCourseIds, selectedKbkFilter, searchKrsAvailable]);

  // List of KBK options for filter
  const kbkOptions = ['Semua', 'Kimia Organik', 'Kimia Analitik', 'Kimia Anorganik', 'Kimia Fisik', 'Biokimia', 'Umum'];

  return (
    <div className="space-y-6">
      {/* Top Academic Profile Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-[#002B49] text-[#D4AF37] flex flex-col items-center justify-center font-bold text-xl border-2 border-[#D4AF37] shadow-sm flex-shrink-0">
              <span className="leading-none text-base tracking-wider">UB</span>
              <span className="text-[9px] font-sans text-amber-200 uppercase tracking-tighter">Kimia</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Mahasiswa Aktif
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  Angkatan {student.angkatan}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 hidden sm:inline-flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-600" />
                  Akreditasi Unggul ASIIN
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{student.nama}</h2>
              <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <strong>NIM:</strong> <span className="font-mono">{student.nim}</span>
                </span>
                <span>
                  <strong>Program Studi:</strong> S1 Kimia - FMIPA Universitas Brawijaya
                </span>
                <span>
                  <strong>Dosen PA:</strong> {student.dosenPANama}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">Semester</div>
              <div className="text-lg font-extrabold text-[#002B49]">{student.semester}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">SKS Lulus</div>
              <div className="text-lg font-extrabold text-slate-900">{statsKHS.totalSks}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">KRS Aktif</div>
              <div className="text-lg font-extrabold text-blue-600">+{totalSksKRS}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">IPK Kumulatif</div>
              <div className="text-lg font-extrabold text-emerald-600">{statsKHS.ipk}</div>
            </div>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex border-b border-slate-200 mt-6 -mb-6 pt-2">
          <button
            onClick={() => setSubTab('krs')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              subTab === 'krs'
                ? 'border-[#002B49] text-[#002B49] bg-slate-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>Kartu Rencana Studi (KRS) Semester 7</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono">
              {totalSksKRS} SKS
            </span>
          </button>
          <button
            onClick={() => setSubTab('khs')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              subTab === 'khs'
                ? 'border-[#002B49] text-[#002B49] bg-slate-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Kartu Hasil Studi & Transkrip Kumulatif</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
              IPK {statsKHS.ipk}
            </span>
          </button>
        </div>
      </div>

      {/* Notice alert */}
      {krsNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{krsNotice}</span>
          </div>
          <button onClick={() => setKrsNotice(null)} className="text-blue-500 hover:text-blue-800 px-2 py-0.5 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* SUB-TAB 1: KRS INTERAKTIF */}
      {subTab === 'krs' && (
        <div className="space-y-6">
          {/* Action Header & Approval Status */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  krsStatus === 'Disetujui Dosen PA'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{krsStatus}</span>
              </div>
              <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
                <span>Beban Rencana Studi:</span>
                <strong className="text-slate-900 font-bold">{totalSksKRS} dari maks 24 SKS</strong>
                <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className={`h-full ${totalSksKRS > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((totalSksKRS / 24) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {(currentRole === 'dosen' || currentRole === 'admin' || currentRole === 'super_admin') &&
                krsStatus !== 'Disetujui Dosen PA' && (
                  <button
                    onClick={handleApproveKRS}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Sahkan KRS Mahasiswa</span>
                  </button>
                )}
              <button
                onClick={() => setShowPrintModal('krs')}
                className="px-3.5 py-2 bg-white text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 border border-slate-300 shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak Lembar KRS Resmi UB</span>
              </button>
            </div>
          </div>

          {/* Enrolled Courses Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-[#002B49] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  Daftar Mata Kuliah yang Diambil di KRS (Semester Ganjil 2026/2027)
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Kurikulum S1 Kimia FMIPA / FsTEM Universitas Brawijaya • Sinkron dengan KHS & Transkrip
                </p>
              </div>
              <span className="text-xs font-semibold bg-[#D4AF37] text-[#002B49] px-3 py-1 rounded shadow-sm">
                Total: {totalSksKRS} SKS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">No</th>
                    <th className="px-4 py-3">Kode MK</th>
                    <th className="px-4 py-3">Nama Mata Kuliah</th>
                    <th className="px-4 py-3 text-center">SKS</th>
                    <th className="px-4 py-3">Sifat</th>
                    <th className="px-4 py-3">Kelompok (KBK)</th>
                    <th className="px-4 py-3">Dosen Pengampu</th>
                    <th className="px-4 py-3">Jadwal & Ruangan</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrolledCourses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                        Belum ada mata kuliah yang diambil pada KRS Semester 7. Silakan pilih dari daftar mata kuliah di bawah.
                      </td>
                    </tr>
                  ) : (
                    enrolledCourses.map((mk, index) => (
                      <tr key={mk.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-center font-medium text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{mk.kode}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{mk.nama}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[#002B49] bg-amber-50 border border-amber-200 text-xs">
                            {mk.sks} SKS
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              mk.sifat === 'Wajib'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {mk.sifat}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {mk.kbk}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{mk.dosenPengampu}</td>
                        <td className="px-4 py-3 text-slate-500">
                          <div>{mk.jadwal}</div>
                          <div className="text-[10px] text-slate-400">{mk.ruang}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDropCourse(mk.id)}
                            title="Batalkan Mata Kuliah dari KRS"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Available Electives to Add */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Mata Kuliah Pilihan Kimia Tersedia (Semester 7)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {filteredAvailableElectives.length} MK
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih mata kuliah pilihan pendukung topik penelitian skripsi Anda di laboratorium Departemen Kimia FMIPA UB
                </p>
              </div>

              {/* Action buttons & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddElectiveModal}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                  title="Tambah Mata Kuliah Pilihan Baru"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Mata Kuliah Pilihan</span>
                </button>

                {/* Search Available */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari Kode atau Nama MK..."
                    value={searchKrsAvailable}
                    onChange={(e) => setSearchKrsAvailable(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>
              </div>
            </div>

            {/* KBK Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs border-b border-slate-100 pb-3">
              <span className="text-slate-400 text-[11px] font-semibold mr-1">Rumpun KBK:</span>
              {kbkOptions.map((kbk) => (
                <button
                  key={kbk}
                  onClick={() => setSelectedKbkFilter(kbk)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    selectedKbkFilter === kbk
                      ? 'bg-[#002B49] text-[#D4AF37] font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {kbk}
                </button>
              ))}
            </div>

            {/* Electives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {filteredAvailableElectives.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Tidak ada mata kuliah yang cocok dengan filter pencarian.
                </div>
              ) : (
                filteredAvailableElectives.map((course) => (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-[#002B49] hover:shadow-sm transition-all flex flex-col justify-between text-xs bg-white group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {course.kode}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                            {course.sks} SKS
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded">
                            {course.kbk}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {course.sifat}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 mt-2 text-[13px] group-hover:text-[#002B49] transition-colors">
                        {course.nama}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        <div className="text-slate-600 font-medium">{course.dosenPengampu}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5">
                          {course.jadwal} • {course.ruang}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => handleEnrollCourse(course.id)}
                        disabled={totalSksKRS + course.sks > 24}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 text-[11px] transition-colors ${
                          totalSksKRS + course.sks > 24
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-[#002B49] text-white hover:bg-[#003865] shadow-sm'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Ambil MK</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KHS & TRANSKRIP KUMULATIF */}
      {subTab === 'khs' && (
        <div className="space-y-6">
          {/* Header Summary & Filter */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  Filter Semester:
                </span>
                <button
                  onClick={() => setSelectedSemesterKHS('Semua')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedSemesterKHS === 'Semua'
                      ? 'bg-[#002B49] text-[#D4AF37] font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Seluruh Semester (Kumulatif)
                </button>
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemesterKHS(sem)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedSemesterKHS === sem
                        ? 'bg-[#002B49] text-[#D4AF37] font-bold shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semester {sem}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedSemesterKHS(7)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                    selectedSemesterKHS === 7
                      ? 'bg-blue-900 text-amber-300 font-bold shadow-sm'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium'
                  }`}
                >
                  <span>Semester 7</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-200 text-blue-900 text-[10px] font-bold">KRS</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPrintModal('transkrip')}
                  className="px-3.5 py-2 bg-white text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 border border-slate-300 shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Cetak Transkrip Akademik Resmi</span>
                </button>
              </div>
            </div>

            {/* Quick search and dynamic info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-3 text-xs w-full sm:w-auto">
                <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                  {semesterStats.label}:{' '}
                  <strong className="text-slate-900 font-bold">{semesterStats.sks} SKS</strong>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                  {semesterStats.isCumulative ? 'IPK Kumulatif' : 'IPS'}:{' '}
                  <strong className="text-emerald-700 font-extrabold">{semesterStats.ip}</strong>
                </div>
              </div>

              {/* Search box for KHS */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter Kode MK / Nama..."
                  value={searchKHS}
                  onChange={(e) => setSearchKHS(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                />
              </div>
            </div>
          </div>

          {/* Transcript Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-[#002B49] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#D4AF37]" />
                  Transkrip Nilai Akademik S1 Kimia  FSTeM Universitas Brawijaya
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Data resmi kurikulum terakreditasi ASIIN & BAN-PT • Status: Nilai Telah Disahkan Akademik
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span>Total: {selectedSemesterKHS === 7 ? totalSksKRS : statsKHS.totalSks} SKS</span>
                <span className="bg-[#D4AF37] text-[#002B49] px-2.5 py-0.5 rounded font-bold shadow-sm">
                  {selectedSemesterKHS === 7 ? 'KRS AKTIF' : `IPK: ${statsKHS.ipk}`}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {selectedSemesterKHS === 7 ? (
                /* SEMESTER 7 VIEW (Synchronized with KRS) */
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">No</th>
                      <th className="px-4 py-3">Kode MK</th>
                      <th className="px-4 py-3">Nama Mata Kuliah</th>
                      <th className="px-4 py-3 text-center">Semester</th>
                      <th className="px-4 py-3 text-center">SKS</th>
                      <th className="px-4 py-3">Kelompok (KBK)</th>
                      <th className="px-4 py-3">Dosen Pengampu</th>
                      <th className="px-4 py-3 text-center">Status Nilai</th>
                      <th className="px-4 py-3 text-center w-36">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrolledCourses.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                          Belum ada mata kuliah yang diambil pada KRS Semester 7.
                        </td>
                      </tr>
                    ) : (
                      enrolledCourses.map((mk, idx) => (
                        <tr key={mk.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-4 py-3 text-center text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">{mk.kode}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{mk.nama}</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-600">7</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 text-xs">
                              {mk.sks} SKS
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{mk.kbk}</td>
                          <td className="px-4 py-3 text-slate-600">{mk.dosenPengampu}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[10px] inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              Sedang Ditempuh (KRS)
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSubTab('krs')}
                                className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                                title="Edit Mata Kuliah di KRS"
                              >
                                <Pencil className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDropCourse(mk.id)}
                                className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                                title="Delete Mata Kuliah dari KRS"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right">
                        Total SKS Semester 7 (KRS Aktif):
                      </td>
                      <td className="px-4 py-3 text-center text-[#002B49] font-extrabold">{totalSksKRS} SKS</td>
                      <td colSpan={3} className="px-4 py-3 text-right text-xs text-blue-700">
                        Status Verifikasi PA: <strong>{krsStatus}</strong>
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                /* COMPLETED COURSES TRANSCRIPT (Semesters 1-6) */
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">No</th>
                      <th className="px-4 py-3">Kode MK</th>
                      <th className="px-4 py-3">Nama Mata Kuliah</th>
                      <th className="px-4 py-3 text-center">Semester</th>
                      <th className="px-4 py-3 text-center">SKS</th>
                      <th className="px-4 py-3 text-center">Nilai Huruf</th>
                      <th className="px-4 py-3 text-center">Nilai Angka</th>
                      <th className="px-4 py-3 text-center">Mutu (K x N)</th>
                      <th className="px-4 py-3 text-center w-36">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTranscript.map((n, index) => {
                      const mutu = n.sks * n.nilaiAngka;
                      return (
                        <tr key={`${n.kode}-${n.semester}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">{n.kode}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{n.nama}</td>
                          <td className="px-4 py-3 text-center text-slate-600 font-medium">
                            {n.semester}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 text-xs">
                              {n.sks} SKS
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-xs ${
                                n.nilaiHuruf === 'A'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : n.nilaiHuruf === 'B+'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {n.nilaiHuruf}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-medium text-slate-700">
                            {n.nilaiAngka.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                            {mutu.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(n)}
                                className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                                title="Edit Nilai Mata Kuliah"
                              >
                                <Pencil className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingTranscriptItem(n)}
                                className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                                title="Delete Mata Kuliah"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right">
                        {selectedSemesterKHS === 'Semua' ? 'Total SKS Kumulatif Lulus:' : `Total SKS Semester ${selectedSemesterKHS}:`}
                      </td>
                      <td className="px-4 py-3 text-center text-[#002B49] font-extrabold">{semesterStats.sks} SKS</td>
                      <td colSpan={2} className="px-4 py-3 text-right">
                        {selectedSemesterKHS === 'Semua' ? 'IPK Kumulatif:' : `IPS (Indeks Prestasi Sem. ${selectedSemesterKHS}):`}
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-700 text-sm font-extrabold">
                        {semesterStats.ip}
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Official Certification Signature Block */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white border border-slate-300 rounded flex items-center justify-center shadow-sm">
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
                <div className="text-[11px]">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Digital Signature Valid & Terverifikasi
                  </div>
                  <div className="text-slate-500">Pusat Data Akademik FMIPA / FsTEM UB</div>
                  <div className="font-mono text-[10px] text-slate-400">ID: UB-SIKMA-20260914-77189</div>
                </div>
              </div>

              <div className="text-right">
                <div>Malang, 14 September 2026</div>
                <div className="font-bold text-slate-900 mt-1">
                  Ketua Departemen Kimia FMIPA Universitas Brawijaya
                </div>
                <div className="font-bold text-[#002B49] mt-6">
                  Masruri, S.Si., M.Si., Ph.D
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  NIP 197008121997021001
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINT PREVIEW RESMI (KRS & TRANSKRIP) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6">
            {/* Modal Top Bar */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">
                  Pratinjau Cetak {showPrintModal === 'krs' ? 'Lembar KRS Resmi' : 'Transkrip Nilai Akademik'}
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body (Printable Paper Look) */}
            <div className="p-8 bg-white space-y-6 text-slate-800 text-xs">
              {/* Kop Surat Universitas Brawijaya */}
              <div className="border-b-2 border-slate-900 pb-4 text-center relative">
                <div className="absolute left-0 top-0 w-16 h-16 rounded-xl bg-[#002B49] text-[#D4AF37] font-bold flex flex-col items-center justify-center border-2 border-[#D4AF37]">
                  <span className="text-lg leading-none">UB</span>
                  <span className="text-[8px] text-amber-200">1963</span>
                </div>
                <div className="pr-12 pl-16">
                  <div className="text-xs uppercase tracking-wider font-semibold text-slate-700">
                    Kementerian Pendidikan Tinggi, Sains, dan Teknologi
                  </div>
                  <div className="text-base font-extrabold uppercase text-[#002B49] tracking-wide">
                    Universitas Brawijaya
                  </div>
                  <div className="text-xs font-bold uppercase text-slate-800">
                    Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    Departemen Kimia • Program Studi Sarjana (S1) Kimia
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Gedung Kimia FMIPA, Jl. Veteran, Malang 65145, Jawa Timur • Laman: kimia.ub.ac.id
                  </div>
                </div>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center space-y-1">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                  {showPrintModal === 'krs'
                    ? 'Kartu Rencana Studi (KRS) Mahasiswa'
                    : 'Transkrip Nilai Akademik Kumulatif Sementara'}
                </h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  Tahun Akademik 2026/2027 • Semester Ganjil
                </p>
              </div>

              {/* Biodata Mahasiswa */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 w-28 inline-block">Nama Mahasiswa</span>
                  <strong className="text-slate-900">: {student.nama}</strong>
                </div>
                <div>
                  <span className="text-slate-500 w-28 inline-block">Program Studi</span>
                  <strong className="text-slate-900">: S1 Kimia FMIPA UB</strong>
                </div>
                <div>
                  <span className="text-slate-500 w-28 inline-block">NIM</span>
                  <strong className="text-slate-900 font-mono">: {student.nim}</strong>
                </div>
                <div>
                  <span className="text-slate-500 w-28 inline-block">Dosen PA</span>
                  <strong className="text-slate-900">: {student.dosenPANama}</strong>
                </div>
                <div>
                  <span className="text-slate-500 w-28 inline-block">Semester</span>
                  <strong className="text-slate-900">: 7 (Tujuh)</strong>
                </div>
                <div>
                  <span className="text-slate-500 w-28 inline-block">Status KRS/KHS</span>
                  <strong className="text-emerald-700">: {showPrintModal === 'krs' ? krsStatus : 'Disahkan'}</strong>
                </div>
              </div>

              {/* Tabel Cetak */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                    {showPrintModal === 'krs' ? (
                      <tr>
                        <th className="p-2 text-center w-8">No</th>
                        <th className="p-2">Kode MK</th>
                        <th className="p-2">Nama Mata Kuliah</th>
                        <th className="p-2 text-center">SKS</th>
                        <th className="p-2">Kelompok (KBK)</th>
                        <th className="p-2">Dosen Pengampu</th>
                        <th className="p-2">Jadwal & Ruang</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="p-2 text-center w-8">No</th>
                        <th className="p-2">Kode MK</th>
                        <th className="p-2">Nama Mata Kuliah</th>
                        <th className="p-2 text-center">Sem</th>
                        <th className="p-2 text-center">SKS</th>
                        <th className="p-2 text-center">Nilai</th>
                        <th className="p-2 text-center">Angka</th>
                        <th className="p-2 text-center">Mutu</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {showPrintModal === 'krs'
                      ? enrolledCourses.map((c, i) => (
                          <tr key={c.id}>
                            <td className="p-2 text-center">{i + 1}</td>
                            <td className="p-2 font-mono font-bold">{c.kode}</td>
                            <td className="p-2 font-semibold">{c.nama}</td>
                            <td className="p-2 text-center font-bold">{c.sks}</td>
                            <td className="p-2">{c.kbk}</td>
                            <td className="p-2">{c.dosenPengampu}</td>
                            <td className="p-2 text-[10px]">{c.jadwal} ({c.ruang})</td>
                          </tr>
                        ))
                      : transcript.map((n, i) => (
                          <tr key={`${n.kode}-${n.semester}`}>
                            <td className="p-2 text-center">{i + 1}</td>
                            <td className="p-2 font-mono font-bold">{n.kode}</td>
                            <td className="p-2">{n.nama}</td>
                            <td className="p-2 text-center">{n.semester}</td>
                            <td className="p-2 text-center font-bold">{n.sks}</td>
                            <td className="p-2 text-center font-bold">{n.nilaiHuruf}</td>
                            <td className="p-2 text-center font-mono">{n.nilaiAngka.toFixed(1)}</td>
                            <td className="p-2 text-center font-mono">{(n.sks * n.nilaiAngka).toFixed(1)}</td>
                          </tr>
                        ))}
                  </tbody>
                  <tfoot className="bg-slate-100 border-t border-slate-300 font-bold">
                    {showPrintModal === 'krs' ? (
                      <tr>
                        <td colSpan={3} className="p-2 text-right">
                          Total Beban SKS Semester Ini:
                        </td>
                        <td className="p-2 text-center font-extrabold text-[#002B49]">{totalSksKRS} SKS</td>
                        <td colSpan={3} className="p-2 text-slate-500 font-normal">
                          Maksimal 24 SKS
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-2 text-right">
                          Total SKS Kumulatif Lulus:
                        </td>
                        <td className="p-2 text-center font-extrabold text-[#002B49]">{statsKHS.totalSks} SKS</td>
                        <td colSpan={2} className="p-2 text-right">
                          IPK Kumulatif:
                        </td>
                        <td className="p-2 text-center text-emerald-800 font-extrabold">{statsKHS.ipk}</td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              {/* Tanda Tangan Resmi */}
              <div className="pt-4 grid grid-cols-2 text-center text-xs">
                <div>
                  <div className="text-slate-500">Mengetahui,</div>
                  <div className="font-bold text-slate-800">Dosen Penasihat Akademik (PA)</div>
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-slate-400 italic">[Tanda Tangan Digital Terverifikasi]</span>
                  </div>
                  <div className="font-bold text-slate-900">{student.dosenPANama}</div>
                  <div className="text-[10px] text-slate-500 font-mono">NIP 197008121997021001</div>
                </div>

                <div>
                  <div className="text-slate-500">Malang, 14 September 2026</div>
                  <div className="font-bold text-slate-800">Mahasiswa yang Bersangkutan</div>
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-slate-400 italic">[Disahkan Online SIKMA]</span>
                  </div>
                  <div className="font-bold text-slate-900">{student.nama}</div>
                  <div className="text-[10px] text-slate-500 font-mono">NIM {student.nim}</div>
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500" />
                Dokumen ini merupakan arsip digital resmi SIKMA Kimia FMIPA Universitas Brawijaya.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-[#002B49] hover:bg-[#003865] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4 text-[#D4AF37]" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT MATA KULIAH TRANSKRIP */}
      {editingTranscriptItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm">Edit Nilai Mata Kuliah Transkrip</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTranscriptItem(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTranscript} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Mata Kuliah</label>
                <input
                  type="text"
                  required
                  value={editingTranscriptItem.form.kode}
                  onChange={(e) =>
                    setEditingTranscriptItem({
                      ...editingTranscriptItem,
                      form: { ...editingTranscriptItem.form, kode: e.target.value.toUpperCase() }
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Mata Kuliah</label>
                <input
                  type="text"
                  required
                  value={editingTranscriptItem.form.nama}
                  onChange={(e) =>
                    setEditingTranscriptItem({
                      ...editingTranscriptItem,
                      form: { ...editingTranscriptItem.form, nama: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={editingTranscriptItem.form.semester}
                    onChange={(e) =>
                      setEditingTranscriptItem({
                        ...editingTranscriptItem,
                        form: { ...editingTranscriptItem.form, semester: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bobot SKS</label>
                  <select
                    value={editingTranscriptItem.form.sks}
                    onChange={(e) =>
                      setEditingTranscriptItem({
                        ...editingTranscriptItem,
                        form: { ...editingTranscriptItem.form, sks: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>{s} SKS</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Huruf</label>
                  <select
                    value={editingTranscriptItem.form.nilaiHuruf}
                    onChange={(e) => {
                      const huruf = e.target.value as any;
                      const angka = getNilaiAngkaFromHuruf(huruf);
                      setEditingTranscriptItem({
                        ...editingTranscriptItem,
                        form: {
                          ...editingTranscriptItem.form,
                          nilaiHuruf: huruf,
                          nilaiAngka: angka
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  >
                    {['A', 'B+', 'B', 'C+', 'C', 'D', 'E'].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Angka (Bobot)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="4.0"
                    value={editingTranscriptItem.form.nilaiAngka}
                    onChange={(e) =>
                      setEditingTranscriptItem({
                        ...editingTranscriptItem,
                        form: { ...editingTranscriptItem.form, nilaiAngka: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTranscriptItem(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#002B49] hover:bg-[#003865] text-white font-bold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MATA KULIAH PILIHAN BARU */}
      {isAddElectiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tambah Mata Kuliah Pilihan</h3>
                  <p className="text-xs text-slate-500">
                    Departemen Kimia FMIPA / FSTeM Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddElectiveModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formElectiveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formElectiveError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAddElective} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Kode MK */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kode MK <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MAK62510"
                    value={electiveForm.kode}
                    onChange={(e) => {
                      setElectiveForm({ ...electiveForm, kode: e.target.value.toUpperCase() });
                      if (formElectiveError) setFormElectiveError(null);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 uppercase"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Format standar MAK6XXXX</p>
                </div>

                {/* SKS */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bobot SKS <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={electiveForm.sks}
                    onChange={(e) =>
                      setElectiveForm({ ...electiveForm, sks: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value={2}>2 SKS</option>
                    <option value={3}>3 SKS (Standar Pilihan Kimia)</option>
                    <option value={4}>4 SKS</option>
                  </select>
                </div>
              </div>

              {/* Rumpun KBK */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rumpun KBK (Kelompok Bidang Keahlian) <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={electiveForm.kbk}
                  onChange={(e) =>
                    setElectiveForm({
                      ...electiveForm,
                      kbk: e.target.value as BidangKeahlianKimia
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="Kimia Organik">Kimia Organik</option>
                  <option value="Kimia Analitik">Kimia Analitik</option>
                  <option value="Kimia Anorganik">Kimia Anorganik</option>
                  <option value="Kimia Fisik">Kimia Fisik</option>
                  <option value="Biokimia">Biokimia</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">Pilih rumpun keahlian laboratorium yang menaungi mata kuliah</p>
              </div>

              {/* Nama Mata Kuliah Pilihan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Mata Kuliah Pilihan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kimia Polimer & Rekayasa Biomaterial"
                  value={electiveForm.nama}
                  onChange={(e) => {
                    setElectiveForm({ ...electiveForm, nama: e.target.value });
                    if (formElectiveError) setFormElectiveError(null);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Dosen Pengampu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dosen Pengampu <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={electiveForm.dosenPengampu}
                  onChange={(e) =>
                    setElectiveForm({ ...electiveForm, dosenPengampu: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="Masruri, S.Si., M.Si., Ph.D">Masruri, S.Si., M.Si., Ph.D (KBK Organik)</option>
                  <option value="Dr. Dra. Hermin Sulistyarti, M.Si">Dr. Dra. Hermin Sulistyarti, M.Si (KBK Analitik)</option>
                  <option value="Dr. Anna Safitri, M.Sc., Ph.D">Dr. Anna Safitri, M.Sc., Ph.D (KBK Biokimia)</option>
                  <option value="Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Sc">Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Sc (KBK Fisik)</option>
                  <option value="Dr. Dra. Sri Wardhani, M.Si">Dr. Dra. Sri Wardhani, M.Si (KBK Anorganik)</option>
                  <option value="Dr. Akhmad Sabarudin, S.Si., M.Sc.">Dr. Akhmad Sabarudin, S.Si., M.Sc. (KBK Analitik)</option>
                  <option value="Sasangka Prasetyawan, M.S.">Sasangka Prasetyawan, M.S. (KBK Biokimia)</option>
                  <option value="Dra. Zubaidah Ningsih, M.Phil., Ph.D">Dra. Zubaidah Ningsih, M.Phil., Ph.D (KBK Anorganik)</option>
                  <option value="Elvina Dhiaul Iftitah, S.Si., M.Si.">Elvina Dhiaul Iftitah, S.Si., M.Si. (KBK Organik)</option>
                  <option value="Lukman Hakim, S.Si., M.Sc., Ph.D">Lukman Hakim, S.Si., M.Sc., Ph.D (KBK Fisik)</option>
                  <option value="Dr. Ulfa Andayani, M.Si.">Dr. Ulfa Andayani, M.Si. (KBK Fisik)</option>
                  <option value="Tim Dosen KBK Kimia UB">Tim Dosen KBK Kimia UB</option>
                </select>
              </div>

              {/* Waktu (Pilihan Rentang Waktu) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Waktu Perkuliahan (Pilihan Rentang Waktu) <span className="text-rose-500">*</span></span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Hari</label>
                    <select
                      value={electiveForm.waktuHari}
                      onChange={(e) =>
                        setElectiveForm({ ...electiveForm, waktuHari: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Jam Mulai</label>
                    <select
                      value={electiveForm.waktuJamMulai}
                      onChange={(e) =>
                        setElectiveForm({ ...electiveForm, waktuJamMulai: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {['07.30', '08.00', '08.30', '09.15', '10.00', '10.15', '11.00', '13.00', '13.15', '13.30', '14.00', '15.30'].map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Jam Selesai</label>
                    <select
                      value={electiveForm.waktuJamSelesai}
                      onChange={(e) =>
                        setElectiveForm({ ...electiveForm, waktuJamSelesai: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {['09.10', '10.00', '10.10', '10.30', '11.45', '12.00', '12.45', '14.40', '15.00', '15.30', '15.45', '16.00', '17.00'].map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-1.5 px-2.5 py-1 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 font-medium">
                  Rentang Waktu: <strong className="text-slate-800">{electiveForm.waktuHari}, {electiveForm.waktuJamMulai} - {electiveForm.waktuJamSelesai} WIB</strong>
                </div>
              </div>

              {/* Ruang */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ruang Kelas / Laboratorium <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={electiveForm.ruang}
                  onChange={(e) =>
                    setElectiveForm({ ...electiveForm, ruang: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="R. Kuliah Kimia 1.1 FMIPA">R. Kuliah Kimia 1.1 FMIPA</option>
                  <option value="R. Kuliah Kimia 1.2 FMIPA">R. Kuliah Kimia 1.2 FMIPA</option>
                  <option value="R. Kuliah Kimia 2.1 FMIPA">R. Kuliah Kimia 2.1 FMIPA</option>
                  <option value="R. Kuliah Kimia 2.2 FMIPA">R. Kuliah Kimia 2.2 FMIPA</option>
                  <option value="R. Kuliah Kimia 2.3 FMIPA">R. Kuliah Kimia 2.3 FMIPA</option>
                  <option value="R. Kuliah Kimia 3.1 FMIPA">R. Kuliah Kimia 3.1 FMIPA</option>
                  <option value="R. Kuliah Kimia 3.2 FMIPA">R. Kuliah Kimia 3.2 FMIPA</option>
                  <option value="R. Kuliah Kimia 3.3 FMIPA">R. Kuliah Kimia 3.3 FMIPA</option>
                  <option value="Auditorium FMIPA Lt. 2">Auditorium FMIPA Lt. 2</option>
                  <option value="Lab Komputasi Kimia FMIPA">Lab Komputasi Kimia FMIPA</option>
                  <option value="Laboratorium Riset Kimia FMIPA">Laboratorium Riset Kimia FMIPA</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddElectiveModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 font-bold" />
                  <span>Simpan ke Mata Kuliah Tersedia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI DELETE MATA KULIAH TRANSKRIP */}
      {deletingTranscriptItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Hapus Mata Kuliah dari Transkrip?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus data mata kuliah berikut dari transkrip akademik mahasiswa?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div><strong>Kode MK:</strong> <span className="font-mono">{deletingTranscriptItem.kode}</span></div>
              <div><strong>Mata Kuliah:</strong> {deletingTranscriptItem.nama}</div>
              <div><strong>Semester:</strong> Semester {deletingTranscriptItem.semester} • <strong>{deletingTranscriptItem.sks} SKS</strong></div>
              <div><strong>Nilai:</strong> {deletingTranscriptItem.nilaiHuruf} ({deletingTranscriptItem.nilaiAngka})</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingTranscriptItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTranscript}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
