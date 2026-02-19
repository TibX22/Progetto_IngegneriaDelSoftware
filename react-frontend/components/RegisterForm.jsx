'use client'; // Necessario per i componenti che usano useState, useEffect, etc.

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Importa il componente Image di Next.js
import Link from 'next/link'; // Importa Link per la navigazione interna di Next.js
import { useRouter } from 'next/navigation'; // Importa useRouter per la navigazione
import styles from './RegisterForm.module.css';

// Definisci l'URL di Strapi usando una variabile d'ambiente
// Assicurati che NEXT_PUBLIC_STRAPI_URL sia definito nel tuo .env.local
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState(''); // Corrisponde a 'tipo'
  const [errors, setErrors] = useState({}); // Gestisce gli errori di validazione per ogni campo
  const [resultMessage, setResultMessage] = useState({ type: '', message: '' }); // Messaggio di successo/errore generale
  const [loading, setLoading] = useState(false); // Stato di caricamento
  const router = useRouter(); // Inizializza l'hook per la navigazione

  // Resetta i messaggi di errore e risultato quando i campi cambiano
  useEffect(() => {
    setErrors({});
    setResultMessage({ type: '', message: '' });
  }, [username, email, password, accountType]);

  // Validazione input prima dell'invio
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (username.length < 3) {
      newErrors.username = 'L\'username deve contenere almeno 3 caratteri.';
      isValid = false;
    }

    // Regex per validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Inserisci un indirizzo email valido.';
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'La password deve contenere almeno 6 caratteri.';
      isValid = false;
    }

    if (!accountType) {
      newErrors.accountType = 'Seleziona un tipo di account.';
      isValid = false;
    }

    setErrors(newErrors); // Aggiorna lo stato degli errori
    return isValid;
  };

  const handleSubmit = async (event) => {
    console.log('handleSubmit called'); // Debug: verifica se la funzione viene chiamata
    event.preventDefault(); // Previene il comportamento predefinito del form

    if (!validateForm()) {
      return; // Se la validazione fallisce, ferma l'esecuzione
    }

    setLoading(true); // Inizia il caricamento
    setResultMessage({ type: 'loading', message: 'Registrazione in corso...' });

    try {
      // 1. Registrazione utente base
      const registerResponse = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error?.message || 'Errore durante la registrazione iniziale.');
      }

      const registerData = await registerResponse.json();
      const userId = registerData.user.id;
      const token = registerData.jwt;

      // 1.1 Aggiornamento campi personalizzati dell'utente
      const userUpdateResponse = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          Ruolo: accountType, // Il campo 'Ruolo' è personalizzato
          stato: "in attesa",
          dataCreazione: new Date().toISOString(),
          profiloCompleto: false
        }),
      });

      if (!userUpdateResponse.ok) {
        const errorData = await userUpdateResponse.json();
        throw new Error(errorData.error?.message || 'Errore durante l\'aggiornamento dei dettagli utente.');
      }

      // 2. Creazione profilo Candidato o Azienda
      let endpoint = accountType === 'Candidato' ? 'candidatoes' : 'aziendas'; // Endpoint plurali per Strapi V4

      const profileResponse = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: { // Wrap in 'data' per Strapi V4
            user: userId
          }
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error?.message || `Errore durante la creazione del profilo ${accountType}.`);
      }

      // 3. Aggiornamento stato utente a "attivo"
      const statusResponse = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stato: "attivo"
        }),
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(errorData.error?.message || 'Errore durante l\'aggiornamento dello stato finale.');
      }

      // Salva i dati dell'utente nel localStorage (per un possibile login automatico o precompilazione)
      const finalUserData = {
        jwt: token,
        user: {
          id: userId,
          username: username,
          email: email,
          Ruolo: accountType,
          stato: "attivo",
          confirmed: true,
          blocked: false,
          profiloCompleto: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      localStorage.setItem('user', JSON.stringify(finalUserData.user)); // Salva solo l'oggetto user, non tutto il JWT
      localStorage.setItem('jwt_token', token); // Salva il token separatamente

      setResultMessage({ type: 'success', message: 'Registrazione completata con successo! Verrai reindirizzato...' });

      // Reindirizzamento alla pagina di login dopo 2 secondi
      setTimeout(() => {
        router.push('/login'); // Naviga a /login (che corrisponderà a app/login/page.js)
      }, 2000);

    } catch (err) {
      console.error('Errore durante la registrazione:', err);
      let errorMessage = err.message;

      // Gestione degli errori specifici di Strapi
      if (errorMessage.includes('email already taken')) {
        errorMessage = 'L\'indirizzo email è già registrato.';
      } else if (errorMessage.includes('username already taken')) {
        errorMessage = 'L\'username è già in uso.';
      } else if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Impossibile connettersi al server. Verifica che Strapi sia in esecuzione.';
      } else if (errorMessage.includes('Not Found') || errorMessage.includes('Bad Request')) {
        errorMessage = `Problema con l'endpoint API: ${errorMessage}. Controlla la configurazione di Strapi.`;
      }
      
      setResultMessage({ type: 'error', message: `Errore: ${errorMessage}` });
    } finally {
      setLoading(false); // Termina il caricamento
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5 bg-white text-[#2b2d42]">
      <div className={styles['register-container']}> {/* Usa styles['register-container'] per classi con trattini */}
        <div className={styles.logo}>
          {/* Assicurati che l'immagine del logo sia nella cartella public/img */}
          <Image
            src="/img/logo.jpg" // Percorso relativo alla cartella `public`
            alt="JobConnect Logo"
            width={60}
            height={60}
            className="rounded-lg object-cover" // Mantieni le classi di stile Tailwind
          />
        </div>
        
        <h1>Crea il tuo account</h1>
        
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              required
              minLength="3"
              placeholder="Scegli un username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <div className={styles['error-message']}>{errors.username}</div>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              required
              placeholder="Inserisci la tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div className={styles['error-message']}>{errors.email}</div>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              minLength="6"
              placeholder="Crea una password sicura"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div className={styles['error-message']}>{errors.password}</div>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="accountType">Tipo account</label>
            <select
              id="accountType"
              required
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="">-- Seleziona il tuo profilo --</option>
              <option value="Candidato">Candidato</option>
              <option value="Azienda">Azienda</option>
            </select>
            {errors.accountType && <div className={styles['error-message']}>{errors.accountType}</div>}
          </div>

          {/* CLASSE AGGIUNTA QUI */}
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Registrazione in corso...' : 'Registrati ora'}
          </button>
        </form>

        <div className={styles['login-link']}>
          Hai già un account? <Link href="/login">Accedi qui</Link>
        </div>

        {/* Mostra il messaggio di risultato (successo/errore/caricamento) */}
        {resultMessage.message && (
          <div
            id="risultato"
            className={`
              mt-6 p-3 rounded-lg text-center
              ${resultMessage.type === 'success' ? styles['success-message'] : ''}
              ${resultMessage.type === 'error' ? styles['error-global-message'] : ''}
              ${resultMessage.type === 'loading' ? styles['loading-message'] : ''}
            `}
          >
            {resultMessage.type === 'loading' && <span className={styles['loading-spinner']}></span>}
            {resultMessage.message}
          </div>
        )}
      </div>
    </div>
  );
}