import React, { useState } from 'react';
import {
  BonAlatItem,
  DataAlatItem,
  DataLaboratoriumItem,
  UserRole,
  AuthUser,
  TujuanPeminjamanAlat,
  AlatTambahanItem
} from '../../types/sikma';
import {
  ClipboardList,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Building2,
  Calendar,
  User,
  Check,
  Download,
  FileText,
  ExternalLink,
  Wrench,
  Microscope,
  Eye,
  Info,
  Layers,
  GraduationCap,
  AlertCircle,
  Trash2,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface BonAlatTabProps {
  bonList: BonAlatItem[];
  setBonList: React.Dispatch<React.SetStateAction<BonAlatItem[]>>;
  alatList: DataAlatItem[];
  setAlatList?: React.Dispatch<React.SetStateAction<DataAlatItem[]>>;
  labList: DataLaboratoriumItem[];
  currentRole: UserRole;
  currentUser?: AuthUser;
  selectedPreAlat?: DataAlatItem | null;
  onClearPreAlat?: () => void;
}

const TUJUAN_OPTIONS: TujuanPeminjamanAlat[] = [
  'Penelitian Dosen',
  'Proyek Kimia',
  'Program Kreatifitas Mahasiswa',
  'Penelitian Skripsi',
  'Penelitian Tesis',
  'Penelitian Disertasi',
  'Analisis Sampel',
  'Lainnya'
];

export const BonAlatTab: React.FC<BonAlatTabProps> = ({
  bonList,
  setBonList,
  alatList,
  setAlatList,
  labList,
  currentRole,
  currentUser,
  selectedPreAlat,
  onClearPreAlat
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTujuanFilter, setSelectedTujuanFilter] = useState<string>('all');

  // Modals state
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [isEksternalModalOpen, setIsEksternalModalOpen] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState<BonAlatItem | null>(null);
  const [tambahAlatModalItem, setTambahAlatModalItem] = useState<BonAlatItem | null>(null);
  const [slipModalItem, setSlipModalItem] = useState<BonAlatItem | null>(null);
  const [internalError, setInternalError] = useState('');
  const [eksternalError, setEksternalError] = useState('');

  // Form State: Internal Peminjaman
  const [internalForm, setInternalForm] = useState({
    namaMahasiswa: currentUser?.nama || 'Ahmad Rizky Pratama',
    identitasPeminjam: currentUser?.identifier || 'NIM. 215090200111012',
    tujuan: 'Penelitian Skripsi' as TujuanPeminjamanAlat,
    tujuanLainnya: '',
    labId: labList[0]?.id || '',
    namaLab: labList[0]?.namaLab || '',
    alatId: alatList[0]?.id || '',
    namaAlat: alatList[0]?.namaAlat || '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    dosenPembimbing: 'Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Si.',
    keperluan: ''
  });

  // Form State: Eksternal Peminjaman
  const [eksternalForm, setEksternalForm] = useState({
    namaPeminjam: '',
    jabatan: 'Mahasiswa' as 'Mahasiswa' | 'Siswa' | 'Staf' | string,
    jabatanLainnya: '',
    instansi: '',
    tujuan: 'Penelitian Dosen' as TujuanPeminjamanAlat,
    tujuanLainnya: '',
    labId: labList[0]?.id || '',
    namaLab: labList[0]?.namaLab || '',
    alatId: alatList[0]?.id || '',
    namaAlat: alatList[0]?.namaAlat || '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    kontak: '',
    keperluan: ''
  });

  // Form State: Tambah Alat ke Peminjaman yang ada
  const [tambahAlatForm, setTambahAlatForm] = useState({
    labId: '',
    namaLab: '',
    alatId: '',
    namaAlat: '',
    catatan: ''
  });

  // Handle pre-selected instrument redirection
  React.useEffect(() => {
    if (selectedPreAlat) {
      setInternalForm((prev) => ({
        ...prev,
        labId: selectedPreAlat.labId,
        namaLab: selectedPreAlat.namaLab,
        alatId: selectedPreAlat.id,
        namaAlat: selectedPreAlat.namaAlat
      }));
      setInternalError('');
      setIsInternalModalOpen(true);
      if (onClearPreAlat) onClearPreAlat();
    }
  }, [selectedPreAlat, onClearPreAlat]);

  const canApprove = currentRole === 'super_admin' || currentRole === 'admin' || currentRole === 'dosen';

  // Helper to fetch tools from database based on selected lab (matches by labId or normalized lab name)
  const getToolsByLab = (labId?: string, labName?: string): DataAlatItem[] => {
    if (!labId && !labName) return [];
    return alatList.filter((a) => {
      if (labId && a.labId && a.labId === labId) return true;
      if (labName && a.namaLab) {
        if (a.namaLab.trim().toLowerCase() === labName.trim().toLowerCase()) return true;
        const normA = a.namaLab.toLowerCase().replace(/^lab\.\s*/i, 'laboratorium ').trim();
        const normTarget = labName.toLowerCase().replace(/^lab\.\s*/i, 'laboratorium ').trim();
        if (normA === normTarget) return true;
      }
      return false;
    });
  };

  // Filtered tools by laboratory strictly fetched from the database
  const internalAvailableTools = getToolsByLab(internalForm.labId, internalForm.namaLab);
  const eksternalAvailableTools = getToolsByLab(eksternalForm.labId, eksternalForm.namaLab);
  const tambahAlatAvailableTools = getToolsByLab(tambahAlatForm.labId, tambahAlatForm.namaLab);

  const selectedInternalAlat =
    internalAvailableTools.find((a) => a.id === internalForm.alatId) ||
    alatList.find((a) => a.id === internalForm.alatId);

  const selectedEksternalAlat =
    eksternalAvailableTools.find((a) => a.id === eksternalForm.alatId) ||
    alatList.find((a) => a.id === eksternalForm.alatId);

  // Helper to check if bon record belongs to the logged-in student
  const isOwnRecord = (item: BonAlatItem): boolean => {
    if (currentRole !== 'mahasiswa') return true;
    if (!currentUser) return true;

    const curName = (currentUser.nama || '').trim().toLowerCase();
    const curNim = (currentUser.identifier || '').replace(/\D/g, '');
    const curUser = (currentUser.username || '').trim().toLowerCase();

    const mName = (item.namaMahasiswa || item.namaPeminjam || '').trim().toLowerCase();
    const mNim = (item.identitasPeminjam || '').replace(/\D/g, '');

    const nimMatch = Boolean(curNim && mNim && (curNim === mNim || mNim.includes(curNim) || curNim.includes(mNim)));
    const nameMatch = Boolean(
      curName && mName && (curName === mName || mName.includes(curName) || curName.includes(mName))
    );
    const userMatch = Boolean(curUser && mName.includes(curUser));

    return nimMatch || nameMatch || userMatch;
  };

  // Search & Filter
  const filteredBon = bonList.filter((item) => {
    // Role Mahasiswa hanya melihat data dirinya sendiri
    if (currentRole === 'mahasiswa' && !isOwnRecord(item)) {
      return false;
    }

    const studentName = (item.namaMahasiswa || item.namaPeminjam || '').toLowerCase();
    const instansi = (item.instansi || '').toLowerCase();
    const nomor = item.nomorBon.toLowerCase();
    const lab = (item.namaLab || '').toLowerCase();
    const tool = (item.namaAlat || '').toLowerCase();
    const tujuan = (item.tujuan || '').toLowerCase();
    const q = searchTerm.toLowerCase();

    const matchSearch =
      studentName.includes(q) ||
      instansi.includes(q) ||
      nomor.includes(q) ||
      lab.includes(q) ||
      tool.includes(q) ||
      tujuan.includes(q);

    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchTujuan = selectedTujuanFilter === 'all' || item.tujuan === selectedTujuanFilter;

    return matchSearch && matchStatus && matchTujuan;
  });

  // Open Internal Modal
  const handleOpenInternal = () => {
    const defaultLab = labList[0];
    const defaultLabId = defaultLab?.id || '';
    const defaultLabName = defaultLab?.namaLab || '';
    const tools = getToolsByLab(defaultLabId, defaultLabName);
    const defaultTool = tools[0] || null;

    setInternalForm({
      namaMahasiswa: currentUser?.nama || 'Ahmad Rizky Pratama',
      identitasPeminjam: currentUser?.identifier || 'NIM. 215090200111012',
      tujuan: 'Penelitian Skripsi',
      tujuanLainnya: '',
      labId: defaultLabId,
      namaLab: defaultLabName,
      alatId: defaultTool ? defaultTool.id : '',
      namaAlat: defaultTool ? defaultTool.namaAlat : '',
      tanggalMulai: new Date().toISOString().split('T')[0],
      tanggalSelesai: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      dosenPembimbing: 'Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Si.',
      keperluan: ''
    });
    setInternalError('');
    setIsInternalModalOpen(true);
  };

  // Open Eksternal Modal
  const handleOpenEksternal = () => {
    const defaultLab = labList[0];
    const defaultLabId = defaultLab?.id || '';
    const defaultLabName = defaultLab?.namaLab || '';
    const tools = getToolsByLab(defaultLabId, defaultLabName);
    const defaultTool = tools[0] || null;

    setEksternalForm({
      namaPeminjam: '',
      jabatan: 'Mahasiswa',
      jabatanLainnya: '',
      instansi: '',
      tujuan: 'Penelitian Dosen',
      tujuanLainnya: '',
      labId: defaultLabId,
      namaLab: defaultLabName,
      alatId: defaultTool ? defaultTool.id : '',
      namaAlat: defaultTool ? defaultTool.namaAlat : '',
      tanggalMulai: new Date().toISOString().split('T')[0],
      tanggalSelesai: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      kontak: '',
      keperluan: ''
    });
    setEksternalError('');
    setIsEksternalModalOpen(true);
  };

  // Open Tambah Alat Modal
  const handleOpenTambahAlat = (bon: BonAlatItem) => {
    setTambahAlatModalItem(bon);
    const targetLab = labList.find((l) => l.namaLab === bon.namaLab || l.id === bon.namaLab) || labList[0];
    const defaultLabId = targetLab?.id || '';
    const defaultLabName = targetLab?.namaLab || bon.namaLab || '';
    const matchingTools = getToolsByLab(defaultLabId, defaultLabName).filter((a) => a.id !== bon.alatId);
    const firstTool = matchingTools[0] || null;

    setTambahAlatForm({
      labId: defaultLabId,
      namaLab: defaultLabName,
      alatId: firstTool ? firstTool.id : '',
      namaAlat: firstTool ? firstTool.namaAlat : '',
      catatan: ''
    });
  };

  // Helper to borrow tool (deduct availability in Data Alat)
  const deductToolAvailability = (alatId: string) => {
    if (!setAlatList || !alatId) return;
    setAlatList((prev) =>
      prev.map((item) => {
        if (item.id === alatId) {
          const newTerpinjam = (item.jumlahTerpinjam ?? 0) + 1;
          const currentTersedia = item.jumlahTersedia !== undefined ? item.jumlahTersedia : item.jumlahTotal;
          const newTersedia = Math.max(0, currentTersedia - 1);
          return {
            ...item,
            jumlahTerpinjam: newTerpinjam,
            jumlahTersedia: newTersedia,
            statusKetersediaan: newTersedia > 0 ? 'Tersedia' : 'Sedang Dipinjam'
          };
        }
        return item;
      })
    );
  };

  // Helper to return tool (restore availability in Data Alat)
  const restoreToolAvailability = (alatId: string) => {
    if (!setAlatList || !alatId) return;
    setAlatList((prev) =>
      prev.map((item) => {
        if (item.id === alatId) {
          const newTerpinjam = Math.max(0, (item.jumlahTerpinjam ?? 1) - 1);
          const currentTersedia = item.jumlahTersedia !== undefined ? item.jumlahTersedia : 0;
          const newTersedia = Math.min(item.jumlahTotal, currentTersedia + 1);
          return {
            ...item,
            jumlahTerpinjam: newTerpinjam,
            jumlahTersedia: newTersedia,
            statusKetersediaan: newTersedia > 0 ? 'Tersedia' : 'Sedang Dipinjam'
          };
        }
        return item;
      })
    );
  };

  // Submit Internal Peminjaman
  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalForm.namaMahasiswa.trim()) {
      setInternalError('Nama mahasiswa peminjam wajib diisi.');
      return;
    }
    if (!internalForm.namaLab) {
      setInternalError('Silakan pilih laboratorium terlebih dahulu.');
      return;
    }
    if (!internalForm.alatId || !internalForm.namaAlat) {
      setInternalError('Silakan pilih alat laboratorium dari database laboratorium yang dipilih.');
      return;
    }

    const matchedAlat = alatList.find((a) => a.id === internalForm.alatId);
    if (matchedAlat && (matchedAlat.jumlahTersedia !== undefined ? matchedAlat.jumlahTersedia : 1) <= 0) {
      setInternalError(
        `Alat "${matchedAlat.namaAlat}" sedang habis terpinjam (ketersediaan: 0 unit). Silakan pilih alat lain atau tunggu pengembalian.`
      );
      return;
    }

    const finalNamaAlat = matchedAlat ? matchedAlat.namaAlat : internalForm.namaAlat;
    const finalNamaLab = matchedAlat?.namaLab || internalForm.namaLab;
    const finalTujuan =
      internalForm.tujuan === 'Lainnya' && internalForm.tujuanLainnya.trim()
        ? internalForm.tujuanLainnya.trim()
        : internalForm.tujuan;

    const newBon: BonAlatItem = {
      id: `bon-alt-${Date.now()}`,
      nomorBon: `BON-ALT-${new Date().getFullYear()}-${(bonList.length + 1).toString().padStart(3, '0')}`,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      namaPeminjam: internalForm.namaMahasiswa.trim(),
      namaMahasiswa: internalForm.namaMahasiswa.trim(),
      identitasPeminjam: internalForm.identitasPeminjam.trim(),
      rolePeminjam: 'mahasiswa',
      tipePeminjaman: 'Internal',
      jabatan: 'Mahasiswa',
      instansi: 'Universitas Brawijaya',
      tujuan: finalTujuan,
      alatId: internalForm.alatId,
      namaAlat: finalNamaAlat,
      namaLab: finalNamaLab,
      daftarAlatTambahan: [],
      tanggalMulai: internalForm.tanggalMulai,
      tanggalSelesai: internalForm.tanggalSelesai,
      keperluan: internalForm.keperluan.trim() || `Peminjaman instrumen untuk keperluan ${finalTujuan}`,
      dosenPembimbing: internalForm.dosenPembimbing.trim(),
      status: 'Menunggu Persetujuan',
      catatanPeminjaman: 'Permohonan baru diajukan secara internal oleh mahasiswa.'
    };

    setBonList((prev) => [newBon, ...prev]);
    // Otomatis kurangi ketersediaan alat di database Data Alat
    deductToolAvailability(internalForm.alatId);
    setIsInternalModalOpen(false);
  };

  // Submit Eksternal Peminjaman
  const handleSubmitEksternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eksternalForm.namaPeminjam.trim()) {
      setEksternalError('Nama peminjam eksternal wajib diisi.');
      return;
    }
    if (!eksternalForm.instansi.trim()) {
      setEksternalError('Nama instansi / institusi mitra wajib diisi.');
      return;
    }
    if (!eksternalForm.namaLab) {
      setEksternalError('Silakan pilih laboratorium terlebih dahulu.');
      return;
    }
    if (!eksternalForm.alatId || !eksternalForm.namaAlat) {
      setEksternalError('Silakan pilih alat laboratorium dari database laboratorium yang dipilih.');
      return;
    }

    const matchedAlat = alatList.find((a) => a.id === eksternalForm.alatId);
    if (matchedAlat && (matchedAlat.jumlahTersedia !== undefined ? matchedAlat.jumlahTersedia : 1) <= 0) {
      setEksternalError(
        `Alat "${matchedAlat.namaAlat}" sedang habis terpinjam (ketersediaan: 0 unit). Silakan pilih alat lain atau tunggu pengembalian.`
      );
      return;
    }

    const finalNamaAlat = matchedAlat ? matchedAlat.namaAlat : eksternalForm.namaAlat;
    const finalNamaLab = matchedAlat?.namaLab || eksternalForm.namaLab;
    const finalJabatan =
      eksternalForm.jabatan === 'Lainnya' && eksternalForm.jabatanLainnya.trim()
        ? eksternalForm.jabatanLainnya.trim()
        : eksternalForm.jabatan;
    const finalTujuan =
      eksternalForm.tujuan === 'Lainnya' && eksternalForm.tujuanLainnya.trim()
        ? eksternalForm.tujuanLainnya.trim()
        : eksternalForm.tujuan;

    const newBon: BonAlatItem = {
      id: `bon-alt-${Date.now()}`,
      nomorBon: `BON-EKS-${new Date().getFullYear()}-${(bonList.length + 1).toString().padStart(3, '0')}`,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      namaPeminjam: eksternalForm.namaPeminjam.trim(),
      namaMahasiswa: eksternalForm.namaPeminjam.trim(),
      identitasPeminjam: eksternalForm.kontak.trim() || `${finalJabatan} - ${eksternalForm.instansi.trim()}`,
      rolePeminjam: 'eksternal',
      tipePeminjaman: 'Eksternal',
      jabatan: finalJabatan,
      instansi: eksternalForm.instansi.trim(),
      tujuan: finalTujuan,
      alatId: eksternalForm.alatId,
      namaAlat: finalNamaAlat,
      namaLab: finalNamaLab,
      daftarAlatTambahan: [],
      tanggalMulai: eksternalForm.tanggalMulai,
      tanggalSelesai: eksternalForm.tanggalSelesai,
      keperluan: eksternalForm.keperluan.trim() || `Peminjaman eksternal oleh mitra ${eksternalForm.instansi.trim()}`,
      status: 'Menunggu Persetujuan',
      catatanPeminjaman: `Peminjaman pihak eksternal (${eksternalForm.instansi.trim()}). Kontak: ${eksternalForm.kontak || '-'}`
    };

    setBonList((prev) => [newBon, ...prev]);
    // Otomatis kurangi ketersediaan alat di database Data Alat
    deductToolAvailability(eksternalForm.alatId);
    setIsEksternalModalOpen(false);
  };

  // Submit Tambah Alat ke Record Peminjaman
  const handleSubmitTambahAlat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tambahAlatModalItem || !tambahAlatForm.namaAlat) {
      return;
    }

    const matchedAlat = alatList.find((a) => a.id === tambahAlatForm.alatId);
    const newToolItem: AlatTambahanItem = {
      alatId: tambahAlatForm.alatId,
      namaAlat: matchedAlat ? matchedAlat.namaAlat : tambahAlatForm.namaAlat,
      namaLab: matchedAlat ? matchedAlat.namaLab : tambahAlatForm.namaLab,
      kondisi: matchedAlat?.kondisi || 'Baik',
      tanggalDitambahkan: new Date().toISOString().split('T')[0]
    };

    setBonList((prev) =>
      prev.map((item) =>
        item.id === tambahAlatModalItem.id
          ? {
              ...item,
              daftarAlatTambahan: [...(item.daftarAlatTambahan || []), newToolItem],
              catatanPeminjaman: tambahAlatForm.catatan
                ? `${item.catatanPeminjaman || ''} [Alat Tambahan: ${newToolItem.namaAlat} - ${tambahAlatForm.catatan}]`
                : item.catatanPeminjaman
            }
          : item
      )
    );

    // Otomatis kurangi ketersediaan alat tambahan di database Data Alat
    deductToolAvailability(tambahAlatForm.alatId);

    // Update detail view if open
    if (detailModalItem?.id === tambahAlatModalItem.id) {
      setDetailModalItem((prev) =>
        prev
          ? {
              ...prev,
              daftarAlatTambahan: [...(prev.daftarAlatTambahan || []), newToolItem]
            }
          : null
      );
    }

    setTambahAlatModalItem(null);
  };

  // Status updates
  const handleUpdateStatus = (id: string, newStatus: BonAlatItem['status']) => {
    const approverName = currentUser?.nama || 'PLP Departemen Kimia';
    const targetBon = bonList.find((b) => b.id === id);

    if (targetBon) {
      const activeStates = ['Menunggu Persetujuan', 'Disetujui PLP', 'Sedang Dipinjam'];
      const wasActive = activeStates.includes(targetBon.status);
      const willBeInactive = ['Selesai Dikembalikan', 'Ditolak'].includes(newStatus);
      const wasInactive = ['Selesai Dikembalikan', 'Ditolak'].includes(targetBon.status);
      const willBeActive = activeStates.includes(newStatus);

      if (wasActive && willBeInactive) {
        // Kembalikan alat utama dan alat tambahan (tambah kembali ketersediaan alat)
        restoreToolAvailability(targetBon.alatId);
        targetBon.daftarAlatTambahan?.forEach((t) => restoreToolAvailability(t.alatId));
      } else if (wasInactive && willBeActive) {
        // Pinjam kembali jika status aktif kembali (kurangi ketersediaan alat)
        deductToolAvailability(targetBon.alatId);
        targetBon.daftarAlatTambahan?.forEach((t) => deductToolAvailability(t.alatId));
      }
    }

    setBonList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              petugasPenyetuju: approverName
            }
          : item
      )
    );

    if (detailModalItem?.id === id) {
      setDetailModalItem((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              petugasPenyetuju: approverName
            }
          : null
      );
    }
  };

  // Batalkan / Hapus Peminjaman Alat (Otomatis kembalikan ketersediaan alat di Data Alat)
  const handleDeleteBon = (id: string) => {
    const targetBon = bonList.find((b) => b.id === id);
    if (!targetBon) return;

    const activeStates = ['Menunggu Persetujuan', 'Disetujui PLP', 'Sedang Dipinjam'];
    if (activeStates.includes(targetBon.status)) {
      restoreToolAvailability(targetBon.alatId);
      targetBon.daftarAlatTambahan?.forEach((t) => restoreToolAvailability(t.alatId));
    }

    setBonList((prev) => prev.filter((item) => item.id !== id));
    if (detailModalItem?.id === id) {
      setDetailModalItem(null);
    }
  };

  // Unduh Template Bon Alat
  const handleDownloadTemplate = () => {
    const templateContent = `DEPARTEMEN KIMIA - FAKULTAS MATEMATIKA DAN ILMU PENGETAHUAN ALAM
UNIVERSITAS BRAWIJAYA
Jl. Veteran, Malang 65145, Jawa Timur, Indonesia
Website: https://kimia.ub.ac.id | Email: kimia@ub.ac.id
================================================================================
FORMULIR PERMOHONAN BON PEMINJAMAN ALAT LABORATORIUM
Nomor Dokumen: FM-KIM-LAB-BON-01 (Revisi: 2024)
================================================================================

I. DATA PEMINJAM ALAT LABORATORIUM
1. Nama Lengkap Peminjam / Mahasiswa : __________________________________________
2. NIM / NIP / No. Identitas        : __________________________________________
3. Status / Jabatan                 : [ ] Mahasiswa S1  [ ] Mahasiswa S2/S3
                                      [ ] Dosen / Peneliti  [ ] Pihak Eksternal/Mitra
4. Instansi / Asal Departemen       : __________________________________________
5. No. Telepon / WhatsApp / Email   : __________________________________________
6. Dosen Pembimbing / Penanggung Jwb: __________________________________________

II. RINCIAN TUJUAN & FASILITAS LABORATORIUM
1. Tujuan Peminjaman                : [ ] Penelitian Skripsi      [ ] Penelitian Tesis/Disertasi
                                      [ ] Penelitian Dosen        [ ] Proyek Kimia
                                      [ ] Program Kreatifitas Mhs [ ] Analisis Sampel
                                      [ ] Lainnya: _____________________________
2. Laboratorium Penempatan          : __________________________________________
3. Masa Peminjaman                  : Tanggal Mulai: _________ s.d Selesai: _________

III. DAFTAR PERALATAN / INSTRUMEN YANG DIAJUKAN
No | Nama Alat / Instrumen             | Merk & Tipe       | Jumlah Unit | Kondisi Awal
--------------------------------------------------------------------------------
1. |                                   |                   |             | Baik
2. |                                   |                   |             | Baik
3. |                                   |                   |             | Baik
4. |                                   |                   |             | Baik

IV. KETENTUAN DAN TATA TERTIB LABORATORIUM
1. Peminjam wajib menaati Prosedur Operasional Standar (SOP) dan K3 Laboratorium Kimia.
2. Alat harus digunakan sesuai peruntukan dan dijaga kebersihannya sebelum & sesudah pemakaian.
3. Kerusakan atau kehilangan akibat kelalaian peminjam wajib diperbaiki/diganti sesuai spesifikasi asli.
4. Segala bentuk insiden operasional segera dilaporkan kepada PLP laboratorium yang bertugas.

Malang, ____________________ 2024

Mengetahui,
Dosen Pembimbing / Pimpinan Mitra           Pemohon / Peminjam Alat Lab


( ___________________________________ )     ( ___________________________________ )
NIP/NIDN.                                   NIM/NIP.

Menyetujui,
Pranata Laboratorium Pendidikan (PLP)       Kepala Laboratorium Kimia


( ___________________________________ )     ( ___________________________________ )
NIP.                                        NIP.
`;

    const blob = new Blob([templateContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Template_Bon_Peminjaman_Alat_Laboratorium_Kimia_UB.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Banner Sinkronisasi Otomatis */}
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="font-bold">Sinkronisasi Data Inventaris Aktif:</span> Setiap alat yang dibon (dipinjam) otomatis mengurangi jumlah ketersediaan alat di database Data Alat, dan otomatis dikembalikan saat berstatus Selesai atau Dibatalkan.
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
              <span className="font-bold">Akses Akun Mahasiswa:</span> Menampilkan riwayat dan status bon peminjaman alat milik Anda sendiri (<strong>{currentUser?.nama || 'Ahmad Rizky Pratama'}</strong> - {currentUser?.identifier || 'NIM. 215090200111012'}). Peminjaman baru yang Anda ajukan akan otomatis tercatat dan muncul pada tabel di bawah.
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-sky-200 text-sky-900 font-bold text-[10px] shrink-0">
            Data Pribadi Anda
          </span>
        </div>
      )}

      {/* Form Card Header: Data Peminjam Alat Laboratorium */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#002B49] text-white flex items-center justify-center shadow-xs">
                <ClipboardList className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Data Peminjam Alat Laboratorium
                </h2>
                <p className="text-xs text-slate-500">
                  Layanan pengajuan, perizinan bon, dan peminjaman instrumen riset Departemen Kimia FSTeM UB
                </p>
              </div>
            </div>
          </div>

          {/* Under Form Title: Buat Peminjaman, Buat Peminjaman Eksternal & Unduh Template Link */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenInternal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002B49] text-white rounded-xl text-xs font-semibold hover:bg-[#002B49]/90 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Buat Peminjaman</span>
            </button>

            {currentRole !== 'mahasiswa' && (
              <button
                onClick={handleOpenEksternal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 shadow-xs transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Buat Peminjaman Eksternal</span>
              </button>
            )}

            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 rounded-xl text-xs font-semibold hover:text-blue-800 transition-colors cursor-pointer group"
              title="Unduh Template Dokumen Bon Alat Resmi (DOC)"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
              <span className="underline decoration-blue-400 underline-offset-2">Unduh Template Bon Alat</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama mahasiswa, NIM, instansi, lab, atau tujuan peminjaman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 focus:border-[#002B49] bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTujuanFilter}
              onChange={(e) => setSelectedTujuanFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002B49]/20"
            >
              <option value="all">Semua Tujuan</option>
              {TUJUAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002B49]/20"
            >
              <option value="all">Semua Status</option>
              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
              <option value="Disetujui PLP">Disetujui PLP</option>
              <option value="Sedang Dipinjam">Sedang Dipinjam</option>
              <option value="Selesai Dikembalikan">Selesai Dikembalikan</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table: Nama Mahasiswa, Laboratorium, Tujuan, Status, Aksi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-3 px-4 whitespace-nowrap">Nama Mahasiswa</th>
                <th className="py-3 px-4">Laboratorium</th>
                <th className="py-3 px-4 whitespace-nowrap">Tujuan</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBon.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada data peminjam alat laboratorium yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredBon.map((bon) => (
                  <tr key={bon.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. Nama Mahasiswa */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#002B49] flex items-center justify-center shrink-0 font-bold text-xs">
                          {bon.tipePeminjaman === 'Eksternal' ? (
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <GraduationCap className="w-3.5 h-3.5 text-[#002B49]" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                            <span>{bon.namaMahasiswa || bon.namaPeminjam}</span>
                            {bon.tipePeminjaman === 'Eksternal' ? (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                                Eksternal • {bon.instansi || 'Mitra Luar'}
                              </span>
                            ) : (
                              <span className="text-[9px] bg-blue-50 text-blue-700 font-medium px-1.5 py-0.5 rounded">
                                Mahasiswa
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {bon.identitasPeminjam} • <span className="text-slate-400 font-normal">{bon.nomorBon}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Laboratorium */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{bon.namaLab}</div>
                      <div className="text-[11px] text-[#002B49] font-medium flex items-center gap-1 mt-0.5">
                        <Microscope className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{bon.namaAlat}</span>
                      </div>
                      {bon.daftarAlatTambahan && bon.daftarAlatTambahan.length > 0 && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>+{bon.daftarAlatTambahan.length} alat tambahan</span>
                        </div>
                      )}
                    </td>

                    {/* 3. Tujuan */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80">
                        {bon.tujuan || 'Penelitian Skripsi'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {bon.tanggalMulai} s.d {bon.tanggalSelesai}
                        </span>
                      </div>
                    </td>

                    {/* 4. Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${
                          bon.status === 'Disetujui PLP'
                            ? 'bg-blue-100 text-blue-800'
                            : bon.status === 'Sedang Dipinjam'
                            ? 'bg-amber-100 text-amber-800'
                            : bon.status === 'Selesai Dikembalikan'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bon.status === 'Ditolak'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                        }`}
                      >
                        {bon.status}
                      </span>
                    </td>

                    {/* 5. Aksi: Button Detail & Button Tambah Alat */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setDetailModalItem(bon)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="Lihat Detail Peminjaman"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#002B49]" />
                          <span>Detail</span>
                        </button>

                        <button
                          onClick={() => handleOpenTambahAlat(bon)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="Tambah Alat ke Peminjaman ini"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Tambah Alat</span>
                        </button>

                        {(canApprove || bon.status === 'Menunggu Persetujuan') && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Batalkan peminjaman alat "${bon.nomorBon}"? Ketersediaan alat akan otomatis dikembalikan ke database inventaris.`)) {
                                handleDeleteBon(bon.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Batalkan / Hapus Peminjaman (Alat dikembalikan)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Modal 1: Tambah Peminjaman Alat Laboratorium (Internal) */}
      {isInternalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#002B49] text-white flex items-center justify-center">
                  <Plus className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tambah Peminjaman Alat Laboratorium
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Formulir Peminjaman Alat & Fasilitas Laboratorium (Civitas Akademika / Mahasiswa)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInternalModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {internalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{internalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitInternal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Mahasiswa *</label>
                  <input
                    type="text"
                    required
                    readOnly={currentRole === 'mahasiswa'}
                    value={internalForm.namaMahasiswa}
                    onChange={(e) => {
                      if (currentRole === 'mahasiswa') return;
                      setInternalForm({ ...internalForm, namaMahasiswa: e.target.value });
                      setInternalError('');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none ${
                      currentRole === 'mahasiswa'
                        ? 'bg-slate-100 text-slate-700 cursor-not-allowed'
                        : 'bg-white focus:ring-2 focus:ring-[#002B49]/20'
                    }`}
                    placeholder="Nama lengkap mahasiswa"
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
                    value={internalForm.identitasPeminjam}
                    onChange={(e) => {
                      if (currentRole === 'mahasiswa') return;
                      setInternalForm({ ...internalForm, identitasPeminjam: e.target.value });
                      setInternalError('');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none ${
                      currentRole === 'mahasiswa'
                        ? 'bg-slate-100 text-slate-700 cursor-not-allowed'
                        : 'bg-white focus:ring-2 focus:ring-[#002B49]/20'
                    }`}
                    placeholder="NIM. 215090200..."
                  />
                  {currentRole === 'mahasiswa' && (
                    <p className="text-[10px] text-slate-500 mt-1">Sesuai nomor identitas mahasiswa</p>
                  )}
                </div>
              </div>

              {/* 1. List Tujuan */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tujuan Peminjaman *</label>
                <select
                  required
                  value={internalForm.tujuan}
                  onChange={(e) =>
                    setInternalForm({ ...internalForm, tujuan: e.target.value as TujuanPeminjamanAlat })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49]/20"
                >
                  {TUJUAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {internalForm.tujuan === 'Lainnya' && (
                  <input
                    type="text"
                    required
                    value={internalForm.tujuanLainnya}
                    onChange={(e) => setInternalForm({ ...internalForm, tujuanLainnya: e.target.value })}
                    placeholder="Tuliskan tujuan peminjaman secara spesifik..."
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                )}
              </div>

              {/* 2. List Laboratorium */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Laboratorium *</label>
                <select
                  required
                  value={internalForm.labId || labList.find((l) => l.namaLab === internalForm.namaLab)?.id || ''}
                  onChange={(e) => {
                    const selectedLabId = e.target.value;
                    const labObj = labList.find((l) => l.id === selectedLabId || l.namaLab === selectedLabId);
                    const labName = labObj ? labObj.namaLab : '';
                    const labId = labObj ? labObj.id : selectedLabId;

                    // Ambil database alat dari laboratorium yang dipilih
                    const matchingTools = getToolsByLab(labId, labName);
                    const firstTool = matchingTools[0] || null;

                    setInternalForm({
                      ...internalForm,
                      labId,
                      namaLab: labName,
                      alatId: firstTool ? firstTool.id : '',
                      namaAlat: firstTool ? firstTool.namaAlat : ''
                    });
                    setInternalError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49]/20"
                >
                  <option value="">-- Pilih Laboratorium --</option>
                  {labList.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.namaLab} ({lab.kodeLab})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. List Nama Alat (Ambil database alat dari laboratorium yang dipilih) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">Nama Alat *</label>
                  {internalForm.namaLab && (
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 border border-blue-200">
                      <Microscope className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>Database: {internalAvailableTools.length} alat</span>
                    </span>
                  )}
                </div>
                <select
                  required
                  disabled={!internalForm.namaLab}
                  value={internalForm.alatId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const sel =
                      internalAvailableTools.find((a) => a.id === selectedId) ||
                      alatList.find((a) => a.id === selectedId);
                    setInternalForm({
                      ...internalForm,
                      alatId: selectedId,
                      namaAlat: sel ? sel.namaAlat : ''
                    });
                    setInternalError('');
                  }}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 transition-colors ${
                    !internalForm.namaLab
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  {!internalForm.namaLab ? (
                    <option value="">-- Pilih Laboratorium terlebih dahulu --</option>
                  ) : internalAvailableTools.length === 0 ? (
                    <option value="">Belum ada alat terdaftar pada {internalForm.namaLab}</option>
                  ) : (
                    <>
                      <option value="">
                        -- Pilih Nama Alat Laboratorium ({internalAvailableTools.length} alat tersedia) --
                      </option>
                      {internalAvailableTools.map((alat) => (
                        <option key={alat.id} value={alat.id}>
                          {alat.namaAlat} {alat.merkTipe ? `(${alat.merkTipe})` : ''} — {alat.kondisi} (Tersedia:{' '}
                          {alat.jumlahTersedia ?? 1} {alat.satuan || 'Unit'})
                        </option>
                      ))}
                    </>
                  )}
                </select>

                {/* Preview Data Alat dari Database Laboratorium */}
                {selectedInternalAlat ? (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5 text-blue-900 truncate">
                        <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{selectedInternalAlat.namaAlat}</span>
                      </span>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedInternalAlat.statusKetersediaan === 'Tersedia'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedInternalAlat.statusKetersediaan}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="font-medium text-slate-700">Kode Alat:</span> {selectedInternalAlat.kodeAlat}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">No. BMN:</span>{' '}
                        {selectedInternalAlat.nomorInventarisBmn || '-'}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Merk / Tipe:</span>{' '}
                        {selectedInternalAlat.merkTipe || '-'}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">PLP PJ:</span> {selectedInternalAlat.plpPj || '-'}
                      </div>
                      <div className="col-span-1 sm:col-span-2 text-slate-600">
                        <span className="font-medium text-slate-700">Spesifikasi:</span>{' '}
                        {selectedInternalAlat.spesifikasiSingkat || '-'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400 shrink-0" />
                    Pilihan alat otomatis disaring dari database laboratorium yang dipilih di atas.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Mulai Pinjam *</label>
                  <input
                    type="date"
                    required
                    value={internalForm.tanggalMulai}
                    onChange={(e) => setInternalForm({ ...internalForm, tanggalMulai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimasi Selesai Pinjam *</label>
                  <input
                    type="date"
                    required
                    value={internalForm.tanggalSelesai}
                    onChange={(e) => setInternalForm({ ...internalForm, tanggalSelesai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dosen Pembimbing Skripsi / Riset</label>
                <input
                  type="text"
                  value={internalForm.dosenPembimbing}
                  onChange={(e) => setInternalForm({ ...internalForm, dosenPembimbing: e.target.value })}
                  placeholder="Nama dosen pembimbing & gelar lengkap"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Keperluan Riset / Pengujian</label>
                <textarea
                  rows={2}
                  value={internalForm.keperluan}
                  onChange={(e) => setInternalForm({ ...internalForm, keperluan: e.target.value })}
                  placeholder="Jelaskan preparasi sampel, judul skripsi/riset, atau parameter pengujian..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white resize-y"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInternalModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] text-white rounded-lg font-semibold hover:bg-[#002B49]/90 shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Peminjaman Alat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Tambah Peminjaman Alat Laboratorium (Eksternal) */}
      {isEksternalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Tambah Peminjaman Alat Laboratorium
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Eksternal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Formulir Peminjaman Instrumen Laboratorium untuk Pihak Luar / Instansi Mitra
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEksternalModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {eksternalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{eksternalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEksternal} className="space-y-3.5 text-xs">
              {/* 1. Nama Peminjam */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Peminjam *</label>
                <input
                  type="text"
                  required
                  value={eksternalForm.namaPeminjam}
                  onChange={(e) => {
                    setEksternalForm({ ...eksternalForm, namaPeminjam: e.target.value });
                    setEksternalError('');
                  }}
                  placeholder="Nama lengkap peminjam eksternal beserta gelar"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 2. Jabatan (Mahasiswa / Siswa / Staf) */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jabatan (Mahasiswa / Siswa / Staf) *
                  </label>
                  <select
                    required
                    value={eksternalForm.jabatan}
                    onChange={(e) => setEksternalForm({ ...eksternalForm, jabatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Siswa">Siswa</option>
                    <option value="Staf">Staf</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>
                  {eksternalForm.jabatan === 'Lainnya' && (
                    <input
                      type="text"
                      required
                      value={eksternalForm.jabatanLainnya}
                      onChange={(e) => setEksternalForm({ ...eksternalForm, jabatanLainnya: e.target.value })}
                      placeholder="Tuliskan jabatan (contoh: Peneliti Utama / Guru)"
                      className="mt-2 w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  )}
                </div>

                {/* 3. Instansi */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Instansi *</label>
                  <input
                    type="text"
                    required
                    value={eksternalForm.instansi}
                    onChange={(e) => {
                      setEksternalForm({ ...eksternalForm, instansi: e.target.value });
                      setEksternalError('');
                    }}
                    placeholder="Nama institusi / universitas / perusahaan luar"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>

              {/* 4. List Tujuan */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tujuan Peminjaman *</label>
                <select
                  required
                  value={eksternalForm.tujuan}
                  onChange={(e) =>
                    setEksternalForm({ ...eksternalForm, tujuan: e.target.value as TujuanPeminjamanAlat })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                >
                  {TUJUAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {eksternalForm.tujuan === 'Lainnya' && (
                  <input
                    type="text"
                    required
                    value={eksternalForm.tujuanLainnya}
                    onChange={(e) => setEksternalForm({ ...eksternalForm, tujuanLainnya: e.target.value })}
                    placeholder="Sebutkan tujuan riset eksternal..."
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                )}
              </div>

              {/* 5. List Laboratorium */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Laboratorium *</label>
                <select
                  required
                  value={eksternalForm.labId || labList.find((l) => l.namaLab === eksternalForm.namaLab)?.id || ''}
                  onChange={(e) => {
                    const selectedLabId = e.target.value;
                    const labObj = labList.find((l) => l.id === selectedLabId || l.namaLab === selectedLabId);
                    const labName = labObj ? labObj.namaLab : '';
                    const labId = labObj ? labObj.id : selectedLabId;

                    // Ambil database alat dari laboratorium yang dipilih
                    const matchingTools = getToolsByLab(labId, labName);
                    const firstTool = matchingTools[0] || null;

                    setEksternalForm({
                      ...eksternalForm,
                      labId,
                      namaLab: labName,
                      alatId: firstTool ? firstTool.id : '',
                      namaAlat: firstTool ? firstTool.namaAlat : ''
                    });
                    setEksternalError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                >
                  <option value="">-- Pilih Laboratorium --</option>
                  {labList.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.namaLab} ({lab.kodeLab})
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. List Nama Alat (Ambil database alat dari laboratorium yang dipilih) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">Nama Alat *</label>
                  {eksternalForm.namaLab && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 border border-emerald-200">
                      <Microscope className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Database: {eksternalAvailableTools.length} alat</span>
                    </span>
                  )}
                </div>
                <select
                  required
                  disabled={!eksternalForm.namaLab}
                  value={eksternalForm.alatId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const sel =
                      eksternalAvailableTools.find((a) => a.id === selectedId) ||
                      alatList.find((a) => a.id === selectedId);
                    setEksternalForm({
                      ...eksternalForm,
                      alatId: selectedId,
                      namaAlat: sel ? sel.namaAlat : ''
                    });
                    setEksternalError('');
                  }}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-colors ${
                    !eksternalForm.namaLab
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  {!eksternalForm.namaLab ? (
                    <option value="">-- Pilih Laboratorium terlebih dahulu --</option>
                  ) : eksternalAvailableTools.length === 0 ? (
                    <option value="">Belum ada alat terdaftar pada {eksternalForm.namaLab}</option>
                  ) : (
                    <>
                      <option value="">
                        -- Pilih Nama Alat Laboratorium ({eksternalAvailableTools.length} alat tersedia) --
                      </option>
                      {eksternalAvailableTools.map((alat) => (
                        <option key={alat.id} value={alat.id}>
                          {alat.namaAlat} {alat.merkTipe ? `(${alat.merkTipe})` : ''} — {alat.kondisi} (Tersedia:{' '}
                          {alat.jumlahTersedia ?? 1} {alat.satuan || 'Unit'})
                        </option>
                      ))}
                    </>
                  )}
                </select>

                {/* Preview Data Alat dari Database Laboratorium */}
                {selectedEksternalAlat ? (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5 text-emerald-900 truncate">
                        <Wrench className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{selectedEksternalAlat.namaAlat}</span>
                      </span>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedEksternalAlat.statusKetersediaan === 'Tersedia'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedEksternalAlat.statusKetersediaan}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="font-medium text-slate-700">Kode Alat:</span> {selectedEksternalAlat.kodeAlat}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">No. BMN:</span>{' '}
                        {selectedEksternalAlat.nomorInventarisBmn || '-'}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Merk / Tipe:</span>{' '}
                        {selectedEksternalAlat.merkTipe || '-'}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">PLP PJ:</span> {selectedEksternalAlat.plpPj || '-'}
                      </div>
                      <div className="col-span-1 sm:col-span-2 text-slate-600">
                        <span className="font-medium text-slate-700">Spesifikasi:</span>{' '}
                        {selectedEksternalAlat.spesifikasiSingkat || '-'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400 shrink-0" />
                    Pilihan alat otomatis disaring dari database laboratorium yang dipilih di atas.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Mulai Pinjam *</label>
                  <input
                    type="date"
                    required
                    value={eksternalForm.tanggalMulai}
                    onChange={(e) => setEksternalForm({ ...eksternalForm, tanggalMulai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimasi Selesai Pinjam *</label>
                  <input
                    type="date"
                    required
                    value={eksternalForm.tanggalSelesai}
                    onChange={(e) => setEksternalForm({ ...eksternalForm, tanggalSelesai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kontak WhatsApp / Email *</label>
                <input
                  type="text"
                  required
                  value={eksternalForm.kontak}
                  onChange={(e) => setEksternalForm({ ...eksternalForm, kontak: e.target.value })}
                  placeholder="0812xxxx / email@instansi.ac.id"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Keperluan Analisis / Kerjasama</label>
                <textarea
                  rows={2}
                  value={eksternalForm.keperluan}
                  onChange={(e) => setEksternalForm({ ...eksternalForm, keperluan: e.target.value })}
                  placeholder="Deskripsi sampel atau ruang lingkup pengujian instrumen..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white resize-y"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEksternalModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Peminjaman Eksternal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Tambah Alat ke Peminjaman yang sudah ada (dari Button Tambah Alat di tabel Aksi) */}
      {tambahAlatModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Tambah Alat Laboratorium</h3>
                  <p className="text-[10px] text-slate-500">
                    Menambahkan instrumen pendukung untuk peminjam ini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTambahAlatModalItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target borrower info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Peminjam Terpilih:</div>
              <div className="font-bold text-slate-900">
                {tambahAlatModalItem.namaMahasiswa || tambahAlatModalItem.namaPeminjam}
              </div>
              <div className="text-[11px] text-slate-600">
                {tambahAlatModalItem.identitasPeminjam} • Nomor Bon: {tambahAlatModalItem.nomorBon}
              </div>
              <div className="text-[11px] text-slate-500">
                Alat Utama: <span className="font-semibold text-[#002B49]">{tambahAlatModalItem.namaAlat}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitTambahAlat} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Laboratorium *</label>
                <select
                  value={tambahAlatForm.labId || labList.find((l) => l.namaLab === tambahAlatForm.namaLab)?.id || ''}
                  onChange={(e) => {
                    const selectedLabId = e.target.value;
                    const labObj = labList.find((l) => l.id === selectedLabId || l.namaLab === selectedLabId);
                    const labName = labObj ? labObj.namaLab : '';
                    const labId = labObj ? labObj.id : selectedLabId;

                    const matchingTools = getToolsByLab(labId, labName).filter((a) => a.id !== tambahAlatModalItem?.alatId);
                    setTambahAlatForm({
                      ...tambahAlatForm,
                      labId,
                      namaLab: labName,
                      alatId: matchingTools[0]?.id || '',
                      namaAlat: matchingTools[0]?.namaAlat || ''
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  {labList.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.namaLab} ({lab.kodeLab})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Alat Tambahan *</label>
                <select
                  required
                  value={tambahAlatForm.alatId}
                  onChange={(e) => {
                    const sel =
                      tambahAlatAvailableTools.find((a) => a.id === e.target.value) ||
                      alatList.find((a) => a.id === e.target.value);
                    setTambahAlatForm({
                      ...tambahAlatForm,
                      alatId: e.target.value,
                      namaAlat: sel ? sel.namaAlat : ''
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  <option value="">
                    {tambahAlatAvailableTools.length === 0
                      ? '-- Tidak ada alat lain di laboratorium ini --'
                      : `-- Pilih Alat Tambahan (${tambahAlatAvailableTools.length} alat tersedia) --`}
                  </option>
                  {tambahAlatAvailableTools.map((alat) => (
                    <option key={alat.id} value={alat.id}>
                      {alat.namaAlat} {alat.merkTipe ? `(${alat.merkTipe})` : ''} - {alat.kondisi} (Tersedia:{' '}
                      {alat.jumlahTersedia ?? 1} {alat.satuan || 'Unit'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={tambahAlatForm.catatan}
                  onChange={(e) => setTambahAlatForm({ ...tambahAlatForm, catatan: e.target.value })}
                  placeholder="Contoh: Modul tambahan kuvet kuarsa / rotor sentrifus"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTambahAlatModalItem(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 cursor-pointer shadow-xs"
                >
                  Tambahkan Alat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Detail Peminjaman Alat Laboratorium (dari Button Detail di tabel Aksi) */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#002B49] text-white flex items-center justify-center font-bold text-xs">
                  <Eye className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Detail Peminjaman Alat Laboratorium
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Nomor Bon: {detailModalItem.nomorBon} • Diajukan: {detailModalItem.tanggalPengajuan}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Status Peminjaman:</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      detailModalItem.status === 'Disetujui PLP'
                        ? 'bg-blue-100 text-blue-800'
                        : detailModalItem.status === 'Sedang Dipinjam'
                        ? 'bg-amber-100 text-amber-800'
                        : detailModalItem.status === 'Selesai Dikembalikan'
                        ? 'bg-emerald-100 text-emerald-800'
                        : detailModalItem.status === 'Ditolak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {detailModalItem.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Mahasiswa / Peminjam:</span>
                    <span className="font-bold text-slate-900">
                      {detailModalItem.namaMahasiswa || detailModalItem.namaPeminjam}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NIM / Identitas:</span>
                    <span className="font-mono text-slate-800">{detailModalItem.identitasPeminjam}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tipe Peminjam & Instansi:</span>
                    <span className="text-slate-700 font-medium">
                      {detailModalItem.tipePeminjaman || 'Internal'} ({detailModalItem.instansi || 'Universitas Brawijaya'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tujuan Peminjaman:</span>
                    <span className="font-semibold text-emerald-800">{detailModalItem.tujuan || 'Penelitian Skripsi'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Laboratorium:</span>
                    <span className="font-semibold text-slate-800">{detailModalItem.namaLab}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jadwal Penggunaan:</span>
                    <span className="text-slate-700">
                      {detailModalItem.tanggalMulai} s.d {detailModalItem.tanggalSelesai}
                    </span>
                  </div>
                </div>

                {detailModalItem.dosenPembimbing && (
                  <div className="pt-2 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-400 block text-[10px]">Dosen Pembimbing:</span>
                    <span className="font-medium text-slate-800">{detailModalItem.dosenPembimbing}</span>
                  </div>
                )}
              </div>

              {/* Daftar Alat yang Dipinjam */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Microscope className="w-4 h-4 text-[#002B49]" />
                    <span>Daftar Instrumen & Alat Dipinjam:</span>
                  </div>
                  <button
                    onClick={() => {
                      handleOpenTambahAlat(detailModalItem);
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Alat Lain</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {/* Alat Utama */}
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{detailModalItem.namaAlat}</div>
                      <div className="text-[10px] text-slate-500">
                        Alat Utama • Lab: {detailModalItem.namaLab}
                      </div>
                    </div>
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      Instrumen Utama
                    </span>
                  </div>

                  {/* Alat Tambahan */}
                  {detailModalItem.daftarAlatTambahan &&
                    detailModalItem.daftarAlatTambahan.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{t.namaAlat}</div>
                          <div className="text-[10px] text-slate-500">
                            Alat Tambahan ke-{idx + 1} • Lab: {t.namaLab || detailModalItem.namaLab} • Ditambahkan:{' '}
                            {t.tanggalDitambahkan || 'Hari ini'}
                          </div>
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                          Alat Tambahan
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Keperluan */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Keperluan Riset / Analisis:</span>
                <p className="text-slate-700 text-[11px] leading-relaxed">{detailModalItem.keperluan}</p>
                {detailModalItem.catatanPeminjaman && (
                  <div className="text-[10px] text-slate-500 italic mt-1 pt-1 border-t border-slate-100">
                    Catatan: {detailModalItem.catatanPeminjaman}
                  </div>
                )}
              </div>

              {/* Approvals if super_admin / admin / dosen */}
              {canApprove && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Aksi Persetujuan Petugas PLP:</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {detailModalItem.status === 'Menunggu Persetujuan' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(detailModalItem.id, 'Disetujui PLP')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui Bon Alat</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(detailModalItem.id, 'Ditolak')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak Permohonan</span>
                        </button>
                      </>
                    )}

                    {detailModalItem.status === 'Disetujui PLP' && (
                      <button
                        onClick={() => handleUpdateStatus(detailModalItem.id, 'Sedang Dipinjam')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Serahkan Alat ke Peminjam</span>
                      </button>
                    )}

                    {detailModalItem.status === 'Sedang Dipinjam' && (
                      <button
                        onClick={() => handleUpdateStatus(detailModalItem.id, 'Selesai Dikembalikan')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Selesai Dikembalikan</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSlipModalItem(detailModalItem);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cetak Slip Bon</span>
                </button>

                {(canApprove || detailModalItem.status === 'Menunggu Persetujuan') && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Batalkan permohonan peminjaman alat "${detailModalItem.nomorBon}"? Ketersediaan alat akan otomatis dikembalikan ke inventaris.`
                        )
                      ) {
                        handleDeleteBon(detailModalItem.id);
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Batalkan Peminjaman (Alat dikembalikan)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Batalkan Peminjaman</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slip Modal / Bukti Bon Resmi */}
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
                  <p className="text-[10px] text-slate-500">Formulir Resmi Peminjaman Peralatan / Instrumen Lab</p>
                </div>
              </div>
              <button
                onClick={() => setSlipModalItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
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
                <span className="text-slate-500">Nama Peminjam:</span>
                <span className="font-semibold text-slate-800">
                  {slipModalItem.namaMahasiswa || slipModalItem.namaPeminjam} ({slipModalItem.identitasPeminjam})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tujuan Peminjaman:</span>
                <span className="font-bold text-emerald-800">{slipModalItem.tujuan || 'Penelitian Skripsi'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instrumen Utama:</span>
                <span className="font-bold text-[#002B49]">{slipModalItem.namaAlat}</span>
              </div>
              {slipModalItem.daftarAlatTambahan && slipModalItem.daftarAlatTambahan.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Instrumen Tambahan:</span>
                  <span className="font-medium text-emerald-700 text-right">
                    {slipModalItem.daftarAlatTambahan.map((t) => t.namaAlat).join(', ')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Laboratorium:</span>
                <span className="font-medium text-slate-800">{slipModalItem.namaLab}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masa Peminjaman:</span>
                <span className="font-semibold text-slate-800">
                  {slipModalItem.tanggalMulai} s.d {slipModalItem.tanggalSelesai}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Bon:</span>
                <span className="font-bold text-emerald-700">{slipModalItem.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Keperluan:</span>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-700">
                  {slipModalItem.keperluan}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">Validitas SIKMA Portal UB</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#002B49] text-white rounded-lg text-xs font-semibold hover:bg-[#002B49]/90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Form</span>
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
    </div>
  );
};
