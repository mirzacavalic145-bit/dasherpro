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
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
