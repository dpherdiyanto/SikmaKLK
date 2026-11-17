import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Unsubscribe
} from 'firebase/firestore';
import { db, FirebaseUser, handleFirestoreError, OperationType } from '../firebase';
import {
  AdminStaff,
  AuthUser,
  Dosen,
  JadwalSeminar,
  LogbookLabItem,
  Mahasiswa,
  PembimbingLapanganStaff,
  PengajuanKLK,
  Pengumuman,
  PLPStaff,
  SuratPengajuan,
  UserRole,
  normalizeMahasiswaRole
} from '../types/sikma';
import { UserAccountItem } from '../data/userList';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'dp.herdiyanto@gmail.com';

export function isBootstrappedAdminEmail(email?: string | null, emailVerified?: boolean | null): boolean {
  return Boolean(emailVerified && email && email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL);
}

export function sanitizeDocId(rawId: string, fallbackPrefix = 'doc'): string {
  const cleaned = String(rawId || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 120);
  if (cleaned.length >= 1) return cleaned;
  return `${fallbackPrefix}_${Date.now()}`;
}

export function clampStr(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val.trim() : val != null ? String(val).trim() : fallback;
  return str.slice(0, maxLen);
}

export function stripUndefinedDeep<T>(value: T, depth = 0): T {
  if (depth > 14) return value;
  if (value === undefined) return null as unknown as T;
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string' && value.length > 200000) {
      // Prevent oversized base64 payloads from exceeding Firestore 1MB doc limit
      return '[Lampiran berukuran besar tersimpan lokal / gunakan tautan Google Drive]' as unknown as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .slice(0, 500)
      .map((item) => stripUndefinedDeep(item, depth + 1)) as unknown as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v !== undefined) {
      out[k] = stripUndefinedDeep(v, depth + 1);
    }
  }
  return out as T;
}

export async function ensureAdminRecordIfBootstrapped(firebaseUser: FirebaseUser): Promise<boolean> {
  if (!isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)) {
    return false;
  }
  const adminRef = doc(db, 'admins', firebaseUser.uid);
  try {
    const snap = await getDoc(adminRef);
    if (!snap.exists()) {
      await setDoc(adminRef, {
        uid: sanitizeDocId(firebaseUser.uid, 'admin'),
        email: clampStr(firebaseUser.email, 200),
        nama: clampStr(firebaseUser.displayName || 'Administrator Utama SIKMA', 200),
        role: 'super_admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(adminRef, {
        email: clampStr(firebaseUser.email, 200),
        nama: clampStr(firebaseUser.displayName || snap.data()?.nama || 'Administrator Utama SIKMA', 200),
        role: 'super_admin',
        updatedAt: serverTimestamp()
      });
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `admins/${firebaseUser.uid}`);
  }
}

export async function resolveOrCreateAuthUserFromGoogle(
  firebaseUser: FirebaseUser,
  localUsers: UserAccountItem[]
): Promise<AuthUser> {
  const uid = sanitizeDocId(firebaseUser.uid, 'usr');
  const email = clampStr(firebaseUser.email, 200).toLowerCase();
  const isRootAdmin = isBootstrappedAdminEmail(email, firebaseUser.emailVerified);

  if (isRootAdmin) {
    await ensureAdminRecordIfBootstrapped(firebaseUser);
  }

  // 1. Check user doc keyed by uid
  const userDocRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const resolvedRole: UserRole = isRootAdmin
        ? 'super_admin'
        : normalizeMahasiswaRole(data.role as string, data.unit as string);
      const nowStr =
        'Hari ini, ' +
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB';

      await updateDoc(userDocRef, {
        terakhirLogin: clampStr(nowStr, 120),
        updatedAt: serverTimestamp()
      });

      return {
        id: clampStr(data.id || uid, 128),
        username: clampStr(data.username || email, 100),
        nama: clampStr(data.nama || firebaseUser.displayName || 'Pengguna SIKMA', 200),
        role: resolvedRole,
        identifier: clampStr(data.identifier || '', 100),
        email: clampStr(data.email || email, 200),
        avatarText: clampStr(
          data.avatarText || (firebaseUser.displayName || 'U').slice(0, 2).toUpperCase(),
          10
        ),
        unit: clampStr(data.unit || 'Departemen Kimia FSTeM UB', 300),
        jabatan: clampStr(data.jabatan || '', 300),
        lastLogin: 'Baru saja',
        mustChangePassword: false,
        isFirstLogin: false
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }

  // 2. Match against local pre-registered accounts by email (e.g. if created locally)
  const localMatch = localUsers.find(
    (u) => u.email && u.email.toLowerCase().trim() === email
  );

  // Only bootstrapped admin can self-assign super_admin; others start as mahasiswa_s1
  const assignedRole: UserRole = isRootAdmin
    ? 'super_admin'
    : 'mahasiswa_s1';

  const displayName = clampStr(
    localMatch?.nama || firebaseUser.displayName || (email.split('@')[0] || 'Pengguna UB'),
    200
  );
  const avatarText = clampStr(
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'UB',
    10
  );
  const username = clampStr(localMatch?.username || email.split('@')[0] || uid, 100);
  const identifier = clampStr(
    isRootAdmin ? 'SA-001' : localMatch?.identifier || uid.slice(0, 12).toUpperCase(),
    100
  );
  const unit = clampStr(
    isRootAdmin
      ? 'Administrator Utama Departemen Kimia FSTeM Universitas Brawijaya'
      : localMatch?.unit || 'Program Studi S1 Kimia - FSTeM Universitas Brawijaya',
    300
  );
  const jabatan = clampStr(
    isRootAdmin
      ? 'Super Administrator Sistem SIKMA'
      : localMatch?.jabatan || 'Mahasiswa Kimia UB',
    300
  );

  const nowStr =
    'Hari ini, ' +
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
    ' WIB';

  try {
    await setDoc(userDocRef, {
      id: uid,
      ownerUid: uid,
      username,
      nama: displayName,
      role: assignedRole,
      identifier,
      email,
      avatarText,
      unit,
      jabatan,
      status: 'Aktif',
      noHp: clampStr(localMatch?.noHp || '', 40),
      terakhirLogin: clampStr(nowStr, 120),
      mustChangePassword: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${uid}`);
  }

  return {
    id: uid,
    username,
    nama: displayName,
    role: assignedRole,
    identifier,
    email,
    avatarText,
    unit,
    jabatan,
    lastLogin: 'Login Pertama Kali',
    mustChangePassword: false,
    isFirstLogin: false
  };
}

export interface RemoteSyncMeta {
  knownIds: Record<string, Set<string>>;
  ownerMap: Record<string, Record<string, string>>;
  hashes: Record<string, Record<string, string>>;
}

export function createEmptyRemoteSyncMeta(): RemoteSyncMeta {
  return {
    knownIds: {},
    ownerMap: {},
    hashes: {}
  };
}

function stableHash(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(Date.now());
  }
}

export interface SubscriptionCallbacks {
  onKlkUpdate: (items: PengajuanKLK[]) => void;
  onUsersUpdate: (items: UserAccountItem[]) => void;
  onDosenUpdate: (items: Dosen[]) => void;
  onMahasiswaUpdate: (items: Mahasiswa[]) => void;
  onAdminUpdate: (items: AdminStaff[]) => void;
  onPlpUpdate: (items: PLPStaff[]) => void;
  onPembimbingUpdate: (items: PembimbingLapanganStaff[]) => void;
  onLogbooksUpdate: (items: LogbookLabItem[]) => void;
  onSeminarsUpdate: (items: JadwalSeminar[]) => void;
  onSuratUpdate: (items: SuratPengajuan[]) => void;
  onPengumumanUpdate: (items: Pengumuman[]) => void;
  onRemoteReady?: (collectionName: string, count: number) => void;
}

export function subscribeSikmaCollections(
  firebaseUser: FirebaseUser,
  role: UserRole,
  meta: RemoteSyncMeta,
  callbacks: SubscriptionCallbacks
): Unsubscribe {
  const uid = sanitizeDocId(firebaseUser.uid, 'usr');
  const isRootAdmin = isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified);
  const unsubs: Unsubscribe[] = [];

  const recordCollectionMeta = (
    colName: string,
    docs: { id: string; ownerUid?: string; payload: unknown }[]
  ) => {
    const idSet = new Set<string>();
    const owners: Record<string, string> = {};
    const hashes: Record<string, string> = {};
    for (const d of docs) {
      idSet.add(d.id);
      if (d.ownerUid) owners[d.id] = d.ownerUid;
      hashes[d.id] = stableHash(d.payload);
    }
    meta.knownIds[colName] = idSet;
    meta.ownerMap[colName] = owners;
    meta.hashes[colName] = hashes;
  };

  // 1. KLK Submissions (merge primary + DPA queries safely for dosen)
  const primaryKlkMap = new Map<string, { ownerUid?: string; item: PengajuanKLK }>();
  const dpaKlkMap = new Map<string, { ownerUid?: string; item: PengajuanKLK }>();

  const emitMergedKlk = () => {
    const mergedMap = new Map<string, { ownerUid?: string; item: PengajuanKLK }>();
    primaryKlkMap.forEach((v, k) => mergedMap.set(k, v));
    dpaKlkMap.forEach((v, k) => mergedMap.set(k, v));

    const list: PengajuanKLK[] = [];
    const metaDocs: { id: string; ownerUid?: string; payload: unknown }[] = [];
    mergedMap.forEach((entry, docId) => {
      list.push(entry.item);
      metaDocs.push({ id: docId, ownerUid: entry.ownerUid, payload: entry.item });
    });
    recordCollectionMeta('klk_submissions', metaDocs);
    callbacks.onKlkUpdate(list);
    callbacks.onRemoteReady?.('klk_submissions', list.length);
  };

  const klkQuery = isRootAdmin
    ? collection(db, 'klk_submissions')
    : role === 'dosen'
    ? query(collection(db, 'klk_submissions'), where('assignedDosenUid', '==', uid))
    : role === 'eksternal'
    ? query(collection(db, 'klk_submissions'), where('pembimbingLapanganUid', '==', uid))
    : query(collection(db, 'klk_submissions'), where('ownerUid', '==', uid));

  unsubs.push(
    onSnapshot(
      klkQuery,
      (snap) => {
        primaryKlkMap.clear();
        snap.forEach((docSnap) => {
          const raw = docSnap.data();
          if (raw && raw.data && typeof raw.data === 'object') {
            const item = { ...(raw.data as PengajuanKLK), id: (raw.data as PengajuanKLK).id || docSnap.id };
            primaryKlkMap.set(docSnap.id, { ownerUid: raw.ownerUid as string, item });
          }
        });
        emitMergedKlk();
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'klk_submissions')
    )
  );

  if (!isRootAdmin && role === 'dosen') {
    const dpaQuery = query(collection(db, 'klk_submissions'), where('assignedDpaUid', '==', uid));
    unsubs.push(
      onSnapshot(
        dpaQuery,
        (snap) => {
          dpaKlkMap.clear();
          snap.forEach((docSnap) => {
            const raw = docSnap.data();
            if (raw && raw.data && typeof raw.data === 'object') {
              const item = { ...(raw.data as PengajuanKLK), id: (raw.data as PengajuanKLK).id || docSnap.id };
              dpaKlkMap.set(docSnap.id, { ownerUid: raw.ownerUid as string, item });
            }
          });
          emitMergedKlk();
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'klk_submissions')
      )
    );
  }

  // 2. Users (admin sees all, others see own doc)
  const usersQuery = isRootAdmin
    ? collection(db, 'users')
    : query(collection(db, 'users'), where('ownerUid', '==', uid));

  unsubs.push(
    onSnapshot(
      usersQuery,
      (snap) => {
        const list: UserAccountItem[] = [];
        const metaDocs: { id: string; ownerUid?: string; payload: unknown }[] = [];
        snap.forEach((docSnap) => {
          const raw = docSnap.data();
          if (raw) {
            const item: UserAccountItem = {
              id: clampStr(raw.id || docSnap.id, 128),
              username: clampStr(raw.username || '', 100),
              nama: clampStr(raw.nama || '', 200),
              role: normalizeMahasiswaRole(raw.role as string, raw.unit as string),
              identifier: clampStr(raw.identifier || '', 100),
              email: clampStr(raw.email || '', 200),
              avatarText: clampStr(raw.avatarText || 'UB', 10),
              unit: clampStr(raw.unit || '', 300),
              jabatan: clampStr(raw.jabatan || '', 300),
              status: raw.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif',
              noHp: clampStr(raw.noHp || '', 40),
              tanggalDibuat: clampStr(raw.tanggalDibuat || '', 40) || new Date().toISOString().split('T')[0],
              terakhirLogin: clampStr(raw.terakhirLogin || 'Belum pernah login', 120),
              mustChangePassword: Boolean(raw.mustChangePassword),
              passwordChangedAt: raw.passwordChangedAt ? String(raw.passwordChangedAt) : undefined
            };
            list.push(item);
            metaDocs.push({ id: docSnap.id, ownerUid: raw.ownerUid as string, payload: item });
          }
        });
        recordCollectionMeta('users', metaDocs);
        if (list.length > 0) {
          callbacks.onUsersUpdate(list);
        }
        callbacks.onRemoteReady?.('users', list.length);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'users')
    )
  );

  // 3. SDM Directory (non-PII) + optional SDM Private PII hydration for Root Admin
  const sdmDirDocs = new Map<string, { category: string; ownerUid?: string; payload: Record<string, unknown> }>();
  const sdmPrivateMap = new Map<string, { email?: string; noHp?: string }>();
  let hasDirSnapshot = false;

  const emitSdmLists = () => {
    if (!hasDirSnapshot) return;
    const dosen: Dosen[] = [];
    const mahasiswa: Mahasiswa[] = [];
    const admin: AdminStaff[] = [];
    const plp: PLPStaff[] = [];
    const pembimbing: PembimbingLapanganStaff[] = [];

    const byCatMeta: Record<string, { id: string; ownerUid?: string; payload: unknown }[]> = {
      dosen: [],
      mahasiswa: [],
      admin: [],
      plp: [],
      pembimbing_lapangan: []
    };

    sdmDirDocs.forEach((entry, docId) => {
      const pii = isRootAdmin ? sdmPrivateMap.get(docId) : undefined;
      const mergedPayload: Record<string, unknown> = {
        ...entry.payload,
        email: pii?.email || (typeof entry.payload.email === 'string' ? entry.payload.email : ''),
        telepon: pii?.noHp || (typeof entry.payload.telepon === 'string' ? entry.payload.telepon : '')
      };

      const catKey = `sdm_directory_${entry.category}`;
      if (!byCatMeta[entry.category]) byCatMeta[entry.category] = [];
      byCatMeta[entry.category].push({ id: docId, ownerUid: entry.ownerUid, payload: entry.payload });
      if (!meta.knownIds[catKey]) meta.knownIds[catKey] = new Set<string>();

      switch (entry.category) {
        case 'dosen':
          dosen.push(mergedPayload as unknown as Dosen);
          break;
        case 'mahasiswa':
          mahasiswa.push(mergedPayload as unknown as Mahasiswa);
          break;
        case 'admin':
          admin.push(mergedPayload as unknown as AdminStaff);
          break;
        case 'plp':
          plp.push(mergedPayload as unknown as PLPStaff);
          break;
        case 'pembimbing_lapangan':
          pembimbing.push(mergedPayload as unknown as PembimbingLapanganStaff);
          break;
      }
    });

    for (const [cat, docs] of Object.entries(byCatMeta)) {
      recordCollectionMeta(`sdm_directory_${cat}`, docs);
    }

    if (dosen.length > 0) callbacks.onDosenUpdate(dosen);
    if (mahasiswa.length > 0) callbacks.onMahasiswaUpdate(mahasiswa);
    if (admin.length > 0) callbacks.onAdminUpdate(admin);
    if (plp.length > 0) callbacks.onPlpUpdate(plp);
    if (pembimbing.length > 0) callbacks.onPembimbingUpdate(pembimbing);
    callbacks.onRemoteReady?.('sdm_directory', sdmDirDocs.size);
  };

  const sdmDirQuery = query(collection(db, 'sdm_directory'), where('isDirectoryVisible', '==', true));
  unsubs.push(
    onSnapshot(
      sdmDirQuery,
      (snap) => {
        hasDirSnapshot = true;
        sdmDirDocs.clear();
        snap.forEach((docSnap) => {
          const raw = docSnap.data();
          if (!raw || !raw.data || typeof raw.data !== 'object') return;
          sdmDirDocs.set(docSnap.id, {
            category: String(raw.category || ''),
            ownerUid: raw.ownerUid as string,
            payload: raw.data as Record<string, unknown>
          });
        });
        emitSdmLists();
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'sdm_directory')
    )
  );

  if (isRootAdmin) {
    unsubs.push(
      onSnapshot(
        collection(db, 'sdm_private'),
        (snap) => {
          sdmPrivateMap.clear();
          snap.forEach((docSnap) => {
            const raw = docSnap.data();
            if (raw) {
              sdmPrivateMap.set(docSnap.id, {
                email: typeof raw.email === 'string' ? raw.email : '',
                noHp: typeof raw.noHp === 'string' ? raw.noHp : ''
              });
            }
          });
          emitSdmLists();
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'sdm_private')
      )
    );
  }

  // 4. Lab Logbooks
  const logbookQuery = isRootAdmin
    ? collection(db, 'logbooks')
    : role === 'dosen'
    ? query(collection(db, 'logbooks'), where('assignedDosenUid', '==', uid))
    : query(collection(db, 'logbooks'), where('ownerUid', '==', uid));

  unsubs.push(
    onSnapshot(
      logbookQuery,
      (snap) => {
        const list: LogbookLabItem[] = [];
        const metaDocs: { id: string; ownerUid?: string; payload: unknown }[] = [];
        snap.forEach((docSnap) => {
          const raw = docSnap.data();
          if (raw?.data) {
            const item = raw.data as LogbookLabItem;
            list.push(item);
            metaDocs.push({ id: docSnap.id, ownerUid: raw.ownerUid as string, payload: item });
          }
        });
        recordCollectionMeta('logbooks', metaDocs);
        if (list.length > 0) callbacks.onLogbooksUpdate(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'logbooks')
    )
  );

  // 5. Seminars
  const seminarQuery = isRootAdmin
    ? collection(db, 'seminars')
    : query(collection(db, 'seminars'), where('isPublicSchedule', '==', true));

  unsubs.push(
    onSnapshot(
      seminarQuery,
      (snap) => {
        const list: JadwalSeminar[] = [];
        const metaDocs: { id: string; ownerUid?: string; payload: unknown }[] = [];
        snap.forEach((docSnap) => {
          const raw = docSnap.data();
          if (raw?.data) {
            const item = raw.data as JadwalSeminar;
            list.push(item);
            metaDocs.push({ id: docSnap.id, ownerUid: raw.ownerUid as string, payload: item });
          }
        });
        recordCollectionMeta('seminars', metaDocs);
        if (list.length > 0) callbacks.onSeminarsUpdate(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'seminars')
    )
  );

  // 6. Surat Pengajuan
  const suratQuery = isRootAdmin
    ? collection(db, 'surat_pengajuan')
    : query(collection(db, 'surat_pengajuan'), where('ownerUid', '==', uid));

  unsubs.push(
    onSnapshot(
      suratQuery,
      (snap) => {
        const list: SuratPengajuan[] = [];
        const metaDocs: { id: string; ownerUid?: string; payload: unknown }[] = [];
        snap.forEach((docSnap) => {
          const raw = docSnap.data();
          if (raw?.data) {
            const item = raw.data as SuratPengajuan;
            list.push(item);
            metaDocs.push({ id: docSnap.id, ownerUid: raw.ownerUid as string, payload: item });
          }
        });
        recordCollectionMeta('surat_pengajuan', metaDocs);
        if (list.length > 0) callbacks.onSuratUpdate(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'surat_pengajuan')
    )
  );

  // 7. Pengumuman
  const pengumumanQuery = isRootAdmin
    ? collection(db, 'pengumuman')
    : query(collection(db, 'pengumuman'), where('isPublicAnnouncement', '==', true));

  unsubs.push(
    onSnapshot(
      pengumumanQuery,
      (snap) => {
        const list: Pengumuman[] = [];
        const metaDocs: { id: string; ownerUid?: string; payload: unknown }[] = [];
        snap.forEach((docSnap) => {
          const raw = docSnap.data();
          if (raw?.data) {
            const item = raw.data as Pengumuman;
            list.push(item);
            metaDocs.push({ id: docSnap.id, ownerUid: raw.ownerUid as string, payload: item });
          }
        });
        recordCollectionMeta('pengumuman', metaDocs);
        callbacks.onPengumumanUpdate(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'pengumuman')
    )
  );

  return () => {
    unsubs.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore cleanup error
      }
    });
  };
}

export async function syncKlkListToFirestore(
  items: PengajuanKLK[],
  firebaseUser: FirebaseUser,
  meta: RemoteSyncMeta,
  allowDeletes = false
): Promise<void> {
  const colName = 'klk_submissions';
  const uid = sanitizeDocId(firebaseUser.uid, 'usr');
  const known = meta.knownIds[colName] || new Set<string>();
  const prevHashes = meta.hashes[colName] || {};
  const ownerMap = meta.ownerMap[colName] || {};
  const currentIds = new Set<string>();

  for (const item of items) {
    const docId = sanitizeDocId(item.id, 'klk');
    currentIds.add(docId);
    const cleanData = stripUndefinedDeep(item);
    const nextHash = stableHash(cleanData);
    if (known.has(docId) && prevHashes[docId] === nextHash) {
      continue;
    }

    const docRef = doc(db, colName, docId);
    const baseFields = {
      assignedDosenUid: clampStr((item as unknown as Record<string, unknown>).assignedDosenUid || '', 128),
      assignedDpaUid: clampStr((item as unknown as Record<string, unknown>).assignedDpaUid || '', 128),
      pembimbingLapanganUid: clampStr((item as unknown as Record<string, unknown>).pembimbingLapanganUid || '', 128),
      mahasiswaId: clampStr(item.mahasiswaId || '', 128),
      mahasiswaNama: clampStr(item.mahasiswaNama || 'Mahasiswa', 200) || 'Mahasiswa',
      nim: clampStr(item.nim || '-', 60) || '-',
      skema: clampStr(item.skema || '', 120),
      instansiNama: clampStr(item.namaMitra || '', 250),
      status: clampStr(item.status || 'Draft', 80) || 'Draft',
      data: cleanData as unknown as Record<string, unknown>
    };

    try {
      if (known.has(docId)) {
        await updateDoc(docRef, {
          ...baseFields,
          updatedAt: serverTimestamp()
        });
      } else {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, {
            ...baseFields,
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(docRef, {
            id: docId,
            ownerUid: ownerMap[docId] || uid,
            ...baseFields,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        known.add(docId);
      }
      prevHashes[docId] = nextHash;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colName}/${docId}`);
    }
  }

  if (allowDeletes) {
    for (const oldId of Array.from(known)) {
      if (!currentIds.has(oldId)) {
        try {
          await deleteDoc(doc(db, colName, oldId));
          known.delete(oldId);
          delete prevHashes[oldId];
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${colName}/${oldId}`);
        }
      }
    }
  }

  meta.knownIds[colName] = known;
  meta.hashes[colName] = prevHashes;
}

export async function syncUsersListToFirestore(
  items: UserAccountItem[],
  firebaseUser: FirebaseUser,
  meta: RemoteSyncMeta,
  allowDeletes = false
): Promise<void> {
  const colName = 'users';
  const uid = sanitizeDocId(firebaseUser.uid, 'usr');
  const isRootAdmin = isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified);
  if (!isRootAdmin) return;

  const known = meta.knownIds[colName] || new Set<string>();
  const prevHashes = meta.hashes[colName] || {};
  const ownerMap = meta.ownerMap[colName] || {};
  const currentIds = new Set<string>();

  for (const item of items) {
    const docId = sanitizeDocId(item.id, 'user');
    currentIds.add(docId);
    const cleanPayload = {
      id: docId,
      username: clampStr(item.username || docId, 100),
      nama: clampStr(item.nama || 'Pengguna', 200),
      role: normalizeMahasiswaRole(item.role, item.unit),
      identifier: clampStr(item.identifier || '', 100),
      email: clampStr(item.email || '', 200),
      avatarText: clampStr(item.avatarText || 'UB', 10),
      unit: clampStr(item.unit || '', 300),
      jabatan: clampStr(item.jabatan || '', 300),
      status: item.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif',
      noHp: clampStr(item.noHp || '', 40),
      terakhirLogin: clampStr(item.terakhirLogin || 'Belum pernah login', 120),
      mustChangePassword: Boolean(item.mustChangePassword),
      ...(item.passwordChangedAt ? { passwordChangedAt: clampStr(item.passwordChangedAt, 80) } : {})
    };
    const nextHash = stableHash(cleanPayload);
    if (known.has(docId) && prevHashes[docId] === nextHash) {
      continue;
    }

    const docRef = doc(db, colName, docId);
    try {
      if (known.has(docId)) {
        await updateDoc(docRef, {
          ...cleanPayload,
          updatedAt: serverTimestamp()
        });
      } else {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, {
            ...cleanPayload,
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(docRef, {
            ...cleanPayload,
            ownerUid: ownerMap[docId] || uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        known.add(docId);
      }
      prevHashes[docId] = nextHash;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colName}/${docId}`);
    }
  }

  if (allowDeletes) {
    for (const oldId of Array.from(known)) {
      if (!currentIds.has(oldId)) {
        try {
          await deleteDoc(doc(db, colName, oldId));
          known.delete(oldId);
          delete prevHashes[oldId];
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${colName}/${oldId}`);
        }
      }
    }
  }

  meta.knownIds[colName] = known;
  meta.hashes[colName] = prevHashes;
}

export async function syncSdmCategoryToFirestore(
  category: 'dosen' | 'mahasiswa' | 'admin' | 'plp' | 'pembimbing_lapangan',
  items: Array<Record<string, unknown> & { id: string; nama: string }>,
  firebaseUser: FirebaseUser,
  meta: RemoteSyncMeta,
  allowDeletes = false
): Promise<void> {
  const isRootAdmin = isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified);
  if (!isRootAdmin) return;

  const colName = 'sdm_directory';
  const catMetaKey = `${colName}_${category}`;
  const uid = sanitizeDocId(firebaseUser.uid, 'usr');
  const known = meta.knownIds[catMetaKey] || new Set<string>();
  const prevHashes = meta.hashes[catMetaKey] || {};
  const currentIds = new Set<string>();

  for (const item of items) {
    const docId = sanitizeDocId(`${category}_${item.id}`, 'sdm');
    currentIds.add(docId);

    // Strip PII from public sdm_directory per Pillar 6
    const publicCopy: Record<string, unknown> = { ...item };
    const privateEmail = clampStr(publicCopy.email || '', 200);
    const privatePhone = clampStr(publicCopy.telepon || publicCopy.noHp || '', 40);
    delete publicCopy.email;
    delete publicCopy.telepon;
    delete publicCopy.noHp;
    delete publicCopy.noHpOrangTua;
    delete publicCopy.alamat;

    const cleanPublic = stripUndefinedDeep(publicCopy);
    const nextHash = stableHash({ cleanPublic, privateEmail, privatePhone });
    if (known.has(docId) && prevHashes[docId] === nextHash) {
      continue;
    }

    const dirPayload = {
      id: docId,
      category,
      nama: clampStr(item.nama || 'SDM Kimia UB', 200) || 'SDM Kimia UB',
      identifier: clampStr(item.nip || item.nim || item.nidn || item.id || '', 100),
      unit: clampStr(item.unit || item.lab || item.programStudi || '', 300),
      jabatan: clampStr(item.jabatan || item.jabatanAkademik || '', 300),
      status: clampStr(item.status || 'Aktif', 60),
      isDirectoryVisible: true,
      data: cleanPublic
    };

    const dirRef = doc(db, colName, docId);
    try {
      if (known.has(docId)) {
        await updateDoc(dirRef, {
          ...dirPayload,
          updatedAt: serverTimestamp()
        });
      } else {
        const snap = await getDoc(dirRef);
        if (snap.exists()) {
          await updateDoc(dirRef, {
            ...dirPayload,
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(dirRef, {
            ...dirPayload,
            ownerUid: uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        known.add(docId);
      }

      // Write isolated PII into sdm_private if present
      if (privateEmail || privatePhone) {
        const piiRef = doc(db, 'sdm_private', docId);
        const piiSnap = await getDoc(piiRef);
        if (piiSnap.exists()) {
          await updateDoc(piiRef, {
            email: privateEmail,
            noHp: privatePhone,
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(piiRef, {
            id: docId,
            ownerUid: uid,
            email: privateEmail,
            noHp: privatePhone,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
      prevHashes[docId] = nextHash;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colName}/${docId}`);
    }
  }

  if (allowDeletes) {
    for (const oldId of Array.from(known)) {
      if (!currentIds.has(oldId)) {
        try {
          await deleteDoc(doc(db, colName, oldId));
          known.delete(oldId);
          delete prevHashes[oldId];
          try {
            await deleteDoc(doc(db, 'sdm_private', oldId));
          } catch {
            // sdm_private may not exist if no PII was set
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${colName}/${oldId}`);
        }
      }
    }
  }

  meta.knownIds[catMetaKey] = known;
  meta.hashes[catMetaKey] = prevHashes;
}

export async function syncLogbooksToFirestore(
  items: LogbookLabItem[],
  firebaseUser: FirebaseUser,
  meta: RemoteSyncMeta,
  allowDeletes = false
): Promise<void> {
  const colName = 'logbooks';
  const uid = sanitizeDocId(firebaseUser.uid, 'usr');
  const known = meta.knownIds[colName] || new Set<string>();
  const prevHashes = meta.hashes[colName] || {};
  const ownerMap = meta.ownerMap[colName] || {};
  const currentIds = new Set<string>();

  for (const item of items) {
    const docId = sanitizeDocId(item.id, 'log');
    currentIds.add(docId);
    const cleanData = stripUndefinedDeep(item);
    const nextHash = stableHash(cleanData);
    if (known.has(docId) && prevHashes[docId] === nextHash) continue;

    const payload = {
      assignedDosenUid: clampStr((item as unknown as Record<string, unknown>).assignedDosenUid || '', 128),
      mahasiswaNama: clampStr(item.mahasiswaNama || 'Mahasiswa', 200),
      nim: clampStr(item.nim || '-', 60),
      status: clampStr(item.statusVerifikasi || 'Menunggu Verifikasi', 60) || 'Menunggu Verifikasi',
      data: cleanData as unknown as Record<string, unknown>
    };
    const docRef = doc(db, colName, docId);
    try {
      if (known.has(docId)) {
        await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
      } else {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(docRef, {
            id: docId,
            ownerUid: ownerMap[docId] || uid,
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        known.add(docId);
      }
      prevHashes[docId] = nextHash;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colName}/${docId}`);
    }
  }

  if (allowDeletes) {
    for (const oldId of Array.from(known)) {
      if (!currentIds.has(oldId)) {
        try {
          await deleteDoc(doc(db, colName, oldId));
          known.delete(oldId);
          delete prevHashes[oldId];
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${colName}/${oldId}`);
        }
      }
    }
  }

  meta.knownIds[colName] = known;
  meta.hashes[colName] = prevHashes;
}

export async function syncSeminarsToFirestore(
  items: JadwalSeminar[],
  firebaseUser: FirebaseUser,
  meta: RemoteSyncMeta,
  allowDeletes = false
): Promise<void> {
  const colName = 'seminars';
  const uid = sanitizeDocId(firebaseUser.uid, 'usr');
  const known = meta.knownIds[colName] || new Set<string>();
  const prevHashes = meta.hashes[colName] || {};
  const ownerMap = meta.ownerMap[colName] || {};
  const currentIds = new Set<string>();

  for (const item of items) {
    const docId = sanitizeDocId(item.id, 'sem');
    currentIds.add(docId);
    const cleanData = stripUndefinedDeep(item);
    const nextHash = stableHash(cleanData);
    if (known.has(docId) && prevHashes[docId] === nextHash) continue;

    const payload = {
      isPublicSchedule: true,
      mahasiswaNama: clampStr(item.mahasiswaNama || 'Mahasiswa', 200),
      nim: clampStr(item.nim || '-', 60),
      status: clampStr(item.status || 'Terjadwal', 60) || 'Terjadwal',
      data: cleanData as unknown as Record<string, unknown>
    };
    const docRef = doc(db, colName, docId);
    try {
      if (known.has(docId)) {
        await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
      } else {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(docRef, {
            id: docId,
            ownerUid: ownerMap[docId] || uid,
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        known.add(docId);
      }
      prevHashes[docId] = nextHash;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colName}/${docId}`);
    }
  }

  if (allowDeletes) {
    for (const oldId of Array.from(known)) {
      if (!currentIds.has(oldId)) {
        try {
          await deleteDoc(doc(db, colName, oldId));
          known.delete(oldId);
          delete prevHashes[oldId];
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${colName}/${oldId}`);
        }
      }
    }
  }

  meta.knownIds[colName] = known;
  meta.hashes[colName] = prevHashes;
}

export async function syncSuratListToFirestore(
  items: SuratPengajuan[],
  firebaseUser: FirebaseUser,
  meta: RemoteSyncMeta,
  allowDeletes = false
): Promise<void> {
  const colName = 'surat_pengajuan';
  const uid = sanitizeDocId(firebaseUser.uid, 'usr');
  const known = meta.knownIds[colName] || new Set<string>();
  const prevHashes = meta.hashes[colName] || {};
  const ownerMap = meta.ownerMap[colName] || {};
  const currentIds = new Set<string>();

  for (const item of items) {
    const docId = sanitizeDocId(item.id, 'srt');
    currentIds.add(docId);
    const cleanData = stripUndefinedDeep(item);
    const nextHash = stableHash(cleanData);
    if (known.has(docId) && prevHashes[docId] === nextHash) continue;

    const payload = {
      mahasiswaNama: clampStr(item.mahasiswaNama || 'Mahasiswa', 200),
      nim: clampStr(item.nim || '-', 60),
      jenisSurat: clampStr(item.jenis || 'Surat Akademik', 160),
      status: clampStr(item.status || 'Diajukan', 60) || 'Diajukan',
      data: cleanData as unknown as Record<string, unknown>
    };
    const docRef = doc(db, colName, docId);
    try {
      if (known.has(docId)) {
        await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
      } else {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(docRef, {
            id: docId,
            ownerUid: ownerMap[docId] || uid,
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        known.add(docId);
      }
      prevHashes[docId] = nextHash;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colName}/${docId}`);
    }
  }

  if (allowDeletes) {
    for (const oldId of Array.from(known)) {
      if (!currentIds.has(oldId)) {
        try {
          await deleteDoc(doc(db, colName, oldId));
          known.delete(oldId);
          delete prevHashes[oldId];
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${colName}/${oldId}`);
        }
      }
    }
  }

  meta.knownIds[colName] = known;
  meta.hashes[colName] = prevHashes;
}

export async function syncPengumumanListToFirestore(
  items: Pengumuman[],
  firebaseUser: FirebaseUser,
  meta: RemoteSyncMeta,
  allowDeletes = false
): Promise<void> {
  if (!isBootstrappedAdminEmail(firebaseUser.email, firebaseUser.emailVerified)) return;
  const colName = 'pengumuman';
  const uid = sanitizeDocId(firebaseUser.uid, 'usr');
  const known = meta.knownIds[colName] || new Set<string>();
  const prevHashes = meta.hashes[colName] || {};
  const currentIds = new Set<string>();

  for (const item of items) {
    const docId = sanitizeDocId(item.id, 'ann');
    currentIds.add(docId);
    const cleanData = stripUndefinedDeep(item);
    const nextHash = stableHash(cleanData);
    if (known.has(docId) && prevHashes[docId] === nextHash) continue;

    const payload = {
      isPublicAnnouncement: true,
      judul: clampStr(item.judul || 'Pengumuman', 250) || 'Pengumuman',
      kategori: clampStr(item.kategori || 'Akademik', 80),
      data: cleanData as unknown as Record<string, unknown>
    };
    const docRef = doc(db, colName, docId);
    try {
      if (known.has(docId)) {
        await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
      } else {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(docRef, {
            id: docId,
            ownerUid: uid,
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        known.add(docId);
      }
      prevHashes[docId] = nextHash;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colName}/${docId}`);
    }
  }

  if (allowDeletes) {
    for (const oldId of Array.from(known)) {
      if (!currentIds.has(oldId)) {
        try {
          await deleteDoc(doc(db, colName, oldId));
          known.delete(oldId);
          delete prevHashes[oldId];
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${colName}/${oldId}`);
        }
      }
    }
  }

  meta.knownIds[colName] = known;
  meta.hashes[colName] = prevHashes;
}

export async function checkCollectionHasDocs(colName: string): Promise<boolean> {
  try {
    const snap = await getDocs(query(collection(db, colName), limit(1)));
    return !snap.empty;
  } catch {
    return false;
  }
}
