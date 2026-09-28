import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  School,
  ArrowRight,
  User,
  KeyRound,
  Loader2
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loginWithGoogle, resetPassword, registerFirstAdmin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password mode
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Initial Admin setup mode (if no admin exists in system)
  const [isFirstAdminSetup, setIsFirstAdminSetup] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please verify your credentials and try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please wait a few moments or reset your password.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network connectivity issue. Please check your internet connection.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!resetEmail.trim()) {
      setError('Please provide your registered staff email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetEmail);
      setSuccessMessage(`If an account is associated with ${resetEmail}, a password reset link has been dispatched to your inbox.`);
      setResetEmail('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      // Generic safe message to prevent account enumeration
      setSuccessMessage(`If an account is associated with ${resetEmail}, a password reset link has been dispatched.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!adminName.trim() || !adminEmail.trim() || !adminPassword) {
      setError('All fields are required to initialize the primary administrator.');
      return;
    }

    if (adminPassword.length < 6) {
      setError('Administrator password must be at least 6 characters long.');
      return;
    }

    if (adminPassword !== adminConfirmPassword) {
      setError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setLoading(true);
    try {
      await registerFirstAdmin(adminName, adminEmail, adminPassword);
    } catch (err: any) {
      console.error('First admin error:', err);
      setError(err.message || 'Failed to initialize administrator account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-600/20 via-indigo-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">

          {/* School Header Card */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-1.5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white p-1 shadow-inner flex items-center justify-center">
                <img 
                  src="/school_logo.png" 
                  alt="School Crest" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm">
              Govt. Higher Secondary School Larnoo
            </h1>
            <p className="text-xs sm:text-sm font-medium text-indigo-300/90 mt-1">
              Student Assessment & Result Management System
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 mt-2">
              <School size={12} className="text-amber-400" />
              <span>UDISE: 01061601505 • Larnoo, Anantnag (J&K)</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-3xl shadow-2xl p-6 sm:p-8 relative">
            
            {/* Alerts */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
                <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* FORM 1: Normal Staff Login */}
            {!isForgotPassword && !isFirstAdminSetup && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="border-b border-slate-800 pb-3 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-indigo-400" />
                    <h2 className="font-bold text-sm text-slate-200">Staff Portal Authentication</h2>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    Secure RBAC
                  </span>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Staff Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. principal@ghsslarnoo.edu or teacher@school.org"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your confidential password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-900/40 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to School Portal</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Institutional Sign-In & First-Time Admin Provisioning */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      setError(null);
                      setSuccessMessage(null);
                      setLoading(true);
                      try {
                        await loginWithGoogle();
                      } catch (err: any) {
                        console.error('Google Sign-In error:', err);
                        setError(err.message || 'Google Sign-In could not be completed.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={16} className="text-indigo-400" />
                    <span>Continue with Official Google Account</span>
                  </button>

                  <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-400" />
                        Administrator Setup
                      </span>
                      <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded-md font-semibold">
                        No Hardcoded Secrets
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Initializing the portal for the first time? Provision the primary administrator account with your own secure password.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFirstAdminSetup(true);
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Initialize First Administrator Account</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* FORM 2: Forgot Password */}
            {isForgotPassword && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="border-b border-slate-800 pb-3 mb-2 flex items-center gap-2">
                  <KeyRound size={18} className="text-indigo-400" />
                  <h2 className="font-bold text-sm text-slate-200">Reset Staff Password</h2>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered institutional email. We will send a secure Firebase password reset link to restore your credentials.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. staff@ghsslarnoo.edu"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold transition"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Email</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* FORM 3: Initial First Admin Setup */}
            {isFirstAdminSetup && (
              <form onSubmit={handleFirstAdminSetup} className="space-y-3.5">
                <div className="border-b border-slate-800 pb-3 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" />
                    <h2 className="font-bold text-sm text-slate-200">First-Time Admin Setup</h2>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-md">
                    One-Time Provision
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Establish the school's primary administrative account. This account possesses full privileges to register faculty, manage grades, and configure sessions.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrator Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Principal Aarif Ahmad Khan"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrator Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="ghsslarnoo@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Master Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-9 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      placeholder="Re-enter master password"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFirstAdminSetup(false);
                      setError(null);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Provisioning...</span>
                      </>
                    ) : (
                      <span>Create Primary Admin</span>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Footer credentials note */}
          <div className="text-center mt-6 text-[11px] text-slate-400 space-y-1">
            <p>Authorized personnel only. All access attempts are monitored and recorded.</p>
            <p>© {new Date().getFullYear()} Government Higher Secondary School Larnoo. Official Portal.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
