import { AdminStaff } from '../types/sikma';

export const INITIAL_ADMIN_LIST: AdminStaff[] = [
  {
    id: 'adm-001',
    nip: '198504122010121004',
    nama: 'Slamet Widodo',
    gelar: 'S.AP., M.AP.',
    jabatan: 'Koordinator Tata Usaha & Pengelola Administrasi Akademik',
    unit: 'Sub-Bagian Akademik & Administrasi Departemen Kimia',
    tupoksi: [
      'Verifikasi berkas yudisium & kelulusan',
      'Pengelolaan pendaftaran ujian skripsi & seminar',
      'Penyusunan jadwal kuliah semester & alokasi ruang kelas',
      'Koordinasi pelaporan PDDIKTI Departemen Kimia'
    ],
    email: 'slamet.akademik@ub.ac.id',
    telepon: '0812-3344-5566',
    ruangKantor: 'Gedung Kimia FMIPA Lt. 1 R.102 (Ruang TU)',
    status: 'Aktif',
    pendidikanTerakhir: 'S2 Magister Administrasi Publik - Universitas Brawijaya'
  },
  {
    id: 'adm-002',
    nip: '198909152015042002',
    nama: 'Retno Wulandari',
    gelar: 'S.Sos.',
    jabatan: 'Staf Persuratan, Kearsipan & Legalisir',
    unit: 'Unit Kearsipan & Layanan Dokumen Kemahasiswaan',
    tupoksi: [
      'Penerbitan surat pengantar riset & izin laboratorium luar',
      'Pelayanan legalisir transkrip nilai & ijazah alumni',
      'Pengarsipan naskah dinas & surat keputusan departemen',
      'Penerbitan surat keterangan mahasiswa aktif'
    ],
    email: 'retno.w@ub.ac.id',
    telepon: '0813-7788-9900',
    ruangKantor: 'Gedung Kimia FMIPA Lt. 1 R.102 (Loket Surat)',
    status: 'Aktif',
    pendidikanTerakhir: 'S1 Ilmu Komunikasi - Universitas Brawijaya'
  },
  {
    id: 'adm-003',
    nip: '199103222018011003',
    nama: 'Fajar Kurniawan',
    gelar: 'S.Kom.',
    jabatan: 'Administrator Sistem Informasi (SIKMA) & Database PDDIKTI',
    unit: 'Unit IT, Sistem Informasi & Pangkalan Data FMIPA',
    tupoksi: [
      'Pengelolaan dan pemeliharaan platform SIKMA Kimia UB',
      'Sinkronisasi KRS, KHS, dan kelulusan ke PDDIKTI',
      'Troubleshooting akun portal dosen, mahasiswa, dan laboran',
      'Backup database berkala dan tata kelola server lokal'
    ],
    email: 'fajar.kurniawan@ub.ac.id',
    telepon: '0815-1122-3344',
    ruangKantor: 'Gedung Kimia FMIPA Lt. 1 R.105 (Pusat IT)',
    status: 'Aktif',
    pendidikanTerakhir: 'S1 Teknik Informatika - Universitas Brawijaya'
  },
  {
    id: 'adm-004',
    nip: '198711082012122001',
    nama: 'Dian Puspitasari',
    gelar: 'S.E., M.M.',
    jabatan: 'Pengelola Keuangan, BMN & Pengadaan Alat Laboratorium',
    unit: 'Sub-Bagian Keuangan & Sarana Prasarana Kimia',
    tupoksi: [
      'Inventarisasi Barang Milik Negara (BMN) instrumen kimia',
      'Pengadaan bahan kimia habis pakai (reagen/solven) praktikum',
      'Administrasi honorarium penguji seminar skripsi & tugas akhir',
      'Pengelolaan anggaran operasional laboratorium riset'
    ],
    email: 'dian.puspitasari@ub.ac.id',
    telepon: '0818-4455-6677',
    ruangKantor: 'Gedung Kimia FMIPA Lt. 1 R.103 (Ruang Keuangan)',
    status: 'Aktif',
    pendidikanTerakhir: 'S2 Magister Manajemen Keuangan - UB'
  },
  {
    id: 'adm-005',
    nip: '199306142020121002',
    nama: 'Hendra Setiawan',
    gelar: 'S.Pd.',
    jabatan: 'Front Office Kemahasiswaan & Reservasi Ruang Sidang',
    unit: 'Layanan Terpadu Satu Pintu (LTSP) Departemen Kimia',
    tupoksi: [
      'Penjadwalan dan booking Ruang Sidang Kimia & Aula',
      'Pelayanan permohonan bebas tanggungan perpustakaan & lab',
      'Informasi beasiswa, lomba keilmiahan, dan seminar nasional',
      'Pemberian kartu akses laboratorium riset mahasiswa tugas akhir'
    ],
    email: 'hendra.setiawan@ub.ac.id',
    telepon: '0819-2233-8899',
    ruangKantor: 'Front Office Gedung Kimia FMIPA Lantai 1',
    status: 'Aktif',
    pendidikanTerakhir: 'S1 Pendidikan Kimia - Universitas Negeri Malang'
  },
  {
    id: 'adm-006',
    nip: '199503142021022001',
    nama: 'Rina Wijayanti',
    gelar: 'A.Md.',
    jabatan: 'Staf Administrasi & Tata Kelola Laboratorium',
    unit: 'Sub-Bagian Sarana & Tata Kelola Lab Kimia',
    tupoksi: [
      'Pencatatan inventaris alat dan bahan kimia',
      'Administrasi logbook dan izin penelitian mahasiswa tugas akhir',
      'Pengelolaan surat bebas tanggungan laboratorium'
    ],
    email: 'rina.wijayanti@ub.ac.id',
    telepon: '0813-9988-7766',
    ruangKantor: 'Gedung Kimia FMIPA Lt. 1 R.106',
    status: 'Aktif',
    pendidikanTerakhir: 'D3 Administrasi Perkantoran - UB'
  },
  {
    id: 'adm-007',
    nip: '199308192020011002',
    nama: 'Ahmad Faisal',
    gelar: 'S.AP.',
    jabatan: 'Staf Administrasi Laboratorium & Layanan Riset',
    unit: 'Sub-Bagian Sarana & Tata Kelola Lab Kimia',
    tupoksi: [
      'Verifikasi permohonan bon alat & bon bahan kimia',
      'Administrasi K3 dan keselamatan laboratorium',
      'Pelaporan penggunaan instrumen laboratorium riset'
    ],
    email: 'ahmad.faisal@ub.ac.id',
    telepon: '0812-4455-6677',
    ruangKantor: 'Gedung Kimia FMIPA Lt. 2 R.207',
    status: 'Aktif',
    pendidikanTerakhir: 'S1 Administrasi Publik - UB'
  }
];
