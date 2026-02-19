// src/app/dashboard/candidato/layout.js
'use client'; // Questo componente usa hook di React come useState, useEffect, quindi è un Client Component.

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../../../components/CandidateDashboard/Header'; // Assicurati che il percorso sia corretto
import Sidebar from '../../../../components/CandidateDashboard/Sidebar'; // Assicurati che il percorso sia corretto
import { usePathname, useRouter } from 'next/navigation'; // Hook di Next.js per il routing

export default function CandidateDashboardLayout({ children }) {
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const pathname = usePathname(); // Ottiene il percorso URL corrente (es. /dashboard/candidato/profilo)
  const router = useRouter(); // Per navigazione programmatica (es. logout)

  const toggleSidebar = () => {
    setIsSidebarActive(prev => !prev);
  };

  // Chiudi la sidebar ogni volta che il percorso URL cambia (utile per mobile)
  useEffect(() => {
    setIsSidebarActive(false);
  }, [pathname]);

  // Funzione per la navigazione dalla Sidebar (usa il router di Next.js)
  const handleSidebarNavigation = useCallback((path) => {
    router.push(path); // Naviga verso il nuovo percorso
    setIsSidebarActive(false); // Chiudi la sidebar dopo aver cliccato un link
  }, [router]);


  return (
    <div className="flex min-h-screen w-full font-sans bg-gray-100 text-gray-800">
      {/* La Sidebar viene renderizzata qui */}
      <Sidebar
        isActive={isSidebarActive}
        onClose={toggleSidebar}
        onNavigate={handleSidebarNavigation}
        currentPath={pathname} // Passa il percorso corrente alla Sidebar per evidenziare il link attivo
      />

      {/* Area principale del contenuto */}
      <div className="flex-grow md:ml-64 p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen transition-all duration-300 ease-in-out">
        {/* L'Header viene renderizzato qui */}
        <Header onMenuToggle={toggleSidebar} />
        <main className="mt-6">
          {children} {/* Qui Next.js inietterà il contenuto della pagina corrente (es. page.js di profilo, obiettivi-carriera, ecc.) */}
        </main>
      </div>
    </div>
  );
}