import React, { useState, useEffect } from 'react';
import {
  UserRole,
  AuthUser,
  DataLaboratoriumItem,
  DataAlatItem,
  DataBahanItem,
  BonAlatItem,
  BonBahanItem
} from '../types/sikma';
import {
  INITIAL_LAB_LIST,
  INITIAL_ALAT_LIST,
  INITIAL_BAHAN_LIST,
  INITIAL_BON_ALAT_LIST,
  INITIAL_BON_BAHAN_LIST
} from '../data/labData';
import { DataLabTab } from './laboratorium/DataLabTab';
import { DataAlatTab } from './laboratorium/DataAlatTab';
import { DataBahanTab } from './laboratorium/DataBahanTab';
import { BonAlatTab } from './laboratorium/BonAlatTab';
import { BonBahanTab } from './laboratorium/BonBahanTab';
import {
  Building2,
  Microscope,
  TestTube2,
  ClipboardList,
  FileSpreadsheet,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export type LabSubTab = 'data-laboratorium' | 'data-alat' | 'data-bahan' | 'bon-alat' | 'bon-bahan';

interface LaboratoriumViewProps {
  currentRole: UserRole;
  currentUser?: AuthUser;
  activeSubMenu?: LabSubTab;
  onSubMenuChange?: (sub: LabSubTab) => void;
}

export const LaboratoriumView: React.FC<LaboratoriumViewProps> = ({
  currentRole,
  currentUser,
  activeSubMenu = 'data-laboratorium',
  onSubMenuChange
}) => {
  // Active sub-tab state (synchronized with prop if passed)
  const [currentTab, setCurrentTab] = useState<LabSubTab>(() => {
    if (currentRole === 'mahasiswa' && (activeSubMenu === 'data-alat' || activeSubMenu === 'data-bahan')) {
      return 'data-laboratorium';
    }
    return activeSubMenu;
  });

  useEffect(() => {
    if (activeSubMenu) {
      if (currentRole === 'mahasiswa' && (activeSubMenu === 'data-alat' || activeSubMenu === 'data-bahan')) {
        setCurrentTab('data-laboratorium');
      } else {
        setCurrentTab(activeSubMenu);
      }
    }
  }, [activeSubMenu, currentRole]);

  useEffect(() => {
    if (currentRole === 'mahasiswa' && (currentTab === 'data-alat' || currentTab === 'data-bahan')) {
      setCurrentTab('data-laboratorium');
    }
  }, [currentRole, currentTab]);

  const handleTabClick = (tab: LabSubTab) => {
    if (currentRole === 'mahasiswa' && (tab === 'data-alat' || tab === 'data-bahan')) {
      return;
    }
    setCurrentTab(tab);
    if (onSubMenuChange) {
      onSubMenuChange(tab);
    }
  };

  // 1. Lab List persistence
  const [labList, setLabList] = useState<DataLaboratoriumItem[]>(() => {
    const saved = localStorage.getItem('sikma_lab_data');
    if (saved) {
      try {
        const parsed: DataLaboratoriumItem[] = JSON.parse(saved);
        return parsed.map((item) => {
          const initialMatch = INITIAL_LAB_LIST.find((init) => init.id === item.id);
          if (!item.koordinatorKompartemen && initialMatch?.koordinatorKompartemen) {
            item.koordinatorKompartemen = initialMatch.koordinatorKompartemen;
            item.nipKoordinatorKompartemen = initialMatch.nipKoordinatorKompartemen;
          }
          if (!item.team || item.team.length === 0) {
            if (initialMatch && initialMatch.team) {
              return { ...item, team: initialMatch.team };
            }
          } else {
            let newTeam = item.team.map((m) => {
              if (
                m.peran.toLowerCase().includes('teknisi') ||
                m.peran.toLowerCase().includes('dosen') ||
                m.peran.toLowerCase().includes('analis')
              ) {
                return { ...m, peran: 'Admin' };
              }
              return m;
            });

            if (initialMatch?.team) {
              const hasKoor = newTeam.some((m) =>
                m.peran.toLowerCase().includes('koordinator') ||
                m.peran.toLowerCase().includes('kompartemen')
              );
              if (!hasKoor) {
                const initKoor = initialMatch.team.find((m) =>
                  m.peran.toLowerCase().includes('koordinator') ||
                  m.peran.toLowerCase().includes('kompartemen')
                );
                if (initKoor) {
                  const kIdx = newTeam.findIndex((m) => m.peran.toLowerCase().includes('kepala'));
                  if (kIdx !== -1) {
                    newTeam.splice(kIdx + 1, 0, initKoor);
                  } else {
                    newTeam.unshift(initKoor);
                  }
                }
              }

              const hasAdmin = newTeam.some((m) => m.peran.toLowerCase().includes('admin'));
              if (!hasAdmin) {
                const initAdmin = initialMatch.team.find((m) => m.peran.toLowerCase().includes('admin'));
                if (initAdmin) {
                  const pIdx = newTeam.findIndex((m) => m.peran.toLowerCase().includes('plp'));
                  if (pIdx !== -1) {
                    newTeam.splice(pIdx + 1, 0, initAdmin);
                  } else {
                    newTeam.push(initAdmin);
                  }
                }
              }
            }

            return { ...item, team: newTeam };
          }
          return item;
        });
      } catch {
        return INITIAL_LAB_LIST;
      }
    }
    return INITIAL_LAB_LIST;
  });

  useEffect(() => {
    localStorage.setItem('sikma_lab_data', JSON.stringify(labList));
  }, [labList]);

  // 2. Alat List persistence
  const [alatList, setAlatList] = useState<DataAlatItem[]>(() => {
    const saved = localStorage.getItem('sikma_alat_data');
    if (saved) {
      try {
        const parsed: DataAlatItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: DataAlatItem[] = parsed.map((item) => {
            const seed = INITIAL_ALAT_LIST.find((a) => a.id === item.id);
            const labMatch = INITIAL_LAB_LIST.find((l) => l.id === item.labId || (seed && l.id === seed.labId));
            const satuan = item.satuan || seed?.satuan || 'Unit';
            const jumlahTotal = item.jumlahTotal ?? seed?.jumlahTotal ?? 1;
            const jumlahTerpinjam = item.jumlahTerpinjam ?? seed?.jumlahTerpinjam ?? (item.statusKetersediaan === 'Sedang Dipinjam' ? 1 : 0);
            const jumlahTersedia = item.jumlahTersedia ?? seed?.jumlahTersedia ?? Math.max(0, jumlahTotal - jumlahTerpinjam);
            const gambarUrl = item.gambarUrl || seed?.gambarUrl;
            const namaLab = labMatch?.namaLab || seed?.namaLab || item.namaLab;
            const labId = labMatch?.id || item.labId || seed?.labId || '';
            return {
              ...item,
              labId,
              namaLab,
              satuan,
              jumlahTotal,
              jumlahTerpinjam,
              jumlahTersedia,
              gambarUrl
            };
          });

          // Ensure any newly added seed tools (e.g. for Lab Lingkungan) are also available
          INITIAL_ALAT_LIST.forEach((seedTool) => {
            if (!mapped.some((m) => m.id === seedTool.id)) {
              mapped.push(seedTool);
            }
          });

          return mapped;
        }
      } catch {
        return INITIAL_ALAT_LIST;
      }
    }
    return INITIAL_ALAT_LIST;
  });

  useEffect(() => {
    localStorage.setItem('sikma_alat_data', JSON.stringify(alatList));
  }, [alatList]);

  // 3. Bahan List persistence
  const [bahanList, setBahanList] = useState<DataBahanItem[]>(() => {
    const saved = localStorage.getItem('sikma_bahan_data');
    if (saved) {
      try {
        const parsed: DataBahanItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: DataBahanItem[] = parsed.map((item) => {
            const seed = INITIAL_BAHAN_LIST.find((b) => b.id === item.id);
            const labMatch = INITIAL_LAB_LIST.find((l) => l.id === item.labId || (seed && l.id === seed.labId));
            const namaLab = labMatch?.namaLab || seed?.namaLab || item.namaLab;
            const labId = labMatch?.id || item.labId || seed?.labId || '';
            const statusStok: DataBahanItem['statusStok'] =
              item.stok === 0 ? 'Habis' : item.stok <= item.stokMinimum ? 'Menipis' : 'Aman';
            return {
              ...item,
              labId,
              namaLab,
              statusStok
            };
          });

          // Ensure any newly added seed chemicals (e.g. for Lab Lingkungan) are also available
          INITIAL_BAHAN_LIST.forEach((seedBhn) => {
            if (!mapped.some((m) => m.id === seedBhn.id)) {
              mapped.push(seedBhn);
            }
          });

          return mapped;
        }
      } catch {
        return INITIAL_BAHAN_LIST;
      }
    }
    return INITIAL_BAHAN_LIST;
  });

  useEffect(() => {
    localStorage.setItem('sikma_bahan_data', JSON.stringify(bahanList));
  }, [bahanList]);

  // 4. Bon Alat persistence
  const [bonAlatList, setBonAlatList] = useState<BonAlatItem[]>(() => {
    const saved = localStorage.getItem('sikma_bon_alat_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_BON_ALAT_LIST;
      }
    }
    return INITIAL_BON_ALAT_LIST;
  });

  useEffect(() => {
    localStorage.setItem('sikma_bon_alat_data', JSON.stringify(bonAlatList));
  }, [bonAlatList]);

  // 5. Bon Bahan persistence
  const [bonBahanList, setBonBahanList] = useState<BonBahanItem[]>(() => {
    const saved = localStorage.getItem('sikma_bon_bahan_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_BON_BAHAN_LIST;
      }
    }
    return INITIAL_BON_BAHAN_LIST;
  });

  useEffect(() => {
    localStorage.setItem('sikma_bon_bahan_data', JSON.stringify(bonBahanList));
  }, [bonBahanList]);

  // Inter-tab preselection state
  const [preSelectedAlat, setPreSelectedAlat] = useState<DataAlatItem | null>(null);
  const [preSelectedBahan, setPreSelectedBahan] = useState<DataBahanItem | null>(null);
  const [filterLabIdForAlat, setFilterLabIdForAlat] = useState<string>('all');
  const [filterLabIdForBahan, setFilterLabIdForBahan] = useState<string>('all');

  const handleAjukanBonAlat = (alat: DataAlatItem) => {
    setPreSelectedAlat(alat);
    handleTabClick('bon-alat');
  };

  const handleAjukanBonBahan = (bahan: DataBahanItem) => {
    setPreSelectedBahan(bahan);
    handleTabClick('bon-bahan');
  };

  const handleGoToDataAlat = (labId: string) => {
    if (currentRole === 'mahasiswa') return;
    setFilterLabIdForAlat(labId);
    handleTabClick('data-alat');
  };

  const handleGoToDataBahan = (labId: string) => {
    if (currentRole === 'mahasiswa') return;
    setFilterLabIdForBahan(labId);
    handleTabClick('data-bahan');
  };

  // Helper filter for student personal data
  const isOwnBonAlat = (b: BonAlatItem) => {
    if (currentRole !== 'mahasiswa' || !currentUser) return true;
    const curName = (currentUser.nama || '').trim().toLowerCase();
    const curNim = (currentUser.identifier || '').replace(/\D/g, '');
    const curUsername = (currentUser.username || '').trim().toLowerCase();
    const bName = (b.namaMahasiswa || b.namaPeminjam || '').trim().toLowerCase();
    const bNim = (b.identitasPeminjam || '').replace(/\D/g, '');
    return Boolean(
      (curNim && bNim && (curNim === bNim || bNim.includes(curNim))) ||
      (curName && bName && (curName === bName || bName.includes(curName) || curName.includes(bName))) ||
      (curUsername && (bName.includes(curUsername) || (b.identitasPeminjam || '').toLowerCase().includes(curUsername)))
    );
  };

  const isOwnBonBahan = (b: BonBahanItem) => {
    if (currentRole !== 'mahasiswa' || !currentUser) return true;
    const curName = (currentUser.nama || '').trim().toLowerCase();
    const curNim = (currentUser.identifier || '').replace(/\D/g, '');
    const curUsername = (currentUser.username || '').trim().toLowerCase();
    const bName = (b.namaPemohon || '').trim().toLowerCase();
    const bNim = (b.identitasPemohon || '').replace(/\D/g, '');
    return Boolean(
      (curNim && bNim && (curNim === bNim || bNim.includes(curNim))) ||
      (curName && bName && (curName === bName || bName.includes(curName) || curName.includes(bName))) ||
      (curUsername && (bName.includes(curUsername) || (b.identitasPemohon || '').toLowerCase().includes(curUsername)))
    );
  };

  const visibleBonAlatList = currentRole === 'mahasiswa' ? bonAlatList.filter(isOwnBonAlat) : bonAlatList;
  const visibleBonBahanList = currentRole === 'mahasiswa' ? bonBahanList.filter(isOwnBonBahan) : bonBahanList;

  // Counters
  const pendingBonAlatCount = visibleBonAlatList.filter((b) => b.status === 'Menunggu Persetujuan').length;
  const pendingBonBahanCount = visibleBonBahanList.filter((b) => b.status === 'Menunggu Persetujuan').length;
  const availableAlatCount = alatList.filter((a) => a.statusKetersediaan === 'Tersedia').length;
  const safeBahanCount = bahanList.filter((b) => b.statusStok === 'Aman').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#002B49] text-white flex items-center justify-center shrink-0 shadow-sm">
              <FlaskConical className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Fasilitas & Layanan Riset
                </span>
                <span className="text-xs text-slate-400">FSTeM Universitas Brawijaya</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Laboratorium Departemen Kimia
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan master data laboratorium, inventaris instrumen analitik, reagen bahan kimia, dan layanan formulir bon peminjaman alat & bahan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600 font-medium">Standar K3 & ISO Lab</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">Laboratorium Aktif</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{labList.length} Lab</div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">Semua unit beroperasi</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">Instrumen & Alat</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{alatList.length} Unit</div>
            <div className="text-[10px] text-blue-700 mt-0.5 font-medium">{availableAlatCount} unit siap digunakan</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">Reagen & Bahan Kimia</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{bahanList.length} Item</div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">{safeBahanCount} stok aman</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              {currentRole === 'mahasiswa' ? 'Bon Pending Saya' : 'Permohonan Bon Pending'}
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {pendingBonAlatCount + pendingBonBahanCount} Pengajuan
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5 font-medium">
              {pendingBonAlatCount} Alat • {pendingBonBahanCount} Bahan
            </div>
          </div>
        </div>
      </div>

      {/* Submenu Pill Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200">
        <button
          onClick={() => handleTabClick('data-laboratorium')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'data-laboratorium'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${currentTab === 'data-laboratorium' ? 'text-[#D4AF37]' : ''}`} />
          <span>Data Laboratorium</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              currentTab === 'data-laboratorium' ? 'bg-[#D4AF37] text-[#002B49]' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {labList.length}
          </span>
        </button>

        {currentRole !== 'mahasiswa' && (
          <>
            <button
              onClick={() => handleTabClick('data-alat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'data-alat'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Microscope className={`w-3.5 h-3.5 ${currentTab === 'data-alat' ? 'text-[#D4AF37]' : ''}`} />
              <span>Data Alat</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === 'data-alat' ? 'bg-[#D4AF37] text-[#002B49]' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {alatList.length}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('data-bahan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'data-bahan'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <TestTube2 className={`w-3.5 h-3.5 ${currentTab === 'data-bahan' ? 'text-[#D4AF37]' : ''}`} />
              <span>Data Bahan</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === 'data-bahan' ? 'bg-[#D4AF37] text-[#002B49]' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {bahanList.length}
              </span>
            </button>
          </>
        )}

        <button
          onClick={() => handleTabClick('bon-alat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'bon-alat'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ClipboardList className={`w-3.5 h-3.5 ${currentTab === 'bon-alat' ? 'text-[#D4AF37]' : ''}`} />
          <span>{currentRole === 'mahasiswa' ? 'Bon Alat Saya' : 'Bon Alat'}</span>
          {pendingBonAlatCount > 0 ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white animate-pulse">
              {pendingBonAlatCount} Pending
            </span>
          ) : (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === 'bon-alat' ? 'bg-[#D4AF37] text-[#002B49]' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {visibleBonAlatList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('bon-bahan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'bon-bahan'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileSpreadsheet className={`w-3.5 h-3.5 ${currentTab === 'bon-bahan' ? 'text-[#D4AF37]' : ''}`} />
          <span>{currentRole === 'mahasiswa' ? 'Bon Bahan Saya' : 'Bon Bahan'}</span>
          {pendingBonBahanCount > 0 ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white animate-pulse">
              {pendingBonBahanCount} Pending
            </span>
          ) : (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === 'bon-bahan' ? 'bg-[#D4AF37] text-[#002B49]' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {visibleBonBahanList.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Sub-Tab View Content */}
      {currentTab === 'data-laboratorium' && (
        <DataLabTab
          labList={labList}
          setLabList={setLabList}
          currentRole={currentRole}
          onGoToDataAlat={handleGoToDataAlat}
          onGoToDataBahan={handleGoToDataBahan}
        />
      )}

      {currentTab === 'data-alat' && (
        <DataAlatTab
          alatList={alatList}
          setAlatList={setAlatList}
          labList={labList}
          currentRole={currentRole}
          onAjukanBonAlat={handleAjukanBonAlat}
          selectedLabFilter={filterLabIdForAlat}
        />
      )}

      {currentTab === 'data-bahan' && (
        <DataBahanTab
          bahanList={bahanList}
          setBahanList={setBahanList}
          labList={labList}
          currentRole={currentRole}
          onAjukanBonBahan={handleAjukanBonBahan}
          selectedLabFilter={filterLabIdForBahan}
        />
      )}

      {currentTab === 'bon-alat' && (
        <BonAlatTab
          bonList={bonAlatList}
          setBonList={setBonAlatList}
          alatList={alatList}
          setAlatList={setAlatList}
          labList={labList}
          currentRole={currentRole}
          currentUser={currentUser}
          selectedPreAlat={preSelectedAlat}
          onClearPreAlat={() => setPreSelectedAlat(null)}
        />
      )}

      {currentTab === 'bon-bahan' && (
        <BonBahanTab
          bonList={bonBahanList}
          setBonList={setBonBahanList}
          bahanList={bahanList}
          setBahanList={setBahanList}
          labList={labList}
          currentRole={currentRole}
          currentUser={currentUser}
          selectedPreBahan={preSelectedBahan}
          onClearPreBahan={() => setPreSelectedBahan(null)}
        />
      )}
    </div>
  );
};
