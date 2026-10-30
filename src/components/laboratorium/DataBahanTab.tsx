import React, { useState } from 'react';
import { DataBahanItem, DataLaboratoriumItem, UserRole } from '../../types/sikma';
import {
  TestTube2,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Flame,
  Skull,
  FileSpreadsheet,
  X,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  Tag
} from 'lucide-react';

interface DataBahanTabProps {
  bahanList: DataBahanItem[];
  setBahanList: React.Dispatch<React.SetStateAction<DataBahanItem[]>>;
  labList: DataLaboratoriumItem[];
  currentRole: UserRole;
  onAjukanBonBahan?: (bahan: DataBahanItem) => void;
  selectedLabFilter?: string;
}

export const DataBahanTab: React.FC<DataBahanTabProps> = ({
  bahanList,
  setBahanList,
  labList,
  currentRole,
  onAjukanBonBahan,
  selectedLabFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState<string>(selectedLabFilter || 'all');

  React.useEffect(() => {
    if (selectedLabFilter) {
      setSelectedLab(selectedLabFilter);
    }
  }, [selectedLabFilter]);
  const [selectedBahaya, setSelectedBahaya] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBahan, setEditingBahan] = useState<DataBahanItem | null>(null);

  const [formData, setFormData] = useState<Partial<DataBahanItem> & { harga?: number | '' }>({
    kodeBahan: '',
    namaBahan: '',
    rumusKimia: '',
    casNumber: '',
    grade: 'Pro Analysis (PA)',
    labId: labList[0]?.id || '',
    namaLab: labList[0]?.namaLab || '',
    stok: 1000,
    satuan: 'mL',
    stokMinimum: 500,
    statusStok: 'Aman',
    kategoriBahaya: 'Mudah Terbakar',
    lokasiPenyimpanan: '',
    merek: '',
    harga: '',
    linkRujukan: '',
    status: 'Aktif'
  });

  const canManage = currentRole === 'super_admin' || currentRole === 'admin';

  const filteredBahan = bahanList.filter((item) => {
    const matchSearch =
      item.namaBahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kodeBahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rumusKimia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.casNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.merek && item.merek.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.lokasiPenyimpanan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchLab = selectedLab === 'all' || item.labId === selectedLab;
    const matchBahaya = selectedBahaya === 'all' || item.kategoriBahaya === selectedBahaya;
    const matchStatus = selectedStatus === 'all' || (item.status || 'Aktif') === selectedStatus;
    return matchSearch && matchLab && matchBahaya && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingBahan(null);
    const defaultLab = labList[0];
    setFormData({
      kodeBahan: `BHN-${Date.now().toString().slice(-4)}`,
      namaBahan: '',
      rumusKimia: '',
      casNumber: '',
      grade: 'Pro Analysis (PA)',
      labId: defaultLab ? defaultLab.id : '',
      namaLab: defaultLab ? defaultLab.namaLab : '',
      stok: 1000,
      satuan: 'mL',
      stokMinimum: 500,
      statusStok: 'Aman',
      kategoriBahaya: 'Mudah Terbakar',
      lokasiPenyimpanan: defaultLab ? `Gedung Kimia ${defaultLab.lantai}` : 'Gedung Kimia',
      merek: '',
      harga: '',
      linkRujukan: '',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bahan: DataBahanItem) => {
    setEditingBahan(bahan);
    setFormData({
      ...bahan,
      merek: bahan.merek || '',
      harga: bahan.harga !== undefined ? bahan.harga : '',
      linkRujukan: bahan.linkRujukan || '',
      status: bahan.status || 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data bahan: "${nama}"?`)) {
      setBahanList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleQuickAdjustStock = (id: string, delta: number) => {
    setBahanList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stok + delta);
          const newStatus: DataBahanItem['statusStok'] =
            newStock === 0
              ? 'Habis'
              : newStock <= item.stokMinimum
              ? 'Menipis'
              : 'Aman';
          return {
            ...item,
            stok: newStock,
            statusStok: newStatus
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBahan || !formData.kodeBahan) {
      alert('Nama dan Kode Bahan wajib diisi.');
      return;
    }

    const matchedLab = labList.find((l) => l.id === formData.labId);
    const resolvedLabNama = matchedLab ? matchedLab.namaLab : formData.namaLab || '';

    const stokNum = Number(formData.stok) || 0;
    const minNum = Number(formData.stokMinimum) || 0;
    const computedStatus: DataBahanItem['statusStok'] =
      stokNum === 0 ? 'Habis' : stokNum <= minNum ? 'Menipis' : 'Aman';

    const numHarga = formData.harga !== '' && formData.harga !== undefined ? Number(formData.harga) : undefined;
    const finalMerek = formData.merek?.trim() || undefined;
    const finalLink = formData.linkRujukan?.trim() || undefined;
    const finalStatus = formData.status || 'Aktif';

    if (editingBahan) {
      setBahanList((prev) =>
        prev.map((item) =>
          item.id === editingBahan.id
            ? ({
                ...item,
                ...formData,
                stok: stokNum,
                stokMinimum: minNum,
                statusStok: computedStatus,
                namaLab: resolvedLabNama,
                merek: finalMerek,
                harga: numHarga,
                linkRujukan: finalLink,
                status: finalStatus
              } as DataBahanItem)
            : item
        )
      );
    } else {
      const newBahan: DataBahanItem = {
        id: `bhn-${Date.now()}`,
        kodeBahan: formData.kodeBahan || `BHN-${Date.now().toString().slice(-4)}`,
        namaBahan: formData.namaBahan || 'Bahan Kimia Baru',
        rumusKimia: formData.rumusKimia || '-',
        casNumber: formData.casNumber || '-',
        grade: (formData.grade as any) || 'Pro Analysis (PA)',
        labId: formData.labId || (labList[0]?.id ?? ''),
        namaLab: resolvedLabNama,
        stok: stokNum,
        satuan: (formData.satuan as any) || 'mL',
        stokMinimum: minNum,
        statusStok: computedStatus,
        kategoriBahaya: (formData.kategoriBahaya as any) || 'Iritan',
        lokasiPenyimpanan: formData.lokasiPenyimpanan || 'Lemari Reagen',
        merek: finalMerek,
        harga: numHarga,
        linkRujukan: finalLink,
        status: finalStatus
      };
      setBahanList((prev) => [...prev, newBahan]);
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
            placeholder="Cari bahan kimia, rumus kimia, nomor CAS, atau lokasi..."
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
            value={selectedBahaya}
            onChange={(e) => setSelectedBahaya(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="all">Semua Kategori Bahaya MSDS</option>
            <option value="Mudah Terbakar">Mudah Terbakar</option>
            <option value="Korosif">Korosif</option>
            <option value="Toksik / Beracun">Toksik / Beracun</option>
            <option value="Pengoksidasi">Pengoksidasi</option>
            <option value="Iritan">Iritan</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>

          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002B49] text-white rounded-lg text-xs font-semibold hover:bg-[#002B49]/90 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Bahan</span>
            </button>
          )}
        </div>
      </div>

      {/* Table of Chemicals */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Kode & Nama Bahan</th>
                <th className="py-3 px-4">Rumus & CAS No.</th>
                <th className="py-3 px-4">Grade & Lab</th>
                <th className="py-3 px-4">Bahaya MSDS</th>
                <th className="py-3 px-4">Stok Saat Ini</th>
                <th className="py-3 px-4">Harga</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBahan.map((bahan) => (
                <tr key={bahan.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <TestTube2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {bahan.namaBahan}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{bahan.kodeBahan}</span>
                          {bahan.merek && (
                            <span className="bg-slate-100 text-slate-700 font-sans font-medium px-1.5 py-0.2 rounded border border-slate-200/60">
                              Merek: {bahan.merek}
                            </span>
                          )}
                          {bahan.linkRujukan && (
                            <a
                              href={bahan.linkRujukan.startsWith('http') ? bahan.linkRujukan : `https://${bahan.linkRujukan}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-0.5 font-sans"
                              title="Buka Link Rujukan"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>Rujukan</span>
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {bahan.lokasiPenyimpanan}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-semibold text-slate-800">{bahan.rumusKimia}</div>
                    <div className="text-[10px] text-slate-400 font-mono">CAS: {bahan.casNumber}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 mb-0.5">
                      {bahan.grade}
                    </span>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{bahan.namaLab}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        bahan.kategoriBahaya === 'Mudah Terbakar'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : bahan.kategoriBahaya === 'Korosif'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : bahan.kategoriBahaya === 'Toksik / Beracun'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {bahan.kategoriBahaya === 'Mudah Terbakar' && <Flame className="w-3 h-3 text-orange-600" />}
                      {bahan.kategoriBahaya === 'Toksik / Beracun' && <Skull className="w-3 h-3 text-red-600" />}
                      {bahan.kategoriBahaya === 'Korosif' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      <span>{bahan.kategoriBahaya}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-bold text-slate-900">
                          {bahan.stok.toLocaleString('id-ID')} {bahan.satuan}
                        </div>
                        <div className="text-[10px] text-slate-400">Min: {bahan.stokMinimum} {bahan.satuan}</div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          bahan.statusStok === 'Aman'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bahan.statusStok === 'Menipis'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {bahan.statusStok}
                      </span>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => handleQuickAdjustStock(bahan.id, -100)}
                          className="text-slate-400 hover:text-red-600 text-[10px] flex items-center gap-0.5"
                          title="Kurangi 100 stok"
                        >
                          <MinusCircle className="w-3 h-3" />
                          <span>-100</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={() => handleQuickAdjustStock(bahan.id, 500)}
                          className="text-slate-400 hover:text-emerald-600 text-[10px] flex items-center gap-0.5"
                          title="Tambah 500 stok"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>+500</span>
                        </button>
                      </div>
                    )}
                  </td>
                  {/* Field: Harga */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {bahan.harga !== undefined && bahan.harga !== null && Number(bahan.harga) > 0 ? (
                      <div>
                        <div className="font-mono font-bold text-emerald-700 text-xs">
                          Rp {Number(bahan.harga).toLocaleString('id-ID')}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          per {bahan.satuan || 'kemasan'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">-</span>
                    )}
                  </td>
                  {/* Field: Status */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${
                        bahan.status === 'Tidak Aktif'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                      }`}
                    >
                      {bahan.status || 'Aktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {bahan.stok > 0 && onAjukanBonBahan && (
                        <button
                          onClick={() => onAjukanBonBahan(bahan)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-md font-semibold text-[10px] transition-colors flex items-center gap-1 mr-1"
                          title="Ajukan Bon Bahan Ini"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Bon Bahan</span>
                        </button>
                      )}

                      {canManage && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(bahan)}
                            className="p-1.5 text-slate-500 hover:text-[#002B49] hover:bg-slate-100 rounded-md"
                            title="Edit Bahan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(bahan.id, bahan.namaBahan)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Hapus Bahan"
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

        {filteredBahan.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            Tidak ada data bahan kimia yang cocok dengan pencarian.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingBahan ? 'Edit Data Bahan Kimia / Reagen' : 'Tambah Bahan Kimia Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kode Bahan *</label>
                  <input
                    type="text"
                    required
                    value={formData.kodeBahan}
                    onChange={(e) => setFormData({ ...formData, kodeBahan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    placeholder="Contoh: BHN-ORG-015"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Grade Kemurnian</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="Pro Analysis (PA)">Pro Analysis (PA)</option>
                    <option value="HPLC Grade">HPLC Grade</option>
                    <option value="Teknis">Teknis</option>
                    <option value="Biokimia Grade">Biokimia Grade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Bahan Kimia *</label>
                <input
                  type="text"
                  required
                  value={formData.namaBahan}
                  onChange={(e) => setFormData({ ...formData, namaBahan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#002B49]/20"
                  placeholder="Contoh: Metanol Pro Analysis (PA)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rumus Kimia / Molekul</label>
                  <input
                    type="text"
                    value={formData.rumusKimia}
                    onChange={(e) => setFormData({ ...formData, rumusKimia: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                    placeholder="CH3OH"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor CAS (Chemical Abstracts)</label>
                  <input
                    type="text"
                    value={formData.casNumber}
                    onChange={(e) => setFormData({ ...formData, casNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                    placeholder="67-56-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Laboratorium Penyimpan *</label>
                  <select
                    value={formData.labId}
                    onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    {labList.map((lab) => (
                      <option key={lab.id} value={lab.id}>
                        {lab.namaLab}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kategori Bahaya MSDS</label>
                  <select
                    value={formData.kategoriBahaya}
                    onChange={(e) => setFormData({ ...formData, kategoriBahaya: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="Mudah Terbakar">Mudah Terbakar</option>
                    <option value="Korosif">Korosif</option>
                    <option value="Toksik / Beracun">Toksik / Beracun</option>
                    <option value="Pengoksidasi">Pengoksidasi</option>
                    <option value="Iritan">Iritan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stok Tersedia</label>
                  <input
                    type="number"
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Satuan</label>
                  <select
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="mL">mL</option>
                    <option value="Liter">Liter</option>
                    <option value="Gram">Gram</option>
                    <option value="Kg">Kg</option>
                    <option value="Botol">Botol</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stok Minimum</label>
                  <input
                    type="number"
                    value={formData.stokMinimum}
                    onChange={(e) => setFormData({ ...formData, stokMinimum: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Merek, Harga & Link Rujukan */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/90 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>Detail Merek, Estimasi Harga & Referensi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Merek */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Merek</label>
                    <input
                      type="text"
                      value={formData.merek || ''}
                      onChange={(e) => setFormData({ ...formData, merek: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]/20"
                      placeholder="Contoh: Merck / Sigma-Aldrich / Smart-Lab"
                    />
                  </div>

                  {/* Harga */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Harga (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.harga !== undefined ? formData.harga : ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            harga: e.target.value === '' ? '' : Number(e.target.value)
                          })
                        }
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#002B49]/20"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Link Rujukan */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Link Rujukan</label>
                  <div className="relative">
                    <ExternalLink className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.linkRujukan || ''}
                      onChange={(e) => setFormData({ ...formData, linkRujukan: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#002B49]/20"
                      placeholder="https://... (Link katalog resmi, MSDS, atau spesifikasi vendor)"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Bahan *</label>
                  <select
                    value={formData.status || 'Aktif'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Tidak Aktif' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49]/20"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lokasi Penyimpanan Spesifik</label>
                  <input
                    type="text"
                    value={formData.lokasiPenyimpanan}
                    onChange={(e) => setFormData({ ...formData, lokasiPenyimpanan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    placeholder="Contoh: Lemari Khusus Pelarut Tahan Api (Lt. 2)"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] text-white rounded-lg font-semibold hover:bg-[#002B49]/90 shadow-xs"
                >
                  {editingBahan ? 'Simpan Perubahan' : 'Tambah Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
