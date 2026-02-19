'use client'; // Necessario per i componenti che usano useState, useEffect, etc.

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Importa il componente Image di Next.js
import { useRouter } from 'next/navigation'; // Importa useRouter per la navigazione

// Definisci l'URL di Strapi
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'; // Migliora con variabile d'ambiente

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordShown, setPasswordShown] = useState(false);
  const [resultMessage, setResultMessage] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Inizializza l'hook per la navigazione

  // Simula la funzione di login che interagisce con Strapi
  const loginUser = async (identifier, pass) => {
    try {
      setLoading(true); // Inizia il caricamento
      setResultMessage({ type: '', message: 'Verifica credenziali...' });

      console.log("[LoginPage] Attempting to login with:", { identifier, pass: '***' }); // NUOVO LOG: Dati di login

      const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: pass }),
      });

      const data = await response.json();
      console.log("[LoginPage] Raw response data from Strapi login:", data); // NUOVO LOG: Risposta completa di Strapi

      if (data.jwt) {
        localStorage.setItem("jwt", data.jwt);
        console.log("[LoginPage] JWT successfully set in localStorage. Value:", data.jwt); // NUOVO LOG: Conferma JWT

        try {
          const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${data.jwt}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            localStorage.setItem("user", JSON.stringify(userData));
            setResultMessage({ type: 'success', message: 'Login riuscito!' });
            console.log("[LoginPage] User data from /users/me successfully fetched and saved:", userData); // NUOVO LOG: Dati utente me

            // Navigazione basata sul ruolo dopo un breve ritardo
            setTimeout(() => {
              // Assicurati che 'Ruolo' o 'role.name' sia il percorso corretto per il ruolo in Strapi
              const ruolo = userData?.Ruolo || userData?.role?.name; 
              if (ruolo === "Azienda") {
                router.push("/dashboard/azienda"); 
              } else if (ruolo === "Candidato") {
                router.push("/dashboard/candidato");
              } else {
                router.push("/home");
              }
            }, 1000); 
          } else {
            // Se la fetch a /users/me fallisce ma il JWT è valido, usa i dati user_basic
            console.warn("[LoginPage] Failed to fetch /users/me data, but JWT is valid. Status:", userResponse.status); // NUOVO LOG: Errore /users/me
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
                setResultMessage({ type: 'success', message: 'Login riuscito! (Dati utente parziali)' });
                router.push("/home"); // Reindirizza comunque o gestisci un caso d'uso specifico
            } else {
                setResultMessage({ type: 'error', message: 'Login riuscito, ma impossibile recuperare i dettagli utente completi.' });
            }
          }
        } catch (fetchError) {
          // Errore durante il recupero dei dettagli utente, ma JWT ottenuto
          console.error("Errore nel recupero dati utente da /users/me:", fetchError);
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setResultMessage({ type: 'success', message: 'Login riuscito! (Errore recupero dettagli, dati base salvati)' });
            router.push("/home");
          } else {
              setResultMessage({ type: 'error', message: 'Login riuscito, ma errore durante il recupero dei dettagli utente.' });
          }
        }
        return { success: true, user: data.user };
      } else {
        setResultMessage({ type: 'error', message: data.error?.message || "Credenziali non valide" });
        console.error("[LoginPage] Login failed, no JWT received. Strapi response error:", data.error); // NUOVO LOG: Login fallito
        return { success: false, error: data.error?.message || "Credenziali non valide" };
      }
    } catch (error) {
      setResultMessage({ type: 'error', message: "Errore di connessione al server" });
      console.error("[LoginPage] Connection error during login:", error); // NUOVO LOG: Errore di connessione
      return { success: false, error: "Errore di connessione al server" };
    } finally {
      setLoading(false); // Fine caricamento
    }
  };

  // Gestore dell'invio del form
  const handleSubmit = async (event) => {
    event.preventDefault(); // Previeni il comportamento predefinito del form

    if (!email || !password) {
      setResultMessage({ type: 'error', message: 'Inserisci email e password' });
      return;
    }
    
    // Chiamata alla funzione di login
    await loginUser(email, password);
  };

  // Toggle visibilità password
  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  // Mostra messaggio per password dimenticata
  const handleForgotPassword = (e) => {
    e.preventDefault(); // Previene la navigazione
    setResultMessage({ type: 'error', message: 'Funzionalità di recupero password non ancora implementata' });
  };

  // AGGIORNAMENTO QUI: Reindirizzamento alla pagina di registrazione
  const handleRegistration = (e) => {
    e.preventDefault(); // Previene il comportamento predefinito del link
    router.push('/registrazione'); // Reindirizza l'utente alla pagina di registrazione
  };

  // Effetto per pulire il localStorage e settare il focus all'apertura della pagina
  useEffect(() => {
    console.log("[LoginPage] Cleaning localStorage on component mount."); // NUOVO LOG: Pulizia localStorage
    localStorage.removeItem("jwt"); 
    localStorage.removeItem("jwt_token"); // Rimuovi anche la vecchia chiave per pulizia
    localStorage.removeItem("user");
    localStorage.removeItem("user_basic");
  }, []); // Esegui solo al mount del componente

  return (
    <div className="flex justify-center items-center min-h-screen p-5 bg-white text-[#2b2d42]">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-md border border-[#e0e0e0]">
        <div className="text-center mb-6 font-bold text-2xl text-[#4361ee] flex justify-center items-center gap-2">
          {/* Qui inseriamo il componente Image per il logo */}
          <Image
            src="/img/logo.jpg" // Percorso relativo alla cartella `public`
            alt="TalentWeave Logo"
            width={32} // Larghezza desiderata dell'immagine
            height={32} // Altezza desiderata dell'immagine
            className="rounded-full" // Applica la classe per la forma rotonda
          />
          <span>TalentWeave</span>
        </div>
        <h1 className="text-center text-2xl font-semibold mb-6">Accedi al tuo account</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 font-medium">Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="esempio@email.com"
                required
                className="w-full p-3 border border-[#e0e0e0] rounded-lg text-base pr-10 focus:outline-none focus:border-[#4361ee]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus // Aggiunto per il focus automatico
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={passwordShown ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Inserisci la tua password"
                required
                className="w-full p-3 border border-[#e0e0e0] rounded-lg text-base pr-10 focus:outline-none focus:border-[#4361ee]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer"
                onClick={togglePasswordVisibility}
                aria-label={passwordShown ? 'Nascondi password' : 'Mostra password'}
              >
                <span>{passwordShown ? '🙈' : '👁️'}</span>
              </button>
            </div>
          </div>
          
          <div className="text-right mb-6">
            <a href="#" onClick={handleForgotPassword} className="text-[#8d99ae] text-sm no-underline hover:underline">Password dimenticata?</a>
          </div>
          
          <button
            type="submit"
            className={`w-full p-3 text-base font-semibold rounded-lg cursor-pointer border-none 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4361ee] text-white hover:bg-[#3a56d4]'}`}
            disabled={loading} // Disabilita il bottone durante il caricamento
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
          
          <div className="text-center mt-6 text-base">
            Non hai un account? <a href="#" onClick={handleRegistration} className="text-[#4361ee] font-medium no-underline hover:underline">Registrati</a>
          </div>
        </form>

        {resultMessage.message && (
          <div 
            id="risultato" 
            className={`mt-6 p-4 rounded-lg text-center ${resultMessage.type === 'success' ? 'text-[#2ecc71] bg-[rgba(46,204,113,0.1)]' : 'text-[#ef233c] bg-[rgba(239,35,60,0.1)]'}`}
          >
            {resultMessage.message}
          </div>
        )}
      </div>
    </div>
  );
}
