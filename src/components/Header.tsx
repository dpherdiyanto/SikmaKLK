import React from 'react';
import { UserRole, AuthUser } from '../types/sikma';
import { UbLogo } from './UbLogo';
import { 
  GraduationCap, 
  FlaskConical, 
  Bell, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  User, 
  ChevronDown,
  LogOut,
  Building2
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onNavigateProfile?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentUser,
  onLogout,
  onNavigateProfile,
  unreadCount = 3
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#002B49] text-white border-b-4 border-[#D4AF37] shadow-md">
      {/* Top micro bar for UB announcement */}
      <div className="bg-[#001D33] px-4 py-1 text-xs text-slate-300 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center text-[#F39C12] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
            SIKMA KIMIA UB v3.1 (CodeIgniter 3 MVC)
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">
            Fakultas Sains, Teknologi, dan Matematika - Universitas Brawijaya Malang
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center text-slate-300">
            <Calendar className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" />
            Semester Ganjil 2026/2027
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 drop-shadow-md">
            <UbLogo className="w-11 h-11" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                SIKMA <span className="text-[#D4AF37]">KIMIA</span> UB
              </h1>
              <span className="text-[10px] uppercase font-bold bg-[#D4AF37] text-slate-950 px-1.5 py-0.5 rounded">
                FSTeM
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium line-clamp-1">
              Sistem Informasi Kegiatan Mahasiswa & Akademik Kimia Universitas Brawijaya
            </p>
          </div>
        </div>

        {/* User Active Role & Profile Widget */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Locked / Read-only Active Role Badge (Sesuai akun login) */}
          <div className="flex items-center bg-[#001D33]/90 rounded-lg px-2.5 py-1.5 border border-white/10 text-xs shadow-inner">
            <span className="text-slate-400 mr-2 font-medium hidden sm:inline">Peran:</span>
            <span
              className={`px-2.5 py-0.5 rounded-md font-bold text-xs inline-flex items-center gap-1.5 shadow-xs ${
                currentRole === 'super_admin'
                  ? 'bg-purple-600 text-white'
                  : currentRole === 'admin'
                  ? 'bg-amber-600 text-white'
                  : currentRole === 'dosen'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {currentRole === 'super_admin' && <ShieldCheck className="w-3.5 h-3.5" />}
              {currentRole === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
              {currentRole === 'dosen' && <GraduationCap className="w-3.5 h-3.5" />}
              {currentRole === 'mahasiswa' && <UserCheck className="w-3.5 h-3.5" />}
              <span>
                {currentRole === 'super_admin'
                  ? 'Super Admin'
                  : currentRole === 'admin'
                  ? 'Admin'
                  : currentRole === 'dosen'
                  ? 'Dosen'
                  : 'Mahasiswa'}
              </span>
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition-colors relative"
              title="Pemberitahuan Sistem SIKMA"
            >
              <Bell className="w-5 h-5 text-slate-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Current User Snapshot */}
          <div className="flex items-center space-x-2 pl-2 border-l border-white/15">
            <button
              type="button"
              onClick={onNavigateProfile}
              title="Klik untuk membuka menu Profile"
              className="flex items-center space-x-2 text-left hover:opacity-90 transition-opacity cursor-pointer group"
            >
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shadow-inner group-hover:ring-2 group-hover:ring-yellow-400 transition-all ${
                currentRole === 'super_admin'
                  ? 'bg-purple-900/60 border-purple-400 text-purple-200'
                  : currentRole === 'admin'
                  ? 'bg-amber-900/60 border-amber-400 text-amber-200'
                  : currentRole === 'dosen'
                  ? 'bg-blue-900/60 border-blue-400 text-blue-200'
                  : 'bg-emerald-900/60 border-emerald-400 text-emerald-200'
              }`}>
                {currentUser?.avatarText || (
                  currentRole === 'super_admin' ? 'SA' :
                  currentRole === 'admin' ? 'AK' :
                  currentRole === 'dosen' ? 'AS' : 'AR'
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5 group-hover:text-yellow-300 transition-colors">
                  <span>
                    {currentUser?.nama || (
                      currentRole === 'super_admin' ? 'Prof. Dr. Hermin Sulistyarti' :
                      currentRole === 'admin' ? 'Biro Administrasi Kimia' :
                      currentRole === 'dosen' ? 'Dr. Sc. Akhmad Sabarudin' :
                      'Ahmad Rizky Pratama'
                    )}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    currentRole === 'super_admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      : currentRole === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : currentRole === 'dosen'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  }`}>
                    {currentRole === 'super_admin' ? 'Super Admin' :
                     currentRole === 'admin' ? 'Admin' :
                     currentRole === 'dosen' ? 'Dosen' : 'Mhs'}
                  </span>
                </div>
                <div className="text-[11px] text-[#D4AF37] flex items-center">
                  {currentUser?.identifier || (
                    currentRole === 'super_admin' ? 'NIP 196403211989032001' :
                    currentRole === 'admin' ? 'NIP 198504122010121004' :
                    currentRole === 'dosen' ? 'NIP 197405102000031002' :
                    'NIM 215090200111012'
                  )}
                </div>
              </div>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                id="header-logout-btn"
                onClick={onLogout}
                title="Keluar / Ganti Akun Login"
                className="ml-2 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-400/30 text-rose-200 hover:text-white transition-all text-xs font-semibold flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
