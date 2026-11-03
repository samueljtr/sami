import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { SAMI_LOGO_DATA_URL } from '../constants/logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  requiredMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  canDismiss = true,
  initialMode = 'register',
  requiredMessage,
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('Por favor ingresa tu correo electrónico.');
          setLoading(false);
          return;
        }
        await resetPassword(email.trim());
        setResetSuccess(true);
      } else if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
        onClose?.();
      } else {
        if (!name.trim()) {
          setErrorMsg('Por favor ingresa tu nombre.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email.trim(), password, name.trim());
        onClose?.();
      }
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';

      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Correo o contraseña incorrectos.');
      } else if (code === 'auth/user-not-found') {
        setErrorMsg('No encontramos ninguna cuenta con este correo. Cambia a "Registrarse".');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('Este correo ya está registrado en Sami. Inicia sesión con tu contraseña.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('El formato del correo electrónico no es válido.');
      } else {
        console.warn('Unhandled auth error:', err);
        setErrorMsg(message || 'Verifica tus datos e intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose?.();
    } catch (err: any) {
      console.error('Google auth error:', err);
      const code = err?.code || '';
      if (code !== 'auth/popup-closed-by-user') {
        setErrorMsg('No se pudo completar el acceso con Google en esta ventana. Puedes registrarte con tu correo arriba.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 relative">
        {canDismiss && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Brand Header */}
        <div className="text-center space-y-2.5 pt-1">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white border border-sky-100/90 p-1.5 mx-auto shadow-xl shadow-sky-100 flex items-center justify-center overflow-hidden">
            <img
              src={SAMI_LOGO_DATA_URL}
              alt="Sami Logo Oficial"
              className="w-full h-full object-contain"
            />
            {mode === 'forgot' && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md border-2 border-white">
                <KeyRound className="w-4 h-4" />
              </div>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight font-sans">
            {mode === 'forgot'
              ? 'Recuperar Contraseña'
              : mode === 'login'
              ? 'Iniciar Sesión en Sami'
              : 'Crear Cuenta en Sami'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            {mode === 'forgot'
              ? 'Ingresa tu correo para crear una nueva contraseña.'
              : mode === 'login'
              ? 'Accede a tus finanzas y cuentas compartidas desde cualquier dispositivo.'
              : 'Tus finanzas y presupuestos se guardarán protegidos en tu cuenta.'}
          </p>
        </div>

        {/* Required Registration Notice Banner */}
        {requiredMessage && mode !== 'forgot' && (
          <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900 font-semibold shadow-2xs">
            <Sparkles className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
            <p className="leading-snug">{requiredMessage}</p>
          </div>
        )}

        {/* Tab Switcher (only for login / register) */}
        {mode !== 'forgot' ? (
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setResetSuccess(false);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setResetSuccess(false);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Registrarse
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setResetSuccess(false);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1.5 py-1 px-3 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              ← Volver a Iniciar Sesión
            </button>
          </div>
        )}

        {/* Standard Clean Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Forgot Password Success Box */}
        {mode === 'forgot' && resetSuccess ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl text-center space-y-2.5 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-900">¡Listo!</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Hemos procesado tu solicitud para <strong>{email}</strong>. Puedes ingresar con tu nueva contraseña.
            </p>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setResetSuccess(false);
                setErrorMsg(null);
              }}
              className="mt-3 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          /* Form for login, register, or forgot */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Tu Nombre
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Josué Tapias"
                    className="w-full pl-10 pr-3 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-700">
                    Contraseña
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setResetSuccess(false);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'forgot'
                      ? 'Restablecer contraseña'
                      : mode === 'login'
                      ? 'Iniciar Sesión'
                      : 'Crear Cuenta'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider & Google Sign In (for login & register) */}
        {mode !== 'forgot' && (
          <>
            <div className="relative my-3 flex items-center justify-center">
              <div className="w-full border-t border-neutral-200" />
              <span className="absolute bg-white px-3 text-[11px] font-semibold text-neutral-400">
                o continúa con
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-bold rounded-2xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
