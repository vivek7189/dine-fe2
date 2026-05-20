import './globals.css'
import { Inter } from 'next/font/google'
import TokenExtractor from '../components/TokenExtractor'
import { Analytics } from "@vercel/analytics/next"
import { LoadingProvider } from '../contexts/LoadingContext'
import PostHogProvider from '../components/PostHogProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'DineOpen | The Global Restaurant Operating System',
  description: 'DineOpen powers restaurants worldwide with an all-in-one operating system. Cloud POS, waiter apps, table reservations, inventory management, AI analytics & loyalty programs. Trusted by 1000+ restaurants across 20+ countries.',
  keywords: 'restaurant operating system, restaurant POS software, cloud POS system, restaurant management platform, waiter ordering app, captain app restaurant, table reservation system, restaurant inventory management, restaurant analytics software, loyalty program restaurant, multi-location restaurant POS, restaurant billing software, kitchen display system',
  authors: [{ name: 'DineOpen Team' }],
  creator: 'DineOpen',
  publisher: 'DineOpen',
  robots: 'index, follow',
  openGraph: {
    title: 'DineOpen | Powering Restaurants Worldwide',
    description: 'The all-in-one restaurant operating system. POS, orders, inventory, analytics & growth tools trusted by 1000+ restaurants globally.',
    url: 'https://www.dineopen.com',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - The Global Restaurant Operating System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen | Powering Restaurants Worldwide',
    description: 'The all-in-one restaurant operating system. POS, orders, inventory, analytics & growth. Trusted by 1000+ restaurants globally.',
    images: ['https://www.dineopen.com/og-image.jpg'],
    creator: '@dineopen',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ef4444',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="google-site-verification" content="RTIIGHLt3AjnBo3YbmCmbEc32r0dYS6XpO0n2bX7T1A" />
        {/* TODO: Add GA4 - get measurement ID from https://analytics.google.com */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script> */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {/* Unregister old broken service worker from Serwist */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              registrations.forEach(function(registration) { registration.unregister(); });
            });
          }
        ` }} />
        <PostHogProvider>
          <LoadingProvider>
            <TokenExtractor />
            {children}
          </LoadingProvider>
        </PostHogProvider>
        <Analytics />
        {/* <script
          src="https://fixflow-fe.vercel.app/sdk.js"
          data-api-key="ff_9938c164292e9424678ed4d33e9ed7b672d18a648e81cb9903304fbe46849916"
          data-api-url="https://fixflow-be.vercel.app/api/events"
          async
        ></script> */}
      </body>
    </html>
  )
}
