import type { Metadata } from "next";
import "@/styles/base/globals.css";

export const metadata: Metadata = {
  title: "GymFit | Administración y Control",
  description: "Sistema premium de administración y control para gimnasios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
