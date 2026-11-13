import { PembimbingLapanganStaff } from '../types/sikma';

export const INITIAL_PEMBIMBING_LAPANGAN_LIST: PembimbingLapanganStaff[] = [
  {
    id: 'pbl-001',
    idMitra: 'IDP-8829101',
    nama: 'Dr. Hendra Gunawan',
    gelar: 'M.Si.',
    jabatan: 'Pembimbing Lapangan',
    namaMitra: 'PT Pertamina (Persero) RU V Balikpapan',
    email: 'hendra.gunawan@pertamina.com',
    telepon: '0812-9876-5432',
    status: 'Aktif',
    jumlahMahasiswaBimbingan: 2,
    alamatInstansi: 'Balikpapan, Kalimantan Timur',
    username: 'hendra.gunawan'
  },
  {
    id: 'pbl-002',
    idMitra: 'IDP-7721092',
    nama: 'Budi Santoso',
    gelar: 'S.T.',
    jabatan: 'Pembimbing Lapangan',
    namaMitra: 'PT Petrokimia Gresik',
    email: 'budi.santoso@petrokimia.co.id',
    telepon: '0813-4567-8901',
    status: 'Aktif',
    jumlahMahasiswaBimbingan: 1,
    alamatInstansi: 'Gresik, Jawa Timur',
    username: 'budi.santoso'
  }
];
