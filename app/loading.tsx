import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 min-h-screen bg-slate-50/50 backdrop-blur-[2px] z-[90] flex flex-col items-center justify-center animate-fade-in pointer-events-none">
      <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-indigo-50 flex flex-col items-center gap-4 pointer-events-auto">
        <LoadingSpinner size="lg" color="blue" />
        <p className="text-sm font-semibold text-slate-600 animate-pulse tracking-wide">
          Loading Data...
        </p>
      </div>
    </div>
  );
}
