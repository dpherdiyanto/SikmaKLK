import React, { useState } from 'react';
import { BonBahanItem, DataBahanItem, DataLaboratoriumItem, UserRole, AuthUser } from '../../types/sikma';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  X,
  Check,
  Calendar,
  PackageCheck,
  AlertCircle,
  Sparkles,
  Building2,
  TestTube2,
  Info,
  Download,
  UserCheck
} from 'lucide-react';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle
} from 'docx';

interface BonBahanTabProps {
  bonList: BonBahanItem[];
  setBonList: React.Dispatch<React.SetStateAction<BonBahanItem[]>>;
  bahanList: DataBahanItem[];
  setBahanList: React.Dispatch<React.SetStateAction<DataBahanItem[]>>;
  labList: DataLaboratoriumItem[];
  currentRole: UserRole;
  currentUser?: AuthUser;
  selectedPreBahan?: DataBahanItem | null;
  onClearPreBahan?: () => void;
}

export const BonBahanTab: React.FC<BonBahanTabProps> = ({
  bonList,
  setBonList,
  bahanList,
  setBahanList,
  labList,
  currentRole,
  currentUser,
  selectedPreBahan,
  onClearPreBahan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slipModalItem, setSlipModalItem] = useState<BonBahanItem | null>(null);
  const [formError, setFormError] = useState('');

  // Helper to filter materials by lab
  const getBahanByLab = (labId?: string, labName?: string) => {
    if (!labId && !labName) return bahanList;
    const clean = (s: string) => s.toLowerCase().replace(/laboratorium|lab\./gi, '').trim();
    return bahanList.filter((b) => {
      if (labId && b.labId === labId) return true;
      if (labName && b.namaLab === labName) return true;
      if (labName && clean(b.namaLab) === clean(labName)) return true;
      return false;
    });
  };

  // Form state
  const [namaPemohon, setNamaPemohon] = useState(currentUser?.nama || 'Ahmad Rizky Pratama');
  const [identitasPemohon, setIdentitasPemohon] = useState(currentUser?.identifier || 'NIM. 215090200111012');
  const [selectedLabId, setSelectedLabId] = useState<string>(labList[0]?.id || '');
  const [namaLab, setNamaLab] = useState(labList[0]?.namaLab || '');
  const [keperluan, setKeperluan] = useState('');
  const [dosenPembimbing, setDosenPembimbing] = useState('Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Si.');
  const [daftarBahan, setDaftarBahan] = useState<{ namaBahan: string; jumlah: number; satuan: string; bahanId?: string }[]>([
    { namaBahan: '', jumlah: 100, satuan: 'mL' }
  ]);

  // Handle preselected material from Data Bahan tab
  React.useEffect(() => {
    if (selectedPreBahan) {
      const targetLab = labList.find((l) => l.id === selectedPreBahan.labId || l.namaLab === selectedPreBahan.namaLab);
      setSelectedLabId(targetLab?.id || selectedPreBahan.labId || '');
      setNamaLab(targetLab?.namaLab || selectedPreBahan.namaLab);
      const defaultAmount = Math.min(250, selectedPreBahan.stok > 0 ? selectedPreBahan.stok : 50);
      setDaftarBahan([
        {
          bahanId: selectedPreBahan.id,
          namaBahan: selectedPreBahan.namaBahan,
          jumlah: defaultAmount,
          satuan: selectedPreBahan.satuan
        }
      ]);
      setFormError('');
      setIsModalOpen(true);
      if (onClearPreBahan) onClearPreBahan();
    }
  }, [selectedPreBahan, onClearPreBahan, labList]);

  // Helper: Deduct stock when bon is created or re-activated
  const deductMaterialStock = (items: { namaBahan: string; jumlah: number }[], targetLabName?: string) => {
    if (!setBahanList || items.length === 0) return;
    setBahanList((prev) =>
      prev.map((bahan) => {
        const requested = items.find((i) => {
          const matchName = i.namaBahan.trim().toLowerCase() === bahan.namaBahan.trim().toLowerCase();
          if (!matchName) return false;
          if (!targetLabName) return true;
          const clean = (s: string) => s.toLowerCase().replace(/laboratorium|lab\./gi, '').trim();
          return (
            bahan.namaLab === targetLabName ||
            clean(bahan.namaLab) === clean(targetLabName) ||
            bahan.namaLab.toLowerCase().includes(targetLabName.toLowerCase()) ||
            targetLabName.toLowerCase().includes(bahan.namaLab.toLowerCase())
          );
        });

        if (requested) {
          const newStock = Math.max(0, bahan.stok - requested.jumlah);
          const newStatus: DataBahanItem['statusStok'] =
            newStock === 0 ? 'Habis' : newStock <= bahan.stokMinimum ? 'Menipis' : 'Aman';
          return {
            ...bahan,
            stok: newStock,
            statusStok: newStatus
          };
        }
        return bahan;
      })
    );
  };

  // Helper: Restore stock when bon is rejected, cancelled, or deleted
  const restoreMaterialStock = (items: { namaBahan: string; jumlah: number }[], targetLabName?: string) => {
    if (!setBahanList || items.length === 0) return;
    setBahanList((prev) =>
      prev.map((bahan) => {
        const requested = items.find((i) => {
          const matchName = i.namaBahan.trim().toLowerCase() === bahan.namaBahan.trim().toLowerCase();
          if (!matchName) return false;
          if (!targetLabName) return true;
          const clean = (s: string) => s.toLowerCase().replace(/laboratorium|lab\./gi, '').trim();
          return (
            bahan.namaLab === targetLabName ||
            clean(bahan.namaLab) === clean(targetLabName) ||
            bahan.namaLab.toLowerCase().includes(targetLabName.toLowerCase()) ||
            targetLabName.toLowerCase().includes(bahan.namaLab.toLowerCase())
          );
        });

        if (requested) {
          const newStock = bahan.stok + requested.jumlah;
          const newStatus: DataBahanItem['statusStok'] =
            newStock === 0 ? 'Habis' : newStock <= bahan.stokMinimum ? 'Menipis' : 'Aman';
          return {
            ...bahan,
            stok: newStock,
            statusStok: newStatus
          };
        }
        return bahan;
      })
    );
  };

  const canApprove = currentRole === 'super_admin' || currentRole === 'admin' || currentRole === 'dosen';

  // Helper: cek apakah data bon bahan milik mahasiswa yang sedang login
  const isOwnRecord = (item: BonBahanItem): boolean => {
    if (!currentUser) return true;
    const currentName = currentUser.nama?.trim().toLowerCase() || '';
    const currentNim = (currentUser.identifier || '').replace(/\D/g, '');
    const currentUsername = currentUser.username?.trim().toLowerCase() || '';

    const pemohonName = (item.namaPemohon || '').trim().toLowerCase();
    const pemohonId = (item.identitasPemohon || '').replace(/\D/g, '');

    const matchName = currentName && (pemohonName.includes(currentName) || currentName.includes(pemohonName));
    const matchNim = currentNim && pemohonId && (pemohonId.includes(currentNim) || currentNim.includes(pemohonId));
    const matchUser =
      currentUsername &&
      (pemohonName.includes(currentUsername) || (item.identitasPemohon || '').toLowerCase().includes(currentUsername));

    return Boolean(matchName || matchNim || matchUser);
  };

  const filteredBon = bonList.filter((item) => {
    // Role mahasiswa hanya dapat melihat data permohonan bon bahan miliknya sendiri
    if (currentRole === 'mahasiswa' && !isOwnRecord(item)) {
      return false;
    }

    const matchSearch =
      item.nomorBon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.namaPemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.identitasPemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.namaLab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keperluan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.daftarBahan.some((b) => b.namaBahan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    const defaultLab = labList[0];
    const defaultLabId = defaultLab?.id || '';
    const defaultLabName = defaultLab?.namaLab || '';
    setSelectedLabId(defaultLabId);
    setNamaLab(defaultLabName);

    setNamaPemohon(currentUser?.nama || 'Ahmad Rizky Pratama');
    setIdentitasPemohon(currentUser?.identifier || 'NIM. 215090200111012');
    setKeperluan('');
    setDosenPembimbing('Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Si.');
    setFormError('');

    const labBahan = getBahanByLab(defaultLabId, defaultLabName);
    const firstBahan = labBahan[0] || bahanList[0];
    setDaftarBahan([
      {
        bahanId: firstBahan?.id,
        namaBahan: firstBahan ? firstBahan.namaBahan : '',
        jumlah: firstBahan ? Math.min(100, firstBahan.stok > 0 ? firstBahan.stok : 10) : 100,
        satuan: firstBahan ? firstBahan.satuan : 'mL'
      }
    ]);
    setIsModalOpen(true);
  };

  const handleLabChange = (newLabId: string) => {
    setSelectedLabId(newLabId);
    const matchedLab = labList.find((l) => l.id === newLabId);
    const newLabName = matchedLab ? matchedLab.namaLab : '';
    setNamaLab(newLabName);

    // Refresh rows for the new lab
    const labBahan = getBahanByLab(newLabId, newLabName);
    const firstBahan = labBahan[0] || null;
    if (firstBahan) {
      setDaftarBahan([
        {
          bahanId: firstBahan.id,
          namaBahan: firstBahan.namaBahan,
          jumlah: Math.min(100, firstBahan.stok > 0 ? firstBahan.stok : 10),
          satuan: firstBahan.satuan
        }
      ]);
    } else {
      setDaftarBahan([{ namaBahan: '', jumlah: 10, satuan: 'mL' }]);
    }
  };

  const handleAddBahanRow = () => {
    const labBahan = getBahanByLab(selectedLabId, namaLab);
    const available = labBahan.filter((b) => !daftarBahan.some((d) => d.namaBahan === b.namaBahan));
    const nextBahan = available[0] || labBahan[0] || bahanList[0];

    setDaftarBahan((prev) => [
      ...prev,
      {
        bahanId: nextBahan?.id,
        namaBahan: nextBahan ? nextBahan.namaBahan : '',
        jumlah: nextBahan ? Math.min(100, nextBahan.stok > 0 ? nextBahan.stok : 10) : 50,
        satuan: nextBahan ? nextBahan.satuan : 'mL'
      }
    ]);
  };

  const handleRemoveBahanRow = (index: number) => {
    if (daftarBahan.length > 1) {
      setDaftarBahan((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateStatus = (id: string, newStatus: BonBahanItem['status']) => {
    const approverName = currentUser?.nama || 'PLP Departemen Kimia';
    const targetBon = bonList.find((b) => b.id === id);

    if (targetBon) {
      const activeStates = ['Menunggu Persetujuan', 'Disetujui', 'Telah Diambil'];
      const wasActive = activeStates.includes(targetBon.status);
      const willBeInactive = newStatus === 'Ditolak';
      const wasInactive = targetBon.status === 'Ditolak';
      const willBeActive = activeStates.includes(newStatus);

      if (wasActive && willBeInactive) {
        // Kembalikan stok bahan karena ditolak
        restoreMaterialStock(targetBon.daftarBahan, targetBon.namaLab);
      } else if (wasInactive && willBeActive) {
        // Kurangi stok kembali jika status aktif kembali
        deductMaterialStock(targetBon.daftarBahan, targetBon.namaLab);
      }
    }

    setBonList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              petugasPlp: approverName,
              tanggalPengambilan: newStatus === 'Telah Diambil' ? new Date().toISOString().split('T')[0] : item.tanggalPengambilan
            }
          : item
      )
    );
  };

  // Batalkan / Hapus Bon Bahan
  const handleDeleteBon = (id: string) => {
    const target = bonList.find((b) => b.id === id);
    if (!target) return;
    if (target.status !== 'Ditolak') {
      // Kembalikan kuantitas bahan ke stok laboratorium jika belum ditolak
      restoreMaterialStock(target.daftarBahan, target.namaLab);
    }
    setBonList((prev) => prev.filter((b) => b.id !== id));
  };

  // Unduh template Bon Bahan (.docx)
  const handleDownloadTemplate = async () => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'DEPARTEMEN KIMIA - FAKULTAS MATEMATIKA DAN ILMU PENGETAHUAN ALAM',
                    bold: true,
                    size: 24,
                    color: '002B49'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'UNIVERSITAS BRAWIJAYA',
                    bold: true,
                    size: 28,
                    color: '002B49'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Jl. Veteran, Malang 65145, Jawa Timur, Indonesia | Email: kimia@ub.ac.id | Website: https://kimia.ub.ac.id',
                    size: 18,
                    color: '555555'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 150, before: 50 },
                children: [
                  new TextRun({
                    text: '════════════════════════════════════════════════════════════════════════════════',
                    color: '888888'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'FORMULIR PERMOHONAN BON PENGAMBILAN & PEMAKAIAN BAHAN KIMIA / REAGEN',
                    bold: true,
                    size: 22,
                    color: '002B49'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 250 },
                children: [
                  new TextRun({
                    text: 'Nomor Dokumen: FM-KIM-LAB-BON-02 (Revisi: 2024)',
                    italics: true,
                    size: 18,
                    color: '666666'
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 150, after: 50 },
                children: [
                  new TextRun({
                    text: 'I. DATA PEMOHON BAHAN KIMIA',
                    bold: true,
                    size: 20,
                    color: '002B49'
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: '1. Nama Lengkap Pemohon       : __________________________________________________\n' }),
                  new TextRun({ text: '2. NIM / NIP / No. Identitas   : __________________________________________________\n' }),
                  new TextRun({ text: '3. Status / Jabatan            : [ ] Mahasiswa S1   [ ] Mahasiswa S2/S3   [ ] Dosen / Peneliti\n' }),
                  new TextRun({ text: '4. Program Studi / Asal        : __________________________________________________\n' }),
                  new TextRun({ text: '5. No. Telepon / WhatsApp      : __________________________________________________\n' }),
                  new TextRun({ text: '6. Dosen Pembimbing Riset      : __________________________________________________' })
                ]
              }),
              new Paragraph({
                spacing: { before: 150, after: 50 },
                children: [
                  new TextRun({
                    text: 'II. RINCIAN KEPERLUAN & FASILITAS LABORATORIUM',
                    bold: true,
                    size: 20,
                    color: '002B49'
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: '1. Tujuan Pemakaian Bahan      : [ ] Penelitian Skripsi   [ ] Tesis/Disertasi   [ ] Riset Dosen   [ ] Lainnya: _____\n' }),
                  new TextRun({ text: '2. Laboratorium Penyedia Bahan : __________________________________________________\n' }),
                  new TextRun({ text: '3. Tanggal Rencana Pengambilan : __________________________________________________\n' }),
                  new TextRun({ text: '4. Keperluan / Analisis        : _________________________________________________________________\n' })
                ]
              }),
              new Paragraph({
                spacing: { before: 150, after: 80 },
                children: [
                  new TextRun({
                    text: 'III. DAFTAR BAHAN KIMIA / REAGEN YANG DIAJUKAN',
                    bold: true,
                    size: 20,
                    color: '002B49'
                  })
                ]
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true })] })] }),
                      new TableCell({ width: { size: 36, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Nama Bahan Kimia / Reagen', bold: true })] })] }),
                      new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Rumus / CAS', bold: true })] })] }),
                      new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Grade Kemurnian', bold: true })] })] }),
                      new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Jumlah & Satuan', bold: true })] })] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph('1.')] }),
                      new TableCell({ children: [new Paragraph(' ')] }),
                      new TableCell({ children: [new Paragraph(' ')] }),
                      new TableCell({ children: [new Paragraph('PA / HPLC / Teknis')] }),
                      new TableCell({ children: [new Paragraph(' ')] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph('2.')] }),
                      new TableCell({ children: [new Paragraph(' ')] }),
                      new TableCell({ children: [new Paragraph(' ')] }),
                      new TableCell({ children: [new Paragraph('PA / HPLC / Teknis')] }),
                      new TableCell({ children: [new Paragraph(' ')] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph('3.')] }),
                      new TableCell({ children: [new Paragraph(' ')] }),
                      new TableCell({ children: [new Paragraph(' ')] }),
                      new TableCell({ children: [new Paragraph('PA / HPLC / Teknis')] }),
                      new TableCell({ children: [new Paragraph(' ')] })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph('4.')] }),
                      new TableCell({ children: [new Paragraph(' ')] }),
                      new TableCell({ children: [new Paragraph(' ')] }),
                      new TableCell({ children: [new Paragraph('PA / HPLC / Teknis')] }),
                      new TableCell({ children: [new Paragraph(' ')] })
                    ]
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 150, after: 50 },
                children: [
                  new TextRun({
                    text: 'IV. KETENTUAN K3 & TATA TERTIB PENGAMBILAN BAHAN',
                    bold: true,
                    size: 20,
                    color: '002B49'
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 150 },
                children: [
                  new TextRun({ text: '1. Pengambilan bahan kimia wajib didampingi PLP dan menggunakan wadah berlabel jelas.\n' }),
                  new TextRun({ text: '2. Pemohon wajib mematuhi standar K3 (Jas Lab, Sarung Tangan Nitril, Masker/Goggles).\n' }),
                  new TextRun({ text: '3. Bahan kimia hanya boleh digunakan untuk riset yang disetujui, dilarang dipindahtangankan.\n' }),
                  new TextRun({ text: '4. Sisa bahan atau limbah reaksi wajib dibuang ke jeriken limbah B3 sesuai klasifikasi K3.' })
                ]
              }),
              new Paragraph({
                spacing: { before: 150, after: 80 },
                children: [
                  new TextRun({ text: 'Malang, ____________________ 2024\n\n' })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Mengetahui,\n' }),
                  new TextRun({ text: 'Dosen Pembimbing / Penanggung Jawab                Pemohon / Mahasiswa\n\n\n\n' }),
                  new TextRun({ text: '( ___________________________________ )          ( ___________________________________ )\n' }),
                  new TextRun({ text: 'NIP/NIDN.                                        NIM/NIP.\n\n' }),
                  new TextRun({ text: 'Menyetujui,\n' }),
                  new TextRun({ text: 'Pranata Laboratorium Pendidikan (PLP)            Kepala Laboratorium Kimia\n\n\n\n' }),
                  new TextRun({ text: '( ___________________________________ )          ( ___________________________________ )\n' }),
                  new TextRun({ text: 'NIP.                                             NIP.' })
                ]
              })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Template_Bon_Bahan_Laboratorium_Kimia_UB.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal generate .docx:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!namaPemohon.trim()) {
      setFormError('Nama pemohon wajib diisi.');
      return;
    }
    if (!namaLab) {
      setFormError('Silakan pilih laboratorium penyedia bahan.');
      return;
    }
    if (!keperluan.trim()) {
      setFormError('Keperluan pemakaian bahan kimia wajib diisi.');
      return;
    }
    if (daftarBahan.length === 0) {
      setFormError('Minimal satu bahan kimia harus diajukan.');
      return;
    }

    // Validate each row against available stock
    for (const row of daftarBahan) {
      if (!row.namaBahan.trim()) {
        setFormError('Silakan pilih bahan kimia pada setiap baris formulir.');
        return;
      }
      if (!row.jumlah || row.jumlah <= 0) {
        setFormError(`Kuantitas untuk bahan "${row.namaBahan}" harus lebih dari 0.`);
        return;
      }

      // Check against current stock in bahanList
      const labMaterials = getBahanByLab(selectedLabId, namaLab);
      const matched = labMaterials.find((b) => b.namaBahan === row.namaBahan) || bahanList.find((b) => b.namaBahan === row.namaBahan);
      if (matched) {
        if (matched.stok <= 0) {
          setFormError(`Bahan "${matched.namaBahan}" sedang habis (stok: 0 ${matched.satuan}). Silakan pilih bahan lain.`);
          return;
        }
        if (row.jumlah > matched.stok) {
          setFormError(
            `Kuantitas permintaan "${matched.namaBahan}" (${row.jumlah} ${matched.satuan}) melebihi sisa ketersediaan stok (${matched.stok} ${matched.satuan}).`
          );
          return;
        }
      }
    }

    const newBon: BonBahanItem = {
      id: `bon-bhn-${Date.now()}`,
      nomorBon: `BON-BHN-${new Date().getFullYear()}-${(bonList.length + 1).toString().padStart(3, '0')}`,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      namaPemohon: namaPemohon.trim(),
      identitasPemohon: identitasPemohon.trim(),
      rolePemohon: (currentUser?.role as any) || 'mahasiswa',
      namaLab,
      daftarBahan: daftarBahan.map((b) => ({
        namaBahan: b.namaBahan,
        jumlah: b.jumlah,
        satuan: b.satuan
      })),
      keperluan: keperluan.trim(),
      dosenPembimbing: dosenPembimbing.trim(),
      status: 'Menunggu Persetujuan',
      catatan: 'Permohonan baru diajukan. Stok bahan otomatis dikurangi dari database laboratorium.'
    };

    setBonList((prev) => [newBon, ...prev]);

    // Otomatis kurangi ketersediaan stok bahan di database Data Bahan
    deductMaterialStock(daftarBahan, namaLab);

    setIsModalOpen(false);
  };

  const currentLabMaterials = getBahanByLab(selectedLabId, namaLab);

  return (
    <div className="space-y-4">
      {/* Banner Sinkronisasi Otomatis */}
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="font-bold">Sinkronisasi Data Inventaris Aktif:</span> Setiap pengajuan bon pemakaian bahan langsung mengurangi jumlah ketersediaan stok bahan di laboratorium yang dipilih secara real-time.
          </div>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-[10px] shrink-0">
          Otomatis Terhubung
        </span>
      </div>

      {/* Banner Khusus Mahasiswa: Privasi & Hak Akses Data Milik Sendiri */}
      {currentRole === 'mahasiswa' && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-sky-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <UserCheck className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="font-bold">Akses Akun Mahasiswa:</span> Menampilkan riwayat dan status permohonan bon bahan milik Anda sendiri (<strong>{currentUser?.nama || 'Ahmad Rizky Pratama'}</strong> - {currentUser?.identifier || 'NIM. 215090200111012'}). Pengajuan bon bahan baru yang Anda buat akan langsung tercatat dan muncul pada tabel di bawah.
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-sky-200 text-sky-900 font-bold text-[10px] shrink-0">
            Data Pribadi Anda
          </span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor bon bahan, nama pemohon, bahan, atau keperluan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 focus:border-[#002B49]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 font-medium"
          >
            <option value="all">Semua Status Bon</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Telah Diambil">Telah Diambil</option>
            <option value="Ditolak">Ditolak</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002B49] text-white rounded-lg text-xs font-semibold hover:bg-[#002B49]/90 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Ajukan Bon Bahan</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 rounded-lg text-xs font-semibold hover:text-blue-800 transition-colors cursor-pointer group shrink-0"
            title="Unduh template Bon Bahan (.docx)"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
            <span className="underline decoration-blue-400 underline-offset-2">Unduh template Bon Bahan</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">.docx</span>
          </button>
        </div>
      </div>

      {/* Bon Bahan Cards */}
      <div className="space-y-3">
        {filteredBon.map((bon) => (
          <div
            key={bon.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-[#002B49]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800">
                  {bon.nomorBon}
                </span>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    bon.status === 'Disetujui'
                      ? 'bg-blue-100 text-blue-800'
                      : bon.status === 'Telah Diambil'
                      ? 'bg-emerald-100 text-emerald-800'
                      : bon.status === 'Ditolak'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {bon.status}
                </span>

                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Diajukan: {bon.tanggalPengajuan}</span>
                </span>

                {bon.status !== 'Ditolak' && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Stok Bahan Terpotong</span>
                  </span>
                )}
                {bon.status === 'Ditolak' && (
                  <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-semibold flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>Stok Dikembalikan</span>
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs text-slate-500">
                  Pemohon: <strong className="text-slate-800">{bon.namaPemohon}</strong> ({bon.identitasPemohon}) •{' '}
                  <span className="font-semibold text-slate-700">{bon.namaLab}</span>
                </div>
              </div>

              {/* List of requested reagents */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {bon.daftarBahan.map((b, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-slate-50 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5"
                  >
                    <TestTube2 className="w-3 h-3 text-[#002B49]" />
                    <span className="font-semibold">{b.namaBahan}</span>
                    <span className="text-amber-700 font-bold font-mono">
                      ({b.jumlah} {b.satuan})
                    </span>
                  </span>
                ))}
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600">
                <span className="font-medium text-slate-700">Keperluan: </span>
                {bon.keperluan}
                {bon.dosenPembimbing && (
                  <div className="mt-1 text-[11px] text-slate-500">
                    Dosen Pembimbing: <span className="font-medium text-slate-700">{bon.dosenPembimbing}</span>
                  </div>
                )}
                {bon.petugasPlp && (
                  <div className="mt-0.5 text-[11px] text-emerald-700 font-medium">
                    Petugas PLP: {bon.petugasPlp}
                    {bon.tanggalPengambilan && ` • Diambil: ${bon.tanggalPengambilan}`}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
              <button
                onClick={() => setSlipModalItem(bon)}
                className="px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Slip Bukti Bon</span>
              </button>

              {canApprove && bon.status === 'Menunggu Persetujuan' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(bon.id, 'Disetujui')}
                    className="px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(bon.id, 'Ditolak')}
                    className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </div>
              )}

              {canApprove && bon.status === 'Disetujui' && (
                <button
                  onClick={() => handleUpdateStatus(bon.id, 'Telah Diambil')}
                  className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Serahkan Bahan</span>
                </button>
              )}

              {/* Batalkan / Hapus Permohonan */}
              {(canApprove || bon.status === 'Menunggu Persetujuan') && (
                <button
                  onClick={() => {
                    if (window.confirm(`Batalkan permohonan bon bahan "${bon.nomorBon}"? Stok yang terpotong akan dikembalikan otomatis.`)) {
                      handleDeleteBon(bon.id);
                    }
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 mt-1 transition-colors cursor-pointer"
                  title="Batalkan / Hapus Bon (Stok dikembalikan)"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Batalkan Bon</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredBon.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            Belum ada data bon bahan yang sesuai kriteria pencarian.
          </div>
        )}
      </div>

      {/* Slip Modal / Bukti Bon */}
      {slipModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#002B49] text-white flex items-center justify-center font-bold text-xs">
                  UB
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    DEPARTEMEN KIMIA FSTeM UNIVERSITAS BRAWIJAYA
                  </h3>
                  <p className="text-[10px] text-slate-500">Bukti Pengeluaran & Bon Bahan Kimia / Reagen</p>
                </div>
              </div>
              <button
                onClick={() => setSlipModalItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Nomor Bon:</span>
                <span className="font-mono font-bold text-slate-900">{slipModalItem.nomorBon}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pemohon:</span>
                <span className="font-semibold text-slate-800">{slipModalItem.namaPemohon} ({slipModalItem.identitasPemohon})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Laboratorium:</span>
                <span className="font-medium text-slate-800">{slipModalItem.namaLab}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Bon:</span>
                <span className="font-bold text-emerald-700">{slipModalItem.status}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-semibold">Daftar Bahan yang Dikeluarkan:</span>
                <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                  {slipModalItem.daftarBahan.map((b, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-slate-800 py-0.5">
                      <span>• {b.namaBahan}</span>
                      <span className="font-mono font-bold text-amber-800">{b.jumlah} {b.satuan}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-semibold">Keperluan Penggunaan:</span>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700">
                  {slipModalItem.keperluan}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">SIKMA Kimia UB • Terintegrasi Otomatis</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#002B49] text-white rounded-lg text-xs font-semibold hover:bg-[#002B49]/90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Bon</span>
                </button>
                <button
                  onClick={() => setSlipModalItem(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bon Bahan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#002B49] text-white flex items-center justify-center font-bold text-xs">
                  <TestTube2 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pengajuan Bon Pengambilan Bahan Kimia
                  </h3>
                  <p className="text-[10px] text-slate-500">Stok bahan akan berkurang secara otomatis dari database laboratorium</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Pemohon *</label>
                  <input
                    type="text"
                    required
                    readOnly={currentRole === 'mahasiswa'}
                    value={namaPemohon}
                    onChange={(e) => {
                      if (currentRole === 'mahasiswa') return;
                      setNamaPemohon(e.target.value);
                    }}
                    className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none ${
                      currentRole === 'mahasiswa'
                        ? 'bg-slate-100 text-slate-700 cursor-not-allowed'
                        : 'bg-white focus:ring-2 focus:ring-[#002B49]/20'
                    }`}
                    placeholder="Nama mahasiswa / pemohon"
                  />
                  {currentRole === 'mahasiswa' && (
                    <p className="text-[10px] text-slate-500 mt-1">Sesuai nama profil akun login</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIM / NIP *</label>
                  <input
                    type="text"
                    required
                    readOnly={currentRole === 'mahasiswa'}
                    value={identitasPemohon}
                    onChange={(e) => {
                      if (currentRole === 'mahasiswa') return;
                      setIdentitasPemohon(e.target.value);
                    }}
                    className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none ${
                      currentRole === 'mahasiswa'
                        ? 'bg-slate-100 text-slate-700 cursor-not-allowed'
                        : 'bg-white focus:ring-2 focus:ring-[#002B49]/20'
                    }`}
                    placeholder="NIM mahasiswa"
                  />
                  {currentRole === 'mahasiswa' && (
                    <p className="text-[10px] text-slate-500 mt-1">Sesuai nomor identitas mahasiswa</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>Laboratorium Penyedia Bahan *</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {currentLabMaterials.length} jenis bahan tersedia di lab ini
                  </span>
                </label>
                <select
                  value={selectedLabId || labList.find((l) => l.namaLab === namaLab)?.id || ''}
                  onChange={(e) => handleLabChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  {labList.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.namaLab} ({lab.kodeLab})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic rows of reagents */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-semibold">
                    Daftar Bahan & Kuantitas Pengambilan *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBahanRow}
                    className="text-[11px] text-[#002B49] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Baris Bahan</span>
                  </button>
                </div>

                {currentLabMaterials.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                    Laboratorium ini belum memiliki data reagen / bahan kimia dalam database. Silakan pilih laboratorium lain atau input bahan pada tab Data Bahan.
                  </div>
                ) : (
                  daftarBahan.map((row, idx) => {
                    const matchedBahan =
                      currentLabMaterials.find((b) => b.namaBahan === row.namaBahan) ||
                      bahanList.find((b) => b.namaBahan === row.namaBahan);
                    const isExceeding = matchedBahan && row.jumlah > matchedBahan.stok;

                    return (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex gap-2 items-center">
                          <select
                            value={row.namaBahan}
                            onChange={(e) => {
                              const sel = currentLabMaterials.find((b) => b.namaBahan === e.target.value);
                              const copy = [...daftarBahan];
                              copy[idx].namaBahan = e.target.value;
                              if (sel) {
                                copy[idx].satuan = sel.satuan;
                                copy[idx].bahanId = sel.id;
                                if (copy[idx].jumlah > sel.stok) {
                                  copy[idx].jumlah = Math.min(100, sel.stok > 0 ? sel.stok : 10);
                                }
                              }
                              setDaftarBahan(copy);
                            }}
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                          >
                            <option value="">-- Pilih Bahan Kimia dari Lab Terpilih --</option>
                            {currentLabMaterials.map((b) => (
                              <option key={b.id} value={b.namaBahan} disabled={b.stok <= 0}>
                                {b.namaBahan} (Stok: {b.stok} {b.satuan}) {b.stok <= 0 ? '— [HABIS]' : ''}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              min={1}
                              max={matchedBahan ? matchedBahan.stok : undefined}
                              value={row.jumlah}
                              onChange={(e) => {
                                const copy = [...daftarBahan];
                                copy[idx].jumlah = Number(e.target.value);
                                setDaftarBahan(copy);
                              }}
                              className={`w-20 px-2 py-1.5 rounded-lg border text-xs font-mono font-bold text-center ${
                                isExceeding ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200'
                              }`}
                              placeholder="Kuantitas"
                            />
                            <span className="text-xs font-semibold text-slate-600 w-12 text-center">
                              {row.satuan || matchedBahan?.satuan || 'mL'}
                            </span>
                          </div>

                          {daftarBahan.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBahanRow(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Stock status indicator */}
                        {matchedBahan && (
                          <div className="flex items-center justify-between text-[11px] px-1">
                            <span className="text-slate-500">
                              Sisa Stok di Lab: <strong className="text-slate-800 font-mono">{matchedBahan.stok} {matchedBahan.satuan}</strong>
                              <span className="text-slate-400 ml-1">({matchedBahan.grade})</span>
                            </span>
                            {isExceeding ? (
                              <span className="text-rose-600 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Permintaan melebihi sisa stok ({matchedBahan.stok} {matchedBahan.satuan})</span>
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-medium">
                                Sisa setelah dibon: <strong className="font-mono">{Math.max(0, matchedBahan.stok - row.jumlah)} {matchedBahan.satuan}</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dosen Pembimbing Skripsi / Riset</label>
                <input
                  type="text"
                  value={dosenPembimbing}
                  onChange={(e) => setDosenPembimbing(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  placeholder="Nama dosen pembimbing"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Keperluan Pemakaian / Analisis *</label>
                <textarea
                  rows={2}
                  required
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#002B49]/20"
                  placeholder="Deskripsikan eksperimen, prosedur reaksi atau preparasi sampel..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 text-blue-700 hover:text-blue-800 text-xs font-semibold cursor-pointer group"
                  title="Unduh template formulir bon bahan (.docx)"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                  <span className="underline decoration-blue-400 underline-offset-2">Unduh template Bon Bahan</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">.docx</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#002B49] text-white rounded-lg font-semibold hover:bg-[#002B49]/90 shadow-xs cursor-pointer flex items-center gap-1.5 text-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ajukan Bon Bahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

