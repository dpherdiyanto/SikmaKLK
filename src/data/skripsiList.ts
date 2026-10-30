import { SkripsiMahasiswaItem } from '../types/sikma';

export const INITIAL_SKRIPSI_LIST: SkripsiMahasiswaItem[] = [
  {
    id: 'skr-1',
    nim: '215090200111012',
    namaMahasiswa: 'Ahmad Rizky Pratama',
    bidangMinat: 'Laboratorium Kimia Organik & Bahan Alam',
    rumpunKbk: 'Kimia Organik',
    dosenPembimbing1: 'Masruri, S.Si., M.Si., Ph.D',
    dosenPembimbing2: 'Dr. Dra. Hermin Sulistyarti, M.Si',
    judul: 'Isolasi dan Modifikasi Struktur Senyawa Eugenol dari Minyak Atsiri Cengkeh (Syzygium aromaticum) serta Uji Aktivitas Antibakteri terhadap Staphylococcus aureus',
    judulInggris: 'Isolation and Structural Modification of Eugenol Compounds from Clove Essential Oil (Syzygium aromaticum) and Antibacterial Activity Assay against Staphylococcus aureus',
    tahapan: 'Penelitian Laboratorium',
    status: 'Aktif',
    semester: 7,
    namaSemester: 'Ganjil 2026 / 2027',
    ipk: 3.86,
    jumlahSks: 123,
    angkatan: '2021',
    tanggalMulai: '2026-02-15',
    targetSelesai: '2026-12-20',
    totalSks: 123,
    sksNilaiD: 0,
    persentaseNilaiD: 0.0,
    catatanKemajuan: 'Karakterisasi turunan eugenol dengan GC-MS dan FTIR telah selesai 75%, persiapan sintesis tahap akhir.',
    berkasPendaftaran: {
      formulir: {
        fileName: 'Formulir_Pendaftaran_Skripsi_Ahmad_Rizky.pdf',
        fileSize: '412 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-10 09:30',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Formulir usulan penelitian dan persetujuan dosen pembimbing lengkap.'
      },
      transkrip: {
        fileName: 'Transkrip_Akademik_Ahmad_Rizky_Sem1-6.pdf',
        fileSize: '820 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-10 09:35',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Total 123 SKS lulus, IPK 3.86, total nilai D = 0% (< 10%).'
      },
      krs: {
        fileName: 'KRS_Resmi_Semester_7_Ahmad_Rizky.pdf',
        fileSize: '350 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-12 11:15',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Mata kuliah MAK60099 Tugas Akhir / Skripsi (6 SKS) tercantum di KRS.'
      },
      fidk: {
        fileName: 'FIDK_Form_Isian_Departemen_Kimia_UB.pdf',
        fileSize: '510 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-12 11:20',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Formulir Isian Departemen Kimia telah ditandatangani Dosen PA.'
      }
    }
  },
  {
    id: 'skr-2',
    nim: '215090201111024',
    namaMahasiswa: 'Dewi Lestari Kusuma',
    bidangMinat: 'Laboratorium Kimia Anorganik & Material',
    rumpunKbk: 'Kimia Anorganik',
    dosenPembimbing1: 'Dr. Dra. Sri Wardhani, M.Si',
    dosenPembimbing2: 'Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Sc',
    judul: 'Sintesis Nanokomposit Fe3O4@Zeolit Alam Malang sebagai Adsorben Ion Logam Kadmium (Cd2+) pada Limbah Cair Industri Pelapisan Logam',
    judulInggris: 'Synthesis of Fe3O4@Natural Malang Zeolite Nanocomposites as Adsorbents for Cadmium (Cd2+) Metal Ions in Electroplating Industrial Wastewater',
    tahapan: 'Seminar Hasil',
    status: 'Aktif',
    semester: 7,
    namaSemester: 'Ganjil 2026 / 2027',
    ipk: 3.74,
    jumlahSks: 125,
    angkatan: '2021',
    tanggalMulai: '2026-01-10',
    targetSelesai: '2026-10-30',
    totalSks: 125,
    sksNilaiD: 2,
    persentaseNilaiD: 1.6,
    catatanKemajuan: 'Draft naskah seminar hasil telah disetujui kedua pembimbing, menunggu jadwal sidang semhas.',
    berkasPendaftaran: {
      formulir: {
        fileName: 'Formulir_Semhas_Dewi_Lestari.pdf',
        fileSize: '430 KB',
        fileUrl: '#',
        uploadedAt: '2026-08-20 14:10',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Persetujuan semhas dari pembimbing 1 & 2 telah terverifikasi.'
      },
      transkrip: {
        fileName: 'Transkrip_Nilai_Dewi_Lestari_UB.pdf',
        fileSize: '780 KB',
        fileUrl: '#',
        uploadedAt: '2026-08-20 14:15',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Total nilai D = 1.6% (memenuhi syarat kelayakan < 10%).'
      },
      krs: {
        fileName: 'KRS_Semester_Ganjil_Dewi_Lestari.pdf',
        fileSize: '360 KB',
        fileUrl: '#',
        uploadedAt: '2026-08-21 08:30',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Terdaftar aktif KRS semester berjalan.'
      },
      fidk: {
        fileName: 'FIDK_Dewi_Lestari_Kusuma.pdf',
        fileSize: '490 KB',
        fileUrl: '#',
        uploadedAt: '2026-08-21 08:35',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Biodata isian departemen sesuai pedoman.'
      }
    }
  },
  {
    id: 'skr-3',
    nim: '205090200111005',
    namaMahasiswa: 'Bagas Aditya Wicaksono',
    bidangMinat: 'Laboratorium Biokimia & Enzim',
    rumpunKbk: 'Biokimia',
    dosenPembimbing1: 'Dr. Anna Safitri, M.Sc., Ph.D',
    dosenPembimbing2: 'Dr. Arie Srihardyastutie, S.Si., M.Kes',
    judul: 'Imobilisasi Enzim Lipase Termofilik pada Matriks Kitosan-Glutaraldehid untuk Sintesis Biodiesel dari Minyak Jelantah',
    judulInggris: 'Immobilization of Thermophilic Lipase Enzyme onto Chitosan-Glutaraldehyde Matrix for Biodiesel Synthesis from Waste Cooking Oil',
    tahapan: 'Ujian Skripsi',
    status: 'Aktif',
    semester: 9,
    namaSemester: 'Ganjil 2026 / 2027',
    ipk: 3.65,
    jumlahSks: 138,
    angkatan: '2020',
    tanggalMulai: '2025-09-01',
    targetSelesai: '2026-09-30',
    totalSks: 138,
    sksNilaiD: 3,
    persentaseNilaiD: 2.17,
    catatanKemajuan: 'Naskah skripsi lengkap, berkas pendaftaran sidang sarjana telah diverifikasi bagian akademik.',
    berkasPendaftaran: {
      formulir: {
        fileName: 'Form_Pendaftaran_Sidang_Bagas.pdf',
        fileSize: '510 KB',
        fileUrl: '#',
        uploadedAt: '2026-09-02 10:00',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Lengkap dan ditandatangani kedua pembimbing.'
      },
      transkrip: {
        fileName: 'Transkrip_Akhir_Bagas_Aditya.pdf',
        fileSize: '920 KB',
        fileUrl: '#',
        uploadedAt: '2026-09-02 10:05',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: '138 SKS selesai, persentase nilai D 2.17% (lolos syarat < 10%).'
      },
      krs: {
        fileName: 'KRS_Semester_Akhir_Bagas.pdf',
        fileSize: '340 KB',
        fileUrl: '#',
        uploadedAt: '2026-09-03 13:20',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'KRS sah disetujui DPA.'
      },
      fidk: {
        fileName: 'FIDK_Formulir_Bagas_UB.pdf',
        fileSize: '480 KB',
        fileUrl: '#',
        uploadedAt: '2026-09-03 13:25',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Data isian bebas tanggungan dan riwayat studi valid.'
      }
    }
  },
  {
    id: 'skr-4',
    nim: '215090207111018',
    namaMahasiswa: 'Nabila Putri Az-Zahra',
    bidangMinat: 'Laboratorium Kimia Analitik & Instrumentasi',
    rumpunKbk: 'Kimia Analitik',
    dosenPembimbing1: 'Dr. Dra. Hermin Sulistyarti, M.Si',
    dosenPembimbing2: 'Dr. Akhmad Sabarudin, S.Si., M.Sc.',
    judul: 'Pengembangan Metode Flow Injection Analysis (FIA) Spektrofotometri Ramah Lingkungan untuk Penentuan Kadar Nitrit pada Sampel Daging Olahan',
    judulInggris: 'Development of Environmentally Friendly Spectrophotometric Flow Injection Analysis (FIA) Method for Nitrite Determination in Processed Meat Samples',
    tahapan: 'Penelitian Laboratorium',
    status: 'Aktif',
    semester: 7,
    namaSemester: 'Ganjil 2026 / 2027',
    ipk: 3.91,
    jumlahSks: 122,
    angkatan: '2021',
    tanggalMulai: '2026-03-01',
    targetSelesai: '2026-11-15',
    totalSks: 122,
    sksNilaiD: 0,
    persentaseNilaiD: 0.0,
    catatanKemajuan: 'Optimasi reagen griess modifikasi dan laju alir pompa peristaltik sedang berlangsung di lab analitik.',
    berkasPendaftaran: {
      formulir: {
        fileName: 'Formulir_Skripsi_Nabila_Putri.pdf',
        fileSize: '390 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-28 11:00',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Disetujui komisi skripsi dan pembimbing.'
      },
      transkrip: {
        fileName: 'Transkrip_Sementara_Nabila.pdf',
        fileSize: '750 KB',
        fileUrl: '#',
        uploadedAt: '2026-02-28 11:05',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Tidak ada nilai D (0% < 10%).'
      },
      krs: {
        fileName: 'KRS_Nabila_Semester_7.pdf',
        fileSize: '320 KB',
        fileUrl: '#',
        uploadedAt: '2026-03-01 09:10',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'KRS valid terverifikasi Dosen PA.'
      },
      fidk: {
        fileName: 'FIDK_Nabila_Putri_AzZahra.pdf',
        fileSize: '460 KB',
        fileUrl: '#',
        uploadedAt: '2026-03-01 09:15',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Form isian lengkap.'
      }
    }
  },
  {
    id: 'skr-5',
    nim: '215090200111045',
    namaMahasiswa: 'Farhan Maulana Hakim',
    bidangMinat: 'Laboratorium Kimia Fisik & Elektrokimia',
    rumpunKbk: 'Kimia Fisik',
    dosenPembimbing1: 'Dr. rer. nat. Rachmat Triandi Tjahjanto, M.Sc',
    dosenPembimbing2: 'Lukman Hakim, S.Si., M.Sc., Ph.D',
    judul: 'Studi Komputasi DFT dan Uji Elektrokimia Karbon Aktif Tertaut Nitrogen dari Limbah Kulit Kopi untuk Elektroda Superkapasitor',
    judulInggris: 'DFT Computational Study and Electrochemical Evaluation of Nitrogen-Doped Activated Carbon from Coffee Husk Waste for Supercapacitor Electrodes',
    tahapan: 'Seminar Proposal',
    status: 'Aktif',
    semester: 7,
    namaSemester: 'Ganjil 2026 / 2027',
    ipk: 3.58,
    jumlahSks: 118,
    angkatan: '2021',
    tanggalMulai: '2026-04-10',
    targetSelesai: '2027-01-15',
    totalSks: 118,
    sksNilaiD: 3,
    persentaseNilaiD: 2.54,
    catatanKemajuan: 'Proposal riset disetujui, revisi bab 1-3 sesuai masukan penguji seminar proposal selesai.',
    berkasPendaftaran: {
      formulir: {
        fileName: 'Form_Pendaftaran_Sempro_Farhan.pdf',
        fileSize: '440 KB',
        fileUrl: '#',
        uploadedAt: '2026-04-05 13:40',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Persetujuan pembimbing lengkap.'
      },
      transkrip: {
        fileName: 'Transkrip_Farhan_Maulana.pdf',
        fileSize: '790 KB',
        fileUrl: '#',
        uploadedAt: '2026-04-05 13:45',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Persentase nilai D 2.54% (kurang dari 10%).'
      },
      krs: {
        fileName: 'KRS_Farhan_Sem_7.pdf',
        fileSize: '330 KB',
        fileUrl: '#',
        uploadedAt: '2026-04-06 08:00',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'KRS aktif tercantum.'
      },
      fidk: {
        fileName: 'FIDK_Farhan_Maulana.pdf',
        fileSize: '470 KB',
        fileUrl: '#',
        uploadedAt: '2026-04-06 08:05',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Lengkap dan bertandatangan.'
      }
    }
  },
  {
    id: 'skr-6',
    nim: '215090201111088',
    namaMahasiswa: 'Siti Nurhaliza',
    bidangMinat: 'Laboratorium Kimia Lingkungan',
    rumpunKbk: 'Kimia Analitik',
    dosenPembimbing1: 'Dr. Dra. Sri Wardhani, M.Si',
    dosenPembimbing2: 'Moh. Farid Rahman, S.Si., M.Si',
    judul: 'Fotodegradasi Zat Warna Rhodamin B Menggunakan Komposit ZnO-Biochar Berbantuan Sinar Tampak serta Uji Toksisitas Efluen',
    judulInggris: 'Photodegradation of Rhodamine B Dye Using ZnO-Biochar Composite Assisted by Visible Light and Effluent Toxicity Assessment',
    tahapan: 'Pengajuan Judul',
    status: 'Pengajuan',
    semester: 7,
    namaSemester: 'Ganjil 2026 / 2027',
    ipk: 3.42,
    jumlahSks: 115,
    angkatan: '2021',
    tanggalMulai: '2026-08-01',
    targetSelesai: '2027-03-30',
    totalSks: 115,
    sksNilaiD: 4,
    persentaseNilaiD: 3.48,
    catatanKemajuan: 'Formulir pengajuan judul dan persetujuan calon dosen pembimbing menunggu validasi KPS.',
    berkasPendaftaran: {
      formulir: {
        fileName: 'Formulir_Usulan_Judul_Siti.pdf',
        fileSize: '380 KB',
        fileUrl: '#',
        uploadedAt: '2026-08-01 10:20',
        isSubmitted: true,
        statusValidasi: 'Belum Diverifikasi',
        catatanValidasi: 'Menunggu verifikasi bagian akademik departemen.'
      },
      transkrip: {
        fileName: 'Transkrip_Nilai_Siti_Nurhaliza.pdf',
        fileSize: '810 KB',
        fileUrl: '#',
        uploadedAt: '2026-08-01 10:25',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Total nilai D = 3.48% (< 10%).'
      },
      krs: {
        fileName: 'KRS_Siti_Semester_7.pdf',
        fileSize: '310 KB',
        fileUrl: '#',
        uploadedAt: '2026-08-02 09:00',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'KRS telah ditandatangani DPA.'
      },
      fidk: {
        fileName: '',
        fileSize: '',
        fileUrl: '',
        uploadedAt: '',
        isSubmitted: false,
        statusValidasi: 'Belum Diverifikasi',
        catatanValidasi: 'Belum diunggah oleh mahasiswa.'
      }
    }
  },
  {
    id: 'skr-7',
    nim: '205090201111019',
    namaMahasiswa: 'Rizki Dwi Saputra',
    bidangMinat: 'Laboratorium Kimia Organik & Bahan Alam',
    rumpunKbk: 'Kimia Organik',
    dosenPembimbing1: 'Prof. Drs. Sutrisno, M.Si., Ph.D.',
    dosenPembimbing2: 'Elvina Dhiaul Iftitah, S.Si., M.Si.',
    judul: 'Sintesis dan Karakterisasi Hidrogel Berbasis Selulosa Ampas Tebu Tertaut Silang Asam Sitrat sebagai Pembawa Pupuk Urea Lepas Lambat',
    judulInggris: 'Synthesis and Characterization of Sugarcane Bagasse Cellulose-Based Hydrogel Crosslinked with Citric Acid as Slow-Release Urea Fertilizer Carrier',
    tahapan: 'Revisi & Bebas Lab',
    status: 'Revisi',
    semester: 9,
    namaSemester: 'Ganjil 2026 / 2027',
    ipk: 3.39,
    jumlahSks: 140,
    angkatan: '2020',
    tanggalMulai: '2025-08-15',
    targetSelesai: '2026-10-15',
    totalSks: 140,
    sksNilaiD: 6,
    persentaseNilaiD: 4.29,
    catatanKemajuan: 'Ujian skripsi lulus dengan revisi minor, penyelesaian bebas pinjam alat laboratorium.',
    berkasPendaftaran: {
      formulir: {
        fileName: 'Form_Revisi_Bebas_Lab_Rizki.pdf',
        fileSize: '460 KB',
        fileUrl: '#',
        uploadedAt: '2026-09-10 11:00',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Catatan penguji dan pembimbing telah dipenuhi.'
      },
      transkrip: {
        fileName: 'Transkrip_Lengkap_Rizki_Dwi.pdf',
        fileSize: '890 KB',
        fileUrl: '#',
        uploadedAt: '2026-09-10 11:05',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Persentase nilai D 4.29% (memenuhi syarat < 10%).'
      },
      krs: {
        fileName: 'KRS_Rizki_Semester_Akhir.pdf',
        fileSize: '350 KB',
        fileUrl: '#',
        uploadedAt: '2026-09-10 11:10',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'KRS terdaftar.'
      },
      fidk: {
        fileName: 'FIDK_Rizki_Dwi_Saputra.pdf',
        fileSize: '500 KB',
        fileUrl: '#',
        uploadedAt: '2026-09-10 11:15',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Form isian lengkap.'
      }
    }
  },
  {
    id: 'skr-8',
    nim: '205090207111041',
    namaMahasiswa: 'Annisa Tri Wahyuni',
    bidangMinat: 'Laboratorium Biokimia & Enzim',
    rumpunKbk: 'Biokimia',
    dosenPembimbing1: 'Dr. Anna Safitri, M.Sc., Ph.D',
    dosenPembimbing2: 'Sasangka Prasetyawan, M.S.',
    judul: 'Skrining Peptida Bioaktif Penghambat Alpha-Glukosidase dari Ekstrak Tempe Kedelai Hitam Hasil Fermentasi Rhizopus oligosporus',
    judulInggris: 'Screening of Bioactive Peptides with Alpha-Glucosidase Inhibitory Activity from Black Soybean Tempeh Extracts Fermented by Rhizopus oligosporus',
    tahapan: 'Selesai / Lulus',
    status: 'Selesai',
    semester: 8,
    namaSemester: 'Genap 2025 / 2026',
    ipk: 3.95,
    jumlahSks: 144,
    angkatan: '2020',
    tanggalMulai: '2025-03-01',
    targetSelesai: '2026-07-20',
    totalSks: 144,
    sksNilaiD: 0,
    persentaseNilaiD: 0.0,
    catatanKemajuan: 'Yudisium telah tuntas, bebas lab lengkap, publikasi prosiding terindeks telah diunggah.',
    berkasPendaftaran: {
      formulir: {
        fileName: 'Form_Yudisium_Annisa_Tri.pdf',
        fileSize: '520 KB',
        fileUrl: '#',
        uploadedAt: '2026-07-05 09:00',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Lulus dengan predikat Dengan Pujian.'
      },
      transkrip: {
        fileName: 'Transkrip_Kelulusan_Annisa_Tri.pdf',
        fileSize: '950 KB',
        fileUrl: '#',
        uploadedAt: '2026-07-05 09:05',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: '144 SKS lulus tanpa nilai D (0% < 10%).'
      },
      krs: {
        fileName: 'KRS_Kelulusan_Annisa.pdf',
        fileSize: '360 KB',
        fileUrl: '#',
        uploadedAt: '2026-07-05 09:10',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'KRS semester akhir lengkap.'
      },
      fidk: {
        fileName: 'FIDK_Final_Annisa_Tri.pdf',
        fileSize: '510 KB',
        fileUrl: '#',
        uploadedAt: '2026-07-05 09:15',
        isSubmitted: true,
        statusValidasi: 'Setujui',
        catatanValidasi: 'Disahkan ketua departemen.'
      }
    }
  }
];
