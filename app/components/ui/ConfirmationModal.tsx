'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Sign Out",
  message = "Are you sure you want to sign out of your account? You will need to log in again to access the console.",
  confirmText = "Sign Out",
  isDestructive = true
}: LogoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${isDestructive ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <LogOut className={`w-6 h-6 ${isDestructive ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {message}
              </p>

              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={onConfirm}
                  className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-[0.98] ${
                    isDestructive 
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                  }`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl font-bold text-gray-500 hover:text-gray-700 transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
