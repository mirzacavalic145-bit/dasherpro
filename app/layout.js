import './globals.css'

export const metadata = {
  title: 'DasherPro — Dash Smarter. Earn More.',
  description: 'The AI-powered strategy tool for DoorDash dashers. Peak times, zone intelligence, order grader, and AI coach for every US city.',
  openGraph: {
    title: 'DasherPro — Dash Smarter. Earn More.',
    description: 'Make more every shift. AI-powered zone intel, order grader, and earnings tracker for DoorDash dashers.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;1,14..32,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
