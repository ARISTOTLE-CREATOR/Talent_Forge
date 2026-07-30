import React, { useState } from 'react';
import { Mail, Lock, User, Building2, Briefcase, CheckCircle2, ArrowRight, Eye, EyeOff, ShieldCheck, KeyRound, UserPlus } from 'lucide-react';
import { UserProfile } from '../types';
import { Logo } from './Logo';

interface LoginPageProps {
  onLogin: (user: UserProfile, rememberMe: boolean) => void;
  initialUser?: UserProfile;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, initialUser }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Login / Signup fields
  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [company, setCompany] = useState(initialUser?.company || '');
  const [role, setRole] = useState(initialUser?.role || '');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    // Look up saved user details from localStorage if present
    let savedUser: UserProfile | null = null;
    try {
      const stored = localStorage.getItem('talentforge_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email && parsed.email.toLowerCase() === email.trim().toLowerCase()) {
          savedUser = parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to read saved user:', err);
    }

    // Use user entered name or saved user name, fallback to email username
    let finalName = name.trim() || savedUser?.name;
    if (!finalName && email) {
      const usernamePart = email.split('@')[0];
      const parts = usernamePart.split(/[\._\-]/);
      finalName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    if (!finalName) finalName = 'Recruiter';

    let finalCompany = savedUser?.company || company.trim();
    if (!finalCompany && email.includes('@') && !email.endsWith('@gmail.com') && !email.endsWith('@yahoo.com') && !email.endsWith('@hotmail.com')) {
      const domain = email.split('@')[1].split('.')[0];
      finalCompany = domain.charAt(0).toUpperCase() + domain.slice(1) + ' Inc.';
    }
    if (!finalCompany) finalCompany = 'TalentForge Workspace';

    let finalRole = savedUser?.role || role.trim() || 'Technical Recruiter';

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(`Authenticated successfully. Welcome, ${finalName}!`);

      const authenticatedUser: UserProfile = {
        id: savedUser?.id || `usr-${Date.now()}`,
        name: finalName,
        email: email.trim(),
        phone: savedUser?.phone || '',
        role: finalRole,
        company: finalCompany,
        avatarUrl: savedUser?.avatarUrl || '',
        apiKeyConfigured: true
      };

      setTimeout(() => {
        onLogin(authenticatedUser, rememberMe);
      }, 700);
    }, 600);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your work email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please create a password for your account.');
      return;
    }

    setIsLoading(true);

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: '',
      role: role.trim() || 'Technical Recruiter',
      company: company.trim() || 'Recruiting Workspace',
      avatarUrl: '',
      apiKeyConfigured: true
    };

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(`Account created successfully for ${newUser.name}!`);

      setTimeout(() => {
        onLogin(newUser, rememberMe);
      }, 700);
    }, 600);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess('Password reset link sent! Please check your inbox.');
    setTimeout(() => {
      setForgotSuccess('');
      setMode('login');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-zinc-100 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between relative z-10 py-2">
        <Logo size="md" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-[11px] font-mono text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Enterprise Workspace Portal</span>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="w-full max-w-md mx-auto my-auto relative z-10 pt-6 pb-8">
        <div className="glass-card rounded-[28px] border border-white/10 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 relative overflow-hidden">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

          {/* Title Banner */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {mode === 'login' && 'Recruiter Sign In'}
              {mode === 'signup' && 'Create Recruiter Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5">
              {mode === 'login' && 'Access your intelligent resume screening & candidate matching portal'}
              {mode === 'signup' && 'Set up your recruiter profile to manage candidate matching'}
              {mode === 'forgot' && 'Enter your work email address to receive recovery instructions'}
            </p>
          </div>

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold animate-fade-in">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {forgotSuccess && (
            <div className="mb-6 p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {/* MODE 1: SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Recruiter Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full h-11 pl-10 pr-10 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-950 border-white/10 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-400">Remember Me</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating Recruiter...
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Signup */}
              <div className="text-center pt-4 border-t border-white/5">
                <p className="text-xs text-zinc-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('signup');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                  >
                    Create Recruiter Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE 2: CREATE RECRUITER ACCOUNT FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.rivera@company.com"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Company & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full h-10 pl-8 pr-3 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Role Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Lead Recruiter"
                      className="w-full h-10 pl-8 pr-3 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose password"
                    className="w-full h-11 pl-10 pr-10 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Sign In</span>
                  </>
                )}
              </button>

              {/* Switch back to Login */}
              <div className="text-center pt-3 border-t border-white/5">
                <p className="text-xs text-zinc-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('login');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={forgotEmail || email}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Send Password Reset Link</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-zinc-400 hover:text-white font-semibold"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-7xl mx-auto text-center relative z-10 py-2">
        <p className="text-[11px] text-zinc-500">
          TalentForge • Intelligent Resume Screening & Candidate Matching Platform
        </p>
      </footer>
    </div>
  );
};
