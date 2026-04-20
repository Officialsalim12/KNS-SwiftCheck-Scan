'use client';

import Image from 'next/image';

export default function LogoHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] relative">
        <Image
          src="/WhatsApp_Image_2025-11-12_at_7.05.22_PM-removebg-preview.png"
          alt="KNS Logo"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 64px, 72px"
        />
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[9px] md:text-[11px] font-extrabold text-blue-900 tracking-wider uppercase leading-none mb-1">
          Knowledge
        </span>
        <span className="text-[9px] md:text-[11px] font-extrabold text-blue-800 tracking-wider uppercase leading-none mb-1">
          Network
        </span>
        <span className="text-[9px] md:text-[11px] font-extrabold text-blue-700 tracking-wider uppercase leading-none">
          Solutions
        </span>
      </div>
    </div>
  );
}

