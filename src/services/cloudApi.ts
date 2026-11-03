import { Category, DebtAccount, Transaction, UserSettings } from '../types/finance';
import { DEFAULT_SETTINGS } from '../utils/constants';
import {
  registerLocalAccount,
  authenticateLocalAccount,
  resetLocalUserPassword,
  getLocalUsers,
} from '../utils/localAuth';

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

/**
 * Safely parses response text into JSON.
 * If the response is HTML or malformed, gracefully returns isJson: false without throwing SyntaxError.
 */
async function safeParseResponse(res: Response): Promise<{ isJson: boolean; data: any; rawText: string }> {
  try {
    const rawText = await res.text();
    const trimmed = rawText.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return { isJson: false, data: null, rawText };
    }
    const data = JSON.parse(trimmed);
    return { isJson: true, data, rawText };
  } catch {
    return { isJson: false, data: null, rawText: '' };
  }
}

export async function cloudRegister(
  email: string,
  pass: string,
  name: string
): Promise<{ user: CloudUserSession; data: CloudUserData }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password: pass, displayName: name }),
    });

    const parsed = await safeParseResponse(res);

    if (parsed.isJson) {
      if (!res.ok) {
        const err: any = new Error(parsed.data.error || 'Error al crear la cuenta en la nube');
        err.code = parsed.data.code || 'auth/register-failed';
        throw err;
      }
      saveCachedCloudSession(parsed.data.user);
      return parsed.data;
    }

    // Server returned HTML or redirect (e.g. proxy cookie check or static fallback)
    console.warn('Servidor respondió con formato no-JSON. Activando almacenamiento local seguro.');
    const localSession = await registerLocalAccount(email, pass, name);
    saveCachedCloudSession(localSession);
    return {
      user: localSession,
      data: {
        transactions: [],
        debts: [],
        categories: [],
        settings: {
          ...DEFAULT_SETTINGS,
          personName: name,
        },
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    if (err?.code?.startsWith('auth/')) {
      throw err;
    }
    console.warn('Error en conexión con la nube. Creando cuenta local segura:', err);
    const localSession = await registerLocalAccount(email, pass, name);
    saveCachedCloudSession(localSession);
    return {
      user: localSession,
      data: {
        transactions: [],
        debts: [],
        categories: [],
        settings: {
          ...DEFAULT_SETTINGS,
          personName: name,
        },
        updatedAt: new Date().toISOString(),
      },
    };
  }
}

export async function cloudLogin(
  email: string,
  pass: string
): Promise<{ user: CloudUserSession; data: CloudUserData }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password: pass }),
    });

    const parsed = await safeParseResponse(res);

    if (parsed.isJson) {
      if (!res.ok) {
        // If wrong password was explicitly verified
        if (parsed.data.code === 'auth/wrong-password') {
          const err: any = new Error('Contraseña incorrecta. Verifica tus datos.');
          err.code = 'auth/wrong-password';
          throw err;
        }

        // Try local account check in case registered offline
        try {
          const localSession = await authenticateLocalAccount(email, pass);
          saveCachedCloudSession(localSession);
          return {
            user: localSession,
            data: {
              transactions: [],
              debts: [],
              categories: [],
              settings: {
                ...DEFAULT_SETTINGS,
                personName: localSession.displayName || 'Usuario',
              },
              updatedAt: new Date().toISOString(),
            },
          };
        } catch {
          const err: any = new Error(parsed.data.error || 'Error al iniciar sesión');
          err.code = parsed.data.code || 'auth/login-failed';
          throw err;
        }
      }

      saveCachedCloudSession(parsed.data.user);
      return parsed.data;
    }

    // Non-JSON response (e.g. proxy redirect, external link check) -> check local account
    console.warn('Servidor respondió con formato no-JSON. Verificando cuenta local.');
    const localSession = await authenticateLocalAccount(email, pass);
    saveCachedCloudSession(localSession);
    return {
      user: localSession,
      data: {
        transactions: [],
        debts: [],
        categories: [],
        settings: {
          ...DEFAULT_SETTINGS,
          personName: localSession.displayName || 'Usuario',
        },
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    if (err?.code?.startsWith('auth/')) {
      throw err;
    }
    // Attempt local fallback
    try {
      const localSession = await authenticateLocalAccount(email, pass);
      saveCachedCloudSession(localSession);
      return {
        user: localSession,
        data: {
          transactions: [],
          debts: [],
          categories: [],
          settings: {
            ...DEFAULT_SETTINGS,
            personName: localSession.displayName || 'Usuario',
          },
          updatedAt: new Date().toISOString(),
        },
      };
    } catch {
      const friendlyErr: any = new Error('No encontramos ninguna cuenta con este correo o la contraseña es incorrecta.');
      friendlyErr.code = 'auth/invalid-credential';
      throw friendlyErr;
    }
  }
}

export async function cloudResetPassword(email: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const parsed = await safeParseResponse(res);
    if (parsed.isJson && res.ok) {
      return true;
    }

    // Try local reset fallback
    return resetLocalUserPassword(email);
  } catch {
    return resetLocalUserPassword(email);
  }
}

export async function cloudFetchUserData(
  uid: string,
  email?: string | null
): Promise<CloudUserData | null> {
  try {
    const params = new URLSearchParams();
    if (uid) params.set('uid', uid);
    if (email) params.set('email', email);

    const res = await fetch(`/api/user/data?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    const parsed = await safeParseResponse(res);
    if (parsed.isJson && res.ok) {
      return parsed.data as CloudUserData;
    }
    return null;
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
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        uid,
        email,
        ...payload,
      }),
    });

    const parsed = await safeParseResponse(res);
    if (parsed.isJson && res.ok) {
      return parsed.data.data;
    }
    return null;
  } catch (err) {
    console.warn('Failed to sync data to cloud server:', err);
    return null;
  }
}

export async function getCloudUserCount(): Promise<number> {
  try {
    const res = await fetch('/api/stats/user-count', {
      headers: { Accept: 'application/json' },
    });
    const parsed = await safeParseResponse(res);
    if (parsed.isJson && res.ok && typeof parsed.data.count === 'number') {
      return parsed.data.count;
    }
  } catch {
    // fallback
  }
  return getLocalUsers().length;
}
