import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Inter } from "next/font/google";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SITE_URL } from "@/lib/constants";
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z9J49J07HS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z9J49J07HS');
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "yj6kpwnnpm");
          `}
        </Script>
      </head>
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
