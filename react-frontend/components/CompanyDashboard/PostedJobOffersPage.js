// components/CompanyDashboard/PostedJobOffersPage.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import JobOfferForm from './JobOfferForm'; // Importa il form di creazione/modifica
import { useRouter } from 'next/navigation'; // Importa useRouter per la navigazione
import CandidateFeedback from './CandidateFeedback'; // Importa CandidateFeedback per usarlo come modale

export default function PostedJobOffersPage({ aziendaId, initialParams }) {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati per la gestione del form di creazione/modifica all'interno di questa pagina
  const [showJobOfferForm, setShowJobOfferForm] = useState(false);
  const [editingJobOfferId, setEditingJobOfferId] = useState(null);

  // Stati per la gestione della modale dei candidati compatibili
  const [showCompatibleCandidatesModal, setShowCompatibleCandidatesModal] = useState(false);
  const [selectedOfferForCompatibility, setSelectedOfferForCompatibility] = useState(null); // Titolo dell'offerta selezionata
  const [compatibleCandidates, setCompatibleCandidates] = useState([]); // Conterrà i candidati compatibili
  const [loadingCompatibleCandidates, setLoadingCompatibleCandidates] = useState(false);
  const [errorCompatibleCandidates, setErrorCompatibleCandidates] = useState(null);

  // NUOVI STATI per la modale di feedback del candidato
  const [showCandidateFeedbackModal, setShowCandidateFeedbackModal] = useState(false);
  const [selectedCandidateIdForFeedback, setSelectedCandidateIdForFeedback] = useState(null);


  const router = useRouter(); // Inizializza il router per la navigazione

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const OFFERTA_LAVORO_API_ENDPOINT = 'api/offerta-lavoros';
  const PROFILO_CANDIDATO_API_ENDPOINT = 'api/profilo-candidatoes'; // Endpoint corretto per i profili candidati

  // Funzione per ottenere le intestazioni di autenticazione con JWT
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

  // Funzione per recuperare le offerte di lavoro dell'azienda
  const fetchJobOffers = useCallback(async () => {
    console.log('Inizio recupero offerte di lavoro...');
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      console.log('Headers di autenticazione non disponibili. Interruzione fetchJobOffers.');
      return;
    }

    try {
      const response = await fetch(`${STRAPI_BASE_URL}/${OFFERTA_LAVORO_API_ENDPOINT}?filters[azienda]=${aziendaId}&populate=*`, { headers });
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dati grezzi offerte ricevuti da Strapi:', data);
      const mappedOffers = data.data.map(item => item);
      setJobOffers(mappedOffers);
      console.log('Offerte di lavoro mappate e impostate nello stato:', mappedOffers);
    } catch (err) {
      console.error("Errore nel recupero delle offerte di lavoro:", err);
      setError('Errore durante il caricamento delle offerte: ' + err.message);
    } finally {
      setLoading(false);
      console.log('Fine recupero offerte di lavoro.');
    }
  }, [aziendaId, getAuthHeaders]);

  useEffect(() => {
    console.log('Componente PostedJobOffersPage montato o aziendaId cambiato.');
    console.log('aziendaId corrente:', aziendaId);
    if (aziendaId) {
      fetchJobOffers();
      if (initialParams && initialParams.editId) {
        setEditingJobOfferId(initialParams.editId);
        setShowJobOfferForm(true);
      } else if (initialParams && initialParams.createNew) {
        setShowJobOfferForm(true);
        setEditingJobOfferId(null);
      }
    }
  }, [aziendaId, fetchJobOffers, initialParams]);

  const handleEditJobClick = (id) => {
    console.log('Cliccato su Modifica offerta con ID:', id);
    setEditingJobOfferId(id);
    setShowJobOfferForm(true);
  };

  const handleCreateNewJobClick = () => {
    console.log('Cliccato su Pubblica Nuova Offerta.');
    setEditingJobOfferId(null);
    setShowJobOfferForm(true);
  };

  const handleSaveSuccess = () => {
    console.log('Salvataggio offerta riuscito. Ricarico offerte...');
    setShowJobOfferForm(false);
    setEditingJobOfferId(null);
    fetchJobOffers();
  };

  const handleCancelForm = () => {
    console.log('Annullato il form di modifica/creazione offerta.');
    setShowJobOfferForm(false);
    setEditingJobOfferId(null);
  };

  // MODIFICA QUI: La funzione ora accetta il documentId
  const handleDeleteJob = async (documentId) => {
    console.log('Richiesta eliminazione offerta con Document ID:', documentId);
    const confirmed = await new Promise(resolve => {
      const modal = document.createElement('div');
      modal.className = "fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[100]";
      modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
          <p class="mb-4 text-lg font-semibold">Sei sicuro di voler eliminare questa offerta di lavoro?</p>
          <div class="flex justify-center gap-4">
            <button id="confirmDeleteBtn" class="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300">Elimina</button>
            <button id="cancelDeleteBtn" class="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300">Annulla</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('confirmDeleteBtn').onclick = () => {
        document.body.removeChild(modal);
        resolve(true);
      };
      document.getElementById('cancelDeleteBtn').onclick = () => {
        document.body.removeChild(modal);
        resolve(false);
      };
    });

    if (!confirmed) {
      console.log('Eliminazione annullata dall\'utente.');
      return;
    }

    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      console.log('Headers di autenticazione non disponibili. Interruzione handleDeleteJob.');
      return;
    }

    try {
      // MODIFICA QUI: Usa il documentId nell'URL della richiesta DELETE
      const deleteUrl = `${STRAPI_BASE_URL}/${OFFERTA_LAVORO_API_ENDPOINT}/${documentId}`;
      console.log('Sending DELETE request to:', deleteUrl); // Logga l'URL completo della richiesta DELETE

      const response = await fetch(deleteUrl, { 
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        const errorText = await response.text(); 
        console.error(`DELETE request failed: Status ${response.status}, Text: ${errorText}`); 
        throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
      }
      console.log('Offerta eliminata con successo. Ricarico offerte...');
      fetchJobOffers();
    } catch (err) {
      console.error("Errore durante l'eliminazione dell'offerta:", err);
      setError('Errore durante l\'eliminazione: ' + err.message);
    } finally {
      setLoading(false);
      console.log('Fine processo di eliminazione.');
    }
  };

  // Funzione per cercare i candidati compatibili e mostrare la modale
  const handleSearchCandidates = useCallback(async (offerTitle, offerId) => {
    console.log(`Inizio ricerca candidati per offerta: "${offerTitle}" (ID: ${offerId})`);
    setLoadingCompatibleCandidates(true);
    setErrorCompatibleCandidates(null);
    setSelectedOfferForCompatibility(offerTitle);
    setShowCompatibleCandidatesModal(true);

    const headers = getAuthHeaders();
    if (!headers) {
      setLoadingCompatibleCandidates(false);
      console.log('Headers di autenticazione non disponibili. Interruzione handleSearchCandidates.');
      return;
    }

    try {
      const response = await fetch(`${STRAPI_BASE_URL}/${PROFILO_CANDIDATO_API_ENDPOINT}?populate=*`, { headers });
      if (!response.ok) {
        console.error("URL API Candidati fallito:", `${STRAPI_BASE_URL}/${PROFILO_CANDIDATO_API_ENDPOINT}?populate=*`);
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dati grezzi candidati ricevuti da Strapi:', data);
      const mappedCandidates = data.data.map(item => item);
      setCompatibleCandidates(mappedCandidates);
      console.log('Candidati mappati e impostati nello stato:', mappedCandidates);
    } catch (err) {
      console.error("Errore nella ricerca dei candidati:", err);
      setErrorCompatibleCandidates('Errore durante la ricerca dei candidati: ' + err.message);
    } finally {
      setLoadingCompatibleCandidates(false);
      console.log('Fine ricerca candidati.');
    }
  }, [getAuthHeaders]);


  // Funzione per aprire la modale di feedback del candidato
  const handleViewCandidateFeedbacks = (candidateId) => {
    console.log('Apertura modale feedback per candidato ID:', candidateId);
    setSelectedCandidateIdForFeedback(candidateId);
    setShowCandidateFeedbackModal(true); // Apri la nuova modale
    setShowCompatibleCandidatesModal(false); // Chiudi la modale dei candidati se aperta
  };

  // Funzione per chiudere la modale di feedback del candidato
  const handleCloseCandidateFeedbackModal = () => {
    setShowCandidateFeedbackModal(false);
    setSelectedCandidateIdForFeedback(null);
  };


  if (showJobOfferForm) {
    console.log('Mostrando JobOfferForm per offerta ID:', editingJobOfferId);
    return (
      <JobOfferForm
        offerId={editingJobOfferId}
        aziendaId={aziendaId}
        onSaveSuccess={handleSaveSuccess}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6 max-w-4xl mx-auto"> {/* Aggiunto padding e margine per il layout */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Le Tue Offerte di Lavoro</h2>

      <div className="flex justify-start mb-6">
        <button
          onClick={handleCreateNewJobClick}
          className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
        >
          <i className="fas fa-plus-circle mr-2"></i> Pubblica Nuova Offerta
        </button>
      </div>

      {loading && <p className="text-center text-blue-600">Caricamento offerte...</p>}
      {error && <p className="text-center text-red-600">Errore: {error}</p>}

      {!loading && !error && jobOffers.length === 0 ? (
        <p className="text-gray-600">Nessuna offerta di lavoro pubblicata.</p>
      ) : (
        <ul className="space-y-6">
          {jobOffers.map(job => {
            console.log('Rendering job offer:', job);
            return (
              <li key={job.id} className="bg-gray-50 p-5 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-grow mb-3 sm:mb-0">
                  <h3 className="text-xl font-bold text-blue-700 mb-1">{job.titolo}</h3>
                  <p className="text-gray-700 text-sm mb-1">{job.localita} - {job.tipo_contratto}</p>
                  <p className="text-gray-600 text-sm">
                    Pubblicata il: {new Date(job.data_pubblicazione).toLocaleDateString('it-IT')}
                    {job.scadenza && ` - Scadenza: ${new Date(job.scadenza).toLocaleDateString('it-IT')}`}
                  </p>
                  <p className="text-gray-600 text-sm">Retribuzione: {job.retribuzione_minima} - {job.retribuzione_massima}</p>
                </div>

                {/* Bottoni di azione */}
                <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => handleEditJobClick(job.id)}
                    className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-edit"></i> Modifica
                  </button>
                  <button
                    // MODIFICA QUI: Passa il documentId al gestore dell'eliminazione
                    onClick={() => handleDeleteJob(job.documentId)}
                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-trash"></i> Elimina
                  </button>
                  <button
                    onClick={() => handleSearchCandidates(job.titolo, job.id)} // Passa titolo e ID dell'offerta
                    className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-users"></i> Visualizza Candidati
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modale per visualizzare i candidati compatibili */}
      {showCompatibleCandidatesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Candidati Compatibili per "{selectedOfferForCompatibility}"</h3>
            {loadingCompatibleCandidates && <p className="text-center text-blue-600">Caricamento candidati...</p>}
            {errorCompatibleCandidates && <p className="text-center text-red-500">{errorCompatibleCandidates}</p>}
            {!loadingCompatibleCandidates && !errorCompatibleCandidates && compatibleCandidates.length === 0 ? (
              <p className="text-gray-600">Nessun candidato trovato per questa offerta.</p>
            ) : (
              <ul className="space-y-3">
                {compatibleCandidates.map(candidate => {
                  console.log('Rendering compatible candidate:', candidate);
                  return (
                    <li key={candidate.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2">
                      <span className="font-semibold text-gray-700">{candidate.nome} {candidate.cognome}</span>
                      <button
                        onClick={() => handleViewCandidateFeedbacks(candidate.id)} // Chiama la nuova funzione per aprire la modale
                        className="mt-2 sm:mt-0 px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm transition duration-300"
                      >
                        Vedi Feedback
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowCompatibleCandidatesModal(false)}
                className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NUOVA MODALE per il feedback del candidato */}
      {showCandidateFeedbackModal && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleCloseCandidateFeedbackModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-3xl font-bold"
            >
              &times;
            </button>
            <CandidateFeedback candidatoId={selectedCandidateIdForFeedback} />
          </div>
        </div>
      )}
    </div>
  );
}
