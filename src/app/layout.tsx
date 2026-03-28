import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata = {
  title: "Virtual Library | Blackwell's Style",
  description: "O experiență premium de lectură",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-white text-zinc-900`}>
        {/* Aici va veni Navbar-ul imediat */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}