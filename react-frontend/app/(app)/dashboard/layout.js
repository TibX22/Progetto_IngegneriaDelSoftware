// app/dashboard/layout.js
'use client';

import React, { useState, useEffect } from 'react';
// Importazioni rimosse di Sidebar e CompanySidebar:
// import Sidebar from '@/components/CandidateDashboard/Sidebar';
// import CompanySidebar from '@/components/CompanyDashboard/CompanySidebar';

export default function DashboardLayout({ children }) {
  const [userRole, setUserRole] = useState(null); // 'candidate' o 'company'
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          let roleName = null;
          if (userData.Ruolo) {
            roleName = userData.Ruolo;
          } else if (userData.role && userData.role.name) {
            roleName = userData.role.name;
          }

          if (roleName) {
            if (roleName === 'Candidato') {
              setUserRole('candidate');
            } else if (roleName === 'Azienda') {
              setUserRole('company');
            }
          }
        } catch (error) {
          console.error("Errore nel parsing dei dati utente dal localStorage:", error);
          localStorage.removeItem('user');
          localStorage.removeItem('jwt');
        }
      }
      setLoadingRole(false);
    }
  }, []);

  if (loadingRole) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-xl">Caricamento dashboard...</p>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-red-700">
        <p className="text-xl">Impossibile determinare il ruolo utente o utente non autenticato.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Vai al Login
        </button>
      </div>
    );
  }

  return (
    // Questo layout fornirà solo il "contenitore" generico per i children
    // I componenti specifici della dashboard (CompanyDashboard o CandidateDashboard)
    // saranno responsabili di includere le proprie sidebar.
    <div className="flex min-h-screen w-full font-sans bg-gray-100 text-gray-800">
      {children}
    </div>
  );
}
