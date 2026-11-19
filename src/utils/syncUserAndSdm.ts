import { UserAccountItem } from '../data/userList';
import { Dosen, Mahasiswa, AdminStaff, PLPStaff, PembimbingLapanganStaff, UserRole, PengajuanKLK, LogbookLabItem, JadwalSeminar, SuratPengajuan, LabRiset, isMahasiswaRole, getMahasiswaJenjang, inferMahasiswaRoleFromText, normalizeMahasiswaRole } from '../types/sikma';

// Helper: Extract Clean Initials
export const getInitials = (str?: string): string => {
  if (!str || typeof str !== 'string') return 'UB';
  const clean = str.replace(/\b(prof|dr|dra|drs|s\.si|m\.si|ph\.d|m\.sc|s\.ap|m\.ap|s\.sos|s\.kom|a\.md|s\.tr\.si|dr\.sc)\b/gi, '').trim();
  const words = clean.split(/[\s,.-]+/).filter((w) => w.length > 0);
  if (words.length === 0) return 'UB';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// Helper: Generate unique safe username (NIM untuk Mahasiswa, NIP untuk Dosen/Admin/PLP, nama/ID untuk Eksternal & Super Admin)
export const generateUsername = (nama?: string, identifier?: string, role?: string): string => {
  const roleLower = (role || '').toLowerCase();
  const isIdBasedRole =
    roleLower === 'dosen' ||
    roleLower === 'admin' ||
    roleLower === 'plp' ||
    roleLower === 'mhs' ||
    roleLower.startsWith('mahasiswa');

  if (isIdBasedRole && typeof identifier === 'string') {
    const cleanNum = identifier.replace(/\D/g, '');
    if (cleanNum.length >= 5) {
      return cleanNum;
    }
  }

  const safeNama = typeof nama === 'string' ? nama : '';
  const cleanNama = safeNama
    .toLowerCase()
    .replace(/\b(prof|dr|dra|drs|s\.si|m\.si|ph\.d|m\.sc|s\.ap|m\.ap|s\.sos|s\.kom|a\.md|s\.tr\.si|dr\.sc)\b/gi, '')
    .trim();
  const tokens = cleanNama.split(/[\s,.-]+/).filter((t) => t.length > 1);
  let base = tokens.slice(0, 2).join('.');
  if (!base) {
    base = identifier && typeof identifier === 'string' ? identifier.replace(/\D/g, '').slice(-6) : `user.${role || 'sikma'}`;
  }
  return base.toLowerCase().replace(/[^a-z0-9.]/g, '');
};

// Helper: Check if identifier numbers match (NIM or NIP)
export const isIdentifierMatch = (id1?: string, id2?: string): boolean => {
  if (!id1 || !id2 || typeof id1 !== 'string' || typeof id2 !== 'string') return false;
  const c1 = id1.replace(/\D/g, '');
  const c2 = id2.replace(/\D/g, '');
  if (!c1 || !c2 || c1.length < 5 || c2.length < 5) return false;
  return c1 === c2 || c1.includes(c2) || c2.includes(c1);
};

// Helper: Check if names match reasonably
export const isNameMatch = (nama1?: string, nama2?: string): boolean => {
  if (!nama1 || !nama2 || typeof nama1 !== 'string' || typeof nama2 !== 'string') return false;
  const cleanTitleRegex = /\b(prof|dr|dra|drs|s\.si|m\.si|ph\.d|m\.sc|s\.ap|m\.ap|s\.sos|s\.kom|a\.md|s\.tr\.si|dr\.sc)\b/gi;
  const n1 = nama1.toLowerCase().replace(cleanTitleRegex, '').trim();
  const n2 = nama2.toLowerCase().replace(cleanTitleRegex, '').trim();
  if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return true;
  const t1 = n1.split(/\s+/).filter((t) => t.length >= 3);
  const t2 = n2.split(/\s+/).filter((t) => t.length >= 3);
  const common = t1.filter((t) => t2.includes(t));
  return common.length >= 2;
};

// Helper komprehensif: Memeriksa apakah entitas SDM (Dosen, Mahasiswa, Admin, PLP) cocok dengan User Account
// berdasarkan ID, NIM/NIP, Nama Lengkap (bebas tanda baca/gelar), atau Username.
export const isUserMatchingEntity = (
  user?: UserAccountItem | null,
  entity?: { id?: string; nama?: string; nip?: string; nidn?: string; nim?: string; idMitra?: string; email?: string; username?: string } | null
): boolean => {
  if (!user || !entity) return false;

  // 1. Direct ID matching
  if (user.id && entity.id && typeof user.id === 'string' && typeof entity.id === 'string') {
    if (user.id === entity.id) return true;
    const cleanUserId = user.id.replace(/^usr-(?:(?:mhs|dos|adm|plp|pbl)-)?/, '');
    const cleanEntityId = entity.id.replace(/^(?:mhs|dos|adm|plp|pbl)-?/, '');
    if (cleanUserId && cleanEntityId && cleanUserId === cleanEntityId) return true;
  }

  // 2. Email matching (case-insensitive exact match)
  if (
    typeof user.email === 'string' &&
    typeof entity.email === 'string' &&
    user.email.trim().length > 3 &&
    entity.email.trim().length > 3 &&
    user.email.trim().toLowerCase() === entity.email.trim().toLowerCase()
  ) {
    return true;
  }

  // 3. Identifier matching (NIM / NIP / NIDN / ID Mitra)
  const userNum = (typeof user.identifier === 'string' ? user.identifier : '').replace(/\D/g, '');
  const entityNum = (entity.nim || entity.nip || entity.nidn || entity.idMitra || '').replace(/\D/g, '');
  if (userNum && entityNum && userNum.length >= 4 && entityNum.length >= 4) {
    if (userNum === entityNum || userNum.includes(entityNum) || entityNum.includes(userNum)) {
      return true;
    }
  }

  // 4. Name comparison (strip academic degrees, punctuation, spaces)
  const cleanTitleRegex = /\b(prof|dr|dra|drs|s\.si|m\.si|ph\.d|m\.sc|s\.ap|m\.ap|s\.sos|s\.kom|a\.md|s\.tr\.si|dr\.sc)\b/gi;
  const normUserNama = (typeof user.nama === 'string' ? user.nama : '')
    .toLowerCase()
    .replace(cleanTitleRegex, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
  const normEntityNama = (typeof entity.nama === 'string' ? entity.nama : '')
    .toLowerCase()
    .replace(cleanTitleRegex, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  if (normUserNama && normEntityNama) {
    if (normUserNama === normEntityNama) return true;
    if (normUserNama.length >= 3 && normEntityNama.length >= 3) {
      if (normUserNama.includes(normEntityNama) || normEntityNama.includes(normUserNama)) return true;
    }
  }

  // 5. Username comparison against entity name, username, or identifier
  const normUsername = (typeof user.username === 'string' ? user.username : '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  if (normUsername && normUsername.length >= 3) {
    if (typeof entity.username === 'string' && entity.username.trim().toLowerCase() === user.username?.trim().toLowerCase()) {
      return true;
    }
    if (normEntityNama && (normEntityNama === normUsername || normEntityNama.includes(normUsername) || normUsername.includes(normEntityNama))) {
      return true;
    }
    if (entityNum && normUsername === entityNum) {
      return true;
    }
  }

  // 6. Fallback standard name match
  if (user.nama && entity.nama && isNameMatch(user.nama, entity.nama)) return true;
  if (user.username && entity.nama && isNameMatch(user.username, entity.nama)) return true;

  return false;
};

export interface SyncResult {
  updatedUsers: UserAccountItem[];
  addedCount: number;
  updatedCount: number;
  totalSynced: number;
}

/**
 * Sinkronisasi data dari modul Sumber Daya Manusia (Dosen, Mahasiswa, Admin, PLP)
 * ke dalam daftar Akun Pengguna (Config -> User).
 */
export const syncSdmToUserAccounts = (
  currentUsers: UserAccountItem[],
  dosenList: Dosen[],
  mahasiswaList: Mahasiswa[],
  adminList: AdminStaff[],
  plpList: PLPStaff[],
  pembimbingLapanganList: PembimbingLapanganStaff[] = []
): SyncResult => {
  let userMap = [...currentUsers];
  let addedCount = 0;
  let updatedCount = 0;

  // 1. SINKRONISASI DOSEN (Gunakan NIP saja, tidak lagi gunakan NIDN untuk username/login)
  dosenList.forEach((d) => {
    const dNipClean = (d.nip || '').replace(/\D/g, '');
    const fullName = d.gelar ? `${d.nama}, ${d.gelar}`.trim() : d.nama.trim();
    const existingIdx = userMap.findIndex(
      (u) =>
        u.role === 'dosen' &&
        (isUserMatchingEntity(u, d) || (dNipClean && isIdentifierMatch(u.identifier, dNipClean)) || isNameMatch(u.nama, d.nama))
    );

    const existing = existingIdx >= 0 ? userMap[existingIdx] : undefined;
    const userStatus: 'Aktif' | 'Nonaktif' = d.status === 'Aktif Mengajar' ? 'Aktif' : 'Nonaktif';
    const identifierFormatted = d.nip
      ? `NIP. ${d.nip}`
      : existing?.identifier && existing.identifier.startsWith('NIP.')
      ? existing.identifier
      : existing?.identifier || '';
    const nextUsername = dNipClean || existing?.username || generateUsername(d.nama, '', 'dosen');
    const unitFormatted = d.unit || (d.lab ? `${d.lab} (KBK ${d.bidang})` : `KBK ${d.bidang} - Dept Kimia FMIPA UB`);
    const jabatanFormatted = d.jabatan || `${d.jabatanAkademik || 'Dosen'} & Dosen Pembimbing Skripsi`;
    const nextAvatar = getInitials(d.nama);
    const nextEmail = d.email || existing?.email || '';
    const nextNoHp = d.telepon !== undefined && d.telepon !== '' ? d.telepon : (existing?.noHp || '');

    if (existingIdx >= 0 && existing) {
      const hasChanges =
        existing.username !== nextUsername ||
        existing.nama !== fullName ||
        existing.avatarText !== nextAvatar ||
        existing.status !== userStatus ||
        existing.identifier !== identifierFormatted ||
        existing.email !== nextEmail ||
        existing.unit !== unitFormatted ||
        existing.jabatan !== jabatanFormatted ||
        (existing.noHp || '') !== nextNoHp;

      if (hasChanges) {
        userMap[existingIdx] = {
          ...existing,
          username: nextUsername,
          nama: fullName,
          avatarText: nextAvatar,
          identifier: identifierFormatted,
          email: nextEmail,
          unit: unitFormatted,
          jabatan: jabatanFormatted,
          status: userStatus,
          noHp: nextNoHp
        };
        updatedCount++;
      }
    } else {
      const username = dNipClean || generateUsername(d.nama, '', 'dosen');
      const newUser: UserAccountItem = {
        id: `usr-dos-${(d.id || '').replace(/^dos-/, '') || Date.now()}`,
        username,
        password: 'Dosen@123',
        nama: fullName,
        role: 'dosen',
        identifier: identifierFormatted,
        email: d.email || `${username}@ub.ac.id`,
        avatarText: nextAvatar,
        unit: unitFormatted,
        jabatan: jabatanFormatted,
        status: userStatus,
        tanggalDibuat: new Date().toISOString().split('T')[0],
        terakhirLogin: 'Belum pernah login',
        noHp: d.telepon || ''
      };
      userMap.push(newUser);
      addedCount++;
    }
  });

  // 2. SINKRONISASI MAHASISWA
  mahasiswaList.forEach((m) => {
    const existingIdx = userMap.findIndex(
      (u) =>
        isMahasiswaRole(u.role) &&
        (isUserMatchingEntity(u, m) || isIdentifierMatch(u.identifier, m.nim) || isNameMatch(u.nama, m.nama))
    );

    const existing = existingIdx >= 0 ? userMap[existingIdx] : undefined;
    const nimClean = (m.nim || '').replace(/\D/g, '');
    const userStatus: 'Aktif' | 'Nonaktif' = m.status === 'Aktif' ? 'Aktif' : 'Nonaktif';
    const identifierFormatted = `NIM. ${m.nim}`;
    const nextUsername = nimClean || existing?.username || generateUsername(m.nama, m.nim, 'mhs');
    const prodiRaw = m.programStudi || 'S1 Kimia FMIPA UB';
    const unitFormatted =
      m.unit ||
      existing?.unit ||
      (prodiRaw.toLowerCase().startsWith('program studi')
        ? prodiRaw
        : `Program Studi ${prodiRaw} (Angkatan ${m.angkatan})`);
    const jabatanFormatted =
      m.jabatan ||
      existing?.jabatan ||
      (m.dosenPANama
        ? `Mahasiswa Aktif Semester ${m.semester} (Dosen PA: ${m.dosenPANama})`
        : `Mahasiswa Aktif Semester ${m.semester}`);
    const nextAvatar = getInitials(m.nama);
    const nextEmail = m.email || existing?.email || `${nextUsername}@student.ub.ac.id`;
    const nextNoHp = m.telepon !== undefined && m.telepon !== '' ? m.telepon : (existing?.noHp || '');

    if (existingIdx >= 0 && existing) {
      const hasChanges =
        existing.username !== nextUsername ||
        existing.nama !== m.nama ||
        existing.avatarText !== nextAvatar ||
        existing.status !== userStatus ||
        existing.identifier !== identifierFormatted ||
        existing.email !== nextEmail ||
        existing.unit !== unitFormatted ||
        existing.jabatan !== jabatanFormatted ||
        (existing.noHp || '') !== nextNoHp;

      if (hasChanges) {
        userMap[existingIdx] = {
          ...existing,
          username: nextUsername,
          nama: m.nama,
          avatarText: nextAvatar,
          identifier: identifierFormatted,
          email: nextEmail,
          unit: unitFormatted,
          jabatan: jabatanFormatted,
          status: userStatus,
          noHp: nextNoHp
        };
        updatedCount++;
      }
    } else {
      const username = nimClean || generateUsername(m.nama, m.nim, 'mhs');
      const newUser: UserAccountItem = {
        id: `usr-mhs-${(m.id || '').replace(/^mhs-/, '') || Date.now()}`,
        username,
        password: 'Mhs#2024',
        nama: m.nama,
        role: inferMahasiswaRoleFromText(m.programStudi || m.unit),
        identifier: identifierFormatted,
        email: m.email || `${username}@student.ub.ac.id`,
        avatarText: nextAvatar,
        unit: unitFormatted,
        jabatan: jabatanFormatted,
        status: userStatus,
        tanggalDibuat: new Date().toISOString().split('T')[0],
        terakhirLogin: 'Belum pernah login',
        noHp: m.telepon || ''
      };
      userMap.push(newUser);
      addedCount++;
    }
  });

  // 3. SINKRONISASI ADMIN
  adminList.forEach((a) => {
    const fullName = a.gelar ? `${a.nama}, ${a.gelar}` : a.nama;
    const existingIdx = userMap.findIndex(
      (u) =>
        u.role === 'admin' &&
        (isUserMatchingEntity(u, a) || isIdentifierMatch(u.identifier, a.nip) || isNameMatch(u.nama, a.nama))
    );

    const existing = existingIdx >= 0 ? userMap[existingIdx] : undefined;
    const nipClean = (a.nip || '').replace(/\D/g, '');
    const userStatus: 'Aktif' | 'Nonaktif' = a.status === 'Aktif' ? 'Aktif' : 'Nonaktif';
    const identifierFormatted = a.nip ? `NIP. ${a.nip}` : (existing?.identifier || '');
    const nextUsername = nipClean || existing?.username || generateUsername(a.nama, a.nip, 'admin');
    const nextAvatar = getInitials(a.nama);
    const nextEmail = a.email || existing?.email || '';
    const nextUnit = a.unit || existing?.unit || '';
    const nextJabatan = a.jabatan || existing?.jabatan || '';
    const nextNoHp = a.telepon || existing?.noHp || '';

    if (existingIdx >= 0 && existing) {
      const hasChanges =
        existing.username !== nextUsername ||
        existing.nama !== fullName ||
        existing.avatarText !== nextAvatar ||
        existing.identifier !== identifierFormatted ||
        existing.email !== nextEmail ||
        existing.unit !== nextUnit ||
        existing.jabatan !== nextJabatan ||
        existing.status !== userStatus ||
        (existing.noHp || '') !== nextNoHp;

      if (hasChanges) {
        userMap[existingIdx] = {
          ...existing,
          username: nextUsername,
          nama: fullName,
          avatarText: nextAvatar,
          identifier: identifierFormatted,
          email: nextEmail,
          unit: nextUnit,
          jabatan: nextJabatan,
          status: userStatus,
          noHp: nextNoHp
        };
        updatedCount++;
      }
    } else {
      const username = nipClean || generateUsername(a.nama, a.nip, 'admin');
      const newUser: UserAccountItem = {
        id: `usr-adm-${(a.id || '').replace(/^adm-/, '') || Date.now()}`,
        username,
        password: 'Admin@123',
        nama: fullName,
        role: 'admin',
        identifier: identifierFormatted,
        email: a.email || `${username}@ub.ac.id`,
        avatarText: nextAvatar,
        unit: a.unit,
        jabatan: a.jabatan,
        status: userStatus,
        tanggalDibuat: new Date().toISOString().split('T')[0],
        terakhirLogin: 'Belum pernah login',
        noHp: a.telepon || ''
      };
      userMap.push(newUser);
      addedCount++;
    }
  });

  // 4. SINKRONISASI PLP
  plpList.forEach((p) => {
    const fullName = p.gelar ? `${p.nama}, ${p.gelar}` : p.nama;
    const existingIdx = userMap.findIndex(
      (u) =>
        u.role === 'admin' &&
        (isUserMatchingEntity(u, p) || isIdentifierMatch(u.identifier, p.nip) || isNameMatch(u.nama, p.nama))
    );

    const existing = existingIdx >= 0 ? userMap[existingIdx] : undefined;
    const nipClean = (p.nip || '').replace(/\D/g, '');
    const userStatus: 'Aktif' | 'Nonaktif' = p.status === 'Aktif' ? 'Aktif' : 'Nonaktif';
    const identifierFormatted = p.nip ? `NIP. ${p.nip}` : (existing?.identifier || '');
    const nextUsername = nipClean || existing?.username || generateUsername(p.nama, p.nip, 'plp');
    const jabatanFormatted = p.jabatan || `Pranata Laboratorium Pendidikan (${p.jenjang})`;
    const nextAvatar = getInitials(p.nama);
    const nextEmail = p.email || existing?.email || '';
    const nextUnit = p.labUtama || existing?.unit || '';
    const nextNoHp = p.telepon || existing?.noHp || '';

    if (existingIdx >= 0 && existing) {
      const hasChanges =
        existing.username !== nextUsername ||
        existing.nama !== fullName ||
        existing.avatarText !== nextAvatar ||
        existing.identifier !== identifierFormatted ||
        existing.email !== nextEmail ||
        existing.unit !== nextUnit ||
        existing.jabatan !== jabatanFormatted ||
        existing.status !== userStatus ||
        (existing.noHp || '') !== nextNoHp;

      if (hasChanges) {
        userMap[existingIdx] = {
          ...existing,
          username: nextUsername,
          nama: fullName,
          avatarText: nextAvatar,
          identifier: identifierFormatted,
          email: nextEmail,
          unit: nextUnit,
          jabatan: jabatanFormatted,
          status: userStatus,
          noHp: nextNoHp
        };
        updatedCount++;
      }
    } else {
      const username = nipClean || generateUsername(p.nama, p.nip, 'plp');
      const newUser: UserAccountItem = {
        id: `usr-plp-${(p.id || '').replace(/^plp-/, '') || Date.now()}`,
        username,
        password: 'Labor@123',
        nama: fullName,
        role: 'admin',
        identifier: identifierFormatted,
        email: p.email || `${username}@ub.ac.id`,
        avatarText: nextAvatar,
        unit: p.labUtama,
        jabatan: jabatanFormatted,
        status: userStatus,
        tanggalDibuat: new Date().toISOString().split('T')[0],
        terakhirLogin: 'Belum pernah login',
        noHp: p.telepon || ''
      };
      userMap.push(newUser);
      addedCount++;
    }
  });

  // 5. SINKRONISASI PEMBIMBING LAPANGAN
  (Array.isArray(pembimbingLapanganList) ? pembimbingLapanganList : []).forEach((p) => {
    if (!p || typeof p !== 'object') return;
    const pNama = typeof p.nama === 'string' && p.nama.trim() ? p.nama.trim() : 'Pembimbing Lapangan';
    const fullName = p.gelar ? `${pNama}, ${p.gelar}` : pNama;
    const existingIdx = userMap.findIndex(
      (u) =>
        (u.role === 'eksternal' ||
          (u.jabatan &&
            (u.jabatan.toLowerCase().includes('pembimbing lapangan') ||
              u.jabatan.toLowerCase().includes('pembimbing lapang') ||
              u.jabatan.toLowerCase().includes('mentor')))) &&
        (isUserMatchingEntity(u, p) ||
          (p.idMitra && isIdentifierMatch(u.identifier, p.idMitra)) ||
          isNameMatch(u.nama, pNama))
    );

    const existing = existingIdx >= 0 ? userMap[existingIdx] : undefined;
    const userStatus: 'Aktif' | 'Nonaktif' = p.status === 'Aktif' ? 'Aktif' : 'Nonaktif';
    const identifierFormatted = p.idMitra || existing?.identifier || 'IDP-8829101';
    const nextAvatar = getInitials(pNama);
    const nextEmail = p.email || existing?.email || '';
    const nextUnit = p.namaMitra || existing?.unit || '';
    const nextJabatan = p.jabatan || 'Pembimbing Lapangan';
    const nextNoHp = p.telepon || existing?.noHp || '';
    const nextUsername = p.username || existing?.username || '';

    if (existingIdx >= 0 && existing) {
      const hasChanges =
        existing.role !== 'eksternal' ||
        existing.nama !== fullName ||
        existing.avatarText !== nextAvatar ||
        existing.identifier !== identifierFormatted ||
        existing.email !== nextEmail ||
        existing.unit !== nextUnit ||
        existing.jabatan !== nextJabatan ||
        existing.status !== userStatus ||
        (existing.noHp || '') !== nextNoHp ||
        (nextUsername && existing.username !== nextUsername);

      if (hasChanges) {
        userMap[existingIdx] = {
          ...existing,
          role: 'eksternal',
          username: nextUsername || existing.username,
          nama: fullName,
          avatarText: nextAvatar,
          identifier: identifierFormatted,
          email: nextEmail,
          unit: nextUnit,
          jabatan: nextJabatan,
          status: userStatus,
          noHp: nextNoHp
        };
        updatedCount++;
      }
    } else {
      const username = p.username || generateUsername(p.nama, p.idMitra, 'pbl');
      const newUser: UserAccountItem = {
        id: `usr-pbl-${(p.id || '').replace(/^pbl-/, '') || Date.now()}`,
        username,
        password: 'Pembimbing@123',
        nama: fullName,
        role: 'eksternal',
        identifier: identifierFormatted,
        email: p.email || `${username}@mitra.ac.id`,
        avatarText: nextAvatar,
        unit: p.namaMitra,
        jabatan: p.jabatan || 'Pembimbing Lapangan',
        status: userStatus,
        tanggalDibuat: new Date().toISOString().split('T')[0],
        terakhirLogin: 'Belum pernah login',
        noHp: p.telepon || ''
      };
      userMap.push(newUser);
      addedCount++;
    }
  });

  return {
    updatedUsers: userMap,
    addedCount,
    updatedCount,
    totalSynced: userMap.length
  };
};

/**
 * Sinkronisasi akun dari Config -> User ke Sumber Daya Manusia.
 * Ketika ada akun user baru dibuat atau diperbarui di Config -> User,
 * sistem akan membuat/memperbarui entitas yang relevan di SDM.
 */
export const syncUserAccountToSdm = (
  user: UserAccountItem,
  sdmState: {
    dosenList: Dosen[];
    mahasiswaList: Mahasiswa[];
    adminList: AdminStaff[];
    plpList: PLPStaff[];
    pembimbingLapanganList?: PembimbingLapanganStaff[];
  }
): {
  newDosenList?: Dosen[];
  newMahasiswaList?: Mahasiswa[];
  newAdminList?: AdminStaff[];
  newPlpList?: PLPStaff[];
  newPembimbingLapanganList?: PembimbingLapanganStaff[];
} => {
  if (!user) return {};
  const cleanId = (typeof user.identifier === 'string' ? user.identifier : '').replace(/\D/g, '');
  const userNama = typeof user.nama === 'string' ? user.nama : ((user as any)?.name || user.username || '');
  const userId = typeof user.id === 'string' ? user.id : '';
  const userUnit = typeof user.unit === 'string' ? user.unit : '';
  const userJabatan = typeof user.jabatan === 'string' ? user.jabatan : '';
  const parsedUser = parseNameAndGelar(userNama);
  const cleanNamaOnly = parsedUser.nama || userNama || 'Pengguna';
  const rawUserSuffix = userId.replace(/^usr-(?:(?:mhs|dos|adm|plp|pbl)-)?/, '');
  const formattedMitraId =
    typeof user.identifier === 'string' &&
    (user.identifier.startsWith('IDP') || user.identifier.startsWith('NIK') || user.identifier.startsWith('NIP'))
      ? user.identifier.trim()
      : cleanId
      ? `IDP-${cleanId.slice(-7)}`
      : `IDP-${Math.floor(1000000 + Math.random() * 9000000)}`;

  // 1. PEMBIMBING LAPANGAN (ROLE EKSTERNAL)
  const isPblCandidate =
    user.role === 'eksternal' ||
    userJabatan.toLowerCase().includes('pembimbing lapangan') ||
    userJabatan.toLowerCase().includes('pembimbing lapang') ||
    userJabatan.toLowerCase().includes('mentor');

  if (isPblCandidate) {
    const pblList = sdmState.pembimbingLapanganList || [];
    const existingPblIdx = pblList.findIndex(
      (p) => isUserMatchingEntity(user, p) || (cleanId && isIdentifierMatch(p.idMitra, cleanId)) || isNameMatch(p.nama, userNama)
    );

    if (existingPblIdx >= 0) {
      const updated = [...pblList];
      updated[existingPblIdx] = {
        ...updated[existingPblIdx],
        nama: cleanNamaOnly,
        gelar: parsedUser.gelar,
        idMitra: formattedMitraId || updated[existingPblIdx].idMitra,
        email: user.email || updated[existingPblIdx].email,
        telepon: user.noHp !== undefined ? user.noHp : updated[existingPblIdx].telepon,
        namaMitra: userUnit || updated[existingPblIdx].namaMitra,
        jabatan: userJabatan || updated[existingPblIdx].jabatan,
        status: user.status === 'Aktif' ? 'Aktif' : 'Nonaktif',
        username: user.username
      };
      return { newPembimbingLapanganList: updated };
    } else {
      const newPbl: PembimbingLapanganStaff = {
        id: rawUserSuffix ? `pbl-${rawUserSuffix}` : `pbl-${Date.now()}`,
        idMitra: formattedMitraId,
        nama: cleanNamaOnly,
        gelar: parsedUser.gelar,
        jabatan: userJabatan || 'Pembimbing Lapangan',
        namaMitra: userUnit || 'Instansi / Mitra Industri KLK',
        email: user.email,
        telepon: user.noHp || '',
        status: user.status === 'Aktif' ? 'Aktif' : 'Nonaktif',
        jumlahMahasiswaBimbingan: 1,
        alamatInstansi: userUnit || 'Mitra Industri Tempat KLK',
        username: user.username
      };
      return { newPembimbingLapanganList: [newPbl, ...pblList] };
    }
  }

  if (user.role === 'dosen') {
    const existingIdx = sdmState.dosenList.findIndex(
      (d) =>
        isUserMatchingEntity(user, d) ||
        (cleanId && isIdentifierMatch(d.nip || d.nidn, cleanId)) ||
        isNameMatch(d.nama, userNama)
    );

    const jabLower = userJabatan.toLowerCase();
    const mappedJabatanAkademik: Dosen['jabatanAkademik'] = jabLower.includes('guru besar')
      ? 'Guru Besar (Profesor)'
      : jabLower.includes('lektor kepala')
      ? 'Lektor Kepala'
      : jabLower.includes('asisten ahli')
      ? 'Asisten Ahli'
      : 'Lektor';

    if (existingIdx >= 0) {
      const updated = [...sdmState.dosenList];
      updated[existingIdx] = {
        ...updated[existingIdx],
        nama: cleanNamaOnly,
        gelar: parsedUser.gelar,
        nip: cleanId || updated[existingIdx].nip,
        email: user.email,
        telepon: user.noHp !== undefined ? user.noHp : updated[existingIdx].telepon,
        lab: (userUnit && userUnit.includes('Laboratorium') ? (userUnit as LabRiset) : updated[existingIdx].lab),
        unit: userUnit || updated[existingIdx].unit,
        jabatan: userJabatan || updated[existingIdx].jabatan,
        status: user.status === 'Aktif' ? 'Aktif Mengajar' : 'Cuti Riset'
      };
      return { newDosenList: updated };
    } else {
      const newDosen: Dosen = {
        id: rawUserSuffix ? `dos-${rawUserSuffix}` : `dos-${Date.now()}`,
        nip: cleanId || `197${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        nidn: cleanId.length <= 10 && cleanId.length >= 6 ? cleanId : '00' + (cleanId.slice(0, 8) || '12345678'),
        nama: cleanNamaOnly,
        gelar: parsedUser.gelar,
        bidang: 'Kimia Analitik',
        lab: (userUnit && userUnit.includes('Laboratorium') ? (userUnit as LabRiset) : 'Laboratorium Kimia Analitik & Instrumentasi'),
        unit: userUnit || 'Laboratorium Kimia Analitik & Instrumentasi',
        jabatan: userJabatan || 'Dosen',
        email: user.email,
        jabatanAkademik: mappedJabatanAkademik,
        status: user.status === 'Aktif' ? 'Aktif Mengajar' : 'Cuti Riset',
        kuotaBimbingan: 8,
        jumlahBimbingan: 0,
        matakuliah: ['Kimia Dasar', 'Metodologi Penelitian Kimia'],
        topikRiset: ['Riset Kimia Terapan'],
        ruangKantor: 'Gedung Kimia FSTeM UB Lt. 2',
        telepon: user.noHp || ''
      };
      return { newDosenList: [newDosen, ...sdmState.dosenList] };
    }
  }

  if (isMahasiswaRole(user.role)) {
    const jenjang = getMahasiswaJenjang(user.role);
    const existingIdx = sdmState.mahasiswaList.findIndex(
      (m) =>
        isUserMatchingEntity(user, m) ||
        (cleanId && isIdentifierMatch(m.nim, cleanId)) ||
        isNameMatch(m.nama, userNama) ||
        (user.username && isNameMatch(m.nama, user.username))
    );

    if (existingIdx >= 0) {
      const updated = [...sdmState.mahasiswaList];
      updated[existingIdx] = {
        ...updated[existingIdx],
        nama: userNama || updated[existingIdx].nama,
        nim: cleanId || updated[existingIdx].nim,
        email: user.email || updated[existingIdx].email,
        telepon: user.noHp !== undefined ? user.noHp : updated[existingIdx].telepon,
        programStudi: userUnit || updated[existingIdx].programStudi,
        unit: userUnit || updated[existingIdx].unit,
        jabatan: userJabatan || updated[existingIdx].jabatan,
        status: user.status === 'Aktif' ? 'Aktif' : 'Cuti'
      };
      return { newMahasiswaList: updated };
    } else {
      const angkatanMatch = cleanId.match(/^(\d{2})/);
      const angkatanYear = angkatanMatch ? `20${angkatanMatch[1]}` : '2023';
      const finalNim = cleanId || `235090200${Math.floor(100000 + Math.random() * 900000)}`;
      const newMhs: Mahasiswa = {
        id: rawUserSuffix ? `mhs-${rawUserSuffix}` : `mhs-${Date.now()}`,
        nim: finalNim,
        nama: userNama || `Mahasiswa ${jenjang} Baru`,
        angkatan: angkatanYear,
        programStudi: userUnit || `${jenjang} Kimia - FMIPA Universitas Brawijaya`,
        email: user.email,
        telepon: user.noHp || '',
        unit: userUnit || `Program Studi ${jenjang} Kimia - FMIPA Universitas Brawijaya`,
        jabatan: userJabatan || `Mahasiswa ${jenjang}`,
        dosenPAId: '',
        dosenPANama: '',
        status: user.status === 'Aktif' ? 'Aktif' : 'Cuti',
        semester: 3,
        ipk: 3.50,
        totalSks: 64,
        tahapSkripsi: 'Belum Mengambil',
        labPenelitian: 'Laboratorium Kimia Analitik & Instrumentasi'
      };
      return { newMahasiswaList: [newMhs, ...sdmState.mahasiswaList] };
    }
  }

  if (user.role === 'admin') {
    const isPlpMatch =
      userJabatan.toLowerCase().includes('plp') ||
      userJabatan.toLowerCase().includes('pranata laboratorium') ||
      userJabatan.toLowerCase().includes('laboran') ||
      sdmState.plpList.some(
        (p) => isUserMatchingEntity(user, p) || (cleanId && isIdentifierMatch(p.nip, cleanId)) || isNameMatch(p.nama, userNama)
      );

    if (isPlpMatch) {
      const existingPlpIdx = sdmState.plpList.findIndex(
        (p) => isUserMatchingEntity(user, p) || (cleanId && isIdentifierMatch(p.nip, cleanId)) || isNameMatch(p.nama, userNama)
      );

      if (existingPlpIdx >= 0) {
        const updated = [...sdmState.plpList];
        updated[existingPlpIdx] = {
          ...updated[existingPlpIdx],
          nama: cleanNamaOnly,
          gelar: parsedUser.gelar,
          nip: cleanId || updated[existingPlpIdx].nip,
          email: user.email,
          telepon: user.noHp !== undefined ? user.noHp : updated[existingPlpIdx].telepon,
          labUtama: userUnit || updated[existingPlpIdx].labUtama,
          jabatan: userJabatan || updated[existingPlpIdx].jabatan,
          status: user.status === 'Aktif' ? 'Aktif' : 'Cuti'
        };
        return { newPlpList: updated };
      } else {
        const newPlp: PLPStaff = {
          id: rawUserSuffix ? `plp-${rawUserSuffix}` : `plp-${Date.now()}`,
          nip: cleanId || `1992${Math.floor(10000000 + Math.random() * 90000000)}`,
          nama: cleanNamaOnly,
          gelar: parsedUser.gelar,
          jenjang: 'PLP Ahli Pertama',
          labUtama: userUnit || 'Laboratorium Kimia Analitik & Instrumentasi',
          jabatan: userJabatan || 'PLP',
          spesialisasiInstrumen: ['Spektrofotometer UV-Vis', 'HPLC'],
          tupoksiUtama: 'Pengelolaan operasional laboratorium dan pemeliharaan alat uji',
          email: user.email,
          telepon: user.noHp || '',
          ruangLab: 'Gedung Kimia Lt. 1 Ruang PLP',
          status: user.status === 'Aktif' ? 'Aktif' : 'Cuti',
          verifikatorBebasLab: true
        };
        return { newPlpList: [newPlp, ...sdmState.plpList] };
      }
    }

    const existingIdx = sdmState.adminList.findIndex(
      (a) => isUserMatchingEntity(user, a) || (cleanId && isIdentifierMatch(a.nip, cleanId)) || isNameMatch(a.nama, userNama)
    );

    if (existingIdx >= 0) {
      const updated = [...sdmState.adminList];
      updated[existingIdx] = {
        ...updated[existingIdx],
        nama: cleanNamaOnly,
        gelar: parsedUser.gelar,
        nip: cleanId || updated[existingIdx].nip,
        email: user.email,
        telepon: user.noHp !== undefined ? user.noHp : updated[existingIdx].telepon,
        jabatan: userJabatan || updated[existingIdx].jabatan,
        unit: userUnit || updated[existingIdx].unit,
        status: user.status === 'Aktif' ? 'Aktif' : 'Cuti'
      };
      return { newAdminList: updated };
    } else {
      const newAdmin: AdminStaff = {
        id: rawUserSuffix ? `adm-${rawUserSuffix}` : `adm-${Date.now()}`,
        nip: cleanId || `1990${Math.floor(10000000 + Math.random() * 90000000)}`,
        nama: cleanNamaOnly,
        gelar: parsedUser.gelar,
        jabatan: userJabatan || 'Staf Tata Usaha & Layanan Akademik',
        unit: userUnit || 'Sub-Bagian Akademik & Administrasi Departemen Kimia',
        tupoksi: ['Pengelolaan administrasi & persuratan', 'Layanan data kemahasiswaan SIKMA'],
        email: user.email,
        telepon: user.noHp || '',
        ruangKantor: 'Gedung Kimia FMIPA Lt. 1 R.102',
        status: user.status === 'Aktif' ? 'Aktif' : 'Cuti',
        pendidikanTerakhir: 'S1 Ilmu Administrasi'
      };
      return { newAdminList: [newAdmin, ...sdmState.adminList] };
    }
  }

  return {};
};

/**
 * Sinkronisasi dua arah menyeluruh antara Akun User (Config -> User)
 * dan 4 Modul Sumber Daya Manusia (Dosen, Mahasiswa, Admin, PLP).
 *
 * Menjamin:
 * 1. Setiap akun di currentUsers otomatis terdaftar di SDM terkait jika belum ada:
 *    - role 'mahasiswa' -> Data Mahasiswa
 *    - role 'dosen' -> Manajemen Data Dosen
 *    - role 'admin'/'super_admin' dengan jabatan/unit PLP -> Data Manajemen PLP
 *    - role 'admin'/'super_admin' staf TU -> Manajemen Data Admin
 * 2. Seluruh modul SDM dan User Account saling tersinkronisasi 100%.
 */
export const syncBidirectionalUsersAndSdm = (
  currentUsers: UserAccountItem[],
  currentDosen: Dosen[],
  currentMahasiswa: Mahasiswa[],
  currentAdmin: AdminStaff[],
  currentPlp: PLPStaff[],
  currentPembimbingLapangan: PembimbingLapanganStaff[] = [],
  options?: { skipReverseUserCreation?: boolean }
): {
  syncedUsers: UserAccountItem[];
  syncedDosen: Dosen[];
  syncedMahasiswa: Mahasiswa[];
  syncedAdmin: AdminStaff[];
  syncedPlp: PLPStaff[];
  syncedPembimbingLapangan: PembimbingLapanganStaff[];
} => {
  let updatedDosen = [...currentDosen];
  let updatedMahasiswa = [...currentMahasiswa];
  let updatedAdmin = [...currentAdmin];
  let updatedPlp = [...currentPlp];
  let updatedPembimbingLapangan = [...currentPembimbingLapangan];

  // 1. Loop semua User Account untuk memastikan tercatat di Modul SDM
  const safeUsers = Array.isArray(currentUsers)
    ? currentUsers
        .filter((u): u is UserAccountItem => !!u && typeof u === 'object')
        .map((u) => ({
          ...u,
          role: normalizeMahasiswaRole(u.role, u.unit || u.jabatan)
        }))
    : [];

  safeUsers.forEach((u) => {
    const userNama = typeof u.nama === 'string' ? u.nama : ((u as any)?.name || u.username || 'Pengguna');
    const userId = typeof u.id === 'string' ? u.id : `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cleanId = (typeof u.identifier === 'string' ? u.identifier : '').replace(/\D/g, '');
    const userRole = u.role;
    const userJabatan = typeof u.jabatan === 'string' ? u.jabatan : '';
    const userUnit = typeof u.unit === 'string' ? u.unit : '';
    const cleanNamaOnly = userNama.replace(/,\s*[A-Za-z.,\s]+$/, '').trim() || userNama;

    const isPembimbingLapanganCandidate =
      userRole === 'eksternal' ||
      (userJabatan && (userJabatan.toLowerCase().includes('pembimbing lapangan') || userJabatan.toLowerCase().includes('pembimbing lapang') || userJabatan.toLowerCase().includes('mentor'))) ||
      (userUnit && userUnit.toLowerCase().includes('mitra') && (userRole === 'admin' || userRole === 'super_admin'));

    const isPlpCandidate =
      !isPembimbingLapanganCandidate &&
      ((userJabatan && (userJabatan.toLowerCase().includes('plp') || userJabatan.toLowerCase().includes('laboran') || userJabatan.toLowerCase().includes('pranata laboratorium'))) ||
      (userUnit && userUnit.toLowerCase().includes('laboratorium') && (userRole === 'admin' || userRole === 'super_admin')));

    const rawUserSuffix = userId.replace(/^usr-(?:(?:mhs|dos|adm|plp|pbl)-)?/, '');

    if (userRole === 'dosen') {
      const existingIdx = updatedDosen.findIndex(
        (d) => isUserMatchingEntity(u, d) || (cleanId && isIdentifierMatch(d.nip || d.nidn, cleanId)) || isNameMatch(d.nama, userNama)
      );

      if (existingIdx < 0) {
        const parsedName = parseNameAndGelar(userNama);
        const nipVal = cleanId || `197${Math.floor(10000000000 + Math.random() * 90000000000)}`;
        const nidnVal = cleanId.length <= 10 && cleanId.length >= 6 ? cleanId : '00' + (cleanId.slice(0, 8) || '12345678');
        const newDosen: Dosen = {
          id: rawUserSuffix ? `dos-${rawUserSuffix}` : `dos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nip: nipVal,
          nidn: nidnVal,
          nama: parsedName.nama || userNama,
          gelar: parsedName.gelar,
          bidang: 'Kimia Analitik',
          lab: (userUnit && userUnit.includes('Laboratorium') ? (userUnit as LabRiset) : 'Laboratorium Kimia Analitik & Instrumentasi'),
          unit: userUnit || undefined,
          jabatan: userJabatan || undefined,
          email: u.email,
          jabatanAkademik: 'Lektor',
          status: u.status === 'Aktif' ? 'Aktif Mengajar' : 'Cuti Riset',
          kuotaBimbingan: 8,
          jumlahBimbingan: 0,
          matakuliah: ['Kimia Dasar', 'Metodologi Penelitian Kimia'],
          topikRiset: ['Riset Kimia Terapan'],
          ruangKantor: 'Gedung Kimia FSTeM UB Lt. 2',
          telepon: u.noHp || ''
        };
        updatedDosen.unshift(newDosen);
      }
    } else if (isMahasiswaRole(userRole)) {
      const jenjang = getMahasiswaJenjang(userRole);
      const existingIdx = updatedMahasiswa.findIndex(
        (m) => isUserMatchingEntity(u, m) || (cleanId && isIdentifierMatch(m.nim, cleanId)) || isNameMatch(m.nama, userNama)
      );

      if (existingIdx < 0) {
        const angkatanMatch = cleanId.match(/^(\d{2})/);
        const angkatanYear = angkatanMatch ? `20${angkatanMatch[1]}` : '2023';
        const finalNim = cleanId || `235090200${Math.floor(100000 + Math.random() * 900000)}`;
        const newMhs: Mahasiswa = {
          id: rawUserSuffix ? `mhs-${rawUserSuffix}` : `mhs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nim: finalNim,
          nama: userNama,
          angkatan: angkatanYear,
          programStudi: userUnit || `${jenjang} Kimia - FMIPA Universitas Brawijaya`,
          email: u.email,
          telepon: u.noHp || '',
          unit: userUnit || undefined,
          jabatan: userJabatan || undefined,
          dosenPAId: '',
          dosenPANama: '',
          status: u.status === 'Aktif' ? 'Aktif' : 'Cuti',
          semester: 3,
          ipk: 3.50,
          totalSks: 64,
          tahapSkripsi: 'Belum Mengambil',
          labPenelitian: 'Laboratorium Kimia Analitik & Instrumentasi'
        };
        updatedMahasiswa.unshift(newMhs);
      } else {
        const existingMhs = updatedMahasiswa[existingIdx];
        if (
          (existingMhs.email === undefined && u.email) ||
          (existingMhs.telepon === undefined && u.noHp)
        ) {
          updatedMahasiswa[existingIdx] = {
            ...existingMhs,
            email: existingMhs.email === undefined ? (u.email || '') : existingMhs.email,
            telepon: existingMhs.telepon === undefined ? (u.noHp || '') : existingMhs.telepon
          };
        }
      }
    } else if (userRole === 'admin' || userRole === 'eksternal') {
      if (isPembimbingLapanganCandidate) {
        const existingIdx = updatedPembimbingLapangan.findIndex(
          (p) => isUserMatchingEntity(u, p) || (cleanId && isIdentifierMatch(p.idMitra, cleanId)) || isNameMatch(p.nama, userNama)
        );

        if (existingIdx < 0) {
          const parsedName = parseNameAndGelar(userNama);
          const idMitraVal =
            typeof u.identifier === 'string' &&
            (u.identifier.startsWith('IDP') || u.identifier.startsWith('NIK') || u.identifier.startsWith('NIP'))
              ? u.identifier.trim()
              : cleanId
              ? `IDP-${cleanId.slice(-7)}`
              : `IDP-${Math.floor(1000000 + Math.random() * 9000000)}`;
          const newPbl: PembimbingLapanganStaff = {
            id: rawUserSuffix ? `pbl-${rawUserSuffix}` : `pbl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            idMitra: idMitraVal,
            nama: parsedName.nama || userNama,
            gelar: parsedName.gelar,
            jabatan: userJabatan || 'Pembimbing Lapangan',
            namaMitra: userUnit || 'Instansi / Mitra Industri KLK',
            email: u.email,
            telepon: u.noHp || '',
            status: u.status === 'Aktif' ? 'Aktif' : 'Nonaktif',
            jumlahMahasiswaBimbingan: 1,
            alamatInstansi: userUnit || 'Mitra Industri Tempat KLK',
            username: u.username
          };
          updatedPembimbingLapangan.unshift(newPbl);
        }
      } else if (isPlpCandidate) {
        const existingIdx = updatedPlp.findIndex(
          (p) => isUserMatchingEntity(u, p) || (cleanId && isIdentifierMatch(p.nip, cleanId)) || isNameMatch(p.nama, userNama)
        );

        if (existingIdx < 0) {
          const parsedName = parseNameAndGelar(userNama);
          const newPlp: PLPStaff = {
            id: rawUserSuffix ? `plp-${rawUserSuffix}` : `plp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            nip: cleanId || `1992${Math.floor(10000000 + Math.random() * 90000000)}`,
            nama: parsedName.nama || userNama,
            gelar: parsedName.gelar,
            jenjang: 'PLP Ahli Pertama',
            labUtama: userUnit || 'Laboratorium Kimia Analitik & Instrumentasi',
            jabatan: userJabatan || undefined,
            spesialisasiInstrumen: ['Spektrofotometer UV-Vis', 'HPLC'],
            tupoksiUtama: 'Pengelolaan operasional laboratorium dan pemeliharaan alat uji',
            email: u.email,
            telepon: u.noHp || '',
            ruangLab: 'Gedung Kimia Lt. 1 Ruang PLP',
            status: u.status === 'Aktif' ? 'Aktif' : 'Cuti',
            verifikatorBebasLab: true
          };
          updatedPlp.unshift(newPlp);
        }
      } else {
        const existingIdx = updatedAdmin.findIndex(
          (a) => isUserMatchingEntity(u, a) || (cleanId && isIdentifierMatch(a.nip, cleanId)) || isNameMatch(a.nama, userNama)
        );

        if (existingIdx < 0) {
          const parsedName = parseNameAndGelar(userNama);
          const newAdmin: AdminStaff = {
            id: rawUserSuffix ? `adm-${rawUserSuffix}` : `adm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            nip: cleanId || `1990${Math.floor(10000000 + Math.random() * 90000000)}`,
            nama: parsedName.nama || userNama,
            gelar: parsedName.gelar,
            jabatan: userJabatan || 'Staf Tata Usaha & Layanan Akademik',
            unit: userUnit || 'Sub-Bagian Akademik & Administrasi Departemen Kimia',
            tupoksi: ['Pengelolaan administrasi & persuratan', 'Layanan data kemahasiswaan SIKMA'],
            email: u.email,
            telepon: u.noHp || '',
            ruangKantor: 'Gedung Kimia FMIPA Lt. 1 R.102',
            status: u.status === 'Aktif' ? 'Aktif' : 'Cuti',
            pendidikanTerakhir: 'S1 Ilmu Administrasi'
          };
          updatedAdmin.unshift(newAdmin);
        }
      }
    }
  });

  // 2. Sinkronisasikan SDM kembali ke User Accounts agar data akun terisi lengkap (kecuali saat menghapus user)
  if (options?.skipReverseUserCreation) {
    return {
      syncedUsers: currentUsers,
      syncedDosen: updatedDosen,
      syncedMahasiswa: updatedMahasiswa,
      syncedAdmin: updatedAdmin,
      syncedPlp: updatedPlp,
      syncedPembimbingLapangan: updatedPembimbingLapangan
    };
  }

  const syncRes = syncSdmToUserAccounts(currentUsers, updatedDosen, updatedMahasiswa, updatedAdmin, updatedPlp, updatedPembimbingLapangan);

  return {
    syncedUsers: syncRes.updatedUsers,
    syncedDosen: updatedDosen,
    syncedMahasiswa: updatedMahasiswa,
    syncedAdmin: updatedAdmin,
    syncedPlp: updatedPlp,
    syncedPembimbingLapangan: updatedPembimbingLapangan
  };
};

/**
 * Sinkronisasi penghapusan akun dari Menu User ke Modul SDM (Dosen, Mahasiswa, Admin, PLP) dan KLK
 */
export const syncUserDeleteToSdm = (
  deletedUser: UserAccountItem,
  sdmState: {
    dosenList: Dosen[];
    mahasiswaList: Mahasiswa[];
    adminList: AdminStaff[];
    plpList: PLPStaff[];
    klkList: PengajuanKLK[];
  }
): {
  newDosenList: Dosen[];
  newMahasiswaList: Mahasiswa[];
  newAdminList: AdminStaff[];
  newPlpList: PLPStaff[];
  newKlkList: PengajuanKLK[];
} => {
  const cleanId = (typeof deletedUser?.identifier === 'string' ? deletedUser.identifier : '').replace(/\D/g, '');
  const deletedNama = typeof deletedUser?.nama === 'string' ? deletedUser.nama : '';
  let updatedDosen = [...sdmState.dosenList];
  let updatedMhs = [...sdmState.mahasiswaList];
  let updatedAdmin = [...sdmState.adminList];
  let updatedPlp = [...sdmState.plpList];
  let updatedKlk = [...sdmState.klkList];

  if (deletedUser.role === 'dosen') {
    // 1. Hapus dari Dosen List
    const targetDosen = updatedDosen.find(
      (d) => isIdentifierMatch(d.nip || d.nidn, cleanId) || isNameMatch(d.nama, deletedNama)
    );
    if (targetDosen) {
      updatedDosen = updatedDosen.filter((d) => d.id !== targetDosen.id);
      // 2. Putuskan relasi DPA pada mahasiswa yang dibimbing
      updatedMhs = updatedMhs.map((m) => {
        if (
          m.dosenPAId === targetDosen.id ||
          (m.dosenPANama && isNameMatch(targetDosen.nama, m.dosenPANama))
        ) {
          return {
            ...m,
            dosenPAId: '',
            dosenPANama: 'Belum Ditentukan',
            dosenPANip: ''
          };
        }
        return m;
      });
      // 3. Putuskan relasi Dosen Pembimbing KLK pada pengajuan KLK terkait
      updatedKlk = updatedKlk.map((k) => {
        if (k.dosenPembimbingKLK && isNameMatch(targetDosen.nama, k.dosenPembimbingKLK)) {
          return {
            ...k,
            dosenPembimbingKLK: 'Belum Ditetapkan (Dosen Sebelumnya Telah Dihapus)'
          };
        }
        return k;
      });
    }
  } else if (isMahasiswaRole(deletedUser.role)) {
    // 1. Hapus dari Mahasiswa List
    const targetMhs = updatedMhs.find(
      (m) => isIdentifierMatch(m.nim, cleanId) || isNameMatch(m.nama, deletedNama)
    );
    if (targetMhs) {
      updatedMhs = updatedMhs.filter((m) => m.id !== targetMhs.id);
      // 2. Hapus pengajuan KLK milik mahasiswa ini
      const cleanNim = (typeof targetMhs.nim === 'string' ? targetMhs.nim : '').replace(/\D/g, '');
      updatedKlk = updatedKlk.filter(
        (k) =>
          k.mahasiswaId !== targetMhs.id &&
          (!cleanNim || ((typeof k.nim === 'string' ? k.nim : '').replace(/\D/g, '') !== cleanNim))
      );
    }
  } else if (deletedUser.role === 'admin' || deletedUser.role === 'super_admin') {
    // Cek apakah ada di PLP
    const targetPlp = updatedPlp.find(
      (p) => isIdentifierMatch(p.nip, cleanId) || isNameMatch(p.nama, deletedNama)
    );
    if (targetPlp) {
      updatedPlp = updatedPlp.filter((p) => p.id !== targetPlp.id);
    }
    // Cek apakah ada di Admin
    const targetAdm = updatedAdmin.find(
      (a) => isIdentifierMatch(a.nip, cleanId) || isNameMatch(a.nama, deletedNama)
    );
    if (targetAdm) {
      updatedAdmin = updatedAdmin.filter((a) => a.id !== targetAdm.id);
    }
  }

  return {
    newDosenList: updatedDosen,
    newMahasiswaList: updatedMhs,
    newAdminList: updatedAdmin,
    newPlpList: updatedPlp,
    newKlkList: updatedKlk
  };
};

/**
 * Sinkronisasi status aktif/nonaktif dari Akun User ke modul SDM
 */
export const syncUserStatusToSdm = (
  user: UserAccountItem,
  sdmState: {
    dosenList: Dosen[];
    mahasiswaList: Mahasiswa[];
    adminList: AdminStaff[];
    plpList: PLPStaff[];
    pembimbingLapanganList?: PembimbingLapanganStaff[];
  }
): {
  newDosenList?: Dosen[];
  newMahasiswaList?: Mahasiswa[];
  newAdminList?: AdminStaff[];
  newPlpList?: PLPStaff[];
  newPembimbingLapanganList?: PembimbingLapanganStaff[];
} => {
  const cleanId = (typeof user?.identifier === 'string' ? user.identifier : '').replace(/\D/g, '');
  const userNama = typeof user?.nama === 'string' ? user.nama : '';

  if (user.role === 'dosen') {
    const nextStatus = user.status === 'Aktif' ? 'Aktif Mengajar' : 'Cuti Riset';
    const updated = sdmState.dosenList.map((d) => {
      if (isUserMatchingEntity(user, d) || isIdentifierMatch(d.nip || d.nidn, cleanId) || isNameMatch(d.nama, userNama)) {
        return { ...d, status: nextStatus as Dosen['status'] };
      }
      return d;
    });
    return { newDosenList: updated };
  }

  if (isMahasiswaRole(user.role)) {
    const nextStatus = user.status === 'Aktif' ? 'Aktif' : 'Cuti';
    const updated = sdmState.mahasiswaList.map((m) => {
      if (isUserMatchingEntity(user, m) || isIdentifierMatch(m.nim, cleanId) || isNameMatch(m.nama, userNama)) {
        return { ...m, status: nextStatus as Mahasiswa['status'] };
      }
      return m;
    });
    return { newMahasiswaList: updated };
  }

  if (user.role === 'eksternal') {
    const nextStatus = user.status === 'Aktif' ? 'Aktif' : 'Nonaktif';
    const updatedPbl = (sdmState.pembimbingLapanganList || []).map((pb) => {
      if (isUserMatchingEntity(user, pb) || isIdentifierMatch(pb.idMitra, cleanId) || isNameMatch(pb.nama, userNama)) {
        return { ...pb, status: nextStatus as PembimbingLapanganStaff['status'] };
      }
      return pb;
    });
    return { newPembimbingLapanganList: updatedPbl };
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    const nextStatus = user.status === 'Aktif' ? 'Aktif' : 'Cuti';
    const updatedAdmin = sdmState.adminList.map((a) => {
      if (isUserMatchingEntity(user, a) || isIdentifierMatch(a.nip, cleanId) || isNameMatch(a.nama, userNama)) {
        return { ...a, status: nextStatus as AdminStaff['status'] };
      }
      return a;
    });
    const updatedPlp = sdmState.plpList.map((p) => {
      if (isUserMatchingEntity(user, p) || isIdentifierMatch(p.nip, cleanId) || isNameMatch(p.nama, userNama)) {
        return { ...p, status: nextStatus as PLPStaff['status'] };
      }
      return p;
    });
    return { newAdminList: updatedAdmin, newPlpList: updatedPlp };
  }

  return {};
};

export const parseNameAndGelar = (fullName?: string): { nama: string; gelar: string } => {
  if (!fullName || typeof fullName !== 'string') return { nama: '', gelar: '' };
  if (fullName.includes(',')) {
    const parts = fullName.split(',');
    const nama = parts[0].trim();
    const gelar = parts.slice(1).join(',').trim();
    return { nama, gelar };
  }
  return { nama: fullName.trim(), gelar: '' };
};

export interface FullModuleState {
  dosenList: Dosen[];
  mahasiswaList: Mahasiswa[];
  adminList: AdminStaff[];
  plpList: PLPStaff[];
  pembimbingLapanganList?: PembimbingLapanganStaff[];
  klkList: PengajuanKLK[];
  logbooks?: LogbookLabItem[];
  seminarList?: JadwalSeminar[];
  suratList?: SuratPengajuan[];
}

export interface FullSyncResult {
  newDosenList: Dosen[];
  newMahasiswaList: Mahasiswa[];
  newAdminList: AdminStaff[];
  newPlpList: PLPStaff[];
  newPembimbingLapanganList?: PembimbingLapanganStaff[];
  newKlkList: PengajuanKLK[];
  newLogbooks: LogbookLabItem[];
  newSeminarList: JadwalSeminar[];
  newSuratList: SuratPengajuan[];
}

/**
 * Sinkronisasi Pembaruan/Edit Akun Pengguna (Config -> User) ke Modul SDM (Dosen, Mahasiswa, Admin, PLP, Pembimbing Lapangan)
 * serta seluruh modul yang berelasi: KLK, Mahasiswa DPA, Logbook Lab Bebas Lab, Jadwal Seminar, & Permohonan Surat.
 */
export const syncUserEditAcrossAllModules = (
  oldUser: UserAccountItem,
  newUser: UserAccountItem,
  state: FullModuleState
): FullSyncResult => {
  let updatedDosen = [...state.dosenList];
  let updatedMhs = [...state.mahasiswaList];
  let updatedAdmin = [...state.adminList];
  let updatedPlp = [...state.plpList];
  let updatedPembimbingLapangan = state.pembimbingLapanganList ? [...state.pembimbingLapanganList] : [];
  let updatedKlk = [...state.klkList];
  let updatedLogbooks = state.logbooks ? [...state.logbooks] : [];
  let updatedSeminar = state.seminarList ? [...state.seminarList] : [];
  let updatedSurat = state.suratList ? [...state.suratList] : [];

  const oldCleanId = (typeof oldUser?.identifier === 'string' ? oldUser.identifier : '').replace(/\D/g, '');
  const newCleanId = (typeof newUser?.identifier === 'string' ? newUser.identifier : '').replace(/\D/g, '');
  const oldUserId = typeof oldUser?.id === 'string' ? oldUser.id : '';
  const newUserId = typeof newUser?.id === 'string' ? newUser.id : '';
  const oldUserNama = typeof oldUser?.nama === 'string' ? oldUser.nama : '';
  const newUserNama = typeof newUser?.nama === 'string' ? newUser.nama : '';
  const parsedNew = parseNameAndGelar(newUserNama);

  // 1. PENGGUNA BERPERAN DOSEN
  if (newUser.role === 'dosen') {
    if (isMahasiswaRole(oldUser.role)) {
      updatedMhs = updatedMhs.filter((m) => !isUserMatchingEntity(oldUser, m) && !isIdentifierMatch(m.nim, oldCleanId) && !isNameMatch(m.nama, oldUserNama));
    } else if (oldUser.role === 'admin' || oldUser.role === 'super_admin') {
      updatedAdmin = updatedAdmin.filter((a) => !isUserMatchingEntity(oldUser, a) && !isIdentifierMatch(a.nip, oldCleanId) && !isNameMatch(a.nama, oldUserNama));
      updatedPlp = updatedPlp.filter((p) => !isUserMatchingEntity(oldUser, p) && !isIdentifierMatch(p.nip, oldCleanId) && !isNameMatch(p.nama, oldUserNama));
    } else if (oldUser.role === 'eksternal') {
      updatedPembimbingLapangan = updatedPembimbingLapangan.filter(
        (pb) => !isUserMatchingEntity(oldUser, pb) && !isIdentifierMatch(pb.idMitra, oldCleanId) && !isNameMatch(pb.nama, oldUserNama)
      );
    }

    const targetDosenIdx = updatedDosen.findIndex(
      (d) =>
        isUserMatchingEntity(oldUser, d) ||
        isIdentifierMatch(d.nip || d.nidn, oldCleanId) ||
        isNameMatch(d.nama, oldUserNama)
    );

    let dosenId = '';
    if (targetDosenIdx >= 0) {
      const existing = updatedDosen[targetDosenIdx];
      dosenId = existing.id;
      const nipVal = newCleanId || existing.nip;
      const nidnVal = newCleanId && newCleanId.length <= 10 && newCleanId.length >= 6 ? newCleanId : existing.nidn;
      const unitLab = newUser.unit && newUser.unit.includes('Laboratorium') ? (newUser.unit as LabRiset) : existing.lab;
      const jabLower = (newUser.jabatan || '').toLowerCase();
      const nextJabAkademik: Dosen['jabatanAkademik'] = jabLower.includes('guru besar')
        ? 'Guru Besar (Profesor)'
        : jabLower.includes('lektor kepala')
        ? 'Lektor Kepala'
        : jabLower.includes('asisten ahli')
        ? 'Asisten Ahli'
        : jabLower.includes('lektor')
        ? 'Lektor'
        : existing.jabatanAkademik;

      updatedDosen[targetDosenIdx] = {
        ...existing,
        nama: parsedNew.nama || newUserNama || existing.nama,
        gelar: parsedNew.gelar,
        nip: nipVal,
        nidn: nidnVal,
        email: newUser.email,
        telepon: newUser.noHp !== undefined ? newUser.noHp : existing.telepon,
        status: newUser.status === 'Aktif' ? 'Aktif Mengajar' : 'Cuti Riset',
        lab: unitLab,
        unit: newUser.unit,
        jabatan: newUser.jabatan,
        jabatanAkademik: nextJabAkademik
      };
    } else {
      const rawSuffix = (newUserId || oldUserId).replace(/^usr-(?:(?:mhs|dos|adm|plp|pbl)-)?/, '');
      dosenId = rawSuffix ? `dos-${rawSuffix}` : `dos-${Date.now()}`;
      const newDosen: Dosen = {
        id: dosenId,
        nip: newCleanId || '',
        nidn: newCleanId.length <= 10 && newCleanId.length >= 6 ? newCleanId : '00' + (newCleanId.slice(0, 8) || '12345678'),
        nama: parsedNew.nama || newUser.nama,
        gelar: parsedNew.gelar,
        bidang: 'Kimia Analitik',
        lab: (newUser.unit && newUser.unit.includes('Laboratorium') ? (newUser.unit as LabRiset) : 'Laboratorium Kimia Analitik & Instrumentasi'),
        unit: newUser.unit,
        jabatan: newUser.jabatan,
        email: newUser.email,
        jabatanAkademik: 'Lektor',
        status: newUser.status === 'Aktif' ? 'Aktif Mengajar' : 'Cuti Riset',
        kuotaBimbingan: 8,
        jumlahBimbingan: 0,
        matakuliah: ['Kimia Dasar', 'Metodologi Penelitian Kimia'],
        topikRiset: ['Riset Kimia Terapan'],
        ruangKantor: 'Gedung Kimia FSTeM UB Lt. 2',
        telepon: newUser.noHp || ''
      };
      updatedDosen = [newDosen, ...updatedDosen];
    }

    // Cascade Dosen changes across other menus
    const newFullDosenName = newUser.nama;
    // a. Update DPA & Pembimbing in Mahasiswa
    updatedMhs = updatedMhs.map((m) => {
      let changed = false;
      let newDpaNama = m.dosenPANama;
      let newDpaNip = m.dosenPANip;
      let p1 = m.dosenPembimbing1Nama;
      let p2 = m.dosenPembimbing2Nama;

      if (
        (dosenId && m.dosenPAId === dosenId) ||
        (m.dosenPANama && (isNameMatch(m.dosenPANama, oldUser.nama) || isNameMatch(m.dosenPANama, newUser.nama))) ||
        (oldCleanId && m.dosenPANip && isIdentifierMatch(m.dosenPANip, oldCleanId))
      ) {
        newDpaNama = newFullDosenName;
        newDpaNip = newCleanId || m.dosenPANip;
        changed = true;
      }
      if (p1 && (isNameMatch(p1, oldUser.nama) || isNameMatch(p1, newUser.nama))) {
        p1 = newFullDosenName;
        changed = true;
      }
      if (p2 && (isNameMatch(p2, oldUser.nama) || isNameMatch(p2, newUser.nama))) {
        p2 = newFullDosenName;
        changed = true;
      }
      if (changed) {
        return {
          ...m,
          dosenPAId: dosenId || m.dosenPAId,
          dosenPANama: newDpaNama,
          dosenPANip: newDpaNip,
          dosenPembimbing1Nama: p1,
          dosenPembimbing2Nama: p2
        };
      }
      return m;
    });

    // b. Update Dosen Pembimbing KLK & DPA in KLK
    updatedKlk = updatedKlk.map((k) => {
      let changed = false;
      let pbKlk = k.dosenPembimbingKLK;
      let dpaNama = k.dpaNama;

      if (pbKlk && (isNameMatch(pbKlk, oldUser.nama) || isNameMatch(pbKlk, newUser.nama))) {
        pbKlk = newFullDosenName;
        changed = true;
      }
      if (dpaNama && (isNameMatch(dpaNama, oldUser.nama) || isNameMatch(dpaNama, newUser.nama))) {
        dpaNama = newFullDosenName;
        changed = true;
      }
      return changed ? { ...k, dosenPembimbingKLK: pbKlk, dpaNama } : k;
    });

    // c. Update Dosen Verifikator in Logbook Lab
    updatedLogbooks = updatedLogbooks.map((lb) => {
      if (lb.dosenVerifikator && (isNameMatch(lb.dosenVerifikator, oldUser.nama) || isNameMatch(lb.dosenVerifikator, newUser.nama))) {
        return { ...lb, dosenVerifikator: newFullDosenName };
      }
      return lb;
    });

    // d. Update Dosen in Jadwal Seminar (Pembimbing, Penguji 1, Penguji 2)
    updatedSeminar = updatedSeminar.map((sem) => {
      let changed = false;
      let pemb = sem.dosenPembimbing;
      let p1 = sem.dosenPenguji1;
      let p2 = sem.dosenPenguji2;

      if (pemb && (isNameMatch(pemb, oldUser.nama) || isNameMatch(pemb, newUser.nama))) {
        pemb = newFullDosenName;
        changed = true;
      }
      if (p1 && (isNameMatch(p1, oldUser.nama) || isNameMatch(p1, newUser.nama))) {
        p1 = newFullDosenName;
        changed = true;
      }
      if (p2 && (isNameMatch(p2, oldUser.nama) || isNameMatch(p2, newUser.nama))) {
        p2 = newFullDosenName;
        changed = true;
      }
      return changed ? { ...sem, dosenPembimbing: pemb, dosenPenguji1: p1, dosenPenguji2: p2 } : sem;
    });
  }

  // 2. PENGGUNA BERPERAN MAHASISWA (S1 / S2 / S3)
  else if (isMahasiswaRole(newUser.role)) {
    const jenjang = getMahasiswaJenjang(newUser.role);
    if (oldUser.role === 'dosen') {
      updatedDosen = updatedDosen.filter((d) => !isUserMatchingEntity(oldUser, d) && !isIdentifierMatch(d.nip || d.nidn, oldCleanId) && !isNameMatch(d.nama, oldUser.nama));
    } else if (oldUser.role === 'admin' || oldUser.role === 'super_admin') {
      updatedAdmin = updatedAdmin.filter((a) => !isUserMatchingEntity(oldUser, a) && !isIdentifierMatch(a.nip, oldCleanId) && !isNameMatch(a.nama, oldUser.nama));
      updatedPlp = updatedPlp.filter((p) => !isUserMatchingEntity(oldUser, p) && !isIdentifierMatch(p.nip, oldCleanId) && !isNameMatch(p.nama, oldUser.nama));
    } else if (oldUser.role === 'eksternal') {
      updatedPembimbingLapangan = updatedPembimbingLapangan.filter(
        (pb) => !isUserMatchingEntity(oldUser, pb) && !isIdentifierMatch(pb.idMitra, oldCleanId) && !isNameMatch(pb.nama, oldUser.nama)
      );
    }

    const targetMhsIdx = updatedMhs.findIndex(
      (m) =>
        isUserMatchingEntity(oldUser, m) ||
        isIdentifierMatch(m.nim, oldCleanId) ||
        isNameMatch(m.nama, oldUserNama)
    );

    let mhsId = '';
    const updatedNim = newCleanId || (targetMhsIdx >= 0 ? updatedMhs[targetMhsIdx].nim : '235090200111001');

    if (targetMhsIdx >= 0) {
      const existing = updatedMhs[targetMhsIdx];
      mhsId = existing.id;
      updatedMhs[targetMhsIdx] = {
        ...existing,
        nama: newUser.nama,
        nim: updatedNim,
        email: newUser.email,
        telepon: newUser.noHp !== undefined ? newUser.noHp : existing.telepon,
        programStudi: newUser.unit || existing.programStudi,
        unit: newUser.unit,
        jabatan: newUser.jabatan,
        status: newUser.status === 'Aktif' ? 'Aktif' : 'Cuti'
      };
    } else {
      const rawSuffix = (newUserId || oldUserId).replace(/^usr-(?:(?:mhs|dos|adm|plp|pbl)-)?/, '');
      mhsId = rawSuffix ? `mhs-${rawSuffix}` : `mhs-${Date.now()}`;
      const angkatanMatch = updatedNim.match(/^(\d{2})/);
      const angkatanYear = angkatanMatch ? `20${angkatanMatch[1]}` : '2023';
      const newMhs: Mahasiswa = {
        id: mhsId,
        nim: updatedNim,
        nama: newUser.nama,
        angkatan: angkatanYear,
        programStudi: newUser.unit || `${jenjang} Kimia - FMIPA Universitas Brawijaya`,
        email: newUser.email,
        telepon: newUser.noHp || '',
        unit: newUser.unit,
        jabatan: newUser.jabatan,
        dosenPAId: '',
        dosenPANama: '',
        status: newUser.status === 'Aktif' ? 'Aktif' : 'Cuti',
        semester: 3,
        ipk: 3.5,
        totalSks: 64,
        tahapSkripsi: 'Belum Mengambil',
        labPenelitian: 'Laboratorium Kimia Analitik & Instrumentasi'
      };
      updatedMhs = [newMhs, ...updatedMhs];
    }

    // Cascade Mahasiswa changes across other menus
    // a. KLK List
    updatedKlk = updatedKlk.map((k) => {
      if (
        (mhsId && k.mahasiswaId === mhsId) ||
        isIdentifierMatch(k.nim, oldCleanId) ||
        isIdentifierMatch(k.nim, newCleanId) ||
        isNameMatch(k.mahasiswaNama, oldUser.nama)
      ) {
        return {
          ...k,
          mahasiswaNama: newUser.nama,
          nim: updatedNim
        };
      }
      return k;
    });

    // b. Logbook Lab
    updatedLogbooks = updatedLogbooks.map((lb) => {
      if (
        (mhsId && lb.mahasiswaId === mhsId) ||
        isIdentifierMatch(lb.nim, oldCleanId) ||
        isIdentifierMatch(lb.nim, newCleanId) ||
        isNameMatch(lb.mahasiswaNama, oldUser.nama)
      ) {
        return {
          ...lb,
          mahasiswaNama: newUser.nama,
          nim: updatedNim
        };
      }
      return lb;
    });

    // c. Jadwal Seminar
    updatedSeminar = updatedSeminar.map((sem) => {
      if (
        isIdentifierMatch(sem.nim, oldCleanId) ||
        isIdentifierMatch(sem.nim, newCleanId) ||
        isNameMatch(sem.mahasiswaNama, oldUser.nama)
      ) {
        return {
          ...sem,
          mahasiswaNama: newUser.nama,
          nim: updatedNim
        };
      }
      return sem;
    });

    // d. Permohonan Surat
    updatedSurat = updatedSurat.map((sur) => {
      if (
        (mhsId && sur.mahasiswaId === mhsId) ||
        isIdentifierMatch(sur.nim, oldCleanId) ||
        isIdentifierMatch(sur.nim, newCleanId) ||
        isNameMatch(sur.mahasiswaNama, oldUser.nama)
      ) {
        return {
          ...sur,
          mahasiswaNama: newUser.nama,
          nim: updatedNim
        };
      }
      return sur;
    });
  }

  // 3. PENGGUNA BERPERAN ADMIN / SUPER ADMIN
  else if (newUser.role === 'admin' || newUser.role === 'super_admin') {
    if (oldUser.role === 'dosen') {
      updatedDosen = updatedDosen.filter((d) => !isUserMatchingEntity(oldUser, d) && !isIdentifierMatch(d.nip || d.nidn, oldCleanId) && !isNameMatch(d.nama, oldUser.nama));
    } else if (isMahasiswaRole(oldUser.role)) {
      updatedMhs = updatedMhs.filter((m) => !isUserMatchingEntity(oldUser, m) && !isIdentifierMatch(m.nim, oldCleanId) && !isNameMatch(m.nama, oldUser.nama));
    } else if (oldUser.role === 'eksternal') {
      updatedPembimbingLapangan = updatedPembimbingLapangan.filter(
        (pb) => !isUserMatchingEntity(oldUser, pb) && !isIdentifierMatch(pb.idMitra, oldCleanId) && !isNameMatch(pb.nama, oldUser.nama)
      );
    }

    const isPlpMatch =
      newUser.jabatan.toLowerCase().includes('plp') ||
      newUser.jabatan.toLowerCase().includes('pranata laboratorium') ||
      newUser.jabatan.toLowerCase().includes('laboran') ||
      (!newUser.jabatan.toLowerCase().includes('admin') &&
        updatedPlp.some((p) => isUserMatchingEntity(oldUser, p) || isIdentifierMatch(p.nip, oldCleanId) || isNameMatch(p.nama, oldUser.nama)));

    if (isPlpMatch) {
      // Hapus dari adminList jika sebelumnya tercatat sebagai Admin TU
      updatedAdmin = updatedAdmin.filter(
        (a) => !isUserMatchingEntity(oldUser, a) && !isIdentifierMatch(a.nip, oldCleanId) && !isNameMatch(a.nama, oldUser.nama)
      );

      const plpIdx = updatedPlp.findIndex(
        (p) => isUserMatchingEntity(oldUser, p) || isIdentifierMatch(p.nip, oldCleanId) || isNameMatch(p.nama, oldUser.nama)
      );
      if (plpIdx >= 0) {
        const existing = updatedPlp[plpIdx];
        updatedPlp[plpIdx] = {
          ...existing,
          nama: parsedNew.nama || newUser.nama,
          gelar: parsedNew.gelar,
          nip: newCleanId || existing.nip,
          email: newUser.email,
          telepon: newUser.noHp !== undefined ? newUser.noHp : existing.telepon,
          labUtama: newUser.unit || existing.labUtama,
          jabatan: newUser.jabatan,
          status: newUser.status === 'Aktif' ? 'Aktif' : 'Cuti'
        };
      } else {
        const rawSuffix = (newUserId || oldUserId).replace(/^usr-(?:(?:mhs|dos|adm|plp|pbl)-)?/, '');
        const newPlp: PLPStaff = {
          id: rawSuffix ? `plp-${rawSuffix}` : `plp-${Date.now()}`,
          nip: newCleanId || `1992${Math.floor(10000000 + Math.random() * 90000000)}`,
          nama: parsedNew.nama || newUser.nama,
          gelar: parsedNew.gelar,
          jenjang: 'PLP Ahli Pertama',
          labUtama: newUser.unit || 'Laboratorium Kimia Analitik & Instrumentasi',
          jabatan: newUser.jabatan,
          spesialisasiInstrumen: ['Spektrofotometer UV-Vis', 'HPLC'],
          tupoksiUtama: 'Pengelolaan operasional laboratorium dan pemeliharaan alat uji',
          email: newUser.email,
          telepon: newUser.noHp || '',
          ruangLab: 'Gedung Kimia Lt. 1 Ruang PLP',
          status: newUser.status === 'Aktif' ? 'Aktif' : 'Cuti',
          verifikatorBebasLab: true
        };
        updatedPlp = [newPlp, ...updatedPlp];
      }
    } else {
      // Hapus dari plpList jika sebelumnya tercatat sebagai PLP
      updatedPlp = updatedPlp.filter(
        (p) => !isUserMatchingEntity(oldUser, p) && !isIdentifierMatch(p.nip, oldCleanId) && !isNameMatch(p.nama, oldUser.nama)
      );

      const admIdx = updatedAdmin.findIndex(
        (a) => isUserMatchingEntity(oldUser, a) || isIdentifierMatch(a.nip, oldCleanId) || isNameMatch(a.nama, oldUser.nama)
      );
      if (admIdx >= 0) {
        const existing = updatedAdmin[admIdx];
        updatedAdmin[admIdx] = {
          ...existing,
          nama: parsedNew.nama || newUser.nama,
          gelar: parsedNew.gelar,
          nip: newCleanId || existing.nip,
          email: newUser.email,
          telepon: newUser.noHp !== undefined ? newUser.noHp : existing.telepon,
          jabatan: newUser.jabatan || existing.jabatan,
          unit: newUser.unit || existing.unit,
          status: newUser.status === 'Aktif' ? 'Aktif' : 'Cuti'
        };
      } else {
        const rawSuffix = (newUserId || oldUserId).replace(/^usr-(?:(?:mhs|dos|adm|plp|pbl)-)?/, '');
        const newAdm: AdminStaff = {
          id: rawSuffix ? `adm-${rawSuffix}` : `adm-${Date.now()}`,
          nip: newCleanId || `1990${Math.floor(10000000 + Math.random() * 90000000)}`,
          nama: parsedNew.nama || newUser.nama,
          gelar: parsedNew.gelar,
          jabatan: newUser.jabatan || 'Staf Tata Usaha & Layanan Akademik',
          unit: newUser.unit || 'Sub-Bagian Akademik & Administrasi Departemen Kimia',
          tupoksi: ['Pengelolaan administrasi & persuratan', 'Layanan data kemahasiswaan SIKMA'],
          email: newUser.email,
          telepon: newUser.noHp || '',
          ruangKantor: 'Gedung Kimia FMIPA Lt. 1 R.102',
          status: newUser.status === 'Aktif' ? 'Aktif' : 'Cuti',
          pendidikanTerakhir: 'S1 Ilmu Administrasi'
        };
        updatedAdmin = [newAdm, ...updatedAdmin];
      }
    }
  } else if (newUser.role === 'eksternal') {
    if (oldUser.role === 'dosen') {
      updatedDosen = updatedDosen.filter((d) => !isUserMatchingEntity(oldUser, d) && !isIdentifierMatch(d.nip || d.nidn, oldCleanId) && !isNameMatch(d.nama, oldUser.nama));
    } else if (isMahasiswaRole(oldUser.role)) {
      updatedMhs = updatedMhs.filter((m) => !isUserMatchingEntity(oldUser, m) && !isIdentifierMatch(m.nim, oldCleanId) && !isNameMatch(m.nama, oldUser.nama));
    } else if (oldUser.role === 'admin' || oldUser.role === 'super_admin') {
      updatedAdmin = updatedAdmin.filter((a) => !isUserMatchingEntity(oldUser, a) && !isIdentifierMatch(a.nip, oldCleanId) && !isNameMatch(a.nama, oldUser.nama));
      updatedPlp = updatedPlp.filter((p) => !isUserMatchingEntity(oldUser, p) && !isIdentifierMatch(p.nip, oldCleanId) && !isNameMatch(p.nama, oldUser.nama));
    }

    const formattedMitraId =
      typeof newUser.identifier === 'string' &&
      (newUser.identifier.startsWith('IDP') || newUser.identifier.startsWith('NIK') || newUser.identifier.startsWith('NIP'))
        ? newUser.identifier.trim()
        : newCleanId
        ? `IDP-${newCleanId.slice(-7)}`
        : '';

    const pblIdx = updatedPembimbingLapangan.findIndex(
      (p) => isUserMatchingEntity(oldUser, p) || isIdentifierMatch(p.idMitra, oldCleanId) || isNameMatch(p.nama, oldUser.nama)
    );
    if (pblIdx >= 0) {
      const existing = updatedPembimbingLapangan[pblIdx];
      updatedPembimbingLapangan[pblIdx] = {
        ...existing,
        nama: parsedNew.nama || newUser.nama,
        gelar: parsedNew.gelar,
        idMitra: formattedMitraId || existing.idMitra,
        email: newUser.email,
        telepon: newUser.noHp !== undefined ? newUser.noHp : existing.telepon,
        jabatan: newUser.jabatan || existing.jabatan,
        namaMitra: newUser.unit || existing.namaMitra,
        status: newUser.status === 'Aktif' ? 'Aktif' : 'Nonaktif',
        username: newUser.username
      };
    } else {
      const rawSuffix = (newUserId || oldUserId).replace(/^usr-(?:(?:mhs|dos|adm|plp|pbl)-)?/, '');
      const newPbl: PembimbingLapanganStaff = {
        id: rawSuffix ? `pbl-${rawSuffix}` : `pbl-${Date.now()}`,
        idMitra: formattedMitraId || `IDP-${Math.floor(1000000 + Math.random() * 9000000)}`,
        nama: parsedNew.nama || newUser.nama,
        gelar: parsedNew.gelar,
        jabatan: newUser.jabatan || 'Pembimbing Lapangan',
        namaMitra: newUser.unit || 'Instansi / Mitra Industri KLK',
        email: newUser.email,
        telepon: newUser.noHp || '',
        status: newUser.status === 'Aktif' ? 'Aktif' : 'Nonaktif',
        jumlahMahasiswaBimbingan: 1,
        alamatInstansi: newUser.unit || 'Mitra Industri Tempat KLK',
        username: newUser.username
      };
      updatedPembimbingLapangan = [newPbl, ...updatedPembimbingLapangan];
    }
  }

  return {
    newDosenList: updatedDosen,
    newMahasiswaList: updatedMhs,
    newAdminList: updatedAdmin,
    newPlpList: updatedPlp,
    newPembimbingLapanganList: updatedPembimbingLapangan,
    newKlkList: updatedKlk,
    newLogbooks: updatedLogbooks,
    newSeminarList: updatedSeminar,
    newSuratList: updatedSurat
  };
};

/**
 * Sinkronisasi Penghapusan Akun Pengguna (Config -> User) ke Seluruh Sistem:
 * - Menghapus data dari SDM (Dosen, Mahasiswa, Admin, PLP, Pembimbing Lapangan).
 * - Jika Mahasiswa dihapus: menghapus semua record pendaftaran KLK, Logbook Lab, Jadwal Seminar, & Permohonan Surat.
 * - Jika Dosen dihapus: memutuskan bimbingan DPA di Mahasiswa, Dosen Pembimbing KLK, verifikator logbook lab, dan penguji seminar.
 */
export const syncUserDeleteAcrossAllModules = (
  deletedUser: UserAccountItem,
  state: FullModuleState
): FullSyncResult => {
  const cleanId = (deletedUser.identifier || '').replace(/\D/g, '');
  let updatedDosen = [...state.dosenList];
  let updatedMhs = [...state.mahasiswaList];
  let updatedAdmin = [...state.adminList];
  let updatedPlp = [...state.plpList];
  let updatedPembimbingLapangan = state.pembimbingLapanganList ? [...state.pembimbingLapanganList] : [];
  let updatedKlk = [...state.klkList];
  let updatedLogbooks = state.logbooks ? [...state.logbooks] : [];
  let updatedSeminar = state.seminarList ? [...state.seminarList] : [];
  let updatedSurat = state.suratList ? [...state.suratList] : [];

  // Cari entitas yang cocok sesuai peran akun yang dihapus (mencegah bentrok nama antar peran berbeda)
  const matchedMhsList = isMahasiswaRole(deletedUser.role) ? updatedMhs.filter((m) => isUserMatchingEntity(deletedUser, m)) : [];
  const matchedDosenList = deletedUser.role === 'dosen' ? updatedDosen.filter((d) => isUserMatchingEntity(deletedUser, d)) : [];
  const matchedAdminList =
    deletedUser.role === 'admin' || deletedUser.role === 'super_admin'
      ? updatedAdmin.filter((a) => isUserMatchingEntity(deletedUser, a))
      : [];
  const matchedPlpList =
    deletedUser.role === 'admin' || deletedUser.role === 'super_admin'
      ? updatedPlp.filter((p) => isUserMatchingEntity(deletedUser, p))
      : [];

  // 1. PEMBERSIHAN DATA MAHASISWA & RANGKAIAN MODUL TERKAIT
  const mhsIdsToRemove = new Set(matchedMhsList.map((m) => m.id));

  if (isMahasiswaRole(deletedUser.role)) {
    updatedMhs.forEach((m) => {
      if (
        isUserMatchingEntity(deletedUser, m) ||
        (cleanId && isIdentifierMatch(m.nim, cleanId)) ||
        isNameMatch(m.nama, deletedUser.nama) ||
        (deletedUser.username && isNameMatch(m.nama, deletedUser.username))
      ) {
        mhsIdsToRemove.add(m.id);
      }
    });
  }

  if (mhsIdsToRemove.size > 0 || isMahasiswaRole(deletedUser.role)) {
    // Hapus seluruh record mahasiswa yang cocok
    updatedMhs = updatedMhs.filter((m) => !mhsIdsToRemove.has(m.id));

    // Hapus seluruh pengajuan KLK terkait mahasiswa ini
    updatedKlk = updatedKlk.filter((k) => {
      if (mhsIdsToRemove.has(k.mahasiswaId)) return false;
      if (cleanId && isIdentifierMatch(k.nim, cleanId)) return false;
      if (isUserMatchingEntity(deletedUser, { id: k.mahasiswaId, nama: k.mahasiswaNama, nim: k.nim })) return false;
      return true;
    });

    // Hapus seluruh logbook lab terkait mahasiswa ini
    updatedLogbooks = updatedLogbooks.filter((lb) => {
      if (mhsIdsToRemove.has(lb.mahasiswaId)) return false;
      if (cleanId && isIdentifierMatch(lb.nim, cleanId)) return false;
      if (isUserMatchingEntity(deletedUser, { id: lb.mahasiswaId, nama: lb.mahasiswaNama, nim: lb.nim })) return false;
      return true;
    });

    // Hapus seluruh jadwal seminar terkait mahasiswa ini
    updatedSeminar = updatedSeminar.filter((sem) => {
      if (cleanId && isIdentifierMatch(sem.nim, cleanId)) return false;
      if (isUserMatchingEntity(deletedUser, { nama: sem.mahasiswaNama, nim: sem.nim })) return false;
      return true;
    });

    // Hapus seluruh permohonan surat terkait mahasiswa ini
    updatedSurat = updatedSurat.filter((sur) => {
      if (mhsIdsToRemove.has(sur.mahasiswaId)) return false;
      if (cleanId && isIdentifierMatch(sur.nim, cleanId)) return false;
      if (isUserMatchingEntity(deletedUser, { id: sur.mahasiswaId, nama: sur.mahasiswaNama, nim: sur.nim })) return false;
      return true;
    });
  }

  // 2. PEMBERSIHAN DATA DOSEN & RELASI BIMBINGAN / PENGUJI
  if (matchedDosenList.length > 0 || deletedUser.role === 'dosen') {
    const dosenIdsToRemove = new Set(matchedDosenList.map((d) => d.id));
    updatedDosen.forEach((d) => {
      if (
        isUserMatchingEntity(deletedUser, d) ||
        (cleanId && isIdentifierMatch(d.nip || d.nidn, cleanId)) ||
        isNameMatch(d.nama, deletedUser.nama) ||
        (deletedUser.username && isNameMatch(d.nama, deletedUser.username))
      ) {
        dosenIdsToRemove.add(d.id);
      }
    });

    // Hapus dari Dosen List
    updatedDosen = updatedDosen.filter((d) => !dosenIdsToRemove.has(d.id));

    // Putuskan relasi DPA & Pembimbing pada Mahasiswa
    updatedMhs = updatedMhs.map((m) => {
      let changed = false;
      let dpaId = m.dosenPAId;
      let dpaNama = m.dosenPANama;
      let dpaNip = m.dosenPANip;
      let p1 = m.dosenPembimbing1Nama;
      let p2 = m.dosenPembimbing2Nama;

      const isDpaMatched =
        (dpaId && dosenIdsToRemove.has(dpaId)) ||
        (dpaNama && isUserMatchingEntity(deletedUser, { nama: dpaNama, nip: dpaNip }));

      if (isDpaMatched) {
        dpaId = '';
        dpaNama = 'Belum Ditentukan';
        dpaNip = '';
        changed = true;
      }
      if (p1 && isUserMatchingEntity(deletedUser, { nama: p1 })) {
        p1 = 'Belum Ditentukan';
        changed = true;
      }
      if (p2 && isUserMatchingEntity(deletedUser, { nama: p2 })) {
        p2 = 'Belum Ditentukan';
        changed = true;
      }

      return changed ? { ...m, dosenPAId: dpaId, dosenPANama: dpaNama, dosenPANip: dpaNip, dosenPembimbing1Nama: p1, dosenPembimbing2Nama: p2 } : m;
    });

    // Putuskan relasi Dosen Pembimbing KLK & DPA pada pengajuan KLK terkait
    updatedKlk = updatedKlk.map((k) => {
      let changed = false;
      let pbKlk = k.dosenPembimbingKLK;
      let dpaNama = k.dpaNama;

      if (pbKlk && isUserMatchingEntity(deletedUser, { nama: pbKlk })) {
        pbKlk = 'Belum Ditetapkan (Dosen Sebelumnya Telah Dihapus)';
        changed = true;
      }
      if (dpaNama && isUserMatchingEntity(deletedUser, { nama: dpaNama })) {
        dpaNama = 'Belum Ditentukan';
        changed = true;
      }
      return changed ? { ...k, dosenPembimbingKLK: pbKlk, dpaNama } : k;
    });

    // Update dosenVerifikator pada Logbook Lab
    updatedLogbooks = updatedLogbooks.map((lb) => {
      if (lb.dosenVerifikator && isUserMatchingEntity(deletedUser, { nama: lb.dosenVerifikator })) {
        return { ...lb, dosenVerifikator: 'Dosen Pembimbing (Telah Dihapus)' };
      }
      return lb;
    });

    // Update dosen pembimbing & penguji pada Jadwal Seminar
    updatedSeminar = updatedSeminar.map((sem) => {
      let changed = false;
      let pemb = sem.dosenPembimbing;
      let p1 = sem.dosenPenguji1;
      let p2 = sem.dosenPenguji2;

      if (pemb && isUserMatchingEntity(deletedUser, { nama: pemb })) {
        pemb = 'Belum Ditetapkan';
        changed = true;
      }
      if (p1 && isUserMatchingEntity(deletedUser, { nama: p1 })) {
        p1 = 'Belum Ditetapkan';
        changed = true;
      }
      if (p2 && isUserMatchingEntity(deletedUser, { nama: p2 })) {
        p2 = 'Belum Ditetapkan';
        changed = true;
      }
      return changed ? { ...sem, dosenPembimbing: pemb, dosenPenguji1: p1, dosenPenguji2: p2 } : sem;
    });
  }

  // 3. PEMBERSIHAN DATA ADMIN & PLP
  if (deletedUser.role === 'admin' || deletedUser.role === 'super_admin' || matchedAdminList.length > 0) {
    const adminIdsToRemove = new Set(matchedAdminList.map((a) => a.id));
    updatedAdmin.forEach((a) => {
      if (
        isUserMatchingEntity(deletedUser, a) ||
        (cleanId && isIdentifierMatch(a.nip, cleanId)) ||
        isNameMatch(a.nama, deletedUser.nama) ||
        (deletedUser.username && isNameMatch(a.nama, deletedUser.username))
      ) {
        adminIdsToRemove.add(a.id);
      }
    });
    updatedAdmin = updatedAdmin.filter((a) => !adminIdsToRemove.has(a.id));
  }

  if (deletedUser.role === 'admin' || deletedUser.role === 'super_admin' || matchedPlpList.length > 0) {
    const plpIdsToRemove = new Set(matchedPlpList.map((p) => p.id));
    updatedPlp.forEach((p) => {
      if (
        isUserMatchingEntity(deletedUser, p) ||
        (cleanId && isIdentifierMatch(p.nip, cleanId)) ||
        isNameMatch(p.nama, deletedUser.nama) ||
        (deletedUser.username && isNameMatch(p.nama, deletedUser.username))
      ) {
        plpIdsToRemove.add(p.id);
      }
    });
    updatedPlp = updatedPlp.filter((p) => !plpIdsToRemove.has(p.id));
  }

  // 4. PEMBERSIHAN DATA PEMBIMBING LAPANGAN (EKSTERNAL)
  const isEksternalUser =
    deletedUser.role === 'eksternal' ||
    (deletedUser.jabatan &&
      (deletedUser.jabatan.toLowerCase().includes('pembimbing lapangan') ||
        deletedUser.jabatan.toLowerCase().includes('pembimbing lapang') ||
        deletedUser.jabatan.toLowerCase().includes('mentor')));
  if (isEksternalUser && updatedPembimbingLapangan.length > 0) {
    updatedPembimbingLapangan = updatedPembimbingLapangan.filter(
      (pb) =>
        !isUserMatchingEntity(deletedUser, pb) &&
        (!cleanId || !isIdentifierMatch(pb.idMitra, cleanId)) &&
        !isNameMatch(pb.nama, deletedUser.nama) &&
        (!deletedUser.username || !isNameMatch(pb.nama, deletedUser.username))
    );
  }

  return {
    newDosenList: updatedDosen,
    newMahasiswaList: updatedMhs,
    newAdminList: updatedAdmin,
    newPlpList: updatedPlp,
    newPembimbingLapanganList: updatedPembimbingLapangan,
    newKlkList: updatedKlk,
    newLogbooks: updatedLogbooks,
    newSeminarList: updatedSeminar,
    newSuratList: updatedSurat
  };
};

