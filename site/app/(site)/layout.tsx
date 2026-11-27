import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "White Land | Café at Centario, Pantai Hillpark",
  description:
    "A two-storey loft café in Kuala Lumpur. White walls, light wood, bare concrete and good coffee.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
