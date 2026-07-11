import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import NavbarWrapp from "@/components/NavbarWrapp";
import Provider from "@/components/provider/reactProvider";
import SwRegister from "@/components/SwRegister";

export const metadata: Metadata = {
  title: "EngineerBlog – Multi-User Engineering Blog Platform",
  description:
    "A multi-user platform for engineers to publish, read and discover technical blog posts.",
  applicationName: "EngineerBlog",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EngineerBlog",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "EngineerBlog",
    description: "Discover and publish engineering blog posts.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // const {user}=useAuth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Provider>
            <NavbarWrapp/>
            {children}
          </Provider>
        </AuthProvider>
        {/* PWA service worker registration — runs client-side only */}
        <SwRegister />
      </body>
    </html>
  );
}
