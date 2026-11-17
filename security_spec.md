# SIKMA Kimia UB — Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Identity & Authentication:** Every read/write requires `request.auth != null` and `request.auth.token.email_verified == true`.
2. **Ownership & Immutability:** Every user-owned document stores `ownerUid == request.auth.uid` on creation (unless created by an authorized admin). `ownerUid` and `createdAt` are immutable after creation.
3. **Server Timestamps:** `createdAt` (on create) and `updatedAt` (on create and update) MUST equal `request.time`.
4. **No Self-Assigned Privileges:** Regular users cannot create `/admins/{uid}` documents or elevate their `role` field in `/users/{userId}` to `super_admin` or `admin`.
5. **PII Isolation:** Sensitive PII (`email`, `noHp`, `noHpOrangTua`, `alamat`) is isolated in `/users/{userId}` and `/sdm_private/{profileId}` and readable only by the document owner or admin. Public directory entries in `/sdm_directory/{profileId}` contain zero PII.
6. **Terminal State Locking:** Completed KLK submissions (`status == 'Selesai'`) and finalized letter requests (`status == 'Selesai'`) cannot be modified by non-admin users.
7. **Cost & Payload Bounds:** All document IDs match `^[a-zA-Z0-9_\-]+$` (max 128 chars), every string field has an explicit `.size()` bound, and `allow list` rules evaluate `resource.data` directly without `get()` or `exists()` lookups.

## 2. The "Dirty Dozen" Payloads (Expected: `PERMISSION_DENIED`)
1. **Unauthenticated Write:** Create `/klk_submissions/klk_1` with `request.auth == null`.
2. **Unverified Email Spoof:** Read/write `/users/u_1` when `request.auth.token.email == 'dp.herdiyanto@gmail.com'` and `request.auth.token.email_verified == false`.
3. **Self-Admin Escalation:** Non-admin creates `/admins/{uid}` with `role: 'super_admin'`.
4. **Role Escalation in Profile:** Student creates `/users/u_stu` with `role: 'super_admin'`.
5. **Owner Spoofing:** Student A creates `/klk_submissions/klk_spoof` with `ownerUid: 'student_b_uid'`.
6. **Shadow / Ghost Field Injection:** Student creates `/klk_submissions/klk_ghost` with extra key `isAdminOverride: true`.
7. **ID Poisoning:** Create `/klk_submissions/invalid$id/with/slash` or 200-char ID.
8. **Type / Size Poisoning:** Update `mahasiswaNama` with a number or >200-char string.
9. **Client Timestamp Forgery:** Create document with forged `createdAt` not equal to `request.time`.
10. **Terminal State Bypass:** Student updates `/klk_submissions/klk_done` when existing `status == 'Selesai'`.
11. **PII Blanket Read:** Authenticated non-owner, non-admin executes `get` or `list` on `/sdm_private` or `/users` belonging to another user.
12. **Blanket List Query Scraping:** Unscoped `list` on `/klk_submissions` by a user who is neither owner, assigned supervisor, nor admin.
