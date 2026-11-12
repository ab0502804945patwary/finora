import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { site } from "@/lib/config";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: { default: `${site.name} — ${site.shortTagline}`, template: `%s · ${site.name}` },
  description: site.description,
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0b1f3a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
