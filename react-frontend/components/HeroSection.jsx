// components/HeroSection.jsx
'use client'; // Anche questo componente avrà interazioni (CTA button)

import Image from 'next/image';

export default function HeroSection() {
  const handleCtaClick = () => {
    // Gestisce il click del bottone CTA
    // In un'applicazione React/Next.js, potresti voler usare useRouter
    // per navigare a una pagina specifica, o semplicemente fare uno scroll
    // a una sezione con un ID (come nel tuo codice originale).
    // Per ora manteniamo lo scroll, ma considera la navigazione di Next.js (Link).
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="flex flex-col md:flex-row items-center min-h-screen px-8 py-20 md:py-0 bg-[#0F4C75] text-white overflow-hidden">
      <div className="flex-1 max-w-xl text-center md:text-left mb-8 md:mb-0 md:mr-16">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">Colleghiamo aziende e candidati con un click</h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">Senza stress, solo risultati. La piattaforma innovativa che rivoluziona il recruiting</p>
        <button
          className="bg-white text-[#0F4C75] border-none px-8 py-4 rounded-full font-bold text-base cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          onClick={handleCtaClick}
        >
          Inizia ora
        </button>
      </div>
      <div className="flex-1 w-full flex justify-center md:justify-end">
        <Image
          src="/img/image.png"
          alt="Team di lavoro che collabora in ufficio"
          width={600} // Larghezza intrinseca dell'immagine per ottimizzazione
          height={400} // Altezza intrinseca
          className="max-w-full h-auto rounded-lg shadow-2xl"
          priority // Carica questa immagine prima per LCP (Largest Contentful Paint)
        />
      </div>
    </section>
  );
}