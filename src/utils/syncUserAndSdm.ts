import { UserAccountItem } from '../data/userList';
import { Dosen, Mahasiswa, AdminStaff, PLPStaff, UserRole } from '../types/sikma';

// Helper: Extract Clean Initials
export const getInitials = (str: string): string => {
  if (!str) return 'UB';
  const clean = str.replace(/\b(prof|dr|dra|drs|s\.si|m\.si|ph\.d|m\.sc|s\.ap|m\.ap|s\.sos|s\.kom|a\.md|s\.tr\.si|dr\.sc)\b/gi, '').trim();
  const words = clean.split(/[\s,.-]+/).filter((w) => w.length > 0);
  if (words.length === 0) return 'UB';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// Helper: Generate unique safe username
export const generateUsername = (nama: string, identifier?: string, role?: string): string => {
  const cleanNama = nama
    .toLowerCase()
    .replace(/\b(prof|dr|dra|drs|s\.si|m\.si|ph\.d|m\.sc|s\.ap|m\.ap|s\.sos|s\.kom|a\.md|s\.tr\.si|dr\.sc)\b/gi, '')
    .trim();
  const tokens = cleanNama.split(/[\s,.-]+/).filter((t) => t.length > 1);
  let base = tokens.slice(0, 2).join('.');
  if (!base) {
    base = identifier ? identifier.replace(/\D/g, '').slice(-6) : `user.${role || 'sikma'}`;
  }
  return base.toLowerCase().replace(/[^a-z0-9.]/g, '');
};

// Helper: Check if identifier numbers match (NIM or NIP)
export const isIdentifierMatch = (id1?: string, id2?: string): boolean => {
  if (!id1 || !id2) return false;
  const c1 = id1.replace(/\D/g, '');
  const c2 = id2.replace(/\D/g, '');
  if (!c1 || !c2 || c1.length < 5 || c2.length < 5) return false;
  return c1 === c2 || c1.includes(c2) || c2.includes(c1);
};

// Helper: Check if names match reasonably
export const isNameMatch = (nama1: string, nama2: string): boolean => {
  if (!nama1 || !nama2) return false;
  const n1 = nama1.toLowerCase().replace(/\b(prof|dr|dra|drs|s\.si|m\.si|ph\.d|m\.sc|s\.ap|m\.ap|s\.sos|s\.kom|a\.md|s\.tr\.si|dr\.sc)\b/gi, '').trim();
  const n2 = nama2.toLowerCase().replace(/\b(prof|dr|dra|drs|s\.si|m\.si|ph\.d|m\.sc|s\.ap|m\.ap|s\.sos|s\.kom|a\.md|s\.tr\.si|dr\.sc)\b/gi, '').trim();
  if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return true;
  const t1 = n1.split(/\s+/).filter((t) => t.length >= 3);
  const t2 = n2.split(/\s+/).filter((t) => t.length >= 3);
  const common = t1.filter((t) => t2.includes(t));
  return common.length >= 2;
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
  plpList: PLPStaff[]
): SyncResult => {
  let userMap = [...currentUsers];
  let addedCount = 0;
  let updatedCount = 0;

  // 1. SINKRONISASI DOSEN
  dosenList.forEach((d) => {
    const dNip = d.nip || d.nidn || '';
    const fullName = `${d.nama}, ${d.gelar}`.trim();
    const existingIdx = userMap.findIndex(
      (u) =>
        u.role === 'dosen' &&
        (isIdentifierMatch(u.identifier, dNip) || isNameMatch(u.nama, d.nama))
    );

    const userStatus: 'Aktif' | 'Nonaktif' = d.status === 'Aktif Mengajar' ? 'Aktif' : 'Nonaktif';
    const identifierFormatted = d.nip ? `NIP. ${d.nip}` : `NIDN. ${d.nidn}`;
    const unitFormatted = d.lab ? `${d.lab} (KBK ${d.bidang})` : `KBK ${d.bidang} - Dept Kimia FMIPA UB`;
    const jabatanFormatted = `${d.jabatanAkademik || 'Dosen'} & Dosen Pembimbing Skripsi`;

    if (existingIdx >= 0) {
      // Update data jika ada perubahan
      const existing = userMap[existingIdx];
      const hasChanges =
        existing.status !== userStatus ||
        existing.identifier !== identifierFormatted ||
        existing.email !== (d.email || existing.email) ||
        existing.noHp !== (d.telepon || existing.noHp);

      if (hasChanges) {
        userMap[existingIdx] = {
          ...existing,
          nama: fullName,
          identifier: identifierFormatted,
          email: d.email || existing.email,
          unit: unitFormatted,
          jabatan: jabatanFormatted,
          status: userStatus,
          noHp: d.telepon || existing.noHp
        };
        updatedCount++;
      }
    } else {
      // Buat akun baru untuk Dosen
      const username = generateUsername(d.nama, dNip, 'dosen');
      const newUser: UserAccountItem = {
        id: `usr-dos-${d.id.replace('dos-', '')}`,
        username,
        password: 'Dosen@123',
        nama: fullName,
        role: 'dosen',
        identifier: identifierFormatted,
        email: d.email || `${username}@ub.ac.id`,
        avatarText: getInitials(d.nama),
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
        u.role === 'mahasiswa' &&
        (isIdentifierMatch(u.identifier, m.nim) || isNameMatch(u.nama, m.nama))
    );

    const userStatus: 'Aktif' | 'Nonaktif' = m.status === 'Aktif' ? 'Aktif' : 'Nonaktif';
    const identifierFormatted = `NIM. ${m.nim}`;
    const unitFormatted = `Program Studi ${m.programStudi || 'S1 Kimia FMIPA UB'} (Angkatan ${m.angkatan})`;
    const jabatanFormatted = `Mahasiswa Aktif Semester ${m.semester} (Dosen PA: ${m.dosenPANama})`;

    if (existingIdx >= 0) {
      const existing = userMap[existingIdx];
      const hasChanges =
        existing.status !== userStatus ||
        existing.identifier !== identifierFormatted ||
        existing.jabatan !== jabatanFormatted;

      if (hasChanges) {
        userMap[existingIdx] = {
          ...existing,
          nama: m.nama,
          identifier: identifierFormatted,
          unit: unitFormatted,
          jabatan: jabatanFormatted,
          status: userStatus
        };
        updatedCount++;
      }
    } else {
      const username = generateUsername(m.nama, m.nim, 'mhs');
      const newUser: UserAccountItem = {
        id: `usr-mhs-${m.id.replace('mhs-', '')}`,
        username,
        password: 'Mhs#2024',
        nama: m.nama,
        role: 'mahasiswa',
        identifier: identifierFormatted,
        email: `${username}@student.ub.ac.id`,
        avatarText: getInitials(m.nama),
        unit: unitFormatted,
        jabatan: jabatanFormatted,
        status: userStatus,
        tanggalDibuat: new Date().toISOString().split('T')[0],
        terakhirLogin: 'Belum pernah login',
        noHp: ''
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
        (u.role === 'admin' || u.role === 'super_admin') &&
        (isIdentifierMatch(u.identifier, a.nip) || isNameMatch(u.nama, a.nama))
    );

    const userStatus: 'Aktif' | 'Nonaktif' = a.status === 'Aktif' ? 'Aktif' : 'Nonaktif';
    const identifierFormatted = `NIP. ${a.nip}`;

    if (existingIdx >= 0) {
      const existing = userMap[existingIdx];
      userMap[existingIdx] = {
        ...existing,
        nama: fullName,
        identifier: identifierFormatted,
        email: a.email || existing.email,
        unit: a.unit || existing.unit,
        jabatan: a.jabatan || existing.jabatan,
        status: userStatus,
        noHp: a.telepon || existing.noHp
      };
      updatedCount++;
    } else {
      const username = generateUsername(a.nama, a.nip, 'admin');
      const newUser: UserAccountItem = {
        id: `usr-adm-${a.id.replace('adm-', '')}`,
        username,
        password: 'Admin@123',
        nama: fullName,
        role: 'admin',
        identifier: identifierFormatted,
        email: a.email || `${username}@ub.ac.id`,
        avatarText: getInitials(a.nama),
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
        (u.role === 'admin' || u.role === 'super_admin') &&
        (isIdentifierMatch(u.identifier, p.nip) || isNameMatch(u.nama, p.nama))
    );

    const userStatus: 'Aktif' | 'Nonaktif' = p.status === 'Aktif' ? 'Aktif' : 'Nonaktif';
    const identifierFormatted = `NIP. ${p.nip}`;
    const jabatanFormatted = `Pranata Laboratorium Pendidikan (${p.jenjang})`;

    if (existingIdx >= 0) {
      const existing = userMap[existingIdx];
      userMap[existingIdx] = {
        ...existing,
        nama: fullName,
        identifier: identifierFormatted,
        email: p.email || existing.email,
        unit: p.labUtama || existing.unit,
        jabatan: jabatanFormatted,
        status: userStatus,
        noHp: p.telepon || existing.noHp
      };
      updatedCount++;
    } else {
      const username = generateUsername(p.nama, p.nip, 'plp');
      const newUser: UserAccountItem = {
        id: `usr-plp-${p.id.replace('plp-', '')}`,
        username,
        password: 'Labor@123',
        nama: fullName,
        role: 'admin',
        identifier: identifierFormatted,
        email: p.email || `${username}@ub.ac.id`,
        avatarText: getInitials(p.nama),
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
  }
): {
  newDosenList?: Dosen[];
  newMahasiswaList?: Mahasiswa[];
  newAdminList?: AdminStaff[];
  newPlpList?: PLPStaff[];
} => {
  const cleanId = user.identifier.replace(/\D/g, '');

  if (user.role === 'dosen') {
    const existingIdx = sdmState.dosenList.findIndex(
      (d) => isIdentifierMatch(d.nip || d.nidn, cleanId) || isNameMatch(d.nama, user.nama)
    );

    if (existingIdx >= 0) {
      const updated = [...sdmState.dosenList];
      updated[existingIdx] = {
        ...updated[existingIdx],
        nama: user.nama.replace(/,\s*[A-Za-z.,\s]+$/, '').trim(),
        email: user.email,
        telepon: user.noHp || updated[existingIdx].telepon,
        status: user.status === 'Aktif' ? 'Aktif Mengajar' : 'Cuti Riset'
      };
      return { newDosenList: updated };
    } else {
      const newDosen: Dosen = {
        id: `dos-${Date.now()}`,
        nip: cleanId.length >= 12 ? cleanId : '',
        nidn: cleanId.length < 12 ? cleanId : '00' + cleanId.slice(0, 8),
        nama: user.nama.replace(/,\s*[A-Za-z.,\s]+$/, '').trim(),
        gelar: user.nama.includes(',') ? user.nama.split(',').pop()?.trim() || 'M.Si' : 'M.Si',
        bidang: 'Kimia Analitik',
        lab: 'Laboratorium Kimia Analitik & Instrumentasi',
        email: user.email,
        jabatanAkademik: 'Lektor',
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

  if (user.role === 'mahasiswa') {
    const existingIdx = sdmState.mahasiswaList.findIndex(
      (m) => isIdentifierMatch(m.nim, cleanId) || isNameMatch(m.nama, user.nama)
    );

    if (existingIdx >= 0) {
      const updated = [...sdmState.mahasiswaList];
      updated[existingIdx] = {
        ...updated[existingIdx],
        nama: user.nama,
        status: user.status === 'Aktif' ? 'Aktif' : 'Cuti'
      };
      return { newMahasiswaList: updated };
    } else {
      const angkatanMatch = cleanId.match(/^(\d{2})/);
      const angkatanYear = angkatanMatch ? `20${angkatanMatch[1]}` : '2023';
      const newMhs: Mahasiswa = {
        id: `mhs-${Date.now()}`,
        nim: cleanId || `235090200${Math.floor(100000 + Math.random() * 900000)}`,
        nama: user.nama,
        angkatan: angkatanYear,
        programStudi: 'S1 Kimia - FMIPA Universitas Brawijaya',
        dosenPAId: 'dos-1',
        dosenPANama: 'Dr. Dra. Hermin Sulistyarti, M.Si',
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

  if (user.role === 'admin' || user.role === 'super_admin') {
    // Cek apakah akun ini adalah PLP (Pranata Laboratorium Pendidikan)
    const isPlpMatch =
      user.jabatan.toLowerCase().includes('plp') ||
      user.jabatan.toLowerCase().includes('pranata laboratorium') ||
      user.jabatan.toLowerCase().includes('laboran') ||
      sdmState.plpList.some(
        (p) => isIdentifierMatch(p.nip, cleanId) || isNameMatch(p.nama, user.nama)
      );

    if (isPlpMatch) {
      const existingPlpIdx = sdmState.plpList.findIndex(
        (p) => isIdentifierMatch(p.nip, cleanId) || isNameMatch(p.nama, user.nama)
      );

      if (existingPlpIdx >= 0) {
        const updated = [...sdmState.plpList];
        updated[existingPlpIdx] = {
          ...updated[existingPlpIdx],
          nama: user.nama.replace(/,\s*[A-Za-z.,\s]+$/, '').trim(),
          email: user.email,
          telepon: user.noHp || updated[existingPlpIdx].telepon,
          labUtama: user.unit || updated[existingPlpIdx].labUtama,
          status: user.status === 'Aktif' ? 'Aktif' : 'Cuti'
        };
        return { newPlpList: updated };
      } else {
        const newPlp: PLPStaff = {
          id: `plp-${Date.now()}`,
          nip: cleanId || `1992${Math.floor(10000000 + Math.random() * 90000000)}`,
          nama: user.nama.replace(/,\s*[A-Za-z.,\s]+$/, '').trim(),
          gelar: user.nama.includes(',') ? user.nama.split(',').pop()?.trim() || 'A.Md.' : 'A.Md.',
          jenjang: 'PLP Ahli Pertama',
          labUtama: user.unit || 'Laboratorium Kimia Analitik & Instrumentasi',
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

    // Default: Admin Staf
    const existingIdx = sdmState.adminList.findIndex(
      (a) => isIdentifierMatch(a.nip, cleanId) || isNameMatch(a.nama, user.nama)
    );

    if (existingIdx >= 0) {
      const updated = [...sdmState.adminList];
      updated[existingIdx] = {
        ...updated[existingIdx],
        nama: user.nama.replace(/,\s*[A-Za-z.,\s]+$/, '').trim(),
        email: user.email,
        telepon: user.noHp || updated[existingIdx].telepon,
        jabatan: user.jabatan || updated[existingIdx].jabatan,
        unit: user.unit || updated[existingIdx].unit,
        status: user.status === 'Aktif' ? 'Aktif' : 'Cuti'
      };
      return { newAdminList: updated };
    } else {
      const newAdmin: AdminStaff = {
        id: `adm-${Date.now()}`,
        nip: cleanId || `1990${Math.floor(10000000 + Math.random() * 90000000)}`,
        nama: user.nama.replace(/,\s*[A-Za-z.,\s]+$/, '').trim(),
        gelar: user.nama.includes(',') ? user.nama.split(',').pop()?.trim() || 'S.AP.' : 'S.AP.',
        jabatan: user.jabatan || 'Staf Tata Usaha & Layanan Akademik',
        unit: user.unit || 'Sub-Bagian Akademik & Administrasi Departemen Kimia',
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
