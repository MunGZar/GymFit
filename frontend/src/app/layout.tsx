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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var prefs = localStorage.getItem('gym_prefs');
                  if (prefs) {
                    var parsed = JSON.parse(prefs);
                    if (parsed.darkMode === false) {
                      document.body.classList.add('light-theme');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
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
