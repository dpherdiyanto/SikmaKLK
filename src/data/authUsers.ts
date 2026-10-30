import { AuthUser, UserRole } from '../types/sikma';

export interface PredefinedAccount extends AuthUser {
  passwordHint: string;
  badgeLabel: string;
  badgeColor: string;
  deskripsiPeran: string;
  fiturUtama: string[];
}

export const PREDEFINED_ACCOUNTS: Record<UserRole, PredefinedAccount> = {
  super_admin: {
    id: 'user-superadmin',
    username: 'superadmin',
    nama: 'Zuper Admin',
    role: 'super_admin',
    identifier: 'SA-001',
    email: 'zuperadmin@ub.ac.id',
    avatarText: 'ZA',
    unit: 'Administrator Utama Departemen Kimia FSTeM Universitas Brawijaya',
    jabatan: 'Zuper Administrator Sistem SIKMA',
    passwordHint: 'Super@123',
    badgeLabel: 'Zuper Admin',
    badgeColor: 'bg-purple-700 text-white border-purple-500',
    deskripsiPeran: 'Hak akses tingkat tertinggi: otorisasi SK, penetapan dosen pembimbing/penguji, audit logbook, konfigurasi modul, dan pengawasan departemen.',
    fiturUtama: [
      'Akses Penuh Seluruh Modul & Data Mahasiswa/Dosen',
      'Pengesahan Surat Tugas & Rekomendasi Departemen',
      'Penetapan Dosen Pembimbing & Penguji Seminar',
      'Monitoring Audit Trail & Arsitektur Backend CI3'
    ]
  },
  admin: {
    id: 'user-admin',
    username: 'admin',
    nama: 'Biro Administrasi & Laboran Kimia',
    role: 'admin',
    identifier: 'NIP. 198504122010121004',
    email: 'akademik.kimia@ub.ac.id',
    avatarText: 'AK',
    unit: 'Sub-Bagian Akademik & Layanan Laboratorium Kimia FMIPA UB',
    jabatan: 'Staf Pengelola Berkas & Validasi Akademik',
    passwordHint: 'Admin@123',
    badgeLabel: 'Admin Jurusan',
    badgeColor: 'bg-amber-600 text-white border-amber-500',
    deskripsiPeran: 'Pengelolaan operasional harian: verifikasi layanan surat pengantar/izin lab, validasi bebas lab, input jadwal seminar skripsi, dan pembaruan pengumuman.',
    fiturUtama: [
      'Penerbitan Nomor Surat & Legalisir Digital',
      'Verifikasi Bebas Lab & Checklist Inventaris Instrumen',
      'Penjadwalan Ruang Seminar Skripsi & Undangan',
      'Manajemen Arsip Data KLK dan Dosen Jurusan'
    ]
  },
  dosen: {
    id: 'user-dosen',
    username: 'dosen',
    nama: 'Akhmad Sabarudin, S.Si., M.Sc., Dr.Sc.',
    role: 'dosen',
    identifier: 'NIP. 197405102000031002',
    email: 'sabarudin@ub.ac.id',
    avatarText: 'AS',
    unit: 'Kelompok Bidang Keahlian Kimia Analitik & Instrumentasi',
    jabatan: 'Dosen Pembimbing Utama & Pembimbing Akademik (PA)',
    passwordHint: 'Dosen@123',
    badgeLabel: 'Dosen',
    badgeColor: 'bg-blue-600 text-white border-blue-500',
    deskripsiPeran: 'Pembimbingan riset laboratorium, verifikasi catatan logbook kimia, peninjauan progres skripsi, input nilai ujian seminar, dan evaluasi magang KLK.',
    fiturUtama: [
      'Validasi Catatan Logbook Penelitian & Pemakaian Alat',
      'Pemberian Feedback & Revisi Skripsi Mahasiswa Bimbingan',
      'Penilaian Seminar Proposal, Hasil, & Ujian Skripsi',
      'Persetujuan Rencana Studi KLK & Penilaian Industri'
    ]
  },
  mahasiswa: {
    id: 'user-mhs',
    username: 'mahasiswa',
    nama: 'Ahmad Rizky Pratama',
    role: 'mahasiswa',
    identifier: 'NIM. 215090200111012',
    email: 'ahmad.rizky@student.ub.ac.id',
    avatarText: 'AR',
    unit: 'Program Studi S1 Kimia - Angkatan 2021',
    jabatan: 'Mahasiswa Aktif (Semester 7 - Skripsi & KLK)',
    passwordHint: 'Mhs#2024',
    badgeLabel: 'Mahasiswa',
    badgeColor: 'bg-emerald-600 text-white border-emerald-500',
    deskripsiPeran: 'Pengajuan judul riset skripsi, pengisian logbook harian instrumen lab, pendaftaran kegiatan luar kampus (KLK/MBKM), dan pengajuan surat izin.',
    fiturUtama: [
      'Pencatatan Logbook Laboratorium Kimia & Foto Eksperimen',
      'Pendaftaran & Cetak Form Resmi KLK / PKL Mitra Industri',
      'Pengajuan Surat Izin Penelitian & Permohonan Bebas Lab',
      'Pemantauan Jadwal Seminar Proposal / Ujian Skripsi'
    ]
  }
};
