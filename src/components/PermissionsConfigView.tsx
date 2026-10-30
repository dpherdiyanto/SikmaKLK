import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  RotateCcw,
  PlusCircle,
  Users,
  UserCheck,
  GraduationCap,
  Sparkles,
  Info,
  Check,
  X,
  History,
  FileCode,
  Layers,
  HelpCircle,
  Sliders,
  Crown,
  AlertTriangle,
  UserPlus,
  ArrowRight,
  Trash2,
  Edit2
} from 'lucide-react';
import { UserRole } from '../types/sikma';
import { UserAccountItem, INITIAL_USER_ACCOUNTS } from '../data/userList';

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module: 'SDM' | 'Skripsi & Tesis' | 'Laboratorium' | 'Config' | 'Layanan & Info';
  description: string;
  riskLevel: 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
  isSystemCore?: boolean;
  super_admin: boolean;
  admin: boolean;
  dosen: boolean;
  mahasiswa: boolean;
}

export const INITIAL_PERMISSIONS: PermissionItem[] = [
  // Modul SDM
  {
    id: 'perm-1',
    code: 'dosen.view',
    name: 'Lihat Direktori Data Dosen & PA',
    module: 'SDM',
    description: 'Akses melihat profil dosen, kepakaran riset, kontak, dan kuota bimbingan',
    riskLevel: 'Rendah',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: true
  },
  {
    id: 'perm-2',
    code: 'dosen.create',
    name: 'Tambah Data Dosen Baru',
    module: 'SDM',
    description: 'Mendaftarkan dosen baru ke dalam pangkalan data SIKMA Departemen Kimia UB',
    riskLevel: 'Tinggi',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-3',
    code: 'dosen.edit',
    name: 'Edit Data Dosen & Biodata Riset',
    module: 'SDM',
    description: 'Memperbarui profil, bidang riset, kuota bimbingan, ruang kantor, dan kontak',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: false
  },
  {
    id: 'perm-4',
    code: 'dosen.delete',
    name: 'Hapus Data Dosen',
    module: 'SDM',
    description: 'Menghapus data master dosen secara permanen dari basis data sistem',
    riskLevel: 'Kritis',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-5',
    code: 'dosen.assign_student',
    name: 'Tugaskan Mahasiswa Bimbingan',
    module: 'SDM',
    description: 'Menugaskan mahasiswa bimbingan skripsi / tesis ke dosen pembimbing',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: false
  },
  {
    id: 'perm-6',
    code: 'admin.manage',
    name: 'Manajemen Data Admin Departemen',
    module: 'SDM',
    description: 'Mengelola data staf administrasi dan operator departemen kimia',
    riskLevel: 'Kritis',
    isSystemCore: true,
    super_admin: true,
    admin: false,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-7',
    code: 'plp.manage',
    name: 'Manajemen Data PLP (Laboran)',
    module: 'SDM',
    description: 'Mengelola staf Pranata Laboratorium Pendidikan pada masing-masing laboratorium',
    riskLevel: 'Tinggi',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },

  // Modul Skripsi & Tesis
  {
    id: 'perm-8',
    code: 'skripsi.view',
    name: 'Lihat Daftar Tugas Akhir / Skripsi / Tesis',
    module: 'Skripsi & Tesis',
    description: 'Melihat status tahapan skripsi, pembimbing, dan judul mahasiswa',
    riskLevel: 'Rendah',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: true
  },
  {
    id: 'perm-9',
    code: 'skripsi.propose',
    name: 'Pengajuan Judul Skripsi & Dosen Pembimbing',
    module: 'Skripsi & Tesis',
    description: 'Mengirimkan usulan judul skripsi, proposal, dan pilihan dosen pembimbing',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: true
  },
  {
    id: 'perm-10',
    code: 'skripsi.verify',
    name: 'Verifikasi Tahapan & Seminar Skripsi',
    module: 'Skripsi & Tesis',
    description: 'Memvalidasi kelayakan mahasiswa maju ujian seminar proposal, hasil, atau sidang',
    riskLevel: 'Tinggi',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: false
  },
  {
    id: 'perm-11',
    code: 'skripsi.grade',
    name: 'Input & Edit Nilai Sidang Skripsi',
    module: 'Skripsi & Tesis',
    description: 'Mengisi nilai evaluasi pembimbing, penguji, dan yudisium kelulusan',
    riskLevel: 'Kritis',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: false
  },
  {
    id: 'perm-12',
    code: 'skripsi.bebas_lab',
    name: 'Verifikasi Surat Bebas Laboratorium',
    module: 'Skripsi & Tesis',
    description: 'Pemeriksaan pengembalian alat, kebersihan bahan, dan penerbitan bukti bebas lab',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },

  // Modul Laboratorium
  {
    id: 'perm-13',
    code: 'lab.view_catalog',
    name: 'Katalog Instrumen & Bahan Kimia',
    module: 'Laboratorium',
    description: 'Melihat spesifikasi alat canggih (GC-MS, FTIR, HPLC) dan stok reagen kimia',
    riskLevel: 'Rendah',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: true
  },
  {
    id: 'perm-14',
    code: 'lab.borrow',
    name: 'Pengajuan Bon Alat & Pengambilan Bahan',
    module: 'Laboratorium',
    description: 'Membuat formulir permohonan peminjaman alat gelas dan permintaan bahan praktikum/riset',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: true
  },
  {
    id: 'perm-15',
    code: 'lab.approve_borrow',
    name: 'Persetujuan Bon Alat & Dispensasi Lab',
    module: 'Laboratorium',
    description: 'Verifikasi kelayakan peminjaman alat riset dan izin kerja laboratorium malam/libur',
    riskLevel: 'Tinggi',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-16',
    code: 'lab.logbook',
    name: 'Pengisian & Verifikasi Logbook Riset',
    module: 'Laboratorium',
    description: 'Input progres riset laboratorium harian serta verifikasi oleh dosen mentor',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: true
  },

  // Modul Config
  {
    id: 'perm-17',
    code: 'config.permissions',
    name: 'Konfigurasi RBAC Permissions',
    module: 'Config',
    description: 'Mengatur matriks perizinan dan wewenang hak akses per peran sistem',
    riskLevel: 'Kritis',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-18',
    code: 'config.user',
    name: 'Manajemen Akun User & Sandi',
    module: 'Config',
    description: 'Mengelola daftar pengguna, reset password, dan status aktif akun',
    riskLevel: 'Kritis',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-19',
    code: 'config.semester',
    name: 'Pengaturan Semester Akademik',
    module: 'Config',
    description: 'Mengatur semester aktif, tahun ajaran, dan status arsip akademik',
    riskLevel: 'Tinggi',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-20',
    code: 'config.instansi',
    name: 'Manajemen Instansi Mitra',
    module: 'Config',
    description: 'Pengelolaan data mitra kerja sama industri, PKL, dan perjanjian kerja sama (PKS)',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-21',
    code: 'config.jajaran',
    name: 'Konfigurasi Jajaran Pimpinan Departemen',
    module: 'Config',
    description: 'Pengaturan susunan pejabat pimpinan (Kadept, Sekdept, KPS S1/S2)',
    riskLevel: 'Tinggi',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-22',
    code: 'config.ruangan',
    name: 'Manajemen Ruangan & Fasilitas',
    module: 'Config',
    description: 'Pengaturan master data ruang kuliah, ruang seminar, dan ruang laboratorium',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-23',
    code: 'config.arsip',
    name: 'Manajemen Master Berkas & Arsip',
    module: 'Config',
    description: 'Pengelolaan repositori dokumen resmi, kategori arsip, dan berkas akreditasi',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },

  // Modul Layanan & Info
  {
    id: 'perm-24',
    code: 'surat.request',
    name: 'Pengajuan Surat & Izin Survei',
    module: 'Layanan & Info',
    description: 'Mengajukan surat pengantar penelitian, surat aktif kuliah, dan rekomendasi',
    riskLevel: 'Rendah',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: true
  },
  {
    id: 'perm-25',
    code: 'surat.process',
    name: 'Disposisi & Penerbitan Surat Dinas',
    module: 'Layanan & Info',
    description: 'Verifikasi, penomoran resmi, dan penerbitan berkas surat bertanda tangan digital',
    riskLevel: 'Tinggi',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  },
  {
    id: 'perm-26',
    code: 'agenda.manage',
    name: 'Pengelolaan Agenda Kegiatan Departemen',
    module: 'Layanan & Info',
    description: 'Menjadwalkan agenda rapat dosen, workshop instrumen, dan seminar tamu',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: false
  },
  {
    id: 'perm-27',
    code: 'pengumuman.post',
    name: 'Publikasi Pengumuman & Berita',
    module: 'Layanan & Info',
    description: 'Menyiarkan pengumuman penting akademik dan kemahasiswaan ke dashboard',
    riskLevel: 'Sedang',
    isSystemCore: true,
    super_admin: true,
    admin: true,
    dosen: true,
    mahasiswa: false
  }
];

interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  detail: string;
}

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-21 20:00:15',
    user: 'superadmin_ub',
    role: 'SUPER_ADMIN',
    action: 'POLICY_ENFORCE',
    detail: 'Menegakkan kebijakan otoritas: Super Admin memegang kendali penuh mutlak; Admin dibatasi secara operasional.'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-20 06:40:12',
    user: 'dp.herdiyanto@gmail.com',
    role: 'SUPER_ADMIN',
    action: 'UPDATE_PERMISSION',
    detail: 'Menampilkan tombol Edit Data Dosen untuk role Dosen pada Manajemen Data Dosen'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-20 06:33:04',
    user: 'admin_kimia',
    role: 'ADMIN',
    action: 'RESTRICT_ROLE',
    detail: 'Menyembunyikan tombol Tambah Dosen Baru & Hapus Data Dosen untuk peran Dosen'
  }
];

interface PermissionsConfigViewProps {
  currentRole: UserRole;
  onNavigate?: (tab: string) => void;
}

export const PermissionsConfigView: React.FC<PermissionsConfigViewProps> = ({ currentRole, onNavigate }) => {
  // If student or lecturer somehow lands here, deny access with informative message
  if (currentRole !== 'super_admin' && currentRole !== 'admin') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          Menu <strong>Permissions</strong> hanya dapat diakses oleh pengguna dengan peran <strong>Super Admin</strong> dan <strong>Admin Departemen</strong>.
          <br /><br />
          Peran Anda saat ini (<span className="font-semibold text-rose-700 capitalize">{currentRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}</span>) tidak memiliki izin untuk melihat atau mengonfigurasi wewenang keamanan sistem SIKMA.
        </p>
        {onNavigate && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 bg-[#002B49] text-white rounded-xl text-xs font-bold hover:bg-[#003865] transition-all shadow-sm cursor-pointer"
          >
            Kembali ke Dashboard Utama
          </button>
        )}
      </div>
    );
  }

  const isSuperAdmin = currentRole === 'super_admin';
  const isAdmin = currentRole === 'admin';

  // State for permissions with localStorage persistence
  const [permissions, setPermissions] = useState<PermissionItem[]>(() => {
    const saved = localStorage.getItem('sikma_rbac_permissions');
    return saved ? JSON.parse(saved) : INITIAL_PERMISSIONS;
  });

  // State for user accounts to support role assignment/distribution
  const [userAccounts, setUserAccounts] = useState<UserAccountItem[]>(() => {
    const saved = localStorage.getItem('sikma_users');
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('sikma_rbac_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [activeRoleView, setActiveRoleView] = useState<'all' | UserRole>('all');
  const [activeTabSection, setActiveTabSection] = useState<'matrix' | 'role_assignment'>('matrix');

  // Modal State
  const [isNewPermModalOpen, setIsNewPermModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // New Permission Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newModule, setNewModule] = useState<'SDM' | 'Skripsi & Tesis' | 'Laboratorium' | 'Config' | 'Layanan & Info'>('SDM');
  const [newDesc, setNewDesc] = useState('');
  const [newRisk, setNewRisk] = useState<'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah'>('Sedang');
  const [newRoles, setNewRoles] = useState<Record<UserRole, boolean>>({
    super_admin: true,
    admin: true,
    dosen: false,
    mahasiswa: false
  });

  // Alert feedback
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4500);
  };

  const savePermissions = (updated: PermissionItem[]) => {
    setPermissions(updated);
    localStorage.setItem('sikma_rbac_permissions', JSON.stringify(updated));
  };

  const saveUserAccounts = (updated: UserAccountItem[]) => {
    setUserAccounts(updated);
    localStorage.setItem('sikma_users', JSON.stringify(updated));
  };

  const addAuditLog = (action: string, detail: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp,
      user: isSuperAdmin ? 'Super Administrator UB' : 'Admin Departemen Kimia',
      role: currentRole.toUpperCase(),
      action,
      detail
    };

    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('sikma_rbac_audit_logs', JSON.stringify(updated));
  };

  // Toggle single role permission
  const handleToggle = (permId: string, role: UserRole) => {
    const item = permissions.find((p) => p.id === permId);
    if (!item) return;

    // Rule: Admin cannot modify or revoke Super Admin permissions
    if (role === 'super_admin' && !isSuperAdmin) {
      showAlert('Akses Ditolak: Admin Departemen tidak diizinkan mengubah atau mencabut hak tingkat Super Admin.', 'error');
      return;
    }

    // Special safeguard for Super Admin: root security permissions cannot be toggled off accidentally
    if (role === 'super_admin' && (item.code === 'config.permissions' || item.code === 'config.user')) {
      if (item.super_admin) {
        showAlert('Demi integritas sistem, hak akses dasar Super Admin pada modul keamanan tidak dapat dinonaktifkan.', 'info');
        return;
      }
    }

    const newVal = !item[role];
    const updated = permissions.map((p) => (p.id === permId ? { ...p, [role]: newVal } : p));
    savePermissions(updated);

    addAuditLog(
      newVal ? 'ENABLE_PERMISSION' : 'DISABLE_PERMISSION',
      `${newVal ? 'Mengaktifkan' : 'Menonaktifkan'} hak akses "${item.name}" (${item.code}) untuk peran ${role.toUpperCase()}`
    );

    showAlert(`Hak akses "${item.name}" untuk peran ${role.toUpperCase()} berhasil ${newVal ? 'diaktifkan' : 'dinonaktifkan'}.`);
  };

  // Delete permission (Super Admin only, non-core only)
  const handleDeletePermission = (perm: PermissionItem) => {
    if (!isSuperAdmin) {
      showAlert('Akses Ditolak: Hanya Super Admin yang berhak menghapus permissions sistem.', 'error');
      return;
    }

    if (perm.isSystemCore) {
      showAlert(`Permission "${perm.code}" adalah struktur dasar sistem bawaan UB dan tidak dapat dihapus.`, 'error');
      return;
    }

    if (window.confirm(`Hapus permission "${perm.name}" (${perm.code}) secara permanen dari sistem?`)) {
      const updated = permissions.filter((p) => p.id !== perm.id);
      savePermissions(updated);
      addAuditLog('DELETE_PERMISSION', `Menghapus custom permission "${perm.name}" (${perm.code})`);
      showAlert(`Permission "${perm.name}" berhasil dihapus.`);
    }
  };

  // Reset to UB defaults (Super Admin only)
  const handleResetDefaults = () => {
    if (!isSuperAdmin) {
      showAlert('Akses Ditolak: Hanya Super Admin dengan wewenang mutlak yang dapat mereset konfigurasi struktur dasar sistem.', 'error');
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh matriks hak akses ke standar default SIKMA Kimia UB?')) {
      savePermissions(INITIAL_PERMISSIONS);
      addAuditLog('RESET_DEFAULTS', 'Mereset seluruh matriks hak akses ke konfigurasi awal bawaan sistem');
      showAlert('Matriks hak akses RBAC berhasil dikembalikan ke standar default UB.');
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(permissions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sikma_rbac_permissions_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showAlert('Konfigurasi matriks RBAC berhasil diunduh dalam format JSON.');
  };

  // Handle Add New Custom Permission (Super Admin or Admin with operational restriction)
  const handleAddNewPermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newDesc) {
      showAlert('Harap lengkapi kode, nama, dan deskripsi permission.', 'error');
      return;
    }

    // Check duplicate code
    if (permissions.some((p) => p.code.toLowerCase() === newCode.trim().toLowerCase())) {
      showAlert(`Kode permission "${newCode}" sudah terdaftar dalam sistem.`, 'error');
      return;
    }

    // Admin cannot grant Super Admin rights to a new permission unless Super Admin allows
    const superAdminGranted = isSuperAdmin ? newRoles.super_admin : true;

    const newPerm: PermissionItem = {
      id: `perm-${Date.now()}`,
      code: newCode.trim().toLowerCase(),
      name: newName.trim(),
      module: newModule,
      description: newDesc.trim(),
      riskLevel: newRisk,
      isSystemCore: false,
      super_admin: superAdminGranted,
      admin: newRoles.admin,
      dosen: newRoles.dosen,
      mahasiswa: newRoles.mahasiswa
    };

    const updated = [newPerm, ...permissions];
    savePermissions(updated);
    addAuditLog('ADD_CUSTOM_PERMISSION', `Menambahkan permission baru: "${newPerm.name}" (${newPerm.code}) oleh ${currentRole.toUpperCase()}`);

    setIsNewPermModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewDesc('');
    showAlert(`Permission baru "${newPerm.name}" berhasil didaftarkan.`);
  };

  // Handle Role Assignment to User (Distribusi Peran)
  const handleAssignRoleToUser = (userId: string, newRole: UserRole) => {
    const targetUser = userAccounts.find((u) => u.id === userId);
    if (!targetUser) return;

    // Rule: Admin cannot assign or promote accounts to Super Admin or Admin
    if (isAdmin && (newRole === 'super_admin' || newRole === 'admin')) {
      showAlert('Akses Terbatas: Sebagai Admin, Anda hanya berhak menetapkan role "Dosen" atau "Mahasiswa". Role Super Admin dan Admin hanya dapat ditetapkan oleh Super Admin.', 'error');
      return;
    }

    // Rule: Admin cannot modify an existing Super Admin account
    if (isAdmin && targetUser.role === 'super_admin') {
      showAlert('Akses Ditolak: Admin tidak diizinkan mengubah status peran akun tingkat Super Admin.', 'error');
      return;
    }

    const updated = userAccounts.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    saveUserAccounts(updated);

    addAuditLog(
      'ASSIGN_USER_ROLE',
      `Menetapkan peran ${newRole.toUpperCase()} kepada akun "${targetUser.nama}" (${targetUser.identifier}) oleh ${currentRole.toUpperCase()}`
    );

    showAlert(`Peran akun "${targetUser.nama}" berhasil diperbarui menjadi "${newRole === 'super_admin' ? 'Super Admin' : newRole === 'admin' ? 'Admin Dept' : newRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}".`);
  };

  // Filtered Permissions
  const filteredPermissions = permissions.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchModule = selectedModule === 'all' || p.module === selectedModule;
    const matchRisk = selectedRisk === 'all' || p.riskLevel === selectedRisk;

    return matchSearch && matchModule && matchRisk;
  });

  // Calculate stats
  const totalCount = permissions.length;
  const superAdminCount = permissions.filter((p) => p.super_admin).length;
  const adminCount = permissions.filter((p) => p.admin).length;
  const dosenCount = permissions.filter((p) => p.dosen).length;
  const mhsCount = permissions.filter((p) => p.mahasiswa).length;

  return (
    <div className="space-y-6">
      {/* Alert Notification Toast */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl shadow-lg border flex items-center justify-between transition-all animate-in fade-in slide-in-from-top-2 ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : alertMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            {alertMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {alertMessage.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
            {alertMessage.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
            <span className="text-sm font-medium">{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="p-1 rounded-md hover:bg-black/5 text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner - Official UB Theme */}
      <div className="bg-[#002B49] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border-b-4 border-[#D4AF37]">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Shield className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-[#D4AF37] text-[#002B49]">
                  Config &bull; Security RBAC
                </span>

                {/* Role Authority Indicator Badge */}
                {isSuperAdmin ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Kendali Penuh & Mutlak (Super Admin)
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    Wewenang Operasional Terbatas (Admin Dept)
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
                Permissions & Hak Akses
              </h1>

              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                {isSuperAdmin ? (
                  <span>
                    <strong>Super Admin</strong> memegang kendali penuh dan mutlak atas sistem. Anda berhak membuat, mengubah, menghapus, serta mendistribusikan permissions atau mengatur roles (peran) kepada semua tingkat pengguna.
                  </span>
                ) : (
                  <span>
                    <strong>Admin Departemen</strong> memiliki hak untuk mengakses dan mengelola permissions secara operasional dan terbatas (menetapkan role Dosen dan Mahasiswa). Hak tingkat Super Admin dan struktur dasar sistem terproteksi.
                  </span>
                )}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                title="Lihat riwayat perubahan izin akses"
              >
                <History className="w-4 h-4 text-[#D4AF37]" />
                Log Audit
              </button>

              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                title="Unduh konfigurasi RBAC dalam format JSON"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                Ekspor JSON
              </button>

              {/* Reset Defaults button: Active for Super Admin, Disabled with tooltip for Admin */}
              {isSuperAdmin ? (
                <button
                  onClick={handleResetDefaults}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold border border-rose-300/30 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  title="Kembalikan seluruh hak akses ke standar awal UB"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Default
                </button>
              ) : (
                <button
                  disabled
                  className="px-3.5 py-2 rounded-xl bg-slate-700/50 text-slate-400 text-xs font-medium border border-slate-600/30 flex items-center gap-2 cursor-not-allowed opacity-60"
                  title="Hanya Super Admin yang berhak mereset struktur dasar permissions sistem"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Reset (Khusus Super Admin)
                </button>
              )}

              {/* Tambah Permission Baru */}
              <button
                onClick={() => setIsNewPermModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-[#002B49] text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Tambah Permission
              </button>
            </div>
          </div>

          {/* Authority Scope Notification Callout */}
          <div className="mt-5 p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-start gap-3 text-xs">
            {isSuperAdmin ? (
              <>
                <Crown className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div className="text-slate-100 leading-relaxed">
                  <strong className="text-[#D4AF37]">Mode Kendali Penuh Aktif:</strong> Anda memiliki hak akses tanpa batas. Anda dapat mengubah matriks izin untuk peran Super Admin, Admin Dept, Dosen PA, dan Mahasiswa, serta mengatur/mendistribusikan peran kepada semua pengguna sistem.
                </div>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <div className="text-slate-100 leading-relaxed">
                  <strong className="text-amber-300">Wewenang Operasional Terbatas:</strong> Anda dapat mengelola wewenang untuk peran Dosen dan Mahasiswa, serta menetapkan peran Dosen atau Mahasiswa kepada akun. Kolom izin Super Admin terkunci untuk menjaga keamanan struktur dasar sistem.
                </div>
              </>
            )}
          </div>

          {/* Quick RBAC Role Cards */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15">
            {/* Super Admin */}
            <div
              onClick={() => setActiveRoleView(activeRoleView === 'super_admin' ? 'all' : 'super_admin')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                activeRoleView === 'super_admin'
                  ? 'bg-white/20 border-[#D4AF37] shadow-sm'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-purple-200 font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Super Admin
                </span>
                <span className="text-[10px] bg-purple-400/30 px-1.5 py-0.5 rounded font-mono">
                  {superAdminCount}/{totalCount}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {isSuperAdmin ? 'Kendali Penuh & Mutlak' : 'Terproteksi (Hanya Super Admin)'}
              </div>
            </div>

            {/* Admin Departemen */}
            <div
              onClick={() => setActiveRoleView(activeRoleView === 'admin' ? 'all' : 'admin')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                activeRoleView === 'admin'
                  ? 'bg-white/20 border-[#D4AF37] shadow-sm'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-amber-200 font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                  Admin Dept
                </span>
                <span className="text-[10px] bg-amber-400/30 px-1.5 py-0.5 rounded font-mono">
                  {adminCount}/{totalCount}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">Operasional & Manajerial</div>
            </div>

            {/* Dosen PA / Pembimbing */}
            <div
              onClick={() => setActiveRoleView(activeRoleView === 'dosen' ? 'all' : 'dosen')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                activeRoleView === 'dosen'
                  ? 'bg-white/20 border-[#D4AF37] shadow-sm'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-blue-200 font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-300" />
                  Dosen PA / Riset
                </span>
                <span className="text-[10px] bg-blue-400/30 px-1.5 py-0.5 rounded font-mono">
                  {dosenCount}/{totalCount}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">Dikelola oleh Super Admin & Admin</div>
            </div>

            {/* Mahasiswa */}
            <div
              onClick={() => setActiveRoleView(activeRoleView === 'mahasiswa' ? 'all' : 'mahasiswa')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                activeRoleView === 'mahasiswa'
                  ? 'bg-white/20 border-[#D4AF37] shadow-sm'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-emerald-200 font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                  Mahasiswa
                </span>
                <span className="text-[10px] bg-emerald-400/30 px-1.5 py-0.5 rounded font-mono">
                  {mhsCount}/{totalCount}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">Dikelola oleh Super Admin & Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation: Matriks Permissions vs Distribusi Roles */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTabSection('matrix')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTabSection === 'matrix'
              ? 'border-[#002B49] text-[#002B49]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Matriks Permissions Sistem
        </button>

        <button
          onClick={() => setActiveTabSection('role_assignment')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTabSection === 'role_assignment'
              ? 'border-[#002B49] text-[#002B49]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Distribusi & Penugasan Role Pengguna
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-mono">
            {userAccounts.length} Akun
          </span>
        </button>
      </div>

      {activeTabSection === 'matrix' ? (
        <>
          {/* Filter and Control Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari permission, kode (cth: dosen.edit), atau deskripsi..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Module Filter */}
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
              >
                <option value="all">Semua Modul (8 Kategori)</option>
                <option value="SDM">SDM (Dosen, Admin, PLP)</option>
                <option value="Skripsi & Tesis">Skripsi, Tesis & Sidang</option>
                <option value="Laboratorium">Laboratorium & Riset</option>
                <option value="Config">Config & Keamanan</option>
                <option value="Layanan & Info">Layanan Surat & Info</option>
              </select>

              {/* Risk Level Filter */}
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
              >
                <option value="all">Semua Tingkat Risiko</option>
                <option value="Kritis">Tingkat: Kritis (Root/Delete)</option>
                <option value="Tinggi">Tingkat: Tinggi (Create/Verify)</option>
                <option value="Sedang">Tingkat: Sedang (Edit/Request)</option>
                <option value="Rendah">Tingkat: Rendah (Read-only)</option>
              </select>
            </div>

            {/* View Mode Role Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveRoleView('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeRoleView === 'all'
                    ? 'bg-white text-[#002B49] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Role (Matriks)
              </button>
              <button
                onClick={() => setActiveRoleView('super_admin')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  activeRoleView === 'super_admin'
                    ? 'bg-purple-100 text-purple-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Super Admin
              </button>
              <button
                onClick={() => setActiveRoleView('admin')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  activeRoleView === 'admin'
                    ? 'bg-amber-100 text-amber-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setActiveRoleView('dosen')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  activeRoleView === 'dosen'
                    ? 'bg-blue-100 text-blue-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dosen
              </button>
              <button
                onClick={() => setActiveRoleView('mahasiswa')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  activeRoleView === 'mahasiswa'
                    ? 'bg-emerald-100 text-emerald-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mahasiswa
              </button>
            </div>
          </div>

          {/* Permissions Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#002B49]" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Matriks Hak Akses Terdaftar ({filteredPermissions.length} item)
                </span>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                {isSuperAdmin ? (
                  <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
                    <Crown className="w-3 h-3 text-[#D4AF37]" /> Akses Penuh Semua Role
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Akses Operasional (Dosen & Mahasiswa)
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 w-10 text-center">No</th>
                    <th className="px-4 py-3">Nama Permission & Deskripsi</th>
                    <th className="px-4 py-3 w-28">Modul</th>
                    <th className="px-4 py-3 w-24 text-center">Risiko</th>

                    {(activeRoleView === 'all' || activeRoleView === 'super_admin') && (
                      <th className="px-3 py-3 w-32 text-center bg-purple-50/70 text-purple-900 border-l border-slate-200">
                        <div className="flex items-center justify-center gap-1">
                          <Crown className="w-3 h-3 text-[#D4AF37]" />
                          <span>Super Admin</span>
                        </div>
                      </th>
                    )}
                    {(activeRoleView === 'all' || activeRoleView === 'admin') && (
                      <th className="px-3 py-3 w-28 text-center bg-amber-50/70 text-amber-900 border-l border-slate-200">
                        Admin Dept
                      </th>
                    )}
                    {(activeRoleView === 'all' || activeRoleView === 'dosen') && (
                      <th className="px-3 py-3 w-28 text-center bg-blue-50/70 text-blue-900 border-l border-slate-200">
                        Dosen PA
                      </th>
                    )}
                    {(activeRoleView === 'all' || activeRoleView === 'mahasiswa') && (
                      <th className="px-3 py-3 w-28 text-center bg-emerald-50/70 text-emerald-900 border-l border-slate-200">
                        Mahasiswa
                      </th>
                    )}

                    {isSuperAdmin && (
                      <th className="px-3 py-3 w-16 text-center border-l border-slate-200">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 font-normal">
                  {filteredPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">Tidak ada permission yang sesuai filter.</p>
                        <p className="text-[11px] mt-1">Coba ubah kata kunci pencarian atau setel ulang filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPermissions.map((perm, idx) => {
                      return (
                        <tr key={perm.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                              <span>{perm.name}</span>
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {perm.code}
                              </span>
                              {perm.isSystemCore && (
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                  Core UB
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{perm.description}</p>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {perm.module}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                perm.riskLevel === 'Kritis'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : perm.riskLevel === 'Tinggi'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : perm.riskLevel === 'Sedang'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {perm.riskLevel}
                            </span>
                          </td>

                          {/* Super Admin Toggle Column */}
                          {(activeRoleView === 'all' || activeRoleView === 'super_admin') && (
                            <td className="px-3 py-3 text-center bg-purple-50/30 border-l border-slate-200">
                              {isSuperAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggle(perm.id, 'super_admin')}
                                  className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer shadow-xs ${
                                    perm.super_admin
                                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                                      : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                  }`}
                                  title={
                                    perm.super_admin
                                      ? 'Super Admin: Diizinkan (Klik untuk mengubah)'
                                      : 'Super Admin: Ditolak (Klik untuk mengizinkan)'
                                  }
                                >
                                  {perm.super_admin ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                </button>
                              ) : (
                                // For Admin: Super Admin is strictly locked / protected
                                <div
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-400 border border-slate-200 text-[10px] cursor-not-allowed select-none"
                                  title="Terkunci: Admin tidak diizinkan mengubah atau mencabut hak tingkat Super Admin."
                                  onClick={() => showAlert('Akses Ditolak: Admin Departemen tidak diizinkan mengubah atau mencabut hak tingkat Super Admin.', 'error')}
                                >
                                  <Lock className="w-3 h-3 text-slate-400" />
                                  <span>{perm.super_admin ? 'Aktif' : 'Nonaktif'}</span>
                                </div>
                              )}
                            </td>
                          )}

                          {/* Admin Toggle Column */}
                          {(activeRoleView === 'all' || activeRoleView === 'admin') && (
                            <td className="px-3 py-3 text-center bg-amber-50/30 border-l border-slate-200">
                              {isSuperAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggle(perm.id, 'admin')}
                                  className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer shadow-xs ${
                                    perm.admin
                                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                                      : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                  }`}
                                  title={
                                    perm.admin
                                      ? 'Admin Dept: Diizinkan (Klik untuk mengubah)'
                                      : 'Admin Dept: Ditolak (Klik untuk mengizinkan)'
                                  }
                                >
                                  {perm.admin ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                </button>
                              ) : (
                                // Admin viewing Admin role
                                <button
                                  type="button"
                                  onClick={() => handleToggle(perm.id, 'admin')}
                                  className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer shadow-xs ${
                                    perm.admin
                                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                                      : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                  }`}
                                  title="Admin Dept: Ubah izin wewenang operasional"
                                >
                                  {perm.admin ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </td>
                          )}

                          {/* Dosen Toggle Column - Both Super Admin and Admin can manage */}
                          {(activeRoleView === 'all' || activeRoleView === 'dosen') && (
                            <td className="px-3 py-3 text-center bg-blue-50/30 border-l border-slate-200">
                              <button
                                type="button"
                                onClick={() => handleToggle(perm.id, 'dosen')}
                                className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer shadow-xs ${
                                  perm.dosen
                                    ? 'bg-[#002B49] text-[#D4AF37] hover:bg-[#003865]'
                                    : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                }`}
                                title={
                                  perm.dosen
                                    ? 'Dosen PA: Diizinkan (Klik untuk mengubah)'
                                    : 'Dosen PA: Ditolak (Klik untuk mengizinkan)'
                                }
                              >
                                {perm.dosen ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          )}

                          {/* Mahasiswa Toggle Column - Both Super Admin and Admin can manage */}
                          {(activeRoleView === 'all' || activeRoleView === 'mahasiswa') && (
                            <td className="px-3 py-3 text-center bg-emerald-50/30 border-l border-slate-200">
                              <button
                                type="button"
                                onClick={() => handleToggle(perm.id, 'mahasiswa')}
                                className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer shadow-xs ${
                                  perm.mahasiswa
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                }`}
                                title={
                                  perm.mahasiswa
                                    ? 'Mahasiswa: Diizinkan (Klik untuk mengubah)'
                                    : 'Mahasiswa: Ditolak (Klik untuk mengizinkan)'
                                }
                              >
                                {perm.mahasiswa ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          )}

                          {/* Super Admin Action Column: Delete Custom Permission */}
                          {isSuperAdmin && (
                            <td className="px-3 py-3 text-center border-l border-slate-200">
                              {!perm.isSystemCore ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeletePermission(perm)}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                                  title="Hapus Custom Permission"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-300 font-mono">-</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Info */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  {isSuperAdmin
                    ? 'Super Admin: Kendali mutlak aktif. Perubahan hak akses tersimpan otomatis ke database SIKMA dan dicatat di Log Audit.'
                    : 'Admin Departemen: Wewenang operasional aktif (Dosen & Mahasiswa). Kolom Super Admin dilindungi demi integritas keamanan.'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">SIKMA-RBAC v2.4 &bull; FSTeM UB</span>
            </div>
          </div>
        </>
      ) : (
        /* SECTION 2: Role Assignment & Distribution */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#002B49]" />
                Distribusi & Penetapan Peran Pengguna SIKMA
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSuperAdmin
                  ? 'Sebagai Super Admin, Anda berhak mendistribusikan dan mengubah peran semua tingkat pengguna (Super Admin, Admin, Dosen, Mahasiswa).'
                  : 'Sebagai Admin, Anda dapat menetapkan role "Dosen" atau "Mahasiswa" kepada akun pengguna. Role tingkat Super Admin dan Admin terproteksi.'}
              </p>
            </div>

            <div className="text-xs font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700">
              Total {userAccounts.length} Akun Terdaftar
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">No</th>
                  <th className="px-4 py-3">Nama Pengguna & Identitas</th>
                  <th className="px-4 py-3">Unit & Jabatan</th>
                  <th className="px-4 py-3 w-36">Peran Saat Ini</th>
                  <th className="px-4 py-3 w-56">Penetapan Peran (Role Distribution)</th>
                  <th className="px-4 py-3 w-28 text-center">Status Akun</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {userAccounts.map((user, idx) => {
                  const isUserSuperAdmin = user.role === 'super_admin';
                  const canEditThisUser = isSuperAdmin || (isAdmin && !isUserSuperAdmin);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 text-xs">{user.nama}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.identifier} &bull; {user.email}</div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 text-xs">
                        <div>{user.jabatan}</div>
                        <div className="text-[10px] text-slate-400">{user.unit}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : user.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : user.role === 'dosen'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {user.role === 'super_admin' && <Crown className="w-3 h-3 text-[#D4AF37]" />}
                          {user.role === 'admin' && <UserCheck className="w-3 h-3" />}
                          {user.role === 'dosen' && <Users className="w-3 h-3" />}
                          {user.role === 'mahasiswa' && <GraduationCap className="w-3 h-3" />}
                          {user.role === 'super_admin'
                            ? 'Super Admin'
                            : user.role === 'admin'
                            ? 'Admin Dept'
                            : user.role === 'dosen'
                            ? 'Dosen PA'
                            : 'Mahasiswa'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {canEditThisUser ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={user.role}
                              onChange={(e) => handleAssignRoleToUser(user.id, e.target.value as UserRole)}
                              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#002B49] cursor-pointer"
                            >
                              {/* Super Admin option: Only selectable by Super Admin */}
                              {isSuperAdmin && (
                                <option value="super_admin">👑 Super Admin</option>
                              )}
                              {/* Admin option: Selectable by Super Admin, or if already admin */}
                              {isSuperAdmin && (
                                <option value="admin">🛡️ Admin Departemen</option>
                              )}
                              {/* Operational roles: Always selectable by Super Admin and Admin */}
                              <option value="dosen">👨‍🏫 Dosen PA / Pembimbing</option>
                              <option value="mahasiswa">🎓 Mahasiswa</option>
                            </select>
                            <span className="text-[10px] text-slate-400">Pilih role</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 w-fit">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Terproteksi (Tingkat Super Admin)</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Perubahan role pengguna akan langsung mempengaruhi hak akses login dan navigasi fitur yang tersedia bagi akun bersangkutan.
            </span>
          </div>
        </div>
      )}

      {/* MODAL 1: Tambah Custom Permission */}
      {isNewPermModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-5 bg-[#002B49] text-white flex items-center justify-between border-b-2 border-[#D4AF37]">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  Tambah Permission Baru
                </h3>
                <p className="text-xs text-slate-300">Daftarkan hak akses modular baru ke dalam sistem SIKMA</p>
              </div>
              <button
                onClick={() => setIsNewPermModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewPermission} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kode Identifier Permission <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Contoh: laboratorium.kalibrasi_alat"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] font-mono"
                />
                <span className="text-[10px] text-slate-400">Gunakan format modul.aksi huruf kecil tanpa spasi</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Wewenang / Fitur <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Kalibrasi & Sertifikasi Instrumen Lab"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modul Sistem</label>
                  <select
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  >
                    <option value="SDM">SDM</option>
                    <option value="Skripsi & Tesis">Skripsi & Tesis</option>
                    <option value="Laboratorium">Laboratorium</option>
                    <option value="Config">Config</option>
                    <option value="Layanan & Info">Layanan & Info</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Risiko</label>
                  <select
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  >
                    <option value="Rendah">Rendah (Read-only)</option>
                    <option value="Sedang">Sedang (Proses data)</option>
                    <option value="Tinggi">Tinggi (Verifikasi/Create)</option>
                    <option value="Kritis">Kritis (Delete/Root)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Hak Akses <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Jelaskan batas wewenang dan cakupan fungsi permission ini..."
                  rows={2}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">Penugasan Peran Awal (Default Active)</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRoles.super_admin}
                      onChange={(e) => setNewRoles({ ...newRoles, super_admin: e.target.checked })}
                      disabled={!isSuperAdmin}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-purple-900 flex items-center gap-1">
                      Super Admin {!isSuperAdmin && <Lock className="w-3 h-3 text-slate-400" />}
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRoles.admin}
                      onChange={(e) => setNewRoles({ ...newRoles, admin: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-amber-900">Admin Dept</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRoles.dosen}
                      onChange={(e) => setNewRoles({ ...newRoles, dosen: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-blue-900">Dosen PA</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRoles.mahasiswa}
                      onChange={(e) => setNewRoles({ ...newRoles, mahasiswa: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-emerald-900">Mahasiswa</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPermModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] text-white rounded-lg font-bold hover:bg-[#003865] flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  Simpan Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Audit Logs */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-5 bg-[#002B49] text-white flex items-center justify-between border-b-2 border-[#D4AF37]">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-[#D4AF37]" />
                  Log Audit Perubahan Hak Akses RBAC
                </h3>
                <p className="text-xs text-slate-300">Catatan kronologis perubahan wewenang dan kebijakan izin sistem</p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-mono text-slate-600">{log.timestamp}</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">
                      {log.action}
                    </span>
                  </div>
                  <div className="font-medium text-slate-900">{log.detail}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <span>Oleh: <strong className="text-slate-800">{log.user}</strong></span>
                    <span>&bull;</span>
                    <span className="text-purple-700 font-semibold">{log.role}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 bg-[#002B49] text-white rounded-lg text-xs font-bold hover:bg-[#003865]"
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
