// components/CandidateDashboard/UserProfile.js
'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Correzione: cambiato '=>' in 'from'
import styles from './CandidateDashboard.module.css';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
    const [candidateData, setCandidateData] = useState(null); // Dati del profilo del candidato (come recuperati da Strapi)
    const [isLoading, setIsLoading] = useState(true); // Stato di caricamento
    const [error, setError] = useState(null); // Stato di errore

    // Stato per il modale di aggiunta/modifica profilo
    const [showProfileModal, setShowProfileModal] = useState(false);
    // Dati del nuovo profilo o del profilo da modificare (per il form nel modale)
    const [newProfileData, setNewProfileData] = useState({
        nome: '',
        cognome: '',
        indirizzo: '',
        telefono: '',
        preferenzaValoriCulturali: '',
        preferenzaStileLeadeship: '',
        importanzaSostenibilita: false,
        importanzaCrescitaPersonale: false,
    });
    const [isEditing, setIsEditing] = useState(false); // true se si sta modificando un profilo esistente
    const [authenticatedUserId, setAuthenticatedUserId] = useState(null); // ID dell'utente loggato (dal plugin users-permissions)
    const [customCandidatoId, setCustomCandidatoId] = useState(null); // ID del tuo Content Type Candidato personalizzato
    const [userEmail, setUserEmail] = useState(''); // Email dell'utente loggato, recuperata separatamente

    const STRAPI_BASE_URL = 'http://localhost:1337';
    const CANDIDATE_PROFILE_API_ENDPOINT = 'api/profilo-candidatoes'; // Endpoint per ProfiloCandidato
    const CUSTOM_CANDIDATO_API_ENDPOINT = 'api/candidatoes'; // Endpoint per il tuo Content Type Candidato
    const router = useRouter();

    // Funzione helper per ottenere gli headers con autorizzazione
    const getAuthHeaders = useCallback(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("jwt") : null;
        if (!token) {
            console.error("ATTENZIONE: Token JWT non trovato nel localStorage con la chiave 'jwt'. Le richieste API potrebbero fallire.");
            return { 'Content-Type': 'application/json' };
        }
        console.log("Token JWT recuperato (primi 10 caratteri):", token.substring(0, 10) + '...');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }, []);

    // Funzione per recuperare il profilo del candidato esistente
    const fetchCandidateProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setCandidateData(null); // Resetta i dati del candidato all'inizio del fetch
        setIsEditing(false); // Resetta la modalità di modifica

        console.log("Inizio fetchCandidateProfile...");
        const userString = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
        let currentAuthenticatedUserId = null;
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                currentAuthenticatedUserId = userData.id;
                setUserEmail(userData.email || '');
                setAuthenticatedUserId(currentAuthenticatedUserId);
                console.log("Dati utente dal localStorage (parsi):", userData);
                console.log("Authenticated User ID (from users-permissions plugin) recuperato:", currentAuthenticatedUserId);
            } catch (parseError) {
                console.error("Errore nel parsing dei dati utente dal localStorage:", parseError);
                setError("Errore nel recupero dei dati utente dal localStorage.");
                setIsLoading(false);
                return;
            }
        } else {
            console.log("Nessun dato 'user' trovato nel localStorage.");
        }

        if (!currentAuthenticatedUserId) {
            setError("Utente non autenticato o ID non disponibile. Impossibile recuperare il profilo.");
            setIsLoading(false);
            console.log("Authenticated User ID non disponibile. Interruzione fetch.");
            return;
        }

        try {
            const headers = getAuthHeaders();

            // PASSO 1: Trova l'ID del Candidato personalizzato collegato all'utente loggato
            const candidatoApiUrl = `${STRAPI_BASE_URL}/${CUSTOM_CANDIDATO_API_ENDPOINT}?filters[user][id][$eq]=${currentAuthenticatedUserId}`;
            console.log("URL per recupero Candidato personalizzato:", candidatoApiUrl);
            const candidatoResponse = await fetch(candidatoApiUrl, { headers });

            if (!candidatoResponse.ok) {
                console.error("Errore nel recupero del Candidato personalizzato (status):", candidatoResponse.status);
                const errorData = await candidatoResponse.json();
                throw new Error(`Impossibile trovare il record Candidato associato: ${errorData.error?.message || 'Errore sconosciuto'}`);
            }

            const candidatoData = await candidatoResponse.json();
            console.log("Risposta API Candidato personalizzato:", candidatoData);

            if (candidatoData.data && candidatoData.data.length > 0) {
                const foundCustomCandidatoId = candidatoData.data[0].id;
                setCustomCandidatoId(foundCustomCandidatoId);
                console.log("ID Candidato personalizzato recuperato:", foundCustomCandidatoId);

                // PASSO 2: Una volta ottenuto l'ID del Candidato personalizzato, recupera il ProfiloCandidato
                const profiloApiUrl = `${STRAPI_BASE_URL}/${CANDIDATE_PROFILE_API_ENDPOINT}?filters[candidato][id][$eq]=${foundCustomCandidatoId}&populate=*`;
                console.log("URL per recupero profilo candidato:", profiloApiUrl);
                const profiloResponse = await fetch(profiloApiUrl, { headers });

                if (!profiloResponse.ok) {
                    // Gestisci 404 o altri errori HTTP diversi da successi vuoti
                    if (profiloResponse.status === 404 || profiloResponse.status === 400 || profiloResponse.status === 500) { // Aggiunto 400, 500 per maggiore robustezza
                        console.log("Nessun profilo candidato trovato per questo Candidato personalizzato o errore server.");
                        setCandidateData(null);
                        setIsEditing(false); // Modalità creazione
                    } else {
                        const errorData = await profiloResponse.json();
                        console.error("Errore HTTP durante il recupero del profilo candidato:", profiloResponse.status, errorData);
                        throw new Error(`Errore HTTP! Stato: ${profiloResponse.status}, Messaggio: ${errorData.error?.message || 'Errore sconosciuto'}`);
                    }
                } else {
                    const responseData = await profiloResponse.json();
                    console.log("Risposta API recupero profilo (successo):", responseData);
                    if (responseData.data && responseData.data.length > 0) {
                        console.log("Raw data item:", responseData.data[0]); // LOG AGGIUNTIVO PER DEBUG
                        // Accesso diretto ai dati del profilo
                        const profile = responseData.data[0]; 
                        const strapiId = responseData.data[0].id; // ID del documento ProfiloCandidato

                        setCandidateData({ ...profile, strapiId }); // Salva attributi e ID documento
                        setIsEditing(true);
                        console.log("Profilo esistente caricato (con strapiId):", { ...profile, strapiId });

                        // Pre-popola il form con i dati del profilo esistente
                        setNewProfileData({
                            nome: profile.nome || '',
                            cognome: profile.cognome || '',
                            indirizzo: profile.indirizzo || '',
                            telefono: profile.telefono || '',
                            preferenzaValoriCulturali: profile.preferenzaValoriCulturali || '',
                            preferenzaStileLeadeship: profile.preferenzaStileLeadeship || '',
                            importanzaSostenibilita: profile.importanzaSostenibilita || false,
                            importanzaCrescitaPersonale: profile.importanzaCrescitaPersonale || false,
                        });
                        // console.log("newProfileData pre-popolato:", newProfileData); // Questo log potrebbe mostrare lo stato precedente a causa della natura asincrona
                    } else {
                        console.log("Nessun profilo candidato trovato per questo Candidato personalizzato.");
                        setCandidateData(null);
                        setIsEditing(false); // Modalità creazione
                    }
                }
            } else {
                // Nessun Candidato personalizzato trovato per l'utente loggato
                console.log("Nessun record Candidato personalizzato trovato per l'utente con ID:", currentAuthenticatedUserId);
                setError("Nessun profilo candidato associato. Assicurati che il tuo record Candidato sia stato creato nel backend.");
                setCandidateData(null);
                setIsEditing(false);
                setCustomCandidatoId(null); // Assicurati che sia null se non trovato
            }
        } catch (err) {
            console.error("Errore catch nel recupero del profilo candidato:", err);
            setError(`Errore: ${err.message}`);
            setCandidateData(null);
            setIsEditing(false);
            setCustomCandidatoId(null); // In caso di errore, resetta
        } finally {
            setIsLoading(false);
            console.log("Fine fetchCandidateProfile.");
        }
    }, [getAuthHeaders]); // Rimosso newProfileData dalle dipendenze

    useEffect(() => {
        fetchCandidateProfile();
    }, [fetchCandidateProfile]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log(`Input changed: ${name}, Value: ${type === 'checkbox' ? checked : value}`);
        setNewProfileData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        console.log("--- Inizio handleProfileSubmit ---");
        console.log("Authenticated User ID (from users-permissions plugin) al submit:", authenticatedUserId);
        console.log("Custom Candidato ID al submit (quello che useremo):", customCandidatoId);
        console.log("isEditing al submit:", isEditing);
        console.log("candidateData al submit:", candidateData);
        console.log("candidateData.strapiId al submit:", candidateData?.strapiId);
        console.log("candidateData.documentId al submit (se disponibile):", candidateData?.documentId);


        // Assicurati che customCandidatoId esista prima di procedere
        if (!customCandidatoId) {
            setError("ID Candidato personalizzato non disponibile. Si prega di effettuare il login e assicurarsi che un record Candidato sia associato.");
            setIsLoading(false);
            console.log("Custom Candidato ID non disponibile. Interruzione submit.");
            return;
        }

        const headers = getAuthHeaders();
        let url = '';
        let method = '';

        const dataToSend = { ...newProfileData };
        // Assicurati che le enumerazioni siano null o stringa vuota se non selezionate
        if (dataToSend.preferenzaValoriCulturali === '') dataToSend.preferenzaValoriCulturali = null;
        if (dataToSend.preferenzaStileLeadeship === '') dataToSend.preferenzaStileLeadeship = null;

        let payload = {
            data: {
                ...dataToSend,
                candidato: customCandidatoId, // Ora usiamo l'ID del tuo Content Type Candidato personalizzato
            }
        };

        if (isEditing && candidateData) {
            // Modifica qui per usare documentId se disponibile, altrimenti fallback a strapiId
            const profileIdentifier = candidateData.documentId || candidateData.strapiId;
            if (!profileIdentifier) {
                setError("ID del profilo per la modifica non disponibile.");
                setIsLoading(false);
                return;
            }
            url = `${STRAPI_BASE_URL}/${CANDIDATE_PROFILE_API_ENDPOINT}/${profileIdentifier}`; // ID del ProfiloCandidato (documentId o strapiId)
            method = 'PUT';
            console.log(`Modalità: Modifica Profilo. URL: ${url}, Metodo: ${method}, Identificatore usato: ${profileIdentifier}`);
        } else {
            url = `${STRAPI_BASE_URL}/${CANDIDATE_PROFILE_API_ENDPOINT}`;
            method = 'POST';
            console.log(`Modalità: Creazione Profilo. URL: ${url}, Metodo: ${method}`);
        }
        
        console.log("Payload inviato a Strapi:", payload);

        try {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(payload),
            });

            console.log("Risposta raw dal server:", response);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "No error body" }));
                console.error("Errore API al salvataggio del profilo:", response.status, errorData);
                throw new Error(`Impossibile salvare il profilo: ${errorData.error?.message || response.statusText}`);
            }

            const result = await response.json();
            console.log("Profilo salvato con successo:", result);
            setShowProfileModal(false);
            fetchCandidateProfile(); // Ricarica i dati del profilo per aggiornare l'UI
        } catch (err) {
            console.error("Errore durante il salvataggio del profilo (catch block):", err);
            setError(`Errore: ${err.message}`);
        } finally {
            setIsLoading(false);
            console.log("--- Fine handleProfileSubmit ---");
        }
    };

    const handleOpenModal = () => {
        console.log("Apertura modale. isEditing:", isEditing);
        console.log("customCandidatoId al momento dell'apertura modale:", customCandidatoId);
        
        // Se non abbiamo un customCandidatoId, non possiamo creare/modificare il profilo ProfiloCandidato
        if (!customCandidatoId) {
            setError("ID Candidato personalizzato non disponibile. Impossibile aprire il modulo di modifica/creazione profilo. Assicurati che l'utente sia collegato a un record Candidato nel backend di Strapi.");
            return; // Non aprire il modale
        }

        if (!candidateData) {
            console.log("Resetting newProfileData per la creazione di un nuovo profilo.");
            setNewProfileData({
                nome: '',
                cognome: '',
                indirizzo: '',
                telefono: '',
                preferenzaValoriCulturali: '',
                preferenzaStileLeadeship: '',
                importanzaSostenibilita: false,
                importanzaCrescitaPersonale: false,
            });
            setIsEditing(false);
        } else {
            console.log("Pre-popolamento newProfileData per la modifica del profilo esistente:", candidateData);
            setNewProfileData({
                nome: candidateData.nome || '',
                cognome: candidateData.cognome || '',
                indirizzo: candidateData.indirizzo || '',
                telefono: candidateData.telefono || '',
                preferenzaValoriCulturali: candidateData.preferenzaValoriCulturali || '',
                preferenzaStileLeadeship: candidateData.preferenzaStileLeadeship || '',
                importanzaSostenibilita: candidateData.importanzaSostenibilita || false,
                importanzaCrescitaPersonale: candidateData.importanzaCrescitaPersonale || false,
            });
            setIsEditing(true);
        }
        setError(null); // Resetta eventuali errori precedenti prima di aprire il modale
        setShowProfileModal(true);
    };


    if (isLoading && !candidateData && !error) {
        return (
            <div className={styles.userProfile}>
                <div className={styles.loadingMessage}>Caricamento profilo...</div>
            </div>
        );
    }

    // Visualizza l'errore e il pulsante per aggiungere il profilo se customCandidatoId è disponibile
    if (error && !candidateData) {
        return (
            <div className={styles.userProfile}>
                <div className={styles.errorMessage}>
                    <i className="fas fa-exclamation-circle"></i> {error}
                    {/* Mostra il pulsante "Aggiungi Informazioni Profilo" solo se customCandidatoId è disponibile */}
                    {customCandidatoId && ( // Mostra il pulsante solo se abbiamo un ID candidato a cui collegare
                        <>
                            <p>Clicca qui per aggiungere le tue informazioni:</p>
                            <button onClick={handleOpenModal} className={styles.actionBtn}>
                                <i className="fas fa-plus-circle"></i> Aggiungi Informazioni Profilo
                            </button>
                        </>
                    )}
                     {/* Pulsante per riprovare il caricamento in caso di errore generico */}
                     <button onClick={() => fetchCandidateProfile()} className={styles.actionBtn}>
                        <i className="fas fa-redo"></i> Riprova Caricamento Profilo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.userProfile}>
            <h2 className={styles.sectionTitle}>
                <i className="fas fa-user-tie"></i> Il Mio Profilo
            </h2>

            {candidateData ? (
                <>
                    <div className={styles.profileHeader}>
                        <img
                            src={'https://placehold.co/120x120/0F4C75/FFFFFF?text=P'} // Placeholder immagine
                            alt="Immagine Profilo"
                            width={120}
                            height={120}
                            className={styles.profilePicLarge}
                        />
                        <div>
                            <h3>{candidateData.nome} {candidateData.cognome}</h3>
                            <p className={styles.profileContact}><i className="fas fa-phone"></i> {candidateData.telefono || 'Non specificato'}</p>
                            <p className={styles.profileContact}><i className="fas fa-envelope"></i> {userEmail || 'N/A'}</p>
                            <p className={styles.profileContact}><i className="fas fa-map-marker-alt"></i> {candidateData.indirizzo || 'Indirizzo non specificato'}</p>
                        </div>
                    </div>

                    <div className={styles.profileDetails}>
                        <h4>Preferenze e Valori</h4>
                        <p><strong>Valori Culturali Preferiti:</strong> {candidateData.preferenzaValoriCulturali || 'Non specificati'}</p>
                        <p><strong>Stile di Leadership Preferito:</strong> {candidateData.preferenzaStileLeadeship || 'Non specificato'}</p>
                        <p><strong>Importanza Sostenibilità:</strong> {candidateData.importanzaSostenibilita ? 'Sì' : 'No'}</p>
                        <p><strong>Importanza Crescita Personale:</strong> {candidateData.importanzaCrescitaPersonale ? 'Sì' : 'No'}</p>
                    </div>

                    <button onClick={handleOpenModal} className={styles.actionBtn}>
                        <i className="fas fa-edit"></i> Modifica Profilo
                    </button>
                </>
            ) : (
                <div className={styles.noProfileMessage}>
                    <p>Il tuo profilo candidato non è ancora stato completato. Aggiungi le tue informazioni per aumentare le tue possibilità di trovare lavoro!</p>
                    {/* Mostra il pulsante solo se customCandidatoId è disponibile */}
                    {customCandidatoId && (
                        <button onClick={handleOpenModal} className={styles.actionBtn}>
                            <i className="fas fa-plus-circle"></i> Aggiungi Informazioni Profilo
                        </button>
                    )}
                     {!customCandidatoId && (
                        <p className={styles.errorMessage} style={{marginTop: '20px', padding: '10px'}}>
                            <i className="fas fa-exclamation-triangle"></i> Impossibile creare/modificare il profilo: Record Candidato non trovato o non associato al tuo utente.
                        </p>
                    )}
                </div>
            )}

            {/* Modale per Aggiungere/Modificare Profilo */}
            {showProfileModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>{isEditing ? 'Modifica Profilo' : 'Aggiungi Informazioni Profilo'}</h3>
                        {error && <div className={styles.errorMessage}>{error}</div>}
                        {isLoading && <div className={styles.loadingMessage}>Salvataggio in corso...</div>}
                        <form onSubmit={handleProfileSubmit}>
                            <label htmlFor="nome">Nome:</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={newProfileData.nome}
                                onChange={handleInputChange}
                                required
                            />

                            <label htmlFor="cognome">Cognome:</label>
                            <input
                                type="text"
                                id="cognome"
                                name="cognome"
                                value={newProfileData.cognome}
                                onChange={handleInputChange}
                                required
                            />

                            <label htmlFor="indirizzo">Indirizzo:</label>
                            <input
                                type="text"
                                id="indirizzo"
                                name="indirizzo"
                                value={newProfileData.indirizzo}
                                onChange={handleInputChange}
                            />

                            <label htmlFor="telefono">Telefono:</label>
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                value={newProfileData.telefono}
                                onChange={handleInputChange}
                            />

                            <label htmlFor="preferenzaValoriCulturali">Preferenza Valori Culturali:</label>
                            <select
                                id="preferenzaValoriCulturali"
                                name="preferenzaValoriCulturali"
                                value={newProfileData.preferenzaValoriCulturali}
                                onChange={handleInputChange}
                            >
                                <option value="">Seleziona un valore</option>
                                <option value="collaborazione">Collaborazione</option>
                                <option value="innovazione">Innovazione</option>
                                <option value="meritocrazia">Meritocrazia</option>
                            </select>

                            <label htmlFor="preferenzaStileLeadeship">Preferenza Stile di Leadership:</label>
                            <select
                                id="preferenzaStileLeadeship"
                                name="preferenzaStileLeadeship"
                                value={newProfileData.preferenzaStileLeadeship}
                                onChange={handleInputChange}
                            >
                                <option value="">Seleziona uno stile</option>
                                <option value="partecipativo">Partecipativo</option>
                                <option value="gerarchico">Gerarchico</option>
                                <option value="autonomo">Autonomo</option>
                            </select>

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="importanzaSostenibilita"
                                    name="importanzaSostenibilita"
                                    checked={newProfileData.importanzaSostenibilita}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="importanzaSostenibilita">Importanza della Sostenibilità</label>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="importanzaCrescitaPersonale"
                                    name="importanzaCrescitaPersonale"
                                    checked={newProfileData.importanzaCrescitaPersonale}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="importanzaCrescitaPersonale">Importanza della Crescita Personale</label>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="submit" className={styles.actionBtn} disabled={isLoading}>
                                    {isLoading ? 'Salvataggio...' : (isEditing ? 'Salva Modifiche' : 'Crea Profilo')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowProfileModal(false);
                                        setError(null);
                                    }}
                                    className={`${styles.actionBtn} ${styles.cancel}`}
                                    disabled={isLoading}
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