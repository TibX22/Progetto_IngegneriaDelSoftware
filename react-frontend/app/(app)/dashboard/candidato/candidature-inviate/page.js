// app/dashboard/candidato/candidature-inviate/page.js
// Questo file definisce la pagina per la rotta /dashboard/candidato/candidature-inviate

import React from 'react';
// Percorso corretto per il componente AppliedJobs utilizzando un percorso relativo
import AppliedJobs from '@/components/CandidateDashboard/AppliedJobs';

export default function AppliedJobsPage() {
  return (
    // Il componente AppliedJobs gestisce il caricamento e la visualizzazione dello storico delle candidature.
    // Non è necessario un layout aggiuntivo qui se il layout principale della dashboard lo avvolge già.
    <AppliedJobs />
  );
}
