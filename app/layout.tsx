import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '芒芒人海 MANG MANG | 台南玉井芒果產地直送',
  description: '台南玉井新鮮芒果，產地直送到府。愛文芒果、玉文芒果，品質優良，直接向果農購買。',
  keywords: '芒果,台南,玉井,愛文芒果,玉文芒果,產地直送',
  openGraph: {
    title: '芒芒人海 MANG MANG',
    description: '台南玉井新鮮芒果，產地直送',
    locale: 'zh_TW',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
