'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "./components/Header";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <head>
        <Link
          href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        </head>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
