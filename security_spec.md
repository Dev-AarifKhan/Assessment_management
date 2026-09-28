# Security Specification: Student Assessment and Result Management System

## 1. Data Invariants
1. A user must be authenticated (`request.auth != null`) and active (`active == true`) to access data.
2. A Teacher must never be able to modify their own `role` or escalate privileges to `admin`.
3. A Teacher must never be able to delete students (single or bulk delete).
4. A Teacher must never be able to delete historical assessment records or wipe the marks collection.
5. Student records can only be created, modified, or deleted by an Administrator.
6. The `users` collection access is restricted: users can read their own profile, and only Admins can list, create, update, or disable teacher accounts.
7. School configuration `/config/school` can only be altered by an Administrator.

## 2. The Dirty Dozen Payloads (Forbidden Actions)
1. **Unauthenticated Read on /users**: Request with `auth == null` attempting `get(/users/xyz)`.
2. **Self-Role Escalation**: Authenticated Teacher attempting `update` on `/users/{uid}` with `role: "admin"`.
3. **Teacher Deleting Student**: Authenticated Teacher attempting `delete` on `/students/GHSS-25-1001`.
4. **Teacher Bulk Deleting Students**: Authenticated Teacher issuing batch deletes on `/students`.
5. **Teacher Deleting Assessment**: Authenticated Teacher attempting `delete` on `/assessments/{id}`.
6. **Teacher Wiping Marks**: Authenticated Teacher attempting `delete` on `/marks/{id}`.
7. **Teacher Altering Passing Threshold**: Authenticated Teacher attempting `update` on `/config/school`.
8. **Unauthorized User Creation**: Normal non-admin user creating a document in `/users` with `role: "admin"`.
9. **Disabling Admin Account**: Non-admin or admin self-disabling their own primary account.
10. **Junk Character ID Injection**: Attacker sending an invalid document ID longer than 128 characters or containing illegal symbols.
11. **Oversized Name Injection**: Injected student name exceeding 100 characters.
12. **Tampering with Identity**: User attempting to create mark records under an unverified `createdBy` UID.
