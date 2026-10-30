import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  Sliders,
  LogIn,
  ShieldAlert,
  UserCheck,
  Building,
  Mail,
  Phone,
  Calendar,
  Layers,
  X,
  Eye,
  EyeOff,
  Wand2,
  Check,
  Copy,
  Lock,
  Sparkles,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { UserRole, AuthUser, Dosen, Mahasiswa, AdminStaff, PLPStaff } from '../types/sikma';
import { UserAccountItem, INITIAL_USER_ACCOUNTS } from '../data/userList';
import { INITIAL_SEMESTER_LIST } from '../data/semesterList';
import {
  checkPasswordCriteria,
  getPasswordValidationMessage,
  generateCompliantPassword
} from '../utils/passwordPolicy';
import { syncSdmToUserAccounts, syncUserAccountToSdm } from '../utils/syncUserAndSdm';

interface PasswordRequirementsBoxProps {
  password: string;
  title?: string;
  onGenerate?: () => void;
  showGenerateButton?: boolean;
}

const PasswordRequirementsBox: React.FC<PasswordRequirementsBoxProps> = ({
  password,
  title = 'Syarat Sandi: 8 Karakter Kombinasi',
  onGenerate,
  showGenerateButton = true
}) => {
  const criteria = checkPasswordCriteria(password);
  const items = [
    { key: 'minLength', label: 'Min. 8 karakter', met: criteria.minLength },
    { key: 'hasUppercase', label: 'Huruf besar (A-Z)', met: criteria.hasUppercase },
    { key: 'hasLowercase', label: 'Huruf kecil (a-z)', met: criteria.hasLowercase },
    { key: 'hasNumber', label: 'Angka (0-9)', met: criteria.hasNumber },
    { key: 'hasSymbol', label: 'Simbol (!@#$%^&* dll)', met: criteria.hasSymbol }
  ];

  const getBadge = () => {
    if (criteria.isValid) {
      return {
        text: 'Kuat & Sesuai Standar',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        barColor: 'bg-emerald-500'
      };
    }
    if (criteria.score >= 3) {
      return {
        text: 'Hampir Lengkap',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        barColor: 'bg-amber-500'
      };
    }
    return {
      text: 'Belum Memenuhi',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      barColor: 'bg-rose-500'
    };
  };

  const badge = getBadge();

  return (
    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#002B49]" />
          <span>{title}</span>
        </span>
        <div className="flex items-center gap-1.5">
          {showGenerateButton && onGenerate && (
            <button
              type="button"
              onClick={onGenerate}
              className="px-2 py-0.5 bg-[#002B49] text-[#D4AF37] hover:bg-[#003865] rounded text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
              title="Buat kata sandi acak yang memenuhi seluruh kriteria 8 karakter kombinasi"
            >
              <Wand2 className="w-3 h-3" />
              <span>Acak Sandi Kuat</span>
            </button>
          )}
          {password.length > 0 && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
              {badge.text} ({criteria.score}/5)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded transition-colors ${
              item.met
                ? 'text-emerald-800 bg-emerald-50 border border-emerald-200 font-semibold'
                : password.length > 0
                ? 'text-rose-700 bg-rose-50/70 border border-rose-200/60'
                : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            {item.met ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 text-[10px] text-slate-400 font-mono">
                •
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Strength Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-300 ${badge.barColor}`}
          style={{ width: `${(Math.max(password.length > 0 ? criteria.score : 0, 0) / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};

interface UserConfigViewProps {
  currentRole: UserRole;
  currentUser: AuthUser;
  onSwitchUser?: (user: AuthUser) => void;
  dosenList?: Dosen[];
  mahasiswaList?: Mahasiswa[];
  adminList?: AdminStaff[];
  plpList?: PLPStaff[];
  onUpdateDosenList?: (newDosen: Dosen[]) => void;
  onUpdateMahasiswaList?: (newMhs: Mahasiswa[]) => void;
  onUpdateAdminList?: (newAdmin: AdminStaff[]) => void;
  onUpdatePlpList?: (newPlp: PLPStaff[]) => void;
}

export const UserConfigView: React.FC<UserConfigViewProps> = ({
  currentRole,
  currentUser,
  onSwitchUser,
  dosenList = [],
  mahasiswaList = [],
  adminList = [],
  plpList = [],
  onUpdateDosenList,
  onUpdateMahasiswaList,
  onUpdateAdminList,
  onUpdatePlpList
}) => {
  // State for user list with automatic migration for Prof. Hermin and Zuper Admin
  const [userList, setUserList] = useState<UserAccountItem[]>(() => {
    const saved = localStorage.getItem('sikma_user_accounts');
    let list: UserAccountItem[] = INITIAL_USER_ACCOUNTS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch {}
    }

    let modified = false;

    // 1. Ubah peran Prof. Dr. Dra. Hermin Sulistyarti, M.Si menjadi dosen
    list = list.map((u) => {
      if (u.nama.toLowerCase().includes('hermin sulistyarti') && u.role === 'super_admin') {
        modified = true;
        return {
          ...u,
          role: 'dosen' as UserRole,
          username: u.username === 'superadmin' ? 'hermin.sulistyarti' : u.username,
          jabatan: 'Dosen Departemen Kimia FSTeM UB'
        };
      }
      return u;
    });

    // 2. Pastikan akun role super_admin adalah Zuper Admin
    const superAdminAcc = list.find((u) => u.role === 'super_admin');
    if (!superAdminAcc) {
      list = [INITIAL_USER_ACCOUNTS[0], ...list];
      modified = true;
    } else if (superAdminAcc.nama !== 'Zuper Admin') {
      list = list.map((u) =>
        u.role === 'super_admin'
          ? {
              ...u,
              nama: 'Zuper Admin',
              avatarText: 'ZA',
              email: 'zuperadmin@ub.ac.id',
              jabatan: 'Zuper Administrator Sistem SIKMA'
            }
          : u
      );
      modified = true;
    }

    // 3. Pastikan Prof. Hermin tetap terdaftar sebagai dosen
    const hasHermin = list.some((u) => u.nama.toLowerCase().includes('hermin sulistyarti'));
    if (!hasHermin) {
      list.splice(1, 0, INITIAL_USER_ACCOUNTS[1]);
      modified = true;
    }

    if (modified) {
      try {
        localStorage.setItem('sikma_user_accounts', JSON.stringify(list));
      } catch {}
    }

    return list;
  });

  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Auto-sync SDM data into userList when SDM lists change or on mount
  useEffect(() => {
    if (
      dosenList.length > 0 ||
      mahasiswaList.length > 0 ||
      adminList.length > 0 ||
      plpList.length > 0
    ) {
      const res = syncSdmToUserAccounts(
        userList,
        dosenList,
        mahasiswaList,
        adminList,
        plpList
      );
      if (res.addedCount > 0 || res.updatedCount > 0) {
        setUserList(res.updatedUsers);
        try {
          localStorage.setItem('sikma_user_accounts', JSON.stringify(res.updatedUsers));
        } catch {}
      }
    }
  }, [dosenList, mahasiswaList, adminList, plpList]);

  const handleManualSyncSdm = () => {
    const res = syncSdmToUserAccounts(
      userList,
      dosenList,
      mahasiswaList,
      adminList,
      plpList
    );
    saveUsers(res.updatedUsers);
    setSyncNotice(
      `Sinkronisasi Selesai! Sebanyak ${res.totalSynced} akun pengguna telah sinkron dengan menu Sumber Daya Manusia (${res.addedCount} akun baru ditambahkan, ${res.updatedCount} akun diperbarui).`
    );
    setTimeout(() => setSyncNotice(null), 6000);
  };

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'roles-matrix' | 'system-policy'>('users');

  // Pagination State (Limit 10 baris per halaman)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccountItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccountItem | null>(null);
  const [resetPassUser, setResetPassUser] = useState<UserAccountItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassAlert, setShowPassAlert] = useState<string | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [showResetModalPassword, setShowResetModalPassword] = useState(true);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    role: 'mahasiswa' as UserRole,
    identifier: '',
    email: '',
    unit: 'Program Studi S1 Kimia FSTeM UB',
    jabatan: 'Mahasiswa',
    semester: 'Ganjil 2026 / 2027',
    status: 'Aktif' as 'Aktif' | 'Nonaktif' | 'Ditangguhkan',
    noHp: ''
  });

  // Persist helper
  const saveUsers = (updated: UserAccountItem[]) => {
    setUserList(updated);
    localStorage.setItem('sikma_user_accounts', JSON.stringify(updated));
  };

  // Filtered Users
  const filteredUsers = userList.filter((user) => {
    const matchesSearch =
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination calculations (Limit 10 baris per halaman)
  const totalFiltered = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Metrics
  const totalUsers = userList.length;
  const superAdminCount = userList.filter((u) => u.role === 'super_admin').length;
  const adminCount = userList.filter((u) => u.role === 'admin').length;
  const dosenCount = userList.filter((u) => u.role === 'dosen').length;
  const mhsCount = userList.filter((u) => u.role === 'mahasiswa').length;

  if (currentRole === 'mahasiswa') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas: Menu User</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          Menu <strong>User (Manajemen Akun)</strong> tidak dapat diakses oleh peran <strong>Mahasiswa</strong>. Menu ini hanya dapat diakses oleh Administrator dan Dosen.
        </p>
      </div>
    );
  }

  // Handlers
  const handleOpenAddModal = () => {
    setShowModalPassword(false);
    setFormData({
      username: '',
      password: '',
      nama: '',
      role: 'mahasiswa',
      identifier: '',
      email: '',
      unit: 'Program Studi S1 Kimia FSTeM UB',
      jabatan: 'Mahasiswa',
      semester: 'Ganjil 2026 / 2027',
      status: 'Aktif',
      noHp: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccountItem) => {
    setShowModalPassword(false);
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password || '',
      nama: user.nama,
      role: user.role,
      identifier: user.identifier,
      email: user.email,
      unit: user.unit || 'Program Studi S1 Kimia FSTeM UB',
      jabatan: user.jabatan || 'Mahasiswa',
      semester: user.semester || 'Ganjil 2026 / 2027',
      status: user.status,
      noHp: user.noHp || ''
    });
  };

  const handleGenerateAddPassword = () => {
    const generated = generateCompliantPassword();
    setFormData((prev) => ({ ...prev, password: generated }));
    setShowModalPassword(true);
    navigator.clipboard?.writeText(generated);
    setCopiedToast(`Kata sandi kuat "${generated}" berhasil dibuat & disalin ke clipboard!`);
    setTimeout(() => setCopiedToast(null), 3500);
  };

  const handleGenerateResetPassword = () => {
    const generated = generateCompliantPassword();
    setNewPassword(generated);
    setShowResetModalPassword(true);
    navigator.clipboard?.writeText(generated);
    setCopiedToast(`Kata sandi baru "${generated}" berhasil dibuat & disalin ke clipboard!`);
    setTimeout(() => setCopiedToast(null), 3500);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.nama || !formData.email) {
      alert('Mohon lengkapi username, nama lengkap, dan email.');
      return;
    }

    if (!editingUser) {
      const pwdValError = getPasswordValidationMessage(formData.password.trim());
      if (pwdValError) {
        alert(`Gagal membuat akun: ${pwdValError}`);
        return;
      }
    } else if (formData.password.trim()) {
      const pwdValError = getPasswordValidationMessage(formData.password.trim());
      if (pwdValError) {
        alert(`Gagal mengubah kata sandi: ${pwdValError}`);
        return;
      }
    }

    const getInitials = (str: string) => {
      return str
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    };

    if (editingUser) {
      const updated = userList.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              ...formData,
              password: formData.password.trim() ? formData.password.trim() : u.password,
              avatarText: getInitials(formData.nama)
            }
          : u
      );
      saveUsers(updated);
      setEditingUser(null);

      // Sinkronisasi pembaruan ke modul Sumber Daya Manusia
      const savedUser = updated.find((u) => u.id === editingUser.id);
      if (savedUser) {
        const sdmRes = syncUserAccountToSdm(savedUser, {
          dosenList,
          mahasiswaList,
          adminList,
          plpList
        });
        if (sdmRes.newDosenList && onUpdateDosenList) onUpdateDosenList(sdmRes.newDosenList);
        if (sdmRes.newMahasiswaList && onUpdateMahasiswaList) onUpdateMahasiswaList(sdmRes.newMahasiswaList);
        if (sdmRes.newAdminList && onUpdateAdminList) onUpdateAdminList(sdmRes.newAdminList);
        if (sdmRes.newPlpList && onUpdatePlpList) onUpdatePlpList(sdmRes.newPlpList);
      }
      setSyncNotice(`Data akun "${formData.nama}" berhasil disimpan & disinkronkan ke modul Sumber Daya Manusia.`);
      setTimeout(() => setSyncNotice(null), 5000);
    } else {
      const newUser: UserAccountItem = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        ...formData,
        password: formData.password.trim(),
        avatarText: getInitials(formData.nama),
        tanggalDibuat: new Date().toISOString().split('T')[0],
        terakhirLogin: 'Belum pernah login'
      };
      saveUsers([newUser, ...userList]);
      setIsAddModalOpen(false);

      // Sinkronisasi penambahan akun baru ke modul Sumber Daya Manusia
      const sdmRes = syncUserAccountToSdm(newUser, {
        dosenList,
        mahasiswaList,
        adminList,
        plpList
      });
      if (sdmRes.newDosenList && onUpdateDosenList) onUpdateDosenList(sdmRes.newDosenList);
      if (sdmRes.newMahasiswaList && onUpdateMahasiswaList) onUpdateMahasiswaList(sdmRes.newMahasiswaList);
      if (sdmRes.newAdminList && onUpdateAdminList) onUpdateAdminList(sdmRes.newAdminList);
      if (sdmRes.newPlpList && onUpdatePlpList) onUpdatePlpList(sdmRes.newPlpList);

      setSyncNotice(`Akun baru "${newUser.nama}" (${newUser.role.toUpperCase()}) berhasil ditambahkan & otomatis terdaftar di menu Sumber Daya Manusia.`);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  const handleRequestDeleteUser = (user: UserAccountItem) => {
    if (userList.length <= 1) {
      alert('Tidak dapat menghapus satu-satunya user sistem.');
      return;
    }
    setUserToDelete(user);
  };

  const handleDeleteUser = (id: string, _nama: string) => {
    const target = userList.find((u) => u.id === id);
    if (target) {
      handleRequestDeleteUser(target);
    }
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const updated = userList.filter((u) => u.id !== userToDelete.id);
    saveUsers(updated);
    setSyncNotice(`Pengguna "${userToDelete.nama}" (@${userToDelete.username}) berhasil dihapus.`);
    setTimeout(() => setSyncNotice(null), 4000);
    setUserToDelete(null);
  };

  const handleToggleStatus = (id: string) => {
    const updated = userList.map((u) => {
      if (u.id === id) {
        const nextStatus = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        return { ...u, status: nextStatus as 'Aktif' | 'Nonaktif' };
      }
      return u;
    });
    saveUsers(updated);
  };

  const handleResetPasswordConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const pwdValError = getPasswordValidationMessage(newPassword.trim());
    if (pwdValError) {
      alert(`Gagal mereset kata sandi: ${pwdValError}`);
      return;
    }
    if (resetPassUser) {
      const updated = userList.map((u) =>
        u.id === resetPassUser.id ? { ...u, password: newPassword.trim() } : u
      );
      saveUsers(updated);
    }
    setShowPassAlert(`Kata sandi untuk akun "${resetPassUser?.username}" berhasil diatur ulang menjadi: "${newPassword.trim()}"`);
    setResetPassUser(null);
    setNewPassword('');
    setTimeout(() => setShowPassAlert(null), 6000);
  };

  const handleSwitchToUser = (target: UserAccountItem) => {
    if (onSwitchUser) {
      const convertedAuth: AuthUser = {
        id: target.id,
        username: target.username,
        nama: target.nama,
        role: target.role,
        identifier: target.identifier,
        email: target.email,
        avatarText: target.avatarText,
        unit: target.unit,
        jabatan: target.jabatan,
        lastLogin: target.terakhirLogin
      };
      onSwitchUser(convertedAuth);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Username', 'Nama', 'Role', 'NIM/NIP', 'Email', 'Unit', 'Status', 'Terakhir Login'];
    const rows = userList.map((u) => [
      u.id,
      u.username,
      `"${u.nama}"`,
      u.role,
      `"${u.identifier}"`,
      u.email,
      `"${u.unit}"`,
      u.status,
      `"${u.terakhirLogin}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sikma_user_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span className="text-[#002B49] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold">CONFIG</span>
              <span>/</span>
              <span className="text-[#D4AF37] font-bold">USER</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#002B49] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#D4AF37]" />
              Manajemen User & Akun SIKMA
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Pusat konfigurasi pengguna, autentikasi single sign-on, peranan (Zuper Admin, Admin, Dosen, Mahasiswa),
              dan manajemen hak akses civitas akademika Departemen Kimia FSTeM UB.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-sync-user-sdm"
              onClick={handleManualSyncSdm}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Sinkronisasikan data pengguna dengan menu Sumber Daya Manusia (Dosen, Mahasiswa, Admin, PLP)"
            >
              <RefreshCw className="w-4 h-4 text-emerald-200" />
              <span>Sinkronkan SDM</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-sm cursor-pointer"
              title="Ekspor CSV User SIKMA"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Ekspor Data</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] text-[#D4AF37] font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm ring-1 ring-[#D4AF37]/30 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah User</span>
            </button>
          </div>
        </div>

        {/* Sync Feedback Notice */}
        {syncNotice && (
          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-300 text-blue-950 rounded-xl text-xs flex items-center justify-between font-semibold animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <button onClick={() => setSyncNotice(null)} className="text-blue-700 hover:text-blue-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Alert Banner */}
        {showPassAlert && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{showPassAlert}</span>
            </div>
            <button onClick={() => setShowPassAlert(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SDM Synchronization Integration Status Strip */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-900">Sinkronisasi SDM Aktif:</span>
            <span className="text-slate-600">
              Terhubung dengan {dosenList.length} Dosen, {mahasiswaList.length} Mahasiswa, {adminList.length} Admin, dan {plpList.length} PLP.
            </span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] font-bold text-[#002B49] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <span>Total SDM Terintegrasi: {dosenList.length + mahasiswaList.length + adminList.length + plpList.length} Personel</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total User</div>
            <div className="text-xl font-extrabold text-[#002B49] mt-0.5">{totalUsers}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pengguna terdaftar</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-purple-700 uppercase">Zuper Admin</div>
            <div className="text-xl font-extrabold text-purple-900 mt-0.5">{superAdminCount}</div>
            <div className="text-[10px] text-purple-600 mt-0.5">Pimpinan Dept</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-amber-700 uppercase">Admin Jurusan</div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">{adminCount}</div>
            <div className="text-[10px] text-amber-600 mt-0.5">Staf TU & Laboran</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-blue-700 uppercase">Dosen</div>
            <div className="text-xl font-extrabold text-blue-900 mt-0.5">{dosenCount}</div>
            <div className="text-[10px] text-blue-600 mt-0.5">Dosen PA / Riset</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase">Mahasiswa</div>
            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{mhsCount}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">S1 Kimia Aktif</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs under Config */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeSubTab === 'users'
              ? 'border-[#002B49] text-[#002B49]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar User Akun ({filteredUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('roles-matrix')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeSubTab === 'roles-matrix'
              ? 'border-[#002B49] text-[#002B49]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Matriks Hak Akses (RBAC)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('system-policy')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeSubTab === 'system-policy'
              ? 'border-[#002B49] text-[#002B49]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Konfigurasi Sesi & Keamanan</span>
        </button>
      </div>

      {/* Subtab 1: User List */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-b-xl shadow-sm border border-slate-200 border-t-0 p-5 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari user berdasarkan nama, username, NIM/NIP, email..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">Role:</span>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              >
                <option value="all">Semua Peran</option>
                <option value="super_admin">Zuper Admin</option>
                <option value="admin">Admin Jurusan</option>
                <option value="dosen">Dosen</option>
                <option value="mahasiswa">Mahasiswa</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002B49] text-white uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Username & ID</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Unit / Departemen</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Terakhir Login</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ditemukan pengguna yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const isSelf = currentUser?.username === user.username;
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-inner shrink-0 ${
                                user.role === 'super_admin'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : user.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : user.role === 'dosen'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {user.avatarText}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{user.nama}</span>
                                {isSelf && (
                                  <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-semibold text-slate-800">@{user.username}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{user.identifier}</div>
                          {user.password && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1 font-mono">
                              <span className="text-slate-400">Pass:</span>
                              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                                {user.password}
                              </span>
                              {checkPasswordCriteria(user.password).isValid ? (
                                <span
                                  className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold"
                                  title="Memenuhi standar keamanan: 8 karakter kombinasi huruf besar, kecil, angka, dan simbol"
                                >
                                  ✓ Standar
                                </span>
                              ) : (
                                <span
                                  className="text-[9px] bg-rose-100 text-rose-700 border border-rose-300 px-1.5 py-0.2 rounded font-bold"
                                  title="Belum memenuhi standar 8 karakter kombinasi"
                                >
                                  ! Lemah
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(user.password || '');
                                  setCopiedToast(`Kata sandi "${user.password}" disalin!`);
                                  setTimeout(() => setCopiedToast(null), 3000);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-700 rounded"
                                title="Salin kata sandi akun ini"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              user.role === 'super_admin'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : user.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : user.role === 'dosen'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {user.role === 'super_admin'
                              ? 'Zuper Admin'
                              : user.role === 'admin'
                              ? 'Admin Jurusan'
                              : user.role === 'dosen'
                              ? 'Dosen'
                              : 'Mahasiswa'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={user.unit}>
                          {user.unit}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              user.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                            title="Klik untuk mengubah status aktif/nonaktif"
                          >
                            {user.status === 'Aktif' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            )}
                            <span>{user.status}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {user.terakhirLogin}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Switch to this user */}
                            <button
                              onClick={() => handleSwitchToUser(user)}
                              title={`Uji Coba: Masuk Sebagai ${user.nama}`}
                              className="p-1.5 rounded text-sky-700 hover:bg-sky-50 transition-colors"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => setResetPassUser(user)}
                              title="Reset Password"
                              className="p-1.5 rounded text-amber-700 hover:bg-amber-50 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              title="Ubah Profil User"
                              className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleRequestDeleteUser(user)}
                              disabled={isSelf}
                              title={isSelf ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus User'}
                              className={`p-1.5 rounded transition-colors ${
                                isSelf ? 'text-slate-300 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50 cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Pagination Controls (Limit 10 baris per halaman) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600">
              <span>Menampilkan</span>
              <span className="font-bold text-slate-900">
                {totalFiltered === 0 ? 0 : startIndex + 1} - {endIndex}
              </span>
              <span>dari</span>
              <span className="font-bold text-slate-900">{totalFiltered}</span>
              <span>pengguna</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Baris per hal:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className={`p-1.5 rounded border ${
                  safeCurrentPage === 1
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                    : 'text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                } transition-colors`}
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                className={`px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1 ${
                  safeCurrentPage === 1
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                    : 'text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                } transition-colors`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - safeCurrentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | string)[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                      acc.push(`dots-${page}`);
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item) => {
                    if (typeof item === 'string') {
                      return (
                        <span key={item} className="px-1.5 text-slate-400">
                          ...
                        </span>
                      );
                    }
                    const isActive = item === safeCurrentPage;
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`min-w-7 h-7 px-2 rounded text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#002B49] text-[#D4AF37] shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages}
                className={`px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1 ${
                  safeCurrentPage === totalPages
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                    : 'text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                } transition-colors`}
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className={`p-1.5 rounded border ${
                  safeCurrentPage === totalPages
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                    : 'text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                } transition-colors`}
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: RBAC Matrix */}
      {activeSubTab === 'roles-matrix' && (
        <div className="bg-white rounded-b-xl shadow-sm border border-slate-200 border-t-0 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Matriks Hak Akses & Perizinan (RBAC SIKMA)</h3>
              <p className="text-xs text-slate-500">
                Pemetaan hak akses baca (Read), tulis (Create/Edit), verifikasi (Approve), dan hapus (Delete) berdasarkan peranan.
              </p>
            </div>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-300">
              Auth Middleware CI3: verify_role()
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Modul / Fitur</th>
                  <th className="py-3 px-4 text-center">Zuper Admin</th>
                  <th className="py-3 px-4 text-center">Admin Jurusan</th>
                  <th className="py-3 px-4 text-center">Dosen</th>
                  <th className="py-3 px-4 text-center">Mahasiswa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    Config & Manajemen User SIKMA
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold">Penuh (CRUD)</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">Kelola Mahasiswa/Dosen</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">Hanya Lihat Profil Sendiri</td>
                  <td className="py-3 px-4 text-center text-slate-400">Hanya Lihat Profil Sendiri</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    Master Data Tenaga Pendidik (Dosen)
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">Kelola & SK</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">Tambah / Edit / Kuota</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">Lihat Profil & Rekan Dosen</td>
                  <td className="py-3 px-4 text-center text-slate-600">Lihat Dosen Pembimbing</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    Logbook Riset Laboratorium Kimia
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold">Audit Menyeluruh</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">Verifikasi Lab & Alat</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold">Verifikasi Pembimbing</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">Input Catatan & Foto</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    Jadwal Seminar Proposal & Sidang Skripsi
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold">Persetujuan & SK Penguji</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">Plotting Ruangan & Jadwal</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold">Input Nilai Penguji</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">Pendaftaran & Lihat Jadwal</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    Kegiatan Luar Kampus (KLK / PKL / MBKM)
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold">Pengesahan SK Jurusan</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">Penerbitan Surat Pengantar</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold">Pembimbingan Lapangan</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">Pendaftaran & Logbook KLK</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: System Security & Session Policy */}
      {activeSubTab === 'system-policy' && (
        <div className="bg-white rounded-b-xl shadow-sm border border-slate-200 border-t-0 p-5 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Kebijakan Sesi & Keamanan Portal Kimia UB</h3>
            <p className="text-xs text-slate-500">
              Konfigurasi parameter sesi CodeIgniter 3, enkripsi password, dan kebijakan keamanan portal akademik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#002B49]">
                <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                <span>Aturan Kata Sandi & Akun</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <strong className="text-slate-800">Kebijakan Kata Sandi:</strong> Wajib minimal 8 karakter kombinasi huruf besar (A-Z), huruf kecil (a-z), angka (0-9), dan simbol khusus (!@#$%^&*).
                </li>
                <li>Dosen dan Tenaga Kependidikan terhubung dengan NIP resmi Universitas Brawijaya.</li>
                <li>Mahasiswa terhubung dengan NIM resmi Fakultas MIPA UB angkatan aktif.</li>
                <li>Akun dinonaktifkan secara otomatis bila mahasiswa lulus atau mutasi.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#002B49]">
                <Layers className="w-4 h-4 text-[#002B49]" />
                <span>Konfigurasi Sesi CodeIgniter 3</span>
              </div>
              <div className="text-xs font-mono bg-slate-900 text-slate-200 p-3 rounded space-y-1">
                <div className="text-amber-400">// application/config/config.php</div>
                <div>$config['sess_driver'] = 'files';</div>
                <div>$config['sess_cookie_name'] = 'sikma_ci_session';</div>
                <div>$config['sess_expiration'] = 7200; // 2 Jam</div>
                <div>$config['sess_save_path'] = sys_get_temp_dir();</div>
                <div>$config['sess_match_ip'] = TRUE;</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit User */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D4AF37]" />
                {editingUser ? 'Ubah Data Akun Pengguna' : 'Tambah Pengguna Baru SIKMA'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    placeholder="misal: ahmad.rizky"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peran (Role) *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  >
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="dosen">Dosen</option>
                    <option value="admin">Admin Jurusan</option>
                    <option value="super_admin">Zuper Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="misal: Dr. Sc. Akhmad Sabarudin / Ahmad Rizky Pratama"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIM / NIP *</label>
                  <input
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    placeholder="NIM. 215090... / NIP. 1974..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi UB *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@ub.ac.id"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Kata Sandi (Password) {editingUser ? <span className="text-slate-400 font-normal">(Opsional)</span> : <span className="text-rose-500">*</span>}
                    </label>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-medium border border-slate-200">
                      8+ Karakter (A-Z, a-z, 0-9, Simbol)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateAddPassword}
                      className="text-[11px] font-bold text-[#002B49] hover:text-[#004b80] flex items-center gap-1 bg-amber-100/80 hover:bg-amber-200/80 px-2 py-0.5 rounded transition-colors"
                      title="Otomatis buat kata sandi acak yang memenuhi seluruh kriteria kebijakan"
                    >
                      <Wand2 className="w-3 h-3 text-amber-700" />
                      <span>Buat Sandi Acak</span>
                    </button>
                    {editingUser && (
                      <span className="text-[10px] text-slate-400">Kosongkan jika tidak diubah</span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={
                      editingUser
                        ? 'Ketik sandi baru (min. 8 karakter kombinasi huruf besar, kecil, angka, simbol)...'
                        : 'Masukkan kata sandi (min. 8 karakter kombinasi huruf besar, kecil, angka, simbol)'
                    }
                    className="w-full pl-3 pr-20 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                    {formData.password && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(formData.password);
                          setCopiedToast(`Kata sandi "${formData.password}" disalin!`);
                          setTimeout(() => setCopiedToast(null), 3000);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        title="Salin Kata Sandi"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      title={showModalPassword ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                    >
                      {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Requirements checklist */}
                {(!editingUser || formData.password.length > 0) && (
                  <PasswordRequirementsBox
                    password={formData.password}
                    onGenerate={handleGenerateAddPassword}
                    showGenerateButton={false}
                  />
                )}

                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  {editingUser
                    ? 'Kata sandi ini digunakan untuk masuk dari halaman awal website portal SIKMA.'
                    : 'Kata sandi ini digunakan untuk login dari halaman awal website bersama Username, NIM, atau NIP.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Status *</label>
                  <select
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Admin">Admin</option>
                    <option value="Dosen">Dosen</option>
                    <option value="PLP">PLP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  >
                    {INITIAL_SEMESTER_LIST.map((sem) => (
                      <option key={sem.id} value={sem.namaSemester}>
                        {sem.namaSemester} {sem.status === 'Aktif' ? '(Aktif)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Program Studi *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  >
                    <option value="Program Studi S1 Kimia FSTeM UB">Program Studi S1 Kimia FSTeM UB</option>
                    <option value="Program Studi S2 Kimia FSTeM UB">Program Studi S2 Kimia FSTeM UB</option>
                    <option value="Program Studi S3 Kimia FSTeM UB">Program Studi S3 Kimia FSTeM UB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Akun *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] text-[#D4AF37] font-bold rounded-lg text-xs shadow-sm"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Daftarkan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-amber-600">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">Reset Kata Sandi Pengguna</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetPassUser(null);
                  setNewPassword('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Atur ulang kata sandi untuk akun <span className="font-bold font-mono text-[#002B49]">@{resetPassUser.username}</span> ({resetPassUser.nama}).
            </p>

            <form onSubmit={handleResetPasswordConfirm} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Kata Sandi Baru</label>
                  <button
                    type="button"
                    onClick={handleGenerateResetPassword}
                    className="text-[11px] font-bold text-[#002B49] hover:text-[#004b80] flex items-center gap-1 bg-amber-100/80 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors"
                    title="Buat kata sandi baru secara otomatis yang memenuhi standar"
                  >
                    <Wand2 className="w-3 h-3 text-amber-700" />
                    <span>Buat Sandi Acak</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetModalPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 karakter (huruf besar, kecil, angka, simbol)..."
                    className="w-full pl-3 pr-20 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                    {newPassword && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(newPassword);
                          setCopiedToast(`Kata sandi "${newPassword}" disalin!`);
                          setTimeout(() => setCopiedToast(null), 3000);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        title="Salin Kata Sandi"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowResetModalPassword(!showResetModalPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      title={showResetModalPassword ? 'Sembunyikan' : 'Lihat'}
                    >
                      {showResetModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <PasswordRequirementsBox
                  password={newPassword}
                  onGenerate={handleGenerateResetPassword}
                  showGenerateButton={false}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetPassUser(null);
                    setNewPassword('');
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002B49] hover:bg-[#003865] text-[#D4AF37] font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Simpan Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus User */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Konfirmasi Hapus User</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="my-4 p-4 bg-rose-50/70 border border-rose-200 rounded-lg text-slate-700">
              <p className="font-bold text-rose-950 text-sm mb-2">Anda Yakin Menghapus User?</p>
              <div className="text-xs text-slate-600 space-y-1.5 bg-white/90 p-3 rounded-md border border-rose-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <strong className="text-slate-800 text-right">{userToDelete.nama}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username:</span>
                  <code className="font-mono text-[#002B49] font-bold">@{userToDelete.username}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peran:</span>
                  <span className="font-medium text-slate-700 capitalize">{userToDelete.role.replace('_', ' ')}</span>
                </div>
                {userToDelete.identifier && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">NIP / NIM:</span>
                    <span className="font-mono text-slate-700">{userToDelete.identifier}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                id="btn-batal-hapus-user"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-semibold transition-all cursor-pointer"
              >
                Tidak
              </button>
              <button
                type="button"
                id="btn-ya-hapus-user"
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast notification for copied password */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-2.5 rounded-lg shadow-xl border border-[#D4AF37]/50 flex items-center gap-2.5 text-xs animate-bounce font-medium">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>{copiedToast}</span>
        </div>
      )}
    </div>
  );
};
