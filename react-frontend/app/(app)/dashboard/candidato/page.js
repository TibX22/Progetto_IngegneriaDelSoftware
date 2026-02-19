// src/app/dashboard/candidato/page.js
// Questa è la pagina che viene renderizzata quando si accede a /dashboard/candidato
'use client'; // Questi componenti potrebbero usare useState/useEffect, quindi 'use client'.

import React from 'react';
import WelcomeCard from '../../../../components/CandidateDashboard/WelcomeCard';
import StatsContainer from '../../../../components/CandidateDashboard/StatsContainer';
import RecentActivity from '../../../../components/CandidateDashboard/RecentActivity';
// NON importare più Header, Sidebar o CandidateDashboard qui. Sono gestiti dal layout.

export default function CandidatoHomePage() {
  console.log("app/dashboard/candidato/page.js: Rendering la homepage della dashboard del Candidato.");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Welcome Card e Stats Container */}
      <div className="md:col-span-1">
        <WelcomeCard />
        <div className="mt-4 md:mt-0">
          <StatsContainer />
        </div>
      </div>

      {/* Attività Recenti */}
      <div className="md:col-span-1 mt-4 md:mt-0">
        <RecentActivity />
      </div>
    </div>
  );
}