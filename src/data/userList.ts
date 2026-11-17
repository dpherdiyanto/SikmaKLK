import { UserRole } from '../types/sikma';

export interface UserAccountItem {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: UserRole;
  identifier: string; // NIM or NIP
  email: string;
  avatarText: string;
  unit: string;
  jabatan: string;
  status: 'Aktif' | 'Nonaktif' | 'Ditangguhkan';
  tanggalDibuat: string;
  terakhirLogin: string;
  noHp?: string;
  semester?: string;
  mustChangePassword?: boolean;
  passwordChangedAt?: string;
}

export const INITIAL_USER_ACCOUNTS: UserAccountItem[] = [
  {
    id: 'usr-000',
    username: 'superadmin',
    password: 'Super@123',
    nama: 'Zuper Admin',
    role: 'super_admin',
    identifier: 'SA-001',
    email: 'zuperadmin@ub.ac.id',
    avatarText: 'ZA',
    unit: 'Departemen Kimia FSTeM Universitas Brawijaya',
    jabatan: 'Zuper Administrator Sistem SIKMA',
    status: 'Aktif',
    tanggalDibuat: '2023-01-01',
    terakhirLogin: 'Hari ini, 08:30 WIB',
    noHp: '0812-0000-0001'
  },
  {
    id: 'usr-001',
    username: '196403211989032001',
    password: 'Dosen@123',
    nama: 'Prof. Dr. Dra. Hermin Sulistyarti, M.Si',
    role: 'dosen',
    identifier: 'NIP. 196403211989032001',
    email: 'hermin_sulistyarti@ub.ac.id',
    avatarText: 'HS',
    unit: 'KBK Kimia Analitik & Instrumentasi',
    jabatan: 'Dosen Departemen Kimia FSTeM UB',
    status: 'Aktif',
    tanggalDibuat: '2023-01-10',
    terakhirLogin: 'Hari ini, 08:30 WIB',
    noHp: '0812-3456-7890'
  },
  {
    id: 'usr-002',
    username: '198504122010121004',
    password: 'Admin@123',
    nama: 'Biro Administrasi & Laboran Kimia',
    role: 'admin',
    identifier: 'NIP. 198504122010121004',
    email: 'akademik.kimia@ub.ac.id',
    avatarText: 'AK',
    unit: 'Sub-Bagian Akademik & Tata Usaha FMIPA UB',
    jabatan: 'Staf Pengelola Sistem & Arsip Berkas',
    status: 'Aktif',
    tanggalDibuat: '2023-01-15',
    terakhirLogin: 'Hari ini, 09:12 WIB',
    noHp: '0813-9876-5432'
  },
  {
    id: 'usr-003',
    username: '198807202014041001',
    password: 'Labor@123',
    nama: 'Bambang Sutejo, A.Md.',
    role: 'admin',
    identifier: 'NIP. 198807202014041001',
    email: 'bambang.labkimia@ub.ac.id',
    avatarText: 'BS',
    unit: 'Laboratorium Kimia Analitik & Instrumen',
    jabatan: 'Pranata Laboratorium Pendidikan (PLP)',
    status: 'Aktif',
    tanggalDibuat: '2023-03-01',
    terakhirLogin: 'Kemarin, 14:20 WIB',
    noHp: '0815-5555-1234'
  },
  {
    id: 'usr-004',
    username: '197405102000031002',
    password: 'Dosen@123',
    nama: 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.',
    role: 'dosen',
    identifier: 'NIP. 197405102000031002',
    email: 'sabarudin@ub.ac.id',
    avatarText: 'AS',
    unit: 'KBK Kimia Analitik & Instrumentasi',
    jabatan: 'Dosen Pembimbing Utama & Pembimbing Akademik',
    status: 'Aktif',
    tanggalDibuat: '2023-01-12',
    terakhirLogin: 'Kemarin, 16:45 WIB',
    noHp: '0811-2233-4455'
  },
  {
    id: 'usr-005',
    username: '197808242005012001',
    password: 'Dosen@123',
    nama: 'Anna Safitri, S.Si., M.Sc., Ph.D.',
    role: 'dosen',
    identifier: 'NIP. 197808242005012001',
    email: 'a.safitri@ub.ac.id',
    avatarText: 'AF',
    unit: 'KBK Biokimia & Kimia Organik',
    jabatan: 'Dosen Pembimbing & Sekretaris Departemen',
    status: 'Aktif',
    tanggalDibuat: '2023-01-14',
    terakhirLogin: '2 hari lalu',
    noHp: '0812-7788-9900'
  },
  {
    id: 'usr-006',
    username: '197305141999031003',
    password: 'Dosen@123',
    nama: 'Masruri, S.Si., M.Si., Ph.D.',
    role: 'dosen',
    identifier: 'NIP. 197305141999031003',
    email: 'masruri@ub.ac.id',
    avatarText: 'MR',
    unit: 'KBK Kimia Organik Bahan Alam',
    jabatan: 'Dosen Pembimbing & Penguji Skripsi',
    status: 'Aktif',
    tanggalDibuat: '2023-02-05',
    terakhirLogin: '3 hari lalu',
    noHp: '0813-1122-3344'
  },
  {
    id: 'usr-007',
    username: '215090200111012',
    password: 'Mhs#2024',
    nama: 'Ahmad Rizky Pratama',
    role: 'mahasiswa_s1',
    identifier: 'NIM. 215090200111012',
    email: 'ahmad.rizky@student.ub.ac.id',
    avatarText: 'AR',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2021)',
    jabatan: 'Mahasiswa S1 Aktif Semester 7 (Tugas Akhir)',
    status: 'Aktif',
    tanggalDibuat: '2023-08-20',
    terakhirLogin: 'Hari ini, 10:05 WIB',
    noHp: '0821-4455-6677'
  },
  {
    id: 'usr-008',
    username: '215090201111025',
    password: 'Mhs#2024',
    nama: 'Dewi Ayu Anggraeni',
    role: 'mahasiswa_s1',
    identifier: 'NIM. 215090201111025',
    email: 'dewi.anggraeni@student.ub.ac.id',
    avatarText: 'DA',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2021)',
    jabatan: 'Mahasiswa S1 Aktif Semester 7 (Penelitian Lab)',
    status: 'Aktif',
    tanggalDibuat: '2023-08-20',
    terakhirLogin: 'Kemarin, 11:30 WIB',
    noHp: '0822-6677-8899'
  },
  {
    id: 'usr-009',
    username: '225090200111044',
    password: 'Mhs#2024',
    nama: 'Fajar Nur Hidayat',
    role: 'mahasiswa_s1',
    identifier: 'NIM. 225090200111044',
    email: 'fajar.hidayat@student.ub.ac.id',
    avatarText: 'FH',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2022)',
    jabatan: 'Mahasiswa S1 Aktif Semester 5 (Praktikum Lanjut)',
    status: 'Aktif',
    tanggalDibuat: '2024-08-15',
    terakhirLogin: '3 hari lalu',
    noHp: '0857-1234-5678'
  },
  {
    id: 'usr-010',
    username: '235090200111010',
    password: 'Mhs#2024',
    nama: 'Denny Caknan',
    role: 'mahasiswa_s1',
    identifier: 'NIM. 235090200111010',
    email: 'denny.caknan@student.ub.ac.id',
    avatarText: 'DC',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2021)',
    jabatan: 'Mahasiswa S1 Aktif Semester 7 (Tugas Akhir & KLK)',
    status: 'Aktif',
    tanggalDibuat: '2023-08-20',
    terakhirLogin: 'Hari ini, 09:15 WIB',
    noHp: '0812-3456-7890'
  },
  {
    id: 'usr-011',
    username: '225090207111088',
    password: 'Mhs#2024',
    nama: 'Budi Sugiono',
    role: 'mahasiswa_s1',
    identifier: 'NIM. 225090207111088',
    email: 'budi.sugiono@student.ub.ac.id',
    avatarText: 'BS',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2022)',
    jabatan: 'Mahasiswa S1 Aktif Semester 5 (KLK / PKL)',
    status: 'Aktif',
    tanggalDibuat: '2024-01-10',
    terakhirLogin: 'Hari ini, 09:20 WIB',
    noHp: '0812-9876-5432'
  },
  {
    id: 'usr-012',
    username: '256090200111001',
    password: 'Mhs#2024',
    nama: 'Citra Dewi Wulandari, S.Si.',
    role: 'mahasiswa_s2',
    identifier: 'NIM. 256090200111001',
    email: 'citra.wulandari@student.ub.ac.id',
    avatarText: 'CD',
    unit: 'Program Studi S2 Kimia FMIPA (Angkatan 2025)',
    jabatan: 'Mahasiswa S2 Magister Kimia (Semester 3 - Tesis)',
    status: 'Aktif',
    tanggalDibuat: '2025-08-18',
    terakhirLogin: 'Hari ini, 08:50 WIB',
    noHp: '0821-7788-1122'
  },
  {
    id: 'usr-013',
    username: '257090200111002',
    password: 'Mhs#2024',
    nama: 'Irfan Maulana, M.Si.',
    role: 'mahasiswa_s3',
    identifier: 'NIM. 257090200111002',
    email: 'irfan.maulana@student.ub.ac.id',
    avatarText: 'IM',
    unit: 'Program Studi S3 Kimia FMIPA (Angkatan 2025)',
    jabatan: 'Mahasiswa S3 Doktor Kimia (Semester 3 - Disertasi)',
    status: 'Aktif',
    tanggalDibuat: '2025-08-18',
    terakhirLogin: 'Kemarin, 15:10 WIB',
    noHp: '0813-5566-9900'
  },
  {
    id: 'usr-obama',
    username: '0012141',
    password: 'Mhs#123',
    nama: 'Obama Mandala Putra',
    role: 'mahasiswa_s1',
    identifier: 'NIM. 0012141',
    email: 'obama.mandala@student.ub.ac.id',
    avatarText: 'OM',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2021)',
    jabatan: 'Mahasiswa S1 Aktif Semester 7 (KLK & Skripsi)',
    status: 'Aktif',
    tanggalDibuat: '2026-02-01',
    terakhirLogin: 'Hari ini, 09:00 WIB',
    noHp: '081234567891'
  }
];

export const NIM_NIP_MIGRATION_FLAG = 'sikma_nim_nip_username_migrated_v1';

/**
 * Mengonversi username akun eksisting menjadi NIM (Mahasiswa) atau NIP (Dosen/Admin/PLP).
 * Dikecualikan: super_admin (tetap superadmin) dan eksternal (tetap ID Mitra / username bebas / email).
 */
export const migrateUsernamesToNimNip = (
  users: UserAccountItem[]
): { migrated: UserAccountItem[]; changed: boolean } => {
  let changed = false;
  const migrated = users.map((u) => {
    if (!u || typeof u !== 'object') return u;
    if (u.role === 'super_admin' || u.role === 'eksternal') return u;

    const jabLower = (u.jabatan || '').toLowerCase();
    if (
      jabLower.includes('pembimbing lapangan') ||
      jabLower.includes('pembimbing lapang') ||
      jabLower.includes('mentor')
    ) {
      return u;
    }

    const rawIdentifier = typeof u.identifier === 'string' ? u.identifier.trim() : '';
    if ((u.role === 'dosen' || u.role === 'admin') && rawIdentifier.toUpperCase().startsWith('NIDN')) {
      return u;
    }

    const digits = rawIdentifier.replace(/\D/g, '');
    if (digits.length >= 6 && u.username !== digits) {
      changed = true;
      return {
        ...u,
        username: digits
      };
    }
    return u;
  });

  return { migrated, changed };
};
