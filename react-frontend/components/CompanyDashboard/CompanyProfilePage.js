'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function CompanyProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [initialProfileData, setInitialProfileData] = useState(null);

  // Stati per la gestione degli ID
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companyId, setCompanyId] = useState(null); // ID del ProfiloAzienda (ora useremo documentId)
  const [aziendaId, setAziendaId] = useState(null); // ID dell'Azienda

  // Configurazione API
  const STRAPI_BASE_URL = 'http://localhost:1337';
  const COMPANY_PROFILE_API_ENDPOINT = 'api/profilo-aziendas';
  const AZIENDA_API_ENDPOINT = 'api/aziendas';
  const USER_ME_API_ENDPOINT = 'api/users/me';

  // Opzioni per gli enum, sincronizzate con quelle definite nello schema Strapi
  // ATTENZIONE: "collaborazione " ha uno spazio finale secondo lo schema Strapi fornito.
  // È buona pratica rimuovere gli spazi finali dagli enum in Strapi per pulizia,
  // ma per far funzionare il frontend con lo schema attuale, lo manteniamo qui.
  const valoriCulturaliOptions = ["innovazione", "flessibilità", "collaborazione", "meritocrazia"]; // Modifica qui: rimosso spazio finale
  const stileLeadershipOptions = ["partecipativo", "gerarchico", "autonomo"];
  const ambienteLavoroOptions = ["dinamico", "strutturato", "creativo", "remoto", "ibrido", "tradizionale"];
  const settoreOptions = ["IT", "Finanza", "Sanità", "Manifatturiero", "Retail", "Servizi", "Educazione", "No-Profit", "Altro"];


  // Funzione per ottenere le intestazioni di autenticazione
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

  // --- Verificare autenticazione e recuperare ID utente ---
  useEffect(() => {
    const checkAuthAndFetchUserId = async () => {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        setIsAuthenticated(false);
        setLoading(false);
        setError("Autenticazione richiesta. Nessun JWT trovato.");
        return;
      }

      try {
        const response = await fetch(`${STRAPI_BASE_URL}/${USER_ME_API_ENDPOINT}`, {
          headers: headers
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwt'); // Rimuovi token non valido
            setIsAuthenticated(false);
            setError("Sessione scaduta o non valida. Effettua nuovamente il login.");
          } else {
            setError(`Errore nel recupero dati utente: ${response.status} ${response.statusText}`);
          }
          setLoading(false);
          return;
        }

        const userData = await response.json();
        if (userData && userData.id) {
          setUserId(userData.id);
          setIsAuthenticated(true);
          console.log("Utente autenticato con ID:", userData.id);
        } else {
          setIsAuthenticated(false);
          setUserId(null);
          setError("Dati utente non validi o ID mancante.");
        }
      } catch (err) {
        console.error("Errore durante il recupero dell'utente:", err);
        setError("Errore di rete o server non raggiungibile.");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetchUserId();
  }, [getAuthHeaders]);

  // --- Trova o crea il profilo aziendale ---
  const findOrCreateCompanyProfile = useCallback(async () => {
    if (!userId || !isAuthenticated) {
      return; // Non procedere se l'utente non è autenticato o l'ID non è disponibile
    }

    setLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        throw new Error("Intestazioni di autenticazione mancanti.");
      }

      // STEP 1: Cerca l'azienda collegata all'utente
      console.log("Cercando azienda per utente ID:", userId);
      const aziendaResponse = await fetch(
        `${STRAPI_BASE_URL}/${AZIENDA_API_ENDPOINT}?populate=*&filters[user][id][$eq]=${userId}`,
        { headers }
      );

      if (!aziendaResponse.ok) {
        throw new Error(`Errore nel recupero azienda: ${aziendaResponse.statusText}`);
      }
      const aziendaData = await aziendaResponse.json();
      let currentAzienda = null;

      if (aziendaData.data && aziendaData.data.length > 0) {
        // Azienda trovata
        currentAzienda = aziendaData.data[0];
        setAziendaId(currentAzienda.id);
        console.log("Azienda trovata con ID:", currentAzienda.id);
      } else {
        // STEP 1b: Crea nuova azienda se non esiste
        console.log("Creando nuova azienda per utente:", userId);
        const newAziendaPayload = {
          data: {
            user: userId, // Collega l'azienda all'utente
          }
        };

        const createAziendaResponse = await fetch(`${STRAPI_BASE_URL}/${AZIENDA_API_ENDPOINT}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(newAziendaPayload)
        });

        if (!createAziendaResponse.ok) {
          const errorData = await createAziendaResponse.json();
          throw new Error(`Creazione azienda fallita: ${JSON.stringify(errorData)}`);
        }
        const newAziendaData = await createAziendaResponse.json();
        currentAzienda = newAziendaData.data;
        setAziendaId(currentAzienda.id);
        console.log("Nuova azienda creata con ID:", currentAzienda.id);
      }

      // STEP 2: Cerca il profilo aziendale collegato all'azienda
      console.log("Cercando profilo aziendale per azienda ID:", currentAzienda.id);
      const profileResponse = await fetch(
        `${STRAPI_BASE_URL}/${COMPANY_PROFILE_API_ENDPOINT}?populate=*&filters[azienda][id][$eq]=${currentAzienda.id}`,
        { headers }
      );

      if (!profileResponse.ok) {
        throw new Error(`Errore nel recupero profilo: ${profileResponse.statusText}`);
      }
      const profileDataResponse = await profileResponse.json(); // Rinominato per evitare conflitto con lo stato 'profileData'

      if (profileDataResponse.data && profileDataResponse.data.length > 0) {
        // Profilo trovato
        const foundProfile = profileDataResponse.data[0];
        setCompanyId(foundProfile.documentId); // Usa documentId qui
        setProfileData(foundProfile);
        setInitialProfileData(foundProfile);
        console.log("Profilo aziendale trovato con ID:", foundProfile.id, "Document ID:", foundProfile.documentId);
        console.log("--> CompanyProfilePage: profileData impostato dopo ricerca:", foundProfile);
      } else {
        // STEP 2b: Crea nuovo profilo aziendale
        console.log("Creando nuovo profilo aziendale per azienda:", currentAzienda.id);
        const newProfilePayload = {
          data: {
            nomeAzienda: `Nuova Azienda Utente ${userId}`, // Nome predefinito
            azienda: currentAzienda.id, // Collega al record Azienda
            descrizione: 'Descrizione predefinita della tua azienda.',
            settore: 'IT',
            sitoweb: 'http://www.example.com',
            valoriCulturali: 'collaborazione', // Modifica qui: rimosso spazio finale
            stileLeadership: 'partecipativo',
            ambienteLavoro: 'dinamico',
            focusSostenibilita: false,
            focusCrescitaDipendenti: true,
            partitaIva: 'Non specificata',
            telefono: 'Non specificato',
            sede: 'Indirizzo completo non specificato',
            emailContatto: `info.${userId}@example.com`
          }
        };

        const createProfileResponse = await fetch(`${STRAPI_BASE_URL}/${COMPANY_PROFILE_API_ENDPOINT}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(newProfilePayload)
        });

        if (!createProfileResponse.ok) {
          const errorData = await createProfileResponse.json();
          throw new Error(`Creazione profilo fallita: ${JSON.stringify(errorData)}`);
        }
        const newProfileResponseData = await createProfileResponse.json(); // Rinominato per evitare conflitto
        setCompanyId(newProfileResponseData.data.documentId); // Usa documentId qui
        setProfileData(newProfileResponseData.data);
        setInitialProfileData(newProfileResponseData.data);
        console.log("Nuovo profilo creato con ID:", newProfileResponseData.data.id, "Document ID:", newProfileResponseData.data.documentId);
        console.log("--> CompanyProfilePage: profileData impostato dopo creazione:", newProfileResponseData.data);
      }
    } catch (err) {
      console.error("Errore nel trovare o creare il profilo:", err);
      setError("Impossibile caricare o creare il profilo aziendale: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthenticated, getAuthHeaders]);

  // --- Trigger per findOrCreateCompanyProfile quando l'autenticazione è pronta ---
  useEffect(() => {
    if (isAuthenticated && userId) {
      findOrCreateCompanyProfile();
    }
  }, [isAuthenticated, userId, findOrCreateCompanyProfile]);

  // --- Gestione dei cambiamenti nei form ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- Salvataggio delle modifiche ---
  const handleSave = async () => {
    setLoading(true);
    setError(null);

    if (!companyId) {
      setError("Errore: ID profilo aziendale non disponibile per il salvataggio.");
      setLoading(false);
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        throw new Error("Intestazioni di autenticazione mancanti.");
      }

      const updateUrl = `${STRAPI_BASE_URL}/${COMPANY_PROFILE_API_ENDPOINT}/${companyId}`; // companyId ora è il documentId
      console.log("Aggiornando profilo a URL:", updateUrl);

      // Destruttura profileData per escludere le chiavi che non devono essere inviate nel payload
      // o che Strapi gestisce automaticamente.
      const { id, documentId, createdAt, updatedAt, publishedAt, azienda, archivio_materiali, ...attributesToUpdate } = profileData;

      // Se 'azienda' è un oggetto (popolato), invia solo il suo ID per la relazione
      const payloadData = { ...attributesToUpdate };
      if (azienda && typeof azienda === 'object' && azienda.id) {
        payloadData.azienda = azienda.id;
      } else if (azienda === null) {
        // Se la relazione azienda è null, assicurati che il payload la rifletta come null
        payloadData.azienda = null;
      }
      // Se 'archivio_materiali' è un oggetto (popolato), invia solo il suo ID per la relazione
      if (archivio_materiali && typeof archivio_materiali === 'object' && archivio_materiali.id) {
        payloadData.archivio_materiali = archivio_materiali.id;
      } else if (archivio_materiali === null) {
        // Se la relazione è null, assicurati che il payload la rifletta come null
        payloadData.archivio_materiali = null;
      }
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ data: payloadData }) // Invia solo gli attributi puliti
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Aggiornamento fallito: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const updatedData = await response.json();
      setProfileData(updatedData.data);
      setInitialProfileData(updatedData.data); 
      console.log("--> CompanyProfilePage: profileData impostato dopo salvataggio:", updatedData.data);
      setIsEditing(false); // Torna alla modalità di visualizzazione
      console.log("Profilo aggiornato con successo!");
    } catch (err) {
      console.error("Errore durante il salvataggio:", err);
      setError("Impossibile salvare le modifiche: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Annullamento delle modifiche ---
  const handleCancel = () => {
    setProfileData(initialProfileData); // Ripristina i dati iniziali
    setIsEditing(false); // Torna alla modalità di visualizzazione
  };

  console.log("CompanyProfilePage rendering. Current profileData:", profileData, "Loading:", loading, "Error:", error); // Log di rendering principale

  // --- Rendering condizionale ---
  if (loading && !profileData && !error && isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-700">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-xl">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-red-700">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-xl">{error}</p>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mt-2">Assicurati di essere loggato e di avere un JWT valido.</p>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-700">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <i className="fas fa-lock text-4xl text-blue-500 mb-4"></i>
          <p className="text-xl">Per visualizzare o gestire il profilo aziendale, devi prima effettuare l'accesso.</p>
        </div>
      </div>
    );
  }

  // Questa condizione è quella che ci interessa risolvere
  if (isAuthenticated && !profileData && !loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-700">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <i className="fas fa-info-circle text-4xl text-blue-500 mb-4"></i>
          <p className="text-xl">Nessun profilo aziendale trovato.</p>
          <p className="text-sm text-gray-500 mt-2">Un nuovo profilo verrà generato automaticamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 ml-[-40px] mt-[-20px]  p-4 sm:p-6 font-sans">
      <div className="max-w-4xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h1 className="text-blue-700 text-3xl sm:text-4xl font-bold mb-6 border-b pb-4 border-gray-200 flex items-center gap-3">
          <i className="fas fa-building text-blue-600"></i> Il Mio Profilo Aziendale
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Logo Azienda e Info */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            {/* Fallback per l'immagine del logo con un placeholder che usa la prima lettera del nome dell'azienda */}
            <img
              src={profileData?.logoAziendaUrl || `https://placehold.co/120x120/4361ee/FFFFFF?text=${profileData?.nomeAzienda ? profileData.nomeAzienda.charAt(0).toUpperCase() : 'A'}`}
              alt="Logo Azienda"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-500 shadow-md mb-4"
              onError={(e) => {
                e.target.onerror = null; // Evita loop infiniti in caso di errore
                e.target.src = `https://placehold.co/120x120/4361ee/FFFFFF?text=${profileData?.nomeAzienda ? profileData.nomeAzienda.charAt(0).toUpperCase() : 'A'}`;
              }}
            />
            <h2 className="text-blue-700 text-2xl font-bold text-center mb-2">{profileData?.nomeAzienda || 'Nome Azienda'}</h2>
            <p className="text-gray-600 text-center text-sm">{profileData?.settore || 'Settore non specificato'}</p>
            <div className="text-xs text-gray-500 mt-2 text-center">
              <p>ID Profilo: {companyId || 'N/A'}</p>
              <p>ID Azienda: {aziendaId || 'N/A'}</p>
              <p>ID Utente: {userId || 'N/A'}</p>
            </div>
          </div>

          {/* Dettagli Profilo */}
          <div className="flex flex-col gap-4">
            {isEditing ? (
              <>
                {/* Form di Modifica */}
                <div className="input-group">
                  <label htmlFor="nomeAzienda" className="block text-gray-700 text-sm font-semibold mb-1">Nome Azienda:</label>
                  <input
                    type="text"
                    id="nomeAzienda"
                    name="nomeAzienda"
                    value={profileData?.nomeAzienda || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="descrizione" className="block text-gray-700 text-sm font-semibold mb-1">Descrizione:</label>
                  <textarea
                    id="descrizione"
                    name="descrizione"
                    value={profileData?.descrizione || ''}
                    onChange={handleChange}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div className="input-group">
                  <label htmlFor="settore" className="block text-gray-700 text-sm font-semibold mb-1">Settore:</label>
                  <select
                    id="settore"
                    name="settore"
                    value={profileData?.settore || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleziona un settore</option>
                    {settoreOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="sitoweb" className="block text-gray-700 text-sm font-semibold mb-1">Sito Web:</label>
                  <input
                    type="url"
                    id="sitoweb"
                    name="sitoweb"
                    value={profileData?.sitoweb || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="partitaIva" className="block text-gray-700 text-sm font-semibold mb-1">Partita IVA:</label>
                  <input
                    type="text"
                    id="partitaIva"
                    name="partitaIva"
                    value={profileData?.partitaIva || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="telefono" className="block text-gray-700 text-sm font-semibold mb-1">Telefono:</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={profileData?.telefono || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="emailContatto" className="block text-gray-700 text-sm font-semibold mb-1">Email Contatto:</label>
                  <input
                    type="email"
                    id="emailContatto"
                    name="emailContatto"
                    value={profileData?.emailContatto || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="sede" className="block text-gray-700 text-sm font-semibold mb-1">Sede (Indirizzo Completo):</label>
                  <input
                    type="text"
                    id="sede"
                    name="sede"
                    value={profileData?.sede || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="valoriCulturali" className="block text-gray-700 text-sm font-semibold mb-1">Valori Culturali:</label>
                  <select
                    id="valoriCulturali"
                    name="valoriCulturali"
                    value={profileData?.valoriCulturali || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleziona un valore</option>
                    {valoriCulturaliOptions.map(option => (
                      <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="stileLeadership" className="block text-gray-700 text-sm font-semibold mb-1">Stile di Leadership:</label>
                  <select
                    id="stileLeadership"
                    name="stileLeadership"
                    value={profileData?.stileLeadership || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleziona uno stile</option>
                    {stileLeadershipOptions.map(option => (
                      <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="ambienteLavoro" className="block text-gray-700 text-sm font-semibold mb-1">Ambiente di Lavoro:</label>
                  <select
                    id="ambienteLavoro"
                    name="ambienteLavoro"
                    value={profileData?.ambienteLavoro || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleziona un ambiente</option>
                    {ambienteLavoroOptions.map(option => (
                      <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group flex items-center">
                  <input
                    type="checkbox"
                    id="focusSostenibilita"
                    name="focusSostenibilita"
                    checked={profileData?.focusSostenibilita || false}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="focusSostenibilita" className="text-gray-700 text-sm font-semibold">Focus sulla Sostenibilità</label>
                </div>

                <div className="input-group flex items-center">
                  <input
                    type="checkbox"
                    id="focusCrescitaDipendenti"
                    name="focusCrescitaDipendenti"
                    checked={profileData?.focusCrescitaDipendenti || false}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="focusCrescitaDipendenti" className="text-gray-700 text-sm font-semibold">Focus sulla Crescita dei Dipendenti</label>
                </div>

                {/* Bottoni di azione in modalità modifica */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                  >
                    <i className="fas fa-save mr-2"></i>Salva Modifiche
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75"
                  >
                    <i className="fas fa-times-circle mr-2"></i>Annulla
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Visualizzazione Dettagli */}
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Descrizione:</strong> {profileData?.descrizione || 'N/A'}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Sito Web:</strong> <a href={profileData?.sitoweb} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profileData?.sitoweb || 'N/A'}</a>
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Partita IVA:</strong> {profileData?.partitaIva || 'N/A'}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Telefono:</strong> {profileData?.telefono || 'N/A'}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Email Contatto:</strong> {profileData?.emailContatto || 'N/A'}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Sede (Indirizzo):</strong> {profileData?.sede || 'N/A'}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Valori Culturali:</strong> {profileData?.valoriCulturali ? profileData.valoriCulturali.charAt(0).toUpperCase() + profileData.valoriCulturali.slice(1) : 'N/A'}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Stile di Leadership:</strong> {profileData?.stileLeadership ? profileData.stileLeadership.charAt(0).toUpperCase() + profileData.stileLeadership.slice(1) : 'N/A'}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Ambiente di Lavoro:</strong> {profileData?.ambienteLavoro ? profileData.ambienteLavoro.charAt(0).toUpperCase() + profileData.ambienteLavoro.slice(1) : 'N/A'}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Focus Sostenibilità:</strong> {profileData?.focusSostenibilita ? 'Sì' : 'No'}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong className="text-blue-600">Focus Crescita Dipendenti:</strong> {profileData?.focusCrescitaDipendenti ? 'Sì' : 'No'}
                </p>

                {/* Bottone di modifica in modalità visualizzazione */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                  >
                    <i className="fas fa-edit mr-2"></i>Modifica Profilo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
