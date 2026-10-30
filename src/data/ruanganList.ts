import { RuanganItem } from '../types/sikma';

export const INITIAL_RUANGAN_LIST: RuanganItem[] = [
  {
    id: 'ruang-k-1-1',
    namaRuangan: 'Ruang Kuliah K.1.1',
    keterangan: 'Gedung Kimia Lantai 1, proyektor LCD ganda, AC central, dan sound system',
    kapasitas: 60,
    kategori: 'Umum',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 1',
    fasilitas: ['Proyektor LCD', 'AC', 'Sound System', 'Papan Tulis Kaca', 'WiFi UB']
  },
  {
    id: 'ruang-k-2-1',
    namaRuangan: 'Ruang Kuliah K.2.1',
    keterangan: 'Gedung Kimia Lantai 2, kelas multimedia untuk perkuliahan sarjana dan magister',
    kapasitas: 50,
    kategori: 'Umum',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 2',
    fasilitas: ['Proyektor LCD', 'AC', 'Sound System', 'Whiteboard', 'Smart TV']
  },
  {
    id: 'ruang-k-2-2',
    namaRuangan: 'Ruang Kuliah K.2.2',
    keterangan: 'Gedung Kimia Lantai 2, ruang kuliah interaktif dengan meja modular',
    kapasitas: 45,
    kategori: 'Umum',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 2',
    fasilitas: ['Proyektor LCD', 'AC', 'Papan Tulis', 'WiFi UB']
  },
  {
    id: 'lab-analitik',
    namaRuangan: 'Lab. Kimia Analitik & Instrumentasi',
    keterangan: 'Dilengkapi Spektrofotometer UV-Vis, AAS, HPLC, GC-MS, dan lemari asam berfilter',
    kapasitas: 30,
    kategori: 'Lab',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 1 (Sayap Barat)',
    fasilitas: ['AAS', 'HPLC', 'UV-Vis', 'Lemari Asam', 'Safety Shower', 'APAR']
  },
  {
    id: 'lab-organik',
    namaRuangan: 'Lab. Kimia Organik & Bahan Alam',
    keterangan: 'Fasilitas sintesis organik, ekstraksi soklet, rotary evaporator, dan destilasi bertingkat',
    kapasitas: 30,
    kategori: 'Lab',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 2 (Sayap Timur)',
    fasilitas: ['Rotary Evaporator', 'Lemari Asam', 'Oven Vakum', 'Safety Shower', 'P3K']
  },
  {
    id: 'lab-biokimia',
    namaRuangan: 'Lab. Biokimia & Bioteknologi',
    keterangan: 'Fasilitas elektroforesis gel, inkubator shaker, sentrifus dingin, dan autoklaf steril',
    kapasitas: 25,
    kategori: 'Lab',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 2 (Sayap Barat)',
    fasilitas: ['Centrifuge Dingin', 'Inkubator Shaker', 'Elektroforesis', 'Freezer -20C', 'Biosafety Cabinet']
  },
  {
    id: 'lab-anorganik',
    namaRuangan: 'Lab. Kimia Anorganik & Material',
    keterangan: 'Fasilitas sintesis nanomaterial, furnace suhu tinggi 1200C, dan ball mill',
    kapasitas: 25,
    kategori: 'Lab',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 1 (Sayap Timur)',
    fasilitas: ['Furnace 1200C', 'Ultrasonikator', 'Centrifuge', 'Oven', 'Timbangan Analitik Presisi']
  },
  {
    id: 'lab-fisik',
    namaRuangan: 'Lab. Kimia Fisik & Komputasi',
    keterangan: 'Workstation komputasi kimia (Gaussian, ORCA, AutoDock), potensiostat, dan konduktometer',
    kapasitas: 20,
    kategori: 'Lab',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 3',
    fasilitas: ['High-Performance PC Cluster', 'Potensiostat Galvano', 'Refraktometer Abbe', 'AC 2 PK']
  },
  {
    id: 'ruang-sidang-jurusan',
    namaRuangan: 'Ruang Sidang Jurusan Kimia',
    keterangan: 'Ruang rapat pimpinan departemen, rapat senat jurusan, dan evaluasi kurikulum',
    kapasitas: 35,
    kategori: 'Khusus',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 2',
    fasilitas: ['Meja Konferensi U-Shape', 'Sistem Video Conference Zoom Room', 'Smart TV 75 Inch', 'AC Sentral']
  },
  {
    id: 'ruang-seminar-skripsi',
    namaRuangan: 'Ruang Seminar & Ujian Skripsi',
    keterangan: 'Ruang presentasi seminar proposal, seminar hasil, dan ujian komprehensif skripsi',
    kapasitas: 20,
    kategori: 'Khusus',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 2 (Ruang 204)',
    fasilitas: ['Podium Presenter', 'Proyektor Resolusi Tinggi', 'Mic Dosen Penguji', 'AC']
  },
  {
    id: 'ruang-pimpinan-dept',
    namaRuangan: 'Ruang Pimpinan Departemen Kimia',
    keterangan: 'Ruang kerja Ketua Departemen, Sekretaris Departemen, dan tamu kehormatan',
    kapasitas: 12,
    kategori: 'Khusus',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 2',
    fasilitas: ['Ruang Tamu Eksekutif', 'Meja Rapat Terbatas', 'AC', 'Penyimpanan Arsip Resmi']
  },
  {
    id: 'ruang-komisi-etik',
    namaRuangan: 'Ruang Komisi Etik & Mutu Kimia',
    keterangan: 'Ruang verifikasi keselamatan kerja kimia, etika riset, dan audit mutu internal (sementara renovasi)',
    kapasitas: 10,
    kategori: 'Khusus',
    status: 'Tidak Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 3',
    fasilitas: ['Meja Kerja', 'Rak Dokumen Akreditasi', 'Whiteboard']
  },
  {
    id: 'ruang-baca-perpustakaan',
    namaRuangan: 'Ruang Baca & Perpustakaan Kimia',
    keterangan: 'Pusat referensi jurnal internasional, buku teks kimia, tesis, dan skripsi cetak',
    kapasitas: 25,
    kategori: 'Other',
    status: 'Aktif',
    lokasiGedung: 'Gedung Kimia FMIPA Lt. 2 (Sayap Selatan)',
    fasilitas: ['Komputer Akses ScienceDirect', 'Meja Baca Mandiri', 'Rak Skripsi & Tesis', 'AC', 'WiFi Cepat']
  },
  {
    id: 'ruang-himaki',
    namaRuangan: 'Ruang Himpunan Mahasiswa Kimia (HIMAKI)',
    keterangan: 'Sekretariat kegiatan kemahasiswaan, ormawa, dan koordinasi kepanitiaan kimia',
    kapasitas: 15,
    kategori: 'Other',
    status: 'Aktif',
    lokasiGedung: 'Gedung Ormawa FMIPA UB',
    fasilitas: ['Meja Rapat Mahasiswa', 'Papan Pengumuman Ormawa', 'Lemari Inventaris']
  },
  {
    id: 'gudang-bahan-kimia',
    namaRuangan: 'Gudang Bahan Kimia & Pengelolaan Limbah B3',
    keterangan: 'Tempat penyimpanan reagen pekat dan transit drum limbah B3 berstandar K3L',
    kapasitas: 6,
    kategori: 'Other',
    status: 'Aktif',
    lokasiGedung: 'Basement Gedung Kimia FMIPA (Akses Terbatas)',
    fasilitas: ['Exhaust K3L', 'Eye Washer Darurat', 'Bak Penampung Tumpahan', 'Kunci Akses Khusus Petugas']
  }
];
