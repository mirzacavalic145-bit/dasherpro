import './globals.css'
import { Geist, Inter } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata = {
  title: 'DasherPro — Dash Smarter. Earn More.',
  description: 'The AI-powered strategy tool for DoorDash dashers. Peak times, zone intelligence, order grader, and AI coach for every US city.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DasherPro',
  },
  openGraph: {
    title: 'DasherPro — Dash Smarter. Earn More.',
    description: 'Make more every shift. AI-powered zone intel, order grader, and earnings tracker for DoorDash dashers.',
    type: 'website',
  },
}

export const viewport = {
  themeColor: '#1a9c4e',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DasherPro" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
            })
          }
        `}} />
      </body>
    </html>
  )
}
