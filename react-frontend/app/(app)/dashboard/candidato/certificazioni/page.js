// src/app/dashboard/candidato/certificazioni/page.js (Rinominate da badge/page.js)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from '@/components/CandidateDashboard/CandidateDashboard.module.css';
import { useRouter } from 'next/navigation';

export default function CertificazioniPage() { // Rinominato a CertificazioniPage
  const [certificationsData, setCertificationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCert, setNewCert] = useState({
    nome: '',
    enteRilascio: '',
    dataRilascio: '',
    dataScadenza: '',
  });
  const [profiloCandidatoId, setProfiloCandidatoId] = useState(null);
  const [editingCert, setEditingCert] = useState(null);

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const CERTIFICATIONS_API_ENDPOINT = 'api/certificaziones';
  const CANDIDATE_PROFILE_API_ENDPOINT = 'api/profilo-candidatoes';
  const router = useRouter();

  // Funzione helper per ottenere gli headers con autorizzazione
  const getAuthHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    const authToken = typeof window !== 'undefined' ? localStorage.getItem("jwt") : null;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }, []);

  // Funzione helper per estrarre ID e attributi correttamente da una risposta Strapi v5
  const extractDataFromStrapiResponse = useCallback((strapiItem) => {
    if (!strapiItem) return null;
    
    let extractedId = null;
    let extractedAttributes = {};

    // Standard Strapi v5 response: { id: "UUID", attributes: { ... } }
    if (typeof strapiItem.id !== 'undefined' && typeof strapiItem.attributes === 'object') {
      extractedId = strapiItem.id;
      extractedAttributes = strapiItem.attributes;
    }
    // Case when 'data' wrapper is present: { data: { id: "UUID", attributes: { ... } } }
    else if (strapiItem.data && typeof strapiItem.data.id !== 'undefined' && typeof strapiItem.data.attributes === 'object') {
      extractedId = strapiItem.data.id;
      extractedAttributes = strapiItem.data.attributes;
    }
    // Fallback for flat structures (less common for API list responses)
    else if (typeof strapiItem.id !== 'undefined') {
        extractedId = strapiItem.id;
        extractedAttributes = { ...strapiItem };
        delete extractedAttributes.id;
    } else {
        console.warn("Unexpected Strapi item structure, unable to extract standard ID and attributes:", strapiItem);
        return strapiItem;
    }

    return {
      id: extractedId, // ID as returned by Strapi (should be UUID)
      documentId: extractedId, // Alias for clarity
      ...extractedAttributes, // Other attributes (nome, enteRilascio, etc.)
    };
  }, []);

  const fetchProfiloCandidatoId = useCallback(async (userId) => {
    if (!userId) {
      console.warn("User ID is null, cannot fetch candidate profile.");
      return null;
    }
    try {
      const url = `${STRAPI_BASE_URL}/${CANDIDATE_PROFILE_API_ENDPOINT}?filters[candidato][user][id][$eq]=${userId}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Error fetching candidate profile: ${response.statusText} - ${errorBody.error?.message || ''}`);
      }
      const rawData = await response.json();
      const dataToProcess = Array.isArray(rawData) ? rawData : (rawData.data || []);

      if (dataToProcess.length > 0) {
        const firstProfile = extractDataFromStrapiResponse(dataToProcess[0]);
        if (firstProfile && firstProfile.id) {
          return firstProfile.id;
        }
      }
      return null;
    } catch (err) {
      console.error("Error during fetchProfiloCandidatoId:", err);
      throw err;
    }
  }, [getAuthHeaders, STRAPI_BASE_URL, CANDIDATE_PROFILE_API_ENDPOINT, extractDataFromStrapiResponse]);

  const fetchCertifications = useCallback(async (candidateProfileId) => {
    if (!candidateProfileId) {
      console.warn("Candidate Profile ID is null, cannot fetch certifications.");
      return [];
    }
    try {
      const url = `${STRAPI_BASE_URL}/${CERTIFICATIONS_API_ENDPOINT}?filters[profilo_candidato][id][$eq]=${candidateProfileId}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Error fetching certifications: ${response.statusText} - ${errorBody.error?.message || ''}`);
      }
      const rawResponseData = await response.json();
      const dataToProcess = Array.isArray(rawResponseData) ? rawResponseData : (rawResponseData.data || []);
      
      const updatedCerts = dataToProcess.map(item => extractDataFromStrapiResponse(item));
      setCertificationsData(updatedCerts);
      return updatedCerts;
    } catch (err) {
      console.error("Error during fetchCertifications:", err);
      throw err;
    }
  }, [getAuthHeaders, STRAPI_BASE_URL, CERTIFICATIONS_API_ENDPOINT, extractDataFromStrapiResponse]);

  useEffect(() => {
    const initDataFetch = async () => {
      setIsLoading(true);
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

      if (!userId) {
        console.warn("User ID not available. User might not be logged in or data is corrupted.");
        setProfiloCandidatoId(null);
        setCertificationsData([]);
        setIsLoading(false);
        return;
      }

      let fetchedProfiloId = null;
      try {
        fetchedProfiloId = await fetchProfiloCandidatoId(userId);
        setProfiloCandidatoId(fetchedProfiloId);
      } catch (err) {
        setError(err.message);
        setProfiloCandidatoId(null);
        setIsLoading(false);
        return;
      }

      if (fetchedProfiloId) {
        try {
          await fetchCertifications(fetchedProfiloId); 
        } catch (err) {
          setError(err.message);
          setCertificationsData([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCertificationsData([]);
        setIsLoading(false);
      }
    };

    initDataFetch();
  }, [fetchProfiloCandidatoId, fetchCertifications]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCert((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateCert = async (e) => {
    e.preventDefault();
    if (!profiloCandidatoId) {
      setError("Cannot save certification: Candidate profile ID not available.");
      console.error("Candidate Profile ID not available to save certification.");
      return;
    }

    const requestBody = {
      data: {
        ...newCert,
        profilo_candidato: profiloCandidatoId,
      }
    };

    try {
      const method = editingCert ? 'PUT' : 'POST';
      const targetCertIdentifier = editingCert ? (editingCert.documentId || editingCert.id) : null;
      const url = editingCert
        ? `${STRAPI_BASE_URL}/${CERTIFICATIONS_API_ENDPOINT}/${targetCertIdentifier}`
        : `${STRAPI_BASE_URL}/${CERTIFICATIONS_API_ENDPOINT}`;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: "No error body" }));
        console.error("API error response:", response.status, errorBody);
        throw new Error(`Error saving certification: ${errorBody.error?.message || response.statusText}`);
      }

      await fetchCertifications(profiloCandidatoId); 
      
      setShowCertModal(false);
      setEditingCert(null);
      setNewCert({
        nome: '',
        enteRilascio: '',
        dataRilascio: '',
        dataScadenza: '',
      });
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error("Error saving certification:", err);
      setError(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleEdit = (cert) => {
    setEditingCert(cert);
    setNewCert({
      nome: cert.nome || '',
      enteRilascio: cert.enteRilascio || '',
      dataRilascio: cert.dataRilascio || '',
      dataScadenza: cert.dataScadenza || '',
    });
    setShowCertModal(true);
    setError(null);
  };

  const handleDelete = async (certToDelete) => {
    // Non usare window.confirm, ma un modale personalizzato per la conferma
    const confirmDelete = true; // Dovresti sostituire questo con un modale UI
    if (!confirmDelete) {
      return;
    }
    try {
      const targetCertIdentifier = certToDelete.documentId || certToDelete.id;
      const url = `${STRAPI_BASE_URL}/${CERTIFICATIONS_API_ENDPOINT}/${targetCertIdentifier}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: "No error body" }));
        throw new Error(`Error deleting certification: ${response.statusText} - ${errorBody.error?.message || ''}`);
      }

      await fetchCertifications(profiloCandidatoId);
      setError(null);
    } catch (err) {
      console.error("Error deleting certification:", err);
      setError("Unable to delete certification.");
    }
  };

  if (isLoading && !certificationsData.length && !error) {
    return (
      <div className={styles.careerGoals}> {/* Riutilizziamo lo stile careerGoals per il layout generale */}
        <div className={styles.loadingMessage}>
          Caricamento certificazioni...
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
                        fetchCertifications(id);
                    } else {
                        setIsLoading(false);
                        setCertificationsData([]);
                    }
                });
            } else {
                setIsLoading(false);
                setCertificationsData([]);
            }
          }}>Riprova</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.careerGoals}> {/* Riutilizziamo lo stile careerGoals per il layout generale */}
      <h2 className={styles.sectionTitle}>
        <i className="fas fa-file-signature"></i> Le mie Certificazioni
      </h2>

      <div className={styles.careerGoalsList}> {/* Riutilizziamo careerGoalsList per la visualizzazione */}
        {certificationsData.length > 0 ? (
          certificationsData.map((cert) => (
            // Classe per la visualizzazione delle certificazioni
            <div key={cert.id} className={styles.certificationItem}> 
              <div className={styles.certificationItemHeader}>
                <i className="fas fa-certificate"></i> {/* Icona per la singola certificazione */}
                <h3>{cert.nome}</h3>
              </div>
              <p>Ente di rilascio: {cert.enteRilascio}</p>
              <p>Data di rilascio: {cert.dataRilascio}</p>
              {cert.dataScadenza && <p>Data di scadenza: {cert.dataScadenza}</p>}
              <div className={styles.goalActions}> {/* Riutilizziamo goalActions per i bottoni */}
                <button onClick={() => handleEdit(cert)} className={styles.editBtn}>
                  <i className="fas fa-edit"></i> Modifica
                </button>
                <button onClick={() => handleDelete(cert)} className={styles.deleteBtn}>
                  <i className="fas fa-trash-alt"></i> Elimina
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noGoalsMessage}>Nessuna certificazione impostata. Aggiungine una!</p>
        )}
      </div>

      <button onClick={() => {
        setShowCertModal(true);
        setEditingCert(null);
        setNewCert({
          nome: '',
          enteRilascio: '',
          dataRilascio: '',
          dataScadenza: '',
        });
        setError(null);
      }} className={styles.addGoalBtn}> {/* Riutilizziamo addGoalBtn */}
        <i className="fas fa-plus-circle"></i> Aggiungi Nuova Certificazione
      </button>

      {showCertModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>{editingCert ? 'Modifica Certificazione' : 'Aggiungi Nuova Certificazione'}</h3>
            <form onSubmit={handleAddOrUpdateCert}>
              <label htmlFor="nome">Nome Certificazione:</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={newCert.nome}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="enteRilascio">Ente di Rilascio:</label>
              <input
                type="text"
                id="enteRilascio"
                name="enteRilascio"
                value={newCert.enteRilascio}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="dataRilascio">Data di Rilascio:</label>
              <input
                type="date"
                id="dataRilascio"
                name="dataRilascio"
                value={newCert.dataRilascio}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="dataScadenza">Data di Scadenza (Opzionale):</label>
              <input
                type="date"
                id="dataScadenza"
                name="dataScadenza"
                value={newCert.dataScadenza}
                onChange={handleInputChange}
              />

              <div className={styles.modalActions}>
                <button type="submit" className={styles.actionBtn}>{editingCert ? 'Salva Modifiche' : 'Salva Certificazione'}</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCertModal(false);
                    setEditingCert(null);
                    setNewCert({
                      nome: '',
                      enteRilascio: '',
                      dataRilascio: '',
                      dataScadenza: '',
                    });
                    setError(null);
                  }}
                  className={`${styles.actionBtn} ${styles.cancel}`}
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
