'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout } from '@/app/actions/auth';
import { registerOrganization, loginOrganization } from '@/app/actions/organizations';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  
  // Admin Login State
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);

  // Handle Admin Auth
  async function handleAdminSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  const [userMode, setUserMode] = useState<'register' | 'login'>('register');

  // Handle User Registration
  async function handleUserSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const result = await registerOrganization(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Success - redirect to organization dashboard
      router.push('/org/dashboard');
    }
  }

  // Handle User Login
  async function handleUserLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginOrganization(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Success - redirect to dashboard
      router.push('/org/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left side: Premium Branding & Illustration (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

        <div className="relative z-10 w-full max-w-xl xl:max-w-2xl transform transition-transform duration-700 hover:scale-[1.02]">
          {/* PLACEHOLDER for User's attached images. */}
          {userMode === 'register' && activeTab === 'user' ? (
            <img 
              src="/register-illustration.png" 
              alt="Registration Illustration" 
              className="w-full h-auto drop-shadow-2xl object-contain mx-auto" 
              onError={(e) => { e.currentTarget.style.display='none'; }} 
            />
          ) : (
            <img 
              src="/login-illustration.png" 
              alt="Login Platform Illustration" 
              className="w-full h-auto drop-shadow-2xl object-contain mx-auto" 
              onError={(e) => { e.currentTarget.style.display='none'; }} 
            />
          )}
        </div>
        
        <div className="relative z-10 mt-16 text-center text-white px-8">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
            {activeTab === 'admin' ? 'Global System Administration' : 'Enterprise Event Intelligence'}
          </h2>
          <p className="text-blue-100/90 text-lg font-medium max-w-md mx-auto leading-relaxed">
            {activeTab === 'admin' 
              ? 'Secure, comprehensive oversight and telemetry for active campaigns and system integrity.'
              : 'Streamline your organization\'s check-in flow with industrial-grade efficiency and real-time syncing.'}
          </p>
        </div>
      </div>

      {/* Right side: Form Container */}
      <div className="w-full lg:w-[45%] flex flex-col relative bg-white shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-20 overflow-y-auto">
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-30">
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 group">
            <span className="transform transition-transform group-hover:-translate-x-1">&larr;</span> Back to Home
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 py-16">
          <div className="w-full max-w-md mx-auto">
            {/* Custom Tab Switcher */}
            <div className="flex bg-gray-50 p-1.5 rounded-xl mb-12 shadow-inner border border-gray-100 text-sm">
              <button
                onClick={() => setActiveTab('user')}
                className={`flex-1 py-2.5 px-4 font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === 'user' 
                  ? 'bg-white text-blue-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)]' 
                  : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Organization / User
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 py-2.5 px-4 font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === 'admin' 
                  ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]' 
                  : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                System Admin
              </button>
            </div>

            {activeTab === 'user' ? (
              <div className="animate-fade-in">
                {userMode === 'register' ? (
                  <>
                    <div className="mb-10">
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Create your account
                      </h1>
                      <p className="text-base text-gray-500">
                        Already have an account?{' '}
                        <button onClick={() => setUserMode('login')} className="text-blue-600 font-bold hover:text-blue-800 transition-colors underline-offset-4 hover:underline">
                          Sign in instead
                        </button>
                      </p>
                    </div>

                    <form onSubmit={handleUserSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Work Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          placeholder="name@company.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="organization" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Organization
                        </label>
                        <input
                          type="text"
                          id="organization"
                          name="organization"
                          required
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          placeholder="Company or Group Name"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showRegPass ? "text" : "password"}
                              id="password"
                              name="password"
                              required
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none pr-10"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPass(!showRegPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                              tabIndex={-1}
                            >
                              {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Confirm
                          </label>
                          <div className="relative">
                            <input
                              type={showRegConfirmPass ? "text" : "password"}
                              id="confirm_password"
                              name="confirm_password"
                              required
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none pr-10"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegConfirmPass(!showRegConfirmPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                              tabIndex={-1}
                            >
                              {showRegConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="bg-red-50 text-red-600 border border-red-200/50 px-4 py-3.5 rounded-xl text-sm font-medium flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 mt-4 disabled:opacity-70 disabled:pointer-events-none"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Processing...
                          </span>
                        ) : 'Confirm Registration'}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="mb-10">
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Welcome back
                      </h1>
                      <p className="text-base text-gray-500">
                        New to CheckScan?{' '}
                        <button onClick={() => setUserMode('register')} className="text-blue-600 font-bold hover:text-blue-800 transition-colors underline-offset-4 hover:underline">
                          Create an account
                        </button>
                      </p>
                    </div>

                    <form onSubmit={handleUserLoginSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="login_email" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Work Email
                        </label>
                        <input
                          type="email"
                          id="login_email"
                          name="email"
                          required
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                          placeholder="name@company.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="login_password" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showLoginPass ? "text" : "password"}
                            id="login_password"
                            name="password"
                            required
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none pr-12"
                            placeholder="Enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPass(!showLoginPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                            tabIndex={-1}
                          >
                            {showLoginPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <div className="mt-2 text-right">
                          <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                            Forgot password?
                          </Link>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 text-red-600 border border-red-200/50 px-4 py-3.5 rounded-xl text-sm font-medium flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 mt-4 disabled:opacity-70 disabled:pointer-events-none"
                      >
                        {isLoading ? (
                           <span className="flex items-center justify-center gap-2">
                             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Authenticating...
                           </span>
                        ) : 'Sign In'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <div className="animate-fade-in relative">
                <div className="mb-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center mb-6 text-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                    System Control
                  </h1>
                  <p className="text-base text-gray-500">
                    Authorized global administrators only. Please input the master passkey to unlock terminal functions.
                  </p>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Master Passkey
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? "text" : "password"}
                        id="password"
                        name="password"
                        required
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all outline-none pr-12 font-mono text-lg tracking-wider"
                        placeholder="••••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-800 transition-colors"
                        tabIndex={-1}
                      >
                        {showAdminPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 border border-red-200/50 px-4 py-3.5 rounded-xl text-sm font-medium flex items-start gap-3">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgba(15,23,42,0.2)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 active:translate-y-0 mt-8 disabled:opacity-70 disabled:pointer-events-none tracking-wide"
                  >
                    {isLoading ? (
                       <span className="flex items-center justify-center gap-2">
                         <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         Verifying Key...
                       </span>
                    ) : 'Unlock Console'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
