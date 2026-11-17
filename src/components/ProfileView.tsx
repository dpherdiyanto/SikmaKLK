import React, { useState, useMemo, useEffect } from 'react';
import {
  AuthUser,
  UserRole,
  Dosen,
  Mahasiswa,
  AdminStaff,
  PLPStaff,
  PembimbingLapanganStaff,
  PengajuanKLK,
  LogbookLabItem,
  JadwalSeminar,
  SuratPengajuan,
  BidangKeahlianKimia,
  LabRiset,
  isMahasiswaRole,
  getMahasiswaRoleLabel,
  getUserRoleLabel
} from '../types/sikma';
import { UserAccountItem } from '../data/userList';
import { PREDEFINED_ACCOUNTS } from '../data/authUsers';
import {
  isUserMatchingEntity,
  isIdentifierMatch,
  isNameMatch,
  getInitials,
  parseNameAndGelar,
  syncUserEditAcrossAllModules
} from '../utils/syncUserAndSdm';
import {
  verifyPassword,
  hashPassword,
  getPasswordValidationMessage
} from '../utils/passwordPolicy';
import { UbLogo } from './UbLogo';
import {
  User,
  ShieldCheck,
  Building,
  Lock,
  KeyRound,
  CheckCircle2,
  Clock,
  Save,
  RotateCcw,
  BadgeCheck,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  FlaskConical,
  Briefcase,
  Database
} from 'lucide-react';

interface SaveSyncedProfilePayload {
  updatedAuth: AuthUser;
  updatedUserList: UserAccountItem[];
  updatedDosenList: Dosen[];
  updatedMahasiswaList: Mahasiswa[];
  updatedAdminList: AdminStaff[];
  updatedPlpList: PLPStaff[];
  updatedPembimbingLapanganList: PembimbingLapanganStaff[];
  updatedKlkList: PengajuanKLK[];
  updatedLogbooks: LogbookLabItem[];
  updatedSeminarList: JadwalSeminar[];
  updatedSuratList: SuratPengajuan[];
}

interface ProfileViewProps {
  currentUser: AuthUser | null;
  currentRole: UserRole;
  userList?: UserAccountItem[];
  dosenList?: Dosen[];
  mahasiswaList?: Mahasiswa[];
  adminList?: AdminStaff[];
  plpList?: PLPStaff[];
  pembimbingLapanganList?: PembimbingLapanganStaff[];
  klkList?: PengajuanKLK[];
  logbooks?: LogbookLabItem[];
  seminarList?: JadwalSeminar[];
  suratList?: SuratPengajuan[];
  onUpdateUser?: (updated: AuthUser) => void;
  onSaveSyncedProfile?: (payload: SaveSyncedProfilePayload) => void;
  onUpdateUserPassword?: (userId: string, hashedPassword: string) => void;
  mustChangePassword?: boolean;
  focusSecuritySignal?: number;
}

const getDefaultProfileFallback = (role: UserRole) => {
  const preset = PREDEFINED_ACCOUNTS[role] || PREDEFINED_ACCOUNTS.mahasiswa_s1;
  return {
    nama: preset.nama,
    username: preset.username,
    identifier: preset.identifier,
    email: preset.email,
    unit: preset.unit,
    jabatan: preset.jabatan
  };
};

const formatIdentifierClean = (rawIdentifier: string, role: UserRole): string => {
  const trimmed = (rawIdentifier || '').trim();
  const digits = trimmed.replace(/\D/g, '');
  if (role === 'super_admin') {
    return trimmed || 'SA-001';
  }
  if (role === 'eksternal') {
    return trimmed || 'IDP-8829101';
  }
  if (isMahasiswaRole(role)) {
    return digits ? `NIM. ${digits}` : trimmed;
  }
  if (role === 'dosen' || role === 'admin') {
    return digits ? `NIP. ${digits}` : trimmed;
  }
  return trimmed;
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  currentRole,
  userList = [],
  dosenList = [],
  mahasiswaList = [],
  adminList = [],
  plpList = [],
  pembimbingLapanganList = [],
  klkList = [],
  logbooks = [],
  seminarList = [],
  suratList = [],
  onUpdateUser,
  onSaveSyncedProfile,
  onUpdateUserPassword,
  mustChangePassword = false,
  focusSecuritySignal = 0
}) => {
  // 1. Resolve matching User Account from Menu User (sikma_user_accounts)
  const matchedUser = useMemo<UserAccountItem | undefined>(() => {
    if (!userList || userList.length === 0) return undefined;
    const cleanCurrId = (currentUser?.identifier || '').replace(/\D/g, '');
    return userList.find((u) => {
      if (!u) return false;
      if (currentUser?.id && u.id === currentUser.id) return true;
      if (currentUser?.username && u.username.toLowerCase() === currentUser.username.toLowerCase()) return true;
      if (
        u.role === currentRole &&
        ((cleanCurrId && isIdentifierMatch(u.identifier, cleanCurrId)) ||
          (currentUser?.nama && isNameMatch(u.nama, currentUser.nama)))
      ) {
        return true;
      }
      return false;
    });
  }, [userList, currentUser, currentRole]);

  // Synthetic UserAccountItem fallback for entity matching
  const matchCandidate = useMemo<UserAccountItem>(() => {
    if (matchedUser) return matchedUser;
    const fallback = getDefaultProfileFallback(currentRole);
    return {
      id: currentUser?.id || `usr-${currentRole}`,
      username: currentUser?.username || fallback.username,
      nama: currentUser?.nama || fallback.nama,
      role: currentRole,
      identifier: currentUser?.identifier || fallback.identifier,
      email: currentUser?.email || fallback.email,
      avatarText: currentUser?.avatarText || 'UB',
      unit: currentUser?.unit || fallback.unit,
      jabatan: currentUser?.jabatan || fallback.jabatan,
      status: 'Aktif',
      tanggalDibuat: '-',
      terakhirLogin: currentUser?.lastLogin || 'Baru saja',
      noHp: ''
    };
  }, [matchedUser, currentUser, currentRole]);

  // 2. Resolve matching SDM entity from Menu Sumber Daya Manusia
  const matchedDosen = useMemo<Dosen | undefined>(() => {
    if (currentRole !== 'dosen') return undefined;
    const cleanNum = (matchCandidate.identifier || matchCandidate.username || '').replace(/\D/g, '');
    return dosenList.find(
      (d) =>
        isUserMatchingEntity(matchCandidate, d) ||
        (cleanNum && isIdentifierMatch(d.nip, cleanNum)) ||
        isNameMatch(d.nama, matchCandidate.nama)
    );
  }, [currentRole, dosenList, matchCandidate]);

  const matchedMahasiswa = useMemo<Mahasiswa | undefined>(() => {
    if (!isMahasiswaRole(currentRole)) return undefined;
    const cleanNum = (matchCandidate.identifier || matchCandidate.username || '').replace(/\D/g, '');
    return mahasiswaList.find(
      (m) =>
        isUserMatchingEntity(matchCandidate, m) ||
        (cleanNum && isIdentifierMatch(m.nim, cleanNum)) ||
        isNameMatch(m.nama, matchCandidate.nama)
    );
  }, [currentRole, mahasiswaList, matchCandidate]);

  const matchedPlp = useMemo<PLPStaff | undefined>(() => {
    if (currentRole !== 'admin') return undefined;
    const jabLower = (matchCandidate.jabatan || '').toLowerCase();
    const isLikelyPlp =
      jabLower.includes('plp') ||
      jabLower.includes('pranata laboratorium') ||
      jabLower.includes('laboran');
    const cleanNum = (matchCandidate.identifier || matchCandidate.username || '').replace(/\D/g, '');
    const found = plpList.find(
      (p) =>
        isUserMatchingEntity(matchCandidate, p) ||
        (cleanNum && isIdentifierMatch(p.nip, cleanNum)) ||
        isNameMatch(p.nama, matchCandidate.nama)
    );
    if (found) return found;
    return isLikelyPlp ? plpList[0] : undefined;
  }, [currentRole, plpList, matchCandidate]);

  const matchedAdmin = useMemo<AdminStaff | undefined>(() => {
    if (currentRole !== 'admin' && currentRole !== 'super_admin') return undefined;
    if (matchedPlp) return undefined;
    const cleanNum = (matchCandidate.identifier || matchCandidate.username || '').replace(/\D/g, '');
    return adminList.find(
      (a) =>
        isUserMatchingEntity(matchCandidate, a) ||
        (cleanNum && isIdentifierMatch(a.nip, cleanNum)) ||
        isNameMatch(a.nama, matchCandidate.nama)
    );
  }, [currentRole, adminList, matchedPlp, matchCandidate]);

  const matchedPembimbing = useMemo<PembimbingLapanganStaff | undefined>(() => {
    if (currentRole !== 'eksternal') return undefined;
    const cleanNum = (matchCandidate.identifier || '').replace(/\D/g, '');
    return pembimbingLapanganList.find(
      (p) =>
        isUserMatchingEntity(matchCandidate, p) ||
        (cleanNum && isIdentifierMatch(p.idMitra, cleanNum)) ||
        isNameMatch(p.nama, matchCandidate.nama)
    );
  }, [currentRole, pembimbingLapanganList, matchCandidate]);

  // Build synchronized snapshot combining Menu User + Menu Sumber Daya Manusia
  const buildSyncedFormState = useMemo(() => {
    const fallback = getDefaultProfileFallback(currentRole);
    const customAlamatKey = `sikma_profile_alamat_${matchCandidate.id || currentRole}`;
    let savedCustomAlamat = '';
    try {
      savedCustomAlamat = localStorage.getItem(customAlamatKey) || '';
    } catch {}

    let nama = matchedUser?.nama || currentUser?.nama || fallback.nama;
    let username = matchedUser?.username || currentUser?.username || fallback.username;
    let identifier = formatIdentifierClean(
      matchedUser?.identifier || currentUser?.identifier || fallback.identifier,
      currentRole
    );
    let email = matchedUser?.email || currentUser?.email || fallback.email;
    let unit = matchedUser?.unit || currentUser?.unit || fallback.unit;
    let jabatan = matchedUser?.jabatan || currentUser?.jabatan || fallback.jabatan;
    let phone = matchedUser?.noHp || '';
    let lokasi = savedCustomAlamat || 'Departemen Kimia, FSTeM Universitas Brawijaya, Jl. Veteran Malang 65145';
    let bidang: BidangKeahlianKimia = matchedDosen?.bidang || 'Kimia Analitik';
    let jabatanAkademik: Dosen['jabatanAkademik'] = matchedDosen?.jabatanAkademik || 'Lektor';
    let pendidikanTerakhir = matchedAdmin?.pendidikanTerakhir || 'S1 Ilmu Administrasi';

    if (matchedDosen) {
      nama = matchedDosen.gelar ? `${matchedDosen.nama}, ${matchedDosen.gelar}` : matchedDosen.nama;
      const nipDigits = (matchedDosen.nip || '').replace(/\D/g, '');
      if (nipDigits) {
        identifier = `NIP. ${nipDigits}`;
        username = nipDigits;
      }
      email = matchedDosen.email || email;
      phone = matchedDosen.telepon || phone;
      unit = matchedDosen.unit || matchedDosen.lab || unit;
      jabatan = matchedDosen.jabatan || matchedUser?.jabatan || `${matchedDosen.jabatanAkademik} - KBK ${matchedDosen.bidang}`;
      lokasi = matchedDosen.ruangKantor || lokasi;
      bidang = matchedDosen.bidang;
      jabatanAkademik = matchedDosen.jabatanAkademik;
    } else if (matchedMahasiswa) {
      nama = matchedMahasiswa.nama || nama;
      const nimDigits = (matchedMahasiswa.nim || '').replace(/\D/g, '');
      if (nimDigits) {
        identifier = `NIM. ${nimDigits}`;
        username = nimDigits;
      }
      email = matchedMahasiswa.email || email;
      phone = matchedMahasiswa.telepon || phone;
      unit = matchedMahasiswa.programStudi || matchedMahasiswa.unit || unit;
      jabatan =
        matchedMahasiswa.jabatan ||
        matchedUser?.jabatan ||
        `Mahasiswa ${matchedMahasiswa.status} Semester ${matchedMahasiswa.semester}`;
    } else if (matchedPlp) {
      nama = matchedPlp.gelar ? `${matchedPlp.nama}, ${matchedPlp.gelar}` : matchedPlp.nama;
      const nipDigits = (matchedPlp.nip || '').replace(/\D/g, '');
      if (nipDigits) {
        identifier = `NIP. ${nipDigits}`;
        username = nipDigits;
      }
      email = matchedPlp.email || email;
      phone = matchedPlp.telepon || phone;
      unit = matchedPlp.labUtama || unit;
      jabatan = matchedPlp.jabatan || matchedUser?.jabatan || `Pranata Laboratorium Pendidikan (${matchedPlp.jenjang})`;
      lokasi = matchedPlp.ruangLab || lokasi;
    } else if (matchedAdmin) {
      nama = matchedAdmin.gelar ? `${matchedAdmin.nama}, ${matchedAdmin.gelar}` : matchedAdmin.nama;
      const nipDigits = (matchedAdmin.nip || '').replace(/\D/g, '');
      if (nipDigits) {
        identifier = `NIP. ${nipDigits}`;
        username = nipDigits;
      }
      email = matchedAdmin.email || email;
      phone = matchedAdmin.telepon || phone;
      unit = matchedAdmin.unit || unit;
      jabatan = matchedAdmin.jabatan || jabatan;
      lokasi = matchedAdmin.ruangKantor || lokasi;
      pendidikanTerakhir = matchedAdmin.pendidikanTerakhir || pendidikanTerakhir;
    } else if (matchedPembimbing) {
      nama = matchedPembimbing.gelar ? `${matchedPembimbing.nama}, ${matchedPembimbing.gelar}` : matchedPembimbing.nama;
      username = matchedPembimbing.username || username;
      identifier = matchedPembimbing.idMitra || identifier;
      email = matchedPembimbing.email || email;
      phone = matchedPembimbing.telepon || phone;
      unit = matchedPembimbing.namaMitra || unit;
      jabatan = matchedPembimbing.jabatan || jabatan;
      lokasi = matchedPembimbing.alamatInstansi || lokasi;
    }

    return {
      nama,
      username,
      identifier,
      email,
      unit,
      jabatan,
      phone,
      lokasi,
      bidang,
      jabatanAkademik,
      pendidikanTerakhir
    };
  }, [
    currentRole,
    currentUser,
    matchedUser,
    matchCandidate.id,
    matchedDosen,
    matchedMahasiswa,
    matchedPlp,
    matchedAdmin,
    matchedPembimbing
  ]);

  const [formData, setFormData] = useState(buildSyncedFormState);

  useEffect(() => {
    setFormData(buildSyncedFormState);
  }, [buildSyncedFormState]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active section tab
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'security' | 'role' | 'activity'>(
    mustChangePassword ? 'security' : 'info'
  );
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (mustChangePassword) {
      setActiveSubTab('security');
    }
  }, [mustChangePassword, focusSecuritySignal]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const isEksternalUser =
    currentRole === 'eksternal' ||
    (formData.jabatan || '').toLowerCase().includes('pembimbing lapangan') ||
    (formData.jabatan || '').toLowerCase().includes('mentor');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNama = buildSyncedFormState.nama.trim() || formData.nama.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedUsername = formData.username.trim();
    const trimmedIdentifier = buildSyncedFormState.identifier.trim() || formData.identifier.trim();
    const lockedJabatan = buildSyncedFormState.jabatan.trim() || formData.jabatan.trim();

    if (!trimmedNama) {
      showNotification('Nama lengkap tidak boleh kosong.', 'error');
      return;
    }

    if (trimmedEmail && !trimmedEmail.includes('@')) {
      showNotification('Format email tidak valid.', 'error');
      return;
    }

    let finalUsername = trimmedUsername;
    let finalIdentifier = trimmedIdentifier;

    if (currentRole !== 'super_admin' && !isEksternalUser) {
      const idDigits = trimmedIdentifier.replace(/\D/g, '') || trimmedUsername.replace(/\D/g, '');
      if (idDigits.length < 5) {
        showNotification(
          isMahasiswaRole(currentRole)
            ? 'NIM wajib berupa angka minimal 5 digit (juga digunakan sebagai Username Login).'
            : 'NIP wajib berupa angka minimal 5 digit (juga digunakan sebagai Username Login).',
          'error'
        );
        return;
      }
      finalUsername = idDigits;
      finalIdentifier = isMahasiswaRole(currentRole) ? `NIM. ${idDigits}` : `NIP. ${idDigits}`;
    } else if (isEksternalUser) {
      if (!finalUsername) {
        showNotification('Username / ID Mitra login tidak boleh kosong.', 'error');
        return;
      }
      finalIdentifier = trimmedIdentifier || finalUsername;
    } else {
      finalUsername = trimmedUsername || 'superadmin';
      finalIdentifier = trimmedIdentifier || 'SA-001';
    }

    const avatarText = getInitials(trimmedNama);
    const updatedAuth: AuthUser = {
      id: matchedUser?.id || currentUser?.id || `user-${Date.now()}`,
      username: finalUsername,
      nama: trimmedNama,
      role: currentRole,
      identifier: finalIdentifier,
      email: trimmedEmail,
      avatarText,
      unit: formData.unit.trim(),
      jabatan: lockedJabatan,
      lastLogin: currentUser?.lastLogin || matchedUser?.terakhirLogin || 'Baru saja',
      mustChangePassword: currentUser?.mustChangePassword,
      isFirstLogin: currentUser?.isFirstLogin,
      passwordChangedAt: currentUser?.passwordChangedAt
    };

    // Simpan alamat custom ke localStorage jika relevan (Mahasiswa / Super Admin)
    try {
      const customAlamatKey = `sikma_profile_alamat_${updatedAuth.id || currentRole}`;
      localStorage.setItem(customAlamatKey, formData.lokasi.trim());
    } catch {}

    if (onSaveSyncedProfile && userList.length > 0) {
      const oldUserItem: UserAccountItem = matchedUser || {
        ...matchCandidate,
        id: updatedAuth.id
      };

      const updatedAccountItem: UserAccountItem = {
        ...oldUserItem,
        username: finalUsername,
        nama: trimmedNama,
        identifier: finalIdentifier,
        email: trimmedEmail,
        avatarText,
        unit: formData.unit.trim(),
        jabatan: lockedJabatan,
        noHp: formData.phone.trim()
      };

      const targetExists = userList.some((u) => u.id === oldUserItem.id);
      const updatedUserList = targetExists
        ? userList.map((u) => (u.id === oldUserItem.id ? updatedAccountItem : u))
        : [updatedAccountItem, ...userList];

      const fullRes = syncUserEditAcrossAllModules(oldUserItem, updatedAccountItem, {
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

      // Terapkan field SDM spesifik (ruangKantor, ruangLab, alamatInstansi, bidang, jabatanAkademik, pendidikanTerakhir)
      const parsedName = parseNameAndGelar(trimmedNama);

      const nextDosenList = fullRes.newDosenList.map((d) => {
        if (matchedDosen && d.id === matchedDosen.id) {
          return {
            ...d,
            nama: parsedName.nama || trimmedNama,
            gelar: parsedName.gelar,
            nip: finalUsername,
            email: trimmedEmail,
            telepon: formData.phone.trim(),
            unit: formData.unit.trim() || d.unit,
            jabatan: formData.jabatan.trim() || d.jabatan,
            ruangKantor: formData.lokasi.trim() || d.ruangKantor,
            bidang: formData.bidang || d.bidang,
            jabatanAkademik: formData.jabatanAkademik || d.jabatanAkademik
          };
        }
        return d;
      });

      const nextMahasiswaList = fullRes.newMahasiswaList.map((m) => {
        if (matchedMahasiswa && m.id === matchedMahasiswa.id) {
          return {
            ...m,
            nama: trimmedNama,
            nim: finalUsername,
            email: trimmedEmail,
            telepon: formData.phone.trim(),
            programStudi: formData.unit.trim() || m.programStudi,
            unit: formData.unit.trim() || m.unit,
            jabatan: formData.jabatan.trim() || m.jabatan
          };
        }
        return m;
      });

      const nextAdminList = fullRes.newAdminList.map((a) => {
        if (matchedAdmin && a.id === matchedAdmin.id) {
          return {
            ...a,
            nama: parsedName.nama || trimmedNama,
            gelar: parsedName.gelar,
            nip: finalUsername,
            email: trimmedEmail,
            telepon: formData.phone.trim(),
            unit: formData.unit.trim() || a.unit,
            jabatan: formData.jabatan.trim() || a.jabatan,
            ruangKantor: formData.lokasi.trim() || a.ruangKantor,
            pendidikanTerakhir: formData.pendidikanTerakhir.trim() || a.pendidikanTerakhir
          };
        }
        return a;
      });

      const nextPlpList = fullRes.newPlpList.map((p) => {
        if (matchedPlp && p.id === matchedPlp.id) {
          return {
            ...p,
            nama: parsedName.nama || trimmedNama,
            gelar: parsedName.gelar,
            nip: finalUsername,
            email: trimmedEmail,
            telepon: formData.phone.trim(),
            labUtama: formData.unit.trim() || p.labUtama,
            jabatan: formData.jabatan.trim() || p.jabatan,
            ruangLab: formData.lokasi.trim() || p.ruangLab
          };
        }
        return p;
      });

      const nextPembimbingList = (fullRes.newPembimbingLapanganList || pembimbingLapanganList).map((pb) => {
        if (matchedPembimbing && pb.id === matchedPembimbing.id) {
          return {
            ...pb,
            nama: parsedName.nama || trimmedNama,
            gelar: parsedName.gelar,
            username: finalUsername,
            idMitra: finalIdentifier,
            email: trimmedEmail,
            telepon: formData.phone.trim(),
            namaMitra: formData.unit.trim() || pb.namaMitra,
            jabatan: formData.jabatan.trim() || pb.jabatan,
            alamatInstansi: formData.lokasi.trim() || pb.alamatInstansi
          };
        }
        return pb;
      });

      onSaveSyncedProfile({
        updatedAuth,
        updatedUserList,
        updatedDosenList: nextDosenList,
        updatedMahasiswaList: nextMahasiswaList,
        updatedAdminList: nextAdminList,
        updatedPlpList: nextPlpList,
        updatedPembimbingLapanganList: nextPembimbingList,
        updatedKlkList: fullRes.newKlkList,
        updatedLogbooks: fullRes.newLogbooks,
        updatedSeminarList: fullRes.newSeminarList,
        updatedSuratList: fullRes.newSuratList
      });
    } else {
      if (onUpdateUser) {
        onUpdateUser(updatedAuth);
      }
    }

    showNotification('Data Biodata & Akun berhasil disimpan dan disinkronkan ke Menu User & Sumber Daya Manusia!');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showNotification('Masukkan kata sandi saat ini.', 'error');
      return;
    }

    const storedPass = matchedUser?.password || PREDEFINED_ACCOUNTS[currentRole]?.passwordHint || '';
    const isCurrentValid = storedPass ? await verifyPassword(currentPassword, storedPass) : false;
    const presetHint = PREDEFINED_ACCOUNTS[currentRole]?.passwordHint;
    if (!isCurrentValid && currentPassword !== presetHint) {
      showNotification('Kata sandi saat ini tidak cocok dengan akun Anda.', 'error');
      return;
    }

    const validationErr = getPasswordValidationMessage(newPassword);
    if (validationErr) {
      showNotification(validationErr, 'error');
      return;
    }

    if (newPassword === currentPassword) {
      showNotification('Kata sandi baru harus berbeda dari kata sandi awal/saat ini.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }

    const hashed = await hashPassword(newPassword);
    const targetUserId = matchedUser?.id || currentUser?.id || '';
    if (targetUserId && onUpdateUserPassword) {
      onUpdateUserPassword(targetUserId, hashed);
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showNotification('Kata sandi berhasil diperbarui & diamankan dengan SHA-256. Peringatan ganti password telah diselesaikan!');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'admin':
        return { label: matchedPlp ? 'PLP / Laboran' : 'Admin Departemen', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'dosen':
        return { label: 'Dosen Pembimbing', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'eksternal':
        return { label: 'User Eksternal', bg: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
      case 'mahasiswa_s2':
        return { label: 'Mahasiswa S2', bg: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'mahasiswa_s3':
        return { label: 'Mahasiswa S3', bg: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
      default:
        return { label: getMahasiswaRoleLabel(role), bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const roleBadge = getRoleBadge(currentRole);
  const accountStatus = matchedUser?.status || 'Aktif';
  const sdmStatusLabel =
    matchedDosen?.status ||
    matchedMahasiswa?.status ||
    matchedPlp?.status ||
    matchedAdmin?.status ||
    matchedPembimbing?.status ||
    accountStatus;

  const sdmSourceLabel = matchedDosen
    ? 'SDM Data Dosen'
    : matchedMahasiswa
    ? 'SDM Data Mahasiswa'
    : matchedPlp
    ? 'SDM Data PLP / Laboran'
    : matchedAdmin
    ? 'SDM Data Admin'
    : matchedPembimbing
    ? 'SDM Pembimbing Lapangan'
    : 'Akun Konfigurasi User';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border animate-slideIn ${
            notification.type === 'success'
              ? 'bg-[#002B49] text-white border-yellow-400'
              : 'bg-rose-900 text-white border-rose-400'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header Banner Profil */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003865] to-[#001f35] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-[#D4AF37]/15 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-200 text-[#002B49] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
                {getInitials(formData.nama)}
              </div>
              <span
                className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-[#002B49] flex items-center justify-center text-white ${
                  accountStatus === 'Aktif' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={`Status Akun: ${accountStatus}`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* User Meta Information */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadge.bg}`}>
                  {roleBadge.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/10">
                  Status Akun: {accountStatus}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Sinkron: {sdmSourceLabel}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {formData.nama}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[#D4AF37] font-bold">
                  {formData.identifier}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-200">
                  Username: <strong className="text-white">{formData.username}</strong>
                </span>
                <span>•</span>
                <span>{formData.email}</span>
                <span>•</span>
                <span>{formData.unit}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-right">
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Tahun Akademik</div>
              <div className="text-xs font-bold text-yellow-300">2026/2027 Ganjil</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Password Change Alert Banner inside Profile */}
      {mustChangePassword && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-amber-950">
                  Peringatan Keamanan: Segera Ganti Password Awal Anda
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  Wajib Diganti
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Anda terdeteksi login menggunakan <strong>password awal (NIM / NIP / ID Mitra)</strong> atau belum memperbarui kata sandi akun. Demi keamanan akun SIKMA Anda, silakan buat <strong>kata sandi baru yang kuat</strong> pada tab <strong>Keamanan &amp; Kata Sandi</strong> di bawah ini. Notifikasi ini akan terus muncul hingga Anda mengganti password.
              </p>
            </div>
          </div>
          {activeSubTab !== 'security' && (
            <button
              type="button"
              onClick={() => setActiveSubTab('security')}
              className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] text-white text-xs font-bold rounded-xl shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-yellow-400" />
              <span>Buka Form Ganti Password</span>
            </button>
          )}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('info')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'info'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4 text-yellow-400" />
          <span>Informasi Profil</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4 text-yellow-400" />
          <span>Keamanan &amp; Kata Sandi</span>
          {mustChangePassword && (
            <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-extrabold uppercase tracking-wide">
              Wajib
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('role')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'role'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-yellow-400" />
          <span>Hak Akses &amp; Peran</span>
        </button>

        <button
          onClick={() => setActiveSubTab('activity')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'activity'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-yellow-400" />
          <span>Riwayat Aktivitas</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. INFORMASI PROFIL */}
      {activeSubTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sisi Kiri: Form Informasi Pribadi */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Data Biodata &amp; Akun</h3>
                <p className="text-xs text-slate-500">
                  Data di bawah tersinkronisasi langsung dengan <strong>Menu User</strong> dan <strong>Menu Sumber Daya Manusia</strong>
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Sinkron User &amp; SDM</span>
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-[10px] font-semibold text-slate-400">(Terkunci)</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={formData.nama}
                    title="Nama Lengkap disinkronkan dari Menu User / SDM dan tidak dapat diedit dari menu Profil"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Login {currentRole !== 'super_admin' && !isEksternalUser ? (isMahasiswaRole(currentRole) ? '(Otomatis NIM)' : '(Otomatis NIP)') : ''}
                  </label>
                  <input
                    type="text"
                    disabled={currentRole === 'super_admin' || !isEksternalUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg font-mono font-semibold ${
                      currentRole === 'super_admin' || !isEksternalUser
                        ? 'border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#002B49]'
                    }`}
                    title={
                      currentRole === 'super_admin'
                        ? 'Username Super Admin terkunci'
                        : isEksternalUser
                        ? 'User Eksternal dapat menggunakan ID Mitra / username bebas / email'
                        : 'Username login otomatis mengikuti angka NIM/NIP'
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isMahasiswaRole(currentRole)
                      ? 'NIM'
                      : isEksternalUser
                      ? 'ID Mitra / NIK'
                      : currentRole === 'super_admin'
                      ? 'ID Akun'
                      : 'NIP'}{' '}
                    <span className="text-[10px] font-semibold text-slate-400">(Terkunci)</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={formData.identifier}
                    title="ID Akun (NIM / NIP / ID Mitra) terkunci dan hanya dapat diubah oleh Admin"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isEksternalUser ? 'Email Resmi Mitra' : 'Email Resmi UB'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Masukkan alamat email..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jabatan / Status Fungsional <span className="text-[10px] font-semibold text-slate-400">(Terkunci)</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={formData.jabatan}
                    title="Jabatan / Status Fungsional disinkronkan dari Menu User / SDM dan tidak dapat diedit dari menu Profil"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isMahasiswaRole(currentRole)
                    ? 'Program Studi / Unit Akademik'
                    : currentRole === 'dosen' || matchedPlp
                    ? 'Laboratorium / Unit Kerja'
                    : isEksternalUser
                    ? 'Instansi / Perusahaan Mitra'
                    : 'Unit Kerja / Fakultas'}
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                />
              </div>

              {/* Field SDM Tambahan Sesuai Peran */}
              {matchedDosen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bidang Keahlian (KBK)</label>
                    <select
                      value={formData.bidang}
                      onChange={(e) => setFormData({ ...formData, bidang: e.target.value as BidangKeahlianKimia })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                    >
                      <option value="Kimia Analitik">Kimia Analitik</option>
                      <option value="Kimia Organik">Kimia Organik</option>
                      <option value="Kimia Anorganik">Kimia Anorganik</option>
                      <option value="Kimia Fisik">Kimia Fisik</option>
                      <option value="Biokimia">Biokimia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jabatan Akademik</label>
                    <select
                      value={formData.jabatanAkademik}
                      onChange={(e) =>
                        setFormData({ ...formData, jabatanAkademik: e.target.value as Dosen['jabatanAkademik'] })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                    >
                      <option value="Asisten Ahli">Asisten Ahli</option>
                      <option value="Lektor">Lektor</option>
                      <option value="Lektor Kepala">Lektor Kepala</option>
                      <option value="Guru Besar (Profesor)">Guru Besar (Profesor)</option>
                    </select>
                  </div>
                </div>
              )}

              {matchedAdmin && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={formData.pendidikanTerakhir}
                    onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {matchedDosen || matchedAdmin
                    ? 'Ruang Kantor (SDM)'
                    : matchedPlp
                    ? 'Ruang Laboratorium (SDM)'
                    : isEksternalUser
                    ? 'Alamat Instansi Mitra'
                    : 'Alamat Kantor / Domisili di Malang'}
                </label>
                <textarea
                  rows={2}
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900 resize-y"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(buildSyncedFormState);
                    showNotification('Data dikembalikan sesuai data terbaru Menu User & SDM');
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-lg font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4 text-yellow-400" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sisi Kanan: Kartu Ringkasan Akun (Menu User) & Data SDM Terhubung */}
          <div className="space-y-6">
            {/* Kartu 1: Ringkasan Akun dari Menu User */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#002B49]" />
                <span>Sinkronisasi Akun (Menu User)</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Role Sistem</span>
                  <span className="font-bold text-slate-800">{getUserRoleLabel(currentRole)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Username Login</span>
                  <span className="font-mono font-bold text-[#002B49]">{formData.username}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Status Akun</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      accountStatus === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {accountStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Terdaftar Sejak</span>
                  <span className="font-medium text-slate-700">{matchedUser?.tanggalDibuat || '-'}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Login Terakhir</span>
                  <span className="font-medium text-slate-700">{matchedUser?.terakhirLogin || 'Baru saja'}</span>
                </div>
              </div>
            </div>

            {/* Kartu 2: Detail Sinkronisasi SDM sesuai Peran */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                {matchedMahasiswa ? (
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                ) : matchedDosen ? (
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                ) : matchedPlp ? (
                  <FlaskConical className="w-4 h-4 text-amber-600" />
                ) : matchedPembimbing ? (
                  <Briefcase className="w-4 h-4 text-cyan-600" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#002B49]" />
                )}
                <span>Data SDM Terhubung</span>
              </h4>

              {matchedMahasiswa ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Angkatan &amp; Semester Aktif</span>
                    <span className="font-bold text-slate-800">
                      Angkatan {matchedMahasiswa.angkatan} • Semester {matchedMahasiswa.semester}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">IPK</span>
                      <span className="font-bold text-slate-900">{matchedMahasiswa.ipk.toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Total SKS</span>
                      <span className="font-bold text-slate-900">{matchedMahasiswa.totalSks} SKS</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Dosen Pembimbing Akademik (PA)</span>
                    <span className="font-semibold text-slate-800">
                      {matchedMahasiswa.dosenPANama || 'Belum Ditentukan'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tahap Skripsi / Tugas Akhir</span>
                    <span className="font-semibold text-slate-800">{matchedMahasiswa.tahapSkripsi}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lab Penelitian</span>
                    <span className="font-semibold text-slate-800">
                      {matchedMahasiswa.labPenelitian || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Mahasiswa (SDM)</span>
                    <span className="font-bold text-emerald-700">{sdmStatusLabel}</span>
                  </div>
                </div>
              ) : matchedDosen ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">NIP (Username Login)</span>
                    <span className="font-mono font-bold text-slate-800">{matchedDosen.nip || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">NIDN (Data Kepegawaian)</span>
                    <span className="font-mono font-semibold text-slate-700">{matchedDosen.nidn || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Laboratorium Riset</span>
                    <span className="font-semibold text-slate-800">{matchedDosen.lab}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Kuota Bimbingan</span>
                    <span className="font-bold text-slate-800">
                      {matchedDosen.jumlahBimbingan} / {matchedDosen.kuotaBimbingan} Mahasiswa
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Mengajar (SDM)</span>
                    <span className="font-bold text-blue-700">{sdmStatusLabel}</span>
                  </div>
                </div>
              ) : matchedPlp ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Jenjang Jabatan PLP</span>
                    <span className="font-bold text-slate-800">{matchedPlp.jenjang}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Laboratorium Utama</span>
                    <span className="font-semibold text-slate-800">{matchedPlp.labUtama}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Verifikator Bebas Lab</span>
                    <span className="font-bold text-emerald-700">
                      {matchedPlp.verifikatorBebasLab ? 'Ya (Aktif)' : 'Tidak'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Kepegawaian (SDM)</span>
                    <span className="font-bold text-emerald-700">{sdmStatusLabel}</span>
                  </div>
                </div>
              ) : matchedAdmin ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Pendidikan Terakhir</span>
                    <span className="font-semibold text-slate-800">{matchedAdmin.pendidikanTerakhir}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ruang Kantor</span>
                    <span className="font-semibold text-slate-800">{matchedAdmin.ruangKantor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Kepegawaian (SDM)</span>
                    <span className="font-bold text-emerald-700">{sdmStatusLabel}</span>
                  </div>
                </div>
              ) : matchedPembimbing ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">ID Mitra</span>
                    <span className="font-mono font-bold text-slate-800">{matchedPembimbing.idMitra}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Instansi / Perusahaan Mitra</span>
                    <span className="font-semibold text-slate-800">{matchedPembimbing.namaMitra}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Jumlah Bimbingan KLK</span>
                    <span className="font-bold text-slate-800">
                      {matchedPembimbing.jumlahMahasiswaBimbingan ?? 0} Mahasiswa
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Pembimbing (SDM)</span>
                    <span className="font-bold text-emerald-700">{sdmStatusLabel}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Institusi</span>
                    <span className="font-bold text-slate-800">Universitas Brawijaya Malang</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Fakultas</span>
                    <span className="font-semibold text-slate-800">Fakultas Sains, Teknologi, dan Matematika (FSTeM)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Departemen</span>
                    <span className="font-semibold text-slate-800">Departemen Kimia</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <UbLogo className="w-5 h-5 shrink-0 object-contain" />
                <span>Status Sinkronisasi Terpadu</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Setiap perubahan pada Data Biodata &amp; Akun akan otomatis menyelaraskan akun pada <strong>Menu Config → User</strong> serta data profil di <strong>Menu Sumber Daya Manusia</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. KEAMANAN & PASSWORD */}
      {activeSubTab === 'security' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-500" />
              <span>Ganti Kata Sandi (Password)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola kata sandi akun SIKMA Anda. Perubahan akan langsung memperbarui kredensial login Anda.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kata Sandi Saat Ini <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 karakter (A-Z, a-z, 0-9, simbol)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Kebijakan Kata Sandi SIKMA:</strong> Minimal 8 karakter dengan kombinasi huruf besar (A-Z), huruf kecil (a-z), angka (0-9), dan simbol (@, #, $, !, dll). Kata sandi baru disimpan terenkripsi menggunakan SHA-256 + salt.
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg font-bold shadow flex items-center gap-2 cursor-pointer transition-all"
              >
                <KeyRound className="w-4 h-4 text-yellow-400" />
                <span>Perbarui Kata Sandi</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: 3. HAK AKSES & PERAN */}
      {activeSubTab === 'role' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Matriks Hak Akses &amp; Otoritas Akun</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian hak akses modul sistem yang aktif untuk peran <strong>{roleBadge.label}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Dashboard &amp; Pengumuman</span>
                <span className="text-emerald-700 font-bold">Akses Penuh</span>
              </div>
              <p className="text-[11px] text-slate-500">Melihat statistik portal, pengumuman departemen, dan kalender kegiatan.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Tugas Akhir, Skripsi &amp; Tesis</span>
                <span className={currentRole === 'eksternal' ? 'text-slate-400 font-bold' : 'text-emerald-700 font-bold'}>
                  {currentRole === 'eksternal' ? 'Terbatas' : 'Akses Penuh'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Pengajuan judul, seminar proposal, ujian tesis, dan berita acara kelulusan.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Laboratorium &amp; Riset</span>
                <span className={currentRole === 'eksternal' ? 'text-slate-400 font-bold' : 'text-emerald-700 font-bold'}>
                  {currentRole === 'eksternal' ? 'Terbatas' : 'Akses Terkelola'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Peminjaman alat, logbook riset, bon bahan, dan permohonan bebas laboratorium.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Manajemen Pengguna &amp; Config</span>
                <span className={currentRole === 'super_admin' || currentRole === 'admin' ? 'text-emerald-700 font-bold' : 'text-slate-400 font-bold'}>
                  {currentRole === 'super_admin' || currentRole === 'admin' ? 'Akses Admin' : 'Terbatas'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Pengaturan role, semester, master data dosen, instansi mitra, dan ruangan.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>KLK &amp; Pembimbing Lapangan</span>
                <span className="text-emerald-700 font-bold">Akses Penuh</span>
              </div>
              <p className="text-[11px] text-slate-500">Pengelolaan pengajuan KLK, logbook mingguan, absensi harian, dan penilaian.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Portal Arsitektur CI3</span>
                <span className={currentRole === 'super_admin' || currentRole === 'admin' ? 'text-emerald-700 font-bold' : 'text-slate-400 font-bold'}>
                  {currentRole === 'super_admin' || currentRole === 'admin' ? 'Tersedia' : 'Terbatas'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Dokumentasi MVC, controller, model, view, dan source code CodeIgniter 3.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. RIWAYAT AKTIVITAS */}
      {activeSubTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Log Aktivitas Akun SIKMA</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan riwayat akses dan sinkronisasi akun <strong>{formData.nama}</strong> ({formData.username})
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Sesi Login Berhasil</div>
                <div className="text-slate-500 text-[11px]">
                  Masuk sebagai <strong>{roleBadge.label}</strong> dengan username <span className="font-mono">{formData.username}</span>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                {matchedUser?.terakhirLogin || currentUser?.lastLogin || 'Baru saja'}
              </span>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Sinkronisasi Data Menu User &amp; SDM</div>
                <div className="text-slate-500 text-[11px]">
                  Terhubung dengan <strong>{sdmSourceLabel}</strong> (Status: {sdmStatusLabel})
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Aktif</span>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Pembuatan Akun Sistem SIKMA</div>
                <div className="text-slate-500 text-[11px]">
                  Akun terdaftar dalam Manajemen User &amp; Akun SIKMA
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                {matchedUser?.tanggalDibuat || '-'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
