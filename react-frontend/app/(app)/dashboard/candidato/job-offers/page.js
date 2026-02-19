// src/app/dashboard/candidato/job-offers/page.js
import React from 'react';
import JobOffers from '@/components/CandidateDashboard/JobOffers'; // Assicurati il percorso corretto rispetto alla nuova posizione
import styles from '@/components/CandidateDashboard/CandidateDashboard.module.css'; // Per i layout

export default function JobOffersPage() {
  return (
    // Questo div dovrebbe corrispondere al tuo layout principale della dashboard,
    // per assicurare che la sidebar e l'header (se gestiti a livello di layout superiore)
    // funzionino correttamente. Ho mantenuto un contenitore base per coerenza.
    <div className={styles.dashboardContainer}>
      <main className={styles.mainContent}>
        <JobOffers />
      </main>
    </div>
  );
}
