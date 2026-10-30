/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  UserRole,
  AuthUser,
  Dosen,
  Mahasiswa,
  LogbookLabItem,
  JadwalSeminar,
  SuratPengajuan,
  PengajuanKLK,
  LogbookMingguanKLK,
  AdminStaff,
  PLPStaff
} from './types/sikma';
import {
  INITIAL_DOSEN,
  CURRENT_STUDENT,
  MATA_KULIAH_KIMIA,
  TRANSKRIP_NILAI,
  INITIAL_LOGBOOKS,
  INITIAL_SEMINAR,
  INITIAL_SURAT,
  PENGUMUMAN_LIST,
  INITIAL_KLK,
  DAFTAR_MITRA_KLK,
  DOKUMEN_KLK_LIST
} from './data/mockData';
import { INITIAL_ADMIN_LIST } from './data/adminList';
import { INITIAL_PLP_LIST } from './data/plpList';
import { INITIAL_MAHASISWA_LIST } from './data/mahasiswaList';
import { UserAccountItem, INITIAL_USER_ACCOUNTS } from './data/userList';
import { syncSdmToUserAccounts } from './utils/syncUserAndSdm';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DosenManagement } from './components/DosenManagement';
import { MahasiswaManagement } from './components/MahasiswaManagement';
import { AdminManagement } from './components/AdminManagement';
import { PlpManagement } from './components/PlpManagement';
import { AkademikView } from './components/AkademikView';
import { SkripsiLaboratoriumView } from './components/SkripsiLaboratoriumView';
import { SkripsiView } from './components/SkripsiView';
import { TesisView } from './components/TesisView';
import { LayananSuratView } from './components/LayananSuratView';
import { PermohonanSuratView } from './components/PermohonanSuratView';
import { AgendaView } from './components/AgendaView';
import { JadwalSeminarView } from './components/JadwalSeminarView';
import { KlkView } from './components/KlkView';
import { PengumumanView } from './components/PengumumanView';
import { Ci3CodeViewer } from './components/Ci3CodeViewer';
import { LoginView } from './components/LoginView';
import { PermissionsConfigView } from './components/PermissionsConfigView';
import { UserConfigView } from './components/UserConfigView';
import { SemesterConfigView } from './components/SemesterConfigView';
import { InstansiConfigView } from './components/InstansiConfigView';
import { JajaranConfigView } from './components/JajaranConfigView';
import { RuanganConfigView } from './components/RuanganConfigView';
import { ArsipConfigView } from './components/ArsipConfigView';
import { LaboratoriumView, LabSubTab } from './components/LaboratoriumView';
import { ProfileView } from './components/ProfileView';
import { ShieldAlert } from 'lucide-react';

interface AccessDeniedNoticeProps {
  menuTitle: string;
  onBack: () => void;
}

const AccessDeniedNotice: React.FC<AccessDeniedNoticeProps> = ({ menuTitle, onBack }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-8">
    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <ShieldAlert className="w-8 h-8" />
    </div>
    <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas: Menu {menuTitle}</h2>
    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
      Peran <strong>Mahasiswa</strong> tidak memiliki hak untuk mengakses atau mengelola menu <strong>{menuTitle}</strong> pada sistem SIKMA Kimia UB. Menu ini hanya dapat diakses oleh Administrator dan Dosen.
    </p>
    <button
      onClick={onBack}
      className="px-5 py-2.5 bg-[#002B49] text-white rounded-xl text-xs font-bold hover:bg-[#003865] transition-all shadow-sm cursor-pointer"
    >
      Kembali ke KLK
    </button>
  </div>
);

// Helper sinkronisasi data KLK dengan master data Mahasiswa
export const syncKlkWithMahasiswaList = (
  rawKlkList: PengajuanKLK[],
  mhsList: Mahasiswa[]
): PengajuanKLK[] => {
  return rawKlkList.map((k) => {
    const cleanNim = (k.nim || '').replace(/\D/g, '');
    const cleanNama = (k.mahasiswaNama || '').trim().toLowerCase();

    // Match by ID, NIM, or Name
    const matched = mhsList.find(
      (m) =>
        m.id === k.mahasiswaId ||
        (cleanNim && m.nim.replace(/\D/g, '') === cleanNim) ||
        (cleanNama && m.nama.trim().toLowerCase() === cleanNama)
    );

    if (matched) {
      return {
        ...k,
        mahasiswaId: matched.id,
        mahasiswaNama: matched.nama,
        nim: matched.nim,
        semester: matched.semester || k.semester
      };
    }
    return k;
  });
};

export default function App() {
  // Authentication State (user must login first)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sikma_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation & Role State (Terkunci sesuai akun login, tidak bisa diubah dari dalam)
  const [activeTab, setActiveTab] = useState<ActiveTab>('klk');
  const currentRole: UserRole = currentUser ? currentUser.role : 'mahasiswa';

  // Persistence State
  const [dosenList, setDosenList] = useState<Dosen[]>(() => {
    const saved = localStorage.getItem('sikma_dosen_data');
    const raw: Dosen[] = saved ? JSON.parse(saved) : INITIAL_DOSEN;
    return raw.map((d) => ({ ...d, nip: '' }));
  });

  const [student, setStudent] = useState<Mahasiswa>(() => {
    const saved = localStorage.getItem('sikma_student_data');
    return saved ? JSON.parse(saved) : CURRENT_STUDENT;
  });

  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_mahasiswa_list');
      return saved ? JSON.parse(saved) : INITIAL_MAHASISWA_LIST;
    } catch {
      return INITIAL_MAHASISWA_LIST;
    }
  });

  const [logbooks, setLogbooks] = useState<LogbookLabItem[]>(() => {
    const saved = localStorage.getItem('sikma_logbook_data');
    return saved ? JSON.parse(saved) : INITIAL_LOGBOOKS;
  });

  const [seminarList, setSeminarList] = useState<JadwalSeminar[]>(() => {
    const saved = localStorage.getItem('sikma_seminar_data');
    return saved ? JSON.parse(saved) : INITIAL_SEMINAR;
  });

  const [suratList, setSuratList] = useState<SuratPengajuan[]>(() => {
    const saved = localStorage.getItem('sikma_surat_data');
    return saved ? JSON.parse(saved) : INITIAL_SURAT;
  });

  const [klkList, setKlkList] = useState<PengajuanKLK[]>(() => {
    const saved = localStorage.getItem('sikma_klk_data');
    let rawList: PengajuanKLK[] = INITIAL_KLK;
    if (saved) {
      try {
        rawList = JSON.parse(saved);
      } catch {
        rawList = INITIAL_KLK;
      }
    }
    return syncKlkWithMahasiswaList(rawList, INITIAL_MAHASISWA_LIST);
  });

  const [adminList, setAdminList] = useState<AdminStaff[]>(() => {
    const saved = localStorage.getItem('sikma_admin_data');
    const raw: AdminStaff[] = saved ? JSON.parse(saved) : INITIAL_ADMIN_LIST;
    return raw.map((a) => ({ ...a, nip: '' }));
  });

  const [plpList, setPlpList] = useState<PLPStaff[]>(() => {
    const saved = localStorage.getItem('sikma_plp_data');
    const raw: PLPStaff[] = saved ? JSON.parse(saved) : INITIAL_PLP_LIST;
    return raw.map((p) => ({ ...p, nip: '' }));
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('sikma_dosen_data', JSON.stringify(dosenList));
  }, [dosenList]);

  useEffect(() => {
    localStorage.setItem('sikma_admin_data', JSON.stringify(adminList));
  }, [adminList]);

  useEffect(() => {
    localStorage.setItem('sikma_plp_data', JSON.stringify(plpList));
  }, [plpList]);

  useEffect(() => {
    localStorage.setItem('sikma_mahasiswa_list', JSON.stringify(mahasiswaList));
  }, [mahasiswaList]);

  useEffect(() => {
    localStorage.setItem('sikma_logbook_data', JSON.stringify(logbooks));
  }, [logbooks]);

  useEffect(() => {
    localStorage.setItem('sikma_seminar_data', JSON.stringify(seminarList));
  }, [seminarList]);

  useEffect(() => {
    localStorage.setItem('sikma_surat_data', JSON.stringify(suratList));
  }, [suratList]);

  useEffect(() => {
    localStorage.setItem('sikma_klk_data', JSON.stringify(klkList));
  }, [klkList]);

  // Guard: if role is restricted for active tab, redirect
  useEffect(() => {
    if (currentRole !== 'super_admin' && currentRole !== 'admin') {
      if (activeTab === 'ci3-architecture') {
        setActiveTab('klk');
      }
    }
    if (currentRole === 'mahasiswa') {
      const restrictedTabs: ActiveTab[] = [
        'permissions',
        'config-permissions',
        'user',
        'config-user',
        'semester',
        'config-semester',
        'instansi',
        'config-instansi',
        'ruangan',
        'config-ruangan',
        'arsip',
        'config-arsip',
        'data-alat',
        'data-bahan'
      ];
      if (restrictedTabs.includes(activeTab)) {
        if (activeTab === 'data-alat' || activeTab === 'data-bahan') {
          setActiveTab('data-laboratorium');
        } else {
          setActiveTab('klk');
        }
      }
    }
  }, [currentRole, activeTab]);

  // Helper sinkronisasi dua arah SDM -> Akun User (Config -> User)
  const syncUserAccountsFromSdm = (
    dList: Dosen[],
    mList: Mahasiswa[],
    aList: AdminStaff[],
    pList: PLPStaff[]
  ) => {
    try {
      const savedUsersRaw = localStorage.getItem('sikma_user_accounts');
      const currentUsers: UserAccountItem[] = savedUsersRaw
        ? JSON.parse(savedUsersRaw)
        : INITIAL_USER_ACCOUNTS;
      const res = syncSdmToUserAccounts(currentUsers, dList, mList, aList, pList);
      localStorage.setItem('sikma_user_accounts', JSON.stringify(res.updatedUsers));
    } catch (e) {
      console.error('Error syncing user accounts from SDM', e);
    }
  };

  // Sinkronisasi otomatis saat pertama kali aplikasi dimuat
  useEffect(() => {
    syncUserAccountsFromSdm(dosenList, mahasiswaList, adminList, plpList);
  }, []);

  // Handlers for Dosen
  const handleAddDosen = (newDosen: Dosen) => {
    const updated = [newDosen, ...dosenList];
    setDosenList(updated);
    try {
      localStorage.setItem('sikma_dosen_data', JSON.stringify(updated));
    } catch {}
    syncUserAccountsFromSdm(updated, mahasiswaList, adminList, plpList);
  };

  const handleUpdateDosen = (updated: Dosen) => {
    const next = dosenList.map((d) => (d.id === updated.id ? updated : d));
    setDosenList(next);
    try {
      localStorage.setItem('sikma_dosen_data', JSON.stringify(next));
    } catch {}
    syncUserAccountsFromSdm(next, mahasiswaList, adminList, plpList);
  };

  const handleDeleteDosen = (id: string) => {
    const next = dosenList.filter((d) => d.id !== id);
    setDosenList(next);
    try {
      localStorage.setItem('sikma_dosen_data', JSON.stringify(next));
    } catch {}
    syncUserAccountsFromSdm(next, mahasiswaList, adminList, plpList);
  };

  // Handlers for Admin
  const handleAddAdmin = (newAdmin: AdminStaff) => {
    const updated = [newAdmin, ...adminList];
    setAdminList(updated);
    syncUserAccountsFromSdm(dosenList, mahasiswaList, updated, plpList);
  };

  const handleUpdateAdmin = (updated: AdminStaff) => {
    const next = adminList.map((a) => (a.id === updated.id ? updated : a));
    setAdminList(next);
    syncUserAccountsFromSdm(dosenList, mahasiswaList, next, plpList);
  };

  const handleDeleteAdmin = (id: string) => {
    const next = adminList.filter((a) => a.id !== id);
    setAdminList(next);
    syncUserAccountsFromSdm(dosenList, mahasiswaList, next, plpList);
  };

  // Handlers for Mahasiswa
  const handleAddMahasiswa = (newMhs: Mahasiswa) => {
    const updated = [newMhs, ...mahasiswaList];
    setMahasiswaList(updated);
    try {
      localStorage.setItem('sikma_mahasiswa_list', JSON.stringify(updated));
    } catch {}
    syncUserAccountsFromSdm(dosenList, updated, adminList, plpList);
  };

  const handleUpdateMahasiswa = (updatedMhs: Mahasiswa) => {
    const updated = mahasiswaList.map((m) => (m.id === updatedMhs.id ? updatedMhs : m));
    setMahasiswaList(updated);
    try {
      localStorage.setItem('sikma_mahasiswa_list', JSON.stringify(updated));
    } catch {}

    // Sinkronkan data KLK mahasiswa saat data mahasiswa diperbarui
    setKlkList((prevKlk) => {
      const syncedKlk = prevKlk.map((k) => {
        if (
          k.mahasiswaId === updatedMhs.id ||
          (k.nim && updatedMhs.nim && k.nim.replace(/\D/g, '') === updatedMhs.nim.replace(/\D/g, '')) ||
          (k.mahasiswaNama && updatedMhs.nama && k.mahasiswaNama.trim().toLowerCase() === updatedMhs.nama.trim().toLowerCase())
        ) {
          return {
            ...k,
            mahasiswaId: updatedMhs.id,
            mahasiswaNama: updatedMhs.nama,
            nim: updatedMhs.nim,
            semester: updatedMhs.semester || k.semester
          };
        }
        return k;
      });
      try {
        localStorage.setItem('sikma_klk_data', JSON.stringify(syncedKlk));
      } catch {}
      return syncedKlk;
    });

    if (student.id === updatedMhs.id || student.nim === updatedMhs.nim) {
      setStudent(updatedMhs);
      try {
        localStorage.setItem('sikma_student_data', JSON.stringify(updatedMhs));
      } catch {}
    }
    syncUserAccountsFromSdm(dosenList, updated, adminList, plpList);
  };

  const handleDeleteMahasiswa = (id: string) => {
    const updated = mahasiswaList.filter((m) => m.id !== id);
    setMahasiswaList(updated);
    try {
      localStorage.setItem('sikma_mahasiswa_list', JSON.stringify(updated));
    } catch {}
    syncUserAccountsFromSdm(dosenList, updated, adminList, plpList);
  };

  // Handlers for PLP
  const handleAddPLP = (newPLP: PLPStaff) => {
    const updated = [newPLP, ...plpList];
    setPlpList(updated);
    syncUserAccountsFromSdm(dosenList, mahasiswaList, adminList, updated);
  };

  const handleUpdatePLP = (updated: PLPStaff) => {
    const next = plpList.map((p) => (p.id === updated.id ? updated : p));
    setPlpList(next);
    syncUserAccountsFromSdm(dosenList, mahasiswaList, adminList, next);
  };

  const handleDeletePLP = (id: string) => {
    const next = plpList.filter((p) => p.id !== id);
    setPlpList(next);
    syncUserAccountsFromSdm(dosenList, mahasiswaList, adminList, next);
  };

  // Handlers for Logbook
  const handleAddLogbook = (newItem: LogbookLabItem) => {
    setLogbooks((prev) => [newItem, ...prev]);
  };

  const handleVerifyLogbook = (
    id: string,
    catatan: string,
    status: LogbookLabItem['statusVerifikasi']
  ) => {
    setLogbooks((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              statusVerifikasi: status,
              catatanDosen: catatan,
              tanggalVerifikasi: new Date().toISOString().split('T')[0],
              dosenVerifikator:
                currentRole === 'dosen'
                  ? 'Dr. Dra. Hermin Sulistyarti, M.Si'
                  : 'Tim Dosen Pembimbing'
            }
          : l
      )
    );
  };

  // Handlers for Seminar & Surat
  const handleAddSeminar = (newSem: JadwalSeminar) => {
    setSeminarList((prev) => [newSem, ...prev]);
  };

  const handleAddSurat = (newSurat: SuratPengajuan) => {
    setSuratList((prev) => [newSurat, ...prev]);
  };

  // Handlers for KLK
  const handleAddKLK = (newKLK: PengajuanKLK) => {
    setKlkList((prev) => [newKLK, ...prev]);
  };

  const handleUpdateKLK = (updatedKlk: PengajuanKLK) => {
    setKlkList((prev) =>
      prev.map((k) => (k.id === updatedKlk.id ? updatedKlk : k))
    );
  };

  const handleUpdateKLKStatus = (
    id: string,
    status: PengajuanKLK['status'],
    nomorSurat?: string
  ) => {
    setKlkList((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              status,
              ...(nomorSurat ? { nomorSuratTugas: nomorSurat } : {})
            }
          : k
      )
    );
  };

  const handleAddKLKLogbook = (klkId: string, logbook: LogbookMingguanKLK) => {
    setKlkList((prev) =>
      prev.map((k) =>
        k.id === klkId
          ? {
              ...k,
              logbooks: [logbook, ...k.logbooks]
            }
          : k
      )
    );
  };

  const handleVerifyKLKLogbook = (
    klkId: string,
    logbookId: string,
    status: LogbookMingguanKLK['statusVerifikasi'],
    catatan: string
  ) => {
    setKlkList((prev) =>
      prev.map((k) => {
        if (k.id !== klkId) return k;
        return {
          ...k,
          logbooks: k.logbooks.map((lb) =>
            lb.id === logbookId
              ? {
                  ...lb,
                  statusVerifikasi: status,
                  catatanMentor: catatan,
                  tanggalVerifikasi: new Date().toISOString().split('T')[0]
                }
              : lb
          )
        };
      })
    );
  };

  const handleSimpanNilaiKLK = (
    klkId: string,
    nilaiIndustri: number,
    nilaiDosen: number,
    nilaiHuruf: 'A' | 'B+' | 'B' | 'C+' | 'C'
  ) => {
    setKlkList((prev) =>
      prev.map((k) =>
        k.id === klkId
          ? {
              ...k,
              nilaiIndustri,
              nilaiDosen,
              nilaiAkhirHuruf: nilaiHuruf,
              status: 'Selesai & Dinilai'
            }
          : k
      )
    );
  };

  const handleUpdateKLKUjian = (
    klkId: string,
    tanggalUjian: string,
    pukulUjian: string,
    ruangUjian: string
  ) => {
    setKlkList((prev) =>
      prev.map((k) =>
        k.id === klkId
          ? {
              ...k,
              tanggalUjian,
              pukulUjian,
              ruangUjian
            }
          : k
      )
    );
  };

  const pendingLogbooksCount = logbooks.filter(
    (l) => l.statusVerifikasi === 'Menunggu Verifikasi'
  ).length;

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('sikma_auth_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sikma_auth_user');
  };

  // If user is not logged in, show the Login Page first
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      {/* Official UB Royal Blue Header */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateProfile={() => setActiveTab('profile')}
        unreadCount={pendingLogbooksCount}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-0">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
          dosenCount={dosenList.length}
          pendingLogbooksCount={pendingLogbooksCount}
          adminCount={adminList.length}
          plpCount={plpList.length}
          mahasiswaCount={mahasiswaList.length}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0">
          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              currentRole={currentRole}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
              }}
            />
          )}

          {(activeTab === 'permissions' || activeTab === 'config-permissions') && (
            <PermissionsConfigView
              currentRole={currentRole}
              onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
            />
          )}

          {(activeTab === 'user' || activeTab === 'config-user') && (
            currentRole === 'mahasiswa' ? (
              <AccessDeniedNotice menuTitle="User (Manajemen Akun)" onBack={() => setActiveTab('klk')} />
            ) : (
              <UserConfigView
                currentRole={currentRole}
                currentUser={currentUser}
                onSwitchUser={(user) => {
                  handleLoginSuccess(user);
                }}
                dosenList={dosenList}
                mahasiswaList={mahasiswaList}
                adminList={adminList}
                plpList={plpList}
                onUpdateDosenList={(newList) => {
                  setDosenList(newList);
                  try {
                    localStorage.setItem('sikma_dosen_data', JSON.stringify(newList));
                  } catch {}
                }}
                onUpdateMahasiswaList={(newList) => {
                  setMahasiswaList(newList);
                  try {
                    localStorage.setItem('sikma_mahasiswa_list', JSON.stringify(newList));
                  } catch {}
                }}
                onUpdateAdminList={(newList) => {
                  setAdminList(newList);
                  try {
                    localStorage.setItem('sikma_admin_data', JSON.stringify(newList));
                  } catch {}
                }}
                onUpdatePlpList={(newList) => {
                  setPlpList(newList);
                  try {
                    localStorage.setItem('sikma_plp_data', JSON.stringify(newList));
                  } catch {}
                }}
              />
            )
          )}

          {(activeTab === 'semester' || activeTab === 'config-semester') && (
            currentRole === 'mahasiswa' ? (
              <AccessDeniedNotice menuTitle="Semester Akademik" onBack={() => setActiveTab('klk')} />
            ) : (
              <SemesterConfigView
                currentRole={currentRole}
              />
            )
          )}

          {(activeTab === 'instansi' || activeTab === 'config-instansi') && (
            currentRole === 'mahasiswa' ? (
              <AccessDeniedNotice menuTitle="Instansi Mitra" onBack={() => setActiveTab('klk')} />
            ) : (
              <InstansiConfigView
                currentRole={currentRole}
              />
            )
          )}

          {(activeTab === 'jajaran' || activeTab === 'config-jajaran') && (
            <JajaranConfigView
              currentRole={currentRole}
            />
          )}

          {(activeTab === 'ruangan' || activeTab === 'config-ruangan') && (
            currentRole === 'mahasiswa' ? (
              <AccessDeniedNotice menuTitle="Ruangan & Fasilitas" onBack={() => setActiveTab('klk')} />
            ) : (
              <RuanganConfigView
                currentRole={currentRole}
              />
            )
          )}

          {(activeTab === 'arsip' || activeTab === 'config-arsip') && (
            currentRole === 'mahasiswa' ? (
              <AccessDeniedNotice menuTitle="Arsip Departemen" onBack={() => setActiveTab('klk')} />
            ) : (
              <ArsipConfigView
                currentRole={currentRole}
              />
            )
          )}

          {activeTab === 'dosen' && (
            <DosenManagement
              currentRole={currentRole}
              dosenList={dosenList}
              onAddDosen={handleAddDosen}
              onUpdateDosen={handleUpdateDosen}
              onDeleteDosen={handleDeleteDosen}
            />
          )}

          {activeTab === 'data-mahasiswa' && (
            currentRole === 'mahasiswa' ? (
              <AccessDeniedNotice
                menuTitle="Data Mahasiswa (Sumber Daya Manusia)"
                onBack={() => setActiveTab('klk')}
              />
            ) : (
              <MahasiswaManagement
                currentRole={currentRole}
                mahasiswaList={mahasiswaList}
                onAddMahasiswa={handleAddMahasiswa}
                onUpdateMahasiswa={handleUpdateMahasiswa}
                onDeleteMahasiswa={handleDeleteMahasiswa}
                dosenList={dosenList}
                klkList={klkList}
              />
            )
          )}

          {activeTab === 'admin-management' && (
            <AdminManagement
              currentRole={currentRole}
              adminList={adminList}
              onAddAdmin={handleAddAdmin}
              onUpdateAdmin={handleUpdateAdmin}
              onDeleteAdmin={handleDeleteAdmin}
            />
          )}

          {activeTab === 'plp-management' && (
            <PlpManagement
              currentRole={currentRole}
              plpList={plpList}
              onAddPLP={handleAddPLP}
              onUpdatePLP={handleUpdatePLP}
              onDeletePLP={handleDeletePLP}
            />
          )}

          {(activeTab === 'laboratorium' ||
            activeTab === 'data-laboratorium' ||
            activeTab === 'data-alat' ||
            activeTab === 'data-bahan' ||
            activeTab === 'bon-alat' ||
            activeTab === 'bon-bahan') && (
            <LaboratoriumView
              currentRole={currentRole}
              currentUser={currentUser || undefined}
              activeSubMenu={
                activeTab === 'laboratorium' ? 'data-laboratorium' : (activeTab as LabSubTab)
              }
              onSubMenuChange={(sub) => setActiveTab(sub as ActiveTab)}
            />
          )}

          {activeTab === 'krs-khs' && (
            <AkademikView
              currentRole={currentRole}
              student={student}
              availableCourses={MATA_KULIAH_KIMIA}
              transcript={TRANSKRIP_NILAI}
            />
          )}

          {activeTab === 'skripsi' && (
            <SkripsiView
              currentRole={currentRole}
              student={student}
              dosenList={dosenList}
            />
          )}

          {activeTab === 'tesis' && (
            <TesisView
              currentRole={currentRole}
              student={student}
              dosenList={dosenList}
            />
          )}

          {activeTab === 'bebas-lab' && (
            <SkripsiLaboratoriumView
              currentRole={currentRole}
              student={student}
              dosenList={dosenList}
              logbooks={logbooks}
              onAddLogbook={handleAddLogbook}
              onVerifyLogbook={handleVerifyLogbook}
              initialTab="bebas-lab"
            />
          )}

          {activeTab === 'jadwal-seminar' && (
            <JadwalSeminarView
              currentRole={currentRole}
              seminarList={seminarList}
              dosenList={dosenList}
              onAddSeminar={handleAddSeminar}
            />
          )}

          {activeTab === 'permohonan-surat' && (
            <PermohonanSuratView
              currentRole={currentRole}
              student={student}
              currentUser={currentUser || undefined}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaView
              currentRole={currentRole}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'klk' && (
            <KlkView
              currentRole={currentRole}
              currentUser={currentUser}
              student={student}
              mahasiswaList={mahasiswaList}
              dosenList={dosenList}
              klkList={klkList}
              mitraList={DAFTAR_MITRA_KLK}
              dokumenList={DOKUMEN_KLK_LIST}
              initialSubTab="form-baru"
              onAddPengajuan={handleAddKLK}
              onUpdateStatus={handleUpdateKLKStatus}
              onUpdateUjian={handleUpdateKLKUjian}
              onAddLogbook={handleAddKLKLogbook}
              onVerifyLogbook={handleVerifyKLKLogbook}
              onSimpanNilai={handleSimpanNilaiKLK}
              onUpdateKLK={handleUpdateKLK}
            />
          )}

          {activeTab === 'pengumuman' && (
            <PengumumanView pengumumanList={PENGUMUMAN_LIST} />
          )}

          {activeTab === 'ci3-architecture' && (
            (currentRole === 'super_admin' || currentRole === 'admin') ? (
              <Ci3CodeViewer />
            ) : (
              <AccessDeniedNotice menuTitle="Arsitektur CodeIgniter 3" onBack={() => setActiveTab('dashboard')} />
            )
          )}
        </main>
      </div>

      {/* Official Footer */}
      <footer className="bg-[#002B49] text-white border-t border-slate-800 text-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-300">
          <div>
            &copy; 2026 <strong>Departemen Kimia FSTeM Universitas Brawijaya</strong>. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>SIKMA Kimia UB Portal</span>
            {(currentRole === 'super_admin' || currentRole === 'admin') && (
              <>
                <span>&bull;</span>
                <button
                  onClick={() => setActiveTab('ci3-architecture')}
                  className="text-[#D4AF37] hover:underline"
                >
                  Unduh Kode CI3
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

