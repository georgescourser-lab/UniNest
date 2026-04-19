import type { Metadata, Viewport } from 'next'
import { Manrope, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Uninest | Trusted Student Housing for Comrades',
  description:
    'Find verified bedsitters and hostels around KU with zero viewing fees, safer booking, and roommate matching built for comrades.',
  keywords:
    'uninest, bedsitter, hostel, KU, Kenyatta University, comrades, kahawa wendani, kahawa sukari, ruiru',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const setInitialTheme = `
    (() => {
      const key = 'uninest-theme';
      const stored = localStorage.getItem(key);
      const isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    })();
  `

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} font-sans brand-shell`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="mt-20 border-t border-border/70 bg-card/90 py-10 text-foreground">
          <div className="section-wrap">
            <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <h4 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">About</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">Community</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Reviews
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Trust & Safety
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Feedback
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Report Issue
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground transition">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
              <p>&copy; 2026 Uninest. No ghost developments. Zero viewing fees. Built for comrades.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
