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
    username: '198504122010121004',
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
    username: '197405102000031002',
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
  mahasiswa_s1: {
    id: 'user-mhs',
    username: '215090200111012',
    nama: 'Ahmad Rizky Pratama',
    role: 'mahasiswa_s1',
    identifier: 'NIM. 215090200111012',
    email: 'ahmad.rizky@student.ub.ac.id',
    avatarText: 'AR',
    unit: 'Program Studi S1 Kimia - Angkatan 2021',
    jabatan: 'Mahasiswa S1 Aktif (Semester 7 - Skripsi & KLK)',
    passwordHint: 'Mhs#2024',
    badgeLabel: 'Mahasiswa S1',
    badgeColor: 'bg-emerald-600 text-white border-emerald-500',
    deskripsiPeran: 'Pengajuan judul riset skripsi S1, pengisian logbook harian instrumen lab, pendaftaran kegiatan luar kampus (KLK/MBKM), dan pengajuan surat izin.',
    fiturUtama: [
      'Pencatatan Logbook Laboratorium Kimia & Foto Eksperimen',
      'Pendaftaran & Cetak Form Resmi KLK / PKL Mitra Industri',
      'Pengajuan Surat Izin Penelitian & Permohonan Bebas Lab',
      'Pemantauan Jadwal Seminar Proposal / Ujian Skripsi S1'
    ]
  },
  mahasiswa_s2: {
    id: 'user-mhs-s2',
    username: '256090200111001',
    nama: 'Citra Dewi Wulandari, S.Si.',
    role: 'mahasiswa_s2',
    identifier: 'NIM. 256090200111001',
    email: 'citra.wulandari@student.ub.ac.id',
    avatarText: 'CD',
    unit: 'Program Studi S2 Kimia - Angkatan 2025',
    jabatan: 'Mahasiswa S2 Magister Kimia (Semester 3 - Tesis)',
    passwordHint: 'Mhs#2024',
    badgeLabel: 'Mahasiswa S2',
    badgeColor: 'bg-teal-600 text-white border-teal-500',
    deskripsiPeran: 'Pengajuan topik & pembimbing tesis magister S2, pengisian logbook penelitian laboratorium lanjutan, peminjaman instrumen analitik, dan seminar hasil tesis.',
    fiturUtama: [
      'Pengajuan Judul Tesis S2 & Penetapan Komisi Pembimbing',
      'Pencatatan Logbook Riset Magister & Bon Instrumen Lab',
      'Pengajuan Surat Izin Penelitian Tesis & Bebas Lab',
      'Pemantauan Jadwal Seminar Proposal & Sidang Tesis S2'
    ]
  },
  mahasiswa_s3: {
    id: 'user-mhs-s3',
    username: '257090200111002',
    nama: 'Irfan Maulana, M.Si.',
    role: 'mahasiswa_s3',
    identifier: 'NIM. 257090200111002',
    email: 'irfan.maulana@student.ub.ac.id',
    avatarText: 'IM',
    unit: 'Program Studi S3 Kimia - Angkatan 2025',
    jabatan: 'Mahasiswa S3 Doktor Kimia (Semester 3 - Disertasi)',
    passwordHint: 'Mhs#2024',
    badgeLabel: 'Mahasiswa S3',
    badgeColor: 'bg-cyan-700 text-white border-cyan-500',
    deskripsiPeran: 'Pengajuan riset disertasi doktor S3, logbook riset laboratorium terintegrasi, peminjaman alat dan reagen khusus, serta layanan surat akademik pascasarjana.',
    fiturUtama: [
      'Pengajuan Riset Disertasi S3 & Konsultasi Promotor',
      'Pencatatan Logbook Riset Doktor & Bon Alat / Bahan Kimia',
      'Pengajuan Surat Tugas Riset & Rekomendasi Publikasi',
      'Pemantauan Jadwal Ujian Kualifikasi & Sidang Disertasi'
    ]
  },
  eksternal: {
    id: 'user-pbl-1',
    username: 'pembimbing.pbl',
    nama: 'Dra. Tri Astuti, M.Si',
    role: 'eksternal',
    identifier: 'IDP-8829101',
    email: 'tri.astuti@petrokimia-gresik.com',
    avatarText: 'TA',
    unit: 'PT Petrokimia Gresik (Persero)',
    jabatan: 'Pembimbing Lapangan & Mentor KLK',
    passwordHint: 'Pembimbing@123',
    badgeLabel: 'User Eksternal',
    badgeColor: 'bg-amber-600 text-white border-amber-500',
    deskripsiPeran: 'Otorisasi Pembimbing Lapangan / Mentor Mitra Industri KLK: Verifikasi logbook mingguan mahasiswa magang di industri, evaluasi kinerja lapangan, dan penginputan nilai evaluasi industri.',
    fiturUtama: [
      'Akses Otorisasi Khusus Tab Aktivitas Pembimbing Lapangan',
      'Verifikasi Logbook Mingguan Mahasiswa KLK di Industri',
      'Pemberian Catatan & Feedback Kinerja Lapangan',
      'Penginputan Nilai Evaluasi Lapangan (Nilai Industri)'
    ]
  }
};
