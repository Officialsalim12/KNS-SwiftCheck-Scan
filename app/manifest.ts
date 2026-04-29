import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KNS SwiftCheck Scan',
    short_name: 'CheckScan',
    description: 'Smart Attendance Tracking System',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/WhatsApp_Image_2025-11-12_at_7.05.22_PM-removebg-preview.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/WhatsApp_Image_2025-11-12_at_7.05.22_PM-removebg-preview.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
