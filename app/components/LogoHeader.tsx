'use client';

import Image from 'next/image';

export default function LogoHeader() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-shrink-0 w-20 h-20 md:w-[110px] md:h-[110px] relative">
        <Image
          src="/WhatsApp_Image_2025-11-12_at_7.05.22_PM-removebg-preview.png"
          alt="KNS Logo"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 80px, 110px"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-lg md:text-xl font-bold text-blue-600 leading-tight">
          Knowledge
        </span>
        <span className="text-lg md:text-xl font-bold text-blue-600 leading-tight">
          Network
        </span>
        <span className="text-lg md:text-xl font-bold text-blue-600 leading-tight">
          Solutions
        </span>
      </div>
    </div>
  );
}

