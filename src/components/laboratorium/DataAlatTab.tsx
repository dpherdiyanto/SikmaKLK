import React, { useState } from 'react';
import { DataAlatItem, DataLaboratoriumItem, UserRole, PengadaanAlatItem, StatusPengadaanAlat } from '../../types/sikma';
import { INITIAL_PENGADAAN_ALAT_LIST } from '../../data/labData';
import {
  Microscope,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  ClipboardList,
  ShieldAlert,
  Info,
  Image as ImageIcon,
  Upload,
  PackagePlus,
  Calendar,
  Check,
  ExternalLink,
  DollarSign,
  Layers
} from 'lucide-react';

interface DataAlatTabProps {
  alatList: DataAlatItem[];
  setAlatList: React.Dispatch<React.SetStateAction<DataAlatItem[]>>;
  labList: DataLaboratoriumItem[];
  currentRole: UserRole;
  onAjukanBonAlat?: (alat: DataAlatItem) => void;
  selectedLabFilter?: string;
}

export const DataAlatTab: React.FC<DataAlatTabProps> = ({
  alatList,
  setAlatList,
  labList,
  currentRole,
  onAjukanBonAlat,
  selectedLabFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState<string>(selectedLabFilter || 'all');

  React.useEffect(() => {
    if (selectedLabFilter) {
      setSelectedLab(selectedLabFilter);
    }
  }, [selectedLabFilter]);
  const [selectedKondisi, setSelectedKondisi] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlat, setEditingAlat] = useState<DataAlatItem | null>(null);
  const [selectedAlatDetail, setSelectedAlatDetail] = useState<DataAlatItem | null>(null);

  // Pengadaan Alat Lab State
  const [pengadaanList, setPengadaanList] = useState<PengadaanAlatItem[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_pengadaan_alat_list');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PENGADAAN_ALAT_LIST;
  });

  const [isPengadaanModalOpen, setIsPengadaanModalOpen] = useState(false);
  const [editingPengadaan, setEditingPengadaan] = useState<PengadaanAlatItem | null>(null);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [pengadaanForm, setPengadaanForm] = useState<{
    judulPengadaan: string;
    tanggalPengadaan: string;
    tanggalDibuat: string;
    status: StatusPengadaanAlat;
    keterangan?: string;
    namaLab?: string;
    alatSelection: string; // '' | 'Lainnya' | existing alat ID
    namaAlat: string;
    merk: string;
    satuan: string;
    jumlah: number | '';
    spesifikasi: string;
    link: string;
    harga: number | '';
    penguranganStock: 'Ya' | 'Tidak';
  }>({
    judulPengadaan: '',
    tanggalPengadaan: getTodayString(),
    tanggalDibuat: getTodayString(),
    status: 'Diajukan',
    keterangan: '',
    namaLab: '',
    alatSelection: '',
    namaAlat: '',
    merk: '',
    satuan: 'Unit',
    jumlah: 1,
    spesifikasi: '',
    link: '',
    harga: '',
    penguranganStock: 'Tidak'
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('sikma_pengadaan_alat_list', JSON.stringify(pengadaanList));
    } catch (e) {
      console.error(e);
    }
  }, [pengadaanList]);

  const handleOpenPengadaanModal = () => {
    setEditingPengadaan(null);
    setPengadaanForm({
      judulPengadaan: '',
      tanggalPengadaan: getTodayString(),
      tanggalDibuat: getTodayString(),
      status: 'Diajukan',
      keterangan: '',
      namaLab: '',
      alatSelection: '',
      namaAlat: '',
      merk: '',
      satuan: 'Unit',
      jumlah: 1,
      spesifikasi: '',
      link: '',
      harga: '',
      penguranganStock: 'Tidak'
    });
    setIsPengadaanModalOpen(true);
  };

  const handleEditPengadaan = (item: PengadaanAlatItem) => {
    setEditingPengadaan(item);
    let sel = '';
    if (item.alatId === 'Lainnya' || item.isAlatBaru) {
      sel = 'Lainnya';
    } else if (item.alatId) {
      sel = item.alatId;
    } else if (item.namaAlat) {
      const match = alatList.find((a) => a.namaAlat.toLowerCase() === item.namaAlat?.toLowerCase());
      sel = match ? match.id : 'Lainnya';
    }

    setPengadaanForm({
      judulPengadaan: item.judulPengadaan,
      tanggalPengadaan: item.tanggalPengadaan,
      tanggalDibuat: item.tanggalDibuat,
      status: item.status,
      keterangan: item.keterangan || '',
      namaLab: item.namaLab || '',
      alatSelection: sel,
      namaAlat: item.namaAlat || '',
      merk: item.merk || '',
      satuan: item.satuan || 'Unit',
      jumlah: item.jumlah ?? 1,
      spesifikasi: item.spesifikasi || '',
      link: item.link || '',
      harga: item.harga !== undefined ? item.harga : (item.anggaranEst || ''),
      penguranganStock: item.penguranganStock || 'Tidak'
    });
  };

  const handlePengadaanAlatSelectionChange = (val: string) => {
    if (val === 'Lainnya') {
      setPengadaanForm((prev) => ({
        ...prev,
        alatSelection: 'Lainnya',
        namaAlat: prev.alatSelection === 'Lainnya' ? prev.namaAlat : '',
        merk: prev.alatSelection === 'Lainnya' ? prev.merk : '',
        satuan: prev.alatSelection === 'Lainnya' && prev.satuan ? prev.satuan : 'Unit',
        jumlah: prev.jumlah || 1,
        spesifikasi: prev.alatSelection === 'Lainnya' ? prev.spesifikasi : '',
        link: prev.alatSelection === 'Lainnya' ? prev.link : '',
        harga: prev.alatSelection === 'Lainnya' ? prev.harga : '',
        penguranganStock: prev.alatSelection === 'Lainnya' ? prev.penguranganStock : 'Tidak'
      }));
    } else if (val) {
      const selected = alatList.find((a) => a.id === val);
      if (selected) {
        setPengadaanForm((prev) => ({
          ...prev,
          alatSelection: val,
          namaAlat: selected.namaAlat,
          merk: selected.merkTipe || '',
          satuan: selected.satuan || 'Unit',
          jumlah: prev.jumlah || 1,
          spesifikasi: selected.spesifikasiSingkat || '',
          link: selected.link || '',
          harga: selected.harga !== undefined ? selected.harga : prev.harga,
          penguranganStock: selected.penguranganStock || 'Tidak',
          namaLab: prev.namaLab || selected.namaLab
        }));
      }
    } else {
      setPengadaanForm((prev) => ({
        ...prev,
        alatSelection: '',
        namaAlat: '',
        merk: '',
        satuan: 'Unit',
        jumlah: 1,
        spesifikasi: '',
        link: '',
        harga: '',
        penguranganStock: 'Tidak'
      }));
    }
  };

  const handleDeletePengadaan = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data usulan pengadaan alat ini?')) {
      setPengadaanList((prev) => prev.filter((p) => p.id !== id));
      if (editingPengadaan?.id === id) {
        handleResetPengadaanForm();
      }
    }
  };

  const handleResetPengadaanForm = () => {
    setEditingPengadaan(null);
    setPengadaanForm({
      judulPengadaan: '',
      tanggalPengadaan: getTodayString(),
      tanggalDibuat: getTodayString(),
      status: 'Diajukan',
      keterangan: '',
      namaLab: '',
      alatSelection: '',
      namaAlat: '',
      merk: '',
      satuan: 'Unit',
      jumlah: 1,
      spesifikasi: '',
      link: '',
      harga: '',
      penguranganStock: 'Tidak'
    });
  };

  const handlePengadaanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengadaanForm.judulPengadaan.trim()) {
      alert('Judul Pengadaan wajib diisi.');
      return;
    }

    const isBaru = pengadaanForm.alatSelection === 'Lainnya';
    const numHarga = typeof pengadaanForm.harga === 'number' 
      ? pengadaanForm.harga 
      : (pengadaanForm.harga ? Number(pengadaanForm.harga) : undefined);

    const numJumlah = typeof pengadaanForm.jumlah === 'number'
      ? Math.max(1, pengadaanForm.jumlah)
      : (pengadaanForm.jumlah ? Math.max(1, Number(pengadaanForm.jumlah)) : 1);

    let finalNamaAlat = pengadaanForm.namaAlat.trim();
    let finalMerk = pengadaanForm.merk.trim();
    let finalSatuan = pengadaanForm.satuan.trim() || 'Unit';
    let finalSpesifikasi = pengadaanForm.spesifikasi.trim();
    let finalLink = pengadaanForm.link.trim();

    if (!isBaru && pengadaanForm.alatSelection) {
      const matched = alatList.find((a) => a.id === pengadaanForm.alatSelection);
      if (matched) {
        finalNamaAlat = matched.namaAlat;
        finalMerk = pengadaanForm.merk.trim() || matched.merkTipe || finalMerk;
        finalSatuan = pengadaanForm.satuan.trim() || matched.satuan || finalSatuan;
        finalSpesifikasi = pengadaanForm.spesifikasi.trim() || matched.spesifikasiSingkat || finalSpesifikasi;
        finalLink = pengadaanForm.link.trim() || matched.link || finalLink;
      }
    }

    const totalAnggaran = numHarga !== undefined ? numHarga * numJumlah : undefined;

    if (editingPengadaan) {
      setPengadaanList((prev) =>
        prev.map((p) =>
          p.id === editingPengadaan.id
            ? {
                ...p,
                judulPengadaan: pengadaanForm.judulPengadaan.trim(),
                tanggalPengadaan: pengadaanForm.tanggalPengadaan,
                tanggalDibuat: pengadaanForm.tanggalDibuat,
                status: pengadaanForm.status,
                keterangan: pengadaanForm.keterangan?.trim() || undefined,
                namaLab: pengadaanForm.namaLab || undefined,
                alatId: pengadaanForm.alatSelection || undefined,
                namaAlat: finalNamaAlat || undefined,
                isAlatBaru: isBaru,
                merk: finalMerk || undefined,
                satuan: finalSatuan || undefined,
                jumlah: numJumlah,
                spesifikasi: finalSpesifikasi || undefined,
                link: finalLink || undefined,
                harga: numHarga,
                anggaranEst: totalAnggaran,
                penguranganStock: pengadaanForm.penguranganStock
              }
            : p
        )
      );
      setEditingPengadaan(null);
    } else {
      const newItem: PengadaanAlatItem = {
        id: `pgd-${Date.now()}`,
        judulPengadaan: pengadaanForm.judulPengadaan.trim(),
        tanggalPengadaan: pengadaanForm.tanggalPengadaan,
        tanggalDibuat: pengadaanForm.tanggalDibuat,
        status: pengadaanForm.status,
        keterangan: pengadaanForm.keterangan?.trim() || undefined,
        namaLab: pengadaanForm.namaLab || undefined,
        alatId: pengadaanForm.alatSelection || undefined,
        namaAlat: finalNamaAlat || undefined,
        isAlatBaru: isBaru,
        merk: finalMerk || undefined,
        satuan: finalSatuan || undefined,
        jumlah: numJumlah,
        spesifikasi: finalSpesifikasi || undefined,
        link: finalLink || undefined,
        harga: numHarga,
        anggaranEst: totalAnggaran,
        penguranganStock: pengadaanForm.penguranganStock
      };
      setPengadaanList((prev) => [newItem, ...prev]);
    }

    handleResetPengadaanForm();
  };

  const [formData, setFormData] = useState<Partial<DataAlatItem> & { alatSelection?: string }>({
    alatSelection: 'Lainnya',
    kodeAlat: '',
    namaAlat: '',
    merkTipe: '',
    satuan: 'Unit',
    jumlahTotal: 1,
    jumlahTerpinjam: 0,
    jumlahTersedia: 1,
    labId: labList[0]?.id || '',
    namaLab: labList[0]?.namaLab || '',
    kondisi: 'Baik',
    statusKetersediaan: 'Tersedia',
    tahunPengadaan: new Date().getFullYear(),
    nomorInventarisBmn: '',
    spesifikasiSingkat: '',
    plpPj: '',
    gambarUrl: '',
    link: '',
    harga: undefined,
    penguranganStock: 'Tidak'
  });

  const canManage = currentRole === 'super_admin' || currentRole === 'admin';

  const filteredAlat = alatList.filter((item) => {
    const matchSearch =
      item.namaAlat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kodeAlat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.merkTipe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.satuan && item.satuan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.nomorInventarisBmn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plpPj.toLowerCase().includes(searchTerm.toLowerCase());

    const matchLab = selectedLab === 'all' || item.labId === selectedLab;
    const matchKondisi = selectedKondisi === 'all' || item.kondisi === selectedKondisi;
    return matchSearch && matchLab && matchKondisi;
  });

  const handleOpenAdd = () => {
    setEditingAlat(null);
    const defaultLab = labList[0];
    setFormData({
      alatSelection: 'Lainnya',
      kodeAlat: `ALT-${Date.now().toString().slice(-4)}`,
      namaAlat: '',
      merkTipe: '',
      satuan: 'Unit',
      jumlahTotal: 1,
      jumlahTerpinjam: 0,
      jumlahTersedia: 1,
      labId: defaultLab ? defaultLab.id : '',
      namaLab: defaultLab ? defaultLab.namaLab : '',
      kondisi: 'Baik',
      statusKetersediaan: 'Tersedia',
      tahunPengadaan: new Date().getFullYear(),
      nomorInventarisBmn: `INV-UB-${new Date().getFullYear()}-31010`,
      spesifikasiSingkat: '',
      plpPj: defaultLab ? defaultLab.plpPenanggungJawab : '',
      gambarUrl: '',
      link: '',
      harga: undefined,
      penguranganStock: 'Tidak'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (alat: DataAlatItem) => {
    setEditingAlat(alat);
    setFormData({
      ...alat,
      alatSelection: alat.alatSelection || alat.id,
      satuan: alat.satuan || 'Unit',
      jumlahTotal: alat.jumlahTotal ?? 1,
      jumlahTerpinjam: alat.jumlahTerpinjam ?? 0,
      jumlahTersedia: alat.jumlahTersedia ?? Math.max(0, (alat.jumlahTotal ?? 1) - (alat.jumlahTerpinjam ?? 0)),
      gambarUrl: alat.gambarUrl || '',
      link: alat.link || '',
      harga: alat.harga,
      penguranganStock: alat.penguranganStock || 'Tidak'
    });
    setIsModalOpen(true);
  };

  const handleTambahAlatSelectionChange = (val: string) => {
    if (val === 'Lainnya') {
      setFormData((prev) => ({
        ...prev,
        alatSelection: 'Lainnya',
        namaAlat: prev.alatSelection === 'Lainnya' ? prev.namaAlat : '',
        merkTipe: '',
        satuan: 'Unit',
        spesifikasiSingkat: '',
        link: '',
        harga: undefined,
        penguranganStock: 'Tidak'
      }));
    } else if (val) {
      const selected = alatList.find((a) => a.id === val);
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          alatSelection: val,
          namaAlat: selected.namaAlat,
          merkTipe: selected.merkTipe || '',
          satuan: selected.satuan || 'Unit',
          spesifikasiSingkat: selected.spesifikasiSingkat || '',
          labId: selected.labId || prev.labId,
          namaLab: selected.namaLab || prev.namaLab,
          plpPj: selected.plpPj || prev.plpPj,
          gambarUrl: selected.gambarUrl || prev.gambarUrl || '',
          link: selected.link || prev.link || '',
          harga: selected.harga !== undefined ? selected.harga : prev.harga,
          penguranganStock: selected.penguranganStock || 'Tidak'
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        alatSelection: '',
        namaAlat: '',
        merkTipe: '',
        satuan: 'Unit',
        spesifikasiSingkat: '',
        link: '',
        harga: undefined,
        penguranganStock: 'Tidak'
      }));
    }
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data instrumen: "${nama}"?`)) {
      setAlatList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaAlat || !formData.kodeAlat) {
      alert('Nama dan Kode Alat wajib diisi.');
      return;
    }

    const matchedLab = labList.find((l) => l.id === formData.labId);
    const resolvedLabNama = matchedLab ? matchedLab.namaLab : formData.namaLab || '';
    const resolvedPlp = matchedLab ? matchedLab.plpPenanggungJawab : formData.plpPj || '';

    const resolvedSatuan = formData.satuan?.trim() || 'Unit';
    const resolvedTotal = Number(formData.jumlahTotal ?? 1);
    const resolvedTerpinjam = Number(formData.jumlahTerpinjam ?? 0);
    const resolvedTersedia = Number(
      formData.jumlahTersedia ?? Math.max(0, resolvedTotal - resolvedTerpinjam)
    );

    if (editingAlat) {
      setAlatList((prev) =>
        prev.map((item) =>
          item.id === editingAlat.id
            ? ({
                ...item,
                ...formData,
                satuan: resolvedSatuan,
                jumlahTotal: resolvedTotal,
                jumlahTerpinjam: resolvedTerpinjam,
                jumlahTersedia: resolvedTersedia,
                namaLab: resolvedLabNama,
                plpPj: resolvedPlp,
                gambarUrl: formData.gambarUrl || '',
                link: formData.link?.trim() || undefined,
                harga: formData.harga,
                penguranganStock: formData.penguranganStock || 'Tidak',
                alatSelection: formData.alatSelection || item.id
              } as DataAlatItem)
            : item
        )
      );
    } else {
      // Penyesuaian jika memilih alat yang sudah ada
      if (formData.alatSelection && formData.alatSelection !== 'Lainnya') {
        const existing = alatList.find((a) => a.id === formData.alatSelection);
        if (existing) {
          const qtyInput = resolvedTotal;
          if (formData.penguranganStock === 'Ya') {
            const newTotal = Math.max(0, existing.jumlahTotal - qtyInput);
            const newTerpinjam = Math.min(existing.jumlahTerpinjam ?? 0, newTotal);
            const newTersedia = Math.max(0, newTotal - newTerpinjam);
            setAlatList((prev) =>
              prev.map((item) =>
                item.id === existing.id
                  ? {
                      ...item,
                      jumlahTotal: newTotal,
                      jumlahTerpinjam: newTerpinjam,
                      jumlahTersedia: newTersedia,
                      merkTipe: formData.merkTipe || item.merkTipe,
                      satuan: resolvedSatuan || item.satuan,
                      spesifikasiSingkat: formData.spesifikasiSingkat || item.spesifikasiSingkat,
                      link: formData.link?.trim() || item.link,
                      harga: formData.harga ?? item.harga,
                      penguranganStock: 'Ya',
                      gambarUrl: formData.gambarUrl || item.gambarUrl
                    }
                  : item
              )
            );
          } else {
            // Penambahan stok kuota unit alat yang sudah ada
            const newTotal = existing.jumlahTotal + qtyInput;
            const newTersedia = (existing.jumlahTersedia ?? 0) + qtyInput;
            setAlatList((prev) =>
              prev.map((item) =>
                item.id === existing.id
                  ? {
                      ...item,
                      jumlahTotal: newTotal,
                      jumlahTersedia: newTersedia,
                      merkTipe: formData.merkTipe || item.merkTipe,
                      satuan: resolvedSatuan || item.satuan,
                      spesifikasiSingkat: formData.spesifikasiSingkat || item.spesifikasiSingkat,
                      link: formData.link?.trim() || item.link,
                      harga: formData.harga ?? item.harga,
                      penguranganStock: 'Tidak',
                      gambarUrl: formData.gambarUrl || item.gambarUrl
                    }
                  : item
              )
            );
          }
          setIsModalOpen(false);
          return;
        }
      }

      // Alat baru (Lainnya)
      const newAlat: DataAlatItem = {
        id: `alt-${Date.now()}`,
        kodeAlat: formData.kodeAlat || `ALT-${Date.now().toString().slice(-4)}`,
        namaAlat: formData.namaAlat || 'Instrumen Laboratorium',
        merkTipe: formData.merkTipe || '-',
        satuan: resolvedSatuan,
        jumlahTotal: resolvedTotal,
        jumlahTerpinjam: resolvedTerpinjam,
        jumlahTersedia: resolvedTersedia,
        labId: formData.labId || (labList[0]?.id ?? ''),
        namaLab: resolvedLabNama,
        kondisi: (formData.kondisi as any) || 'Baik',
        statusKetersediaan: (formData.statusKetersediaan as any) || (resolvedTersedia > 0 ? 'Tersedia' : 'Sedang Dipinjam'),
        tahunPengadaan: Number(formData.tahunPengadaan) || new Date().getFullYear(),
        nomorInventarisBmn: formData.nomorInventarisBmn || `INV-UB-${Date.now().toString().slice(-6)}`,
        spesifikasiSingkat: formData.spesifikasiSingkat || '-',
        plpPj: resolvedPlp,
        gambarUrl: formData.gambarUrl || '',
        link: formData.link?.trim() || undefined,
        harga: formData.harga,
        penguranganStock: formData.penguranganStock || 'Tidak',
        alatSelection: 'Lainnya'
      };
      setAlatList((prev) => [...prev, newAlat]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama alat, kode, merk/seri, nomor inventaris, atau PLP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 focus:border-[#002B49]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 max-w-[200px]"
          >
            <option value="all">Semua Laboratorium</option>
            {labList.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.namaLab}
              </option>
            ))}
          </select>

          <select
            value={selectedKondisi}
            onChange={(e) => setSelectedKondisi(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="all">Semua Kondisi</option>
            <option value="Sangat Baik">Sangat Baik</option>
            <option value="Baik">Baik</option>
            <option value="Perlu Kalibrasi">Perlu Kalibrasi</option>
            <option value="Dalam Perbaikan">Dalam Perbaikan</option>
          </select>

          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002B49] text-white rounded-lg text-xs font-semibold hover:bg-[#002B49]/90 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Alat</span>
            </button>
          )}

          <button
            id="btn-toolbar-pengadaan"
            onClick={handleOpenPengadaanModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 shadow-xs transition-colors shrink-0 cursor-pointer"
            title="Pengadaan Alat Lab"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Pengadaan Alat Lab</span>
          </button>
        </div>
      </div>

      {/* Table of Instruments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Kode & Instrumen</th>
                <th className="py-3 px-4">Merk & Tipe</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">Satuan</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">Jml Total</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">Jml Terpinjam</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">Jml Tersedia</th>
                <th className="py-3 px-4">Laboratorium & PLP</th>
                <th className="py-3 px-4">Kondisi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlat.map((alat) => (
                <tr key={alat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {alat.gambarUrl ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs">
                          <img
                            src={alat.gambarUrl}
                            alt={alat.namaAlat}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                          <Microscope className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{alat.namaAlat}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{alat.kodeAlat}</span>
                          <span>•</span>
                          <span>No. Inv: {alat.nomorInventarisBmn}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <div className="font-medium text-slate-900">{alat.merkTipe || '-'}</div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span>Pengadaan: {alat.tahunPengadaan}</span>
                      {alat.harga !== undefined && alat.harga > 0 ? (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold font-mono">
                            Rp {alat.harga.toLocaleString('id-ID')}
                          </span>
                        </>
                      ) : null}
                      {alat.link ? (
                        <>
                          <span>•</span>
                          <a
                            href={alat.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 underline font-medium"
                            title="Buka Tautan / Katalog"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </>
                      ) : null}
                      {alat.penguranganStock === 'Ya' && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold text-[9px]">
                            Pengurangan Stock
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700 text-[11px]">
                      {alat.satuan || 'Unit'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-slate-800">
                    {alat.jumlahTotal ?? 1}
                  </td>
                  <td className="py-3 px-2 text-center whitespace-nowrap">
                    <span
                      className={`font-bold text-[11px] ${
                        (alat.jumlahTerpinjam || 0) > 0
                          ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {alat.jumlahTerpinjam ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center whitespace-nowrap">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        (alat.jumlahTersedia ?? 1) > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {alat.jumlahTersedia ?? Math.max(0, (alat.jumlahTotal ?? 1) - (alat.jumlahTerpinjam ?? 0))}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-medium text-slate-800 line-clamp-1">{alat.namaLab}</div>
                    <div className="text-[10px] text-slate-500">PJ: {alat.plpPj}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        alat.kondisi === 'Sangat Baik'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : alat.kondisi === 'Baik'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : alat.kondisi === 'Perlu Kalibrasi'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {alat.kondisi}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alat.statusKetersediaan === 'Tersedia'
                          ? 'bg-emerald-100 text-emerald-800'
                          : alat.statusKetersediaan === 'Sedang Dipinjam'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {alat.statusKetersediaan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {alat.statusKetersediaan === 'Tersedia' && onAjukanBonAlat && (
                        <button
                          onClick={() => onAjukanBonAlat(alat)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md font-semibold text-[10px] transition-colors flex items-center gap-1 mr-1"
                          title="Ajukan Bon Peminjaman Alat Ini"
                        >
                          <ClipboardList className="w-3 h-3" />
                          <span>Bon Alat</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAlatDetail(alat)}
                        className="p-1.5 text-slate-500 hover:text-[#002B49] hover:bg-slate-100 rounded-md"
                        title="Lihat Spesifikasi Lengkap"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {canManage && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(alat)}
                            className="p-1.5 text-slate-500 hover:text-[#002B49] hover:bg-slate-100 rounded-md"
                            title="Edit Alat"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(alat.id, alat.namaAlat)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Hapus Alat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAlat.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            Tidak ada data alat/instrumen yang sesuai filter pencarian.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAlatDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedAlatDetail.kodeAlat}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedAlatDetail.namaAlat}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlatDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAlatDetail.gambarUrl && (
              <div className="relative rounded-xl overflow-hidden h-44 w-full bg-slate-100 border border-slate-200 shadow-2xs">
                <img
                  src={selectedAlatDetail.gambarUrl}
                  alt={selectedAlatDetail.namaAlat}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium">
                  {selectedAlatDetail.namaLab}
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Merk & Tipe:</span>
                  <span className="font-semibold text-slate-800">{selectedAlatDetail.merkTipe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Satuan:</span>
                  <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedAlatDetail.satuan || 'Unit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah Total:</span>
                  <span className="font-bold text-slate-900">
                    {selectedAlatDetail.jumlahTotal ?? 1} {selectedAlatDetail.satuan || 'Unit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah Terpinjam:</span>
                  <span className="font-bold text-amber-600">
                    {selectedAlatDetail.jumlahTerpinjam ?? 0} {selectedAlatDetail.satuan || 'Unit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah Tersedia:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedAlatDetail.jumlahTersedia ?? Math.max(0, (selectedAlatDetail.jumlahTotal ?? 1) - (selectedAlatDetail.jumlahTerpinjam ?? 0))} {selectedAlatDetail.satuan || 'Unit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Laboratorium Penempatan:</span>
                  <span className="font-semibold text-slate-800">{selectedAlatDetail.namaLab}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nomor Inventaris:</span>
                  <span className="font-mono text-slate-700">{selectedAlatDetail.nomorInventarisBmn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kondisi Alat:</span>
                  <span className="font-bold text-emerald-700">{selectedAlatDetail.kondisi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Ketersediaan:</span>
                  <span className="font-bold text-indigo-700">{selectedAlatDetail.statusKetersediaan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pranata Lab (PLP PJ):</span>
                  <span className="font-semibold text-slate-800">{selectedAlatDetail.plpPj}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tahun Pengadaan:</span>
                  <span className="font-medium text-slate-700">{selectedAlatDetail.tahunPengadaan}</span>
                </div>
                {selectedAlatDetail.harga !== undefined && selectedAlatDetail.harga > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Harga / Nilai Pengadaan:</span>
                    <span className="font-bold text-emerald-800 font-mono">
                      Rp {selectedAlatDetail.harga.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                {selectedAlatDetail.link && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tautan Brosur / E-Katalog:</span>
                    <a
                      href={selectedAlatDetail.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      <span>Buka Link Produk</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {selectedAlatDetail.penguranganStock && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pengurangan Stock:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        selectedAlatDetail.penguranganStock === 'Ya'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {selectedAlatDetail.penguranganStock}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Spesifikasi & Kapabilitas Pengujian</span>
                <p className="p-3 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
                  {selectedAlatDetail.spesifikasiSingkat}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedAlatDetail(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingAlat ? 'Edit Data Alat Lab' : 'Tambah Alat Lab'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {editingAlat
                    ? 'Perbarui informasi dan spesifikasi alat laboratorium terdaftar'
                    : 'Pendaftaran dan pengelolaan instrumen laboratorium kimia'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kode Alat *</label>
                  <input
                    type="text"
                    required
                    value={formData.kodeAlat}
                    onChange={(e) => setFormData({ ...formData, kodeAlat: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                    placeholder="Contoh: ALT-ANL-004"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tahun Pengadaan</label>
                  <input
                    type="number"
                    value={formData.tahunPengadaan}
                    onChange={(e) => setFormData({ ...formData, tahunPengadaan: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Pemilih Nama Alat / Instrumen (Alat yang Sudah Ada & Lainnya untuk Alat Baru) */}
              <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="block text-slate-800 font-bold flex items-center gap-1.5">
                    <Microscope className="w-3.5 h-3.5 text-[#002B49]" />
                    <span>Nama Alat / Instrumen *</span>
                  </label>
                  {formData.alatSelection === 'Lainnya' ? (
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Alat Baru (Lainnya)
                    </span>
                  ) : formData.alatSelection ? (
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                      Alat Sudah Ada
                    </span>
                  ) : null}
                </div>

                <div>
                  <select
                    value={formData.alatSelection || 'Lainnya'}
                    onChange={(e) => handleTambahAlatSelectionChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 focus:border-[#002B49]"
                  >
                    <option value="">-- Pilih dari Alat yang Sudah Ada atau Pilih Lainnya --</option>
                    <optgroup label="── DAFTAR ALAT YANG SUDAH ADA ──">
                      {alatList.map((alat) => (
                        <option key={alat.id} value={alat.id}>
                          {alat.namaAlat} [{alat.kodeAlat}] - {alat.merkTipe || 'Lab'} ({alat.namaLab})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="── ALAT BARU ──">
                      <option value="Lainnya">➕ Lainnya (Form Input Alat Baru)</option>
                    </optgroup>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pilih alat dari daftar yang sudah ada untuk penyesuaian/stok, atau pilih{' '}
                    <strong className="text-[#002B49]">"Lainnya"</strong> untuk menginput rincian alat baru.
                  </p>
                </div>

                {/* Sub-form: Jika memilih Lainnya (Alat Baru) */}
                {formData.alatSelection === 'Lainnya' && (
                  <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-3 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 border-b border-emerald-200/80 pb-2">
                      <PackagePlus className="w-4 h-4 text-emerald-700" />
                      <span>Form Input Alat Baru (Lainnya)</span>
                    </div>

                    {/* Nama Alat */}
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Nama Alat *</label>
                      <input
                        type="text"
                        required
                        value={formData.namaAlat || ''}
                        onChange={(e) => setFormData({ ...formData, namaAlat: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
                        placeholder="Contoh: Spektrofotometer UV-Vis Double Beam"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Merk */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1">Merk</label>
                        <input
                          type="text"
                          value={formData.merkTipe || ''}
                          onChange={(e) => setFormData({ ...formData, merkTipe: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                          placeholder="Contoh: Shimadzu / Agilent / Thermo"
                        />
                      </div>

                      {/* Satuan */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1">Satuan</label>
                        <select
                          value={formData.satuan || 'Unit'}
                          onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                        >
                          <option value="Unit">Unit</option>
                          <option value="Set">Set</option>
                          <option value="Buah">Buah</option>
                          <option value="Pcs">Pcs</option>
                          <option value="Paket">Paket</option>
                        </select>
                      </div>
                    </div>

                    {/* Spesifikasi */}
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Spesifikasi</label>
                      <textarea
                        rows={2}
                        value={formData.spesifikasiSingkat || ''}
                        onChange={(e) => setFormData({ ...formData, spesifikasiSingkat: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white resize-y"
                        placeholder="Kapasitas, rentang pengukuran, batas akurasi deteksi, daya listrik..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Link */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>Link (Tautan Brosur / E-Katalog)</span>
                        </label>
                        <input
                          type="url"
                          value={formData.link || ''}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                          placeholder="https://e-katalog.lkpp.go.id/..."
                        />
                      </div>

                      {/* Harga */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span>Harga (Estimasi / Satuan Rp)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.harga ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              harga: e.target.value === '' ? undefined : Number(e.target.value)
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                          placeholder="Contoh: 150000000"
                        />
                        {typeof formData.harga === 'number' && formData.harga > 0 && (
                          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                            Rp {formData.harga.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pengurangan Stock (dengan opsi Ya atau Tidak) */}
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1.5">
                        Pengurangan Stock
                      </label>
                      <div className="flex flex-wrap items-center gap-5 pt-0.5 bg-white p-2.5 rounded-lg border border-emerald-200">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-medium">
                          <input
                            type="radio"
                            name="penguranganStockAlatBaru"
                            value="Ya"
                            checked={formData.penguranganStock === 'Ya'}
                            onChange={() => setFormData({ ...formData, penguranganStock: 'Ya' })}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                          <span>Ya (Pengurangan stok / pengganti unit rusak)</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-medium">
                          <input
                            type="radio"
                            name="penguranganStockAlatBaru"
                            value="Tidak"
                            checked={formData.penguranganStock === 'Tidak'}
                            onChange={() => setFormData({ ...formData, penguranganStock: 'Tidak' })}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                          <span>Tidak (Penambahan kuota / aset baru)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form: Jika memilih Alat yang Sudah Ada */}
                {formData.alatSelection && formData.alatSelection !== 'Lainnya' && (
                  <div className="bg-white p-3.5 rounded-xl border border-blue-200 space-y-3 mt-2 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <Microscope className="w-4 h-4 text-blue-700" />
                        <span>Data Alat Terdaftar: {formData.namaAlat}</span>
                      </div>
                      <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                        Alat Sudah Ada
                      </span>
                    </div>

                    {/* Nama Alat */}
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Nama Alat</label>
                      <input
                        type="text"
                        required
                        value={formData.namaAlat || ''}
                        onChange={(e) => setFormData({ ...formData, namaAlat: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-slate-50 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Merk */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1">Merk / Model</label>
                        <input
                          type="text"
                          value={formData.merkTipe || ''}
                          onChange={(e) => setFormData({ ...formData, merkTipe: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                          placeholder="Merk alat"
                        />
                      </div>

                      {/* Satuan */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1">Satuan</label>
                        <select
                          value={formData.satuan || 'Unit'}
                          onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                        >
                          <option value="Unit">Unit</option>
                          <option value="Set">Set</option>
                          <option value="Buah">Buah</option>
                          <option value="Pcs">Pcs</option>
                          <option value="Paket">Paket</option>
                        </select>
                      </div>
                    </div>

                    {/* Spesifikasi */}
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Spesifikasi</label>
                      <textarea
                        rows={2}
                        value={formData.spesifikasiSingkat || ''}
                        onChange={(e) => setFormData({ ...formData, spesifikasiSingkat: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white resize-y"
                        placeholder="Spesifikasi teknis alat..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Link */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>Link (Tautan Brosur / E-Katalog)</span>
                        </label>
                        <input
                          type="url"
                          value={formData.link || ''}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                          placeholder="https://..."
                        />
                      </div>

                      {/* Harga */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <span>Harga (Estimasi / Satuan Rp)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.harga ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              harga: e.target.value === '' ? undefined : Number(e.target.value)
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                          placeholder="Contoh: 150000000"
                        />
                        {typeof formData.harga === 'number' && formData.harga > 0 && (
                          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                            Rp {formData.harga.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pengurangan Stock (dengan opsi Ya atau Tidak) */}
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1.5">
                        Pengurangan Stock
                      </label>
                      <div className="flex flex-wrap items-center gap-5 pt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-medium">
                          <input
                            type="radio"
                            name="penguranganStockExistingAlat"
                            value="Ya"
                            checked={formData.penguranganStock === 'Ya'}
                            onChange={() => setFormData({ ...formData, penguranganStock: 'Ya' })}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                          <span>Ya (Mengurangi stok unit alat ini / afkir unit rusak)</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-medium">
                          <input
                            type="radio"
                            name="penguranganStockExistingAlat"
                            value="Tidak"
                            checked={formData.penguranganStock === 'Tidak'}
                            onChange={() => setFormData({ ...formData, penguranganStock: 'Tidak' })}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                          <span>Tidak (Menambah stok kuota alat ini)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Picture (Foto / Gambar Instrumen Lab) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Picture (Foto Instrumen)
                </label>
                <div className="space-y-2">
                  {formData.gambarUrl ? (
                    <div className="relative flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <img
                        src={formData.gambarUrl}
                        alt="Preview Instrumen"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0 bg-white"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          Foto Instrumen Terpilih
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {formData.gambarUrl.startsWith('data:') ? 'File Gambar Lokal Diunggah' : formData.gambarUrl}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gambarUrl: '' })}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus / Ganti Foto</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setFormData({ ...formData, gambarUrl: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-[#002B49]/40 rounded-xl p-3.5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="file"
                        id="alat-picture-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setFormData({ ...formData, gambarUrl: reader.result });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="alat-picture-input"
                        className="cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-700"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          Upload file foto (Drag & Drop atau Klik untuk memilih)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Mendukung file gambar PNG, JPG, JPEG, WEBP
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={formData.gambarUrl?.startsWith('data:') ? '' : formData.gambarUrl || ''}
                      onChange={(e) => setFormData({ ...formData, gambarUrl: e.target.value })}
                      placeholder="Atau masukkan tautan URL gambar web (opsional)..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Fields: Satuan, Jumlah Total, Jumlah Terpinjam, Jumlah Tersedia */}
              <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2.5">
                <div className="text-[11px] font-bold text-[#002B49] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-[#002B49]" />
                    <span>Kuantitas & Ketersediaan Alat</span>
                  </div>
                  {formData.penguranganStock === 'Ya' && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Mode Pengurangan Stock
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Satuan *</label>
                    <input
                      type="text"
                      required
                      value={formData.satuan || 'Unit'}
                      onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:ring-1 focus:ring-[#002B49]"
                      placeholder="Unit / Set / Pcs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      {formData.penguranganStock === 'Ya' && formData.alatSelection && formData.alatSelection !== 'Lainnya'
                        ? 'Jml Pengurangan *'
                        : 'Jumlah Total *'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.jumlahTotal ?? 1}
                      onChange={(e) => {
                        const total = Math.max(0, parseInt(e.target.value) || 0);
                        const terpinjam = formData.jumlahTerpinjam ?? 0;
                        const sedia = Math.max(0, total - terpinjam);
                        setFormData({
                          ...formData,
                          jumlahTotal: total,
                          jumlahTersedia: sedia,
                          statusKetersediaan: sedia > 0 ? (terpinjam > 0 ? 'Sedang Dipinjam' : 'Tersedia') : 'Sedang Dipinjam'
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-900 focus:ring-1 focus:ring-[#002B49]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Jumlah Terpinjam</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.jumlahTerpinjam ?? 0}
                      onChange={(e) => {
                        const terpinjam = Math.max(0, parseInt(e.target.value) || 0);
                        const total = formData.jumlahTotal ?? 1;
                        const sedia = Math.max(0, total - terpinjam);
                        setFormData({
                          ...formData,
                          jumlahTerpinjam: terpinjam,
                          jumlahTersedia: sedia,
                          statusKetersediaan: sedia > 0 ? (terpinjam > 0 ? 'Sedang Dipinjam' : 'Tersedia') : 'Sedang Dipinjam'
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-amber-700 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Jumlah Tersedia</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.jumlahTersedia ?? Math.max(0, (formData.jumlahTotal ?? 1) - (formData.jumlahTerpinjam ?? 0))}
                      onChange={(e) => {
                        const sedia = Math.max(0, parseInt(e.target.value) || 0);
                        setFormData({
                          ...formData,
                          jumlahTersedia: sedia,
                          statusKetersediaan: sedia > 0 ? 'Tersedia' : 'Sedang Dipinjam'
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs bg-emerald-50 font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Laboratorium Penempatan *</label>
                <select
                  value={formData.labId}
                  onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  {labList.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.namaLab} ({lab.kodeLab})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kondisi Alat</label>
                  <select
                    value={formData.kondisi}
                    onChange={(e) => setFormData({ ...formData, kondisi: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Perlu Kalibrasi">Perlu Kalibrasi</option>
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Ketersediaan</label>
                  <select
                    value={formData.statusKetersediaan}
                    onChange={(e) => setFormData({ ...formData, statusKetersediaan: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Sedang Dipinjam">Sedang Dipinjam</option>
                    <option value="Terjadwal">Terjadwal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor Inventaris</label>
                <input
                  type="text"
                  value={formData.nomorInventarisBmn}
                  onChange={(e) => setFormData({ ...formData, nomorInventarisBmn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  placeholder="INV-UB-2024-31010..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] text-white rounded-lg font-semibold hover:bg-[#002B49]/90 shadow-xs transition-colors"
                >
                  {editingAlat ? 'Simpan Perubahan' : 'Tambah Alat Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pengadaan Alat Lab */}
      {isPengadaanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pengadaan Alat Lab
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Formulir Usulan & Riwayat Pengadaan Instrumen Laboratorium Departemen Kimia
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPengadaanModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Input Pengadaan Lab */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {editingPengadaan ? 'Edit Usulan Pengadaan' : 'Form Input Pengadaan Lab'}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Formulir usulan pengadaan instrumen baru / paket alat laboratorium
                      </p>
                    </div>
                  </div>
                  {editingPengadaan && (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Mode Pengubahan
                    </span>
                  )}
                </div>

                <form onSubmit={handlePengadaanSubmit} className="space-y-3.5 text-xs">
                  {/* 1. Judul Pengadaan */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Judul Pengadaan *
                    </label>
                    <input
                      type="text"
                      required
                      value={pengadaanForm.judulPengadaan}
                      onChange={(e) => setPengadaanForm({ ...pengadaanForm, judulPengadaan: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 font-medium"
                      placeholder="Contoh: Pengadaan Spektrofotometer UV-Vis Double Beam TA 2024/2025"
                    />
                  </div>

                  {/* 2. Nama Alat (berisi list alat yang sudah ada dan Lainnya untuk alat baru) */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Nama Alat *
                    </label>
                    <select
                      required
                      value={pengadaanForm.alatSelection}
                      onChange={(e) => handlePengadaanAlatSelectionChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 font-medium"
                    >
                      <option value="">-- Pilih Nama Alat / Usulan Baru --</option>
                      <optgroup label="Alat yang Sudah Ada">
                        {alatList.map((alat) => (
                          <option key={alat.id} value={alat.id}>
                            {alat.namaAlat} {alat.merkTipe ? `(${alat.merkTipe})` : ''} - {alat.namaLab}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Alat Baru">
                        <option value="Lainnya">+ Lainnya (Alat Baru)</option>
                      </optgroup>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Pilih instrumen dari alat yang sudah ada atau pilih <strong>Lainnya</strong> untuk mengusulkan pengadaan alat baru.
                    </p>
                  </div>

                  {/* Sub-form saat memilih 'Lainnya' (Alat Baru) */}
                  {pengadaanForm.alatSelection === 'Lainnya' && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                          <PackagePlus className="w-4 h-4 text-emerald-700" />
                          <span>Form Input Alat Baru (Lainnya)</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                          Alat Baru
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Nama Alat */}
                        <div className="sm:col-span-2 md:col-span-1">
                          <label className="block text-slate-700 font-semibold mb-1">
                            Nama Alat *
                          </label>
                          <input
                            type="text"
                            required
                            value={pengadaanForm.namaAlat}
                            onChange={(e) => setPengadaanForm({ ...pengadaanForm, namaAlat: e.target.value })}
                            placeholder="Contoh: Spektrofotometer FT-IR"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
                          />
                        </div>

                        {/* Merk */}
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">
                            Merk
                          </label>
                          <input
                            type="text"
                            value={pengadaanForm.merk}
                            onChange={(e) => setPengadaanForm({ ...pengadaanForm, merk: e.target.value })}
                            placeholder="Contoh: Thermo Fisher / Shimadzu"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                          />
                        </div>

                        {/* Satuan */}
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">
                            Satuan
                          </label>
                          <input
                            type="text"
                            value={pengadaanForm.satuan}
                            onChange={(e) => setPengadaanForm({ ...pengadaanForm, satuan: e.target.value })}
                            placeholder="Unit / Set / Paket / Pcs"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                          />
                        </div>

                        {/* Jumlah */}
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">
                            Jumlah *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={pengadaanForm.jumlah}
                            onChange={(e) =>
                              setPengadaanForm({
                                ...pengadaanForm,
                                jumlah: e.target.value === '' ? '' : Math.max(1, Number(e.target.value))
                              })
                            }
                            placeholder="1"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                          />
                        </div>

                        {/* Harga Satuan */}
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">
                            Harga Satuan (Rp)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                              Rp
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={pengadaanForm.harga}
                              onChange={(e) =>
                                setPengadaanForm({
                                  ...pengadaanForm,
                                  harga: e.target.value === '' ? '' : Number(e.target.value)
                                })
                              }
                              placeholder="0"
                              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                            />
                          </div>
                        </div>

                        {/* Pengurangan Stock */}
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">
                            Pengurangan Stock
                          </label>
                          <select
                            value={pengadaanForm.penguranganStock}
                            onChange={(e) =>
                              setPengadaanForm({
                                ...pengadaanForm,
                                penguranganStock: e.target.value as 'Ya' | 'Tidak'
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                          >
                            <option value="Tidak">Tidak</option>
                            <option value="Ya">Ya</option>
                          </select>
                        </div>
                      </div>

                      {/* Spesifikasi */}
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Spesifikasi
                        </label>
                        <textarea
                          rows={2}
                          value={pengadaanForm.spesifikasi}
                          onChange={(e) => setPengadaanForm({ ...pengadaanForm, spesifikasi: e.target.value })}
                          placeholder="Spesifikasi teknis alat baru, rentang pengukuran, modul, aksesoris bawaan..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 resize-y"
                        />
                      </div>

                      {/* Link */}
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Link (Katalog / Vendor)
                        </label>
                        <div className="relative">
                          <ExternalLink className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={pengadaanForm.link}
                            onChange={(e) => setPengadaanForm({ ...pengadaanForm, link: e.target.value })}
                            placeholder="https://... (Link katalog, website vendor, atau brosur)"
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detail saat memilih Alat yang Sudah Ada */}
                  {pengadaanForm.alatSelection && pengadaanForm.alatSelection !== 'Lainnya' && (() => {
                    const selectedTool = alatList.find((a) => a.id === pengadaanForm.alatSelection);
                    if (!selectedTool) return null;
                    return (
                      <div className="bg-blue-50/70 border border-blue-200/90 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              <Microscope className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900">
                                {selectedTool.namaAlat} {selectedTool.merkTipe ? `(${selectedTool.merkTipe})` : ''}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Kode: {selectedTool.kodeAlat} • BMN: {selectedTool.nomorInventarisBmn}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                            Alat Terdaftar
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600 border-t border-blue-100/80">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Laboratorium:</span>
                            <span className="font-semibold text-slate-800">{selectedTool.namaLab}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Stok Tersedia:</span>
                            <span className="font-bold text-emerald-700">
                              {selectedTool.jumlahTersedia ?? 1} {selectedTool.satuan || 'Unit'}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">
                              (Total: {selectedTool.jumlahTotal ?? 1})
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Kondisi Alat:</span>
                            <span className="font-semibold text-slate-700">{selectedTool.kondisi}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">PLP P.J:</span>
                            <span className="font-semibold text-slate-700">{selectedTool.plpPj || '-'}</span>
                          </div>
                        </div>

                        {/* Rincian Merk, Satuan, Spesifikasi, Jumlah, Harga */}
                        <div className="pt-2.5 border-t border-blue-100 space-y-2.5">
                          <div className="text-[11px] font-bold text-slate-800">
                            Rincian Pengadaan (Merk, Satuan, Spesifikasi & Jumlah):
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Merk */}
                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">
                                Merk
                              </label>
                              <input
                                type="text"
                                value={pengadaanForm.merk}
                                onChange={(e) => setPengadaanForm({ ...pengadaanForm, merk: e.target.value })}
                                placeholder="Merk / Tipe"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                              />
                            </div>

                            {/* Satuan */}
                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">
                                Satuan
                              </label>
                              <input
                                type="text"
                                value={pengadaanForm.satuan}
                                onChange={(e) => setPengadaanForm({ ...pengadaanForm, satuan: e.target.value })}
                                placeholder="Unit / Set"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                              />
                            </div>

                            {/* Jumlah */}
                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">
                                Jumlah *
                              </label>
                              <input
                                type="number"
                                min="1"
                                required
                                value={pengadaanForm.jumlah}
                                onChange={(e) =>
                                  setPengadaanForm({
                                    ...pengadaanForm,
                                    jumlah: e.target.value === '' ? '' : Math.max(1, Number(e.target.value))
                                  })
                                }
                                placeholder="1"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono font-bold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                              />
                            </div>

                            {/* Estimasi Harga Satuan (Rp) */}
                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">
                                Harga Satuan (Rp)
                              </label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                                  Rp
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  value={pengadaanForm.harga}
                                  onChange={(e) =>
                                    setPengadaanForm({
                                      ...pengadaanForm,
                                      harga: e.target.value === '' ? '' : Number(e.target.value)
                                    })
                                  }
                                  placeholder="0"
                                  className="w-full pl-7 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Spesifikasi */}
                          <div>
                            <label className="block text-slate-700 font-semibold mb-1">
                              Spesifikasi
                            </label>
                            <textarea
                              rows={2}
                              value={pengadaanForm.spesifikasi}
                              onChange={(e) => setPengadaanForm({ ...pengadaanForm, spesifikasi: e.target.value })}
                              placeholder="Spesifikasi teknis alat yang akan diadakan..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-y"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Pengurangan Stock */}
                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">
                                Pengurangan Stock
                              </label>
                              <select
                                value={pengadaanForm.penguranganStock}
                                onChange={(e) =>
                                  setPengadaanForm({
                                    ...pengadaanForm,
                                    penguranganStock: e.target.value as 'Ya' | 'Tidak'
                                  })
                                }
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                              >
                                <option value="Tidak">Tidak</option>
                                <option value="Ya">Ya</option>
                              </select>
                            </div>

                            {/* Link */}
                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">
                                Link (Katalog / Vendor)
                              </label>
                              <div className="relative">
                                <ExternalLink className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  value={pengadaanForm.link}
                                  onChange={(e) => setPengadaanForm({ ...pengadaanForm, link: e.target.value })}
                                  placeholder="https://... (Link katalog atau brosur)"
                                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {!pengadaanForm.alatSelection && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-800 text-[11px] flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Pilih opsi pada dropdown <strong>Nama Alat</strong> di atas untuk melengkapi data <strong>Merk</strong>, <strong>Satuan</strong>, <strong>Spesifikasi</strong>, dan <strong>Jumlah</strong> pengadaan.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 3. Tanggal Pengadaan */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tanggal Pengadaan *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={pengadaanForm.tanggalPengadaan}
                        onChange={(e) => setPengadaanForm({ ...pengadaanForm, tanggalPengadaan: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>

                    {/* 4. Tanggal Dibuat */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tanggal Dibuat *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={pengadaanForm.tanggalDibuat}
                        onChange={(e) => setPengadaanForm({ ...pengadaanForm, tanggalDibuat: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>

                    {/* 5. Status */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Status *
                      </label>
                      <select
                        value={pengadaanForm.status}
                        onChange={(e) => setPengadaanForm({ ...pengadaanForm, status: e.target.value as StatusPengadaanAlat })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Diajukan">Diajukan</option>
                        <option value="Dalam Proses">Dalam Proses</option>
                        <option value="Disetujui">Disetujui</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Laboratorium Penempatan (Opsional)
                      </label>
                      <select
                        value={pengadaanForm.namaLab || ''}
                        onChange={(e) => setPengadaanForm({ ...pengadaanForm, namaLab: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="">-- Pilih Laboratorium (Opsional) --</option>
                        {labList.map((lab) => (
                          <option key={lab.id} value={lab.namaLab}>
                            {lab.namaLab}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Keterangan / Justifikasi (Opsional)
                      </label>
                      <input
                        type="text"
                        value={pengadaanForm.keterangan || ''}
                        onChange={(e) => setPengadaanForm({ ...pengadaanForm, keterangan: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                        placeholder="Urgensi riset, peruntukan lab, catatan pengadaan..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    {editingPengadaan && (
                      <button
                        type="button"
                        onClick={handleResetPengadaanForm}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Batal Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingPengadaan ? 'Update Pengadaan' : 'Simpan Pengadaan'}</span>
                    </button>
                  </div>
                </form>
              </div>

            {/* Table Section: Daftar & Riwayat Pengadaan */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">
                  Daftar Usulan & Riwayat Pengadaan ({pengadaanList.length})
                </h4>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <th className="py-2.5 px-3">Judul Pengadaan & Instrumen</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Tgl Pengadaan</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Tgl Dibuat</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pengadaanList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                            Belum ada usulan pengadaan alat laboratorium. Silakan gunakan form di atas untuk menambahkan.
                          </td>
                        </tr>
                      ) : (
                        pengadaanList.map((item) => (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              editingPengadaan?.id === item.id ? 'bg-emerald-50/50' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900">{item.judulPengadaan}</span>
                                {item.isAlatBaru || item.alatId === 'Lainnya' ? (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                    Alat Baru (Lainnya)
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-blue-100 text-blue-800 font-medium px-1.5 py-0.5 rounded">
                                    Alat Terdaftar
                                  </span>
                                )}
                              </div>
                              {item.namaAlat && (
                                <div className="text-[11px] text-slate-700 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span>Alat: <strong>{item.namaAlat}</strong></span>
                                  {item.merk && <span className="text-slate-500 font-normal">({item.merk})</span>}
                                  <span className="text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 text-[10px]">
                                    Jumlah: {item.jumlah ?? 1} {item.satuan || 'Unit'}
                                  </span>
                                  {item.harga !== undefined && item.harga !== null && item.harga !== '' && Number(item.harga) > 0 && (
                                    <span className="text-slate-700 font-mono text-[10px]">
                                      • Rp {Number(item.harga).toLocaleString('id-ID')} / {item.satuan || 'Unit'}
                                      {item.jumlah && item.jumlah > 1 && (
                                        <span className="text-emerald-700 font-bold ml-1">
                                          (Total: Rp {(Number(item.harga) * item.jumlah).toLocaleString('id-ID')})
                                        </span>
                                      )}
                                    </span>
                                  )}
                                  {item.penguranganStock && (
                                    <span
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                        item.penguranganStock === 'Ya'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      Kurangi Stok: {item.penguranganStock}
                                    </span>
                                  )}
                                </div>
                              )}
                              {item.spesifikasi && (
                                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                  <span className="font-medium text-slate-600">Spek:</span> {item.spesifikasi}
                                </div>
                              )}
                              {item.link && (
                                <div className="text-[10px] text-blue-600 mt-0.5 flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <a
                                    href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline truncate max-w-xs"
                                  >
                                    {item.link}
                                  </a>
                                </div>
                              )}
                              {item.keterangan && (
                                <div className="text-[10px] text-slate-500 mt-0.5 italic">{item.keterangan}</div>
                              )}
                              {item.namaLab && (
                                <div className="text-[10px] text-slate-400 mt-0.5">{item.namaLab}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                              {item.tanggalPengadaan}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                              {item.tanggalDibuat}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                  item.status === 'Disetujui'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.status === 'Dalam Proses'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.status === 'Diajukan'
                                    ? 'bg-amber-100 text-amber-800'
                                    : item.status === 'Selesai'
                                    ? 'bg-purple-100 text-purple-800'
                                    : item.status === 'Ditolak'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditPengadaan(item)}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-[#002B49] hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Edit Usulan"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePengadaan(item.id)}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus Usulan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPengadaanModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
