import React, { useState, useMemo, useRef } from 'react';
import {
  SkripsiMahasiswaItem,
  LabRiset,
  UserRole,
  Mahasiswa,
  Dosen,
  DokumenPendaftaranItem,
  BerkasPendaftaranSkripsi,
  StatusValidasiBerkas,
  SemesterItem,
  DokumenSeminarProposalItem,
  BerkasSeminarProposal,
  NilaiSeminarProposal,
  DataProposalSeminar,
  DokumenYudisiumItem,
  BioDataSarjanaData
} from '../types/sikma';
import { INITIAL_SKRIPSI_LIST } from '../data/skripsiList';
import { INITIAL_SEMESTER_LIST } from '../data/semesterList';
import { INITIAL_DOSEN } from '../data/mockData';

export interface YudisiumDocConfig {
  key: string;
  title: string;
  desc: string;
  defaultExt: string;
  accept: string;
  defaultSize: string;
}

export const YUDISIUM_DOC_CONFIG: YudisiumDocConfig[] = [
  {
    key: 'foto',
    title: 'Foto',
    desc: 'Pas foto formal terbaru latar belakang merah ukuran 3x4 / 4x6 untuk ijazah & wisuda',
    defaultExt: 'jpg',
    accept: '.jpg,.jpeg,.png',
    defaultSize: '1.2 MB'
  },
  {
    key: 'abstrakInggris',
    title: 'Abstrak Bahasa Inggris',
    desc: 'Naskah abstrak skripsi dalam Bahasa Inggris (English Abstract) yang telah diverifikasi',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '420 KB'
  },
  {
    key: 'sertifikatPrestasi',
    title: 'Sertifikat Prestasi',
    desc: 'Sertifikat prestasi akademik, keikutsertaan lomba ilmiah, atau pemakalah seminar',
    defaultExt: 'pdf',
    accept: '.pdf,.jpg,.png',
    defaultSize: '1.8 MB'
  },
  {
    key: 'skripsiFormatJurnal',
    title: 'Skripsi Format Jurnal',
    desc: 'Artikel ilmiah hasil penelitian skripsi sesuai format jurnal Departemen Kimia UB',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '2.6 MB'
  },
  {
    key: 'coverDaftarIsi',
    title: 'Cover + Daftar Isi',
    desc: 'Halaman judul skripsi, lembar pengesahan, kata pengantar, dan daftar isi lengkap',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '850 KB'
  },
  {
    key: 'bab1',
    title: 'Bab 1',
    desc: 'Bab 1 Pendahuluan (Latar Belakang, Rumusan Masalah, Tujuan & Manfaat Penelitian)',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '650 KB'
  },
  {
    key: 'bab2',
    title: 'Bab 2',
    desc: 'Bab 2 Tinjauan Pustaka, dasar teori kimia, dan telaah riset terdahulu',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '1.4 MB'
  },
  {
    key: 'bab3',
    title: 'Bab 3',
    desc: 'Bab 3 Metodologi Penelitian (Alat, bahan kimia, prosedur sintesis & analisis instrumen)',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '980 KB'
  },
  {
    key: 'bab4',
    title: 'Bab 4',
    desc: 'Bab 4 Hasil Penelitian dan Pembahasan Karakterisasi Instrumen Kimia',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '3.1 MB'
  },
  {
    key: 'bab5',
    title: 'Bab 5',
    desc: 'Bab 5 Kesimpulan dan Saran hasil penelitian tugas akhir',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '410 KB'
  },
  {
    key: 'bab6',
    title: 'Bab 6',
    desc: 'Bab 6 Daftar Pustaka & Lampiran spektrum, kromatogram, dan perhitungan rendemen',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '2.2 MB'
  },
  {
    key: 'bebasPinjamLab',
    title: 'Bebas Pinjam Lab',
    desc: 'Surat Keterangan Bebas Pinjam Alat & Bahan Laboratorium Riset Kimia FSTeM UB',
    defaultExt: 'pdf',
    accept: '.pdf,.jpg,.png',
    defaultSize: '520 KB'
  },
  {
    key: 'bebasPinjamPerpustakaan',
    title: 'Bebas Pinjam Perpustakaan',
    desc: 'Surat Keterangan Bebas Pinjam Pustaka dari Perpustakaan Pusat Universitas Brawijaya',
    defaultExt: 'pdf',
    accept: '.pdf,.jpg,.png',
    defaultSize: '480 KB'
  },
  {
    key: 'bioDataSarjana',
    title: 'Bio Data Sarjana',
    desc: 'Formulir biodata lengkap calon sarjana kimia untuk verifikasi ijazah dan wisuda',
    defaultExt: 'pdf',
    accept: '.pdf,.doc,.docx',
    defaultSize: '610 KB'
  }
];
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  Plus,
  X,
  FileText,
  User,
  GraduationCap,
  FlaskConical,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  FolderOpen,
  Upload,
  Check,
  XCircle,
  FileCheck2,
  Paperclip,
  ShieldCheck,
  FileSpreadsheet,
  FileCheck,
  FileUp,
  Award,
  Pencil,
  MessageSquare,
  ExternalLink,
  MapPin,
  Video,
  Copy,
  Link,
  Share2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Sparkles,
  Phone,
  UserCheck,
  Users,
  Mail
} from 'lucide-react';

interface SkripsiViewProps {
  currentRole: UserRole;
  student?: Mahasiswa;
  dosenList?: Dosen[];
}

export const SkripsiView: React.FC<SkripsiViewProps> = ({
  currentRole,
  student,
  dosenList = []
}) => {
  // Persistence via localStorage
  const [skripsiList, setSkripsiList] = useState<SkripsiMahasiswaItem[]>(() => {
    const saved = localStorage.getItem('sikma_skripsi_data');
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
    return INITIAL_SKRIPSI_LIST;
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLab, setFilterLab] = useState<string>('Semua');
  const [filterTahapan, setFilterTahapan] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Pagination (10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal State
  const [selectedSkripsi, setSelectedSkripsi] = useState<SkripsiMahasiswaItem | null>(null);

  // Box Tahapan Skripsi active button/tab
  const [activeTahapanTab, setActiveTahapanTab] = useState<
    'Pendaftaran' | 'Proposal' | 'Kemajuan' | 'Ujian Akhir Skripsi' | 'Persyaratan Yudisium'
  >('Pendaftaran');

  // Database Semester (diambil dari database master Semester / localStorage 'sikma_semesters')
  const [semesterDatabase] = useState<SemesterItem[]>(() => {
    const saved = localStorage.getItem('sikma_semesters');
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
    return INITIAL_SEMESTER_LIST;
  });

  // Ambil semester yang berstatus Aktif dari database Semester
  const activeSemesterFromDb = useMemo(() => {
    return semesterDatabase.find((s) => s.status === 'Aktif') || semesterDatabase[0];
  }, [semesterDatabase]);

  // Database Dosen (diambil dari database Dosen: props dosenList / localStorage 'sikma_dosen_data' / INITIAL_DOSEN)
  const dosenDatabase = useMemo(() => {
    if (dosenList && dosenList.length > 0) return dosenList;
    const saved = localStorage.getItem('sikma_dosen_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_DOSEN;
  }, [dosenList]);

  // Format nama dosen lengkap dengan gelar
  const formatDosenName = (d: Dosen) => {
    if (!d.gelar || d.nama.includes(d.gelar)) return d.nama;
    return `${d.nama}, ${d.gelar}`;
  };

  // Daftar nama dosen unik dari database Dosen
  const dosenNameOptions = useMemo(() => {
    const names = dosenDatabase.map((d) => formatDosenName(d));
    // Pastikan dosen yang ada di skripsi tetap terdaftar di opsi
    skripsiList.forEach((s) => {
      if (s.dosenPembimbing1 && !names.includes(s.dosenPembimbing1)) names.push(s.dosenPembimbing1);
      if (s.dosenPembimbing2 && !names.includes(s.dosenPembimbing2)) names.push(s.dosenPembimbing2);
      if (s.dosenPenguji && !names.includes(s.dosenPenguji)) names.push(s.dosenPenguji);
      if (s.proposal?.dosenPenguji1 && !names.includes(s.proposal.dosenPenguji1)) names.push(s.proposal.dosenPenguji1);
      if (s.proposal?.dosenPenguji2 && !names.includes(s.proposal.dosenPenguji2)) names.push(s.proposal.dosenPenguji2);
    });
    return Array.from(new Set(names)).filter(Boolean);
  }, [dosenDatabase, skripsiList]);

  // Edit Skripsi Modal State
  const [isEditSkripsiModalOpen, setIsEditSkripsiModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    tahapan: 'Mendaftar' | 'Proposal' | 'Kemajuan' | 'Ujian Akhir Skripsi';
    judul: string;
    judulInggris: string;
    dosenPembimbing1: string;
    dosenPembimbing2: string;
    dosenPenguji: string;
    noHpOrangTua: string;
    status: 'Aktif' | 'Gagal';
    semester: number;
    namaSemester: string;
    bidangMinat: LabRiset;
    ipk: number;
    jumlahSks: number;
    tanggal: string;
    jam: string;
    lokasi: string;
    linkDaring: string;
    nilai: string;
  }>({
    tahapan: 'Proposal',
    judul: '',
    judulInggris: '',
    dosenPembimbing1: '',
    dosenPembimbing2: '',
    dosenPenguji: '',
    noHpOrangTua: '081234567890',
    status: 'Aktif',
    semester: 7,
    namaSemester: 'Ganjil 2026 / 2027',
    bidangMinat: 'Laboratorium Kimia Organik & Bahan Alam',
    ipk: 3.82,
    jumlahSks: 123,
    tanggal: '24 Maret 2026',
    jam: '09:00 - 11:00 WIB',
    lokasi: 'Ruang Seminar Gedung Kimia Lt. 2 (R. 204)',
    linkDaring: 'https://meet.google.com/kim-prop-ub26',
    nilai: '86.50'
  });

  const handleOpenDetail = (item: SkripsiMahasiswaItem) => {
    setSelectedSkripsi(item);
    if (item.tahapan === 'Mendaftar' || item.tahapan === 'Pengajuan Judul' || item.tahapan === 'Belum Mengambil') {
      setActiveTahapanTab('Pendaftaran');
    } else if (item.tahapan === 'Proposal' || item.tahapan === 'Seminar Proposal') {
      setActiveTahapanTab('Proposal');
    } else if (item.tahapan === 'Kemajuan' || item.tahapan === 'Penelitian Laboratorium' || item.tahapan === 'Seminar Hasil') {
      setActiveTahapanTab('Kemajuan');
    } else if (item.tahapan === 'Ujian Akhir Skripsi' || item.tahapan === 'Ujian Skripsi') {
      setActiveTahapanTab('Ujian Akhir Skripsi');
    } else if (item.tahapan === 'Revisi & Bebas Lab' || item.tahapan === 'Selesai / Lulus') {
      setActiveTahapanTab('Persyaratan Yudisium');
    } else {
      setActiveTahapanTab('Pendaftaran');
    }
  };

  const handleOpenEditModal = (item: SkripsiMahasiswaItem) => {
    // Petakan ke 4 opsi: Mendaftar, Proposal, Kemajuan, Ujian Akhir Skripsi
    let mappedTahapan: 'Mendaftar' | 'Proposal' | 'Kemajuan' | 'Ujian Akhir Skripsi' = 'Mendaftar';
    if (item.tahapan === 'Mendaftar' || item.tahapan === 'Pengajuan Judul' || item.tahapan === 'Belum Mengambil') {
      mappedTahapan = 'Mendaftar';
    } else if (item.tahapan === 'Proposal' || item.tahapan === 'Seminar Proposal') {
      mappedTahapan = 'Proposal';
    } else if (item.tahapan === 'Kemajuan' || item.tahapan === 'Penelitian Laboratorium' || item.tahapan === 'Seminar Hasil') {
      mappedTahapan = 'Kemajuan';
    } else if (item.tahapan === 'Ujian Akhir Skripsi' || item.tahapan === 'Ujian Skripsi' || item.tahapan === 'Revisi & Bebas Lab' || item.tahapan === 'Selesai / Lulus') {
      mappedTahapan = 'Ujian Akhir Skripsi';
    } else {
      mappedTahapan = 'Proposal';
    }

    const defaultDosen1 = item.dosenPembimbing1 || dosenNameOptions[0] || 'Masruri, S.Si., M.Si., Ph.D';
    const mappedStatus: 'Aktif' | 'Gagal' = item.status === 'Gagal' ? 'Gagal' : 'Aktif';

    setEditFormData({
      tahapan: mappedTahapan,
      judul: item.judul,
      judulInggris: item.judulInggris || '',
      dosenPembimbing1: defaultDosen1,
      dosenPembimbing2: item.dosenPembimbing2 || '',
      dosenPenguji: item.dosenPenguji || item.proposal?.dosenPenguji1 || "Prof. Dr. Aulanni'am, drh., DES",
      noHpOrangTua: item.noHpOrangTua || '081234567890',
      status: mappedStatus,
      semester: item.semester ?? 7,
      namaSemester: item.namaSemester || activeSemesterFromDb?.namaSemester || 'Ganjil 2026 / 2027',
      bidangMinat: item.bidangMinat,
      ipk: item.ipk ?? 3.82,
      jumlahSks: item.jumlahSks ?? item.totalSks ?? 123,
      tanggal: item.tanggal || item.proposal?.tanggal || '24 Maret 2026',
      jam: item.jam || item.proposal?.jam || '09:00 - 11:00 WIB',
      lokasi: item.lokasi || item.proposal?.lokasi || 'Ruang Seminar Gedung Kimia Lt. 2 (R. 204)',
      linkDaring: item.linkDaring || item.proposal?.linkDaring || 'https://meet.google.com/kim-prop-ub26',
      nilai: item.nilai ? String(item.nilai) : item.proposal?.nilaiProposal ? String(item.proposal.nilaiProposal.nilaiAkhir) : '86.50'
    });
    setIsEditSkripsiModalOpen(true);
  };

  const handleSaveEditSkripsi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkripsi) return;

    if (!editFormData.judul.trim() || !editFormData.dosenPembimbing1.trim()) {
      setNotificationMsg('Judul dan Dosen Pembimbing 1 wajib diisi.');
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }

    const parsedNilai = parseFloat(editFormData.nilai) || 86.5;

    const updatedItem: SkripsiMahasiswaItem = {
      ...selectedSkripsi,
      tahapan: editFormData.tahapan,
      judul: editFormData.judul.trim(),
      judulInggris: editFormData.judulInggris.trim() || undefined,
      dosenPembimbing1: editFormData.dosenPembimbing1.trim(),
      dosenPembimbing2: editFormData.dosenPembimbing2.trim() || undefined,
      dosenPenguji: editFormData.dosenPenguji.trim() || undefined,
      noHpOrangTua: editFormData.noHpOrangTua.trim() || undefined,
      status: editFormData.status,
      semester: Number(editFormData.semester) || 7,
      namaSemester: editFormData.namaSemester,
      bidangMinat: editFormData.bidangMinat,
      ipk: Number(editFormData.ipk) || 0,
      jumlahSks: Number(editFormData.jumlahSks) || 0,
      totalSks: Number(editFormData.jumlahSks) || 0,
      tanggal: editFormData.tanggal.trim(),
      jam: editFormData.jam.trim(),
      lokasi: editFormData.lokasi.trim(),
      linkDaring: editFormData.linkDaring.trim(),
      nilai: editFormData.nilai.trim() || '86.50',
      proposal: {
        ...(selectedSkripsi.proposal || {}),
        tanggal: editFormData.tanggal.trim(),
        jam: editFormData.jam.trim(),
        lokasi: editFormData.lokasi.trim(),
        linkDaring: editFormData.linkDaring.trim(),
        dosenPenguji1: editFormData.dosenPenguji.trim() || undefined,
        nilaiProposal: selectedSkripsi.proposal?.nilaiProposal ? {
          ...selectedSkripsi.proposal.nilaiProposal,
          nilaiAkhir: parsedNilai,
          grade: parsedNilai >= 80 ? 'A' : parsedNilai >= 75 ? 'B+' : parsedNilai >= 70 ? 'B' : 'C+'
        } : undefined
      }
    };

    setSelectedSkripsi(updatedItem);
    const updatedList = skripsiList.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    setSkripsiList(updatedList);
    localStorage.setItem('sikma_skripsi_data', JSON.stringify(updatedList));

    setIsEditSkripsiModalOpen(false);
    setNotificationMsg('Data Skripsi berhasil diperbarui!');
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Berkas Pendaftaran & Berkas Seminar Modal State
  const [isBerkasModalOpen, setIsBerkasModalOpen] = useState(false);
  const [isBerkasSeminarModalOpen, setIsBerkasSeminarModalOpen] = useState(false);
  const [isNilaiModalOpen, setIsNilaiModalOpen] = useState(false);

  const [previewDoc, setPreviewDoc] = useState<{
    docKey: 'formulir' | 'transkrip' | 'krs' | 'fidk' | 'naskahSeminar' | 'beritaAcara';
    title: string;
    studentName: string;
    nim: string;
    item: DokumenPendaftaranItem | DokumenSeminarProposalItem;
  } | null>(null);

  const [pendingFiles, setPendingFiles] = useState<{
    formulir?: File | null;
    transkrip?: File | null;
    krs?: File | null;
    fidk?: File | null;
  }>({});

  const [pendingProposalFiles, setPendingProposalFiles] = useState<{
    naskahSeminar?: File | null;
    beritaAcara?: File | null;
  }>({});

  const [pendingYudisiumFiles, setPendingYudisiumFiles] = useState<Record<string, File | null>>({});
  const [previewYudisiumDoc, setPreviewYudisiumDoc] = useState<{
    doc: DokumenYudisiumItem;
    config: YudisiumDocConfig;
    index: number;
  } | null>(null);

  const [isBioDataModalOpen, setIsBioDataModalOpen] = useState(false);
  const [bioDataForm, setBioDataForm] = useState<BioDataSarjanaData>({
    nama: '',
    nim: '',
    programStudi: 'S1 Kimia',
    nik: '',
    tanggalLahir: '',
    tempatLahir: '',
    jenisKelamin: 'Laki-laki',
    statusPerkawinan: 'Belum Menikah',
    agama: 'Islam',
    alamat: '',
    terminalCutiAkademik: '0 Semester',
    telepon: '',
    email: '',
    namaAyah: '',
    pekerjaanAyah: '',
    teleponAyah: '',
    namaIbu: '',
    pekerjaanIbu: '',
    tanggalMulaiTA: '',
    tanggalLulus: '',
    dosenPembimbing1: '',
    dosenPembimbing2: '',
    nilaiSkripsi: '',
    predikatLulus: '',
    ipk: '',
    sks: '',
    lamaStudiTahun: '3',
    lamaStudiBulan: '9',
    lamaStudiHari: '15',
    judul: '',
    judulInggris: ''
  });

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const fileInputRefs = {
    formulir: useRef<HTMLInputElement>(null),
    transkrip: useRef<HTMLInputElement>(null),
    krs: useRef<HTMLInputElement>(null),
    fidk: useRef<HTMLInputElement>(null)
  };

  const proposalFileInputRefs = {
    naskahSeminar: useRef<HTMLInputElement>(null),
    beritaAcara: useRef<HTMLInputElement>(null)
  };

  const yudisiumFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Helper to get safe berkas pendaftaran for any student
  const getStudentBerkas = (item: SkripsiMahasiswaItem): BerkasPendaftaranSkripsi => {
    if (item.berkasPendaftaran) {
      return item.berkasPendaftaran;
    }
    return {
      formulir: {
        fileName: `Formulir_Pendaftaran_Skripsi_${item.nim}.pdf`,
        fileSize: '412 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-10 09:30',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Formulir usulan penelitian dan kesediaan dosen pembimbing lengkap.'
      },
      transkrip: {
        fileName: `Transkrip_Akademik_${item.nim}.pdf`,
        fileSize: '820 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-10 09:35',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Total nilai D < 10% dari total SKS lulus.'
      },
      krs: {
        fileName: `KRS_Semester_7_${item.nim}.pdf`,
        fileSize: '350 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-12 11:15',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Mata kuliah MAK60099 Tugas Akhir / Skripsi (6 SKS) tercantum di KRS.'
      },
      fidk: {
        fileName: `FIDK_Departemen_Kimia_${item.nim}.pdf`,
        fileSize: '510 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-12 11:20',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Formulir Isian Departemen Kimia telah diverifikasi Dosen PA.'
      }
    };
  };

  // Helper to get safe proposal data for any student
  const getStudentProposal = (item: SkripsiMahasiswaItem): DataProposalSeminar => {
    const raw = item.proposal;
    const rawNilaiAkhir =
      raw?.nilaiProposal?.nilaiAkhir ??
      (typeof item.nilai === 'number'
        ? item.nilai
        : typeof item.nilai === 'string' && !isNaN(parseFloat(item.nilai))
        ? parseFloat(item.nilai)
        : 86.5);

    const defaultBerkas = {
      naskahSeminar: {
        fileName: `Naskah_Seminar_Proposal_${item.nim}.pdf`,
        fileSize: '2.4 MB',
        uploadedAt: '2026-03-12 10:15',
        isSubmitted: true,
        statusValidasi: 'Setujui' as const,
        catatanValidasi: 'Naskah seminar proposal disetujui untuk diseminarkan.'
      },
      beritaAcara: {
        fileName: `Berita_Acara_Seminar_Proposal_${item.nim}.pdf`,
        fileSize: '820 KB',
        uploadedAt: '2026-03-24 11:30',
        isSubmitted: true,
        statusValidasi: 'Setujui' as const,
        catatanValidasi: 'Berita acara telah diverifikasi oleh tim penguji.'
      }
    };

    return {
      tanggal: item.tanggal || raw?.tanggal || '24 Maret 2026',
      jam: item.jam || raw?.jam || '09:00 - 11:00 WIB',
      lokasi: item.lokasi || raw?.lokasi || 'Ruang Seminar Gedung Kimia Lt. 2 (R. 204)',
      linkDaring: item.linkDaring || raw?.linkDaring || 'https://meet.google.com/kim-prop-ub26',
      dosenPenguji1: item.dosenPenguji || raw?.dosenPenguji1 || "Prof. Dr. Aulanni'am, drh., DES",
      dosenPenguji2: raw?.dosenPenguji2 || 'Drs. Danar Purwonugroho, M.Si',
      berkasSeminar: raw?.berkasSeminar || defaultBerkas,
      nilaiProposal: raw?.nilaiProposal || {
        nilaiPembimbing1: rawNilaiAkhir + 1.5,
        nilaiPembimbing2: rawNilaiAkhir - 0.5,
        nilaiPenguji1: rawNilaiAkhir - 1.5,
        nilaiPenguji2: rawNilaiAkhir + 0.5,
        nilaiAkhir: rawNilaiAkhir,
        grade: rawNilaiAkhir >= 80 ? 'A' : rawNilaiAkhir >= 75 ? 'B+' : rawNilaiAkhir >= 70 ? 'B' : 'C+',
        statusKelulusan: 'Lulus',
        catatanRevisi: 'Revisi sitasi pustaka pada Bab 2 dan lengkapi metodologi penelitian pada Bab 3.',
        tanggalPenilaian: '2026-03-24'
      }
    };
  };

  // Helper untuk data tahap Kemajuan (Tanggal, Jam, Lokasi, Link Daring, Nilai)
  const getStudentKemajuan = (item: SkripsiMahasiswaItem) => {
    const raw = item.kemajuan;
    const displayNilai =
      raw?.nilaiProposal?.nilaiAkhir
        ? raw.nilaiProposal.nilaiAkhir.toFixed(2)
        : item.nilai !== undefined && item.nilai !== null && String(item.nilai).trim() !== ''
        ? String(item.nilai)
        : '87.50';

    return {
      tanggal: item.tanggal || raw?.tanggal || '15 Mei 2026',
      jam: item.jam || raw?.jam || '13:00 - 15:00 WIB',
      lokasi: item.lokasi || raw?.lokasi || `Laboratorium Riset ${item.bidangMinat}`,
      linkDaring: item.linkDaring || raw?.linkDaring || 'https://meet.google.com/kim-kemajuan-ub26',
      nilai: displayNilai
    };
  };

  // Helper untuk data tahap Ujian Akhir Skripsi (Tanggal, Jam, Lokasi, Link Daring, Nilai)
  const getStudentUjianAkhir = (item: SkripsiMahasiswaItem) => {
    const raw = item.ujianAkhir;
    const displayNilai =
      raw?.nilaiProposal?.nilaiAkhir
        ? raw.nilaiProposal.nilaiAkhir.toFixed(2)
        : item.nilai !== undefined && item.nilai !== null && String(item.nilai).trim() !== ''
        ? String(item.nilai)
        : '88.75';

    return {
      tanggal: item.tanggal || raw?.tanggal || (item.targetSelesai ? new Date(item.targetSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '18 Juni 2026'),
      jam: item.jam || raw?.jam || '08:30 - 11:30 WIB',
      lokasi: item.ujianAkhir?.lokasi || item.lokasi || 'Ruang Sidang Utama FSTeM Gedung Kimia Lt. 3',
      linkDaring: item.ujianAkhir?.linkDaring || item.linkDaring || 'https://meet.google.com/kim-ujian-skripsi',
      nilai: displayNilai
    };
  };

  // Validation handler (Setujui atau Ditolak)
  const handleUpdateValidation = (
    docKey: 'formulir' | 'transkrip' | 'krs' | 'fidk',
    newStatus: 'Setujui' | 'Ditolak'
  ) => {
    if (!selectedSkripsi) return;

    const currentBerkas = getStudentBerkas(selectedSkripsi);
    const docTitle =
      docKey === 'formulir'
        ? 'Formulir'
        : docKey === 'transkrip'
        ? 'Transkrip'
        : docKey === 'krs'
        ? 'KRS'
        : 'FIDK';

    const updatedDoc: DokumenPendaftaranItem = {
      ...currentBerkas[docKey],
      statusValidasi: newStatus,
      catatanValidasi:
        newStatus === 'Setujui'
          ? `Berkas ${docTitle} telah diverifikasi dan DISETUJUI.`
          : `Berkas ${docTitle} DITOLAK. Mohon unggah ulang berkas revisi yang valid.`
    };

    const updatedBerkas: BerkasPendaftaranSkripsi = {
      ...currentBerkas,
      [docKey]: updatedDoc
    };

    const updatedItem: SkripsiMahasiswaItem = {
      ...selectedSkripsi,
      berkasPendaftaran: updatedBerkas
    };

    setSelectedSkripsi(updatedItem);

    const updatedList = skripsiList.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    setSkripsiList(updatedList);
    localStorage.setItem('sikma_skripsi_data', JSON.stringify(updatedList));

    setNotificationMsg(`Validasi ${docTitle}: status diubah menjadi "${newStatus}".`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Browse file handler
  const handleFileChange = (
    docKey: 'formulir' | 'transkrip' | 'krs' | 'fidk',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFiles((prev) => ({ ...prev, [docKey]: file }));
      setNotificationMsg(`File dipilih untuk ${docKey.toUpperCase()}: "${file.name}". Klik "Submit" untuk mengunggah.`);
      setTimeout(() => setNotificationMsg(null), 3500);
    }
  };

  // Submit file handler
  const handleSubmitFile = (docKey: 'formulir' | 'transkrip' | 'krs' | 'fidk') => {
    if (!selectedSkripsi) return;

    const currentBerkas = getStudentBerkas(selectedSkripsi);
    const pending = pendingFiles[docKey];
    const docTitle =
      docKey === 'formulir'
        ? 'Formulir'
        : docKey === 'transkrip'
        ? 'Transkrip'
        : docKey === 'krs'
        ? 'KRS'
        : 'FIDK';

    const updatedDoc: DokumenPendaftaranItem = {
      ...currentBerkas[docKey],
      fileName: pending
        ? pending.name
        : currentBerkas[docKey].fileName || `${docTitle}_${selectedSkripsi.nim}.pdf`,
      fileSize: pending
        ? `${Math.round(pending.size / 1024)} KB`
        : currentBerkas[docKey].fileSize || '450 KB',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isSubmitted: true
    };

    const updatedBerkas: BerkasPendaftaranSkripsi = {
      ...currentBerkas,
      [docKey]: updatedDoc
    };

    const updatedItem: SkripsiMahasiswaItem = {
      ...selectedSkripsi,
      berkasPendaftaran: updatedBerkas
    };

    setSelectedSkripsi(updatedItem);
    setPendingFiles((prev) => ({ ...prev, [docKey]: null }));

    const updatedList = skripsiList.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    setSkripsiList(updatedList);
    localStorage.setItem('sikma_skripsi_data', JSON.stringify(updatedList));

    setNotificationMsg(`Berkas ${docTitle} berhasil disubmit!`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Proposal Document Handlers (Naskah Seminar & Berita Acara)
  const handleProposalFileChange = (
    docKey: 'naskahSeminar' | 'beritaAcara',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingProposalFiles((prev) => ({ ...prev, [docKey]: file }));
      const label = docKey === 'naskahSeminar' ? 'Naskah Seminar Proposal' : 'Berita Acara Seminar Proposal';
      setNotificationMsg(`File dipilih untuk ${label}: "${file.name}". Klik "Submit" untuk mengunggah.`);
      setTimeout(() => setNotificationMsg(null), 3500);
    }
  };

  const handleSubmitProposalFile = (docKey: 'naskahSeminar' | 'beritaAcara') => {
    if (!selectedSkripsi) return;

    const currentProposal = getStudentProposal(selectedSkripsi);
    const defaultBerkas: BerkasSeminarProposal = {
      naskahSeminar: {
        fileName: `Naskah_Proposal_${selectedSkripsi.nim}.pdf`,
        fileSize: '2.4 MB',
        uploadedAt: '2026-03-12 10:15',
        isSubmitted: false,
        statusValidasi: 'Belum Diverifikasi'
      },
      beritaAcara: {
        fileName: `Berita_Acara_Proposal_${selectedSkripsi.nim}.pdf`,
        fileSize: '820 KB',
        uploadedAt: '2026-03-24 11:30',
        isSubmitted: false,
        statusValidasi: 'Belum Diverifikasi'
      }
    };
    const currentBerkas: BerkasSeminarProposal = currentProposal.berkasSeminar || defaultBerkas;
    const pending = pendingProposalFiles[docKey];
    const docTitle = docKey === 'naskahSeminar' ? 'Naskah Seminar Proposal' : 'Berita Acara Seminar Proposal';

    const updatedDoc: DokumenSeminarProposalItem = {
      ...currentBerkas[docKey],
      fileName: pending ? pending.name : currentBerkas[docKey]?.fileName || `${docTitle}_${selectedSkripsi.nim}.pdf`,
      fileSize: pending ? `${Math.round(pending.size / 1024)} KB` : currentBerkas[docKey]?.fileSize || '600 KB',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isSubmitted: true
    };

    const updatedProposal: DataProposalSeminar = {
      ...currentProposal,
      berkasSeminar: {
        ...currentBerkas,
        [docKey]: updatedDoc
      }
    };

    const updatedItem: SkripsiMahasiswaItem = {
      ...selectedSkripsi,
      proposal: updatedProposal
    };

    setSelectedSkripsi(updatedItem);
    setPendingProposalFiles((prev) => ({ ...prev, [docKey]: null }));

    const updatedList = skripsiList.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    setSkripsiList(updatedList);
    localStorage.setItem('sikma_skripsi_data', JSON.stringify(updatedList));

    setNotificationMsg(`Berkas ${docTitle} berhasil disubmit!`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleUpdateProposalValidation = (
    docKey: 'naskahSeminar' | 'beritaAcara',
    newStatus: StatusValidasiBerkas
  ) => {
    if (!selectedSkripsi) return;

    const currentProposal = getStudentProposal(selectedSkripsi);
    const defaultBerkas: BerkasSeminarProposal = {
      naskahSeminar: {
        fileName: `Naskah_Proposal_${selectedSkripsi.nim}.pdf`,
        fileSize: '2.4 MB',
        uploadedAt: '2026-03-12 10:15',
        isSubmitted: false,
        statusValidasi: 'Belum Diverifikasi'
      },
      beritaAcara: {
        fileName: `Berita_Acara_Proposal_${selectedSkripsi.nim}.pdf`,
        fileSize: '820 KB',
        uploadedAt: '2026-03-24 11:30',
        isSubmitted: false,
        statusValidasi: 'Belum Diverifikasi'
      }
    };
    const currentBerkas: BerkasSeminarProposal = currentProposal.berkasSeminar || defaultBerkas;
    const docTitle = docKey === 'naskahSeminar' ? 'Naskah Seminar Proposal' : 'Berita Acara Seminar Proposal';

    const updatedDoc: DokumenSeminarProposalItem = {
      ...currentBerkas[docKey],
      statusValidasi: newStatus,
      catatanValidasi:
        newStatus === 'Setujui'
          ? `Berkas ${docTitle} telah diverifikasi dan DISETUJUI.`
          : `Berkas ${docTitle} DITOLAK. Silakan unggah perbaikan berkas.`
    };

    const updatedProposal: DataProposalSeminar = {
      ...currentProposal,
      berkasSeminar: {
        ...currentBerkas,
        [docKey]: updatedDoc
      }
    };

    const updatedItem: SkripsiMahasiswaItem = {
      ...selectedSkripsi,
      proposal: updatedProposal
    };

    setSelectedSkripsi(updatedItem);
    const updatedList = skripsiList.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    setSkripsiList(updatedList);
    localStorage.setItem('sikma_skripsi_data', JSON.stringify(updatedList));

    setNotificationMsg(`Validasi ${docTitle}: status diubah menjadi "${newStatus}".`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Helper to get safe berkas persyaratan yudisium for any student
  const getStudentYudisium = (item: SkripsiMahasiswaItem): Record<string, DokumenYudisiumItem> => {
    const result: Record<string, DokumenYudisiumItem> = {};
    YUDISIUM_DOC_CONFIG.forEach((cfg) => {
      if (item.persyaratanYudisium && item.persyaratanYudisium[cfg.key]) {
        result[cfg.key] = item.persyaratanYudisium[cfg.key];
      } else {
        const cleanKey = cfg.title.replace(/[\s\+\/]+/g, '_');
        result[cfg.key] = {
          id: cfg.key,
          key: cfg.key,
          title: cfg.title,
          desc: cfg.desc,
          fileName: `${cleanKey}_${item.nim}.${cfg.defaultExt}`,
          fileSize: cfg.defaultSize,
          uploadedAt: '2026-06-25 10:00',
          isSubmitted: true,
          statusValidasi: 'Setujui',
          acceptTypes: cfg.accept
        };
      }
    });
    return result;
  };

  // Handlers for Persyaratan Yudisium (Browse, Submit, View)
  const handleYudisiumFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingYudisiumFiles((prev) => ({ ...prev, [key]: file }));
      const cfg = YUDISIUM_DOC_CONFIG.find((c) => c.key === key);
      setNotificationMsg(`File dipilih untuk ${cfg?.title || key}: "${file.name}". Klik "Submit" untuk mengunggah.`);
      setTimeout(() => setNotificationMsg(null), 3500);
    }
  };

  const handleYudisiumSubmit = (key: string) => {
    if (!selectedSkripsi) return;
    const currentYudisium = getStudentYudisium(selectedSkripsi);
    const cfg = YUDISIUM_DOC_CONFIG.find((c) => c.key === key);
    const pending = pendingYudisiumFiles[key];
    const currentDoc = currentYudisium[key];
    const cleanKey = cfg ? cfg.title.replace(/[\s\+\/]+/g, '_') : key;

    const updatedDoc: DokumenYudisiumItem = {
      ...currentDoc,
      fileName: pending ? pending.name : currentDoc?.fileName || `${cleanKey}_${selectedSkripsi.nim}.${cfg?.defaultExt || 'pdf'}`,
      fileSize: pending ? `${Math.round(pending.size / 1024)} KB` : currentDoc?.fileSize || '500 KB',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isSubmitted: true,
      statusValidasi: 'Setujui'
    };

    const updatedYudisium: Record<string, DokumenYudisiumItem> = {
      ...currentYudisium,
      [key]: updatedDoc
    };

    const updatedItem: SkripsiMahasiswaItem = {
      ...selectedSkripsi,
      persyaratanYudisium: updatedYudisium
    };

    setSelectedSkripsi(updatedItem);
    setPendingYudisiumFiles((prev) => ({ ...prev, [key]: null }));

    const updatedList = skripsiList.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    setSkripsiList(updatedList);
    localStorage.setItem('sikma_skripsi_data', JSON.stringify(updatedList));

    setNotificationMsg(`Berkas ${cfg?.title || key} berhasil disubmit!`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleYudisiumView = (key: string, index: number) => {
    if (!selectedSkripsi) return;
    const currentYudisium = getStudentYudisium(selectedSkripsi);
    const cfg = YUDISIUM_DOC_CONFIG.find((c) => c.key === key);
    if (!cfg) return;
    setPreviewYudisiumDoc({
      doc: currentYudisium[key],
      config: cfg,
      index
    });
  };

  const handleOpenBioDataModal = () => {
    if (!selectedSkripsi) return;

    const existing = selectedSkripsi.bioDataSarjana;
    if (existing) {
      setBioDataForm(existing);
    } else {
      const defaultNIK = `350704${selectedSkripsi.nim.slice(-6).padStart(6, '0')}0001`;
      const defaultIPK = selectedSkripsi.ipk ? Number(selectedSkripsi.ipk).toFixed(2) : '3.82';
      const defaultSKS = String(selectedSkripsi.jumlahSks ?? selectedSkripsi.totalSks ?? 144);
      const numIpk = parseFloat(defaultIPK);
      const defaultPredikat = numIpk >= 3.75 ? 'Dengan Pujian (Cum Laude)' : numIpk >= 3.0 ? 'Sangat Memuaskan' : 'Memuaskan';
      const defaultNilai = selectedSkripsi.nilai ? String(selectedSkripsi.nilai) : (selectedSkripsi.proposal?.nilaiProposal?.nilaiAkhir ? String(selectedSkripsi.proposal.nilaiProposal.nilaiAkhir) : '88.50');
      const isFemale = selectedSkripsi.namaMahasiswa.toLowerCase().includes('putri') ||
        selectedSkripsi.namaMahasiswa.toLowerCase().includes('siti') ||
        selectedSkripsi.namaMahasiswa.toLowerCase().includes('nur') ||
        selectedSkripsi.namaMahasiswa.toLowerCase().includes('safitri') ||
        selectedSkripsi.namaMahasiswa.toLowerCase().includes('anisa') ||
        selectedSkripsi.namaMahasiswa.toLowerCase().includes('tiara');

      setBioDataForm({
        nama: selectedSkripsi.namaMahasiswa,
        nim: selectedSkripsi.nim,
        programStudi: 'S1 Kimia',
        nik: defaultNIK,
        tanggalLahir: '2002-09-14',
        tempatLahir: 'Malang',
        jenisKelamin: isFemale ? 'Perempuan' : 'Laki-laki',
        statusPerkawinan: 'Belum Menikah',
        agama: 'Islam',
        alamat: 'Jl. Veteran No. 10, Ketawanggede, Lowokwaru, Kota Malang, Jawa Timur 65145',
        terminalCutiAkademik: '0 Semester (Tidak Pernah Cuti)',
        telepon: selectedSkripsi.noHpOrangTua || '081234567890',
        email: `${selectedSkripsi.nim}@student.ub.ac.id`,
        namaAyah: 'Bambang Sudarsono, S.E.',
        pekerjaanAyah: 'Pegawai Negeri Sipil (PNS)',
        teleponAyah: selectedSkripsi.noHpOrangTua || '081234567890',
        namaIbu: 'Siti Rahmawati, S.Pd.',
        pekerjaanIbu: 'Guru / Tenaga Pendidik',
        tanggalMulaiTA: '01 September 2025',
        tanggalLulus: selectedSkripsi.tanggal || selectedSkripsi.proposal?.tanggal || '18 Juni 2026',
        dosenPembimbing1: selectedSkripsi.dosenPembimbing1,
        dosenPembimbing2: selectedSkripsi.dosenPembimbing2 || '-',
        nilaiSkripsi: defaultNilai,
        predikatLulus: defaultPredikat,
        ipk: defaultIPK,
        sks: defaultSKS,
        lamaStudiTahun: '3',
        lamaStudiBulan: '9',
        lamaStudiHari: '15',
        judul: selectedSkripsi.judul,
        judulInggris: selectedSkripsi.judulInggris || 'Synthesis and Characterization of Novel Chemical Compounds for Sustainable Energy Applications'
      });
    }
    setIsBioDataModalOpen(true);
  };

  const handleSaveBioData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkripsi) return;

    const currentYudisium = getStudentYudisium(selectedSkripsi);
    const cfg = YUDISIUM_DOC_CONFIG.find((c) => c.key === 'bioDataSarjana');

    const updatedDoc: DokumenYudisiumItem = {
      ...(currentYudisium['bioDataSarjana'] || {}),
      id: 'bioDataSarjana',
      key: 'bioDataSarjana',
      title: 'Bio Data Sarjana',
      desc: cfg?.desc || 'Formulir biodata lengkap calon sarjana kimia untuk verifikasi ijazah dan wisuda',
      fileName: `Bio_Data_Sarjana_${bioDataForm.nim || selectedSkripsi.nim}.pdf`,
      fileSize: '650 KB',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isSubmitted: true,
      statusValidasi: 'Setujui',
      acceptTypes: '.pdf,.doc,.docx'
    };

    const updatedYudisium: Record<string, DokumenYudisiumItem> = {
      ...currentYudisium,
      bioDataSarjana: updatedDoc
    };

    const updatedItem: SkripsiMahasiswaItem = {
      ...selectedSkripsi,
      bioDataSarjana: bioDataForm,
      persyaratanYudisium: updatedYudisium
    };

    setSelectedSkripsi(updatedItem);
    const updatedList = skripsiList.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    setSkripsiList(updatedList);
    localStorage.setItem('sikma_skripsi_data', JSON.stringify(updatedList));

    setIsBioDataModalOpen(false);
    setNotificationMsg('Bio Data Sarjana berhasil di-generate dan tersimpan ke Berkas Yudisium!');
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Nilai Seminar Proposal (PRJ1) State & Handlers
  const [selectedDosenKey, setSelectedDosenKey] = useState<'Dosen 1' | 'Dosen 2' | 'Dosen 3'>('Dosen 1');
  const [generatedLinks, setGeneratedLinks] = useState<{ [key: string]: string }>({});
  const [copiedLinkKey, setCopiedLinkKey] = useState<string | null>(null);

  interface NilaiDosenDetail {
    cpmk421?: number; // Nilai Rubrik CPMK 4.2.1 (Bobot 1, Skala 1 - 4)
    cpmk422?: number; // Nilai Rubrik Metodologi Penelitian CPMK 4.2.2 (Bobot 1, Skala 1 - 4)
    cpmk821?: number; // Nilai Rubrik Etika & Standar Profesional CPMK 8.2.1 (Bobot 0.5, Skala 1 - 4)
    cpmkDiskusi?: number; // Nilai Rubrik Diskusi Proposal CPMK 4.2.1 (Bobot 5, Skala 1 - 4)
    cpmkDiskusi421?: number; // Nilai Rubrik Diskusi Proposal CPMK 4.2.1 (Bobot 5, Skala 1 - 4)
    cpmkDiskusi422?: number; // Nilai Rubrik Diskusi Metodologi, Data & Analisis CPMK 4.2.2 (Bobot 5, Skala 1 - 4)
    cpmkPresentasi?: number; // Nilai Rubrik Berkas/File Presentasi CPMK 4.2.1 (Bobot 1, Skala 1 - 4)
    cpmkPenyampaian522?: number; // Nilai Rubrik Penyampaian CPMK 5.2.2 (Bobot 1.5, Skala 1 - 4)
    materi: number; // Penguasaan Materi & Teori Kimia (CPL 4) Bobot 40%
    metodologi: number; // Metodologi Riset & Desain Eksperimen (CPL 5) Bobot 35%
    argumentasi: number; // Argumentasi Ilmiah & Tanya Jawab (CPL 8) Bobot 25%
    naskah: number; // Sistematika & Kualitas Naskah/Makalah (CPL 8) Bobot 40%
    media: number; // Penyampaian & Slide Presentasi (CPL 8) Bobot 30%
    berkas: number; // Kelengkapan Dokumen & Format Sitasi Kimia Bobot 30%
    saran: string; // Editor Saran & Pertanyaan
  }

  const [formNilaiPRJ1, setFormNilaiPRJ1] = useState<{
    statusKelulusan: 'Lulus' | 'Lulus dengan Catatan Revisi' | 'Mengulang';
    dosen1: NilaiDosenDetail;
    dosen2: NilaiDosenDetail;
    dosen3: NilaiDosenDetail;
  }>({
    statusKelulusan: 'Lulus',
    dosen1: {
      cpmk421: 4,
      cpmk422: 4,
      cpmk821: 4,
      cpmkDiskusi: 4,
      cpmkDiskusi421: 4,
      cpmkDiskusi422: 4,
      cpmkPresentasi: 4,
      cpmkPenyampaian522: 4,
      materi: 95,
      metodologi: 95,
      argumentasi: 95,
      naskah: 96,
      media: 96,
      berkas: 96,
      saran: '• Perjelas formulasi hipotesis dan tinjauan kinetika reaksi pada Bab 2.\n• Tambahkan diagram alir preparasi katalis nanopartikel pada Bab 3.\n• Perhatikan format sitasi jurnal ilmiah sesuai pedoman ACS (American Chemical Society).'
    },
    dosen2: {
      cpmk421: 3,
      cpmk422: 3,
      cpmk821: 4,
      cpmkDiskusi: 3,
      cpmkDiskusi421: 3,
      cpmkDiskusi422: 3,
      cpmkPresentasi: 3,
      cpmkPenyampaian522: 3,
      materi: 85,
      metodologi: 84,
      argumentasi: 86,
      naskah: 84,
      media: 84,
      berkas: 84,
      saran: '• Jelaskan kontrol variabel suhu kalsinasi dan pengaruhnya terhadap kristalinitas sampel.\n• Lengkapi tabel spesifikasi instrumen karakterisasi (XRD, FTIR, SEM-EDX).'
    },
    dosen3: {
      cpmk421: 4,
      cpmk422: 4,
      cpmk821: 4,
      cpmkDiskusi: 4,
      cpmkDiskusi421: 4,
      cpmkDiskusi422: 4,
      cpmkPresentasi: 4,
      cpmkPenyampaian522: 4,
      materi: 90,
      metodologi: 90,
      argumentasi: 90,
      naskah: 96,
      media: 96,
      berkas: 96,
      saran: '• Kuasai kembali teori dasar spektroskopi UV-Vis untuk uji adsorpsi zat warna azo.\n• Pastikan naskah revisi proposal dikumpulkan maksimal 10 hari kerja setelah seminar.'
    }
  });

  // Helper calculations for PRJ1 rubric
  const calcDosenDiskusi = (d: NilaiDosenDetail): number => {
    const cpmk1Val = d.cpmk421 || 4;
    const cpmk1Score = cpmk1Val === 4 ? 96 : cpmk1Val === 3 ? 84 : cpmk1Val === 2 ? 70 : 55;
    const cpmk2Val = d.cpmk422 || 4;
    const cpmk2Score = cpmk2Val === 4 ? 96 : cpmk2Val === 3 ? 84 : cpmk2Val === 2 ? 70 : 55;
    const cpmk3Val = d.cpmk821 || 4;
    const cpmk3Score = cpmk3Val === 4 ? 96 : cpmk3Val === 3 ? 84 : cpmk3Val === 2 ? 70 : 55;
    // Total bobot Naskah Proposal: CPMK 4.2.1 (Bobot 1.0) + CPMK 4.2.2 (Bobot 1.0) + CPMK 8.2.1 (Bobot 0.5) = 2.5
    return Math.round(((cpmk1Score * 1.0 + cpmk2Score * 1.0 + cpmk3Score * 0.5) / 2.5) * 100) / 100;
  };

  const calcDosenDiskusiProposal = (d: NilaiDosenDetail): number => {
    const disk1Val = d.cpmkDiskusi421 || d.cpmkDiskusi || 4;
    const disk1Score = disk1Val === 4 ? 96 : disk1Val === 3 ? 84 : disk1Val === 2 ? 70 : 55;
    const disk2Val = d.cpmkDiskusi422 || 4;
    const disk2Score = disk2Val === 4 ? 96 : disk2Val === 3 ? 84 : disk2Val === 2 ? 70 : 55;
    // Total bobot Diskusi Proposal: CPMK 4.2.1 (Bobot 5) + CPMK 4.2.2 (Bobot 5) = 10
    return Math.round(((disk1Score * 5 + disk2Score * 5) / 10) * 100) / 100;
  };

  const calcDosenPresentasiBerkas = (d: NilaiDosenDetail): number => {
    const presVal = d.cpmkPresentasi || 4;
    const presScore = presVal === 4 ? 96 : presVal === 3 ? 84 : presVal === 2 ? 70 : 55;
    const nyampaiVal = d.cpmkPenyampaian522 || 4;
    const nyampaiScore = nyampaiVal === 4 ? 96 : nyampaiVal === 3 ? 84 : nyampaiVal === 2 ? 70 : 55;
    // Total bobot Presentasi dan Berkas: Berkas/File Presentasi CPMK 4.2.1 (Bobot 1.0) + Penyampaian CPMK 5.2.2 (Bobot 1.5) = 2.5
    return Math.round(((presScore * 1.0 + nyampaiScore * 1.5) / 2.5) * 100) / 100;
  };

  const calcDosenTotal = (d: NilaiDosenDetail): number => {
    const naskah = calcDosenDiskusi(d);
    const diskusi = calcDosenDiskusiProposal(d);
    const pres = calcDosenPresentasiBerkas(d);
    return Math.round((naskah * 0.40 + diskusi * 0.40 + pres * 0.20) * 100) / 100;
  };

  const handleGenerateLink = (dosenKey: 'Dosen 1' | 'Dosen 2' | 'Dosen 3', namaDosen: string) => {
    const code = dosenKey === 'Dosen 1' ? 'd1' : dosenKey === 'Dosen 2' ? 'd2' : 'd3';
    const link = `https://sikma.kimia.ac.id/eval/prj1/proposal/${selectedSkripsi?.nim || '225090200111001'}?dosen=${code}&auth=${btoa(`${code}-${selectedSkripsi?.id || 'skr'}`).substring(0, 12)}`;
    setGeneratedLinks((prev) => ({ ...prev, [dosenKey]: link }));
    setCopiedLinkKey(dosenKey);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    setNotificationMsg(`Link evaluasi ${dosenKey} (${namaDosen}) berhasil digenerate dan disalin ke clipboard!`);
    setTimeout(() => {
      setCopiedLinkKey(null);
      setNotificationMsg(null);
    }, 4000);
  };

  const handleOpenNilaiModal = () => {
    if (!selectedSkripsi) return;
    const currentProposal = getStudentProposal(selectedSkripsi);
    const n = currentProposal.nilaiProposal;
    setSelectedDosenKey('Dosen 1');

    if (n) {
      setFormNilaiPRJ1({
        statusKelulusan: (n.statusKelulusan as any) || 'Lulus',
        dosen1: {
          cpmk421: 4,
          cpmk422: 4,
          cpmk821: 4,
          cpmkDiskusi: 4,
          cpmkDiskusi421: 4,
          cpmkDiskusi422: 4,
          cpmkPresentasi: 4,
          cpmkPenyampaian522: 4,
          materi: n.nilaiDosen1 ?? n.nilaiPembimbing1 ?? 95,
          metodologi: 95,
          argumentasi: 95,
          naskah: 96,
          media: 96,
          berkas: 96,
          saran: n.catatanDosen1 || n.catatanRevisi || '• Perjelas formulasi hipotesis dan tinjauan kinetika reaksi pada Bab 2.\n• Tambahkan diagram alir preparasi katalis nanopartikel pada Bab 3.'
        },
        dosen2: {
          cpmk421: 3,
          cpmk422: 3,
          cpmk821: 4,
          cpmkDiskusi: 3,
          cpmkDiskusi421: 3,
          cpmkDiskusi422: 3,
          cpmkPresentasi: 3,
          cpmkPenyampaian522: 3,
          materi: n.nilaiDosen2 ?? n.nilaiPembimbing2 ?? 85,
          metodologi: 84,
          argumentasi: 86,
          naskah: 84,
          media: 84,
          berkas: 84,
          saran: n.catatanDosen2 || '• Jelaskan kontrol variabel suhu kalsinasi dan pengaruhnya terhadap kristalinitas sampel.\n• Lengkapi tabel spesifikasi instrumen karakterisasi (XRD, FTIR, SEM-EDX).'
        },
        dosen3: {
          cpmk421: 4,
          cpmk422: 4,
          cpmk821: 4,
          cpmkDiskusi: 4,
          cpmkDiskusi421: 4,
          cpmkDiskusi422: 4,
          cpmkPresentasi: 4,
          cpmkPenyampaian522: 4,
          materi: n.nilaiDosen3 ?? n.nilaiPenguji1 ?? 90,
          metodologi: 90,
          argumentasi: 90,
          naskah: 96,
          media: 96,
          berkas: 96,
          saran: n.catatanDosen3 || '• Kuasai kembali teori dasar spektroskopi UV-Vis untuk uji adsorpsi zat warna azo.\n• Pastikan naskah revisi proposal dikumpulkan maksimal 10 hari kerja setelah seminar.'
        }
      });
    }
    setIsNilaiModalOpen(true);
  };

  const handleSaveNilai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkripsi) return;

    const tot1 = calcDosenTotal(formNilaiPRJ1.dosen1);
    const tot2 = calcDosenTotal(formNilaiPRJ1.dosen2);
    const tot3 = calcDosenTotal(formNilaiPRJ1.dosen3);
    const avg = Math.round(((tot1 + tot2 + tot3) / 3) * 100) / 100;

    let grade = 'E';
    if (avg >= 80) grade = 'A';
    else if (avg >= 75) grade = 'B+';
    else if (avg >= 70) grade = 'B';
    else if (avg >= 65) grade = 'C+';
    else if (avg >= 60) grade = 'C';
    else if (avg >= 50) grade = 'D';

    const currentProposal = getStudentProposal(selectedSkripsi);
    const combinedNotes = `Catatan Dosen 1:\n${formNilaiPRJ1.dosen1.saran}\n\nCatatan Dosen 2:\n${formNilaiPRJ1.dosen2.saran}\n\nCatatan Dosen 3:\n${formNilaiPRJ1.dosen3.saran}`;

    const updatedProposal: DataProposalSeminar = {
      ...currentProposal,
      nilaiProposal: {
        nilaiPembimbing1: tot1,
        nilaiPembimbing2: tot2,
        nilaiPenguji1: tot3,
        nilaiDosen1: tot1,
        nilaiDosen2: tot2,
        nilaiDosen3: tot3,
        catatanDosen1: formNilaiPRJ1.dosen1.saran,
        catatanDosen2: formNilaiPRJ1.dosen2.saran,
        catatanDosen3: formNilaiPRJ1.dosen3.saran,
        nilaiAkhir: avg,
        grade,
        statusKelulusan: formNilaiPRJ1.statusKelulusan,
        catatanRevisi: combinedNotes,
        tanggalPenilaian: new Date().toISOString().substring(0, 10)
      }
    };

    const updatedItem: SkripsiMahasiswaItem = {
      ...selectedSkripsi,
      proposal: updatedProposal
    };

    setSelectedSkripsi(updatedItem);
    const updatedList = skripsiList.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    setSkripsiList(updatedList);
    localStorage.setItem('sikma_skripsi_data', JSON.stringify(updatedList));

    setIsNilaiModalOpen(false);
    setNotificationMsg('Nilai Proposal (PRJ1) & Catatan Tiga Dosen berhasil disimpan!');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Add Modal State (Admin / Dosen / Mahasiswa)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formNim, setFormNim] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formLab, setFormLab] = useState<LabRiset>('Laboratorium Kimia Organik & Bahan Alam');
  const [formPembimbing1, setFormPembimbing1] = useState('Masruri, S.Si., M.Si., Ph.D');
  const [formPembimbing2, setFormPembimbing2] = useState('');
  const [formPenguji, setFormPenguji] = useState("Prof. Dr. Aulanni'am, drh., DES");
  const [formTahapan, setFormTahapan] = useState<'Mendaftar' | 'Proposal' | 'Kemajuan' | 'Ujian Akhir Skripsi'>('Mendaftar');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Gagal'>('Aktif');
  const [formSemester, setFormSemester] = useState(7);
  const [formNamaSemester, setFormNamaSemester] = useState('Ganjil 2026 / 2027');
  const [formIpk, setFormIpk] = useState(3.82);
  const [formJumlahSks, setFormJumlahSks] = useState(123);
  const [formNoHpOrtu, setFormNoHpOrtu] = useState('081234567890');
  const [formJudul, setFormJudul] = useState('');
  const [formCatatan, setFormCatatan] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // List Tambahan Jadwal & Nilai (Tanggal, Jam (rentang waktu), Lokasi, Link Daring, Nilai)
  const [formTanggal, setFormTanggal] = useState('24 Maret 2026');
  const [formJam, setFormJam] = useState('09:00 - 11:00 WIB');
  const [formLokasi, setFormLokasi] = useState('Ruang Seminar Gedung Kimia Lt. 2 (R. 204)');
  const [formLinkDaring, setFormLinkDaring] = useState('https://meet.google.com/kim-prop-ub26');
  const [formNilai, setFormNilai] = useState('86.50');

  const labOptions: LabRiset[] = [
    'Laboratorium Kimia Organik & Bahan Alam',
    'Laboratorium Kimia Anorganik & Material',
    'Laboratorium Kimia Analitik & Instrumentasi',
    'Laboratorium Kimia Fisik & Elektrokimia',
    'Laboratorium Biokimia & Enzim',
    'Laboratorium Kimia Lingkungan'
  ];

  const tahapanOptions: (SkripsiMahasiswaItem['tahapan'] | string)[] = [
    'Mendaftar',
    'Proposal',
    'Kemajuan',
    'Ujian Akhir Skripsi',
    'Belum Mengambil',
    'Pengajuan Judul',
    'Seminar Proposal',
    'Penelitian Laboratorium',
    'Seminar Hasil',
    'Ujian Skripsi',
    'Revisi & Bebas Lab',
    'Selesai / Lulus'
  ];

  const statusOptions: (SkripsiMahasiswaItem['status'] | string)[] = [
    'Aktif',
    'Gagal',
    'Revisi',
    'Selesai',
    'Menunggu Verifikasi',
    'Pengajuan'
  ];

  // Filtered List
  const filteredList = useMemo(() => {
    return skripsiList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.nim.toLowerCase().includes(q) ||
        item.namaMahasiswa.toLowerCase().includes(q) ||
        item.judul.toLowerCase().includes(q) ||
        item.dosenPembimbing1.toLowerCase().includes(q) ||
        (item.dosenPembimbing2 && item.dosenPembimbing2.toLowerCase().includes(q)) ||
        item.bidangMinat.toLowerCase().includes(q);

      const matchLab = filterLab === 'Semua' || item.bidangMinat === filterLab;
      const matchTahapan = filterTahapan === 'Semua' || item.tahapan === filterTahapan;
      const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;

      return matchSearch && matchLab && matchTahapan && matchStatus;
    });
  }, [skripsiList, searchQuery, filterLab, filterTahapan, filterStatus]);

  // Paginated List
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleOpenAdd = () => {
    setFormNim(student ? student.nim : '');
    setFormNama(student ? student.nama : '');
    setFormLab(student?.labPenelitian || 'Laboratorium Kimia Organik & Bahan Alam');
    setFormPembimbing1(student?.dosenPembimbing1Nama || dosenNameOptions[0] || 'Masruri, S.Si., M.Si., Ph.D');
    setFormPembimbing2(student?.dosenPembimbing2Nama || '');
    setFormPenguji(dosenNameOptions[2] || "Prof. Dr. Aulanni'am, drh., DES");
    setFormJudul(student?.judulSkripsi || '');
    setFormTahapan('Mendaftar');
    setFormStatus('Aktif');
    setFormSemester(student?.semester || 7);
    setFormNamaSemester(activeSemesterFromDb?.namaSemester || 'Ganjil 2026 / 2027');
    setFormIpk(student?.ipk || 3.82);
    setFormJumlahSks(student?.totalSks || 123);
    setFormNoHpOrtu('081234567890');
    setFormCatatan('');
    // Reset list tambahan
    setFormTanggal('24 Maret 2026');
    setFormJam('09:00 - 11:00 WIB');
    setFormLokasi('Ruang Seminar Gedung Kimia Lt. 2 (R. 204)');
    setFormLinkDaring('https://meet.google.com/kim-prop-ub26');
    setFormNilai('86.50');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSubmitSkripsi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNim.trim() || !formNama.trim() || !formJudul.trim() || !formPembimbing1.trim()) {
      setFormError('Harap lengkapi semua field yang wajib diisi (*).');
      return;
    }

    const parsedNilaiNum = parseFloat(formNilai) || 86.5;

    const newItem: SkripsiMahasiswaItem = {
      id: `skr-${Date.now()}`,
      nim: formNim.trim(),
      namaMahasiswa: formNama.trim(),
      bidangMinat: formLab,
      dosenPembimbing1: formPembimbing1.trim(),
      dosenPembimbing2: formPembimbing2.trim() || undefined,
      dosenPenguji: formPenguji.trim() || undefined,
      noHpOrangTua: formNoHpOrtu.trim() || undefined,
      judul: formJudul.trim(),
      tahapan: formTahapan,
      status: formStatus,
      semester: Number(formSemester) || 7,
      namaSemester: formNamaSemester,
      ipk: Number(formIpk) || 3.82,
      jumlahSks: Number(formJumlahSks) || 123,
      totalSks: Number(formJumlahSks) || 123,
      angkatan: formNim.startsWith('21') ? '2021' : formNim.startsWith('20') ? '2020' : '2022',
      tanggalMulai: new Date().toISOString().split('T')[0],
      catatanKemajuan: formCatatan.trim() || 'Pengajuan judul dan usulan skripsi baru.',
      // List tambahan jadwal & nilai
      tanggal: formTanggal.trim(),
      jam: formJam.trim(),
      lokasi: formLokasi.trim(),
      linkDaring: formLinkDaring.trim(),
      nilai: formNilai.trim() || '86.50',
      proposal: {
        tanggal: formTanggal.trim(),
        jam: formJam.trim(),
        lokasi: formLokasi.trim(),
        linkDaring: formLinkDaring.trim(),
        dosenPenguji1: formPenguji.trim() || undefined,
        dosenPenguji2: formPembimbing2.trim() || undefined,
        berkasSeminar: {
          naskahSeminar: {
            fileName: `Naskah_Seminar_Proposal_${formNim.trim()}.pdf`,
            fileSize: '2.4 MB',
            uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            isSubmitted: true,
            statusValidasi: 'Setujui',
            catatanValidasi: 'Naskah seminar proposal disetujui untuk diseminarkan.'
          },
          beritaAcara: {
            fileName: `Berita_Acara_Seminar_Proposal_${formNim.trim()}.pdf`,
            fileSize: '820 KB',
            uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            isSubmitted: true,
            statusValidasi: 'Setujui',
            catatanValidasi: 'Berita acara telah diverifikasi oleh tim penguji.'
          }
        },
        nilaiProposal: {
          nilaiPembimbing1: parsedNilaiNum + 1.5,
          nilaiPembimbing2: parsedNilaiNum - 0.5,
          nilaiPenguji1: parsedNilaiNum - 1.5,
          nilaiPenguji2: parsedNilaiNum + 0.5,
          nilaiAkhir: parsedNilaiNum,
          grade: parsedNilaiNum >= 80 ? 'A' : parsedNilaiNum >= 75 ? 'B+' : parsedNilaiNum >= 70 ? 'B' : 'C+',
          statusKelulusan: 'Lulus',
          catatanRevisi: 'Disetujui untuk melanjutkan ke tahap penelitian.',
          tanggalPenilaian: new Date().toISOString().substring(0, 10)
        }
      },
      kemajuan: {
        tanggal: formTanggal.trim(),
        jam: formJam.trim(),
        lokasi: formLokasi.trim(),
        linkDaring: formLinkDaring.trim(),
        nilaiProposal: {
          nilaiPembimbing1: parsedNilaiNum,
          nilaiPenguji1: parsedNilaiNum,
          nilaiAkhir: parsedNilaiNum,
          grade: parsedNilaiNum >= 80 ? 'A' : 'B+',
          statusKelulusan: 'Lulus',
          catatanRevisi: 'Progres laboratorium berjalan sesuai target rencana kerja.',
          tanggalPenilaian: new Date().toISOString().substring(0, 10)
        }
      },
      ujianAkhir: {
        tanggal: formTanggal.trim(),
        jam: formJam.trim(),
        lokasi: formLokasi.trim(),
        linkDaring: formLinkDaring.trim(),
        nilaiProposal: {
          nilaiPembimbing1: parsedNilaiNum,
          nilaiPenguji1: parsedNilaiNum,
          nilaiAkhir: parsedNilaiNum,
          grade: parsedNilaiNum >= 80 ? 'A' : 'B+',
          statusKelulusan: 'Lulus',
          catatanRevisi: 'Sidang sarjana kimia selesai dengan predikat memuaskan.',
          tanggalPenilaian: new Date().toISOString().substring(0, 10)
        }
      }
    };

    const updated = [newItem, ...skripsiList];
    setSkripsiList(updated);
    localStorage.setItem('sikma_skripsi_data', JSON.stringify(updated));
    setIsAddModalOpen(false);
    setNotificationMsg(`Usulan Skripsi untuk mahasiswa ${newItem.namaMahasiswa} (${newItem.nim}) berhasil ditambahkan!`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const getTahapanBadgeClass = (tahapan: SkripsiMahasiswaItem['tahapan']) => {
    switch (tahapan) {
      case 'Mendaftar':
      case 'Pengajuan Judul':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Proposal':
      case 'Seminar Proposal':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Kemajuan':
      case 'Penelitian Laboratorium':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Seminar Hasil':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Ujian Akhir Skripsi':
      case 'Ujian Skripsi':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Revisi & Bebas Lab':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Selesai / Lulus':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeClass = (status: SkripsiMahasiswaItem['status']) => {
    switch (status) {
      case 'Aktif':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Gagal':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      case 'Revisi':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Selesai':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Menunggu Verifikasi':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Pengajuan':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#002B49] border border-blue-200">
                  Departemen Kimia FSTeM UB
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Total {skripsiList.length} Mahasiswa
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Data Skripsi & Tugas Akhir Mahasiswa
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring progres pengerjaan skripsi, bidang minat laboratorium, dosen pembimbing, dan tahapan tugas akhir mahasiswa S1 Kimia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Usulan Skripsi</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Penelitian Laboratorium</span>
            <div className="text-lg font-bold text-[#002B49] mt-0.5">
              {skripsiList.filter((s) => s.tahapan === 'Penelitian Laboratorium').length}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Seminar Proposal / Hasil</span>
            <div className="text-lg font-bold text-blue-700 mt-0.5">
              {skripsiList.filter((s) => s.tahapan === 'Seminar Proposal' || s.tahapan === 'Seminar Hasil').length}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Ujian Skripsi / Sidang</span>
            <div className="text-lg font-bold text-purple-700 mt-0.5">
              {skripsiList.filter((s) => s.tahapan === 'Ujian Skripsi').length}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Selesai / Lulus Yudisium</span>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">
              {skripsiList.filter((s) => s.tahapan === 'Selesai / Lulus').length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari NIM, Nama Mahasiswa, Judul, Pembimbing..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#002B49]"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Lab Filter */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-semibold text-[11px]">Lab:</span>
                <select
                  value={filterLab}
                  onChange={(e) => {
                    setFilterLab(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                >
                  <option value="Semua">Semua Lab</option>
                  {labOptions.map((lab) => (
                    <option key={lab} value={lab}>
                      {lab.replace('Laboratorium ', '')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahapan Filter */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-semibold text-[11px]">Tahapan:</span>
                <select
                  value={filterTahapan}
                  onChange={(e) => {
                    setFilterTahapan(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                >
                  <option value="Semua">Semua Tahapan</option>
                  {tahapanOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-semibold text-[11px]">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                >
                  <option value="Semua">Semua Status</option>
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table List with horizontal scroll */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <table className="w-full min-w-[1100px] table-fixed text-left text-xs divide-y divide-slate-100">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
              <col className="w-[13%]" />
              <col className="w-[15%]" />
              <col className="w-[24%]" />
              <col className="w-[9%]" />
              <col className="w-[5%]" />
              <col className="w-[5%]" />
            </colgroup>
            <thead className="bg-[#002B49] text-white">
              <tr className="text-[11px] font-semibold tracking-wide">
                <th className="py-3 px-2 text-center text-slate-300">No</th>
                <th className="py-3 px-2.5 text-left">NIM</th>
                <th className="py-3 px-2.5 text-left">Nama Mahasiswa</th>
                <th className="py-3 px-2.5 text-left">Bidang Minat</th>
                <th className="py-3 px-2.5 text-left">Dosen Pembimbing</th>
                <th className="py-3 px-3 text-left">Judul</th>
                <th className="py-3 px-2 text-center">Tahapan</th>
                <th className="py-3 px-1.5 text-center">Status</th>
                <th className="py-3 px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada data skripsi mahasiswa yang sesuai kriteria pencarian atau filter.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-2 text-center text-slate-400 font-mono text-[11px]">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-2.5">
                        <span className="font-mono font-bold text-slate-800 text-[11px] tracking-tight block truncate" title={item.nim}>
                          {item.nim}
                        </span>
                      </td>
                      <td className="py-3 px-2.5">
                        <div className="font-bold text-slate-900 text-xs leading-snug line-clamp-2" title={item.namaMahasiswa}>
                          {item.namaMahasiswa}
                        </div>
                      </td>
                      <td className="py-3 px-2.5">
                        <div className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-snug">
                          <FlaskConical className="w-3.5 h-3.5 text-[#002B49] flex-shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-800 line-clamp-2" title={item.bidangMinat}>
                            {item.bidangMinat.replace('Laboratorium ', '')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2.5">
                        <div className="space-y-0.5 leading-tight">
                          <div className="font-semibold text-slate-800 text-[11px] truncate" title={item.dosenPembimbing1}>
                            {item.dosenPembimbing1}
                          </div>
                          {item.dosenPembimbing2 && (
                            <div className="text-[10px] text-slate-500 truncate" title={item.dosenPembimbing2}>
                              <span className="text-slate-400 font-medium">P2:</span> {item.dosenPembimbing2}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div
                          className="text-xs text-slate-800 leading-snug line-clamp-2 cursor-pointer hover:text-[#002B49] transition-colors"
                          title={item.judul}
                          onClick={() => handleOpenDetail(item)}
                        >
                          {item.judul}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border truncate max-w-full ${getTahapanBadgeClass(
                            item.tahapan
                          )}`}
                          title={item.tahapan}
                        >
                          {item.tahapan}
                        </span>
                      </td>
                      <td className="py-3 px-1.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold truncate max-w-full ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="px-2.5 py-1.5 bg-[#002B49] text-white hover:bg-[#003865] rounded-md text-[11px] font-semibold shadow-2xs inline-flex items-center gap-1 transition-all hover:scale-105 cursor-pointer"
                          title="Lihat Detail & Berkas Pendaftaran"
                        >
                          <Eye className="w-3 h-3 text-[#D4AF37]" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-800">
              {filteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong>{' '}
            sampai{' '}
            <strong className="text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredList.length)}
            </strong>{' '}
            dari <strong className="text-slate-800">{filteredList.length}</strong> mahasiswa skripsi
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-md border border-slate-300 ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-100'
                  : 'bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-md border border-slate-300 ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed bg-slate-100'
                  : 'bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL SKRIPSI (FORM YANG TERDIRI DARI BOX DETAIL SKRIPSI DAN BOX TAHAPAN SKRIPSI) */}
      {selectedSkripsi && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-300 shadow-2xl p-5 sm:p-7 space-y-6 animate-fadeIn my-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shadow-md">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-slate-900">Rincian Skripsi & Tugas Akhir Mahasiswa</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTahapanBadgeClass(selectedSkripsi.tahapan)}`}>
                      {selectedSkripsi.tahapan}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(selectedSkripsi.status)}`}>
                      {selectedSkripsi.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Departemen Kimia FSTeM Universitas Brawijaya • Mahasiswa:{' '}
                    <strong className="text-slate-800">{selectedSkripsi.namaMahasiswa}</strong>{' '}
                    <span className="font-mono text-slate-600">({selectedSkripsi.nim})</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSkripsi(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DUA BOX UTAMA: BOX DETAIL SKRIPSI & BOX TAHAPAN SKRIPSI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* ======================================================== */}
              {/* BOX 1: DETAIL SKRIPSI */}
              {/* ======================================================== */}
              <div className="lg:col-span-6 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Header Box Detail Skripsi + Button Edit Skripsi (Dekat Judul) */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shadow-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Detail Skripsi</h4>
                        <p className="text-[10px] text-slate-500">Informasi pokok tugas akhir mahasiswa</p>
                      </div>
                    </div>

                    {/* BUTTON EDIT SKRIPSI (DEKAT JUDUL DETAIL SKRIPSI) */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedSkripsi)}
                      className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                      title="Edit Data Skripsi Mahasiswa"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Edit Skripsi</span>
                    </button>
                  </div>

                  {/* LIST DETAIL SKRIPSI (9 ITEMS):
                      1. Tahapan Skripsi
                      2. Judul
                      3. Judul (in English)
                      4. Dosen Pembimbing 1
                      5. Dosen Pembimbing 2
                      6. Semester
                      7. Bidang Minat
                      8. IPK
                      9. Jumlah SKS
                  */}
                  <div className="divide-y divide-slate-200/80 text-xs">
                    {/* 1. Tahapan Skripsi */}
                    <div className="py-2.5 flex items-start justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-36 flex-shrink-0">Tahapan Skripsi</span>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getTahapanBadgeClass(selectedSkripsi.tahapan)}`}>
                          {selectedSkripsi.tahapan}
                        </span>
                      </div>
                    </div>

                    {/* 2. Judul */}
                    <div className="py-2.5 flex flex-col gap-1">
                      <span className="text-slate-500 font-semibold">Judul</span>
                      <div className="font-semibold text-slate-900 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                        {selectedSkripsi.judul}
                      </div>
                    </div>

                    {/* 3. Judul (in English) */}
                    <div className="py-2.5 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">Judul (in English)</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 uppercase">EN</span>
                      </div>
                      <div className="italic text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-blue-100 text-xs shadow-2xs">
                        {selectedSkripsi.judulInggris || 'Not specified / belum diisi'}
                      </div>
                    </div>

                    {/* 4. Dosen Pembimbing 1 */}
                    <div className="py-2.5 flex items-start justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-36 flex-shrink-0">Dosen Pembimbing 1</span>
                      <div className="font-bold text-slate-900 text-right">
                        {selectedSkripsi.dosenPembimbing1}
                      </div>
                    </div>

                    {/* 5. Dosen Pembimbing 2 */}
                    <div className="py-2.5 flex items-start justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-36 flex-shrink-0">Dosen Pembimbing 2</span>
                      <div className="font-semibold text-slate-800 text-right">
                        {selectedSkripsi.dosenPembimbing2 || <span className="text-slate-400 font-normal italic">-</span>}
                      </div>
                    </div>

                    {/* Dosen Penguji (Database Dosen) */}
                    <div className="py-2.5 flex items-start justify-between gap-3">
                      <div className="w-36 flex-shrink-0">
                        <span className="text-slate-500 font-semibold block">Dosen Penguji</span>
                        <span className="text-[10px] text-slate-400 font-normal">Database Dosen</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-right">
                        {selectedSkripsi.dosenPenguji || selectedSkripsi.proposal?.dosenPenguji1 || <span className="text-slate-400 font-normal italic">-</span>}
                      </div>
                    </div>

                    {/* No Handphone Orang Tua */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-36 flex-shrink-0">No HP Orang Tua</span>
                      <div className="text-right flex items-center justify-end gap-1.5 font-mono text-slate-800 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedSkripsi.noHpOrangTua || '081234567890'}</span>
                      </div>
                    </div>

                    {/* Status Skripsi */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-36 flex-shrink-0">Status</span>
                      <div className="text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            selectedSkripsi.status === 'Gagal'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {selectedSkripsi.status || 'Aktif'}
                        </span>
                      </div>
                    </div>

                    {/* 6. Semester (Diambil dari Database Semester) */}
                    {(() => {
                      // Ambil dari database Semester berdasarkan namaSemester mahasiswa atau active semester
                      const matchedSemester =
                        semesterDatabase.find(
                          (s) =>
                            s.namaSemester === selectedSkripsi.namaSemester ||
                            (selectedSkripsi.namaSemester &&
                              s.namaSemester.toLowerCase() === selectedSkripsi.namaSemester.toLowerCase())
                        ) ||
                        activeSemesterFromDb ||
                        semesterDatabase[0];

                      const displaySemesterName =
                        selectedSkripsi.namaSemester ||
                        matchedSemester?.namaSemester ||
                        (selectedSkripsi.semester ? `Semester ${selectedSkripsi.semester}` : 'Ganjil 2026 / 2027');

                      const semNumber = selectedSkripsi.semester ?? (matchedSemester?.tipe === 'Ganjil' ? 7 : 8);

                      return (
                        <div className="py-2.5 flex items-start justify-between gap-3">
                          <div className="w-36 flex-shrink-0">
                            <span className="text-slate-500 font-semibold block">Semester</span>
                            <span className="text-[10px] text-slate-400 font-normal">Database Semester</span>
                          </div>
                          <div className="text-right space-y-0.5">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs">
                                Semester {semNumber}
                              </span>
                              <span className="text-slate-400 font-light">•</span>
                              <span className="font-bold text-[#002B49] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1 shadow-2xs">
                                <Calendar className="w-3 h-3 text-[#002B49]" />
                                {displaySemesterName}
                              </span>
                            </div>
                            {matchedSemester && (
                              <div className="flex items-center justify-end gap-1.5 text-[10px]">
                                <span
                                  className={`px-1.5 py-0.2 rounded-full font-semibold ${
                                    matchedSemester.status === 'Aktif'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : matchedSemester.status === 'Arsip'
                                      ? 'bg-slate-200 text-slate-700'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {matchedSemester.status === 'Aktif' ? 'Semester Aktif' : matchedSemester.status}
                                </span>
                                <span className="text-slate-400">T.A. {matchedSemester.tahunAjaran}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 7. Bidang Minat */}
                    <div className="py-2.5 flex items-start justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-36 flex-shrink-0">Bidang Minat</span>
                      <div className="font-semibold text-slate-900 text-right flex items-center justify-end gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-[#002B49] flex-shrink-0" />
                        <span>{selectedSkripsi.bidangMinat}</span>
                      </div>
                    </div>

                    {/* 8. IPK */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-36 flex-shrink-0">IPK</span>
                      <div>
                        <span className="font-mono font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300 text-xs">
                          {selectedSkripsi.ipk ? Number(selectedSkripsi.ipk).toFixed(2) : '3.82'}
                        </span>
                      </div>
                    </div>

                    {/* 9. Jumlah SKS */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-36 flex-shrink-0">Jumlah SKS</span>
                      <div>
                        <span className="font-mono font-bold text-blue-900 bg-blue-100/80 px-2.5 py-0.5 rounded-md border border-blue-300 text-xs">
                          {selectedSkripsi.jumlahSks ?? selectedSkripsi.totalSks ?? 123} SKS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* BOX 2: TAHAPAN SKRIPSI */}
              {/* ======================================================== */}
              <div className="lg:col-span-6 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Header Box Tahapan Skripsi */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold shadow-xs">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Tahapan Skripsi</h4>
                        <p className="text-[10px] text-slate-500">Pilih tahapan untuk melihat alur dan berkas</p>
                      </div>
                    </div>
                  </div>

                  {/* BUTTONS TAHAPAN SKRIPSI: (Pendaftaran, Proposal, Kemajuan, Ujian Akhir Skripsi, Persyaratan Yudisium) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                    {[
                      { id: 'Pendaftaran' as const, label: 'Pendaftaran', icon: FolderOpen },
                      { id: 'Proposal' as const, label: 'Proposal', icon: FileText },
                      { id: 'Kemajuan' as const, label: 'Kemajuan', icon: FlaskConical },
                      { id: 'Ujian Akhir Skripsi' as const, label: 'Ujian Akhir Skripsi', icon: GraduationCap },
                      { id: 'Persyaratan Yudisium' as const, label: 'Persyaratan Yudisium', icon: Award }
                    ].map((stage) => {
                      const isActive = activeTahapanTab === stage.id;
                      const IconComponent = stage.icon;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setActiveTahapanTab(stage.id)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 border text-center cursor-pointer ${
                            isActive
                              ? 'bg-[#002B49] text-white border-[#002B49] shadow-md ring-2 ring-[#002B49]/20'
                              : 'bg-white hover:bg-slate-100/90 text-slate-700 border-slate-200'
                          }`}
                        >
                          <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-slate-500'}`} />
                          <span className="leading-tight text-[10px]">{stage.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* KONTEN BERDASARKAN BUTTON TAHAPAN YANG AKTIF */}
                  {activeTahapanTab === 'Pendaftaran' && (
                    <div className="space-y-3.5 pt-1">
                      {/* INFORMASI: TOTAL NILAI D KURANG DARI 10% & BUTTON BERKAS PENDAFTARAN (WARNA HIJAU) */}
                      <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 rounded-xl border border-emerald-300 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 uppercase tracking-wide">
                                  Syarat Kelayakan
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                                  Memenuhi Syarat
                                </span>
                              </div>
                              <h5 className="font-bold text-xs text-emerald-950 mt-1 flex items-center gap-1.5">
                                <span>Total Nilai D kurang dari 10%</span>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              </h5>
                              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                                Akumulasi SKS: <strong>{selectedSkripsi.jumlahSks ?? selectedSkripsi.totalSks ?? 123} SKS</strong> | Nilai D:{' '}
                                <strong>{selectedSkripsi.sksNilaiD ?? 0} SKS</strong> (
                                <strong>{selectedSkripsi.persentaseNilaiD ?? 0}%</strong>) — Batas toleransi nilai D &lt; 10%.
                              </p>
                            </div>
                          </div>

                          {/* Button Berkas Pendaftaran warna hijau */}
                          <button
                            type="button"
                            onClick={() => setIsBerkasModalOpen(true)}
                            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all flex-shrink-0 cursor-pointer"
                          >
                            <FolderOpen className="w-4 h-4 text-emerald-100" />
                            <span>Berkas Pendaftaran</span>
                          </button>
                        </div>
                      </div>

                      {/* Ringkasan Status 4 Dokumen Pendaftaran */}
                      {(() => {
                        const berkas = getStudentBerkas(selectedSkripsi);
                        const docsSummary = [
                          { label: 'Formulir', item: berkas.formulir },
                          { label: 'Transkrip', item: berkas.transkrip },
                          { label: 'KRS', item: berkas.krs },
                          { label: 'FIDK', item: berkas.fidk }
                        ];
                        return (
                          <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 pb-1.5 border-b border-slate-100">
                              <span>Status 4 Berkas Pendaftaran:</span>
                              <button
                                type="button"
                                onClick={() => setIsBerkasModalOpen(true)}
                                className="text-emerald-700 hover:text-emerald-800 text-[10px] font-bold underline cursor-pointer"
                              >
                                Kelola &amp; Validasi
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {docsSummary.map((d) => (
                                <div
                                  key={d.label}
                                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-1.5"
                                >
                                  <span className="font-semibold text-slate-800 text-[11px]">{d.label}</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      d.item.statusValidasi === 'Setujui'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : d.item.statusValidasi === 'Ditolak'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {d.item.statusValidasi}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {activeTahapanTab === 'Proposal' && (() => {
                    const proposalData = getStudentProposal(selectedSkripsi);
                    const defaultBerkas: BerkasSeminarProposal = {
                      naskahSeminar: {
                        fileName: `Naskah_Proposal_${selectedSkripsi.nim}.pdf`,
                        fileSize: '2.4 MB',
                        uploadedAt: '2026-03-12 10:15',
                        isSubmitted: true,
                        statusValidasi: 'Setujui'
                      },
                      beritaAcara: {
                        fileName: `Berita_Acara_Proposal_${selectedSkripsi.nim}.pdf`,
                        fileSize: '820 KB',
                        uploadedAt: '2026-03-24 11:30',
                        isSubmitted: true,
                        statusValidasi: 'Setujui'
                      }
                    };
                    const berkas: BerkasSeminarProposal = proposalData.berkasSeminar || defaultBerkas;

                    return (
                      <div className="space-y-3.5 pt-1">
                        {/* Header Banner Tahap Seminar Proposal */}
                        <div className="p-3 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shadow-2xs">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#002B49] text-xs">Seminar Proposal Skripsi</span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                                  Terjadwal
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">Departemen Kimia FSTeM Universitas Brawijaya</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-500">Kelengkapan Berkas:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                berkas.naskahSeminar.isSubmitted && berkas.beritaAcara.isSubmitted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {berkas.naskahSeminar.isSubmitted && berkas.beritaAcara.isSubmitted
                                ? 'Lengkap (2 Dokumen)'
                                : 'Perlu Dilengkapi'}
                            </span>
                          </div>
                        </div>

                        {/* Card List of Required Fields:
                            (NIM, Mahasiswa, Judul, Dosen, Tanggal, Jam (rentang waktu), Lokasi, Link Daring, Nilai (button Berkas Seminar dan button Nilai)) */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs divide-y divide-slate-100 text-xs">
                          {/* 1. NIM */}
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">NIM</span>
                            <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 text-xs">
                              {selectedSkripsi.nim}
                            </div>
                          </div>

                          {/* 2. Mahasiswa */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Mahasiswa</span>
                            <div className="font-bold text-slate-900 text-right flex items-center justify-end gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#002B49] flex-shrink-0" />
                              <span>{selectedSkripsi.namaMahasiswa}</span>
                            </div>
                          </div>

                          {/* 3. Judul */}
                          <div className="flex items-start justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Judul</span>
                            <div className="text-right max-w-sm sm:max-w-md">
                              <div className="font-bold text-slate-900 leading-snug">{selectedSkripsi.judul}</div>
                              {selectedSkripsi.judulInggris && (
                                <div className="text-[11px] text-slate-500 italic mt-0.5 leading-snug">
                                  "{selectedSkripsi.judulInggris}"
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 4. Dosen */}
                          <div className="flex items-start justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Dosen</span>
                            <div className="text-right space-y-1">
                              <div className="text-slate-800">
                                <span className="text-slate-500 text-[11px]">Pembimbing 1:</span>{' '}
                                <strong className="text-slate-900">{selectedSkripsi.dosenPembimbing1}</strong>
                              </div>
                              {selectedSkripsi.dosenPembimbing2 && (
                                <div className="text-slate-800">
                                  <span className="text-slate-500 text-[11px]">Pembimbing 2:</span>{' '}
                                  <strong className="text-slate-900">{selectedSkripsi.dosenPembimbing2}</strong>
                                </div>
                              )}
                              {proposalData.dosenPenguji1 && (
                                <div className="text-slate-600 text-[11px] pt-0.5 border-t border-slate-100">
                                  <span className="text-slate-400">Penguji:</span>{' '}
                                  <span>{proposalData.dosenPenguji1}</span>
                                  {proposalData.dosenPenguji2 && <span> &bull; {proposalData.dosenPenguji2}</span>}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 5. Tanggal */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Tanggal</span>
                            <div className="font-semibold text-slate-900 flex items-center justify-end gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#002B49]" />
                              <span>{proposalData.tanggal}</span>
                            </div>
                          </div>

                          {/* 6. Jam (rentang waktu) */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Jam (rentang waktu)</span>
                            <div className="font-mono font-bold text-amber-950 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 text-xs flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>{proposalData.jam}</span>
                            </div>
                          </div>

                          {/* 7. Lokasi */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Lokasi</span>
                            <div className="font-semibold text-slate-900 flex items-center justify-end gap-1.5 text-right">
                              <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                              <span>{proposalData.lokasi}</span>
                            </div>
                          </div>

                          {/* 8. Link Daring */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Link Daring</span>
                            <div className="flex items-center gap-2">
                              <a
                                href={proposalData.linkDaring}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:text-blue-900 hover:underline font-mono text-[11px] flex items-center gap-1"
                              >
                                <Video className="w-3.5 h-3.5 text-blue-600" />
                                <span>{proposalData.linkDaring}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(proposalData.linkDaring);
                                  setNotificationMsg('Link daring seminar disalin!');
                                  setTimeout(() => setNotificationMsg(null), 2500);
                                }}
                                title="Salin Link Daring"
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* 9. Nilai (button Berkas Seminar dan button Nilai) */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                            <div className="space-y-1">
                              <span className="text-slate-500 font-semibold block">Nilai</span>
                              {proposalData.nilaiProposal && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs">
                                    Nilai Akhir: {proposalData.nilaiProposal.nilaiAkhir.toFixed(2)} ({proposalData.nilaiProposal.grade})
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    {proposalData.nilaiProposal.statusKelulusan}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap">
                              {/* button Berkas Seminar */}
                              <button
                                type="button"
                                onClick={() => setIsBerkasSeminarModalOpen(true)}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md flex items-center gap-2 transition-all cursor-pointer"
                              >
                                <FolderOpen className="w-4 h-4 text-emerald-100" />
                                <span>Berkas Seminar</span>
                              </button>

                              {/* button Nilai */}
                              <button
                                type="button"
                                onClick={handleOpenNilaiModal}
                                className="px-3.5 py-2 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md flex items-center gap-2 transition-all cursor-pointer"
                              >
                                <Award className="w-4 h-4 text-[#D4AF37]" />
                                <span>Nilai</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {activeTahapanTab === 'Kemajuan' && (() => {
                    const kemajuanData = getStudentKemajuan(selectedSkripsi);
                    return (
                      <div className="space-y-3.5 pt-1">
                        {/* Header Banner Tahap Kemajuan Riset */}
                        <div className="p-3 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-900 text-[#D4AF37] flex items-center justify-center font-bold shadow-2xs">
                              <FlaskConical className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-purple-950 text-xs">Seminar Kemajuan Skripsi</span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                                  Tahap Riset
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">Departemen Kimia FSTeM Universitas Brawijaya</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-500">Status Logbook:</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Terverifikasi Pembimbing
                            </span>
                          </div>
                        </div>

                        {/* Card List of Required Fields: Tanggal, Jam (rentang waktu), Lokasi, Link Daring, Nilai */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs divide-y divide-slate-100 text-xs">
                          {/* 1. Tanggal */}
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Tanggal</span>
                            <div className="font-semibold text-slate-900 flex items-center justify-end gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#002B49]" />
                              <span>{kemajuanData.tanggal}</span>
                            </div>
                          </div>

                          {/* 2. Jam (rentang waktu) */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Jam (rentang waktu)</span>
                            <div className="font-mono font-bold text-purple-950 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200 text-xs flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-purple-700" />
                              <span>{kemajuanData.jam}</span>
                            </div>
                          </div>

                          {/* 3. Lokasi */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Lokasi</span>
                            <div className="font-semibold text-slate-900 flex items-center justify-end gap-1.5 text-right">
                              <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                              <span>{kemajuanData.lokasi}</span>
                            </div>
                          </div>

                          {/* 4. Link Daring */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Link Daring</span>
                            <div className="flex items-center gap-2">
                              <a
                                href={kemajuanData.linkDaring}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:text-blue-900 hover:underline font-mono text-[11px] flex items-center gap-1"
                              >
                                <Video className="w-3.5 h-3.5 text-blue-600" />
                                <span>{kemajuanData.linkDaring}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(kemajuanData.linkDaring);
                                  setNotificationMsg('Link daring kemajuan disalin!');
                                  setTimeout(() => setNotificationMsg(null), 2500);
                                }}
                                title="Salin Link Daring"
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* 5. Nilai */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                            <div className="space-y-1">
                              <span className="text-slate-500 font-semibold block">Nilai</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs">
                                  Nilai Evaluasi Kemajuan: {kemajuanData.nilai}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                  Progres Baik
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationMsg('Berkas Logbook Kemajuan Riset diunduh.');
                                  setTimeout(() => setNotificationMsg(null), 2500);
                                }}
                                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md flex items-center gap-2 transition-all cursor-pointer"
                              >
                                <FolderOpen className="w-4 h-4 text-purple-100" />
                                <span>Berkas Logbook</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationMsg('Formulir Evaluasi Nilai Kemajuan dibuka.');
                                  setTimeout(() => setNotificationMsg(null), 2500);
                                }}
                                className="px-3.5 py-2 bg-[#002B49] hover:bg-[#003865] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md flex items-center gap-2 transition-all cursor-pointer"
                              >
                                <Award className="w-4 h-4 text-[#D4AF37]" />
                                <span>Nilai Kemajuan</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Monitoring & Logbook Kemajuan Riset */}
                        <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 text-xs space-y-1.5">
                          <h5 className="font-bold text-slate-900 text-xs">Monitoring &amp; Logbook Kemajuan Riset</h5>
                          <div className="p-2.5 bg-white rounded-lg border border-purple-200 text-[11px] text-slate-700 leading-relaxed">
                            <strong>Catatan Kemajuan:</strong>{' '}
                            {selectedSkripsi.catatanKemajuan || 'Eksperimen sintesis dan analisis instrumen laboratorium sedang berlangsung.'}
                          </div>
                          <p className="text-slate-500 text-[10px]">
                            Logbook penelitian diverifikasi berkala oleh Kepala Laboratorium {selectedSkripsi.bidangMinat}.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {activeTahapanTab === 'Ujian Akhir Skripsi' && (() => {
                    const ujianData = getStudentUjianAkhir(selectedSkripsi);
                    return (
                      <div className="space-y-3.5 pt-1">
                        {/* Header Banner Tahap Ujian Akhir Skripsi */}
                        <div className="p-3 bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shadow-2xs">
                              <GraduationCap className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#002B49] text-xs">Ujian Akhir Skripsi (Sidang Sarjana)</span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                  Tahap Sidang
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">Departemen Kimia FSTeM Universitas Brawijaya</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-500">Status Kelayakan:</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Siap Uji Sidang
                            </span>
                          </div>
                        </div>

                        {/* Card List of Required Fields: Tanggal, Jam (rentang waktu), Lokasi, Link Daring, Nilai */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs divide-y divide-slate-100 text-xs">
                          {/* 1. Tanggal */}
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Tanggal</span>
                            <div className="font-semibold text-slate-900 flex items-center justify-end gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#002B49]" />
                              <span>{ujianData.tanggal}</span>
                            </div>
                          </div>

                          {/* 2. Jam (rentang waktu) */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Jam (rentang waktu)</span>
                            <div className="font-mono font-bold text-amber-950 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 text-xs flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>{ujianData.jam}</span>
                            </div>
                          </div>

                          {/* 3. Lokasi */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Lokasi</span>
                            <div className="font-semibold text-slate-900 flex items-center justify-end gap-1.5 text-right">
                              <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                              <span>{ujianData.lokasi}</span>
                            </div>
                          </div>

                          {/* 4. Link Daring */}
                          <div className="flex items-center justify-between gap-3 pt-2.5">
                            <span className="text-slate-500 font-semibold w-40 flex-shrink-0">Link Daring</span>
                            <div className="flex items-center gap-2">
                              <a
                                href={ujianData.linkDaring}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:text-blue-900 hover:underline font-mono text-[11px] flex items-center gap-1"
                              >
                                <Video className="w-3.5 h-3.5 text-blue-600" />
                                <span>{ujianData.linkDaring}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(ujianData.linkDaring);
                                  setNotificationMsg('Link daring ujian skripsi disalin!');
                                  setTimeout(() => setNotificationMsg(null), 2500);
                                }}
                                title="Salin Link Daring"
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* 5. Nilai */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                            <div className="space-y-1">
                              <span className="text-slate-500 font-semibold block">Nilai</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs">
                                  Nilai Sidang Skripsi: {ujianData.nilai}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  {selectedSkripsi.status === 'Selesai' ? 'Lulus Sidang' : 'Terjadwal'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationMsg('Naskah Komprehensif Ujian Skripsi diunduh.');
                                  setTimeout(() => setNotificationMsg(null), 2500);
                                }}
                                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md flex items-center gap-2 transition-all cursor-pointer"
                              >
                                <FileText className="w-4 h-4 text-amber-100" />
                                <span>Naskah Skripsi</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationMsg('Formulir Nilai Sidang Skripsi dibuka.');
                                  setTimeout(() => setNotificationMsg(null), 2500);
                                }}
                                className="px-3.5 py-2 bg-[#002B49] hover:bg-[#003865] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md flex items-center gap-2 transition-all cursor-pointer"
                              >
                                <Award className="w-4 h-4 text-[#D4AF37]" />
                                <span>Nilai Sidang</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Informasi Naskah Komprehensif & Turnitin */}
                        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs space-y-1.5">
                          <h5 className="font-bold text-slate-900 text-xs">Pendaftaran Ujian Akhir Skripsi Kimia</h5>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            Naskah komprehensif skripsi telah rampung dan disetujui kedua pembimbing. Verifikasi skor kemiripan naskah Turnitin (&lt; 20%) dan kesiapan dewan penguji sidang.
                          </p>
                          <div className="pt-1.5 flex items-center justify-between border-t border-amber-200/60">
                            <span className="text-[11px] text-slate-500 font-medium">Batas Selesai: {selectedSkripsi.targetSelesai || '2026-12-30'}</span>
                            <span className="text-amber-800 font-bold text-[11px] bg-amber-100 px-2 py-0.5 rounded">Siap Uji</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {activeTahapanTab === 'Persyaratan Yudisium' && (() => {
                    const yudisiumDocs = getStudentYudisium(selectedSkripsi);
                    const totalSubmitted = YUDISIUM_DOC_CONFIG.filter(
                      (cfg) => yudisiumDocs[cfg.key]?.isSubmitted
                    ).length;

                    return (
                      <div className="space-y-3.5 pt-1">
                        {/* Header Banner Persyaratan Yudisium */}
                        <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 rounded-xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-[#D4AF37] flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
                              <Award className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-950 text-xs">
                                  Persyaratan Yudisium &amp; Kelulusan Sarjana
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                                  Tahap Akhir
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Kelengkapan 14 Dokumen Persyaratan Yudisium
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-500">Progres Berkas:</span>
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{totalSubmitted} dari {YUDISIUM_DOC_CONFIG.length} Dokumen Lengkap</span>
                            </span>
                          </div>
                        </div>

                        {/* List Dokumen Persyaratan Yudisium:
                            Foto, Abstrak Bahasa Inggris, Sertifikat Prestasi, Skripsi Format Jurnal, Cover + Daftar Isi,
                            Bab 1, Bab 2, Bab 3, Bab 4, Bab 5, Bab 6, Bebas Pinjam Lab, Bebas Pinjam Perpustakaan, Bio Data Sarjana
                            (semua list dalam bentuk Browse, Submit, View) */}
                        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                          {YUDISIUM_DOC_CONFIG.map((cfg, idx) => {
                            const doc = yudisiumDocs[cfg.key];
                            const pendingFile = pendingYudisiumFiles[cfg.key];

                            return (
                              <div
                                key={cfg.key}
                                className="p-3 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                              >
                                {/* Sisi Kiri: Tampilan Judul & Khusus nomor 14 tombol Generate Bio Data di bawah judul */}
                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                                      {idx + 1}. {cfg.title}
                                    </h5>
                                    {pendingFile && (
                                      <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 animate-pulse">
                                        File Dipilih: {pendingFile.name}
                                      </span>
                                    )}
                                  </div>

                                  {/* Khusus Bio Data Sarjana: Button Generate Bio Data warna kuning diletakkan di bawah judul secara elegan */}
                                  {cfg.key === 'bioDataSarjana' && (
                                    <div className="mt-2 flex items-center">
                                      <button
                                        type="button"
                                        onClick={handleOpenBioDataModal}
                                        className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-slate-900 border border-yellow-500 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-xs"
                                        title="Generate Bio Data (Buka formulir Data Sarjana, Data Orang Tua, Data Akhir Pendidikan)"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                                        <span>Generate Bio Data</span>
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Sisi Kanan: Button (Browse, Submit, View) */}
                                <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                                  {/* Hidden File Input for Browse */}
                                  <input
                                    type="file"
                                    ref={(el) => {
                                      yudisiumFileInputRefs.current[cfg.key] = el;
                                    }}
                                    onChange={(e) => handleYudisiumFileChange(cfg.key, e)}
                                    accept={cfg.accept}
                                    className="hidden"
                                  />

                                  {/* 1. BUTTON BROWSE */}
                                  <button
                                    type="button"
                                    onClick={() => yudisiumFileInputRefs.current[cfg.key]?.click()}
                                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                                    title={`Pilih file dari komputer untuk ${cfg.title}`}
                                  >
                                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Browse</span>
                                  </button>

                                  {/* 2. BUTTON SUBMIT */}
                                  <button
                                    type="button"
                                    onClick={() => handleYudisiumSubmit(cfg.key)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all cursor-pointer ${
                                      pendingFile
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300 animate-pulse'
                                        : 'bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white'
                                    }`}
                                    title={`Unggah dan submit dokumen ${cfg.title}`}
                                  >
                                    <FileUp className="w-3.5 h-3.5" />
                                    <span>Submit</span>
                                  </button>

                                  {/* 3. BUTTON VIEW */}
                                  <button
                                    type="button"
                                    onClick={() => handleYudisiumView(cfg.key, idx)}
                                    className="px-2.5 py-1.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                                    title={`Lihat pratinjau dokumen ${cfg.title}`}
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>View</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Detail Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsBerkasModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-emerald-100" />
                <span>Buka Berkas Pendaftaran</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSkripsi(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL EDIT SKRIPSI (DIBUKA SAAT BUTTON EDIT SKRIPSI DIKLIK) */}
      {/* ======================================================== */}
      {isEditSkripsiModalOpen && selectedSkripsi && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl p-5 sm:p-6 space-y-4 animate-fadeIn my-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Data Skripsi Mahasiswa</h3>
                  <p className="text-xs text-slate-500">
                    {selectedSkripsi.namaMahasiswa} ({selectedSkripsi.nim})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSkripsiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSkripsi} className="space-y-4 text-xs">
              {/* Row 1: Tahapan Skripsi & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Tahapan Skripsi (select : Mendaftar, Proposal, Kemajuan, Ujian Akhir Skripsi) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tahapan Skripsi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editFormData.tahapan}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tahapan: e.target.value as 'Mendaftar' | 'Proposal' | 'Kemajuan' | 'Ujian Akhir Skripsi'
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer font-medium"
                    required
                  >
                    <option value="Mendaftar">Mendaftar</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Kemajuan">Kemajuan</option>
                    <option value="Ujian Akhir Skripsi">Ujian Akhir Skripsi</option>
                  </select>
                </div>

                {/* Status (opsi Gagal , Aktif) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Skripsi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value as 'Aktif' | 'Gagal'
                      })
                    }
                    className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer font-bold ${
                      editFormData.status === 'Gagal' ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                    required
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Gagal">Gagal</option>
                  </select>
                </div>
              </div>

              {/* 2. Judul */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Skripsi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editFormData.judul}
                  onChange={(e) => setEditFormData({ ...editFormData, judul: e.target.value })}
                  placeholder="Masukkan judul skripsi dalam bahasa Indonesia"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49]"
                  required
                />
              </div>

              {/* 3. Judul (in English) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul (in English)
                </label>
                <textarea
                  rows={2}
                  value={editFormData.judulInggris}
                  onChange={(e) => setEditFormData({ ...editFormData, judulInggris: e.target.value })}
                  placeholder="Enter thesis / final project title in English"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs italic focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              {/* 4 & 5. Dosen Pembimbing 1 & Dosen Pembimbing 2 (Ambil dari Database Dosen) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Dosen Pembimbing 1 <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    value={editFormData.dosenPembimbing1}
                    onChange={(e) => setEditFormData({ ...editFormData, dosenPembimbing1: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer font-medium"
                    required
                  >
                    <option value="">-- Pilih Dosen Pembimbing 1 --</option>
                    {dosenNameOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Dosen Pembimbing 2
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    value={editFormData.dosenPembimbing2}
                    onChange={(e) => setEditFormData({ ...editFormData, dosenPembimbing2: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer font-medium"
                  >
                    <option value="">-- Tidak Ada / Dosen Pendamping (Opsional) --</option>
                    {dosenNameOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tambah Dosen Penguji (Database Dosen) & No Handphone Orang Tua */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Dosen Penguji
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    value={editFormData.dosenPenguji}
                    onChange={(e) => setEditFormData({ ...editFormData, dosenPenguji: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer font-medium"
                  >
                    <option value="">-- Pilih Dosen Penguji --</option>
                    {dosenNameOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No Handphone Orang Tua
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={editFormData.noHpOrangTua}
                      onChange={(e) => setEditFormData({ ...editFormData, noHpOrangTua: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 6 & 7. Semester & Bidang Minat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Semester &amp; Tahun Akademik <span className="text-rose-500">*</span>
                  </label>
                  {/* Pilihan Semester dari Database Master Semester */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      Pilih dari Database Semester:
                    </span>
                    <select
                      value={editFormData.namaSemester}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const matched = semesterDatabase.find((s) => s.namaSemester === selectedVal);
                        setEditFormData({
                          ...editFormData,
                          namaSemester: selectedVal,
                          // otomatis sinkronkan tingkat semester bila ganjil/genap
                          semester:
                            matched?.tipe === 'Ganjil'
                              ? editFormData.semester % 2 === 0
                                ? editFormData.semester + 1
                                : editFormData.semester
                              : editFormData.semester % 2 !== 0
                              ? editFormData.semester + 1
                              : editFormData.semester
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer font-medium"
                      required
                    >
                      {semesterDatabase.map((sem) => (
                        <option key={sem.id} value={sem.namaSemester}>
                          {sem.namaSemester} {sem.status === 'Aktif' ? '• (Semester Aktif)' : `• (${sem.status})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Tingkat Semester (1 - 14) */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                      Tingkat Semester:
                    </span>
                    <div className="flex items-center gap-1.5 w-full">
                      <span className="text-xs text-slate-500 font-semibold">Semester</span>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={editFormData.semester}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, semester: Number(e.target.value) })
                        }
                        className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bidang Minat (Laboratorium) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editFormData.bidangMinat}
                    onChange={(e) => setEditFormData({ ...editFormData, bidangMinat: e.target.value as LabRiset })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                  >
                    {labOptions.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 8 & 9. IPK & Jumlah SKS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    IPK (Indeks Prestasi Kumulatif) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.00"
                    value={editFormData.ipk}
                    onChange={(e) => setEditFormData({ ...editFormData, ipk: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jumlah SKS Lulus <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="160"
                    value={editFormData.jumlahSks}
                    onChange={(e) => setEditFormData({ ...editFormData, jumlahSks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49]"
                    required
                  />
                </div>
              </div>

              {/* Jadwal & Pelaksanaan Seminar / Ujian (Tanggal, Jam, Lokasi, Link Daring, Nilai) */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-blue-200/60">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#002B49]" />
                    <span>Jadwal &amp; Evaluasi (Proposal, Kemajuan, Ujian Akhir Skripsi)</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                    Sinkron ke Rincian Tahapan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                    <input
                      type="text"
                      placeholder="Contoh: 24 Maret 2026"
                      value={editFormData.tanggal}
                      onChange={(e) => setEditFormData({ ...editFormData, tanggal: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam (rentang waktu)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 09:00 - 11:00 WIB"
                      value={editFormData.jam}
                      onChange={(e) => setEditFormData({ ...editFormData, jam: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ruang Seminar Gedung Kimia Lt. 2 (R. 204)"
                    value={editFormData.lokasi}
                    onChange={(e) => setEditFormData({ ...editFormData, lokasi: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Link Daring</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        placeholder="https://meet.google.com/..."
                        value={editFormData.linkDaring}
                        onChange={(e) => setEditFormData({ ...editFormData, linkDaring: e.target.value })}
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-[11px] font-mono focus:ring-2 focus:ring-[#002B49] bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nilai</label>
                    <input
                      type="text"
                      placeholder="Contoh: 86.50"
                      value={editFormData.nilai}
                      onChange={(e) => setEditFormData({ ...editFormData, nilai: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditSkripsiModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BERKAS PENDAFTARAN */}
      {isBerkasModalOpen && selectedSkripsi && (() => {
        const berkas = getStudentBerkas(selectedSkripsi);

        const docConfigList: Array<{
          key: 'formulir' | 'transkrip' | 'krs' | 'fidk';
          titleLabel: string;
          validLabel: string;
          desc: string;
          badgeIcon: React.ReactNode;
        }> = [
          {
            key: 'formulir',
            titleLabel: 'Formulir :',
            validLabel: 'Valid Formulir',
            desc: 'Formulir Usulan Penelitian & Pendaftaran Skripsi Departemen Kimia',
            badgeIcon: <FileText className="w-4 h-4 text-blue-600" />
          },
          {
            key: 'transkrip',
            titleLabel: 'Transkrip :',
            validLabel: 'Valid Transkrip',
            desc: 'Transkrip Akademik Sementara Mahasiswa (Syarat Nilai D < 10%)',
            badgeIcon: <GraduationCap className="w-4 h-4 text-purple-600" />
          },
          {
            key: 'krs',
            titleLabel: 'KRS :',
            validLabel: 'Valid KRS',
            desc: 'Kartu Rencana Studi Semester Berjalan (Mata Kuliah Skripsi 6 SKS)',
            badgeIcon: <Calendar className="w-4 h-4 text-amber-600" />
          },
          {
            key: 'fidk',
            titleLabel: 'FIDK :',
            validLabel: 'Valid FIDK',
            desc: 'Formulir Isian Departemen Kimia (FIDK) & Surat Keterangan Laboratorium',
            badgeIcon: <FlaskConical className="w-4 h-4 text-emerald-600" />
          }
        ];

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl p-6 space-y-5 animate-fadeIn my-6 max-h-[92vh] overflow-y-auto">
              {/* Header Modal Berkas */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Berkas Pendaftaran Skripsi
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {selectedSkripsi.nim}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                      Kelengkapan Dokumen: {selectedSkripsi.namaMahasiswa}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verifikasi dokumen pendaftaran tugas akhir Departemen Kimia FSTeM Universitas Brawijaya
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBerkasModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Syarat Nilai D & Mahasiswa Banner */}
              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">
                      Informasi: Total Nilai D kurang dari 10%
                    </span>
                    <p className="text-[11px] text-emerald-800">
                      Status Lulus Persyaratan: {selectedSkripsi.sksNilaiD ?? 0} SKS Nilai D dari total{' '}
                      {selectedSkripsi.totalSks ?? 123} SKS ({selectedSkripsi.persentaseNilaiD ?? 0}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300">
                    Bidang: {selectedSkripsi.bidangMinat.replace('Laboratorium ', '')}
                  </span>
                </div>
              </div>

              {/* Toast / Notification if any */}
              {notificationMsg && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{notificationMsg}</span>
                  </div>
                  <button
                    onClick={() => setNotificationMsg(null)}
                    className="text-blue-500 hover:text-blue-700 font-bold ml-2"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* LIST DOKUMEN BERKAS (Formulir, Transkrip, KRS, FIDK) */}
              <div className="space-y-4">
                {docConfigList.map((docItem, idx) => {
                  const docData = berkas[docItem.key];
                  const pendingFile = pendingFiles[docItem.key];
                  const isValidatedApprove = docData.statusValidasi === 'Setujui';
                  const isValidatedReject = docData.statusValidasi === 'Ditolak';

                  return (
                    <div
                      key={docItem.key}
                      className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-3"
                    >
                      {/* Baris Judul & Deskripsi Dokumen */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                            {docItem.badgeIcon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {idx + 1}. {docItem.titleLabel.replace(' :', '')}
                              </span>
                              {docData.isSubmitted && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Tersubmit
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{docItem.desc}</p>
                          </div>
                        </div>

                        {/* File Meta Info */}
                        <div className="text-right text-[11px] text-slate-500">
                          <div className="font-mono font-medium text-slate-700 truncate max-w-xs">
                            {pendingFile ? (
                              <span className="text-blue-700 font-bold">
                                [File Baru]: {pendingFile.name}
                              </span>
                            ) : (
                              docData.fileName || 'Berkas_Pendaftaran.pdf'
                            )}
                          </div>
                          <div>
                            {docData.fileSize || '500 KB'} • Diunggah: {docData.uploadedAt || '2026-02-15'}
                          </div>
                        </div>
                      </div>

                      {/* Baris 1: Kontrol Dokumen (Browse, Submit, Preview) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs w-28 flex-shrink-0">
                            {docItem.titleLabel}
                          </span>
                          <span className="text-xs text-slate-500 hidden sm:inline">
                            (dalam bentuk Browse, Submit, Preview)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Hidden File Input for Browse */}
                          <input
                            type="file"
                            ref={fileInputRefs[docItem.key]}
                            onChange={(e) => handleFileChange(docItem.key, e)}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            className="hidden"
                          />

                          {/* BROWSE BUTTON */}
                          <button
                            type="button"
                            onClick={() => fileInputRefs[docItem.key].current?.click()}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Browse file dari komputer"
                          >
                            <Upload className="w-3.5 h-3.5 text-slate-500" />
                            <span>Browse</span>
                          </button>

                          {/* SUBMIT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleSubmitFile(docItem.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              pendingFile
                                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300'
                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                            }`}
                            title="Submit / Unggah dokumen"
                          >
                            <FileUp className="w-3.5 h-3.5" />
                            <span>Submit</span>
                          </button>

                          {/* PREVIEW BUTTON */}
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewDoc({
                                docKey: docItem.key,
                                title: docItem.desc,
                                studentName: selectedSkripsi.namaMahasiswa,
                                nim: selectedSkripsi.nim,
                                item: docData
                              })
                            }
                            className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Preview isi dokumen"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>

                      {/* Baris 2: Validasi Dokumen (Setujui atau Ditolak) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 bg-white/70 p-2.5 rounded-lg border border-slate-200/70">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs w-28 flex-shrink-0">
                            {docItem.validLabel}
                          </span>
                          <span className="text-xs text-slate-500">
                            (Setujui atau Ditolak) :
                          </span>
                          {/* Current Status Badge */}
                          {isValidatedApprove && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>Disetujui</span>
                            </span>
                          )}
                          {isValidatedReject && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-700" />
                              <span>Ditolak</span>
                            </span>
                          )}
                          {!isValidatedApprove && !isValidatedReject && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Menunggu Verifikasi</span>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons: Setujui atau Ditolak */}
                        <div className="flex items-center gap-2">
                          {/* BUTTON SETUJUI */}
                          <button
                            type="button"
                            onClick={() => handleUpdateValidation(docItem.key, 'Setujui')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isValidatedApprove
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                                : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
                            }`}
                            title={`Setujui berkas ${docItem.key}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>

                          {/* BUTTON DITOLAK */}
                          <button
                            type="button"
                            onClick={() => handleUpdateValidation(docItem.key, 'Ditolak')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isValidatedReject
                                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-300'
                            }`}
                            title={`Tolak berkas ${docItem.key}`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Ditolak</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Semua berkas tersinkronisasi otomatis dengan database akademik mahasiswa.
                </span>
                <button
                  type="button"
                  onClick={() => setIsBerkasModalOpen(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL BERKAS SEMINAR PROPOSAL */}
      {isBerkasSeminarModalOpen && selectedSkripsi && (() => {
        const proposalData = getStudentProposal(selectedSkripsi);
        const defaultBerkas: BerkasSeminarProposal = {
          naskahSeminar: {
            fileName: `Naskah_Proposal_${selectedSkripsi.nim}.pdf`,
            fileSize: '2.4 MB',
            uploadedAt: '2026-03-12 10:15',
            isSubmitted: true,
            statusValidasi: 'Setujui'
          },
          beritaAcara: {
            fileName: `Berita_Acara_Proposal_${selectedSkripsi.nim}.pdf`,
            fileSize: '820 KB',
            uploadedAt: '2026-03-24 11:30',
            isSubmitted: true,
            statusValidasi: 'Setujui'
          }
        };
        const berkas: BerkasSeminarProposal = proposalData.berkasSeminar || defaultBerkas;

        const seminarDocConfigList: Array<{
          key: 'naskahSeminar' | 'beritaAcara';
          titleLabel: string;
          validLabel: string;
          desc: string;
          badgeIcon: React.ReactNode;
        }> = [
          {
            key: 'naskahSeminar',
            titleLabel: 'Naskah Seminar Proposal :',
            validLabel: 'Valid Naskah Seminar',
            desc: 'Naskah Proposal Skripsi (Bab 1 s.d. 3) yang telah disetujui Dosen Pembimbing untuk diseminarkan',
            badgeIcon: <FileText className="w-4 h-4 text-blue-600" />
          },
          {
            key: 'beritaAcara',
            titleLabel: 'Berita Acara Seminar Proposal :',
            validLabel: 'Valid Berita Acara',
            desc: 'Lembar Berita Acara & Form Penilaian Seminar Proposal resmi Departemen Kimia FSTeM UB',
            badgeIcon: <FileCheck className="w-4 h-4 text-emerald-600" />
          }
        ];

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl p-6 space-y-5 animate-fadeIn my-6 max-h-[92vh] overflow-y-auto">
              {/* Header Modal Berkas Seminar */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Berkas Seminar Proposal
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">
                        {selectedSkripsi.nim}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                      Kelengkapan Dokumen Seminar: {selectedSkripsi.namaMahasiswa}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pengelolaan naskah dan berita acara seminar proposal Departemen Kimia FSTeM Universitas Brawijaya
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBerkasSeminarModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Jadwal Seminar Banner */}
              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#002B49] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">
                      Jadwal: {proposalData.tanggal} ({proposalData.jam})
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Lokasi: {proposalData.lokasi}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-[#002B49] border border-blue-200">
                    Pembimbing: {selectedSkripsi.dosenPembimbing1}
                  </span>
                </div>
              </div>

              {/* Toast / Notification if any */}
              {notificationMsg && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{notificationMsg}</span>
                  </div>
                  <button
                    onClick={() => setNotificationMsg(null)}
                    className="text-blue-500 hover:text-blue-700 font-bold ml-2 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* LIST DOKUMEN BERKAS SEMINAR:
                  1. Naskah Seminar Proposal (Browse, Submit, Preview)
                  2. Berita Acara Seminar Proposal (Browse, Submit, Preview) */}
              <div className="space-y-4">
                {seminarDocConfigList.map((docItem, idx) => {
                  const docData = berkas[docItem.key];
                  const pendingFile = pendingProposalFiles[docItem.key];
                  const isValidatedApprove = docData.statusValidasi === 'Setujui';
                  const isValidatedReject = docData.statusValidasi === 'Ditolak';

                  return (
                    <div
                      key={docItem.key}
                      className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-3"
                    >
                      {/* Baris Judul & Deskripsi Dokumen */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                            {docItem.badgeIcon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {idx + 1}. {docItem.titleLabel.replace(' :', '')}
                              </span>
                              {docData.isSubmitted && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Tersubmit
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{docItem.desc}</p>
                          </div>
                        </div>

                        {/* File Meta Info */}
                        <div className="text-right text-[11px] text-slate-500">
                          <div className="font-mono font-medium text-slate-700 truncate max-w-xs">
                            {pendingFile ? (
                              <span className="text-blue-700 font-bold">
                                [File Baru]: {pendingFile.name}
                              </span>
                            ) : (
                              docData.fileName ||
                              `${docItem.key === 'naskahSeminar' ? 'Naskah_Proposal' : 'Berita_Acara'}_${selectedSkripsi.nim}.pdf`
                            )}
                          </div>
                          <div>
                            {docData.fileSize || '750 KB'} &bull; Diunggah:{' '}
                            {docData.uploadedAt || '2026-03-15'}
                          </div>
                        </div>
                      </div>

                      {/* Baris Kontrol: Browse, Submit, Preview */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs w-48 flex-shrink-0">
                            {docItem.titleLabel}
                          </span>
                          <span className="text-xs text-slate-500 hidden sm:inline">
                            (dalam bentuk Browse, Submit, Preview)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Hidden File Input for Browse */}
                          <input
                            type="file"
                            ref={proposalFileInputRefs[docItem.key]}
                            onChange={(e) => handleProposalFileChange(docItem.key, e)}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                          />

                          {/* BROWSE BUTTON */}
                          <button
                            type="button"
                            onClick={() => proposalFileInputRefs[docItem.key].current?.click()}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Browse file dari komputer"
                          >
                            <Upload className="w-3.5 h-3.5 text-slate-500" />
                            <span>Browse</span>
                          </button>

                          {/* SUBMIT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleSubmitProposalFile(docItem.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              pendingFile
                                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300'
                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                            }`}
                            title="Submit / Unggah dokumen"
                          >
                            <FileUp className="w-3.5 h-3.5" />
                            <span>Submit</span>
                          </button>

                          {/* PREVIEW BUTTON */}
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewDoc({
                                docKey: docItem.key,
                                title: docItem.desc,
                                studentName: selectedSkripsi.namaMahasiswa,
                                nim: selectedSkripsi.nim,
                                item: docData
                              })
                            }
                            className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Preview isi dokumen"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>

                      {/* Baris Validasi (Setujui atau Ditolak) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 bg-white/70 p-2.5 rounded-lg border border-slate-200/70">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs w-40 flex-shrink-0">
                            {docItem.validLabel}
                          </span>
                          <span className="text-xs text-slate-500">
                            (Setujui atau Ditolak) :
                          </span>
                          {isValidatedApprove && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>Disetujui</span>
                            </span>
                          )}
                          {isValidatedReject && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-700" />
                              <span>Ditolak</span>
                            </span>
                          )}
                          {!isValidatedApprove && !isValidatedReject && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Menunggu Verifikasi</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateProposalValidation(docItem.key, 'Setujui')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isValidatedApprove
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                                : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
                            }`}
                            title={`Setujui ${docItem.titleLabel}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateProposalValidation(docItem.key, 'Ditolak')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isValidatedReject
                                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-300'
                            }`}
                            title={`Tolak ${docItem.titleLabel}`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Ditolak</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Dokumen seminar tersinkronisasi otomatis dengan database proposal skripsi.
                </span>
                <button
                  type="button"
                  onClick={() => setIsBerkasSeminarModalOpen(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL NILAI PROPOSAL (PRJ1) */}
      {isNilaiModalOpen && selectedSkripsi && (() => {
        const propData = getStudentProposal(selectedSkripsi);
        const dosen1Nama = selectedSkripsi.dosenPembimbing1 || 'Dr. Sri Juari Santosa, M.Ed.';
        const dosen2Nama = selectedSkripsi.dosenPembimbing2 || 'Prof. Dr. Dra. Yuliasri, M.Si.';
        const dosen3Nama = propData.dosenPenguji1 || "Prof. Dr. Aulanni'am, drh., DES";

        // Active Dosen selector
        const activeKey = selectedDosenKey === 'Dosen 1' ? 'dosen1' : selectedDosenKey === 'Dosen 2' ? 'dosen2' : 'dosen3';
        const activeDosenName = selectedDosenKey === 'Dosen 1' ? dosen1Nama : selectedDosenKey === 'Dosen 2' ? dosen2Nama : dosen3Nama;
        const activeDosenData = formNilaiPRJ1[activeKey];

        // Calculations
        const tot1 = calcDosenTotal(formNilaiPRJ1.dosen1);
        const tot2 = calcDosenTotal(formNilaiPRJ1.dosen2);
        const tot3 = calcDosenTotal(formNilaiPRJ1.dosen3);
        const roundedAvg = Math.round(((tot1 + tot2 + tot3) / 3) * 100) / 100;

        let calculatedGrade = 'E';
        if (roundedAvg >= 80) calculatedGrade = 'A';
        else if (roundedAvg >= 75) calculatedGrade = 'B+';
        else if (roundedAvg >= 70) calculatedGrade = 'B';
        else if (roundedAvg >= 65) calculatedGrade = 'C+';
        else if (roundedAvg >= 60) calculatedGrade = 'C';
        else if (roundedAvg >= 50) calculatedGrade = 'D';

        // Editor text formatting helper
        const handleEditorFormat = (prefix: string, suffix: string = '') => {
          setFormNilaiPRJ1((prev) => {
            const currentText = prev[activeKey].saran;
            return {
              ...prev,
              [activeKey]: {
                ...prev[activeKey],
                saran: currentText ? `${currentText}\n${prefix}Poin Catatan${suffix}` : `${prefix}Catatan Evaluasi${suffix}`
              }
            };
          });
        };

        const handleInsertTag = (tag: string) => {
          setFormNilaiPRJ1((prev) => {
            const currentText = prev[activeKey].saran;
            return {
              ...prev,
              [activeKey]: {
                ...prev[activeKey],
                saran: currentText ? `${currentText}\n\n[${tag}]\n- ` : `[${tag}]\n- `
              }
            };
          });
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl p-5 sm:p-7 space-y-6 animate-fadeIn my-6 max-h-[92vh] overflow-y-auto">
              
              {/* Header Modal Form */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shadow-md ring-2 ring-[#002B49]/20 flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-[#002B49] border border-blue-200 uppercase tracking-wider">
                        Formulir Evaluasi
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        PRJ1 - PROPOSAL
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                      Nilai Proposal (PRJ1)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Evaluasi &amp; Rekapitulasi Nilai Seminar Proposal Skripsi Departemen Kimia FMIPA
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNilaiModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* FORM UTAMA DENGAN 6 BOX/MODAL */}
              <form onSubmit={handleSaveNilai} className="space-y-6">

                {/* 1. BOX/MODAL: INFORMASI SKRIPSI, MAHASISWA, TIM DOSEN & BERKAS */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#002B49]" />
                      <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                        1. Informasi Skripsi, Mahasiswa, Tim Dosen &amp; Berkas
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Data Administrasi Proposal</span>
                  </div>

                  <div className="p-4 sm:p-5 space-y-4 text-xs divide-y divide-slate-100">
                    {/* Judul Skripsi */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <span className="font-bold text-slate-700 md:col-span-1">Judul Skripsi :</span>
                      <div className="md:col-span-3 space-y-1">
                        <p className="font-bold text-slate-900 text-sm leading-snug">
                          {selectedSkripsi.judul}
                        </p>
                        {selectedSkripsi.judulInggris && (
                          <p className="text-slate-500 italic text-[11px]">
                            "{selectedSkripsi.judulInggris}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Nama Mahasiswa */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-3">
                      <span className="font-bold text-slate-700 md:col-span-1">Nama Mahasiswa :</span>
                      <div className="md:col-span-3 flex items-center gap-2.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {selectedSkripsi.namaMahasiswa}
                        </span>
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                          NIM: {selectedSkripsi.nim}
                        </span>
                        <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-bold">
                          {selectedSkripsi.bidangMinat}
                        </span>
                      </div>
                    </div>

                    {/* Nama Dosen 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-3">
                      <div className="md:col-span-1">
                        <span className="font-bold text-slate-700 block">Nama Dosen 1 :</span>
                        <span className="text-[11px] text-slate-400">(Pembimbing Utama)</span>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <div className="font-bold text-slate-900 text-sm">
                          {dosen1Nama}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleGenerateLink('Dosen 1', dosen1Nama)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#002B49] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <Link className="w-3.5 h-3.5 text-blue-700" />
                            <span>Generate Link</span>
                          </button>
                        </div>
                        {generatedLinks['Dosen 1'] && (
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-semibold">Link Evaluasi Dosen 1:</span>
                              {copiedLinkKey === 'Dosen 1' && (
                                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                                  <Check className="w-3 h-3" /> Berhasil Disalin!
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                readOnly
                                value={generatedLinks['Dosen 1']}
                                className="w-full bg-white px-2 py-1 border border-slate-300 rounded font-mono text-[10px] text-slate-700"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(generatedLinks['Dosen 1']);
                                  setCopiedLinkKey('Dosen 1');
                                  setTimeout(() => setCopiedLinkKey(null), 2500);
                                }}
                                className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                                title="Salin Ulang"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nama Dosen 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-3">
                      <div className="md:col-span-1">
                        <span className="font-bold text-slate-700 block">Nama Dosen 2 :</span>
                        <span className="text-[11px] text-slate-400">(Pembimbing Pendamping)</span>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <div className="font-bold text-slate-900 text-sm">
                          {dosen2Nama}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleGenerateLink('Dosen 2', dosen2Nama)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#002B49] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <Link className="w-3.5 h-3.5 text-blue-700" />
                            <span>Generate Link</span>
                          </button>
                        </div>
                        {generatedLinks['Dosen 2'] && (
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-semibold">Link Evaluasi Dosen 2:</span>
                              {copiedLinkKey === 'Dosen 2' && (
                                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                                  <Check className="w-3 h-3" /> Berhasil Disalin!
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                readOnly
                                value={generatedLinks['Dosen 2']}
                                className="w-full bg-white px-2 py-1 border border-slate-300 rounded font-mono text-[10px] text-slate-700"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(generatedLinks['Dosen 2']);
                                  setCopiedLinkKey('Dosen 2');
                                  setTimeout(() => setCopiedLinkKey(null), 2500);
                                }}
                                className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                                title="Salin Ulang"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nama Dosen 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-3">
                      <div className="md:col-span-1">
                        <span className="font-bold text-slate-700 block">Nama Dosen 3 :</span>
                        <span className="text-[11px] text-slate-400">(Penguji Ahli / Reviewer)</span>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <div className="font-bold text-slate-900 text-sm">
                          {dosen3Nama}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleGenerateLink('Dosen 3', dosen3Nama)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#002B49] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <Link className="w-3.5 h-3.5 text-blue-700" />
                            <span>Generate Link</span>
                          </button>
                        </div>
                        {generatedLinks['Dosen 3'] && (
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-semibold">Link Evaluasi Dosen 3:</span>
                              {copiedLinkKey === 'Dosen 3' && (
                                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                                  <Check className="w-3 h-3" /> Berhasil Disalin!
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                readOnly
                                value={generatedLinks['Dosen 3']}
                                className="w-full bg-white px-2 py-1 border border-slate-300 rounded font-mono text-[10px] text-slate-700"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(generatedLinks['Dosen 3']);
                                  setCopiedLinkKey('Dosen 3');
                                  setTimeout(() => setCopiedLinkKey(null), 2500);
                                }}
                                className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                                title="Salin Ulang"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Berkas (berisi button Makalah / Naskah) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-3">
                      <span className="font-bold text-slate-700 md:col-span-1">Berkas :</span>
                      <div className="md:col-span-3 flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewDoc({
                              docKey: 'naskahSeminar',
                              title: 'Naskah / Makalah Seminar Proposal',
                              studentName: selectedSkripsi.namaMahasiswa,
                              nim: selectedSkripsi.nim,
                              item: propData.berkasSeminar?.naskahSeminar
                            });
                          }}
                          className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-[#D4AF37]" />
                          <span>Makalah / Naskah</span>
                        </button>
                        <span className="text-slate-500 text-[11px]">
                          Klik button <strong>Makalah / Naskah</strong> untuk membuka dan memeriksa naskah lengkap proposal mahasiswa.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. BOX/MODAL: DOSEN & PROPORSI SKS CPL */}
                <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#002B49]" />
                      <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                        2. Dosen &amp; Proporsi SKS CPL
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                      Evaluasi Individu Dosen
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* List Silakan Pilih Dosen opsi select: Dosen 1, Dosen 2, Dosen 3 */}
                    <div className="space-y-1.5 text-xs">
                      <label className="block font-bold text-slate-800">
                        Silakan Pilih Dosen :
                      </label>
                      <select
                        value={selectedDosenKey}
                        onChange={(e) => setSelectedDosenKey(e.target.value as any)}
                        className="w-full px-3 py-2.5 border-2 border-[#002B49]/30 rounded-xl text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-hidden cursor-pointer shadow-xs"
                      >
                        <option value="Dosen 1">
                          Dosen 1 - {dosen1Nama} (Pembimbing Utama)
                        </option>
                        <option value="Dosen 2">
                          Dosen 2 - {dosen2Nama} (Pembimbing Pendamping)
                        </option>
                        <option value="Dosen 3">
                          Dosen 3 - {dosen3Nama} (Penguji Ahli / Reviewer)
                        </option>
                      </select>

                      {/* Quick Selector Pills */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {(['Dosen 1', 'Dosen 2', 'Dosen 3'] as const).map((dKey) => {
                          const isAct = selectedDosenKey === dKey;
                          const name = dKey === 'Dosen 1' ? dosen1Nama : dKey === 'Dosen 2' ? dosen2Nama : dosen3Nama;
                          return (
                            <button
                              key={dKey}
                              type="button"
                              onClick={() => setSelectedDosenKey(dKey)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isAct
                                  ? 'bg-[#002B49] text-white shadow-xs ring-2 ring-[#002B49]/40'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span>{dKey}</span>
                              <span className="text-[10px] font-normal opacity-80 ml-1 truncate max-w-[120px] inline-block align-bottom">
                                ({name.split(',')[0]})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Banner Proporsi SKS CPL 4 / 5 / 8: 3 / 1 / 2 */}
                    <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-xl border border-amber-200/90 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-950 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Ketentuan Kurikulum Departemen Kimia</span>
                        </span>
                        <span className="px-2 py-0.5 rounded font-black text-[11px] bg-amber-200 text-amber-950">
                          Total: 6 SKS
                        </span>
                      </div>
                      <div className="font-black text-amber-900 text-sm">
                        Proporsi SKS CPL 4 / 5 / 8: 3 / 1 / 2
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-amber-900 pt-1 border-t border-amber-200/60">
                        <div className="p-1.5 bg-white/70 rounded border border-amber-200">
                          <strong className="block text-slate-900">CPL 4 (3 SKS)</strong>
                          <span className="text-slate-600">Teori &amp; Sains Kimia</span>
                        </div>
                        <div className="p-1.5 bg-white/70 rounded border border-amber-200">
                          <strong className="block text-slate-900">CPL 5 (1 SKS)</strong>
                          <span className="text-slate-600">Metodologi &amp; Riset</span>
                        </div>
                        <div className="p-1.5 bg-white/70 rounded border border-amber-200">
                          <strong className="block text-slate-900">CPL 8 (2 SKS)</strong>
                          <span className="text-slate-600">Komunikasi &amp; Etika</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. BOX/MODAL: NASKAH PROPOSAL */}
                {/* 3. BOX/MODAL: NASKAH PROPOSAL */}
                <div className="bg-blue-50/40 rounded-xl border border-blue-200 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-800" />
                        <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">
                          3. Naskah Proposal
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Penilaian kualitas penyusunan naskah proposal &amp; penguasaan substansi oleh{' '}
                        <strong className="text-blue-900">{selectedDosenKey} ({activeDosenName})</strong> (Bobot: 60% Nilai Dosen)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-blue-800 uppercase block">Subtotal Naskah Proposal</span>
                      <span className="text-base font-black font-mono text-blue-950">
                        {calcDosenDiskusi(activeDosenData).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* RUBRIK EVALUASI: SISI KIRI & SISI KANAN */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* SISI KIRI: Latar belakang, perumusan masalah, tujuan dan cakupan penelitian CPMK 4.2.1 Bobot 1 */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-blue-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-100 text-[#002B49] border border-blue-300">
                            CPMK 4.2.1
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            Bobot 1
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            Latar belakang, perumusan masalah, tujuan dan cakupan penelitian
                          </h4>
                          <p className="text-xs font-bold text-blue-900 mt-1">
                            CPMK 4.2.1 Bobot 1
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="font-bold text-slate-700">Deskripsi Latar Belakang & Perumusan:</div>
                          <p className="leading-relaxed">
                            Penilaian kualitas perumusan urgensi penelitian kimia, sintesis pustaka kritis, identifikasi research gap, dan kejelasan batasan penelitian dalam naskah proposal.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Skor Rubrik Terpilih:</span>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-[#002B49] text-white font-mono font-black text-sm rounded-lg shadow-2xs">
                            Skor {activeDosenData.cpmk421 || 4}
                          </span>
                          <span className="text-[11px] text-slate-500">(Bobot 1)</span>
                        </div>
                      </div>
                    </div>

                    {/* SISI KANAN: Pilihan button radio (4, 3, 2, 1) */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-blue-200 p-4 sm:p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">
                          Pilihan Rubrik Capaian Pembelajaran :
                        </span>
                        <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                          Radio Button (Skor 1 - 4)
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            score: 4,
                            text: '4. Permasalahan dirumuskan sangat jelas, spesifik, relevan dan berdampak; kajian literatur komprehensif, kritis, dan mampu menunjukkan research gap serta alasan pentingnya penelitian.',
                            badge: 'Sangat Baik'
                          },
                          {
                            score: 3,
                            text: '3. Permasalahan jelas dan relevan; kajian literatur cukup baik dan menunjukkan research gap atau urgensi penelitian.',
                            badge: 'Baik'
                          },
                          {
                            score: 2,
                            text: '2. Permasalahan cukup jelas tetapi masih umum; kajian literatur lebih bersifat deskriptif dan research gap belum kuat.',
                            badge: 'Cukup'
                          },
                          {
                            score: 1,
                            text: '1. Permasalahan tidak jelas/relevan; kajian literatur sangat terbatas dan tidak menunjukkan dasar ilmiah yang memadai.',
                            badge: 'Kurang'
                          }
                        ].map((opt) => {
                          const currentScore = activeDosenData.cpmk421 || 4;
                          const isChecked = currentScore === opt.score;
                          return (
                            <label
                              key={opt.score}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/25 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="pt-0.5">
                                <input
                                  type="radio"
                                  name={`rubrik_cpmk421_${selectedDosenKey}`}
                                  value={opt.score}
                                  checked={isChecked}
                                  onChange={() => {
                                    const mappedScore = opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55;
                                    setFormNilaiPRJ1({
                                      ...formNilaiPRJ1,
                                      [activeKey]: {
                                        ...activeDosenData,
                                        cpmk421: opt.score,
                                        materi: mappedScore
                                      }
                                    });
                                  }}
                                  className="w-4 h-4 text-[#002B49] border-slate-300 focus:ring-blue-600 cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-slate-900">
                                    Tingkat Capaian {opt.score}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      opt.score === 4
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : opt.score === 3
                                        ? 'bg-blue-100 text-blue-800'
                                        : opt.score === 2
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {opt.badge} (Nilai {opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55})
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {opt.text}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* RUBRIK 2 EVALUASI: METODOLOGI PENELITIAN (CPMK 4.2.2 Bobot 1) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pt-2">
                    {/* SISI KIRI: Metodologi penelitian CPMK 4.2.2 Bobot 1 */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-blue-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-100 text-[#002B49] border border-blue-300">
                            CPMK 4.2.2
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            Bobot 1
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            Metodologi penelitian
                          </h4>
                          <p className="text-xs font-bold text-blue-900 mt-1">
                            CPMK 4.2.2 Bobot 1
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="font-bold text-slate-700">Deskripsi Metodologi:</div>
                          <p className="leading-relaxed">
                            Penilaian ketepatan rancangan penelitian kimia, kejelasan dan kelayakan prosedur eksperimen laboratorium, variabel penelitian, instrumentasi kimia, dan teknik analisis data.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Skor Rubrik Terpilih:</span>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-[#002B49] text-white font-mono font-black text-sm rounded-lg shadow-2xs">
                            Skor {activeDosenData.cpmk422 || 4}
                          </span>
                          <span className="text-[11px] text-slate-500">(Bobot 1)</span>
                        </div>
                      </div>
                    </div>

                    {/* SISI KANAN: Pilihan button radio (4, 3, 2, 1) */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-blue-200 p-4 sm:p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">
                          Pilihan Rubrik Metodologi Penelitian :
                        </span>
                        <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                          Radio Button (Skor 1 - 4)
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            score: 4,
                            text: '4. Rancangan penelitian sangat jelas, sistematis, dan feasible; metode eksperimen, variabel, instrumen, prosedur, dan teknik analisis data dipilih secara tepat serta memiliki justifikasi ilmiah yang kuat.',
                            badge: 'Sangat Baik'
                          },
                          {
                            score: 3,
                            text: '3. Rancangan penelitian jelas dan dapat dilaksanakan; metode dan analisis data sesuai dengan tujuan penelitian dan didukung alasan ilmiah.',
                            badge: 'Baik'
                          },
                          {
                            score: 2,
                            text: '2. Rancangan penelitian cukup jelas tetapi masih terdapat kelemahan pada metode, variabel, prosedur, atau teknik analisis data.',
                            badge: 'Cukup'
                          },
                          {
                            score: 1,
                            text: '1. Rancangan penelitian tidak jelas/tidak feasible; metode dan analisis data tidak sesuai dengan permasalahan atau tujuan penelitian.',
                            badge: 'Kurang'
                          }
                        ].map((opt) => {
                          const currentScore = activeDosenData.cpmk422 || 4;
                          const isChecked = currentScore === opt.score;
                          return (
                            <label
                              key={opt.score}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/25 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="pt-0.5">
                                <input
                                  type="radio"
                                  name={`rubrik_cpmk422_${selectedDosenKey}`}
                                  value={opt.score}
                                  checked={isChecked}
                                  onChange={() => {
                                    const mappedScore = opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55;
                                    setFormNilaiPRJ1({
                                      ...formNilaiPRJ1,
                                      [activeKey]: {
                                        ...activeDosenData,
                                        cpmk422: opt.score,
                                        metodologi: mappedScore
                                      }
                                    });
                                  }}
                                  className="w-4 h-4 text-[#002B49] border-slate-300 focus:ring-blue-600 cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-slate-900">
                                    Tingkat Capaian {opt.score}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      opt.score === 4
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : opt.score === 3
                                        ? 'bg-blue-100 text-blue-800'
                                        : opt.score === 2
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {opt.badge} (Nilai {opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55})
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {opt.text}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* RUBRIK 3 EVALUASI: PENERAPAN ETIKA, INTEGRITAS & STANDAR PROFESIONAL (CPMK 8.2.1 Bobot 0.5) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pt-2">
                    {/* SISI KIRI: Penerapan etika, integritas dan standar profesional dalam penyusunan naskah proposal CPMK 8.2.1 Bobot 0.5 */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-blue-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                            CPMK 8.2.1
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            Bobot 0.5
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            Penerapan etika, integritas dan standar profesional dalam penyusunan naskah proposal
                          </h4>
                          <p className="text-xs font-bold text-purple-900 mt-1">
                            CPMK 8.2.1 Bobot 0.5
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="font-bold text-slate-700">Deskripsi Etika &amp; Integritas:</div>
                          <p className="leading-relaxed">
                            Penilaian pemahaman dan penerapan prinsip etika penelitian, integritas saintifik, keselamatan kerja (K3) laboratorium kimia, serta tanggung jawab pengelolaan data penelitian.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Skor Rubrik Terpilih:</span>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-[#002B49] text-white font-mono font-black text-sm rounded-lg shadow-2xs">
                            Skor {activeDosenData.cpmk821 || 4}
                          </span>
                          <span className="text-[11px] text-slate-500">(Bobot 0.5)</span>
                        </div>
                      </div>
                    </div>

                    {/* SISI KANAN: Pilihan button radio (4, 3, 2, 1) */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-blue-200 p-4 sm:p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">
                          Pilihan Rubrik Etika &amp; Standar Profesional :
                        </span>
                        <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded">
                          Radio Button (Skor 1 - 4)
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            score: 4,
                            text: '4. Menunjukkan pemahaman dan penerapan sangat baik terhadap prinsip etika dan integritas penelitian serta standar profesional; rancangan pengambilan data, penggunaan bahan/instrumen, keselamatan kerja, serta pengelolaan data direncanakan secara bertanggung jawab.',
                            badge: 'Sangat Baik'
                          },
                          {
                            score: 3,
                            text: '3. Menunjukkan pemahaman dan penerapan baik terhadap etika dan integritas penelitian serta standar profesional; sebagian besar aspek pengambilan dan pengelolaan data telah direncanakan dengan benar.',
                            badge: 'Baik'
                          },
                          {
                            score: 2,
                            text: '2. Menunjukkan pemahaman dasar tentang etika, integritas dan standar profesional, tetapi masih terdapat beberapa aspek pengambilan, pengelolaan, atau pelaporan data yang belum direncanakan secara memadai.',
                            badge: 'Cukup'
                          },
                          {
                            score: 1,
                            text: '1. Tidak menunjukkan pemahaman yang memadai mengenai etika, integritas dan standar profesional; terdapat risiko praktik penelitian yang tidak bertanggung jawab.',
                            badge: 'Kurang'
                          }
                        ].map((opt) => {
                          const currentScore = activeDosenData.cpmk821 || 4;
                          const isChecked = currentScore === opt.score;
                          return (
                            <label
                              key={opt.score}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/25 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="pt-0.5">
                                <input
                                  type="radio"
                                  name={`rubrik_cpmk821_${selectedDosenKey}`}
                                  value={opt.score}
                                  checked={isChecked}
                                  onChange={() => {
                                    const mappedScore = opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55;
                                    setFormNilaiPRJ1({
                                      ...formNilaiPRJ1,
                                      [activeKey]: {
                                        ...activeDosenData,
                                        cpmk821: opt.score,
                                        argumentasi: mappedScore
                                      }
                                    });
                                  }}
                                  className="w-4 h-4 text-[#002B49] border-slate-300 focus:ring-purple-600 cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-slate-900">
                                    Tingkat Capaian {opt.score}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      opt.score === 4
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : opt.score === 3
                                        ? 'bg-blue-100 text-blue-800'
                                        : opt.score === 2
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {opt.badge} (Nilai {opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55})
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {opt.text}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar Ketentuan Rubrik Naskah Proposal */}
                  <div className="p-3 bg-white/90 rounded-xl border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-700">Komposisi Bobot Naskah Proposal:</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded text-[11px]">
                        CPMK 4.2.1 (Bobot 1.0)
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded text-[11px]">
                        CPMK 4.2.2 (Bobot 1.0)
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded text-[11px]">
                        CPMK 8.2.1 (Bobot 0.5)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-500">
                        Total Bobot: <strong className="text-blue-950 font-mono">2.5</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. BOX/MODAL: DISKUSI PROPOSAL */}
                <div className="bg-amber-50/40 rounded-xl border border-amber-300/80 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-amber-800" />
                        <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">
                          Diskusi Proposal
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Penilaian penguasaan materi, argumentasi, dan respon ilmiah selama sesi tanya jawab oleh{' '}
                        <strong className="text-amber-950">{selectedDosenKey} ({activeDosenName})</strong> (Bobot: 40% Nilai Dosen)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Subtotal Diskusi Proposal</span>
                      <span className="text-base font-black font-mono text-amber-950">
                        {calcDosenDiskusiProposal(activeDosenData).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* RUBRIK 1 EVALUASI: SISI KIRI & SISI KANAN (CPMK 4.2.1 Bobot 5) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* SISI KIRI: Penguasaan Substansi, Argumentasi & Diskusi Ilmiah CPMK 4.2.1 Bobot 5 */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-amber-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-amber-100 text-amber-950 border border-amber-300">
                            CPMK 4.2.1
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-orange-100 text-orange-950 border border-orange-300">
                            Bobot 5
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            Penguasaan Substansi, Argumentasi &amp; Diskusi Ilmiah
                          </h4>
                          <p className="text-xs font-bold text-amber-900 mt-1">
                            CPMK 4.2.1 Bobot 5
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="font-bold text-slate-700">Deskripsi Diskusi Ilmiah:</div>
                          <p className="leading-relaxed">
                            Penilaian kedalaman penguasaan konsep kimia, kemampuan argumentasi saintifik, penalaran kritis saat menjawab pertanyaan penguji, dan kejelasan penjelasan research gap serta kebaruan (novelty) penelitian.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Skor Rubrik Terpilih:</span>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-[#002B49] text-white font-mono font-black text-sm rounded-lg shadow-2xs">
                            Skor {activeDosenData.cpmkDiskusi421 || activeDosenData.cpmkDiskusi || 4}
                          </span>
                          <span className="text-[11px] text-slate-500">(Bobot 5)</span>
                        </div>
                      </div>
                    </div>

                    {/* SISI KANAN: Pilihan button radio (4, 3, 2, 1) */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-amber-200 p-4 sm:p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">
                          Pilihan Rubrik Diskusi Proposal :
                        </span>
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Radio Button (Skor 1 - 4)
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            score: 4,
                            text: '4. Menguasai substansi penelitian dan konsep kimia yang mendasari dengan baik; mampu menjelaskan research gap dan novelty; memberikan argumentasi yang logis dan kritis serta mampu menjawab pertanyaan penguji secara tepat dan meyakinkan.',
                            badge: 'Sangat Baik'
                          },
                          {
                            score: 3,
                            text: '3. Menguasai substansi penelitian dengan baik; mampu menjelaskan konsep, research gap, dan novelty; argumentasi cukup logis dan mampu menjawab sebagian besar pertanyaan penguji dengan tepat.',
                            badge: 'Baik'
                          },
                          {
                            score: 2,
                            text: '2. Penguasaan substansi dan konsep masih terbatas; penjelasan research gap atau novelty kurang kuat; argumentasi belum konsisten dan beberapa jawaban masih memerlukan arahan penguji.',
                            badge: 'Cukup'
                          },
                          {
                            score: 1,
                            text: '1. Tidak menguasai substansi penelitian; tidak mampu menjelaskan konsep, research gap, atau novelty dengan baik; argumentasi lemah dan tidak mampu menjawab pertanyaan penguji secara tepat.',
                            badge: 'Kurang'
                          }
                        ].map((opt) => {
                          const currentScore = activeDosenData.cpmkDiskusi421 || activeDosenData.cpmkDiskusi || 4;
                          const isChecked = currentScore === opt.score;
                          return (
                            <label
                              key={opt.score}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/25 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="pt-0.5">
                                <input
                                  type="radio"
                                  name={`rubrik_cpmkDiskusi_${selectedDosenKey}`}
                                  value={opt.score}
                                  checked={isChecked}
                                  onChange={() => {
                                    setFormNilaiPRJ1({
                                      ...formNilaiPRJ1,
                                      [activeKey]: {
                                        ...activeDosenData,
                                        cpmkDiskusi: opt.score,
                                        cpmkDiskusi421: opt.score
                                      }
                                    });
                                  }}
                                  className="w-4 h-4 text-[#002B49] border-slate-300 focus:ring-amber-600 cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-slate-900">
                                    Tingkat Capaian {opt.score}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      opt.score === 4
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : opt.score === 3
                                        ? 'bg-blue-100 text-blue-800'
                                        : opt.score === 2
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {opt.badge} (Nilai {opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55})
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {opt.text}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* RUBRIK 2 EVALUASI: SISI KIRI & SISI KANAN (CPMK 4.2.2 Bobot 5) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pt-2">
                    {/* SISI KIRI: Metodologi, Data & Analisis CPMK 4.2.2 Bobot 5 */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-amber-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-300">
                            CPMK 4.2.2
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-orange-100 text-orange-950 border border-orange-300">
                            Bobot 5
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            Metodologi, Data &amp; Analisis
                          </h4>
                          <p className="text-xs font-bold text-amber-900 mt-1">
                            CPMK 4.2.2 Bobot 5
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="font-bold text-slate-700">Deskripsi Metodologi &amp; Analisis Data:</div>
                          <p className="leading-relaxed">
                            Penilaian pemahaman dan kemampuan mempertahankan metodologi riset kimia yang tepat, kesesuaian data yang dibutuhkan, ketepatan teknik analisis instrumen/eksperimen, serta mitigasi potensi kendala penelitian.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Skor Rubrik Terpilih:</span>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-[#002B49] text-white font-mono font-black text-sm rounded-lg shadow-2xs">
                            Skor {activeDosenData.cpmkDiskusi422 || 4}
                          </span>
                          <span className="text-[11px] text-slate-500">(Bobot 5)</span>
                        </div>
                      </div>
                    </div>

                    {/* SISI KANAN: Pilihan button radio (4, 3, 2, 1) */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-amber-200 p-4 sm:p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">
                          Pilihan Rubrik Metodologi, Data &amp; Analisis :
                        </span>
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Radio Button (Skor 1 - 4)
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            score: 4,
                            text: '4. Memahami dan mampu mempertahankan metodologi yang tepat, sistematis, dan feasible; mampu menjelaskan data yang diperlukan, teknik analisis, serta keterkaitannya dengan tujuan penelitian dan mengantisipasi potensi masalah.',
                            badge: 'Sangat Baik'
                          },
                          {
                            score: 3,
                            text: '3. Memahami metodologi yang sesuai dengan tujuan penelitian; mampu menjelaskan data dan teknik analisis dengan baik, meskipun masih terdapat beberapa bagian yang perlu diperjelas.',
                            badge: 'Baik'
                          },
                          {
                            score: 2,
                            text: '2. Metodologi secara umum sesuai tetapi masih terdapat kelemahan; pemahaman terhadap data dan teknik analisis terbatas serta keterkaitannya dengan tujuan belum sepenuhnya jelas.',
                            badge: 'Cukup'
                          },
                          {
                            score: 1,
                            text: '1. Tidak memahami atau tidak mampu mempertahankan metodologi penelitian; tidak mampu menjelaskan data dan teknik analisis yang diperlukan untuk mencapai tujuan penelitian.',
                            badge: 'Kurang'
                          }
                        ].map((opt) => {
                          const currentScore = activeDosenData.cpmkDiskusi422 || 4;
                          const isChecked = currentScore === opt.score;
                          return (
                            <label
                              key={opt.score}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/25 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="pt-0.5">
                                <input
                                  type="radio"
                                  name={`rubrik_cpmkDiskusi422_${selectedDosenKey}`}
                                  value={opt.score}
                                  checked={isChecked}
                                  onChange={() => {
                                    setFormNilaiPRJ1({
                                      ...formNilaiPRJ1,
                                      [activeKey]: {
                                        ...activeDosenData,
                                        cpmkDiskusi422: opt.score
                                      }
                                    });
                                  }}
                                  className="w-4 h-4 text-[#002B49] border-slate-300 focus:ring-amber-600 cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-slate-900">
                                    Tingkat Capaian {opt.score}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      opt.score === 4
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : opt.score === 3
                                        ? 'bg-blue-100 text-blue-800'
                                        : opt.score === 2
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {opt.badge} (Nilai {opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55})
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {opt.text}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar Ketentuan Rubrik Diskusi Proposal */}
                  <div className="p-3 bg-white/90 rounded-xl border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-700">Komposisi Bobot Diskusi Proposal:</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-950 font-bold rounded text-[11px]">
                        CPMK 4.2.1 (Bobot 5)
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded text-[11px]">
                        CPMK 4.2.2 (Bobot 5)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-500">
                        Total Bobot: <strong className="text-amber-950 font-mono">10</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. BOX/MODAL: PRESENTASI DAN BERKAS */}
                <div className="bg-emerald-50/40 rounded-xl border border-emerald-200 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-800" />
                        <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">
                          Presentasi dan Berkas
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Penilaian kualitas penyusunan naskah proposal, media slide, dan kelengkapan berkas oleh{' '}
                        <strong className="text-emerald-900">{selectedDosenKey} ({activeDosenName})</strong> (Bobot: 20% Nilai Dosen)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Subtotal Presentasi &amp; Berkas</span>
                      <span className="text-base font-black font-mono text-emerald-950">
                        {calcDosenPresentasiBerkas(activeDosenData).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* RUBRIK 1 EVALUASI: SISI KIRI & SISI KANAN (CPMK 4.2.1 Bobot 1) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* SISI KIRI: Berkas/File Presentasi CPMK 4.2.1 Bobot 1 */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-emerald-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                            CPMK 4.2.1
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-300">
                            Bobot 1
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            Berkas/File Presentasi
                          </h4>
                          <p className="text-xs font-bold text-emerald-900 mt-1">
                            CPMK 4.2.1 Bobot 1
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="font-bold text-slate-700">Deskripsi Berkas &amp; Presentasi:</div>
                          <p className="leading-relaxed">
                            Penilaian keruntutan sistematika presentasi, akurasi materi, kualitas tampilan grafik/tabel/gambar, keterbacaan materi, konsistensi format, serta ketepatan pencantuman sitasi dan referensi ilmiah.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Skor Rubrik Terpilih:</span>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-[#002B49] text-white font-mono font-black text-sm rounded-lg shadow-2xs">
                            Skor {activeDosenData.cpmkPresentasi || 4}
                          </span>
                          <span className="text-[11px] text-slate-500">(Bobot 1)</span>
                        </div>
                      </div>
                    </div>

                    {/* SISI KANAN: Pilihan button radio (4, 3, 2, 1) */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-emerald-200 p-4 sm:p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">
                          Pilihan Rubrik Berkas/File Presentasi :
                        </span>
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Radio Button (Skor 1 - 4)
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            score: 4,
                            text: '4. Sistematika sangat runtut dan efektif; isi akurat, relevan, dan mendukung proposal; grafik/tabel/gambar berkualitas dan informatif; seluruh materi mudah dibaca; format sangat konsisten; referensi digunakan secara tepat dan relevan serta dicantumkan dengan baik.',
                            badge: 'Sangat Baik'
                          },
                          {
                            score: 3,
                            text: '3. Sistematika runtut; isi sesuai dan cukup mendukung proposal; grafik/tabel/gambar cukup baik; sebagian besar materi mudah dibaca; format cukup konsisten; referensi relevan dan dicantumkan dengan baik dengan sedikit kekurangan.',
                            badge: 'Baik'
                          },
                          {
                            score: 2,
                            text: '2. Sistematika atau isi masih kurang runtut; terdapat beberapa informasi yang kurang tepat/kurang relevan; kualitas atau keterbacaan grafik/tabel/gambar masih perlu diperbaiki; format kurang konsisten; penggunaan referensi masih terbatas.',
                            badge: 'Cukup'
                          },
                          {
                            score: 1,
                            text: '1. Sistematika tidak jelas; isi tidak memadai atau terdapat banyak ketidaktepatan; grafik/tabel/gambar tidak informatif atau sulit dibaca; format tidak konsisten; referensi tidak memadai atau tidak digunakan dengan tepat.',
                            badge: 'Kurang'
                          }
                        ].map((opt) => {
                          const currentScore = activeDosenData.cpmkPresentasi || 4;
                          const isChecked = currentScore === opt.score;
                          return (
                            <label
                              key={opt.score}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/25 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="pt-0.5">
                                <input
                                  type="radio"
                                  name={`rubrik_cpmkPresentasi_${selectedDosenKey}`}
                                  value={opt.score}
                                  checked={isChecked}
                                  onChange={() => {
                                    const mappedScore = opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55;
                                    setFormNilaiPRJ1({
                                      ...formNilaiPRJ1,
                                      [activeKey]: {
                                        ...activeDosenData,
                                        cpmkPresentasi: opt.score,
                                        naskah: mappedScore,
                                        media: mappedScore,
                                        berkas: mappedScore
                                      }
                                    });
                                  }}
                                  className="w-4 h-4 text-[#002B49] border-slate-300 focus:ring-emerald-600 cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-slate-900">
                                    Tingkat Capaian {opt.score}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      opt.score === 4
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : opt.score === 3
                                        ? 'bg-blue-100 text-blue-800'
                                        : opt.score === 2
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {opt.badge} (Nilai {opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55})
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {opt.text}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* RUBRIK 2 EVALUASI: SISI KIRI & SISI KANAN (CPMK 5.2.2 Bobot 1.5) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* SISI KIRI: Penyampaian CPMK 5.2.2 Bobot 1.5 */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-emerald-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                            CPMK 5.2.2
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-teal-100 text-teal-900 border border-teal-300">
                            Bobot 1.5
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            Penyampaian
                          </h4>
                          <p className="text-xs font-bold text-emerald-900 mt-1">
                            CPMK 5.2.2 Bobot 1.5
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          <div className="font-bold text-slate-700">Deskripsi Penyampaian:</div>
                          <p className="leading-relaxed">
                            Penilaian komunikasi ilmiah, kejelasan dan kelancaran penjelasan materi/rancangan riset, manajemen waktu presentasi, serta sikap profesional, percaya diri, dan responsif terhadap audiens/penguji.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Skor Rubrik Terpilih:</span>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-[#002B49] text-white font-mono font-black text-sm rounded-lg shadow-2xs">
                            Skor {activeDosenData.cpmkPenyampaian522 || 4}
                          </span>
                          <span className="text-[11px] text-slate-500">(Bobot 1.5)</span>
                        </div>
                      </div>
                    </div>

                    {/* SISI KANAN: Pilihan button radio (4, 3, 2, 1) */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-emerald-200 p-4 sm:p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">
                          Pilihan Rubrik Penyampaian :
                        </span>
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Radio Button (Skor 1 - 4)
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            score: 4,
                            text: '4. Menyampaikan proposal dengan komunikasi ilmiah yang sangat jelas, sistematis, dan meyakinkan; mampu menjelaskan konsep dan rancangan penelitian secara lancar; waktu dikelola sangat baik; menunjukkan sikap profesional, percaya diri, dan responsif terhadap audiens/penguji.',
                            badge: 'Sangat Baik'
                          },
                          {
                            score: 3,
                            text: '3. Penyampaian jelas dan sistematis; komunikasi ilmiah baik; mampu menjelaskan sebagian besar materi dengan lancar; penggunaan waktu sesuai; menunjukkan sikap profesional dan cukup percaya diri.',
                            badge: 'Baik'
                          },
                          {
                            score: 2,
                            text: '2. Penyampaian cukup dapat dipahami tetapi kurang sistematis atau masih bergantung pada slide; beberapa bagian kurang jelas; pengelolaan waktu kurang optimal; sikap profesional dan kepercayaan diri belum konsisten.',
                            badge: 'Cukup'
                          },
                          {
                            score: 1,
                            text: '1. Penyampaian tidak jelas dan tidak sistematis; kesulitan menjelaskan materi; penggunaan waktu tidak terkendali; menunjukkan sikap kurang profesional atau kurang siap dalam presentasi.',
                            badge: 'Kurang'
                          }
                        ].map((opt) => {
                          const currentScore = activeDosenData.cpmkPenyampaian522 || 4;
                          const isChecked = currentScore === opt.score;
                          return (
                            <label
                              key={opt.score}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/25 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="pt-0.5">
                                <input
                                  type="radio"
                                  name={`rubrik_cpmkPenyampaian522_${selectedDosenKey}`}
                                  value={opt.score}
                                  checked={isChecked}
                                  onChange={() => {
                                    setFormNilaiPRJ1({
                                      ...formNilaiPRJ1,
                                      [activeKey]: {
                                        ...activeDosenData,
                                        cpmkPenyampaian522: opt.score
                                      }
                                    });
                                  }}
                                  className="w-4 h-4 text-[#002B49] border-slate-300 focus:ring-emerald-600 cursor-pointer"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-slate-900">
                                    Tingkat Capaian {opt.score}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      opt.score === 4
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : opt.score === 3
                                        ? 'bg-blue-100 text-blue-800'
                                        : opt.score === 2
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {opt.badge} (Nilai {opt.score === 4 ? 96 : opt.score === 3 ? 84 : opt.score === 2 ? 70 : 55})
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  {opt.text}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar Ketentuan Rubrik Presentasi dan Berkas */}
                  <div className="p-3 bg-white/90 rounded-xl border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-700">Komposisi Bobot Presentasi &amp; Berkas:</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-950 font-bold rounded text-[11px]">
                        Berkas/File Presentasi CPMK 4.2.1 (Bobot 1)
                      </span>
                      <span className="text-slate-400 font-bold">+</span>
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-950 font-bold rounded text-[11px]">
                        Penyampaian CPMK 5.2.2 (Bobot 1.5)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-500">
                        Total Bobot: <strong className="text-emerald-950 font-mono">2.5</strong>
                      </span>
                    </div>
                  </div>

                  {/* Summary Bar Nilai Dosen Terpilih */}
                  <div className="p-3 bg-white rounded-lg border border-emerald-300 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Total Nilai dari {selectedDosenKey} ({activeDosenName}):
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        (Naskah 40% + Diskusi 40% + Presentasi &amp; Berkas 20%) =
                      </span>
                      <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-black font-mono text-sm shadow-2xs">
                        {calcDosenTotal(activeDosenData).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. BOX/MODAL: SARAN & PERTANYAAN (BERUPA EDITOR) */}
                <div className="bg-amber-50/30 rounded-xl border border-amber-200 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
                    <div className="flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-amber-700" />
                      <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">
                        Saran &amp; Pertanyaan (Editor)
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      Editor Catatan {selectedDosenKey}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Gunakan editor di bawah ini untuk menuliskan saran revisi, masukan metodologi, dan pertanyaan seminar dari{' '}
                    <strong>{selectedDosenKey} ({activeDosenName})</strong>:
                  </p>

                  {/* Editor Formatting Toolbar */}
                  <div className="p-2 bg-white rounded-t-xl border border-slate-300 border-b-0 flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('**', '**')}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                      title="Tebal (Bold)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('*', '*')}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-700 italic text-xs flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                      title="Miring (Italic)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('<u>', '</u>')}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-700 text-xs flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                      title="Garis Bawah (Underline)"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    <button
                      type="button"
                      onClick={() => handleEditorFormat('• ')}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-700 text-xs flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                      title="Daftar Poin (Bullet List)"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Poin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorFormat('1. ')}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-700 text-xs flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                      title="Daftar Nomor (Numbered List)"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Nomor</span>
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Quick Chapter Insertion Tags */}
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Template:</span>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('Bab 1: Pendahuluan')}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      + Bab 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('Bab 2: Tinjauan Pustaka')}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      + Bab 2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('Bab 3: Metode Penelitian')}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      + Bab 3
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('Karakterisasi Bahan & Instrumen')}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      + Instrumen
                    </button>
                  </div>

                  {/* Editor Textarea */}
                  <textarea
                    rows={5}
                    value={activeDosenData.saran}
                    onChange={(e) =>
                      setFormNilaiPRJ1({
                        ...formNilaiPRJ1,
                        [activeKey]: {
                          ...activeDosenData,
                          saran: e.target.value
                        }
                      })
                    }
                    placeholder={`Tuliskan saran perbaikan dan pertanyaan seminar dari ${selectedDosenKey}...`}
                    className="w-full px-3.5 py-3 border border-slate-300 rounded-b-xl text-xs font-mono text-slate-900 bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-hidden leading-relaxed shadow-inner"
                  />
                </div>

                {/* 7. BOX/MODAL: NILAI DAN SARAN (TERDIRI DARI 4 SUB BOX) */}
                <div className="bg-slate-100/80 rounded-xl border border-slate-300 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#002B49]" />
                      <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">
                        7. Nilai dan Saran
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Rekapitulasi Dewan Penguji &amp; Keputusan
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* SUB BOX 1: PRJ1 - Proposal */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#D4AF37]" />
                          <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                            PRJ1 - Proposal
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Rekap Seminar Proposal Skripsi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        {/* Dosen 1 Score */}
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-500 font-semibold block">Nilai Dosen 1</span>
                          <span className="text-lg font-black font-mono text-slate-900 block">
                            {tot1.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            {dosen1Nama}
                          </span>
                        </div>

                        {/* Dosen 2 Score */}
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-500 font-semibold block">Nilai Dosen 2</span>
                          <span className="text-lg font-black font-mono text-slate-900 block">
                            {tot2.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            {dosen2Nama}
                          </span>
                        </div>

                        {/* Dosen 3 Score */}
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-500 font-semibold block">Nilai Dosen 3</span>
                          <span className="text-lg font-black font-mono text-slate-900 block">
                            {tot3.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            {dosen3Nama}
                          </span>
                        </div>

                        {/* Rata-Rata & Huruf Mutu */}
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-[#002B49] text-white rounded-lg shadow-xs space-y-0.5">
                          <span className="text-[10px] text-emerald-100 font-bold block uppercase tracking-wider">
                            Rata-Rata Akhir
                          </span>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black font-mono">
                              {roundedAvg.toFixed(2)}
                            </span>
                            <span className="px-2.5 py-0.5 bg-[#D4AF37] text-slate-950 font-black text-sm rounded shadow-xs">
                              {calculatedGrade}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-200 block">
                            Skala Mutu UB: {calculatedGrade === 'A' ? 'Sangat Baik' : calculatedGrade === 'B+' || calculatedGrade === 'B' ? 'Baik' : 'Cukup'}
                          </span>
                        </div>
                      </div>

                      {/* Status Kelulusan */}
                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                        <label className="font-bold text-slate-800">
                          Status Kelulusan PRJ1 - Proposal :
                        </label>
                        <select
                          value={formNilaiPRJ1.statusKelulusan}
                          onChange={(e) =>
                            setFormNilaiPRJ1({ ...formNilaiPRJ1, statusKelulusan: e.target.value as any })
                          }
                          className="px-3 py-1.5 border-2 border-emerald-600/40 rounded-lg text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-hidden cursor-pointer"
                        >
                          <option value="Lulus">Lulus (Dapat Melanjutkan ke Riset Lab)</option>
                          <option value="Lulus dengan Catatan Revisi">Lulus dengan Catatan Revisi</option>
                          <option value="Mengulang">Mengulang Seminar Proposal</option>
                        </select>
                      </div>
                    </div>

                    {/* SUB BOX 2: Catatan Dosen 1 */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <h5 className="font-bold text-slate-900">
                            Catatan Dosen 1 ({dosen1Nama})
                          </h5>
                        </div>
                        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          Nilai: {tot1.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed border border-slate-200/60">
                        {formNilaiPRJ1.dosen1.saran || '(Belum ada catatan dari Dosen 1)'}
                      </div>
                    </div>

                    {/* SUB BOX 3: Catatan Dosen 2 */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <h5 className="font-bold text-slate-900">
                            Catatan Dosen 2 ({dosen2Nama})
                          </h5>
                        </div>
                        <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          Nilai: {tot2.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed border border-slate-200/60">
                        {formNilaiPRJ1.dosen2.saran || '(Belum ada catatan dari Dosen 2)'}
                      </div>
                    </div>

                    {/* SUB BOX 4: Catatan Dosen 3 */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-600" />
                          <h5 className="font-bold text-slate-900">
                            Catatan Dosen 3 ({dosen3Nama})
                          </h5>
                        </div>
                        <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                          Nilai: {tot3.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed border border-slate-200/60">
                        {formNilaiPRJ1.dosen3.saran || '(Belum ada catatan dari Dosen 3)'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODAL FOOTER BUTTONS */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Nilai dan catatan tersimpan otomatis ke berita acara seminar proposal (PRJ1).
                  </span>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsNilaiModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer ring-2 ring-[#002B49]/30"
                    >
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>Simpan Nilai Proposal (PRJ1)</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        );
      })()}

      {/* MODAL PREVIEW DOKUMEN */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-fadeIn my-6 max-h-[92vh] overflow-y-auto">
            {/* Header Preview */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      Preview Dokumen Resmi
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {previewDoc.item.fileName || 'Berkas.pdf'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">
                    {previewDoc.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mahasiswa: {previewDoc.studentName} ({previewDoc.nim})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Sheet Simulation */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-300 shadow-inner font-sans space-y-5 text-xs text-slate-800">
              {/* Kop Surat UB */}
              <div className="border-b-2 border-slate-900 pb-3 text-center space-y-0.5">
                <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                  Kementerian Pendidikan Tinggi, Sains, dan Teknologi
                </div>
                <div className="text-sm font-bold tracking-wide text-slate-900 uppercase">
                  Universitas Brawijaya
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Fakultas Sains dan Teknologi Terapan (FSTeM) — Departemen Kimia
                </div>
                <div className="text-[10px] text-slate-500">
                  Jl. Veteran Malang 65145, Jawa Timur | Telp: (0341) 575838 | Laman: kimia.ub.ac.id
                </div>
              </div>

              {/* Document Header Title */}
              <div className="text-center pt-1">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase underline tracking-wider">
                  {previewDoc.docKey === 'formulir' && 'FORMULIR PENDAFTARAN TUGAS AKHIR & SKRIPSI'}
                  {previewDoc.docKey === 'transkrip' && 'TRANSKRIP NILAI AKADEMIK SEMENTARA MAHASISWA'}
                  {previewDoc.docKey === 'krs' && 'KARTU RENCANA STUDI (KRS) SEMESTER GANJIL 2026/2027'}
                  {previewDoc.docKey === 'fidk' && 'FORMULIR ISIAN DEPARTEMEN KIMIA (FIDK)'}
                  {previewDoc.docKey === 'naskahSeminar' && 'NASKAH PROPOSAL PENELITIAN SKRIPSI'}
                  {previewDoc.docKey === 'beritaAcara' && 'BERITA ACARA SEMINAR PROPOSAL SKRIPSI'}
                </h4>
                <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                  Nomor Registrasi: SIKMA-UB/SKR/2026/{previewDoc.nim.slice(-4)}
                </div>
              </div>

              {/* Student Identity Box */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] font-semibold">Nama Mahasiswa:</span>
                  <div className="font-bold text-slate-900">{previewDoc.studentName}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-semibold">NIM Mahasiswa:</span>
                  <div className="font-mono font-bold text-slate-900">{previewDoc.nim}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-semibold">Program Studi:</span>
                  <div className="font-medium text-slate-800">S1 Kimia FSTeM UB</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-semibold">Status Validasi Dokumen:</span>
                  <div className="font-bold text-emerald-700">
                    {previewDoc.item.statusValidasi === 'Setujui' ? 'DISETUJUI (VALID)' : previewDoc.item.statusValidasi}
                  </div>
                </div>
              </div>

              {/* Specific Content by Document Key */}
              {previewDoc.docKey === 'transkrip' && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-950 text-xs">
                      Verifikasi Kelayakan Akademik: Total Nilai D kurang dari 10%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-emerald-900">
                    <div className="p-2 bg-white rounded border border-emerald-200">
                      Total SKS Lulus: <strong>{selectedSkripsi?.totalSks ?? 123} SKS</strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-emerald-200">
                      SKS Nilai D: <strong>{selectedSkripsi?.sksNilaiD ?? 0} SKS</strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-emerald-200">
                      Persentase Nilai D: <strong>{selectedSkripsi?.persentaseNilaiD ?? 0}%</strong> (Memenuhi Syarat &lt; 10%)
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-700 italic">
                    * Berdasarkan peraturan akademik Departemen Kimia UB, mahasiswa memenuhi syarat mendaftar skripsi.
                  </p>
                </div>
              )}

              {previewDoc.docKey === 'formulir' && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Judul Penelitian Skripsi:</div>
                  <div className="font-bold text-slate-900">{selectedSkripsi?.judul}</div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Dosen Pembimbing I: <strong>{selectedSkripsi?.dosenPembimbing1}</strong> | Pembimbing II:{' '}
                    <strong>{selectedSkripsi?.dosenPembimbing2 || 'Belum Ditentukan'}</strong>
                  </div>
                </div>
              )}

              {previewDoc.docKey === 'krs' && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 text-xs">
                  <div className="font-bold text-slate-800">Daftar Mata Kuliah Terprogram:</div>
                  <div className="p-2 bg-blue-50/70 rounded border border-blue-200 text-blue-950 font-medium">
                    MAK60099 - Skripsi / Tugas Akhir (6 SKS) — Status: Aktif Disetujui Dosen PA
                  </div>
                </div>
              )}

              {previewDoc.docKey === 'fidk' && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 text-xs">
                  <div className="font-bold text-slate-800">Laboratorium Riset Terdaftar:</div>
                  <div className="text-slate-700 font-semibold">{selectedSkripsi?.bidangMinat}</div>
                  <div className="text-[11px] text-slate-500">
                    Bebas kompensasi alat & bahan laboratorium telah divalidasi oleh PLP & Kepala Laboratorium.
                  </div>
                </div>
              )}

              {previewDoc.docKey === 'naskahSeminar' && (
                <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Judul Naskah Proposal:</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedSkripsi?.judul}</div>
                    {selectedSkripsi?.judulInggris && (
                      <div className="text-[11px] text-slate-500 italic mt-0.5">"{selectedSkripsi.judulInggris}"</div>
                    )}
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded border border-blue-200 text-[11px] text-blue-950 space-y-1">
                    <div className="font-bold">Struktur Naskah Seminar Proposal:</div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      <li>BAB I : PENDAHULUAN (Latar Belakang, Rumusan Masalah, Tujuan &amp; Manfaat)</li>
                      <li>BAB II : TINJAUAN PUSTAKA (Teori Reaksi Kimia &amp; Kajian Riset Terdahulu)</li>
                      <li>BAB III : METODOLOGI PENELITIAN (Waktu, Alat &amp; Bahan, Prosedur Kerja &amp; Analisis Instrumen)</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <span>Laboratorium Riset: <strong>{selectedSkripsi?.bidangMinat}</strong></span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui Dosen Pembimbing untuk Seminar
                    </span>
                  </div>
                </div>
              )}

              {previewDoc.docKey === 'beritaAcara' && (() => {
                const prop = selectedSkripsi ? getStudentProposal(selectedSkripsi) : null;
                return (
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-500 font-medium">Hari / Tanggal Seminar:</span>
                        <div className="font-bold text-slate-900">{prop?.tanggal || '24 Maret 2026'}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Waktu (Rentang Jam):</span>
                        <div className="font-mono font-bold text-slate-900">{prop?.jam || '09:00 - 11:00 WIB'}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Tempat / Ruang:</span>
                        <div className="font-bold text-slate-900">{prop?.lokasi || 'Ruang Seminar Kimia'}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Tautan Daring:</span>
                        <div className="font-mono text-blue-700 truncate">{prop?.linkDaring || 'meet.google.com/...'}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded text-[11px] space-y-1">
                      <div className="font-bold text-emerald-950">Hasil Evaluasi &amp; Rekomendasi Tim Penguji:</div>
                      <div className="text-emerald-900">
                        Nilai Akhir: <strong>{prop?.nilaiProposal?.nilaiAkhir.toFixed(2) || '86.50'}</strong> | Huruf Mutu: <strong>{prop?.nilaiProposal?.grade || 'A'}</strong> | Status: <strong>{prop?.nilaiProposal?.statusKelulusan || 'Lulus'}</strong>
                      </div>
                      <div className="text-slate-600 italic pt-1">
                        Catatan Revisi: "{prop?.nilaiProposal?.catatanRevisi || 'Revisi format sitasi dan perjelas metodologi penelitian.'}"
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Watermark / Digital Stamp footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Diverifikasi Secara Elektronik oleh Sistem Informasi Kimia (SIKMA UB)</span>
                </div>
                <div>Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</div>
              </div>
            </div>

            {/* Actions Preview */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationMsg('Dokumen berhasil diunduh (Simulasi PDF).');
                    setTimeout(() => setNotificationMsg(null), 3000);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Berkas</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL VIEW / PRATINJAU DOKUMEN PERSYARATAN YUDISIUM */}
      {/* ======================================================== */}
      {previewYudisiumDoc && selectedSkripsi && (() => {
        const doc = previewYudisiumDoc.doc;
        const cfg = previewYudisiumDoc.config;
        const idx = previewYudisiumDoc.index;

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-300 shadow-2xl p-5 sm:p-6 space-y-4 animate-fadeIn my-6 max-h-[92vh] overflow-y-auto">
              {/* Header Modal View */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Pratinjau Persyaratan Yudisium ({idx + 1}/14)
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">
                        {selectedSkripsi.nim}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                      {cfg.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedSkripsi.namaMahasiswa} — Departemen Kimia FSTeM Universitas Brawijaya
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewYudisiumDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Identity & Document Meta Card */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] font-semibold">Nama Mahasiswa:</span>
                  <div className="font-bold text-slate-900">{selectedSkripsi.namaMahasiswa}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-semibold">NIM Mahasiswa:</span>
                  <div className="font-mono font-bold text-slate-900">{selectedSkripsi.nim}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 text-[10px] font-semibold">Judul Skripsi:</span>
                  <div className="font-medium text-slate-900 leading-snug">{selectedSkripsi.judul}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-semibold">Nama Berkas:</span>
                  <div className="font-mono font-bold text-blue-900 truncate">{doc.fileName}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-semibold">Ukuran &amp; Tanggal Unggah:</span>
                  <div className="text-slate-700">{doc.fileSize || '500 KB'} • {doc.uploadedAt || '2026-06-25'}</div>
                </div>
              </div>

              {/* Simulated Content Body Depending on Document Key */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 text-xs shadow-2xs">
                {/* 1. Foto */}
                {cfg.key === 'foto' && (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="relative w-36 h-48 bg-gradient-to-b from-red-600 to-red-700 rounded-lg shadow-md border-2 border-white flex flex-col items-center justify-end overflow-hidden flex-shrink-0">
                      <div className="absolute top-3 text-[10px] font-mono text-white/70 tracking-widest uppercase">
                        3 x 4 cm
                      </div>
                      <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center mb-4 text-slate-500 shadow-inner">
                        <User className="w-12 h-12 text-slate-400" />
                      </div>
                      <div className="w-full bg-[#002B49] text-white py-1 text-center text-[10px] font-bold">
                        JAS ALMAMATER UB
                      </div>
                    </div>
                    <div className="space-y-2 flex-1 text-[11px] text-slate-700">
                      <div className="font-bold text-slate-900 text-sm">Verifikasi Pas Foto Formal Calon Wisudawan</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-600">
                        <li>Latar belakang warna merah polos standar ijazah nasional</li>
                        <li>Mengenakan jas almamater biru UB, kemeja putih, dan dasi hitam</li>
                        <li>Resolusi tinggi (300 DPI) siap cetak ijazah dan buku kenangan wisuda</li>
                        <li>Status: <strong>Terverifikasi Akademik &amp; Bagian Wisuda</strong></li>
                      </ul>
                      <div className="pt-2 flex items-center gap-2 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Foto memenuhi standar kelulusan Departemen Kimia</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Abstrak Bahasa Inggris */}
                {cfg.key === 'abstrakInggris' && (
                  <div className="space-y-3 font-serif">
                    <div className="text-center pb-2 border-b border-slate-200">
                      <div className="font-bold text-slate-900 uppercase text-xs tracking-wide">
                        {selectedSkripsi.judulInggris || selectedSkripsi.judul}
                      </div>
                      <div className="text-[11px] text-slate-600 italic mt-1">
                        By: {selectedSkripsi.namaMahasiswa} | Advisor: {selectedSkripsi.dosenPembimbing1}
                      </div>
                    </div>
                    <div className="text-center font-bold text-slate-800 text-xs tracking-wider uppercase">
                      ABSTRACT
                    </div>
                    <p className="text-[11px] text-slate-700 text-justify leading-relaxed">
                      Synthesis, characterization, and analytical evaluation of novel chemical compounds were comprehensively investigated in this study within the scope of {selectedSkripsi.bidangMinat}. Spectroscopic analyses employing FTIR, UV-Vis, and Gas Chromatography confirmed high reaction yields and notable structural selectivity.
                    </p>
                    <p className="text-[11px] text-slate-700 text-justify leading-relaxed">
                      The experimental findings demonstrate promising potential for environmental, catalytic, or biomedical applications. The scientific methodology aligns with international peer-reviewed chemistry publication standards.
                    </p>
                    <div className="pt-2 text-[11px] text-slate-800">
                      <strong>Keywords:</strong> Chemistry, Synthesis, Spectroscopy, Reaction Mechanism, Universitas Brawijaya.
                    </div>
                  </div>
                )}

                {/* 3. Sertifikat Prestasi */}
                {cfg.key === 'sertifikatPrestasi' && (
                  <div className="p-5 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/70 rounded-xl border-2 border-amber-300 space-y-3 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] tracking-widest uppercase font-bold text-amber-800 block">
                        SERTIFIKAT PENGHARGAAN &amp; PRESTASI
                      </span>
                      <h4 className="font-bold text-base text-slate-900 mt-1">
                        {selectedSkripsi.namaMahasiswa}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-mono">NIM: {selectedSkripsi.nim}</p>
                    </div>
                    <p className="text-[11px] text-slate-700 max-w-lg mx-auto leading-relaxed">
                      Atas kontribusi dan prestasi akademik sebagai Pemakalah / Juara pada Kompetisi Riset Kimia Terapan &amp; Konferensi Kimia Nasional Universitas Brawijaya.
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-amber-200 text-[10px] text-slate-500">
                      <span>Nomor Sertifikat: SIKMA-PRESTASI/2026/UB-KIM-{selectedSkripsi.nim.slice(-4)}</span>
                      <span className="font-bold text-emerald-700">SKPI Validated</span>
                    </div>
                  </div>
                )}

                {/* 4. Skripsi Format Jurnal */}
                {cfg.key === 'skripsiFormatJurnal' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50/60 rounded border border-blue-200 text-center">
                      <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wide">
                        Jurnal Kimia Terapan &amp; Sains FSTeM Universitas Brawijaya
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mt-1">
                        {selectedSkripsi.judul}
                      </h4>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {selectedSkripsi.namaMahasiswa}*, {selectedSkripsi.dosenPembimbing1}, {selectedSkripsi.dosenPembimbing2 || 'Tim Peneliti'}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-700 leading-relaxed text-justify">
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                        <strong className="block text-slate-900 text-xs">1. PENDAHULUAN</strong>
                        <p>
                          Penelitian ini berfokus pada eksplorasi dan optimasi reaksi kimia dalam laboratorium {selectedSkripsi.bidangMinat.replace('Laboratorium ', '')}. Urgensi pengembangan material kimia ramah lingkungan melandasi rancangan eksperimen ini.
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                        <strong className="block text-slate-900 text-xs">2. HASIL DAN PEMBAHASAN</strong>
                        <p>
                          Karakterisasi spektrofotometri dan rendemen sintesis menunjukkan kemurnian senyawa yang signifikan (&gt; 92%). Nilai spektra bersesuaian dengan literatur internasional.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Cover + Daftar Isi */}
                {cfg.key === 'coverDaftarIsi' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded border border-slate-200 text-center space-y-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        SKRIPSI / TUGAS AKHIR SARJANA
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm max-w-md mx-auto">
                        {selectedSkripsi.judul}
                      </h4>
                      <div className="text-[11px] text-slate-700 pt-1">
                        Disusun oleh: <strong>{selectedSkripsi.namaMahasiswa}</strong> (NIM: {selectedSkripsi.nim})
                      </div>
                      <div className="text-[10px] text-slate-500">
                        DEPARTEMEN KIMIA • FAKULTAS SAINS DAN TEKNOLOGI MAJU • UNIVERSITAS BRAWIJAYA
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 text-[11px] space-y-1 font-mono text-slate-700">
                      <div className="font-bold font-sans text-xs text-slate-900 mb-1">DAFTAR ISI RINGKAS:</div>
                      <div className="flex justify-between border-b border-dotted pb-0.5"><span>HALAMAN JUDUL &amp; PENGESAHAN</span><span>i</span></div>
                      <div className="flex justify-between border-b border-dotted pb-0.5"><span>ABSTRAK &amp; ABSTRACT</span><span>iv</span></div>
                      <div className="flex justify-between border-b border-dotted pb-0.5"><span>BAB I PENDAHULUAN</span><span>1</span></div>
                      <div className="flex justify-between border-b border-dotted pb-0.5"><span>BAB II TINJAUAN PUSTAKA</span><span>8</span></div>
                      <div className="flex justify-between border-b border-dotted pb-0.5"><span>BAB III METODOLOGI PENELITIAN</span><span>24</span></div>
                      <div className="flex justify-between border-b border-dotted pb-0.5"><span>BAB IV HASIL DAN PEMBAHASAN</span><span>35</span></div>
                      <div className="flex justify-between border-b border-dotted pb-0.5"><span>BAB V KESIMPULAN DAN SARAN</span><span>56</span></div>
                      <div className="flex justify-between"><span>BAB VI DAFTAR PUSTAKA &amp; LAMPIRAN</span><span>59</span></div>
                    </div>
                  </div>
                )}

                {/* 6 s.d. 11. Bab 1 s.d. Bab 6 */}
                {cfg.key.startsWith('bab') && (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-blue-50/70 rounded border border-blue-200">
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                        Naskah Komprehensif Skripsi
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-0.5">
                        {cfg.title} : {cfg.desc}
                      </h4>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        Status Verifikasi Naskah: <strong>Disetujui Tim Pembimbing &amp; Penguji</strong>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700 space-y-2 leading-relaxed text-justify">
                      <p>
                        Dokumen berkas <strong>{cfg.title}</strong> telah diformat sesuai Pedoman Penulisan Skripsi Departemen Kimia FSTeM Universitas Brawijaya tahun 2026. File PDF beresolusi tinggi ini mencakup seluruh substansi ilmiah, data tabel terstandarisasi, dan penomoran halaman yang runtut.
                      </p>
                      <div className="p-2 bg-white rounded border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center justify-between">
                        <span>Hash Integritas: SHA256-KIM-{selectedSkripsi.nim}-{cfg.key.toUpperCase()}</span>
                        <span className="text-emerald-700 font-bold">100% Valid</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 12. Bebas Pinjam Lab */}
                {cfg.key === 'bebasPinjamLab' && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-emerald-700" />
                        <div>
                          <div className="font-bold text-emerald-950 text-xs">
                            SURAT KETERANGAN BEBAS PINJAM LABORATORIUM KIMIA
                          </div>
                          <div className="text-[10px] text-emerald-800">
                            FSTeM Universitas Brawijaya • No: 142/UN10.F09.11/LL/2026
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                        BEBAS LAB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      Menerangkan bahwa mahasiswa <strong>{selectedSkripsi.namaMahasiswa}</strong> (NIM: <strong>{selectedSkripsi.nim}</strong>) telah mengembalikan seluruh peralatan gelas, instrumen penelitian, dan tidak memiliki tanggungan bahan kimia di <strong>{selectedSkripsi.bidangMinat}</strong> maupun laboratorium layanan umum lainnya.
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-emerald-200 text-[10px] text-slate-600">
                      <span>Diverifikasi oleh: Pranata Laboratorium Pendidikan (PLP) &amp; Ka. Lab</span>
                      <span className="text-emerald-800 font-bold">Terverifikasi Digital</span>
                    </div>
                  </div>
                )}

                {/* 13. Bebas Pinjam Perpustakaan */}
                {cfg.key === 'bebasPinjamPerpustakaan' && (
                  <div className="p-4 bg-blue-50/70 border border-blue-300 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#002B49]" />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            SURAT KETERANGAN BEBAS PUSTAKA PERPUSTAKAAN PUSAT UB
                          </div>
                          <div className="text-[10px] text-slate-600">
                            UPT Perpustakaan Universitas Brawijaya • No: 882/UN10.32/BP/2026
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                        BEBAS PUSTAKA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      Menyatakan bahwa mahasiswa atas nama <strong>{selectedSkripsi.namaMahasiswa}</strong> (NIM: <strong>{selectedSkripsi.nim}</strong>) tidak memiliki pinjaman buku perpustakaan atau denda tertunggak, serta telah mengunggah mandiri naskah akhir skripsi ke Repositori Universitas Brawijaya.
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200 text-[10px] text-slate-600">
                      <span>Barcode Registrasi: UB-LIB-2026-{selectedSkripsi.nim}</span>
                      <span className="text-blue-900 font-bold">Lolos Validasi Repositori</span>
                    </div>
                  </div>
                )}

                {/* 14. Bio Data Sarjana */}
                {cfg.key === 'bioDataSarjana' && (() => {
                  const b = selectedSkripsi.bioDataSarjana || {
                    nama: selectedSkripsi.namaMahasiswa,
                    nim: selectedSkripsi.nim,
                    programStudi: 'S1 Kimia',
                    nik: `350704${selectedSkripsi.nim.slice(-6).padStart(6, '0')}0001`,
                    tanggalLahir: '2002-09-14',
                    tempatLahir: 'Malang',
                    jenisKelamin: selectedSkripsi.namaMahasiswa.toLowerCase().includes('putri') ||
                      selectedSkripsi.namaMahasiswa.toLowerCase().includes('siti') ||
                      selectedSkripsi.namaMahasiswa.toLowerCase().includes('nur') ||
                      selectedSkripsi.namaMahasiswa.toLowerCase().includes('safitri') ? 'Perempuan' : 'Laki-laki',
                    statusPerkawinan: 'Belum Menikah',
                    agama: 'Islam',
                    alamat: 'Jl. Veteran No. 10, Ketawanggede, Lowokwaru, Kota Malang, Jawa Timur 65145',
                    terminalCutiAkademik: '0 Semester (Tidak Pernah Cuti)',
                    telepon: selectedSkripsi.noHpOrangTua || '081234567890',
                    email: `${selectedSkripsi.nim}@student.ub.ac.id`,
                    namaAyah: 'Bambang Sudarsono, S.E.',
                    pekerjaanAyah: 'Pegawai Negeri Sipil (PNS)',
                    teleponAyah: selectedSkripsi.noHpOrangTua || '081234567890',
                    namaIbu: 'Siti Rahmawati, S.Pd.',
                    pekerjaanIbu: 'Guru / Tenaga Pendidik',
                    tanggalMulaiTA: '01 September 2025',
                    tanggalLulus: selectedSkripsi.tanggal || selectedSkripsi.proposal?.tanggal || '18 Juni 2026',
                    dosenPembimbing1: selectedSkripsi.dosenPembimbing1,
                    dosenPembimbing2: selectedSkripsi.dosenPembimbing2 || '-',
                    nilaiSkripsi: selectedSkripsi.nilai ? String(selectedSkripsi.nilai) : (selectedSkripsi.proposal?.nilaiProposal?.nilaiAkhir ? String(selectedSkripsi.proposal.nilaiProposal.nilaiAkhir) : '88.50'),
                    predikatLulus: Number(selectedSkripsi.ipk || 3.82) >= 3.75 ? 'Dengan Pujian (Cum Laude)' : 'Sangat Memuaskan',
                    ipk: String(selectedSkripsi.ipk ? Number(selectedSkripsi.ipk).toFixed(2) : '3.82'),
                    sks: String(selectedSkripsi.jumlahSks ?? selectedSkripsi.totalSks ?? 144),
                    lamaStudiTahun: '3',
                    lamaStudiBulan: '9',
                    lamaStudiHari: '15',
                    judul: selectedSkripsi.judul,
                    judulInggris: selectedSkripsi.judulInggris || 'Synthesis and Characterization of Novel Chemical Compounds for Sustainable Energy Applications'
                  };

                  return (
                    <div className="space-y-3.5">
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">BIODATA LENGKAP CALON SARJANA KIMIA</div>
                          <div className="text-[10px] text-slate-600">Verifikasi Berkas Ijazah, Transkrip &amp; Yudisium Departemen Kimia</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewYudisiumDoc(null);
                            handleOpenBioDataModal();
                          }}
                          className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 border border-yellow-500 rounded-lg text-[10px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-slate-900" />
                          <span>Edit / Generate Bio Data</span>
                        </button>
                      </div>

                      {/* Box 1: Data Sarjana */}
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                        <div className="font-bold text-slate-800 text-[11px] pb-1 border-b border-slate-200 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-600" />
                          <span>1. Data Sarjana</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                          <div><span className="text-slate-400 block">Nama:</span><strong className="text-slate-800">{b.nama}</strong></div>
                          <div><span className="text-slate-400 block">NIM:</span><strong className="font-mono text-slate-800">{b.nim}</strong></div>
                          <div><span className="text-slate-400 block">Program Studi:</span><strong className="text-slate-800">{b.programStudi}</strong></div>
                          <div><span className="text-slate-400 block">NIK:</span><strong className="font-mono text-slate-800">{b.nik}</strong></div>
                          <div><span className="text-slate-400 block">Tempat / Tgl Lahir:</span><strong className="text-slate-800">{b.tempatLahir}, {b.tanggalLahir}</strong></div>
                          <div><span className="text-slate-400 block">Jenis Kelamin:</span><strong className="text-slate-800">{b.jenisKelamin}</strong></div>
                          <div><span className="text-slate-400 block">Status Perkawinan:</span><strong className="text-slate-800">{b.statusPerkawinan}</strong></div>
                          <div><span className="text-slate-400 block">Agama:</span><strong className="text-slate-800">{b.agama}</strong></div>
                          <div><span className="text-slate-400 block">Telepon:</span><strong className="font-mono text-slate-800">{b.telepon}</strong></div>
                          <div><span className="text-slate-400 block">Email:</span><strong className="text-slate-800">{b.email}</strong></div>
                          <div className="sm:col-span-2"><span className="text-slate-400 block">Terminal / Cuti Akademik:</span><strong className="text-slate-800">{b.terminalCutiAkademik}</strong></div>
                          <div className="col-span-2 sm:col-span-3"><span className="text-slate-400 block">Alamat:</span><strong className="text-slate-800">{b.alamat}</strong></div>
                        </div>
                      </div>

                      {/* Box 2: Data Orang Tua */}
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                        <div className="font-bold text-slate-800 text-[11px] pb-1 border-b border-slate-200 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>2. Data Orang Tua</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                          <div><span className="text-slate-400 block">Nama Ayah:</span><strong className="text-slate-800">{b.namaAyah}</strong></div>
                          <div><span className="text-slate-400 block">Pekerjaan Ayah:</span><strong className="text-slate-800">{b.pekerjaanAyah}</strong></div>
                          <div><span className="text-slate-400 block">Telepon Ayah:</span><strong className="font-mono text-slate-800">{b.teleponAyah}</strong></div>
                          <div><span className="text-slate-400 block">Nama Ibu:</span><strong className="text-slate-800">{b.namaIbu}</strong></div>
                          <div className="sm:col-span-2"><span className="text-slate-400 block">Pekerjaan Ibu:</span><strong className="text-slate-800">{b.pekerjaanIbu}</strong></div>
                        </div>
                      </div>

                      {/* Box 3: Data Akhir Pendidikan */}
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                        <div className="font-bold text-slate-800 text-[11px] pb-1 border-b border-slate-200 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>3. Data Akhir Pendidikan</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                          <div><span className="text-slate-400 block">Tanggal Mulai TA:</span><strong className="text-slate-800">{b.tanggalMulaiTA}</strong></div>
                          <div><span className="text-slate-400 block">Tanggal Lulus:</span><strong className="text-slate-800">{b.tanggalLulus}</strong></div>
                          <div><span className="text-slate-400 block">Pembimbing 1:</span><strong className="text-slate-800">{b.dosenPembimbing1}</strong></div>
                          <div><span className="text-slate-400 block">Pembimbing 2:</span><strong className="text-slate-800">{b.dosenPembimbing2 || '-'}</strong></div>
                          <div><span className="text-slate-400 block">Nilai Skripsi:</span><strong className="text-emerald-700 font-bold">{b.nilaiSkripsi}</strong></div>
                          <div><span className="text-slate-400 block">Predikat Lulus:</span><strong className="text-slate-800">{b.predikatLulus}</strong></div>
                          <div><span className="text-slate-400 block">IPK:</span><strong className="text-amber-800 font-bold">{b.ipk}</strong></div>
                          <div><span className="text-slate-400 block">SKS:</span><strong className="text-blue-800 font-bold">{b.sks} SKS</strong></div>
                          <div className="col-span-2 sm:col-span-4"><span className="text-slate-400 block">Lama Studi:</span><strong className="text-slate-800">{b.lamaStudiTahun} Tahun {b.lamaStudiBulan} Bulan {b.lamaStudiHari} Hari</strong></div>
                          <div className="col-span-2 sm:col-span-4"><span className="text-slate-400 block">Judul Skripsi:</span><p className="text-slate-800 mt-0.5 leading-relaxed font-semibold">{b.judul}</p></div>
                          <div className="col-span-2 sm:col-span-4"><span className="text-slate-400 block">Judul (in English):</span><p className="text-slate-700 mt-0.5 italic leading-relaxed">{b.judulInggris}</p></div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Digital Verification Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Diverifikasi oleh Bagian Akademik &amp; Kemahasiswaan Departemen Kimia</span>
                  </div>
                  <div>Dicetak: {new Date().toLocaleDateString('id-ID')}</div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationMsg(`Dokumen "${doc.fileName}" berhasil diunduh.`);
                      setTimeout(() => setNotificationMsg(null), 3000);
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Berkas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Dokumen</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewYudisiumDoc(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup Preview
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL GENERATE BIO DATA SARJANA */}
      {isBioDataModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn my-6">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#002B49] text-white flex items-center justify-between border-b border-[#003865] flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-900 flex items-center justify-center shadow-sm flex-shrink-0 font-bold">
                  <Sparkles className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-white">Formulir Bio Data Sarjana</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400 text-slate-900 border border-yellow-500">
                      Persyaratan Yudisium
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Departemen Kimia • Fakultas Sains, Teknologi, dan Matematika Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBioDataModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveBioData} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/60 text-xs">
              
              {/* 1. BOX / MODAL DATA SARJANA */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2.5 border-b border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Data Sarjana</h4>
                      <p className="text-[10px] text-slate-500">Identitas Pribadi dan Kependudukan Mahasiswa</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Bagian 1
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Nama */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nama <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.nama}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, nama: e.target.value })}
                        placeholder="Nama Lengkap Mahasiswa"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    {/* NIM */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        NIM <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.nim}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, nim: e.target.value })}
                        placeholder="NIM Mahasiswa"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    {/* Program Studi */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Program Studi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.programStudi}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, programStudi: e.target.value })}
                        placeholder="Contoh: S1 Kimia"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* NIK */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        NIK <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.nik}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, nik: e.target.value })}
                        placeholder="16 Digit NIK KTP"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    {/* Tanggal Lahir */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Tanggal Lahir <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.tanggalLahir}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, tanggalLahir: e.target.value })}
                        placeholder="Contoh: 14 September 2002"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    {/* Tempat Lahir */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Tempat Lahir <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.tempatLahir}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, tempatLahir: e.target.value })}
                        placeholder="Kota Tempat Lahir"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Jenis Kelamin (bentuk select : Perempuan or Laki-laki) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Jenis Kelamin <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={bioDataForm.jenisKelamin}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, jenisKelamin: e.target.value as 'Perempuan' | 'Laki-laki' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-amber-500 bg-white cursor-pointer"
                      >
                        <option value="Perempuan">Perempuan</option>
                        <option value="Laki-laki">Laki-laki</option>
                      </select>
                    </div>

                    {/* Status Perkawinan (bentuk select : Belum Menikah, Menikah, Cerai Hidup, Cerai Mati) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Status Perkawinan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={bioDataForm.statusPerkawinan}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, statusPerkawinan: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-amber-500 bg-white cursor-pointer"
                      >
                        <option value="Belum Menikah">Belum Menikah</option>
                        <option value="Menikah">Menikah</option>
                        <option value="Cerai Hidup">Cerai Hidup</option>
                        <option value="Cerai Mati">Cerai Mati</option>
                      </select>
                    </div>

                    {/* Agama (bentuk select : Islam, Kristen, Katolik, Hindu, Budha, Konghucu) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Agama <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={bioDataForm.agama}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, agama: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-amber-500 bg-white cursor-pointer"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Budha">Budha</option>
                        <option value="Konghucu">Konghucu</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Alamat */}
                    <div className="sm:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">
                        Alamat <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={bioDataForm.alamat}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, alamat: e.target.value })}
                        placeholder="Alamat Domisili / Tempat Tinggal Lengkap..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500 bg-white resize-y"
                      />
                    </div>

                    {/* Terminal/Cuti Akademik */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Terminal/Cuti Akademik <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.terminalCutiAkademik}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, terminalCutiAkademik: e.target.value })}
                        placeholder="Contoh: 0 Semester (Tidak Pernah Cuti)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    {/* Telepon */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Telepon <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.telepon}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, telepon: e.target.value })}
                        placeholder="Contoh: 081234567890"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={bioDataForm.email}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, email: e.target.value })}
                        placeholder="email@student.ub.ac.id"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. BOX / MODAL DATA ORANG TUA */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 border-b border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Data Orang Tua</h4>
                      <p className="text-[10px] text-slate-500">Informasi Ayah dan Ibu Mahasiswa</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Bagian 2
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Nama Ayah */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nama Ayah <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.namaAyah}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, namaAyah: e.target.value })}
                        placeholder="Nama Lengkap Ayah"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    {/* Pekerjaan Ayah */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Pekerjaan Ayah <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.pekerjaanAyah}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, pekerjaanAyah: e.target.value })}
                        placeholder="Pekerjaan / Profesi Ayah"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    {/* Telepon Ayah */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Telepon Ayah <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.teleponAyah}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, teleponAyah: e.target.value })}
                        placeholder="No. Telepon / HP Ayah"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nama Ibu */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nama Ibu <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.namaIbu}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, namaIbu: e.target.value })}
                        placeholder="Nama Lengkap Ibu"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    {/* Pekerjaan Ibu */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Pekerjaan Ibu <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.pekerjaanIbu}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, pekerjaanIbu: e.target.value })}
                        placeholder="Pekerjaan / Profesi Ibu"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. BOX / MODAL DATA AKHIR PENDIDIKAN */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2.5 border-b border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Data Akhir Pendidikan</h4>
                      <p className="text-[10px] text-slate-500">Rekapitulasi Tugas Akhir &amp; Kelulusan Sarjana</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Bagian 3
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Tanggal Mulai TA */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Tanggal Mulai TA <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.tanggalMulaiTA}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, tanggalMulaiTA: e.target.value })}
                        placeholder="Contoh: 01 September 2025"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    {/* Tanggal Lulus */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Tanggal Lulus <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.tanggalLulus}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, tanggalLulus: e.target.value })}
                        placeholder="Contoh: 18 Juni 2026"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Dosen Pembimbing 1 */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Dosen Pembimbing 1 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.dosenPembimbing1}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, dosenPembimbing1: e.target.value })}
                        placeholder="Nama Lengkap & Gelar Pembimbing 1"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    {/* Dosen Pembimbing 2 */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Dosen Pembimbing 2
                      </label>
                      <input
                        type="text"
                        value={bioDataForm.dosenPembimbing2}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, dosenPembimbing2: e.target.value })}
                        placeholder="Nama Lengkap & Gelar Pembimbing 2 (jika ada)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Nilai Skripsi */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nilai Skripsi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.nilaiSkripsi}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, nilaiSkripsi: e.target.value })}
                        placeholder="Contoh: 88.50"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    {/* Predikat Lulus */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Predikat Lulus <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.predikatLulus}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, predikatLulus: e.target.value })}
                        placeholder="Dengan Pujian / Sangat Memuaskan"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    {/* IPK */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        IPK <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.ipk}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, ipk: e.target.value })}
                        placeholder="Contoh: 3.82"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-amber-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    {/* SKS */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        SKS <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bioDataForm.sks}
                        onChange={(e) => setBioDataForm({ ...bioDataForm, sks: e.target.value })}
                        placeholder="Contoh: 144"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Lama Studi(Tahun), Lama Studi(Bulan), Lama Studi(Hari) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Lama Studi <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold mb-0.5">Lama Studi (Tahun)</div>
                        <input
                          type="text"
                          required
                          value={bioDataForm.lamaStudiTahun}
                          onChange={(e) => setBioDataForm({ ...bioDataForm, lamaStudiTahun: e.target.value })}
                          placeholder="3"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold mb-0.5">Lama Studi (Bulan)</div>
                        <input
                          type="text"
                          required
                          value={bioDataForm.lamaStudiBulan}
                          onChange={(e) => setBioDataForm({ ...bioDataForm, lamaStudiBulan: e.target.value })}
                          placeholder="9"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold mb-0.5">Lama Studi (Hari)</div>
                        <input
                          type="text"
                          required
                          value={bioDataForm.lamaStudiHari}
                          onChange={(e) => setBioDataForm({ ...bioDataForm, lamaStudiHari: e.target.value })}
                          placeholder="15"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Judul */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Judul <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={bioDataForm.judul}
                      onChange={(e) => setBioDataForm({ ...bioDataForm, judul: e.target.value })}
                      placeholder="Judul Tugas Akhir / Skripsi (Bahasa Indonesia)..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500 bg-white resize-y leading-relaxed"
                    />
                  </div>

                  {/* Judul (in English) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Judul (in English) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={bioDataForm.judulInggris}
                      onChange={(e) => setBioDataForm({ ...bioDataForm, judulInggris: e.target.value })}
                      placeholder="Undergraduate Thesis Title (in English)..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium italic focus:ring-2 focus:ring-emerald-500 bg-white resize-y leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Formulir Bio Data</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsBioDataModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-slate-900 border border-yellow-500 rounded-xl font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-900" />
                    <span>Generate &amp; Simpan Bio Data</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SKRIPSI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tambah Usulan Skripsi</h3>
                  <p className="text-xs text-slate-500">
                    Departemen Kimia FSTeM Universitas Brawijaya
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSkripsi} className="space-y-3.5 text-xs">
              {/* Row 1: NIM & Nama Mahasiswa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIM Mahasiswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 215090200111012"
                    value={formNim}
                    onChange={(e) => setFormNim(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Mahasiswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Mahasiswa..."
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              {/* Row 2: Tahapan Skripsi & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tahapan Skripsi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTahapan}
                    onChange={(e) =>
                      setFormTahapan(e.target.value as 'Mendaftar' | 'Proposal' | 'Kemajuan' | 'Ujian Akhir Skripsi')
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                    required
                  >
                    <option value="Mendaftar">Mendaftar</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Kemajuan">Kemajuan</option>
                    <option value="Ujian Akhir Skripsi">Ujian Akhir Skripsi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Skripsi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Gagal')}
                    className={`w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer ${
                      formStatus === 'Gagal' ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                    required
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Gagal">Gagal</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Judul Skripsi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Skripsi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tuliskan judul usulan penelitian skripsi..."
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              {/* Row 4: Dosen Pembimbing 1 & Dosen Pembimbing 2 (Database Dosen) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Dosen Pembimbing 1 <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    value={formPembimbing1}
                    onChange={(e) => setFormPembimbing1(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Dosen Pembimbing 1 --</option>
                    {dosenNameOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Dosen Pembimbing 2
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    value={formPembimbing2}
                    onChange={(e) => setFormPembimbing2(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                  >
                    <option value="">-- Tidak Ada / Dosen Pendamping (Opsional) --</option>
                    {dosenNameOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Dosen Penguji (Database Dosen) & No Handphone Orang Tua */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Dosen Penguji
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    value={formPenguji}
                    onChange={(e) => setFormPenguji(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                  >
                    <option value="">-- Pilih Dosen Penguji --</option>
                    {dosenNameOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No Handphone Orang Tua
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={formNoHpOrtu}
                      onChange={(e) => setFormNoHpOrtu(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Semester & Tahun Akademik & Bidang Minat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    Semester &amp; Tahun Akademik <span className="text-rose-500">*</span>
                  </label>
                  {/* Database Master Semester */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block mb-1">
                      Pilih dari Database Semester:
                    </span>
                    <select
                      value={formNamaSemester}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const matched = semesterDatabase.find((s) => s.namaSemester === selectedVal);
                        setFormNamaSemester(selectedVal);
                        if (matched) {
                          setFormSemester(
                            matched.tipe === 'Ganjil'
                              ? formSemester % 2 === 0
                                ? formSemester + 1
                                : formSemester
                              : formSemester % 2 !== 0
                              ? formSemester + 1
                              : formSemester
                          );
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                      required
                    >
                      {semesterDatabase.map((sem) => (
                        <option key={sem.id} value={sem.namaSemester}>
                          {sem.namaSemester} {sem.status === 'Aktif' ? '• (Semester Aktif)' : `• (${sem.status})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Tingkat Semester */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                      Tingkat Semester:
                    </span>
                    <div className="flex items-center gap-1.5 w-full">
                      <span className="text-xs text-slate-500 font-semibold">Semester</span>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={formSemester}
                        onChange={(e) => setFormSemester(Number(e.target.value))}
                        className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bidang Minat (Laboratorium) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formLab}
                    onChange={(e) => setFormLab(e.target.value as LabRiset)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                  >
                    {labOptions.map((lab) => (
                      <option key={lab} value={lab}>
                        {lab}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 7: IPK & Jumlah SKS Lulus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    IPK (Indeks Prestasi Kumulatif) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.00"
                    required
                    value={formIpk}
                    onChange={(e) => setFormIpk(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jumlah SKS Lulus <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="160"
                    required
                    value={formJumlahSks}
                    onChange={(e) => setFormJumlahSks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              {/* Jadwal & Evaluasi Seminar/Ujian (Tanggal, Jam, Lokasi, Link Daring, Nilai) */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-blue-200/60">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#002B49]" />
                    <span>Jadwal &amp; Evaluasi (Proposal, Kemajuan, Ujian Akhir Skripsi)</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                    Muncul di Rincian Tahapan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                    <input
                      type="text"
                      placeholder="Contoh: 24 Maret 2026"
                      value={formTanggal}
                      onChange={(e) => setFormTanggal(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jam (rentang waktu)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 09:00 - 11:00 WIB"
                      value={formJam}
                      onChange={(e) => setFormJam(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ruang Seminar Gedung Kimia Lt. 2 (R. 204)"
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Link Daring</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        placeholder="https://meet.google.com/..."
                        value={formLinkDaring}
                        onChange={(e) => setFormLinkDaring(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-[11px] font-mono focus:ring-2 focus:ring-[#002B49] bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nilai</label>
                    <input
                      type="text"
                      placeholder="Contoh: 86.50"
                      value={formNilai}
                      onChange={(e) => setFormNilai(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#002B49] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 8: Catatan Kemajuan / Keterangan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Kemajuan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Menunggu review judul dari komisi skripsi..."
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Simpan Usulan Skripsi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
