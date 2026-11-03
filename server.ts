import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support JSON bodies up to 10MB
app.use(express.json({ limit: '10mb' }));

// Persistent Database Directory & File
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cloud_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  uid: string;
  email: string;
  passwordHash: string;
  salt: string;
  displayName: string;
  createdAt: string;
  lastLoginAt: string;
}

interface UserCloudData {
  transactions: any[];
  debts: any[];
  categories: any[];
  settings: any;
  updatedAt: string;
  version: number;
}

interface CloudDB {
  users: Record<string, StoredUser>;
  userData: Record<string, UserCloudData>;
}

// Default initial user data: 0 movements by default as requested
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Alimentación', icon: 'Utensils', color: '#10B981', budget: 400, spent: 0 },
  { id: '2', name: 'Vivienda y Servicios', icon: 'Home', color: '#3B82F6', budget: 600, spent: 0 },
  { id: '3', name: 'Transporte', icon: 'Car', color: '#F59E0B', budget: 150, spent: 0 },
  { id: '4', name: 'Salud y Cuidado', icon: 'HeartPulse', color: '#EF4444', budget: 100, spent: 0 },
  { id: '5', name: 'Educación', icon: 'GraduationCap', color: '#8B5CF6', budget: 120, spent: 0 },
  { id: '6', name: 'Entretenimiento', icon: 'Tv', color: '#EC4899', budget: 100, spent: 0 },
  { id: '7', name: 'Compras Personales', icon: 'ShoppingBag', color: '#06B6D4', budget: 100, spent: 0 },
  { id: '8', name: 'Ahorro e Inversión', icon: 'PiggyBank', color: '#14B8A6', budget: 300, spent: 0 },
  { id: '9', name: 'Otros Gastos', icon: 'MoreHorizontal', color: '#64748B', budget: 80, spent: 0 },
];

const DEFAULT_SETTINGS = {
  currency: 'USD',
  currencySymbol: '$',
  monthlyBudgetTotal: 2000,
  monthlySavingsTarget: 500,
  personName: 'Josué',
  notificationsEnabled: true,
};

function readDB(): CloudDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading cloud_db.json:', err);
  }
  return { users: {}, userData: {} };
}

function writeDB(data: CloudDB): void {
  try {
    const tmp = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('Error writing cloud_db.json:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// User Count
app.get('/api/stats/user-count', (req, res) => {
  const db = readDB();
  const count = Object.keys(db.users).length;
  res.json({ count });
});

// Admin endpoint to clear all database records
app.post('/api/admin/clear-all', (req, res) => {
  try {
    const emptyDB: CloudDB = { users: {}, userData: {} };
    writeDB(emptyDB);
    res.json({ success: true, message: 'Todos los registros han sido eliminados de la base de datos' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al limpiar la base de datos' });
  }
});

// Register User
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, displayName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(displayName || cleanEmail.split('@')[0]).trim();

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const db = readDB();

    // Check if user already exists
    const existingKey = Object.keys(db.users).find(
      (k) => db.users[k].email.toLowerCase() === cleanEmail
    );

    if (existingKey) {
      return res.status(400).json({
        error: 'Este correo ya está registrado en Sami. Por favor inicia sesión.',
        code: 'auth/email-already-in-use',
      });
    }

    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      uid,
      email: cleanEmail,
      passwordHash,
      salt,
      displayName: cleanName,
      createdAt: now,
      lastLoginAt: now,
    };

    db.users[uid] = newUser;

    // Initialize clean user data: strictly 0 movements by default
    db.userData[uid] = {
      transactions: [],
      debts: [],
      categories: DEFAULT_CATEGORIES,
      settings: { ...DEFAULT_SETTINGS, personName: cleanName },
      updatedAt: now,
      version: 1,
    };

    writeDB(db);

    res.json({
      success: true,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        createdAt: newUser.createdAt,
      },
      data: db.userData[uid],
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error interno al registrar el usuario' });
  }
});

// Login User
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = readDB();

    const foundUid = Object.keys(db.users).find(
      (k) => db.users[k].email.toLowerCase() === cleanEmail
    );

    if (!foundUid) {
      return res.status(404).json({
        error: 'No encontramos ninguna cuenta con este correo. Regístrate para comenzar.',
        code: 'auth/user-not-found',
      });
    }

    const user = db.users[foundUid];
    const computedHash = hashPassword(password, user.salt);

    if (computedHash !== user.passwordHash) {
      return res.status(401).json({
        error: 'Contraseña incorrecta. Verifica tus datos.',
        code: 'auth/wrong-password',
      });
    }

    user.lastLoginAt = new Date().toISOString();
    writeDB(db);

    const userData = db.userData[user.uid] || {
      transactions: [],
      debts: [],
      categories: DEFAULT_CATEGORIES,
      settings: { ...DEFAULT_SETTINGS, personName: user.displayName },
      updatedAt: user.lastLoginAt,
      version: 1,
    };

    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
      data: userData,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
});

// Reset Password
app.post('/api/auth/reset', (req, res) => {
  try {
    const { email, newPassword } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Correo es requerido' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = readDB();

    const foundUid = Object.keys(db.users).find(
      (k) => db.users[k].email.toLowerCase() === cleanEmail
    );

    if (!foundUid) {
      return res.status(404).json({
        error: 'No encontramos ninguna cuenta con este correo.',
        code: 'auth/user-not-found',
      });
    }

    const user = db.users[foundUid];
    const passwordToSet = newPassword || 'sami1234';
    const newSalt = crypto.randomBytes(16).toString('hex');
    user.salt = newSalt;
    user.passwordHash = hashPassword(passwordToSet, newSalt);
    writeDB(db);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente.',
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Error interno al restablecer la contraseña' });
  }
});

// Fetch User Cloud Data
app.get('/api/user/data', (req, res) => {
  try {
    const uid = String(req.query.uid || '');
    const email = String(req.query.email || '').trim().toLowerCase();

    if (!uid && !email) {
      return res.status(400).json({ error: 'Se requiere uid o email' });
    }

    const db = readDB();
    let targetUid = uid;

    if (!targetUid && email) {
      targetUid = Object.keys(db.users).find(
        (k) => db.users[k].email.toLowerCase() === email
      ) || '';
    }

    if (!targetUid || !db.userData[targetUid]) {
      // If user exists without data or first time, initialize empty data
      if (targetUid && db.users[targetUid]) {
        const u = db.users[targetUid];
        db.userData[targetUid] = {
          transactions: [],
          debts: [],
          categories: DEFAULT_CATEGORIES,
          settings: { ...DEFAULT_SETTINGS, personName: u.displayName },
          updatedAt: new Date().toISOString(),
          version: 1,
        };
        writeDB(db);
        return res.json(db.userData[targetUid]);
      }
      return res.status(404).json({ error: 'Datos no encontrados' });
    }

    res.json(db.userData[targetUid]);
  } catch (error: any) {
    console.error('Fetch data error:', error);
    res.status(500).json({ error: 'Error al obtener datos de la nube' });
  }
});

// Synchronize User Data (Push changes from PC or Mobile)
app.post('/api/user/sync', (req, res) => {
  try {
    const { uid, email, transactions, debts, categories, settings } = req.body || {};

    if (!uid && !email) {
      return res.status(400).json({ error: 'Se requiere uid o email para sincronizar' });
    }

    const db = readDB();
    let targetUid = uid;

    if (!targetUid && email) {
      const cleanEmail = String(email).trim().toLowerCase();
      targetUid = Object.keys(db.users).find(
        (k) => db.users[k].email.toLowerCase() === cleanEmail
      ) || '';
    }

    // Auto-create user space if needed
    if (!targetUid) {
      targetUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const cleanEmail = String(email || `${targetUid}@sami.app`).trim().toLowerCase();
      const salt = crypto.randomBytes(16).toString('hex');
      db.users[targetUid] = {
        uid: targetUid,
        email: cleanEmail,
        passwordHash: hashPassword('defaultpass', salt),
        salt,
        displayName: (settings && settings.personName) || 'Usuario',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }

    const current = db.userData[targetUid] || {
      transactions: [],
      debts: [],
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
      updatedAt: new Date().toISOString(),
      version: 0,
    };

    // Update with provided fields
    const updatedData: UserCloudData = {
      transactions: Array.isArray(transactions) ? transactions : current.transactions,
      debts: Array.isArray(debts) ? debts : current.debts,
      categories: Array.isArray(categories) ? categories : current.categories,
      settings: settings ? { ...current.settings, ...settings } : current.settings,
      updatedAt: new Date().toISOString(),
      version: (current.version || 0) + 1,
    };

    db.userData[targetUid] = updatedData;
    writeDB(db);

    res.json({
      success: true,
      data: updatedData,
      updatedAt: updatedData.updatedAt,
      version: updatedData.version,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Error al sincronizar con la nube' });
  }
});

// ----------------------------------------------------
// VITE SPA MIDDLEWARE / STATIC ASSETS
// ----------------------------------------------------
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sami Cloud Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
