// components/CandidateDashboard/JobOffers.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './CandidateDashboard.module.css';
import { useRouter } from 'next/navigation';

// --- CONFIGURAZIONE API CENTRALIZZATA ---
const API_CONFIG = {
  STRAPI_BASE_URL: 'http://localhost:1337',
  ENDPOINTS: {
    CANDIDATO: 'api/candidatoes', // Endpoint per il modello Candidato
    SAVED_OFFERS: 'api/offerte-salvates',
    APPLICATIONS: 'api/candidaturas',
    JOB_OFFERS: 'api/offerta-lavoros', // Endpoint per le offerte di lavoro (plurale)
  }
};

// --- FUNZIONI DI SERVIZIO API --

// Helper per ottenere gli header di autenticazione
const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;}
  return headers;
};

// Helper per estrarre dati da risposte Strapi (Migliorato per vari formati di risposta)
const extractDataFromStrapiResponse = (strapiItem) => {
  if (!strapiItem) return null;

  let id = null;
  let attributes = {};
  let documentId = null; // Initialize documentId

  // Case 1: Standard Strapi v4 response where the main data is directly `strapiItem`
  // e.g., { id: 1, attributes: { title: 'Job A', documentId: 'xyz' } }
  // or { id: 1, documentId: 'abc', title: 'Job A' } (flat structure without 'attributes' key)
  if (typeof strapiItem.id !== 'undefined' && typeof strapiItem === 'object') {
    id = strapiItem.id;
    // Check for nested attributes first, otherwise assume flat structure
    if (typeof strapiItem.attributes === 'object' && strapiItem.attributes !== null) {
      attributes = strapiItem.attributes;
      documentId = strapiItem.attributes.documentId || null;
      console.log("DEBUG: extractDataFromStrapiResponse - Extracted data from attributes object:", { id, documentId, attributes });
    } else {
      // Flat structure, attributes are directly on strapiItem
      const { id: _, createdAt, updatedAt, publishedAt, documentId: directDocumentId, ...restAttributes } = strapiItem;
      attributes = restAttributes;
      documentId = directDocumentId || null;
      console.log("DEBUG: extractDataFromStrapiResponse - Extracted data from flat object:", { id, documentId, attributes });
    }
  }
  // Case 2: Nested response like { data: { id: 1, attributes: { ... } }, meta: {} }
  // or { data: { id: 1, documentId: '...', field1: '...', ... }, meta: {} } (the one causing the warning)
  else if (strapiItem.data && typeof strapiItem.data.id !== 'undefined' && typeof strapiItem.data === 'object') {
    id = strapiItem.data.id;
    // Check if `attributes` key exists within `data`
    if (typeof strapiItem.data.attributes === 'object' && strapiItem.data.attributes !== null) {
      attributes = strapiItem.data.attributes;
      documentId = strapiItem.data.attributes.documentId || null;
      console.log("DEBUG: extractDataFromStrapiResponse - Extracted data from nested data.attributes object:", { id, documentId, attributes });
    } else {
      // Attributes are directly on `strapiItem.data` (this is the new case handled explicitly)
      const { id: _, createdAt, updatedAt, publishedAt, documentId: directDocumentId, ...restAttributes } = strapiItem.data;
      attributes = restAttributes;
      documentId = directDocumentId || null;
      console.log("DEBUG: extractDataFromStrapiResponse - Extracted data from direct 'data' object:", { id, documentId, attributes });
    }
  }
  // Fallback for unexpected structures not covered by the above cases
  else {
    console.warn("Unexpected Strapi item structure, unable to extract standard ID or attributes:", strapiItem);
    return null;
  }

  // Ensure attributes is always an object, even if empty
  return {
    id: id,
    documentId: documentId,
    attributes: attributes || {},
  };
};

// Funzione per recuperare il profilo Candidato personalizzato
const fetchUserProfile = async (userId) => {
  console.log("DEBUG: fetchUserProfile - Retrieving profile for userId:", userId);
  if (!userId) {
    console.warn("User ID is null, cannot fetch custom Candidato profile.");
    return null;
  }
  try {
    const url = `${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.CANDIDATO}?filters[user][id][$eq]=${userId}&populate=user`;
    console.log("DEBUG: fetchUserProfile - Request URL:", url);
    const response = await fetch(url, { headers: getAuthHeaders() });
    console.log("DEBUG: fetchUserProfile - Response status:", response.status);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Error fetching custom Candidato: ${response.statusText} - ${errorBody.error?.message || ''}`);
    }
    const rawData = await response.json();
    console.log("DEBUG: fetchUserProfile - Raw data:", rawData);
    const dataToProcess = Array.isArray(rawData.data) ? rawData.data : (rawData.data ? [rawData.data] : []);

    if (dataToProcess.length > 0) {
      const firstProfile = extractDataFromStrapiResponse(dataToProcess[0]);
      console.log("DEBUG: fetchUserProfile - Extracted first profile:", firstProfile);
      if (firstProfile && firstProfile.id) {
        return {
          id: firstProfile.id,
          documentId: firstProfile.documentId || null
        };
      }
    }
    console.log("DEBUG: fetchUserProfile - No custom Candidato data found.");
    return null;
  } catch (err) {
    console.error("Error during fetchUserProfile:", err);
    throw err;
  }
};

// Funzione per recuperare le offerte salvate dall'utente
const fetchUserSavedOffers = async (candidatoId) => {
  console.log("DEBUG: fetchUserSavedOffers - Retrieving saved offers for candidatoId:", candidatoId);
  try {
    const url = `${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.SAVED_OFFERS}?filters[candidato][id][$eq]=${candidatoId}&populate=offerta_lavoro`;
    console.log("DEBUG: fetchUserSavedOffers - Request URL:", url);
    const response = await fetch(url, { headers: getAuthHeaders() });
    console.log("DEBUG: fetchUserSavedOffers - Response status:", response.status);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Error fetching saved offers: ${response.status} - ${errorBody.error?.message || ''}`);
    }
    const savedOffersData = await response.json();
    console.log("DEBUG: fetchUserSavedOffers - Raw data:", savedOffersData);

    const savedIds = new Set(savedOffersData.data.map(item => {
      const extracted = extractDataFromStrapiResponse(item);
      if (!extracted || !extracted.attributes) {
        console.warn("DEBUG: fetchUserSavedOffers - Extracted item or attributes missing for saved offer:", extracted);
        return null;
      }
      const offertaLavoroRelation = extracted.attributes.offerta_lavoro;

      if (offertaLavoroRelation) {
        if (offertaLavoroRelation.data && typeof offertaLavoroRelation.data.id !== 'undefined') {
          return offertaLavoroRelation.data.id;
        }
        else if (typeof offertaLavoroRelation.id !== 'undefined') {
          return offertaLavoroRelation.id;
        }
        else if (Array.isArray(offertaLavoroRelation) && offertaLavoroRelation.length > 0 && typeof offertaLavoroRelation[0].id !== 'undefined') {
            return offertaLavoroRelation[0].id;
        }
      }
      console.warn("DEBUG: fetchUserSavedOffers - Could not extract offer ID from saved offer item's relation (no valid ID found in relation structure):", offertaLavoroRelation);
      return null;
    }).filter(Boolean));

    console.log("DEBUG: fetchUserSavedOffers - Final saved IDs (numerical):", Array.from(savedIds));
    return savedIds;
  } catch (e) {
    console.error("Error fetching saved offers:", e);
    throw e;
  }
};

// Funzione per recuperare le candidature dell'utente e le offerte associate
const fetchUserApplications = async (candidatoId) => {
  console.log("DEBUG: fetchUserApplications - Retrieving applications for candidatoId:", candidatoId);
  try {
    // MODIFICA: Utilizza 'offerta_lavoros' (plurale) nel populate, specificando solo il campo 'id'
    const applicationsUrl = `${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.APPLICATIONS}?filters[candidato][id][$eq]=${candidatoId}&populate[offerta_lavoros][fields][0]=id`;
    
    // Aggiunto log per l'URL esatto che viene inviato
    console.log("DEBUG: fetchUserApplications - FINAL Request URL string being used:", applicationsUrl);

    const applicationsResponse = await fetch(applicationsUrl, { headers: getAuthHeaders() });
    console.log("DEBUG: fetchUserApplications - Response status:", applicationsResponse.status);

    if (!applicationsResponse.ok) {
      const errorBody = await applicationsResponse.json().catch(() => ({}));
      console.error("DEBUG: fetchUserApplications - Errore nella risposta API:", errorBody);
      throw new Error(`Errore nel recupero delle candidature: ${applicationsResponse.status} - ${errorBody.error?.message || ''}`);
    }

    const applicationsData = await applicationsResponse.json();
    console.log("DEBUG: fetchUserApplications - Dati raw candidature:", applicationsData);
    console.log("DEBUG: fetchUserApplications - Contenuto applicationsData.data:", applicationsData.data);

    const appliedOfferNumericalIds = new Set();
    if (applicationsData.data && Array.isArray(applicationsData.data)) {
      for (const appItem of applicationsData.data) {
        const extractedApplication = extractDataFromStrapiResponse(appItem);

        if (!extractedApplication || !extractedApplication.attributes) {
          console.warn("DEBUG: fetchUserApplications - Extracted application item or attributes missing:", extractedApplication);
          continue;
        }

        const offerteLavorosRelation = extractedApplication.attributes.offerta_lavoros;
        console.log("DEBUG: fetchUserApplications - Raw offerta_lavoros relation for item:", offerteLavorosRelation);

        // Check if the relation data is directly an array (as per the debug log)
        if (offerteLavorosRelation && Array.isArray(offerteLavorosRelation)) {
          offerteLavorosRelation.forEach(offerLink => {
            if (offerLink && typeof offerLink.id !== 'undefined') {
              appliedOfferNumericalIds.add(offerLink.id);
            }
          });
        } 
        // Fallback for the expected Strapi populated format { data: [...] }
        else if (offerteLavorosRelation && Array.isArray(offerteLavorosRelation.data)) {
            offerteLavorosRelation.data.forEach(offerLink => {
                if (offerLink && typeof offerLink.id !== 'undefined') {
                    appliedOfferNumericalIds.add(offerLink.id);
                }
            });
        } else {
          console.warn("DEBUG: fetchUserApplications - Could not extract offer ID from application item's relation (unexpected structure or not populated correctly):", offerteLavorosRelation);
        }
      }
    }

    console.log("DEBUG: fetchUserApplications - ID finali offerte candidate dopo estrazione (numerical ID):", Array.from(appliedOfferNumericalIds));
    return appliedOfferNumericalIds;
  } catch (e) {
    console.error("Errore nel recupero delle candidature (blocco principale):", e);
    throw e;
  }
};

// Funzione per recuperare tutte le offerte di lavoro
const fetchJobOffers = async () => {
  console.log("DEBUG: fetchJobOffers - Retrieving all job offers.");
  try {
    const url = `${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.JOB_OFFERS}?fields[0]=titolo&fields[1]=descrizione&fields[2]=localita&fields[3]=tipo_contratto&fields[4]=data_pubblicazione&fields[5]=retribuzione_minima&fields[6]=retribuzione_massima&fields[7]=settore&fields[8]=modalita_lavoro&fields[9]=esperienza_richiesta&fields[10]=scadenza&fields[11]=documentId`;
    console.log("DEBUG: fetchJobOffers - Request URL:", url);
    const response = await fetch(url, { headers: getAuthHeaders() });
    console.log("DEBUG: fetchJobOffers - Response status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("DEBUG: fetchJobOffers - Raw data:", data);
    const processedOffers = data.data.map(item => extractDataFromStrapiResponse(item)).filter(Boolean);
    console.log("DEBUG: fetchJobOffers - Processed offers:", processedOffers);
    return processedOffers;
  } catch (e) {
    console.error("Error fetching all job offers:", e);
    throw e;
  }
};

// Funzione per salvare un'offerta
const saveJobOffer = async (offerNumericalId, customCandidatoId) => {
  console.log("DEBUG: saveJobOffer - Saving offer:", offerNumericalId, "for candidato:", customCandidatoId);
  if (!customCandidatoId) {
    throw new Error("ID candidato non disponibile. Impossibile salvare l'offerta.");
  }

  try {
    const saveUrl = `${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.SAVED_OFFERS}`;
    const requestBody = {
      data: {
        offerta_lavoro: offerNumericalId, // Qui l'ID numerico è corretto
        candidato: customCandidatoId,
        dataSalvataggio: new Date().toISOString(),
      },
    };
    console.log("DEBUG: saveJobOffer - Request URL:", saveUrl);
    console.log("DEBUG: saveJobOffer - Request Body:", requestBody);
    const response = await fetch(saveUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });
    console.log("DEBUG: saveJobOffer - Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DEBUG: saveJobOffer - Error response data:", errorData);

      if (response.status === 400) {
        throw new Error("Dati per il salvataggio non validi.");
      } else if (response.status === 401) {
        throw new Error("Non autorizzato. Effettua nuovamente il login.");
      } else if (response.status === 409) {
        throw new Error("Offerta già salvata.");
      } else {
        throw new Error(errorData.error?.message || `Errore nel salvataggio: ${response.status}`);
      }
    }

    const responseData = await response.json();
    console.log("DEBUG: saveJobOffer - Offer saved successfully:", responseData);
    return responseData;
  } catch (e) {
    console.error("Error saving offer:", e);
    throw e;
  }
};

// Funzione per candidarsi a un'offerta
const applyJobOffer = async (offerNumericalId, customCandidatoId, allJobOffers, messaggioMotivazionale = '') => {
  console.log("DEBUG: applyJobOffer - Initiating application process for offer ID:", offerNumericalId, "for candidato:", customCandidatoId);

  if (!customCandidatoId) {
    throw new Error("ID candidato non disponibile. Impossibile candidarsi.");
  }

  try {
    // FASE 1: Creazione della Candidatura con la relazione Candidato
    const createApplicationUrl = `${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.APPLICATIONS}`;
    const createApplicationBody = {
      data: {
        candidato: customCandidatoId,
        dataInvio: new Date().toISOString(),
        stato: 'Inviata',
        messaggioMotivazionale: messaggioMotivazionale || '',
      },
    };

    console.log("DEBUG: applyJobOffer (POST) - Request URL:", createApplicationUrl);
    console.log("DEBUG: applyJobOffer (POST) - Request Body:", createApplicationBody);

    const createResponse = await fetch(createApplicationUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(createApplicationBody),
    });

    console.log("DEBUG: applyJobOffer (POST) - Response status:", createResponse.status);

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error("DEBUG: applyJobOffer (POST) - Error response data:", errorData);
      if (errorData.error && errorData.error.details) {
        console.error("DEBUG: applyJobOffer (POST) - Specific Strapi Error Details:", errorData.error.details);
      }
      throw new Error(errorData.error?.message || `Errore nella creazione iniziale della candidatura: ${createResponse.status}`);
    }

    const newApplicationData = await createResponse.json();
    const extractedNewApplication = extractDataFromStrapiResponse(newApplicationData);
    const newApplicationNumericalId = extractedNewApplication.id; // L'ID numerico di Strapi
    const newApplicationDocumentId = extractedNewApplication.documentId; // Il documentId della nuova candidatura

    console.log(`DEBUG: applyJobOffer - Candidatura creata con successo. ID numerico: ${newApplicationNumericalId}, DocumentId: ${newApplicationDocumentId}`);

    // Determina l'identificatore da usare nell'URL della richiesta PUT
    // PRIORITÀ AL DOCUMENTID DELL'APPLICAZIONE (per URL), altrimenti l'ID numerico
    const applicationIdentifierForPutUrl = newApplicationDocumentId && typeof newApplicationDocumentId === 'string' && newApplicationDocumentId.length > 0
                                         ? newApplicationDocumentId
                                         : newApplicationNumericalId;

    console.log(`DEBUG: applyJobOffer - Utilizzo '${applicationIdentifierForPutUrl}' come ID per l'URL PUT della candidatura.`);


    // FASE 2: Aggiornamento della Candidatura per collegare l'offerta di lavoro
    // Non abbiamo più bisogno di cercare il documentId dell'offerta qui
    // perché l'utente ha indicato che il payload della relazione si aspetta l'ID numerico.

    const updateApplicationUrl = `${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.APPLICATIONS}/${applicationIdentifierForPutUrl}`;
    
    // *** CAMBIAMENTO CRITICO: UTILIZZA L'ID NUMERICO DELL'OFFERTA DIRETTAMENTE NELL'ARRAY ***
    const updateApplicationBody = {
      data: {
        offerta_lavoros: [offerNumericalId], // Usa direttamente l'ID numerico dell'offerta
      },
    };

    console.log("DEBUG: applyJobOffer (PUT) - Request URL:", updateApplicationUrl);
    console.log("DEBUG: applyJobOffer (PUT) - Request Body (using numerical offer ID for relation):", updateApplicationBody); // Log della nuova struttura del body

    const updateResponse = await fetch(updateApplicationUrl, {
      method: 'PUT', // Usa PUT per aggiornare
      headers: getAuthHeaders(),
      body: JSON.stringify(updateApplicationBody),
    });

    console.log("DEBUG: applyJobOffer (PUT) - Response status:", updateResponse.status);

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error("DEBUG: applyJobOffer (PUT) - Error response data:", errorData); // Log completo della risposta di errore
      if (errorData.error && errorData.error.details) {
        console.error("DEBUG: applyJobOffer (PUT) - Specific Strapi Error Details:", errorData.error.details);
      }
      // Se l'aggiornamento fallisce, prova a rimuovere la candidatura creata
      try {
        await fetch(`${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.APPLICATIONS}/${newApplicationNumericalId}`, { // Usa l'ID numerico per l'eliminazione
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        console.warn("DEBUG: applyJobOffer - Candidatura parzialmente creata eliminata dopo errore nell'aggiornamento.");
      } catch (deleteError) {
        console.error("DEBUG: applyJobOffer - Errore durante l'eliminazione della candidatura parziale:", deleteError);
      }

      throw new Error(errorData.error?.message || `Errore nell'aggiornamento della candidatura per collegare l'offerta di lavoro (status: ${updateResponse.status}). Dettagli errore: ${errorData.error?.details?.key || 'N/A'}.`);
    }

    const updatedApplicationData = await updateResponse.json();
    console.log("DEBUG: applyJobOffer - Candidatura aggiornata con successo, relazione 'offerta_lavoros' stabilita:", updatedApplicationData);

    return updatedApplicationData; // Restituisce i dati dell'applicazione aggiornata

  } catch (e) {
    console.error("Error applying for offer (overall process):", e);
    throw e;
  }
};


// --- COMPONENTE REACT ---
export default function JobOffers() {
  const [jobOffers, setJobOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authenticatedUserId, setAuthenticatedUserId] = useState(null);
  const [customCandidatoId, setCustomCandidatoId] = useState(null);
  const [savedOfferIds, setSavedOfferIds] = useState(new Set());
  const [appliedOfferIds, setAppliedOfferIds] = useState(new Set());

  const [actionInProgress, setActionInProgress] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState(null);
  const router = useRouter();

  // Funzione per mostrare messaggi temporanei
  const displayMessage = (message, isError = false, duration = 5000) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(null), duration);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), duration);
    }
  };

  // Effetto principale per recuperare tutti i dati necessari all'avvio
  useEffect(() => {
    const initDataFetch = async () => {
      setIsLoading(true);
      setError(null);

      console.log("DEBUG: useEffect - Starting initDataFetch...");
      const userString = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
      let currentAuthenticatedUserId = null;

      if (userString) {
        try {
          const userData = JSON.parse(userString);
          currentAuthenticatedUserId = userData.id;
          setAuthenticatedUserId(currentAuthenticatedUserId);
          console.log("DEBUG: useEffect - Authenticated User ID from localStorage:", currentAuthenticatedUserId);
        } catch (parseError) {
          console.error("Error parsing user data from localStorage:", parseError);
          setError("Errore nel recupero dei dati utente. Effettua nuovamente il login.");
          setIsLoading(false);
          router.push('/login');
          return;
        }
      } else {
        console.log("DEBUG: useEffect - No user found in localStorage, redirecting to login.");
        router.push('/login');
        setIsLoading(false);
        return;
      }

      if (!currentAuthenticatedUserId) {
        console.log("DEBUG: useEffect - currentAuthenticatedUserId is null.");
        setError("Utente non autenticato o ID non disponibile. Impossibile recuperare il profilo candidato.");
        setIsLoading(false);
        return;
      }

      try {
        const fetchedCandidatoData = await fetchUserProfile(currentAuthenticatedUserId);
        console.log("DEBUG: useEffect - Fetched Candidato Data:", fetchedCandidatoData);

        if (!fetchedCandidatoData || !fetchedCandidatoData.id) {
          console.log("DEBUG: useEffect - No valid Candidato data or ID found for user.");
          setError("Nessun record Candidato associato al tuo utente. Assicurati che il tuo profilo candidato sia stato creato.");
          setIsLoading(false);
          return;
        }

        setCustomCandidatoId(fetchedCandidatoData.id);
        console.log("DEBUG: useEffect - Custom Candidato ID set:", fetchedCandidatoData.id);

        console.log("DEBUG: useEffect - Initiating concurrent data fetches...");
        const [savedOffersResult, applicationsResult, allOffersResult] = await Promise.allSettled([
          fetchUserSavedOffers(fetchedCandidatoData.id),
          fetchUserApplications(fetchedCandidatoData.id),
          fetchJobOffers()
        ]);

        console.log("DEBUG: useEffect - All promises settled.");
        console.log("DEBUG: useEffect - savedOffersResult:", savedOffersResult);
        console.log("DEBUG: useEffect - applicationsResult:", applicationsResult);
        console.log("DEBUG: useEffect - allOffersResult:", allOffersResult);

        if (savedOffersResult.status === 'fulfilled') {
          setSavedOfferIds(savedOffersResult.value);
          console.log("DEBUG: useEffect - Saved offers updated:", Array.from(savedOffersResult.value));
        } else {
          console.error("Error fetching saved offers:", savedOffersResult.reason);
          setError(prev => prev ? prev + " Errore nel caricamento delle offerte salvate." : "Errore nel caricamento delle offerte salvate.");
        }

        if (applicationsResult.status === 'fulfilled') {
          setAppliedOfferIds(applicationsResult.value);
          console.log("DEBUG: useEffect - Applied offers updated:", Array.from(applicationsResult.value));
        } else {
          console.error("Error fetching applications:", applicationsResult.reason);
          setError(prev => prev ? prev + " Errore nel caricamento delle candidature." : "Errore nel caricamento delle candidature.");
        }

        if (allOffersResult.status === 'fulfilled') {
          setJobOffers(allOffersResult.value);
          console.log("DEBUG: useEffect - Job offers updated:", allOffersResult.value);
        } else {
          console.error("Error fetching all job offers:", allOffersResult.reason);
          displayMessage("Errore nel caricamento delle offerte di lavoro al riprovo.", true);
          if (allOffersResult.reason?.message?.includes('401') || allOffersResult.reason?.message?.includes('403')) {
            console.log("DEBUG: useEffect - Redirecting to login due to API authentication error.");
            router.push('/login');
          }
        }

      } catch (err) {
        console.error("Initial data fetch error:", err);
        setError(err.message || "Si è verificato un errore imprevisto durante il caricamento dei dati.");
      } finally {
        setIsLoading(false);
        console.log("DEBUG: useEffect - initDataFetch completed.");
      }
    };

    initDataFetch();
  }, [router]); // router è una dipendenza perché viene usata al suo interno

  // Funzione per gestire il salvataggio di un'offerta di lavoro
  const handleSaveOffer = async (offerNumericalId) => {
    console.log("DEBUG: handleSaveOffer - Called for offer ID:", offerNumericalId);

    if (!customCandidatoId) {
      console.error("DEBUG: handleSaveOffer - customCandidatoId is null.");
      displayMessage("ID candidato non disponibile per salvare l'offerta.", true);
      return;
    }

    if (savedOfferIds.has(offerNumericalId)) {
      console.log("DEBUG: handleSaveOffer - Offer already saved:", offerNumericalId);
      displayMessage("Offerta già salvata.", true);
      return;
    }

    setActionInProgress(prev => new Set(prev).add(`save-${offerNumericalId}`));

    try {
      await saveJobOffer(offerNumericalId, customCandidatoId);
      setSavedOfferIds(prev => {
        const newSet = new Set(prev).add(offerNumericalId);
        console.log("DEBUG: handleSaveOffer - New savedOfferIds state:", Array.from(newSet));
        return newSet;
      });
      displayMessage("Offerta salvata con successo!");
    }
    catch (e) {
      console.error("DEBUG: handleSaveOffer - Error:", e);
      displayMessage(`Errore nel salvataggio dell'offerta: ${e.message}`, true);
    } finally {
      setActionInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(`save-${offerNumericalId}`);
        return newSet;
      });
    }
  };

  // Funzione per candidarsi a un'offerta
  const handleApply = async (offerNumericalId) => {
    console.log("DEBUG: handleApply - Called for offer ID:", offerNumericalId);

    if (!customCandidatoId) {
      console.error("DEBUG: handleApply - customCandidatoId is null.");
      displayMessage("ID candidato non disponibile. Impossibile candidarsi.", true);
      return;
    }

    if (appliedOfferIds.has(offerNumericalId)) {
      console.log("DEBUG: handleApply - Offer already applied (using numerical ID):", offerNumericalId);
      displayMessage("Hai già inviato la candidatura per questa offerta.", true);
      return;
    }

    setActionInProgress(prev => new Set(prev).add(`apply-${offerNumericalId}`));

    try {
      // Passiamo 'jobOffers' alla funzione applyJobOffer per cercare il documentId
      const result = await applyJobOffer(offerNumericalId, customCandidatoId, jobOffers, '');

      if (result) {
        setAppliedOfferIds(prev => {
          const newSet = new Set(prev).add(offerNumericalId);
          console.log("DEBUG: handleApply - New appliedOfferIds state (using numerical ID):", Array.from(newSet));
          return newSet;
        });
        displayMessage("Candidatura inviata con successo!");
      }
    } catch (e) {
      console.error("DEBUG: handleApply - Error:", e);
      displayMessage(`Errore nell'invio della candidatura: ${e.message}`, true);
    } finally {
      setActionInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(`apply-${offerNumericalId}`);
        return newSet;
      });
    }
  };

  // Funzione per visualizzare lo stato della candidatura
  const handleViewApplication = (offerNumericalId) => {
    console.log("Visualizzazione stato candidatura per offerta:", offerNumericalId);
    displayMessage("Candidatura già inviata. Funzionalità di visualizzazione in sviluppo.");
  };

  // Funzione per rimuovere un'offerta salvata
  const handleRemoveSavedOffer = async (offerNumericalId) => {
    console.log("DEBUG: handleRemoveSavedOffer - Called for offer ID:", offerNumericalId);

    if (!customCandidatoId) {
      displayMessage("ID candidato non disponibile. Impossibile rimuovere l'offerta salvata.", true);
      return;
    }

    if (!savedOfferIds.has(offerNumericalId)) {
      displayMessage("Offerta non trovata tra i salvati per la rimozione.", true);
      return;
    }

    setActionInProgress(prev => new Set(prev).add(`remove-${offerNumericalId}`));

    try {
      const headers = getAuthHeaders();
      const searchUrl = `${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.SAVED_OFFERS}?filters[candidato][id][$eq]=${customCandidatoId}&filters[offerta_lavoro][id][$eq]=${offerNumericalId}`;
      console.log("DEBUG: handleRemoveSavedOffer - Search URL:", searchUrl);
      const searchResponse = await fetch(searchUrl, { headers });

      if (!searchResponse.ok) {
        const errorBody = await searchResponse.json().catch(() => ({}));
        throw new Error(`Errore nel recupero dell'offerta salvata da rimuovere: ${searchResponse.statusText} - ${errorBody.error?.message || ''}`);
      }

      const data = await searchResponse.json();
      console.log("DEBUG: handleRemoveSavedOffer - Search data:", data);

      if (data.data && data.data.length > 0) {
        const savedOfferRecordId = data.data[0].id; // L'ID del record "offerte-salvates" da eliminare

        const deleteResponse = await fetch(`${API_CONFIG.STRAPI_BASE_URL}/${API_CONFIG.ENDPOINTS.SAVED_OFFERS}/${savedOfferRecordId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!deleteResponse.ok) {
          const errorBody = await deleteResponse.json().catch(() => ({}));
          throw new Error(`Errore nella rimozione dell'offerta salvata: ${deleteResponse.statusText} - ${errorBody.error?.message || ''}`);
        }

        console.log('Offerta salvata rimossa con successo!');
        displayMessage('Offerta salvata rimossa con successo!');
        setSavedOfferIds(prev => {
          const newState = new Set(prev);
          newState.delete(offerNumericalId);
          console.log("DEBUG: handleRemoveSavedOffer - New savedOfferIds state:", Array.from(newState));
          return newState;
        });
      } else {
        displayMessage("Offerta non trovata tra i salvati per la rimozione.", true);
      }

    } catch (err) {
      console.error("Errore durante la rimozione dell'offerta salvata:", err);
      displayMessage(`Errore durante la rimozione dell'offerta salvata: ${err.message}`, true);
    } finally {
      setActionInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(`remove-${offerNumericalId}`);
        return newSet;
      });
    }
  };


  // Funzione di retry migliorata
  const handleRetry = async () => {
    console.log("DEBUG: Retry button clicked.");
    setError(null);
    setIsLoading(true);

    const userString = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    if (userString) {
      try {
        const user = JSON.parse(userString);
        const currentAuthenticatedUserId = user.id; // Rimuovi const, già dichiarato sopra
        setAuthenticatedUserId(currentAuthenticatedUserId);

        const fetchedCandidatoData = await fetchUserProfile(currentAuthenticatedUserId);
        if (fetchedCandidatoData && fetchedCandidatoData.id) {
          setCustomCandidatoId(fetchedCandidatoData.id);

          const [savedOffersResult, applicationsResult, allOffersResult] = await Promise.allSettled([
            fetchUserSavedOffers(fetchedCandidatoData.id),
            fetchUserApplications(fetchedCandidatoData.id),
            fetchJobOffers()
          ]);

          if (savedOffersResult.status === 'fulfilled') {
            setSavedOfferIds(savedOffersResult.value);
            console.log("DEBUG: handleRetry - Saved offers updated on retry:", Array.from(savedOffersResult.value));
          } else {
            console.error("Error fetching saved offers on retry:", savedOffersResult.reason);
            displayMessage("Errore nel caricamento delle offerte salvate al riprovo.", true);
          }

          if (applicationsResult.status === 'fulfilled') {
            setAppliedOfferIds(applicationsResult.value);
            console.log("DEBUG: handleRetry - Applied offers updated on retry:", Array.from(applicationsResult.value));
          } else {
            console.error("Error fetching applications on retry:", applicationsResult.reason);
            displayMessage("Errore nel caricamento delle candidature al riprovo.", true);
          }

          if (allOffersResult.status === 'fulfilled') {
            setJobOffers(allOffersResult.value);
            console.log("DEBUG: useEffect - Job offers updated:", allOffersResult.value); // LOG: Updated here
          } else {
            console.error("Error fetching all job offers:", allOffersResult.reason);
            displayMessage("Errore nel caricamento delle offerte di lavoro al riprovo.", true);
            if (allOffersResult.reason?.message?.includes('401') || allOffersResult.reason?.message?.includes('403')) {
              console.log("DEBUG: useEffect - Redirecting to login due to API authentication error.");
              router.push('/login');
            }
          }
        } else {
          setError("Nessun record Candidato associato al tuo utente. Assicurati che il tuo profilo candidato sia stato creato.");
        }
      } catch (e) {
        console.error("Failed to re-parse user from localStorage on retry or initial fetch error:", e);
        setError(e.message || "Si è verificato un errore imprevisto durante il ripristino dei dati.");
        if (e.message.includes('autenticato') || e.message.includes('login')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
        console.log("DEBUG: handleRetry - Retry attempt completed.");
      }
    } else {
      router.push('/login');
    }
  };


  if (isLoading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          Caricamento offerte di lavoro...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <h1 className={styles.sectionTitle}>Offerte di Lavoro Disponibili</h1>

      {successMessage && (
        <div className={styles.successMessage}>
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}
      {error && (
        <div className={styles.errorMessage}>
          <i className="fas fa-exclamation-circle"></i> {error}
          <button onClick={handleRetry} className={styles.retryButton}>Riprova</button>
        </div>
      )}

      {jobOffers.length === 0 && !error ? (
        <div className={styles.noDataMessage}>
          Nessuna offerta di lavoro trovata al momento. Torna più tardi!
        </div>
      ) : (
        <div className={styles.jobOffersGrid}>
          {jobOffers.map((offer) => {
            if (!offer || !offer.id || !offer.attributes) {
              return (
                <div key={`malformed-${Math.random()}`} className={styles.error} style={{ fontSize: '0.8rem', padding: '10px' }}>
                  <p>Attenzione: un'offerta di lavoro non è stata caricata correttamente (ID o attributi mancanti).</p>
                </div>
              );
            }

            const isSaved = savedOfferIds.has(offer.id);
            const isApplied = appliedOfferIds.has(offer.id);
            const isSaving = actionInProgress.has(`save-${offer.id}`);
            const isApplying = actionInProgress.has(`apply-${offer.id}`);
            const isRemovingSaved = actionInProgress.has(`remove-${offer.id}`);


            console.log(`DEBUG: Rendering Offer ID: ${offer.id}, Title: "${offer.attributes.titolo}" -> isSaved: ${isSaved}, isApplied: ${isApplied}, isSaving: ${isSaving}, isApplying: ${isApplying}, isRemovingSaved: ${isRemovingSaved}`);

            return (
              <div key={offer.id} className={styles.jobOfferCard}>
                <h2 className={styles.jobOfferTitle}>{offer.attributes.titolo}</h2>
                <p className={styles.jobOfferDescription}>{offer.attributes.descrizione}</p>
                <div className={styles.jobOfferDetails}>
                  <p><i className="fas fa-map-marker-alt"></i> {offer.attributes.localita}</p>
                  <p><i className="fas fa-file-contract"></i> {offer.attributes.tipo_contratto}</p>
                  <p><i className="fas fa-building"></i> {offer.attributes.settore}</p>
                  <p><i className="fas fa-briefcase"></i> {offer.attributes.modalita_lavoro}</p>
                  <p><i className="fas fa-hourglass-half"></i> {offer.attributes.esperienza_richiesta}</p>
                  <p>
                    <i className="fas fa-money-bill-wave"></i> Stipendio: €{offer.attributes.retribuzione_minima} - €{offer.attributes.retribuzione_massima}
                  </p>
                  <p><i className="fas fa-calendar-alt"></i> Pubblicato il: {new Date(offer.attributes.data_pubblicazione).toLocaleDateString('it-IT')}</p>
                  {offer.attributes.scadenza && (
                    <p><i className="fas fa-calendar-times"></i> Scadenza: {new Date(offer.attributes.scadenza).toLocaleDateString('it-IT')}</p>
                  )}
                </div>
                <div className={styles.jobOfferActions}>
                  <button
                    onClick={() => handleSaveOffer(offer.id)}
                    className={`${styles.actionBtn} ${styles.secondary}`}
                    disabled={isSaving || isSaved || isRemovingSaved || isApplying} // Disabilita anche se si sta candidando
                  >
                    {isSaving || isRemovingSaved ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className={isSaved ? "fas fa-check" : "fas fa-bookmark"}></i>
                    )}
                    {isSaved ? 'Salvata' : 'Salva Offerta'}
                  </button>
                  {isApplied ? (
                    <button
                      onClick={() => handleViewApplication(offer.id)}
                      className={`${styles.actionBtn} ${styles.primary}`}
                      disabled={isApplying || isSaving || isRemovingSaved} // Disabilita anche se si sta salvando/rimuovendo
                    >
                      <i className="fas fa-check-double"></i> Candidatura inviata
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(offer.id)}
                      className={styles.actionBtn}
                      disabled={isApplying || isSaving || isRemovingSaved} // Disabilita anche se si sta salvando/rimuovendo
                    >
                      {isApplying ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
                      Candidati
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
