export type BidangKeahlianKimia = 
  | 'Kimia Organik'
  | 'Kimia Anorganik'
  | 'Kimia Analitik'
  | 'Kimia Fisik'
  | 'Biokimia';

export type LabRiset =
  | 'Laboratorium Kimia Organik & Bahan Alam'
  | 'Laboratorium Kimia Anorganik & Material'
  | 'Laboratorium Kimia Analitik & Instrumentasi'
  | 'Laboratorium Kimia Fisik & Elektrokimia'
  | 'Laboratorium Biokimia & Enzim'
  | 'Laboratorium Kimia Lingkungan';

export interface Dosen {
  id: string;
  nip?: string;
  nidn: string;
  nama: string;
  gelar: string;
  bidang: BidangKeahlianKimia;
  lab: LabRiset;
  email: string;
  jabatanAkademik: 'Asisten Ahli' | 'Lektor' | 'Lektor Kepala' | 'Guru Besar (Profesor)';
  status: 'Aktif Mengajar' | 'Tugas Belajar' | 'Cuti Riset';
  kuotaBimbingan: number; // max students
  jumlahBimbingan: number; // current active students
  matakuliah: string[];
  topikRiset: string[];
  ruangKantor: string;
  telepon: string;
}

export interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  angkatan: string;
  programStudi: string;
  dosenPAId: string;
  dosenPANama: string;
  status: 'Aktif' | 'Cuti' | 'Lulus';
  semester: number;
  ipk: number;
  totalSks: number;
  judulSkripsi?: string;
  dosenPembimbing1Id?: string;
  dosenPembimbing1Nama?: string;
  dosenPembimbing2Id?: string;
  dosenPembimbing2Nama?: string;
  tahapSkripsi: 'Belum Mengambil' | 'Pengajuan Judul' | 'Seminar Proposal' | 'Penelitian Laboratorium' | 'Seminar Hasil' | 'Ujian Skripsi' | 'Revisi & Bebas Lab' | 'Selesai / Lulus';
  labPenelitian?: LabRiset;
}

export interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  sifat: 'Wajib' | 'Pilihan';
  kbk: BidangKeahlianKimia | 'Umum';
  dosenPengampu: string;
  ruang: string;
  jadwal: string;
}

export interface NilaiKHS {
  kode: string;
  nama: string;
  sks: number;
  nilaiHuruf: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'E';
  nilaiAngka: number;
  semester: number;
}

export interface LogbookLabItem {
  id: string;
  mahasiswaId: string;
  mahasiswaNama: string;
  nim: string;
  tanggal: string;
  aktivitas: string;
  lab: LabRiset;
  instrumenDigunakan: string[]; // e.g. FTIR, GC-MS, UV-Vis, Sentrifus, Oven Vakum
  bahanKimiaUtama: string;
  hasilDanTemuan: string;
  catatanDosen?: string;
  statusVerifikasi: 'Menunggu Verifikasi' | 'Disetujui' | 'Perlu Perbaikan';
  dosenVerifikator?: string;
  tanggalVerifikasi?: string;
}

export interface JadwalSeminar {
  id: string;
  jenis: 'Seminar Proposal' | 'Seminar Hasil' | 'Ujian Skripsi';
  mahasiswaNama: string;
  nim: string;
  judul: string;
  dosenPembimbing: string;
  dosenPenguji1: string;
  dosenPenguji2: string;
  tanggal: string;
  waktu: string;
  ruangan: string;
  status: 'Terjadwal' | 'Sedang Berlangsung' | 'Selesai' | 'Menunggu Jadwal';
  nilaiAkhir?: number;
}

export interface SuratPengajuan {
  id: string;
  nomorSurat?: string;
  jenis: 'Surat Izin Penelitian Laboratorium' | 'Surat Pengantar PKL/Magang' | 'Surat Keterangan Bebas Lab' | 'Surat Aktif Kuliah';
  mahasiswaId: string;
  mahasiswaNama: string;
  nim: string;
  tujuan: string;
  keperluan: string;
  tanggalPengajuan: string;
  status: 'Diajukan' | 'Diproses Bag. Akademik' | 'Disetujui & Diterbitkan' | 'Ditolak';
  fileDownloadUrl?: string;
}

export interface BebasLabChecklist {
  alatKimiaLengkap: boolean;
  bebasGantiPecah: boolean;
  limbahB3Dibersihkan: boolean;
  logbookDisetujui: boolean;
  sampelSenyawaDisimpan: boolean;
  laboranPemeriksa: string;
  statusBebas: 'Belum Lengkap' | 'Terverifikasi Laboran' | 'Disahkan Kepala Lab';
}

export interface Pengumuman {
  id: string;
  judul: string;
  kategori: 'Akademik' | 'Laboratorium' | 'Skripsi' | 'Beasiswa' | 'Lowongan';
  tanggal: string;
  penulis: string;
  isi: string;
  penting: boolean;
}

export type UserRole = 'super_admin' | 'admin' | 'dosen' | 'mahasiswa';

export interface AuthUser {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  identifier: string;
  email: string;
  avatarText: string;
  unit: string;
  jabatan: string;
  lastLogin?: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'profile'
  | 'permissions'
  | 'config-permissions'
  | 'user'
  | 'config-user'
  | 'semester'
  | 'config-semester'
  | 'instansi'
  | 'config-instansi'
  | 'jajaran'
  | 'config-jajaran'
  | 'ruangan'
  | 'config-ruangan'
  | 'arsip'
  | 'config-arsip'
  | 'dosen'
  | 'data-mahasiswa'
  | 'admin-management'
  | 'plp-management'
  | 'laboratorium'
  | 'data-laboratorium'
  | 'data-alat'
  | 'data-bahan'
  | 'bon-alat'
  | 'bon-bahan'
  | 'krs-khs'
  | 'skripsi'
  | 'tesis'
  | 'alur-skripsi'
  | 'logbook-lab'
  | 'bebas-lab'
  | 'jadwal-seminar'
  | 'layanan-surat'
  | 'permohonan-surat'
  | 'agenda'
  | 'klk'
  | 'pengumuman'
  | 'ci3-architecture';

export interface InstansiItem {
  id: string;
  namaInstansi: string;
  provinsi: string;
  alamat: string;
  email: string;
  namaPimpinan: string;
  noTelpPimpinan: string;
  pks: 'Ya' | 'Tidak';
  status: 'Aktif' | 'Tidak Aktif';
  keterangan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type VisibilitasArsip = 'Public' | 'Private';
export type StatusKategori = 'Aktif' | 'Tidak Aktif';

export interface MasterKategoriArsipItem {
  id: string;
  namaKategori: string;
  status: StatusKategori;
  keterangan?: string;
  jumlahBerkas?: number;
}

export interface KategoriArsipItem {
  id: string;
  namaFile: string;
  kategori: string;
  keterangan: string;
  visibilitas: VisibilitasArsip;
  ukuranFile?: string;
  tipeFile?: 'PDF' | 'DOCX' | 'XLSX' | 'ZIP';
  tanggalUpload?: string;
  pengunggah?: string;
  nomorSurat?: string;
  // optional compatibility fields
  namaKategori?: string;
  status?: 'Aktif' | 'Nonaktif';
  kode?: string;
  jumlahBerkas?: number;
  updatedAt?: string;
}

export interface PejabatJajaranItem {
  id: string;
  jabatan: string;           // Kepala Departemen, Sekretaris Departemen, Ketua Program Studi Sarjana, etc.
  namaPejabat: string;       // e.g. Prof. Dr. Dra. Hermin Sulistyarti, M.Si
  nip: string;               // e.g. 196403211989032001
  email: string;             // e.g. hermin@ub.ac.id
  periode: string;           // e.g. 2023 - 2027
  status: 'Aktif' | 'Nonaktif';
  skPengangkatan?: string;   // e.g. SK Rektor UB No. 1284/UN10/KP/2023
  fotoUrl?: string;
  ruangKantor?: string;
}

export interface SemesterItem {
  id: string;
  namaSemester: string; // e.g. "Ganjil 2023 / 2024"
  tahunAjaran: string;  // e.g. "2023/2024"
  tipe: 'Ganjil' | 'Genap' | 'Antara';
  status: 'Aktif' | 'Arsip' | 'Mendatang';
  tanggalMulai?: string;
  tanggalSelesai?: string;
  keterangan?: string;
}

export type KategoriRuangan = 'Umum' | 'Lab' | 'Khusus' | 'Other';
export type StatusRuangan = 'Aktif' | 'Tidak Aktif';

export interface RuanganItem {
  id: string;
  namaRuangan: string;
  keterangan?: string;
  kapasitas: number; // Jumlah kursi / daya tampung
  kategori: KategoriRuangan; // Umum | Lab | Khusus | Other
  status: StatusRuangan; // Aktif | Tidak Aktif
  lokasiGedung?: string;
  fasilitas?: string[];
}

export type SkemaKLK =
  | 'PKL'
  | 'Magang Berdampak (Prodi)'
  | 'Magang Berdampak (Fakultas)'
  | 'Magang Regular'
  | 'Magang Industri (MBKM)'
  | 'Riset / Penelitian Luar Kampus'
  | 'Studi Independen Bersertifikat'
  | 'Pertukaran Mahasiswa (PMM)'
  | 'Proyek Kemanusiaan / KKN';

export interface LogbookMingguanKLK {
  id: string;
  mingguKe: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  aktivitas: string;
  alatDanMetode: string;
  hasilDanKendala: string;
  statusVerifikasi: 'Menunggu Verifikasi' | 'Disetujui Mentor' | 'Perlu Perbaikan';
  catatanMentor?: string;
  tanggalVerifikasi?: string;
}

export type StatusKLK =
  | 'Diproses'
  | 'Disetujui'
  | 'Ditolak'
  | 'Draft'
  | 'Menunggu Persetujuan Dept'
  | 'Disetujui / Sedang Berjalan'
  | 'Selesai & Dinilai';

export interface PengajuanKLK {
  id: string;
  kodePendaftaran: string;
  mahasiswaId: string;
  mahasiswaNama: string;
  nim: string;
  semester: number;
  namaSemester?: string; // Semester akademik terpilih dari data master Semester (contoh: "Ganjil 2026 / 2027")
  skema: SkemaKLK;
  namaMitra: string;
  alamatMitra: string;
  bidangPekerjaan: string;
  mentorIndustri: string;
  kontakMentor: string;
  noHpMentor?: string;
  emailMentor?: string;
  dosenPembimbingKLK: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  tanggalUjian?: string; // Format: "YYYY-MM-DD" contoh: "2026-07-15"
  pukulUjian?: string; // Format: "HH:mm - HH:mm WIB" contoh: "09:00 - 10:30 WIB"
  ruangUjian?: string; // Nama Ruangan Ujian contoh: "Ruang Seminar & Ujian Skripsi"
  sksDiakui: number;
  mataKuliahKonversi?: string;
  mataKuliahKonversiList?: string[];
  status: StatusKLK;
  nomorSuratTugas?: string;
  nilaiIndustri?: number;
  nilaiDosen?: number;
  nilaiAkhirHuruf?: 'A' | 'B+' | 'B' | 'C+' | 'C';
  logbooks: LogbookMingguanKLK[];
  dokumenLoA?: string;
  dokumenSuratLamaran?: string;
  dokumenProposal?: string;
  dokumenCV?: string;
  dokumenTranskrip?: string;
  laporanAkhir?: string;
}

export interface MitraIndustriKLK {
  id: string;
  nama: string;
  kategori: 'Industri Kimia & Petrokimia' | 'Farmasi & Bioteknologi' | 'Lembaga Riset & Pemerintah' | 'Pangan & FMCG' | 'Laboratorium Pengujian Lingkungan';
  lokasi: string;
  alamat: string;
  deskripsi: string;
  kuotaPerSemester: number;
  kontakHR: string;
  website: string;
}

export interface DokumenPanduanKLK {
  id: string;
  judul: string;
  kategori: 'Pedoman' | 'Formulir' | 'Materi Sosialisasi' | 'Template';
  deskripsi: string;
  ukuranFile: string;
  tanggalUpdate: string;
  tipe: 'PDF' | 'DOCX' | 'PPTX';
}

export interface AdminStaff {
  id: string;
  nip?: string;
  nama: string;
  gelar: string;
  jabatan: string;
  unit: string;
  tupoksi: string[];
  email: string;
  telepon: string;
  ruangKantor: string;
  status: 'Aktif' | 'Cuti' | 'Purna Tugas';
  pendidikanTerakhir: string;
}

export interface PLPStaff {
  id: string;
  nip?: string;
  nama: string;
  gelar: string;
  jenjang: 'PLP Terampil' | 'PLP Mahir' | 'PLP Penyelia' | 'PLP Ahli Pertama' | 'PLP Ahli Muda' | 'PLP Ahli Madya';
  labUtama: LabRiset | string;
  labTambahan?: string[];
  spesialisasiInstrumen: string[];
  tupoksiUtama: string;
  email: string;
  telepon: string;
  ruangLab: string;
  status: 'Aktif' | 'Cuti' | 'Tugas Belajar';
  verifikatorBebasLab: boolean;
}

export interface LabTeamMember {
  nama: string;
  peran: string;
  nipOrIdentifier?: string;
  avatarText?: string;
}

export interface DataLaboratoriumItem {
  id: string;
  kodeLab: string;
  namaLab: string;
  gedungLokasi: string;
  lantai: string;
  kepalaLab: string;
  nipKepalaLab: string;
  koordinatorKompartemen?: string;
  nipKoordinatorKompartemen?: string;
  plpPenanggungJawab: string;
  nipPlp: string;
  team?: LabTeamMember[];
  kapasitasMeja?: number;
  bidangFokus?: string;
  statusOperasional: 'Aktif Beroperasi' | 'Pemeliharaan' | 'Kalibrasi Berkala';
  fasilitas: string[];
  jamOperasional: string;
  kontakLab?: string;
}

export interface DataAlatItem {
  id: string;
  kodeAlat: string;
  namaAlat: string;
  merkTipe: string;
  satuan: string;
  jumlahTotal: number;
  jumlahTerpinjam: number;
  jumlahTersedia: number;
  labId: string;
  namaLab: string;
  kondisi: 'Sangat Baik' | 'Baik' | 'Perlu Kalibrasi' | 'Dalam Perbaikan';
  statusKetersediaan: 'Tersedia' | 'Sedang Dipinjam' | 'Terjadwal';
  tahunPengadaan: number;
  nomorInventarisBmn: string;
  spesifikasiSingkat: string;
  plpPj: string;
  gambarUrl?: string;
  link?: string;
  harga?: number;
  penguranganStock?: 'Ya' | 'Tidak';
  alatSelection?: string;
}

export type StatusPengadaanAlat = 'Draft' | 'Diajukan' | 'Dalam Proses' | 'Disetujui' | 'Selesai' | 'Ditolak';

export interface PengadaanAlatItem {
  id: string;
  judulPengadaan: string;
  tanggalPengadaan: string;
  tanggalDibuat: string;
  status: StatusPengadaanAlat;
  keterangan?: string;
  namaLab?: string;
  anggaranEst?: number;
  // Detail Alat Pengadaan
  alatId?: string; // id alat yang sudah ada atau 'Lainnya'
  namaAlat?: string;
  isAlatBaru?: boolean;
  merk?: string;
  satuan?: string;
  jumlah?: number;
  spesifikasi?: string;
  link?: string;
  harga?: number;
  penguranganStock?: 'Ya' | 'Tidak';
}

export interface DataBahanItem {
  id: string;
  kodeBahan: string;
  namaBahan: string;
  rumusKimia: string;
  casNumber: string;
  grade: 'Pro Analysis (PA)' | 'HPLC Grade' | 'Teknis' | 'Biokimia Grade';
  labId: string;
  namaLab: string;
  stok: number;
  satuan: 'mL' | 'Gram' | 'Kg' | 'Liter' | 'Botol';
  stokMinimum: number;
  statusStok: 'Aman' | 'Menipis' | 'Habis';
  kategoriBahaya: 'Mudah Terbakar' | 'Korosif' | 'Toksik / Beracun' | 'Pengoksidasi' | 'Iritan';
  lokasiPenyimpanan: string;
  merek?: string;
  harga?: number;
  linkRujukan?: string;
  status?: 'Aktif' | 'Tidak Aktif';
}

export type TujuanPeminjamanAlat =
  | 'Penelitian Dosen'
  | 'Proyek Kimia'
  | 'Program Kreatifitas Mahasiswa'
  | 'Penelitian Skripsi'
  | 'Penelitian Tesis'
  | 'Penelitian Disertasi'
  | 'Analisis Sampel'
  | 'Lainnya';

export interface AlatTambahanItem {
  alatId: string;
  namaAlat: string;
  namaLab?: string;
  kondisi?: string;
  tanggalDitambahkan?: string;
}

export interface BonAlatItem {
  id: string;
  nomorBon: string;
  tanggalPengajuan: string;
  namaPeminjam: string;
  namaMahasiswa?: string; // alias for nama peminjam / mahasiswa
  identitasPeminjam: string;
  rolePeminjam: 'mahasiswa' | 'dosen' | 'peneliti' | 'eksternal';
  tipePeminjaman?: 'Internal' | 'Eksternal';
  jabatan?: 'Mahasiswa' | 'Siswa' | 'Staf' | string;
  instansi?: string;
  tujuan?: TujuanPeminjamanAlat | string;
  alatId: string;
  namaAlat: string;
  namaLab: string;
  daftarAlatTambahan?: AlatTambahanItem[];
  tanggalMulai: string;
  tanggalSelesai: string;
  keperluan: string;
  dosenPembimbing?: string;
  status: 'Menunggu Persetujuan' | 'Disetujui PLP' | 'Sedang Dipinjam' | 'Selesai Dikembalikan' | 'Ditolak';
  catatanPeminjaman?: string;
  petugasPenyetuju?: string;
}

export interface BonBahanItem {
  id: string;
  nomorBon: string;
  tanggalPengajuan: string;
  namaPemohon: string;
  identitasPemohon: string;
  rolePemohon: 'mahasiswa' | 'dosen' | 'peneliti';
  namaLab: string;
  daftarBahan: {
    namaBahan: string;
    jumlah: number;
    satuan: string;
  }[];
  keperluan: string;
  dosenPembimbing?: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Telah Diambil' | 'Ditolak';
  tanggalPengambilan?: string;
  petugasPlp?: string;
  catatan?: string;
}

export type RuanganAgenda =
  | 'Ruang Proyek'
  | 'Ruang Sidang 1'
  | 'Ruang Sidang 2'
  | 'Ruang Komputer'
  | 'Ruang Pertemuan'
  | 'Ruang KPS Pasca Sarjana'
  | 'Ruang Dosen KA'
  | 'Ruang Dosen Biokimia';

export type StatusKegiatanAgenda = 'Menunggu Persetujuan' | 'Disetujui' | 'Selesai' | 'Ditolak';

export interface KegiatanAgenda {
  id: string;
  namaKegiatan: string;
  ruangan: RuanganAgenda;
  tanggal: string; // YYYY-MM-DD
  jamMulai: string; // HH.mm format ex: "06.00"
  jamSelesai: string; // HH.mm format ex: "08.15"
  jumlahPeserta: number;
  penanggungJawab?: string;
  status?: StatusKegiatanAgenda;
  penyelenggara?: string;
  keterangan?: string;
  createdAt?: string;
  userId?: string;
  userNama?: string;
}

export type StatusSkripsi = 'Aktif' | 'Gagal' | 'Revisi' | 'Selesai' | 'Menunggu Verifikasi' | 'Pengajuan';

export type StatusValidasiBerkas = 'Setujui' | 'Ditolak' | 'Belum Diverifikasi';

export interface DokumenPendaftaranItem {
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
  isSubmitted: boolean;
  statusValidasi: StatusValidasiBerkas;
  catatanValidasi?: string;
}

export interface BerkasPendaftaranSkripsi {
  formulir: DokumenPendaftaranItem;
  transkrip: DokumenPendaftaranItem;
  krs: DokumenPendaftaranItem;
  fidk: DokumenPendaftaranItem;
}

export interface DokumenSeminarProposalItem {
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
  isSubmitted: boolean;
  statusValidasi?: StatusValidasiBerkas;
  catatanValidasi?: string;
}

export interface BerkasSeminarProposal {
  naskahSeminar: DokumenSeminarProposalItem;
  beritaAcara: DokumenSeminarProposalItem;
}

export interface DokumenYudisiumItem {
  id: string;
  key: string;
  title: string;
  desc: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  isSubmitted: boolean;
  statusValidasi?: StatusValidasiBerkas;
  catatanValidasi?: string;
  fileUrl?: string;
  acceptTypes?: string;
}

export interface PenilaianDosenItem {
  dosenRole: 'Dosen 1' | 'Dosen 2' | 'Dosen 3';
  namaDosen: string;
  nilaiDiskusi: number;
  diskusiMateri?: number;
  diskusiMetodologi?: number;
  diskusiArgumentasi?: number;
  nilaiPresentasiBerkas: number;
  presentasiNaskah?: number;
  presentasiMedia?: number;
  presentasiWaktu?: number;
  nilaiTotal: number;
  catatanSaran: string;
  generatedLink?: string;
}

export interface NilaiSeminarProposal {
  nilaiPembimbing1: number;
  nilaiPembimbing2?: number;
  nilaiPenguji1: number;
  nilaiPenguji2?: number;
  nilaiDosen1?: number;
  nilaiDosen2?: number;
  nilaiDosen3?: number;
  catatanDosen1?: string;
  catatanDosen2?: string;
  catatanDosen3?: string;
  penilaianPerDosen?: PenilaianDosenItem[];
  nilaiAkhir: number;
  grade: string;
  statusKelulusan: 'Lulus' | 'Lulus dengan Catatan Revisi' | 'Mengulang' | 'Belum Dinilai';
  catatanRevisi?: string;
  tanggalPenilaian?: string;
}

export interface DataProposalSeminar {
  tanggal: string; // contoh: "24 Maret 2026"
  jam: string; // rentang waktu, contoh: "09:00 - 11:00 WIB"
  lokasi: string; // contoh: "Ruang Seminar Gedung Kimia Lt. 2 (R. 204)"
  linkDaring: string; // contoh: "https://meet.google.com/kim-prop-ub26"
  dosenPenguji1?: string;
  dosenPenguji2?: string;
  berkasSeminar?: BerkasSeminarProposal;
  nilaiProposal?: NilaiSeminarProposal;
}

export interface SkripsiMahasiswaItem {
  id: string;
  nim: string;
  namaMahasiswa: string;
  bidangMinat: LabRiset;
  rumpunKbk?: BidangKeahlianKimia;
  dosenPembimbing1: string;
  dosenPembimbing2?: string;
  dosenPenguji?: string;
  noHpOrangTua?: string;
  judul: string;
  judulInggris?: string;
  tahapan: 'Mendaftar' | 'Proposal' | 'Kemajuan' | 'Ujian Akhir Skripsi' | Mahasiswa['tahapSkripsi'];
  status: StatusSkripsi;
  semester?: number;
  namaSemester?: string; // Semester akademik terpilih dari database Master Semester (contoh: "Ganjil 2026 / 2027")
  ipk?: number;
  totalSks?: number;
  jumlahSks?: number;
  angkatan?: string;
  labPenelitian?: LabRiset;
  tanggalMulai?: string;
  targetSelesai?: string;
  catatanKemajuan?: string;
  sksNilaiD?: number;
  persentaseNilaiD?: number;
  berkasPendaftaran?: BerkasPendaftaranSkripsi;
  proposal?: DataProposalSeminar;
  // Field tambahan jadwal & evaluasi seminar/ujian
  tanggal?: string;
  jam?: string;
  lokasi?: string;
  linkDaring?: string;
  nilai?: number | string;
  kemajuan?: DataProposalSeminar;
  ujianAkhir?: DataProposalSeminar;
  persyaratanYudisium?: Record<string, DokumenYudisiumItem>;
  bioDataSarjana?: BioDataSarjanaData;
}

export interface BioDataSarjanaData {
  // Box 1: Data Sarjana
  nama: string;
  nim: string;
  programStudi: string;
  nik: string;
  tanggalLahir: string;
  tempatLahir: string;
  jenisKelamin: 'Perempuan' | 'Laki-laki';
  statusPerkawinan: 'Belum Menikah' | 'Menikah' | 'Cerai Hidup' | 'Cerai Mati';
  agama: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Budha' | 'Konghucu';
  alamat: string;
  terminalCutiAkademik: string;
  telepon: string;
  email: string;

  // Box 2: Data Orang Tua
  namaAyah: string;
  pekerjaanAyah: string;
  teleponAyah: string;
  namaIbu: string;
  pekerjaanIbu: string;

  // Box 3: Data Akhir Pendidikan
  tanggalMulaiTA: string;
  tanggalLulus: string;
  dosenPembimbing1: string;
  dosenPembimbing2: string;
  nilaiSkripsi: string;
  predikatLulus: string;
  ipk: string;
  sks: string;
  lamaStudiTahun: string;
  lamaStudiBulan: string;
  lamaStudiHari: string;
  judul: string;
  judulInggris: string;
}

export type TahapanTesis =
  | 'Pengajuan Judul'
  | 'Seminar Proposal'
  | 'Seminar Hasil'
  | 'Publikasi'
  | 'Ujian Tesis'
  | 'Diseminasi Tesis'
  | 'Usulan Tesis'
  | 'Proposal Tesis'
  | 'Penelitian & Kemajuan'
  | 'Seminar Hasil Tesis'
  | 'Ujian Akhir Tesis'
  | 'Revisi & Publikasi'
  | 'Lulus';

export type TesisStatus = 'Disetujui' | 'Menunggu Verifikasi' | 'Ditolak' | 'Aktif' | 'Selesai' | 'Revisi';

export interface TesisMahasiswaItem {
  id: string;
  nim: string;
  namaMahasiswa: string;
  dosenPembimbing: string;
  dosenPembimbing2?: string;
  judul: string;
  judulInggris?: string;
  tahapan: TahapanTesis;
  status?: TesisStatus;
  programStudi?: string;
  semester?: number;
  ipk?: number;
  totalSks?: number;
  bidangMinat?: string;
  tanggalMulai?: string;
  targetSelesai?: string;
  nilai?: string | number;
  lokasi?: string;
  tanggal?: string;
  jam?: string;
  linkDaring?: string;
  catatanKemajuan?: string;
  linkBerkasSeminarProposal?: string;
  beritaAcaraSeminarProposal?: {
    fileName: string;
    fileSize?: string;
    uploadedAt?: string;
    isSubmitted?: boolean;
  };
  dataInduk?: DataIndukMahasiswaS2;
}

export interface DataIndukMahasiswaS2 {
  // Box 1: Data Pribadi
  nama: string;
  nim: string;
  tempatLahir: string;
  tanggalLahir: string;
  agama: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Budha' | 'Khonghucu';
  jenisKelamin: 'Perempuan' | 'Laki-Laki';
  statusPerkawinan: 'Belum Menikah' | 'Menikah' | 'Cerai Hidup' | 'Cerai Mati';
  alamatDiMalang: string;
  namaAyah: string;
  namaIbu: string;
  noKk: string;
  instansiAsal: string;
  linkKorlap: string;

  // Box 2: Riwayat Pendidikan Sarjana
  tahunLulus: string;
  ipk: string;
  sks: string;
  gelar: string;
  programStudiSarjana: string;
  universitas: string;

  // Box 3: Data Akhir Pendidikan
  departemen: string;
  programStudi: string;
  judul: string;
  judulInggris: string;
  dosenPembimbing1: string;
  dosenPembimbing2: string;
}
