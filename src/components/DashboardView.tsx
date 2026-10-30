import React from 'react';
import {
  Dosen,
  Mahasiswa,
  JadwalSeminar,
  Pengumuman,
  UserRole,
  ActiveTab,
  LogbookLabItem
} from '../types/sikma';
import {
  Users,
  GraduationCap,
  FlaskConical,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileText,
  ChevronRight,
  Award,
  Compass,
  Briefcase
} from 'lucide-react';

interface DashboardViewProps {
  currentRole: UserRole;
  student: Mahasiswa;
  dosenList: Dosen[];
  seminarList: JadwalSeminar[];
  pengumumanList: Pengumuman[];
  logbooks: LogbookLabItem[];
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRole,
  student,
  dosenList,
  seminarList,
  pengumumanList,
  logbooks,
  onNavigate
}) => {
  // Compute stats
  const totalBimbingan = dosenList.reduce((acc, d) => acc + d.jumlahBimbingan, 0);
  const totalKuota = dosenList.reduce((acc, d) => acc + d.kuotaBimbingan, 0);
  const verifiedLogbooks = logbooks.filter((l) => l.statusVerifikasi === 'Disetujui').length;
  const pendingLogbooks = logbooks.filter((l) => l.statusVerifikasi === 'Menunggu Verifikasi').length;

  // Breakdown KBK
  const kbkCounts = {
    Organik: dosenList.filter((d) => d.bidang === 'Kimia Organik').length,
    Anorganik: dosenList.filter((d) => d.bidang === 'Kimia Anorganik').length,
    Analitik: dosenList.filter((d) => d.bidang === 'Kimia Analitik').length,
    Fisik: dosenList.filter((d) => d.bidang === 'Kimia Fisik').length,
    Biokimia: dosenList.filter((d) => d.bidang === 'Biokimia').length
  };

  const skripsiSteps = [
    { label: 'Pengajuan Judul & Lab', status: 'completed' },
    { label: 'Seminar Proposal (Sempro)', status: 'completed' },
    { label: 'Penelitian Laboratorium', status: 'current' },
    { label: 'Seminar Hasil (Semhas)', status: 'upcoming' },
    { label: 'Ujian Skripsi / Sidang', status: 'upcoming' },
    { label: 'Bebas Lab & Yudisium', status: 'upcoming' }
  ];

  return (
    <div className="space-y-6">
      {/* Banner Utama Selamat Datang */}
      <div className="rounded-xl bg-gradient-to-r from-[#002B49] via-[#003865] to-[#001D33] p-6 text-white shadow-sm border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#002B49]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Akademik SIKMA Kimia FSTeM Universitas Brawijaya</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Selamat Datang,{' '}
              <span className="text-[#D4AF37]">
                {currentRole === 'super_admin' && 'Prof. Dr. Dra. Hermin Sulistyarti, M.Si (Ketua Dept)'}
                {currentRole === 'admin' && 'Biro Administrasi & Laboran Kimia UB'}
                {currentRole === 'dosen' && 'Akhmad Sabarudin, Dr.Sc. (Dosen Pembimbing)'}
                {currentRole === 'mahasiswa' && student.nama}
              </span>
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {currentRole === 'super_admin' &&
                'Hak akses Super Admin Departemen Kimia: Pengesahan SK Dosen Pembimbing/Penguji, pemantauan seluruh kegiatan akademik & logbook laboratorium, serta audit sistem.'}
              {currentRole === 'admin' &&
                'Pusat kendali master data dosen Departemen Kimia, penjadwalan ujian sidang, dan legalitas surat akademik.'}
              {currentRole === 'dosen' &&
                'Kelola verifikasi logbook riset laboratorium kimia, kuota bimbingan skripsi, dan penugasan penguji seminar.'}
              {currentRole === 'mahasiswa' &&
                `Anda terdaftar aktif pada Program Studi S1 Kimia semester ${student.semester} dengan status Tugas Akhir di ${student.labPenelitian}.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              id="dash-btn-klk"
              onClick={() => onNavigate('klk')}
              className="px-4 py-2 bg-[#D4AF37] text-[#002B49] rounded-lg text-xs font-bold hover:bg-[#c8961e] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Menu KLK</span>
            </button>
            {currentRole !== 'mahasiswa' && (
              <button
                onClick={() => onNavigate('data-mahasiswa')}
                className="px-4 py-2 bg-[#D4AF37] text-[#002B49] rounded-lg text-xs font-bold hover:bg-[#c49f2e] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <GraduationCap className="w-4 h-4 text-[#002B49]" />
                <span>Data Mahasiswa</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('dosen')}
              className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-semibold hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Data Dosen</span>
            </button>
            <button
              onClick={() => onNavigate('krs-khs')}
              className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-semibold hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>KRS & KHS</span>
            </button>
            <button
              onClick={() => onNavigate('skripsi')}
              className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-semibold hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Skripsi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dosen */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#002B49]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Dosen Kimia
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#002B49]/10 text-[#002B49] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">{dosenList.length}</span>
            <span className="text-xs text-slate-500">Dosen Pengajar</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Organik: {kbkCounts.Organik} | Analitik: {kbkCounts.Analitik}</span>
            <button
              onClick={() => onNavigate('dosen')}
              className="text-[#002B49] font-bold hover:underline"
            >
              Kelola &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Bimbingan Skripsi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#002B49]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bimbingan Skripsi Aktif
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalBimbingan}</span>
            <span className="text-xs text-slate-500">/ {totalKuota} Kuota Dosen</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="w-full bg-slate-100 rounded-full h-1.5 mr-2">
              <div
                className="bg-[#D4AF37] h-1.5 rounded-full"
                style={{ width: `${Math.round((totalBimbingan / totalKuota) * 100)}%` }}
              ></div>
            </div>
            <span className="font-semibold text-slate-700">
              {Math.round((totalBimbingan / totalKuota) * 100)}%
            </span>
          </div>
        </div>

        {/* Card 3: Akademik & IPK */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#002B49]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Indeks Prestasi Kumulatif
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">{student.ipk.toFixed(2)}</span>
            <span className="text-xs text-emerald-600 font-semibold">Skala 4.00 (Cumlaude)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Total: {student.totalSks} SKS Lulus</span>
            <button
              onClick={() => onNavigate('krs-khs')}
              className="text-[#002B49] font-bold hover:underline"
            >
              Transkrip &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Logbook Lab */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#002B49]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Logbook Penelitian Lab
            </span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">{logbooks.length}</span>
            <span className="text-xs text-slate-500">Sesi Tercatat</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-600 font-medium">
              {verifiedLogbooks} Terverifikasi
            </span>
            {pendingLogbooks > 0 && (
              <span className="text-amber-600 font-medium">
                {pendingLogbooks} Menunggu
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alur Skripsi & Tugas Akhir Mahasiswa (Workflow Stepper) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#002B49]" />
              Status Progres Skripsi & Laboratorium Kimia FSTeM UB
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Alur baku Tugas Akhir Departemen Kimia UB mulai dari usulan judul hingga bebas tanggungan laboratorium
            </p>
          </div>
          <button
            onClick={() => onNavigate('skripsi')}
            className="text-xs font-bold text-[#002B49] hover:text-[#D4AF37] flex items-center gap-1 self-start sm:self-center"
          >
            <span>Rincian Berkas Skripsi</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-3">
          {skripsiSteps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'border-[#002B49] bg-[#002B49]/5 shadow-sm ring-2 ring-[#D4AF37]'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center mb-1.5">
                  {isCompleted && (
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                  {isCurrent && (
                    <span className="w-6 h-6 rounded-full bg-[#002B49] text-[#D4AF37] text-xs flex items-center justify-center font-bold animate-pulse">
                      {idx + 1}
                    </span>
                  )}
                  {!isCompleted && !isCurrent && (
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs flex items-center justify-center font-semibold">
                      {idx + 1}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {step.label}
                </div>
                <div className="text-[10px] mt-1 text-slate-500">
                  {isCompleted && 'Selesai disetujui'}
                  {isCurrent && 'Sedang berlangsung'}
                  {!isCompleted && !isCurrent && 'Tahap lanjutan'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Student Active Research Summary */}
        <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Judul Tugas Akhir Disetujui
            </div>
            <div className="text-xs font-semibold text-slate-900 leading-snug">
              &ldquo;{student.judulSkripsi}&rdquo;
            </div>
            <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
              <span>
                <strong>Pembimbing 1:</strong> {student.dosenPembimbing1Nama}
              </span>
              <span>
                <strong>Pembimbing 2:</strong> {student.dosenPembimbing2Nama}
              </span>
              <span>
                <strong>Lab:</strong> {student.labPenelitian}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={() => onNavigate('skripsi')}
              className="px-3.5 py-1.5 rounded-lg bg-[#002B49] text-white text-xs font-semibold hover:bg-[#003865] transition-colors"
            >
              Cek Skripsi
            </button>
            <button
              onClick={() => onNavigate('bebas-lab')}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cek Bebas Lab
            </button>
          </div>
        </div>
      </div>

      {/* 2 Kolom: Agenda Seminar & Pengumuman Kimia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Agenda Seminar / Sidang Terdekat */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5 text-[#002B49]" />
              <h3 className="text-sm font-bold text-slate-900">
                Agenda Seminar & Sidang Kimia UB
              </h3>
            </div>
            <button
              onClick={() => onNavigate('jadwal-seminar')}
              className="text-xs font-semibold text-[#002B49] hover:underline"
            >
              Lihat Kalender &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2 flex-1">
            {seminarList.slice(0, 3).map((sem) => (
              <div key={sem.id} className="py-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sem.jenis === 'Seminar Proposal'
                        ? 'bg-blue-100 text-blue-800'
                        : sem.jenis === 'Seminar Hasil'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {sem.jenis}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {sem.tanggal} | {sem.waktu}
                  </span>
                </div>
                <div className="font-bold text-slate-900 line-clamp-1">{sem.judul}</div>
                <div className="text-slate-500 flex items-center justify-between">
                  <span>
                    Mahasiswa: <strong>{sem.mahasiswaNama}</strong> ({sem.nim})
                  </span>
                  <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                    {sem.ruangan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Pengumuman Terkini Kimia FSTeM UB */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-sm font-bold text-slate-900">
                Pengumuman Departemen Kimia
              </h3>
            </div>
            <button
              onClick={() => onNavigate('pengumuman')}
              className="text-xs font-semibold text-[#002B49] hover:underline"
            >
              Semua Info &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2 flex-1">
            {pengumumanList.map((ann) => (
              <div key={ann.id} className="py-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#002B49]">{ann.penulis}</span>
                  <span className="text-slate-400 text-[11px]">{ann.tanggal}</span>
                </div>
                <div className="font-bold text-slate-900 leading-snug">{ann.judul}</div>
                <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                  {ann.isi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
