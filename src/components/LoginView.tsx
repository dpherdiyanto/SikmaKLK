import React, { useState } from 'react';
import { UserRole, AuthUser } from '../types/sikma';
import { PREDEFINED_ACCOUNTS } from '../data/authUsers';
import { UserAccountItem, INITIAL_USER_ACCOUNTS } from '../data/userList';
import { UbLogo } from './UbLogo';
import {
  FlaskConical,
  ShieldCheck,
  Building2,
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  UserPlus
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('mahasiswa');
  const [username, setUsername] = useState<string>(PREDEFINED_ACCOUNTS.mahasiswa.username);
  const [password, setPassword] = useState<string>(PREDEFINED_ACCOUNTS.mahasiswa.passwordHint);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper to load accounts from localStorage (synced with UserConfigView)
  const getUserAccounts = (): UserAccountItem[] => {
    try {
      const saved = localStorage.getItem('sikma_user_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_USER_ACCOUNTS;
  };

  // Switch preset when role changes
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    const accounts = getUserAccounts();
    const matched = accounts.find((a) => a.role === role && a.status === 'Aktif') || accounts.find((a) => a.role === role);
    if (matched) {
      setUsername(matched.username);
      setPassword(matched.password || PREDEFINED_ACCOUNTS[role]?.passwordHint || '123456');
    } else {
      setUsername(PREDEFINED_ACCOUNTS[role].username);
      setPassword(PREDEFINED_ACCOUNTS[role].passwordHint);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const inputUser = username.trim();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setErrorMessage('Silakan masukkan Username / NIM / NIP dan Kata Sandi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const accounts = getUserAccounts();

      // Find user matching username, identifier (NIM/NIP), or email
      const matched = accounts.find((acc) => {
        const u = acc.username.toLowerCase();
        const inputLower = inputUser.toLowerCase();
        const idLower = acc.identifier.toLowerCase();
        const emailLower = acc.email.toLowerCase();

        // Also clean punctuation for NIM/NIP matching
        const cleanId = idLower.replace(/[^a-z0-9]/g, '');
        const cleanInput = inputLower.replace(/[^a-z0-9]/g, '');

        return (
          u === inputLower ||
          idLower === inputLower ||
          (cleanInput.length >= 4 && cleanId.includes(cleanInput)) ||
          emailLower === inputLower
        );
      });

      if (matched) {
        // Status validation
        if (matched.status !== 'Aktif') {
          setErrorMessage(`Akun "${matched.nama}" sedang berstatus ${matched.status}. Silakan hubungi Administrator SIKMA.`);
          return;
        }

        // Password validation
        const expectedPass = matched.password || PREDEFINED_ACCOUNTS[matched.role]?.passwordHint || '123456';
        const fallbackPreset = PREDEFINED_ACCOUNTS[matched.role]?.passwordHint;
        const isPasswordMatch =
          inputPass === expectedPass ||
          (fallbackPreset && inputPass === fallbackPreset) ||
          (matched.role === 'super_admin' && inputPass === 'super123') ||
          (matched.role === 'admin' && inputPass === 'admin123') ||
          (matched.role === 'dosen' && inputPass === 'dosen123') ||
          (matched.role === 'mahasiswa' && inputPass === 'mhs123');

        if (!isPasswordMatch) {
          setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan periksa kembali kata sandi Anda.');
          return;
        }

        // Update stored password to new compliant password if using updated preset
        if (fallbackPreset && inputPass === fallbackPreset && matched.password !== fallbackPreset) {
          matched.password = fallbackPreset;
        }

        // Update login timestamp in stored accounts
        const nowStr = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        const updatedAccounts = accounts.map((item) =>
          item.id === matched.id ? { ...item, terakhirLogin: nowStr } : item
        );
        localStorage.setItem('sikma_user_accounts', JSON.stringify(updatedAccounts));

        // Create AuthUser
        const authUser: AuthUser = {
          id: matched.id,
          username: matched.username,
          nama: matched.nama,
          role: matched.role,
          identifier: matched.identifier,
          email: matched.email,
          avatarText: matched.avatarText,
          unit: matched.unit,
          jabatan: matched.jabatan,
          lastLogin: 'Baru saja'
        };

        onLoginSuccess(authUser);
        return;
      }

      // Check fallback in PREDEFINED_ACCOUNTS
      const predefinedMatch = Object.values(PREDEFINED_ACCOUNTS).find(
        (p) =>
          p.username.toLowerCase() === inputUser.toLowerCase() ||
          p.email.toLowerCase() === inputUser.toLowerCase() ||
          p.identifier.toLowerCase().includes(inputUser.toLowerCase())
      );

      if (predefinedMatch) {
        if (inputPass !== predefinedMatch.passwordHint) {
          setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
          return;
        }

        onLoginSuccess({
          ...predefinedMatch,
          lastLogin: 'Baru saja'
        });
        return;
      }

      // User not found
      setErrorMessage(`Akun dengan ID/Username "${username}" tidak ditemukan. Pastikan akun telah didaftarkan pada Konfigurasi Pengguna SIKMA.`);
    }, 350);
  };

  const handleQuickLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const accounts = getUserAccounts();
      const matched = accounts.find((a) => a.role === role && a.status === 'Aktif') || accounts.find((a) => a.role === role);

      if (matched) {
        const nowStr = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        const updatedAccounts = accounts.map((item) =>
          item.id === matched.id ? { ...item, terakhirLogin: nowStr } : item
        );
        localStorage.setItem('sikma_user_accounts', JSON.stringify(updatedAccounts));

        onLoginSuccess({
          id: matched.id,
          username: matched.username,
          nama: matched.nama,
          role: matched.role,
          identifier: matched.identifier,
          email: matched.email,
          avatarText: matched.avatarText,
          unit: matched.unit,
          jabatan: matched.jabatan,
          lastLogin: nowStr
        });
      } else {
        const user = PREDEFINED_ACCOUNTS[role];
        onLoginSuccess({
          ...user,
          lastLogin: new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })
        });
      }
    }, 300);
  };

  const roleConfigs = [
    {
      role: 'super_admin' as UserRole,
      title: 'Super Admin',
      subtitle: 'Super Admin',
      icon: ShieldCheck,
      color: 'from-purple-600 to-indigo-700',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
      activeBorder: 'border-purple-600 bg-purple-50/50'
    },
    {
      role: 'admin' as UserRole,
      title: 'Admin Jurusan',
      subtitle: 'Akademik & Laboran',
      icon: Building2,
      color: 'from-amber-600 to-orange-700',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      activeBorder: 'border-amber-600 bg-amber-50/50'
    },
    {
      role: 'dosen' as UserRole,
      title: 'Dosen Pembimbing',
      subtitle: 'PA & Penguji Skripsi',
      icon: GraduationCap,
      color: 'from-blue-600 to-sky-700',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      activeBorder: 'border-blue-600 bg-blue-50/50'
    },
    {
      role: 'mahasiswa' as UserRole,
      title: 'Mahasiswa Kimia',
      subtitle: 'S1 Kimia FSTeM',
      icon: User,
      color: 'from-emerald-600 to-teal-700',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      activeBorder: 'border-emerald-600 bg-emerald-50/50'
    }
  ];

  const currentAccount = PREDEFINED_ACCOUNTS[selectedRole];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Banner Bar */}
      <header className="bg-[#002B49] text-white border-b-4 border-[#D4AF37] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 drop-shadow-md">
              <UbLogo className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  SIKMA KLK <span className="text-[#D4AF37]">KIMIA</span> UB
                </span>
                <span className="text-[10px] uppercase font-bold bg-[#D4AF37] text-[#002B49] px-1.5 py-0.5 rounded">
                  FSTeM
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                Sistem Informasi Kegiatan Mahasiswa & Akademik Kimia Universitas Brawijaya
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <span className="hidden md:inline-flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" />
              Semester Ganjil 2026/2027
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Server Aktif
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand & Role Selection Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002B49] tracking-tight leading-tight">
                Selamat Datang di Portal SIKMA KLK Kimia
              </h2>
            </div>

            {/* Role Switcher Cards */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pilih Peran Akun (Role):
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {roleConfigs.map((cfg) => {
                  const Icon = cfg.icon;
                  const isSelected = selectedRole === cfg.role;
                  return (
                    <button
                      key={cfg.role}
                      type="button"
                      id={`select-role-${cfg.role}`}
                      onClick={() => handleSelectRole(cfg.role)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? `${cfg.activeBorder} shadow-md ring-2 ring-offset-1 ring-[#002B49]`
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${cfg.color} shadow-sm`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#002B49]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {cfg.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {cfg.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Box */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Header Box with Role Gradient */}
              <div className="bg-[#002B49] text-white p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                  <FlaskConical className="w-36 h-36 text-white" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#002B49]">
                        Autentikasi {currentAccount.badgeLabel}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1.5">
                      Masuk ke Akun Anda
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Gunakan kredensial akun SSO Universitas Brawijaya
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-[#D4AF37] shadow-inner">
                    {currentAccount.avatarText}
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Active Preset User Preview Banner */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[11px] text-slate-500 font-medium">
                      Pengguna Terpilih:
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      {currentAccount.nama}
                    </div>
                    <div className="text-[11px] text-[#002B49] font-semibold">
                      {currentAccount.identifier}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(selectedRole)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#002B49] text-[#D4AF37] hover:bg-[#003865] transition-colors shadow-sm flex items-center space-x-1"
                  >
                    <span>1-Klik Masuk</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username / NIM / NIP Input */}
                  <div>
                    <label
                      htmlFor="login-username-input"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      {selectedRole === 'mahasiswa'
                        ? 'NIM / Akun Mahasiswa (@student.ub.ac.id)'
                        : selectedRole === 'dosen'
                        ? 'NIP / NIDN / Email UB (@ub.ac.id)'
                        : 'Username / ID Petugas Akademik'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="login-username-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan ID Pengguna..."
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#002B49] focus:border-[#002B49] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="login-password-input"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Kata Sandi (Password)
                      </label>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Demo: <span className="font-semibold text-slate-700">{password || currentAccount.passwordHint}</span>
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-password-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi..."
                        required
                        className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#002B49] focus:border-[#002B49] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Help */}
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-[#002B49] focus:ring-[#002B49]"
                      />
                      <span>Ingat sesi login saya</span>
                    </label>

                    <a
                      href="#bantuan"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(
                          'Untuk bantuan login akun SIKMA Kimia UB, silakan hubungi Biro Akademik FSTeM UB di Gedung Kimia Lantai 1 atau email: akademik.kimia@ub.ac.id'
                        );
                      }}
                      className="text-[#002B49] hover:underline font-medium"
                    >
                      Bantuan Login?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="submit-login-btn"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#002B49] hover:bg-[#001D33] active:scale-[0.99] transition-all shadow-md flex items-center justify-center space-x-2 border border-slate-800 disabled:opacity-75"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 text-[#D4AF37]" />
                        <span>Masuk Sebagai {currentAccount.badgeLabel}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#001D33] text-slate-400 text-xs py-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="text-slate-300 font-semibold">
              SIKMA Kimia FSTeM Universitas Brawijaya
            </span>{' '}
            © {new Date().getFullYear()} - Hak Cipta Dilindungi
          </div>
          <div className="text-[11px] text-slate-400">
            Gedung Jurusan Kimia, Jl. Veteran Malang 65145, Jawa Timur, Indonesia
          </div>
        </div>
      </footer>
    </div>
  );
};
