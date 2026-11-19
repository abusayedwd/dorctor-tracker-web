import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import StoreProvider from "@/store/StoreProvider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Doctor Tracker", template: "%s · Doctor Tracker" },
  description: "Admin portal to manage doctors, their patients and clinical analytics.",
};

export const viewport: Viewport = {
  themeColor: "#1f66bd",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StoreProvider>{children}</StoreProvider>
        <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}
