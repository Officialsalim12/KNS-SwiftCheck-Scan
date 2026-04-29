'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface VerificationModalProps {
  participant: {
    id: string;
    name: string;
    email: string;
    photo_url: string | null;
  };
  onApprove: () => void;
  onDecline: () => void;
  isProcessing: boolean;
}

export default function VerificationModal({
  participant,
  onApprove,
  onDecline,
  isProcessing
}: VerificationModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Verify Participant Identity
        </h2>

        <div className="mb-6">
          {participant.photo_url ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Image
                  src={participant.photo_url}
                  alt={participant.name}
                  width={192}
                  height={192}
                  className="w-48 h-48 object-cover rounded-lg border-4 border-blue-500 shadow-lg"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {participant.name}
                </h3>
                <p className="text-sm text-gray-600">{participant.email}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">📷</span>
              </div>
              <p className="text-gray-600">No photo on file</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Please verify:</strong> Does the person match the photo above?
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-4">
          <button
            onClick={onDecline}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed text-center"
          >
            Decline
          </button>
          <button
            onClick={onApprove}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed text-center"
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

