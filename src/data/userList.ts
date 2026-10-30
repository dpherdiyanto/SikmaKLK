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
    username: 'hermin.sulistyarti',
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
    username: 'admin',
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
    username: 'laboran.analitik',
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
    username: 'sabarudin',
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
    username: 'anna.safitri',
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
    username: 'masruri',
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
    username: 'mahasiswa',
    password: 'Mhs#2024',
    nama: 'Ahmad Rizky Pratama',
    role: 'mahasiswa',
    identifier: 'NIM. 215090200111012',
    email: 'ahmad.rizky@student.ub.ac.id',
    avatarText: 'AR',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2021)',
    jabatan: 'Mahasiswa Aktif Semester 7 (Tugas Akhir)',
    status: 'Aktif',
    tanggalDibuat: '2023-08-20',
    terakhirLogin: 'Hari ini, 10:05 WIB',
    noHp: '0821-4455-6677'
  },
  {
    id: 'usr-008',
    username: 'dewi.anggraeni',
    password: 'Mhs#2024',
    nama: 'Dewi Ayu Anggraeni',
    role: 'mahasiswa',
    identifier: 'NIM. 215090201111025',
    email: 'dewi.anggraeni@student.ub.ac.id',
    avatarText: 'DA',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2021)',
    jabatan: 'Mahasiswa Aktif Semester 7 (Penelitian Lab)',
    status: 'Aktif',
    tanggalDibuat: '2023-08-20',
    terakhirLogin: 'Kemarin, 11:30 WIB',
    noHp: '0822-6677-8899'
  },
  {
    id: 'usr-009',
    username: 'fajar.hidayat',
    password: 'Mhs#2024',
    nama: 'Fajar Nur Hidayat',
    role: 'mahasiswa',
    identifier: 'NIM. 225090200111044',
    email: 'fajar.hidayat@student.ub.ac.id',
    avatarText: 'FH',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2022)',
    jabatan: 'Mahasiswa Aktif Semester 5 (Praktikum Lanjut)',
    status: 'Aktif',
    tanggalDibuat: '2024-08-15',
    terakhirLogin: '3 hari lalu',
    noHp: '0857-1234-5678'
  },
  {
    id: 'usr-010',
    username: 'denny.caknan',
    password: 'Mhs#2024',
    nama: 'Denny Caknan',
    role: 'mahasiswa',
    identifier: 'NIM. 215090200111012',
    email: 'denny.caknan@student.ub.ac.id',
    avatarText: 'DC',
    unit: 'Program Studi S1 Kimia FMIPA (Angkatan 2021)',
    jabatan: 'Mahasiswa Aktif Semester 7 (Tugas Akhir & KLK)',
    status: 'Aktif',
    tanggalDibuat: '2023-08-20',
    terakhirLogin: 'Hari ini, 09:15 WIB',
    noHp: '0812-3456-7890'
  }
];
