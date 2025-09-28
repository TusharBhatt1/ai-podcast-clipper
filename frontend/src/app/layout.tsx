import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Podcast Clipper",
  description:
    "In few just clicks, generate viral clips from long podcasts using AI",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
