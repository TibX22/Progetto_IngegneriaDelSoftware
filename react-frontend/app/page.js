// app/page.js
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';

export default function HomePage() {
  return (
    <>
      {/* La Navbar è solitamente inserita nel layout per essere presente su tutte le pagine */}
      {/* Ma per semplicità di conversione rapida, la mettiamo qui per ora */}
      <Navbar /> 
      
      <main>
        <HeroSection />
        {/* Qui andranno le tue altre sezioni (Servizi, Come Funziona, FAQ, Contatti) */}
        {/* Ad esempio: */}
        {/* <section id="features" className="py-20 px-8 bg-white">
          <h2 className="text-3xl font-bold text-center mb-10">I Nostri Servizi</h2>
          <p>Contenuto dei servizi...</p>
        </section> */}
        {/* Ripeti per altre sezioni */}
      </main>

      {/* Potresti voler aggiungere un componente Footer qui */}
    </>
  );
}