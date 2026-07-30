import React, { useState } from 'react';
import { X, Mail, Lock, User, Building, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState(user.name);
  const [company, setCompany] = useState(user.company);
  const [rememberMe, setRememberMe] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setSuccessMessage('Password reset link sent to your email address!');
      setTimeout(() => {
        setSuccessMessage('');
        setMode('login');
      }, 2000);
      return;
    }

    onUpdateUser({
      ...user,
      name: name || 'Recruiter User',
      email: email || 'recruiter@talentforge.io',
      company: company || 'TalentForge Workspace'
    });

    setSuccessMessage(mode === 'login' ? 'Signed in successfully!' : 'Account created successfully!');
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
  };

  const handleSsoLogin = () => {
    onUpdateUser({
      ...user,
      name: name || user.name || 'Recruiter Account',
      email: email || user.email || 'recruiter@company.com',
      company: company || user.company || 'TalentForge Workspace'
    });
    setSuccessMessage('Authenticated via Enterprise Single Sign-On!');
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-[24px] border border-white/10 p-6 sm:p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create TalentForge Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h3>
            <p className="text-xs text-zinc-400">
              {mode === 'login' && 'Sign in to manage AI candidate screening'}
              {mode === 'signup' && 'Start 14-day enterprise trial'}
              {mode === 'forgot' && 'We will email you instructions'}
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full h-11 pl-10 pr-4 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-400">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-4 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-white/10 text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-zinc-400">Remember session</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>
              {mode === 'login' && 'Sign In'}
              {mode === 'signup' && 'Create Free Account'}
              {mode === 'forgot' && 'Send Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-[#18181B] px-3 text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                Or Continue With
              </span>
            </div>

            <button
              onClick={handleSsoLogin}
              className="w-full h-11 glass-button hover:bg-white/10 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all border border-white/10"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Enterprise Single Sign-On</span>
            </button>
          </>
        )}

        <div className="mt-6 text-center text-xs text-zinc-400">
          {mode === 'login' && (
            <span>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-indigo-400 font-semibold hover:underline">
                Sign Up
              </button>
            </span>
          )}
          {mode === 'signup' && (
            <span>
              Already registered?{' '}
              <button onClick={() => setMode('login')} className="text-indigo-400 font-semibold hover:underline">
                Sign In
              </button>
            </span>
          )}
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className="text-indigo-400 font-semibold hover:underline">
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
