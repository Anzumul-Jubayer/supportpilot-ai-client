import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "../providers";
import GoogleProvider from "@/components/providers/google-provider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SupportPilot AI",
  description: "AI-powered customer support platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <GoogleProvider>
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { fontSize: "14px" },
                success: { duration: 3000 },
                error: { duration: 5000 },
              }}
            />
          </Providers>
        </GoogleProvider>
      </body>
    </html>
  );
}
