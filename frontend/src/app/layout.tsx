import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { PWAInstaller } from "@/components/PWAInstaller";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tazish Food Business App",
  description: "Mobile friendly web application to manage Tazish Food business",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tazish App",
  },
  icons: {
    apple: "/icon.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0a] text-white flex min-h-[100dvh] flex-col md:flex-row pb-[80px] md:pb-0`}>
        <PWAInstaller />
        <Sidebar />
        <div className="flex-1 flex flex-col h-full md:h-screen w-full overflow-hidden relative">
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 bg-[#0a0a0a] w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
