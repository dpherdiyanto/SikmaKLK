import React, { useState, useMemo } from 'react';
import { TesisMahasiswaItem, TahapanTesis, TesisStatus, UserRole, Mahasiswa, Dosen, DataIndukMahasiswaS2 } from '../types/sikma';
import { INITIAL_TESIS_LIST } from '../data/tesisList';
import { INITIAL_DOSEN } from '../data/mockData';
import { DataIndukS2Modal } from './DataIndukS2Modal';
import {
  GraduationCap,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Video,
  X,
  Check,
  AlertCircle,
  FileText,
  User,
  UserCheck,
  Users,
  Award,
  BookOpen,
  Printer,
  Pencil,
  Layers,
  FolderOpen,
  FlaskConical,
  FileCheck,
  ExternalLink,
  Upload,
  Download,
  Share2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Link2,
  FileCheck2,
  Mail,
  Bell,
  ZoomIn,
  ZoomOut,
  RotateCw,
  QrCode
} from 'lucide-react';

export type TahapanTesisTab =
  | 'Pengajuan Judul'
  | 'Seminar Proposal'
  | 'Seminar proposal'
  | 'Seminar Hasil'
  | 'Publikasi'
  | 'Ujian Tesis'
  | 'Diseminasi Tesis';

export const LIST_STATUS_TESIS: TesisStatus[] = [
  'Disetujui',
  'Menunggu Verifikasi',
  'Ditolak'
];

interface TesisViewProps {
  currentRole: UserRole;
  student?: Mahasiswa;
  dosenList?: Dosen[];
}

export const TesisView: React.FC<TesisViewProps> = ({
  currentRole,
  student,
  dosenList = []
}) => {
  // Persistence via localStorage
  const [tesisList, setTesisList] = useState<TesisMahasiswaItem[]>(() => {
    const saved = localStorage.getItem('sikma_tesis_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: TesisMahasiswaItem) => {
            let tahapan = item.tahapan;
            if (tahapan === 'Usulan Tesis') tahapan = 'Pengajuan Judul';
            else if (tahapan === 'Proposal Tesis') tahapan = 'Seminar Proposal';
            else if (tahapan === 'Seminar Hasil Tesis') tahapan = 'Seminar Hasil';
            else if (tahapan === 'Revisi & Publikasi') tahapan = 'Publikasi';
            else if (tahapan === 'Ujian Akhir Tesis') tahapan = 'Ujian Tesis';
            else if (tahapan === 'Lulus') tahapan = 'Diseminasi Tesis';

            let status = item.status;
            if (status === 'Aktif' || status === 'Selesai' || !status) {
              status = 'Disetujui';
            } else if (status === 'Revisi') {
              status = 'Menunggu Verifikasi';
            }
            return { ...item, tahapan, status: status as TesisStatus };
          });
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_TESIS_LIST;
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTahapan, setFilterTahapan] = useState<string>('Semua');

  // Pagination (10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal State
  const [selectedTesis, setSelectedTesis] = useState<TesisMahasiswaItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Direct Status synchronization handler for form Rincian Tesis & Tugas Akhir Mahasiswa
  const handleDirectStatusChange = (newStatus: TesisStatus) => {
    if (!selectedTesis) return;
    const updatedItem: TesisMahasiswaItem = {
      ...selectedTesis,
      status: newStatus
    };
    setSelectedTesis(updatedItem);
    const updatedList = tesisList.map((t) => (t.id === updatedItem.id ? updatedItem : t));
    setTesisList(updatedList);
    localStorage.setItem('sikma_tesis_data', JSON.stringify(updatedList));
    setNotificationMsg(`Status Tesis mahasiswa ${updatedItem.namaMahasiswa} berhasil disinkronisasikan menjadi "${newStatus}"!`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Active Tab in Box Sisi Kanan "Tahapan Tesis"
  const [activeTahapanTab, setActiveTahapanTab] = useState<TahapanTesisTab>('Pengajuan Judul');

  // Preview Document Modal for Stage
  const [stagePreviewDoc, setStagePreviewDoc] = useState<{
    title: string;
    filename: string;
    category: string;
    stage: TahapanTesisTab;
    date: string;
    status: string;
    details?: string;
  } | null>(null);

  // Rubrik Nilai Modal for Stage
  const [isRubrikModalOpen, setIsRubrikModalOpen] = useState(false);
  const [rubrikStage, setRubrikStage] = useState<'Seminar Proposal' | 'Seminar proposal' | 'Seminar Hasil' | 'Ujian Tesis'>('Seminar Proposal');
  const [rubrikValues, setRubrikValues] = useState({
    nilaiMateri: 90,
    nilaiMetodologi: 88,
    nilaiPenyampaian: 89,
    nilaiPublikasi: 92,
    catatanPenguji: 'Penyusunan naskah tesis dan metodologi analisis laboratorium memenuhi standar kelulusan S2 Magister Kimia.'
  });

  // Modal Form Berkas Seminar Proposal Tesis
  const [isBerkasSeminarModalOpen, setIsBerkasSeminarModalOpen] = useState(false);
  const [formLinkBerkasProposal, setFormLinkBerkasProposal] = useState('');
  const [beritaAcaraFile, setBeritaAcaraFile] = useState<File | null>(null);
  const [beritaAcaraFileName, setBeritaAcaraFileName] = useState('');
  const [isBeritaAcaraUploaded, setIsBeritaAcaraUploaded] = useState(false);
  const [beritaAcaraFileSize, setBeritaAcaraFileSize] = useState('');
  const [beritaAcaraUploadDate, setBeritaAcaraUploadDate] = useState('');

  // PDF Viewer Modal for Seminar Proposal Documents (Berita Acara, Undangan, Pemberitahuan, Permohonan)
  const [activePdfDoc, setActivePdfDoc] = useState<{
    type: 'Berita Acara' | 'Undangan' | 'Pemberitahuan' | 'Permohonan';
    title: string;
    nomorSurat: string;
    tanggalSurat: string;
    filename: string;
    perihal: string;
    studentName: string;
    studentNim: string;
    studentProdi: string;
    judul: string;
    judulInggris?: string;
    dosen1: string;
    dosen2?: string;
    tanggalUjian: string;
    jamUjian: string;
    lokasi: string;
    linkDaring: string;
    nilai?: string;
    predikat?: string;
  } | null>(null);

  const [pdfZoom, setPdfZoom] = useState<number>(100);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nim: '',
    namaMahasiswa: '',
    dosenPembimbing: '',
    dosenPembimbing2: '',
    judul: '',
    judulInggris: '',
    tahapan: 'Proposal Tesis' as TahapanTesis,
    status: 'Aktif' as 'Aktif' | 'Selesai' | 'Revisi' | 'Menunggu Verifikasi',
    nilai: '88.50',
    tanggal: '12 November 2026',
    jam: '09:00 - 11:30 WIB',
    lokasi: 'Ruang Sidang Pascasarjana Gedung Kimia Lt. 3',
    linkDaring: 'https://meet.google.com/tesis-kim-s2ub',
    catatanKemajuan: ''
  });

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
    tesisList.forEach((t) => {
      if (t.dosenPembimbing && !names.includes(t.dosenPembimbing)) names.push(t.dosenPembimbing);
      if (t.dosenPembimbing2 && !names.includes(t.dosenPembimbing2)) names.push(t.dosenPembimbing2);
    });
    return Array.from(new Set(names)).filter(Boolean);
  }, [dosenDatabase, tesisList]);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formNim, setFormNim] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formDosen, setFormDosen] = useState("Prof. Dr. Aulanni'am, drh., DES");
  const [formDosen2, setFormDosen2] = useState('Masruri, S.Si., M.Si., Ph.D');
  const [formJudul, setFormJudul] = useState('');
  const [formJudulInggris, setFormJudulInggris] = useState('');
  const [formTahapan, setFormTahapan] = useState<TahapanTesis>('Pengajuan Judul');
  const [formStatus, setFormStatus] = useState<TesisStatus>('Disetujui');
  const [formTanggal, setFormTanggal] = useState('15 Desember 2026');
  const [formJam, setFormJam] = useState('09:00 - 11:30 WIB');
  const [formLokasi, setFormLokasi] = useState('Ruang Sidang Pascasarjana Gedung Kimia Lt. 3');
  const [formLinkDaring, setFormLinkDaring] = useState('https://meet.google.com/tesis-kim-s2ub');
  const [formError, setFormError] = useState<string | null>(null);

  // Toast notification
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Data Induk Mahasiswa S2 Modal State
  const [isDataIndukModalOpen, setIsDataIndukModalOpen] = useState(false);
  const [dataIndukStudent, setDataIndukStudent] = useState<TesisMahasiswaItem | null>(null);

  const handleOpenDataInduk = (item?: TesisMahasiswaItem | null) => {
    const target = item || selectedTesis || tesisList[0] || null;
    setDataIndukStudent(target);
    setIsDataIndukModalOpen(true);
  };

  const handleSaveDataIndukSuccess = (data: DataIndukMahasiswaS2) => {
    setTesisList((prev) =>
      prev.map((t) => {
        if (t.nim === data.nim) {
          return {
            ...t,
            namaMahasiswa: data.nama || t.namaMahasiswa,
            judul: data.judul || t.judul,
            judulInggris: data.judulInggris || t.judulInggris,
            dosenPembimbing: data.dosenPembimbing1 || t.dosenPembimbing,
            dosenPembimbing2: data.dosenPembimbing2 || t.dosenPembimbing2,
            dataInduk: data
          };
        }
        return t;
      })
    );
    if (selectedTesis && selectedTesis.nim === data.nim) {
      setSelectedTesis((prev) => ({
        ...prev,
        namaMahasiswa: data.nama || prev.namaMahasiswa,
        judul: data.judul || prev.judul,
        judulInggris: data.judulInggris || prev.judulInggris,
        dosenPembimbing: data.dosenPembimbing1 || prev.dosenPembimbing,
        dosenPembimbing2: data.dosenPembimbing2 || prev.dosenPembimbing2,
        dataInduk: data
      }));
    }
    setNotificationMsg(`Data Induk Mahasiswa S2 (${data.nama}) berhasil diperbarui!`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const tahapanList: TahapanTesis[] = [
    'Pengajuan Judul',
    'Seminar Proposal',
    'Seminar Hasil',
    'Publikasi',
    'Ujian Tesis',
    'Diseminasi Tesis'
  ];

  // Helper for Status badge styling
  const getStatusBadgeStyle = (status?: string): string => {
    switch (status) {
      case 'Disetujui':
      case 'Aktif':
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Menunggu Verifikasi':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Ditolak':
      case 'Revisi':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const STAGES_ORDER: TahapanTesisTab[] = [
    'Pengajuan Judul',
    'Seminar Proposal',
    'Seminar Hasil',
    'Publikasi',
    'Ujian Tesis',
    'Diseminasi Tesis'
  ];

  const normalizeStageName = (stage: string): TahapanTesisTab => {
    if (stage === 'Seminar proposal' || stage === 'Proposal Tesis') return 'Seminar Proposal';
    if (stage === 'Usulan Tesis') return 'Pengajuan Judul';
    if (stage === 'Seminar Hasil Tesis') return 'Seminar Hasil';
    if (stage === 'Revisi & Publikasi') return 'Publikasi';
    if (stage === 'Ujian Akhir Tesis') return 'Ujian Tesis';
    if (stage === 'Lulus') return 'Diseminasi Tesis';
    return stage as TahapanTesisTab;
  };

  // Helper for Tahapan Tesis status label (disinkronisasikan langsung dengan input Status item)
  const getStageStatusLabel = (stage: TahapanTesisTab, item: TesisMahasiswaItem): string => {
    const currentNorm = normalizeStageName(item.tahapan);
    const targetNorm = normalizeStageName(stage);
    const currentIdx = STAGES_ORDER.indexOf(currentNorm);
    const targetIdx = STAGES_ORDER.indexOf(targetNorm);

    // Jika ini adalah tahapan aktif/saat ini dari tesis mahasiswa, tampilkan status langsung dari input usulan
    if (currentIdx === targetIdx || currentNorm === targetNorm) {
      return item.status || 'Disetujui';
    }
    // Jika tahapan tersebut sudah terlewati
    if (currentIdx > -1 && targetIdx > -1 && targetIdx < currentIdx) {
      return 'Selesai / Lulus';
    }
    // Jika tahapan mendatang
    return 'Menunggu Tahapan';
  };

  // Helper for Tahapan Tesis status badge class
  const getStageStatusBadgeClass = (stage: TahapanTesisTab, item: TesisMahasiswaItem): string => {
    const currentNorm = normalizeStageName(item.tahapan);
    const targetNorm = normalizeStageName(stage);
    const currentIdx = STAGES_ORDER.indexOf(currentNorm);
    const targetIdx = STAGES_ORDER.indexOf(targetNorm);

    if (currentIdx === targetIdx || currentNorm === targetNorm) {
      return getStatusBadgeStyle(item.status);
    }
    if (currentIdx > -1 && targetIdx > -1 && targetIdx < currentIdx) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  // Helper for Tahapan Tesis description (disinkronisasikan dengan status dan nilai dari input)
  const getStageStatusDescription = (stage: TahapanTesisTab, item: TesisMahasiswaItem): string => {
    const currentNorm = normalizeStageName(item.tahapan);
    const targetNorm = normalizeStageName(stage);
    const currentIdx = STAGES_ORDER.indexOf(currentNorm);
    const targetIdx = STAGES_ORDER.indexOf(targetNorm);

    if (currentIdx === targetIdx || currentNorm === targetNorm) {
      if (item.status === 'Ditolak') {
        return `Usulan tesis pada tahapan ${targetNorm} berstatus Ditolak dan memerlukan revisi/pengajuan ulang.`;
      }
      if (item.status === 'Menunggu Verifikasi') {
        return `Usulan tesis pada tahapan ${targetNorm} sedang dalam proses verifikasi dan penelaahan oleh Komisi Pembimbing.`;
      }
      return `Usulan tesis pada tahapan ${targetNorm} telah disetujui oleh Program Studi Magister Kimia & Komisi Pembimbing.`;
    }
    if (currentIdx > -1 && targetIdx > -1 && targetIdx < currentIdx) {
      return `Tahapan ${targetNorm} telah selesai dilaksanakan dan dinyatakan lulus/terverifikasi.`;
    }
    return `Menunggu penyelesaian tahapan ${currentNorm} sebelum dapat melanjutkan ke tahapan ini.`;
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return tesisList.filter((item) => {
      const matchSearch =
        item.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dosenPembimbing.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.dosenPembimbing2 && item.dosenPembimbing2.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.judul.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTahapan =
        filterTahapan === 'Semua' ||
        item.tahapan === filterTahapan ||
        (filterTahapan === 'Pengajuan Judul' && item.tahapan === 'Usulan Tesis') ||
        (filterTahapan === 'Seminar Proposal' && (item.tahapan === 'Proposal Tesis' || item.tahapan === 'Seminar proposal')) ||
        (filterTahapan === 'Seminar Hasil' && item.tahapan === 'Seminar Hasil Tesis') ||
        (filterTahapan === 'Publikasi' && item.tahapan === 'Revisi & Publikasi') ||
        (filterTahapan === 'Ujian Tesis' && item.tahapan === 'Ujian Akhir Tesis') ||
        (filterTahapan === 'Diseminasi Tesis' && item.tahapan === 'Lulus');

      return matchSearch && matchTahapan;
    });
  }, [tesisList, searchQuery, filterTahapan]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  // Handle open Detail (Sinkronisasi langsung dengan form Rincian Tesis & Tugas Akhir Mahasiswa)
  const handleOpenDetail = (item: TesisMahasiswaItem) => {
    setSelectedTesis(item);
    setActiveTahapanTab(normalizeStageName(item.tahapan));
    setIsDetailModalOpen(true);
  };

  // Handlers for Modal Form Berkas Seminar Proposal Tesis
  const handleOpenBerkasSeminarModal = (item: TesisMahasiswaItem) => {
    setSelectedTesis(item);
    setFormLinkBerkasProposal(
      item.linkBerkasSeminarProposal ||
      'https://drive.google.com/drive/folders/seminar-proposal-kimia-s2-ub'
    );
    if (item.beritaAcaraSeminarProposal) {
      setBeritaAcaraFileName(item.beritaAcaraSeminarProposal.fileName);
      setBeritaAcaraFileSize(item.beritaAcaraSeminarProposal.fileSize || '1.8 MB');
      setBeritaAcaraUploadDate(item.beritaAcaraSeminarProposal.uploadedAt || '12 November 2026');
      setIsBeritaAcaraUploaded(Boolean(item.beritaAcaraSeminarProposal.isSubmitted));
    } else {
      setBeritaAcaraFileName('Berita_Acara_Seminar_Proposal.pdf');
      setBeritaAcaraFileSize('1.8 MB');
      setBeritaAcaraUploadDate('12 November 2026');
      setIsBeritaAcaraUploaded(true);
    }
    setBeritaAcaraFile(null);
    setIsBerkasSeminarModalOpen(true);
  };

  const handleSubmitLinkBerkasProposal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTesis) return;
    if (!formLinkBerkasProposal.trim()) {
      setNotificationMsg('Silakan masukkan link berkas seminar proposal terlebih dahulu.');
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }
    const updated: TesisMahasiswaItem = {
      ...selectedTesis,
      linkBerkasSeminarProposal: formLinkBerkasProposal.trim()
    };
    setSelectedTesis(updated);
    const updatedList = tesisList.map((t) => (t.id === updated.id ? updated : t));
    setTesisList(updatedList);
    localStorage.setItem('sikma_tesis_data', JSON.stringify(updatedList));
    setNotificationMsg('Link Berkas Seminar Proposal Tesis berhasil di-submit!');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleBrowseBeritaAcara = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBeritaAcaraFile(file);
      setBeritaAcaraFileName(file.name);
      setBeritaAcaraFileSize(`${(file.size / 1024).toFixed(0)} KB`);
      setBeritaAcaraUploadDate(
        new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      );
    }
  };

  const handleSubmitBeritaAcara = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTesis) return;
    if (!beritaAcaraFileName) {
      setNotificationMsg('Silakan pilih file Berita Acara terlebih dahulu via Browse.');
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }
    const updatedBeritaAcara = {
      fileName: beritaAcaraFileName,
      fileSize: beritaAcaraFileSize || '1.8 MB',
      uploadedAt:
        beritaAcaraUploadDate ||
        new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      isSubmitted: true
    };
    const updated: TesisMahasiswaItem = {
      ...selectedTesis,
      beritaAcaraSeminarProposal: updatedBeritaAcara
    };
    setSelectedTesis(updated);
    setIsBeritaAcaraUploaded(true);
    const updatedList = tesisList.map((t) => (t.id === updated.id ? updated : t));
    setTesisList(updatedList);
    localStorage.setItem('sikma_tesis_data', JSON.stringify(updatedList));
    setNotificationMsg(`Berita Acara (${beritaAcaraFileName}) berhasil di-submit!`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Handler to open official PDF document (Berita Acara, Undangan, Pemberitahuan, Permohonan)
  const handleOpenSeminarPdf = (
    type: 'Berita Acara' | 'Undangan' | 'Pemberitahuan' | 'Permohonan',
    tesisItem?: TesisMahasiswaItem | null
  ) => {
    const item = tesisItem || selectedTesis;
    if (!item) return;

    setPdfZoom(100);
    const nimClean = item.nim.replace(/\s+/g, '');

    switch (type) {
      case 'Berita Acara':
        setActivePdfDoc({
          type: 'Berita Acara',
          title: 'BERITA ACARA SEMINAR PROPOSAL TESIS',
          nomorSurat: `1142/UN10.F08.01/PP/${new Date().getFullYear()}`,
          tanggalSurat: item.tanggal || '12 November 2026',
          filename: `Berita_Acara_Sempro_${nimClean}.pdf`,
          perihal: 'Berita Acara Pelaksanaan Ujian Seminar Proposal Tesis Magister',
          studentName: item.namaMahasiswa,
          studentNim: item.nim,
          studentProdi: item.programStudi || 'Magister Kimia (S2)',
          judul: item.judul,
          judulInggris: item.judulInggris,
          dosen1: item.dosenPembimbing,
          dosen2: item.dosenPembimbing2,
          tanggalUjian: item.tanggal || '12 November 2026',
          jamUjian: item.jam || '09:00 - 11:30 WIB',
          lokasi: item.lokasi || 'Ruang Sidang Pascasarjana Gedung Kimia Lt. 3 (R. 302)',
          linkDaring: item.linkDaring || 'https://meet.google.com/tesis-kim-s2ub',
          nilai: item.nilai ? String(item.nilai) : '88.50',
          predikat: 'Lulus dengan Revisi Ringan (Grade A)'
        });
        break;

      case 'Undangan':
        setActivePdfDoc({
          type: 'Undangan',
          title: 'SURAT UNDANGAN SEMINAR PROPOSAL TESIS',
          nomorSurat: `0874/UN10.F08.01/TU.00/${new Date().getFullYear()}`,
          tanggalSurat: '05 November 2026',
          filename: `Undangan_Sempro_${nimClean}.pdf`,
          perihal: 'Undangan Ujian Seminar Proposal Tesis Program Magister (S2)',
          studentName: item.namaMahasiswa,
          studentNim: item.nim,
          studentProdi: item.programStudi || 'Magister Kimia (S2)',
          judul: item.judul,
          judulInggris: item.judulInggris,
          dosen1: item.dosenPembimbing,
          dosen2: item.dosenPembimbing2,
          tanggalUjian: item.tanggal || '12 November 2026',
          jamUjian: item.jam || '09:00 - 11:30 WIB',
          lokasi: item.lokasi || 'Ruang Sidang Pascasarjana Gedung Kimia Lt. 3 (R. 302)',
          linkDaring: item.linkDaring || 'https://meet.google.com/tesis-kim-s2ub'
        });
        break;

      case 'Pemberitahuan':
        setActivePdfDoc({
          type: 'Pemberitahuan',
          title: 'SURAT PEMBERITAHUAN PELAKSANAAN SEMINAR PROPOSAL TESIS',
          nomorSurat: `0875/UN10.F08.01/AK.01/${new Date().getFullYear()}`,
          tanggalSurat: '06 November 2026',
          filename: `Pemberitahuan_Sempro_${nimClean}.pdf`,
          perihal: 'Pemberitahuan Jadwal dan Tata Tertib Seminar Proposal Tesis S2',
          studentName: item.namaMahasiswa,
          studentNim: item.nim,
          studentProdi: item.programStudi || 'Magister Kimia (S2)',
          judul: item.judul,
          judulInggris: item.judulInggris,
          dosen1: item.dosenPembimbing,
          dosen2: item.dosenPembimbing2,
          tanggalUjian: item.tanggal || '12 November 2026',
          jamUjian: item.jam || '09:00 - 11:30 WIB',
          lokasi: item.lokasi || 'Ruang Sidang Pascasarjana Gedung Kimia Lt. 3 (R. 302)',
          linkDaring: item.linkDaring || 'https://meet.google.com/tesis-kim-s2ub'
        });
        break;

      case 'Permohonan':
        setActivePdfDoc({
          type: 'Permohonan',
          title: 'SURAT PERMOHONAN SEMINAR PROPOSAL TESIS',
          nomorSurat: `0418/MHS.S2/KM/${new Date().getFullYear()}`,
          tanggalSurat: '01 November 2026',
          filename: `Permohonan_Sempro_${nimClean}.pdf`,
          perihal: 'Permohonan Persetujuan dan Pelaksanaan Ujian Seminar Proposal Tesis',
          studentName: item.namaMahasiswa,
          studentNim: item.nim,
          studentProdi: item.programStudi || 'Magister Kimia (S2)',
          judul: item.judul,
          judulInggris: item.judulInggris,
          dosen1: item.dosenPembimbing,
          dosen2: item.dosenPembimbing2,
          tanggalUjian: item.tanggal || '12 November 2026',
          jamUjian: item.jam || '09:00 - 11:30 WIB',
          lokasi: item.lokasi || 'Ruang Sidang Pascasarjana Gedung Kimia Lt. 3 (R. 302)',
          linkDaring: item.linkDaring || 'https://meet.google.com/tesis-kim-s2ub'
        });
        break;
    }
  };

  // Handle open Edit
  const handleOpenEdit = (item: TesisMahasiswaItem) => {
    setSelectedTesis(item);
    let stage = item.tahapan;
    if (stage === 'Usulan Tesis') stage = 'Pengajuan Judul';
    else if (stage === 'Proposal Tesis') stage = 'Seminar Proposal';
    else if (stage === 'Seminar Hasil Tesis') stage = 'Seminar Hasil';
    else if (stage === 'Revisi & Publikasi') stage = 'Publikasi';
    else if (stage === 'Ujian Akhir Tesis') stage = 'Ujian Tesis';
    else if (stage === 'Lulus') stage = 'Diseminasi Tesis';

    setEditFormData({
      nim: item.nim,
      namaMahasiswa: item.namaMahasiswa,
      dosenPembimbing: item.dosenPembimbing,
      dosenPembimbing2: item.dosenPembimbing2 || '',
      judul: item.judul,
      judulInggris: item.judulInggris || '',
      tahapan: stage,
      status: item.status || 'Aktif',
      nilai: item.nilai ? String(item.nilai) : '88.50',
      tanggal: item.tanggal || '12 November 2026',
      jam: item.jam || '09:00 - 11:30 WIB',
      lokasi: item.lokasi || 'Ruang Sidang Pascasarjana Gedung Kimia Lt. 3',
      linkDaring: item.linkDaring || 'https://meet.google.com/tesis-kim-s2ub',
      catatanKemajuan: item.catatanKemajuan || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTesis) return;

    if (!editFormData.nim.trim() || !editFormData.namaMahasiswa.trim() || !editFormData.judul.trim()) {
      setNotificationMsg('NIM, Nama Mahasiswa, dan Judul wajib diisi.');
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }

    const updatedItem: TesisMahasiswaItem = {
      ...selectedTesis,
      nim: editFormData.nim.trim(),
      namaMahasiswa: editFormData.namaMahasiswa.trim(),
      dosenPembimbing: editFormData.dosenPembimbing.trim(),
      dosenPembimbing2: editFormData.dosenPembimbing2.trim() || undefined,
      judul: editFormData.judul.trim(),
      judulInggris: editFormData.judulInggris.trim() || undefined,
      tahapan: editFormData.tahapan,
      status: editFormData.status,
      nilai: editFormData.nilai.trim() || '88.50',
      tanggal: editFormData.tanggal.trim(),
      jam: editFormData.jam.trim(),
      lokasi: editFormData.lokasi.trim(),
      linkDaring: editFormData.linkDaring.trim(),
      catatanKemajuan: editFormData.catatanKemajuan.trim()
    };

    const updatedList = tesisList.map((t) => (t.id === updatedItem.id ? updatedItem : t));
    setTesisList(updatedList);
    localStorage.setItem('sikma_tesis_data', JSON.stringify(updatedList));

    if (selectedTesis.id === updatedItem.id) {
      setSelectedTesis(updatedItem);
      setActiveTahapanTab(normalizeStageName(updatedItem.tahapan));
    }

    setIsEditModalOpen(false);
    setNotificationMsg('Data Rincian Tesis & Tugas Akhir Mahasiswa berhasil diperbarui!');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formNim.trim() || !formNama.trim() || !formJudul.trim() || !formDosen.trim()) {
      setFormError('NIM, Nama Mahasiswa, Dosen Pembimbing, dan Judul wajib diisi.');
      return;
    }

    const newItem: TesisMahasiswaItem = {
      id: `tes-${Date.now()}`,
      nim: formNim.trim(),
      namaMahasiswa: formNama.trim(),
      dosenPembimbing: formDosen.trim(),
      dosenPembimbing2: formDosen2.trim() || undefined,
      judul: formJudul.trim(),
      judulInggris: formJudulInggris.trim() || undefined,
      tahapan: formTahapan,
      status: formStatus,
      programStudi: 'Magister Kimia (S2)',
      semester: 3,
      ipk: 3.90,
      totalSks: 36,
      bidangMinat: 'Laboratorium Kimia Riset Pascasarjana',
      tanggalMulai: new Date().toISOString().substring(0, 10),
      targetSelesai: '2027-01-30',
      nilai: '88.00',
      tanggal: formTanggal.trim() || '15 Desember 2026',
      jam: formJam.trim() || '09:00 - 11:30 WIB',
      lokasi: formLokasi.trim() || 'Ruang Sidang Pascasarjana Gedung Kimia Lt. 3',
      linkDaring: formLinkDaring.trim() || 'https://meet.google.com/tesis-kim-s2ub',
      catatanKemajuan: 'Usulan tesis baru berhasil didaftarkan.'
    };

    const updated = [newItem, ...tesisList];
    setTesisList(updated);
    localStorage.setItem('sikma_tesis_data', JSON.stringify(updated));

    // Reset form
    setFormNim('');
    setFormNama('');
    setFormJudul('');
    setFormJudulInggris('');
    setFormStatus('Disetujui');
    setFormTanggal('15 Desember 2026');
    setFormJam('09:00 - 11:30 WIB');
    setFormLokasi('Ruang Sidang Pascasarjana Gedung Kimia Lt. 3');
    setFormLinkDaring('https://meet.google.com/tesis-kim-s2ub');
    setIsAddModalOpen(false);

    // Sinkronisasikan langsung dengan membuka form Rincian Tesis & Tugas Akhir Mahasiswa
    setSelectedTesis(newItem);
    setActiveTahapanTab(normalizeStageName(newItem.tahapan));
    setIsDetailModalOpen(true);

    setNotificationMsg(`Usulan Tesis untuk mahasiswa ${newItem.namaMahasiswa} (${newItem.nim}) berhasil disimpan dan disinkronisasikan ke form Rincian Tesis!`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Badge styling for Tahapan
  const getTahapanBadge = (tahapan: TahapanTesis) => {
    switch (tahapan) {
      case 'Pengajuan Judul':
      case 'Usulan Tesis':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Seminar Proposal':
      case 'Proposal Tesis':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Seminar Hasil':
      case 'Seminar Hasil Tesis':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Publikasi':
      case 'Revisi & Publikasi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Ujian Tesis':
      case 'Ujian Akhir Tesis':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Diseminasi Tesis':
      case 'Lulus':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Penelitian & Kemajuan':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-yellow-400 animate-slideIn">
          <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003865] to-[#001f35] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-[#D4AF37]/15 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-xs font-bold backdrop-blur-xs border border-white/10">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Program Magister (S2) Kimia</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Data Tesis &amp; Tugas Akhir Mahasiswa
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Sistem Informasi Pengelolaan Usulan, Proposal, Seminar Hasil, dan Ujian Akhir Tesis Mahasiswa Program Magister Kimia FSTeM Universitas Brawijaya.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleOpenDataInduk(selectedTesis || tesisList[0])}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/25 rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer backdrop-blur-xs"
              title="Buka Formulir Data Induk Mahasiswa S2"
            >
              <UserCheck className="w-4 h-4 text-yellow-400" />
              <span>Data Induk Mahasiswa S2</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-slate-900 rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 font-bold text-slate-900" />
              <span>Daftar Tesis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#002B49] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <BookOpen className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Tesis Mahasiswa</h3>
              <p className="text-[11px] text-slate-500">
                Menampilkan total {filteredList.length} data tesis terdaftar
              </p>
            </div>
          </div>

          {/* Search & Filter Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari NIM, Nama, Judul, Dosen..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>

            {/* Tahapan Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-semibold text-[11px] whitespace-nowrap">Tahapan:</span>
              <select
                value={filterTahapan}
                onChange={(e) => {
                  setFilterTahapan(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua Tahapan</option>
                {tahapanList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Form Berisi Fields: NIM, Nama Mahasiswa, Dosen Pembimbing, Judul, Tahapan, Aksi (berisi button Detail) */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <table className="w-full min-w-[1000px] table-fixed text-left text-xs divide-y divide-slate-100">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[13%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[26%]" />
              <col className="w-[11%]" />
              <col className="w-[7%]" />
            </colgroup>
            <thead className="bg-[#002B49] text-white">
              <tr className="text-[11px] font-semibold tracking-wide">
                <th className="py-3.5 px-3 text-center text-slate-300">No</th>
                <th className="py-3.5 px-3 text-left">NIM</th>
                <th className="py-3.5 px-3 text-left">Nama Mahasiswa</th>
                <th className="py-3.5 px-3 text-left">Dosen Pembimbing</th>
                <th className="py-3.5 px-3 text-left">Judul</th>
                <th className="py-3.5 px-3 text-center">Tahapan</th>
                <th className="py-3.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada data tesis mahasiswa yang sesuai dengan pencarian atau filter.
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
                      {/* No */}
                      <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {globalIdx}
                      </td>

                      {/* 1. NIM */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-slate-800 text-xs tracking-tight block truncate" title={item.nim}>
                          {item.nim}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {item.programStudi || 'S2 Kimia'}
                        </span>
                      </td>

                      {/* 2. Nama Mahasiswa */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 text-xs leading-snug line-clamp-2" title={item.namaMahasiswa}>
                          {item.namaMahasiswa}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Semester {item.semester || 3} • IPK {item.ipk?.toFixed(2) || '3.90'}
                        </span>
                      </td>

                      {/* 3. Dosen Pembimbing */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-800 text-[11px] font-semibold leading-tight line-clamp-2" title={item.dosenPembimbing}>
                          1. {item.dosenPembimbing}
                        </div>
                        {item.dosenPembimbing2 && (
                          <div className="text-slate-500 text-[10px] mt-1 line-clamp-1" title={item.dosenPembimbing2}>
                            2. {item.dosenPembimbing2}
                          </div>
                        )}
                      </td>

                      {/* 4. Judul */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800 text-xs leading-relaxed line-clamp-2" title={item.judul}>
                          {item.judul}
                        </div>
                        {item.judulInggris && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1" title={item.judulInggris}>
                            {item.judulInggris}
                          </div>
                        )}
                      </td>

                      {/* 5. Tahapan */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border leading-tight ${getTahapanBadge(
                            item.tahapan
                          )}`}
                        >
                          {item.tahapan}
                        </span>
                      </td>

                      {/* 6. Aksi (berisi button Detail) */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item)}
                          className="px-2.5 py-1.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-lg text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                          title={`Lihat Rincian Tesis ${item.namaMahasiswa}`}
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <div>
              Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL TESIS MAHASISWA (DUA BOX: DETAIL TESIS & TAHAPAN TESIS SISI KANAN) */}
      {isDetailModalOpen && selectedTesis && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-7xl w-full border border-slate-300 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col max-h-[94vh] animate-fadeIn my-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center shadow-sm flex-shrink-0 font-bold">
                  <GraduationCap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900">Rincian Tesis &amp; Tugas Akhir Mahasiswa</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002B49] text-white border border-[#003865]">
                      {selectedTesis.tahapan}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Magister Kimia (S2)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Departemen Kimia FSTeM Universitas Brawijaya • Mahasiswa:{' '}
                    <strong className="text-slate-800">{selectedTesis.namaMahasiswa}</strong>{' '}
                    <span className="font-mono text-slate-600">({selectedTesis.nim})</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DUA BOX UTAMA: SISI KIRI (DETAIL TESIS) & SISI KANAN (TAHAPAN TESIS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-y-auto pr-1">
              {/* ======================================================== */}
              {/* BOX 1 (SISI KIRI): DETAIL TESIS */}
              {/* ======================================================== */}
              <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Header Box Detail Tesis + Button Edit Tesis */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shadow-xs">
                        <FileText className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Detail Tesis</h4>
                        <p className="text-[10px] text-slate-500">Informasi pokok tugas akhir magister</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenDataInduk(selectedTesis)}
                        className="px-2.5 py-1.5 bg-yellow-400/20 hover:bg-yellow-400/30 text-amber-900 border border-yellow-400/40 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Buka Data Induk Mahasiswa S2"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                        <span>Data Induk S2</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleOpenEdit(selectedTesis);
                        }}
                        className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Edit Data Tesis Mahasiswa"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Edit Tesis</span>
                      </button>
                    </div>
                  </div>

                  {/* List Item Rincian Detail Tesis */}
                  <div className="divide-y divide-slate-200/80 text-xs">
                    {/* Tahapan Tesis */}
                    <div className="py-2.5 flex items-start justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-32 flex-shrink-0">Tahapan Tesis</span>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getTahapanBadge(selectedTesis.tahapan)}`}>
                          {selectedTesis.tahapan}
                        </span>
                      </div>
                    </div>

                    {/* Status Tesis (Sinkron dengan list Status button Tambah Usulan Tesis) */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-32 flex-shrink-0">Status Tesis</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedTesis.status || 'Disetujui'}
                          onChange={(e) => handleDirectStatusChange(e.target.value as TesisStatus)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold border cursor-pointer focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all ${getStatusBadgeStyle(selectedTesis.status)}`}
                          title="Pilih Status Tesis Mahasiswa (Disetujui, Menunggu Verifikasi, Ditolak)"
                        >
                          {LIST_STATUS_TESIS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* NIM Mahasiswa */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-32 flex-shrink-0">NIM</span>
                      <span className="font-mono font-bold text-slate-900 text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                        {selectedTesis.nim}
                      </span>
                    </div>

                    {/* Nama Mahasiswa */}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-32 flex-shrink-0">Nama Mahasiswa</span>
                      <span className="font-bold text-slate-900 text-right text-xs">
                        {selectedTesis.namaMahasiswa}
                      </span>
                    </div>

                    {/* Dosen Pembimbing 1 */}
                    <div className="py-2.5 flex items-start justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-32 flex-shrink-0">Dosen Pembimbing 1</span>
                      <span className="font-bold text-slate-900 text-right">
                        {selectedTesis.dosenPembimbing}
                      </span>
                    </div>

                    {/* Dosen Pembimbing 2 */}
                    <div className="py-2.5 flex items-start justify-between gap-3">
                      <span className="text-slate-500 font-semibold w-32 flex-shrink-0">Dosen Pembimbing 2</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedTesis.dosenPembimbing2 || <span className="text-slate-400 italic font-normal">-</span>}
                      </span>
                    </div>

                    {/* Judul Tesis */}
                    <div className="py-2.5 flex flex-col gap-1">
                      <span className="text-slate-500 font-semibold">Judul Tesis</span>
                      <div className="font-semibold text-slate-900 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                        {selectedTesis.judul}
                      </div>
                    </div>

                    {/* Judul (in English) */}
                    <div className="py-2.5 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">Judul (in English)</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 uppercase">EN</span>
                      </div>
                      <div className="italic text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-blue-100 text-xs shadow-2xs">
                        {selectedTesis.judulInggris || 'Not specified / belum diisi'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedTesis.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Rincian</span>
                  </button>
                </div>
              </div>

              {/* ======================================================== */}
              {/* BOX 2 (SISI KANAN): TAHAPAN TESIS */}
              {/* ======================================================== */}
              <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Header Box Tahapan Tesis */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold shadow-xs">
                        <Layers className="w-4 h-4 text-[#002B49]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Tahapan Tesis</h4>
                        <p className="text-[10px] text-slate-500">Pilih tahapan untuk melihat alur, rincian data dan berkas</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#002B49] text-[#D4AF37] border border-[#003865] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activeTahapanTab}</span>
                    </span>
                  </div>

                  {/* BUTTONS TAHAPAN TESIS (6 BUTTON SESUAI PERMINTAAN USER):
                      1. Pengajuan Judul
                      2. Seminar proposal
                      3. Seminar Hasil
                      4. Publikasi
                      5. Ujian Tesis
                      6. Diseminasi Tesis
                  */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                    {[
                      { id: 'Pengajuan Judul' as const, label: 'Pengajuan Judul', icon: FolderOpen },
                      { id: 'Seminar Proposal' as const, label: 'Seminar Proposal', icon: FileText },
                      { id: 'Seminar Hasil' as const, label: 'Seminar Hasil', icon: FlaskConical },
                      { id: 'Publikasi' as const, label: 'Publikasi', icon: BookOpen },
                      { id: 'Ujian Tesis' as const, label: 'Ujian Tesis', icon: GraduationCap },
                      { id: 'Diseminasi Tesis' as const, label: 'Diseminasi Tesis', icon: Award }
                    ].map((stage) => {
                      const isActive = normalizeStageName(activeTahapanTab) === normalizeStageName(stage.id);
                      const IconComponent = stage.icon;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setActiveTahapanTab(stage.id)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border text-center cursor-pointer ${
                            isActive
                              ? 'bg-[#002B49] text-white border-[#002B49] shadow-md ring-2 ring-[#002B49]/20'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-slate-500'}`} />
                          <span className="leading-tight text-[10px]">{stage.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ======================================================== */}
                  {/* FIELDS: NIM, Nama Mahasiswa, Judul, Dosen, Status, Aksi  */}
                  {/* ======================================================== */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                          Rincian Tahapan: {activeTahapanTab}
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        Jenjang S2 Magister
                      </span>
                    </div>

                    {/* DAFTAR FIELDS (Judul, Dosen, Status, Aksi; Pada Pengajuan Judul list NIM & Nama Mahasiswa dihapus) */}
                    <div className="divide-y divide-slate-100 text-xs">
                      {/* 1. NIM & 2. Nama Mahasiswa (Dihapus pada Pengajuan Judul sesuai permintaan) */}
                      {activeTahapanTab !== 'Pengajuan Judul' && (
                        <>
                          {/* 1. NIM */}
                          <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                            <span className="sm:col-span-3 text-slate-500 font-semibold">NIM</span>
                            <div className="sm:col-span-9">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-xs inline-block">
                                {selectedTesis.nim}
                              </span>
                            </div>
                          </div>

                          {/* 2. Nama Mahasiswa */}
                          <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                            <span className="sm:col-span-3 text-slate-500 font-semibold">Nama Mahasiswa</span>
                            <div className="sm:col-span-9 font-bold text-slate-900 text-xs">
                              {selectedTesis.namaMahasiswa}
                            </div>
                          </div>
                        </>
                      )}

                      {/* 3. Judul */}
                      <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                        <span className="sm:col-span-3 text-slate-500 font-semibold mt-1">Judul</span>
                        <div className="sm:col-span-9 space-y-1">
                          <div className="font-semibold text-slate-900 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                            {selectedTesis.judul}
                          </div>
                          {selectedTesis.judulInggris && (
                            <div className="italic text-slate-600 text-[11px] leading-relaxed bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                              {selectedTesis.judulInggris}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 4. Dosen */}
                      <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                        <span className="sm:col-span-3 text-slate-500 font-semibold mt-0.5">Dosen</span>
                        <div className="sm:col-span-9 space-y-1">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>1. {selectedTesis.dosenPembimbing}</span>
                            <span className="text-[10px] text-slate-400 font-normal">(Pembimbing Utama)</span>
                          </div>
                          {selectedTesis.dosenPembimbing2 && (
                            <div className="font-medium text-slate-700 text-[11px] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              <span>2. {selectedTesis.dosenPembimbing2}</span>
                              <span className="text-[10px] text-slate-400 font-normal">(Pembimbing Pendamping)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 5. Status (Sinkron dengan list Status button Tambah Usulan Tesis) */}
                      <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <span className="sm:col-span-3 text-slate-500 font-semibold">Status</span>
                        <div className="sm:col-span-9 flex items-center gap-2.5 flex-wrap">
                          <select
                            value={selectedTesis.status || 'Disetujui'}
                            onChange={(e) => handleDirectStatusChange(e.target.value as TesisStatus)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all ${getStatusBadgeStyle(selectedTesis.status)}`}
                            title="Pilih Status Tesis Mahasiswa (Disetujui, Menunggu Verifikasi, Ditolak)"
                          >
                            {LIST_STATUS_TESIS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <span className="text-[11px] text-slate-500">
                            {getStageStatusDescription(activeTahapanTab, selectedTesis)}
                          </span>
                        </div>
                      </div>

                      {/* Tanggal, Jam, Lokasi, Link Daring, Nilai (Hanya ditampilkan selain Pengajuan Judul) */}
                      {activeTahapanTab !== 'Pengajuan Judul' && (
                        <>
                          {/* Tanggal */}
                          <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                            <span className="sm:col-span-3 text-slate-500 font-semibold">Tanggal</span>
                            <div className="sm:col-span-9">
                              <span className="font-semibold text-slate-900 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 inline-flex items-center gap-1.5 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                <span>{selectedTesis.tanggal || '15 Desember 2026'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Jam (rentang waktu) */}
                          <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                            <span className="sm:col-span-3 text-slate-500 font-semibold">Jam (rentang waktu)</span>
                            <div className="sm:col-span-9">
                              <span className="font-semibold text-slate-900 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 inline-flex items-center gap-1.5 text-xs">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                <span>{selectedTesis.jam || '09:00 - 11:30 WIB'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Lokasi */}
                          <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                            <span className="sm:col-span-3 text-slate-500 font-semibold mt-0.5">Lokasi</span>
                            <div className="sm:col-span-9">
                              <span className="font-medium text-slate-800 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 inline-flex items-center gap-1.5 text-xs">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                                <span>{selectedTesis.lokasi || 'Ruang Sidang Pascasarjana Gedung Kimia Lt. 3 (R. 302)'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Link daring */}
                          <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                            <span className="sm:col-span-3 text-slate-500 font-semibold">Link daring</span>
                            <div className="sm:col-span-9">
                              {selectedTesis.linkDaring ? (
                                <a
                                  href={selectedTesis.linkDaring}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 bg-blue-50/70 hover:bg-blue-100 hover:underline px-2.5 py-1 rounded border border-blue-200 text-xs font-mono inline-flex items-center gap-1.5 transition-colors"
                                >
                                  <Video className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                  <span className="truncate max-w-xs sm:max-w-md font-semibold">
                                    {selectedTesis.linkDaring}
                                  </span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic text-xs">Belum diisi</span>
                              )}
                            </div>
                          </div>

                          {/* Nilai (berisi button Berkas Seminar, button Berkas Nilai, dan button Nilai pada Seminar Proposal) */}
                          <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                            <span className="sm:col-span-3 text-slate-500 font-semibold">Nilai</span>
                            <div className="sm:col-span-9 flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 text-xs shadow-2xs">
                                {selectedTesis.nilai || '88.50'}
                              </span>

                              {/* KHUSUS SEMINAR PROPOSAL: button Berkas Seminar, button Berkas Nilai, dan button Nilai */}
                              {(normalizeStageName(activeTahapanTab) === 'Seminar Proposal') && (
                                <>
                                  {/* button Berkas Seminar (Membuka Form Berkas Seminar Proposal) */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenBerkasSeminarModal(selectedTesis)}
                                    className="px-3.5 py-1.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>Berkas Seminar</span>
                                  </button>

                                  {/* button Berkas Nilai (Membuka Form Berkas Seminar Proposal) */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenBerkasSeminarModal(selectedTesis)}
                                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                                  >
                                    <FileCheck className="w-3.5 h-3.5 text-yellow-300" />
                                    <span>Berkas Nilai</span>
                                  </button>

                                  {/* button Nilai */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRubrikStage('Seminar Proposal');
                                      setIsRubrikModalOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-slate-900 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 border border-yellow-500 cursor-pointer transition-all"
                                  >
                                    <Award className="w-3.5 h-3.5 text-slate-900" />
                                    <span>Nilai</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* 6. Aksi (Dihapus khusus pada Seminar Proposal sesuai permintaan user) */}
                      {normalizeStageName(activeTahapanTab) !== 'Seminar Proposal' && (
                        <div className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <span className="sm:col-span-3 text-slate-500 font-semibold">Aksi</span>
                          <div className="sm:col-span-9 flex items-center gap-2 flex-wrap">
                            {/* Tombol Aksi Sesuai Tahapan yang Aktif */}
                            {activeTahapanTab === 'Pengajuan Judul' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStagePreviewDoc({
                                      title: 'Formulir Pengajuan Judul & Sinopsis Tesis',
                                      filename: `Pengajuan_Judul_${selectedTesis.nim}.pdf`,
                                      category: 'Pengajuan Judul Tesis',
                                      stage: 'Pengajuan Judul',
                                      date: selectedTesis.tanggalMulai || '15 Februari 2026',
                                      status: 'Disetujui Komisi Pembimbing',
                                      details: `Judul Tesis: "${selectedTesis.judul}". Telah disetujui oleh Pembimbing Utama ${selectedTesis.dosenPembimbing} dan Ketua Program Studi Magister Kimia.`
                                    });
                                  }}
                                  className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                                  <span>Lihat Berkas Pengajuan</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setNotificationMsg('Lembar Pengesahan Judul Tesis S2 siap dicetak!');
                                    setTimeout(() => setNotificationMsg(null), 3000);
                                    window.print();
                                  }}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Cetak Pengesahan</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setNotificationMsg('Status Pengajuan Judul telah Terverifikasi oleh Komisi Pascasarjana.');
                                    setTimeout(() => setNotificationMsg(null), 3000);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Verifikasi Komisi</span>
                                </button>
                              </>
                            )}

                          {activeTahapanTab === 'Seminar Hasil' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setRubrikStage('Seminar Hasil');
                                  setIsRubrikModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5 text-yellow-300" />
                                <span>Input Nilai Semhas</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setStagePreviewDoc({
                                    title: 'Draft Laporan Hasil Penelitian Tesis & Data Spektra',
                                    filename: `Draft_Semhas_${selectedTesis.nim}.pdf`,
                                    category: 'Seminar Hasil Riset Tesis',
                                    stage: 'Seminar Hasil',
                                    date: selectedTesis.tanggal || '24 Oktober 2026',
                                    status: 'Selesai Seminar Hasil',
                                    details: `Laporan riset eksperimental dan instrumen spektroskopi telah dipresentasikan. Pembimbing: ${selectedTesis.dosenPembimbing}.`
                                  });
                                }}
                                className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>Draft Hasil Tesis</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationMsg('Berita Acara Seminar Hasil Tesis berhasil dicetak!');
                                  setTimeout(() => setNotificationMsg(null), 3000);
                                  window.print();
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-600" />
                                <span>Berita Acara Semhas</span>
                              </button>
                            </>
                          )}

                          {activeTahapanTab === 'Publikasi' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setStagePreviewDoc({
                                    title: 'Letter of Acceptance (LoA) Indonesian Journal of Chemistry',
                                    filename: `LoA_Publikasi_Scopus_${selectedTesis.nim}.pdf`,
                                    category: 'Publikasi Ilmiah Bereputasi',
                                    stage: 'Publikasi',
                                    date: '10 Oktober 2026',
                                    status: 'Accepted (Scopus Q2)',
                                    details: `Artikel ilmiah "${selectedTesis.judulInggris || selectedTesis.judul}" dinyatakan DITERIMA (Accepted) untuk terbit pada Volume 26 Issue 4.`
                                  });
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-yellow-300" />
                                <span>Lihat Bukti LoA</span>
                              </button>

                              <a
                                href="https://admission.ub.ac.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                                <span>Link Jurnal Scopus</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationMsg('Syarat Bebas Publikasi Ilmiah Magister Kimia Telah Terverifikasi!');
                                  setTimeout(() => setNotificationMsg(null), 3500);
                                }}
                                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold border border-teal-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                <span>Verifikasi Publikasi</span>
                              </button>
                            </>
                          )}

                          {activeTahapanTab === 'Ujian Tesis' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setRubrikStage('Ujian Tesis');
                                  setIsRubrikModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5 text-yellow-300" />
                                <span>Form Nilai Ujian Akhir</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setStagePreviewDoc({
                                    title: 'Lembar Saran & Revisi Dewan Penguji Sidang Tesis',
                                    filename: `Revisi_Sidang_Tesis_${selectedTesis.nim}.pdf`,
                                    category: 'Ujian Akhir Tesis Tertutup',
                                    stage: 'Ujian Tesis',
                                    date: selectedTesis.tanggal || '18 Juni 2026',
                                    status: 'Lulus dengan Nilai A',
                                    details: `Majelis dewan penguji merekomendasikan kelulusan dengan revisi minor pada Bab 4 pembahasan data kinetika.`
                                  });
                                }}
                                className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>Lembar Revisi Penguji</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationMsg('Berita Acara Kelulusan Ujian Akhir Tesis berhasil dicetak!');
                                  setTimeout(() => setNotificationMsg(null), 3000);
                                  window.print();
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-600" />
                                <span>Berita Acara Sidang</span>
                              </button>
                            </>
                          )}

                          {activeTahapanTab === 'Diseminasi Tesis' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setStagePreviewDoc({
                                    title: 'Sertifikat Presenter / Pemakalah Simposium Internasional Kimia',
                                    filename: `Sertifikat_Diseminasi_${selectedTesis.nim}.pdf`,
                                    category: 'Diseminasi Hasil Riset Tesis',
                                    stage: 'Diseminasi Tesis',
                                    date: '02 Oktober 2026',
                                    status: 'Terlaksana (Oral Presenter)',
                                    details: `Presenter pada The 10th International Conference of Chemistry and Applied Materials (ICCAM). Sertifikat Terverifikasi.`
                                  });
                                }}
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5 text-yellow-300" />
                                <span>Lihat Sertifikat</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationMsg('Fitur unggah berkas sertifikat diseminasi baru siap.');
                                  setTimeout(() => setNotificationMsg(null), 3000);
                                }}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-amber-700" />
                                <span>Unggah Berkas Baru</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setNotificationMsg('Surat Keterangan Pemenuhan Diseminasi Tesis berhasil dicetak!');
                                  setTimeout(() => setNotificationMsg(null), 3000);
                                  window.print();
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-600" />
                                <span>Cetak Keterangan</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                  {/* KONTEN DOKUMEN & BERKAS TERKAIT TAHAPAN TERPILIH */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#002B49]" />
                        <h5 className="font-bold text-xs text-slate-900">
                          Berkas &amp; Dokumen Pendukung ({activeTahapanTab})
                        </h5>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Format PDF • Maks. 15 MB
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {activeTahapanTab === 'Pengajuan Judul' && (
                        <>
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">1. Formulir Usulan Judul &amp; Sinopsis Riset</strong>
                                <span className="text-[10px] text-slate-500">Form_Usulan_Judul_Tesis.pdf • 420 KB</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Disetujui
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">2. Lembar Persetujuan Calon Pembimbing</strong>
                                <span className="text-[10px] text-slate-500">Persetujuan_Calon_Pembimbing.pdf • 310 KB</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Disetujui
                            </span>
                          </div>
                        </>
                      )}

                      {normalizeStageName(activeTahapanTab) === 'Seminar Proposal' && (
                        <>
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">1. Naskah Proposal Tesis (Bab 1 - Bab 3)</strong>
                                <span className="text-[10px] text-slate-500">Proposal_Tesis_Lengkap.pdf • 2.4 MB</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              Tervalidasi
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0">
                                <Award className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">2. Berita Acara &amp; Rubrik Nilai Proposal</strong>
                                <span className="text-[10px] text-slate-500">Nilai: 88.50 (A-) • R. 302 Pascasarjana</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Lulus
                            </span>
                          </div>
                        </>
                      )}

                      {activeTahapanTab === 'Seminar Hasil' && (
                        <>
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-purple-100 text-purple-800 flex items-center justify-center font-bold flex-shrink-0">
                                <FlaskConical className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">1. Draft Naskah Hasil Riset &amp; Eksperimen</strong>
                                <span className="text-[10px] text-slate-500">Draft_Hasil_Tesis_Kimia.pdf • 4.1 MB</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                              Selesai Semhas
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-purple-100 text-purple-800 flex items-center justify-center font-bold flex-shrink-0">
                                <FileSpreadsheet className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">2. Lampiran Data Spektroskopi (FTIR/NMR/GC-MS)</strong>
                                <span className="text-[10px] text-slate-500">Data_Karakterisasi_Kimia.pdf • 8.6 MB</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Lengkap
                            </span>
                          </div>
                        </>
                      )}

                      {activeTahapanTab === 'Publikasi' && (
                        <>
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">1. Letter of Acceptance (LoA) Jurnal Scopus</strong>
                                <span className="text-[10px] text-slate-500">Indonesian Journal of Chemistry • Scopus Q2</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Accepted
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">2. Final Manuscript / Artikel Publikasi</strong>
                                <span className="text-[10px] text-slate-500">Manuscript_Final_Published.pdf • 1.8 MB</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Lengkap
                            </span>
                          </div>
                        </>
                      )}

                      {activeTahapanTab === 'Ujian Tesis' && (
                        <>
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-rose-100 text-rose-800 flex items-center justify-center font-bold flex-shrink-0">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">1. Naskah Lengkap Tesis (Bab 1 - Bab 5)</strong>
                                <span className="text-[10px] text-slate-500">Naskah_Tesis_Lengkap_S2.pdf • 5.8 MB</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Disetujui
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-rose-100 text-rose-800 flex items-center justify-center font-bold flex-shrink-0">
                                <FileCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">2. Berita Acara Ujian Akhir Tesis Tertutup</strong>
                                <span className="text-[10px] text-slate-500">Nilai: {selectedTesis.nilai || '88.50'} • Sangat Memuaskan</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              Lulus Ujian
                            </span>
                          </div>
                        </>
                      )}

                      {activeTahapanTab === 'Diseminasi Tesis' && (
                        <>
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-teal-100 text-teal-800 flex items-center justify-center font-bold flex-shrink-0">
                                <Award className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">1. Sertifikat Oral Presenter Simposium Internasional</strong>
                                <span className="text-[10px] text-slate-500">Sertifikat_ICCAM_2026.pdf • 950 KB</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                              Terverifikasi
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-teal-100 text-teal-800 flex items-center justify-center font-bold flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs">2. Book of Abstracts &amp; Prosiding Diseminasi</strong>
                                <span className="text-[10px] text-slate-500">Prosiding_Konferensi_Kimia.pdf • 6.2 MB</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Lengkap
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Box Kanan */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tahapan {activeTahapanTab} tersinkronisasi dengan SIAKAD &amp; SIKMA</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                  >
                    Tutup Rincian
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU DOKUMEN TAHAPAN TESIS */}
      {stagePreviewDoc && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{stagePreviewDoc.title}</h3>
                  <p className="text-[11px] text-slate-500">{stagePreviewDoc.category} • {stagePreviewDoc.filename}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStagePreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold">Tahapan:</span>
                  <span className="font-bold text-slate-900">{stagePreviewDoc.stage}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold">Tanggal Berkas:</span>
                  <span className="font-medium text-slate-800">{stagePreviewDoc.date}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block font-semibold">Status Validasi:</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {stagePreviewDoc.status}
                </span>
              </div>

              {stagePreviewDoc.details && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wide">Keterangan:</span>
                  <p className="text-slate-700 leading-relaxed mt-0.5">{stagePreviewDoc.details}</p>
                </div>
              )}

              {/* Mock PDF Visual Sheet */}
              <div className="mt-3 p-5 bg-white rounded-lg border border-slate-300 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="font-bold text-slate-800 text-xs">DOKUMEN RESMI TERCATAT SIKMA S2</div>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Dokumen digital telah terverifikasi secara elektronik oleh Departemen Kimia FSTeM Universitas Brawijaya.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setNotificationMsg(`Mengunduh berkas ${stagePreviewDoc.filename}...`);
                  setTimeout(() => setNotificationMsg(null), 3000);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setStagePreviewDoc(null)}
                className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RUBRIK NILAI TAHAPAN TESIS */}
      {isRubrikModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Rubrik Evaluasi &amp; Nilai: {rubrikStage}</h3>
                  <p className="text-[11px] text-slate-500">Program Magister (S2) Kimia Universitas Brawijaya</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRubrikModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-amber-900">
                Mahasiswa: <strong>{selectedTesis?.namaMahasiswa}</strong> ({selectedTesis?.nim})
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    1. Penguasaan Teori &amp; Konsep Kimia Lanjutan (Bobot 30%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rubrikValues.nilaiMateri}
                    onChange={(e) => setRubrikValues({ ...rubrikValues, nilaiMateri: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Desain Eksperimen &amp; Metodologi Laboratorium (Bobot 35%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rubrikValues.nilaiMetodologi}
                    onChange={(e) => setRubrikValues({ ...rubrikValues, nilaiMetodologi: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. Argumentasi Ilmiah &amp; Presentasi (Bobot 20%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rubrikValues.nilaiPenyampaian}
                    onChange={(e) => setRubrikValues({ ...rubrikValues, nilaiPenyampaian: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. Kesiapan Publikasi / Naskah Jurnal (Bobot 15%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rubrikValues.nilaiPublikasi}
                    onChange={(e) => setRubrikValues({ ...rubrikValues, nilaiPublikasi: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Catatan Revisi &amp; Masukan Dewan Pembimbing / Penguji
                  </label>
                  <textarea
                    rows={2}
                    value={rubrikValues.catatanPenguji}
                    onChange={(e) => setRubrikValues({ ...rubrikValues, catatanPenguji: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg resize-y"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-900">Total Nilai Rata-rata:</span>
                <span className="font-mono font-bold text-emerald-900 text-sm">
                  {(
                    rubrikValues.nilaiMateri * 0.3 +
                    rubrikValues.nilaiMetodologi * 0.35 +
                    rubrikValues.nilaiPenyampaian * 0.2 +
                    rubrikValues.nilaiPublikasi * 0.15
                  ).toFixed(2)}{' '}
                  (A)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRubrikModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalScore = (
                    rubrikValues.nilaiMateri * 0.3 +
                    rubrikValues.nilaiMetodologi * 0.35 +
                    rubrikValues.nilaiPenyampaian * 0.2 +
                    rubrikValues.nilaiPublikasi * 0.15
                  ).toFixed(2);

                  if (selectedTesis) {
                    const updated = tesisList.map((t) =>
                      t.id === selectedTesis.id ? { ...t, nilai: finalScore } : t
                    );
                    setTesisList(updated);
                    localStorage.setItem('sikma_tesis_data', JSON.stringify(updated));
                    setSelectedTesis({ ...selectedTesis, nilai: finalScore });
                  }

                  setIsRubrikModalOpen(false);
                  setNotificationMsg(`Nilai ${rubrikStage} berhasil disimpan (${finalScore})!`);
                  setTimeout(() => setNotificationMsg(null), 3000);
                }}
                className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 border border-yellow-500 rounded-lg font-bold shadow-sm flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Check className="w-4 h-4 text-slate-900" />
                <span>Simpan Nilai Evaluasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM BERKAS SEMINAR PROPOSAL TESIS */}
      {isBerkasSeminarModalOpen && selectedTesis && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl p-6 space-y-5 animate-fadeIn my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center font-bold shadow-sm">
                  <FileText className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Form Berkas Seminar Proposal Tesis
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mahasiswa: <strong className="text-slate-800">{selectedTesis.namaMahasiswa}</strong> ({selectedTesis.nim}) • Program Magister Kimia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBerkasSeminarModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Form Berkas Seminar Proposal Tesis */}
            <div className="space-y-4 text-xs">
              {/* 1. Link Berkas Seminar Proposal Tesis (bentuk link untuk di submit) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-blue-600" />
                    <span>Link Berkas Seminar Proposal Tesis</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Bentuk Link untuk di Submit
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Masukkan tautan Google Drive / Cloud repository berkas naskah proposal tesis untuk disubmit ke sistem.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/... atau link dokumen"
                      value={formLinkBerkasProposal}
                      onChange={(e) => setFormLinkBerkasProposal(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                    />
                    {formLinkBerkasProposal && (
                      <a
                        href={formLinkBerkasProposal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                        title="Buka Link di Tab Baru"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubmitLinkBerkasProposal()}
                    className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-lg font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-all"
                  >
                    <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Submit</span>
                  </button>
                </div>

                {selectedTesis.linkBerkasSeminarProposal && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">Link Tersubmit:</span>
                    <a
                      href={selectedTesis.linkBerkasSeminarProposal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono underline truncate max-w-xs sm:max-w-md font-semibold text-blue-700"
                    >
                      {selectedTesis.linkBerkasSeminarProposal}
                    </a>
                  </div>
                )}
              </div>

              {/* BUTTONS (Berita Acara, Undangan, Pemberitahuan, Permohonan) LETAKKAN DIBAWAH LIST LINK BERKAS SEMINAR PROPOSAL TESIS */}
              <div className="p-4 bg-gradient-to-r from-amber-50/80 via-yellow-50/50 to-amber-50/80 rounded-xl border border-amber-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#002B49]" />
                    <span className="font-bold text-slate-900 text-xs">
                      Dokumen Berkas Seminar Proposal Tesis (File PDF)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 border border-yellow-500 shadow-2xs">
                    Klik tombol untuk menampilkan file PDF
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pilih salah satu dokumen resmi di bawah ini untuk membuka lembar pratinjau file PDF lengkap dengan kop surat dan legalitas:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {/* Button Berita Acara */}
                  <button
                    type="button"
                    onClick={() => handleOpenSeminarPdf('Berita Acara', selectedTesis)}
                    className="group px-3 py-2.5 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-950 rounded-lg text-xs font-bold border border-emerald-300 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:border-emerald-500"
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-bold">Berita Acara</span>
                  </button>

                  {/* Button Undangan */}
                  <button
                    type="button"
                    onClick={() => handleOpenSeminarPdf('Undangan', selectedTesis)}
                    className="group px-3 py-2.5 bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-950 rounded-lg text-xs font-bold border border-blue-300 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:border-blue-500"
                  >
                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-bold">Undangan</span>
                  </button>

                  {/* Button Pemberitahuan */}
                  <button
                    type="button"
                    onClick={() => handleOpenSeminarPdf('Pemberitahuan', selectedTesis)}
                    className="group px-3 py-2.5 bg-white hover:bg-purple-50 active:bg-purple-100 text-purple-950 rounded-lg text-xs font-bold border border-purple-300 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:border-purple-500"
                  >
                    <Bell className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="font-bold">Pemberitahuan</span>
                  </button>

                  {/* Button Permohonan */}
                  <button
                    type="button"
                    onClick={() => handleOpenSeminarPdf('Permohonan', selectedTesis)}
                    className="group px-3 py-2.5 bg-white hover:bg-amber-50 active:bg-amber-100 text-amber-950 rounded-lg text-xs font-bold border border-amber-300 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-500"
                  >
                    <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="font-bold">Permohonan</span>
                  </button>
                </div>
              </div>

              {/* 2. Berita Acara Seminar Proposal Tesis (bentuk Browse, Submit) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Berita Acara Seminar Proposal Tesis</span>
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isBeritaAcaraUploaded
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isBeritaAcaraUploaded ? 'Tersubmit' : 'Belum Submit'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pilih file Berita Acara pelaksanaan Seminar Proposal Tesis (Format PDF atau DOCX), kemudian klik Submit.
                </p>

                <div className="space-y-2.5">
                  <input
                    type="file"
                    id="beritaAcaraFileInputModal"
                    accept=".pdf,.doc,.docx"
                    onChange={handleBrowseBeritaAcara}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Button Browse */}
                    <label
                      htmlFor="beritaAcaraFileInputModal"
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-bold text-xs border border-slate-300 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Browse</span>
                    </label>

                    {/* Display File Name */}
                    <div className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs flex items-center justify-between truncate">
                      <span className="font-mono text-slate-800 truncate">
                        {beritaAcaraFileName || 'Pilih file Berita Acara...'}
                      </span>
                      {beritaAcaraFileSize && (
                        <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">
                          {beritaAcaraFileSize}
                        </span>
                      )}
                    </div>

                    {/* Button Submit */}
                    <button
                      type="button"
                      onClick={() => handleSubmitBeritaAcara()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Submit</span>
                    </button>
                  </div>

                  {/* Status File Tersubmit & Button View */}
                  {isBeritaAcaraUploaded && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div>
                          <strong className="block text-emerald-950 font-mono text-[11px] truncate max-w-xs sm:max-w-md">
                            {beritaAcaraFileName}
                          </strong>
                          <span className="text-[10px] text-emerald-700">
                            Status: Berkas Berita Acara Tersimpan ({beritaAcaraFileSize || '1.8 MB'})
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenSeminarPdf('Berita Acara', selectedTesis)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 rounded border border-emerald-300 text-[11px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="Buka File PDF Berita Acara"
                      >
                        <Eye className="w-3 h-3 text-emerald-700" />
                        <span>View PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">
                Form Berkas Seminar Proposal Tesis S2 Kimia
              </span>
              <button
                type="button"
                onClick={() => setIsBerkasSeminarModalOpen(false)}
                className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg font-bold text-xs cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU DOKUMEN RESMI PDF (Berita Acara, Undangan, Pemberitahuan, Permohonan) */}
      {activePdfDoc && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          {/* Top PDF Reader Toolbar */}
          <div className="w-full max-w-4xl bg-slate-900 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-2xl border border-slate-700 mb-4 sticky top-0 z-20 flex-wrap gap-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[11px] tracking-wider uppercase shadow-2xs">
                PDF
              </span>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white tracking-wide truncate max-w-xs sm:max-w-md">
                  {activePdfDoc.filename}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {activePdfDoc.title} • Universitas Brawijaya
                </p>
              </div>
            </div>

            {/* Controls: Zoom, Print, Download, Close */}
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setPdfZoom((prev) => Math.max(70, prev - 10))}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                  title="Perkecil (Zoom Out)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] text-slate-300 font-bold min-w-[42px] text-center">
                  {pdfZoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setPdfZoom((prev) => Math.min(130, prev + 10))}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                  title="Perbesar (Zoom In)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPdfZoom(100)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer ml-0.5"
                  title="Reset Ukuran (100%)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cetak */}
              <button
                type="button"
                onClick={() => {
                  setNotificationMsg(`Mencetak dokumen ${activePdfDoc.title}...`);
                  setTimeout(() => setNotificationMsg(null), 3000);
                  window.print();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Cetak</span>
              </button>

              {/* Unduh PDF */}
              <button
                type="button"
                onClick={() => {
                  setNotificationMsg(`Mengunduh file ${activePdfDoc.filename}...`);
                  setTimeout(() => setNotificationMsg(null), 3000);
                }}
                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>Unduh PDF</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActivePdfDoc(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer ml-1"
                title="Tutup Pratinjau PDF"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PDF Paper Container (Simulasi Lembar Kertas Dokumen Resmi A4) */}
          <div className="w-full flex justify-center pb-12 overflow-x-auto">
            <div
              style={{
                transform: `scale(${pdfZoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease'
              }}
              className="w-full max-w-3xl bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 border border-slate-300 font-serif text-[13px] leading-relaxed select-text"
            >
              {/* KOP SURAT RESMI UNIVERSITAS BRAWIJAYA */}
              <div className="flex items-center gap-4 pb-3 border-b-2 border-black">
                {/* Logo UB */}
                <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <div className="w-18 h-18 rounded-full border-2 border-[#002B49] bg-gradient-to-b from-[#002B49] to-[#001828] text-white flex flex-col items-center justify-center p-1 text-center shadow-sm">
                    <GraduationCap className="w-7 h-7 text-[#D4AF37] mb-0.5" />
                    <span className="text-[7px] font-sans font-bold tracking-tighter text-[#D4AF37]">
                      UB MALANG
                    </span>
                    <span className="text-[6px] font-sans text-slate-200 leading-none">EST. 1963</span>
                  </div>
                </div>

                {/* Kop Text */}
                <div className="flex-1 text-center leading-tight">
                  <h5 className="font-bold text-[12px] uppercase tracking-wide text-slate-900">
                    Kementerian Pendidikan Tinggi, Sains, dan Teknologi
                  </h5>
                  <h4 className="font-extrabold text-[15px] uppercase tracking-wider text-[#002B49]">
                    Universitas Brawijaya
                  </h4>
                  <h5 className="font-bold text-[13px] uppercase text-slate-800">
                    Fakultas Sains dan Teknologi
                  </h5>
                  <h6 className="font-bold text-[12px] uppercase text-slate-900">
                    Departemen Kimia - Program Studi Magister (S2) Kimia
                  </h6>
                  <p className="font-sans text-[10px] text-slate-600 mt-1">
                    Jalan Veteran, Malang 65145, Jawa Timur, Indonesia • Telp. (0341) 554403, 575791
                  </p>
                  <p className="font-sans text-[9.5px] text-slate-500">
                    Laman: <span className="text-blue-700 underline">https://kimia.ub.ac.id</span> • Pos-el: <span className="text-blue-700 underline">pasca.kimia@ub.ac.id</span>
                  </p>
                </div>
              </div>
              {/* Secondary thin divider line */}
              <div className="border-b border-black mt-0.5 mb-6" />

              {/* 1. KONTEN DOKUMEN: BERITA ACARA */}
              {activePdfDoc.type === 'Berita Acara' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-base tracking-wider uppercase underline">
                      BERITA ACARA SEMINAR PROPOSAL TESIS
                    </h3>
                    <p className="text-xs font-mono font-semibold text-slate-700">
                      Nomor: {activePdfDoc.nomorSurat}
                    </p>
                  </div>

                  <p className="text-justify text-xs">
                    Pada hari ini, <strong>{activePdfDoc.tanggalSurat}</strong>, bertempat di{' '}
                    <strong>{activePdfDoc.lokasi}</strong> Universitas Brawijaya, telah diselenggarakan
                    Ujian Seminar Proposal Tesis Program Studi Magister (S2) Kimia Fakultas Sains dan Teknologi
                    Universitas Brawijaya bagi mahasiswa:
                  </p>

                  {/* Biodata Table */}
                  <div className="border border-slate-400 rounded-xs overflow-hidden text-xs">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="w-1/3 p-2 bg-slate-50 font-bold border-r border-slate-300">Nama Mahasiswa</td>
                          <td className="p-2 font-bold uppercase">{activePdfDoc.studentName}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-300">Nomor Induk Mahasiswa (NIM)</td>
                          <td className="p-2 font-mono font-bold">{activePdfDoc.studentNim}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-300">Program Studi</td>
                          <td className="p-2">{activePdfDoc.studentProdi}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-300">Minat Penelitian</td>
                          <td className="p-2">Kimia Hayati, Material Hayati &amp; Nano-sensor</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 bg-slate-50 font-bold border-r border-slate-300">Judul Proposal Tesis</td>
                          <td className="p-2 font-semibold italic">"{activePdfDoc.judul}"</td>
                        </tr>
                        {activePdfDoc.judulInggris && (
                          <tr>
                            <td className="p-2 bg-slate-50 font-bold border-r border-slate-300">Judul Bahasa Inggris</td>
                            <td className="p-2 italic text-slate-600">"{activePdfDoc.judulInggris}"</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Komisi Pembimbing & Penguji Table */}
                  <div className="space-y-1">
                    <span className="font-bold text-xs">Susunan Dewan Penguji &amp; Komisi Pembimbing:</span>
                    <div className="border border-slate-400 rounded-xs overflow-hidden text-xs">
                      <table className="w-full border-collapse">
                        <thead className="bg-slate-100 text-[11px] font-bold border-b border-slate-300">
                          <tr>
                            <th className="p-2 text-center w-12 border-r border-slate-300">No.</th>
                            <th className="p-2 text-left border-r border-slate-300">Nama Dosen Penguji</th>
                            <th className="p-2 text-left border-r border-slate-300">Jabatan Tim</th>
                            <th className="p-2 text-center w-28">Tanda Tangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                          <tr>
                            <td className="p-2 text-center border-r border-slate-300 font-bold">1</td>
                            <td className="p-2 font-semibold border-r border-slate-300">{activePdfDoc.dosen1}</td>
                            <td className="p-2 border-r border-slate-300 text-slate-700">Pembimbing Utama (Ketua)</td>
                            <td className="p-2 text-center text-[10px] text-emerald-700 font-sans font-bold">[Tervalidasi Digital]</td>
                          </tr>
                          <tr>
                            <td className="p-2 text-center border-r border-slate-300 font-bold">2</td>
                            <td className="p-2 font-semibold border-r border-slate-300">{activePdfDoc.dosen2 || 'Masruri, S.Si., M.Si., Ph.D'}</td>
                            <td className="p-2 border-r border-slate-300 text-slate-700">Pembimbing Pendamping (Sekretaris)</td>
                            <td className="p-2 text-center text-[10px] text-emerald-700 font-sans font-bold">[Tervalidasi Digital]</td>
                          </tr>
                          <tr>
                            <td className="p-2 text-center border-r border-slate-300 font-bold">3</td>
                            <td className="p-2 font-semibold border-r border-slate-300">Prof. Dr. Sc. Asep Awaludin Prihanto, S.Pi., MP.</td>
                            <td className="p-2 border-r border-slate-300 text-slate-700">Dosen Penguji I (Anggota)</td>
                            <td className="p-2 text-center text-[10px] text-emerald-700 font-sans font-bold">[Tervalidasi Digital]</td>
                          </tr>
                          <tr>
                            <td className="p-2 text-center border-r border-slate-300 font-bold">4</td>
                            <td className="p-2 font-semibold border-r border-slate-300">Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Sc.</td>
                            <td className="p-2 border-r border-slate-300 text-slate-700">Dosen Penguji II (Anggota)</td>
                            <td className="p-2 text-center text-[10px] text-emerald-700 font-sans font-bold">[Tervalidasi Digital]</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Rekapitulasi Nilai & Keputusan */}
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="font-bold">Nilai Evaluasi Rata-rata:</span>
                      <span className="font-mono font-extrabold text-sm text-[#002B49]">
                        {activePdfDoc.nilai || '88.50'} (Nilai Mutu: A)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Keputusan Hasil Sidang:</span>
                      <span className="font-bold uppercase text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        {activePdfDoc.predikat || 'LULUS DENGAN REVISI KECIL'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 italic pt-1">
                      Catatan: Mahasiswa wajib menyelesaikan revisi naskah proposal sesuai masukan dewan penguji
                      dalam kurun waktu maksimal 14 (empat belas) hari kerja terhitung sejak pelaksanaan seminar proposal.
                    </p>
                  </div>

                  {/* Signatures & Seal */}
                  <div className="pt-4 grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center space-y-14">
                      <p>Mahasiswa yang diuji,</p>
                      <div>
                        <strong className="block underline uppercase">{activePdfDoc.studentName}</strong>
                        <span className="text-[11px] font-mono">NIM. {activePdfDoc.studentNim}</span>
                      </div>
                    </div>

                    <div className="text-center space-y-14 relative">
                      <p>Malang, {activePdfDoc.tanggalSurat}<br />Ketua Dewan Penguji / Pembimbing Utama,</p>
                      <div>
                        <strong className="block underline uppercase">{activePdfDoc.dosen1}</strong>
                        <span className="text-[11px]">NIP. 196009031988022001</span>
                      </div>

                      {/* Stempel & QR Code Watermark */}
                      <div className="absolute right-2 bottom-0 flex items-center gap-2 pointer-events-none opacity-85">
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-blue-800 text-blue-900 flex flex-col items-center justify-center text-[7px] font-bold p-1 leading-tight rotate-12">
                          <span>UB MALANG</span>
                          <span className="text-[6px]">PASCASARJANA</span>
                          <span>TERVALIDASI</span>
                        </div>
                        <div className="p-1 bg-white border border-slate-300 rounded shadow-2xs">
                          <QrCode className="w-9 h-9 text-slate-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. KONTEN DOKUMEN: UNDANGAN */}
              {activePdfDoc.type === 'Undangan' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p><span className="inline-block w-20 font-semibold">Nomor</span>: {activePdfDoc.nomorSurat}</p>
                      <p><span className="inline-block w-20 font-semibold">Lampiran</span>: 1 (satu) Berkas Draf Naskah Proposal Tesis</p>
                      <p><span className="inline-block w-20 font-semibold">Perihal</span>: <strong>{activePdfDoc.perihal}</strong></p>
                    </div>
                    <div className="text-right">
                      <p>Malang, {activePdfDoc.tanggalSurat}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="font-semibold">Kepada Yth.</p>
                    <ol className="list-decimal list-inside pl-1 space-y-0.5 font-medium">
                      <li>{activePdfDoc.dosen1} (Dosen Pembimbing Utama)</li>
                      <li>{activePdfDoc.dosen2 || 'Masruri, S.Si., M.Si., Ph.D'} (Dosen Pembimbing Pendamping)</li>
                      <li>Dosen Penguji Ujian Seminar Proposal Tesis S2 Kimia</li>
                    </ol>
                    <p className="mt-1">di Tempat</p>
                  </div>

                  <p className="text-justify leading-relaxed">
                    Dengan hormat, sehubungan dengan pemenuhan kurikulum akademik Program Studi Magister (S2) Kimia
                    Fakultas Sains dan Teknologi Universitas Brawijaya, kami mengundang Bapak/Ibu dosen untuk hadir
                    sebagai Dewan Penguji pada Ujian Seminar Proposal Tesis yang akan diselenggarakan pada:
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1.5 font-sans text-xs">
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Hari / Tanggal</span>
                      <span className="col-span-9 font-bold text-slate-900">: {activePdfDoc.tanggalUjian}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Pukul / Jam</span>
                      <span className="col-span-9 font-bold text-slate-900">: {activePdfDoc.jamUjian}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Tempat</span>
                      <span className="col-span-9 font-bold text-slate-900">: {activePdfDoc.lokasi}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Link Daring</span>
                      <span className="col-span-9 font-mono text-blue-700 underline">: {activePdfDoc.linkDaring}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Nama Mahasiswa</span>
                      <span className="col-span-9 font-bold text-slate-900">: {activePdfDoc.studentName} (NIM: {activePdfDoc.studentNim})</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Judul Proposal</span>
                      <span className="col-span-9 font-semibold text-slate-900 italic">: "{activePdfDoc.judul}"</span>
                    </div>
                  </div>

                  <p className="text-justify leading-relaxed">
                    Mengingat pentingnya agenda evaluasi proposal penelitian tesis ini, kehadiran Bapak/Ibu dosen
                    sangat kami harapkan tepat pada waktunya. Berkas naskah draf proposal mahasiswa terlampir bersama surat ini.
                  </p>
                  <p>Demikian surat undangan ini kami sampaikan. Atas kesediaan dan kerjasamanya, kami haturkan terima kasih.</p>

                  {/* Signature */}
                  <div className="pt-6 flex justify-end text-xs">
                    <div className="text-center space-y-14 relative w-64">
                      <p>Ketua Departemen / Program Studi Magister Kimia,</p>
                      <div>
                        <strong className="block underline uppercase font-bold">Masruri, S.Si., M.Si., Ph.D</strong>
                        <span className="text-[11px]">NIP. 197404122000031001</span>
                      </div>

                      <div className="absolute left-2 bottom-0 flex items-center gap-2 pointer-events-none opacity-85">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#002B49] text-[#002B49] flex flex-col items-center justify-center text-[6px] font-bold p-1 leading-tight rotate-6">
                          <span>KIMIA S2</span>
                          <span>FSTEM UB</span>
                          <span>TERVERIFIKASI</span>
                        </div>
                        <div className="p-0.5 bg-white border border-slate-300 rounded shadow-2xs">
                          <QrCode className="w-8 h-8 text-slate-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. KONTEN DOKUMEN: PEMBERITAHUAN */}
              {activePdfDoc.type === 'Pemberitahuan' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p><span className="inline-block w-20 font-semibold">Nomor</span>: {activePdfDoc.nomorSurat}</p>
                      <p><span className="inline-block w-20 font-semibold">Lampiran</span>: -</p>
                      <p><span className="inline-block w-20 font-semibold">Perihal</span>: <strong>{activePdfDoc.perihal}</strong></p>
                    </div>
                    <div className="text-right">
                      <p>Malang, {activePdfDoc.tanggalSurat}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="font-semibold">Kepada Yth.</p>
                    <p className="font-bold uppercase">Sdr. {activePdfDoc.studentName}</p>
                    <p className="font-mono">NIM. {activePdfDoc.studentNim}</p>
                    <p>Mahasiswa Program Studi Magister (S2) Kimia FSTeM UB</p>
                    <p className="mt-0.5">di Malang</p>
                  </div>

                  <p className="text-justify leading-relaxed">
                    Berdasarkan verifikasi kelayakan berkas akademik dan persetujuan tertulis Komisi Pembimbing Tesis,
                    dengan ini diberitahukan bahwa pelaksanaan Ujian Seminar Proposal Tesis Saudara dijadwalkan sebagai berikut:
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-300 rounded space-y-1 text-xs font-sans">
                    <p><strong>Hari / Tanggal</strong> : {activePdfDoc.tanggalUjian}</p>
                    <p><strong>Waktu</strong> : {activePdfDoc.jamUjian}</p>
                    <p><strong>Lokasi Ruang</strong> : {activePdfDoc.lokasi}</p>
                    <p><strong>Komisi Pembimbing</strong> : 1. {activePdfDoc.dosen1} | 2. {activePdfDoc.dosen2 || 'Masruri, S.Si., M.Si., Ph.D'}</p>
                    <p><strong>Judul Tesis</strong> : <em>"{activePdfDoc.judul}"</em></p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="font-bold underline">Tata Tertib &amp; Ketentuan Pelaksanaan Ujian:</span>
                    <ol className="list-decimal list-inside pl-1 space-y-1 text-slate-800 leading-relaxed">
                      <li>Mahasiswa wajib menyerahkan salinan draf naskah proposal kepada seluruh Dewan Penguji paling lambat 3 (tiga) hari kalender sebelum ujian.</li>
                      <li>Mahasiswa wajib hadir di ruang sidang 30 menit sebelum ujian dimulai dengan mengenakan pakaian formal (kemeja putih, celana/rok hitam formal, sepatu pantofel, dan jas almamater resmi Universitas Brawijaya).</li>
                      <li>Total alokasi waktu ujian 90 menit (maksimal 30 menit pemaparan materi presentasi dan 60 menit sesi tanya jawab/diskusi bersama tim penguji).</li>
                      <li>Lembar perbaikan/revisi seminar proposal yang telah disetujui dewan penguji wajib diserahkan ke bagian administrasi paling lambat 14 (empat belas) hari kerja setelah ujian.</li>
                    </ol>
                  </div>

                  <p>Demikian surat pemberitahuan ini disampaikan untuk dipedomani dan dilaksanakan dengan penuh tanggung jawab.</p>

                  {/* Signature */}
                  <div className="pt-6 flex justify-end text-xs">
                    <div className="text-center space-y-14 relative w-64">
                      <p>a.n. Dekan,<br />Wakil Dekan I Bidang Akademik,</p>
                      <div>
                        <strong className="block underline uppercase font-bold">Dr. Ir. Mochammad Sasmito Djati, M.S.</strong>
                        <span className="text-[11px]">NIP. 196109151987011001</span>
                      </div>

                      <div className="absolute left-2 bottom-0 flex items-center gap-2 pointer-events-none opacity-85">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#002B49] text-[#002B49] flex flex-col items-center justify-center text-[6px] font-bold p-1 leading-tight rotate-3">
                          <span>FSTEM UB</span>
                          <span>WADEK I</span>
                          <span>SAH</span>
                        </div>
                        <div className="p-0.5 bg-white border border-slate-300 rounded shadow-2xs">
                          <QrCode className="w-8 h-8 text-slate-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. KONTEN DOKUMEN: PERMOHONAN */}
              {activePdfDoc.type === 'Permohonan' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p><span className="inline-block w-20 font-semibold">Nomor Reg.</span>: {activePdfDoc.nomorSurat}</p>
                      <p><span className="inline-block w-20 font-semibold">Lampiran</span>: 1 (satu) Berkas Persyaratan Seminar Proposal</p>
                      <p><span className="inline-block w-20 font-semibold">Perihal</span>: <strong>{activePdfDoc.perihal}</strong></p>
                    </div>
                    <div className="text-right">
                      <p>Malang, {activePdfDoc.tanggalSurat}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="font-semibold">Kepada Yth.</p>
                    <p>Dekan Fakultas Sains dan Teknologi</p>
                    <p>c.q. Ketua Program Studi Magister (S2) Kimia</p>
                    <p>Universitas Brawijaya</p>
                    <p>di Malang</p>
                  </div>

                  <p className="text-justify leading-relaxed">
                    Saya yang bertanda tangan di bawah ini:
                  </p>

                  <div className="border border-slate-300 rounded p-2.5 bg-slate-50 text-xs space-y-1 font-sans">
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Nama Lengkap</span>
                      <span className="col-span-9 font-bold text-slate-900">: {activePdfDoc.studentName}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">NIM</span>
                      <span className="col-span-9 font-mono font-bold text-slate-900">: {activePdfDoc.studentNim}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Program Studi</span>
                      <span className="col-span-9 font-bold text-slate-900">: {activePdfDoc.studentProdi}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Dosen Pembimbing I</span>
                      <span className="col-span-9 font-semibold text-slate-900">: {activePdfDoc.dosen1}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Dosen Pembimbing II</span>
                      <span className="col-span-9 font-semibold text-slate-900">: {activePdfDoc.dosen2 || 'Masruri, S.Si., M.Si., Ph.D'}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-3 font-semibold text-slate-600">Judul Proposal Tesis</span>
                      <span className="col-span-9 font-semibold text-slate-900 italic">: "{activePdfDoc.judul}"</span>
                    </div>
                  </div>

                  <p className="text-justify leading-relaxed">
                    Dengan ini mengajukan permohonan untuk dapat menempuh <strong>Ujian Seminar Proposal Tesis</strong>{' '}
                    pada Semester Ganjil Tahun Akademik 2026/2027. Bersama surat ini, saya lampirkan dokumen persyaratan administratif:
                  </p>

                  <ol className="list-decimal list-inside pl-1 space-y-0.5 text-slate-800">
                    <li>Lembar persetujuan naskah proposal tesis yang telah ditandatangani Pembimbing Utama &amp; Pendamping.</li>
                    <li>Salinan Transkrip Akademik Sementara (telah menempuh ≥ 18 SKS teori dengan IPK kumulatif 3.82).</li>
                    <li>Draf naskah proposal tesis lengkap (Bab 1 s.d. Bab 3 disertai daftar pustaka dan instrumen riset).</li>
                    <li>Bukti pelunasan pembayaran UKT semester berjalan dan bukti bebas tanggungan laboratorium.</li>
                    <li>Salinan sertifikat TOEFL/Bahasa Inggris yang masih berlaku dengan skor memenuhi kriteria pascasarjana.</li>
                  </ol>

                  <p>Demikian surat permohonan ini saya ajukan dengan sebenar-benarnya. Atas perhatian dan perkenan Bapak/Ibu, saya haturkan banyak terima kasih.</p>

                  {/* 3 Signature Columns: Mahasiswa, Pembimbing, Kaprodi */}
                  <div className="pt-6 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="space-y-12">
                      <p>Pemohon (Mahasiswa),</p>
                      <div>
                        <strong className="block underline uppercase font-bold">{activePdfDoc.studentName}</strong>
                        <span className="font-mono text-[10px]">NIM. {activePdfDoc.studentNim}</span>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <p>Menyetujui,<br />Pembimbing Utama,</p>
                      <div>
                        <strong className="block underline uppercase font-bold">{activePdfDoc.dosen1}</strong>
                        <span className="text-[10px]">NIP. 196009031988022001</span>
                      </div>
                    </div>

                    <div className="space-y-12 relative">
                      <p>Mengetahui,<br />Ketua Program Studi S2 Kimia,</p>
                      <div>
                        <strong className="block underline uppercase font-bold">Masruri, S.Si., M.Si., Ph.D</strong>
                        <span className="text-[10px]">NIP. 197404122000031001</span>
                      </div>

                      <div className="absolute right-0 bottom-0 pointer-events-none opacity-80">
                        <QrCode className="w-7 h-7 text-slate-800" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH USULAN TESIS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-900 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Form Pendaftaran Tesis</h3>
                  <p className="text-xs text-slate-500">
                    Program Magister Kimia (S2) • FSTeM Universitas Brawijaya
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

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              {/* Row 1: NIM & Nama Mahasiswa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIM Mahasiswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 236090200111001"
                    value={formNim}
                    onChange={(e) => setFormNim(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Mahasiswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Mahasiswa S2..."
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>
              </div>

              {/* Row 2: Dosen Pembimbing & Dosen Pembimbing 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Dosen Pembimbing (Utama) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    required
                    value={formDosen}
                    onChange={(e) => setFormDosen(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                  >
                    <option value="">-- Pilih Dosen Pembimbing (Utama) --</option>
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
                      Dosen Pembimbing 2 (Opsional)
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    value={formDosen2}
                    onChange={(e) => setFormDosen2(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
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

              {/* Row 3: Judul Tesis */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Tesis <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Judul Usulan Tesis Mahasiswa Magister Kimia..."
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white resize-y leading-relaxed"
                />
              </div>

              {/* Judul Tesis (in English) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    Judul Tesis (in English)
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium italic">English Title (Opsional)</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Thesis Title in English..."
                  value={formJudulInggris}
                  onChange={(e) => setFormJudulInggris(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium italic focus:ring-2 focus:ring-[#002B49] bg-white resize-y leading-relaxed text-slate-700"
                />
              </div>

              {/* Row 4: Tahapan Tesis & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tahapan Tesis <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTahapan}
                    onChange={(e) => setFormTahapan(e.target.value as TahapanTesis)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                    required
                  >
                    {tahapanList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TesisStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                    required
                  >
                    {LIST_STATUS_TESIS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Tanggal & Jam (rentang waktu) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tanggal <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 15 Desember 2026"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Jam (rentang waktu) <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 09:00 - 11:30 WIB"
                    value={formJam}
                    onChange={(e) => setFormJam(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>
              </div>

              {/* Row 6: Lokasi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Lokasi <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ruang Sidang Pascasarjana Gedung Kimia Lt. 3"
                  value={formLokasi}
                  onChange={(e) => setFormLokasi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white"
                />
              </div>

              {/* Row 7: Link Daring */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span>Link Daring</span>
                </label>
                <input
                  type="url"
                  placeholder="Contoh: https://meet.google.com/tesis-kim-s2ub"
                  value={formLinkDaring}
                  onChange={(e) => setFormLinkDaring(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-[#002B49] bg-white"
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
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-slate-900 border border-yellow-500 rounded-lg font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-slate-900" />
                  <span>Daftar Tesis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA TESIS */}
      {isEditModalOpen && selectedTesis && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Rincian Tesis &amp; Tugas Akhir Mahasiswa</h3>
                  <p className="text-xs text-slate-500">
                    Perbarui data tesis mahasiswa: {selectedTesis.namaMahasiswa} ({selectedTesis.nim})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIM Mahasiswa</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nim}
                    onChange={(e) => setEditFormData({ ...editFormData, nim: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Mahasiswa</label>
                  <input
                    type="text"
                    required
                    value={editFormData.namaMahasiswa}
                    onChange={(e) => setEditFormData({ ...editFormData, namaMahasiswa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Dosen Pembimbing (Utama) <span className="text-rose-500">*</span></label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    required
                    value={editFormData.dosenPembimbing}
                    onChange={(e) => setEditFormData({ ...editFormData, dosenPembimbing: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                  >
                    <option value="">-- Pilih Dosen Pembimbing (Utama) --</option>
                    {dosenNameOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Dosen Pembimbing 2 (Opsional)</label>
                    <span className="text-[10px] text-slate-400 font-medium">Database Dosen</span>
                  </div>
                  <select
                    value={editFormData.dosenPembimbing2 || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, dosenPembimbing2: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Tesis</label>
                <textarea
                  rows={2}
                  required
                  value={editFormData.judul}
                  onChange={(e) => setEditFormData({ ...editFormData, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white resize-y"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Judul Tesis (in English)</label>
                  <span className="text-[10px] text-slate-400 font-medium italic">English Title (Opsional)</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Thesis Title in English..."
                  value={editFormData.judulInggris}
                  onChange={(e) => setEditFormData({ ...editFormData, judulInggris: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium italic focus:ring-2 focus:ring-[#002B49] bg-white resize-y text-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahapan Tesis</label>
                  <select
                    value={editFormData.tahapan}
                    onChange={(e) => setEditFormData({ ...editFormData, tahapan: e.target.value as TahapanTesis })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                  >
                    {tahapanList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as TesisStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-[#002B49] bg-white cursor-pointer"
                  >
                    {LIST_STATUS_TESIS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Evaluasi</label>
                  <input
                    type="text"
                    value={editFormData.nilai}
                    onChange={(e) => setEditFormData({ ...editFormData, nilai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tanggal</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.tanggal}
                    onChange={(e) => setEditFormData({ ...editFormData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Jam (rentang waktu)</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.jam}
                    onChange={(e) => setEditFormData({ ...editFormData, jam: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Lokasi</span>
                </label>
                <input
                  type="text"
                  value={editFormData.lokasi}
                  onChange={(e) => setEditFormData({ ...editFormData, lokasi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span>Link Daring</span>
                </label>
                <input
                  type="url"
                  value={editFormData.linkDaring}
                  onChange={(e) => setEditFormData({ ...editFormData, linkDaring: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-[#002B49] bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Data Induk Mahasiswa S2 (Box 1: Data Pribadi, Box 2: Riwayat Pendidikan Sarjana, Box 3: Data Akhir Pendidikan) */}
      <DataIndukS2Modal
        isOpen={isDataIndukModalOpen}
        onClose={() => setIsDataIndukModalOpen(false)}
        selectedStudent={dataIndukStudent}
        studentList={tesisList}
        dosenOptions={dosenNameOptions}
        onSaveSuccess={handleSaveDataIndukSuccess}
      />
    </div>
  );
};
