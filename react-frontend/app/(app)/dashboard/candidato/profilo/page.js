// app/(app)/dashboard/candidato/profilo/page.js
import React from 'react';
import UserProfile from '@/components/CandidateDashboard/UserProfile'; // Percorso corretto dal root del progetto
import styles from '@/components/CandidateDashboard/CandidateDashboard.module.css'; // <<-- AGGIUNGI QUESTA LINEA


export default function ProfiloPage() {
  return (
    // Avvolgiamo UserProfile in un div con dashboardContent
    // per applicare il padding standard della dashboard
    <div className={styles.dashboardContent}>
      <UserProfile />
    </div>
  );
}