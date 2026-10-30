import React, { useState, useId, useRef, useMemo } from 'react';
import { Mahasiswa, Dosen, UserRole, SemesterItem, AuthUser } from '../types/sikma';
import { INITIAL_MAHASISWA_LIST } from '../data/mahasiswaList';
import { INITIAL_DOSEN } from '../data/mockData';
import { INITIAL_LAB_LIST } from '../data/labData';
import { INITIAL_SEMESTER_LIST } from '../data/semesterList';
import { UbLogo } from './UbLogo';
import {
  FileText,
  FilePlus,
  ClipboardList,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  X,
  User,
  GraduationCap,
  Calendar,
  Building,
  ShieldCheck,
  Send,
  FileCheck2,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Filter,
  RefreshCw,
  FlaskConical,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Upload,
  FolderOpen,
  Trash2,
  AlertTriangle,
  Pencil,
  Save,
  Lock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  generateKartuFIDKPdf,
  generateKartuPesertaSeminarPdf,
  generateBlangkoBebasLabPdf,
  generateSuratAsistenPraktikumPdf,
  generateSkpiDocx
} from '../utils/unduhSuratHelpers';

export interface PermohonanSuratItem {
  id: string;
  nomorSurat: string;
  mahasiswaId: string;
  mahasiswaNama: string;
  nim: string;
  jenisSurat: string;
  tujuanInstansi: string;
  keperluan: string;
  tanggalPengajuan: string;
  status: 'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak';
  semester: number;
  semesterAkademik?: string;
  // Detail Fields untuk Kategori Ijin Kerja Lab
  judulPenelitian?: string;
  alamat?: string;
  email?: string;
  telepon?: string;
  tujuanIjin?: string;
  dosenNama?: string;
  tanggalPelaksanaan?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  laboratorium?: string;
  // Detail Fields untuk Kategori Ijin Lembur
  namaPendamping?: string;
  teleponPendamping?: string;
  waktuLembur?: string;
}

export interface KprsRecord {
  id: string;
  mahasiswaId: string;
  mahasiswaNama: string;
  nim: string;
  semester: number;
  tahunAkademik: string;
  totalSks: number;
  statusKprs: 'Disetujui Dosen PA' | 'Menunggu Verifikasi PA' | 'Draft Pengajuan';
  tanggalPengajuan: string;
  dosenPA: string;
  mataKuliahList: {
    kode: string;
    nama: string;
    sks: number;
    jadwal: string;
    kelas: string;
  }[];
}

interface PermohonanSuratViewProps {
  currentRole?: UserRole;
  student?: Mahasiswa;
  currentUser?: AuthUser;
}

export const PermohonanSuratView: React.FC<PermohonanSuratViewProps> = ({
  currentRole = 'mahasiswa',
  student,
  currentUser
}) => {
  // Master student list
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>(() => {
    const saved = localStorage.getItem('sikma_student_list_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MAHASISWA_LIST;
      }
    }
    return INITIAL_MAHASISWA_LIST;
  });

  // State untuk konfirmasi Delete mahasiswa & permohonan surat
  const [studentToDelete, setStudentToDelete] = useState<Mahasiswa | null>(null);
  const [suratToDelete, setSuratToDelete] = useState<PermohonanSuratItem | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Search & Filter state for the table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAngkatan, setSelectedAngkatan] = useState<'Semua' | string>('Semua');

  // Pagination state: Batas list field 10
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Database Dosen dari sikma_dosen_data atau INITIAL_DOSEN
  const [dosenList] = useState<Dosen[]>(() => {
    const saved = localStorage.getItem('sikma_dosen_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DOSEN;
      }
    }
    return INITIAL_DOSEN;
  });

  // Jenis Laboratorium dari INITIAL_LAB_LIST
  const jenisLaboratoriumList = INITIAL_LAB_LIST.map((l) => l.namaLab);

  // Opsi Tujuan Ijin Kerja Lab sesuai permintaan
  const tujuanOpsiList = [
    'Penelitian Dosen',
    'Proyek Kimia',
    'Program Kreatifitas Mahasiswa',
    'Penelitian Skripsi',
    'Penelitian Tesis',
    'Penelitian Disertasi',
    'Analisis Sampel',
    'Lainnya'
  ];

  // Database Semester dari sikma_semesters atau INITIAL_SEMESTER_LIST
  const [semesterDatabase] = useState<SemesterItem[]>(() => {
    const saved = localStorage.getItem('sikma_semesters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SEMESTER_LIST;
      }
    }
    return INITIAL_SEMESTER_LIST;
  });

  // Modal 1: Generate Surat (Button Hijau) -> Form: Nama, NIM, Kategori
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [formNama, setFormNama] = useState('');
  const [formNim, setFormNim] = useState('');
  const [formKategori, setFormKategori] = useState('Select');
  const [generateTargetMhs, setGenerateTargetMhs] = useState<Mahasiswa | null>(null);
  const [generateSuccessNotice, setGenerateSuccessNotice] = useState<string | null>(null);

  // Form Fields untuk Kategori: Ijin Kerja Lab, KPRS, Ijin Lembur
  const [formJudulPenelitian, setFormJudulPenelitian] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelepon, setFormTelepon] = useState('');
  const [formTujuan, setFormTujuan] = useState('Penelitian Skripsi');
  const [formDosen, setFormDosen] = useState('');
  const [formTanggalPengajuan, setFormTanggalPengajuan] = useState('');
  const [formTanggalPelaksanaan, setFormTanggalPelaksanaan] = useState('');
  const [formTanggalMulai, setFormTanggalMulai] = useState('');
  const [formTanggalSelesai, setFormTanggalSelesai] = useState('');
  const [formLaboratorium, setFormLaboratorium] = useState('Laboratorium Kimia Organik & Bahan Alam');
  const [formStatus, setFormStatus] = useState<'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak'>('Disetujui');
  const [formSemester, setFormSemester] = useState<string>(() => {
    const active = semesterDatabase.find((s) => s.status === 'Aktif') || semesterDatabase[0];
    return active ? active.namaSemester : 'Ganjil 2026 / 2027';
  });
  const [formKeteranganKhusus, setFormKeteranganKhusus] = useState('');
  const [formWaktuLembur, setFormWaktuLembur] = useState('17.00 - 21.00 WIB');
  const [formNamaPendamping, setFormNamaPendamping] = useState('');
  const [formTeleponPendamping, setFormTeleponPendamping] = useState('');

  // Modal 2: List KPRS (Button Biru)
  const [isKprsModalOpen, setIsKprsModalOpen] = useState(false);
  const [selectedKprsDetail, setSelectedKprsDetail] = useState<KprsRecord | null>(null);
  const [activeFileModalRecord, setActiveFileModalRecord] = useState<KprsRecord | null>(null);
  const [activePreviewKprsRecord, setActivePreviewKprsRecord] = useState<KprsRecord | null>(null);
  const [activeFileDropdownId, setActiveFileDropdownId] = useState<string | null>(null);
  const [kprsSearchQuery, setKprsSearchQuery] = useState('');
  const [kprsSemesterFilter, setKprsSemesterFilter] = useState<string>('Semua');
  const [kprsCurrentPage, setKprsCurrentPage] = useState<number>(1);
  const kprsPageSize = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempFileSelection, setTempFileSelection] = useState<File | null>(null);
  const [kprsFileToast, setKprsFileToast] = useState<string | null>(null);
  const [kprsFilesMap, setKprsFilesMap] = useState<
    Record<string, { fileName: string; fileSize: string; uploadedAt: string; isSubmitted: boolean }>
  >(() => {
    const saved = localStorage.getItem('sikma_kprs_files_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      'kprs-1': {
        fileName: 'Surat_KPRS_Ahmad_Rizky.pdf',
        fileSize: '184 KB',
        uploadedAt: '2026-08-28 09:15 WIB',
        isSubmitted: true
      },
      'kprs-2': {
        fileName: 'Formulir_KPRS_Dewi_Ayu.pdf',
        fileSize: '192 KB',
        uploadedAt: '2026-08-29 10:30 WIB',
        isSubmitted: true
      },
      'kprs-3': {
        fileName: 'Berkas_KPRS_Fajar_Nur.pdf',
        fileSize: '175 KB',
        uploadedAt: '2026-08-30 14:20 WIB',
        isSubmitted: true
      }
    };
  });

  // Modal 3: Detail Mahasiswa -> Form "Data Semua Pengajuan Surat Mahasiswa"
  const [detailMhs, setDetailMhs] = useState<Mahasiswa | null>(null);
  const [detailFilterKategori, setDetailFilterKategori] = useState<string>('Semua');
  const [detailCurrentPage, setDetailCurrentPage] = useState<number>(1);

  // Modal / Box Unduh Surat
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isDownloadingSkpi, setIsDownloadingSkpi] = useState(false);

  // Modal 5: Form Tambah Surat (muncul saat button Tambah Surat diklik)
  const [isTambahSuratModalOpen, setIsTambahSuratModalOpen] = useState(false);
  const [tambahNama, setTambahNama] = useState('');
  const [tambahNim, setTambahNim] = useState('');
  const [tambahKategori, setTambahKategori] = useState<'Select' | 'Ijin Kerja Lab' | 'KPRS' | 'Ijin Lembur'>('Select');
  // Fields spesifik Ijin Kerja Lab di Tambah Surat
  const [tambahJudulPenelitian, setTambahJudulPenelitian] = useState('');
  const [tambahAlamat, setTambahAlamat] = useState('');
  const [tambahEmail, setTambahEmail] = useState('');
  const [tambahTelepon, setTambahTelepon] = useState('');
  const [tambahTujuan, setTambahTujuan] = useState('Penelitian Skripsi');
  const [tambahDosen, setTambahDosen] = useState('');
  const [tambahTanggalPengajuan, setTambahTanggalPengajuan] = useState('');
  const [tambahTanggalPelaksanaan, setTambahTanggalPelaksanaan] = useState('');
  const [tambahTanggalMulai, setTambahTanggalMulai] = useState('');
  const [tambahTanggalSelesai, setTambahTanggalSelesai] = useState('');
  const [tambahLaboratorium, setTambahLaboratorium] = useState('Laboratorium Kimia Organik & Bahan Alam');
  const [tambahStatus, setTambahStatus] = useState<'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak'>('Disetujui');
  // Fields spesifik KPRS & Ijin Lembur
  const [tambahSemester, setTambahSemester] = useState<string>(() => {
    const active = semesterDatabase.find((s) => s.status === 'Aktif') || semesterDatabase[0];
    return active ? active.namaSemester : 'Ganjil 2026 / 2027';
  });
  const [tambahKeteranganKhusus, setTambahKeteranganKhusus] = useState('');
  const [tambahWaktuLembur, setTambahWaktuLembur] = useState('17.00 - 21.00 WIB');
  const [tambahNamaPendamping, setTambahNamaPendamping] = useState('');
  const [tambahTeleponPendamping, setTambahTeleponPendamping] = useState('');

  // Modal 4: Preview Surat Terbit
  const [previewSurat, setPreviewSurat] = useState<PermohonanSuratItem | null>(null);

  // State untuk File Surat pada modal Data Semua Pengajuan Surat Mahasiswa (Browse & Submit)
  const [suratFilesMap, setSuratFilesMap] = useState<
    Record<string, { fileName: string; fileSize: string; uploadedAt: string; isSubmitted: boolean }>
  >(() => {
    const saved = localStorage.getItem('sikma_surat_files_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      'srt-001': {
        fileName: 'Surat_Ijin_Kerja_Lab_AhmadRizky.pdf',
        fileSize: '245 KB',
        uploadedAt: '2026-09-15 10:12 WIB',
        isSubmitted: true
      },
      'srt-002': {
        fileName: 'Surat_KPRS_AhmadRizky.pdf',
        fileSize: '190 KB',
        uploadedAt: '2026-08-25 11:20 WIB',
        isSubmitted: true
      },
      'srt-008': {
        fileName: 'Formulir_Ijin_Lembur_AhmadRizky.pdf',
        fileSize: '168 KB',
        uploadedAt: '2026-09-12 14:30 WIB',
        isSubmitted: true
      }
    };
  });
  const [activeSuratFileDropdownId, setActiveSuratFileDropdownId] = useState<string | null>(null);
  const [activeSuratForFile, setActiveSuratForFile] = useState<PermohonanSuratItem | null>(null);
  const suratFileInputRef = useRef<HTMLInputElement>(null);
  const [tempSuratFileSelection, setTempSuratFileSelection] = useState<File | null>(null);
  const [suratFileToast, setSuratFileToast] = useState<string | null>(null);
  const [activeFileSuratModalItem, setActiveFileSuratModalItem] = useState<PermohonanSuratItem | null>(null);

  // State untuk Modal Edit Surat Pengajuan Mahasiswa
  const [isEditSuratModalOpen, setIsEditSuratModalOpen] = useState(false);
  const [editingSurat, setEditingSurat] = useState<PermohonanSuratItem | null>(null);
  const [editNomorSurat, setEditNomorSurat] = useState('');
  const [editJenisSurat, setEditJenisSurat] = useState<'Ijin Kerja Lab' | 'KPRS' | 'Ijin Lembur'>('Ijin Kerja Lab');
  const [editTanggalPengajuan, setEditTanggalPengajuan] = useState('');
  const [editStatus, setEditStatus] = useState<'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak'>('Disetujui');
  const [editKeperluan, setEditKeperluan] = useState('');
  const [editTujuanInstansi, setEditTujuanInstansi] = useState('');
  const [editJudulPenelitian, setEditJudulPenelitian] = useState('');
  const [editTujuanIjin, setEditTujuanIjin] = useState('Penelitian Skripsi');
  const [editLaboratorium, setEditLaboratorium] = useState('Laboratorium Kimia Organik & Bahan Alam');
  const [editDosenNama, setEditDosenNama] = useState('');
  const [editTanggalPelaksanaan, setEditTanggalPelaksanaan] = useState('');
  const [editTanggalMulai, setEditTanggalMulai] = useState('');
  const [editTanggalSelesai, setEditTanggalSelesai] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelepon, setEditTelepon] = useState('');
  const [editSemester, setEditSemester] = useState<number>(7);
  const [editSemesterAkademik, setEditSemesterAkademik] = useState('Ganjil 2026 / 2027');
  const [editKeteranganKhusus, setEditKeteranganKhusus] = useState('');
  const [editWaktuLembur, setEditWaktuLembur] = useState('17.00 - 21.00 WIB');
  const [editNamaPendamping, setEditNamaPendamping] = useState('');
  const [editTeleponPendamping, setEditTeleponPendamping] = useState('');

  // Stored Permohonan Surat Records
  const [permohonanList, setPermohonanList] = useState<PermohonanSuratItem[]>(() => {
    const defaultData: PermohonanSuratItem[] = [
      {
        id: 'srt-001',
        nomorSurat: '1420/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Kerja Lab',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Permohonan Ijin Kerja Lab untuk isolasi dan modifikasi senyawa eugenol',
        tanggalPengajuan: '2026-09-15',
        status: 'Disetujui',
        semester: 7,
        judulPenelitian: 'Isolasi, Karakterisasi dan Modifikasi Struktur Senyawa Eugenol dari Minyak Atsiri Cengkeh',
        alamat: 'Jl. MT Haryono No. 169, Lowokwaru, Malang',
        email: 'ahmad.rizky@student.ub.ac.id',
        telepon: '081234567891',
        tujuanIjin: 'Penelitian Skripsi',
        dosenNama: 'Masruri, S.Si., M.Si., Ph.D',
        tanggalPelaksanaan: '2026-09-15 s/d 2026-10-15',
        tanggalMulai: '2026-09-15',
        tanggalSelesai: '2026-10-15',
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam'
      },
      {
        id: 'srt-002',
        nomorSurat: '1421/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'KPRS',
        tujuanInstansi: 'Subbag Akademik & Kemahasiswaan FSTeM UB',
        keperluan: 'Permohonan Perubahan Rencana Studi Semester Ganjil 2026/2027 (Penambahan MK Riset Kimia)',
        tanggalPengajuan: '2026-08-28',
        tanggalPelaksanaan: '2026-08-28',
        status: 'Disetujui',
        semester: 7,
        semesterAkademik: 'Ganjil 2026 / 2027'
      },
      {
        id: 'srt-003',
        nomorSurat: '1423/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Lembur',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Permohonan Ijin Lembur Kerja Laboratorium (17.00 - 21.00 WIB) ekstraksi bahan alam',
        tanggalPengajuan: '2026-09-22',
        tanggalPelaksanaan: '2026-09-22',
        status: 'Selesai',
        semester: 7,
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam',
        dosenNama: 'Masruri, S.Si., M.Si., Ph.D',
        namaPendamping: 'Budi Santoso, S.Si (Pranata Lab)',
        teleponPendamping: '081333445566',
        waktuLembur: '17.00 - 21.00 WIB'
      },
      {
        id: 'srt-007',
        nomorSurat: '1430/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Kerja Lab',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Sintesis dan derivatisasi lanjutan ester sinamat',
        tanggalPengajuan: '2026-09-10',
        status: 'Selesai',
        semester: 7,
        judulPenelitian: 'Sintesis Derivat Ester Sinamat dari Minyak Atsiri Kayu Manis',
        dosenNama: 'Masruri, S.Si., M.Si., Ph.D',
        tanggalPelaksanaan: '2026-09-10 s/d 2026-09-25',
        tanggalMulai: '2026-09-10',
        tanggalSelesai: '2026-09-25',
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam'
      },
      {
        id: 'srt-008',
        nomorSurat: '1432/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Lembur',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Ijin lembur distilasi fraksinasi vakum lanjutan',
        tanggalPengajuan: '2026-09-12',
        tanggalPelaksanaan: '2026-09-12',
        status: 'Disetujui',
        semester: 7,
        waktuLembur: '17.30 - 21.30 WIB',
        namaPendamping: 'Budi Santoso, S.Si (Pranata Lab)',
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam'
      },
      {
        id: 'srt-009',
        nomorSurat: '1435/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Kerja Lab',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Analisis kromatografi lapis tipis preparatif',
        tanggalPengajuan: '2026-09-05',
        status: 'Disetujui',
        semester: 7,
        tanggalPelaksanaan: '2026-09-05 s/d 2026-09-18',
        tanggalMulai: '2026-09-05',
        tanggalSelesai: '2026-09-18',
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam'
      },
      {
        id: 'srt-010',
        nomorSurat: '1438/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'KPRS',
        tujuanInstansi: 'Subbag Akademik & Kemahasiswaan FSTeM UB',
        keperluan: 'Perubahan mata kuliah pilihan Kimia Komputasi',
        tanggalPengajuan: '2026-08-25',
        tanggalPelaksanaan: '2026-08-25',
        status: 'Disetujui',
        semester: 7,
        semesterAkademik: 'Ganjil 2026 / 2027'
      },
      {
        id: 'srt-011',
        nomorSurat: '1440/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Lembur',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Ijin lembur pengujian spektrofotometri UV-Vis',
        tanggalPengajuan: '2026-09-01',
        tanggalPelaksanaan: '2026-09-01',
        status: 'Selesai',
        semester: 7,
        waktuLembur: '17.00 - 20.30 WIB',
        namaPendamping: 'Budi Santoso, S.Si (Pranata Lab)',
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam'
      },
      {
        id: 'srt-012',
        nomorSurat: '1442/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Kerja Lab',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Pengeringan sampel beku freeze dryer',
        tanggalPengajuan: '2026-08-20',
        status: 'Disetujui',
        semester: 7,
        tanggalPelaksanaan: '2026-08-20 s/d 2026-08-30',
        tanggalMulai: '2026-08-20',
        tanggalSelesai: '2026-08-30',
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam'
      },
      {
        id: 'srt-013',
        nomorSurat: '1445/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Lembur',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Ijin lembur pemurnian kristal senyawa eugenol',
        tanggalPengajuan: '2026-08-15',
        tanggalPelaksanaan: '2026-08-15',
        status: 'Selesai',
        semester: 7,
        waktuLembur: '18.00 - 21.00 WIB',
        namaPendamping: 'Budi Santoso, S.Si (Pranata Lab)',
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam'
      },
      {
        id: 'srt-014',
        nomorSurat: '1448/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Kerja Lab',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Uji aktivitas antioksidan metode DPPH',
        tanggalPengajuan: '2026-08-10',
        status: 'Disetujui',
        semester: 7,
        tanggalPelaksanaan: '2026-08-10 s/d 2026-08-22',
        tanggalMulai: '2026-08-10',
        tanggalSelesai: '2026-08-22',
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam'
      },
      {
        id: 'srt-015',
        nomorSurat: '1450/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'KPRS',
        tujuanInstansi: 'Subbag Akademik & Kemahasiswaan FSTeM UB',
        keperluan: 'Penyesuaian SKS Semester Antara/Remedial',
        tanggalPengajuan: '2026-07-28',
        tanggalPelaksanaan: '2026-07-28',
        status: 'Disetujui',
        semester: 6,
        semesterAkademik: 'Genap 2025 / 2026'
      },
      {
        id: 'srt-016',
        nomorSurat: '1452/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-1',
        mahasiswaNama: 'Ahmad Rizky Pratama',
        nim: '215090200111012',
        jenisSurat: 'Ijin Lembur',
        tujuanInstansi: 'Laboratorium Kimia Organik & Bahan Alam',
        keperluan: 'Pengukuran titik leleh dan rekristalisasi produk',
        tanggalPengajuan: '2026-07-20',
        tanggalPelaksanaan: '2026-07-20',
        status: 'Selesai',
        semester: 6,
        waktuLembur: '17.00 - 20.00 WIB',
        namaPendamping: 'Budi Santoso, S.Si (Pranata Lab)',
        laboratorium: 'Laboratorium Kimia Organik & Bahan Alam'
      },
      {
        id: 'srt-004',
        nomorSurat: '1425/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-2',
        mahasiswaNama: 'Dewi Ayu Anggraeni',
        nim: '215090201111025',
        jenisSurat: 'Ijin Kerja Lab',
        tujuanInstansi: 'Laboratorium Kimia Analitik & Instrumentasi',
        keperluan: 'Permohonan Ijin Kerja Lab untuk penentuan logam berat dengan AAS',
        tanggalPengajuan: '2026-09-20',
        tanggalPelaksanaan: '2026-09-20 s/d 2026-10-20',
        tanggalMulai: '2026-09-20',
        tanggalSelesai: '2026-10-20',
        status: 'Disetujui',
        semester: 7,
        judulPenelitian: 'Pengembangan Metode FIA untuk Penentuan Logam Berat',
        dosenNama: 'Dr. Dra. Hermin Sulistyarti, M.Si',
        laboratorium: 'Laboratorium Kimia Analitik & Instrumentasi'
      },
      {
        id: 'srt-005',
        nomorSurat: '1426/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-2',
        mahasiswaNama: 'Dewi Ayu Anggraeni',
        nim: '215090201111025',
        jenisSurat: 'KPRS',
        tujuanInstansi: 'Subbag Akademik & Kemahasiswaan FSTeM UB',
        keperluan: 'Penyesuaian jadwal kuliah praktikum analitik lanjut',
        tanggalPengajuan: '2026-08-30',
        tanggalPelaksanaan: '2026-08-30',
        status: 'Disetujui',
        semester: 7
      },
      {
        id: 'srt-006',
        nomorSurat: '1428/UN10.F09/AK/2026',
        mahasiswaId: 'mhs-6',
        mahasiswaNama: 'Nabila Putri Az-Zahra',
        nim: '225090201111005',
        jenisSurat: 'Ijin Kerja Lab',
        tujuanInstansi: 'Laboratorium Kimia Lingkungan',
        keperluan: 'Permohonan Ijin Kerja Lab riset fotokatalis degradasi zat warna',
        tanggalPengajuan: '2026-09-28',
        tanggalPelaksanaan: '2026-09-28 s/d 2026-10-28',
        tanggalMulai: '2026-09-28',
        tanggalSelesai: '2026-10-28',
        status: 'Diproses',
        semester: 5,
        judulPenelitian: 'Fotokatalis Nanokomposit TiO2 untuk Degradasi Limbah Zat Warna Tekstil',
        dosenNama: 'Dr. Anna Safitri, M.Sc., Ph.D',
        laboratorium: 'Laboratorium Kimia Lingkungan'
      }
    ];

    const saved = localStorage.getItem('sikma_permohonan_surat_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return parsed.map((p) => ({
            ...p,
            tanggalPengajuan: p.tanggalPengajuan || p.tanggalMulai || p.tanggalPelaksanaan || '2026-09-15',
            tanggalPelaksanaan:
              p.tanggalPelaksanaan ||
              (p.tanggalMulai && p.tanggalSelesai
                ? `${p.tanggalMulai} s/d ${p.tanggalSelesai}`
                : p.tanggalPengajuan || '2026-09-15'),
            status: p.status || 'Disetujui',
            jenisSurat: p.jenisSurat || 'Ijin Kerja Lab'
          }));
        }
      } catch {
        // fallback
      }
    }
    return defaultData;
  });

  // Mock KPRS Records for students
  const [kprsRecords] = useState<KprsRecord[]>([
    {
      id: 'kprs-1',
      mahasiswaId: 'mhs-1',
      mahasiswaNama: 'Ahmad Rizky Pratama',
      nim: '215090200111012',
      semester: 7,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 20,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-28',
      dosenPA: 'Masruri, S.Si., M.Si., Ph.D',
      mataKuliahList: [
        { kode: 'MKK-4101', nama: 'Kimia Organik Bahan Alam', sks: 3, jadwal: 'Senin 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-4102', nama: 'Kimia Pemisahan & Kromatografi', sks: 3, jadwal: 'Selasa 10.00 - 12.30', kelas: 'B' },
        { kode: 'MKK-4105', nama: 'Metodologi Penelitian Kimia', sks: 2, jadwal: 'Rabu 13.00 - 14.40', kelas: 'A' },
        { kode: 'MKK-4199', nama: 'Tugas Akhir / Skripsi', sks: 6, jadwal: 'Fleksibel Lab', kelas: 'Riset' },
        { kode: 'MKK-4109', nama: 'Spektroskopi Molekul Lanjut', sks: 3, jadwal: 'Kamis 09.00 - 11.30', kelas: 'A' },
        { kode: 'MKK-4112', nama: 'Bioetika Riset Laboratorium', sks: 3, jadwal: 'Jumat 08.00 - 10.30', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-2',
      mahasiswaId: 'mhs-2',
      mahasiswaNama: 'Dewi Ayu Anggraeni',
      nim: '215090201111025',
      semester: 7,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 21,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-29',
      dosenPA: 'Dr. Dra. Hermin Sulistyarti, M.Si',
      mataKuliahList: [
        { kode: 'MKK-4102', nama: 'Kimia Pemisahan & Kromatografi', sks: 3, jadwal: 'Selasa 10.00 - 12.30', kelas: 'B' },
        { kode: 'MKK-4103', nama: 'Elektrokimia Terapan & Sensor', sks: 3, jadwal: 'Rabu 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-4199', nama: 'Tugas Akhir / Skripsi', sks: 6, jadwal: 'Fleksibel Lab', kelas: 'Riset' },
        { kode: 'MKK-4107', nama: 'Analisis Instrumen Lanjut', sks: 3, jadwal: 'Kamis 13.00 - 15.30', kelas: 'A' },
        { kode: 'MKK-4110', nama: 'Kimia Material Nanoteknologi', sks: 3, jadwal: 'Jumat 13.30 - 16.00', kelas: 'A' },
        { kode: 'MKK-4115', nama: 'Kewirausahaan Berbasis Kimia', sks: 3, jadwal: 'Senin 13.00 - 15.30', kelas: 'C' }
      ]
    },
    {
      id: 'kprs-3',
      mahasiswaId: 'mhs-3',
      mahasiswaNama: 'Fajar Nur Hidayat',
      nim: '225090200111044',
      semester: 5,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 22,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-30',
      dosenPA: 'Prof. Dr. Sc. Acep Purqon, S.Si., M.Si',
      mataKuliahList: [
        { kode: 'MKK-3101', nama: 'Termodinamika Kimia', sks: 3, jadwal: 'Senin 07.30 - 10.00', kelas: 'A' },
        { kode: 'MKK-3102', nama: 'Kimia Kuantum & Komputasi', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-3103', nama: 'Praktikum Kimia Fisik Lanjut', sks: 2, jadwal: 'Rabu 08.00 - 12.00', kelas: 'Lab 2' },
        { kode: 'MKK-3104', nama: 'Kinetika Kimia & Katalisis', sks: 3, jadwal: 'Kamis 10.00 - 12.30', kelas: 'B' },
        { kode: 'MKK-3105', nama: 'Metodologi Penelitian Kimia', sks: 2, jadwal: 'Jumat 08.00 - 09.40', kelas: 'A' },
        { kode: 'MKK-3108', nama: 'Kimia Polimer Sintesis', sks: 3, jadwal: 'Kamis 13.30 - 16.00', kelas: 'A' },
        { kode: 'MKK-3111', nama: 'Bahasa Inggris Ilmiah', sks: 2, jadwal: 'Selasa 13.00 - 14.40', kelas: 'E' },
        { kode: 'MKK-3112', nama: 'Statistika Eksperimen', sks: 4, jadwal: 'Rabu 13.00 - 16.20', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-4',
      mahasiswaId: 'mhs-4',
      mahasiswaNama: 'Bagas Aditya Wicaksono',
      nim: '215090207111018',
      semester: 7,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 18,
      statusKprs: 'Menunggu Verifikasi PA',
      tanggalPengajuan: '2026-09-02',
      dosenPA: 'Anna Safitri, S.Si., M.Sc., Ph.D',
      mataKuliahList: [
        { kode: 'MKK-4101', nama: 'Biokimia Medis Lanjut', sks: 3, jadwal: 'Senin 10.00 - 12.30', kelas: 'A' },
        { kode: 'MKK-4104', nama: 'Rekayasa Protein & Enzim', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-4199', nama: 'Tugas Akhir / Skripsi', sks: 6, jadwal: 'Fleksibel Lab', kelas: 'Riset' },
        { kode: 'MKK-4110', nama: 'Imunokimia & Diagnostik', sks: 3, jadwal: 'Kamis 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-4114', nama: 'Toksikologi Kimia Bahan Alam', sks: 3, jadwal: 'Jumat 09.00 - 11.30', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-5',
      mahasiswaId: 'mhs-9',
      mahasiswaNama: 'Denny Caknan',
      nim: '235090200111010',
      semester: 3,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 22,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-25',
      dosenPA: 'Dr. Dra. Hermin Sulistyarti, M.Si',
      mataKuliahList: [
        { kode: 'MKK-2101', nama: 'Kimia Dasar II', sks: 3, jadwal: 'Senin 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2102', nama: 'Praktikum Kimia Dasar II', sks: 1, jadwal: 'Senin 13.00 - 16.00', kelas: 'Lab 1' },
        { kode: 'MKK-2103', nama: 'Kimia Organik I', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2104', nama: 'Kimia Fisik I', sks: 3, jadwal: 'Rabu 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-2105', nama: 'Matematika Kimia II', sks: 3, jadwal: 'Kamis 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2106', nama: 'Fisika Dasar untuk Kimia', sks: 3, jadwal: 'Jumat 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2107', nama: 'Pendidikan Pancasila & Kewarganegaraan', sks: 2, jadwal: 'Selasa 13.00 - 14.40', kelas: 'K' },
        { kode: 'MKK-2108', nama: 'Pengantar Kimia Lingkungan', sks: 4, jadwal: 'Kamis 13.00 - 16.20', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-6',
      mahasiswaId: 'mhs-10',
      mahasiswaNama: 'Rita Sugiarto',
      nim: '235090201111022',
      semester: 3,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 21,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-26',
      dosenPA: 'Masruri, S.Si., M.Si., Ph.D',
      mataKuliahList: [
        { kode: 'MKK-2101', nama: 'Kimia Dasar II', sks: 3, jadwal: 'Senin 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2103', nama: 'Kimia Organik I', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2104', nama: 'Kimia Fisik I', sks: 3, jadwal: 'Rabu 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-2105', nama: 'Matematika Kimia II', sks: 3, jadwal: 'Kamis 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2106', nama: 'Fisika Dasar untuk Kimia', sks: 3, jadwal: 'Jumat 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2107', nama: 'Pendidikan Pancasila & Kewarganegaraan', sks: 2, jadwal: 'Selasa 13.00 - 14.40', kelas: 'K' },
        { kode: 'MKK-2109', nama: 'Biologi Sel & Molekuler', sks: 4, jadwal: 'Rabu 13.00 - 16.20', kelas: 'C' }
      ]
    },
    {
      id: 'kprs-7',
      mahasiswaId: 'mhs-5',
      mahasiswaNama: 'Dewi Lestari Kusuma',
      nim: '215090200111033',
      semester: 7,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 20,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-31',
      dosenPA: 'Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Sc',
      mataKuliahList: [
        { kode: 'MKK-4101', nama: 'Kimia Material Anorganik', sks: 3, jadwal: 'Senin 10.00 - 12.30', kelas: 'A' },
        { kode: 'MKK-4104', nama: 'Kristalografi & Difraksi Sinar-X', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-4199', nama: 'Tugas Akhir / Skripsi', sks: 6, jadwal: 'Fleksibel Lab', kelas: 'Riset' },
        { kode: 'MKK-4110', nama: 'Karakterisasi Material Maju', sks: 3, jadwal: 'Rabu 13.00 - 15.30', kelas: 'A' },
        { kode: 'MKK-4112', nama: 'Keramik & Semikonduktor', sks: 3, jadwal: 'Kamis 10.00 - 12.30', kelas: 'A' },
        { kode: 'MKK-4115', nama: 'Kimia Koordinasi Terapan', sks: 2, jadwal: 'Jumat 08.00 - 09.40', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-8',
      mahasiswaId: 'mhs-6',
      mahasiswaNama: 'Nabila Putri Az-Zahra',
      nim: '225090201111005',
      semester: 5,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 21,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-29',
      dosenPA: 'Masruri, S.Si., M.Si., Ph.D',
      mataKuliahList: [
        { kode: 'MKK-3101', nama: 'Sintesis Senyawa Organik', sks: 3, jadwal: 'Senin 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-3102', nama: 'Elusidasi Struktur Organik', sks: 3, jadwal: 'Selasa 10.00 - 12.30', kelas: 'A' },
        { kode: 'MKK-3105', nama: 'Praktikum Kimia Organik II', sks: 2, jadwal: 'Rabu 08.00 - 12.00', kelas: 'Lab 3' },
        { kode: 'MKK-3108', nama: 'Fitokimia Lanjut', sks: 3, jadwal: 'Kamis 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-3110', nama: 'Kromatografi Preparatif', sks: 3, jadwal: 'Kamis 13.30 - 16.00', kelas: 'A' },
        { kode: 'MKK-3112', nama: 'Metode Spektrometri Massa', sks: 3, jadwal: 'Jumat 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-3115', nama: 'Etika Penulisan Ilmiah', sks: 4, jadwal: 'Jumat 13.30 - 16.50', kelas: 'B' }
      ]
    },
    {
      id: 'kprs-9',
      mahasiswaId: 'mhs-7',
      mahasiswaNama: 'Budi Santoso',
      nim: '225090207111019',
      semester: 5,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 19,
      statusKprs: 'Menunggu Verifikasi PA',
      tanggalPengajuan: '2026-09-01',
      dosenPA: 'Prof. Dr. Sc. Acep Purqon, S.Si., M.Si',
      mataKuliahList: [
        { kode: 'MKK-3101', nama: 'Termodinamika Kimia', sks: 3, jadwal: 'Senin 07.30 - 10.00', kelas: 'A' },
        { kode: 'MKK-3102', nama: 'Kimia Kuantum & Komputasi', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-3104', nama: 'Kinetika Kimia & Katalisis', sks: 3, jadwal: 'Kamis 10.00 - 12.30', kelas: 'B' },
        { kode: 'MKK-3106', nama: 'Kimia Permukaan & Koloid', sks: 3, jadwal: 'Rabu 10.00 - 12.30', kelas: 'A' },
        { kode: 'MKK-3109', nama: 'Pemodelan Molekuler', sks: 3, jadwal: 'Kamis 13.30 - 16.00', kelas: 'Lab Komp' },
        { kode: 'MKK-3114', nama: 'Fotokimia Terapan', sks: 4, jadwal: 'Jumat 08.00 - 11.20', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-10',
      mahasiswaId: 'mhs-8',
      mahasiswaNama: 'Siti Nurhaliza',
      nim: '225090200111052',
      semester: 5,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 22,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-27',
      dosenPA: 'Anna Safitri, S.Si., M.Sc., Ph.D',
      mataKuliahList: [
        { kode: 'MKK-3101', nama: 'Biokimia Metabolisme Lanjut', sks: 3, jadwal: 'Senin 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-3103', nama: 'Enzimologi Klinis', sks: 3, jadwal: 'Selasa 10.00 - 12.30', kelas: 'A' },
        { kode: 'MKK-3105', nama: 'Praktikum Biokimia Terapan', sks: 2, jadwal: 'Rabu 08.00 - 12.00', kelas: 'Lab Bio' },
        { kode: 'MKK-3107', nama: 'Biologi Molekuler Kimiawi', sks: 3, jadwal: 'Kamis 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-3111', nama: 'Bioproses & Fermentasi', sks: 3, jadwal: 'Kamis 13.30 - 16.00', kelas: 'A' },
        { kode: 'MKK-3113', nama: 'Farmakologi Dasar', sks: 4, jadwal: 'Jumat 08.00 - 11.20', kelas: 'A' },
        { kode: 'MKK-3115', nama: 'Metodologi Penelitian Kimia', sks: 4, jadwal: 'Jumat 13.30 - 16.50', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-11',
      mahasiswaId: 'mhs-11',
      mahasiswaNama: 'Mansyur S',
      nim: '235090207111008',
      semester: 3,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 20,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-26',
      dosenPA: 'Prof. Dr. Sc. Acep Purqon, S.Si., M.Si',
      mataKuliahList: [
        { kode: 'MKK-2101', nama: 'Kimia Dasar II', sks: 3, jadwal: 'Senin 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-2103', nama: 'Kimia Organik I', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-2104', nama: 'Kimia Fisik I', sks: 3, jadwal: 'Rabu 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2105', nama: 'Matematika Kimia II', sks: 3, jadwal: 'Kamis 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-2106', nama: 'Fisika Dasar untuk Kimia', sks: 3, jadwal: 'Jumat 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-2108', nama: 'Pengantar Termodinamika', sks: 5, jadwal: 'Kamis 13.00 - 17.10', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-12',
      mahasiswaId: 'mhs-12',
      mahasiswaNama: 'Rossa',
      nim: '235090200111039',
      semester: 3,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 21,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-27',
      dosenPA: 'Anna Safitri, S.Si., M.Sc., Ph.D',
      mataKuliahList: [
        { kode: 'MKK-2101', nama: 'Kimia Dasar II', sks: 3, jadwal: 'Senin 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2102', nama: 'Praktikum Kimia Dasar II', sks: 1, jadwal: 'Senin 13.00 - 16.00', kelas: 'Lab 2' },
        { kode: 'MKK-2103', nama: 'Kimia Organik I', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2104', nama: 'Kimia Fisik I', sks: 3, jadwal: 'Rabu 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2105', nama: 'Matematika Kimia II', sks: 3, jadwal: 'Kamis 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2107', nama: 'Pendidikan Pancasila & Kewarganegaraan', sks: 2, jadwal: 'Selasa 13.00 - 14.40', kelas: 'K' },
        { kode: 'MKK-2110', nama: 'Dasar-Dasar Biokimia', sks: 6, jadwal: 'Jumat 08.00 - 13.00', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-13',
      mahasiswaId: 'mhs-13',
      mahasiswaNama: 'Anisa Rahmawati',
      nim: '225090200111088',
      semester: 5,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 20,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-28',
      dosenPA: 'Masruri, S.Si., M.Si., Ph.D',
      mataKuliahList: [
        { kode: 'MKK-3101', nama: 'Sintesis Kimia Organik', sks: 3, jadwal: 'Senin 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-3102', nama: 'Spektrometri NMR & IR', sks: 3, jadwal: 'Selasa 10.00 - 12.30', kelas: 'B' },
        { kode: 'MKK-3104', nama: 'Kimia Pangan & Nutrisi', sks: 3, jadwal: 'Rabu 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-3106', nama: 'Praktikum Kimia Organik II', sks: 2, jadwal: 'Kamis 08.00 - 12.00', kelas: 'Lab 1' },
        { kode: 'MKK-3109', nama: 'Toksikologi Industri', sks: 3, jadwal: 'Kamis 13.30 - 16.00', kelas: 'A' },
        { kode: 'MKK-3112', nama: 'Kimia Minyak Atsiri', sks: 6, jadwal: 'Jumat 08.00 - 13.00', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-14',
      mahasiswaId: 'mhs-14',
      mahasiswaNama: 'Dimas Arya Pratama',
      nim: '215090201111099',
      semester: 7,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 18,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-30',
      dosenPA: 'Dr. Dra. Hermin Sulistyarti, M.Si',
      mataKuliahList: [
        { kode: 'MKK-4101', nama: 'Analisis Instrumen Lanjut', sks: 3, jadwal: 'Senin 10.00 - 12.30', kelas: 'A' },
        { kode: 'MKK-4103', nama: 'Sensor Berbasis Optik', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-4199', nama: 'Tugas Akhir / Skripsi', sks: 6, jadwal: 'Fleksibel Lab', kelas: 'Riset' },
        { kode: 'MKK-4107', nama: 'Pengolahan Limbah Kimia', sks: 3, jadwal: 'Rabu 13.00 - 15.30', kelas: 'B' },
        { kode: 'MKK-4111', nama: 'Manajemen Mutu ISO Laboratorium', sks: 3, jadwal: 'Jumat 08.00 - 10.30', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-15',
      mahasiswaId: 'mhs-15',
      mahasiswaNama: 'Zahra Aulia Putri',
      nim: '235090207111055',
      semester: 3,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 22,
      statusKprs: 'Menunggu Verifikasi PA',
      tanggalPengajuan: '2026-09-02',
      dosenPA: 'Anna Safitri, S.Si., M.Sc., Ph.D',
      mataKuliahList: [
        { kode: 'MKK-2101', nama: 'Kimia Dasar II', sks: 3, jadwal: 'Senin 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2103', nama: 'Kimia Organik I', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2104', nama: 'Kimia Fisik I', sks: 3, jadwal: 'Rabu 08.00 - 10.30', kelas: 'B' },
        { kode: 'MKK-2105', nama: 'Matematika Kimia II', sks: 3, jadwal: 'Kamis 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2106', nama: 'Fisika Dasar untuk Kimia', sks: 3, jadwal: 'Jumat 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-2108', nama: 'Kimia Bahan Makanan', sks: 4, jadwal: 'Kamis 13.00 - 16.20', kelas: 'C' },
        { kode: 'MKK-2111', nama: 'Biologi Sel Molekuler', sks: 3, jadwal: 'Rabu 13.00 - 15.30', kelas: 'A' }
      ]
    },
    {
      id: 'kprs-16',
      mahasiswaId: 'mhs-16',
      mahasiswaNama: 'Rizky Wahyu Hidayat',
      nim: '225090200111077',
      semester: 5,
      tahunAkademik: '2026/2027 Ganjil',
      totalSks: 21,
      statusKprs: 'Disetujui Dosen PA',
      tanggalPengajuan: '2026-08-29',
      dosenPA: 'Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Sc',
      mataKuliahList: [
        { kode: 'MKK-3101', nama: 'Kimia Koordinasi & Organologam', sks: 3, jadwal: 'Senin 07.30 - 10.00', kelas: 'A' },
        { kode: 'MKK-3103', nama: 'Kimia Unsur Transisi', sks: 3, jadwal: 'Selasa 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-3105', nama: 'Praktikum Kimia Anorganik II', sks: 2, jadwal: 'Rabu 08.00 - 12.00', kelas: 'Lab 2' },
        { kode: 'MKK-3107', nama: 'Kimia Keadaan Padat', sks: 3, jadwal: 'Kamis 10.00 - 12.30', kelas: 'A' },
        { kode: 'MKK-3110', nama: 'Katalisis Homogen & Heterogen', sks: 3, jadwal: 'Jumat 08.00 - 10.30', kelas: 'A' },
        { kode: 'MKK-3113', nama: 'Karakterisasi Senyawa Anorganik', sks: 7, jadwal: 'Kamis 13.00 - 18.50', kelas: 'A' }
      ]
    }
  ]);

  // Filtered KPRS List & Pagination calculation (Batas 10 list data)
  const filteredKprsList = kprsRecords.filter((item) => {
    const matchesSearch =
      item.mahasiswaNama.toLowerCase().includes(kprsSearchQuery.toLowerCase()) ||
      item.nim.toLowerCase().includes(kprsSearchQuery.toLowerCase());
    const activeSem = semesterDatabase.find((s) => s.status === 'Aktif') || semesterDatabase[0];
    const semName = activeSem ? activeSem.namaSemester : 'Ganjil 2026 / 2027';
    const matchesSem =
      kprsSemesterFilter === 'Semua' ||
      semName === kprsSemesterFilter ||
      (item.tahunAkademik && item.tahunAkademik.includes(kprsSemesterFilter));
    return matchesSearch && matchesSem;
  });

  const totalKprsItems = filteredKprsList.length;
  const totalKprsPages = Math.max(1, Math.ceil(totalKprsItems / kprsPageSize));
  const validKprsCurrentPage = Math.min(kprsCurrentPage, totalKprsPages);
  const startKprsIndex = totalKprsItems === 0 ? 0 : (validKprsCurrentPage - 1) * kprsPageSize;
  const endKprsIndex = Math.min(startKprsIndex + kprsPageSize, totalKprsItems);
  const paginatedKprsList = filteredKprsList.slice(startKprsIndex, endKprsIndex);

  // Helper: Cek apakah data mahasiswa adalah milik akun yang sedang login
  const isOwnStudent = (m: Mahasiswa): boolean => {
    if (currentRole !== 'mahasiswa') return true;

    // 1. Cek dari currentUser prop
    if (currentUser) {
      const curName = (currentUser.nama || '').trim().toLowerCase();
      const curNim = (currentUser.identifier || '').replace(/\D/g, '');
      const mNim = (m.nim || '').replace(/\D/g, '');
      const mName = (m.nama || '').trim().toLowerCase();
      if (curNim && mNim && (curNim === mNim || mNim.includes(curNim) || curNim.includes(mNim))) return true;
      if (curName && mName && (curName.includes(mName) || mName.includes(curName))) return true;
      const curUser = (currentUser.username || '').trim().toLowerCase();
      if (curUser && (mName.includes(curUser) || (m.nim || '').toLowerCase().includes(curUser))) return true;
    }

    // 2. Cek dari student prop
    if (student) {
      const sNim = (student.nim || '').replace(/\D/g, '');
      const mNim = (m.nim || '').replace(/\D/g, '');
      const sName = (student.nama || '').trim().toLowerCase();
      const mName = (m.nama || '').trim().toLowerCase();
      if (sNim && mNim && (sNim === mNim || mNim.includes(sNim) || sNim.includes(mNim))) return true;
      if (sName && mName && (sName.includes(mName) || mName.includes(sName))) return true;
    }

    // Default fallback to first student (Ahmad Rizky Pratama) if student is logged in
    const defaultName = 'ahmad rizky pratama';
    const defaultNim = '215090200111012';
    const mName = (m.nama || '').trim().toLowerCase();
    const mNim = (m.nim || '').replace(/\D/g, '');
    return mName.includes(defaultName) || (mNim && mNim.includes(defaultNim));
  };

  // Base list mahasiswa yang disaring berdasarkan hak akses role mahasiswa
  const baseMahasiswaList = useMemo(() => {
    if (currentRole !== 'mahasiswa') return mahasiswaList;
    const ownStudents = mahasiswaList.filter(isOwnStudent);
    if (ownStudents.length > 0) return ownStudents;

    // Fallback data mahasiswa milik user yang sedang aktif
    const targetStudent: Mahasiswa = student || {
      id: currentUser?.id || 'mhs-1',
      nim: (currentUser?.identifier || '').replace(/\D/g, '') || '215090200111012',
      nama: currentUser?.nama || 'Ahmad Rizky Pratama',
      angkatan: '2021',
      programStudi: 'S1 Kimia - FMIPA Universitas Brawijaya',
      dosenPAId: 'dos-2',
      dosenPANama: 'Masruri, S.Si., M.Si., Ph.D',
      status: 'Aktif',
      semester: 7,
      ipk: 3.78,
      totalSks: 132,
      judulSkripsi: 'Isolasi dan Modifikasi Struktur Senyawa Eugenol dari Minyak Atsiri Cengkeh (Syzygium aromaticum)',
      tahapSkripsi: 'Penelitian Laboratorium',
      labPenelitian: 'Laboratorium Kimia Organik & Bahan Alam'
    };
    return [targetStudent];
  }, [mahasiswaList, currentRole, student, currentUser]);

  // Unique angkatan list for filter
  const angkatanList = Array.from(new Set(baseMahasiswaList.map((m) => m.angkatan))).sort();

  // Filtered Mahasiswa List
  const filteredMahasiswa = baseMahasiswaList.filter((m) => {
    const matchesSearch =
      m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nim.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAngkatan = selectedAngkatan === 'Semua' || m.angkatan === selectedAngkatan;
    return matchesSearch && matchesAngkatan;
  });

  // Pagination calculation: Batas list field 10
  const totalItems = filteredMahasiswa.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedMahasiswa = filteredMahasiswa.slice(startIndex, endIndex);

  // Open Generate Surat Modal (Form berisi: Nama, NIM, Kategori)
  const handleOpenGenerateModal = (targetStudent?: Mahasiswa) => {
    if (currentRole === 'mahasiswa') {
      alert('Role Mahasiswa tidak memiliki akses ke fitur Generate Surat.');
      return;
    }
    const studentToUse = targetStudent || null;
    setGenerateTargetMhs(studentToUse);
    const namaVal = studentToUse ? studentToUse.nama : '';
    const nimVal = studentToUse ? studentToUse.nim : '';
    setFormNama(namaVal);
    setFormNim(nimVal);
    setFormKategori('Select'); // Default netral: Select

    // Auto-fill Ijin Kerja Lab defaults
    setFormJudulPenelitian(studentToUse?.judulSkripsi || '');
    setFormAlamat('Jl. MT Haryono No. 169, Dinoyo, Kec. Lowokwaru, Kota Malang');
    setFormEmail(namaVal ? `${namaVal.toLowerCase().replace(/\s+/g, '.')}@student.ub.ac.id` : '');
    setFormTelepon(nimVal ? '0812' + (nimVal.slice(-7) || '3456789') : '');
    setFormTujuan('Penelitian Skripsi');
    const defaultDosen = studentToUse?.dosenPANama || (dosenList[0] ? `${dosenList[0].nama}, ${dosenList[0].gelar}` : 'Masruri, S.Si., M.Si., Ph.D');
    setFormDosen(defaultDosen);
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultEnd = new Date();
    defaultEnd.setMonth(defaultEnd.getMonth() + 1);
    const defaultEndStr = defaultEnd.toISOString().split('T')[0];
    setFormTanggalPengajuan(todayStr);
    setFormTanggalPelaksanaan(todayStr);
    setFormTanggalMulai(todayStr);
    setFormTanggalSelesai(defaultEndStr);
    setFormLaboratorium(studentToUse?.labPenelitian || 'Laboratorium Kimia Organik & Bahan Alam');
    setFormStatus('Disetujui');
    const activeSem = semesterDatabase.find((s) => s.status === 'Aktif') || semesterDatabase[0];
    setFormSemester(activeSem ? activeSem.namaSemester : 'Ganjil 2026 / 2027');
    setFormKeteranganKhusus('');
    setFormWaktuLembur('17.00 - 21.00 WIB');
    setFormNamaPendamping('');
    setFormTeleponPendamping('');

    setIsGenerateModalOpen(true);
  };

  // Submit and Generate Surat
  const handleSaveGenerateSurat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formNim.trim()) {
      alert('Mohon lengkapi Nama dan NIM mahasiswa.');
      return;
    }

    if (!formKategori || formKategori === 'Select') {
      alert('Mohon pilih Kategori surat permohonan terlebih dahulu.');
      return;
    }

    if (formKategori === 'Ijin Kerja Lab' && !formJudulPenelitian.trim()) {
      alert('Mohon isi Judul Penelitian untuk permohonan Ijin Kerja Lab.');
      return;
    }

    if (formKategori === 'Ijin Lembur' && !formNamaPendamping.trim()) {
      alert('Mohon isi Nama Pendamping untuk permohonan Ijin Lembur.');
      return;
    }

    const matchedMhs =
      mahasiswaList.find(
        (m) =>
          (m.nim && formNim && m.nim.trim() === formNim.trim()) ||
          (m.nama && formNama && m.nama.toLowerCase().trim() === formNama.toLowerCase().trim())
      ) || generateTargetMhs;

    let keperluanStr = '';
    let tujuanInstansiStr = '';
    if (formKategori === 'Ijin Kerja Lab') {
      tujuanInstansiStr = formLaboratorium || 'Laboratorium Kimia FSTeM Universitas Brawijaya';
      keperluanStr = `Permohonan Ijin Kerja Lab untuk kegiatan ${formTujuan} dengan judul "${formJudulPenelitian}" di ${formLaboratorium} (Dosen: ${formDosen}).`;
    } else if (formKategori === 'KPRS') {
      tujuanInstansiStr = 'Subbag Akademik & Kemahasiswaan FSTeM UB';
      keperluanStr = `Permohonan Kartu Perubahan Rencana Studi (KPRS) Semester ${formSemester || 'Ganjil 2026 / 2027'}: ${formKeteranganKhusus || 'Penyesuaian mata kuliah dan beban SKS semester berjalan.'}`;
    } else if (formKategori === 'Ijin Lembur') {
      tujuanInstansiStr = formLaboratorium || 'Laboratorium Kimia FSTeM Universitas Brawijaya';
      const pendampingStr = formNamaPendamping.trim()
        ? ` (Pendamping: ${formNamaPendamping.trim()}${formTeleponPendamping.trim() ? ` / Telp: ${formTeleponPendamping.trim()}` : ''})`
        : '';
      keperluanStr = `Permohonan Ijin Lembur Kerja Laboratorium (${formWaktuLembur}) di ${formLaboratorium}: ${formKeteranganKhusus || 'Penyelesaian eksperimen riset dan pengukuran instrumen lab.'}${pendampingStr}`;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const tanggalPelaksanaanStr =
      formKategori === 'Ijin Kerja Lab' && formTanggalMulai && formTanggalSelesai
        ? `${formTanggalMulai} s/d ${formTanggalSelesai}`
        : formKategori === 'Ijin Lembur'
        ? formTanggalPelaksanaan || formTanggalPengajuan || todayStr
        : formKategori === 'KPRS'
        ? formTanggalPelaksanaan || formTanggalPengajuan || todayStr
        : formTanggalPelaksanaan || todayStr;

    const randomNomor = Math.floor(1400 + Math.random() * 500);
    const newSurat: PermohonanSuratItem = {
      id: `srt-${Date.now()}`,
      nomorSurat: `${randomNomor}/UN10.F09/AK/${new Date().getFullYear()}`,
      mahasiswaId: matchedMhs ? matchedMhs.id : `mhs-${Date.now()}`,
      mahasiswaNama: matchedMhs ? matchedMhs.nama : formNama.trim(),
      nim: matchedMhs ? matchedMhs.nim : formNim.trim(),
      jenisSurat: formKategori,
      tujuanInstansi: tujuanInstansiStr,
      keperluan: keperluanStr,
      tanggalPengajuan: formTanggalPengajuan || todayStr,
      status: formStatus,
      semester: matchedMhs ? matchedMhs.semester : 7,
      semesterAkademik: formSemester || 'Ganjil 2026 / 2027',
      judulPenelitian: formJudulPenelitian.trim(),
      alamat: formAlamat.trim(),
      email: formEmail.trim(),
      telepon: formTelepon.trim(),
      tujuanIjin: formTujuan,
      dosenNama: formDosen,
      tanggalPelaksanaan: tanggalPelaksanaanStr,
      tanggalMulai: formTanggalMulai,
      tanggalSelesai: formTanggalSelesai,
      laboratorium: formLaboratorium,
      namaPendamping: formNamaPendamping.trim(),
      teleponPendamping: formTeleponPendamping.trim(),
      waktuLembur: formWaktuLembur.trim()
    };

    const updated = [newSurat, ...permohonanList];
    setPermohonanList(updated);
    localStorage.setItem('sikma_permohonan_surat_records', JSON.stringify(updated));

    setIsGenerateModalOpen(false);
    setGenerateSuccessNotice(
      `Surat permohonan "${newSurat.jenisSurat}" untuk ${newSurat.mahasiswaNama} (NIM: ${newSurat.nim}) berhasil diterbitkan.`
    );
    setTimeout(() => setGenerateSuccessNotice(null), 6000);

    // Prompt preview
    setPreviewSurat(newSurat);
  };

  // Open Detail Mahasiswa Modal -> "Data Semua Pengajuan Surat Mahasiswa"
  const handleOpenDetail = (mhs: Mahasiswa) => {
    setDetailMhs(mhs);
    setDetailFilterKategori('Semua');
    setDetailCurrentPage(1);
  };

  // Open Form Tambah Surat (warna hijau)
  const handleOpenTambahSurat = (targetMhs?: Mahasiswa | null) => {
    // Tentukan data mahasiswa paten sesuai akun login user atau data detail mahasiswa aktif
    const activeStudent: Mahasiswa =
      currentRole === 'mahasiswa' && (currentUser || student)
        ? student ||
          mahasiswaList.find(isOwnStudent) ||
          detailMhs ||
          ({
            id: currentUser?.id || 'mhs-1',
            nama: currentUser?.nama || 'Ahmad Rizky Pratama',
            nim: (currentUser?.identifier || '215090200111012').replace(/\D/g, ''),
            angkatan: '2021',
            programStudi: 'S1 Kimia - FMIPA Universitas Brawijaya',
            dosenPAId: 'dos-2',
            dosenPANama: 'Masruri, S.Si., M.Si., Ph.D',
            status: 'Aktif',
            semester: 7,
            ipk: 3.78,
            totalSks: 132,
            judulSkripsi:
              'Isolasi dan Modifikasi Struktur Senyawa Eugenol dari Minyak Atsiri Cengkeh (Syzygium aromaticum)',
            tahapSkripsi: 'Penelitian Laboratorium',
            labPenelitian: 'Laboratorium Kimia Organik & Bahan Alam'
          } as Mahasiswa)
        : detailMhs || targetMhs || mahasiswaList[0];

    const namaVal =
      currentRole === 'mahasiswa' && currentUser?.nama
        ? currentUser.nama
        : activeStudent
        ? activeStudent.nama
        : '';
    const nimVal =
      currentRole === 'mahasiswa' && currentUser?.identifier
        ? currentUser.identifier.replace(/\D/g, '')
        : activeStudent
        ? activeStudent.nim
        : '';

    setTambahNama(namaVal);
    setTambahNim(nimVal);
    setTambahKategori('Select'); // Default bersifat netral!

    setTambahJudulPenelitian(activeStudent?.judulSkripsi || '');
    setTambahAlamat('Jl. MT Haryono No. 169, Dinoyo, Kec. Lowokwaru, Kota Malang');
    setTambahEmail(namaVal ? `${namaVal.toLowerCase().replace(/\s+/g, '.')}@student.ub.ac.id` : '');
    setTambahTelepon(nimVal ? '0812' + (nimVal.slice(-7) || '3456789') : '');
    const activeSem = semesterDatabase.find((s) => s.status === 'Aktif') || semesterDatabase[0];
    setTambahSemester(activeSem ? activeSem.namaSemester : 'Ganjil 2026 / 2027');
    setTambahTujuan('Penelitian Skripsi');
    const defaultDosen =
      activeStudent?.dosenPANama ||
      (dosenList[0] ? `${dosenList[0].nama}, ${dosenList[0].gelar}` : 'Masruri, S.Si., M.Si., Ph.D');
    setTambahDosen(defaultDosen);
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultEnd = new Date();
    defaultEnd.setMonth(defaultEnd.getMonth() + 1);
    const defaultEndStr = defaultEnd.toISOString().split('T')[0];
    setTambahTanggalPengajuan(todayStr);
    setTambahTanggalPelaksanaan(todayStr);
    setTambahTanggalMulai(todayStr);
    setTambahTanggalSelesai(defaultEndStr);
    setTambahLaboratorium(activeStudent?.labPenelitian || 'Laboratorium Kimia Organik & Bahan Alam');
    setTambahStatus('Disetujui');
    setTambahKeteranganKhusus('');
    setTambahWaktuLembur('17.00 - 21.00 WIB');
    setTambahNamaPendamping('');
    setTambahTeleponPendamping('');

    setIsTambahSuratModalOpen(true);
  };

  // Submit and Save Form Tambah Surat
  const handleSaveTambahSurat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tambahNama.trim() || !tambahNim.trim()) {
      alert('Mohon lengkapi Nama dan NIM mahasiswa.');
      return;
    }

    if (!tambahKategori || tambahKategori === 'Select') {
      alert('Mohon pilih Kategori surat permohonan terlebih dahulu.');
      return;
    }

    if (tambahKategori === 'Ijin Kerja Lab' && !tambahJudulPenelitian.trim()) {
      alert('Mohon isi Judul Penelitian untuk permohonan Ijin Kerja Lab.');
      return;
    }

    if (tambahKategori === 'Ijin Lembur' && !tambahNamaPendamping.trim()) {
      alert('Mohon isi Nama Pendamping untuk permohonan Ijin Lembur.');
      return;
    }

    const matchedMhs =
      mahasiswaList.find(
        (m) => m.nama.toLowerCase() === tambahNama.toLowerCase() || m.nim === tambahNim
      ) || detailMhs;

    let keperluanStr = '';
    let tujuanInstansiStr = '';
    if (tambahKategori === 'Ijin Kerja Lab') {
      tujuanInstansiStr = tambahLaboratorium || 'Laboratorium Kimia FSTeM Universitas Brawijaya';
      keperluanStr = `Permohonan Ijin Kerja Lab untuk kegiatan ${tambahTujuan} dengan judul "${tambahJudulPenelitian}" di ${tambahLaboratorium} (Dosen: ${tambahDosen}).`;
    } else if (tambahKategori === 'KPRS') {
      tujuanInstansiStr = 'Subbag Akademik & Kemahasiswaan FSTeM UB';
      keperluanStr = `Permohonan Kartu Perubahan Rencana Studi (KPRS) Semester ${tambahSemester || 'Ganjil 2026 / 2027'}: ${tambahKeteranganKhusus || 'Penyesuaian mata kuliah dan beban SKS semester berjalan.'}`;
    } else if (tambahKategori === 'Ijin Lembur') {
      tujuanInstansiStr = tambahLaboratorium || 'Laboratorium Kimia FSTeM Universitas Brawijaya';
      const pendampingStr = tambahNamaPendamping.trim()
        ? ` (Pendamping: ${tambahNamaPendamping.trim()}${tambahTeleponPendamping.trim() ? ` / Telp: ${tambahTeleponPendamping.trim()}` : ''})`
        : '';
      keperluanStr = `Permohonan Ijin Lembur Kerja Laboratorium (${tambahWaktuLembur}) di ${tambahLaboratorium}: ${tambahKeteranganKhusus || 'Penyelesaian eksperimen riset dan pengukuran instrumen lab.'}${pendampingStr}`;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const tanggalPelaksanaanStr =
      tambahKategori === 'Ijin Kerja Lab' && tambahTanggalMulai && tambahTanggalSelesai
        ? `${tambahTanggalMulai} s/d ${tambahTanggalSelesai}`
        : tambahKategori === 'Ijin Lembur'
        ? tambahTanggalPelaksanaan || tambahTanggalPengajuan || todayStr
        : tambahKategori === 'KPRS'
        ? tambahTanggalPelaksanaan || tambahTanggalPengajuan || todayStr
        : tambahTanggalPelaksanaan || todayStr;

    const randomNomor = Math.floor(1400 + Math.random() * 500);
    const newSurat: PermohonanSuratItem = {
      id: `srt-${Date.now()}`,
      nomorSurat: `${randomNomor}/UN10.F09/AK/${new Date().getFullYear()}`,
      mahasiswaId: matchedMhs ? matchedMhs.id : `mhs-${Date.now()}`,
      mahasiswaNama: tambahNama.trim(),
      nim: tambahNim.trim(),
      jenisSurat: tambahKategori,
      tujuanInstansi: tujuanInstansiStr,
      keperluan: keperluanStr,
      tanggalPengajuan: tambahTanggalPengajuan || todayStr,
      status: tambahStatus,
      semester: matchedMhs ? matchedMhs.semester : 7,
      semesterAkademik: tambahSemester || 'Ganjil 2026 / 2027',
      judulPenelitian: tambahJudulPenelitian.trim(),
      alamat: tambahAlamat.trim(),
      email: tambahEmail.trim(),
      telepon: tambahTelepon.trim(),
      tujuanIjin: tambahTujuan,
      dosenNama: tambahDosen,
      tanggalPelaksanaan: tanggalPelaksanaanStr,
      tanggalMulai: tambahTanggalMulai,
      tanggalSelesai: tambahTanggalSelesai,
      laboratorium: tambahLaboratorium,
      namaPendamping: tambahNamaPendamping.trim(),
      teleponPendamping: tambahTeleponPendamping.trim(),
      waktuLembur: tambahWaktuLembur.trim()
    };

    const updated = [newSurat, ...permohonanList];
    setPermohonanList(updated);
    localStorage.setItem('sikma_permohonan_surat_records', JSON.stringify(updated));

    setIsTambahSuratModalOpen(false);
    setGenerateSuccessNotice(
      `Surat "${newSurat.jenisSurat}" untuk ${newSurat.mahasiswaNama} berhasil ditambahkan.`
    );
    setTimeout(() => setGenerateSuccessNotice(null), 6000);
  };

  // Handle Browse File selection in File Surat Modal
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempFileSelection(file);
      setKprsFileToast(`File "${file.name}" terpilih dan siap disubmit.`);
      setTimeout(() => setKprsFileToast(null), 4000);
    }
  };

  // Handle Submit File in File Surat (Modal atau Dropdown)
  const handleConfirmSubmitFile = (targetRecord?: KprsRecord | null) => {
    const recordToSubmit = targetRecord || activeFileModalRecord;
    if (!recordToSubmit) return;
    const existing = kprsFilesMap[recordToSubmit.id];
    const fileName = tempFileSelection
      ? tempFileSelection.name
      : existing?.fileName || `Surat_KPRS_${recordToSubmit.nim}.pdf`;
    const fileSize = tempFileSelection
      ? `${(tempFileSelection.size / 1024).toFixed(1)} KB`
      : existing?.fileSize || '185 KB';
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].slice(0, 5)} WIB`;

    const updated = {
      ...kprsFilesMap,
      [recordToSubmit.id]: {
        fileName,
        fileSize,
        uploadedAt: dateStr,
        isSubmitted: true
      }
    };
    setKprsFilesMap(updated);
    localStorage.setItem('sikma_kprs_files_map', JSON.stringify(updated));
    setTempFileSelection(null);
    setKprsFileToast(`File Surat "${fileName}" untuk ${recordToSubmit.mahasiswaNama} berhasil disubmit.`);
    setTimeout(() => setKprsFileToast(null), 5000);
  };

  // Download Dokumen Resmi KPRS (.pdf)
  const handleDownloadKprsPdf = (record: KprsRecord) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Kop Surat Universitas Brawijaya
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text('KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI', 105, 18, { align: 'center' });
      doc.setFontSize(12);
      doc.text('UNIVERSITAS BRAWIJAYA', 105, 23, { align: 'center' });
      doc.setFontSize(10);
      doc.text('FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA', 105, 28, { align: 'center' });
      doc.setFontSize(11);
      doc.text('DEPARTEMEN KIMIA', 105, 33, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.setFontSize(8.5);
      doc.text('Jalan Veteran Malang 65145, Telp. (0341) 554403, Fax. (0341) 554403', 105, 38, { align: 'center' });
      doc.text('Laman: http://kimia.ub.ac.id, Email: kimia@ub.ac.id', 105, 42, { align: 'center' });

      doc.setLineWidth(0.8);
      doc.line(20, 45, 190, 45);
      doc.setLineWidth(0.2);
      doc.line(20, 46.2, 190, 46.2);

      // Judul KPRS
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text('KARTU PERUBAHAN RENCANA STUDI (KPRS)', 105, 55, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      const activeSem = semesterDatabase.find((s) => s.status === 'Aktif') || semesterDatabase[0];
      const semName = activeSem ? activeSem.namaSemester : 'Ganjil 2026 / 2027';
      doc.text(`Tahun Akademik: ${semName}`, 105, 60, { align: 'center' });

      // Biodata
      doc.setFontSize(9.5);
      doc.text(`Nama Mahasiswa    : ${record.mahasiswaNama}`, 20, 70);
      doc.text(`NIM               : ${record.nim}`, 20, 76);
      doc.text(`Program Studi     : S1 Kimia - FSTeM UB`, 20, 82);
      doc.text(`Semester          : Semester ${record.semester} (${semName})`, 20, 88);
      doc.text(`Dosen PA          : ${record.dosenPA}`, 20, 94);
      doc.text(`Total Beban SKS   : ${record.totalSks} SKS`, 20, 100);

      const fileData = kprsFilesMap[record.id];
      if (fileData?.isSubmitted) {
        doc.text(`Berkas Surat      : ${fileData.fileName} (${fileData.fileSize}) - Status: Terverifikasi`, 20, 106);
      }

      // Tabel Mata Kuliah
      let y = 118;
      doc.setFont('times', 'bold');
      doc.rect(20, y - 5, 170, 7);
      doc.text('Kode', 22, y);
      doc.text('Mata Kuliah', 48, y);
      doc.text('Kelas', 120, y);
      doc.text('SKS', 138, y);
      doc.text('Jadwal Kuliah', 152, y);

      doc.setFont('times', 'normal');
      record.mataKuliahList.forEach((mk) => {
        y += 7;
        doc.rect(20, y - 5, 170, 7);
        doc.text(mk.kode, 22, y);
        doc.text(mk.nama.length > 32 ? mk.nama.substring(0, 30) + '...' : mk.nama, 48, y);
        doc.text(mk.kelas, 122, y);
        doc.text(String(mk.sks), 140, y);
        doc.text(mk.jadwal, 152, y);
      });

      // Pengesahan
      y += 18;
      doc.text('Malang, Jawa Timur', 130, y);
      doc.text('Menyetujui,', 130, y + 5);
      doc.text('Dosen Pembimbing Akademik,', 130, y + 10);
      doc.text('Ketua Departemen Kimia,', 30, y + 10);

      y += 26;
      doc.setFont('times', 'bold');
      doc.text(record.dosenPA, 130, y);
      doc.text('Prof. Dr. Dra. Hermin Sulistyarti, M.Si', 30, y);
      doc.setFont('times', 'normal');
      doc.setFontSize(8.5);
      doc.text('NIP. 196403211989032001', 30, y + 4.5);

      doc.save(`KPRS_${record.nim}_${record.mahasiswaNama.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating KPRS PDF:', err);
    }
  };

  // Download PDF Letter
  const handleDownloadPdf = (surat: PermohonanSuratItem) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Kop UB
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.text('KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI', 105, 20, { align: 'center' });
      doc.setFontSize(13);
      doc.text('UNIVERSITAS BRAWIJAYA', 105, 26, { align: 'center' });
      doc.setFontSize(12);
      doc.text('FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA', 105, 32, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.text('DEPARTEMEN KIMIA', 105, 37, { align: 'center' });
      doc.setFontSize(8.5);
      doc.text('Jalan Veteran, Malang 65145, Jawa Timur, Indonesia', 105, 42, { align: 'center' });
      doc.text('Telp. (0341) 554403, 575777 | Email: kimia@ub.ac.id | Web: https://kimia.ub.ac.id', 105, 46, { align: 'center' });

      // Double line
      doc.setLineWidth(0.8);
      doc.line(20, 49, 190, 49);
      doc.setLineWidth(0.2);
      doc.line(20, 50.5, 190, 50.5);

      // Letter Title
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text(surat.jenisSurat.toUpperCase(), 105, 62, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.text(`Nomor: ${surat.nomorSurat}`, 105, 68, { align: 'center' });

      // Body text
      doc.setFontSize(10.5);
      const textIntro = 'Ketua Departemen Kimia Fakultas Sains, Teknologi, dan Matematika Universitas Brawijaya dengan ini menerangkan dengan sebenarnya bahwa:';
      const splitIntro = doc.splitTextToSize(textIntro, 170);
      doc.text(splitIntro, 20, 80);

      // Student details
      const startY = 92;
      const rowGap = 7;
      doc.text('Nama Mahasiswa', 25, startY);
      doc.text(`:  ${surat.mahasiswaNama}`, 70, startY);

      doc.text('Nomor Induk Mahasiswa (NIM)', 25, startY + rowGap);
      doc.text(`:  ${surat.nim}`, 70, startY + rowGap);

      doc.text('Program Studi / Jenjang', 25, startY + rowGap * 2);
      doc.text(':  S1 Kimia / Sarjana', 70, startY + rowGap * 2);

      doc.text('Semester / Status', 25, startY + rowGap * 3);
      doc.text(
        `:  Semester ${surat.semester} ${surat.semesterAkademik ? `(${surat.semesterAkademik}) ` : ''}/ Aktif Terdaftar`,
        70,
        startY + rowGap * 3
      );

      doc.text('Tujuan Instansi', 25, startY + rowGap * 4);
      doc.text(`:  ${surat.tujuanInstansi}`, 70, startY + rowGap * 4);

      // Description text
      const descY = startY + rowGap * 5 + 6;
      const textDesc = `Adalah benar-benar mahasiswa terdaftar dan berstatus aktif pada Departemen Kimia FSTeM Universitas Brawijaya untuk Tahun Akademik 2026/2027. Surat ini diterbitkan dan diberikan kepada yang bersangkutan untuk keperluan: "${surat.keperluan}".`;
      const splitDesc = doc.splitTextToSize(textDesc, 170);
      doc.text(splitDesc, 20, descY);

      const closeText = 'Demikian surat keterangan ini kami terbitkan dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.';
      doc.text(closeText, 20, descY + 24);

      // Signature
      const sigY = descY + 45;
      doc.text('Malang, Jawa Timur', 135, sigY);
      doc.text('Ketua Departemen Kimia,', 135, sigY + 5);

      // E-sign stamp box
      doc.setDrawColor(30, 64, 175);
      doc.roundedRect(135, sigY + 10, 48, 22, 2, 2, 'D');
      doc.setFontSize(8);
      doc.setTextColor(30, 64, 175);
      doc.text('TERVERIFIKASI DIGITAL', 159, sigY + 17, { align: 'center' });
      doc.text('SIKMA UB CLOUD SYSTEM', 159, sigY + 22, { align: 'center' });
      doc.text(new Date().toISOString().split('T')[0], 159, sigY + 27, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFont('times', 'bold');
      doc.setFontSize(10.5);
      doc.text('Prof. Dr. Dra. Hermin Sulistyarti, M.Si', 135, sigY + 38);
      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      doc.text('NIP. 196403211989032001', 135, sigY + 43);

      doc.save(`${surat.jenisSurat.replace(/\s+/g, '_')}_${surat.nim}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      window.print();
    }
  };

  // Handle Delete Mahasiswa dan seluruh data permohonan suratnya
  const confirmDeleteStudent = () => {
    if (!studentToDelete) return;
    const deletedNama = studentToDelete.nama;
    const deletedNim = studentToDelete.nim;

    // Hapus dari mahasiswaList
    const updatedStudents = mahasiswaList.filter(
      (m) => m.id !== studentToDelete.id && m.nim !== deletedNim
    );
    setMahasiswaList(updatedStudents);
    localStorage.setItem('sikma_student_list_data', JSON.stringify(updatedStudents));

    // Hapus seluruh riwayat permohonan surat terkait mahasiswa ini
    const updatedSurat = permohonanList.filter(
      (p) => p.nim !== deletedNim && p.mahasiswaNama.toLowerCase() !== deletedNama.toLowerCase()
    );
    setPermohonanList(updatedSurat);
    localStorage.setItem('sikma_permohonan_surat_records', JSON.stringify(updatedSurat));

    // Tutup modal detail jika sedang membuka mahasiswa yang dihapus
    if (detailMhs && (detailMhs.nim === deletedNim || detailMhs.id === studentToDelete.id)) {
      setDetailMhs(null);
    }

    setStudentToDelete(null);
    setDeleteNotice(`Data permohonan surat mahasiswa "${deletedNama}" (${deletedNim}) berhasil dihapus.`);
    setTimeout(() => setDeleteNotice(null), 5000);
  };

  // Handle Delete Surat Individu
  const confirmDeleteSurat = () => {
    if (!suratToDelete) return;
    const deletedJenis = suratToDelete.jenisSurat;
    const updatedSurat = permohonanList.filter((p) => p.id !== suratToDelete.id);
    setPermohonanList(updatedSurat);
    localStorage.setItem('sikma_permohonan_surat_records', JSON.stringify(updatedSurat));

    setSuratToDelete(null);
    setDeleteNotice(`Surat permohonan "${deletedJenis}" berhasil dihapus.`);
    setTimeout(() => setDeleteNotice(null), 5000);
  };

  // Handle Browse File selection untuk Surat di Modal Data Semua Pengajuan Surat Mahasiswa
  const handleSuratFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSuratForFile) {
      setTempSuratFileSelection(file);
      const targetId = activeSuratForFile.id;
      const updated = {
        ...suratFilesMap,
        [targetId]: {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toLocaleString('id-ID'),
          isSubmitted: false
        }
      };
      setSuratFilesMap(updated);
      localStorage.setItem('sikma_surat_files_map', JSON.stringify(updated));
      setSuratFileToast(`Berkas "${file.name}" terpilih untuk surat ${activeSuratForFile.jenisSurat}. Klik Submit untuk menyimpan.`);
      setTimeout(() => setSuratFileToast(null), 4000);
    }
  };

  // Handle Confirm Submit File untuk Surat
  const handleConfirmSubmitSuratFile = (targetSurat: PermohonanSuratItem) => {
    const existing = suratFilesMap[targetSurat.id];
    const fileName = tempSuratFileSelection
      ? tempSuratFileSelection.name
      : existing?.fileName || `Surat_${targetSurat.jenisSurat.replace(/\s+/g, '_')}_${targetSurat.nim}.pdf`;
    const fileSize = tempSuratFileSelection
      ? `${(tempSuratFileSelection.size / 1024).toFixed(1)} KB`
      : existing?.fileSize || '210 KB';
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].slice(0, 5)} WIB`;

    const updated = {
      ...suratFilesMap,
      [targetSurat.id]: {
        fileName,
        fileSize,
        uploadedAt: dateStr,
        isSubmitted: true
      }
    };
    setSuratFilesMap(updated);
    localStorage.setItem('sikma_surat_files_map', JSON.stringify(updated));
    setTempSuratFileSelection(null);
    setSuratFileToast(`Berkas "${fileName}" untuk surat ${targetSurat.jenisSurat} berhasil disubmit.`);
    setTimeout(() => setSuratFileToast(null), 5000);
  };

  // Handle Buka Modal Edit Surat
  const handleOpenEditSurat = (srt: PermohonanSuratItem) => {
    setEditingSurat(srt);
    setEditNomorSurat(srt.nomorSurat || '');
    setEditJenisSurat((srt.jenisSurat as 'Ijin Kerja Lab' | 'KPRS' | 'Ijin Lembur') || 'Ijin Kerja Lab');
    setEditTanggalPengajuan(srt.tanggalPengajuan || '');
    setEditStatus(srt.status || 'Disetujui');
    setEditKeperluan(srt.keperluan || '');
    setEditTujuanInstansi(srt.tujuanInstansi || '');
    setEditJudulPenelitian(srt.judulPenelitian || '');
    setEditTujuanIjin(srt.tujuanIjin || 'Penelitian Skripsi');
    setEditLaboratorium(srt.laboratorium || 'Laboratorium Kimia Organik & Bahan Alam');
    setEditDosenNama(srt.dosenNama || (dosenList[0] ? `${dosenList[0].nama}, ${dosenList[0].gelar}` : ''));
    setEditTanggalPelaksanaan(srt.tanggalPelaksanaan || '');
    setEditTanggalMulai(srt.tanggalMulai || '');
    setEditTanggalSelesai(srt.tanggalSelesai || '');
    setEditAlamat(srt.alamat || '');
    setEditEmail(srt.email || '');
    setEditTelepon(srt.telepon || '');
    setEditSemester(srt.semester || 7);
    setEditSemesterAkademik(srt.semesterAkademik || 'Ganjil 2026 / 2027');
    setEditWaktuLembur(srt.waktuLembur || '17.00 - 21.00 WIB');
    setEditNamaPendamping(srt.namaPendamping || '');
    setEditTeleponPendamping(srt.teleponPendamping || '');
    setIsEditSuratModalOpen(true);
  };

  // Handle Simpan Edit Surat
  const handleSaveEditSurat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSurat) return;

    let pelaksanaanStr = editTanggalPelaksanaan;
    if (editJenisSurat === 'Ijin Kerja Lab' && editTanggalMulai && editTanggalSelesai) {
      pelaksanaanStr = `${editTanggalMulai} s/d ${editTanggalSelesai}`;
    }

    const updated: PermohonanSuratItem = {
      ...editingSurat,
      nomorSurat: editNomorSurat.trim() || editingSurat.nomorSurat,
      jenisSurat: editJenisSurat,
      tanggalPengajuan: editTanggalPengajuan,
      status: editStatus,
      keperluan: editKeperluan.trim(),
      tujuanInstansi: editTujuanInstansi.trim() || (
        editJenisSurat === 'Ijin Kerja Lab' || editJenisSurat === 'Ijin Lembur'
          ? editLaboratorium
          : 'Subbag Akademik & Kemahasiswaan FSTeM UB'
      ),
      semester: Number(editSemester) || editingSurat.semester,
      semesterAkademik: editSemesterAkademik,
      judulPenelitian: editJudulPenelitian.trim(),
      alamat: editAlamat.trim(),
      email: editEmail.trim(),
      telepon: editTelepon.trim(),
      tujuanIjin: editTujuanIjin,
      dosenNama: editDosenNama,
      tanggalPelaksanaan: pelaksanaanStr,
      tanggalMulai: editTanggalMulai,
      tanggalSelesai: editTanggalSelesai,
      laboratorium: editLaboratorium,
      waktuLembur: editWaktuLembur.trim(),
      namaPendamping: editNamaPendamping.trim(),
      teleponPendamping: editTeleponPendamping.trim()
    };

    const newList = permohonanList.map((item) =>
      item.id === editingSurat.id ? updated : item
    );
    setPermohonanList(newList);
    localStorage.setItem('sikma_permohonan_surat_records', JSON.stringify(newList));

    setIsEditSuratModalOpen(false);
    setEditingSurat(null);
    setGenerateSuccessNotice(`Perubahan data surat "${updated.jenisSurat}" (${updated.nomorSurat}) berhasil disimpan.`);
    setTimeout(() => setGenerateSuccessNotice(null), 5000);
  };

  const formNamaId = useId();
  const formNimId = useId();
  const formKategoriId = useId();
  const formJudulId = useId();
  const formAlamatId = useId();
  const formEmailId = useId();
  const formTeleponId = useId();
  const formTujuanId = useId();
  const formDosenId = useId();
  const formTanggalId = useId();
  const formTanggalPengajuanId = useId();
  const formTanggalMulaiId = useId();
  const formTanggalSelesaiId = useId();
  const formLabId = useId();
  const formStatusId = useId();
  const formKprsTeleponId = useId();
  const formKprsSemesterId = useId();
  const formKprsStatusId = useId();
  const formKprsKeteranganId = useId();
  const formKprsTanggalPengajuanId = useId();
  const formWaktuId = useId();
  const formNamaPendampingId = useId();
  const formTeleponPendampingId = useId();
  const formLemburTanggalPengajuanId = useId();
  const formLemburTanggalPelaksanaanId = useId();
  const formLemburStatusId = useId();

  // IDs for Form Tambah Surat
  const tambahNamaId = useId();
  const tambahNimId = useId();
  const tambahKategoriId = useId();
  const tambahJudulId = useId();
  const tambahAlamatId = useId();
  const tambahEmailId = useId();
  const tambahTeleponId = useId();
  const tambahTujuanId = useId();
  const tambahDosenId = useId();
  const tambahTanggalId = useId();
  const tambahTanggalPengajuanLabId = useId();
  const tambahTanggalPengajuanLemburId = useId();
  const tambahTanggalPengajuanKprsId = useId();
  const tambahTanggalMulaiId = useId();
  const tambahTanggalSelesaiId = useId();
  const tambahLabId = useId();
  const tambahStatusId = useId();
  const tambahKprsTeleponId = useId();
  const tambahKprsSemesterId = useId();
  const tambahKprsStatusId = useId();
  const tambahKeteranganId = useId();
  const tambahWaktuId = useId();
  const tambahNamaPendampingId = useId();
  const tambahTeleponPendampingId = useId();
  const tambahLemburStatusId = useId();

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {generateSuccessNotice && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-emerald-700 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-500 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Sukses</p>
            <p className="text-emerald-100">{generateSuccessNotice}</p>
          </div>
          <button
            onClick={() => setGenerateSuccessNotice(null)}
            className="text-emerald-200 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER UTAMA & SUBTITLE SESUAI INSTRUKSI */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            {/* 1. Judul Permohonan Surat */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002B49] tracking-tight">
              Permohonan Surat
            </h1>

            {/* 2. Judul List Mahasiswa (dengan font lebih kecil) di bawah judul Permohonan Surat */}
            <h2 className="text-sm sm:text-base font-semibold text-slate-500 mt-1">
              List Mahasiswa
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium">
              Departemen Kimia FSTeM UB
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-200/60">
              Total {baseMahasiswaList.length} Mahasiswa
            </span>
          </div>
        </div>

        {/* 3. Di bawah judul List Mahasiswa buat button Generate Surat warna hijau dan button List KPRS warna biru */}
        {currentRole !== 'mahasiswa' && (
          <div className="flex flex-wrap items-center gap-3 pt-5">
            {/* Button Generate Surat warna hijau */}
            <button
              type="button"
              onClick={() => handleOpenGenerateModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Generate Surat</span>
            </button>

            {/* Button List KPRS warna biru */}
            <button
              type="button"
              onClick={() => {
                setIsKprsModalOpen(true);
                setKprsCurrentPage(1);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>List KPRS</span>
            </button>
          </div>
        )}
      </div>


      {/* FILTER & PENCARIAN MAHASISWA */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan Nama atau NIM..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Angkatan:</span>
            <select
              value={selectedAngkatan}
              onChange={(e) => {
                setSelectedAngkatan(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Angkatan</option>
              {angkatanList.map((th) => (
                <option key={th} value={th}>
                  Angkatan {th}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. FIELDS PERMOHONAN SURAT : NAMA, NIM, AKSI (BERISI BUTTON DETAIL & BUTTON DELETE) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Daftar Permohonan Surat Mahasiswa
            </h3>
            <p className="text-xs text-slate-500">
              Tabel data mahasiswa dengan field Nama, NIM, dan Aksi (Batas 10 data per halaman)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200/70 text-slate-700 rounded-md">
              Total {totalItems} Mahasiswa
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md">
              Halaman {validCurrentPage} / {totalPages}
            </span>
          </div>
        </div>

        {/* Alert Notice jika ada penghapusan */}
        {deleteNotice && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{deleteNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setDeleteNotice(null)}
              className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th scope="col" className="py-3.5 px-6">
                  Nama
                </th>
                <th scope="col" className="py-3.5 px-6">
                  NIM
                </th>
                <th scope="col" className="py-3.5 px-6 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedMahasiswa.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-slate-400">
                    <User className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Data mahasiswa tidak ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba sesuaikan kata kunci pencarian Nama atau NIM
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedMahasiswa.map((mhs) => (
                  <tr
                    key={mhs.id}
                    className="hover:bg-blue-50/40 transition-colors duration-150 group"
                  >
                    {/* Field 1: Nama */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#002B49] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {mhs.nama
                            .split(' ')
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                            {mhs.nama}
                          </p>
                          <p className="text-xs text-slate-400">
                            Semester {mhs.semester} • Angkatan {mhs.angkatan} • IPK {mhs.ipk.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Field 2: NIM */}
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-700">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80 text-slate-800">
                        {mhs.nim}
                      </span>
                    </td>

                    {/* Field 3: Aksi (Berisi Button Detail dan Button Delete) */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(mhs)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all duration-150 cursor-pointer"
                          title={`Lihat Detail Permohonan Surat Mahasiswa ${mhs.nama}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        {currentRole !== 'mahasiswa' && (
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(mhs)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer"
                            title={`Hapus Data Mahasiswa ${mhs.nama}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Batas list field 10) */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70">
          <div className="text-xs text-slate-600 font-medium">
            {totalItems > 0 ? (
              <span>
                Menampilkan <strong className="text-slate-800">{startIndex + 1}</strong>–
                <strong className="text-slate-800">{endIndex}</strong> dari{' '}
                <strong className="text-slate-800">{totalItems}</strong> mahasiswa{' '}
                <span className="text-slate-400 font-normal">(Batas 10 per halaman)</span>
              </span>
            ) : (
              <span>Tidak ada data mahasiswa</span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              {/* Tombol Halaman Pertama */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Tombol Halaman Sebelumnya */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Nomor-nomor Halaman */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-8 h-8 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      validCurrentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                        : 'text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Tombol Halaman Selanjutnya */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Tombol Halaman Terakhir */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: FORMULIR GENERATE SURAT (TRIGGER BUTTON HIJAU)
          ========================================================================= */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <FilePlus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Formulir Generate Surat
                  </h3>
                  <p className="text-xs text-slate-300">
                    Penerbitan surat resmi mahasiswa Departemen Kimia FSTeM UB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Form berisi Nama, NIM, Kategori (berisi list select : Ijin Kerja Lab) */}
            <form onSubmit={handleSaveGenerateSurat} className="p-6 space-y-4">
              {/* Field 1: Nama (ditulis manual) */}
              <div>
                <label
                  htmlFor={formNamaId}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Nama <span className="text-rose-500">*</span>
                </label>
                <input
                  id={formNamaId}
                  type="text"
                  placeholder="Tuliskan nama lengkap mahasiswa..."
                  value={formNama}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormNama(val);
                    const found = mahasiswaList.find(
                      (m) => m.nama.toLowerCase() === val.toLowerCase()
                    );
                    if (found) {
                      setFormNim(found.nim);
                      setGenerateTargetMhs(found);
                      setFormEmail(`${found.nama.toLowerCase().replace(/\s+/g, '.')}@student.ub.ac.id`);
                      setFormTelepon('0812' + (found.nim.slice(-7) || '3456789'));
                      if (found.judulSkripsi) setFormJudulPenelitian(found.judulSkripsi);
                      if (found.dosenPANama) setFormDosen(found.dosenPANama);
                      if (found.labPenelitian) setFormLaboratorium(found.labPenelitian);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Field 2: NIM */}
              <div>
                <label
                  htmlFor={formNimId}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  NIM <span className="text-rose-500">*</span>
                </label>
                <input
                  id={formNimId}
                  type="text"
                  placeholder="Masukkan Nomor Induk Mahasiswa (NIM)..."
                  value={formNim}
                  onChange={(e) => {
                    setFormNim(e.target.value);
                    const found = mahasiswaList.find((m) => m.nim === e.target.value);
                    if (found) {
                      setFormNama(found.nama);
                      setGenerateTargetMhs(found);
                      setFormEmail(`${found.nama.toLowerCase().replace(/\s+/g, '.')}@student.ub.ac.id`);
                      setFormTelepon('0812' + (found.nim.slice(-7) || '3456789'));
                      if (found.judulSkripsi) setFormJudulPenelitian(found.judulSkripsi);
                      if (found.dosenPANama) setFormDosen(found.dosenPANama);
                      if (found.labPenelitian) setFormLaboratorium(found.labPenelitian);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Field 3: Kategori (tambah opsi Select bersifat netral dan jadikan default dalam List Kategori) */}
              <div>
                <label
                  htmlFor={formKategoriId}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  id={formKategoriId}
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                  required
                >
                  <option value="Select">Select</option>
                  <option value="Ijin Kerja Lab">Ijin Kerja Lab</option>
                  <option value="KPRS">KPRS</option>
                  <option value="Ijin Lembur">Ijin Lembur</option>
                </select>
                {formKategori === 'Select' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Silakan pilih kategori surat (Ijin Kerja Lab, KPRS, atau Ijin Lembur).
                  </p>
                )}
                {formKategori !== 'Select' && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    Kategori terpilih: <strong>{formKategori}</strong>. Rincian formulir ditampilkan di bawah.
                  </p>
                )}
              </div>

              {/* JIKA KLIK / MEMILIH KATEGORI: Ijin Kerja Lab */}
              {formKategori === 'Ijin Kerja Lab' && (
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-emerald-200/80 pb-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <span>Rincian Permohonan Ijin Kerja Lab</span>
                  </div>

                  {/* 1. Judul Penelitian */}
                  <div>
                    <label
                      htmlFor={formJudulId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Judul Penelitian <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id={formJudulId}
                      rows={2}
                      placeholder="Masukkan judul riset atau penelitian..."
                      value={formJudulPenelitian}
                      onChange={(e) => setFormJudulPenelitian(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                      required
                    />
                  </div>

                  {/* 2. Alamat */}
                  <div>
                    <label
                      htmlFor={formAlamatId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Alamat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id={formAlamatId}
                      type="text"
                      placeholder="Alamat domisili / tempat tinggal mahasiswa..."
                      value={formAlamat}
                      onChange={(e) => setFormAlamat(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>

                  {/* 3. Email & 4. Telepon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor={formEmailId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={formEmailId}
                        type="email"
                        placeholder="contoh@student.ub.ac.id"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={formTeleponId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Telepon <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={formTeleponId}
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formTelepon}
                        onChange={(e) => setFormTelepon(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* 5. Tujuan (dengan opsi : Penelitian Dosen, Proyek Kimia, Program Kreatifitas Mahasiswa, Penelitian Skripsi, Penelitian Tesis, Penelitian Disertasi, Analisis Sampel, Lainnya) */}
                  <div>
                    <label
                      htmlFor={formTujuanId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Tujuan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={formTujuanId}
                      value={formTujuan}
                      onChange={(e) => setFormTujuan(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      required
                    >
                      {tujuanOpsiList.map((tujuan) => (
                        <option key={tujuan} value={tujuan}>
                          {tujuan}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 6. Dosen (ambil dari database dosen) */}
                  <div>
                    <label
                      htmlFor={formDosenId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Dosen <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={formDosenId}
                      value={formDosen}
                      onChange={(e) => setFormDosen(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      required
                    >
                      <option value="" disabled>-- Pilih Dosen dari Database --</option>
                      {dosenList.map((d) => (
                        <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                          {d.nama}, {d.gelar} — {d.bidang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 7. Tanggal Pengajuan */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor={formTanggalPengajuanId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                      >
                        Tanggal Pengajuan <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setFormTanggalPengajuan(today);
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Hari ini</span>
                      </button>
                    </div>
                    <input
                      id={formTanggalPengajuanId}
                      type="date"
                      value={formTanggalPengajuan}
                      onChange={(e) => setFormTanggalPengajuan(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      required
                    />
                  </div>

                  {/* 8. Tanggal Pelaksanaan : Pilihan tanggal (mulai dari tanggal - sampai tanggal) */}
                  <div className="bg-white/90 p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor={formTanggalMulaiId}
                          className="block text-[11px] font-semibold text-slate-600 mb-1"
                        >
                          Mulai Dari Tanggal <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id={formTanggalMulaiId}
                          type="date"
                          value={formTanggalMulai}
                          onChange={(e) => setFormTanggalMulai(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={formTanggalSelesaiId}
                          className="block text-[11px] font-semibold text-slate-600 mb-1"
                        >
                          Sampai Tanggal <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id={formTanggalSelesaiId}
                          type="date"
                          value={formTanggalSelesai}
                          onChange={(e) => setFormTanggalSelesai(e.target.value)}
                          min={formTanggalMulai}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium pt-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Rentang pelaksanaan: <strong>{formTanggalMulai || '-'}</strong> s/d <strong>{formTanggalSelesai || '-'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* 8. Laboratorium & 9. Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor={formLabId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Laboratorium <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={formLabId}
                        value={formLaboratorium}
                        onChange={(e) => setFormLaboratorium(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                        required
                      >
                        {jenisLaboratoriumList.map((lab) => (
                          <option key={lab} value={lab}>
                            {lab}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={formStatusId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={formStatusId}
                        value={formStatus}
                        onChange={(e) =>
                          setFormStatus(
                            e.target.value as 'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak'
                          )
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                        required
                      >
                        <option value="Disetujui">Disetujui</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* JIKA KLIK / MEMILIH KATEGORI: KPRS */}
              {formKategori === 'KPRS' && (
                <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-blue-200/80 pb-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                    <span>Rincian Permohonan KPRS (Kartu Perubahan Rencana Studi)</span>
                  </div>

                  {/* List: Telepon, Semester & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label
                        htmlFor={formKprsTeleponId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Telepon <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={formKprsTeleponId}
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={formTelepon}
                        onChange={(e) => setFormTelepon(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={formKprsSemesterId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Semester <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={formKprsSemesterId}
                        value={formSemester}
                        onChange={(e) => setFormSemester(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        required
                      >
                        <option value="" disabled>-- Pilih Semester dari Database --</option>
                        {semesterDatabase.map((sem) => (
                          <option key={sem.id} value={sem.namaSemester}>
                            {sem.namaSemester} {sem.status === 'Aktif' ? '• (Aktif)' : `• (${sem.status})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={formKprsStatusId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={formKprsStatusId}
                        value={formStatus}
                        onChange={(e) =>
                          setFormStatus(
                            e.target.value as 'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak'
                          )
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        required
                      >
                        <option value="Disetujui">Disetujui</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 -mt-1.5">
                    Pilihan semester akademik diambil dari database semester (Ganjil 2023 / 2024 s.d. Ganjil 2030 / 2031).
                  </p>

                  <div>
                    <label
                      htmlFor={formKprsKeteranganId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Keterangan Perubahan / Tambah Mata Kuliah <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id={formKprsKeteranganId}
                      rows={3}
                      placeholder="Tuliskan mata kuliah yang ditambah/dihapus beserta alasan..."
                      value={formKeteranganKhusus}
                      onChange={(e) => setFormKeteranganKhusus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Dosen Pembimbing Akademik (PA)
                      </label>
                      <select
                        value={formDosen}
                        onChange={(e) => setFormDosen(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                      >
                        {dosenList.map((d) => (
                          <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                            {d.nama}, {d.gelar}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor={formKprsTanggalPengajuanId}
                          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                        >
                          Tanggal Pengajuan <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            setFormTanggalPengajuan(today);
                            setFormTanggalPelaksanaan(today);
                          }}
                          className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold cursor-pointer underline flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Hari ini</span>
                        </button>
                      </div>
                      <input
                        id={formKprsTanggalPengajuanId}
                        type="date"
                        value={formTanggalPengajuan}
                        onChange={(e) => {
                          setFormTanggalPengajuan(e.target.value);
                          setFormTanggalPelaksanaan(e.target.value);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* JIKA KLIK / MEMILIH KATEGORI: Ijin Lembur */}
              {formKategori === 'Ijin Lembur' && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Rincian Permohonan Ijin Lembur Kerja Laboratorium</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Laboratorium <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formLaboratorium}
                        onChange={(e) => setFormLaboratorium(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                        required
                      >
                        {jenisLaboratoriumList.map((lab) => (
                          <option key={lab} value={lab}>
                            {lab}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={formWaktuId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Waktu / Jam Lembur <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={formWaktuId}
                        type="text"
                        placeholder="Contoh: 17.00 - 21.00 WIB"
                        value={formWaktuLembur}
                        onChange={(e) => setFormWaktuLembur(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* List: Nama Pendamping (tulis manual) & No Telp Pendamping */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-amber-100/60 p-3.5 rounded-xl border border-amber-200">
                    <div>
                      <label
                        htmlFor={formNamaPendampingId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Nama Pendamping (Tulis Manual) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={formNamaPendampingId}
                        type="text"
                        placeholder="Tulis manual nama pendamping..."
                        value={formNamaPendamping}
                        onChange={(e) => setFormNamaPendamping(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        required
                      />
                      <p className="text-[11px] text-amber-800/80 mt-1">
                        Nama pendamping ditulis manual (dapat berupa laboran, asisten praktikum, atau rekan riset).
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor={formTeleponPendampingId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        No Telp Pendamping <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={formTeleponPendampingId}
                        type="tel"
                        placeholder="Contoh: 081298765432"
                        value={formTeleponPendamping}
                        onChange={(e) => setFormTeleponPendamping(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        required
                      />
                      <p className="text-[11px] text-amber-800/80 mt-1">
                        Nomor HP / WhatsApp aktif pendamping selama kegiatan lembur di lab.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Alasan / Keperluan Lembur Riset Lab <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Jelaskan running eksperimen yang membutuhkan lembur..."
                      value={formKeteranganKhusus}
                      onChange={(e) => setFormKeteranganKhusus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor={formLemburTanggalPengajuanId}
                          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                        >
                          Tanggal Pengajuan <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            setFormTanggalPengajuan(today);
                          }}
                          className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold cursor-pointer underline flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Hari ini</span>
                        </button>
                      </div>
                      <input
                        id={formLemburTanggalPengajuanId}
                        type="date"
                        value={formTanggalPengajuan}
                        onChange={(e) => setFormTanggalPengajuan(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={formLemburTanggalPelaksanaanId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Tanggal Lembur <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={formLemburTanggalPelaksanaanId}
                        type="date"
                        value={formTanggalPelaksanaan}
                        onChange={(e) => setFormTanggalPelaksanaan(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Dosen Penanggung Jawab
                      </label>
                      <select
                        value={formDosen}
                        onChange={(e) => setFormDosen(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                      >
                        {dosenList.map((d) => (
                          <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                            {d.nama}, {d.gelar}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={formLemburStatusId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={formLemburStatusId}
                        value={formStatus}
                        onChange={(e) =>
                          setFormStatus(
                            e.target.value as 'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak'
                          )
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                        required
                      >
                        <option value="Disetujui">Disetujui</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Generate Surat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: LIST KPRS MAHASISWA (TRIGGER BUTTON BIRU LIST KPRS)
          ========================================================================= */}
      {isKprsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    List KPRS Mahasiswa (Kartu Perubahan Rencana Studi)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Semester Ganjil 2026/2027 • Departemen Kimia FSTeM Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsKprsModalOpen(false);
                  setSelectedKprsDetail(null);
                }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List KPRS / KPRS Detail */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {selectedKprsDetail ? (
                /* Detail Satu KPRS */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedKprsDetail(null)}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      ← Kembali ke Daftar KPRS
                    </button>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                      {selectedKprsDetail.statusKprs}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Nama Mahasiswa:</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {selectedKprsDetail.mahasiswaNama}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">NIM:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedKprsDetail.nim}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Dosen Pembimbing Akademik:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedKprsDetail.dosenPA}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Beban SKS:</span>
                      <span className="font-bold text-blue-700 text-sm">
                        {selectedKprsDetail.totalSks} SKS
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Daftar Mata Kuliah dalam KPRS
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Kode</th>
                            <th className="py-2.5 px-3">Mata Kuliah</th>
                            <th className="py-2.5 px-3 text-center">Kelas</th>
                            <th className="py-2.5 px-3 text-center">SKS</th>
                            <th className="py-2.5 px-3">Jadwal Kuliah</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedKprsDetail.mataKuliahList.map((mk, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono font-semibold text-slate-600">
                                {mk.kode}
                              </td>
                              <td className="py-2 px-3 font-medium text-slate-800">
                                {mk.nama}
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-slate-700">
                                {mk.kelas}
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-blue-700">
                                {mk.sks}
                              </td>
                              <td className="py-2 px-3 text-slate-500">{mk.jadwal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Daftar Semua KPRS */
                <div className="space-y-4">
                  {/* Filter & Kontrol Semester */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari Nama atau NIM mahasiswa..."
                        value={kprsSearchQuery}
                        onChange={(e) => {
                          setKprsSearchQuery(e.target.value);
                          setKprsCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {kprsSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setKprsSearchQuery('');
                            setKprsCurrentPage(1);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600 shrink-0">
                        Semester:
                      </label>
                      <select
                        value={kprsSemesterFilter}
                        onChange={(e) => {
                          setKprsSemesterFilter(e.target.value);
                          setKprsCurrentPage(1);
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Semua">Semua Semester</option>
                        {semesterDatabase.map((sem) => (
                          <option key={sem.id} value={sem.namaSemester}>
                            {sem.namaSemester} ({sem.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Keterangan & Total */}
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>
                      Menampilkan status Kartu Perubahan Rencana Studi (KPRS) mahasiswa terdaftar.
                    </span>
                    <span className="font-semibold text-slate-700">
                      Total: {totalKprsItems} Data KPRS {totalKprsItems > 0 && `(Halaman ${validKprsCurrentPage} dari ${totalKprsPages})`}
                    </span>
                  </div>

                  {/* TABEL FIELDS : NAMA, NIM, JENIS, SEMESTER, ACTION */}
                  <div className="border border-slate-200 rounded-xl overflow-visible">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Nama</th>
                          <th className="py-3 px-4">NIM</th>
                          <th className="py-3 px-4">Jenis</th>
                          <th className="py-3 px-4">Semester</th>
                          <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedKprsList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              Tidak ada data KPRS yang sesuai dengan filter
                            </td>
                          </tr>
                        ) : (
                          paginatedKprsList.map((item) => {
                            const activeSem =
                              semesterDatabase.find((s) => s.status === 'Aktif') || semesterDatabase[0];
                            const semName =
                              item.tahunAkademik || (activeSem ? activeSem.namaSemester : 'Ganjil 2026 / 2027');
                            const fileInfo = kprsFilesMap[item.id];
                            const isDropdownOpen = activeFileDropdownId === item.id;

                            return (
                              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                {/* 1. Nama */}
                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                                      {item.mahasiswaNama
                                        .split(' ')
                                        .slice(0, 2)
                                        .map((n) => n[0])
                                        .join('')}
                                    </div>
                                    <div>
                                      <span>{item.mahasiswaNama}</span>
                                      <p className="text-[10px] text-slate-400 font-normal">
                                        Dosen PA: {item.dosenPA}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* 2. NIM */}
                                <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200/80">
                                    {item.nim}
                                  </span>
                                </td>

                                {/* 3. Jenis (hanya memuat jenis/Kategori KPRS) */}
                                <td className="py-3.5 px-4">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                    <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                                    <span>KPRS</span>
                                  </span>
                                </td>

                                {/* 4. Semester (dari database Semester) */}
                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5">
                                    <span className="font-semibold text-slate-800 block text-xs">
                                      {semName}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                                      <span>Semester {item.semester}</span>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-slate-500 font-normal">{activeSem?.status || 'Aktif'}</span>
                                    </span>
                                  </div>
                                </td>

                                {/* 5. Action (berisi button File) */}
                                <td className="py-3.5 px-4 text-center">
                                  <div className="inline-flex items-center justify-center gap-1.5 relative">
                                    {/* BUTTON FILE */}
                                    <div className="relative inline-block text-left">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveFileDropdownId((curr) => (curr === item.id ? null : item.id));
                                          setActiveFileModalRecord(item);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                        title="Buka File Surat (Browse, Submit, Preview)"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>File</span>
                                        <ChevronDown className={`w-3 h-3 text-blue-200 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                      </button>

                                      {/* POPOVER / DROPDOWN BUTTON FILE:
                                          Judul File Surat, dengan list berbentuk (Browse, Submit, Preview) */}
                                      {isDropdownOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setActiveFileDropdownId(null)}
                                          />
                                          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden text-left animate-fade-in">
                                            {/* Judul: File Surat */}
                                            <div className="bg-[#002B49] text-white px-4 py-2.5 flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-400" />
                                                <div>
                                                  <h4 className="font-bold text-xs text-white">File Surat</h4>
                                                  <p className="text-[10px] text-slate-300 truncate max-w-[170px]">
                                                    {item.mahasiswaNama}
                                                  </p>
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => setActiveFileDropdownId(null)}
                                                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>

                                            {/* List Berbentuk (Browse, Submit, Preview) */}
                                            <div className="p-2.5 space-y-2">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
                                                Menu Berkas Surat
                                              </span>

                                              {/* 1. Browse */}
                                              <div className="p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all">
                                                <div className="flex items-center justify-between gap-2">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                                      <FolderOpen className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                      <span className="font-bold text-slate-800 text-xs block">
                                                        Browse
                                                      </span>
                                                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                                                        {tempFileSelection
                                                          ? tempFileSelection.name
                                                          : fileInfo?.fileName || 'Pilih berkas surat'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setActiveFileModalRecord(item);
                                                      fileInputRef.current?.click();
                                                    }}
                                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
                                                  >
                                                    Browse
                                                  </button>
                                                </div>
                                              </div>

                                              {/* 2. Submit */}
                                              <div className="p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-emerald-300 transition-all">
                                                <div className="flex items-center justify-between gap-2">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                      <Send className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                      <span className="font-bold text-slate-800 text-xs block">
                                                        Submit
                                                      </span>
                                                      <span className="text-[10px] text-slate-500 block">
                                                        {fileInfo?.isSubmitted ? 'Berkas tersimpan' : 'Kirim berkas surat'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      handleConfirmSubmitFile(item);
                                                    }}
                                                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs shrink-0 ${
                                                      fileInfo?.isSubmitted
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    }`}
                                                  >
                                                    {fileInfo?.isSubmitted ? 'Tersimpan ✓' : 'Submit'}
                                                  </button>
                                                </div>
                                              </div>

                                              {/* 3. Preview */}
                                              <div className="p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-purple-300 transition-all">
                                                <div className="flex items-center justify-between gap-2">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                                      <Eye className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                      <span className="font-bold text-slate-800 text-xs block">
                                                        Preview
                                                      </span>
                                                      <span className="text-[10px] text-slate-500 block">
                                                        Pratinjau surat resmi
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setActivePreviewKprsRecord(item);
                                                      setActiveFileDropdownId(null);
                                                    }}
                                                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
                                                  >
                                                    Preview
                                                  </button>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Footer Dropdown: Link ke Dialog Modal Lengkap */}
                                            <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveFileModalRecord(item);
                                                  setActiveFileDropdownId(null);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1"
                                              >
                                                <span>Buka Dialog File Lengkap</span>
                                                <ChevronRight className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {fileInfo?.isSubmitted && (
                                      <span
                                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                                        title={`File disubmit: ${fileInfo.fileName}`}
                                      >
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>Tersimpan</span>
                                      </span>
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

                  {/* Pagination Bar List KPRS (Limit 10 List Data) */}
                  <div className="px-4 sm:px-5 py-3 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80">
                    <div className="text-xs text-slate-600 font-medium">
                      {totalKprsItems > 0 ? (
                        <span>
                          Menampilkan <strong className="text-slate-800">{startKprsIndex + 1}</strong>–
                          <strong className="text-slate-800">{endKprsIndex}</strong> dari{' '}
                          <strong className="text-slate-800">{totalKprsItems}</strong> data KPRS{' '}
                          <span className="text-slate-400 font-normal">(Batas 10 per halaman)</span>
                        </span>
                      ) : (
                        <span>Tidak ada data KPRS</span>
                      )}
                    </div>

                    {totalKprsPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        {/* Tombol Halaman Pertama */}
                        <button
                          type="button"
                          onClick={() => setKprsCurrentPage(1)}
                          disabled={validKprsCurrentPage === 1}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Halaman Pertama"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>

                        {/* Tombol Halaman Sebelumnya */}
                        <button
                          type="button"
                          onClick={() => setKprsCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={validKprsCurrentPage === 1}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Halaman Sebelumnya"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Nomor-nomor Halaman */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalKprsPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setKprsCurrentPage(pageNum)}
                              className={`min-w-8 h-8 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                validKprsCurrentPage === pageNum
                                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                                  : 'text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        {/* Tombol Halaman Selanjutnya */}
                        <button
                          type="button"
                          onClick={() => setKprsCurrentPage((p) => Math.min(totalKprsPages, p + 1))}
                          disabled={validKprsCurrentPage === totalKprsPages}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Halaman Selanjutnya"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Tombol Halaman Terakhir */}
                        <button
                          type="button"
                          onClick={() => setKprsCurrentPage(totalKprsPages)}
                          disabled={validKprsCurrentPage === totalKprsPages}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Halaman Terakhir"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Sistem Informasi Akademik Departemen Kimia UB
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsKprsModalOpen(false);
                  setSelectedKprsDetail(null);
                  setActiveFileDropdownId(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input File Tersembunyi untuk Aksi Browse pada Button File */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
      />

      {/* Toast Notifikasi Berkas File KPRS */}
      {kprsFileToast && (
        <div className="fixed bottom-6 right-6 z-80 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{kprsFileToast}</span>
          <button
            type="button"
            onClick={() => setKprsFileToast(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MODAL FILE SURAT (DIPICU OLEH BUTTON FILE DI LIST KPRS)
          Judul: File Surat
          List berbentuk: (Browse, Submit, Preview)
          ========================================================================= */}
      {activeFileModalRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8 flex flex-col">
            {/* Header: Judul File Surat */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">File Surat</h3>
                  <p className="text-xs text-slate-300">
                    Berkas Pengajuan KPRS • {activeFileModalRecord.mahasiswaNama} ({activeFileModalRecord.nim})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveFileModalRecord(null);
                  setTempFileSelection(null);
                }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: Ringkasan & List Berbentuk (Browse, Submit, Preview) */}
            <div className="p-6 space-y-4">
              {/* Ringkasan Mahasiswa */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Mahasiswa</span>
                  <span className="font-bold text-slate-800">{activeFileModalRecord.mahasiswaNama}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">NIM</span>
                  <span className="font-mono font-semibold text-slate-800">{activeFileModalRecord.nim}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jenis Surat</span>
                  <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <ClipboardList className="w-3 h-3" />
                    <span>KPRS</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Semester</span>
                  <span className="font-semibold text-slate-800">
                    Semester {activeFileModalRecord.semester} • {
                      semesterDatabase.find((s) => s.status === 'Aktif')?.namaSemester || 'Ganjil 2026 / 2027'
                    }
                  </span>
                </div>
              </div>

              {/* LIST BERBENTUK: (Browse, Submit, Preview) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  List Berkas Surat KPRS
                </h4>

                {/* 1. BROWSE */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800">1. Browse</h5>
                        <p className="text-xs text-slate-500">Pilih berkas file surat dari perangkat Anda (.pdf, .doc, .docx)</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Browse File</span>
                    </button>
                  </div>

                  {/* Nama File yang sedang aktif / terpilih */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[320px]">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-700 truncate">
                        {tempFileSelection
                          ? tempFileSelection.name
                          : kprsFilesMap[activeFileModalRecord.id]?.fileName || 'Belum ada file dipilih (klik Browse)'}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-500 text-[11px] shrink-0">
                      {tempFileSelection
                        ? `${(tempFileSelection.size / 1024).toFixed(1)} KB`
                        : kprsFilesMap[activeFileModalRecord.id]?.fileSize || '-'}
                    </span>
                  </div>
                </div>

                {/* 2. SUBMIT */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800">2. Submit</h5>
                        <p className="text-xs text-slate-500">Simpan dan unggah berkas surat ke sistem administrasi SIKMA</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirmSubmitFile(activeFileModalRecord)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Submit File</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-500">Status Pengunggahan:</span>
                    {kprsFilesMap[activeFileModalRecord.id]?.isSubmitted ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersimpan ({kprsFilesMap[activeFileModalRecord.id]?.uploadedAt})</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">Menunggu Submit</span>
                    )}
                  </div>
                </div>

                {/* 3. PREVIEW */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Eye className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-800">3. Preview</h5>
                        <p className="text-xs text-slate-500">Lihat pratinjau dokumen surat resmi KPRS lengkap dengan Kop UB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePreviewKprsRecord(activeFileModalRecord);
                        setActiveFileModalRecord(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Surat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Pengelolaan Berkas Surat Resmi SIKMA UB
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveFileModalRecord(null);
                  setTempFileSelection(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL PREVIEW KPRS RESMI (DIPICU OLEH BUTTON PREVIEW PADA BUTTON FILE)
          ========================================================================= */}
      {activePreviewKprsRecord && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Header Preview KPRS */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Pratinjau File Surat KPRS</h3>
                  <p className="text-xs text-slate-300">
                    {activePreviewKprsRecord.mahasiswaNama} • NIM: {activePreviewKprsRecord.nim}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewKprsRecord(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dokumen Kertas Kop Resmi UB */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-md space-y-4 max-w-xl w-full font-serif text-slate-800 text-xs leading-relaxed relative">
                {/* Kop Surat UB */}
                <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-3 text-center">
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                    <UbLogo className="w-16 h-16 object-contain" alt="Logo UB" />
                  </div>
                  <div className="flex-1 text-center font-serif leading-tight">
                    <h2 className="text-[11px] font-bold tracking-wide uppercase text-slate-900">
                      KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                    </h2>
                    <h1 className="text-sm font-extrabold tracking-wider uppercase text-slate-900">
                      UNIVERSITAS BRAWIJAYA
                    </h1>
                    <h3 className="text-xs font-bold uppercase text-slate-800">
                      FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA
                    </h3>
                    <h4 className="text-xs font-bold uppercase text-slate-800">
                      DEPARTEMEN KIMIA
                    </h4>
                    <p className="text-[9px] text-slate-600 mt-1 font-sans">
                      Jalan Veteran Malang 65145, Telp. (0341) 554403, Fax. (0341) 554403
                    </p>
                    <p className="text-[9px] text-slate-600 font-sans">
                      Laman: http://kimia.ub.ac.id, Email: kimia@ub.ac.id
                    </p>
                  </div>
                </div>

                {/* Judul Dokumen */}
                <div className="text-center pt-2">
                  <h3 className="text-sm font-bold underline uppercase tracking-wider text-slate-900">
                    KARTU PERUBAHAN RENCANA STUDI (KPRS)
                  </h3>
                  <p className="text-[10px] text-slate-600 font-sans mt-0.5">
                    Semester {activePreviewKprsRecord.semester} • Tahun Akademik {
                      semesterDatabase.find((s) => s.status === 'Aktif')?.namaSemester || 'Ganjil 2026 / 2027'
                    }
                  </p>
                </div>

                {/* Rincian Mahasiswa */}
                <div className="space-y-1.5 pt-2 text-xs font-sans">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Nama Mahasiswa</span>
                    <span className="col-span-2 font-bold text-slate-900">: {activePreviewKprsRecord.mahasiswaNama}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">NIM</span>
                    <span className="col-span-2 font-mono font-semibold text-slate-800">: {activePreviewKprsRecord.nim}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Program Studi</span>
                    <span className="col-span-2 font-medium text-slate-800">: S1 Kimia - FSTeM Universitas Brawijaya</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Semester</span>
                    <span className="col-span-2 font-medium text-slate-800">
                      : Semester {activePreviewKprsRecord.semester}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Dosen Pembimbing PA</span>
                    <span className="col-span-2 font-medium text-slate-800">: {activePreviewKprsRecord.dosenPA}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Total Beban SKS</span>
                    <span className="col-span-2 font-bold text-blue-700">: {activePreviewKprsRecord.totalSks} SKS</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Status Dokumen</span>
                    <span className="col-span-2">
                      : <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {activePreviewKprsRecord.statusKprs}
                      </span>
                    </span>
                  </div>
                  {kprsFilesMap[activePreviewKprsRecord.id]?.isSubmitted && (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold text-blue-800">Berkas Surat Terlampir</span>
                      <span className="col-span-2 font-mono text-[11px] text-slate-800">
                        : 📄 {kprsFilesMap[activePreviewKprsRecord.id].fileName} ({kprsFilesMap[activePreviewKprsRecord.id].fileSize})
                      </span>
                    </div>
                  )}
                </div>

                {/* Tabel Mata Kuliah */}
                <div className="pt-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1.5 font-sans">
                    Daftar Perubahan Mata Kuliah Terdaftar:
                  </h4>
                  <table className="w-full text-left text-[11px] font-sans border border-slate-300">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-1.5 border-r border-slate-300">Kode</th>
                        <th className="p-1.5 border-r border-slate-300">Mata Kuliah</th>
                        <th className="p-1.5 border-r border-slate-300 text-center">Kelas</th>
                        <th className="p-1.5 border-r border-slate-300 text-center">SKS</th>
                        <th className="p-1.5">Jadwal Kuliah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activePreviewKprsRecord.mataKuliahList.map((mk, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5 font-mono text-slate-600 border-r border-slate-200">{mk.kode}</td>
                          <td className="p-1.5 font-medium text-slate-800 border-r border-slate-200">{mk.nama}</td>
                          <td className="p-1.5 text-center font-bold text-slate-700 border-r border-slate-200">{mk.kelas}</td>
                          <td className="p-1.5 text-center font-bold text-blue-700 border-r border-slate-200">{mk.sks}</td>
                          <td className="p-1.5 text-slate-500">{mk.jadwal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Penutup & Tanda Tangan */}
                <div className="pt-6 flex justify-between text-xs font-sans">
                  <div className="text-center w-52 space-y-1">
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Ketua Departemen Kimia</p>
                    <div className="py-2">
                      <div className="border border-blue-600 rounded-lg p-1.5 bg-blue-50/50 inline-block font-sans">
                        <div className="flex items-center justify-center gap-1 text-[9px] text-blue-700 font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>TERVALIDASI DIGITAL</span>
                        </div>
                      </div>
                    </div>
                    <p className="font-bold underline text-slate-900 mt-2">
                      Prof. Dr. Dra. Hermin Sulistyarti, M.Si
                    </p>
                    <p className="text-[10px] text-slate-600">NIP. 196403211989032001</p>
                  </div>

                  <div className="text-center w-52 space-y-1">
                    <p>Malang, Jawa Timur</p>
                    <p className="font-semibold">Dosen Pembimbing Akademik</p>
                    <div className="py-2">
                      <div className="border border-emerald-600 rounded-lg p-1.5 bg-emerald-50/50 inline-block font-sans">
                        <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DISETUJUI DOSEN PA</span>
                        </div>
                      </div>
                    </div>
                    <p className="font-bold underline text-slate-900 mt-2">
                      {activePreviewKprsRecord.dosenPA}
                    </p>
                    <p className="text-[10px] text-slate-600">Dosen Penasehat Akademik</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Preview Actions */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Format Dokumen KPRS Resmi SIKMA UB
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadKprsPdf(activePreviewKprsRecord)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewKprsRecord(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DATA SEMUA PENGAJUAN SURAT MAHASISWA (TRIGGER BUTTON DETAIL WARNA BIRU)
          ========================================================================= */}
      {detailMhs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[96vw] 2xl:max-w-[1550px] border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
            {/* Header: Judul "Data Semua Pengajuan Surat Mahasiswa" */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Data Semua Pengajuan Surat Mahasiswa
                  </h3>
                  <p className="text-xs text-slate-300">
                    Departemen Kimia • Fakultas Sains, Teknologi, dan Matematika Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailMhs(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
              {/* Profil Singkat Mahasiswa */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                    {detailMhs.nama.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900 leading-snug">
                        {detailMhs.nama}
                      </h4>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {detailMhs.nim}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>Prodi: <strong className="text-slate-700">S1 Kimia</strong></span>
                      <span>•</span>
                      <span>Semester <strong className="text-slate-700">{detailMhs.semester}</strong></span>
                      <span>•</span>
                      <span>Angkatan <strong className="text-slate-700">{detailMhs.angkatan}</strong></span>
                      <span>•</span>
                      <span>IPK: <strong className="text-blue-700">{detailMhs.ipk.toFixed(2)}</strong></span>
                      {detailMhs.dosenPANama && (
                        <>
                          <span>•</span>
                          <span>Dosen PA: <strong className="text-slate-700">{detailMhs.dosenPANama}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ringkasan Statistik Surat */}
                <div className="flex items-center gap-2 self-start lg:self-center shrink-0 text-xs">
                  <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Surat</span>
                    <strong className="text-slate-800 text-sm">
                      {permohonanList.filter((p) => p.nim === detailMhs.nim || p.mahasiswaNama.toLowerCase() === detailMhs.nama.toLowerCase()).length}
                    </strong>
                  </div>
                  <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-600 font-bold block uppercase">Disetujui</span>
                    <strong className="text-emerald-800 text-sm">
                      {permohonanList.filter((p) => (p.nim === detailMhs.nim || p.mahasiswaNama.toLowerCase() === detailMhs.nama.toLowerCase()) && p.status === 'Disetujui').length}
                    </strong>
                  </div>
                  <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-center">
                    <span className="text-[10px] text-amber-600 font-bold block uppercase">Diproses</span>
                    <strong className="text-amber-800 text-sm">
                      {permohonanList.filter((p) => (p.nim === detailMhs.nim || p.mahasiswaNama.toLowerCase() === detailMhs.nama.toLowerCase()) && p.status === 'Diproses').length}
                    </strong>
                  </div>
                </div>
              </div>

              {/* BOX: UNDUH SURAT */}
              <div className="bg-white border border-indigo-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/60">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          Unduh Surat
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                          Template Resmi SIKMA
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Unduh dokumen resmi mahasiswa Departemen Kimia UB: Kartu FIDK, Kartu Peserta Seminar, Blangko Bebas Lab, Surat Asisten Praktikum (.pdf), dan SKPI (.docx)
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-xl self-start sm:self-auto">
                    5 Dokumen Tersedia
                  </span>
                </div>

                {/* Notifikasi Toast Sukses Unduh jika ada */}
                {downloadNotice && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{downloadNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDownloadNotice(null)}
                      className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Grid 5 Dokumen: 4 PDF + 1 DOCX */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* 1. Kartu FIDK (.pdf) */}
                  <div className="bg-slate-50/70 hover:bg-white rounded-xl p-3.5 border border-slate-200/80 hover:border-rose-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          .pdf
                        </span>
                        <FileText className="w-4 h-4 text-rose-500" />
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-rose-600 transition-colors">
                        Kartu FIDK
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        Formulir Isian Data Kelulusan & Persyaratan Yudisium Sarjana.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        generateKartuFIDKPdf(detailMhs);
                        setDownloadNotice(`Dokumen "Kartu FIDK (${detailMhs.nama}).pdf" berhasil diunduh.`);
                        setTimeout(() => setDownloadNotice(null), 5000);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh .pdf</span>
                    </button>
                  </div>

                  {/* 2. Kartu Peserta Seminar (.pdf) */}
                  <div className="bg-slate-50/70 hover:bg-white rounded-xl p-3.5 border border-slate-200/80 hover:border-rose-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          .pdf
                        </span>
                        <FileText className="w-4 h-4 text-rose-500" />
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-rose-600 transition-colors">
                        Kartu Peserta Seminar
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        Presensi Kehadiran Seminar Proposal & Seminar Hasil Skripsi (10 Sesi).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        generateKartuPesertaSeminarPdf(detailMhs);
                        setDownloadNotice(`Dokumen "Kartu Peserta Seminar (${detailMhs.nama}).pdf" berhasil diunduh.`);
                        setTimeout(() => setDownloadNotice(null), 5000);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh .pdf</span>
                    </button>
                  </div>

                  {/* 3. Blangko Bebas Lab (.pdf) */}
                  <div className="bg-slate-50/70 hover:bg-white rounded-xl p-3.5 border border-slate-200/80 hover:border-rose-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          .pdf
                        </span>
                        <FileText className="w-4 h-4 text-rose-500" />
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-rose-600 transition-colors">
                        Blangko Bebas Lab
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        Surat Keterangan Bebas Peminjaman & Tanggungan 6 Laboratorium Kimia.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        generateBlangkoBebasLabPdf(detailMhs);
                        setDownloadNotice(`Dokumen "Blangko Bebas Lab (${detailMhs.nama}).pdf" berhasil diunduh.`);
                        setTimeout(() => setDownloadNotice(null), 5000);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh .pdf</span>
                    </button>
                  </div>

                  {/* 4. Surat Asisten Praktikum (.pdf) */}
                  <div className="bg-slate-50/70 hover:bg-white rounded-xl p-3.5 border border-slate-200/80 hover:border-rose-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          .pdf
                        </span>
                        <FileText className="w-4 h-4 text-rose-500" />
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-rose-600 transition-colors">
                        Surat Asisten Praktikum
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        Surat Penugasan & Keterangan Resmi Asisten Praktikum Laboratorium.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        generateSuratAsistenPraktikumPdf(detailMhs);
                        setDownloadNotice(`Dokumen "Surat Asisten Praktikum (${detailMhs.nama}).pdf" berhasil diunduh.`);
                        setTimeout(() => setDownloadNotice(null), 5000);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh .pdf</span>
                    </button>
                  </div>

                  {/* 5. SKPI (.docx) */}
                  <div className="bg-blue-50/40 hover:bg-white rounded-xl p-3.5 border border-blue-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          .docx
                        </span>
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                        SKPI (Diploma Supplement)
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        Surat Keterangan Pendamping Ijazah (Capaian KKNI Level 6 & Prestasi).
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isDownloadingSkpi}
                      onClick={async () => {
                        try {
                          setIsDownloadingSkpi(true);
                          await generateSkpiDocx(detailMhs);
                          setDownloadNotice(`Dokumen "SKPI (${detailMhs.nama}).docx" berhasil diunduh.`);
                          setTimeout(() => setDownloadNotice(null), 5000);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsDownloadingSkpi(false);
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingSkpi ? 'Menyiapkan...' : 'Unduh .docx'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action & Filter Bar (Semua, Ijin Kerja Lab, KPRS, Ijin Lembur) di bawah Modal Unduh Surat */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenTambahSurat(detailMhs)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
                  >
                    <FilePlus className="w-4 h-4" />
                    <span>Tambah Surat</span>
                  </button>

                  {/* Kategori Filter Tabs: (Semua, Ijin Kerja Lab, KPRS, Ijin Lembur) */}
                  <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs">
                    {(['Semua', 'Ijin Kerja Lab', 'KPRS', 'Ijin Lembur'] as const).map((kat) => (
                      <button
                        key={kat}
                        type="button"
                        onClick={() => {
                          setDetailFilterKategori(kat);
                          setDetailCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          detailFilterKategori === kat
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {kat}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-end sm:self-auto">
                  Daftar Riwayat Pengajuan Surat
                </span>
              </div>

              {/* Konten Pengajuan Surat: Tabel Data Semua Pengajuan Surat Mahasiswa */}
              {(() => {
                const studentSuratList = permohonanList.filter(
                  (p) =>
                    p.nim === detailMhs.nim ||
                    p.mahasiswaNama.toLowerCase() === detailMhs.nama.toLowerCase()
                );
                const filteredSuratList = studentSuratList.filter((p) => {
                  if (detailFilterKategori === 'Semua') return true;
                  return p.jenisSurat === detailFilterKategori;
                });

                if (filteredSuratList.length === 0) {
                  return (
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                      <FileText className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-700 text-sm">
                        {detailFilterKategori === 'Semua'
                          ? 'Belum ada pengajuan surat untuk mahasiswa ini'
                          : `Tidak ada permohonan dengan kategori "${detailFilterKategori}"`}
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Klik tombol <strong>Tambah Surat</strong> di atas untuk membuat pengajuan surat resmi baru.
                      </p>
                    </div>
                  );
                }

                // Pagination: limit 10 list data
                const ITEMS_PER_PAGE = 10;
                const totalSuratItems = filteredSuratList.length;
                const totalSuratPages = Math.ceil(totalSuratItems / ITEMS_PER_PAGE);
                const validSuratPage = Math.min(Math.max(1, detailCurrentPage), totalSuratPages || 1);
                const startIdx = (validSuratPage - 1) * ITEMS_PER_PAGE;
                const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalSuratItems);
                const displayedSuratList = totalSuratItems > ITEMS_PER_PAGE
                  ? filteredSuratList.slice(startIdx, endIdx)
                  : filteredSuratList;

                return (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white w-full">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th scope="col" className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap w-[18%]">
                              Jenis Surat
                            </th>
                            <th scope="col" className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap w-[15%]">
                              Tanggal Pengajuan
                            </th>
                            <th scope="col" className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap w-[22%]">
                              Tanggal Pelaksanaan
                            </th>
                            <th scope="col" className="py-3.5 px-4 font-bold text-slate-700 text-center whitespace-nowrap w-[12%]">
                              Status
                            </th>
                            <th scope="col" className="py-3.5 px-4 font-bold text-slate-700 text-center whitespace-nowrap w-[33%]">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                          {displayedSuratList.map((srt) => {
                            const isLab = srt.jenisSurat === 'Ijin Kerja Lab';
                            const isKprs = srt.jenisSurat === 'KPRS';
                            const isLembur = srt.jenisSurat === 'Ijin Lembur';

                            return (
                              <tr key={srt.id} className="hover:bg-blue-50/40 transition-colors">
                                {/* 1. Jenis Surat (Tidak menampilkan nomor surat) */}
                                <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                      isLab
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : isKprs
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}
                                  >
                                    {isLab ? (
                                      <FlaskConical className="w-3.5 h-3.5" />
                                    ) : isKprs ? (
                                      <ClipboardList className="w-3.5 h-3.5" />
                                    ) : (
                                      <Clock className="w-3.5 h-3.5" />
                                    )}
                                    <span>{srt.jenisSurat}</span>
                                  </span>
                                </td>

                                {/* 2. Tanggal Pengajuan */}
                                <td className="py-3.5 px-4 align-middle whitespace-nowrap text-slate-700 font-medium text-xs sm:text-sm">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{srt.tanggalPengajuan}</span>
                                  </div>
                                </td>

                                {/* 3. Tanggal Pelaksanaan */}
                                <td className="py-3.5 px-4 align-middle text-xs sm:text-sm font-medium text-slate-800">
                                  {isLab ? (
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-slate-800 block">
                                        {srt.tanggalPelaksanaan ||
                                          (srt.tanggalMulai && srt.tanggalSelesai
                                            ? `${srt.tanggalMulai} s/d ${srt.tanggalSelesai}`
                                            : srt.tanggalMulai || '-')}
                                      </span>
                                      {srt.tanggalMulai && srt.tanggalSelesai && (
                                        <span className="text-[11px] text-emerald-700 font-medium block">
                                          Rentang Ijin Lab
                                        </span>
                                      )}
                                    </div>
                                  ) : isLembur ? (
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-slate-800 block">
                                        {srt.tanggalPelaksanaan || srt.tanggalPengajuan}
                                      </span>
                                      <span className="text-[11px] text-amber-700 font-semibold block">
                                        {srt.waktuLembur || '17.00 - 21.00 WIB'}
                                      </span>
                                    </div>
                                  ) : isKprs ? (
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-slate-800 block">
                                        {srt.tanggalPelaksanaan || srt.tanggalPengajuan}
                                      </span>
                                      <span className="text-[11px] text-blue-700 font-semibold block">
                                        Semester {srt.semester} ({srt.semesterAkademik || 'Ganjil 2026 / 2027'})
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-semibold text-slate-800">
                                      {srt.tanggalPelaksanaan || srt.tanggalPengajuan || '-'}
                                    </span>
                                  )}
                                </td>

                                {/* 4. Status */}
                                <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                      srt.status === 'Disetujui'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : srt.status === 'Diproses'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : srt.status === 'Selesai'
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : srt.status === 'Ditolak'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                                    }`}
                                  >
                                    {srt.status}
                                  </span>
                                </td>

                                 {/* 5. Aksi: Button File (berisi bentuk Browse, Submit) dan Button Edit */}
                                <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                  <div className="inline-flex items-center justify-center gap-1.5 relative">
                                    {/* 1. BUTTON FILE (Berisi bentuk Browse, Submit) */}
                                    <div className="relative inline-block text-left">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveSuratFileDropdownId((curr) => (curr === srt.id ? null : srt.id));
                                          setActiveSuratForFile(srt);
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                        title="Buka File Surat (Browse & Submit)"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>File</span>
                                        <ChevronDown
                                          className={`w-3 h-3 text-blue-200 transition-transform duration-150 ${
                                            activeSuratFileDropdownId === srt.id ? 'rotate-180' : ''
                                          }`}
                                        />
                                      </button>

                                      {/* Popover Menu Berkas Surat: Judul File Surat, berisi bentuk (Browse, Submit) */}
                                      {activeSuratFileDropdownId === srt.id && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setActiveSuratFileDropdownId(null)}
                                          />
                                          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden text-left animate-fade-in">
                                            {/* Header Popover: File Surat */}
                                            <div className="bg-[#002B49] text-white px-4 py-2.5 flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-400" />
                                                <div>
                                                  <h4 className="font-bold text-xs text-white">File Surat</h4>
                                                  <p className="text-[10px] text-slate-300 truncate max-w-[170px]">
                                                    {srt.jenisSurat} • {detailMhs.nama}
                                                  </p>
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => setActiveSuratFileDropdownId(null)}
                                                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>

                                            {/* List Berbentuk (Browse, Submit) */}
                                            <div className="p-2.5 space-y-2">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
                                                Menu Berkas Surat
                                              </span>

                                              {/* 1. Browse */}
                                              <div className="p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all">
                                                <div className="flex items-center justify-between gap-2">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                                      <FolderOpen className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                      <span className="font-bold text-slate-800 text-xs block">
                                                        Browse
                                                      </span>
                                                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                                                        {suratFilesMap[srt.id]?.fileName || 'Pilih berkas surat'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setActiveSuratForFile(srt);
                                                      suratFileInputRef.current?.click();
                                                    }}
                                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
                                                  >
                                                    Browse
                                                  </button>
                                                </div>
                                              </div>

                                              {/* 2. Submit */}
                                              <div className="p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-emerald-300 transition-all">
                                                <div className="flex items-center justify-between gap-2">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                      <Send className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                      <span className="font-bold text-slate-800 text-xs block">
                                                        Submit
                                                      </span>
                                                      <span className="text-[10px] text-slate-500 block">
                                                        {suratFilesMap[srt.id]?.isSubmitted ? 'Berkas tersimpan' : 'Kirim berkas surat'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleConfirmSubmitSuratFile(srt)}
                                                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs shrink-0 ${
                                                      suratFilesMap[srt.id]?.isSubmitted
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    }`}
                                                  >
                                                    {suratFilesMap[srt.id]?.isSubmitted ? 'Tersimpan ✓' : 'Submit'}
                                                  </button>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Footer Dropdown: Link ke Dialog Modal Lengkap */}
                                            <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveFileSuratModalItem(srt);
                                                  setActiveSuratFileDropdownId(null);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1"
                                              >
                                                <span>Buka Dialog File Lengkap</span>
                                                <ChevronRight className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {/* 2. BUTTON EDIT */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditSurat(srt)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                      title="Edit Pengajuan Surat"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>

                                    {/* 3. BUTTON PRATINJAU */}
                                    <button
                                      type="button"
                                      onClick={() => setPreviewSurat(srt)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                                      title="Pratinjau Surat Resmi"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Pratinjau</span>
                                    </button>

                                    {/* 4. BUTTON PDF */}
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadPdf(srt)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                                      title="Unduh PDF Resmi"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>PDF</span>
                                    </button>

                                    {/* 5. BUTTON DELETE */}
                                    {currentRole !== 'mahasiswa' && (
                                      <button
                                        type="button"
                                        onClick={() => setSuratToDelete(srt)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-rose-200"
                                        title="Hapus Surat Permohonan"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Delete</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar jika telah mencapai limit 10 list data */}
                    {totalSuratItems > ITEMS_PER_PAGE && (
                      <div className="px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80">
                        <div className="text-xs text-slate-600 font-medium">
                          Menampilkan <strong className="text-slate-800">{startIdx + 1}</strong>–
                          <strong className="text-slate-800">{endIdx}</strong> dari{' '}
                          <strong className="text-slate-800">{totalSuratItems}</strong> data pengajuan surat{' '}
                          <span className="text-slate-400 font-normal">(Batas 10 per halaman)</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Tombol Halaman Pertama */}
                          <button
                            type="button"
                            onClick={() => setDetailCurrentPage(1)}
                            disabled={validSuratPage === 1}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Halaman Pertama"
                          >
                            <ChevronsLeft className="w-4 h-4" />
                          </button>

                          {/* Tombol Halaman Sebelumnya */}
                          <button
                            type="button"
                            onClick={() => setDetailCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={validSuratPage === 1}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Halaman Sebelumnya"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {/* Nomor-nomor Halaman */}
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalSuratPages }, (_, i) => i + 1).map((pageNum) => (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setDetailCurrentPage(pageNum)}
                                className={`min-w-8 h-8 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                  validSuratPage === pageNum
                                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white'
                                }`}
                              >
                                {pageNum}
                              </button>
                            ))}
                          </div>

                          {/* Tombol Halaman Selanjutnya */}
                          <button
                            type="button"
                            onClick={() => setDetailCurrentPage((p) => Math.min(totalSuratPages, p + 1))}
                            disabled={validSuratPage === totalSuratPages}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Halaman Selanjutnya"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {/* Tombol Halaman Terakhir */}
                          <button
                            type="button"
                            onClick={() => setDetailCurrentPage(totalSuratPages)}
                            disabled={validSuratPage === totalSuratPages}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Halaman Terakhir"
                          >
                            <ChevronsRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer Modal */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Sistem Informasi Kepegawaian & Manajemen Akademik (SIKMA) UB • Dokumen Resmi
              </span>
              <button
                type="button"
                onClick={() => setDetailMhs(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: FORM TAMBAH SURAT (DIPICU OLEH BUTTON TAMBAH SURAT WARNA HIJAU)
          ========================================================================= */}
      {isTambahSuratModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Header Form Tambah Surat */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <FilePlus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Form Tambah Surat</h3>
                  <p className="text-xs text-slate-300">
                    Pengajuan surat baru untuk mahasiswa: <span className="text-white font-semibold">{tambahNama || detailMhs?.nama}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTambahSuratModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form Tambah Surat: Nama, NIM, Kategori (Select, Ijin Kerja Lab, KPRS, Ijin Lembur) */}
            <form onSubmit={handleSaveTambahSurat} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Field 1: Nama (Langsung terisi sesuai login user, paten, tidak bisa diubah) */}
              <div>
                <label
                  htmlFor={tambahNamaId}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Nama <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id={tambahNamaId}
                    type="text"
                    value={tambahNama}
                    readOnly
                    disabled
                    className="w-full bg-slate-100/90 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 cursor-not-allowed select-none shadow-2xs pr-10"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Field 2: NIM (Langsung terisi sesuai login user, paten, tidak bisa diubah) */}
              <div>
                <label
                  htmlFor={tambahNimId}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  NIM <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id={tambahNimId}
                    type="text"
                    value={tambahNim}
                    readOnly
                    disabled
                    className="w-full bg-slate-100/90 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-700 cursor-not-allowed select-none shadow-2xs pr-10"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Field 3: Kategori (Dapat diubah sesuai pilihan User) */}
              <div>
                <label
                  htmlFor={tambahKategoriId}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  id={tambahKategoriId}
                  value={tambahKategori}
                  onChange={(e) =>
                    setTambahKategori(
                      e.target.value as 'Select' | 'Ijin Kerja Lab' | 'KPRS' | 'Ijin Lembur'
                    )
                  }
                  className="w-full bg-white border border-slate-300 hover:border-emerald-500 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer shadow-2xs"
                  required
                >
                  <option value="Select">Select (Pilih Kategori Surat)</option>
                  <option value="Ijin Kerja Lab">Ijin Kerja Lab</option>
                  <option value="KPRS">KPRS</option>
                  <option value="Ijin Lembur">Ijin Lembur</option>
                </select>
                {tambahKategori === 'Select' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Silakan pilih kategori surat (Ijin Kerja Lab, KPRS, atau Ijin Lembur).
                  </p>
                )}
              </div>

              {/* 1. JIKA KATEGORI: Ijin Kerja Lab */}
              {tambahKategori === 'Ijin Kerja Lab' && (
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-emerald-200/80 pb-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <span>Rincian Permohonan Ijin Kerja Lab</span>
                  </div>

                  {/* Judul Penelitian */}
                  <div>
                    <label
                      htmlFor={tambahJudulId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Judul Penelitian <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id={tambahJudulId}
                      rows={2}
                      placeholder="Masukkan judul riset atau penelitian..."
                      value={tambahJudulPenelitian}
                      onChange={(e) => setTambahJudulPenelitian(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Alamat */}
                  <div>
                    <label
                      htmlFor={tambahAlamatId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Alamat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id={tambahAlamatId}
                      type="text"
                      placeholder="Alamat domisili mahasiswa..."
                      value={tambahAlamat}
                      onChange={(e) => setTambahAlamat(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>

                  {/* Email & Telepon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor={tambahEmailId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={tambahEmailId}
                        type="email"
                        placeholder="contoh@student.ub.ac.id"
                        value={tambahEmail}
                        onChange={(e) => setTambahEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={tambahTeleponId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Telepon <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={tambahTeleponId}
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={tambahTelepon}
                        onChange={(e) => setTambahTelepon(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Tujuan */}
                  <div>
                    <label
                      htmlFor={tambahTujuanId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Tujuan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={tambahTujuanId}
                      value={tambahTujuan}
                      onChange={(e) => setTambahTujuan(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      required
                    >
                      {tujuanOpsiList.map((tujuan) => (
                        <option key={tujuan} value={tujuan}>
                          {tujuan}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dosen */}
                  <div>
                    <label
                      htmlFor={tambahDosenId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Dosen <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id={tambahDosenId}
                      value={tambahDosen}
                      onChange={(e) => setTambahDosen(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      required
                    >
                      <option value="" disabled>-- Pilih Dosen dari Database --</option>
                      {dosenList.map((d) => (
                        <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                          {d.nama}, {d.gelar} — {d.bidang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tanggal Pengajuan */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor={tambahTanggalPengajuanLabId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                      >
                        Tanggal Pengajuan <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setTambahTanggalPengajuan(today);
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Hari ini</span>
                      </button>
                    </div>
                    <input
                      id={tambahTanggalPengajuanLabId}
                      type="date"
                      value={tambahTanggalPengajuan}
                      onChange={(e) => setTambahTanggalPengajuan(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                      required
                    />
                  </div>

                  {/* Tanggal Pelaksanaan: Pilihan rentang tanggal (mulai dari tanggal - sampai tanggal) */}
                  <div className="bg-white/90 p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor={tambahTanggalMulaiId}
                          className="block text-[11px] font-semibold text-slate-600 mb-1"
                        >
                          Mulai Dari Tanggal <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id={tambahTanggalMulaiId}
                          type="date"
                          value={tambahTanggalMulai}
                          onChange={(e) => setTambahTanggalMulai(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={tambahTanggalSelesaiId}
                          className="block text-[11px] font-semibold text-slate-600 mb-1"
                        >
                          Sampai Tanggal <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id={tambahTanggalSelesaiId}
                          type="date"
                          value={tambahTanggalSelesai}
                          onChange={(e) => setTambahTanggalSelesai(e.target.value)}
                          min={tambahTanggalMulai}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium pt-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Rentang pelaksanaan: <strong>{tambahTanggalMulai || '-'}</strong> s/d <strong>{tambahTanggalSelesai || '-'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Laboratorium & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor={tambahLabId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Laboratorium <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={tambahLabId}
                        value={tambahLaboratorium}
                        onChange={(e) => setTambahLaboratorium(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                        required
                      >
                        {jenisLaboratoriumList.map((lab) => (
                          <option key={lab} value={lab}>
                            {lab}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={tambahStatusId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={tambahStatusId}
                        value={tambahStatus}
                        onChange={(e) =>
                          setTambahStatus(
                            e.target.value as 'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak'
                          )
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                        required
                      >
                        <option value="Disetujui">Disetujui</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. JIKA KATEGORI: KPRS */}
              {tambahKategori === 'KPRS' && (
                <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-blue-200/80 pb-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                    <span>Rincian Permohonan KPRS (Kartu Perubahan Rencana Studi)</span>
                  </div>

                  {/* List: Telepon, Semester & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label
                        htmlFor={tambahKprsTeleponId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Telepon <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={tambahKprsTeleponId}
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={tambahTelepon}
                        onChange={(e) => setTambahTelepon(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={tambahKprsSemesterId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Semester <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={tambahKprsSemesterId}
                        value={tambahSemester}
                        onChange={(e) => setTambahSemester(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        required
                      >
                        <option value="" disabled>-- Pilih Semester dari Database --</option>
                        {semesterDatabase.map((sem) => (
                          <option key={sem.id} value={sem.namaSemester}>
                            {sem.namaSemester} {sem.status === 'Aktif' ? '• (Aktif)' : `• (${sem.status})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={tambahKprsStatusId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={tambahKprsStatusId}
                        value={tambahStatus}
                        onChange={(e) =>
                          setTambahStatus(
                            e.target.value as 'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak'
                          )
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        required
                      >
                        <option value="Disetujui">Disetujui</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 -mt-1.5">
                    Pilihan semester akademik diambil dari database semester (Ganjil 2023 / 2024 s.d. Ganjil 2030 / 2031).
                  </p>

                  <div>
                    <label
                      htmlFor={tambahKeteranganId}
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Keterangan Perubahan / Tambah Mata Kuliah <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id={tambahKeteranganId}
                      rows={3}
                      placeholder="Tuliskan mata kuliah yang ditambah/dihapus beserta alasan..."
                      value={tambahKeteranganKhusus}
                      onChange={(e) => setTambahKeteranganKhusus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Dosen Pembimbing Akademik (PA)
                      </label>
                      <select
                        value={tambahDosen}
                        onChange={(e) => setTambahDosen(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                      >
                        {dosenList.map((d) => (
                          <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                            {d.nama}, {d.gelar}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor={tambahTanggalPengajuanKprsId}
                          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                        >
                          Tanggal Pengajuan <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            setTambahTanggalPengajuan(today);
                            setTambahTanggalPelaksanaan(today);
                          }}
                          className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold cursor-pointer underline flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Hari ini</span>
                        </button>
                      </div>
                      <input
                        id={tambahTanggalPengajuanKprsId}
                        type="date"
                        value={tambahTanggalPengajuan}
                        onChange={(e) => {
                          setTambahTanggalPengajuan(e.target.value);
                          setTambahTanggalPelaksanaan(e.target.value);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. JIKA KATEGORI: Ijin Lembur */}
              {tambahKategori === 'Ijin Lembur' && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Rincian Permohonan Ijin Lembur Kerja Laboratorium</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Laboratorium <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={tambahLaboratorium}
                        onChange={(e) => setTambahLaboratorium(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                        required
                      >
                        {jenisLaboratoriumList.map((lab) => (
                          <option key={lab} value={lab}>
                            {lab}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={tambahWaktuId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Waktu / Jam Lembur <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={tambahWaktuId}
                        type="text"
                        placeholder="Contoh: 17.00 - 21.00 WIB"
                        value={tambahWaktuLembur}
                        onChange={(e) => setTambahWaktuLembur(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* List: Nama Pendamping (tulis manual) & No Telp Pendamping */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-amber-100/60 p-3.5 rounded-xl border border-amber-200">
                    <div>
                      <label
                        htmlFor={tambahNamaPendampingId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Nama Pendamping (Tulis Manual) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={tambahNamaPendampingId}
                        type="text"
                        placeholder="Tulis manual nama pendamping..."
                        value={tambahNamaPendamping}
                        onChange={(e) => setTambahNamaPendamping(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        required
                      />
                      <p className="text-[11px] text-amber-800/80 mt-1">
                        Nama pendamping ditulis manual (dapat berupa laboran, asisten praktikum, atau rekan riset).
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor={tambahTeleponPendampingId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        No Telp Pendamping <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={tambahTeleponPendampingId}
                        type="tel"
                        placeholder="Contoh: 081298765432"
                        value={tambahTeleponPendamping}
                        onChange={(e) => setTambahTeleponPendamping(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        required
                      />
                      <p className="text-[11px] text-amber-800/80 mt-1">
                        Nomor HP / WhatsApp aktif pendamping selama kegiatan lembur di lab.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Alasan / Keperluan Lembur Riset Lab <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Jelaskan running eksperimen yang membutuhkan lembur..."
                      value={tambahKeteranganKhusus}
                      onChange={(e) => setTambahKeteranganKhusus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor={tambahTanggalPengajuanLemburId}
                          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                        >
                          Tanggal Pengajuan <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            setTambahTanggalPengajuan(today);
                          }}
                          className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold cursor-pointer underline flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Hari ini</span>
                        </button>
                      </div>
                      <input
                        id={tambahTanggalPengajuanLemburId}
                        type="date"
                        value={tambahTanggalPengajuan}
                        onChange={(e) => setTambahTanggalPengajuan(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tanggal Lembur <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={tambahTanggalPelaksanaan}
                        onChange={(e) => setTambahTanggalPelaksanaan(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Dosen Penanggung Jawab
                      </label>
                      <select
                        value={tambahDosen}
                        onChange={(e) => setTambahDosen(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                      >
                        {dosenList.map((d) => (
                          <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                            {d.nama}, {d.gelar}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor={tambahLemburStatusId}
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                      >
                        Status <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={tambahLemburStatusId}
                        value={tambahStatus}
                        onChange={(e) =>
                          setTambahStatus(
                            e.target.value as 'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak'
                          )
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                        required
                      >
                        <option value="Disetujui">Disetujui</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Menunggu">Menunggu</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Form Tambah Surat */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTambahSuratModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Tambah Surat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: PRATINJAU SURAT RESMI (SURAT YANG DIGENERATE ATAU DIKLIK)
          ========================================================================= */}
      {previewSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Header Preview */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Pratinjau Surat Resmi</h3>
                  <p className="text-xs text-slate-300">{previewSurat.nomorSurat}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSurat(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dokumen Kertas Kop Resmi UB */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-md space-y-4 max-w-xl w-full font-serif text-slate-800 text-xs leading-relaxed relative">
                {/* Kop Surat UB */}
                <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-3 text-center">
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                    <UbLogo className="w-16 h-16 object-contain" alt="Logo UB" />
                  </div>
                  <div className="flex-1 text-center font-serif leading-tight">
                    <p className="text-[10px] uppercase font-bold tracking-tight text-slate-700">
                      Kementerian Pendidikan Tinggi, Sains, dan Teknologi
                    </p>
                    <p className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                      Universitas Brawijaya
                    </p>
                    <p className="text-xs font-bold text-slate-800 uppercase">
                      Fakultas Sains, Teknologi, dan Matematika
                    </p>
                    <p className="text-xs font-bold text-slate-700">Departemen Kimia</p>
                    <p className="text-[8.5px] text-slate-500 font-sans mt-0.5">
                      Jalan Veteran, Malang 65145, Jawa Timur • Telp: (0341) 554403 • Email: kimia@ub.ac.id
                    </p>
                  </div>
                </div>

                {/* Judul Surat */}
                <div className="text-center pt-2">
                  <h4 className="font-bold text-sm tracking-wider uppercase underline underline-offset-4">
                    {previewSurat.jenisSurat}
                  </h4>
                  <p className="text-[11px] font-mono mt-1 text-slate-600">
                    Nomor: {previewSurat.nomorSurat}
                  </p>
                </div>

                {/* Isi Surat */}
                <p className="pt-2 text-justify">
                  Ketua Departemen Kimia Fakultas Sains, Teknologi, dan Matematika Universitas
                  Brawijaya menerangkan dengan sebenarnya bahwa:
                </p>

                <div className="pl-6 space-y-1.5 font-sans text-xs">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Nama Lengkap</span>
                    <span className="col-span-2 font-bold text-slate-800">
                      : {previewSurat.mahasiswaNama}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">NIM</span>
                    <span className="col-span-2 font-mono font-bold text-slate-800">
                      : {previewSurat.nim}
                    </span>
                  </div>
                  {previewSurat.alamat && (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Alamat</span>
                      <span className="col-span-2 text-slate-800">
                        : {previewSurat.alamat}
                      </span>
                    </div>
                  )}
                  {previewSurat.email && previewSurat.telepon ? (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Email & Telepon</span>
                      <span className="col-span-2 text-slate-800">
                        : {previewSurat.email} / {previewSurat.telepon}
                      </span>
                    </div>
                  ) : previewSurat.email ? (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Email</span>
                      <span className="col-span-2 text-slate-800">
                        : {previewSurat.email}
                      </span>
                    </div>
                  ) : previewSurat.telepon ? (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Telepon</span>
                      <span className="col-span-2 text-slate-800">
                        : {previewSurat.telepon}
                      </span>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Program Studi</span>
                    <span className="col-span-2 font-medium text-slate-800">
                      : S1 Kimia - FSTeM Universitas Brawijaya
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Semester</span>
                    <span className="col-span-2 font-medium text-slate-800">
                      : Semester {previewSurat.semester} {previewSurat.semesterAkademik ? `(${previewSurat.semesterAkademik})` : ''} / Aktif Terdaftar
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-semibold text-blue-800">Tanggal Pengajuan</span>
                    <span className="col-span-2 font-medium text-slate-800">
                      : {previewSurat.tanggalPengajuan || '-'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-semibold text-blue-800">Status Surat</span>
                    <span className="col-span-2">
                      : <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        previewSurat.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : previewSurat.status === 'Diproses'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : previewSurat.status === 'Selesai'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : previewSurat.status === 'Ditolak'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {previewSurat.status}
                      </span>
                    </span>
                  </div>

                  {previewSurat.judulPenelitian && (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold text-emerald-800">Judul Penelitian</span>
                      <span className="col-span-2 font-semibold text-slate-900">
                        : {previewSurat.judulPenelitian}
                      </span>
                    </div>
                  )}

                  {previewSurat.tujuanIjin && (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Tujuan Kegiatan</span>
                      <span className="col-span-2 font-medium text-slate-800">
                        : {previewSurat.tujuanIjin}
                      </span>
                    </div>
                  )}

                  {previewSurat.laboratorium && (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Laboratorium</span>
                      <span className="col-span-2 font-semibold text-blue-900">
                        : {previewSurat.laboratorium}
                      </span>
                    </div>
                  )}

                  {previewSurat.dosenNama && (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Dosen Pembimbing</span>
                      <span className="col-span-2 font-medium text-slate-800">
                        : {previewSurat.dosenNama}
                      </span>
                    </div>
                  )}

                  {previewSurat.tanggalPelaksanaan && (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Tanggal Pelaksanaan</span>
                      <span className="col-span-2 font-medium text-slate-800">
                        : {previewSurat.tanggalPelaksanaan}
                      </span>
                    </div>
                  )}

                  {previewSurat.namaPendamping && (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold text-amber-800">Nama Pendamping</span>
                      <span className="col-span-2 font-semibold text-slate-900">
                        : {previewSurat.namaPendamping} {previewSurat.teleponPendamping ? `(Telp: ${previewSurat.teleponPendamping})` : ''}
                      </span>
                    </div>
                  )}

                  {previewSurat.waktuLembur && (
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-semibold text-amber-800">Waktu Lembur</span>
                      <span className="col-span-2 font-semibold text-slate-900">
                        : {previewSurat.waktuLembur}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-justify pt-1">
                  Adalah benar mahasiswa terdaftar dan berstatus aktif pada Departemen Kimia FSTeM
                  Universitas Brawijaya. Surat ini dikeluarkan atas permohonan yang bersangkutan
                  untuk keperluan: <strong>"{previewSurat.keperluan}"</strong>.
                </p>

                <p className="text-justify">
                  Demikian surat keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan
                  sebagaimana mestinya.
                </p>

                {/* Tanda Tangan */}
                <div className="pt-6 flex justify-end text-xs">
                  <div className="text-center w-64 space-y-1">
                    <p>Malang, Jawa Timur</p>
                    <p className="font-semibold">Ketua Departemen Kimia,</p>
                    {/* Digital Seal */}
                    <div className="py-2">
                      <div className="border border-blue-600 rounded-lg p-2 bg-blue-50/50 inline-block font-sans">
                        <div className="flex items-center justify-center gap-1 text-[10px] text-blue-700 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>TERVERIFIKASI DIGITAL</span>
                        </div>
                        <p className="text-[9px] text-blue-600 font-mono mt-0.5">
                          SIKMA-UB-DOC-{previewSurat.id}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold underline text-slate-900 mt-2">
                      Prof. Dr. Dra. Hermin Sulistyarti, M.Si
                    </p>
                    <p className="text-[10px] text-slate-600">NIP. 196403211989032001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Preview Actions */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Format Surat Resmi SIKMA UB
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewSurat)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSurat(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          MODAL KONFIRMASI HAPUS DATA MAHASISWA & PERMOHONAN SURAT
          ========================================================================= */}
      {studentToDelete && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-base text-white">Konfirmasi Hapus Data</h3>
              </div>
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Apakah Anda yakin ingin menghapus data mahasiswa berikut dari daftar permohonan surat?
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Mahasiswa:</span>
                  <span className="font-bold text-slate-800">{studentToDelete.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NIM:</span>
                  <span className="font-mono font-bold text-slate-800">{studentToDelete.nim}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Semester / Angkatan:</span>
                  <span className="font-medium text-slate-700">
                    Semester {studentToDelete.semester} • Angkatan {studentToDelete.angkatan}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Total Permohonan Surat Terkait:</span>
                  <span className="font-bold text-rose-600">
                    {permohonanList.filter(
                      (p) =>
                        p.nim === studentToDelete.nim ||
                        p.mahasiswaNama.toLowerCase() === studentToDelete.nama.toLowerCase()
                    ).length} Surat
                  </span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Tindakan ini akan menghapus data mahasiswa beserta seluruh riwayat pengajuan suratnya dari sistem SIKMA.
                </span>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL KONFIRMASI HAPUS SURAT INDIVIDU
          ========================================================================= */}
      {suratToDelete && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="bg-rose-600 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white">Hapus Surat Permohonan</h3>
              </div>
              <button
                type="button"
                onClick={() => setSuratToDelete(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <p>Apakah Anda yakin ingin menghapus surat permohonan berikut?</p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jenis Surat:</span>
                  <strong className="text-slate-800">{suratToDelete.jenisSurat}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tgl Pengajuan:</span>
                  <span className="text-slate-700">{suratToDelete.tanggalPengajuan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-slate-800">{suratToDelete.status}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSuratToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteSurat}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Surat</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Input File Tersembunyi untuk Aksi Browse pada Button File di Modal Data Semua Pengajuan Surat */}
      <input
        type="file"
        ref={suratFileInputRef}
        onChange={handleSuratFileSelected}
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
      />

      {/* Toast Notifikasi Berkas File Surat */}
      {suratFileToast && (
        <div className="fixed bottom-6 right-6 z-80 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{suratFileToast}</span>
          <button
            type="button"
            onClick={() => setSuratFileToast(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MODAL FILE SURAT (DIPICU DARI BUTTON FILE DI DATA SEMUA PENGAJUAN SURAT)
          Judul: File Surat
          List berbentuk: (Browse, Submit, Preview)
          ========================================================================= */}
      {activeFileSuratModalItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8 flex flex-col">
            {/* Header: Judul File Surat */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">File Surat</h3>
                  <p className="text-xs text-slate-300">
                    {activeFileSuratModalItem.jenisSurat} • {activeFileSuratModalItem.mahasiswaNama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveFileSuratModalItem(null);
                  setTempSuratFileSelection(null);
                }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Berkas Surat */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Ringkasan Data Surat */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mahasiswa:</span>
                  <strong className="text-slate-900">{activeFileSuratModalItem.mahasiswaNama}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">NIM:</span>
                  <span className="font-mono font-semibold text-slate-800">{activeFileSuratModalItem.nim}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jenis Surat:</span>
                  <span className="font-semibold text-blue-700">{activeFileSuratModalItem.jenisSurat}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nomor Surat:</span>
                  <span className="font-mono text-slate-700">{activeFileSuratModalItem.nomorSurat}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status Berkas:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      suratFilesMap[activeFileSuratModalItem.id]?.isSubmitted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {suratFilesMap[activeFileSuratModalItem.id]?.isSubmitted
                      ? 'Terverifikasi & Tersimpan'
                      : 'Menunggu Submit'}
                  </span>
                </div>
              </div>

              {/* List Berbentuk (Browse, Submit, Preview) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Menu Berkas Surat
                </h4>

                {/* 1. Browse */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">1. Browse</span>
                        <p className="text-xs text-slate-500">
                          Pilih file dokumen surat dari perangkat Anda (.pdf, .doc, .docx, .png, .jpg).
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSuratForFile(activeFileSuratModalItem);
                        suratFileInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse</span>
                    </button>
                  </div>

                  {/* Info Berkas Saat Ini */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">
                        {tempSuratFileSelection
                          ? tempSuratFileSelection.name
                          : suratFilesMap[activeFileSuratModalItem.id]?.fileName ||
                            'Belum ada berkas dipilih'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                      {tempSuratFileSelection
                        ? `${(tempSuratFileSelection.size / 1024).toFixed(1)} KB`
                        : suratFilesMap[activeFileSuratModalItem.id]?.fileSize || '-'}
                    </span>
                  </div>
                </div>

                {/* 2. Submit */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-2xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">2. Submit</span>
                        <p className="text-xs text-slate-500">
                          Kirim dan simpan file dokumen surat resmi ke sistem arsip SIKMA.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirmSubmitSuratFile(activeFileSuratModalItem)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0 ${
                        suratFilesMap[activeFileSuratModalItem.id]?.isSubmitted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {suratFilesMap[activeFileSuratModalItem.id]?.isSubmitted
                          ? 'Tersimpan ✓'
                          : 'Submit'}
                      </span>
                    </button>
                  </div>

                  {suratFilesMap[activeFileSuratModalItem.id]?.uploadedAt && (
                    <p className="text-[11px] text-slate-400 italic">
                      Terakhir diperbarui: {suratFilesMap[activeFileSuratModalItem.id]?.uploadedAt}
                    </p>
                  )}
                </div>

                {/* 3. Preview */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-all shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">3. Preview</span>
                        <p className="text-xs text-slate-500">
                          Pratinjau lembar surat resmi Departemen Kimia FSTeM UB.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewSurat(activeFileSuratModalItem);
                        setActiveFileSuratModalItem(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal File */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Departemen Kimia FSTeM Universitas Brawijaya
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveFileSuratModalItem(null);
                  setTempSuratFileSelection(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL EDIT PENGAJUAN SURAT MAHASISWA
          ========================================================================= */}
      {isEditSuratModalOpen && editingSurat && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Edit Pengajuan Surat Mahasiswa
                  </h3>
                  <p className="text-xs text-slate-300">
                    {editingSurat.mahasiswaNama} • NIM: {editingSurat.nim}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditSuratModalOpen(false);
                  setEditingSurat(null);
                }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditSurat} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Row 1: Nomor Surat & Tanggal Pengajuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor Surat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editNomorSurat}
                    onChange={(e) => setEditNomorSurat(e.target.value)}
                    placeholder="Contoh: 1420/UN10.F09/AK/2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tanggal Pengajuan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editTanggalPengajuan}
                    onChange={(e) => setEditTanggalPengajuan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Jenis Surat & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jenis Surat <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editJenisSurat}
                    onChange={(e) =>
                      setEditJenisSurat(e.target.value as 'Ijin Kerja Lab' | 'KPRS' | 'Ijin Lembur')
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Ijin Kerja Lab">Ijin Kerja Lab</option>
                    <option value="KPRS">KPRS</option>
                    <option value="Ijin Lembur">Ijin Lembur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status Pengajuan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as 'Disetujui' | 'Diproses' | 'Selesai' | 'Menunggu' | 'Ditolak')
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Disetujui">Disetujui</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Menunggu">Menunggu</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              {/* Detail Khusus: Ijin Kerja Lab */}
              {editJenisSurat === 'Ijin Kerja Lab' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 text-xs text-emerald-800 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bidang Spesifik Permohonan Ijin Kerja Laboratorium</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Judul Penelitian <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={editJudulPenelitian}
                      onChange={(e) => setEditJudulPenelitian(e.target.value)}
                      placeholder="Judul penelitian / riset laboratorium..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tujuan Ijin
                      </label>
                      <select
                        value={editTujuanIjin}
                        onChange={(e) => setEditTujuanIjin(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
                      >
                        {tujuanOpsiList.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Laboratorium
                      </label>
                      <select
                        value={editLaboratorium}
                        onChange={(e) => setEditLaboratorium(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
                      >
                        {jenisLaboratoriumList.map((lab) => (
                          <option key={lab} value={lab}>
                            {lab}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={editTanggalMulai}
                        onChange={(e) => setEditTanggalMulai(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        value={editTanggalSelesai}
                        onChange={(e) => setEditTanggalSelesai(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Dosen Pembimbing
                      </label>
                      <select
                        value={editDosenNama}
                        onChange={(e) => setEditDosenNama(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
                      >
                        {dosenList.map((d) => (
                          <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                            {d.nama}, {d.gelar}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kontak Mahasiswa (No. HP)
                      </label>
                      <input
                        type="text"
                        value={editTelepon}
                        onChange={(e) => setEditTelepon(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Detail Khusus: KPRS */}
              {editJenisSurat === 'KPRS' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/80 text-xs text-blue-800 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Bidang Spesifik Perubahan Rencana Studi (KPRS)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Semester Akademik
                      </label>
                      <select
                        value={editSemesterAkademik}
                        onChange={(e) => setEditSemesterAkademik(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
                      >
                        {semesterDatabase.map((s) => (
                          <option key={s.id} value={s.namaSemester}>
                            {s.namaSemester} {s.status === 'Aktif' ? '(Aktif)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Semester (Tingkat)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={editSemester}
                        onChange={(e) => setEditSemester(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Dosen Pembimbing Akademik (PA)
                    </label>
                    <select
                      value={editDosenNama}
                      onChange={(e) => setEditDosenNama(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
                    >
                      {dosenList.map((d) => (
                        <option key={d.id} value={`${d.nama}, ${d.gelar}`}>
                          {d.nama}, {d.gelar}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Detail Khusus: Ijin Lembur */}
              {editJenisSurat === 'Ijin Lembur' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Bidang Spesifik Permohonan Ijin Lembur Laboratorium</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Waktu Lembur
                      </label>
                      <input
                        type="text"
                        value={editWaktuLembur}
                        onChange={(e) => setEditWaktuLembur(e.target.value)}
                        placeholder="Contoh: 17.00 - 21.00 WIB"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Laboratorium
                      </label>
                      <select
                        value={editLaboratorium}
                        onChange={(e) => setEditLaboratorium(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
                      >
                        {jenisLaboratoriumList.map((lab) => (
                          <option key={lab} value={lab}>
                            {lab}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Pendamping (Pranata Lab / Dosen)
                      </label>
                      <input
                        type="text"
                        value={editNamaPendamping}
                        onChange={(e) => setEditNamaPendamping(e.target.value)}
                        placeholder="Nama petugas pendamping..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Telepon Pendamping
                      </label>
                      <input
                        type="text"
                        value={editTeleponPendamping}
                        onChange={(e) => setEditTeleponPendamping(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Keperluan Surat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Keperluan Surat <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editKeperluan}
                  onChange={(e) => setEditKeperluan(e.target.value)}
                  placeholder="Tuliskan tujuan dan keperluan surat permohonan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none"
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditSuratModalOpen(false);
                    setEditingSurat(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
