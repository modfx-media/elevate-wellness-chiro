import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Inter } from "next/font/google";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SITE_URL } from "@/lib/site-content";
import { socialMetadata } from "@/lib/seo";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const defaultTitle = "Expert Chiropractic Care in Bountiful, UT | Elevate Wellness";
const defaultDescription =
  "Elevate Wellness Chiropractic provides personalized chiropractic care in Bountiful and Clinton, UT for pain relief and wellness. Schedule your visit today.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: "%s",
  },
  description: defaultDescription,
  ...socialMetadata({
    title: defaultTitle,
    description: defaultDescription,
    url: SITE_URL,
  }),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
        <Script id="knock-knock-config" strategy="afterInteractive">
          {`window.company_id = '6a96e16365212050a471ce42';`}
        </Script>
        <Script
          src="https://api.knock-knockapp.com/widget/widget.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
