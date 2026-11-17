import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Upload,
  FileSpreadsheet,
  FileText,
  Table,
  AlertTriangle,
  Filter,
  Sliders,
  ShieldAlert,
  ShieldCheck,
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
import { UserRole, AuthUser, Dosen, Mahasiswa, AdminStaff, PLPStaff, PembimbingLapanganStaff, PengajuanKLK, LogbookLabItem, JadwalSeminar, SuratPengajuan, isMahasiswaRole, getUserRoleLabel, normalizeMahasiswaRole } from '../types/sikma';
import { UserAccountItem, INITIAL_USER_ACCOUNTS, NIM_NIP_MIGRATION_FLAG, migrateUsernamesToNimNip } from '../data/userList';
import { INITIAL_SEMESTER_LIST } from '../data/semesterList';
import {
  checkPasswordCriteria,
  getPasswordValidationMessage,
  generateCompliantPassword,
  isHashedPassword,
  hashPassword,
  formatHashedPasswordPreview
} from '../utils/passwordPolicy';
import {
  syncSdmToUserAccounts,
  syncUserAccountToSdm,
  syncBidirectionalUsersAndSdm,
  syncUserDeleteToSdm,
  syncUserStatusToSdm,
  syncUserEditAcrossAllModules,
  syncUserDeleteAcrossAllModules
} from '../utils/syncUserAndSdm';

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
  onLogout?: () => void;
  userList?: UserAccountItem[];
  onUpdateUserList?: (newUsers: UserAccountItem[]) => void;
  dosenList?: Dosen[];
  mahasiswaList?: Mahasiswa[];
  adminList?: AdminStaff[];
  plpList?: PLPStaff[];
  pembimbingLapanganList?: PembimbingLapanganStaff[];
  klkList?: PengajuanKLK[];
  logbooks?: LogbookLabItem[];
  seminarList?: JadwalSeminar[];
  suratList?: SuratPengajuan[];
  onSyncAllModules?: (
    dList?: Dosen[],
    mList?: Mahasiswa[],
    aList?: AdminStaff[],
    pList?: PLPStaff[],
    kList?: PengajuanKLK[],
    uList?: UserAccountItem[],
    pbList?: PembimbingLapanganStaff[],
    logList?: LogbookLabItem[],
    semList?: JadwalSeminar[],
    surList?: SuratPengajuan[]
  ) => void;
  onUpdateDosenList?: (newDosen: Dosen[]) => void;
  onUpdateMahasiswaList?: (newMhs: Mahasiswa[]) => void;
  onUpdateAdminList?: (newAdmin: AdminStaff[]) => void;
  onUpdatePlpList?: (newPlp: PLPStaff[]) => void;
  onUpdatePembimbingLapanganList?: (newPb: PembimbingLapanganStaff[]) => void;
}

export const UserConfigView: React.FC<UserConfigViewProps> = ({
  currentRole,
  currentUser,
  onLogout,
  userList: userListProp,
  onUpdateUserList,
  dosenList = [],
  mahasiswaList = [],
  adminList = [],
  plpList = [],
  pembimbingLapanganList = [],
  klkList = [],
  logbooks = [],
  seminarList = [],
  suratList = [],
  onSyncAllModules,
  onUpdateDosenList,
  onUpdateMahasiswaList,
  onUpdateAdminList,
  onUpdatePlpList,
  onUpdatePembimbingLapanganList
}) => {
  // State for user list with automatic migration for Prof. Hermin and Zuper Admin
  const [userList, setUserList] = useState<UserAccountItem[]>(() => {
    let source = (userListProp && userListProp.length > 0) ? userListProp : null;
    if (!source) {
      const saved = localStorage.getItem('sikma_user_accounts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            source = parsed;
          }
        } catch {}
      }
    }
    const normalizeRoleSafe = (rawRole: unknown, unitOrJab?: string): UserRole => {
      const r = String(rawRole || '').trim().toLowerCase();
      if (r === 'super_admin' || r === 'super admin' || r === 'superadmin') return 'super_admin';
      return normalizeMahasiswaRole(rawRole as string, unitOrJab);
    };
    let list: UserAccountItem[] = (source || INITIAL_USER_ACCOUNTS)
      .filter((u): u is UserAccountItem => !!u && typeof u === 'object')
      .map((u) => ({
        ...u,
        id: u.id || `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nama: typeof u.nama === 'string' ? u.nama : ((u as any)?.name || u.username || 'Pengguna'),
        username: typeof u.username === 'string' ? u.username : `user.${u.role || 'sikma'}`,
        identifier: typeof u.identifier === 'string' ? u.identifier : '',
        email: typeof u.email === 'string' ? u.email : `${u.username || 'user'}@ub.ac.id`,
        role: normalizeRoleSafe(u.role, u.unit || u.jabatan),
        status: u.status || 'Aktif',
        unit: typeof u.unit === 'string' ? u.unit : '',
        jabatan: typeof u.jabatan === 'string' ? u.jabatan : '',
        avatarText: typeof u.avatarText === 'string' ? u.avatarText : 'UB'
      }));

    let modified = false;

    // Pastikan selalu ada minimal satu akun role super_admin agar filter Super Admin selalu ditemukan
    if (!list.some((u) => u.role === 'super_admin')) {
      const seedSuperAdmin = INITIAL_USER_ACCOUNTS.find((u) => u.role === 'super_admin') || INITIAL_USER_ACCOUNTS[0];
      list = [seedSuperAdmin, ...list];
      modified = true;
    }

    if (!userListProp || userListProp.length === 0) {
      // 1. Ubah peran Prof. Dr. Dra. Hermin Sulistyarti, M.Si menjadi dosen
      list = list.map((u) => {
        const uNama = (u.nama || '').toLowerCase();
        if (uNama.includes('hermin sulistyarti') && u.role === 'super_admin') {
          modified = true;
          return {
            ...u,
            role: 'dosen' as UserRole,
            username: u.username === 'superadmin' ? '196403211989032001' : u.username,
            jabatan: 'Dosen Departemen Kimia FSTeM UB'
          };
        }
        return u;
      });

      // 2. Pastikan akun role super_admin adalah Zuper Admin jika sebelumnya tertukar
      const superAdminAcc = list.find((u) => u.role === 'super_admin');
      if (!superAdminAcc) {
        list = [INITIAL_USER_ACCOUNTS[0], ...list];
        modified = true;
      }

      // 3. Migrasi satu kali agar Prof. Hermin terdaftar sebagai dosen tanpa mengembalikan data jika sudah dihapus manual
      try {
        if (!localStorage.getItem('sikma_hermin_migrated_v1')) {
          const hasHermin = list.some((u) => (u.nama || '').toLowerCase().includes('hermin sulistyarti'));
          if (!hasHermin) {
            list.splice(1, 0, INITIAL_USER_ACCOUNTS[1]);
            modified = true;
          }
          localStorage.setItem('sikma_hermin_migrated_v1', 'true');
        }
        // 4. Migrasi satu kali agar akun tambahan Mahasiswa S2 dan Mahasiswa S3 tersedia tanpa mengembalikan jika sudah dihapus manual
        if (!localStorage.getItem('sikma_mhs_s1_s2_s3_migrated_v1')) {
          for (const extraRole of ['mahasiswa_s2', 'mahasiswa_s3'] as const) {
            if (!list.some((u) => u.role === extraRole)) {
              const seedUser = INITIAL_USER_ACCOUNTS.find((u) => u.role === extraRole);
              if (seedUser) {
                list.push(seedUser);
                modified = true;
              }
            }
          }
          localStorage.setItem('sikma_mhs_s1_s2_s3_migrated_v1', 'true');
        }
        // 5. Migrasi satu kali untuk menjadikan NIM (Mahasiswa) & NIP (Dosen/Admin/PLP) sebagai username login (kecuali Super Admin & Eksternal)
        if (!localStorage.getItem(NIM_NIP_MIGRATION_FLAG)) {
          const migRes = migrateUsernamesToNimNip(list);
          list = migRes.migrated;
          localStorage.setItem(NIM_NIP_MIGRATION_FLAG, 'true');
          if (migRes.changed) modified = true;
        }
      } catch {}

      if (modified) {
        try {
          localStorage.setItem('sikma_user_accounts', JSON.stringify(list));
          localStorage.setItem('sikma_users', JSON.stringify(list));
        } catch {}
      }
    }

    return list;
  });

  // Sinkronisasi state lokal saat prop userList dari App diperbarui
  useEffect(() => {
    if (userListProp && userListProp.length > 0) {
      const normalizeRoleSafe = (rawRole: unknown, unitOrJab?: string): UserRole => {
        const r = String(rawRole || '').trim().toLowerCase();
        if (r === 'super_admin' || r === 'super admin' || r === 'superadmin') return 'super_admin';
        return normalizeMahasiswaRole(rawRole as string, unitOrJab);
      };
      const sanitized = userListProp
        .filter((u): u is UserAccountItem => !!u && typeof u === 'object')
        .map((u) => ({
          ...u,
          id: u.id || `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nama: typeof u.nama === 'string' ? u.nama : ((u as any)?.name || u.username || 'Pengguna'),
          username: typeof u.username === 'string' ? u.username : `user.${u.role || 'sikma'}`,
          identifier: typeof u.identifier === 'string' ? u.identifier : '',
          email: typeof u.email === 'string' ? u.email : `${u.username || 'user'}@ub.ac.id`,
          role: normalizeRoleSafe(u.role, u.unit || u.jabatan),
          status: u.status || 'Aktif',
          unit: typeof u.unit === 'string' ? u.unit : '',
          jabatan: typeof u.jabatan === 'string' ? u.jabatan : '',
          avatarText: typeof u.avatarText === 'string' ? u.avatarText : 'UB'
        }));
      if (!sanitized.some((u) => u.role === 'super_admin')) {
        const seedSuperAdmin = INITIAL_USER_ACCOUNTS.find((u) => u.role === 'super_admin') || INITIAL_USER_ACCOUNTS[0];
        sanitized.unshift(seedSuperAdmin);
      }
      setUserList(sanitized);
    }
  }, [userListProp]);

  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleManualSyncSdm = () => {
    const bidir = syncBidirectionalUsersAndSdm(
      userList,
      dosenList,
      mahasiswaList,
      adminList,
      plpList,
      pembimbingLapanganList
    );
    const diffSummary = syncSdmToUserAccounts(
      userList,
      bidir.syncedDosen,
      bidir.syncedMahasiswa,
      bidir.syncedAdmin,
      bidir.syncedPlp,
      bidir.syncedPembimbingLapangan
    );

    saveUsers(bidir.syncedUsers);
    if (onSyncAllModules) {
      onSyncAllModules(
        bidir.syncedDosen,
        bidir.syncedMahasiswa,
        bidir.syncedAdmin,
        bidir.syncedPlp,
        klkList,
        bidir.syncedUsers,
        bidir.syncedPembimbingLapangan,
        logbooks,
        seminarList,
        suratList
      );
    } else {
      if (onUpdateDosenList) onUpdateDosenList(bidir.syncedDosen);
      if (onUpdateMahasiswaList) onUpdateMahasiswaList(bidir.syncedMahasiswa);
      if (onUpdateAdminList) onUpdateAdminList(bidir.syncedAdmin);
      if (onUpdatePlpList) onUpdatePlpList(bidir.syncedPlp);
      if (onUpdatePembimbingLapanganList) onUpdatePembimbingLapanganList(bidir.syncedPembimbingLapangan);
    }
    setSyncNotice(
      `Sinkronisasi 2 Arah Selesai! Sebanyak ${bidir.syncedUsers.length} akun pengguna telah tersinkronisasi penuh dengan menu SDM & KLK (${diffSummary.addedCount} akun baru ditambahkan, ${diffSummary.updatedCount} akun diperbarui).`
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
  const [modalError, setModalError] = useState<string | null>(null);
  const [resetPassError, setResetPassError] = useState<string | null>(null);
  const canBulkDelete = currentRole === 'super_admin' || currentRole === 'admin';
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Import CSV Modal States
  interface ParsedCsvUserRow {
    rowNumber: number;
    username: string;
    password: string;
    passwordAutoGenerated: boolean;
    nama: string;
    role: UserRole;
    rawRole: string;
    email: string;
    identifier: string;
    unit: string;
    jabatan: string;
    semester: string;
    status: 'Aktif' | 'Nonaktif';
    noHp: string;
    isDuplicateUsername: boolean;
    duplicateType?: 'username';
    duplicateReason?: string;
    matchedExistingId?: string;
    error?: string;
  }
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importFileSize, setImportFileSize] = useState<number>(0);
  const [importRawText, setImportRawText] = useState<string>('');
  const [importRawMatrix, setImportRawMatrix] = useState<string[][]>([]);
  const [importDetectedDelimiter, setImportDetectedDelimiter] = useState<string>('Koma (,)');
  const [importPreviewTab, setImportPreviewTab] = useState<'parsed' | 'raw_table' | 'raw_text'>('parsed');
  const [importPreviewFilter, setImportPreviewFilter] = useState<'all' | 'ready' | 'duplicate' | 'error'>('all');
  const [importPreviewSearch, setImportPreviewSearch] = useState<string>('');
  const [importPreviewRows, setImportPreviewRows] = useState<ParsedCsvUserRow[]>([]);
  const [importParseError, setImportParseError] = useState<string | null>(null);
  const [importDuplicateMode, setImportDuplicateMode] = useState<'skip' | 'update'>('skip');
  const [autoHashImportPassword, setAutoHashImportPassword] = useState<boolean>(true);
  const [isImportingCsv, setIsImportingCsv] = useState<boolean>(false);
  const [isDragOverCsv, setIsDragOverCsv] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    role: 'mahasiswa_s1' as UserRole,
    identifier: '',
    email: '',
    unit: 'Program Studi S1 Kimia - FMIPA Universitas Brawijaya',
    jabatan: 'Mahasiswa S1',
    semester: 'Ganjil 2026 / 2027',
    status: 'Aktif' as 'Aktif' | 'Nonaktif' | 'Ditangguhkan',
    noHp: ''
  });

  // Persist helper without firing conflicting multi-syncs
  const persistUserList = (updated: UserAccountItem[]) => {
    setUserList(updated);
    try {
      localStorage.setItem('sikma_user_accounts', JSON.stringify(updated));
      localStorage.setItem('sikma_users', JSON.stringify(updated));
    } catch {}
  };

  const saveUsers = (updated: UserAccountItem[]) => {
    persistUserList(updated);
    if (onUpdateUserList) {
      onUpdateUserList(updated);
    }
  };

  // Filtered Users
  const filteredUsers = userList.filter((user) => {
    if (!user) return false;
    const sTerm = (searchTerm || '').trim().toLowerCase();
    const userNama = (typeof user.nama === 'string' ? user.nama : ((user as any)?.name || user.username || '')).toLowerCase();
    const userUsername = (typeof user.username === 'string' ? user.username : '').toLowerCase();
    const userIdentifier = (typeof user.identifier === 'string' ? user.identifier : '').toLowerCase();
    const userEmail = (typeof user.email === 'string' ? user.email : '').toLowerCase();

    const matchesSearch =
      !sTerm ||
      userNama.includes(sTerm) ||
      userUsername.includes(sTerm) ||
      userIdentifier.includes(sTerm) ||
      userEmail.includes(sTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return Boolean(matchesSearch && matchesRole && matchesStatus);
  });

  // Pagination calculations (Limit 10 baris per halaman)
  const totalFiltered = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const superAdminTotal = useMemo(
    () => userList.filter((u) => u.role === 'super_admin').length,
    [userList]
  );

  const isUserDeleteProtected = (u: UserAccountItem) => {
    if (currentUser?.username === u.username) return true;
    if (u.role === 'super_admin' && (currentRole !== 'super_admin' || superAdminTotal <= 1)) return true;
    return false;
  };

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => {
        const target = userList.find((u) => u.id === id);
        return target ? !isUserDeleteProtected(target) : false;
      })
    );
  }, [userList, currentUser?.username, currentRole, superAdminTotal]);

  const selectableFilteredIds = useMemo(
    () =>
      filteredUsers
        .filter((u) => !isUserDeleteProtected(u))
        .map((u) => u.id)
        .filter(Boolean),
    [filteredUsers, currentUser?.username, currentRole, superAdminTotal]
  );

  const allFilteredSelected =
    selectableFilteredIds.length > 0 && selectableFilteredIds.every((id) => selectedIds.includes(id));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !selectableFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...selectableFilteredIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Metrics
  const totalUsers = userList.length;
  const superAdminCount = userList.filter((u) => u.role === 'super_admin').length;
  const adminCount = userList.filter((u) => u.role === 'admin').length;
  const dosenCount = userList.filter((u) => u.role === 'dosen').length;
  const mhsS1Count = userList.filter((u) => u.role === 'mahasiswa_s1').length;
  const mhsS2Count = userList.filter((u) => u.role === 'mahasiswa_s2').length;
  const mhsS3Count = userList.filter((u) => u.role === 'mahasiswa_s3').length;
  const eksternalCount = userList.filter((u) => u.role === 'eksternal').length;

  if (isMahasiswaRole(currentRole)) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas: Menu User</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          Menu <strong>User (Manajemen Akun)</strong> tidak dapat diakses oleh peran <strong>Mahasiswa (S1 / S2 / S3)</strong>. Menu ini hanya dapat diakses oleh Administrator dan Dosen.
        </p>
      </div>
    );
  }

  // Handlers
  const handleRoleChange = (newRole: UserRole | 'plp' | 'eksternal') => {
    let finalRole: UserRole = 'admin';
    let defaultJabatan = formData.jabatan;
    let defaultUnit = formData.unit;

    if (newRole === 'mahasiswa_s1') {
      finalRole = 'mahasiswa_s1';
      defaultJabatan = 'Mahasiswa S1';
      defaultUnit = 'Program Studi S1 Kimia - FMIPA Universitas Brawijaya';
    } else if (newRole === 'mahasiswa_s2') {
      finalRole = 'mahasiswa_s2';
      defaultJabatan = 'Mahasiswa S2';
      defaultUnit = 'Program Studi S2 Kimia - FMIPA Universitas Brawijaya';
    } else if (newRole === 'mahasiswa_s3') {
      finalRole = 'mahasiswa_s3';
      defaultJabatan = 'Mahasiswa S3';
      defaultUnit = 'Program Studi S3 Kimia - FMIPA Universitas Brawijaya';
    } else if (newRole === 'dosen') {
      finalRole = 'dosen';
      defaultJabatan = 'Dosen';
      defaultUnit = 'Laboratorium Kimia Analitik & Instrumentasi';
    } else if (newRole === 'plp') {
      finalRole = 'admin';
      defaultJabatan = 'PLP';
      defaultUnit = 'Laboratorium Kimia Analitik & Instrumentasi';
    } else if (newRole === 'eksternal') {
      finalRole = 'eksternal';
      defaultJabatan = 'Pembimbing Lapangan';
      defaultUnit = 'Instansi / Mitra Industri KLK';
    } else if (newRole === 'admin') {
      finalRole = 'admin';
      defaultJabatan = 'Admin';
      defaultUnit = 'Sub-Bagian Akademik & Administrasi Departemen Kimia';
    } else if (newRole === 'super_admin') {
      finalRole = 'super_admin';
      defaultJabatan = 'Admin';
      defaultUnit = 'Departemen Kimia FMIPA Universitas Brawijaya';
    }

    setFormData((prev) => ({
      ...prev,
      role: finalRole,
      jabatan: defaultJabatan,
      unit: defaultUnit
    }));
    setModalError(null);
  };

  const handleOpenAddModal = () => {
    setShowModalPassword(false);
    setModalError(null);
    const initialPass = generateCompliantPassword();
    setFormData({
      username: '',
      password: initialPass,
      nama: '',
      role: 'mahasiswa_s1',
      identifier: '',
      email: '',
      unit: 'Program Studi S1 Kimia - FMIPA Universitas Brawijaya',
      jabatan: 'Mahasiswa S1',
      semester: 'Ganjil 2026 / 2027',
      status: 'Aktif',
      noHp: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccountItem) => {
    setShowModalPassword(false);
    setModalError(null);
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: isHashedPassword(user.password) ? '' : (user.password || ''),
      nama: user.nama,
      role: normalizeMahasiswaRole(user.role, user.unit || user.jabatan),
      identifier: user.identifier,
      email: user.email,
      unit: user.unit || 'Program Studi S1 Kimia - FMIPA Universitas Brawijaya',
      jabatan: user.jabatan || getUserRoleLabel(user.role),
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
    setModalError(null);

    const trimmedUser = formData.username.trim();
    const trimmedNama = formData.nama.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedUser || !trimmedNama || !trimmedEmail) {
      setModalError('Mohon lengkapi Username, Nama Lengkap, dan Email resmi.');
      return;
    }

    let finalPassword = formData.password.trim();

    if (!editingUser) {
      if (!finalPassword) {
        finalPassword = generateCompliantPassword();
      } else {
        const pwdValError = getPasswordValidationMessage(finalPassword);
        if (pwdValError) {
          setModalError(`Kata sandi belum memenuhi standar: ${pwdValError}`);
          return;
        }
      }
    } else if (finalPassword) {
      const pwdValError = getPasswordValidationMessage(finalPassword);
      if (pwdValError) {
        setModalError(`Gagal mengubah kata sandi: ${pwdValError}`);
        return;
      }
    }

    // Format identifier (NIM / NIP / ID Mitra Pembimbing) & enforce NIM/NIP username (except super_admin & eksternal)
    let finalUsername = trimmedUser;
    let formattedIdentifier = formData.identifier.trim();
    const cleanNum = formattedIdentifier.replace(/\D/g, '');
    const usernameDigits = trimmedUser.replace(/\D/g, '');
    const formJabatan = (formData.jabatan || '').toLowerCase();
    const isEksternalCheck =
      formData.role === 'eksternal' ||
      formData.jabatan === 'Pembimbing Lapangan' ||
      formJabatan.includes('pembimbing lapangan') ||
      formJabatan.includes('pembimbing lapang') ||
      formJabatan.includes('mentor');

    if (formData.role !== 'super_admin' && !isEksternalCheck) {
      if (!editingUser) {
        if (usernameDigits.length < 5) {
          setModalError(
            isMahasiswaRole(formData.role)
              ? 'Username untuk Mahasiswa wajib menggunakan NIM berupa angka (minimal 5 digit).'
              : 'Username untuk Dosen/Admin/PLP wajib menggunakan NIP berupa angka (minimal 5 digit).'
          );
          return;
        }
        finalUsername = usernameDigits;
      } else {
        const syncedDigits = cleanNum.length >= 5 ? cleanNum : usernameDigits;
        if (syncedDigits.length >= 5) {
          finalUsername = syncedDigits;
        }
      }
    }

    if (isMahasiswaRole(formData.role)) {
      const nimNum =
        (!editingUser ? finalUsername.replace(/\D/g, '') : cleanNum) ||
        usernameDigits ||
        `235090200${Math.floor(100000 + Math.random() * 900000)}`;
      formattedIdentifier = formattedIdentifier.startsWith('NIM.') && editingUser ? formattedIdentifier : `NIM. ${nimNum}`;
      if (!editingUser) finalUsername = nimNum;
    } else if (formData.role === 'dosen') {
      const nipNum =
        (!editingUser ? finalUsername.replace(/\D/g, '') : cleanNum) ||
        usernameDigits ||
        `197${Math.floor(10000000000 + Math.random() * 90000000000)}`;
      formattedIdentifier = formattedIdentifier.startsWith('NIP.') && editingUser ? formattedIdentifier : `NIP. ${nipNum}`;
      if (!editingUser) finalUsername = nipNum;
    } else if (isEksternalCheck) {
      const idpNum = cleanNum ? `IDP-${cleanNum.slice(-7)}` : `IDP-${Math.floor(1000000 + Math.random() * 9000000)}`;
      formattedIdentifier =
        formattedIdentifier.startsWith('IDP') ||
        formattedIdentifier.startsWith('NIK') ||
        formattedIdentifier.startsWith('NIP')
          ? formattedIdentifier
          : idpNum;
    } else if (formData.role === 'admin') {
      const nipNum =
        (!editingUser ? finalUsername.replace(/\D/g, '') : cleanNum) ||
        usernameDigits ||
        `1990${Math.floor(10000000 + Math.random() * 90000000)}`;
      formattedIdentifier = formattedIdentifier.startsWith('NIP.') && editingUser ? formattedIdentifier : `NIP. ${nipNum}`;
      if (!editingUser) finalUsername = nipNum;
    } else if (formData.role === 'super_admin') {
      formattedIdentifier = formattedIdentifier || 'SA-001';
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
              username: finalUsername,
              identifier: formattedIdentifier,
              password: finalPassword ? finalPassword : u.password,
              avatarText: getInitials(formData.nama)
            }
          : u
      );
      persistUserList(updated);

      // Sinkronisasi pembaruan ke seluruh modul: SDM, KLK, Logbook Lab, Jadwal Seminar, & Permohonan Surat
      const savedUser = updated.find((u) => u.id === editingUser.id);
      if (savedUser) {
        const fullRes = syncUserEditAcrossAllModules(editingUser, savedUser, {
          dosenList,
          mahasiswaList,
          adminList,
          plpList,
          pembimbingLapanganList,
          klkList,
          logbooks,
          seminarList,
          suratList
        });

        const nextPb = fullRes.newPembimbingLapanganList || pembimbingLapanganList;

        if (onSyncAllModules) {
          onSyncAllModules(
            fullRes.newDosenList,
            fullRes.newMahasiswaList,
            fullRes.newAdminList,
            fullRes.newPlpList,
            fullRes.newKlkList,
            updated,
            nextPb,
            fullRes.newLogbooks,
            fullRes.newSeminarList,
            fullRes.newSuratList
          );
        } else {
          if (onUpdateDosenList) onUpdateDosenList(fullRes.newDosenList);
          if (onUpdateMahasiswaList) onUpdateMahasiswaList(fullRes.newMahasiswaList);
          if (onUpdateAdminList) onUpdateAdminList(fullRes.newAdminList);
          if (onUpdatePlpList) onUpdatePlpList(fullRes.newPlpList);
          if (fullRes.newPembimbingLapanganList && onUpdatePembimbingLapanganList) onUpdatePembimbingLapanganList(fullRes.newPembimbingLapanganList);
          if (onUpdateUserList) onUpdateUserList(updated);
        }
      }
      setEditingUser(null);
      setSyncNotice(`Data akun "${formData.nama}" berhasil disimpan & disinkronkan ke seluruh modul sistem.`);
      setTimeout(() => setSyncNotice(null), 5000);
    } else {
      const newUser: UserAccountItem = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        ...formData,
        username: finalUsername,
        identifier: formattedIdentifier,
        password: finalPassword,
        avatarText: getInitials(formData.nama),
        tanggalDibuat: new Date().toISOString().split('T')[0],
        terakhirLogin: 'Belum pernah login',
        mustChangePassword: true
      };
      const updated = [newUser, ...userList];
      persistUserList(updated);
      setIsAddModalOpen(false);

      // Sinkronisasi penambahan akun baru ke modul Sumber Daya Manusia & seluruh modul
      const sdmRes = syncUserAccountToSdm(newUser, {
        dosenList,
        mahasiswaList,
        adminList,
        plpList,
        pembimbingLapanganList
      });

      const nextDosen = sdmRes.newDosenList || dosenList;
      const nextMahasiswa = sdmRes.newMahasiswaList || mahasiswaList;
      const nextAdmin = sdmRes.newAdminList || adminList;
      const nextPlp = sdmRes.newPlpList || plpList;
      const nextPb = sdmRes.newPembimbingLapanganList || pembimbingLapanganList;

      if (onSyncAllModules) {
        onSyncAllModules(
          nextDosen,
          nextMahasiswa,
          nextAdmin,
          nextPlp,
          klkList,
          updated,
          nextPb,
          logbooks,
          seminarList,
          suratList
        );
      } else {
        if (sdmRes.newDosenList && onUpdateDosenList) onUpdateDosenList(nextDosen);
        if (sdmRes.newMahasiswaList && onUpdateMahasiswaList) onUpdateMahasiswaList(nextMahasiswa);
        if (sdmRes.newAdminList && onUpdateAdminList) onUpdateAdminList(nextAdmin);
        if (sdmRes.newPlpList && onUpdatePlpList) onUpdatePlpList(nextPlp);
        if (sdmRes.newPembimbingLapanganList && onUpdatePembimbingLapanganList) onUpdatePembimbingLapanganList(nextPb);
        if (onUpdateUserList) onUpdateUserList(updated);
      }

      setSyncNotice(`Akun baru "${newUser.nama}" (${newUser.role.toUpperCase()}) berhasil ditambahkan & otomatis terdaftar di SDM.`);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  const handleRequestDeleteUser = (user: UserAccountItem) => {
    if (userList.length <= 1) {
      setSyncNotice('Peringatan: Tidak dapat menghapus satu-satunya user sistem.');
      setTimeout(() => setSyncNotice(null), 4000);
      return;
    }
    if (user.role === 'super_admin' && currentRole !== 'super_admin') {
      setSyncNotice('Akses Ditolak: Hanya Super Admin yang dapat menghapus akun tingkat Super Admin.');
      setTimeout(() => setSyncNotice(null), 4000);
      return;
    }
    if (user.role === 'super_admin' && superAdminTotal <= 1) {
      setSyncNotice('Peringatan: Sistem harus memiliki minimal 1 akun Super Admin yang terdaftar.');
      setTimeout(() => setSyncNotice(null), 4000);
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
    if (userToDelete.role === 'super_admin' && (currentRole !== 'super_admin' || superAdminTotal <= 1)) {
      setUserToDelete(null);
      return;
    }
    const updated = userList.filter((u) => u.id !== userToDelete.id);
    persistUserList(updated);

    // Sinkronisasi penghapusan ke SDM, KLK, Logbook Lab, Jadwal Seminar, & Permohonan Surat
    const fullDel = syncUserDeleteAcrossAllModules(userToDelete, {
      dosenList,
      mahasiswaList,
      adminList,
      plpList,
      pembimbingLapanganList,
      klkList,
      logbooks,
      seminarList,
      suratList
    });

    const nextPb = fullDel.newPembimbingLapanganList || pembimbingLapanganList;

    if (onSyncAllModules) {
      onSyncAllModules(
        fullDel.newDosenList,
        fullDel.newMahasiswaList,
        fullDel.newAdminList,
        fullDel.newPlpList,
        fullDel.newKlkList,
        updated,
        nextPb,
        fullDel.newLogbooks,
        fullDel.newSeminarList,
        fullDel.newSuratList
      );
    } else {
      if (onUpdateDosenList) onUpdateDosenList(fullDel.newDosenList);
      if (onUpdateMahasiswaList) onUpdateMahasiswaList(fullDel.newMahasiswaList);
      if (onUpdateAdminList) onUpdateAdminList(fullDel.newAdminList);
      if (onUpdatePlpList) onUpdatePlpList(fullDel.newPlpList);
      if (fullDel.newPembimbingLapanganList && onUpdatePembimbingLapanganList) onUpdatePembimbingLapanganList(fullDel.newPembimbingLapanganList);
      if (onUpdateUserList) onUpdateUserList(updated);
    }

    // Jika user yang dihapus adalah user yang sedang aktif login, lakukan logout
    if (
      currentUser &&
      (currentUser.id === userToDelete.id || currentUser.username === userToDelete.username)
    ) {
      if (onLogout) {
        onLogout();
      }
    }

    setSyncNotice(`Pengguna "${userToDelete.nama}" (@${userToDelete.username}) berhasil dihapus dan dibersihkan dari seluruh modul sistem.`);
    setTimeout(() => setSyncNotice(null), 4000);
    setUserToDelete(null);
  };

  const handleConfirmBulkDeleteUsers = () => {
    if (!canBulkDelete || selectedIds.length === 0) return;

    const targetUsers = userList.filter(
      (u) => selectedIds.includes(u.id) && !isUserDeleteProtected(u)
    );
    if (targetUsers.length === 0) {
      setBulkDeleteConfirmOpen(false);
      return;
    }

    const targetIdSet = new Set(targetUsers.map((u) => u.id));
    const updatedUsers = userList.filter((u) => !targetIdSet.has(u.id));

    if (updatedUsers.length < 1) {
      setSyncNotice('Peringatan: Tidak dapat menghapus seluruh akun karena sistem harus menyisakan minimal 1 pengguna.');
      setTimeout(() => setSyncNotice(null), 4000);
      setBulkDeleteConfirmOpen(false);
      return;
    }

    persistUserList(updatedUsers);

    let moduleState = {
      dosenList,
      mahasiswaList,
      adminList,
      plpList,
      pembimbingLapanganList,
      klkList,
      logbooks,
      seminarList,
      suratList
    };

    for (const delUser of targetUsers) {
      const res = syncUserDeleteAcrossAllModules(delUser, moduleState);
      moduleState = {
        dosenList: res.newDosenList,
        mahasiswaList: res.newMahasiswaList,
        adminList: res.newAdminList,
        plpList: res.newPlpList,
        pembimbingLapanganList: res.newPembimbingLapanganList ?? moduleState.pembimbingLapanganList,
        klkList: res.newKlkList,
        logbooks: res.newLogbooks ?? moduleState.logbooks,
        seminarList: res.newSeminarList ?? moduleState.seminarList,
        suratList: res.newSuratList ?? moduleState.suratList
      };
    }

    if (onSyncAllModules) {
      onSyncAllModules(
        moduleState.dosenList,
        moduleState.mahasiswaList,
        moduleState.adminList,
        moduleState.plpList,
        moduleState.klkList,
        updatedUsers,
        moduleState.pembimbingLapanganList,
        moduleState.logbooks,
        moduleState.seminarList,
        moduleState.suratList
      );
    } else {
      if (onUpdateDosenList) onUpdateDosenList(moduleState.dosenList);
      if (onUpdateMahasiswaList) onUpdateMahasiswaList(moduleState.mahasiswaList);
      if (onUpdateAdminList) onUpdateAdminList(moduleState.adminList);
      if (onUpdatePlpList) onUpdatePlpList(moduleState.plpList);
      if (onUpdatePembimbingLapanganList) onUpdatePembimbingLapanganList(moduleState.pembimbingLapanganList);
      if (onUpdateUserList) onUpdateUserList(updatedUsers);
    }

    setSelectedIds([]);
    setBulkDeleteConfirmOpen(false);
    setSyncNotice(`${targetUsers.length} akun pengguna terpilih berhasil dihapus dan dibersihkan dari seluruh modul sistem.`);
    setTimeout(() => setSyncNotice(null), 5000);
  };

  const handleToggleStatus = (id: string) => {
    let targetUser: UserAccountItem | undefined;
    const updated = userList.map((u) => {
      if (u.id === id) {
        const nextStatus = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        targetUser = { ...u, status: nextStatus as 'Aktif' | 'Nonaktif' };
        return targetUser;
      }
      return u;
    });
    persistUserList(updated);

    if (targetUser) {
      const sdmStat = syncUserStatusToSdm(targetUser, {
        dosenList,
        mahasiswaList,
        adminList,
        plpList,
        pembimbingLapanganList
      });
      const nextDosen = sdmStat.newDosenList || dosenList;
      const nextMahasiswa = sdmStat.newMahasiswaList || mahasiswaList;
      const nextAdmin = sdmStat.newAdminList || adminList;
      const nextPlp = sdmStat.newPlpList || plpList;
      const nextPb = sdmStat.newPembimbingLapanganList || pembimbingLapanganList;

      if (onSyncAllModules) {
        onSyncAllModules(
          nextDosen,
          nextMahasiswa,
          nextAdmin,
          nextPlp,
          klkList,
          updated,
          nextPb,
          logbooks,
          seminarList,
          suratList
        );
      } else {
        if (sdmStat.newDosenList && onUpdateDosenList) onUpdateDosenList(nextDosen);
        if (sdmStat.newMahasiswaList && onUpdateMahasiswaList) onUpdateMahasiswaList(nextMahasiswa);
        if (sdmStat.newAdminList && onUpdateAdminList) onUpdateAdminList(nextAdmin);
        if (sdmStat.newPlpList && onUpdatePlpList) onUpdatePlpList(nextPlp);
        if (sdmStat.newPembimbingLapanganList && onUpdatePembimbingLapanganList) onUpdatePembimbingLapanganList(nextPb);
        if (onUpdateUserList) onUpdateUserList(updated);
      }
    }
  };

  const handleResetPasswordConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setResetPassError(null);
    const pwdValError = getPasswordValidationMessage(newPassword.trim());
    if (pwdValError) {
      setResetPassError(`Gagal mereset kata sandi: ${pwdValError}`);
      return;
    }
    if (resetPassUser) {
      const updated = userList.map((u) =>
        u.id === resetPassUser.id
          ? { ...u, password: newPassword.trim(), mustChangePassword: true, passwordChangedAt: undefined }
          : u
      );
      persistUserList(updated);
      if (onUpdateUserList) onUpdateUserList(updated);
    }
    setShowPassAlert(`Kata sandi untuk akun "${resetPassUser?.username}" berhasil diatur ulang menjadi: "${newPassword.trim()}"`);
    setResetPassUser(null);
    setNewPassword('');
    setTimeout(() => setShowPassAlert(null), 6000);
  };

  const parseCsvRows = (rawText: string): string[][] => {
    const cleanText = rawText.replace(/^\uFEFF/, '');
    const firstLine = cleanText.split(/\r?\n/).find((l) => l.trim().length > 0) || '';
    let commaCount = 0;
    let semiCount = 0;
    let inQuotesHeader = false;
    for (let i = 0; i < firstLine.length; i++) {
      const ch = firstLine[i];
      if (ch === '"') inQuotesHeader = !inQuotesHeader;
      else if (!inQuotesHeader) {
        if (ch === ',') commaCount++;
        else if (ch === ';') semiCount++;
      }
    }
    const delimiter = semiCount > commaCount ? ';' : ',';

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentField += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === delimiter) {
          currentRow.push(currentField.trim());
          currentField = '';
        } else if (char === '\r' && nextChar === '\n') {
          currentRow.push(currentField.trim());
          if (currentRow.some((cell) => cell.length > 0)) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
          i++;
        } else if (char === '\n' || char === '\r') {
          currentRow.push(currentField.trim());
          if (currentRow.some((cell) => cell.length > 0)) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        } else {
          currentField += char;
        }
      }
    }

    currentRow.push(currentField.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }

    return rows;
  };

  const resolveCsvRole = (
    rawRole: string,
    unitOrJab?: string
  ): { role: UserRole; defaultJabatan: string; defaultUnit: string } | null => {
    const r = rawRole.trim().toLowerCase().replace(/[_-]+/g, ' ');
    if (r === 'super admin' || r === 'superadmin' || r === 'zuper admin') {
      return {
        role: 'super_admin',
        defaultJabatan: 'Admin',
        defaultUnit: 'Departemen Kimia FMIPA Universitas Brawijaya'
      };
    }
    if (r === 'plp' || r.includes('pranata laboratorium')) {
      return {
        role: 'admin',
        defaultJabatan: 'PLP',
        defaultUnit: 'Laboratorium Kimia Analitik & Instrumentasi'
      };
    }
    if (r === 'admin' || r === 'administrator' || r === 'staff' || r === 'staf') {
      return {
        role: 'admin',
        defaultJabatan: 'Admin',
        defaultUnit: 'Sub-Bagian Akademik & Administrasi Departemen Kimia'
      };
    }
    if (r === 'dosen' || r === 'lecturer' || r === 'pengajar') {
      return {
        role: 'dosen',
        defaultJabatan: 'Dosen',
        defaultUnit: 'Laboratorium Kimia Analitik & Instrumentasi'
      };
    }
    if (r === 'mahasiswa s1' || r === 'mhs s1' || r === 's1') {
      return {
        role: 'mahasiswa_s1',
        defaultJabatan: 'Mahasiswa S1',
        defaultUnit: 'Program Studi S1 Kimia - FMIPA Universitas Brawijaya'
      };
    }
    if (r === 'mahasiswa s2' || r === 'mhs s2' || r === 's2' || r === 'magister') {
      return {
        role: 'mahasiswa_s2',
        defaultJabatan: 'Mahasiswa S2',
        defaultUnit: 'Program Studi S2 Kimia - FMIPA Universitas Brawijaya'
      };
    }
    if (r === 'mahasiswa s3' || r === 'mhs s3' || r === 's3' || r === 'doktor') {
      return {
        role: 'mahasiswa_s3',
        defaultJabatan: 'Mahasiswa S3',
        defaultUnit: 'Program Studi S3 Kimia - FMIPA Universitas Brawijaya'
      };
    }
    if (r === 'mahasiswa' || r === 'mhs') {
      const norm = normalizeMahasiswaRole('mahasiswa', unitOrJab);
      const label = norm === 'mahasiswa_s3' ? 'Mahasiswa S3' : norm === 'mahasiswa_s2' ? 'Mahasiswa S2' : 'Mahasiswa S1';
      const prodi = norm === 'mahasiswa_s3' ? 'S3' : norm === 'mahasiswa_s2' ? 'S2' : 'S1';
      return {
        role: norm,
        defaultJabatan: label,
        defaultUnit: `Program Studi ${prodi} Kimia - FMIPA Universitas Brawijaya`
      };
    }
    if (
      r === 'eksternal' ||
      r === 'user eksternal' ||
      r === 'external' ||
      r === 'pembimbing lapangan' ||
      r === 'mitra'
    ) {
      return {
        role: 'eksternal',
        defaultJabatan: 'Pembimbing Lapangan',
        defaultUnit: 'Instansi / Mitra Industri KLK'
      };
    }
    return null;
  };

  const formatImportedIdentifier = (rawId: string, role: UserRole, jabatan: string): string => {
    const trimmed = rawId.trim();
    const cleanNum = trimmed.replace(/\D/g, '');
    const jabLower = jabatan.toLowerCase();
    const isEkst =
      role === 'eksternal' ||
      jabatan === 'Pembimbing Lapangan' ||
      jabLower.includes('pembimbing lapangan') ||
      jabLower.includes('mentor');

    if (isMahasiswaRole(role)) {
      const nimNum = cleanNum || `235090200${Math.floor(100000 + Math.random() * 900000)}`;
      return trimmed.startsWith('NIM.') ? trimmed : `NIM. ${nimNum}`;
    }
    if (role === 'dosen') {
      const nipNum = cleanNum || `197${Math.floor(10000000000 + Math.random() * 90000000000)}`;
      return trimmed.startsWith('NIP.') ? trimmed : `NIP. ${nipNum}`;
    }
    if (isEkst) {
      if (trimmed) return trimmed;
      return `IDP-${Math.floor(1000000 + Math.random() * 9000000)}`;
    }
    const nipNum = cleanNum || `1990${Math.floor(10000000 + Math.random() * 90000000)}`;
    return trimmed.startsWith('NIP.') ? trimmed : `NIP. ${nipNum}`;
  };

  const handleOpenImportModal = () => {
    setImportFileName('');
    setImportFileSize(0);
    setImportRawText('');
    setImportRawMatrix([]);
    setImportDetectedDelimiter('Koma (,)');
    setImportPreviewTab('parsed');
    setImportPreviewFilter('all');
    setImportPreviewSearch('');
    setImportPreviewRows([]);
    setImportParseError(null);
    setImportDuplicateMode('skip');
    setAutoHashImportPassword(true);
    setIsImportingCsv(false);
    setIsDragOverCsv(false);
    setIsImportModalOpen(true);
  };

  const processCsvFile = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv') && file.type && !file.type.includes('csv') && !file.type.includes('text')) {
      setImportParseError('Format file harus berupa .csv (Comma-Separated Values).');
      setImportPreviewRows([]);
      setImportRawMatrix([]);
      setImportRawText('');
      return;
    }

    setImportFileName(file.name);
    setImportFileSize(file.size);
    setImportPreviewTab('parsed');
    setImportPreviewFilter('all');
    setImportPreviewSearch('');
    setImportParseError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      setImportRawText(content);

      const firstLineCheck = content.replace(/^\uFEFF/, '').split(/\r?\n/).find((l) => l.trim().length > 0) || '';
      const semiMatches = (firstLineCheck.match(/;/g) || []).length;
      const commaMatches = (firstLineCheck.match(/,/g) || []).length;
      setImportDetectedDelimiter(semiMatches > commaMatches ? 'Titik Koma (;)' : 'Koma (,)');

      const matrix = parseCsvRows(content);
      setImportRawMatrix(matrix);
      if (matrix.length < 2) {
        setImportParseError('File CSV kosong atau tidak memiliki baris data di bawah header.');
        setImportPreviewRows([]);
        setImportPreviewTab('raw_text');
        return;
      }

      const rawHeaders = matrix[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
      const findColIndex = (aliases: string[]) =>
        rawHeaders.findIndex((h) => aliases.includes(h));

      const colIdx = {
        username: findColIndex(['username', 'user_name', 'user', 'akun', 'id_user']),
        password: findColIndex(['password', 'sandi', 'kata_sandi', 'pass']),
        nama: findColIndex(['nama', 'nama_lengkap', 'name', 'full_name', 'pengguna']),
        role: findColIndex(['role', 'peran', 'hak_akses', 'level']),
        email: findColIndex(['email', 'e-mail', 'surel']),
        identifier: findColIndex(['nim_nip', 'nim/nip', 'identifier', 'nim', 'nip', 'no_induk', 'id_pegawai', 'id_mitra', 'idmitra', 'id_eksternal']),
        unit: findColIndex(['unit', 'prodi', 'program_studi', 'unit_kerja', 'instansi']),
        jabatan: findColIndex(['jabatan', 'posisi']),
        semester: findColIndex(['semester', 'periode']),
        status: findColIndex(['status', 'status_akun']),
        noHp: findColIndex(['no_hp', 'nohp', 'telepon', 'hp', 'phone', 'wa', 'no_wa'])
      };

      const missingRequiredCols: string[] = [];
      if (colIdx.username === -1 && colIdx.identifier === -1) missingRequiredCols.push('username / nim_nip / id_mitra');
      if (colIdx.nama === -1) missingRequiredCols.push('nama');
      if (colIdx.role === -1) missingRequiredCols.push('role');

      if (missingRequiredCols.length > 0) {
        setImportParseError(
          `Header kolom wajib tidak ditemukan: ${missingRequiredCols.join(', ')}. Pastikan baris pertama CSV memuat kolom wajib: username (atau nim_nip / id_mitra), nama, role.`
        );
        setImportPreviewRows([]);
        setImportPreviewTab('raw_table');
        return;
      }

      const existingByUsername = new Map<string, UserAccountItem>();

      userList.forEach((u) => {
        if (!u) return;
        const uname = (u.username || '').trim().toLowerCase();
        if (uname) existingByUsername.set(uname, u);
      });

      const seenInFileUsername = new Map<string, number>();
      const parsed: ParsedCsvUserRow[] = [];

      for (let i = 1; i < matrix.length; i++) {
        const row = matrix[i];
        const rowNum = i + 1;
        const getVal = (idx: number) => (idx >= 0 && idx < row.length ? row[idx].trim() : '');

        const rawUsername = getVal(colIdx.username);
        const rawPass = getVal(colIdx.password);
        const nama = getVal(colIdx.nama);
        const rawRole = getVal(colIdx.role);
        const email = getVal(colIdx.email);
        const rawIdentifier = getVal(colIdx.identifier);
        const rawUnit = getVal(colIdx.unit);
        const rawJabatan = getVal(colIdx.jabatan);
        const rawSemester = getVal(colIdx.semester) || 'Ganjil 2026 / 2027';
        const rawStatus = getVal(colIdx.status).toLowerCase();
        const noHp = getVal(colIdx.noHp);

        let error: string | undefined;
        const resolvedRole = resolveCsvRole(rawRole, rawUnit || rawJabatan);

        const finalRole = resolvedRole?.role || 'mahasiswa_s1';
        const finalJabatan = rawJabatan || resolvedRole?.defaultJabatan || getUserRoleLabel(finalRole);
        const finalUnit = rawUnit || resolvedRole?.defaultUnit || 'Program Studi S1 Kimia - FMIPA Universitas Brawijaya';

        const isIdUsernameRole =
          finalRole !== 'super_admin' && finalRole !== 'eksternal';

        const unameDigits = rawUsername.replace(/\D/g, '');
        const idDigits = rawIdentifier.replace(/\D/g, '');
        const resolvedNimNip = idDigits.length >= 5 ? idDigits : unameDigits;
        const username = isIdUsernameRole
          ? resolvedNimNip || rawUsername
          : finalRole === 'eksternal'
          ? rawUsername || rawIdentifier
          : rawUsername;

        if (!username || !nama || !rawRole) {
          error =
            finalRole === 'eksternal'
              ? 'Kolom wajib (username / id_mitra, nama, role) belum lengkap.'
              : 'Kolom wajib (username / nim_nip, nama, role) belum lengkap.';
        } else if (email && !email.includes('@')) {
          error = 'Format email tidak valid.';
        }

        if (!error && !resolvedRole) {
          error = `Role "${rawRole}" tidak dikenal (gunakan: mahasiswa_s1, mahasiswa_s2, mahasiswa_s3, dosen, admin, plp, eksternal).`;
        }

        if (!error && isIdUsernameRole && resolvedNimNip.length < 5) {
          error = isMahasiswaRole(finalRole)
            ? 'Username / NIM Mahasiswa wajib berupa angka NIM (minimal 5 digit).'
            : 'Username / NIP Dosen/Admin/PLP wajib berupa angka NIP (minimal 5 digit).';
        }

        if (!error && resolvedRole?.role === 'super_admin' && currentRole !== 'super_admin') {
          error = 'Hanya Super Admin yang dapat mengimpor akun tingkat Super Admin.';
        }

        const normalizedUname = username.toLowerCase();
        const identifier = formatImportedIdentifier(
          rawIdentifier || (isIdUsernameRole ? resolvedNimNip : finalRole === 'eksternal' ? rawUsername : ''),
          finalRole,
          finalJabatan
        );

        // Validasi anti-duplikat internal file CSV (Username saja)
        const dupCsvUnameRow = normalizedUname ? seenInFileUsername.get(normalizedUname) : undefined;

        if (!error && dupCsvUnameRow !== undefined) {
          error = `Duplikat di CSV: username "${username}" sama dengan baris #${dupCsvUnameRow}.`;
        }

        if (normalizedUname && !seenInFileUsername.has(normalizedUname)) {
          seenInFileUsername.set(normalizedUname, rowNum);
        }

        // Validasi anti-duplikat terhadap akun terdaftar di SIKMA (Username saja)
        const matchByUname = normalizedUname ? existingByUsername.get(normalizedUname) : undefined;
        const matchedExisting = matchByUname;

        let duplicateType: ParsedCsvUserRow['duplicateType'];
        let duplicateReason: string | undefined;
        if (matchByUname) {
          duplicateType = 'username';
          duplicateReason = `Username "${matchByUname.username}" sudah terdaftar (${matchByUname.nama})`;
        }

        const passwordAutoGenerated = !rawPass;
        const defaultInitialPassword = isIdUsernameRole
          ? resolvedNimNip || username
          : finalRole === 'eksternal'
          ? rawIdentifier || username || identifier
          : generateCompliantPassword();
        const finalPassword = rawPass || defaultInitialPassword;
        const status: 'Aktif' | 'Nonaktif' = rawStatus === 'nonaktif' || rawStatus === 'inactive' ? 'Nonaktif' : 'Aktif';
        const isDuplicateUsername = Boolean(matchedExisting);

        parsed.push({
          rowNumber: rowNum,
          username,
          password: finalPassword,
          passwordAutoGenerated,
          nama,
          role: finalRole,
          rawRole,
          email,
          identifier,
          unit: finalUnit,
          jabatan: finalJabatan,
          semester: rawSemester,
          status,
          noHp,
          isDuplicateUsername,
          duplicateType,
          duplicateReason,
          matchedExistingId: matchedExisting?.id,
          error
        });
      }

      setImportPreviewRows(parsed);
    };

    reader.onerror = () => {
      setImportParseError('Gagal membaca file CSV. Pastikan file tidak rusak atau sedang dikunci aplikasi lain.');
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCsvFile(file);
    }
    e.target.value = '';
  };

  const handleDownloadImportTemplate = () => {
    const headers = ['username', 'password', 'nama', 'role', 'email', 'nim_nip', 'unit', 'no_hp'];
    const sampleRows = [
      ['245090200111001', '', 'Budi Santoso', 'mahasiswa_s1', 'budi.s1@student.ub.ac.id', '245090200111001', 'Program Studi S1 Kimia - FMIPA Universitas Brawijaya', '081234567801'],
      ['246090200111002', '', 'Sari Dewi Kartika', 'mahasiswa_s2', 'sari.s2@student.ub.ac.id', '246090200111002', 'Program Studi S2 Kimia - FMIPA Universitas Brawijaya', '081234567802'],
      ['247090200111003', '', 'Andi Pratama Putra', 'mahasiswa_s3', 'andi.s3@student.ub.ac.id', '247090200111003', 'Program Studi S3 Kimia - FMIPA Universitas Brawijaya', '081234567803'],
      ['198004122005012001', '', 'Dr. Ratna Wijaya, M.Si.', 'dosen', 'ratna.wijaya@ub.ac.id', '198004122005012001', 'Laboratorium Kimia Analitik & Instrumentasi', '081234567804'],
      ['199205152019031002', '', 'Agus Setiawan, S.Kom.', 'admin', 'agus.admin@ub.ac.id', '199205152019031002', 'Sub-Bagian Akademik & Administrasi Departemen Kimia', '081234567805'],
      ['IDP-9012345', '', 'Ir. Hendra Kusuma', 'eksternal', 'hendra.kusuma@petrokimia.co.id', 'IDP-9012345', 'PT Petrokimia Gresik', '081234567806']
    ];
    const csvString = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_user_sikma.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmImportUsers = async () => {
    const actionableRows = importPreviewRows.filter((r) => {
      if (r.error) return false;
      if (r.isDuplicateUsername && importDuplicateMode === 'skip') return false;
      return true;
    });

    if (actionableRows.length === 0 || isImportingCsv) return;

    setIsImportingCsv(true);

    try {
      const processedPasswords = await Promise.all(
        actionableRows.map(async (row) => {
          // Password yang kosong otomatis di-generate dan selalu di-hash dengan kebijakan hash otomatis
          if (!autoHashImportPassword && !row.passwordAutoGenerated) return row.password;
          return await hashPassword(row.password);
        })
      );

      const getInitials = (str: string) =>
        str
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'UB';

      let nextUsers = [...userList];
      let moduleState = {
        dosenList,
        mahasiswaList,
        adminList,
        plpList,
        pembimbingLapanganList,
        klkList,
        logbooks,
        seminarList,
        suratList
      };

      let addedCount = 0;
      let updatedCount = 0;
      const today = new Date().toISOString().split('T')[0];

      // Guard anti-duplikat selama proses batch import (deteksi duplikasi username saja)
      const seenUsernamesRun = new Set<string>();

      actionableRows.forEach((row, idx) => {
        const finalStoredPassword = processedPasswords[idx];
        const normUname = row.username.trim().toLowerCase();

        // Pastikan tidak ada duplikat username lolos di batch yang sama
        if (!normUname || seenUsernamesRun.has(normUname)) {
          return;
        }

        const existingIdx = nextUsers.findIndex((u) => {
          if (row.matchedExistingId && u.id === row.matchedExistingId) return true;
          return u.username.trim().toLowerCase() === normUname;
        });

        if (existingIdx !== -1 && importDuplicateMode === 'skip') {
          return;
        }

        seenUsernamesRun.add(normUname);

        if (existingIdx !== -1 && importDuplicateMode === 'update') {
          const oldUser = nextUsers[existingIdx];
          if (oldUser.role === 'super_admin' && currentRole !== 'super_admin') {
            return;
          }
          const updatedUser: UserAccountItem = {
            ...oldUser,
            username: row.username,
            password: row.passwordAutoGenerated ? (oldUser.password || finalStoredPassword) : finalStoredPassword,
            nama: row.nama,
            role: row.role,
            email: row.email || oldUser.email,
            identifier: row.identifier || oldUser.identifier,
            unit: row.unit || oldUser.unit,
            jabatan: row.jabatan || oldUser.jabatan,
            semester: row.semester || oldUser.semester,
            status: row.status,
            noHp: row.noHp || oldUser.noHp,
            avatarText: getInitials(row.nama)
          };
          nextUsers[existingIdx] = updatedUser;
          updatedCount++;

          const editRes = syncUserEditAcrossAllModules(oldUser, updatedUser, moduleState);
          moduleState = {
            dosenList: editRes.newDosenList,
            mahasiswaList: editRes.newMahasiswaList,
            adminList: editRes.newAdminList,
            plpList: editRes.newPlpList,
            pembimbingLapanganList: editRes.newPembimbingLapanganList ?? moduleState.pembimbingLapanganList,
            klkList: editRes.newKlkList,
            logbooks: editRes.newLogbooks ?? moduleState.logbooks,
            seminarList: editRes.newSeminarList ?? moduleState.seminarList,
            suratList: editRes.newSuratList ?? moduleState.suratList
          };
        } else if (existingIdx === -1) {
          const newUser: UserAccountItem = {
            id: `usr-${Date.now().toString().slice(-4)}${idx}`,
            username: row.username,
            password: finalStoredPassword,
            nama: row.nama,
            role: row.role,
            identifier: row.identifier,
            email: row.email,
            unit: row.unit,
            jabatan: row.jabatan,
            semester: row.semester,
            status: row.status,
            noHp: row.noHp,
            avatarText: getInitials(row.nama),
            tanggalDibuat: today,
            terakhirLogin: 'Belum pernah login',
            mustChangePassword: true
          };
          nextUsers = [newUser, ...nextUsers];
          addedCount++;

          const sdmRes = syncUserAccountToSdm(newUser, {
            dosenList: moduleState.dosenList,
            mahasiswaList: moduleState.mahasiswaList,
            adminList: moduleState.adminList,
            plpList: moduleState.plpList,
            pembimbingLapanganList: moduleState.pembimbingLapanganList
          });
          moduleState = {
            ...moduleState,
            dosenList: sdmRes.newDosenList || moduleState.dosenList,
            mahasiswaList: sdmRes.newMahasiswaList || moduleState.mahasiswaList,
            adminList: sdmRes.newAdminList || moduleState.adminList,
            plpList: sdmRes.newPlpList || moduleState.plpList,
            pembimbingLapanganList: sdmRes.newPembimbingLapanganList || moduleState.pembimbingLapanganList
          };
        }
      });

      persistUserList(nextUsers);

      if (onSyncAllModules) {
        onSyncAllModules(
          moduleState.dosenList,
          moduleState.mahasiswaList,
          moduleState.adminList,
          moduleState.plpList,
          moduleState.klkList,
          nextUsers,
          moduleState.pembimbingLapanganList,
          moduleState.logbooks,
          moduleState.seminarList,
          moduleState.suratList
        );
      } else {
        if (onUpdateDosenList) onUpdateDosenList(moduleState.dosenList);
        if (onUpdateMahasiswaList) onUpdateMahasiswaList(moduleState.mahasiswaList);
        if (onUpdateAdminList) onUpdateAdminList(moduleState.adminList);
        if (onUpdatePlpList) onUpdatePlpList(moduleState.plpList);
        if (onUpdatePembimbingLapanganList) onUpdatePembimbingLapanganList(moduleState.pembimbingLapanganList);
        if (onUpdateUserList) onUpdateUserList(nextUsers);
      }

      const skippedCount = Math.max(0, importPreviewRows.length - addedCount - updatedCount);
      setIsImportModalOpen(false);
      setImportPreviewRows([]);
      setImportFileName('');
      setSyncNotice(
        `Import CSV selesai! ${addedCount} user baru ditambahkan${updatedCount > 0 ? `, ${updatedCount} user diperbarui` : ''}${skippedCount > 0 ? `, ${skippedCount} baris duplikat username/tidak valid dilewati` : ''} dengan kebijakan generate & hash password otomatis (SHA-256 + Salt), dan seluruh data telah disinkronkan ke SDM.`
      );
      setTimeout(() => setSyncNotice(null), 6000);
    } finally {
      setIsImportingCsv(false);
    }
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
              Pusat konfigurasi pengguna, autentikasi single sign-on, peranan (Zuper Admin, Admin, Dosen, Mahasiswa S1, Mahasiswa S2, Mahasiswa S3, User Eksternal),
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
              id="btn-import-user-csv"
              onClick={handleOpenImportModal}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-sm cursor-pointer"
              title="Import Data User dari File CSV"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Import User</span>
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
              Terhubung dengan {dosenList.length} Dosen, {mahasiswaList.length} Mahasiswa, {adminList.length} Admin, {plpList.length} PLP, dan {pembimbingLapanganList.length} Pembimbing Lapangan.
            </span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] font-bold text-[#002B49] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <span>Total SDM Terintegrasi: {dosenList.length + mahasiswaList.length + adminList.length + plpList.length + pembimbingLapanganList.length} Personel</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total User</div>
            <div className="text-xl font-extrabold text-[#002B49] mt-0.5">{totalUsers}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pengguna terdaftar</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-purple-700 uppercase">Super Admin</div>
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
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase">Mahasiswa S1</div>
            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{mhsS1Count}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Sarjana Kimia</div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-teal-700 uppercase">Mahasiswa S2</div>
            <div className="text-xl font-extrabold text-teal-900 mt-0.5">{mhsS2Count}</div>
            <div className="text-[10px] text-teal-600 mt-0.5">Magister Kimia</div>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-sky-700 uppercase">Mahasiswa S3</div>
            <div className="text-xl font-extrabold text-sky-900 mt-0.5">{mhsS3Count}</div>
            <div className="text-[10px] text-sky-600 mt-0.5">Doktor Kimia</div>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-cyan-700 uppercase">Pembimbing Lapangan</div>
            <div className="text-xl font-extrabold text-cyan-900 mt-0.5">{eksternalCount}</div>
            <div className="text-[10px] text-cyan-600 mt-0.5">Mentor Mitra KLK</div>
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
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin Jurusan</option>
                <option value="dosen">Dosen</option>
                <option value="mahasiswa_s1">Mahasiswa S1</option>
                <option value="mahasiswa_s2">Mahasiswa S2</option>
                <option value="mahasiswa_s3">Mahasiswa S3</option>
                <option value="eksternal">Pembimbing Lapangan (Eksternal)</option>
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
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            {canBulkDelete && selectedIds.length > 0 && (
              <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-rose-900 font-semibold">
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>{selectedIds.length}</strong> akun pengguna terpilih untuk dihapus
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                  >
                    Batal Pilih
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkDeleteConfirmOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Terpilih ({selectedIds.length})</span>
                  </button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002B49] text-white uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Unit / Departemen</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Terakhir Login</th>
                    <th className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>Aksi</span>
                        {canBulkDelete && selectableFilteredIds.length > 0 && (
                          <label
                            className="inline-flex items-center gap-1 cursor-pointer select-none normal-case tracking-normal"
                            title="Pilih semua akun (kecuali akun aktif Anda) untuk hapus massal"
                          >
                            <input
                              type="checkbox"
                              checked={allFilteredSelected}
                              onChange={toggleSelectAllFiltered}
                              className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer accent-[#D4AF37]"
                            />
                            <span className="text-[10px] font-normal text-slate-200">Semua</span>
                          </label>
                        )}
                      </div>
                    </th>
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
                    const deleteProtected = isUserDeleteProtected(user);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-semibold text-slate-800">{user.username}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{user.identifier}</div>
                          {currentRole === 'super_admin' && user.password && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1 font-mono flex-wrap">
                              <span className="text-slate-400">Pass:</span>
                              {isHashedPassword(user.password) ? (
                                <>
                                  <span
                                    className="bg-indigo-50 text-indigo-900 border border-indigo-200 px-1.5 py-0.5 rounded font-semibold text-[10px]"
                                    title={user.password}
                                  >
                                    {formatHashedPasswordPreview(user.password)}
                                  </span>
                                  <span
                                    className="text-[9px] bg-indigo-100 text-indigo-800 border border-indigo-300 px-1.5 py-0.2 rounded font-bold inline-flex items-center gap-1"
                                    title="Kata sandi telah di-hash otomatis dengan SHA-256 + Salt"
                                  >
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Hash SHA-256</span>
                                  </span>
                                </>
                              ) : (
                                <>
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
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(user.password || '');
                                  setCopiedToast(
                                    isHashedPassword(user.password)
                                      ? 'Hash kata sandi disalin ke clipboard!'
                                      : `Kata sandi "${user.password}" disalin!`
                                  );
                                  setTimeout(() => setCopiedToast(null), 3000);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-700 rounded"
                                title={isHashedPassword(user.password) ? 'Salin hash kata sandi' : 'Salin kata sandi akun ini'}
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

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
                                {user.email || '-'}
                              </div>
                            </div>
                          </div>
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
                                : user.role === 'eksternal'
                                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                                : user.role === 'mahasiswa_s2'
                                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                : user.role === 'mahasiswa_s3'
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {user.role === 'eksternal' ? 'Pembimbing Lapangan' : getUserRoleLabel(user.role)}
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
                              disabled={deleteProtected}
                              title={
                                isSelf
                                  ? 'Tidak dapat menghapus akun Anda sendiri'
                                  : user.role === 'super_admin' && currentRole !== 'super_admin'
                                  ? 'Terproteksi: Hanya Super Admin yang dapat menghapus akun Super Admin'
                                  : user.role === 'super_admin' && superAdminTotal <= 1
                                  ? 'Minimal 1 akun Super Admin harus dipertahankan dalam sistem'
                                  : 'Hapus User'
                              }
                              className={`p-1.5 rounded transition-colors ${
                                deleteProtected ? 'text-slate-300 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50 cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {canBulkDelete && (
                              <label
                                className={`inline-flex items-center justify-center p-1 ${
                                  deleteProtected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                title={
                                  isSelf
                                    ? 'Akun aktif Anda tidak dapat dipilih untuk hapus massal'
                                    : deleteProtected
                                    ? 'Akun Super Admin utama dilindungi agar tidak terhapus massal'
                                    : `Pilih ${user.nama} untuk hapus massal`
                                }
                              >
                                <input
                                  type="checkbox"
                                  disabled={deleteProtected}
                                  checked={!deleteProtected && selectedIds.includes(user.id)}
                                  onChange={() => !deleteProtected && toggleSelectRow(user.id)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer accent-rose-600 disabled:cursor-not-allowed"
                                />
                              </label>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
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
                  <th className="py-3 px-4 text-center">Mahasiswa S1</th>
                  <th className="py-3 px-4 text-center">Mahasiswa S2</th>
                  <th className="py-3 px-4 text-center">Mahasiswa S3</th>
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
                  <td className="py-3 px-4 text-center text-slate-600">Lihat Dosen Pembimbing</td>
                  <td className="py-3 px-4 text-center text-slate-600">Lihat Promotor & Co-Promotor</td>
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
                  <td className="py-3 px-4 text-center">
                    <span className="bg-teal-100 text-teal-800 text-[10px] px-2 py-0.5 rounded font-bold">Input Riset Tesis</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.5 rounded font-bold">Input Riset Disertasi</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    Jadwal Seminar & Sidang Tugas Akhir
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
                  <td className="py-3 px-4 text-center text-slate-600">Seminar & Sidang Skripsi</td>
                  <td className="py-3 px-4 text-center text-slate-600">Seminar & Sidang Tesis</td>
                  <td className="py-3 px-4 text-center text-slate-600">Kualifikasi & Disertasi</td>
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
                  <td className="py-3 px-4 text-center">
                    <span className="bg-teal-100 text-teal-800 text-[10px] px-2 py-0.5 rounded font-bold">Riset Mitra / KLK S2</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.5 rounded font-bold">Riset Mitra / KLK S3</span>
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
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start justify-between gap-2 text-xs text-rose-800 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{modalError}</p>
                      {modalError.includes('Kata sandi') && (
                        <button
                          type="button"
                          onClick={handleGenerateAddPassword}
                          className="mt-1.5 px-2.5 py-1 bg-rose-600 text-white hover:bg-rose-700 rounded text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Buat Sandi Kuat Otomatis Sekarang</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalError(null)}
                    className="text-rose-400 hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {(() => {
                const modalJabatan = (formData.jabatan || '').toLowerCase();
                const isEksternalUser =
                  formData.role === 'eksternal' ||
                  formData.jabatan === 'Pembimbing Lapangan' ||
                  modalJabatan.includes('pembimbing lapangan') ||
                  modalJabatan.includes('pembimbing lapang') ||
                  modalJabatan.includes('mentor');

                return !editingUser ? (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isMahasiswaRole(formData.role)
                          ? 'Username (NIM) *'
                          : formData.role === 'dosen' || formData.role === 'admin'
                          ? 'Username (NIP) *'
                          : isEksternalUser
                          ? 'Username / ID Mitra / Email *'
                          : 'Username *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({ ...formData, username: (e.target.value || '').toLowerCase().replace(/\s+/g, '') });
                          if (modalError) setModalError(null);
                        }}
                        placeholder={
                          isMahasiswaRole(formData.role)
                            ? 'misal: 245090200111099'
                            : formData.role === 'dosen' || formData.role === 'admin'
                            ? 'misal: 198201012010121001'
                            : isEksternalUser
                            ? 'misal: IDP-8829101 atau tri.astuti'
                            : 'misal: superadmin'
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <label className="block text-xs font-semibold text-slate-700">
                            Password <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-medium border border-slate-200">
                            8+ Karakter (A-Z, a-z, 0-9, Simbol)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateAddPassword}
                          className="text-[11px] font-bold text-[#002B49] hover:text-[#004b80] flex items-center gap-1 bg-amber-100/80 hover:bg-amber-200/80 px-2 py-0.5 rounded transition-colors"
                          title="Otomatis buat kata sandi acak yang memenuhi seluruh kriteria kebijakan"
                        >
                          <Wand2 className="w-3 h-3 text-amber-700" />
                          <span>Buat Sandi Acak</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showModalPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Masukkan password (min. 8 karakter kombinasi huruf besar, kecil, angka, simbol)"
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
                              title="Salin Password"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowModalPassword(!showModalPassword)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                            title={showModalPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                          >
                            {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <PasswordRequirementsBox
                        password={formData.password}
                        onGenerate={handleGenerateAddPassword}
                        showGenerateButton={false}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nama *</label>
                      <input
                        type="text"
                        required
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder={
                          isEksternalUser
                            ? "misal: Dra. Tri Astuti, M.Si"
                            : "misal: Dr. Sc. Akhmad Sabarudin / Ahmad Rizky Pratama"
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                      <select
                        value={
                          isEksternalUser
                            ? 'eksternal'
                            : formData.role === 'admin' &&
                              (modalJabatan.includes('plp') || modalJabatan.includes('laboran'))
                            ? 'plp'
                            : formData.role
                        }
                        onChange={(e) => handleRoleChange(e.target.value as UserRole | 'plp' | 'eksternal')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                      >
                        <option value="mahasiswa_s1">Mahasiswa S1</option>
                        <option value="mahasiswa_s2">Mahasiswa S2</option>
                        <option value="mahasiswa_s3">Mahasiswa S3</option>
                        <option value="dosen">Dosen</option>
                        <option value="admin">Admin Jurusan</option>
                        <option value="plp">PLP</option>
                        <option value="eksternal">User Eksternal (Pembimbing Lapangan)</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={isEksternalUser ? "tri.astuti@petrokimia-gresik.com" : "user@ub.ac.id"}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {isEksternalUser && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs">
                        <Building className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold flex items-center gap-1.5 text-amber-950">
                            Mode Pengisian User Eksternal (Pembimbing Lapangan)
                            <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded text-[10px]">SDM Mitra</span>
                          </span>
                          <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                            Formulir dan pilihan telah disesuaikan dengan kebutuhan <strong>Pembimbing Lapangan / Mentor Industri KLK</strong>. Akun ini otomatis terhubung dengan menu <strong>Data Pembimbing Lapangan</strong>.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isMahasiswaRole(formData.role)
                            ? 'Username (NIM) *'
                            : formData.role === 'dosen' || formData.role === 'admin'
                            ? 'Username (NIP) *'
                            : isEksternalUser
                            ? 'Username / ID Mitra / Email *'
                            : 'Username *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.username}
                          onChange={(e) => {
                            setFormData({ ...formData, username: (e.target.value || '').toLowerCase().replace(/\s+/g, '') });
                            if (modalError) setModalError(null);
                          }}
                          placeholder={
                            isMahasiswaRole(formData.role)
                              ? 'misal: 215090200111012'
                              : formData.role === 'dosen' || formData.role === 'admin'
                              ? 'misal: 197405102000031002'
                              : isEksternalUser
                              ? 'misal: IDP-8829101 atau tri.astuti'
                              : 'misal: superadmin'
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Peran & Kategori SDM *</label>
                        <select
                          value={
                            isEksternalUser
                              ? 'eksternal'
                              : formData.role === 'admin' &&
                                (modalJabatan.includes('plp') || modalJabatan.includes('laboran'))
                              ? 'plp'
                              : formData.role
                          }
                          onChange={(e) => handleRoleChange(e.target.value as UserRole | 'plp' | 'eksternal')}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                        >
                          <option value="mahasiswa_s1">Mahasiswa S1 (Data Mahasiswa S1)</option>
                          <option value="mahasiswa_s2">Mahasiswa S2 (Data Mahasiswa S2)</option>
                          <option value="mahasiswa_s3">Mahasiswa S3 (Data Mahasiswa S3)</option>
                          <option value="dosen">Dosen (Manajemen Data Dosen)</option>
                          <option value="admin">Admin Jurusan (Manajemen Data Admin)</option>
                          <option value="plp">PLP (Data Manajemen PLP)</option>
                          <option value="eksternal">User Eksternal (Pembimbing Lapangan)</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEksternalUser ? "Nama Lengkap & Gelar Pembimbing Lapangan *" : "Nama Lengkap & Gelar *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder={
                          isEksternalUser
                            ? "misal: Dra. Tri Astuti, M.Si / Ir. Bambang Wijaya, M.T."
                            : "misal: Dr. Sc. Akhmad Sabarudin / Ahmad Rizky Pratama"
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEksternalUser ? "ID / NIK Pembimbing Lapangan *" : "NIM / NIP *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.identifier}
                          onChange={(e) => {
                            const val = e.target.value;
                            const idDigits = val.replace(/\D/g, '');
                            const shouldSyncUsername =
                              formData.role !== 'super_admin' && !isEksternalUser && idDigits.length >= 5;
                            setFormData({
                              ...formData,
                              identifier: val,
                              ...(shouldSyncUsername ? { username: idDigits } : {})
                            });
                          }}
                          placeholder={isEksternalUser ? "misal: IDP-8829101 / NIK. 35730..." : "NIM. 215090... / NIP. 1974..."}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEksternalUser ? "Email Resmi Instansi / Perusahaan *" : "Email Resmi UB *"}
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={isEksternalUser ? "tri.astuti@petrokimia-gresik.com" : "user@ub.ac.id"}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEksternalUser ? "No. WhatsApp / HP Pembimbing" : "No. WhatsApp / HP"}
                        </label>
                        <input
                          type="text"
                          value={formData.noHp}
                          onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                          placeholder="081234567890"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <label className="block text-xs font-semibold text-slate-700">
                            Kata Sandi (Password) <span className="text-slate-400 font-normal">(Opsional)</span>
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
                          <span className="text-[10px] text-slate-400">Kosongkan jika tidak diubah</span>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type={showModalPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Ketik sandi baru (min. 8 karakter kombinasi huruf besar, kecil, angka, simbol)..."
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

                      {formData.password.length > 0 && (
                        <PasswordRequirementsBox
                          password={formData.password}
                          onGenerate={handleGenerateAddPassword}
                          showGenerateButton={false}
                        />
                      )}

                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                        Kata sandi ini digunakan untuk masuk dari halaman awal website portal SIKMA.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEksternalUser ? "Jabatan / Peran di Instansi Mitra *" : "Jabatan / Status *"}
                        </label>
                        {isEksternalUser ? (
                          <select
                            value={formData.jabatan}
                            onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-amber-50/30"
                          >
                            {![
                              'Pembimbing Lapangan',
                              'Senior Process Engineer & Mentor KLK',
                              'Head of Quality Assurance & Mentor KLK',
                              'Kepala Laboratorium Pengujian & Mentor',
                              'Peneliti Utama & Mentor KLK',
                              'Supervisor Produksi & Mentor'
                            ].includes(formData.jabatan) && formData.jabatan && (
                              <option value={formData.jabatan}>{formData.jabatan}</option>
                            )}
                            <option value="Pembimbing Lapangan">Pembimbing Lapangan</option>
                            <option value="Senior Process Engineer & Mentor KLK">Senior Process Engineer & Mentor KLK</option>
                            <option value="Head of Quality Assurance & Mentor KLK">Head of Quality Assurance & Mentor KLK</option>
                            <option value="Kepala Laboratorium Pengujian & Mentor">Kepala Laboratorium Pengujian & Mentor</option>
                            <option value="Peneliti Utama & Mentor KLK">Peneliti Utama & Mentor KLK</option>
                            <option value="Supervisor Produksi & Mentor">Supervisor Produksi & Mentor</option>
                          </select>
                        ) : (
                          <select
                            value={formData.jabatan}
                            onChange={(e) => {
                              const newJab = e.target.value;
                              let newUnit = formData.unit;
                              let newRole = formData.role;
                              if (newJab === 'PLP') {
                                newRole = 'admin';
                                if (newUnit.startsWith('Program Studi')) newUnit = 'Laboratorium Kimia Analitik & Instrumentasi';
                              } else if (newJab === 'Dosen') {
                                newRole = 'dosen';
                                if (newUnit.startsWith('Program Studi')) newUnit = 'Laboratorium Kimia Analitik & Instrumentasi';
                              } else if (newJab === 'Admin') {
                                if (newRole !== 'super_admin') newRole = 'admin';
                                if (newUnit.startsWith('Program Studi')) newUnit = 'Sub-Bagian Akademik & Administrasi Departemen Kimia';
                              } else if (newJab === 'Mahasiswa S1') {
                                newRole = 'mahasiswa_s1';
                                newUnit = 'Program Studi S1 Kimia - FMIPA Universitas Brawijaya';
                              } else if (newJab === 'Mahasiswa S2') {
                                newRole = 'mahasiswa_s2';
                                newUnit = 'Program Studi S2 Kimia - FMIPA Universitas Brawijaya';
                              } else if (newJab === 'Mahasiswa S3') {
                                newRole = 'mahasiswa_s3';
                                newUnit = 'Program Studi S3 Kimia - FMIPA Universitas Brawijaya';
                              } else if (newJab === 'Pembimbing Lapangan') {
                                newRole = 'eksternal';
                                if (newUnit.startsWith('Program Studi') || newUnit.startsWith('Sub-Bagian')) newUnit = 'PT Petrokimia Gresik';
                              }
                              setFormData({ ...formData, role: newRole, jabatan: newJab, unit: newUnit });
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                          >
                            {!['Mahasiswa S1', 'Mahasiswa S2', 'Mahasiswa S3', 'Admin', 'Dosen', 'PLP', 'Pembimbing Lapangan'].includes(formData.jabatan) && formData.jabatan && (
                              <option value={formData.jabatan}>{formData.jabatan}</option>
                            )}
                            <option value="Mahasiswa S1">Mahasiswa S1</option>
                            <option value="Mahasiswa S2">Mahasiswa S2</option>
                            <option value="Mahasiswa S3">Mahasiswa S3</option>
                            <option value="Admin">Admin</option>
                            <option value="Dosen">Dosen</option>
                            <option value="PLP">PLP</option>
                            <option value="Pembimbing Lapangan">Pembimbing Lapangan</option>
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEksternalUser ? "Periode Pembimbingan KLK *" : "Semester *"}
                        </label>
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
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEksternalUser ? "Instansi / Perusahaan Mitra Industri KLK *" : "Program Studi / Unit Kerja *"}
                        </label>
                        {isEksternalUser ? (
                          <div className="space-y-1.5">
                            <select
                              value={
                                [
                                  'PT Petrokimia Gresik',
                                  'Pusat Riset Kimia - BRIN',
                                  'PT Kalbe Farma Tbk',
                                  'PT Pertamina (Persero) RU V Balikpapan',
                                  'Balai Besar Laboratorium Kesehatan (BBLK) Surabaya',
                                  'PT Badak NGL',
                                  'PT Unilever Indonesia Tbk',
                                  'PT Paragon Technology and Innovation',
                                  'Instansi / Mitra Industri KLK'
                                ].includes(formData.unit)
                                  ? formData.unit
                                  : 'lainnya'
                              }
                              onChange={(e) => {
                                if (e.target.value !== 'lainnya') {
                                  setFormData({ ...formData, unit: e.target.value });
                                } else {
                                  setFormData({ ...formData, unit: 'PT Bio Farma (Persero)' });
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-amber-50/30"
                            >
                              <option value="PT Petrokimia Gresik">PT Petrokimia Gresik</option>
                              <option value="Pusat Riset Kimia - BRIN">Pusat Riset Kimia - BRIN</option>
                              <option value="PT Kalbe Farma Tbk">PT Kalbe Farma Tbk</option>
                              <option value="PT Pertamina (Persero) RU V Balikpapan">PT Pertamina (Persero) RU V Balikpapan</option>
                              <option value="Balai Besar Laboratorium Kesehatan (BBLK) Surabaya">Balai Besar Laboratorium Kesehatan (BBLK) Surabaya</option>
                              <option value="PT Badak NGL">PT Badak NGL</option>
                              <option value="PT Unilever Indonesia Tbk">PT Unilever Indonesia Tbk</option>
                              <option value="PT Paragon Technology and Innovation">PT Paragon Technology and Innovation</option>
                              <option value="Instansi / Mitra Industri KLK">Instansi / Mitra Industri KLK (Umum)</option>
                              <option value="lainnya">Tulis Manual Nama Instansi Mitra...</option>
                            </select>
                            {(![
                              'PT Petrokimia Gresik',
                              'Pusat Riset Kimia - BRIN',
                              'PT Kalbe Farma Tbk',
                              'PT Pertamina (Persero) RU V Balikpapan',
                              'Balai Besar Laboratorium Kesehatan (BBLK) Surabaya',
                              'PT Badak NGL',
                              'PT Unilever Indonesia Tbk',
                              'PT Paragon Technology and Innovation',
                              'Instansi / Mitra Industri KLK'
                            ].includes(formData.unit) || formData.unit === 'lainnya') && (
                              <input
                                type="text"
                                required
                                value={formData.unit === 'lainnya' ? '' : formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder="Ketik nama instansi/perusahaan mitra..."
                                className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-amber-50/50 font-semibold"
                              />
                            )}
                          </div>
                        ) : (
                          <select
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                          >
                            {![
                              'Program Studi S1 Kimia - FMIPA Universitas Brawijaya',
                              'Program Studi S2 Kimia - FMIPA Universitas Brawijaya',
                              'Program Studi S3 Kimia - FMIPA Universitas Brawijaya',
                              'Instansi / Mitra Industri KLK',
                              'Laboratorium Kimia Analitik & Instrumentasi',
                              'Laboratorium Kimia Organik & Bahan Alam',
                              'Laboratorium Kimia Anorganik & Material',
                              'Laboratorium Kimia Fisik & Elektrokimia',
                              'Laboratorium Biokimia & Enzim',
                              'Sub-Bagian Akademik & Administrasi Departemen Kimia',
                              'Departemen Kimia FMIPA Universitas Brawijaya'
                            ].includes(formData.unit) && formData.unit && (
                              <option value={formData.unit}>{formData.unit}</option>
                            )}
                            <option value="Program Studi S1 Kimia - FMIPA Universitas Brawijaya">Program Studi S1 Kimia - FMIPA Universitas Brawijaya</option>
                            <option value="Program Studi S2 Kimia - FMIPA Universitas Brawijaya">Program Studi S2 Kimia - FMIPA Universitas Brawijaya</option>
                            <option value="Program Studi S3 Kimia - FMIPA Universitas Brawijaya">Program Studi S3 Kimia - FMIPA Universitas Brawijaya</option>
                            <option value="Instansi / Mitra Industri KLK">Instansi / Mitra Industri KLK</option>
                            <option value="Laboratorium Kimia Analitik & Instrumentasi">Laboratorium Kimia Analitik & Instrumentasi</option>
                            <option value="Laboratorium Kimia Organik & Bahan Alam">Laboratorium Kimia Organik & Bahan Alam</option>
                            <option value="Laboratorium Kimia Anorganik & Material">Laboratorium Kimia Anorganik & Material</option>
                            <option value="Laboratorium Kimia Fisik & Elektrokimia">Laboratorium Kimia Fisik & Elektrokimia</option>
                            <option value="Laboratorium Biokimia & Enzim">Laboratorium Biokimia & Enzim</option>
                            <option value="Sub-Bagian Akademik & Administrasi Departemen Kimia">Sub-Bagian Akademik & Administrasi Departemen Kimia</option>
                            <option value="Departemen Kimia FMIPA Universitas Brawijaya">Departemen Kimia FMIPA Universitas Brawijaya</option>
                          </select>
                        )}
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
                  </>
                );
              })()}

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

            {resetPassError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start justify-between gap-2 text-xs text-rose-800 mb-3">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-semibold">{resetPassError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setResetPassError(null)}
                  className="text-rose-400 hover:text-rose-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

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
                  <span className="font-medium text-slate-700">{getUserRoleLabel(userToDelete.role)}</span>
                </div>
                {userToDelete.identifier && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">NIP / NIM:</span>
                    <span className="font-mono text-slate-700">{userToDelete.identifier}</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-rose-800 mt-2.5 font-medium leading-relaxed bg-rose-100/70 p-2 rounded border border-rose-200">
                Pembersihan Otomatis: Data akun ini di modul Sumber Daya Manusia (SDM) dan seluruh rangkaian menu terkait (KLK, Logbook Lab, Jadwal Seminar, & Permohonan Surat) akan otomatis disinkronkan dan dibersihkan.
              </p>
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

      {/* Modal Konfirmasi Hapus Massal User */}
      {canBulkDelete && bulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Konfirmasi Hapus Massal User</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="my-4 p-4 bg-rose-50/70 border border-rose-200 rounded-lg text-slate-700">
              <p className="text-xs text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong className="text-rose-900">{selectedIds.length}</strong> akun pengguna yang dipilih?
              </p>
              <p className="text-[11px] text-rose-800 mt-2.5 font-medium leading-relaxed bg-rose-100/70 p-2 rounded border border-rose-200">
                Pembersihan Otomatis: Seluruh data akun yang dipilih pada modul Sumber Daya Manusia (SDM) dan rangkaian menu terkait (KLK, Logbook Lab, Jadwal Seminar, &amp; Permohonan Surat) akan otomatis dibersihkan.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDeleteUsers}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua Terpilih</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import User CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden transition-all ${
            importRawMatrix.length > 0 || importPreviewRows.length > 0 ? 'max-w-5xl' : 'max-w-3xl'
          }`}>
            <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/30 shrink-0">
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Import User SIKMA dari File CSV</h3>
                  <p className="text-[11px] text-slate-300">Unggah file .csv untuk mendaftarkan banyak akun sekaligus dan menyinkronkannya ke SDM.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Upload Area + Template Download */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Format Kolom CSV yang Didukung:</p>
                  <p className="leading-relaxed">
                    Wajib: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[#002B49]">username</code> (NIM/NIP atau ID Mitra),{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[#002B49]">nama</code>,{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[#002B49]">role</code>.{' '}
                    Opsional (boleh kosong): <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">email</code>,{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">password</code> (jika kosong: otomatis pakai NIM/NIP atau ID Mitra &amp; di-hash),{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">nim_nip</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">id_mitra</code>,{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">unit</code>,{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">no_hp</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadImportTemplate}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-[#002B49] border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template CSV</span>
                </button>
              </div>

              <input
                ref={csvFileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvFileChange}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverCsv(true);
                }}
                onDragLeave={() => setIsDragOverCsv(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverCsv(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processCsvFile(file);
                }}
                onClick={() => csvFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragOverCsv
                    ? 'border-[#002B49] bg-blue-50/70'
                    : 'border-slate-300 hover:border-[#002B49] hover:bg-slate-50/70'
                }`}
              >
                <Upload className="w-8 h-8 text-[#002B49] mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {importFileName ? `File dipilih: ${importFileName}` : 'Klik untuk memilih file CSV atau seret file ke area ini'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mendukung pemisah koma (,) maupun titik koma (;) dengan encoding UTF-8.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col justify-between gap-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-indigo-950">Hash Password Otomatis (SHA-256 + Salt)</p>
                      <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                        Jika kolom password kosong, sandi awal otomatis memakai <strong>NIM/NIP</strong> (Mahasiswa/Dosen/Admin) atau <strong>ID Mitra</strong> (Eksternal) dan langsung di-hash sebelum disimpan.
                      </p>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-indigo-950 cursor-pointer select-none pt-1 border-t border-indigo-200/70">
                    <input
                      type="checkbox"
                      checked={autoHashImportPassword}
                      onChange={(e) => setAutoHashImportPassword(e.target.checked)}
                      className="w-4 h-4 rounded border-indigo-300 text-[#002B49] focus:ring-[#002B49] cursor-pointer"
                    />
                    <span>Aktifkan Auto-Hash Password CSV</span>
                  </label>
                </div>

                <div className="flex flex-col justify-between gap-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-950">Proteksi Anti-Duplikat Data Aktif</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                        Mendeteksi duplikasi <strong>Username</strong> saja terhadap akun terdaftar di SIKMA maupun antar-baris di dalam CSV.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-200/70 text-xs">
                    <span className="font-semibold text-emerald-900">Aksi Duplikat:</span>
                    <select
                      value={importDuplicateMode}
                      onChange={(e) => setImportDuplicateMode(e.target.value as 'skip' | 'update')}
                      className="px-2 py-1 border border-emerald-300 rounded-lg bg-white text-[11px] font-bold text-slate-800 focus:ring-2 focus:ring-[#002B49] focus:outline-none cursor-pointer"
                    >
                      <option value="skip">Tolak / Lewati Duplikat (Anti-Duplikat)</option>
                      <option value="update">Perbarui Data User Eksisting</option>
                    </select>
                  </div>
                </div>
              </div>

              {importParseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-semibold">{importParseError}</p>
                </div>
              )}

              {(importPreviewRows.length > 0 || importRawMatrix.length > 0) && (() => {
                const errorCount = importPreviewRows.filter((r) => Boolean(r.error)).length;
                const duplicateCount = importPreviewRows.filter((r) => !r.error && r.isDuplicateUsername).length;
                const readyNewCount = importPreviewRows.filter((r) => !r.error && !r.isDuplicateUsername).length;
                const readyCount = importDuplicateMode === 'update' ? readyNewCount + duplicateCount : readyNewCount;

                const searchLower = importPreviewSearch.trim().toLowerCase();
                const filteredPreviewRows = importPreviewRows.filter((r) => {
                  if (importPreviewFilter === 'ready' && (r.error || (r.isDuplicateUsername && importDuplicateMode === 'skip'))) {
                    return false;
                  }
                  if (importPreviewFilter === 'duplicate' && (r.error || !r.isDuplicateUsername)) {
                    return false;
                  }
                  if (importPreviewFilter === 'error' && !r.error) {
                    return false;
                  }
                  if (searchLower) {
                    const hay = `${r.username} ${r.nama} ${r.email} ${r.identifier} ${r.unit} ${getUserRoleLabel(r.role)}`.toLowerCase();
                    if (!hay.includes(searchLower)) return false;
                  }
                  return true;
                });

                const formattedSize =
                  importFileSize >= 1024
                    ? `${(importFileSize / 1024).toFixed(1)} KB`
                    : `${importFileSize} B`;

                return (
                  <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50/70">
                    {/* Metadata & View Mode Switcher */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Eye className="w-4 h-4 text-[#002B49]" />
                          <span className="text-xs font-extrabold text-[#002B49]">
                            View &amp; Verifikasi File CSV Sebelum Import
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
                            {importFileName} ({formattedSize})
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                            Pemisah: {importDetectedDelimiter}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                            {Math.max(0, importRawMatrix.length - 1)} Baris Data • {importRawMatrix[0]?.length || 0} Kolom
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shrink-0 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setImportPreviewTab('parsed')}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            importPreviewTab === 'parsed'
                              ? 'bg-[#002B49] text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Pratinjau User Login ({importPreviewRows.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportPreviewTab('raw_table')}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            importPreviewTab === 'raw_table'
                              ? 'bg-[#002B49] text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Table className="w-3.5 h-3.5" />
                          <span>Tabel Asli CSV ({importRawMatrix.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImportPreviewTab('raw_text')}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            importPreviewTab === 'raw_text'
                              ? 'bg-[#002B49] text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Teks Mentah (.csv)</span>
                        </button>
                      </div>
                    </div>

                    {/* TAB 1: PRATINJAU PARSED USER LOGIN & VALIDASI */}
                    {importPreviewTab === 'parsed' && importPreviewRows.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => setImportPreviewFilter('all')}
                              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer border ${
                                importPreviewFilter === 'all'
                                  ? 'bg-[#002B49] text-white border-[#002B49]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Semua ({importPreviewRows.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setImportPreviewFilter('ready')}
                              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer border ${
                                importPreviewFilter === 'ready'
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              Siap Impor ({readyCount})
                            </button>
                            {duplicateCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setImportPreviewFilter('duplicate')}
                                className={`px-2.5 py-1 rounded-md font-bold cursor-pointer border ${
                                  importPreviewFilter === 'duplicate'
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                }`}
                              >
                                Duplikat ({duplicateCount})
                              </button>
                            )}
                            {errorCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setImportPreviewFilter('error')}
                                className={`px-2.5 py-1 rounded-md font-bold cursor-pointer border ${
                                  importPreviewFilter === 'error'
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                }`}
                              >
                                Tidak Valid / Duplikat CSV ({errorCount})
                              </button>
                            )}
                          </div>

                          <div className="relative w-full md:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={importPreviewSearch}
                              onChange={(e) => setImportPreviewSearch(e.target.value)}
                              placeholder="Cari username / nama di CSV..."
                              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white"
                            />
                          </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                          <div className="max-h-72 overflow-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                                <tr>
                                  <th className="px-3 py-2 font-bold">Baris</th>
                                  <th className="px-3 py-2 font-bold">Username Login</th>
                                  <th className="px-3 py-2 font-bold">Nama</th>
                                  <th className="px-3 py-2 font-bold">Role</th>
                                  <th className="px-3 py-2 font-bold">NIM / NIP / ID Mitra</th>
                                  <th className="px-3 py-2 font-bold">Email</th>
                                  <th className="px-3 py-2 font-bold">Keamanan Sandi</th>
                                  <th className="px-3 py-2 font-bold">Validasi &amp; Anti-Duplikat</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filteredPreviewRows.map((row) => (
                                  <tr
                                    key={row.rowNumber}
                                    className={
                                      row.error
                                        ? 'bg-rose-50/50'
                                        : row.isDuplicateUsername && importDuplicateMode === 'skip'
                                        ? 'bg-amber-50/40'
                                        : 'hover:bg-slate-50'
                                    }
                                  >
                                    <td className="px-3 py-2 font-mono text-slate-500">#{row.rowNumber}</td>
                                    <td className="px-3 py-2 font-mono font-semibold text-[#002B49]">{row.username || '-'}</td>
                                    <td className="px-3 py-2 font-semibold text-slate-800">{row.nama || '-'}</td>
                                    <td className="px-3 py-2">
                                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                        {getUserRoleLabel(row.role)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 font-mono text-[11px] text-slate-600">{row.identifier || '-'}</td>
                                    <td className="px-3 py-2 text-slate-600">{row.email || '-'}</td>
                                    <td className="px-3 py-2">
                                      {row.error ? (
                                        <span className="text-slate-400">-</span>
                                      ) : isHashedPassword(row.password) ? (
                                        <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold text-[11px]">
                                          <Lock className="w-3 h-3" />
                                          <span>Sudah di-hash</span>
                                        </span>
                                      ) : row.passwordAutoGenerated ? (
                                        <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold text-[11px]">
                                          <Lock className="w-3 h-3" />
                                          <span>
                                            {row.role === 'eksternal'
                                              ? 'ID Mitra + Hash SHA-256'
                                              : isMahasiswaRole(row.role)
                                              ? 'NIM + Hash SHA-256'
                                              : row.role !== 'super_admin'
                                              ? 'NIP + Hash SHA-256'
                                              : 'Generate + Hash SHA-256'}
                                          </span>
                                        </span>
                                      ) : autoHashImportPassword ? (
                                        <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold text-[11px]">
                                          <Lock className="w-3 h-3" />
                                          <span>Auto-Hash SHA-256</span>
                                        </span>
                                      ) : (
                                        <span className="text-slate-600 text-[11px]">Plaintext</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      {row.error ? (
                                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                          <span>{row.error}</span>
                                        </span>
                                      ) : row.isDuplicateUsername ? (
                                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                          <span>
                                            {importDuplicateMode === 'update'
                                              ? `Akan diperbarui (${row.duplicateReason || 'duplikat'})`
                                              : `Dilewati — ${row.duplicateReason || 'Username sudah terdaftar'}`}
                                          </span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                          <span>
                                            Unik &amp; siap impor
                                            {row.passwordAutoGenerated
                                              ? row.role === 'eksternal'
                                                ? ' (Sandi awal = ID Mitra)'
                                                : isMahasiswaRole(row.role)
                                                ? ' (Sandi awal = NIM)'
                                                : row.role !== 'super_admin'
                                                ? ' (Sandi awal = NIP)'
                                                : ' (Sandi otomatis)'
                                              : ''}
                                          </span>
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                                {filteredPreviewRows.length === 0 && (
                                  <tr>
                                    <td colSpan={8} className="px-4 py-6 text-center text-xs text-slate-500">
                                      Tidak ada baris CSV yang cocok dengan filter atau kata kunci pencarian saat ini.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {readyCount === 0 && (
                          <p className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                            Tidak ada baris baru yang dapat diimpor dengan pengaturan saat ini (semua baris terdeteksi duplikat atau tidak valid). Ubah opsi Aksi Duplikat jika ingin memperbarui akun eksisting.
                          </p>
                        )}
                      </div>
                    )}

                    {/* TAB 2: VIEW TABEL ISI ASLI CSV */}
                    {importPreviewTab === 'raw_table' && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="max-h-72 overflow-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-100 text-slate-800 sticky top-0 z-10 border-b border-slate-200">
                              <tr>
                                <th className="px-3 py-2 font-bold border-r border-slate-200 bg-slate-200/70 w-14">Baris</th>
                                {(importRawMatrix[0] || []).map((headerCell, colIndex) => (
                                  <th key={colIndex} className="px-3 py-2 font-bold whitespace-nowrap border-r border-slate-200 last:border-r-0">
                                    {headerCell || `Kolom ${colIndex + 1}`}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {importRawMatrix.slice(1).map((rawRow, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 font-mono text-slate-500 border-r border-slate-100 bg-slate-50/70">
                                    #{rIdx + 2}
                                  </td>
                                  {(importRawMatrix[0] || []).map((_, cIdx) => (
                                    <td key={cIdx} className="px-3 py-2 font-mono text-[11px] text-slate-700 whitespace-nowrap border-r border-slate-100 last:border-r-0">
                                      {rawRow[cIdx] ? rawRow[cIdx] : <span className="text-slate-300 italic">(kosong)</span>}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: VIEW TEKS MENTAH CSV */}
                    {importPreviewTab === 'raw_text' && (
                      <div className="border border-slate-200 rounded-xl bg-slate-900 text-slate-100 p-3.5 max-h-72 overflow-auto">
                        <pre className="text-[11px] font-mono leading-relaxed whitespace-pre">
                          {importRawText || '(File kosong)'}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                disabled={isImportingCsv}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  isImportingCsv ||
                  importPreviewRows.filter(
                    (r) => !r.error && (!r.isDuplicateUsername || importDuplicateMode === 'update')
                  ).length === 0
                }
                onClick={handleConfirmImportUsers}
                className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] disabled:bg-slate-300 disabled:text-slate-500 text-[#D4AF37] font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {isImportingCsv
                    ? 'Memproses Hash & Mengimpor...'
                    : `Import ${
                        importPreviewRows.filter(
                          (r) => !r.error && (!r.isDuplicateUsername || importDuplicateMode === 'update')
                        ).length
                      } User`}
                </span>
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
