# Security Specification for FormCheck AI

## Data Invariants
1. A user can only read their own profile.
2. A user can only read, create, and update their own analysis records.
3. Analysis records are immutable once created, except for potential metadata or specific status updates.
4. User IDs in documents must match the authenticated user's ID.
5. All IDs must be valid alphanumeric strings.
6. Timestamps must be validated against server time.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: Attacker `uid_1` tries to create a document in `/users/uid_2`.
2. **Analysis Hijacking**: Attacker `uid_1` tries to create an analysis in `/users/uid_2/analyses/new_record`.
3. **Cross-User Data Leak**: Attacker `uid_1` tries to `get` or `list` `/users/uid_2/analyses`.
4. **Shadow Field Injection**: Attacker tries to inject `isAdmin: true` into their user profile.
5. **Timestamp Manipulation**: Attacker tries to set `createdAt` to a point in the future.
6. **ID Poisoning**: Attacker tries to use a 1MB string as a `userId` or `analysisId`.
7. **Resource Poisoning**: Attacker tries to set `feedback` to a 5MB string.
8. **Reputation Inflation**: Attacker tries to set `score` to `1000` (max 100).
9. **Status Shortcutting**: Attacker tries to update any field in a completed analysis without proper checks.
10. **Orphaned Writes**: Attacker tries to create an analysis without it belonging to any existing user (relational sync).
11. **PII Leak**: Attacker tries to read all user profiles (listing `/users`).
12. **Method Hijacking**: Unauthenticated user tries to `create` any record.

## Test Runner (Draft)
A comprehensive test suite would involve using the Firebase Rules Emulator.
Since we are in a sandbox, we will verify these logic gates within the rules definition and via code review.
