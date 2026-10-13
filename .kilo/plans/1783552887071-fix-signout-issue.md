# Fix Sign-Out Not Working on Deployed Site

## Problem
User reported that sign-out did not work on the deployed website; the user remained signed in. The current `signOut` implementation in `AuthContext.jsx` has two issues:
1. It uses `scope: 'local'`, which may not fully clear the session when tokens are expired.
2. It only clears local React state on API error, not on success. If the `SIGNED_OUT` event from `onAuthStateChange` is delayed or missed, a subsequent `window.location.href = '/'` reload can restore the session via refresh tokens.

## Root Cause Analysis
- Yes, the app uses refresh tokens (`autoRefreshToken: true`, `persistSession: true` in `src/lib/supabase.js`).
- `signOut({ scope: 'local' })` only signs out the current session locally and may leave the refresh token valid.
- If the access token is expired, `signOut` can fail silently or return an error, but local state is only cleared on error.
- `Header.jsx` does `window.location.href = '/'` after sign-out, causing a full reload. During reload, `getSession()` runs and may use a still-valid refresh token to restore the session.

## Plan

### Step 1: Fix `signOut` in `AuthContext.jsx`
- Always clear `session` and `user` state immediately, regardless of API success/failure.
- Attempt `scope: 'global'` first (default behavior) to fully sign out across all sessions.
- If `scope: 'global'` fails with a specific error (e.g., 403), fall back to `scope: 'local'`.
- As a fallback, explicitly remove the Supabase auth storage key from `localStorage` to prevent silent re-authentication on reload.

### Step 2: Fix `handleSignOut` in `Header.jsx`
- Remove the forced `window.location.href = '/'` reload.
- Instead, rely on React state and router navigation (`navigate('/')`) after confirming local state is cleared.
- If a full reload is still desired, add a short delay (e.g., 300ms) after clearing state to allow `onAuthStateChange` to process, then reload.

### Step 3: Add defensive storage clearing
- In `signOut`, after the API call, explicitly clear the Supabase auth token from `localStorage` using the storage key `sb-jwhvfugznhwtpfurdkxm-auth-token`.
- This prevents `getSession()` from silently restoring the session on the next load.

### Step 4: Validate
- Test sign-out with an expired access token.
- Test sign-out when the API call fails.
- Test sign-out on the deployed site and confirm the user is fully signed out after reload.

## Files to Modify
- `frontend/my-react-app/src/contexts/AuthContext.jsx` — lines 554-564
- `frontend/my-react-app/src/components/layout/Header.jsx` — lines 244-262

## Risks / Edge Cases
- `scope: 'global'` may return 403 in some Supabase configurations; the fallback to `'local'` plus storage clearing handles this.
- Removing `window.location.href` may affect other UI state; ensure the header updates immediately after sign-out.
- If multiple tabs are open, `scope: 'global'` is the correct choice to sign out everywhere. `scope: 'local'` only signs out the current tab.
