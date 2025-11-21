'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white shadow-md border-b-2 border-blue-600">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Image
              src="/WhatsApp_Image_2025-11-12_at_7.05.22_PM-removebg-preview.png"
              alt="KNS Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-blue-600 leading-tight">
              Knowledge
            </span>
            <span className="text-2xl font-bold text-blue-600 leading-tight">
              Network
            </span>
            <span className="text-2xl font-bold text-blue-600 leading-tight">
              Solution
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

