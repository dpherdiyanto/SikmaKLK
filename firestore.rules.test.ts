// Phase 0: Security Test Vectors & Invariant Checks for SIKMA Firestore Rules
// Verifies payload shapes, ID regex guards, size bounds, and Dirty Dozen rejection criteria.

export interface SecurityTestCase {
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  expected: 'PERMISSION_DENIED' | 'ALLOWED';
  payload?: Record<string, unknown>;
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    name: '1. Unauthenticated Write to klk_submissions',
    collection: 'klk_submissions',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { id: 'klk_1', ownerUid: 'anon' }
  },
  {
    name: '2. Unverified Admin Email Spoof',
    collection: 'users',
    operation: 'get',
    expected: 'PERMISSION_DENIED'
  },
  {
    name: '3. Self-Assigned Admin Creation',
    collection: 'admins',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { uid: 'attacker_uid', email: 'attacker@example.com', nama: 'Attacker', role: 'super_admin' }
  },
  {
    name: '4. Role Escalation in User Creation',
    collection: 'users',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { id: 'u_1', ownerUid: 'attacker_uid', username: 'att', nama: 'Attacker', role: 'admin', status: 'Aktif' }
  },
  {
    name: '5. Owner Spoofing on KLK Submission',
    collection: 'klk_submissions',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { id: 'klk_spoof', ownerUid: 'other_student_uid', mahasiswaNama: 'Fake', nim: '123', status: 'Draft', data: {} }
  },
  {
    name: '6. Shadow Field Injection',
    collection: 'klk_submissions',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { id: 'klk_shadow', ownerUid: 'u1', mahasiswaNama: 'A', nim: '1', status: 'Draft', data: {}, isBypass: true }
  },
  {
    name: '7. Document ID Poisoning',
    collection: 'klk_submissions',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { id: 'bad$id!@#', ownerUid: 'u1' }
  },
  {
    name: '8. String Size & Type Poisoning',
    collection: 'klk_submissions',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    payload: { mahasiswaNama: 12345 }
  },
  {
    name: '9. Forged Client Timestamp',
    collection: 'logbooks',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { id: 'log_1', ownerUid: 'u1', status: 'Pending', data: {}, createdAt: '1999-01-01T00:00:00Z' }
  },
  {
    name: '10. Terminal State Modification by Student',
    collection: 'klk_submissions',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    payload: { status: 'Draft' }
  },
  {
    name: '11. Non-Owner PII Access on sdm_private',
    collection: 'sdm_private',
    operation: 'get',
    expected: 'PERMISSION_DENIED'
  },
  {
    name: '12. Unscoped List Query on klk_submissions',
    collection: 'klk_submissions',
    operation: 'list',
    expected: 'PERMISSION_DENIED'
  }
];

export function validateSecurityVectorIds(): boolean {
  return VALID_ID_REGEX.test('klk_001') && !VALID_ID_REGEX.test('bad$id!@#');
}
