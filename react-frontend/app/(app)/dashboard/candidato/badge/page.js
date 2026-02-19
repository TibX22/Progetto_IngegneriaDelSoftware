// src/app/dashboard/candidato/badge/page.js (Componente aggiornato per la visualizzazione dei badge derivati e qualificati da Strapi con immagini)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from '@/components/CandidateDashboard/CandidateDashboard.module.css';
import { useRouter } from 'next/navigation';

export default function BadgePage() {
  const [attestationBadges, setAttestationBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profiloCandidatoId, setProfiloCandidatoId] = useState(null);

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const CERTIFICATIONS_API_ENDPOINT = 'api/certificaziones';
  // Modificato: Aggiunto populate=immagine per includere i dati dell'immagine del badge
  const ALL_BADGES_API_ENDPOINT = 'api/badges?populate=immagine'; 
  const CANDIDATE_PROFILE_API_ENDPOINT = 'api/profilo-candidatoes';
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    const authToken = typeof window !== 'undefined' ? localStorage.getItem("jwt") : null;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    console.log("Auth Headers:", headers); // LOG: Headers di autorizzazione
    return headers;
  }, []);

  const extractDataFromStrapiResponse = useCallback((strapiItem) => {
    if (!strapiItem) {
      console.warn("extractDataFromStrapiResponse received null or undefined item."); // LOG: avviso elemento nullo
      return null;
    }
    
    let extractedId = null;
    let extractedAttributes = {};

    if (typeof strapiItem.id !== 'undefined' && typeof strapiItem.attributes === 'object') {
      extractedId = strapiItem.id;
      extractedAttributes = strapiItem.attributes;
    } else if (strapiItem.data && typeof strapiItem.data.id !== 'undefined' && typeof strapiItem.data.attributes === 'object') {
      // Questo caso è specifico per quando l'elemento stesso è dentro un wrapper 'data' (es. response.data.data[0])
      extractedId = strapiItem.data.id;
      extractedAttributes = strapiItem.data.attributes;
    } else if (typeof strapiItem.id !== 'undefined') {
        extractedId = strapiItem.id;
        extractedAttributes = { ...strapiItem };
        delete extractedAttributes.id;
    } else {
        console.warn("Unexpected Strapi item structure, unable to extract standard ID and attributes:", strapiItem);
        return strapiItem;
    }

    // Estrai l'URL dell'immagine se presente e valido
    // CORREZIONE QUI: La tua struttura dati ha l'URL direttamente sotto 'immagine'
    const imageUrl = extractedAttributes.immagine?.url 
                       ? `${STRAPI_BASE_URL}${extractedAttributes.immagine.url}` 
                       : null;
    
    console.log(`Extracting image URL for item ID ${extractedId}:`, imageUrl); // LOG: Image URL extracted in extractDataFromStrapiResponse

    const result = {
      id: extractedId,
      documentId: extractedId, // Alias
      name: extractedAttributes.nome || 'Nome Badge Sconosciuto', // Mappa 'nome' di Strapi a 'name'
      description: extractedAttributes.descrizione || 'Descrizione non disponibile.', // Mappa 'descrizione' di Strapi a 'description'
      icon: extractedAttributes.icon || 'fas fa-certificate', // Assumi che Strapi abbia un campo 'icon'. Fallback se manca.
      color: extractedAttributes.color || '#6366f1', // Assumi che Strapi abbia un campo 'color'. Fallback se manca.
      imageUrl: imageUrl, // Aggiunto l'URL dell'immagine estratto
    };
    console.log("Extracted Data from Strapi Item:", result); // LOG: dati estratti
    return result;
  }, [STRAPI_BASE_URL]); // STRAPI_BASE_URL è una dipendenza qui

  const fetchProfiloCandidatoId = useCallback(async (userId) => {
    console.log("Attempting to fetch profiloCandidatoId for userId:", userId); // LOG: Inizio fetch profilo
    if (!userId) {
      console.warn("User ID is null, cannot fetch candidate profile.");
      return null;
    }
    try {
      const url = `${STRAPI_BASE_URL}/${CANDIDATE_PROFILE_API_ENDPOINT}?filters[candidato][user][id][$eq]=${userId}`;
      console.log("Fetching candidate profile from URL:", url); // LOG: URL profilo candidato
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error(`Error fetching candidate profile: ${response.statusText} -`, errorBody); // LOG: Errore fetch profilo
        throw new Error(`Error fetching candidate profile: ${response.statusText} - ${errorBody.error?.message || ''}`);
      }
      const rawData = await response.json();
      console.log("Raw candidate profile data:", rawData); // LOG: Dati raw profilo candidato
      const dataToProcess = Array.isArray(rawData) ? rawData : (rawData.data || []);

      if (dataToProcess.length > 0) {
        const firstProfile = extractDataFromStrapiResponse(dataToProcess[0]);
        if (firstProfile && firstProfile.id) {
          console.log("Successfully fetched profiloCandidatoId:", firstProfile.id); // LOG: Profilo ID trovato
          return firstProfile.id;
        }
      }
      console.log("No candidate profile found for user ID:", userId); // LOG: Nessun profilo trovato
      return null;
    } catch (err) {
      console.error("Error during fetchProfiloCandidatoId for BadgePage:", err);
      throw err;
    }
  }, [getAuthHeaders, STRAPI_BASE_URL, CANDIDATE_PROFILE_API_ENDPOINT, extractDataFromStrapiResponse]);

  const fetchAllBadgeDefinitions = useCallback(async () => {
    console.log("Attempting to fetch all badge definitions."); // LOG: Inizio fetch definizioni badge
    try {
      const url = `${STRAPI_BASE_URL}/${ALL_BADGES_API_ENDPOINT}`; // L'endpoint ora include populate=immagine
      console.log("Fetching all badge definitions from URL:", url); // LOG: URL definizioni badge
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error(`Error fetching badge definitions: ${response.statusText} -`, errorBody); // LOG: Errore fetch definizioni badge
        throw new Error(`Error fetching badge definitions: ${response.statusText} - ${errorBody.error?.message || ''}`);
      }
      const rawResponseData = await response.json();
      console.log("Raw badge definitions data:", rawResponseData); // LOG: Dati raw definizioni badge

      // NUOVO LOG: Ispezione dettagliata del campo 'immagine' per ogni badge nella risposta raw
      if (rawResponseData.data && Array.isArray(rawResponseData.data)) {
        rawResponseData.data.forEach((item, index) => {
          if (item.attributes && item.attributes.immagine) {
            console.log(`Badge Definition [${index}] - Image Data (Raw):`, item.attributes.immagine);
            if (item.attributes.immagine.url) { // CORREZIONE: Controlla direttamente .url
              console.log(`  -> Image URL (Raw):`, item.attributes.immagine.url);
            } else {
              console.log(`  -> Image URL not found directly on 'immagine' for Badge [${index}]`);
            }
          } else {
            console.log(`Badge Definition [${index}] - 'immagine' field not found or is null.`);
          }
        });
      }

      const definitions = Array.isArray(rawResponseData) ? rawResponseData : (rawResponseData.data || []);
      
      const parsedDefinitions = definitions.map(item => extractDataFromStrapiResponse(item));
      console.log("Parsed all badge definitions:", parsedDefinitions); // LOG: Definizioni badge parsate
      return parsedDefinitions;
    } catch (err) {
      console.error("Error during fetchAllBadgeDefinitions:", err);
      throw err;
    }
  }, [getAuthHeaders, STRAPI_BASE_URL, ALL_BADGES_API_ENDPOINT, extractDataFromStrapiResponse]);


  // Funzione per recuperare le certificazioni e qualificare i badge
  const fetchCertificationsAndQualifyBadges = useCallback(async (candidateProfileId) => {
    console.log("Attempting to fetch certifications and qualify badges for profiloCandidatoId:", candidateProfileId); // LOG: Inizio qualifica badge
    if (!candidateProfileId) {
      console.warn("Candidate Profile ID is null, cannot fetch certifications for badges.");
      setAttestationBadges([]);
      return;
    }
    try {
      // 1. Recupera tutte le certificazioni del candidato
      const certUrl = `${STRAPI_BASE_URL}/${CERTIFICATIONS_API_ENDPOINT}?filters[profilo_candidato][id][$eq]=${candidateProfileId}`;
      console.log("Fetching certifications from URL:", certUrl); // LOG: URL certificazioni
      const certResponse = await fetch(certUrl, { headers: getAuthHeaders() });
      if (!certResponse.ok) {
        const errorBody = await certResponse.json().catch(() => ({}));
        console.error(`Error fetching certifications: ${certResponse.statusText} -`, errorBody); // LOG: Errore fetch certificazioni
        throw new Error(`Error fetching certifications: ${response.statusText} - ${errorBody.error?.message || ''}`);
      }
      const rawCertData = await certResponse.json();
      console.log("Raw certifications data:", rawCertData); // LOG: Dati raw certificazioni
      const certifications = Array.isArray(rawCertData) ? rawCertData : (rawCertData.data || []);
      const parsedCertifications = certifications.map(item => extractDataFromStrapiResponse(item));
      console.log("Parsed Certifications:", parsedCertifications); // LOG: Certificazioni parsate
      
      // 2. Recupera tutte le definizioni dei badge da Strapi
      const allBadgeDefinitions = await fetchAllBadgeDefinitions();
      console.log("All Badge Definitions from Strapi:", allBadgeDefinitions); // LOG: Tutte le definizioni badge da Strapi
      
      const qualifiedBadges = [];

      // Esempio di logica per qualificare i badge basandosi sulle certificazioni
      // Per ogni definizione di badge da Strapi, verifica se il candidato la "ottiene"
      
      // Badge "Madrelingua Inglese" (ID da Strapi se definito)
      const englishBadgeDefinition = allBadgeDefinitions.find(b => b.name && b.name.toLowerCase().includes('madrelingua inglese'));
      if (englishBadgeDefinition) {
        console.log("Found English Badge Definition:", englishBadgeDefinition); // LOG: Definizione badge inglese trovata
        const hasC1English = parsedCertifications.some(cert => 
          cert.name && cert.name.toLowerCase().includes('c1 inglese')
        );
        const hasC2English = parsedCertifications.some(cert => 
          cert.name && cert.name.toLowerCase().includes('c2 inglese')
        );
        console.log("Has C1 English:", hasC1English, "Has C2 English:", hasC2English); // LOG: Controllo certificazioni inglese
        if (hasC1English || hasC2English) {
          qualifiedBadges.push(englishBadgeDefinition);
          console.log("Qualified for English Badge!"); // LOG: Badge inglese qualificato
        }
      } else {
        console.log("English Badge definition not found in Strapi."); // LOG: Definizione badge inglese non trovata
      }

      // Badge "Sviluppatore Full-Stack Senior"
      const fullstackBadgeDefinition = allBadgeDefinitions.find(b => b.name && b.name.toLowerCase().includes('sviluppatore full-stack senior'));
      if (fullstackBadgeDefinition) {
        console.log("Found Full-Stack Badge Definition:", fullstackBadgeDefinition); // LOG: Definizione badge full-stack trovata
        const hasReactCert = parsedCertifications.some(cert => 
          cert.name && cert.name.toLowerCase().includes('react developer')
        );
        const hasNodeCert = parsedCertifications.some(cert => 
          cert.name && cert.name.toLowerCase().includes('node.js backend')
        );
        console.log("Has React Cert:", hasReactCert, "Has Node Cert:", hasNodeCert); // LOG: Controllo certificazioni full-stack
        if (hasReactCert && hasNodeCert) {
          qualifiedBadges.push(fullstackBadgeDefinition);
          console.log("Qualified for Full-Stack Badge!"); // LOG: Badge full-stack qualificato
        }
      } else {
        console.log("Full-Stack Badge definition not found in Strapi. Consider creating it in Strapi."); // LOG: Definizione badge full-stack non trovata
      }
      
      // Badge "Esperto di Sostenibilità"
      const sustainabilityBadgeDefinition = allBadgeDefinitions.find(b => b.name && b.name.toLowerCase().includes('sostenibilità aziendale'));
      if (sustainabilityBadgeDefinition) {
        console.log("Found Sustainability Badge Definition:", sustainabilityBadgeDefinition); // LOG: Definizione badge sostenibilità trovata
        const hasSustainabilityCert = parsedCertifications.some(cert =>
          cert.name && cert.name.toLowerCase().includes('sostenibilità aziendale')
        );
        console.log("Has Sustainability Cert:", hasSustainabilityCert); // LOG: Controllo certificazione sostenibilità
        if (hasSustainabilityCert) {
          qualifiedBadges.push(sustainabilityBadgeDefinition);
          console.log("Qualified for Sustainability Badge!"); // LOG: Badge sostenibilità qualificato
        }
      } else {
        console.log("Sustainability Badge definition not found in Strapi. Please ensure its 'nome' is 'Sostenibilità aziendale'."); // LOG: Definizione badge sostenibilità non trovata
      }

      // NUOVO BADGE: "Innovatore Creativo"
      const creativeInnovatorBadgeDefinition = allBadgeDefinitions.find(b => b.name && b.name.toLowerCase().includes('innovatore creativo'));
      if (creativeInnovatorBadgeDefinition) {
        console.log("Found Creative Innovator Badge Definition:", creativeInnovatorBadgeDefinition);
        const hasDesignThinkingCert = parsedCertifications.some(cert =>
          cert.name && cert.name.toLowerCase().includes('design thinking')
        );
        console.log("Has Design Thinking Cert:", hasDesignThinkingCert);
        if (hasDesignThinkingCert) {
          qualifiedBadges.push(creativeInnovatorBadgeDefinition);
          console.log("Qualified for Creative Innovator Badge!");
        }
      } else {
        console.log("Creative Innovator Badge definition not found in Strapi. Consider creating it in Strapi.");
      }


      console.log("Final Qualified Badges to display:", qualifiedBadges); // LOG: Badge qualificati finali
      setAttestationBadges(qualifiedBadges); // Imposta solo i badge qualificati
    } catch (err) {
      console.error("Error fetching certifications or qualifying badges:", err);
      throw err;
    }
  }, [getAuthHeaders, STRAPI_BASE_URL, CERTIFICATIONS_API_ENDPOINT, ALL_BADGES_API_ENDPOINT, extractDataFromStrapiResponse, fetchAllBadgeDefinitions]);

  useEffect(() => {
    const initDataFetch = async () => {
      console.log("useEffect: Initial data fetch started."); // LOG: Inizio useEffect
      setIsLoading(true);
      setError(null);

      const userString = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
      let userId = null;
      if (userString) {
        try {
          const userData = JSON.parse(userString);
          userId = userData.id;
          console.log("User ID from localStorage:", userId); // LOG: User ID da localStorage
        } catch (parseError) {
          console.error("Error parsing user data from localStorage:", parseError);
          setError("Error fetching user data.");
          setIsLoading(false);
          return;
        }
      }

      if (!userId) {
        console.warn("User ID not available. User might not be logged in or data is corrupted.");
        setProfiloCandidatoId(null);
        setAttestationBadges([]);
        setIsLoading(false);
        return;
      }

      let fetchedProfiloId = null;
      try {
        fetchedProfiloId = await fetchProfiloCandidatoId(userId);
        setProfiloCandidatoId(fetchedProfiloId);
        console.log("Profilo Candidato ID set to:", fetchedProfiloId); // LOG: Profilo ID settato
      } catch (err) {
        setError(err.message);
        setProfiloCandidatoId(null);
        setIsLoading(false);
        return;
      }

      if (fetchedProfiloId) {
        try {
          // Chiamata alla funzione che recupera le certificazioni e qualifica i badge
          await fetchCertificationsAndQualifyBadges(fetchedProfiloId); 
        } catch (err) {
          setError(err.message);
          setAttestationBadges([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("No fetchedProfiloId, setting badges to empty and stopping loading."); // LOG: Nessun profilo, reset badge
        setAttestationBadges([]);
        setIsLoading(false);
      }
    };

    initDataFetch();
  }, [fetchProfiloCandidatoId, fetchCertificationsAndQualifyBadges]); // Dipendenze aggiornate

  if (isLoading && !attestationBadges.length && !error) {
    return (
      <div className={styles.careerGoals}> {/* Riutilizziamo lo stile careerGoals per il layout generale */}
        <div className={styles.loadingMessage}>
          Caricamento badge...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.careerGoals}>
        <div className={styles.errorMessage}>
          <i className="fas fa-exclamation-circle"></i> {error}
          <button onClick={() => {
            setError(null);
            const userString = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
            let userId = null;
            if (userString) {
              try {
                const userData = JSON.parse(userString);
                userId = userData.id;
              } catch (parseError) {
                console.error("Error parsing user data from localStorage:", parseError);
                setError("Error fetching user data.");
                setIsLoading(false);
                return;
              }
            }
            if (userId) {
                fetchProfiloCandidatoId(userId).then(id => {
                    setProfiloCandidatoId(id);
                    if (id) {
                        // Chiamata alla funzione che recupera le certificazioni e qualifica i badge
                        fetchCertificationsAndQualifyBadges(id); 
                    } else {
                        setIsLoading(false);
                        setAttestationBadges([]);
                    }
                });
            } else {
                setIsLoading(false);
                setAttestationBadges([]);
            }
          }}>Riprova</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.careerGoals}> {/* Riutilizziamo lo stile careerGoals per il layout generale */}
      <h2 className={styles.sectionTitle}>
        <i className="fas fa-award"></i> I Miei Badge di Attestazione
      </h2>

      <div className={styles.badgeGrid}> {/* Nuova griglia per i badge */}
        {attestationBadges.length > 0 ? (
          attestationBadges.map((badge) => (
            <div key={badge.id} className={styles.attestationBadgeCard} style={{ '--badge-color': badge.color }}> 
              {console.log(`Rendering badge ${badge.name}. Image URL:`, badge.imageUrl)} {/* LOG: Image URL during rendering */}
              {badge.imageUrl ? ( // Se c'è un imageUrl, usa l'immagine
                <div className={styles.attestationBadgeImageContainer}> {/* Contenitore per l'immagine */}
                  <img 
                    src={badge.imageUrl} 
                    alt={badge.name} 
                    className={styles.attestationBadgeImage} 
                    onError={(e) => { 
                      e.target.onerror = null; 
                      const fallbackText = badge.name ? badge.name.charAt(0).toUpperCase() : 'B';
                      e.target.src=`https://placehold.co/65x65/CCCCCC/000000?text=${fallbackText}`; // Fallback con iniziale
                      console.error(`Error loading image for badge "${badge.name}" from URL: ${badge.imageUrl}. Falling back to placeholder.`, e); // LOG: Image loading error
                    }}
                  />
                </div>
              ) : ( // Altrimenti, usa l'icona FontAwesome
                <div className={styles.attestationBadgeIcon}>
                  <i className={badge.icon}></i>
                </div>
              )}
              <h4>{badge.name}</h4>
              <p>{badge.description}</p>
            </div>
          ))
        ) : (
          <p className={styles.noGoalsMessage}>Nessun badge di attestazione disponibile al momento. Completa più certificazioni per sbloccare nuovi badge!</p>
        )}
      </div>
    </div>
  );
}
