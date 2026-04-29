'use client';

import { useState } from 'react';
import { logoutOrganization } from '@/app/actions/organizations';
import { logout as systemLogout } from '@/app/actions/auth';
import ConfirmationModal from './ConfirmationModal';

interface LogoutButtonProps {
  type?: 'org' | 'system';
}

export default function LogoutButton({ type = 'org' }: LogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    setIsOpen(false);
    if (type === 'org') {
      await logoutOrganization();
    } else {
      await systemLogout();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-xl hover:bg-red-50"
      >
        Sign Out
      </button>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
