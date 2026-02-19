// components/CompanyDashboard/CompanySidebar.js
'use client';

import React, { useState, useEffect } from 'react';
// Importiamo gli stili dal modulo CSS aziendale
import styles from './CompanyDashboard.module.css';

export default function CompanySidebar({ isActive, onClose, onNavigate, currentPath }) {
  // Funzione per gestire il logout dell'utente
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt'); // Rimuove il token JWT
      localStorage.removeItem('jwt_token'); // Rimuovi eventuali altri token (se usati)
      localStorage.removeItem('user'); // Rimuovi i dati utente dell'azienda se presenti
      window.location.href = '/login'; // Reindirizza alla pagina di login
    }
    if (onClose) {
      onClose(); // Chiudi la sidebar se la funzione è fornita
    }
  };

  // Elementi di navigazione della sidebar
  const navItems = [
    { name: 'Dashboard Aziendale', icon: 'fas fa-th-large', href: '/dashboard/azienda' },
    { name: 'Il Mio Profilo', icon: 'fas fa-building', href: '/dashboard/azienda/profilo' },
    { name: 'Le Tue Offerte', icon: 'fas fa-list-alt', href: '/dashboard/azienda/le-mie-offerte' },
    { name: 'Gestione Materiale', icon: 'fas fa-book', href: '/dashboard/azienda/materiale-onboarding' },
    { name: 'Gestione Test', icon: 'fas fa-clipboard-question', href: '/dashboard/azienda/test' },
    { name: 'Gestisci Candidature', icon: 'fas fa-user-friends', href: '/dashboard/azienda/gestisci-candidature' },
    // Rimosso: { name: 'Pianifica Colloquio', icon: 'fas fa-calendar-alt', href: '/dashboard/azienda/pianifica-colloquio' },
    { name: 'Statistiche/Report', icon: 'fas fa-chart-bar', href: '/dashboard/azienda/statistiche-report' },
    { name: 'Messaggi/Comunicazioni', icon: 'fas fa-comments', href: '/dashboard/azienda/messaggi-comunicazioni' },
    { name: 'Esci', icon: 'fas fa-sign-out-alt', href: '#', isLogout: true }, // Rimosse Impostazioni e Supporto
  ];

  return (
    <div className={`${styles.sidebar} ${isActive ? styles.active : ''}`}>
      <div className={styles.logoContainer}>
        <img
          src="/img/logo.jpg" // Placeholder per il logo aziendale (es. Company Weave)
          alt="Company Logo"
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
                // Bottone di logout con gestione specifica
                <a
                  href="#"
                  onClick={handleLogout}
                  className={`${styles.navItem} ${styles.logoutBtn}`}
                >
                  <i className={item.icon}></i>
                  <span>{item.name}</span>
                </a>
              ) : (
                // Link di navigazione normale
                <a
                  href={`#${item.href.replace('/dashboard/azienda/', '')}`}
                  onClick={(e) => {
                    e.preventDefault(); // Previeni il comportamento di default del link
                    onNavigate(item.href); // Chiama la funzione di navigazione dal parent
                  }}
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

      {/* Bottone per chiudere la sidebar, visibile solo su mobile */}
      <button onClick={onClose} className={styles.closeBtn}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
