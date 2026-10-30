import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types/sikma';
import { UbLogo } from './UbLogo';
import {
  User,
  ShieldCheck,
  Building,
  Lock,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  RotateCcw,
  BadgeCheck,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: AuthUser | null;
  currentRole: UserRole;
  onUpdateUser?: (updated: AuthUser) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  currentRole,
  onUpdateUser
}) => {
  // Local state for editable user fields
  const [formData, setFormData] = useState({
    nama: currentUser?.nama || (
      currentRole === 'super_admin' ? 'Prof. Dr. Hermin Sulistyarti' :
      currentRole === 'admin' ? 'Biro Administrasi Kimia' :
      currentRole === 'dosen' ? 'Dr. Sc. Akhmad Sabarudin' :
      'Ahmad Rizky Pratama'
    ),
    username: currentUser?.username || (
      currentRole === 'super_admin' ? 'superadmin_kimia' :
      currentRole === 'admin' ? 'admin_kimia' :
      currentRole === 'dosen' ? 'dosen_sabarudin' :
      'mhs_rizky'
    ),
    identifier: currentUser?.identifier || (
      currentRole === 'super_admin' ? '196403211989032001' :
      currentRole === 'admin' ? '198504122010121004' :
      currentRole === 'dosen' ? '197405102000031002' :
      '215090200111012'
    ),
    email: currentUser?.email || (
      currentRole === 'super_admin' ? 'hermin@ub.ac.id' :
      currentRole === 'admin' ? 'adminkimia@ub.ac.id' :
      currentRole === 'dosen' ? 'sabarudin@ub.ac.id' :
      'ahmad.rizky@student.ub.ac.id'
    ),
    unit: currentUser?.unit || 'Departemen Kimia - FSTeM Universitas Brawijaya',
    jabatan: currentUser?.jabatan || (
      currentRole === 'super_admin' ? 'Koordinator Sistem SIKMA & Guru Besar' :
      currentRole === 'admin' ? 'Staff Administrasi Akademik & Kemahasiswaan' :
      currentRole === 'dosen' ? 'Dosen Pembimbing Akademik / Lektor Kepala' :
      'Mahasiswa Aktif Angkatan 2021'
    ),
    phone: '0812-3456-7890',
    alamat: 'Jl. Veteran No. 12, Lowokwaru, Kota Malang, Jawa Timur 65145',
    bio: 'Pengguna terdaftar sistem informasi terintegrasi SIKMA Departemen Kimia Universitas Brawijaya.'
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active section tab
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'security' | 'role' | 'activity'>('info');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.email.trim()) {
      showNotification('Nama lengkap dan email tidak boleh kosong', 'error');
      return;
    }

    const updatedUser: AuthUser = {
      id: currentUser?.id || `user-${Date.now()}`,
      username: formData.username,
      nama: formData.nama,
      role: currentRole,
      identifier: formData.identifier,
      email: formData.email,
      avatarText: formData.nama
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'UB',
      unit: formData.unit,
      jabatan: formData.jabatan,
      lastLogin: currentUser?.lastLogin || new Date().toISOString()
    };

    localStorage.setItem('sikma_auth_user', JSON.stringify(updatedUser));
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    showNotification('Data Profil berhasil diperbarui!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showNotification('Masukkan kata sandi saat ini', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('Kata sandi baru minimal 6 karakter', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('Konfirmasi kata sandi baru tidak cocok', 'error');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showNotification('Kata sandi berhasil diubah! Kredensial telah diamankan.');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'admin':
        return { label: 'Admin Departemen', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'dosen':
        return { label: 'Dosen Pembimbing', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      default:
        return { label: 'Mahasiswa', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const roleBadge = getRoleBadge(currentRole);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border animate-slideIn ${
            notification.type === 'success'
              ? 'bg-[#002B49] text-white border-yellow-400'
              : 'bg-rose-900 text-white border-rose-400'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header Banner Profil */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003865] to-[#001f35] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-[#D4AF37]/15 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-200 text-[#002B49] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
                {formData.nama
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'UB'}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#002B49] flex items-center justify-center text-white" title="Status Akun Aktif">
                <BadgeCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* User Meta Information */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadge.bg}`}>
                  {roleBadge.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/10">
                  Status: Terverifikasi SSO UB
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {formData.nama}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[#D4AF37] font-bold">
                  {currentRole === 'mahasiswa' ? `NIM: ${formData.identifier}` : `NIP: ${formData.identifier}`}
                </span>
                <span>•</span>
                <span>{formData.email}</span>
                <span>•</span>
                <span>{formData.unit}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-right">
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Tahun Akademik</div>
              <div className="text-xs font-bold text-yellow-300">2026/2027 Ganjil</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('info')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'info'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4 text-yellow-400" />
          <span>Informasi Profil</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4 text-yellow-400" />
          <span>Keamanan &amp; Kata Sandi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('role')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'role'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-yellow-400" />
          <span>Hak Akses &amp; Peran</span>
        </button>

        <button
          onClick={() => setActiveSubTab('activity')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'activity'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-yellow-400" />
          <span>Riwayat Aktivitas</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. INFORMASI PROFIL */}
      {activeSubTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sisi Kiri: Form Informasi Pribadi */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Data Biodata &amp; Akun</h3>
                <p className="text-xs text-slate-500">Perbarui informasi data profil akun SIKMA Anda</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                SSO UB Verified
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Login
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.username}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold bg-slate-100 text-slate-600 cursor-not-allowed"
                    title="Username login sistem terkunci dari SSO"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {currentRole === 'mahasiswa' ? 'NIM' : 'NIP / NIDN'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Resmi UB <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan / Status Fungsional</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Kerja / Fakultas</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Kantor / Domisili di Malang</label>
                <textarea
                  rows={2}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-[#002B49] bg-white text-slate-900 resize-y"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      nama: currentUser?.nama || 'Ahmad Rizky Pratama',
                      username: currentUser?.username || 'mhs_rizky',
                      identifier: currentUser?.identifier || '215090200111012',
                      email: currentUser?.email || 'ahmad.rizky@student.ub.ac.id',
                      unit: currentUser?.unit || 'Departemen Kimia - FSTeM Universitas Brawijaya',
                      jabatan: currentUser?.jabatan || 'Mahasiswa Aktif Angkatan 2021',
                      phone: '0812-3456-7890',
                      alamat: 'Jl. Veteran No. 12, Lowokwaru, Kota Malang, Jawa Timur 65145',
                      bio: 'Pengguna terdaftar sistem informasi terintegrasi SIKMA Departemen Kimia Universitas Brawijaya.'
                    });
                    showNotification('Data dikembalikan ke nilai semula');
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#002B49] hover:bg-[#003865] active:bg-[#001f35] text-white rounded-lg font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4 text-yellow-400" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sisi Kanan: Kartu Ringkasan Akun & Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#002B49]" />
                <span>Informasi Afiliasi</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Institusi</span>
                  <span className="font-bold text-slate-800">Universitas Brawijaya Malang</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Fakultas</span>
                  <span className="font-semibold text-slate-800">Fakultas Sains, Teknologi, dan Matematika (FSTeM)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Departemen</span>
                  <span className="font-semibold text-slate-800">Departemen Kimia</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <UbLogo className="w-5 h-5 shrink-0 object-contain" />
                <span>Status Akun Aktif</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Akun ini telah tersinkronisasi dengan Master Data SIKMA Kimia UB dan berhak mengakses layanan akademik, penelitian laboratorium, dan persuratan sesuai peran yang diberikan.
              </p>
              <div className="pt-2 text-[10px] text-slate-500 font-mono">
                Session ID: UB-SIKMA-{Date.now().toString().slice(-6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. KEAMANAN & PASSWORD */}
      {activeSubTab === 'security' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-500" />
              <span>Ganti Kata Sandi (Password)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola kata sandi akun SIKMA Anda untuk menjaga keamanan data akademik
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kata Sandi Saat Ini <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002B49] bg-white font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Tips Keamanan:</strong> Gunakan kombinasi huruf besar, huruf kecil, angka, dan karakter simbol untuk keamanan optimal. Jangan bagikan kredensial login kepada pihak lain.
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#002B49] hover:bg-[#003865] text-white rounded-lg font-bold shadow flex items-center gap-2 cursor-pointer transition-all"
              >
                <KeyRound className="w-4 h-4 text-yellow-400" />
                <span>Perbarui Kata Sandi</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: 3. HAK AKSES & PERAN */}
      {activeSubTab === 'role' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Matriks Hak Akses &amp; Otoritas Akun</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian hak akses modul sistem yang aktif untuk peran <strong>{roleBadge.label}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Dashboard &amp; Pengumuman</span>
                <span className="text-emerald-700 font-bold">Akses Penuh</span>
              </div>
              <p className="text-[11px] text-slate-500">Melihat statistik portal, pengumuman departemen, dan kalender kegiatan.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Tugas Akhir, Skripsi &amp; Tesis</span>
                <span className="text-emerald-700 font-bold">Akses Penuh</span>
              </div>
              <p className="text-[11px] text-slate-500">Pengajuan judul, seminar proposal, ujian tesis, dan berita acara kelulusan.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Laboratorium &amp; Riset</span>
                <span className="text-emerald-700 font-bold">Akses Terkelola</span>
              </div>
              <p className="text-[11px] text-slate-500">Peminjaman alat, logbook riset, bon bahan, dan permohonan bebas laboratorium.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Manajemen Pengguna &amp; Config</span>
                <span className={currentRole === 'super_admin' || currentRole === 'admin' ? 'text-emerald-700 font-bold' : 'text-slate-400 font-bold'}>
                  {currentRole === 'super_admin' || currentRole === 'admin' ? 'Akses Admin' : 'Hanya Lihat'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Pengaturan role, semester, master data dosen, instansi mitra, dan ruangan.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Layanan Surat &amp; Administrasi</span>
                <span className="text-emerald-700 font-bold">Akses Penuh</span>
              </div>
              <p className="text-[11px] text-slate-500">Pengajuan surat pengantar magang/PKL, surat penelitian, dan verifikasi.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Portal Arsitektur CI3</span>
                <span className="text-emerald-700 font-bold">Tersedia</span>
              </div>
              <p className="text-[11px] text-slate-500">Dokumentasi MVC, controller, model, view, dan source code CodeIgniter 3.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. RIWAYAT AKTIVITAS */}
      {activeSubTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Log Aktivitas Akun SIKMA</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan riwayat akses dan aktivitas terbaru pada sistem SIKMA Kimia UB
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Sesi Login Berhasil (SSO UB)</div>
                <div className="text-slate-500 text-[11px]">Autentikasi akun berhasil melalui browser web terenkripsi</div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Baru saja</span>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Mengakses Modul Data Tesis &amp; Tugas Akhir</div>
                <div className="text-slate-500 text-[11px]">Melihat daftar usulan tesis magister dan formulir data induk S2</div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Hari ini</span>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">Pembaruan Status Verifikasi Dokumen</div>
                <div className="text-slate-500 text-[11px]">Sistem merekam sinkronisasi data tahapan dan kelulusan</div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Kemarin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
