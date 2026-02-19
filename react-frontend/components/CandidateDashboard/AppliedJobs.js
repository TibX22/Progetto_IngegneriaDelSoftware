// components/CandidateDashboard/AppliedJobs.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './CandidateDashboard.module.css'; // Importa il modulo CSS

export default function AppliedJobs() {
  // State to hold the list of jobs the user has applied to
  const [appliedJobs, setAppliedJobs] = useState([]);
  // State to manage the loading status of data
  const [isLoading, setIsLoading] = useState(true);
  // State to store any error messages
  const [error, setError] = useState(null);
  // State to store the numerical ID of the custom Candidato content type, primarily for display or internal checks
  const [customCandidatoId, setCustomCandidatoId] = useState(null);

  // Base URL for your Strapi backend
  const STRAPI_BASE_URL = 'http://localhost:1337'; // IMPORTANT: Ensure this URL matches your Strapi instance
  // API endpoint for candidatures (job applications)
  const APPLICATIONS_API_ENDPOINT = 'api/candidaturas';
  // API endpoint for the custom 'candidato' (candidate) content type
  const CUSTOM_CANDIDATO_API_ENDPOINT = 'api/candidatoes';

  /**
   * Memoized function to retrieve authentication headers, including the JWT token from localStorage.
   * @returns {Object} Headers object with Content-Type and Authorization (if token exists).
   */
  const getAuthHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    // Safely access localStorage only in client-side environment
    const authToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }, []);

  /**
   * Helper function to extract data correctly from Strapi v5 API responses.
   * Strapi v5 typically wraps data in `{ data: { id, attributes: {...} } }` or `{ data: [{ id, attributes: {...} }, ...] }`.
   * This function unwraps these structures and recursively processes nested relations.
   * @param {Object|Array|null} strapiItem - The item or array of items from a Strapi response.
   * @returns {Object|Array|null} The unwrapped data, or null if the input is invalid.
   */
  const extractDataFromStrapiResponse = useCallback((strapiItem) => {
    if (!strapiItem) {
      return null;
    }

    // Handle array of items from Strapi's 'data' wrapper (e.g., from a collection fetch)
    if (Array.isArray(strapiItem)) {
      return strapiItem.map(item => extractDataFromStrapiResponse(item)).filter(Boolean);
    }

    let extractedId = null;
    let extractedAttributes = {};

    // Case 1: Standard Strapi v5 single item or relation with { id, attributes } structure
    if (typeof strapiItem.id !== 'undefined' && typeof strapiItem.attributes === 'object') {
      extractedId = strapiItem.id;
      extractedAttributes = strapiItem.attributes;
    }
    // Case 2: Strapi v5 wrapped response for a single item { data: { id, attributes } }
    else if (strapiItem.data && typeof strapiItem.data.id !== 'undefined' && typeof strapiItem.data.attributes === 'object') {
      extractedId = strapiItem.data.id;
      extractedAttributes = strapiItem.data.attributes;
    }
    // Fallback for objects that are already 'attributes' or flattened, potentially without an ID directly.
    // This is useful for deeply nested objects that don't have their own ID/attributes wrapper,
    // but are part of a larger object's attributes.
    else if (typeof strapiItem === 'object' && strapiItem !== null) {
      extractedAttributes = { ...strapiItem };
      if (typeof strapiItem.id !== 'undefined') {
        extractedId = strapiItem.id;
        delete extractedAttributes.id; // Remove ID to avoid duplication if it's already extracted as 'id'
      }
    } else {
      console.warn("Unexpected Strapi item structure, unable to extract standard ID and attributes:", strapiItem);
      return strapiItem; // Return original if cannot parse standard
    }

    // Recursively process attributes to unwrap nested 'data' and 'attributes' from relations.
    // This ensures deeply nested relationships are also flattened.
    const finalAttributes = {};
    for (const key in extractedAttributes) {
      if (extractedAttributes.hasOwnProperty(key)) {
        const value = extractedAttributes[key];
        // Check if the value is a Strapi relation object with a 'data' property
        if (value && typeof value === 'object' && 'data' in value) {
          if (Array.isArray(value.data)) {
            // If it's a "has many" relation, recursively process each item
            finalAttributes[key] = value.data.map(item => extractDataFromStrapiResponse(item)).filter(Boolean);
          } else if (value.data !== null) {
            // If it's a "has one" relation and not null, recursively process the single item
            finalAttributes[key] = extractDataFromStrapiResponse(value.data);
          } else {
            // If relation is empty (data: null)
            finalAttributes[key] = null;
          }
        } else {
          // If not a relation, keep the value as is
          finalAttributes[key] = value;
        }
      }
    }

    return {
      id: extractedId, // The ID of the current entity (e.g., application ID, job offer ID)
      ...finalAttributes, // All its attributes, potentially including unwrapped relations
    };
  }, []);

  /**
   * Main effect hook to fetch the candidate's profile and then their applied jobs.
   * This effect runs once on component mount, and also when the retry mechanism triggers it.
   */
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      setAppliedJobs([]); // Clear any previously loaded jobs

      // 1. Get authenticated user ID from localStorage
      const userString = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
      let authenticatedUserId = null;
      if (userString) {
        try {
          const userData = JSON.parse(userString);
          authenticatedUserId = userData.id;
        } catch (parseError) {
          console.error("Error parsing user data from localStorage:", parseError);
          setError("Errore nel recupero dei dati utente. Riprova ad accedere.");
          setIsLoading(false);
          return;
        }
      } else {
        // If user data not found, redirect to login page
        window.location.href = '/login';
        setIsLoading(false);
        return;
      }

      if (!authenticatedUserId) {
        setError("Utente non autenticato o ID non disponibile. Impossibile caricare le candidature.");
        setIsLoading(false);
        return;
      }

      let candidateProfileId = null;
      // 2. Fetch the custom Candidato profile linked to the authenticated user
      try {
        const candidatoUrl = `${STRAPI_BASE_URL}/${CUSTOM_CANDIDATO_API_ENDPOINT}?filters[user][id][$eq]=${authenticatedUserId}&populate=user`;
        console.log("Fetching custom Candidato data:", candidatoUrl);
        const candidatoResponse = await fetch(candidatoUrl, { headers: getAuthHeaders() });

        if (!candidatoResponse.ok) {
          const errorBody = await candidatoResponse.json().catch(() => ({}));
          console.error(`Error fetching custom Candidato: ${candidatoResponse.statusText} - ${errorBody.error?.message || ''}`);
          throw new Error(`Errore nel caricamento del profilo candidato: ${errorBody.error?.message || 'Errore sconosciuto'}`);
        }

        const rawCandidatoData = await candidatoResponse.json();
        console.log("Raw custom Candidato response:", rawCandidatoData);

        // Process the candidate data to get the numerical ID
        const processedCandidatoData = extractDataFromStrapiResponse(rawCandidatoData.data);

        if (processedCandidatoData && processedCandidatoData.length > 0) {
          const firstProfile = processedCandidatoData[0];
          if (firstProfile && firstProfile.id) {
            candidateProfileId = firstProfile.id;
            setCustomCandidatoId(firstProfile.id); // Set for display/later use if needed
          }
        }

        if (!candidateProfileId) {
          setError("Nessun profilo candidato associato al tuo utente. Assicurati che il tuo profilo candidato sia stato creato.");
          setIsLoading(false);
          return;
        }

      } catch (err) {
        console.error("Errore durante il recupero del profilo candidato:", err);
        setError(err.message);
        setIsLoading(false);
        return;
      }

      // 3. Now, fetch applications using the retrieved candidateProfileId
      try {
        // Filter applications by the numerical ID of the candidato and populate the related job offer ('offerta_lavoros')
        const applicationsUrl = `${STRAPI_BASE_URL}/${APPLICATIONS_API_ENDPOINT}?filters[candidato][id][$eq]=${candidateProfileId}&populate=offerta_lavoros`;
        console.log(`Fetching applications from URL: ${applicationsUrl} (using candidato.id = ${candidateProfileId})`);
        const applicationsResponse = await fetch(applicationsUrl, { headers: getAuthHeaders() });

        if (!applicationsResponse.ok) {
          // If unauthorized, redirect to login
          if (applicationsResponse.status === 401 || applicationsResponse.status === 403) {
            window.location.href = '/login';
            return;
          }
          const errorBody = await applicationsResponse.json().catch(() => ({}));
          console.error(`HTTP error fetching applications: ${applicationsResponse.statusText} - ${errorBody.error?.message || ''}`);
          throw new Error(`Errore nel caricamento delle candidature: ${errorBody.error?.message || 'Errore sconosciuto'}`);
        }

        const rawApplicationsData = await applicationsResponse.json();
        console.log("Raw applications data from backend:", rawApplicationsData);

        // Process the raw applications data to extract relevant job offer details
        const processedAppliedJobs = rawApplicationsData.data
          .map(application => {
            const extractedApp = extractDataFromStrapiResponse(application);
            if (!extractedApp) return null; // Skip if application extraction failed

            const linkedOffers = [];
            // Ensure 'offerta_lavoros' relation exists and is an array before iterating
            if (extractedApp.offerta_lavoros && Array.isArray(extractedApp.offerta_lavoros)) {
              extractedApp.offerta_lavoros.forEach(relatedOfferItem => {
                const offerDetails = extractDataFromStrapiResponse(relatedOfferItem);
                if (offerDetails) {
                  linkedOffers.push(offerDetails);
                } else {
                  console.warn("Failed to extract details for a linked offer item:", relatedOfferItem);
                }
              });
            }

            // Return a structured object for each applied job
            return {
              id: extractedApp.id, // ID of the application entry itself
              status: extractedApp.stato, // Status of the application
              dateApplied: extractedApp.dataInvio, // Date of application
              jobOffers: linkedOffers, // Array of job offers linked to this application
              motivazionale: extractedApp.messaggioMotivazionale || 'N/A', // Motivational message
              candidatoId: extractedApp.candidato // Store candidato ID for debugging if needed
            };
          })
          .filter(Boolean); // Filter out any null entries (applications that couldn't be processed)

        setAppliedJobs(processedAppliedJobs);
        console.log("Final processed applied jobs state:", processedAppliedJobs);
      } catch (e) {
        console.error("Errore durante il recupero delle candidature applicate:", e);
        setError("Impossibile caricare le tue candidature. Riprova più tardi.");
      } finally {
        setIsLoading(false); // Always set loading to false after fetch attempt
      }
    };

    // Call the main data fetching function
    fetchAllData();
  }, [getAuthHeaders, extractDataFromStrapiResponse]); // Dependencies: only functions that don't change often

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles.loadingMessage}>
        <div className={styles.loadingSpinner}></div>
        Caricamento storico candidature...
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles.errorMessage}>
        <i className="fas fa-exclamation-circle"></i> {error}
        <button
          onClick={() => {
            // Trigger a re-fetch by setting isLoading to true, which will re-run the useEffect
            setIsLoading(true);
            setError(null); // Clear the previous error message
          }}
          className={styles.actionBtn} // Using the common actionBtn style
        >
          Riprova
        </button>
      </div>
    );
  }

  // Render empty state if no applied jobs are found
  if (appliedJobs.length === 0) {
    return (
      <div className={styles.noDataMessage}>
        Nessuna candidatura inviata. Inizia a candidarti alle offerte di lavoro!
      </div>
    );
  }

  // Render the list of applied jobs
  return (
    <div className={styles.mainContent}> {/* Using mainContent to center and pad */}
      <h1 className={styles.sectionTitle}>
        <i className="fas fa-history"></i> Storico Candidature
      </h1>
      <div className={styles.appliedJobsGrid}> {/* Using new grid class */}
        {appliedJobs.map((application) => (
          // Only render if there's at least one linked job offer
          application.jobOffers && application.jobOffers.length > 0 ? (
            <div key={application.id} className={styles.appliedJobCard}> {/* Using new card style */}
              {/* Display details of the first linked job offer for simplicity */}
              <h2 className={styles.appliedJobTitle}>{application.jobOffers[0].titolo || 'Titolo non disponibile'}</h2>
              <p className={styles.appliedJobDescription}>{application.jobOffers[0].descrizione || 'Descrizione non disponibile'}</p>
              <div className={styles.appliedJobDetails}>
                <p><i className="fas fa-calendar-alt"></i> Data Candidatura: {new Date(application.dateApplied).toLocaleDateString('it-IT')}</p>
                <p><i className="fas fa-info-circle"></i> Stato: {application.status}</p>
                {application.jobOffers[0].localita && (
                  <p><i className="fas fa-map-marker-alt"></i> Località: {application.jobOffers[0].localita}</p>
                )}
                {application.jobOffers[0].tipo_contratto && (
                  <p><i className="fas fa-file-contract"></i> Tipo Contratto: {application.jobOffers[0].tipo_contratto}</p>
                )}
                {application.jobOffers[0].modalita_lavoro && (
                  <p><i className="fas fa-briefcase"></i> Modalità Lavoro: {application.jobOffers[0].modalita_lavoro}</p>
                )}
                {application.motivazionale && application.motivazionale !== 'N/A' && (
                  <p><i className="fas fa-comment-dots"></i> Messaggio: {application.motivazionale}</p>
                )}
              </div>
            </div>
          ) : (
            // Fallback for applications where job offer details are missing
            <div key={`malformed-app-${application.id || Math.random()}`} className={styles.errorMessage} style={{ fontSize: '0.8rem', padding: '10px' }}>
              <p>Attenzione: Dettagli dell'offerta per una candidatura non disponibili.</p>
              <p>ID Candidatura: {application.id || 'N/A'}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
