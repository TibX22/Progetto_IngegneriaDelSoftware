// components/CompanyDashboard/CompanyHeader.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function CompanyHeader({ onMenuToggle }) {
  // Inizializza con un valore temporaneo o vuoto per indicare che i dati sono in caricamento
  const [companyName, setCompanyName] = useState('Caricamento...'); 
  const [profilePic, setProfilePic] = useState('https://placehold.co/45x45/4361ee/FFFFFF?text=A');
  const [isClient, setIsClient] = useState(false);
  const [authenticatedUserId, setAuthenticatedUserId] = useState(null);
  const [companyProfileData, setCompanyProfileData] = useState(null);
  const [loading, setLoading] = useState(true); // Aggiunto stato di caricamento per il CompanyHeader
  const [error, setError] = useState(null); // Aggiunto stato di errore per il CompanyHeader

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const COMPANY_PROFILE_API_ENDPOINT = 'api/profilo-aziendas';
  const AZIENDA_API_ENDPOINT = 'api/aziendas';
  const USER_ME_API_ENDPOINT = 'api/users/me';

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

  // --- Effetto per verificare l'autenticazione e recuperare l'ID utente Strapi ---
  useEffect(() => {
    setIsClient(true);
    console.log("CompanyHeader component mounted.");

    const fetchCurrentStrapiUser = async () => {
      setLoading(true); // Imposta loading a true all'inizio del fetch
      setError(null);
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        setAuthenticatedUserId(null);
        console.log("Nessun JWT trovato, CompanyHeader non può recuperare l'utente.");
        setLoading(false); // Fine caricamento
        return;
      }

      try {
        const response = await fetch(`${STRAPI_BASE_URL}/${USER_ME_API_ENDPOINT}`, {
          headers: headers
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwt');
            console.warn("JWT non valido o scaduto nel CompanyHeader. Rimosso.");
          }
          throw new Error(`Errore nel recupero dell'utente corrente: ${response.status}`);
        }

        const userData = await response.json();
        if (userData && userData.id) {
          setAuthenticatedUserId(userData.id);
          console.log("Utente autenticato con ID:", userData.id);
        } else {
          setAuthenticatedUserId(null);
        }
      } catch (err) {
        console.error("Errore nel CompanyHeader durante il recupero dell'utente:", err);
        setAuthenticatedUserId(null);
        setError("Errore autenticazione: " + err.message); // Imposta errore
      } finally {
        setLoading(false); // Fine caricamento
      }
    };

    fetchCurrentStrapiUser();
  }, [getAuthHeaders]);

  // --- Effetto per recuperare il profilo aziendale quando l'ID utente autenticato è disponibile ---
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!authenticatedUserId) {
        console.log("Authenticated user ID not available yet, skipping profile fetch.");
        setCompanyProfileData(null);
        setCompanyName('Azienda'); // Fallback iniziale se non autenticato
        setProfilePic('https://placehold.co/45x45/4361ee/FFFFFF?text=A');
        return;
      }

      setLoading(true); // Inizia il caricamento per il profilo
      setError(null);

      try {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) {
          console.warn("JWT token not found. Cannot fetch company profile.");
          setLoading(false); // Fine caricamento
          return;
        }

        // Prima cerca se esiste un'azienda collegata all'utente
        const aziendaResponse = await fetch(
          `${STRAPI_BASE_URL}/api/aziendas?populate=*&filters[user][id][$eq]=${authenticatedUserId}`, 
          { headers }
        );

        if (!aziendaResponse.ok) {
          throw new Error(`Failed to fetch azienda: ${aziendaResponse.statusText}`);
        }

        const aziendaData = await aziendaResponse.json();
        let azienda = null;

        if (aziendaData.data && aziendaData.data.length > 0) {
          azienda = aziendaData.data[0];
          console.log("Azienda trovata per l'utente autenticato:", azienda.id);
        } else {
          console.log("Nessuna azienda trovata per l'utente autenticato.");
          setCompanyProfileData(null);
          setCompanyName('Azienda');
          setProfilePic('https://placehold.co/45x45/4361ee/FFFFFF?text=A');
          setLoading(false); // Fine caricamento
          return; // Esci se non c'è azienda
        }

        // Ora cerca il profilo aziendale collegato a questa azienda
        const profileResponse = await fetch(
          `${STRAPI_BASE_URL}/${COMPANY_PROFILE_API_ENDPOINT}?populate=*&filters[azienda][id][$eq]=${azienda.id}`,
          { headers }
        );

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch company profile: ${profileResponse.statusText}`);
        }

        const profileData = await profileResponse.json();
        
        if (profileData.data && profileData.data.length > 0) {
          const profile = profileData.data[0];
          // Gli attributi sono direttamente sull'oggetto 'profile', non annidati sotto 'attributes'
          const profileAttributes = profile || {}; 
          
          setCompanyProfileData(profileAttributes);
          
          // Imposta il nome dell'azienda con una logica chiara
          const finalCompanyName = profileAttributes.nomeAzienda || azienda?.attributes?.nome || 'Azienda';
          setCompanyName(finalCompanyName);
          console.log("Valore di companyName dopo setCompanyName:", finalCompanyName); 

          // Gestione immagine profilo
          if (profileAttributes.immagineProfilo?.data?.attributes?.url) {
            setProfilePic(`${STRAPI_BASE_URL}${profileAttributes.immagineProfilo.data.attributes.url}`);
          } else {
            // Fallback con la prima lettera del nome dell'azienda o 'A'
            const initialLetter = (finalCompanyName || 'A').charAt(0).toUpperCase(); // Usa finalCompanyName per il fallback
            setProfilePic(`https://placehold.co/45x45/4361ee/FFFFFF?text=${initialLetter}`);
          }
          
          console.log("Profilo aziendale caricato con successo:", finalCompanyName);
        } else {
          console.log("Nessun profilo aziendale trovato per l'azienda. Utilizzo nome azienda come fallback.");
          // Usa i dati dell'azienda come fallback se il profilo specifico non esiste
          setCompanyProfileData(null); // Assicurati che companyProfileData sia null
          const finalCompanyName = azienda?.attributes?.nome || 'Azienda';
          setCompanyName(finalCompanyName);
          console.log("Valore di companyName dopo setCompanyName (fallback):", finalCompanyName); 
          const initialLetter = (finalCompanyName || 'A').charAt(0).toUpperCase(); // Usa finalCompanyName per il fallback
          setProfilePic(`https://placehold.co/45x45/4361ee/FFFFFF?text=${initialLetter}`);
        }

      } catch (error) {
        console.error("Error fetching company profile in CompanyHeader:", error);
        setCompanyProfileData(null);
        setCompanyName('Azienda');
        setProfilePic('https://placehold.co/45x45/4361ee/FFFFFF?text=A');
        setError("Errore caricamento profilo: " + error.message); // Imposta errore
      } finally {
        setLoading(false); // Fine caricamento
      }
    };

    fetchCompanyProfile();
  }, [authenticatedUserId, getAuthHeaders]);

  // Aggiungi un rendering condizionale per gli stati di caricamento/errore
  if (loading) {
    return (
      <header className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center mb-6">
        <div className="flex items-center gap-6 w-full justify-center">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
          <span className="font-semibold text-lg text-gray-800">Caricamento Header...</span>
        </div>
      </header>
    );
  }

  if (error) {
    return (
      <header className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center mb-6">
        <div className="flex items-center gap-6 w-full justify-center text-red-500">
          <i className="fas fa-exclamation-circle text-2xl"></i>
          <span className="font-semibold text-lg">Errore nell'Header</span>
        </div>
      </header>
    );
  }

  return (
    <header className="ml-65 bg-white p-5 rounded-xl shadow-sm flex justify-between items-center mb-6">
      <button 
        className="md:hidden text-gray-800 text-2xl cursor-pointer transition-colors duration-200 hover:text-blue-600" 
        onClick={onMenuToggle}
      >
        <i className="fas fa-bars"></i>
      </button>
      
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer text-xl text-gray-600 transition-colors duration-200 hover:text-gray-900">
          <i className="fas fa-bell"></i>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs leading-none min-w-[20px] text-center shadow-md">
            3
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <img
            src={profilePic}
            alt="Immagine Profilo Aziendale"
            width={45}
            height={45}
            className="rounded-full object-cover border-2 border-blue-500 shadow-md w-11 h-11"
            onError={(e) => { 
              e.target.onerror = null; 
              // Assicurati che companyName non sia null o undefined prima di accedere a charAt
              const initialForErrorPic = (companyName || 'A').charAt(0).toUpperCase();
              e.target.src = `https://placehold.co/45x45/4361ee/FFFFFF?text=${initialForErrorPic}`;
            }}
          />
          <div className="hidden md:block">
            <span className="font-semibold text-lg text-gray-800">{companyName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
