// components/Navbar.jsx
'use client'; // Questo è necessario in Next.js 13+ App Router per i componenti interattivi

import Image from 'next/image'; // Importa il componente Image di Next.js per l'ottimizzazione
import { useEffect, useState } from 'react';

export default function Navbar() {
  // Gestione dello scroll per l'ombra della navbar (client-side logic)
  // Questo effect aggiunge/rimuove la shadow sulla nav quando l'utente scrolla
  // NOTA: Tailwind non supporta direttamente la shadow su scroll, quindi useremo JS per toggleare una classe.
  // In alternativa, potresti usare una libreria come framer-motion per animazioni più complesse.
  //  // Importa useState e useEffect

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Cleanup event listener
  }, []);

  return (
    <nav className={`fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-[#0F4C75]     
                    ${scrolled ? 'shadow-lg' : 'shadow-none'} transition-shadow duration-300`}>
      <a href="#" className="flex items-center text-white font-bold text-lg no-underline">
        {/* Usa il componente Image di Next.js per un'ottimizzazione migliore */}
        <Image src="/img/logo.jpg" alt="TalentWeave Logo" width={30} height={30} className="mr-2 rounded-md" />
        <span>TalentWeave</span>
      </a>

      <ul className="hidden md:flex list-none"> {/* Nasconde i link su schermi piccoli, visibili su medi e grandi */}
        <li className="mx-4">
          <a href="#features" className="text-white text-opacity-80 no-underline text-sm hover:text-white">Servizi</a>
        </li>
        <li className="mx-4">
          <a href="#how-it-works" className="text-white text-opacity-80 no-underline text-sm hover:text-white">Come Funziona</a>
        </li>
        <li className="mx-4">
          <a href="#faq" className="text-white text-opacity-80 no-underline text-sm hover:text-white">FAQ</a>
        </li>
        <li className="mx-4">
          <a href="#contact" className="text-white text-opacity-80 no-underline text-sm hover:text-white">Contatti</a>
        </li>
      </ul>

      <div className="flex items-center">
        <a href="/login" className="px-4 py-2 rounded-full no-underline text-sm ml-2 text-white border border-white border-opacity-30 hover:border-white">Accedi</a>
        <a href="/registrazione" className="px-4 py-2 rounded-full no-underline text-sm ml-2 bg-[#9C27B0] text-white hover:bg-[#8e24aa]">Registrati</a> {/* Hover color aggiunto */}
      </div>

      {/* Puoi aggiungere un bottone per il menu mobile qui se necessario */}
      {/* Ad esempio, con un hamburger icon e logica per mostrare/nascondere .nav-links */}
    </nav>
  );
}