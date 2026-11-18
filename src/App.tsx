/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { auth, onAuthStateChanged, signOut, FirebaseUser } from './firebase';
import {
  createEmptyRemoteSyncMeta,
  subscribeSikmaCollections,
  syncKlkListToFirestore,
  syncUsersListToFirestore,
  syncSdmCategoryToFirestore,
  syncLogbooksToFirestore,
  syncSeminarsToFirestore,
  syncSuratListToFirestore,
  syncPengumumanListToFirestore,
  checkCollectionHasDocs,
  isBootstrappedAdminEmail
} from './utils/firestoreSync';
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
  PLPStaff,
  PembimbingLapanganStaff,
  isMahasiswaRole,
  normalizeMahasiswaRole,
  Pengumuman
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
import { INITIAL_PEMBIMBING_LAPANGAN_LIST } from './data/pembimbingLapanganList';
import { INITIAL_MAHASISWA_LIST } from './data/mahasiswaList';
import { UserAccountItem, INITIAL_USER_ACCOUNTS, NIM_NIP_MIGRATION_FLAG, migrateUsernamesToNimNip } from './data/userList';
import {
  syncSdmToUserAccounts,
  syncBidirectionalUsersAndSdm,
  isNameMatch,
  isIdentifierMatch,
  isUserMatchingEntity
} from './utils/syncUserAndSdm';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DosenManagement } from './components/DosenManagement';
import { MahasiswaManagement } from './components/MahasiswaManagement';
import { AdminManagement } from './components/AdminManagement';
import { PlpManagement } from './components/PlpManagement';
import { PembimbingLapanganManagement } from './components/PembimbingLapanganManagement';
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
import { ShieldAlert, KeyRound, AlertTriangle, X, Download, FileText, FileSpreadsheet } from 'lucide-react';

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
      Peran <strong>Mahasiswa (S1 / S2 / S3)</strong> tidak memiliki hak untuk mengakses atau mengelola menu <strong>{menuTitle}</strong> pada sistem SIKMA Kimia UB. Menu ini hanya dapat diakses oleh Administrator dan Dosen.
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
        (cleanNim && m.nim && m.nim.replace(/\D/g, '') === cleanNim) ||
        (cleanNama && m.nama && m.nama.trim().toLowerCase() === cleanNama)
    );

    if (matched) {
      return {
        ...k,
        mahasiswaId: matched.id,
        mahasiswaNama: matched.nama,
        nim: matched.nim,
        semester: matched.semester || k.semester,
        dpaNama: matched.dosenPANama || k.dpaNama,
        dpaId: matched.dosenPAId || k.dpaId
      };
    }
    return k;
  });
};

export default function App() {
  // Firebase Auth & Firestore Sync Refs
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const remoteMetaRef = useRef(createEmptyRemoteSyncMeta());
  const isApplyingRemoteRef = useRef<boolean>(false);
  const hasSeededCloudRef = useRef<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setIsAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Authentication State (always start on Login Page; session persistence disabled)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      localStorage.removeItem('sikma_auth_user');
    } catch {}
    return null;
  });

  // Navigation & Role State (Terkunci sesuai akun login, tidak bisa diubah dari dalam)
  const [activeTab, setActiveTab] = useState<ActiveTab>(() =>
    currentUser?.mustChangePassword ? 'profile' : 'klk'
  );
  const [focusSecuritySignal, setFocusSecuritySignal] = useState<number>(0);
  const [passwordReminderNotice, setPasswordReminderNotice] = useState<string | null>(() =>
    currentUser?.mustChangePassword
      ? 'Peringatan Keamanan: Anda belum mengganti password awal Anda. Silakan segera ganti password di menu Profile.'
      : null
  );
  const currentRole: UserRole = currentUser ? normalizeMahasiswaRole(currentUser.role, currentUser.unit) : 'mahasiswa_s1';

  // Persistence State
  const [dosenList, setDosenList] = useState<Dosen[]>(() => {
    const saved = localStorage.getItem('sikma_dosen_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_DOSEN.map((d) => ({ ...d, nip: '' }));
  });

  const [student, setStudent] = useState<Mahasiswa>(() => {
    const saved = localStorage.getItem('sikma_student_data');
    return saved ? JSON.parse(saved) : CURRENT_STUDENT;
  });

  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_mahasiswa_list');
      const seededFlag = localStorage.getItem('sikma_mhs_initial_seeded_v1');
      if (saved) {
        const list: Mahasiswa[] = JSON.parse(saved);
        if (!seededFlag) {
          for (const initItem of INITIAL_MAHASISWA_LIST) {
            if (!list.some((m) => m.id === initItem.id || m.nim === initItem.nim)) {
              list.push(initItem);
            }
          }
          localStorage.setItem('sikma_mhs_initial_seeded_v1', 'true');
        }
        return list.filter((m) => m.nama?.toLowerCase().trim() !== 'sherina');
      }
      localStorage.setItem('sikma_mhs_initial_seeded_v1', 'true');
      return INITIAL_MAHASISWA_LIST.filter((m) => m.nama?.toLowerCase().trim() !== 'sherina');
    } catch {
      return INITIAL_MAHASISWA_LIST.filter((m) => m.nama?.toLowerCase().trim() !== 'sherina');
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

  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(() => {
    const saved = localStorage.getItem('sikma_pengumuman_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return PENGUMUMAN_LIST;
  });

  useEffect(() => {
    localStorage.setItem('sikma_pengumuman_list', JSON.stringify(pengumumanList));
  }, [pengumumanList]);

  const handleAddPengumuman = (newAnn: Pengumuman) => {
    setPengumumanList((prev) => [newAnn, ...prev]);
  };

  const handleDeletePengumuman = (id: string) => {
    setPengumumanList((prev) => prev.filter((p) => p.id !== id));
  };

  const [showSourceCodeModal, setShowSourceCodeModal] = useState<boolean>(false);

  const handleDownloadDeploymentGuide = () => {
    const guideContent = `================================================================================
PANDUAN DEPLOYMENT APLIKASI SIKMA KE HOSTING UNIVERSITAS BRAWIJAYA (ub.ac.id)
Departemen Kimia - Fakultas Sains dan Teknologi (FSTeM) Universitas Brawijaya
================================================================================

1. INFORMASI TEKNIS SISTEM
   - Nama Aplikasi: SIKMA (Sistem Informasi Kegiatan Mahasiswa & Akademik)
   - Framework Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4
   - Lingkungan Hosting Target: cPanel Hosting Universitas Brawijaya (ub.ac.id)

2. MENGAPA HOSTING PHP/APACHE (UB.AC.ID) BISA MENJALANKAN APLIKASI INI?
   Meskipun hosting UB umumnya berbasis PHP/Apache dan tidak menyediakan runtime Node.js, aplikasi SIKMA ini dirancang dengan arsitektur Single Page Application (SPA). Artinya, seluruh logika dan antarmuka berjalan di browser klien (client-side), sehingga Anda cukup mengunggah file hasil build statis (HTML, CSS, JS).

3. LANGKAH-LANGKAH DEPLOYMENT KE CPANEL UB.AC.ID:
   Langkah A: Di Komputer Lokal (Development)
   - Pastikan Node.js dan npm sudah terinstal di komputer Anda.
   - Buka terminal/command prompt di direktori proyek SIKMA.
   - Jalankan perintah build produksi:
     npm run build
   - Perintah ini akan membuat folder baru bernama "dist" di root direktori proyek.

   Langkah B: Di cPanel Hosting ub.ac.id
   - Login ke akun cPanel hosting Departemen Kimia / UB Anda.
   - Buka menu File Manager.
   - Masuk ke direktori public_html (atau folder subdomain Anda, misal public_html/sikma).
   - Unggah (upload) seluruh file dan folder yang berada di dalam folder "dist" (bukan folder dist-nya, melainkan isi di dalamnya seperti index.html dan folder assets).
   - Pastikan file index.html berada langsung di dalam root folder tujuan public_html.

   Langkah C: Pengujian Akses
   - Buka browser dan akses domain Anda (misal: https://kimia.ub.ac.id/sikma).
   - Sistem SIKMA akan langsung berjalan dengan normal.

4. DUKUNGAN TEKNIS & KONTAK
   - Tim Pengembang SIKMA Departemen Kimia FSTeM Universitas Brawijaya.
   - Hak Cipta Dilindungi Undang-Undang © 2026.
================================================================================`;

    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SIKMA_Panduan_Deployment_UB.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSystemBackup = () => {
    const backupData = {
      appName: "SIKMA Kimia UB",
      version: "2.6.0",
      exportDate: new Date().toISOString(),
      institution: "Departemen Kimia FSTeM Universitas Brawijaya",
      klkCount: klkList.length,
      status: "Production Ready",
      storageKeys: [
        "sikma_auth_user",
        "sikma_current_role",
        "sikma_klk_data",
        "sikma_user_accounts"
      ]
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sikma_system_backup_metadata.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [klkList, setKlkList] = useState<PengajuanKLK[]>(() => {
    try {
      const emptiedFlag = localStorage.getItem('sikma_klk_emptied_once_v1');
      if (!emptiedFlag) {
        localStorage.removeItem('sikma_klk_data');
        localStorage.setItem('sikma_klk_emptied_once_v1', 'true');
        return [];
      }
      const saved = localStorage.getItem('sikma_klk_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [adminList, setAdminList] = useState<AdminStaff[]>(() => {
    const saved = localStorage.getItem('sikma_admin_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_ADMIN_LIST.map((a) => ({ ...a, nip: '' }));
  });

  const [plpList, setPlpList] = useState<PLPStaff[]>(() => {
    const saved = localStorage.getItem('sikma_plp_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_PLP_LIST.map((p) => ({ ...p, nip: '' }));
  });

  const [pembimbingLapanganList, setPembimbingLapanganList] = useState<PembimbingLapanganStaff[]>(() => {
    try {
      const saved = localStorage.getItem('sikma_pembimbing_lapangan_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => p && typeof p === 'object' && typeof p.nama === 'string' && p.nama.trim().length > 0);
        }
      }
    } catch {}
    return INITIAL_PEMBIMBING_LAPANGAN_LIST;
  });

  const [userList, setUserList] = useState<UserAccountItem[]>(() => {
    const filterSherina = (items: UserAccountItem[]) =>
      items.filter((u) => u.nama?.toLowerCase().trim() !== 'sherina' && u.username?.toLowerCase().trim() !== 'sherina');
    const normalizeUserRole = (u: UserAccountItem): UserRole => {
      const raw = String(u.role || '').trim().toLowerCase();
      if (raw === 'super_admin' || raw === 'super admin' || raw === 'superadmin') {
        return 'super_admin';
      }
      return normalizeMahasiswaRole(u.role, u.unit || u.jabatan);
    };
    try {
      const saved = localStorage.getItem('sikma_user_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let changed = false;
          const normalized = filterSherina(parsed).map((u) => ({
            ...u,
            role: normalizeUserRole(u)
          }));
          if (!normalized.some((u) => u.role === 'super_admin')) {
            const seedSuperAdmin = INITIAL_USER_ACCOUNTS.find((u) => u.role === 'super_admin') || INITIAL_USER_ACCOUNTS[0];
            normalized.unshift(seedSuperAdmin);
            changed = true;
          }
          if (!localStorage.getItem('sikma_mhs_s1_s2_s3_migrated_v1')) {
            for (const extraRole of ['mahasiswa_s2', 'mahasiswa_s3'] as const) {
              if (!normalized.some((u) => u.role === extraRole)) {
                const seedUser = INITIAL_USER_ACCOUNTS.find((u) => u.role === extraRole);
                if (seedUser) normalized.push(seedUser);
              }
            }
            localStorage.setItem('sikma_mhs_s1_s2_s3_migrated_v1', 'true');
            changed = true;
          }
          let finalAccounts = normalized;
          if (!localStorage.getItem(NIM_NIP_MIGRATION_FLAG)) {
            const migRes = migrateUsernamesToNimNip(normalized);
            finalAccounts = migRes.migrated;
            localStorage.setItem(NIM_NIP_MIGRATION_FLAG, 'true');
            if (migRes.changed) changed = true;
          }
          if (changed) {
            localStorage.setItem('sikma_user_accounts', JSON.stringify(finalAccounts));
          }
          return finalAccounts;
        }
      }
    } catch {}
    try {
      localStorage.setItem('sikma_mhs_s1_s2_s3_migrated_v1', 'true');
      localStorage.setItem(NIM_NIP_MIGRATION_FLAG, 'true');
    } catch {}
    return filterSherina(INITIAL_USER_ACCOUNTS);
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
    localStorage.setItem('sikma_pembimbing_lapangan_data', JSON.stringify(pembimbingLapanganList));
  }, [pembimbingLapanganList]);

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

  useEffect(() => {
    localStorage.setItem('sikma_user_accounts', JSON.stringify(userList));
  }, [userList]);

  // Real-time Firestore Subscription (only attached when auth is ready & Firebase user is signed in)
  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser) return;

    const unsub = subscribeSikmaCollections(
      firebaseUser,
      currentRole,
      remoteMetaRef.current,
      {
        onKlkUpdate: (remoteItems) => {
          isApplyingRemoteRef.current = true;
          setKlkList(remoteItems);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onUsersUpdate: (remoteUsers) => {
          if (remoteUsers.length === 0) return;
          isApplyingRemoteRef.current = true;
          setUserList((prev) => {
            const byId = new Map<string, UserAccountItem>(prev.map((u) => [u.id, u]));
            for (const r of remoteUsers) {
              const existingLocal = byId.get(r.id);
              byId.set(r.id, existingLocal?.password ? { ...r, password: existingLocal.password } : r);
            }
            return Array.from(byId.values());
          });
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onDosenUpdate: (items) => {
          isApplyingRemoteRef.current = true;
          setDosenList(items);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onMahasiswaUpdate: (items) => {
          isApplyingRemoteRef.current = true;
          setMahasiswaList(items);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onAdminUpdate: (items) => {
          isApplyingRemoteRef.current = true;
          setAdminList(items);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onPlpUpdate: (items) => {
          isApplyingRemoteRef.current = true;
          setPlpList(items);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onPembimbingUpdate: (items) => {
          isApplyingRemoteRef.current = true;
          setPembimbingLapanganList(items);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onLogbooksUpdate: (items) => {
          isApplyingRemoteRef.current = true;
          setLogbooks(items);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onSeminarsUpdate: (items) => {
          isApplyingRemoteRef.current = true;
          setSeminarList(items);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onSuratUpdate: (items) => {
          isApplyingRemoteRef.current = true;
          setSuratList(items);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        },
        onPengumumanUpdate: (items) => {
          if (items.length === 0) return;
          isApplyingRemoteRef.current = true;
          setPengumumanList(items);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 150);
        }
      }
    );

    // Bootstrap initial master SDM & User collections once if bootstrapped admin logs into empty Firestore
    if (
      !hasSeededCloudRef.current &&
      isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)
    ) {
      hasSeededCloudRef.current = true;
      void (async () => {
        try {
          const hasSdm = await checkCollectionHasDocs('sdm_directory');
          if (!hasSdm) {
            await syncSdmCategoryToFirestore('dosen', dosenList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>, firebaseUser, remoteMetaRef.current);
            await syncSdmCategoryToFirestore('mahasiswa', mahasiswaList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>, firebaseUser, remoteMetaRef.current);
            await syncSdmCategoryToFirestore('admin', adminList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>, firebaseUser, remoteMetaRef.current);
            await syncSdmCategoryToFirestore('plp', plpList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>, firebaseUser, remoteMetaRef.current);
            await syncSdmCategoryToFirestore('pembimbing_lapangan', pembimbingLapanganList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>, firebaseUser, remoteMetaRef.current);
          }
          await syncUsersListToFirestore(userList, firebaseUser, remoteMetaRef.current, false);
          if (pengumumanList.length > 0) {
            await syncPengumumanListToFirestore(pengumumanList, firebaseUser, remoteMetaRef.current, false);
          }
          if (!(await checkCollectionHasDocs('seminars')) && seminarList.length > 0) {
            await syncSeminarsToFirestore(seminarList, firebaseUser, remoteMetaRef.current, false);
          }
          if (!(await checkCollectionHasDocs('logbooks')) && logbooks.length > 0) {
            await syncLogbooksToFirestore(logbooks, firebaseUser, remoteMetaRef.current, false);
          }
          if (!(await checkCollectionHasDocs('surat_pengajuan')) && suratList.length > 0) {
            await syncSuratListToFirestore(suratList, firebaseUser, remoteMetaRef.current, false);
          }
        } catch (err) {
          console.error('Firestore initial seed warning:', err);
        }
      })();
    }

    return () => unsub();
  }, [isAuthReady, firebaseUser, currentUser, currentRole]);

  // Sync local mutations to Firestore when authenticated with Firebase
  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    void syncKlkListToFirestore(
      klkList,
      firebaseUser,
      remoteMetaRef.current,
      isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)
    ).catch((err) => console.error('Sync KLK error:', err));
  }, [klkList, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    if (!isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)) return;
    void syncUsersListToFirestore(userList, firebaseUser, remoteMetaRef.current, true).catch((err) =>
      console.error('Sync Users error:', err)
    );
  }, [userList, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    if (!isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)) return;
    void syncSdmCategoryToFirestore(
      'dosen',
      dosenList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>,
      firebaseUser,
      remoteMetaRef.current,
      true
    ).catch((err) => console.error('Sync Dosen error:', err));
  }, [dosenList, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    if (!isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)) return;
    void syncSdmCategoryToFirestore(
      'mahasiswa',
      mahasiswaList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>,
      firebaseUser,
      remoteMetaRef.current,
      true
    ).catch((err) => console.error('Sync Mahasiswa error:', err));
  }, [mahasiswaList, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    if (!isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)) return;
    void syncSdmCategoryToFirestore(
      'admin',
      adminList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>,
      firebaseUser,
      remoteMetaRef.current,
      true
    ).catch((err) => console.error('Sync Admin error:', err));
  }, [adminList, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    if (!isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)) return;
    void syncSdmCategoryToFirestore(
      'plp',
      plpList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>,
      firebaseUser,
      remoteMetaRef.current,
      true
    ).catch((err) => console.error('Sync PLP error:', err));
  }, [plpList, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    if (!isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)) return;
    void syncSdmCategoryToFirestore(
      'pembimbing_lapangan',
      pembimbingLapanganList as unknown as Array<Record<string, unknown> & { id: string; nama: string }>,
      firebaseUser,
      remoteMetaRef.current,
      true
    ).catch((err) => console.error('Sync Pembimbing Lapangan error:', err));
  }, [pembimbingLapanganList, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    void syncLogbooksToFirestore(
      logbooks,
      firebaseUser,
      remoteMetaRef.current,
      isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)
    ).catch((err) => console.error('Sync Logbooks error:', err));
  }, [logbooks, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    void syncSeminarsToFirestore(
      seminarList,
      firebaseUser,
      remoteMetaRef.current,
      isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)
    ).catch((err) => console.error('Sync Seminars error:', err));
  }, [seminarList, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    void syncSuratListToFirestore(
      suratList,
      firebaseUser,
      remoteMetaRef.current,
      isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)
    ).catch((err) => console.error('Sync Surat error:', err));
  }, [suratList, isAuthReady, firebaseUser, currentUser]);

  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !currentUser || isApplyingRemoteRef.current) return;
    if (!isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)) return;
    void syncPengumumanListToFirestore(pengumumanList, firebaseUser, remoteMetaRef.current, true).catch((err) =>
      console.error('Sync Pengumuman error:', err)
    );
  }, [pengumumanList, isAuthReady, firebaseUser, currentUser]);

  // Guard: if role is restricted for active tab, redirect
  useEffect(() => {
    if (currentRole !== 'super_admin' && currentRole !== 'admin') {
      if (activeTab === 'ci3-architecture') {
        setActiveTab('klk');
      }
    }
    if (isMahasiswaRole(currentRole)) {
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
    if (currentRole === 'eksternal') {
      const allowedEksternalTabs: ActiveTab[] = [
        'klk',
        'profile'
      ];
      if (!allowedEksternalTabs.includes(activeTab)) {
        setActiveTab('klk');
      }
    }
  }, [currentRole, activeTab]);

  // Helper sinkronisasi terpadu seluruh Modul: User, Dosen, Mahasiswa, Admin, PLP, Pembimbing Lapangan, KLK, Logbook, Seminar, & Surat
  const syncAllModules = (
    dList: Dosen[] = dosenList,
    mList: Mahasiswa[] = mahasiswaList,
    aList: AdminStaff[] = adminList,
    pList: PLPStaff[] = plpList,
    kList: PengajuanKLK[] = klkList,
    uList?: UserAccountItem[],
    pbList: PembimbingLapanganStaff[] = pembimbingLapanganList,
    logList?: LogbookLabItem[],
    semList?: JadwalSeminar[],
    surList?: SuratPengajuan[]
  ) => {
    // 0. Sinkronisasi dua arah menyeluruh: jika ada penambahan/perubahan di User Accounts (Config -> User),
    // otomatis daftarkan ke SDM (Dosen, Mahasiswa, Admin, PLP, Pembimbing Lapangan). Sebaliknya jika ada entitas baru di SDM,
    // otomatis buatkan User Account.
    const baseUsers = uList || userList;
    const bidir = syncBidirectionalUsersAndSdm(baseUsers, dList, mList, aList, pList, pbList);
    const activeDosen = bidir.syncedDosen;
    const activeMahasiswa = bidir.syncedMahasiswa;
    const activeAdmin = bidir.syncedAdmin;
    const activePlp = bidir.syncedPlp;
    const activePembimbing = bidir.syncedPembimbingLapangan;
    const activeUsers = bidir.syncedUsers;

    // 1. Update DPA pada Mahasiswa jika nama/gelar Dosen diperbarui
    const syncedMahasiswa = activeMahasiswa.map((m) => {
      if (!m.dosenPANama && !m.dosenPAId) return m;
      const matchedDosen = m.dosenPANama
        ? activeDosen.find(
            (d) =>
              isNameMatch(d.nama, m.dosenPANama) ||
              (d.nip && m.dosenPANip && d.nip.replace(/\D/g, '') === m.dosenPANip.replace(/\D/g, ''))
          )
        : activeDosen.find(
            (d) =>
              (m.dosenPAId && d.id === m.dosenPAId) ||
              (d.nip && m.dosenPANip && d.nip.replace(/\D/g, '') === m.dosenPANip.replace(/\D/g, ''))
          );
      if (matchedDosen) {
        const fullDosenNama = `${matchedDosen.nama}${matchedDosen.gelar ? ', ' + matchedDosen.gelar : ''}`;
        return {
          ...m,
          dosenPAId: matchedDosen.id,
          dosenPANama: fullDosenNama,
          dosenPANip: matchedDosen.nip || matchedDosen.nidn || m.dosenPANip
        };
      }
      return m;
    });

    // 2. Sinkronisasi KLK dengan Data Mahasiswa & Data Dosen
    const syncedKlk = syncKlkWithMahasiswaList(kList, syncedMahasiswa).map((k) => {
      let updated = { ...k };
      // Sync student DPA info into KLK
      const studentMhs = syncedMahasiswa.find(
        (m) =>
          m.id === k.mahasiswaId ||
          (k.nim && m.nim && m.nim.replace(/\D/g, '') === (k.nim || '').replace(/\D/g, '')) ||
          (k.mahasiswaNama && isNameMatch(m.nama, k.mahasiswaNama))
      );
      if (studentMhs) {
        updated.dpaNama = studentMhs.dosenPANama || updated.dpaNama;
        updated.dpaId = studentMhs.dosenPAId || updated.dpaId;
      }

      // Sync Dosen Pembimbing KLK name if lecturer exists in activeDosen
      if (k.dosenPembimbingKLK && !k.dosenPembimbingKLK.includes('Belum Ditetapkan')) {
        const matchedDosen = activeDosen.find((d) => isNameMatch(d.nama, k.dosenPembimbingKLK));
        if (matchedDosen) {
          const fullDosenNama = `${matchedDosen.nama}${matchedDosen.gelar ? ', ' + matchedDosen.gelar : ''}`;
          updated.dosenPembimbingKLK = fullDosenNama;
        }
      }
      return updated;
    });

    // 3. Update student state jika profil mahasiswa aktif berubah atau terhapus
    if (currentUser && isMahasiswaRole(currentUser.role)) {
      const cleanNim = (currentUser.identifier || '').replace(/\D/g, '');
      const matchedMhs = syncedMahasiswa.find(
        (m) =>
          m.id === currentUser.id ||
          (cleanNim && m.nim && m.nim.replace(/\D/g, '') === cleanNim) ||
          isNameMatch(m.nama, currentUser.nama) ||
          (currentUser.username && isNameMatch(m.nama, currentUser.username))
      );
      if (matchedMhs) {
        setStudent(matchedMhs);
        try {
          localStorage.setItem('sikma_student_data', JSON.stringify(matchedMhs));
        } catch {}
      }
    } else if (student) {
      const matchedMhs = syncedMahasiswa.find(
        (m) => m.id === student.id || (m.nim && student.nim && m.nim.replace(/\D/g, '') === student.nim.replace(/\D/g, ''))
      );
      if (matchedMhs) {
        setStudent(matchedMhs);
        try {
          localStorage.setItem('sikma_student_data', JSON.stringify(matchedMhs));
        } catch {}
      } else if (syncedMahasiswa.length > 0) {
        setStudent(syncedMahasiswa[0]);
        try {
          localStorage.setItem('sikma_student_data', JSON.stringify(syncedMahasiswa[0]));
        } catch {}
      }
    }

    // 4. Update logbooks, seminarList, dan suratList jika ada
    const nextLogbooks = logList !== undefined ? logList : logbooks;
    const nextSeminar = semList !== undefined ? semList : seminarList;
    const nextSurat = surList !== undefined ? surList : suratList;

    // 5. Update state & localStorage secara atomik
    setDosenList(activeDosen);
    setMahasiswaList(syncedMahasiswa);
    setAdminList(activeAdmin);
    setPlpList(activePlp);
    setPembimbingLapanganList(activePembimbing);
    setKlkList(syncedKlk);
    setUserList(activeUsers);
    if (logList !== undefined) setLogbooks(nextLogbooks);
    if (semList !== undefined) setSeminarList(nextSeminar);
    if (surList !== undefined) setSuratList(nextSurat);

    // 6. Update currentUser jika profil login berubah
    if (currentUser) {
      const cleanCurrId = (currentUser.identifier || '').replace(/\D/g, '');
      const updatedAuth = activeUsers.find(
        (u) =>
          u.id === currentUser.id ||
          u.username === currentUser.username ||
          (u.role === currentUser.role &&
            ((cleanCurrId && isIdentifierMatch(u.identifier, cleanCurrId)) ||
              isNameMatch(u.nama, currentUser.nama)))
      );
      if (
        updatedAuth &&
        (updatedAuth.username !== currentUser.username ||
          updatedAuth.nama !== currentUser.nama ||
          updatedAuth.email !== currentUser.email ||
          updatedAuth.role !== currentUser.role ||
          updatedAuth.identifier !== currentUser.identifier ||
          updatedAuth.unit !== currentUser.unit ||
          updatedAuth.jabatan !== currentUser.jabatan ||
          updatedAuth.avatarText !== currentUser.avatarText)
      ) {
        const nextAuth: AuthUser = {
          ...currentUser,
          id: updatedAuth.id,
          username: updatedAuth.username,
          nama: updatedAuth.nama,
          email: updatedAuth.email,
          role: updatedAuth.role,
          identifier: updatedAuth.identifier,
          unit: updatedAuth.unit,
          jabatan: updatedAuth.jabatan,
          avatarText: updatedAuth.avatarText
        };
        setCurrentUser(nextAuth);
      }
    }

    try {
      localStorage.setItem('sikma_dosen_data', JSON.stringify(activeDosen));
      localStorage.setItem('sikma_mahasiswa_list', JSON.stringify(syncedMahasiswa));
      localStorage.setItem('sikma_admin_data', JSON.stringify(activeAdmin));
      localStorage.setItem('sikma_plp_data', JSON.stringify(activePlp));
      localStorage.setItem('sikma_pembimbing_lapangan_data', JSON.stringify(activePembimbing));
      localStorage.setItem('sikma_klk_data', JSON.stringify(syncedKlk));
      localStorage.setItem('sikma_user_accounts', JSON.stringify(activeUsers));
      if (logList !== undefined) localStorage.setItem('sikma_logbook_data', JSON.stringify(nextLogbooks));
      if (semList !== undefined) localStorage.setItem('sikma_seminar_data', JSON.stringify(nextSeminar));
      if (surList !== undefined) localStorage.setItem('sikma_surat_data', JSON.stringify(nextSurat));
    } catch (e) {
      console.error('Error persisting synced data:', e);
    }
  };

  // Sinkronisasi otomatis saat pertama kali aplikasi dimuat
  useEffect(() => {
    syncAllModules(dosenList, mahasiswaList, adminList, plpList, klkList, userList, pembimbingLapanganList);
  }, []);

  // Handlers for Dosen
  const handleAddDosen = (newDosen: Dosen) => {
    const updated = [newDosen, ...dosenList];
    syncAllModules(updated, mahasiswaList, adminList, plpList, klkList, userList, pembimbingLapanganList);
  };

  const handleUpdateDosen = (updated: Dosen) => {
    const next = dosenList.map((d) => (d.id === updated.id ? updated : d));
    syncAllModules(next, mahasiswaList, adminList, plpList, klkList, userList, pembimbingLapanganList);
  };

  const handleDeleteDosen = (id: string) => {
    const targetDosen = dosenList.find((d) => d.id === id);
    const nextDosen = dosenList.filter((d) => d.id !== id);
    let nextUsers = userList;
    if (targetDosen) {
      nextUsers = userList.filter(
        (u) =>
          !(
            u.role === 'dosen' &&
            (isUserMatchingEntity(u, targetDosen) ||
              isNameMatch(u.nama, targetDosen.nama) ||
              isIdentifierMatch(u.identifier, targetDosen.nip || targetDosen.nidn))
          )
      );
    }
    syncAllModules(nextDosen, mahasiswaList, adminList, plpList, klkList, nextUsers, pembimbingLapanganList);
  };

  const handleBulkDeleteDosen = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const targets = dosenList.filter((d) => idSet.has(d.id));
    const nextDosen = dosenList.filter((d) => !idSet.has(d.id));
    const nextUsers = userList.filter(
      (u) =>
        !(
          u.role === 'dosen' &&
          targets.some(
            (targetDosen) =>
              isUserMatchingEntity(u, targetDosen) ||
              isNameMatch(u.nama, targetDosen.nama) ||
              isIdentifierMatch(u.identifier, targetDosen.nip || targetDosen.nidn)
          )
        )
    );
    syncAllModules(nextDosen, mahasiswaList, adminList, plpList, klkList, nextUsers, pembimbingLapanganList);
  };

  // Handlers for Admin
  const handleAddAdmin = (newAdmin: AdminStaff) => {
    const updated = [newAdmin, ...adminList];
    syncAllModules(dosenList, mahasiswaList, updated, plpList, klkList, userList, pembimbingLapanganList);
  };

  const handleUpdateAdmin = (updated: AdminStaff) => {
    const next = adminList.map((a) => (a.id === updated.id ? updated : a));
    syncAllModules(dosenList, mahasiswaList, next, plpList, klkList, userList, pembimbingLapanganList);
  };

  const handleDeleteAdmin = (id: string) => {
    const targetAdmin = adminList.find((a) => a.id === id);
    const nextAdmin = adminList.filter((a) => a.id !== id);
    let nextUsers = userList;
    if (targetAdmin) {
      nextUsers = userList.filter(
        (u) =>
          !(
            u.role === 'admin' &&
            (isUserMatchingEntity(u, targetAdmin) ||
              isNameMatch(u.nama, targetAdmin.nama) ||
              isIdentifierMatch(u.identifier, targetAdmin.nip))
          )
      );
    }
    syncAllModules(dosenList, mahasiswaList, nextAdmin, plpList, klkList, nextUsers, pembimbingLapanganList);
  };

  const handleBulkDeleteAdmin = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const targets = adminList.filter((a) => idSet.has(a.id));
    const nextAdmin = adminList.filter((a) => !idSet.has(a.id));
    const nextUsers = userList.filter(
      (u) =>
        !(
          u.role === 'admin' &&
          targets.some(
            (targetAdmin) =>
              isUserMatchingEntity(u, targetAdmin) ||
              isNameMatch(u.nama, targetAdmin.nama) ||
              isIdentifierMatch(u.identifier, targetAdmin.nip)
          )
        )
    );
    syncAllModules(dosenList, mahasiswaList, nextAdmin, plpList, klkList, nextUsers, pembimbingLapanganList);
  };

  // Handlers for Mahasiswa
  const handleAddMahasiswa = (newMhs: Mahasiswa) => {
    const updated = [newMhs, ...mahasiswaList];
    syncAllModules(dosenList, updated, adminList, plpList, klkList, userList, pembimbingLapanganList);
  };

  const handleUpdateMahasiswa = (updatedMhs: Mahasiswa) => {
    const updated = mahasiswaList.map((m) => (m.id === updatedMhs.id ? updatedMhs : m));
    if (student.id === updatedMhs.id || student.nim === updatedMhs.nim) {
      setStudent(updatedMhs);
      try {
        localStorage.setItem('sikma_student_data', JSON.stringify(updatedMhs));
      } catch {}
    }
    syncAllModules(dosenList, updated, adminList, plpList, klkList, userList, pembimbingLapanganList);
  };

  const handleDeleteMahasiswa = (id: string) => {
    const targetMhs = mahasiswaList.find((m) => m.id === id);
    const nextMhs = mahasiswaList.filter((m) => m.id !== id);
    let nextUsers = userList;
    let nextKlk = klkList;
    if (targetMhs) {
      const cleanNim = (targetMhs.nim || '').replace(/\D/g, '');
      nextUsers = userList.filter(
        (u) =>
          !(
            isMahasiswaRole(u.role) &&
            (isUserMatchingEntity(u, targetMhs) ||
              isNameMatch(u.nama, targetMhs.nama) ||
              isIdentifierMatch(u.identifier, targetMhs.nim))
          )
      );
      nextKlk = klkList.filter(
        (k) =>
          k.mahasiswaId !== id &&
          (!cleanNim || (k.nim && k.nim.replace(/\D/g, '') !== cleanNim))
      );
    }
    syncAllModules(dosenList, nextMhs, adminList, plpList, nextKlk, nextUsers, pembimbingLapanganList);
  };

  const handleBulkDeleteMahasiswa = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const targets = mahasiswaList.filter((m) => idSet.has(m.id));
    const targetNims = new Set(targets.map((m) => (m.nim || '').replace(/\D/g, '')).filter(Boolean));
    const nextMhs = mahasiswaList.filter((m) => !idSet.has(m.id));
    const nextUsers = userList.filter(
      (u) =>
        !(
          isMahasiswaRole(u.role) &&
          targets.some(
            (targetMhs) =>
              isUserMatchingEntity(u, targetMhs) ||
              isNameMatch(u.nama, targetMhs.nama) ||
              isIdentifierMatch(u.identifier, targetMhs.nim)
          )
        )
    );
    const nextKlk = klkList.filter(
      (k) =>
        !idSet.has(k.mahasiswaId) &&
        !(k.nim && targetNims.has(k.nim.replace(/\D/g, '')))
    );
    syncAllModules(dosenList, nextMhs, adminList, plpList, nextKlk, nextUsers, pembimbingLapanganList);
  };

  // Handlers for PLP
  const handleAddPLP = (newPLP: PLPStaff) => {
    const updated = [newPLP, ...plpList];
    syncAllModules(dosenList, mahasiswaList, adminList, updated, klkList, userList, pembimbingLapanganList);
  };

  const handleUpdatePLP = (updated: PLPStaff) => {
    const next = plpList.map((p) => (p.id === updated.id ? updated : p));
    syncAllModules(dosenList, mahasiswaList, adminList, next, klkList, userList, pembimbingLapanganList);
  };

  const handleDeletePLP = (id: string) => {
    const targetPlp = plpList.find((p) => p.id === id);
    const nextPlp = plpList.filter((p) => p.id !== id);
    let nextUsers = userList;
    if (targetPlp) {
      nextUsers = userList.filter(
        (u) =>
          !(
            u.role === 'admin' &&
            (isUserMatchingEntity(u, targetPlp) ||
              isNameMatch(u.nama, targetPlp.nama) ||
              isIdentifierMatch(u.identifier, targetPlp.nip))
          )
      );
    }
    syncAllModules(dosenList, mahasiswaList, adminList, nextPlp, klkList, nextUsers, pembimbingLapanganList);
  };

  const handleBulkDeletePLP = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const targets = plpList.filter((p) => idSet.has(p.id));
    const nextPlp = plpList.filter((p) => !idSet.has(p.id));
    const nextUsers = userList.filter(
      (u) =>
        !(
          u.role === 'admin' &&
          targets.some(
            (targetPlp) =>
              isUserMatchingEntity(u, targetPlp) ||
              isNameMatch(u.nama, targetPlp.nama) ||
              isIdentifierMatch(u.identifier, targetPlp.nip)
          )
        )
    );
    syncAllModules(dosenList, mahasiswaList, adminList, nextPlp, klkList, nextUsers, pembimbingLapanganList);
  };

  // Handlers for Pembimbing Lapangan
  const handleUpdatePembimbingLapangan = (updated: PembimbingLapanganStaff) => {
    const next = pembimbingLapanganList.map((p) => (p.id === updated.id ? updated : p));
    syncAllModules(dosenList, mahasiswaList, adminList, plpList, klkList, userList, next);
  };

  const handleDeletePembimbingLapangan = (id: string) => {
    const targetPbl = pembimbingLapanganList.find((p) => p.id === id);
    const nextPbl = pembimbingLapanganList.filter((p) => p.id !== id);
    let nextUsers = userList;
    if (targetPbl) {
      nextUsers = userList.filter(
        (u) =>
          !(
            (u.role === 'eksternal' ||
              (u.jabatan && u.jabatan.toLowerCase().includes('pembimbing lapangan'))) &&
            (isUserMatchingEntity(u, targetPbl) ||
              isNameMatch(u.nama, targetPbl.nama) ||
              isIdentifierMatch(u.identifier, targetPbl.idMitra))
          )
      );
    }
    syncAllModules(dosenList, mahasiswaList, adminList, plpList, klkList, nextUsers, nextPbl);
  };

  const handleBulkDeletePembimbingLapangan = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const targets = pembimbingLapanganList.filter((p) => idSet.has(p.id));
    const nextPbl = pembimbingLapanganList.filter((p) => !idSet.has(p.id));
    const nextUsers = userList.filter(
      (u) =>
        !(
          (u.role === 'eksternal' ||
            (u.jabatan && u.jabatan.toLowerCase().includes('pembimbing lapangan'))) &&
          targets.some(
            (targetPbl) =>
              isUserMatchingEntity(u, targetPbl) ||
              isNameMatch(u.nama, targetPbl.nama) ||
              isIdentifierMatch(u.identifier, targetPbl.idMitra)
          )
        )
    );
    syncAllModules(dosenList, mahasiswaList, adminList, plpList, klkList, nextUsers, nextPbl);
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
    setKlkList((prev) => {
      const cleanNim = (newKLK.nim || '').replace(/\D/g, '');
      const isDuplicate = prev.some(
        (k) =>
          k.id === newKLK.id ||
          (cleanNim &&
            (k.nim || '').replace(/\D/g, '') === cleanNim &&
            k.waktuSubmit === newKLK.waktuSubmit &&
            k.namaMitra === newKLK.namaMitra)
      );
      if (isDuplicate) {
        return prev;
      }
      return [newKLK, ...prev];
    });
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
    const waktuNow = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace('.', ':') + ' WIB';
    setKlkList((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              status,
              ...(nomorSurat ? { nomorSuratTugas: nomorSurat } : {}),
              ...(status === 'Disetujui' || status === 'Disetujui / Sedang Berjalan'
                ? {
                    suratPengantarTerkirimKeMahasiswa: true,
                    waktuKirimSuratPengantarKeMahasiswa: k.waktuKirimSuratPengantarKeMahasiswa || waktuNow
                  }
                : status === 'Ditolak'
                ? {
                    suratPengantarTerkirimKeMahasiswa: false,
                    waktuKirimSuratPengantarKeMahasiswa: undefined
                  }
                : {})
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

  const handleResetAllKLK = () => {
    setKlkList([]);
    try {
      localStorage.setItem('sikma_klk_data', JSON.stringify([]));
      localStorage.removeItem('sikma_klk_verified_students');
      localStorage.removeItem('sikma_klk_unblocked_nims');
      localStorage.removeItem('sikma_klk_verify_lock_clean_v1');
      localStorage.removeItem('sikma_klk_form_submitted_id');
      localStorage.removeItem('sikma_klk_berkas_checklist_v1');
      localStorage.removeItem('sikma_klk_dosen_akademik_check_v1');
      sessionStorage.removeItem('sikma_klk_form_submitted_id');
    } catch {}
    syncAllModules(dosenList, mahasiswaList, adminList, plpList, []);
  };

  const handleDeleteKLK = (id: string) => {
    setKlkList((prev) => {
      const next = prev.filter((k) => k.id !== id);
      try {
        localStorage.setItem('sikma_klk_data', JSON.stringify(next));
      } catch {}
      syncAllModules(dosenList, mahasiswaList, adminList, plpList, next);
      return next;
    });
  };

  const pendingLogbooksCount = logbooks.filter(
    (l) => l.statusVerifikasi === 'Menunggu Verifikasi'
  ).length;

  const activeUserAccount = currentUser
    ? userList.find(
        (u) =>
          u.id === currentUser.id ||
          (currentUser.username && u.username.toLowerCase() === currentUser.username.toLowerCase())
      )
    : undefined;

  const isGoogleAuthenticated = Boolean(
    firebaseUser && currentUser && firebaseUser.uid === currentUser.id
  );

  const requiresPasswordChange = Boolean(
    !isGoogleAuthenticated &&
      currentUser &&
      (activeUserAccount?.mustChangePassword ?? currentUser.mustChangePassword) &&
      !(activeUserAccount?.passwordChangedAt || currentUser.passwordChangedAt)
  );

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    let latestUsers = userList;
    try {
      const savedUsers = localStorage.getItem('sikma_user_accounts');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers)) {
          latestUsers = parsedUsers;
          setUserList(parsedUsers);
        }
      }
    } catch {}

    const isGoogleLogin = Boolean(auth.currentUser && auth.currentUser.uid === user.id);
    const matchedAcc = latestUsers.find(
      (u) =>
        u.id === user.id ||
        (user.username && u.username.toLowerCase() === user.username.toLowerCase())
    );
    const isFirstLogin = isGoogleLogin
      ? false
      : Boolean(user.isFirstLogin) ||
        !matchedAcc?.terakhirLogin ||
        matchedAcc.terakhirLogin === 'Belum pernah login';
    const pendingChange = isGoogleLogin
      ? false
      : Boolean(user.mustChangePassword || matchedAcc?.mustChangePassword || isFirstLogin) &&
        !(user.passwordChangedAt || matchedAcc?.passwordChangedAt);

    const enrichedUser: AuthUser = {
      ...user,
      isFirstLogin,
      mustChangePassword: pendingChange,
      passwordChangedAt: user.passwordChangedAt || matchedAcc?.passwordChangedAt
    };

    setCurrentUser(enrichedUser);
    try {
      sessionStorage.removeItem('sikma_klk_form_submitted_id');
      Object.keys(sessionStorage).forEach((storageKey) => {
        if (storageKey.startsWith('sikma_klk_active_subtab_')) {
          sessionStorage.removeItem(storageKey);
        }
      });
    } catch {}

    if (pendingChange) {
      setActiveTab('profile');
      setFocusSecuritySignal((s) => s + 1);
      setPasswordReminderNotice(
        isFirstLogin
          ? 'Login Pertama Kali: Demi keamanan akun, Anda diarahkan ke menu Profile. Silakan segera ganti password awal Anda.'
          : 'Peringatan Keamanan: Anda belum mengganti password awal sejak login pertama. Silakan segera ganti password Anda di menu Profile.'
      );
    } else {
      setActiveTab('klk');
      setPasswordReminderNotice(null);
    }

    if (isMahasiswaRole(enrichedUser.role)) {
      const cleanNim = (enrichedUser.identifier || '').replace(/\D/g, '');
      const matchedMhs = mahasiswaList.find(
        (m) =>
          m.id === enrichedUser.id ||
          (cleanNim && m.nim.replace(/\D/g, '') === cleanNim) ||
          isNameMatch(m.nama, enrichedUser.nama) ||
          (enrichedUser.username && isNameMatch(m.nama, enrichedUser.username))
      );
      if (matchedMhs) {
        setStudent(matchedMhs);
        try {
          localStorage.setItem('sikma_student_data', JSON.stringify(matchedMhs));
        } catch {}
      }
    }
  };

  // Pastikan data mahasiswa aktif sinkron dengan akun user yang sedang aktif
  useEffect(() => {
    if (currentUser && isMahasiswaRole(currentUser.role)) {
      const cleanNim = (currentUser.identifier || '').replace(/\D/g, '');
      const matchedMhs = mahasiswaList.find(
        (m) =>
          m.id === currentUser.id ||
          (cleanNim && m.nim.replace(/\D/g, '') === cleanNim) ||
          isNameMatch(m.nama, currentUser.nama) ||
          (currentUser.username && isNameMatch(m.nama, currentUser.username))
      );
      if (matchedMhs && (student.id !== matchedMhs.id || student.nim !== matchedMhs.nim || student.nama !== matchedMhs.nama)) {
        setStudent(matchedMhs);
        try {
          localStorage.setItem('sikma_student_data', JSON.stringify(matchedMhs));
        } catch {}
      }
    }
  }, [currentUser, mahasiswaList, student]);

  const handleLogout = () => {
    setCurrentUser(null);
    setPasswordReminderNotice(null);
    localStorage.removeItem('sikma_auth_user');
    void signOut(auth).catch(() => {});
    try {
      sessionStorage.removeItem('sikma_klk_form_submitted_id');
      Object.keys(sessionStorage).forEach((storageKey) => {
        if (storageKey.startsWith('sikma_klk_active_subtab_')) {
          sessionStorage.removeItem(storageKey);
        }
      });
    } catch {}
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
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (requiresPasswordChange && tab !== 'profile') {
              setPasswordReminderNotice(
                'Peringatan: Anda belum mengganti password awal. Silakan segera ganti password Anda di menu Profile → Keamanan & Kata Sandi.'
              );
            }
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'auto' });
            }
          }}
          currentRole={currentRole}
          dosenCount={dosenList.length}
          pendingLogbooksCount={pendingLogbooksCount}
          adminCount={adminList.length}
          plpCount={plpList.length}
          pembimbingLapanganCount={Array.isArray(pembimbingLapanganList) ? pembimbingLapanganList.length : 0}
          mahasiswaCount={mahasiswaList.length}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0">
          {/* Floating Toast Notifikasi Wajib Ganti Password */}
          {requiresPasswordChange && passwordReminderNotice && (
            <div className="fixed bottom-6 right-6 z-50 max-w-md bg-amber-950 text-white px-4 py-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold leading-relaxed text-amber-50">
                  {passwordReminderNotice}
                </p>
                {activeTab !== 'profile' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('profile');
                      setFocusSecuritySignal((s) => s + 1);
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Ganti Password Sekarang</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPasswordReminderNotice(null)}
                className="text-amber-300 hover:text-white p-0.5 rounded cursor-pointer"
                title="Tutup notifikasi sementara"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Persistent Global Banner di semua menu selain Profile sampai password diganti */}
          {requiresPasswordChange && activeTab !== 'profile' && (
            <div className="mb-6 bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-amber-950">
                    Peringatan: Anda Belum Mengganti Password Awal!
                  </p>
                  <p className="text-xs text-amber-900 mt-0.5">
                    Demi keamanan akun SIKMA, mohon segera perbarui kata sandi Anda melalui menu <strong>Profile → Keamanan &amp; Kata Sandi</strong>. Peringatan ini akan tetap tampil sampai Anda mengganti password.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setFocusSecuritySignal((s) => s + 1);
                }}
                className="px-4 py-2 bg-[#002B49] hover:bg-[#003865] text-white text-xs font-bold rounded-xl shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
                <span>Ke Menu Profile &amp; Ganti Password</span>
              </button>
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              currentRole={currentRole}
              userList={userList}
              dosenList={dosenList}
              mahasiswaList={mahasiswaList}
              adminList={adminList}
              plpList={plpList}
              pembimbingLapanganList={pembimbingLapanganList}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
              }}
              onSaveSyncedProfile={({
                updatedAuth,
                updatedUserList,
                updatedDosenList,
                updatedMahasiswaList,
                updatedAdminList,
                updatedPlpList,
                updatedPembimbingLapanganList,
                updatedKlkList,
                updatedLogbooks,
                updatedSeminarList,
                updatedSuratList
              }) => {
                setCurrentUser(updatedAuth);
                syncAllModules(
                  updatedDosenList,
                  updatedMahasiswaList,
                  updatedAdminList,
                  updatedPlpList,
                  updatedKlkList,
                  updatedUserList,
                  updatedPembimbingLapanganList,
                  updatedLogbooks,
                  updatedSeminarList,
                  updatedSuratList
                );
              }}
              onUpdateUserPassword={(userId, hashedPassword) => {
                const changedAt = new Date().toISOString();
                const nextUsers = userList.map((u) =>
                  u.id === userId ||
                  (currentUser?.username && u.username.toLowerCase() === currentUser.username.toLowerCase())
                    ? {
                        ...u,
                        password: hashedPassword,
                        mustChangePassword: false,
                        passwordChangedAt: changedAt
                      }
                    : u
                );
                setUserList(nextUsers);
                try {
                  localStorage.setItem('sikma_user_accounts', JSON.stringify(nextUsers));
                } catch {}

                if (currentUser) {
                  const updatedAuth: AuthUser = {
                    ...currentUser,
                    mustChangePassword: false,
                    isFirstLogin: false,
                    passwordChangedAt: changedAt
                  };
                  setCurrentUser(updatedAuth);
                }
                setPasswordReminderNotice(null);
              }}
              mustChangePassword={requiresPasswordChange}
              focusSecuritySignal={focusSecuritySignal}
              klkList={klkList}
              logbooks={logbooks}
              seminarList={seminarList}
              suratList={suratList}
            />
          )}

          {(activeTab === 'permissions' || activeTab === 'config-permissions') && (
            <PermissionsConfigView
              currentRole={currentRole}
              onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
            />
          )}

          {(activeTab === 'user' || activeTab === 'config-user') && (
            isMahasiswaRole(currentRole) ? (
              <AccessDeniedNotice menuTitle="User (Manajemen Akun)" onBack={() => setActiveTab('klk')} />
            ) : (
              <UserConfigView
                currentRole={currentRole}
                currentUser={currentUser}
                onSwitchUser={(user) => {
                  handleLoginSuccess(user);
                }}
                userList={userList}
                onUpdateUserList={(newList) => {
                  syncAllModules(dosenList, mahasiswaList, adminList, plpList, klkList, newList, pembimbingLapanganList);
                }}
                dosenList={dosenList}
                mahasiswaList={mahasiswaList}
                adminList={adminList}
                plpList={plpList}
                pembimbingLapanganList={pembimbingLapanganList}
                klkList={klkList}
                logbooks={logbooks}
                seminarList={seminarList}
                suratList={suratList}
                onLogout={handleLogout}
                onSyncAllModules={(d, m, a, p, k, u, pb, log, sem, sur) => {
                  syncAllModules(
                    d ?? dosenList,
                    m ?? mahasiswaList,
                    a ?? adminList,
                    p ?? plpList,
                    k ?? klkList,
                    u ?? userList,
                    pb ?? pembimbingLapanganList,
                    log,
                    sem,
                    sur
                  );
                }}
                onUpdateDosenList={(newList) => {
                  syncAllModules(newList, mahasiswaList, adminList, plpList, klkList, userList, pembimbingLapanganList);
                }}
                onUpdateMahasiswaList={(newList) => {
                  syncAllModules(dosenList, newList, adminList, plpList, klkList, userList, pembimbingLapanganList);
                }}
                onUpdateAdminList={(newList) => {
                  syncAllModules(dosenList, mahasiswaList, newList, plpList, klkList, userList, pembimbingLapanganList);
                }}
                onUpdatePlpList={(newList) => {
                  syncAllModules(dosenList, mahasiswaList, adminList, newList, klkList, userList, pembimbingLapanganList);
                }}
                onUpdatePembimbingLapanganList={(newList) => {
                  syncAllModules(dosenList, mahasiswaList, adminList, plpList, klkList, userList, newList);
                }}
              />
            )
          )}

          {(activeTab === 'semester' || activeTab === 'config-semester') && (
            isMahasiswaRole(currentRole) ? (
              <AccessDeniedNotice menuTitle="Semester Akademik" onBack={() => setActiveTab('klk')} />
            ) : (
              <SemesterConfigView
                currentRole={currentRole}
              />
            )
          )}

          {(activeTab === 'instansi' || activeTab === 'config-instansi') && (
            isMahasiswaRole(currentRole) ? (
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
            isMahasiswaRole(currentRole) ? (
              <AccessDeniedNotice menuTitle="Ruangan & Fasilitas" onBack={() => setActiveTab('klk')} />
            ) : (
              <RuanganConfigView
                currentRole={currentRole}
              />
            )
          )}

          {(activeTab === 'arsip' || activeTab === 'config-arsip') && (
            isMahasiswaRole(currentRole) ? (
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
              onBulkDeleteDosen={handleBulkDeleteDosen}
              mahasiswaList={mahasiswaList}
              klkList={klkList}
              onAssignMahasiswa={(targetDosen, nim, nama) => {
                const cleanNim = (nim || '').replace(/\D/g, '');
                const cleanNama = (nama || '').trim().toLowerCase();
                const fullDosenNama = `${targetDosen.nama}${targetDosen.gelar ? ', ' + targetDosen.gelar : ''}`;

                let updatedMhs = mahasiswaList.map((m) => {
                  if (
                    (cleanNim && m.nim && m.nim.replace(/\D/g, '') === cleanNim) ||
                    (cleanNama && m.nama && m.nama.trim().toLowerCase() === cleanNama)
                  ) {
                    return {
                      ...m,
                      dosenPAId: targetDosen.id,
                      dosenPANama: fullDosenNama,
                      dosenPANip: targetDosen.nip || targetDosen.nidn || m.dosenPANip
                    };
                  }
                  return m;
                });

                const exists = updatedMhs.some(
                  (m) =>
                    (cleanNim && m.nim && m.nim.replace(/\D/g, '') === cleanNim) ||
                    (cleanNama && m.nama && m.nama.trim().toLowerCase() === cleanNama)
                );

                if (!exists) {
                  const newMhs: Mahasiswa = {
                    id: `mhs-${Date.now()}`,
                    nim,
                    nama,
                    angkatan: `20${nim.slice(0, 2) || '23'}`,
                    programStudi: 'S1 Kimia - FMIPA Universitas Brawijaya',
                    dosenPAId: targetDosen.id,
                    dosenPANama: fullDosenNama,
                    dosenPANip: targetDosen.nip || targetDosen.nidn || '',
                    status: 'Aktif',
                    semester: 7,
                    ipk: 3.5,
                    totalSks: 110,
                    tahapSkripsi: 'Penelitian Laboratorium',
                    labPenelitian: targetDosen.lab || 'Laboratorium Kimia Analitik & Instrumentasi'
                  };
                  updatedMhs = [newMhs, ...updatedMhs];
                }

                const updatedDosen = dosenList.map((d) =>
                  d.id === targetDosen.id
                    ? { ...d, jumlahBimbingan: (d.jumlahBimbingan || 0) + 1 }
                    : d
                );
                syncAllModules(updatedDosen, updatedMhs, adminList, plpList, klkList, userList);
              }}
            />
          )}

          {activeTab === 'data-mahasiswa' && (
            isMahasiswaRole(currentRole) ? (
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
                onBulkDeleteMahasiswa={handleBulkDeleteMahasiswa}
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
              onBulkDeleteAdmin={handleBulkDeleteAdmin}
            />
          )}

          {activeTab === 'plp-management' && (
            <PlpManagement
              currentRole={currentRole}
              plpList={plpList}
              onAddPLP={handleAddPLP}
              onUpdatePLP={handleUpdatePLP}
              onDeletePLP={handleDeletePLP}
              onBulkDeletePLP={handleBulkDeletePLP}
            />
          )}

          {activeTab === 'pembimbing-lapangan-management' && (
            <PembimbingLapanganManagement
              currentRole={currentRole}
              pembimbingLapanganList={Array.isArray(pembimbingLapanganList) ? pembimbingLapanganList : []}
              klkList={Array.isArray(klkList) ? klkList : []}
              onUpdatePembimbingLapangan={handleUpdatePembimbingLapangan}
              onDeletePembimbingLapangan={handleDeletePembimbingLapangan}
              onBulkDeletePembimbingLapangan={handleBulkDeletePembimbingLapangan}
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
              key={currentUser?.id || currentUser?.username || currentRole}
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
              onResetAllKLK={handleResetAllKLK}
              onDeleteKLK={handleDeleteKLK}
            />
          )}

          {activeTab === 'pengumuman' && (
            <PengumumanView
              pengumumanList={pengumumanList}
              currentUserRole={currentRole}
              currentUserName={currentUser?.nama || 'Administrator'}
              onAddPengumuman={handleAddPengumuman}
              onDeletePengumuman={handleDeletePengumuman}
            />
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
          <div className="flex items-center space-x-4 text-[11px] flex-wrap gap-y-1">
            <span>sikma Kimia UB</span>
            {currentRole === 'super_admin' && (
              <>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => setShowSourceCodeModal(true)}
                  className="text-[#D4AF37] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  title="Akses Eksklusif Super Admin: Unduh Source Code & Panduan SIKMA"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Unduh Source Code SIKMA</span>
                </button>
              </>
            )}
            {(currentRole === 'super_admin' || currentRole === 'admin') && (
              <>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('ci3-architecture')}
                  className="text-[#D4AF37] hover:underline cursor-pointer"
                >
                  Unduh Kode CI3
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Modal Unduh Source Code & Panduan Deployment SIKMA (Khusus Super Admin) */}
      {showSourceCodeModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-[#002B49] to-[#003865] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#002B49] flex items-center justify-center font-black">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Pusat Unduhan Source Code &amp; Panduan</h3>
                  <p className="text-[11px] text-slate-200">Akses Eksklusif Super Admin • Departemen Kimia FSTeM UB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSourceCodeModal(false)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Keamanan &amp; Hak Akses Terbatas</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Fitur unduh arsip source code dan panduan deployment ini khusus disediakan untuk akun <strong>Super Admin</strong>. Silakan gunakan tautan di bawah ini untuk mengunduh dokumen panduan teknis hosting cPanel (<code className="bg-amber-100 px-1 rounded font-mono">ub.ac.id</code>) atau snapshot sistem.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadDeploymentGuide}
                  className="w-full py-3 px-4 bg-[#002B49] hover:bg-[#003861] text-white font-bold rounded-xl text-xs flex items-center justify-between shadow-xs cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span>Unduh Panduan Deployment cPanel (`ub.ac.id`)</span>
                  </div>
                  <Download className="w-4 h-4 text-[#D4AF37]" />
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSystemBackup}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 text-xs flex items-center justify-between shadow-xs cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Unduh Snapshot Metadata Sistem SIKMA (.json)</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <span className="font-bold text-slate-800 block">Petunjuk Singkat Cepat ke Hosting UB:</span>
                <p>1. Jalankan <code className="bg-slate-200 px-1 rounded font-mono">npm run build</code> di komputer lokal.</p>
                <p>2. Upload seluruh file isi folder <code className="bg-slate-200 px-1 rounded font-mono">dist/</code> ke <code className="bg-slate-200 px-1 rounded font-mono">public_html</code> cPanel ub.ac.id.</p>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowSourceCodeModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

