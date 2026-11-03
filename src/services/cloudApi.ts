import { Category, DebtAccount, Transaction, UserSettings } from '../types/finance';

export interface CloudUserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
}

export interface CloudUserData {
  transactions: Transaction[];
  debts: DebtAccount[];
  categories: Category[];
  settings: UserSettings;
  updatedAt: string;
  version?: number;
}

const CLOUD_SESSION_KEY = 'sami_cloud_session_v1';

export function getCachedCloudSession(): CloudUserSession | null {
  try {
    const raw = localStorage.getItem(CLOUD_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedCloudSession(session: CloudUserSession | null): void {
  try {
    if (session) {
      localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(CLOUD_SESSION_KEY);
    }
  } catch (err) {
    console.error('Error storing cloud session:', err);
  }
}

export async function cloudRegister(
  email: string,
  pass: string,
  name: string
): Promise<{ user: CloudUserSession; data: CloudUserData }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass, displayName: name }),
  });

  const body = await res.json();
  if (!res.ok) {
    const err: any = new Error(body.error || 'Error al crear la cuenta en la nube');
    err.code = body.code || 'auth/register-failed';
    throw err;
  }

  saveCachedCloudSession(body.user);
  return body;
}

export async function cloudLogin(
  email: string,
  pass: string
): Promise<{ user: CloudUserSession; data: CloudUserData }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });

  const body = await res.json();
  if (!res.ok) {
    const err: any = new Error(body.error || 'Error al iniciar sesión en la nube');
    err.code = body.code || 'auth/login-failed';
    throw err;
  }

  saveCachedCloudSession(body.user);
  return body;
}

export async function cloudResetPassword(email: string): Promise<boolean> {
  const res = await fetch('/api/auth/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: any = new Error(body.error || 'Error al restablecer la contraseña');
    err.code = body.code || 'auth/reset-failed';
    throw err;
  }

  return true;
}

export async function cloudFetchUserData(
  uid: string,
  email?: string | null
): Promise<CloudUserData | null> {
  try {
    const params = new URLSearchParams();
    if (uid) params.set('uid', uid);
    if (email) params.set('email', email);

    const res = await fetch(`/api/user/data?${params.toString()}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Cloud fetch error: ${res.statusText}`);
    }

    const data: CloudUserData = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to fetch user data from cloud server:', err);
    return null;
  }
}

export async function cloudSyncUserData(
  uid: string,
  email: string | null | undefined,
  payload: {
    transactions?: Transaction[];
    debts?: DebtAccount[];
    categories?: Category[];
    settings?: UserSettings;
  }
): Promise<CloudUserData | null> {
  try {
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        email,
        ...payload,
      }),
    });

    if (!res.ok) {
      throw new Error(`Cloud sync error: ${res.statusText}`);
    }

    const body = await res.json();
    return body.data;
  } catch (err) {
    console.warn('Failed to sync data to cloud server:', err);
    return null;
  }
}

export async function getCloudUserCount(): Promise<number> {
  try {
    const res = await fetch('/api/stats/user-count');
    if (res.ok) {
      const data = await res.json();
      return data.count || 1;
    }
  } catch {
    // fallback
  }
  return 1;
}
