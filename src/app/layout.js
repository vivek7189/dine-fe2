import './globals.css'
import TokenExtractor from '../components/TokenExtractor'
import { Analytics } from "@vercel/analytics/next"
import { LoadingProvider } from '../contexts/LoadingContext'
export const metadata = {
  title: 'DineOpen - AI-Powered Restaurant Billing Software & Management System',
  description: 'Complete AI-powered restaurant billing software and management solution with multi-restaurant support, POS system, inventory management, order tracking, QR menus, and real-time analytics. Streamline your restaurant operations with DineOpen.',
  keywords: 'restaurant billing software, restaurant management, POS system, inventory management, order tracking, QR menu, restaurant analytics, multi-restaurant management, AI restaurant, food service management, restaurant software, table management, kitchen display system, restaurant POS, order management system',
  authors: [{ name: 'DineOpen Team' }],
  creator: 'DineOpen',
  publisher: 'DineOpen',
  robots: 'index, follow',
  openGraph: {
    title: 'DineOpen - AI-Powered Restaurant Management System',
    description: 'Complete AI-powered restaurant management solution with multi-restaurant support, POS system, inventory management, and order tracking.',
    url: 'https://www.dineopen.com',
    siteName: 'DineOpen',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen Restaurant Management System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen - AI-Powered Restaurant Management System',
    description: 'Complete AI-powered restaurant management solution with multi-restaurant support, POS system, inventory management, and order tracking.',
    images: ['/og-image.jpg'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ef4444',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
          data-next-font="true"
        />
        {/* Analytics Script */}
        {/* <script
          defer
          data-website-id="dfid_XPKZbIBWhgE8AtCACES6e"
          data-domain="dineopen.com"
          src="https://datafa.st/js/script.js">
        </script> */}
      </head>
      <body suppressHydrationWarning={true}>
        <LoadingProvider>
          <TokenExtractor />
          {children}
        </LoadingProvider>
        <Analytics />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        <script 
          src="https://fixflow-fe.vercel.app/sdk.js" 
          data-api-key="ff_9938c164292e9424678ed4d33e9ed7b672d18a648e81cb9903304fbe46849916" 
          data-api-url="https://fixflow-be.vercel.app/api/events"
          async
        ></script>
      </body>
    </html>
  )
}
