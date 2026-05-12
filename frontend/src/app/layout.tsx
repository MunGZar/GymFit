import type { Metadata } from "next";

import "@/styles/base/globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
      <body>
        {/*
          AuthProvider envuelve toda la app para que cualquier
          componente pueda acceder al contexto de autenticación
          mediante useAuth().
        */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
