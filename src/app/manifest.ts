import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gen-Fuel Monitor',
    short_name: 'Gen-Fuel',
    description: 'Fuel Generator Monitoring System for Technicians',
    start_url: '/dashboard', // The mobile app usually lands in the dashboard natively
    display: 'standalone', // Makes it behave like a native mobile app without Safari/Chrome browser bars
    background_color: '#ffffff',
    theme_color: '#65a30d', // lime-600
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ],
  }
}
