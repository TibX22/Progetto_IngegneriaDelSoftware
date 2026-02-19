// app/(app)/layout.js
// NON usare 'use client' qui se non è strettamente necessario (es. per usePathname)
// Se la navbar GLOBALE usa usePathname, sposta la navbar stessa in un Client Component.

// import { MyGlobalNavbar } from '@/components/MyGlobalNavbar'; // Esempio di navbar globale

export default function AppLayout({ children }) {
  // Se la tua navbar globale fosse qui e usasse `usePathname`,
  // allora `MyGlobalNavbar` dovrebbe essere un Client Component.
  // const pathname = usePathname(); // Non puoi usare usePathname qui se non è un Client Component
  // const showNavbar = !['/login', '/register', '/dashboard/candidato', '/dashboard/azienda'].includes(pathname);

  return (
    // Questo è un contenitore per la sezione "(app)" della tua applicazione.
    // NON mettere <html> o <body> qui.
    <div className="flex flex-col min-h-screen"> {/* Esempio di contenitore flex per l'intera app */}
      {/* {showNavbar && <MyGlobalNavbar />} */}
      <main className="flex-1"> {/* Questo è il contenuto principale che riceve le pagine */}
        {children}
      </main>
      {/* Potresti avere un footer qui */}
    </div>
  );
}