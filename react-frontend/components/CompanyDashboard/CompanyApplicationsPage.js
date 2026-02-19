// components/CompanyDashboard/CompanyApplicationsPage.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function CompanyApplicationsPage({ aziendaId }) { // Riceve aziendaId come prop
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati per la gestione del modale di cambio stato (existing)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null); // Questo ora conterrà il documentId
  const [currentApplicationStatus, setCurrentApplicationStatus] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // NUOVI stati per la gestione del modale di pianificazione colloquio
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState(null); // { candidatoId, candidaturaId, candidatoNome, candidatoCognome }
  const [interviewDateTime, setInterviewDateTime] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewMode, setInterviewMode] = useState('videochiamata'); // Valore di default
  const [interviewStatus, setInterviewStatus] = useState('programmato'); // Valore di default
  const [schedulingInterview, setSchedulingInterview] = useState(false);
  const [scheduleInterviewError, setScheduleInterviewError] = useState(null);
  const [scheduleInterviewSuccess, setScheduleInterviewSuccess] = useState(false);


  const STRAPI_BASE_URL = 'http://localhost:1337';
  const CANDIDATURAS_API_ENDPOINT = 'api/candidaturas'; // Endpoint per le candidature
  const INTERVIEWS_API_ENDPOINT = 'api/colloquios'; // Nuovo endpoint per i colloqui

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (!token) {
      setError('Autenticazione richiesta. Effettua il login.');
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      // Query di popolamento in base agli schemi forniti.
      // `offerta_lavoros` (plurale) è la relazione su `candidaturas`.
      // `azienda` (singolare) è la relazione su `offerta-lavoro`.
      // MODIFICA QUI: Rimosso `utente` dalla query di popolamento per `candidato`
      const populateQuery = 'populate[candidato][populate]=profilo_candidato&populate[offerta_lavoros][populate]=azienda'; 
      const requestUrl = `${STRAPI_BASE_URL}/${CANDIDATURAS_API_ENDPOINT}?${populateQuery}`;

      console.log("Fetching applications from URL (full populate attempt with corrected names):", requestUrl); // Debugging: logga l'URL completo
      const response = await fetch(requestUrl, { headers });

      if (!response.ok) {
        const errorText = await response.text(); // Leggi il testo dell'errore per maggiori dettagli
        console.error("Response error details (from Strapi for full populate):", errorText); // Logga i dettagli dell'errore
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log("Raw fetched applications data (after full populate attempt with corrected names):", data.data); // Debugging: logga i dati ricevuti

      // Filtra le candidature lato client in base all'aziendaId
      const filteredApplications = data.data.filter(application => {
        // Aggiungi un log per l'intera applicazione per debuggare la sua struttura
        // console.log("Processing application:", application); // Rimosso log di debug eccessivo

        // Accesso diretto a `offerta_lavoros` poiché i log indicano che è un array diretto.
        const offertaLavorosData = application.offerta_lavoros; 
        
        if (!offertaLavorosData || offertaLavorosData.length === 0) {
          // console.warn(`Application ID: ${application.id} has no associated 'offerta_lavoros' data, or it's empty. This application will be filtered out.`); // Rimosso log di warning
          return false; 
        }

        // Cerca se almeno una delle offerte di lavoro associate appartiene all'azienda corrente
        const isAssociatedToCompany = offertaLavorosData.some(offer => {
            // Aggiungi un log per l'offerta di lavoro per debuggare la sua struttura interna
            // console.log("  Processing job offer:", offer); // Rimosso log di debug eccessivo
            
            // L'azienda è una relazione 'manyToOne' su 'offerta-lavoro', quindi è un singolo oggetto .data
            // Usiamo il nome di relazione 'azienda' come da schema fornito
            const offerAziendaId = offer.azienda?.id; 
            const matches = offerAziendaId === aziendaId;
            // console.log(`  Offer ID: ${offer.id}, Associated Azienda ID: ${offerAziendaId}, Matches current Azienda ID ${aziendaId}: ${matches}`); // Rimosso log di debug eccessivo
            return matches;
        });
        
        // console.log(`Application ID: ${application.id}, Overall associated to aziendaId ${aziendaId}: ${isAssociatedToCompany}`); // Rimosso log di debug eccessivo
        
        return isAssociatedToCompany;
      });

      console.log("Filtered applications (client-side, after offerta_lavoros check):", filteredApplications);
      setApplications(filteredApplications);
    } catch (e) {
      console.error("Error fetching applications:", e); 
      setError('Errore durante il caricamento delle candidature: ' + e.message + '. Verifica la console per i dettagli. Potrebbe esserci un problema con la configurazione delle relazioni in Strapi.');
    } finally {
      setLoading(false);
    }
  }, [aziendaId, getAuthHeaders]);

  useEffect(() => {
    if (aziendaId) {
      fetchApplications();
    }
  }, [aziendaId, fetchApplications]);

  // Gestione modale cambio stato (existing)
  // MODIFICA QUI: Allineamento dei valori con l'enum di Strapi
  const statoOptions = ['Inviata', 'In revisione', 'Accettata', 'Rifiutata', 'Archiviata']; 
  const handleOpenStatusModal = (applicationDocumentId, currentStatus) => {
    // MODIFICA QUI: Salva il documentId per l'aggiornamento
    setSelectedApplicationId(applicationDocumentId); 
    setCurrentApplicationStatus(currentStatus);
    setNewStatus(currentStatus);
    setShowStatusModal(true);
    setUpdateError(null);
  };

  // Funzione per chiudere entrambi i modali e resettare gli stati di errore/successo del colloquio
  const handleCloseModal = () => {
    setShowStatusModal(false);
    setShowInterviewModal(false); // Chiudi anche il modale del colloquio
    setScheduleInterviewError(null);
    setScheduleInterviewSuccess(false);
  };

  const handleSaveStatus = async () => {
    setUpdatingStatus(true);
    setUpdateError(null);
    const headers = getAuthHeaders();
    if (!headers) {
      setUpdatingStatus(false);
      return;
    }

    try {
      // La richiesta PUT utilizzerà ora il documentId salvato in selectedApplicationId
      const updateUrl = `${STRAPI_BASE_URL}/${CANDIDATURAS_API_ENDPOINT}/${selectedApplicationId}`;
      console.log("Attempting to update status with PUT request to URL:", updateUrl); // Logga l'URL della PUT
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ data: { stato: newStatus } }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      fetchApplications(); // Refresh applications list
      handleCloseModal();
    } catch (e) {
      console.error('Failed to update status:', e);
      setUpdateError('Errore durante l\'aggiornamento dello stato: ' + e.message);
    } finally {
      setUpdatingStatus(false);
    }
  };


  // NUOVE funzioni per il colloquio

  const handleOpenInterviewModal = (candidatoId, candidaturaId, candidatoNome, candidatoCognome) => {
    setSelectedCandidateForInterview({ candidatoId, candidaturaId, candidatoNome, candidatoCognome });
    setInterviewDateTime(''); // Reset dei campi del form
    setInterviewLocation('');
    setInterviewMode('videochiamata'); // Valore di default
    setInterviewStatus('programmato'); // Valore di default
    setScheduleInterviewError(null);
    setScheduleInterviewSuccess(false);
    setShowInterviewModal(true);
  };

  const handleScheduleInterview = async () => {
    setSchedulingInterview(true);
    setScheduleInterviewError(null);
    setScheduleInterviewSuccess(false);

    if (!aziendaId) {
      setScheduleInterviewError('ID azienda non disponibile. Impossibile pianificare il colloquio.');
      setSchedulingInterview(false);
      return;
    }

    if (!selectedCandidateForInterview || !selectedCandidateForInterview.candidatoId || !selectedCandidateForInterview.candidaturaId) {
      setScheduleInterviewError('Candidato o candidatura non selezionati.');
      setSchedulingInterview(false);
      return;
    }

    if (!interviewDateTime || !interviewLocation || !interviewMode) {
      setScheduleInterviewError('Compila tutti i campi obbligatori per il colloquio.');
      setSchedulingInterview(false);
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
      setSchedulingInterview(false);
      return;
    }

    // Prepara il payload per Strapi basandosi sullo schema fornito
    const payload = {
      data: {
        dataOra: interviewDateTime,
        luogo: interviewLocation,
        modalita: interviewMode,
        statoColloquio: interviewStatus,
        aziendas: [aziendaId], // Relaziona all'azienda corrente
        candidatoes: [selectedCandidateForInterview.candidatoId], // Relaziona al candidato
        candidaturas: [selectedCandidateForInterview.candidaturaId], // Relaziona alla candidatura
      }
    };

    try {
      const response = await fetch(`${STRAPI_BASE_URL}/${INTERVIEWS_API_ENDPOINT}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      setScheduleInterviewSuccess(true);
      fetchApplications(); // Aggiorna la lista delle candidature
      // Opzionalmente, potresti voler aggiornare lo stato della candidatura a "Colloquio Programmato" automaticamente qui,
      // ma per ora l'utente lo cambierà esplicitamente tramite il dropdown dello stato.

      setTimeout(() => {
        handleCloseModal(); // Chiudi il modale dopo aver mostrato il messaggio di successo
      }, 2000);

    } catch (e) {
      console.error('Failed to schedule interview:', e);
      setScheduleInterviewError('Errore durante la pianificazione del colloquio: ' + e.message);
    } finally {
      setSchedulingInterview(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-100 text-gray-700 p-8">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-xl">Caricamento candidature...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600">
        <i className="fas fa-exclamation-triangle mr-2"></i> Errore: {error}
      </div>
    );
  }

  return (
    <div className="bg-white ml-65 p-6 rounded-xl shadow-lg mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-user-tie mr-3 text-blue-600"></i> Gestione Candidature
      </h2>

      {applications.length === 0 ? (
        <p className="text-gray-600">Nessuna candidatura trovata per le tue offerte di lavoro.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map(application => {
            // Accede ai dati del candidato e del suo profilo popolati
            const candidatoData = application.candidato; 
            const profiloCandidato = candidatoData?.profilo_candidato;
            // Rimosso: const userData = candidatoData?.utente;

            let candidatoNome = '';
            let candidatoCognome = '';
            // Rimosso: let candidatoEmail = ''; 
            let candidatoId = candidatoData?.id; 

            // Rimosso: LOG DI DEBUG relativi a userData e email

            // Ottieni nome e cognome dal profilo candidato (o fallback)
            if (profiloCandidato && typeof profiloCandidato === 'object') {
                candidatoNome = profiloCandidato.nome || '';
                candidatoCognome = profiloCandidato.cognome || '';
            }
            // Fallback se nome/cognome sono direttamente sull'entità candidato (meno comune per relazioni popolate)
            else if (candidatoData && typeof candidatoData === 'object') {
                candidatoNome = candidatoData.nome || '';
                candidatoCognome = candidatoData.cognome || '';
            }


            const nomeCompletoCandidato = `${candidatoNome} ${candidatoCognome}`.trim() || 'Candidato Sconosciuto';
            const offertaLavoro = application.offerta_lavoros?.[0]; 

            return (
              <div key={application.id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{offertaLavoro?.titolo || 'Offerta Sconosciuta'}</h3>
                <p className="text-gray-700 mb-1">Candidato: {nomeCompletoCandidato}</p>
                {/* Rimosso: <p className="text-gray-700 mb-1">Email Candidato: {candidatoEmail || 'N/D'}</p> */}
                <p className="text-gray-700 mb-1">Data Candidatura: {new Date(application.createdAt).toLocaleDateString('it-IT')}</p>
                <p className={`font-semibold text-sm mt-2 ${
                  application.stato === 'Accettata' ? 'text-green-600' : 
                  application.stato === 'Rifiutata' ? 'text-red-600' : 
                  application.stato === 'Colloquio Programmato' ? 'text-blue-600' : 
                  'text-yellow-600'
                }`}>Stato: {application.stato}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => handleOpenStatusModal(application.documentId, application.stato)}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 text-sm flex items-center"
                  >
                    <i className="fas fa-edit mr-2"></i> Cambia Stato
                  </button>
                  <button
                    onClick={() => handleOpenInterviewModal(candidatoId, application.id, candidatoNome, candidatoCognome)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 text-sm flex items-center"
                    disabled={!candidatoId || !aziendaId} 
                    title={(!candidatoId || !aziendaId) ? "Impossibile pianificare il colloquio senza ID validi" : "Pianifica Colloquio"}
                  >
                    <i className="fas fa-calendar-alt mr-2"></i> Pianifica Colloquio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale di cambio stato */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Cambia Stato Candidatura</h3>
            <p className="mb-4">Stato attuale: <span className="font-semibold">{currentApplicationStatus}</span></p>
            
            <div className="mb-4">
              <label htmlFor="newStatus" className="block text-gray-700 text-sm font-bold mb-2">Nuovo Stato:</label>
              <select
                id="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={updatingStatus}
              >
                {statoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {updateError && <p className="text-red-500 text-sm mb-4">{updateError}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={updatingStatus}
                className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={updatingStatus}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? 'Salvataggio...' : 'Salva Stato'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale di pianificazione colloquio */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Pianifica Colloquio</h3>
            
            {selectedCandidateForInterview && (
                <p className="mb-4 text-gray-700">Pianificazione colloquio per: <span className="font-semibold">{selectedCandidateForInterview.candidatoNome} {selectedCandidateForInterview.candidatoCognome}</span></p>
            )}

            <div className="mb-4">
              <label htmlFor="interviewDateTime" className="block text-gray-700 text-sm font-bold mb-2">Data e Ora:</label>
              <input
                type="datetime-local"
                id="interviewDateTime"
                value={interviewDateTime}
                onChange={(e) => setInterviewDateTime(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={schedulingInterview}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="interviewLocation" className="block text-gray-700 text-sm font-bold mb-2">Luogo:</label>
              <input
                type="text"
                id="interviewLocation"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Es: Ufficio Milano, Google Meet Link, Telefono"
                disabled={schedulingInterview}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="interviewMode" className="block text-gray-700 text-sm font-bold mb-2">Modalità:</label>
              <select
                id="interviewMode"
                value={interviewMode}
                onChange={(e) => setInterviewMode(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={schedulingInterview}
                required
              >
                <option value="videochiamata">Videochiamata</option>
                <option value="telefonata">Telefonata</option>
                <option value="presenza">Presenza</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="interviewStatus" className="block text-gray-700 text-sm font-bold mb-2">Stato Colloquio:</label>
              <select
                id="interviewStatus"
                value={interviewStatus}
                onChange={(e) => setInterviewStatus(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={schedulingInterview}
              >
                <option value="programmato">Programmato</option>
                <option value="in corso">In Corso</option>
                <option value="reinviato">Reinviato</option>
              </select>
            </div>

            {scheduleInterviewError && <p className="text-red-500 text-sm mb-4">{scheduleInterviewError}</p>}
            {scheduleInterviewSuccess && <p className="text-green-500 text-sm mb-4">Colloquio pianificato con successo!</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={schedulingInterview}
                className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleScheduleInterview}
                disabled={schedulingInterview}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {schedulingInterview ? 'Pianificazione...' : 'Pianifica Colloquio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
