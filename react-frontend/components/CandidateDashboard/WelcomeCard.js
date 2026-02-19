import React from 'react';
import styles from './CandidateDashboard.module.css';

export default function WelcomeCard() {
  return (
    <div className={styles.welcomeCard}>
      <h2>Stato delle tue candidature</h2>
      <p>Ecco una panoramica delle tue attività recenti e dello stato delle tue candidature. Abbiamo rilevato che il tuo profilo ha un tasso di risposta del 78%, superiore alla media del 65% per la tua area professionale.</p>
      
      <div className={styles.quickActions}>
        <button className={styles.actionBtn}>
          <i className="fas fa-file-alt"></i> Aggiorna CV
        </button>
        <button className={`${styles.actionBtn} ${styles.secondary}`}>
          <i className="fas fa-chart-pie"></i> Statistiche complete
        </button>
      </div>
    </div>
  );
}