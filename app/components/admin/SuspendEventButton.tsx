'use client';

import { useState } from 'react';
import { toggleEventSuspension } from '@/app/actions/events';
import { useToast } from '@/lib/ToastContext';

export default function SuspendEventButton({ eventId, isSuspended }: { eventId: string, isSuspended: boolean }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { error: toastError } = useToast();

  const handleToggle = async () => {
    const actionText = isSuspended ? "reactivate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${actionText} this event?`)) {
      return;
    }

    setIsProcessing(true);
    const result = await toggleEventSuspension(eventId, !isSuspended);
    if (result?.error) {
      toastError(result.error);
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isProcessing}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-semibold shadow-sm hover:shadow transform hover:scale-[1.02] ${
        isSuspended 
          ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isSuspended ? "Reactivate Event" : "Suspend Event"}
    >
      {isSuspended ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}
