// components/CandidateDashboard/Sidebar.js
'use client';

import React, { useState, useEffect } from 'react';
import styles from './CandidateDashboard.module.css'; // Importiamo stili CSS.

export default function Sidebar({ isActive, onClose, onNavigate, currentPath }) { // Aggiunto onNavigate e currentPath
  const [isClientReady, setIsClientReady] = useState(false);

  // Questo effetto assicura che il componente sia montato sul client
  useEffect(() => {
    setIsClientReady(true);
    console.log("Sidebar: Componente montato, isClientReady impostato a true.");
  }, []);

  // Funzione per gestire il logout dell'utente
  const handleLogout = () => {
    console.log("Sidebar: handleLogout chiamato."); // Log per debug
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt'); // Rimuovi il token JWT
      localStorage.removeItem('jwt_token'); // Rimuovi eventuali altri token (se usati)
      localStorage.removeItem('user'); // Rimuovi i dati utente
      console.log("Sidebar: Dati di autenticazione rimossi dal localStorage.");
    }
    window.location.href = '/login'; // Reindirizza alla pagina di login
    if (onClose) {
      console.log("Sidebar: Chiamando onClose (dovrebbe chiudere la sidebar)."); // Log per debug
      onClose(); // Chiudi la sidebar se la funzione è fornita
    }
  };

  const navItems = [
    { name: 'Dashboard Candidato', icon: 'fas fa-th-large', href: '/dashboard/candidato' },
    { name: 'Il Mio Profilo', icon: 'fas fa-user-circle', href: '/dashboard/candidato/profilo' },
    { name: 'Obiettivi di Carriera', icon: 'fas fa-crosshairs', href: '/dashboard/candidato/obiettivi-carriera' },
    { name: 'Le Mie Certificazioni', icon: 'fas fa-award', href: '/dashboard/candidato/certificazioni' },
    { name: 'I Miei Badge', icon: 'fas fa-certificate', href: '/dashboard/candidato/badge' },
    { name: 'Offerte di Lavoro', icon: 'fas fa-briefcase', href: '/dashboard/candidato/job-offers' },
    { name: 'Storico Candidature', icon: 'fas fa-history', href: '/dashboard/candidato/candidature-inviate' },
    { name: 'Messaggi/Comunicazioni', icon: 'fas fa-envelope', href: '/dashboard/candidato/messaggi' }, // Nuovo elemento per i messaggi
    { name: 'Logout', icon: 'fas fa-sign-out-alt', href: '#', isLogout: true },
  ];

  console.log(`Sidebar: isActive prop is ${isActive}. Current path: ${currentPath}`);

  return (
    <div className={`${styles.sidebar} ${isActive ? styles.active : ''}`}>
      <div className={styles.sidebarHeader}>
        <img
          src="/img/logo.jpg"
          alt="TalentWeave Logo"
          width={80}
          height={80}
          className={styles.logo}
        />
      </div>

      <nav className={styles.navMenu}>
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              {item.isLogout ? (
                <a
                  href="#"
                  onClick={handleLogout}
                  className={`${styles.navItem} ${styles.logoutBtn}`}
                >
                  <i className={item.icon}></i>
                  <span>{item.name}</span>
                </a>
              ) : (
                <a
                  href={`#${item.href.replace('/dashboard/candidato/', '')}`}
                  onClick={() => onNavigate(item.href)}
                  className={`${styles.navItem} ${currentPath === item.href ? styles.active : ''}`}
                >
                  <i className={item.icon}></i>
                  <span>{item.name}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <button onClick={onClose} className={styles.closeBtn}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
