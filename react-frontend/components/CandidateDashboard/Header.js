// components/CandidateDashboard/Header.js
'use client';

import React, { useState, useEffect } from 'react';
// Importa Image solo se strettamente necessario e con configurazione adeguata in next.config.js
// import Image from 'next/image';
import styles from './CandidateDashboard.module.css';

export default function Header({ onMenuToggle }) {
  // LOG: Indica che la funzione del componente Header è stata chiamata
  console.log("Header component function started.");

  const [fullName, setFullName] = useState('Utente');
  // Usiamo un tag <img> standard per la placeholder image e un servizio alternativo
  const [profilePic, setProfilePic] = useState('https://placehold.co/40x40/0F4C75/FFFFFF?text=U');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // LOG: Indica che il componente Header è stato montato sul client
    console.log("Header component mounted. Setting isClient to true.");
    // Questo log verrà eseguito una sola volta al montaggio iniziale del componente
  }, []);

  useEffect(() => {
    // Questo effetto viene eseguito solo sul client e quando isClient cambia o i dati fullName/profilePic cambiano
    console.log("Header useEffect (client-side) started for data fetching/update logic.");
    if (isClient) {
      // Recupera i dati utente dal localStorage
      const storedAuthData = localStorage.getItem("user");
      // LOG: Mostra i dati grezzi recuperati dal localStorage
      console.log("Header: Raw data from localStorage ('user'):", storedAuthData);

      if (storedAuthData) {
        console.log("Header: User data found in localStorage. Attempting to parse.");
        try {
          const userData = JSON.parse(storedAuthData); // Parsa i dati JSON dell'utente
          // LOG: Mostra i dati utente parsati
          console.log("Header: Parsed user data from localStorage:", userData);

          let newFullName = 'Utente';
          let newProfilePic = profilePic; // Inizializza con l'immagine profilo corrente

          // Determina il nome completo da visualizzare
          // Assicurati che 'profiloCandidato' sia popolato nella risposta /users/me di Strapi
          if (userData.profiloCandidato && userData.profiloCandidato.nome && userData.profiloCandidato.cognome) {
            newFullName = `${userData.profiloCandidato.nome} ${userData.profiloCandidato.cognome}`;
            console.log(`Header: Using fullName from profiloCandidato: ${newFullName}`);
          } else {
            // Fallback se i dati del profilo candidato non sono disponibili
            const fallbackName = userData.username || (userData.email ? userData.email.split('@')[0] : 'Utente');
            newFullName = fallbackName;
            console.log(`Header: Using fallback fullName: ${newFullName}`);
          }

          // Determina l'iniziale per l'immagine placeholder
          const initialForPic = (newFullName).charAt(0).toUpperCase();
          // Aggiorna l'URL del placeholder con placehold.co
          newProfilePic = `https://placehold.co/40x40/0F4C75/FFFFFF?text=${initialForPic}`;
          // LOG: Mostra l'URL finale dell'immagine profilo determinata
          console.log(`Header: Determined new profile picture URL: ${newProfilePic}`);

          // Aggiorna lo stato solo se il valore è effettivamente cambiato per evitare re-renders inutili
          if (newFullName !== fullName) {
            setFullName(newFullName);
            console.log(`Header: Updating fullName state to: ${newFullName}`);
          } else {
            console.log("Header: fullName state is already up-to-date.");
          }
          if (newProfilePic !== profilePic) {
            setProfilePic(newProfilePic);
            console.log(`Header: Updating profilePic state to: ${newProfilePic}`);
          } else {
            console.log("Header: profilePic state is already up-to-date.");
          }

        } catch (error) {
          // LOG: Errore nel parsing dei dati utente
          console.error("Header: Errore nel parsing dei dati utente dal localStorage:", error);
          localStorage.removeItem("user"); // Pulisce dati corrotti
          // Assicura che lo stato torni ai valori di default in caso di errore di parsing
          if (fullName !== 'Utente') setFullName('Utente');
          // Aggiorna anche il fallback di default con placehold.co
          if (profilePic !== 'https://placehold.co/40x40/0F4C75/FFFFFF?text=U') setProfilePic('https://placehold.co/40x40/0F4C75/FFFFFF?text=U');
          console.log("Header: Resetting states to default due to parsing error.");
        }
      } else {
        // Se non ci sono dati utente nel localStorage, assicura che lo stato sia quello di default
        console.log("Header: No 'user' data found in localStorage.");
        if (fullName !== 'Utente') {
          setFullName('Utente');
          console.log("Header: Resetting fullName to default 'Utente'.");
        }
        // Aggiorna anche il fallback di default con placehold.co
        if (profilePic !== 'https://placehold.co/40x40/0F4C75/FFFFFF?text=U') {
          setProfilePic('https://placehold.co/40x40/0F4C75/FFFFFF?text=U');
          console.log("Header: Resetting profilePic to default.");
        }
      }
    } else {
      // LOG: Indica che l'effetto non è stato eseguito perché non è ancora client-side
      console.log("Header: useEffect skipped, not client-side yet.");
    }
  }, [isClient, fullName, profilePic]); // Aggiunte fullName e profilePic come dipendenze

  // LOG: Indica che il componente Header sta per ritornare il suo JSX
  console.log("Header component is returning JSX. Current fullName:", fullName, "profilePic:", profilePic);

  return (
    <header className={styles.header}>
      {/* LOG: Indica che l'elemento header JSX è in fase di rendering */}
      {console.log("Header JSX element is rendering...")}
      <button className={styles.menuToggle} onClick={onMenuToggle}>
        <i className="fas fa-bars"></i>
      </button>
      <div className={styles.profileSection}>
        <div className={styles.notifications}>
          <i className="fas fa-bell"></i>
          <span className={styles.notificationBadge}>3</span>
        </div>

        <div className={styles.profileInfo}>
          {/* Usiamo un tag <img> standard invece di Image di Next.js per la placeholder */}
          <img
            src={profilePic}
            alt="Profile Picture"
            width={40}
            height={40}
            className={styles.profilePic}
            // Aggiungi un handler onError per un fallback visivo se l'immagine non carica
            // Usa placehold.co anche per l'errore
            onError={(e) => {
              console.error("Header: Error loading profile picture:", e.target.src);
              e.target.onerror = null;
              e.target.src = "https://placehold.co/40x40/CCCCCC/000000?text=ERR";
            }}
          />
          <span className={styles.profileName}>{fullName}</span> {/* Modificato da .userName a .profileName per coerenza con il CSS */}
        </div>
      </div>
    </header>
  );
}
