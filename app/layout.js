import { Playfair_Display, Lora } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '700', '900'],
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: "TFS Book Club",
  description: 'A modern book club community',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable}`}>
      <body className={lora.className}>
        {children}
      </body>
    </html>
  )
}