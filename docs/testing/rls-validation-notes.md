# RLS Validation & Security Notes

This document describes the security policies enforced at the database layer (Supabase PostgreSQL) to guarantee user isolation and metadata-only profile privacy.

---

## 1. Row-Level Security (RLS) Policies

Row-Level Security is enabled on both `public.profiles` and `public.homestead_plans` tables. 

### 1.1 `public.profiles`
*   **Insert Policy**: `auth.uid() = id`. A user can only create a profile matching their unique authenticated UUID.
*   **Select Policy**: `auth.uid() = id`. Users are restricted to reading their own profile metadata.
*   **Update Policy**: `auth.uid() = id`. Profile fields can only be modified by the matching authenticated user.
*   **Delete Policy**: cascaded deletion through `auth.users` cascading reference.

### 1.2 `public.homestead_plans`
*   **Insert Policy**: `auth.uid() = user_id`. Users can only upload data tagged with their authenticated user UUID.
*   **Select Policy**: `auth.uid() = user_id`. Database query outputs are filtered to only return rows belonging to the current user context.
*   **Update Policy**: `auth.uid() = user_id`. Users can only overwrite planning data that belongs to them.
*   **Delete Policy**: `auth.uid() = user_id`. Deleting backup rows is restricted to the owning account.

---

## 2. RLS Execution Tests

We wrote an automated test script at `supabase/tests/rls_validation_test.sql` to verify these policies.

### 2.1 How it Works
1.  **Starts a Transaction**: Enclosed inside a `BEGIN;` block.
2.  **Mocks Authentication Claims**: Sets PostgreSQL config variables to simulate a live Supabase JWT session:
    ```sql
    select set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);
    select set_config('role', 'authenticated', true);
    ```
3.  **Simulates User A Writes**: Inserts a test profile and a test plan for User A.
4.  **Switches session to User B**: Updates JWT sub claim context to User B:
    ```sql
    select set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);
    ```
5.  **Performs Access Violations**: Attempts to SELECT, UPDATE, or DELETE User A's data under User B's context. The queries are checked to confirm they affect `0` rows (blocked by RLS).
6.  **Validates Credentials Absence**: Queries `information_schema.columns` to confirm `profiles` stores no credential columns (`password`, `secret`, `credential`).
7.  **Rollback**: The transaction is fully rolled back using `ROLLBACK;`, leaving the database clean.

### 2.2 Running the RLS Tests
Run the script inside your Supabase project SQL Editor or through the Supabase CLI:
```bash
supabase db test supabase/tests/rls_validation_test.sql
```
Or paste the file contents directly into the Supabase Dashboard SQL Editor and click **Run**.
