import "./globals.css";     
import { Providers } from "@/providers/providers";
import { cn } from "@/lib/utils";  
import { Inter } from "next/font/google"; 

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
