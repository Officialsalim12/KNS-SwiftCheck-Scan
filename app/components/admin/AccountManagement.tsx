'use client';

import { useState } from 'react';
import { resetEventPassword } from '@/app/actions/events';
import { Eye, EyeOff } from 'lucide-react';

interface EventData {
  id: string;
  name: string;
  username: string;
  organizations?: {
    name: string;
  };
}

interface AccountManagementProps {
  events: EventData[];
}

export default function AccountManagement({ events }: AccountManagementProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !newPassword) return;

    setIsResetting(true);
    setMessage(null);

    const result = await resetEventPassword(selectedEventId, newPassword);

    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Password reset successfully!' });
      setNewPassword('');
      setTimeout(() => {
        setSelectedEventId(null);
        setMessage(null);
      }, 2000);
    }
    setIsResetting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 md:px-8 md:py-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">User Accounts & Organizations</h2>
        <p className="text-slate-300 text-sm mt-1">Manage system access for organizations and their events.</p>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full min-w-max text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Organization</th>
              <th className="px-6 py-4">Event Name</th>
              <th className="px-6 py-4">Primary Username</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-800">{event.organizations?.name || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{event.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    {event.username}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-center">
                  <button
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setMessage(null);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all hover:text-blue-600 hover:border-blue-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-4l5.659-5.659C9.374 10.097 9 8.583 9 7a6 6 0 0112 0z" />
                    </svg>
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No accounts found. Create an event first to initialize an account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Password Reset Modal */}
      {selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
              <button
                onClick={() => setSelectedEventId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleResetPassword} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10"
                    placeholder="Enter a secure password..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedEventId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isResetting ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
