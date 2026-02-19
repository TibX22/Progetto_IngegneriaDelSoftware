// components/CompanyDashboard/MaterialeOnBoardingPage.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function MaterialeOnBoardingPage({ aziendaId, initialParams }) {
  const [materiali, setMateriali] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  // This state will now hold the identifier for the API call (numeric 'id' or string 'documentId')
  const [currentMaterialeIdentifier, setCurrentMaterialeIdentifier] = useState(null);

  // Stati per la gestione del modale di conferma
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); // Funzione da eseguire alla conferma

  // Stati per la gestione del form
  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    tipoMateriale: '',
    url: '',
    dataCaricamento: '',
    keywords: '',
    durataStimata: '',
    dimensioneFile: '',
  });

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const MATERIALE_API_ENDPOINT = 'api/materiale-on-boardings';
  const ARCHIVIO_MATERIALI_API_ENDPOINT = 'api/archivio-materialis';
  const AZIENDA_API_ENDPOINT = 'api/aziendas'; // Endpoint azienda per trovare l'archivio
  const PROFILO_AZIENDA_API_ENDPOINT = 'api/profilo-aziendas'; // Added for clarity

  // Opzioni per l'enum tipoMateriale, sincronizzate con Strapi
  const tipoMaterialeOptions = ["Preparazione al colloquio", "Test recenti", "Esercizi codice"];

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

  // Funzione per recuperare o creare l'ArchivioMateriali per l'azienda
  const getOrCreateArchivioMaterialiId = useCallback(async (currentAziendaId) => {
    console.log("getOrCreateArchivioMaterialiId: Inizio con aziendaId:", currentAziendaId);
    if (!currentAziendaId) {
      console.error("ID Azienda non disponibile per recuperare/creare ArchivioMateriali.");
      return null;
    }

    try {
      const headers = getAuthHeaders();
      let archivioId = null;
      let profiloAziendaId = null;

      // STEP 1: Trova il profilo_azienda collegato all'azienda
      console.log(`getOrCreateArchivioMaterialiId: Cercando profilo_azienda per azienda ID ${currentAziendaId}`);
      const profiloAziendaResponse = await fetch(
        `${STRAPI_BASE_URL}/${PROFILO_AZIENDA_API_ENDPOINT}?filters[azienda][id][$eq]=${currentAziendaId}`,
        { headers }
      );
      if (!profiloAziendaResponse.ok) {
        throw new Error(`Errore nel recupero del profilo azienda: ${profiloAziendaResponse.statusText}`);
      }
      const profiloAziendaData = await profiloAziendaResponse.json();
      profiloAziendaId = profiloAziendaData.data && profiloAziendaData.data.length > 0 ? profiloAziendaData.data[0].id : null;
      console.log("getOrCreateArchivioMaterialiId: ProfiloAzienda ID trovato:", profiloAziendaId);

      if (!profiloAziendaId) {
        console.warn("Impossibile trovare profilo_azienda per l'azienda data. Non posso procedere con ArchivioMateriali.");
        return null;
      }

      // STEP 2: Cerca l'archivio materiali collegato a questo profilo_azienda
      console.log(`getOrCreateArchivioMaterialiId: Cercando archivio materiali per profilo_azienda ID ${profiloAziendaId}`);
      const archivioResponse = await fetch(
        `${STRAPI_BASE_URL}/${ARCHIVIO_MATERIALI_API_ENDPOINT}?filters[profilo_azienda][id][$eq]=${profiloAziendaId}`,
        { headers }
      );

      if (!archivioResponse.ok) {
        throw new Error(`Errore nel recupero archivio materiali: ${archivioResponse.statusText}`);
      }

      const archivioData = await archivioResponse.json();

      if (archivioData.data && archivioData.data.length > 0) {
        archivioId = archivioData.data[0].id;
        console.log("getOrCreateArchivioMaterialiId: ArchivioMateriali esistente trovato con ID:", archivioId);
      } else {
        // STEP 3: Se non esiste, creane uno nuovo
        console.log("getOrCreateArchivioMaterialiId: Nessun ArchivioMateriali trovato per il profilo_azienda, creandone uno nuovo.");

        const newArchivioPayload = {
          data: {
            nome: `Archivio Materiali Azienda ${currentAziendaId}`,
            descrizione: `Materiali di onboarding per l'azienda ID: ${currentAziendaId}`,
            dataCreazione: new Date().toISOString(),
            profilo_azienda: profiloAziendaId, // Collega al profilo_azienda
          }
        };

        console.log("getOrCreateArchivioMaterialiId: Payload per la creazione di ArchivioMateriali:", newArchivioPayload);
        const createArchivioResponse = await fetch(`${STRAPI_BASE_URL}/${ARCHIVIO_MATERIALI_API_ENDPOINT}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(newArchivioPayload)
        });

        if (!createArchivioResponse.ok) {
          const errorData = await createArchivioResponse.json();
          throw new Error(`Creazione ArchivioMateriali fallita: ${JSON.stringify(errorData)}`);
        }
        const newArchivio = await createArchivioResponse.json();
        archivioId = newArchivio.data.id;
        console.log("getOrCreateArchivioMaterialiId: Nuovo ArchivioMateriali creato con ID:", archivioId);
      }
      return archivioId;
    } catch (err) {
      console.error("Errore durante il recupero/creazione di ArchivioMateriali:", err);
      setError("Errore gestione archivio: " + err.message);
      return null;
    }
  }, [getAuthHeaders]);


  // Effetto per caricare i materiali di onboarding
  const fetchMateriali = useCallback(async () => {
    console.log("fetchMateriali: Inizio con aziendaId:", aziendaId);
    if (!aziendaId) {
      console.log("Azienda ID non disponibile, impossibile caricare materiali.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      // Trova l'ID dell'ArchivioMateriali per l'azienda corrente
      const archivioId = await getOrCreateArchivioMaterialiId(aziendaId);
      console.log("fetchMateriali: ArchivioId recuperato/creato:", archivioId);

      if (!archivioId) {
        setMateriali([]);
        setLoading(false);
        return; // Non ci sono materiali da caricare senza un archivio
      }

      // Filtra i materiali in base all'archivio ID
      console.log(`fetchMateriali: Cercando materiali per archivio ID ${archivioId}`);
      const response = await fetch(
        `${STRAPI_BASE_URL}/${MATERIALE_API_ENDPOINT}?populate=*&filters[archivio_materiali][id][$eq]=${archivioId}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Errore nel recupero dei materiali: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("fetchMateriali: Raw data.data from API after delete:", data.data); 
      
      if (data.data && Array.isArray(data.data)) {
        setMateriali(data.data.map(item => ({
          id: item.id, // ID numerico di Strapi
          documentId: item.documentId, // documentId è direttamente sull'oggetto item
          titolo: item.titolo,
          descrizione: item.descrizione,
          tipoMateriale: item.tipoMateriale,
          url: item.url,
          dataCaricamento: item.dataCaricamento,
          keywords: item.keywords,
          durataStimata: item.durataStimata,
          dimensioneFile: item.dimensioneFile,
          // Se ci fossero altri attributi nell'oggetto 'item' che non sono stati esplicitamente mappati sopra,
          // e che erano inclusi in 'item.attributes', dovrebbero essere aggiunti qui.
          // Ad esempio: ...item.someOtherDirectProperty
        })));
        console.log("fetchMateriali: Materiali aggiornati nello stato di React."); // LOG DI CONFERMA STATO
      } else {
        setMateriali([]);
        console.log("fetchMateriali: Materiali impostati a array vuoto (nessun dato ricevuto)."); // LOG DI CONFERMA STATO
      }
    } catch (err) {
      console.error("Errore nel caricamento dei materiali:", err);
      setError("Impossibile caricare i materiali: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [aziendaId, getAuthHeaders, getOrCreateArchivioMaterialiId]);

  // Trigger per il fetch dei materiali quando l'aziendaId è disponibile
  useEffect(() => {
    fetchMateriali();
  }, [fetchMateriali]);

  // Gestione dei parametri iniziali (es. aprire il form di creazione all'arrivo)
  useEffect(() => {
    if (initialParams?.createNew) {
      handleNewMaterialeClick();
    }
  }, [initialParams]);

  // Gestione dei cambiamenti nel form
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  // Funzione per aprire il form di creazione
  const handleNewMaterialeClick = () => {
    setCurrentMaterialeIdentifier(null); // Reset identifier for new creation
    setFormData({
      titolo: '',
      descrizione: '',
      tipoMateriale: '',
      url: '',
      dataCaricamento: new Date().toISOString().slice(0, 16), // Imposta la data corrente
      keywords: '',
      durataStimata: '',
      dimensioneFile: '',
    });
    setShowForm(true);
  };

  // Funzione per aprire il form di modifica
  const handleEditMaterialeClick = (materiale) => {
    const identifier = materiale.documentId; 
    console.log("handleEditMaterialeClick: Tentativo di modifica materiale con documentId:", identifier);

    if (!identifier) {
      console.error("Errore: documentId mancante per la modifica. Materiale:", materiale);
      setError("Impossibile modificare: documentId mancante per questo materiale.");
      return;
    }

    const materialeToEdit = materiali.find(m => m.documentId === identifier); // Trova per documentId

    if (!materialeToEdit) {
      setError("Materiale non trovato per la modifica.");
      return;
    }

    setCurrentMaterialeIdentifier(identifier);
    setFormData({
      titolo: materialeToEdit.titolo || '',
      descrizione: materialeToEdit.descrizione || '',
      tipoMateriale: materialeToEdit.tipoMateriale || '',
      url: materialeToEdit.url || '',
      dataCaricamento: materialeToEdit.dataCaricamento ? new Date(materialeToEdit.dataCaricamento).toISOString().slice(0, 16) : '',
      keywords: materialeToEdit.keywords || '',
      durataStimata: materialeToEdit.durataStimata || '',
      dimensioneFile: materialeToEdit.dimensioneFile || '',
    });
    setShowForm(true);
  };

  // Funzione per salvare (creare o modificare) un materiale
  const handleSaveMateriale = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      console.log("handleSaveMateriale: Tentativo di recuperare/creare ArchivioMaterialiId per aziendaId:", aziendaId);
      const archivioId = await getOrCreateArchivioMaterialiId(aziendaId);
      console.log("handleSaveMateriale: ArchivioId ottenuto:", archivioId);


      if (!archivioId) {
        throw new Error("Impossibile procedere senza un ID ArchivioMateriali.");
      }

      let url = `${STRAPI_BASE_URL}/${MATERIALE_API_ENDPOINT}`;
      let method = 'POST';
      let payload = {
        ...formData,
        archivio_materiali: archivioId, // Collega al campo archivio_materiali
        // Assicurati che i campi numerici siano effettivamente numeri o null
        durataStimata: formData.durataStimata ? parseFloat(formData.durataStimata) : null,
        dimensioneFile: formData.dimensioneFile ? parseFloat(formData.dimensioneFile) : null,
      };

      if (currentMaterialeIdentifier) { // If editing, use the documentId
        url = `${STRAPI_BASE_URL}/${MATERIALE_API_ENDPOINT}/${currentMaterialeIdentifier}`;
        method = 'PUT';
        // Per l'aggiornamento, non è strettamente necessario inviare `archivio_materiali`
        // a meno che tu non stia intenzionalmente cambiando la relazione.
        // delete payload.archivio_materiali; 
      }

      console.log("handleSaveMateriale: URL:", url, "Method:", method, "Payload:", payload);
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify({ data: payload }) // Includi il payload sotto la chiave 'data'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Salvataggio materiale fallito: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      console.log("Materiale salvato con successo!");
      setShowForm(false);
      setCurrentMaterialeIdentifier(null); // Reset identifier
      fetchMateriali(); // Ricarica la lista
    } catch (err) {
      console.error("Errore durante il salvataggio del materiale:", err);
      setError("Impossibile salvare il materiale: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per mostrare il modale di conferma eliminazione
  const confirmDeleteMateriale = (materiale) => { // Riceve l'oggetto materiale
    const identifier = materiale.documentId;
    console.log("confirmDeleteMateriale: Tentativo di eliminazione materiale con documentId:", identifier);

    if (!identifier) {
      console.error("Errore: documentId mancante per l'eliminazione. Materiale:", materiale);
      setError("Impossibile eliminare: documentId mancante per questo materiale.");
      return;
    }

    setConfirmMessage("Sei sicuro di voler eliminare questo materiale? Questa azione non può essere annullata.");
    setConfirmAction(() => () => handleDeleteMateriale(identifier)); // Passa il documentId
    setShowConfirmModal(true);
  };

  // Funzione per eliminare un materiale (chiamata dal modale di conferma)
  const handleDeleteMateriale = async (identifierToDelete) => { // Identifier sarà il documentId
    setShowConfirmModal(false); // Chiudi il modale
    setLoading(true);
    setError(null);

    // AGGIORNAMENTO OTTIMISTICO: Rimuovi il materiale dallo stato immediatamente
    // Salviamo l'elemento da rimuovere per un eventuale ripristino in caso di errore
    const materialToRemove = materiali.find(m => m.documentId === identifierToDelete); // Trova per documentId
    setMateriali(prevMateriali => 
      prevMateriali.filter(m => m.documentId !== identifierToDelete) // Filtra per documentId
    );
    console.log(`Aggiornamento ottimistico: Materiale ${identifierToDelete} rimosso dall'UI.`);

    try {
      const headers = getAuthHeaders();
      const deleteUrl = `${STRAPI_BASE_URL}/${MATERIALE_API_ENDPOINT}/${identifierToDelete}`;
      console.log(`handleDeleteMateriale: Invio richiesta DELETE a: ${deleteUrl}`); // LOG API REQUEST
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: headers,
      });

      console.log(`handleDeleteMateriale: Risposta API Status: ${response.status}`);
      console.log(`handleDeleteMateriale: Risposta API OK: ${response.ok}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Eliminazione materiale fallita: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      console.log(`Materiale ${identifierToDelete} eliminato con successo.`);
      // Non chiamiamo fetchMateriali() qui se l'operazione ha avuto successo,
      // l'aggiornamento ottimistico è sufficiente.
    } catch (err) {
      console.error("Errore durante l'eliminazione del materiale:", err);
      setError("Impossibile eliminare il materiale: " + err.message);
      // In caso di errore, ripristina il materiale nell'UI
      if (materialToRemove) {
        setMateriali(prevMateriali => [...prevMateriali, materialToRemove]); 
        console.log(`Ripristino ottimistico: Materiale ${identifierToDelete} ripristinato nell'UI a causa di errore.`);
      }
      fetchMateriali(); // Ricarica per assicurare lo stato corretto dopo un errore
    } finally {
      setLoading(false);
    }
  };

  // Funzione per annullare l'operazione del form
  const handleCancelForm = () => {
    setShowForm(false);
    setCurrentMaterialeIdentifier(null); // Reset identifier
    setFormData({
      titolo: '', descrizione: '', tipoMateriale: '', url: '',
      dataCaricamento: '', keywords: '', durataStimata: '', dimensioneFile: '',
    });
  };

  // Componente Modale di Conferma
  const ConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Conferma Eliminazione</h2>
          <p className="text-gray-700 mb-6">{confirmMessage}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                confirmAction && confirmAction();
                setShowConfirmModal(false);
              }}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
            >
              Sì, Elimina
            </button>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendering condizionale
  if (loading && materiali.length === 0 && !error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-700">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-xl">Caricamento materiali...</p>
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
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-blue-700 text-3xl sm:text-4xl font-bold mb-6 border-b pb-4 border-gray-200 flex items-center gap-3">
            <i className="fas fa-book-open text-blue-600"></i> {currentMaterialeIdentifier ? 'Modifica Materiale' : 'Crea Nuovo Materiale'}
          </h1>
          <form onSubmit={handleSaveMateriale} className="space-y-6">
            <div className="input-group">
              <label htmlFor="titolo" className="block text-gray-700 text-sm font-semibold mb-1">Titolo:</label>
              <input type="text" id="titolo" name="titolo" value={formData.titolo} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="input-group">
              <label htmlFor="descrizione" className="block text-gray-700 text-sm font-semibold mb-1">Descrizione:</label>
              <textarea id="descrizione" name="descrizione" value={formData.descrizione} onChange={handleChange} rows="4" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div className="input-group">
              <label htmlFor="tipoMateriale" className="block text-gray-700 text-sm font-semibold mb-1">Tipo Materiale:</label>
              <select id="tipoMateriale" name="tipoMateriale" value={formData.tipoMateriale} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">Seleziona un tipo</option>
                {tipoMaterialeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="url" className="block text-gray-700 text-sm font-semibold mb-1">URL (Link al Materiale):</label>
              <input type="url" id="url" name="url" value={formData.url} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="input-group">
              <label htmlFor="dataCaricamento" className="block text-gray-700 text-sm font-semibold mb-1">Data Caricamento:</label>
              <input type="datetime-local" id="dataCaricamento" name="dataCaricamento" value={formData.dataCaricamento} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="input-group">
              <label htmlFor="keywords" className="block text-gray-700 text-sm font-semibold mb-1">Keywords (separate da virgola):</label>
              <input type="text" id="keywords" name="keywords" value={formData.keywords} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="input-group">
              <label htmlFor="durataStimata" className="block text-gray-700 text-sm font-semibold mb-1">Durata Stimata (ore, es. 1.5):</label>
              <input type="number" id="durataStimata" name="durataStimata" value={formData.durataStimata} onChange={handleChange} step="0.1" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="input-group">
              <label htmlFor="dimensioneFile" className="block text-gray-700 text-sm font-semibold mb-1">Dimensione File (MB, es. 2.3):</label>
              <input type="number" id="dimensioneFile" name="dimensioneFile" value={formData.dimensioneFile} onChange={handleChange} step="0.1" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed">
                <i className="fas fa-save mr-2"></i> {currentMaterialeIdentifier ? 'Salva Modifiche' : 'Crea Materiale'}
              </button>
              <button type="button" onClick={handleCancelForm} disabled={loading} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed">
                <i className="fas fa-times-circle mr-2"></i> Annulla
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 font-sans">
      <ConfirmModal /> {/* Includi il modale di conferma qui */}
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h1 className="text-blue-700 text-3xl sm:text-4xl font-bold mb-6 border-b pb-4 border-gray-200 flex items-center gap-3">
          <i className="fas fa-book text-blue-600"></i> Gestione Materiale di Onboarding
        </h1>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleNewMaterialeClick}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 flex items-center gap-2"
          >
            <i className="fas fa-plus-circle"></i> Nuovo Materiale
          </button>
        </div>

        {materiali.length === 0 ? (
          <div className="text-center text-gray-600 text-xl py-10">
            <p>Nessun materiale di onboarding pubblicato.</p>
            <p className="mt-2">Inizia aggiungendo il tuo primo materiale!</p>
          </div>
        ) : (
          <ul className="list-none p-0 m-0 space-y-4">
            {materiali.map((materiale) => (
              <li key={materiale.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-12 h-12 flex justify-center items-center text-xl shadow-md">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="flex-grow">
                  <h3 className="text-gray-900 text-lg sm:text-xl font-semibold mb-1">{materiale.titolo}</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-1">{materiale.descrizione}</p>
                  <p className="text-gray-500 text-xs">Tipo: {materiale.tipoMateriale}</p>
                  {materiale.url && (
                    <p className="text-gray-500 text-xs">Link: <a href={materiale.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Accedi qui</a></p>
                  )}
                  <p className="text-gray-500 text-xs">Caricato il: {materiale.dataCaricamento ? new Date(materiale.dataCaricamento).toLocaleDateString('it-IT') : 'Data non disponibile'}</p>
                  {materiale.keywords && (
                    <p className="text-gray-500 text-xs">Keywords: {materiale.keywords}</p>
                  )}
                  {materiale.durataStimata && (
                    <p className="text-gray-500 text-xs">Durata Stimata: {materiale.durataStimata} ore</p>
                  )}
                  {materiale.dimensioneFile && (
                    <p className="text-gray-500 text-xs">Dimensione File: {materiale.dimensioneFile} MB</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => handleEditMaterialeClick(materiale)} // Passa l'intero oggetto materiale
                    className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-edit"></i> Modifica
                  </button>
                  <button
                    onClick={() => confirmDeleteMateriale(materiale)} // Passa l'intero oggetto materiale
                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-trash"></i> Elimina
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
