'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/actions/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left Side: Form Container */}
      <div className="w-full lg:w-[45%] flex flex-col relative bg-white shadow-[20px_0_40px_-10px_rgba(0,0,0,0.05)] z-20 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 py-16">
          <div className="w-full max-w-md mx-auto animate-fade-in">
            <div className="mb-10 text-center lg:text-left">
              <div className="inline-flex w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100 items-center justify-center mb-6 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                System Login
              </h1>
              <p className="text-base text-gray-500">
                Authorized access only. Enter your credentials to proceed.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-1.5 text-left">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none pr-12 font-mono"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 mt-6 disabled:opacity-70 disabled:pointer-events-none tracking-wide"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Authenticating...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side: Premium Branding & Illustration (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-0 left-0 -m-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 -m-32 w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

        <div className="relative z-10 w-full max-w-xl xl:max-w-2xl transform transition-transform duration-700 hover:scale-[1.02]">
          <img 
            src="/login-illustration.png" 
            alt="Login Illustration" 
            className="w-full h-auto drop-shadow-2xl object-contain mx-auto" 
            onError={(e) => { e.currentTarget.style.display='none'; }} 
          />
        </div>
        
        <div className="relative z-10 mt-16 text-center text-white px-8">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
            Secure Platform Access
          </h2>
          <p className="text-blue-100/90 text-lg font-medium max-w-md mx-auto leading-relaxed">
            Identity verification and centralized access control for mission-critical operations.
          </p>
        </div>
      </div>
    </div>
  );
}

