import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
const plexMono = IBM_Plex_Mono({
    variable: "--font-plex-mono",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});
const siteUrl = process.env.APP_URL || "http://localhost:3000";
export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Bangladeshist Magazine — Culture, Tech & Ideas from Bangladesh",
        template: "%s | Bangladeshist Magazine",
    },
    description: "Bangladeshist Magazine is a digital publication covering culture, technology, politics and ideas from Bangladesh and beyond.",
    keywords: [
        "Bangladesh",
        "magazine",
        "culture",
        "technology",
        "politics",
        "ideas",
    ],
    authors: [{ name: "Bangladeshist Magazine" }],
    openGraph: {
        title: "Bangladeshist Magazine",
        description: "Culture, Tech & Ideas from Bangladesh and beyond.",
        url: siteUrl,
        siteName: "Bangladeshist Magazine",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Bangladeshist Magazine",
        description: "Culture, Tech & Ideas from Bangladesh and beyond.",
    },
    robots: { index: true, follow: true },
};
export default function RootLayout({ children, }) {
    return (<html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${plexMono.variable} font-mono antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <ThemeProvider>
          {children}
          <Toaster />
          <SonnerToaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>);
}
