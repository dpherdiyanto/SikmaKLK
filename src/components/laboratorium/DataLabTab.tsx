import React, { useState } from 'react';
import {
  DataLaboratoriumItem,
  LabTeamMember,
  UserRole,
  Dosen,
  PLPStaff,
  AdminStaff,
  Mahasiswa
} from '../../types/sikma';
import { INITIAL_DOSEN } from '../../data/mockData';
import { INITIAL_PLP_LIST } from '../../data/plpList';
import { INITIAL_ADMIN_LIST } from '../../data/adminList';
import { INITIAL_MAHASISWA_LIST } from '../../data/mahasiswaList';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  Microscope,
  TestTube2,
  X,
  UserCheck,
  Crown,
  Wrench,
  GraduationCap,
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Tag,
  Check,
  ExternalLink,
  SlidersHorizontal,
  Eye
} from 'lucide-react';

export const PRESET_FASILITAS: string[] = [
  'Lemari Asam SEFA Certified',
  'Safety Shower & Eyewash Station',
  'Rotary Evaporator Heidolph',
  'Lemari B3 Berstandar NFPA',
  'Spektrofotometer UV-Vis Double Beam',
  'High Performance Liquid Chromatography (HPLC)',
  'Gas Chromatography - Mass Spectrometry (GC-MS)',
  'Timbangan Analitik 4 Desimal Sartorius',
  'Oven & Furnace Vakum',
  'Glove Box Atmosfer Argon',
  'Sentrifuga Kecepatan Tinggi (Centrifuge)',
  'Milli-Q Water Purification System'
];

interface DataLabTabProps {
  labList: DataLaboratoriumItem[];
  setLabList: React.Dispatch<React.SetStateAction<DataLaboratoriumItem[]>>;
  currentRole: UserRole;
  onGoToDataAlat?: (labId: string) => void;
  onGoToDataBahan?: (labId: string) => void;
}

export const DataLabTab: React.FC<DataLabTabProps> = ({
  labList,
  setLabList,
  currentRole,
  onGoToDataAlat,
  onGoToDataBahan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabDetail, setSelectedLabDetail] = useState<DataLaboratoriumItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<DataLaboratoriumItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<DataLaboratoriumItem>>({
    kodeLab: '',
    namaLab: '',
    gedungLokasi: 'Gedung Kimia FMIPA UB',
    lantai: 'Lantai 1',
    kepalaLab: '',
    nipKepalaLab: '',
    plpPenanggungJawab: '',
    nipPlp: '',
    kapasitasMeja: 30,
    bidangFokus: '',
    statusOperasional: 'Aktif Beroperasi',
    fasilitas: [],
    jamOperasional: 'Senin – Jumat, 07.30 – 16.00 WIB',
    kontakLab: 'lab.kimia@ub.ac.id'
  });

  // Additional Team state for editing
  const [formTeam, setFormTeam] = useState<LabTeamMember[]>([]);
  const [fasilitasInput, setFasilitasInput] = useState('');
  const [facilityTags, setFacilityTags] = useState<string[]>([]);
  const [newFacilityTag, setNewFacilityTag] = useState('');
  const [syncToast, setSyncToast] = useState<{
    message: string;
    lab: DataLaboratoriumItem;
  } | null>(null);

  // Master data for team member selection
  const [activeDosenList, setActiveDosenList] = useState<Dosen[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_dosen_data');
      return saved ? JSON.parse(saved) : INITIAL_DOSEN;
    } catch {
      return INITIAL_DOSEN;
    }
  });

  const [activePlpList, setActivePlpList] = useState<PLPStaff[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_plp_data');
      return saved ? JSON.parse(saved) : INITIAL_PLP_LIST;
    } catch {
      return INITIAL_PLP_LIST;
    }
  });

  const [activeAdminList, setActiveAdminList] = useState<AdminStaff[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_admin_data');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_LIST;
    } catch {
      return INITIAL_ADMIN_LIST;
    }
  });

  const [activeMahasiswaList, setActiveMahasiswaList] = useState<Mahasiswa[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_mahasiswa_data');
      return saved ? JSON.parse(saved) : INITIAL_MAHASISWA_LIST;
    } catch {
      return INITIAL_MAHASISWA_LIST;
    }
  });

  const refreshMasterLists = () => {
    try {
      const savedDosen = localStorage.getItem('sikma_dosen_data');
      if (savedDosen) setActiveDosenList(JSON.parse(savedDosen));
      const savedPlp = localStorage.getItem('sikma_plp_data');
      if (savedPlp) setActivePlpList(JSON.parse(savedPlp));
      const savedAdmin = localStorage.getItem('sikma_admin_data');
      if (savedAdmin) setActiveAdminList(JSON.parse(savedAdmin));
      const savedMahasiswa = localStorage.getItem('sikma_mahasiswa_data');
      if (savedMahasiswa) setActiveMahasiswaList(JSON.parse(savedMahasiswa));
    } catch {
      // ignore
    }
  };

  const formatDosenName = (d: Dosen) => {
    if (!d.gelar) return d.nama;
    if (d.nama.includes(d.gelar)) return d.nama;
    return `${d.nama}, ${d.gelar}`;
  };

  const formatPlpName = (p: PLPStaff) => {
    if (!p.gelar) return p.nama;
    if (p.nama.includes(p.gelar)) return p.nama;
    return `${p.nama}, ${p.gelar}`;
  };

  const formatAdminName = (a: AdminStaff) => {
    if (!a.gelar) return a.nama;
    if (a.nama.includes(a.gelar)) return a.nama;
    return `${a.nama}, ${a.gelar}`;
  };

  const isDosenRole = (peran: string) => {
    const p = peran.toLowerCase();
    return (
      p.includes('kepala') ||
      p.includes('ketua') ||
      p.includes('koordinator') ||
      p.includes('koodinator') ||
      p.includes('kompartemen')
    );
  };

  const isPlpRole = (peran: string) => {
    const p = peran.toLowerCase();
    return p.includes('plp') || p.includes('laboran');
  };

  const isAdminRole = (peran: string) => {
    const p = peran.toLowerCase();
    return p.includes('admin') || p.includes('administrasi');
  };

  const isAsistenRole = (peran: string) => {
    const p = peran.toLowerCase();
    return p.includes('asisten') || p.includes('aslab') || p.includes('assistant');
  };

  const matchNip = (a?: string, b?: string) => {
    if (!a || !b) return false;
    const cleanA = a.replace(/\D/g, '');
    const cleanB = b.replace(/\D/g, '');
    return cleanA.length >= 8 && cleanA === cleanB;
  };

  const getMatchedDosenId = (member: LabTeamMember): string => {
    if (!member.nama && !member.nipOrIdentifier) return '';
    const match = activeDosenList.find(
      (d) =>
        matchNip(d.nip, member.nipOrIdentifier) ||
        formatDosenName(d).toLowerCase() === member.nama.toLowerCase() ||
        d.nama.toLowerCase() === member.nama.toLowerCase() ||
        (member.nama.length > 5 &&
          (d.nama.toLowerCase().includes(member.nama.toLowerCase()) ||
            member.nama.toLowerCase().includes(d.nama.toLowerCase())))
    );
    if (match) return match.id;
    return '';
  };

  const getMatchedPlpId = (member: LabTeamMember): string => {
    if (!member.nama && !member.nipOrIdentifier) return '';
    const match = activePlpList.find(
      (p) =>
        matchNip(p.nip, member.nipOrIdentifier) ||
        formatPlpName(p).toLowerCase() === member.nama.toLowerCase() ||
        p.nama.toLowerCase() === member.nama.toLowerCase() ||
        (member.nama.length > 5 &&
          (p.nama.toLowerCase().includes(member.nama.toLowerCase()) ||
            member.nama.toLowerCase().includes(p.nama.toLowerCase())))
    );
    if (match) return match.id;
    return '';
  };

  const getMatchedAdminId = (member: LabTeamMember): string => {
    if (!member.nama && !member.nipOrIdentifier) return '';
    const match = activeAdminList.find(
      (a) =>
        matchNip(a.nip, member.nipOrIdentifier) ||
        formatAdminName(a).toLowerCase() === member.nama.toLowerCase() ||
        a.nama.toLowerCase() === member.nama.toLowerCase() ||
        (member.nama.length > 5 &&
          (a.nama.toLowerCase().includes(member.nama.toLowerCase()) ||
            member.nama.toLowerCase().includes(a.nama.toLowerCase())))
    );
    if (match) return match.id;
    return '';
  };

  const getMatchedMahasiswaId = (member: LabTeamMember): string => {
    if (!member.nama && !member.nipOrIdentifier) return '';
    const cleanId = (member.nipOrIdentifier || '').replace(/\D/g, '');
    const match = activeMahasiswaList.find((m) => {
      const mNimClean = m.nim.replace(/\D/g, '');
      const nimMatch = cleanId.length >= 6 && mNimClean === cleanId;
      const nameMatch =
        m.nama.toLowerCase() === member.nama.toLowerCase() ||
        (member.nama.length > 5 &&
          (m.nama.toLowerCase().includes(member.nama.toLowerCase()) ||
            member.nama.toLowerCase().includes(m.nama.toLowerCase())));
      return nimMatch || nameMatch;
    });
    if (match) return match.id;
    return '';
  };

  const handleSelectPersonFromMaster = (
    index: number,
    selectedId: string,
    roleCategory: 'dosen' | 'plp' | 'admin' | 'mahasiswa'
  ) => {
    if (!selectedId) {
      setFormTeam((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], nama: '', nipOrIdentifier: '' };
        return copy;
      });
      return;
    }

    if (roleCategory === 'dosen') {
      const d = activeDosenList.find((item) => item.id === selectedId);
      if (d) {
        setFormTeam((prev) => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            nama: formatDosenName(d),
            nipOrIdentifier: ''
          };
          return copy;
        });
      }
    } else if (roleCategory === 'plp') {
      const p = activePlpList.find((item) => item.id === selectedId);
      if (p) {
        setFormTeam((prev) => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            nama: formatPlpName(p),
            nipOrIdentifier: ''
          };
          return copy;
        });
      }
    } else if (roleCategory === 'admin') {
      const a = activeAdminList.find((item) => item.id === selectedId);
      if (a) {
        setFormTeam((prev) => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            nama: formatAdminName(a),
            nipOrIdentifier: ''
          };
          return copy;
        });
      }
    } else if (roleCategory === 'mahasiswa') {
      const m = activeMahasiswaList.find((item) => item.id === selectedId);
      if (m) {
        setFormTeam((prev) => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            nama: m.nama,
            nipOrIdentifier: m.nim
          };
          return copy;
        });
      }
    }
  };

  const canManage = currentRole === 'super_admin' || currentRole === 'admin';

  // Helper to extract team members for display
  const getLabTeam = (lab: DataLaboratoriumItem): LabTeamMember[] => {
    if (lab.team && lab.team.length > 0) {
      return lab.team;
    }
    const defaultTeam: LabTeamMember[] = [];
    if (lab.kepalaLab && lab.kepalaLab !== '-') {
      defaultTeam.push({
        nama: lab.kepalaLab,
        peran: 'Kepala Lab',
        nipOrIdentifier: lab.nipKepalaLab
      });
    }
    if (lab.koordinatorKompartemen && lab.koordinatorKompartemen !== '-') {
      defaultTeam.push({
        nama: lab.koordinatorKompartemen,
        peran: 'Koordinator Kompartemen',
        nipOrIdentifier: lab.nipKoordinatorKompartemen
      });
    }
    if (lab.plpPenanggungJawab && lab.plpPenanggungJawab !== '-') {
      defaultTeam.push({
        nama: lab.plpPenanggungJawab,
        peran: 'PLP Penanggung Jawab',
        nipOrIdentifier: lab.nipPlp
      });
    }
    return defaultTeam;
  };

  const filteredLabs = labList.filter((lab) => {
    const teamMembers = getLabTeam(lab);
    const teamMatch = teamMembers.some(
      (m) =>
        m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.nipOrIdentifier && m.nipOrIdentifier.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const matchSearch =
      lab.namaLab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.kodeLab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.gedungLokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lab.bidangFokus && lab.bidangFokus.toLowerCase().includes(searchTerm.toLowerCase())) ||
      teamMatch;

    return matchSearch;
  });

  const handleOpenAdd = () => {
    refreshMasterLists();
    setEditingLab(null);
    const nextNum = labList.length + 1;
    const defaultKode = `LAB-KIM-${String(nextNum).padStart(2, '0')}`;
    const defaultFas = [
      'Lemari Asam SEFA Certified',
      'Safety Shower & Eyewash Station',
      'Timbangan Analitik 4 Desimal Sartorius'
    ];
    setFormData({
      kodeLab: defaultKode,
      namaLab: '',
      gedungLokasi: 'Gedung Kimia FMIPA UB',
      lantai: 'Lantai 1',
      kepalaLab: '',
      nipKepalaLab: '',
      koordinatorKompartemen: '',
      nipKoordinatorKompartemen: '',
      plpPenanggungJawab: '',
      nipPlp: '',
      kapasitasMeja: 30,
      bidangFokus: '',
      statusOperasional: 'Aktif Beroperasi',
      fasilitas: defaultFas,
      jamOperasional: 'Senin – Jumat, 07.30 – 16.00 WIB',
      kontakLab: 'lab.kimia@ub.ac.id'
    });
    setFormTeam([
      { nama: '', peran: 'Kepala Lab', nipOrIdentifier: '' },
      { nama: '', peran: 'Koordinator Kompartemen', nipOrIdentifier: '' },
      { nama: '', peran: 'PLP Penanggung Jawab', nipOrIdentifier: '' },
      { nama: '', peran: 'Admin', nipOrIdentifier: '' }
    ]);
    setFacilityTags(defaultFas);
    setFasilitasInput(defaultFas.join(', '));
    setNewFacilityTag('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lab: DataLaboratoriumItem) => {
    refreshMasterLists();
    setEditingLab(lab);
    setFormData({
      ...lab,
      kodeLab: lab.kodeLab || '',
      namaLab: lab.namaLab || '',
      gedungLokasi: lab.gedungLokasi || 'Gedung Kimia FMIPA UB',
      lantai: lab.lantai || 'Lantai 1',
      statusOperasional: lab.statusOperasional || 'Aktif Beroperasi',
      kapasitasMeja: lab.kapasitasMeja ?? 30,
      jamOperasional: lab.jamOperasional || 'Senin – Jumat, 07.30 – 16.00 WIB',
      kontakLab: lab.kontakLab || 'lab.kimia@ub.ac.id',
      bidangFokus: lab.bidangFokus || '',
      fasilitas: lab.fasilitas || []
    });
    const currentTeam = getLabTeam(lab);
    let initialTeam: LabTeamMember[] = [];
    if (currentTeam.length > 0) {
      initialTeam = currentTeam.map((m) => {
        if (
          m.peran.toLowerCase().includes('teknisi') ||
          m.peran.toLowerCase().includes('dosen') ||
          m.peran.toLowerCase().includes('analis')
        ) {
          return { ...m, peran: 'Admin' };
        }
        return m;
      });

      const hasKoor = initialTeam.some((m) =>
        m.peran.toLowerCase().includes('koordinator') ||
        m.peran.toLowerCase().includes('koodinator') ||
        m.peran.toLowerCase().includes('kompartemen')
      );
      if (!hasKoor) {
        const kepalaIndex = initialTeam.findIndex((m) =>
          m.peran.toLowerCase().includes('kepala')
        );
        const koorMember: LabTeamMember = {
          nama: lab.koordinatorKompartemen || '',
          peran: 'Koordinator Kompartemen',
          nipOrIdentifier: lab.nipKoordinatorKompartemen || ''
        };
        if (kepalaIndex !== -1) {
          initialTeam.splice(kepalaIndex + 1, 0, koorMember);
        } else {
          initialTeam.unshift(koorMember);
        }
      }

      const hasAdmin = initialTeam.some((m) => m.peran.toLowerCase().includes('admin'));
      if (!hasAdmin) {
        const plpIndex = initialTeam.findIndex((m) => m.peran.toLowerCase().includes('plp'));
        const adminMember: LabTeamMember = {
          nama: '',
          peran: 'Admin',
          nipOrIdentifier: ''
        };
        if (plpIndex !== -1) {
          initialTeam.splice(plpIndex + 1, 0, adminMember);
        } else {
          initialTeam.push(adminMember);
        }
      }
    } else {
      initialTeam = [
        { nama: lab.kepalaLab || '', peran: 'Kepala Lab', nipOrIdentifier: lab.nipKepalaLab || '' },
        { nama: lab.koordinatorKompartemen || '', peran: 'Koordinator Kompartemen', nipOrIdentifier: lab.nipKoordinatorKompartemen || '' },
        { nama: lab.plpPenanggungJawab || '', peran: 'PLP Penanggung Jawab', nipOrIdentifier: lab.nipPlp || '' },
        { nama: '', peran: 'Admin', nipOrIdentifier: '' }
      ];
    }
    setFormTeam(initialTeam);
    const existingFas = lab.fasilitas && lab.fasilitas.length > 0 ? [...lab.fasilitas] : [];
    setFacilityTags(existingFas);
    setFasilitasInput(existingFas.join(', '));
    setNewFacilityTag('');
    setIsModalOpen(true);
  };

  const handleAddFacilityTag = (tagToAdd?: string) => {
    const raw = tagToAdd !== undefined ? tagToAdd : newFacilityTag;
    const clean = raw.trim();
    if (!clean) return;

    if (clean.includes(',')) {
      const parts = clean.split(',').map((p) => p.trim()).filter(Boolean);
      setFacilityTags((prev) => {
        const next = [...prev];
        parts.forEach((p) => {
          if (!next.includes(p)) next.push(p);
        });
        setFasilitasInput(next.join(', '));
        return next;
      });
      if (tagToAdd === undefined) setNewFacilityTag('');
      return;
    }

    setFacilityTags((prev) => {
      if (prev.includes(clean)) return prev;
      const next = [...prev, clean];
      setFasilitasInput(next.join(', '));
      return next;
    });
    if (tagToAdd === undefined) setNewFacilityTag('');
  };

  const handleRemoveFacilityTag = (indexToRemove: number) => {
    setFacilityTags((prev) => {
      const next = prev.filter((_, i) => i !== indexToRemove);
      setFasilitasInput(next.join(', '));
      return next;
    });
  };

  const handleFasilitasTextareaChange = (value: string) => {
    setFasilitasInput(value);
    const parsed = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setFacilityTags(parsed);
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data laboratorium: "${nama}"?`)) {
      setLabList((prev) => prev.filter((item) => item.id !== id));
      if (selectedLabDetail && selectedLabDetail.id === id) {
        setSelectedLabDetail(null);
      }
    }
  };

  const handleAddTeamRow = () => {
    setFormTeam((prev) => [
      ...prev,
      { nama: '', peran: 'Admin', nipOrIdentifier: '' }
    ]);
  };

  const handleRemoveTeamRow = (index: number) => {
    setFormTeam((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTeamChange = (index: number, field: keyof LabTeamMember, value: string) => {
    setFormTeam((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLab) {
      alert('Nama Laboratorium wajib diisi.');
      return;
    }

    // Filter valid team members
    const validTeam = formTeam.filter((m) => m.nama.trim() !== '');

    // Resolve primary kepalaLab, koordinatorKompartemen & plp for backwards-compatibility
    const headMember = validTeam.find((m) => m.peran.toLowerCase().includes('kepala'));
    const koorMember = validTeam.find((m) =>
      m.peran.toLowerCase().includes('koordinator') ||
      m.peran.toLowerCase().includes('koodinator') ||
      m.peran.toLowerCase().includes('kompartemen')
    );
    const plpMember = validTeam.find((m) => m.peran.toLowerCase().includes('plp'));

    const resolvedKepala = headMember ? headMember.nama : formData.kepalaLab || '-';
    const resolvedNipKepala = '';
    const resolvedKoor = koorMember ? koorMember.nama : formData.koordinatorKompartemen || '';
    const resolvedNipKoor = '';
    const resolvedPlp = plpMember ? plpMember.nama : formData.plpPenanggungJawab || '-';
    const resolvedNipPlp = '';

    const finalFacilities =
      facilityTags.length > 0
        ? facilityTags
        : fasilitasInput
        ? fasilitasInput.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

    let savedLab: DataLaboratoriumItem;

    if (editingLab) {
      savedLab = {
        ...editingLab,
        ...formData,
        kodeLab: (formData.kodeLab || editingLab.kodeLab).trim(),
        namaLab: (formData.namaLab || editingLab.namaLab).trim(),
        gedungLokasi: (formData.gedungLokasi || editingLab.gedungLokasi).trim(),
        lantai: (formData.lantai || editingLab.lantai).trim(),
        kapasitasMeja: Number(formData.kapasitasMeja) || editingLab.kapasitasMeja || 30,
        bidangFokus: (formData.bidangFokus || editingLab.bidangFokus || '').trim(),
        statusOperasional: formData.statusOperasional || editingLab.statusOperasional,
        jamOperasional: (formData.jamOperasional || editingLab.jamOperasional || 'Senin – Jumat, 07.30 – 16.00 WIB').trim(),
        kontakLab: (formData.kontakLab || editingLab.kontakLab || 'lab.kimia@ub.ac.id').trim(),
        kepalaLab: resolvedKepala,
        nipKepalaLab: resolvedNipKepala,
        koordinatorKompartemen: resolvedKoor,
        nipKoordinatorKompartemen: resolvedNipKoor,
        plpPenanggungJawab: resolvedPlp,
        nipPlp: resolvedNipPlp,
        team: validTeam,
        fasilitas: finalFacilities
      } as DataLaboratoriumItem;

      setLabList((prev) => prev.map((item) => (item.id === editingLab.id ? savedLab : item)));

      // Real-time synchronization with Detail Modal
      if (selectedLabDetail && selectedLabDetail.id === editingLab.id) {
        setSelectedLabDetail(savedLab);
      }
    } else {
      const generatedKode = (formData.kodeLab || `LAB-KIM-${String(labList.length + 1).padStart(2, '0')}`).trim();
      savedLab = {
        id: `lab-${Date.now()}`,
        kodeLab: generatedKode,
        namaLab: (formData.namaLab || 'Laboratorium Baru').trim(),
        gedungLokasi: (formData.gedungLokasi || 'Gedung Kimia FMIPA UB').trim(),
        lantai: (formData.lantai || 'Lantai 1').trim(),
        kepalaLab: resolvedKepala,
        nipKepalaLab: resolvedNipKepala,
        koordinatorKompartemen: resolvedKoor,
        nipKoordinatorKompartemen: resolvedNipKoor,
        plpPenanggungJawab: resolvedPlp,
        nipPlp: resolvedNipPlp,
        team: validTeam,
        kapasitasMeja: Number(formData.kapasitasMeja) || 30,
        bidangFokus: (formData.bidangFokus || 'Riset & Praktikum Kimia Departemen Kimia FMIPA UB').trim(),
        statusOperasional: (formData.statusOperasional as any) || 'Aktif Beroperasi',
        fasilitas: finalFacilities,
        jamOperasional: (formData.jamOperasional || 'Senin – Jumat, 07.30 – 16.00 WIB').trim(),
        kontakLab: (formData.kontakLab || 'lab.kimia@ub.ac.id').trim()
      };
      setLabList((prev) => [...prev, savedLab]);
    }

    setSyncToast({
      message: editingLab
        ? `Perubahan data & fasilitas laboratorium "${savedLab.namaLab}" berhasil disinkronkan!`
        : `Laboratorium "${savedLab.namaLab}" dan fasilitasnya berhasil ditambahkan!`,
      lab: savedLab
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notifikasi Sinkronisasi */}
      {syncToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">{syncToast.message}</p>
              <p className="text-[11px] text-emerald-700">
                Data form, tabel, dan pop-up detail & fasilitas telah tersinkronisasi secara real-time.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => {
                setSelectedLabDetail(syncToast.lab);
                setSyncToast(null);
              }}
              className="px-3 py-1.5 bg-[#002B49] text-white rounded-lg text-xs font-semibold hover:bg-[#003865] transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Lihat Detail & Fasilitas</span>
            </button>
            <button
              onClick={() => setSyncToast(null)}
              className="p-1 rounded-lg text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100 transition-colors"
              title="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Filter and Add Action */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama laboratorium, kode, atau anggota team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 focus:border-[#002B49]"
          />
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002B49] text-white rounded-lg text-xs font-semibold hover:bg-[#002B49]/90 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Laboratorium</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table: Nama Laboratorium, Team, Aksi (Edit, Data Alat, Data Bahan, Hapus) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3.5 px-5 w-2/5">Nama Laboratorium</th>
                <th className="py-3.5 px-5 w-2/5">Team</th>
                <th className="py-3.5 px-5 text-right w-1/5 min-w-[280px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLabs.map((lab) => {
                const team = getLabTeam(lab);

                return (
                  <tr
                    key={lab.id}
                    className="hover:bg-slate-50/90 transition-colors align-top"
                  >
                    {/* FIELD 1: Nama Laboratorium */}
                    <td className="py-4 px-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#002B49]/5 text-[#002B49] flex items-center justify-center shrink-0 mt-0.5 border border-[#002B49]/10">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/60">
                              {lab.kodeLab}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.2 rounded-full ${
                                lab.statusOperasional === 'Aktif Beroperasi'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {lab.statusOperasional}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {lab.namaLab}
                          </h3>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {lab.gedungLokasi}, {lab.lantai}
                            </span>
                          </div>

                          {lab.bidangFokus ? (
                            <div className="text-[11px] text-slate-600 line-clamp-1 pt-0.5">
                              <span className="text-slate-400 font-medium">Fokus: </span>
                              {lab.bidangFokus}
                            </div>
                          ) : null}

                          <button
                            onClick={() => setSelectedLabDetail(lab)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#002B49] hover:underline pt-1"
                          >
                            <Info className="w-3 h-3" />
                            <span>Lihat Detail & Fasilitas</span>
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* FIELD 2: Team */}
                    <td className="py-4 px-5">
                      <div className="space-y-2">
                        {team.map((member, idx) => {
                          const isLead =
                            member.peran.toLowerCase().includes('kepala') ||
                            member.peran.toLowerCase().includes('ketua');
                          const isKoor =
                            member.peran.toLowerCase().includes('koordinator') ||
                            member.peran.toLowerCase().includes('koodinator') ||
                            member.peran.toLowerCase().includes('kompartemen');
                          const isPlp =
                            member.peran.toLowerCase().includes('plp');
                          const isAdmin =
                            member.peran.toLowerCase().includes('admin');
                          const isAsisten =
                            member.peran.toLowerCase().includes('asisten');

                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100"
                            >
                              <div
                                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs mt-0.5 ${
                                  isLead
                                    ? 'bg-[#002B49] text-[#D4AF37]'
                                    : isKoor
                                    ? 'bg-amber-100 text-amber-800'
                                    : isPlp
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isAdmin
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : isAsisten
                                    ? 'bg-cyan-100 text-cyan-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {isLead ? (
                                  <Crown className="w-3.5 h-3.5" />
                                ) : isKoor ? (
                                  <GraduationCap className="w-3.5 h-3.5" />
                                ) : isPlp ? (
                                  <Wrench className="w-3.5 h-3.5" />
                                ) : isAdmin ? (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                ) : isAsisten ? (
                                  <GraduationCap className="w-3.5 h-3.5" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900 leading-snug">
                                    {member.nama}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                      isLead
                                        ? 'bg-[#002B49] text-white'
                                        : isKoor
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : isPlp
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isAdmin
                                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                        : isAsisten
                                        ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {member.peran}
                                  </span>
                                </div>
                                {member.peran === 'Asisten Lab' && member.nipOrIdentifier && (
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    NIM: {member.nipOrIdentifier}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {team.length === 0 && (
                          <div className="text-slate-400 text-xs italic">
                            Belum ada anggota team terdaftar.
                          </div>
                        )}
                      </div>
                    </td>

                    {/* FIELD 3: Aksi */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {currentRole === 'mahasiswa' ? (
                          /* Role Mahasiswa HANYA BISA akses button View */
                          <button
                            onClick={() => setSelectedLabDetail(lab)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002B49] text-white hover:bg-[#003865] font-semibold text-xs transition-colors shadow-2xs"
                            title={`Lihat Detail & Fasilitas ${lab.namaLab}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        ) : (
                          <>
                            {/* Aksi 1: Edit */}
                            {canManage && (
                              <button
                                onClick={() => handleOpenEdit(lab)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#002B49] hover:text-white font-semibold text-xs transition-colors shadow-2xs"
                                title="Edit Data Laboratorium & Team"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            )}

                            {/* Aksi 2: Data Alat */}
                            <button
                              onClick={() => onGoToDataAlat && onGoToDataAlat(lab.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 font-semibold text-xs transition-colors shadow-2xs"
                              title={`Buka Data Alat milik ${lab.namaLab}`}
                            >
                              <Microscope className="w-3.5 h-3.5" />
                              <span>Data Alat</span>
                            </button>

                            {/* Aksi 3: Data Bahan */}
                            <button
                              onClick={() => onGoToDataBahan && onGoToDataBahan(lab.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-200 hover:border-amber-600 font-semibold text-xs transition-colors shadow-2xs"
                              title={`Buka Data Bahan milik ${lab.namaLab}`}
                            >
                              <TestTube2 className="w-3.5 h-3.5" />
                              <span>Data Bahan</span>
                            </button>

                            {/* Aksi 4: Hapus */}
                            {canManage && (
                              <button
                                onClick={() => handleDelete(lab.id, lab.namaLab)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 font-semibold text-xs transition-colors shadow-2xs"
                                title={`Hapus Laboratorium ${lab.namaLab}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLabs.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            Tidak ada data laboratorium yang cocok dengan filter pencarian.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLabDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold bg-[#002B49] text-white px-2 py-0.5 rounded">
                  {selectedLabDetail.kodeLab}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedLabDetail.namaLab}
                </h3>
                <span
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                    selectedLabDetail.statusOperasional === 'Aktif Beroperasi'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {selectedLabDetail.statusOperasional}
                </span>
              </div>
              <button
                onClick={() => setSelectedLabDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Tutup pop-up detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Informasi Laboratorium */}
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex items-center gap-1.5 text-[#002B49] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Informasi Laboratorium & Operasional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lokasi Gedung & Lantai</span>
                    <span className="font-semibold text-slate-800">
                      {selectedLabDetail.gedungLokasi}, {selectedLabDetail.lantai}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Operasional</span>
                    <span className="font-semibold text-emerald-700">
                      {selectedLabDetail.statusOperasional}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kapasitas Meja Kerja</span>
                    <span className="font-semibold text-slate-800">
                      {selectedLabDetail.kapasitasMeja || 30} Mahasiswa
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jam Kerja & Operasional</span>
                    <span className="font-semibold text-slate-800">
                      {selectedLabDetail.jamOperasional || 'Senin – Jumat, 07.30 – 16.00 WIB'}
                    </span>
                  </div>
                  {selectedLabDetail.kontakLab && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[10px]">Email Kontak Laboratorium</span>
                      <span className="font-semibold text-[#002B49]">
                        {selectedLabDetail.kontakLab}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800">
                    Team Pengelola Laboratorium
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {getLabTeam(selectedLabDetail).length} Personil Terdaftar
                  </span>
                </div>
                <div className="space-y-1.5">
                  {getLabTeam(selectedLabDetail).map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{member.nama}</span>
                        {member.peran === 'Asisten Lab' && member.nipOrIdentifier && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            NIM: {member.nipOrIdentifier}
                          </span>
                        )}
                      </div>
                      {(() => {
                        const isLead = member.peran.toLowerCase().includes('kepala');
                        const isKoor =
                          member.peran.toLowerCase().includes('koordinator') ||
                          member.peran.toLowerCase().includes('kompartemen');
                        const isPlp = member.peran.toLowerCase().includes('plp');
                        const isAdmin = member.peran.toLowerCase().includes('admin');
                        const isAsisten = member.peran.toLowerCase().includes('asisten');
                        return (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isLead
                                ? 'bg-[#002B49] text-white'
                                : isKoor
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isPlp
                                ? 'bg-emerald-100 text-emerald-800'
                                : isAdmin
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : isAsisten
                                ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {member.peran}
                          </span>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bidang Fokus */}
              {selectedLabDetail.bidangFokus && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1">
                    Bidang Fokus & Ruang Lingkup Riset
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {selectedLabDetail.bidangFokus}
                  </p>
                </div>
              )}

              {/* Fasilitas Utama & Peralatan Lab */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#002B49]" />
                    <span>Fasilitas Utama & Peralatan Lab</span>
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedLabDetail.fasilitas?.length || 0} Fasilitas Terdaftar
                  </span>
                </div>
                {selectedLabDetail.fasilitas && selectedLabDetail.fasilitas.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedLabDetail.fasilitas.map((fas, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-800 text-[11px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium leading-tight">{fas}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-400 italic text-[11px] text-center">
                    Belum ada fasilitas yang didaftarkan untuk laboratorium ini.
                  </div>
                )}
              </div>
            </div>

            {/* Detail Modal Action Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
              <div className="flex flex-wrap gap-2">
                {currentRole !== 'mahasiswa' && (
                  <>
                    <button
                      onClick={() => {
                        const labId = selectedLabDetail.id;
                        setSelectedLabDetail(null);
                        if (onGoToDataAlat) onGoToDataAlat(labId);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Microscope className="w-3.5 h-3.5" />
                      <span>Data Alat</span>
                    </button>
                    <button
                      onClick={() => {
                        const labId = selectedLabDetail.id;
                        setSelectedLabDetail(null);
                        if (onGoToDataBahan) onGoToDataBahan(labId);
                      }}
                      className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <TestTube2 className="w-3.5 h-3.5" />
                      <span>Data Bahan</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    onClick={() => {
                      const labToEdit = selectedLabDetail;
                      handleOpenEdit(labToEdit);
                    }}
                    className="px-3.5 py-1.5 bg-[#002B49] text-white rounded-lg text-xs font-semibold hover:bg-[#002B49]/90 flex items-center gap-1.5 shadow-xs transition-colors"
                    title="Edit data dan fasilitas laboratorium ini secara langsung"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Data & Fasilitas</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedLabDetail(null)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Sinkronisasi Penuh dengan Lihat Detail & Fasilitas) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingLab ? 'Edit Data Laboratorium & Fasilitas' : 'Tambah Laboratorium Baru'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sinkronisasi menyeluruh antara identitas lab, personil tim, dan daftar fasilitas & instrumen.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Batal dan tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Bagian 1: Identitas Laboratorium */}
              <div className="space-y-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>1. Identitas & Status Laboratorium</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Kode Lab *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kodeLab}
                      onChange={(e) => setFormData({ ...formData, kodeLab: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#002B49]/20"
                      placeholder="LAB-KIM-01"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Nama Laboratorium *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.namaLab}
                      onChange={(e) => setFormData({ ...formData, namaLab: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#002B49]/20"
                      placeholder="Contoh: Laboratorium Kimia Organik & Bahan Alam"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Status Operasional
                    </label>
                    <select
                      value={formData.statusOperasional}
                      onChange={(e) =>
                        setFormData({ ...formData, statusOperasional: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                    >
                      <option value="Aktif Beroperasi">Aktif Beroperasi</option>
                      <option value="Pemeliharaan">Pemeliharaan</option>
                      <option value="Kalibrasi Berkala">Kalibrasi Berkala</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Lokasi, Kapasitas & Kontak */}
              <div className="space-y-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>2. Lokasi, Kapasitas & Jam Operasional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gedung & Lokasi</label>
                    <input
                      type="text"
                      value={formData.gedungLokasi}
                      onChange={(e) => setFormData({ ...formData, gedungLokasi: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      placeholder="Gedung Kimia FMIPA UB"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Lantai / Posisi</label>
                    <input
                      type="text"
                      value={formData.lantai}
                      onChange={(e) => setFormData({ ...formData, lantai: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      placeholder="Lantai 1 / Sayap Timur"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Kapasitas Meja (Mhs)</label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={formData.kapasitasMeja || 30}
                      onChange={(e) => setFormData({ ...formData, kapasitasMeja: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Jam Kerja & Operasional</label>
                    <input
                      type="text"
                      value={formData.jamOperasional}
                      onChange={(e) => setFormData({ ...formData, jamOperasional: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      placeholder="Senin – Jumat, 07.30 – 16.00 WIB"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email Kontak Lab</label>
                    <input
                      type="email"
                      value={formData.kontakLab}
                      onChange={(e) => setFormData({ ...formData, kontakLab: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                      placeholder="lab.kimia@ub.ac.id"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Bidang Fokus */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Bidang Fokus & Ruang Lingkup Riset
                </label>
                <textarea
                  rows={2}
                  value={formData.bidangFokus}
                  onChange={(e) => setFormData({ ...formData, bidangFokus: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  placeholder="Riset sintesis kimia organik, isolasi senyawa bahan alam, spektrometri metabolit..."
                />
              </div>

              {/* Bagian 4: Team Management Section */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-slate-800 font-bold">Team Pengelola Lab</label>
                    <span className="text-[10px] text-slate-500">
                      Personil tim: Kepala Lab, Koordinator Kompartemen, PLP Penanggung Jawab, Admin, dan Asisten Lab
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTeamRow}
                    className="text-[11px] text-[#002B49] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Anggota Team</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formTeam.map((member, index) => {
                    const isDosen = isDosenRole(member.peran);
                    const isPlp = isPlpRole(member.peran);
                    const isAdmin = isAdminRole(member.peran);
                    const isAsisten = isAsistenRole(member.peran);

                    let selectedOptionId = '';
                    if (isDosen) {
                      selectedOptionId = getMatchedDosenId(member);
                    } else if (isPlp) {
                      selectedOptionId = getMatchedPlpId(member);
                    } else if (isAdmin) {
                      selectedOptionId = getMatchedAdminId(member);
                    } else if (isAsisten) {
                      selectedOptionId = getMatchedMahasiswaId(member);
                    }

                    return (
                      <div
                        key={index}
                        className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/90 shadow-xs space-y-2.5 transition-all"
                      >
                        {/* Row Top: Role selector, Source Badge & Delete */}
                        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-200/60">
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="text-[11px] font-bold text-slate-700">Peran:</label>
                            <select
                              value={member.peran}
                              onChange={(e) => handleTeamChange(index, 'peran', e.target.value)}
                              className="px-2.5 py-1 rounded-md border border-slate-300 text-xs bg-white font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-[#002B49]"
                            >
                              <option value="Kepala Lab">Kepala Lab</option>
                              <option value="Koordinator Kompartemen">Koordinator Kompartemen</option>
                              <option value="PLP Penanggung Jawab">PLP Penanggung Jawab</option>
                              <option value="Admin">Admin</option>
                              <option value="Asisten Lab">Asisten Lab</option>
                            </select>

                            {/* Data Source Badge */}
                            {isDosen ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-amber-700" />
                                <span>Ambil dari Data Dosen</span>
                              </span>
                            ) : isPlp ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                                <Wrench className="w-3 h-3 text-emerald-700" />
                                <span>Ambil dari Data PLP</span>
                              </span>
                            ) : isAdmin ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 inline-flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-indigo-700" />
                                <span>Ambil dari Data Admin</span>
                              </span>
                            ) : isAsisten ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300 inline-flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-cyan-700" />
                                <span>Ambil dari Data Mahasiswa</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 inline-flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                <span>Input Personil</span>
                              </span>
                            )}
                          </div>

                          {formTeam.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamRow(index)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Hapus baris personil ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Row Bottom: Dropdown Option to Pick Name & Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              Opsi Nama ({isDosen ? 'Ambil dari Data Dosen' : isPlp ? 'Ambil dari Data PLP' : isAdmin ? 'Ambil dari Data Admin' : isAsisten ? 'Ambil dari Data Mahasiswa' : 'Pilih'})
                            </label>
                            {isDosen ? (
                              <select
                                value={selectedOptionId}
                                onChange={(e) => handleSelectPersonFromMaster(index, e.target.value, 'dosen')}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs bg-amber-50/60 text-slate-800 font-medium focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                              >
                                <option value="">-- Pilih dari Data Dosen ({activeDosenList.length} Dosen) --</option>
                                {activeDosenList.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {formatDosenName(d)}
                                  </option>
                                ))}
                              </select>
                            ) : isPlp ? (
                              <select
                                value={selectedOptionId}
                                onChange={(e) => handleSelectPersonFromMaster(index, e.target.value, 'plp')}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs bg-emerald-50/60 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                              >
                                <option value="">-- Pilih dari Data PLP ({activePlpList.length} Staf PLP) --</option>
                                {activePlpList.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {formatPlpName(p)}
                                  </option>
                                ))}
                              </select>
                            ) : isAdmin ? (
                              <select
                                value={selectedOptionId}
                                onChange={(e) => handleSelectPersonFromMaster(index, e.target.value, 'admin')}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-300 text-xs bg-indigo-50/60 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                              >
                                <option value="">-- Pilih dari Data Admin ({activeAdminList.length} Staf Admin) --</option>
                                {activeAdminList.map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {formatAdminName(a)}
                                  </option>
                                ))}
                              </select>
                            ) : isAsisten ? (
                              <select
                                value={selectedOptionId}
                                onChange={(e) => handleSelectPersonFromMaster(index, e.target.value, 'mahasiswa')}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-cyan-300 text-xs bg-cyan-50/60 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
                              >
                                <option value="">-- Pilih dari Data Mahasiswa ({activeMahasiswaList.length} Mahasiswa) --</option>
                                {activeMahasiswaList.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.nama} (NIM. {m.nim})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-100 text-slate-500 italic">
                                Ketik nama langsung di kolom samping
                              </div>
                            )}
                          </div>

                          {/* Nama Lengkap & Gelar */}
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              Nama Lengkap & Gelar *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Nama Lengkap & Gelar *"
                              value={member.nama}
                              onChange={(e) => handleTeamChange(index, 'nama', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 font-medium focus:ring-1 focus:ring-[#002B49]"
                            />
                          </div>

                          {/* NIM / Identitas khusus Asisten Lab jika ada */}
                          {isAsisten && (
                            <div className="sm:col-span-12">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 shrink-0">
                                  NIM Mahasiswa:
                                </span>
                                <input
                                  type="text"
                                  placeholder="NIM Mahasiswa (terisi otomatis dari data mahasiswa)"
                                  value={member.nipOrIdentifier || ''}
                                  onChange={(e) => handleTeamChange(index, 'nipOrIdentifier', e.target.value)}
                                  className="flex-1 px-2.5 py-1 rounded-md border border-slate-200 text-[11px] bg-white text-slate-700 font-mono focus:ring-1 focus:ring-[#002B49]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bagian 5: Fasilitas & Instrumen Laboratorium (Sinkronisasi Penuh dengan Lihat Detail) */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-slate-800 font-bold text-xs flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#002B49]" />
                      <span>Fasilitas & Instrumen Laboratorium</span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Fasilitas yang dimasukkan di sini akan tersinkronisasi 1:1 dan langsung tampil pada menu 'Lihat Detail & Fasilitas'.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#002B49] text-white">
                    {facilityTags.length} Fasilitas
                  </span>
                </div>

                {/* Input Tambah Fasilitas Baru */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFacilityTag}
                    onChange={(e) => setNewFacilityTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFacilityTag();
                      }
                    }}
                    placeholder="Ketik fasilitas baru (contoh: Spektrofotometer UV-Vis Double Beam) lalu tekan Enter..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 focus:border-[#002B49]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFacilityTag()}
                    className="px-3.5 py-2 bg-[#002B49] text-white rounded-lg font-semibold hover:bg-[#002B49]/90 text-xs flex items-center gap-1 shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>

                {/* Chips Preview Fasilitas Terpilih */}
                <div className="p-3 bg-white rounded-lg border border-slate-200/80 min-h-[50px] space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Daftar Fasilitas Terpilih:
                  </span>
                  {facilityTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {facilityTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs group hover:bg-slate-200 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFacilityTag(idx)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                            title={`Hapus ${tag}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs italic py-1">
                      Belum ada fasilitas dipilih. Gunakan input di atas atau klik pilihan cepat di bawah.
                    </div>
                  )}
                </div>

                {/* Preset Rekomendasi Cepat */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-600 block">
                    Pilihan Cepat Fasilitas Kimia (klik untuk menambahkan):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_FASILITAS.map((preset, idx) => {
                      const isAdded = facilityTags.includes(preset);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!isAdded) {
                              handleAddFacilityTag(preset);
                            }
                          }}
                          disabled={isAdded}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                            isAdded
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default opacity-80'
                              : 'bg-white hover:bg-[#002B49] text-slate-700 hover:text-white border border-slate-200 shadow-2xs cursor-pointer'
                          }`}
                        >
                          {isAdded ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Plus className="w-2.5 h-2.5 text-slate-400" />
                          )}
                          <span>{preset}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Opsi Edit Raw Textarea Terpisah Koma */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Atau salin & tempel daftar fasilitas (format terpisah tanda koma):
                  </label>
                  <textarea
                    rows={2}
                    value={fasilitasInput}
                    onChange={(e) => handleFasilitasTextareaChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                    placeholder="Lemari Asam SEFA, Safety Shower, HPLC, Spektrofotometer AAS..."
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
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
                  className="px-4 py-2 bg-[#002B49] text-white rounded-lg font-semibold hover:bg-[#002B49]/90 shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{editingLab ? 'Simpan Perubahan & Sinkronkan' : 'Tambah Laboratorium Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
