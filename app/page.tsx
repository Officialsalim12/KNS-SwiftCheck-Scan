import Link from "next/link";
import LogoHeader from "@/app/components/LogoHeader";

export default function Home() {
  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden">
      {/* Background Image with Fixed Position */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-blue-50"
        style={{ 
          backgroundImage: "url('/CheckbgImage.png')",
        }}
      />
      
      {/* Overlay to ensure readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-blue-900/40 via-white/80 to-white/95 backdrop-blur-[2px]" />

      {/* Header with Logo */}
      <header className="fixed w-full top-0 z-50 glass border-b border-white/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <LogoHeader />
          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-6 py-2.5 rounded-full shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto w-full pt-32 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <h1 className="text-5xl md:text-8xl font-black text-blue-900 mb-8 tracking-tighter leading-tight">
            SWIFTCHECK <span className="text-blue-600">SCAN</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
            Elevate your event experience with our next-generation QR scanning ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
            >
              Start Free Trial
            </Link>
            <Link
              href="#features"
              className="md:hidden w-full sm:w-auto px-8 py-4 glass text-blue-900 rounded-2xl font-bold text-lg border border-blue-200 hover:bg-white/50 transition-all text-center"
            >
              View Features
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full">
          <div className="glass p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group border-white/50 hover:border-blue-300/50">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-blue-900 mb-4">Precision Scanning</h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Ultra-fast QR recognition engine designed for high-traffic environments. Scan hundreds in minutes.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group border-white/50 hover:border-green-300/50">
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-blue-900 mb-4">Visual Verification</h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Advanced identity verification system that matches participants with their profile data in real-time.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group border-white/50 hover:border-purple-300/50">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-blue-900 mb-4">Live Analytics</h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Gain deep insights into your event attendance with beautiful, real-time data visualizations.
            </p>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mt-32 w-full max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-blue-900 mb-4">How it Works</h2>
            <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Lines (Desktop only) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-100 -z-10 transform -translate-y-1/2" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center text-2xl font-black text-blue-600 mb-6 z-10 shadow-xl">1</div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Create Event</h4>
              <p className="text-gray-600 font-medium">Set up your event and sessions in seconds.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center text-2xl font-black text-blue-600 mb-6 z-10 shadow-xl">2</div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Issue QRs</h4>
              <p className="text-gray-600 font-medium">Generate and send unique QR codes to participants.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center text-2xl font-black text-blue-600 mb-6 z-10 shadow-xl">3</div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Scan & Track</h4>
              <p className="text-gray-600 font-medium">Scan QRs at the door and monitor live attendance.</p>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-32 mb-16 w-full glass p-12 md:p-20 rounded-[3rem] text-center border-white/40 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors -z-10" />
          <h2 className="text-4xl md:text-6xl font-black text-blue-900 mb-6 tracking-tight">Ready to streamline your events?</h2>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
            Join hundreds of organizations using SwiftCheck Scan to manage their attendance with precision.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
          >
            Get Started Now — It's Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-blue-900/95 backdrop-blur-md text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h4 className="text-lg font-bold mb-2">SwiftCheck Scan</h4>
              <p className="text-blue-200 text-sm">Empowering events through intelligent tracking.</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm font-medium">
                © {new Date().getFullYear()} Knowledge Network Solutions.
              </p>
              <p className="text-xs mt-1 text-blue-300">
                Developed with precision by Abdul Salim Gani
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
