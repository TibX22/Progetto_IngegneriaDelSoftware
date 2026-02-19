'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './CandidateDashboard.module.css';
import { useRouter } from 'next/navigation';

export default function CareerGoals() {
  const [careerGoalsData, setCareerGoalsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Gestito centralmente nel useEffect
  const [error, setError] = useState(null); // Gestito centralmente nel useEffect
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    ruoloDesiderato: '',
    sedeDesiderata: '',
    salarioDesiderato: '',
    settoreDesiderato: '',
  });
  const [profiloCandidatoId, setProfiloCandidatoId] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const CAREER_GOALS_API_ENDPOINT = 'api/obiettivo-carrieras';
  const CANDIDATE_PROFILE_API_ENDPOINT = 'api/profilo-candidatoes';
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    const authToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
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
        console.warn("Struttura elemento Strapi inattesa, impossibile estrarre ID e attributi standard:", strapiItem);
        return strapiItem;
    }

    return {
      id: extractedId, // ID come restituito da Strapi (dovrebbe essere l'UUID)
      documentId: extractedId, // Alias per chiarezza, come da tua richiesta
      ...extractedAttributes, // Gli altri attributi (ruoloDesiderato, ecc.)
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
        throw new Error(`Errore nel recupero del profilo candidato: ${response.statusText} - ${errorBody.error?.message || ''}`);
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
      console.error("Errore durante fetchProfiloCandidatoId:", err);
      throw err;
    }
  }, [getAuthHeaders, STRAPI_BASE_URL, CANDIDATE_PROFILE_API_ENDPOINT, extractDataFromStrapiResponse]);

  const fetchCareerGoals = useCallback(async (candidateProfileId) => {
    if (!candidateProfileId) {
      console.warn("Candidate Profile ID is null, cannot fetch career goals.");
      return [];
    }
    try {
      const url = `${STRAPI_BASE_URL}/${CAREER_GOALS_API_ENDPOINT}?filters[profilo_candidato][id][$eq]=${candidateProfileId}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`Errore nel recupero degli obiettivi di carriera: ${response.statusText} - ${errorBody.error?.message || ''}`);
      }
      const rawResponseData = await response.json();
      const dataToProcess = Array.isArray(rawResponseData) ? rawResponseData : (rawResponseData.data || []);
      
      const updatedGoals = dataToProcess.map(item => extractDataFromStrapiResponse(item));
      setCareerGoalsData(updatedGoals); // <--- Questo è il punto chiave di aggiornamento dello stato
      return updatedGoals; // Restituisce i dati per usi successivi se necessario
    } catch (err) {
      console.error("Errore durante fetchCareerGoals:", err);
      throw err;
    }
  }, [getAuthHeaders, STRAPI_BASE_URL, CAREER_GOALS_API_ENDPOINT, extractDataFromStrapiResponse]);


  useEffect(() => {
    console.count('useEffect initDataFetch execution');

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
          console.error("Errore nel parsing dei dati utente dal localStorage:", parseError);
          setError("Errore nel recupero dei dati utente.");
          setIsLoading(false);
          return;
        }
      }

      if (!userId) {
        console.warn("User ID non disponibile. L'utente potrebbe non essere loggato o i dati sono corrotti.");
        setProfiloCandidatoId(null);
        setCareerGoalsData([]);
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
          // fetchCareerGoals ora aggiorna direttamente lo stato, non è necessario assegnare il ritorno qui.
          await fetchCareerGoals(fetchedProfiloId); 
        } catch (err) {
          setError(err.message);
          setCareerGoalsData([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCareerGoalsData([]);
        setIsLoading(false);
      }
    };

    initDataFetch();
  }, [fetchProfiloCandidatoId, fetchCareerGoals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateGoal = async (e) => {
    e.preventDefault();
    if (!profiloCandidatoId) {
      setError("Impossibile salvare l'obiettivo: ID profilo candidato non disponibile.");
      console.error("Profilo Candidato ID non disponibile per salvare l'obiettivo.");
      return;
    }

    const requestBody = {
      data: {
        ...newGoal,
        profilo_candidato: profiloCandidatoId,
      }
    };

    try {
      const method = editingGoal ? 'PUT' : 'POST';
      const targetGoalIdentifier = editingGoal ? (editingGoal.documentId || editingGoal.id) : null;
      const url = editingGoal
        ? `${STRAPI_BASE_URL}/${CAREER_GOALS_API_ENDPOINT}/${targetGoalIdentifier}`
        : `${STRAPI_BASE_URL}/${CAREER_GOALS_API_ENDPOINT}`;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: "No error body" }));
        console.error("Risposta errore API:", response.status, errorBody);
        throw new Error(`Errore nel salvataggio dell'obiettivo: ${errorBody.error?.message || response.statusText}`);
      }

      // Dopo un'operazione di successo, re-fetch dei dati per aggiornare l'UI
      await fetchCareerGoals(profiloCandidatoId); 
      
      // Resetta lo stato del form e chiudi il modale
      setShowGoalModal(false);
      setEditingGoal(null);
      setNewGoal({
        ruoloDesiderato: '',
        sedeDesiderata: '',
        salarioDesiderato: '',
        settoreDesiderato: '',
      });
      setError(null); // Resetta l'errore in caso di successo
      setIsLoading(false); // Assicurati che isLoading sia false
    } catch (err) {
      console.error("Errore nel salvataggio dell'obiettivo:", err);
      setError(`Errore: ${err.message}`);
      setIsLoading(false); // Assicurati che isLoading sia false anche in caso di errore
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      ruoloDesiderato: goal.ruoloDesiderato || '',
      sedeDesiderata: goal.sedeDesiderata || '',
      salarioDesiderato: goal.salarioDesiderato || '',
      settoreDesiderato: goal.settoreDesiderato || '',
    });
    setShowGoalModal(true);
    setError(null);
  };

  const handleDelete = async (goalToDelete) => { // Riceve l'oggetto completo goal
    if (!window.confirm("Sei sicuro di voler eliminare questo obiettivo?")) {
      return;
    }
    try {
      // Usa documentId o id dall'oggetto passato
      const targetGoalIdentifier = goalToDelete.documentId || goalToDelete.id;
      const url = `${STRAPI_BASE_URL}/${CAREER_GOALS_API_ENDPOINT}/${targetGoalIdentifier}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: "No error body" }));
        throw new Error(`Errore nell'eliminazione dell'obiettivo: ${response.statusText} - ${errorBody.error?.message || ''}`);
      }

      // Re-fetch dei dati dopo l'eliminazione riuscita
      await fetchCareerGoals(profiloCandidatoId);
      setError(null);
    } catch (err) {
      console.error("Errore durante l'eliminazione dell'obiettivo:", err);
      setError("Impossibile eliminare l'obiettivo.");
    }
  };

  if (isLoading && !careerGoalsData.length && !error) {
    return (
      <div className={styles.careerGoals}>
        <div className={styles.loadingMessage}>
          Caricamento obiettivi di carriera...
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
            // Forza un nuovo tentativo di caricamento dati
            const userString = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
            let userId = null;
            if (userString) {
              try {
                const userData = JSON.parse(userString);
                userId = userData.id;
              } catch (parseError) {
                console.error("Errore nel parsing dei dati utente dal localStorage:", parseError);
                setError("Errore nel recupero dei dati utente.");
                setIsLoading(false);
                return;
              }
            }
            if (userId) {
                fetchProfiloCandidatoId(userId).then(id => {
                    setProfiloCandidatoId(id);
                    if (id) {
                        fetchCareerGoals(id);
                    } else {
                        setIsLoading(false);
                        setCareerGoalsData([]);
                    }
                });
            } else {
                setIsLoading(false);
                setCareerGoalsData([]);
            }
          }}>Riprova</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.careerGoals}>
      <h2 className={styles.sectionTitle}>
        <i className="fas fa-bullseye "></i> I tuoi Obiettivi di Carriera
      </h2>

      <div className={styles.careerGoalsList}>
        {careerGoalsData.length > 0 ? (
          careerGoalsData.map((goal) => (
            // Usa goal.id (che ora dovrebbe essere l'UUID) come key
            <div key={goal.id} className={styles.goalItem}>
              <h3>{goal.ruoloDesiderato}</h3>
              <p>Sede desiderata: {goal.sedeDesiderata}</p>
              <p>Salario desiderato: {goal.salarioDesiderato}€</p>
              <p>Settore desiderato: {goal.settoreDesiderato}</p>
              <div className={styles.goalActions}>
                <button onClick={() => handleEdit(goal)} className={styles.editBtn}>
                  <i className="fas fa-edit"></i> Modifica
                </button>
                <button onClick={() => handleDelete(goal)} className={styles.deleteBtn}> {/* Passa l'intero oggetto goal */}
                  <i className="fas fa-trash-alt"></i> Elimina
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noGoalsMessage}>Nessun obiettivo di carriera impostato. Aggiungine uno!</p>
        )}
      </div>

      <button onClick={() => {
        setShowGoalModal(true);
        setEditingGoal(null);
        setNewGoal({
          ruoloDesiderato: '',
          sedeDesiderata: '',
          salarioDesiderato: '',
          settoreDesiderato: '',
        });
        setError(null);
      }} className={styles.addGoalBtn}>
        <i className="fas fa-plus-circle "></i> Aggiungi Nuovo Obiettivo
      </button>

      {showGoalModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>{editingGoal ? 'Modifica Obiettivo di Carriera' : 'Aggiungi Nuovo Obiettivo di Carriera'}</h3>
            <form onSubmit={handleAddOrUpdateGoal}>
              <label htmlFor="ruoloDesiderato">Ruolo Desiderato:</label>
              <input
                type="text"
                id="ruoloDesiderato"
                name="ruoloDesiderato"
                value={newGoal.ruoloDesiderato}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="sedeDesiderata">Sede Desiderata:</label>
              <input
                type="text"
                id="sedeDesiderata"
                name="sedeDesiderata"
                value={newGoal.sedeDesiderata}
                onChange={handleInputChange}
              />

              <label htmlFor="salarioDesiderato">Salario Desiderato (es. 50000):</label>
              <input
                type="text"
                id="salarioDesiderato"
                name="salarioDesiderato"
                value={newGoal.salarioDesiderato}
                onChange={handleInputChange}
              />

              <label htmlFor="settoreDesiderato">Settore Desiderato:</label>
              <input
                type="text"
                id="settoreDesiderato"
                name="settoreDesiderato"
                value={newGoal.settoreDesiderato}
                onChange={handleInputChange}
              />

              <div className={styles.modalActions}>
                <button type="submit" className={styles.actionBtn}>{editingGoal ? 'Salva Modifiche' : 'Salva Obiettivo'}</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGoalModal(false);
                    setEditingGoal(null);
                    setNewGoal({
                      ruoloDesiderato: '',
                      sedeDesiderata: '',
                      salarioDesiderato: '',
                      settoreDesiderato: '',
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