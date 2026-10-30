import React, { useState, useId, useRef } from 'react';
import {
  KategoriArsipItem,
  VisibilitasArsip,
  UserRole,
  MasterKategoriArsipItem,
  StatusKategori
} from '../types/sikma';
import {
  INITIAL_KATEGORI_ARSIP_LIST,
  INITIAL_MASTER_KATEGORI_LIST
} from '../data/arsipList';
import { UbLogo } from './UbLogo';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import {
  FolderArchive,
  Plus,
  Trash2,
  Eye,
  Edit2,
  Search,
  RotateCcw,
  CheckCircle2,
  X,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  Globe,
  Users,
  Lock,
  ShieldAlert,
  Calendar,
  UploadCloud,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileUp,
  Loader2
} from 'lucide-react';

interface ArsipConfigViewProps {
  currentRole: UserRole;
}

const VISIBILITAS_OPTIONS: VisibilitasArsip[] = [
  'Public',
  'Private'
];

const ITEMS_PER_PAGE = 10;

export const ArsipConfigView: React.FC<ArsipConfigViewProps> = ({ currentRole }) => {
  if (currentRole === 'mahasiswa') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas: Menu Arsip</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          Menu <strong>Arsip Departemen</strong> tidak dapat diakses oleh peran <strong>Mahasiswa</strong>. Menu ini hanya dapat diakses oleh Administrator dan Dosen.
        </p>
      </div>
    );
  }

  // Persistence for Archives List (dengan opsi Public dan Private)
  const [arsipList, setArsipList] = useState<KategoriArsipItem[]>(() => {
    const saved = localStorage.getItem('sikma_kategori_arsip_list_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10 && parsed[0].namaFile) {
          return parsed.map((item: any) => ({
            ...item,
            visibilitas: item.visibilitas === 'Private' || item.visibilitas === 'Khusus Dosen' || item.visibilitas === 'Rahasia / Pimpinan' ? 'Private' : 'Public'
          }));
        }
      } catch {
        return INITIAL_KATEGORI_ARSIP_LIST;
      }
    }
    // Migration from v3 if exists
    const oldSaved = localStorage.getItem('sikma_kategori_arsip_list_v3');
    if (oldSaved) {
      try {
        const parsed = JSON.parse(oldSaved);
        if (Array.isArray(parsed) && parsed.length >= 10 && parsed[0].namaFile) {
          return parsed.map((item: any) => ({
            ...item,
            visibilitas: item.visibilitas === 'Private' || item.visibilitas === 'Khusus Dosen' || item.visibilitas === 'Rahasia / Pimpinan' ? 'Private' : 'Public'
          }));
        }
      } catch {}
    }
    return INITIAL_KATEGORI_ARSIP_LIST;
  });

  // Persistence for Master Kategori Arsip
  const [masterKategoriList, setMasterKategoriList] = useState<MasterKategoriArsipItem[]>(() => {
    const saved = localStorage.getItem('sikma_master_kategori_arsip_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        return INITIAL_MASTER_KATEGORI_LIST;
      }
    }
    return INITIAL_MASTER_KATEGORI_LIST;
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterVisibilitas, setFilterVisibilitas] = useState<string>('Semua');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal 1: Form Tambah Arsip (Button Kuning)
  const [isAddArsipModalOpen, setIsAddArsipModalOpen] = useState(false);
  const [formNama, setFormNama] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formKategoriArsip, setFormKategoriArsip] = useState('Kerjasama');
  const [formJenisArsip, setFormJenisArsip] = useState<'Public' | 'Private'>('Public');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFileName, setFormFileName] = useState('');
  const [formFileSize, setFormFileSize] = useState('');
  const [formFileType, setFormFileType] = useState<'PDF' | 'DOCX' | 'XLSX' | 'ZIP'>('PDF');
  const [addFormError, setAddFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal 2: Form Kategori Arsip (Button Biru)
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);

  // Sub-modal 1: Form Tambah Kategori (Button Tambah Kategori Arsip Hijau di Form Kategori Arsip)
  const [isAddKategoriModalOpen, setIsAddKategoriModalOpen] = useState(false);
  const [newNamaKategori, setNewNamaKategori] = useState('');
  const [addKategoriError, setAddKategoriError] = useState('');

  // Sub-modal 2: Form Edit Kategori (Button Edit Kuning di Form Kategori Arsip)
  const [editingKategoriItem, setEditingKategoriItem] = useState<MasterKategoriArsipItem | null>(null);
  const [editNamaKategori, setEditNamaKategori] = useState('');
  const [editStatusKategori, setEditStatusKategori] = useState<StatusKategori>('Aktif');
  const [editKategoriError, setEditKategoriError] = useState('');

  // Modal State for Preview Document
  const [previewItem, setPreviewItem] = useState<KategoriArsipItem | null>(null);

  // Modal State for Delete Confirmation
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<KategoriArsipItem | null>(null);
  const [deleteConfirmKategori, setDeleteConfirmKategori] = useState<MasterKategoriArsipItem | null>(null);

  // Modal State for Quick Edit Archive
  const [editingArchiveItem, setEditingArchiveItem] = useState<KategoriArsipItem | null>(null);

  // Toast Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // In-memory store for user-uploaded File objects during session
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const namaInputId = useId();
  const keteranganInputId = useId();
  const kategoriSelectId = useId();
  const jenisArsipSelectId = useId();
  const newNamaKategoriInputId = useId();
  const editNamaKategoriInputId = useId();
  const editStatusSelectId = useId();

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const saveToStorage = (newList: KategoriArsipItem[]) => {
    setArsipList(newList);
    localStorage.setItem('sikma_kategori_arsip_list_v4', JSON.stringify(newList));
  };

  const saveMasterKategori = (newList: MasterKategoriArsipItem[]) => {
    setMasterKategoriList(newList);
    localStorage.setItem('sikma_master_kategori_arsip_v2', JSON.stringify(newList));
  };

  // Open Form Tambah Arsip (Button Kuning)
  const handleOpenAddArsip = () => {
    setFormNama('');
    setFormKeterangan('');
    setFormKategoriArsip('Kerjasama');
    setFormJenisArsip('Public');
    setFormFile(null);
    setFormFileName('');
    setFormFileSize('');
    setFormFileType('PDF');
    setAddFormError('');
    setIsAddArsipModalOpen(true);
  };

  // File browse selection handler
  const handleFileBrowseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFile(file);
      setFormFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFormFileSize(`${sizeMB} MB`);

      const ext = file.name.split('.').pop()?.toUpperCase();
      if (ext === 'PDF' || ext === 'DOCX' || ext === 'XLSX' || ext === 'ZIP') {
        setFormFileType(ext as 'PDF' | 'DOCX' | 'XLSX' | 'ZIP');
      } else {
        setFormFileType('PDF');
      }

      if (!formNama.trim()) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setFormNama(baseName.replace(/_/g, ' '));
      }
      if (addFormError) setAddFormError('');
    }
  };

  // Submit Save Form Tambah Arsip
  const handleSaveArsip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setAddFormError('Nama arsip wajib diisi.');
      return;
    }
    if (!formKeterangan.trim()) {
      setAddFormError('Keterangan arsip wajib diisi.');
      return;
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let finalFileName = formFileName.trim();
    if (!finalFileName) {
      finalFileName = `${formNama.trim().replace(/\s+/g, '_')}.${formFileType.toLowerCase()}`;
    }

    const newItemId = `arsip-doc-${Date.now()}`;
    const newItem: KategoriArsipItem = {
      id: newItemId,
      namaFile: finalFileName,
      kategori: formKategoriArsip,
      keterangan: formKeterangan.trim(),
      visibilitas: formJenisArsip, // merujuk pada Jenis Arsip: Public atau Private saja
      nomorSurat: `ARS/KIM/${now.getFullYear()}/${arsipList.length + 1}`,
      ukuranFile: formFileSize || '2.0 MB',
      tipeFile: formFileType,
      tanggalUpload: today,
      pengunggah: currentRole === 'dosen' ? 'Dosen Departemen Kimia' : 'Biro Administrasi Kimia FSTeM'
    };

    if (formFile) {
      setUploadedFiles((prev) => ({
        ...prev,
        [newItemId]: formFile
      }));
    }

    saveToStorage([newItem, ...arsipList]);
    setCurrentPage(1);
    setIsAddArsipModalOpen(false);
    showNotification(`Arsip "${finalFileName}" berhasil ditambahkan.`);
  };

  // Unduh File Handler (Fungsikan button Unduh File agar bisa download file asli / terverifikasi)
  const handleDownloadFile = async (item: KategoriArsipItem) => {
    setIsDownloading(true);
    try {
      // 1. Jika pengguna mengunggah file langsung selama sesi aktif, unduh file asli tersebut
      const uploaded = uploadedFiles[item.id];
      if (uploaded) {
        const url = URL.createObjectURL(uploaded);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.namaFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification(`Berkas asli "${item.namaFile}" berhasil diunduh.`, 'success');
        setIsDownloading(false);
        return;
      }

      const lowerName = item.namaFile.toLowerCase();
      const ext = lowerName.split('.').pop() || item.tipeFile?.toLowerCase() || 'pdf';

      // 2. Berkas Excel (XLSX)
      if (ext === 'xlsx' || ext === 'xls') {
        const wb = XLSX.utils.book_new();
        const wsData = [
          ['KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI'],
          ['UNIVERSITAS BRAWIJAYA - FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA'],
          ['DEPARTEMEN KIMIA - PANGKALAN DATA KEARSIPAN DIGITAL (SIKMA)'],
          [],
          ['METADATA ARSIP', 'NILAI DATA'],
          ['ID Arsip', item.id],
          ['Nama Berkas', item.namaFile],
          ['Kategori Arsip', item.kategori],
          ['Jenis Arsip / Visibilitas', item.visibilitas],
          ['Ukuran Berkas', item.ukuranFile || '2.0 MB'],
          ['Format File', item.tipeFile || 'XLSX'],
          [],
          ['RINGKASAN / URAIAN KETERANGAN ARSIP'],
          [item.keterangan],
          [],
          ['STATUS DIGITAL & VALIDASI'],
          ['Status Dokumen', 'Sah & Terverifikasi Digital di SIKMA UB'],
          ['Penanggung Jawab', 'Prof. Dr. Dra. Hermin Sulistyarti, M.Si (Ketua Departemen Kimia)']
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 32 }, { wch: 65 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Metadata Arsip');
        XLSX.writeFile(wb, item.namaFile);
        showNotification(`Berkas spreadsheet "${item.namaFile}" berhasil diunduh.`, 'success');
        setIsDownloading(false);
        return;
      }

      // 3. Berkas PDF Resmi UB
      if (ext === 'pdf') {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Kop Surat UB
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text('KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI', 105, 18, { align: 'center' });

        doc.setFontSize(13);
        doc.setTextColor(0, 43, 73); // Deep UB Blue
        doc.text('UNIVERSITAS BRAWIJAYA', 105, 24, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text('FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA', 105, 29, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0, 43, 73);
        doc.text('DEPARTEMEN KIMIA', 105, 34, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Jl. Veteran Malang 65145 | Telp: (0341) 575838 | Email: kimia@ub.ac.id | https://kimia.ub.ac.id', 105, 39, { align: 'center' });

        // Double Line Separator
        doc.setDrawColor(0, 43, 73);
        doc.setLineWidth(0.8);
        doc.line(20, 42, 190, 42);
        doc.setLineWidth(0.2);
        doc.line(20, 43.5, 190, 43.5);

        // Document Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(item.kategori.toUpperCase(), 105, 53, { align: 'center' });

        // Metadata Container Card
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(20, 60, 170, 36, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text('Nama Berkas:', 25, 68);
        doc.text('Kategori Arsip:', 25, 76);
        doc.text('Jenis Arsip / Visibilitas:', 25, 84);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(item.namaFile, 75, 68);
        doc.text(item.kategori, 75, 76);

        const isPriv = item.visibilitas === 'Private';
        doc.setFont('helvetica', 'bold');
        if (isPriv) {
          doc.setTextColor(180, 83, 9);
          doc.text('Private (Internal Terbatas)', 75, 84);
        } else {
          doc.setTextColor(5, 150, 105);
          doc.text('Public (Civitas & Umum)', 75, 84);
        }

        // Keterangan / Ringkasan Arsip
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('Uraian / Ringkasan Keterangan Arsip:', 20, 106);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(item.keterangan, 170);
        doc.text(splitText, 20, 113);

        const textEndY = 113 + splitText.length * 5 + 8;

        // Legal statement
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const statement = 'Dokumen ini merupakan arsip resmi yang tercatat secara digital dalam Sistem Informasi Kearsipan Kimia (SIKMA) Universitas Brawijaya. Seluruh informasi yang terkandung di dalamnya telah divalidasi keabsahannya.';
        const splitStatement = doc.splitTextToSize(statement, 170);
        doc.text(splitStatement, 20, textEndY);

        // Footer & Digital Signature
        const sigY = Math.max(textEndY + 22, 215);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Terverifikasi Digital SIKMA UB', 20, sigY);
        doc.text(`ID Berkas: ${item.id.toUpperCase()}`, 20, sigY + 5);
        doc.text(`Waktu Unduh: ${new Date().toLocaleDateString('id-ID')}`, 20, sigY + 10);

        doc.setTextColor(15, 23, 42);
        doc.text('Malang, Jawa Timur', 135, sigY);
        doc.setFont('helvetica', 'bold');
        doc.text('Ketua Departemen Kimia FSTeM', 135, sigY + 5);

        // Digital Signature Stamp Box
        doc.setDrawColor(5, 150, 105);
        doc.setFillColor(236, 253, 245);
        doc.roundedRect(135, sigY + 9, 50, 12, 1.5, 1.5, 'FD');
        doc.setFont('courier', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(5, 150, 105);
        doc.text('[TTE SAH UB]', 160, sigY + 16.5, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text('Prof. Dr. Dra. Hermin Sulistyarti, M.Si', 135, sigY + 28);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('NIP. 196403211989032001', 135, sigY + 32);

        doc.save(item.namaFile);
        showNotification(`Berkas PDF "${item.namaFile}" berhasil diunduh.`, 'success');
        setIsDownloading(false);
        return;
      }

      // 4. Berkas Format Lainnya (DOCX / ZIP / Dokumen Teks)
      const fileContent = `================================================================================
KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
UNIVERSITAS BRAWIJAYA - FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA
DEPARTEMEN KIMIA
Jl. Veteran Malang 65145 | Telp: (0341) 575838 | Email: kimia@ub.ac.id
================================================================================

PANGKALAN DATA KEARSIPAN DIGITAL (SIKMA)
Nama Dokumen     : ${item.namaFile}
Kategori Arsip   : ${item.kategori}
Jenis / Akses    : ${item.visibilitas}
Ukuran Berkas    : ${item.ukuranFile || '2.0 MB'} (${item.tipeFile || 'DOCX'})
ID Arsip         : ${item.id}

--------------------------------------------------------------------------------
URAIAN / RINGKASAN KETERANGAN ARSIP:
${item.keterangan}

--------------------------------------------------------------------------------
STATUS VERIFIKASI DIGITAL:
Dokumen terverifikasi digital resmi melalui SIKMA UB.
Keabsahan: Sah & Tercatat Resmi
Pengesahan: Prof. Dr. Dra. Hermin Sulistyarti, M.Si
NIP: 196403211989032001
Jabatan: Ketua Departemen Kimia FSTeM Universitas Brawijaya
================================================================================
`;
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.namaFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(`Berkas "${item.namaFile}" berhasil diunduh.`, 'success');
    } catch (err) {
      console.error('Download error:', err);
      const blob = new Blob([`Arsip SIKMA: ${item.namaFile}\nKategori: ${item.kategori}\nKeterangan: ${item.keterangan}`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.namaFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(`Berkas "${item.namaFile}" berhasil diunduh.`, 'success');
    } finally {
      setIsDownloading(false);
    }
  };

  // Cetak Dokumen Handler (Fungsikan button Cetak sehingga bisa mencetak file dengan format resmi)
  const handlePrintDocument = () => {
    if (!previewItem) return;
    setIsPrinting(true);
    showNotification(`Mempersiapkan dokumen "${previewItem.namaFile}" untuk dicetak...`, 'info');

    // Buat iframe khusus cetak untuk hasil cetak A4 yang presisi dan bersih
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      setIsPrinting(false);
      return;
    }

    const isPriv = previewItem.visibilitas === 'Private';
    const visBadgeColor = isPriv ? '#92400E' : '#065F46';
    const visBadgeBg = isPriv ? '#FEF3C7' : '#D1FAE5';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Cetak Arsip - ${previewItem.namaFile}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 18mm 20mm 20mm 20mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #0F172A;
              margin: 0;
              padding: 0;
              font-size: 11pt;
              line-height: 1.5;
            }
            .header-kop {
              text-align: center;
              border-bottom: 3px double #002B49;
              padding-bottom: 12px;
              margin-bottom: 22px;
            }
            .header-kop h4 {
              margin: 0;
              font-size: 10pt;
              font-weight: bold;
              text-transform: uppercase;
              color: #334155;
            }
            .header-kop h3 {
              margin: 3px 0 2px 0;
              font-size: 14pt;
              font-weight: 900;
              text-transform: uppercase;
              color: #002B49;
              letter-spacing: 0.5px;
            }
            .header-kop h5 {
              margin: 0;
              font-size: 11pt;
              font-weight: bold;
              color: #0F172A;
            }
            .header-kop p {
              margin: 4px 0 0 0;
              font-size: 8.5pt;
              color: #64748B;
            }
            .doc-title {
              text-align: center;
              margin: 20px 0 16px 0;
            }
            .doc-title h2 {
              margin: 0;
              font-size: 13pt;
              font-weight: bold;
              text-transform: uppercase;
              text-decoration: underline;
              letter-spacing: 0.5px;
            }
            .doc-title p {
              margin: 4px 0 0 0;
              font-size: 9.5pt;
              font-family: monospace;
              color: #475569;
            }
            .meta-table-box {
              background-color: #F8FAFC;
              border: 1px solid #CBD5E1;
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 20px;
            }
            .meta-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9.5pt;
            }
            .meta-table td {
              padding: 4px 6px;
              vertical-align: top;
            }
            .meta-table td.label {
              width: 180px;
              color: #475569;
              font-weight: bold;
            }
            .badge-visibilitas {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 8.5pt;
              font-weight: bold;
              background-color: ${visBadgeBg};
              color: ${visBadgeColor};
            }
            .content-section {
              margin: 20px 0;
            }
            .content-section h4 {
              margin: 0 0 8px 0;
              font-size: 10pt;
              font-weight: bold;
              color: #0F172A;
            }
            .quote-keterangan {
              background-color: #F1F5F9;
              border-left: 4px solid #002B49;
              padding: 12px 16px;
              margin: 0 0 16px 0;
              font-style: italic;
              font-size: 9.5pt;
              color: #334155;
              line-height: 1.6;
            }
            .legal-text {
              font-size: 9pt;
              color: #475569;
              text-align: justify;
              line-height: 1.6;
            }
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .verification-box {
              font-size: 8.5pt;
              color: #64748B;
            }
            .verification-box p {
              margin: 2px 0;
            }
            .signature-box {
              text-align: right;
              font-size: 9.5pt;
            }
            .signature-box p {
              margin: 2px 0;
            }
            .tte-seal {
              display: inline-block;
              border: 1px solid #059669;
              background-color: #ECFDF5;
              color: #059669;
              padding: 4px 10px;
              border-radius: 4px;
              font-size: 8pt;
              font-family: monospace;
              font-weight: bold;
              margin: 8px 0;
            }
            .signer-name {
              font-weight: bold;
              text-decoration: underline;
              color: #0F172A;
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header-kop" style="display: flex; align-items: center; justify-content: center; gap: 16px;">
            <img src="/assets/logo-ub.png" alt="Logo Universitas Brawijaya" style="width: 70px; height: 70px; object-fit: contain; flex-shrink: 0;" />
            <div style="text-align: center; flex: 1;">
              <h4>KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</h4>
              <h3>UNIVERSITAS BRAWIJAYA</h3>
              <h5>FAKULTAS SAINS, TEKNOLOGI, DAN MATEMATIKA</h5>
              <h4>DEPARTEMEN KIMIA</h4>
              <p>Jl. Veteran Malang 65145 &bull; Telp (0341) 575838 &bull; Email: kimia@ub.ac.id &bull; Website: https://kimia.ub.ac.id</p>
            </div>
          </div>

          <div class="doc-title">
            <h2>${previewItem.kategori}</h2>
          </div>

          <div class="meta-table-box">
            <table class="meta-table">
              <tr>
                <td class="label">Nama Berkas Arsip</td>
                <td>: <strong>${previewItem.namaFile}</strong></td>
              </tr>
              <tr>
                <td class="label">Kategori Arsip</td>
                <td>: ${previewItem.kategori}</td>
              </tr>
              <tr>
                <td class="label">Jenis Arsip (Visibilitas)</td>
                <td>: <span class="badge-visibilitas">${previewItem.visibilitas === 'Private' ? 'Private' : 'Public'}</span></td>
              </tr>
              <tr>
                <td class="label">Ukuran & Tipe Berkas</td>
                <td>: ${previewItem.ukuranFile || '2.0 MB'} (${previewItem.tipeFile || 'PDF'})</td>
              </tr>
            </table>
          </div>

          <div class="content-section">
            <h4>Uraian / Ringkasan Keterangan Arsip:</h4>
            <div class="quote-keterangan">
              &ldquo;${previewItem.keterangan}&rdquo;
            </div>
            <p class="legal-text">
              Dokumen ini telah terdaftar secara sah dalam Pangkalan Data Kearsipan Digital Departemen Kimia FSTeM Universitas Brawijaya (SIKMA). Seluruh salinan cetak ini memiliki validitas data yang setara dengan arsip digital yang tersimpan pada pangkalan data universitas.
            </p>
          </div>

          <div class="signature-section">
            <div class="verification-box">
              <p><strong>Terverifikasi Digital SIKMA UB</strong></p>
              <p>Kode Berkas: ${previewItem.id.toUpperCase()}</p>
              <p>Waktu Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</p>
            </div>
            <div class="signature-box">
              <p>Malang, Jawa Timur</p>
              <p><strong>Ketua Departemen Kimia FSTeM</strong></p>
              <div>
                <span class="tte-seal">[Tanda Tangan Elektronik UB]</span>
              </div>
              <p class="signer-name">Prof. Dr. Dra. Hermin Sulistyarti, M.Si</p>
              <p style="font-size: 8.5pt; color: #64748B;">NIP. 196403211989032001</p>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setIsPrinting(false);
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 2000);
    }, 300);
  };

  // Open Form Kategori Arsip (Button Biru)
  const handleOpenKategoriModal = () => {
    setIsKategoriModalOpen(true);
  };

  // Open Form Tambah Kategori (Button Hijau di Form Kategori Arsip)
  const handleOpenAddKategori = () => {
    setNewNamaKategori('');
    setAddKategoriError('');
    setIsAddKategoriModalOpen(true);
  };

  // Submit Save Form Tambah Kategori (Hasil input Nama Kategori masuk ke Form Kategori Arsip)
  const handleSaveAddKategori = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNamaKategori.trim();
    if (!trimmed) {
      setAddKategoriError('Nama Kategori wajib diisi.');
      return;
    }

    const isDuplicate = masterKategoriList.some(
      (k) => k.namaKategori.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setAddKategoriError(`Kategori "${trimmed}" sudah terdaftar.`);
      return;
    }

    const newKategori: MasterKategoriArsipItem = {
      id: `kat-${Date.now()}`,
      namaKategori: trimmed,
      status: 'Aktif'
    };

    const updated = [newKategori, ...masterKategoriList];
    saveMasterKategori(updated);
    setIsAddKategoriModalOpen(false);
    setNewNamaKategori('');
    showNotification(`Kategori "${trimmed}" berhasil ditambahkan ke daftar kategori.`);
  };

  // Open Form Edit Kategori (Button Kuning di Form Kategori Arsip)
  const handleOpenEditKategori = (kat: MasterKategoriArsipItem) => {
    setEditingKategoriItem(kat);
    setEditNamaKategori(kat.namaKategori);
    setEditStatusKategori(kat.status);
    setEditKategoriError('');
  };

  // Save Edit Kategori
  const handleSaveEditKategori = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNamaKategori.trim()) {
      setEditKategoriError('Nama Kategori wajib diisi.');
      return;
    }

    if (editingKategoriItem) {
      const updated = masterKategoriList.map((item) =>
        item.id === editingKategoriItem.id
          ? {
              ...item,
              namaKategori: editNamaKategori.trim(),
              status: editStatusKategori
            }
          : item
      );
      saveMasterKategori(updated);
      showNotification(`Kategori "${editNamaKategori.trim()}" (${editStatusKategori}) berhasil disimpan.`);
    }

    setEditingKategoriItem(null);
  };

  // Delete Archive Action
  const handleDelete = (item: KategoriArsipItem) => {
    const updated = arsipList.filter((a) => a.id !== item.id);
    saveToStorage(updated);
    setDeleteConfirmItem(null);
    showNotification(`Arsip "${item.namaFile}" telah berhasil dihapus.`, 'info');
  };

  // Delete Category Action (Button Delete pada Form Kategori Arsip)
  const handleDeleteKategori = (kat: MasterKategoriArsipItem) => {
    setDeleteConfirmKategori(kat);
  };

  const handleConfirmDeleteKategori = () => {
    if (!deleteConfirmKategori) return;
    const deletedName = deleteConfirmKategori.namaKategori;
    const updated = masterKategoriList.filter((k) => k.id !== deleteConfirmKategori.id);
    saveMasterKategori(updated);
    setDeleteConfirmKategori(null);
    showNotification(`Kategori "${deletedName}" berhasil dihapus.`, 'info');
  };

  // Reset to default master data
  const handleResetDefaults = () => {
    if (window.confirm('Kembalikan seluruh data Arsip dan Kategori ke master default Departemen Kimia FSTeM UB?')) {
      saveToStorage(INITIAL_KATEGORI_ARSIP_LIST);
      saveMasterKategori(INITIAL_MASTER_KATEGORI_LIST);
      setCurrentPage(1);
      showNotification('Data Kategori Arsip berhasil direset ke standar awal.');
    }
  };

  // Filtered items
  const filteredList = arsipList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.namaFile.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q) ||
      item.keterangan.toLowerCase().includes(q) ||
      (item.nomorSurat && item.nomorSurat.toLowerCase().includes(q));

    const matchesKategori = filterKategori === 'Semua' || item.kategori === filterKategori;
    const isItemPublic =
      item.visibilitas === 'Public' ||
      (item.visibilitas as string) === 'Publik' ||
      (item.visibilitas as string) === 'Internal Civitas';
    const matchesVisibilitas =
      filterVisibilitas === 'Semua' ||
      (filterVisibilitas === 'Public' && isItemPublic) ||
      (filterVisibilitas === 'Private' && !isItemPublic);

    return matchesSearch && matchesKategori && matchesVisibilitas;
  });

  // Pagination calculation (Max 10 file per page)
  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedList = filteredList.slice(startIndex, endIndex);

  // Visibilitas Badge Helper (Opsi Public dan Private saja merujuk ke Jenis Arsip)
  const renderVisibilitasBadge = (vis: VisibilitasArsip) => {
    const isPublic =
      vis === 'Public' ||
      (vis as string) === 'Publik' ||
      (vis as string) === 'Internal Civitas';

    if (isPublic) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>Public</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
        <Lock className="w-3.5 h-3.5 text-amber-600" />
        <span>Private</span>
      </span>
    );
  };

  // File Icon Helper
  const renderFileIcon = (tipe?: string) => {
    switch (tipe) {
      case 'XLSX':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'DOCX':
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-rose-600" />;
    }
  };

  // Active categories for Form Tambah Arsip (ensure Kerjasama, Laporan Service, Data Kesehatan, Akademik are available)
  const activeKategoriList = masterKategoriList.filter((k) => k.status === 'Aktif');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm animate-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header Card: Form Kategori Arsip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span>Arsip</span>
              <span>/</span>
              <span className="text-[#002B49] font-bold">Kategori Arsip</span>
            </div>
            {/* Judul Form Kategori Arsip */}
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#002B49] text-[#D4AF37] flex items-center justify-center shadow-xs">
                <FolderArchive className="w-5 h-5" />
              </div>
              <span>Kategori Arsip</span>
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Pangkalan data dokumen resmi, surat dinas, berkas akademik, dan pedoman kurikulum Departemen Kimia FSTeM Universitas Brawijaya
            </p>
          </div>

          {/* DUA BUTTON SESUAI REQUEST:
              1. Button 'Tambah Arsip' berwarna KUNING
              2. Button 'Kategori Arsip' berwarna BIRU
          */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* BUTTON 1: Tambah Arsip (Warna Kuning) */}
            <button
              type="button"
              id="btn-tambah-arsip"
              onClick={handleOpenAddArsip}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 font-bold text-xs sm:text-sm rounded-xl border border-amber-500 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              title="Tambah Arsip Baru (Form: Nama, Keterangan, Kategori Arsip, File Arsip)"
            >
              <Plus className="w-4 h-4 text-slate-900 stroke-[2.5]" />
              <span>Tambah Arsip</span>
            </button>

            {/* BUTTON 2: Kategori Arsip (Warna Biru) */}
            <button
              type="button"
              id="btn-kategori-arsip"
              onClick={handleOpenKategoriModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-blue-700 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              title="Buka Form Kategori Arsip (Fields: Nama Kategori, Status, Action)"
            >
              <Layers className="w-4 h-4 text-white" />
              <span>Kategori Arsip</span>
            </button>

            {/* Reset Master Button */}
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title="Kembalikan data arsip ke master awal"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Master</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Berkas Arsip
          </span>
          <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
            {arsipList.length} File
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Kategori Aktif
          </span>
          <span className="text-xl font-black text-emerald-600 font-mono mt-0.5 block">
            {activeKategoriList.length} Kategori
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Akses Public
          </span>
          <span className="text-xl font-black text-emerald-600 font-mono mt-0.5 block">
            {arsipList.filter((a) => a.visibilitas === 'Public' || (a.visibilitas as string) === 'Publik' || (a.visibilitas as string) === 'Internal Civitas').length} File
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Akses Private
          </span>
          <span className="text-xl font-black text-amber-600 font-mono mt-0.5 block">
            {arsipList.filter((a) => a.visibilitas === 'Private' || (a.visibilitas as string) === 'Khusus Dosen' || (a.visibilitas as string) === 'Rahasia / Pimpinan').length} File
          </span>
        </div>
      </div>

      {/* Table Section: Form Kategori Arsip */}
      {/* Fields: Nama File, Kategori, Keterangan, Visibilitas, Preview, Aksi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama file, kategori, keterangan..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-600">Kategori:</span>
              <select
                value={filterKategori}
                onChange={(e) => {
                  setFilterKategori(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua Kategori</option>
                {masterKategoriList.map((k) => (
                  <option key={k.id} value={k.namaKategori}>
                    {k.namaKategori} {k.status === 'Tidak Aktif' ? '(Nonaktif)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-600">Visibilitas:</span>
              <select
                value={filterVisibilitas}
                onChange={(e) => {
                  setFilterVisibilitas(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua Visibilitas</option>
                {VISIBILITAS_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Fields: Nama File, Kategori, Keterangan, Visibilitas, Preview, Aksi */}
        {/* Layout elegan table-fixed 100% tanpa scroll horizontal di bagian bawah */}
        <div className="w-full overflow-hidden">
          <table className="w-full text-xs text-left border-collapse table-fixed">
            <thead className="bg-[#002B49] text-white font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-2.5 py-3.5 w-10 text-center">No</th>
                <th className="px-3.5 py-3.5 w-[24%]">Nama File</th>
                <th className="px-3 py-3.5 w-[17%]">Kategori</th>
                <th className="px-3.5 py-3.5 w-[28%]">Keterangan</th>
                <th className="px-2.5 py-3.5 w-[13%] text-center">Visibilitas</th>
                <th className="px-2 py-3.5 w-[9%] text-center">Preview</th>
                <th className="px-2.5 py-3.5 w-[9%] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <FolderArchive className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada berkas arsip yang ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coba ganti kata kunci pencarian atau klik tombol &quot;Tambah Arsip&quot;
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, index) => {
                  const itemIndex = startIndex + index + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* No */}
                      <td className="px-2.5 py-3.5 text-center text-slate-400 font-mono font-medium">
                        {itemIndex}
                      </td>

                      {/* FIELD 1: Nama File */}
                      <td className="px-3.5 py-3.5">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                            {renderFileIcon(item.tipeFile)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-bold text-slate-900 text-xs font-mono break-words leading-tight hover:text-[#002B49]"
                              title={item.namaFile}
                            >
                              {item.namaFile}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                              <span className="font-semibold text-slate-700 bg-slate-100 px-1 py-0.2 rounded border border-slate-200 text-[9px]">
                                {item.tipeFile || 'PDF'}
                              </span>
                              <span>&bull;</span>
                              <span>{item.ukuranFile || '2.0 MB'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* FIELD 2: Kategori */}
                      <td className="px-3 py-3.5">
                        <span className="inline-block px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 break-words leading-tight">
                          {item.kategori}
                        </span>
                      </td>

                      {/* FIELD 3: Keterangan */}
                      <td className="px-3.5 py-3.5">
                        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2" title={item.keterangan}>
                          {item.keterangan}
                        </p>
                        {item.tanggalUpload && (
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">Diunggah: {item.tanggalUpload}</span>
                          </div>
                        )}
                      </td>

                      {/* FIELD 4: Visibilitas */}
                      <td className="px-2.5 py-3.5 text-center">
                        <div className="flex justify-center">
                          {renderVisibilitasBadge(item.visibilitas)}
                        </div>
                      </td>

                      {/* FIELD 5: Preview (berisi button preview) */}
                      <td className="px-2 py-3.5 text-center">
                        <button
                          type="button"
                          id={`btn-preview-arsip-${item.id}`}
                          onClick={() => setPreviewItem(item)}
                          className="inline-flex items-center justify-center gap-1 w-full max-w-[84px] py-1.5 px-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer mx-auto"
                          title={`Pratinjau Berkas: ${item.namaFile}`}
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>Preview</span>
                        </button>
                      </td>

                      {/* FIELD 6: Aksi (berisi button Hapus) */}
                      <td className="px-2.5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* BUTTON HAPUS (SESUAI REQUEST: Aksi berisi button Hapus) */}
                          <button
                            type="button"
                            id={`btn-delete-arsip-${item.id}`}
                            onClick={() => setDeleteConfirmItem(item)}
                            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 hover:text-rose-800 border border-rose-300 font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer"
                            title={`Hapus Berkas: ${item.namaFile}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination (Maksimal 10 File per Halaman) */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan{' '}
              <strong className="text-slate-900 font-bold">
                {filteredList.length === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, filteredList.length)}
              </strong>{' '}
              dari <strong className="text-slate-900 font-bold">{filteredList.length}</strong> berkas
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Maks. 10 file per halaman
            </span>
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-pagination-prev"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  safeCurrentPage === 1
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-2xs cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    id={`btn-pagination-page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      safeCurrentPage === pageNum
                        ? 'bg-[#002B49] text-white shadow-xs ring-2 ring-[#D4AF37]/60'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                id="btn-pagination-next"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  safeCurrentPage === totalPages
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-2xs cursor-pointer'
                }`}
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: FORM TAMBAH ARSIP
          Fields:
          1. Nama
          2. Keterangan
          3. Kategori Arsip (dengan opsi: Kerjasama, Laporan Service, Data Kesehatan, Akademik)
          4. File Arsip (berisi browse file)
         ========================================================================= */}
      {isAddArsipModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Form Tambah Arsip</h3>
                  <p className="text-[11px] text-slate-300">
                    Lengkapi nama, keterangan, kategori arsip, dan unggah berkas arsip
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddArsipModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Tutup form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveArsip} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {addFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addFormError}</span>
                </div>
              )}

              {/* FIELD 1: Nama */}
              <div className="space-y-1.5">
                <label htmlFor={namaInputId} className="block font-bold text-slate-800">
                  Nama <span className="text-rose-500">*</span>
                </label>
                <input
                  id={namaInputId}
                  type="text"
                  value={formNama}
                  onChange={(e) => {
                    setFormNama(e.target.value);
                    if (addFormError) setAddFormError('');
                  }}
                  placeholder="Contoh: Perjanjian Kerjasama Riset Kimia Industri 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#002B49] focus:outline-none text-xs sm:text-sm text-slate-900"
                  required
                />
              </div>

              {/* FIELD 2: Keterangan */}
              <div className="space-y-1.5">
                <label htmlFor={keteranganInputId} className="block font-bold text-slate-800">
                  Keterangan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id={keteranganInputId}
                  rows={3}
                  value={formKeterangan}
                  onChange={(e) => {
                    setFormKeterangan(e.target.value);
                    if (addFormError) setAddFormError('');
                  }}
                  placeholder="Tuliskan keterangan lengkap isi arsip, tujuan penyimpanan, atau nomor dokumen..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#002B49] focus:outline-none leading-relaxed text-xs"
                  required
                />
              </div>

              {/* FIELD 3: Kategori Arsip (dengan opsi Kerjasama, Laporan Service, Data Kesehatan, Akademik) */}
              <div className="space-y-1.5">
                <label htmlFor={kategoriSelectId} className="block font-bold text-slate-800">
                  Kategori Arsip <span className="text-rose-500">*</span>
                </label>
                <select
                  id={kategoriSelectId}
                  value={formKategoriArsip}
                  onChange={(e) => setFormKategoriArsip(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#002B49] focus:outline-none font-semibold text-xs text-slate-900 cursor-pointer bg-white"
                >
                  {/* OPSI SPESIFIK YANG DIMINTA USER */}
                  <option value="Kerjasama">Kerjasama</option>
                  <option value="Laporan Service">Laporan Service</option>
                  <option value="Data Kesehatan">Data Kesehatan</option>
                  <option value="Akademik">Akademik</option>

                  {/* Kategori tambahan dari Master jika ada yang aktif */}
                  {masterKategoriList
                    .filter(
                      (k) =>
                        k.status === 'Aktif' &&
                        !['Kerjasama', 'Laporan Service', 'Data Kesehatan', 'Akademik'].includes(
                          k.namaKategori
                        )
                    )
                    .map((opt) => (
                      <option key={opt.id} value={opt.namaKategori}>
                        {opt.namaKategori}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Pilih kategori yang sesuai untuk mempermudah pengelompokan arsip digital.
                </p>
              </div>

              {/* FIELD 4: Jenis Arsip (dengan opsi Public atau Private) - Diletakkan di atas File Arsip */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Jenis Arsip <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formJenisArsip === 'Public'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="formJenisArsip"
                      value="Public"
                      checked={formJenisArsip === 'Public'}
                      onChange={() => setFormJenisArsip('Public')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5 text-xs">
                      <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Public</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formJenisArsip === 'Private'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="formJenisArsip"
                      value="Private"
                      checked={formJenisArsip === 'Private'}
                      onChange={() => setFormJenisArsip('Private')}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5 text-xs">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Private</span>
                    </div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pilih hak akses: <strong>Public</strong> (dapat diakses civitas/publik) atau <strong>Private</strong> (arsip internal/terbatas).
                </p>
              </div>

              {/* FIELD 5: File Arsip (berisi browse file) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  File Arsip (Browse File) <span className="text-rose-500">*</span>
                </label>

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileBrowseChange}
                  accept=".pdf,.docx,.xlsx,.zip"
                  className="hidden"
                />

                {formFileName ? (
                  /* Display File Terpilih */
                  <div className="p-3.5 bg-slate-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs font-mono truncate">
                          {formFileName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-emerald-700 uppercase bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                            {formFileType}
                          </span>
                          <span>&bull;</span>
                          <span>{formFileSize || '2.0 MB'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors shrink-0 cursor-pointer"
                    >
                      Ganti File
                    </button>
                  </div>
                ) : (
                  /* Box Browse File */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#002B49] rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-slate-50 group"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#002B49] mx-auto mb-2 transition-colors" />
                    <p className="text-xs font-semibold text-slate-800">
                      Tarik file ke sini atau klik tombol{' '}
                      <span className="text-blue-600 font-bold underline">Browse File</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mendukung format PDF, DOCX, XLSX, atau ZIP (Maksimal 25 MB)
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      <FileUp className="w-3.5 h-3.5 text-slate-600" />
                      <span>Browse File</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddArsipModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-tambah-arsip"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 font-bold rounded-xl border border-amber-500 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-900" />
                  <span>Simpan Arsip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: FORM KATEGORI ARSIP (MUNCUL JIKA KLIK BUTTON KATEGORI ARSIP BIRU)
          Fields:
          1. Nama Kategori
          2. Status
          3. Action (berisi button Edit berwarna kuning)
         ========================================================================= */}
      {isKategoriModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b-2 border-blue-500">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Form Kategori Arsip</h3>
                  <p className="text-[11px] text-slate-300">
                    Daftar kategori arsip, status keaktifan, dan tindakan pengeditan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKategoriModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Tutup form kategori"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Tabel Kategori Arsip dengan fields Nama Kategori, Status, Action */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <span className="text-xs text-slate-600 font-medium">
                    Total <strong className="text-slate-900">{masterKategoriList.length}</strong> Kategori Terdaftar
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    Master Kategori Departemen Kimia
                  </span>
                </div>

                {/* BUTTON TAMBAH KATEGORI ARSIP (WARNA HIJAU) */}
                <button
                  type="button"
                  id="btn-tambah-kategori-arsip-modal"
                  onClick={handleOpenAddKategori}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                  title="Tambah Kategori Arsip Baru"
                >
                  <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                  <span>Tambah Kategori Arsip</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left border-collapse table-fixed">
                  <thead className="bg-[#002B49] text-white font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center">No</th>
                      <th className="px-4 py-3 w-[42%]">Nama Kategori</th>
                      <th className="px-3 py-3 w-[24%] text-center">Status</th>
                      <th className="px-3 py-3 w-[26%] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {masterKategoriList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          Belum ada kategori arsip. Silakan klik tombol &quot;Tambah Kategori Arsip&quot;.
                        </td>
                      </tr>
                    ) : (
                      masterKategoriList.map((kat, idx) => (
                        <tr key={kat.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* No */}
                          <td className="px-3 py-3 text-center text-slate-400 font-mono font-medium">
                            {idx + 1}
                          </td>

                          {/* Field 1: Nama Kategori */}
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 text-xs">{kat.namaKategori}</div>
                            {kat.keterangan && (
                              <div className="text-[11px] text-slate-400 truncate">{kat.keterangan}</div>
                            )}
                          </td>

                          {/* Field 2: Status */}
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                kat.status === 'Aktif'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  kat.status === 'Aktif' ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                              <span>{kat.status}</span>
                            </span>
                          </td>

                          {/* Field 3: Action (berisi button Edit berwarna kuning dan button Delete) */}
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                id={`btn-edit-kat-${kat.id}`}
                                onClick={() => handleOpenEditKategori(kat)}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg border border-amber-500 shadow-2xs transition-colors cursor-pointer"
                                title={`Edit kategori ${kat.namaKategori}`}
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-900" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                id={`btn-delete-kat-${kat.id}`}
                                onClick={() => handleDeleteKategori(kat)}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                                title={`Hapus kategori ${kat.namaKategori}`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-white" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsKategoriModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-MODAL 1: FORM TAMBAH KATEGORI ARSIP
          (Bila button Tambah Kategori Arsip berwarna hijau pada form Kategori Arsip diklik,
           muncul form berisi: Nama Kategori. Hasil input Nama Kategori akan masuk pada
           field Nama Kategori pada Form Kategori Arsip)
         ========================================================================= */}
      {isAddKategoriModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Header Form Tambah Kategori */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b-2 border-emerald-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tambah Kategori Arsip</h3>
                  <p className="text-[11px] text-slate-300">
                    Masukkan nama kategori arsip baru
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddKategoriModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Tutup form tambah kategori"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Tambah Kategori Body: Berisi field Nama Kategori */}
            <form onSubmit={handleSaveAddKategori} className="p-6 space-y-4 text-xs">
              {addKategoriError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addKategoriError}</span>
                </div>
              )}

              {/* Field: Nama Kategori */}
              <div className="space-y-1.5">
                <label htmlFor={newNamaKategoriInputId} className="block font-bold text-slate-800">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  id={newNamaKategoriInputId}
                  type="text"
                  value={newNamaKategori}
                  onChange={(e) => {
                    setNewNamaKategori(e.target.value);
                    if (addKategoriError) setAddKategoriError('');
                  }}
                  placeholder="Contoh: Surat Tugas, Pengabdian Masyarakat, dll"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs sm:text-sm text-slate-900 font-semibold"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Hasil input akan otomatis masuk pada field <strong>Nama Kategori</strong> di Form Kategori Arsip.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddKategoriModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-tambah-kategori"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Simpan Kategori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-MODAL: FORM EDIT KATEGORI
          (Bila button Edit berwarna kuning pada form Kategori Arsip diklik,
           muncul form berisi: Nama Kategori dan Status (opsi Aktif dan Tidak Aktif))
         ========================================================================= */}
      {editingKategoriItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Header Form Edit Kategori */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Kategori Arsip</h3>
                  <p className="text-[11px] text-slate-300">
                    Ubah Nama Kategori dan Status keaktifan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingKategoriItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Tutup form edit kategori"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Edit Body: Fields Nama Kategori dan Status (opsi Aktif dan Tidak Aktif) */}
            <form onSubmit={handleSaveEditKategori} className="p-6 space-y-4 text-xs">
              {editKategoriError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{editKategoriError}</span>
                </div>
              )}

              {/* Field 1: Nama Kategori */}
              <div className="space-y-1.5">
                <label htmlFor={editNamaKategoriInputId} className="block font-bold text-slate-800">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  id={editNamaKategoriInputId}
                  type="text"
                  value={editNamaKategori}
                  onChange={(e) => {
                    setEditNamaKategori(e.target.value);
                    if (editKategoriError) setEditKategoriError('');
                  }}
                  placeholder="Contoh: Kerjasama, Laporan Service, dll"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#002B49] focus:outline-none text-xs sm:text-sm text-slate-900 font-semibold"
                  required
                />
              </div>

              {/* Field 2: Status (berisi opsi Aktif dan Tidak Aktif) */}
              <div className="space-y-1.5">
                <label htmlFor={editStatusSelectId} className="block font-bold text-slate-800">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  id={editStatusSelectId}
                  value={editStatusKategori}
                  onChange={(e) => setEditStatusKategori(e.target.value as StatusKategori)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#002B49] focus:outline-none font-bold text-xs sm:text-sm text-slate-900 cursor-pointer bg-white"
                >
                  {/* OPSI SPESIFIK: Aktif dan Tidak Aktif */}
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Kategori dengan status &quot;Aktif&quot; akan tersedia pada formulir pemilihan arsip baru.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingKategoriItem(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-save-edit-kategori"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 font-bold rounded-xl border border-amber-500 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-900" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL PREVIEW DOKUMEN (KOP SURAT RESMI UB & CAP DIGITAL)
         ========================================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#D4AF37]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#D4AF37]">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <span>Pratinjau Berkas Arsip</span>
                    <span className="text-[10px] font-mono bg-white/15 px-1.5 py-0.5 rounded font-normal">
                      {previewItem.tipeFile || 'PDF'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 font-mono truncate max-w-md">
                    {previewItem.namaFile}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Tutup preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Viewer Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs bg-slate-50 flex-1">
              {/* Document Meta Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-semibold">Kategori:</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {previewItem.kategori}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-semibold">Visibilitas:</span>
                    {renderVisibilitasBadge(previewItem.visibilitas)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Ukuran Berkas:</span>
                    <span className="font-semibold text-slate-800">{previewItem.ukuranFile || '2.0 MB'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Tipe Berkas:</span>
                    <span className="font-semibold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {previewItem.tipeFile || 'PDF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulated Paper Document Viewer */}
              <div
                id="printable-arsip-document"
                className="bg-white p-8 rounded-xl border border-slate-300 shadow-md space-y-4 max-w-xl mx-auto relative overflow-hidden font-serif"
              >
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg]">
                  <span className="text-6xl font-black text-slate-900 tracking-widest uppercase">
                    SIKMA ARSIP UB
                  </span>
                </div>

                {/* Kop Surat Resmi */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-3">
                  <div className="w-14 h-14 shrink-0">
                    <UbLogo className="w-14 h-14" />
                  </div>
                  <div className="text-center flex-1 font-sans">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Kementerian Pendidikan Tinggi, Sains, dan Teknologi
                    </h4>
                    <h3 className="text-sm font-black uppercase text-[#002B49]">
                      Universitas Brawijaya
                    </h3>
                    <h5 className="text-xs font-bold text-slate-900">
                      Fakultas Sains, Teknologi, dan Matematika
                    </h5>
                    <p className="text-[10px] text-slate-600">
                      Departemen Kimia &bull; Jl. Veteran Malang 65145 &bull; Telp (0341) 575838
                    </p>
                  </div>
                </div>

                {/* Surat Title / Header */}
                <div className="text-center space-y-1 pt-2 font-sans">
                  <h4 className="font-bold text-sm text-slate-900 uppercase underline decoration-1 underline-offset-4">
                    {previewItem.kategori}
                  </h4>
                </div>

                {/* Body Content */}
                <div className="space-y-3 text-xs leading-relaxed text-slate-800 font-sans pt-2">
                  <p className="font-semibold text-slate-900">
                    Mengenai Dokumen: <span className="font-mono text-[#002B49]">{previewItem.namaFile}</span>
                  </p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold block text-slate-700 mb-1">Uraian / Ringkasan Keterangan:</span>
                    <p className="text-slate-600 text-xs italic leading-relaxed">
                      &quot;{previewItem.keterangan}&quot;
                    </p>
                  </div>
                  <p className="text-justify text-slate-700">
                    Dokumen ini telah diregistrasikan dan disimpan dalam Pangkalan Data Kearsipan Digital Departemen Kimia FSTeM Universitas Brawijaya dengan klasifikasi hak akses <strong>{previewItem.visibilitas === 'Private' ? 'Private' : 'Public'}</strong>. Seluruh pihak yang berkepentingan dapat memanfaatkan arsip ini sesuai dengan regulasi kearsipan yang berlaku.
                  </p>
                </div>

                {/* Tanda Tangan & Cap Digital */}
                <div className="pt-6 flex justify-between items-end font-sans">
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <p className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Terverifikasi Digital SIKMA</span>
                    </p>
                    <p>Kode Keaslian: {previewItem.id.toUpperCase()}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-slate-600">Malang, Jawa Timur</p>
                    <p className="font-bold text-slate-800 mt-1">Ketua Departemen Kimia FSTeM</p>
                    <div className="h-10 flex items-center justify-end my-1">
                      <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                        [Tanda Tangan Elektronik UB]
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 underline">Prof. Dr. Dra. Hermin Sulistyarti, M.Si</p>
                    <p className="text-[10px] text-slate-500 font-mono">NIP. 196403211989032001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-preview-unduh-file"
                  onClick={() => handleDownloadFile(previewItem)}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  title={`Unduh berkas "${previewItem.namaFile}"`}
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloading ? 'Mengunduh...' : 'Unduh File'}</span>
                </button>
                <button
                  type="button"
                  id="btn-preview-cetak-file"
                  onClick={handlePrintDocument}
                  disabled={isPrinting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-60 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  title={`Cetak dokumen "${previewItem.namaFile}"`}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700" />
                  <span>{isPrinting ? 'Menyiapkan...' : 'Cetak'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL KONFIRMASI HAPUS BERKAS ARSIP
         ========================================================================= */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Hapus Berkas Arsip?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus berkas{' '}
                <strong className="text-slate-900 font-mono break-all">&quot;{deleteConfirmItem.namaFile}&quot;</strong>?
              </p>
              <p className="text-[11px] text-rose-500 font-medium">
                Tindakan ini akan menghapus arsip dari pangkalan data sistem.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-arsip"
                onClick={() => handleDelete(deleteConfirmItem)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL KONFIRMASI HAPUS KATEGORI ARSIP
         ========================================================================= */}
      {deleteConfirmKategori && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Hapus Kategori Arsip?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus kategori{' '}
                <strong className="text-slate-900 font-bold">&quot;{deleteConfirmKategori.namaKategori}&quot;</strong>?
              </p>
              <p className="text-[11px] text-rose-500 font-medium">
                Nama kategori ini akan dihapus dari daftar master kategori arsip.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmKategori(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-kategori"
                onClick={handleConfirmDeleteKategori}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
