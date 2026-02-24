import type { Metadata } from "next";
import Script from "next/script";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kevin Ryan | DevOps Engineer · Platform Engineer · AI-Native · Author",
  description: "Senior DevOps and Platform Engineering contractor with 30 years embedding with enterprise clients and making complex technology work in production. CI/CD, Kubernetes, Terraform, AI governance. CERN, Nestlé, NatWest, BBC Worldwide, Financial Times, Dematic.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Bebas+Neue&family=UnifrakturMaguntia&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SiteHeader />
        {children}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="274c83f6-0775-49a8-824c-da380cf7535b"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
