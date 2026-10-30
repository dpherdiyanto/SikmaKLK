import React, { useState } from 'react';
import { ActiveTab, UserRole } from '../types/sikma';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FlaskConical,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  FileText,
  Briefcase,
  BellRing,
  Code2,
  ChevronRight,
  ChevronDown,
  Settings,
  UserCheck,
  User,
  CalendarDays,
  Award,
  DoorOpen,
  UserCog,
  Microscope,
  Building2,
  TestTube2,
  ClipboardList,
  FileSpreadsheet,
  Archive,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentRole: UserRole;
  dosenCount: number;
  pendingLogbooksCount: number;
  adminCount?: number;
  plpCount?: number;
  mahasiswaCount?: number;
}

interface SubMenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  allowedRoles?: UserRole[];
}

interface MenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  section: string;
  children?: SubMenuItem[];
  allowedRoles?: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  dosenCount,
  pendingLogbooksCount,
  adminCount,
  plpCount,
  mahasiswaCount
}) => {
  // Track open state for collapsible parent menus like Config and Laboratorium
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'config-user': true,
    'laboratorium': true
  });

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard SIKMA',
      icon: LayoutDashboard,
      section: 'Utama'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      section: 'Profile'
    },
    {
      id: 'config-user',
      label: 'Config',
      icon: Settings,
      section: 'Config',
      children: [
        {
          id: 'permissions',
          label: 'Permissions',
          icon: Shield,
          badge: 'RBAC',
          badgeColor: 'bg-indigo-100 text-indigo-800',
          allowedRoles: ['super_admin', 'admin']
        },
        {
          id: 'user',
          label: 'User',
          icon: UserCheck,
          badge: '4 Role',
          badgeColor: 'bg-purple-100 text-purple-800',
          allowedRoles: ['super_admin', 'admin', 'dosen']
        },
        {
          id: 'semester',
          label: 'Semester',
          icon: CalendarDays,
          badge: '2023–2031',
          badgeColor: 'bg-amber-100 text-amber-800',
          allowedRoles: ['super_admin', 'admin', 'dosen']
        },
        {
          id: 'instansi',
          label: 'Instansi',
          icon: Building2,
          badge: 'Mitra',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          allowedRoles: ['super_admin', 'admin', 'dosen']
        },
        {
          id: 'jajaran',
          label: 'Jajaran',
          icon: Award,
          badge: 'Pimpinan',
          badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
          id: 'ruangan',
          label: 'Ruangan',
          icon: DoorOpen,
          badge: 'Fasilitas',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          allowedRoles: ['super_admin', 'admin', 'dosen']
        }
      ]
    },
    {
      id: 'arsip',
      label: 'Arsip',
      icon: Archive,
      badge: 'Kategori',
      badgeColor: 'bg-teal-100 text-teal-800',
      section: 'Config',
      allowedRoles: ['super_admin', 'admin', 'dosen']
    },
    {
      id: 'dosen',
      label: 'Manajemen Data Dosen',
      icon: Users,
      badge: dosenCount,
      badgeColor: 'bg-[#002B49] text-[#D4AF37]',
      section: 'Sumber Daya Manusia'
    },
    {
      id: 'data-mahasiswa',
      label: 'Data Mahasiswa',
      icon: GraduationCap,
      badge: mahasiswaCount,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      section: 'Sumber Daya Manusia',
      allowedRoles: ['super_admin', 'admin', 'dosen']
    },
    {
      id: 'admin-management',
      label: 'Manajemen Data Admin',
      icon: UserCog,
      badge: adminCount,
      badgeColor: 'bg-indigo-100 text-indigo-800',
      section: 'Sumber Daya Manusia'
    },
    {
      id: 'plp-management',
      label: 'Data Manajemen PLP',
      icon: Microscope,
      badge: plpCount,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      section: 'Sumber Daya Manusia'
    },
    {
      id: 'laboratorium',
      label: 'Laboratorium',
      icon: FlaskConical,
      section: 'Laboratorium',
      children: [
        {
          id: 'data-laboratorium',
          label: 'Data Laboratorium',
          icon: Building2
        },
        {
          id: 'data-alat',
          label: 'Data Alat',
          icon: Microscope,
          allowedRoles: ['super_admin', 'admin', 'dosen']
        },
        {
          id: 'data-bahan',
          label: 'Data Bahan',
          icon: TestTube2,
          allowedRoles: ['super_admin', 'admin', 'dosen']
        },
        {
          id: 'bon-alat',
          label: 'Bon Alat',
          icon: ClipboardList
        },
        {
          id: 'bon-bahan',
          label: 'Bon Bahan',
          icon: FileSpreadsheet
        }
      ]
    },
    {
      id: 'permohonan-surat',
      label: 'Permohonan Surat',
      icon: FileText,
      section: 'Akademik Mahasiswa'
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: CalendarDays,
      section: 'Akademik Mahasiswa'
    },
    {
      id: 'klk',
      label: 'KLK (Kegiatan Luar Kampus)',
      icon: Briefcase,
      section: 'Akademik Mahasiswa'
    },
    {
      id: 'skripsi',
      label: 'Skripsi',
      icon: BookOpen,
      badge: 'Tugas Akhir',
      badgeColor: 'bg-blue-100 text-blue-800',
      section: 'Akademik Mahasiswa'
    },
    {
      id: 'tesis',
      label: 'Tesis',
      icon: GraduationCap,
      badge: 'S2 Magister',
      badgeColor: 'bg-amber-100 text-amber-900',
      section: 'Akademik Mahasiswa'
    },
    {
      id: 'krs-khs',
      label: 'KRS & Transkrip Nilai',
      icon: GraduationCap,
      section: 'Akademik Mahasiswa'
    },
    {
      id: 'alur-skripsi',
      label: 'Alur Skripsi & Tugas Akhir',
      icon: BookOpen,
      section: 'Tugas Akhir & Lab'
    },
    {
      id: 'logbook-lab',
      label: 'Logbook Riset Lab Kimia',
      icon: FlaskConical,
      badge: pendingLogbooksCount > 0 ? `${pendingLogbooksCount} Pending` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      section: 'Tugas Akhir & Lab'
    },
    {
      id: 'bebas-lab',
      label: 'Bebas Laboratorium',
      icon: FileCheck2,
      section: 'Tugas Akhir & Lab'
    },
    {
      id: 'jadwal-seminar',
      label: 'Jadwal Seminar & Sidang',
      icon: CalendarCheck,
      section: 'Jadwal & Layanan'
    },
    {
      id: 'layanan-surat',
      label: 'Layanan Surat & Izin',
      icon: FileText,
      section: 'Jadwal & Layanan'
    },
    {
      id: 'pengumuman',
      label: 'Pengumuman Kimia UB',
      icon: BellRing,
      section: 'Informasi'
    },
    {
      id: 'ci3-architecture',
      label: 'Arsitektur CodeIgniter 3',
      icon: Code2,
      badge: 'CI3 MVC',
      badgeColor: 'bg-red-100 text-red-700 font-mono',
      section: 'Developer Portal'
    }
  ];

  // Group items by section
  const sections = Array.from(new Set(menuItems.map((item) => item.section)));

  return (
    <aside className="w-full lg:w-64 xl:w-72 bg-white border-r border-slate-200 flex-shrink-0 shadow-xs flex flex-col">
      {/* Student/Dosen/Admin Status Pill inside Sidebar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-[#002B49] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            UB
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 leading-none truncate">
              Departemen Kimia
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  currentRole === 'super_admin'
                    ? 'bg-purple-100 text-purple-800'
                    : currentRole === 'admin'
                    ? 'bg-amber-100 text-amber-800'
                    : currentRole === 'dosen'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentRole === 'super_admin'
                  ? 'Super Admin'
                  : currentRole === 'admin'
                  ? 'Admin Dept'
                  : currentRole === 'dosen'
                  ? 'Dosen PA'
                  : 'Mahasiswa'}
              </span>
              <span className="text-[10px] text-slate-400">FSTeM UB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
        {sections.map((secName) => {
          const items = menuItems
            .filter((i) => i.section === secName)
            .filter((i) => !i.allowedRoles || i.allowedRoles.includes(currentRole))
            .filter((i) => {
              if (i.children && i.children.length > 0) {
                return i.children.some((c) => !c.allowedRoles || c.allowedRoles.includes(currentRole));
              }
              return true;
            });

          if (items.length === 0) return null;

          return (
            <div key={secName} className="space-y-1">
              <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {secName}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isChildActive =
                  hasChildren &&
                  item.children?.some(
                    (c) =>
                      (!c.allowedRoles || c.allowedRoles.includes(currentRole)) &&
                      (activeTab === c.id || (c.id === 'permissions' && activeTab === 'config-permissions'))
                  );
                const isActive =
                  activeTab === item.id ||
                  isChildActive ||
                  (item.id === 'arsip' && activeTab === 'config-arsip');
                const isOpen = !!openMenus[item.id];

                if (hasChildren) {
                  return (
                    <div key={item.id} className="space-y-1">
                      {/* Parent Menu (e.g. Config) */}
                      <button
                        id={`nav-btn-${item.id}`}
                        onClick={() => {
                          toggleMenu(item.id);
                          // Navigate to first visible child if neither child is active
                          const visibleChildren = item.children?.filter(
                            (c) => !c.allowedRoles || c.allowedRoles.includes(currentRole)
                          );
                          if (!isChildActive && visibleChildren && visibleChildren[0]) {
                            onTabChange(visibleChildren[0].id);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#002B49]/90 text-white shadow-sm font-semibold'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? 'text-[#D4AF37]' : 'text-slate-500'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {item.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                isActive ? 'bg-[#D4AF37] text-[#002B49]' : item.badgeColor
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Submenu Items (e.g. User under Config) */}
                      {isOpen && (
                        <div className="ml-3 pl-3 border-l-2 border-slate-200 space-y-1 pt-0.5">
                          {item.children
                            ?.filter((child) => !child.allowedRoles || child.allowedRoles.includes(currentRole))
                            .map((child) => {
                            const ChildIcon = child.icon;
                            const isChildSelected =
                              activeTab === child.id ||
                              (activeTab === 'laboratorium' && child.id === 'data-laboratorium') ||
                              (activeTab === 'config-permissions' && child.id === 'permissions') ||
                              (activeTab === 'config-user' && child.id === 'user') ||
                              (activeTab === 'config-semester' && child.id === 'semester') ||
                              (activeTab === 'config-instansi' && child.id === 'instansi') ||
                              (activeTab === 'config-jajaran' && child.id === 'jajaran') ||
                              (activeTab === 'config-ruangan' && child.id === 'ruangan');
                            return (
                              <button
                                key={child.id}
                                id={`nav-btn-${child.id}`}
                                onClick={() => onTabChange(child.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                  isChildSelected
                                    ? 'bg-[#002B49] text-white font-semibold shadow-xs ring-1 ring-[#D4AF37]/40'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <ChildIcon
                                    className={`w-3.5 h-3.5 ${
                                      isChildSelected ? 'text-[#D4AF37]' : 'text-slate-500'
                                    }`}
                                  />
                                  <span>{child.label}</span>
                                </div>

                                {child.badge && (
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                                      isChildSelected
                                        ? 'bg-[#D4AF37] text-[#002B49]'
                                        : child.badgeColor || 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {child.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#002B49] text-white shadow-sm font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#D4AF37]' : 'text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isActive ? 'bg-[#D4AF37] text-[#002B49]' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Info inside Sidebar */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
        <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
          <span>Portal SIKMA UB</span>
          <span className="text-[#002B49] font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">CI 3.1.13</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          Gedung Jurusan Kimia FSTeM UB, Jl. Veteran Malang 65145
        </div>
      </div>
    </aside>
  );
};
