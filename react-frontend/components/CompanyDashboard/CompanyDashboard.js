// components/CompanyDashboard/CompanyDashboard.js
'use client'; // Required for components using useState, useEffect, etc.

import React, { useEffect, useState, useCallback } from 'react';

// Importa i componenti necessari
import CompanyHeader from './CompanyHeader';
import CompanyWelcomeCard from './CompanyWelcomeCard';
import CompanyStatsContainer from './CompanyStatsContainer';
import PostedJobs from './PostedJobs';
import CompanyProfilePage from './CompanyProfilePage';
import PostedJobOffersPage from './PostedJobOffersPage';
import CompanySidebar from './CompanySidebar';
import MaterialeOnBoardingPage from './MaterialeOnBoardingPage';
import CompanyReportsPage from './CompanyReportsPage';
import TestPage from './TestPage';
import CandidateFeedback from './CandidateFeedback';
import CompanyMessagesPage from './CompanyMessagesPage';
import CompanyApplicationsPage from './CompanyApplicationsPage'; // NUOVO: Importa il componente CompanyApplicationsPage

export default function CompanyDashboard() {
  const [currentPath, setCurrentPath] = useState('/dashboard/azienda'); // Percorso predefinito
  const [authenticatedUserId, setAuthenticatedUserId] = useState(null); // ID utente autenticato
  const [aziendaId, setAziendaId] = useState(null); // ID dell'azienda associata all'utente
  const [loadingAziendaId, setLoadingAziendaId] = useState(true); // Stato di caricamento per aziendaId
  const [errorAziendaId, setErrorAziendaId] = useState(null); // Stato di errore per aziendaId

  const [isSidebarActive, setIsSidebarActive] = useState(false); // Stato per la visibilità della sidebar

  // Stato per l'ID del candidato selezionato per il feedback in-dashboard
  const [selectedCandidateIdForFeedback, setSelectedCandidateIdForFeedback] = useState(null);

  // Costanti API Strapi
  const STRAPI_BASE_URL = 'http://localhost:1337';
  const USER_ME_API_ENDPOINT = 'api/users/me';
  const AZIENDA_API_ENDPOINT = 'api/aziendas';

  // Funzione per ottenere le intestazioni di autenticazione con JWT
  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (!token) {
      console.warn("JWT token non trovato in localStorage.");
      return {};
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  // Effetto per verificare l'autenticazione e recuperare l'ID utente Strapi
  useEffect(() => {
    const fetchCurrentStrapiUser = async () => {
      setLoadingAziendaId(true);
      setErrorAziendaId(null);
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        setAuthenticatedUserId(null);
        setLoadingAziendaId(false);
        return;
      }

      try {
        const response = await fetch(`${STRAPI_BASE_URL}/${USER_ME_API_ENDPOINT}`, {
          headers: headers
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwt');
          }
          throw new Error(`Errore nel recupero dell'utente corrente: ${response.status}`);
        }

        const userData = await response.json();
        if (userData && userData.id) {
          setAuthenticatedUserId(userData.id);
        } else {
          setAuthenticatedUserId(null);
        }
      } catch (err) {
        console.error("Errore durante il recupero dell'utente nel CompanyDashboard:", err);
        setErrorAziendaId("Errore utente: " + err.message);
        setAuthenticatedUserId(null);
      } finally {
        setLoadingAziendaId(false);
      }
    };

    fetchCurrentStrapiUser();
  }, [getAuthHeaders]);

  // Effetto per recuperare l'azienda collegata all'utente autenticato
  useEffect(() => {
    const fetchAziendaId = async () => {
      if (!authenticatedUserId) {
        setAziendaId(null);
        setLoadingAziendaId(false);
        return;
      }

      try {
        const headers = getAuthHeaders();
        const aziendaResponse = await fetch(
          `${STRAPI_BASE_URL}/${AZIENDA_API_ENDPOINT}?populate=*&filters[user][id][$eq]=${authenticatedUserId}`,
          { headers }
        );

        if (!aziendaResponse.ok) {
          throw new Error(`Errore nel recupero azienda: ${aziendaResponse.statusText}`);
        }

        const aziendaData = await aziendaResponse.json();
        if (aziendaData.data && aziendaData.data.length > 0) {
          setAziendaId(aziendaData.data[0].id); // Memorizza l'ID numerico dell'azienda
          console.log("Azienda ID per CompanyDashboard:", aziendaData.data[0].id);
        } else {
          setAziendaId(null);
          setErrorAziendaId("Nessuna azienda trovata per l'utente autenticato.");
        }
      } catch (err) {
        console.error("Errore nel recupero dell'azienda per CompanyDashboard:", err);
        setErrorAziendaId("Errore azienda: " + err.message);
        setAziendaId(null);
      } finally {
        setLoadingAziendaId(false);
      }
    };
    fetchAziendaId();
  }, [authenticatedUserId, getAuthHeaders]);


  // Questo simula la logica di routing Next.js App Router usando gli hash URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
      let newPath = '/dashboard/azienda'; // Default to main dashboard
      let params = {};

      if (hash.includes('params=')) {
        try {
          const [mainHash, paramsString] = hash.split('params=');
          params = JSON.parse(decodeURIComponent(paramsString));
          newPath = `/dashboard/azienda/${mainHash.replace(/\/$/, '')}`;
        } catch (e) {
          console.error("Errore nel parsing dei parametri dell'URL:", e);
        }
      } else {
        if (hash === 'profilo') {
          newPath = '/dashboard/azienda/profilo';
        } else if (hash === 'le-mie-offerte') {
          newPath = '/dashboard/azienda/le-mie-offerte';
        } else if (hash === 'materiale-onboarding') {
          newPath = '/dashboard/azienda/materiale-onboarding';
        } else if (hash === 'statistiche-report') {
          newPath = '/dashboard/azienda/statistiche-report';
        } else if (hash === 'test') {
          newPath = '/dashboard/azienda/test';
        } else if (hash === 'messaggi-comunicazioni') {
          newPath = '/dashboard/azienda/messaggi-comunicazioni';
        } else if (hash === 'gestisci-candidature') { // NUOVO: Aggiungi il percorso per Gestisci Candidature
          newPath = '/dashboard/azienda/gestisci-candidature';
        }
        else if (hash.startsWith('candidato/feedback')) {
            newPath = '/dashboard/azienda/candidato/feedback';
            const idMatch = hash.match(/candidatoId=(\d+)/);
            if (idMatch && idMatch[1]) {
              setSelectedCandidateIdForFeedback(idMatch[1]);
            }
        }
        else {
          newPath = '/dashboard/azienda';
        }
      }

      setCurrentPath(newPath);
      if (params.candidatoId) {
        setSelectedCandidateIdForFeedback(params.candidatoId);
      }
    };

    if (typeof window !== 'undefined') {
      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange);
      }
    };
  }, []);


  const navigateTo = useCallback((path, params = {}) => {
    let hash = '';
    let newHashSegment = '';

    if (path === '/dashboard/azienda/profilo') {
      newHashSegment = 'profilo';
    } else if (path === '/dashboard/azienda/le-mie-offerte') {
      newHashSegment = 'le-mie-offerte';
    } else if (path === '/dashboard/azienda/materiale-onboarding') {
      newHashSegment = 'materiale-onboarding';
    } else if (path === '/dashboard/azienda/statistiche-report') {
      newHashSegment = 'statistiche-report';
    } else if (path === '/dashboard/azienda/test') {
      newHashSegment = 'test';
    } else if (path === '/dashboard/azienda/messaggi-comunicazioni') {
      newHashSegment = 'messaggi-comunicazioni';
    } else if (path === '/dashboard/azienda/gestisci-candidature') { // NUOVO: Percorso per Gestisci Candidature
      newHashSegment = 'gestisci-candidature';
    } else if (path === '/dashboard/azienda/candidato/feedback') {
      newHashSegment = 'candidato/feedback';
    }

    const encodedParams = Object.keys(params).length > 0 ? `params=${encodeURIComponent(JSON.stringify(params))}` : '';
    hash = newHashSegment ? `${newHashSegment}${encodedParams ? `&${encodedParams}` : ''}` : '';

    if (path === '/dashboard/azienda' && window.location.hash) {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
      setSelectedCandidateIdForFeedback(null);
      setCurrentPath(path);
    } else if (hash) {
      window.location.hash = hash;
      if (params.candidatoId) {
        setSelectedCandidateIdForFeedback(params.candidatoId);
      } else {
        setSelectedCandidateIdForFeedback(null);
      }
      setCurrentPath(path);
    } else {
      setSelectedCandidateIdForFeedback(null);
      setCurrentPath(path);
    }
    setIsSidebarActive(false);
  }, []);


  const toggleSidebar = () => {
    setIsSidebarActive(prev => !prev);
  };


  const renderContent = () => {
    if (loadingAziendaId) {
      return (
        <div className="flex justify-center items-center h-full bg-gray-100 text-gray-700">
          <div className="p-8 bg-white rounded-lg shadow-lg text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p className="text-xl">Caricamento dati azienda...</p>
          </div>
        </div>
      );
    }

    if (errorAziendaId) {
      return (
        <div className="flex justify-center items-center h-full bg-gray-100 text-red-700">
          <div className="p-8 bg-white rounded-lg shadow-lg text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-xl">{errorAziendaId}</p>
            <p className="text-sm text-gray-500 mt-2">Assicurati di essere loggato e che un'azienda sia associata al tuo profilo utente.</p>
          </div>
        </div>
      );
    }

    const urlHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    let parsedParams = {};
    if (urlHash.includes('params=')) {
      try {
        const paramsString = urlHash.split('params=')[1];
        parsedParams = JSON.parse(decodeURIComponent(paramsString));
      } catch (e) {
        console.error("Errore nel parsing dei parametri dell'URL:", e);
      }
    }


    if (currentPath === '/dashboard/azienda/profilo') {
      return <CompanyProfilePage />;
    } else if (currentPath === '/dashboard/azienda/le-mie-offerte') {
      return (
        <PostedJobOffersPage
          aziendaId={aziendaId}
          initialParams={parsedParams}
          onNavigateTo={navigateTo}
        />
      );
    } else if (currentPath === '/dashboard/azienda/materiale-onboarding') {
      return (
        <MaterialeOnBoardingPage
          aziendaId={aziendaId}
          initialParams={parsedParams}
        />
      );
    } else if (currentPath === '/dashboard/azienda/statistiche-report') {
        return <CompanyReportsPage />;
    } else if (currentPath === '/dashboard/azienda/test') {
        return <TestPage aziendaId={aziendaId} />;
    } else if (currentPath === '/dashboard/azienda/messaggi-comunicazioni') {
        // MODIFICA: Passa aziendaId a CompanyMessagesPage
        return <CompanyMessagesPage aziendaId={aziendaId} />;
    } else if (currentPath === '/dashboard/azienda/gestisci-candidature') { // NUOVO: Renderizza CompanyApplicationsPage
        return <CompanyApplicationsPage aziendaId={aziendaId} />;
    } else if (currentPath === '/dashboard/azienda/candidato/feedback' && selectedCandidateIdForFeedback) {
        return (
          <div className="p-4 sm:p-6 md:p-8">
            <CandidateFeedback candidatoId={selectedCandidateIdForFeedback} />
          </div>
        );
    }
    else {
      // Contenuto principale della dashboard
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <CompanyWelcomeCard onPublishNewOffer={() => navigateTo('/dashboard/azienda/le-mie-offerte', { createNew: true })} />
            <div className="mt-4 md:mt-0">
              <CompanyStatsContainer />
            </div>
          </div>
          <div className="md:col-span-1 mt-4 md:mt-0">
            <PostedJobs onEditJob={(id) => navigateTo('/dashboard/azienda/le-mie-offerte', { editId: id })} />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-gray-100 text-gray-800">
      <CompanySidebar isActive={isSidebarActive} onClose={toggleSidebar} onNavigate={navigateTo} currentPath={currentPath} />
      {/* Main content area, centered and with padding */}
      <div className="flex-grow p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen transition-all duration-300 ease-in-out">
        <CompanyHeader onMenuToggle={toggleSidebar} />
        <main className="mt-6 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
