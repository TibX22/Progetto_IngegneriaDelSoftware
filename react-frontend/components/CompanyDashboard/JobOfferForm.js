// components/CompanyDashboard/JobOfferForm.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function JobOfferForm({ offerId = null, aziendaId, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    localita: '',
    tipo_contratto: '', // Lasciato vuoto per far selezionare
    data_pubblicazione: '', // Verrà popolato con la data corrente in creazione o dal dato esistente
    retribuzione_minima: '',
    retribuzione_massima: '',
    settore: '', // Lasciato vuoto per far selezionare
    modalita_lavoro: '', // Lasciato vuoto per far selezionare
    esperienza_richiesta: '', // Lasciato vuoto per far selezionare
    scadenza: '', // Formato 'YYYY-MM-DD' per il campo date di Strapi
    benefict: '', // Campo per i benefit
    documentId: null, // Per memorizzare il documentId se in modalità modifica
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(!!offerId); // True se offerId è presente

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const OFFERTA_LAVORO_API_ENDPOINT = 'api/offerta-lavoros';

  // Opzioni per gli enum, sincronizzate con lo schema Strapi fornito
  const tipoContrattoOptions = ["determinato", "indeterminato"];
  const settoreOptions = [
    "Sviluppo Software", "Sviluppo Mobile", "DevOps & Cloud Computing",
    "Cybersecurity", "Data Science & Big Data", "Machine Learning & AI",
    "Blockchain & Cryptocurrency", "IT Support & System Administration",
    "QA & Testing", "UI/UX Design"
  ];
  const modalitaLavoroOptions = ["ibrido", "da remoto", "in sede"];
  const esperienzaRichiestaOptions = ["anni 1-2", "anni 3-5 ", "anni 5-9 ", "anni 10+ "]; 

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

  // Effetto per caricare i dati dell'offerta di lavoro esistente se siamo in modalità modifica
  useEffect(() => {
    const fetchJobOffer = async () => {
      if (offerId && aziendaId) { // Assicurati di avere sia offerId che aziendaId per il fetch
        setLoading(true);
        setError(null);
        try {
          const headers = getAuthHeaders();
          // Fetch dell'offerta usando l'ID numerico di Strapi (offerId)
          const response = await fetch(
            `${STRAPI_BASE_URL}/${OFFERTA_LAVORO_API_ENDPOINT}?populate=*&filters[azienda][id][$eq]=${aziendaId}&filters[id][$eq]=${offerId}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`Errore nel recupero dell'offerta di lavoro: ${response.statusText}`);
          }
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const offer = data.data[0];
            // Popola il form con i dati esistenti
            setFormData({
              titolo: offer.titolo || '',
              descrizione: offer.descrizione || '',
              localita: offer.localita || '',
              tipo_contratto: offer.tipo_contratto || '',
              data_pubblicazione: offer.data_pubblicazione ? new Date(offer.data_pubblicazione).toISOString().slice(0, 16) : '',
              retribuzione_minima: offer.retribuzione_minima || '',
              retribuzione_massima: offer.retribuzione_massima || '',
              settore: offer.settore || '',
              modalita_lavoro: offer.modalita_lavoro || '',
              esperienza_richiesta: offer.esperienza_richiesta || '', 
              scadenza: offer.scadenza || '',
              benefict: offer.benefict || '',
              documentId: offer.documentId || offer.id, // Preferisci documentId se esiste, altrimenti usa l'id di Strapi
            });
            setIsEditing(true); // Conferma che siamo in modalità modifica
          } else {
            setError("Offerta di lavoro non trovata.");
            setIsEditing(false); // Non è un'offerta esistente, passa a creazione
          }
        } catch (err) {
          console.error("Errore nel caricamento dell'offerta di lavoro:", err);
          setError("Impossibile caricare l'offerta di lavoro: " + err.message);
        } finally {
          setLoading(false);
        }
      } else if (!offerId) {
        // In modalità creazione, imposta la data di pubblicazione corrente e resetta gli altri campi
        setFormData({
          titolo: '',
          descrizione: '',
          localita: '',
          tipo_contratto: '',
          data_pubblicazione: new Date().toISOString().slice(0, 16),
          retribuzione_minima: '',
          retribuzione_massima: '',
          settore: '',
          modalita_lavoro: '',
          esperienza_richiesta: '',
          scadenza: '',
          benefict: '',
          documentId: null,
        });
        setIsEditing(false); // Conferma che siamo in modalità creazione
      }
    };
    fetchJobOffer();
  }, [offerId, aziendaId, getAuthHeaders]);


  // Gestione dei cambiamenti negli input del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Gestione dell'invio del form (creazione o modifica)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!aziendaId) {
      setError("Errore: ID azienda non disponibile. Non è possibile salvare l'offerta.");
      setLoading(false);
      return;
    }

    // Costruisci il payload per Strapi
    let payload = { 
      ...formData,
      azienda: aziendaId, 
      retribuzione_minima: formData.retribuzione_minima ? parseInt(formData.retribuzione_minima, 10) : null,
      retribuzione_massima: formData.retribuzione_massima ? parseInt(formData.retribuzione_massima, 10) : null,
      // Esperienza richiesta è già una stringa dal form, non necessita di parsing qui
      // Benefict è già una stringa dal form
    };

    let url = `${STRAPI_BASE_URL}/${OFFERTA_LAVORO_API_ENDPOINT}`;
    let method = 'POST';

    if (isEditing) {
      // Per le PUT requests, Strapi v5 si aspetta l'ID nell'URL.
      // Se il tuo Strapi è configurato per usare `documentId` nell'URL, allora `formData.documentId` sarà usato.
      // Altrimenti, `offerId` (l'ID numerico) verrà usato.
      const idForPut = formData.documentId || offerId; 
      url = `${STRAPI_BASE_URL}/${OFFERTA_LAVORO_API_ENDPOINT}/${idForPut}`; 
      method = 'PUT';

      // Rimuoviamo dal payload le proprietà di sola lettura o non modificabili per la PUT
      // Non inviare 'id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt' o 'azienda' nel body di PUT
      const { id, documentId, createdAt, updatedAt, publishedAt, azienda, ...attributesToUpdate } = payload;
      payload = attributesToUpdate; 
    } else {
      // Per la POST (nuova creazione), assicurati che documentId sia rimosso dal payload
      delete payload.documentId;
    }

    // LOG DI DEBUG: Stampa l'URL, il metodo e il payload prima di inviare
    console.log("DEBUG API CALL:");
    console.log("   URL:", url);
    console.log("   Method:", method);
    console.log("   Payload:", JSON.stringify({ data: payload }, null, 2));


    try {
      const headers = getAuthHeaders();
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify({ data: payload }) // Avvolgi il payload in 'data' per Strapi
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Salvataggio fallito: ${response.status} - ${JSON.stringify(errorData.error || errorData)}`);
      }

      const responseData = await response.json();
      console.log("Offerta di lavoro salvata con successo:", responseData);
      setLoading(false);
      onSaveSuccess(); // Richiama la callback di successo dal genitore
    } catch (err) {
      console.error("Errore durante il salvataggio dell'offerta:", err);
      setError("Impossibile salvare l'offerta: " + err.message);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel(); // Richiama la callback di annullamento dal genitore
  };

  if (loading && !isEditing) { // Mostra loading solo se è il caricamento iniziale e non in modifica (per evitare flash quando si caricano i dati)
    return (
      <div className="flex justify-center items-center h-full bg-gray-100 text-gray-700 p-8">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-xl">Caricamento offerta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-100 text-red-700 p-8">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-xl">{error}</p>
          <button
            onClick={() => { setError(null); onCancel(); }} // Permette di chiudere l'errore e tornare indietro
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h1 className="text-blue-700 text-3xl sm:text-4xl font-bold mb-6 border-b pb-4 border-gray-200 flex items-center gap-3">
          <i className="fas fa-briefcase text-blue-600"></i> {isEditing ? 'Modifica Offerta di Lavoro' : 'Crea Nuova Offerta di Lavoro'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titolo */}
          <div className="input-group">
            <label htmlFor="titolo" className="block text-gray-700 text-sm font-semibold mb-1">Titolo:</label>
            <input
              type="text"
              id="titolo"
              name="titolo"
              value={formData.titolo}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Descrizione */}
          <div className="input-group">
            <label htmlFor="descrizione" className="block text-gray-700 text-sm font-semibold mb-1">Descrizione:</label>
            <textarea
              id="descrizione"
              name="descrizione"
              value={formData.descrizione}
              onChange={handleChange}
              rows="5"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Località */}
          <div className="input-group">
            <label htmlFor="localita" className="block text-gray-700 text-sm font-semibold mb-1">Località:</label>
            <input
              type="text"
              id="localita"
              name="localita"
              value={formData.localita}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tipo Contratto */}
          <div className="input-group">
            <label htmlFor="tipo_contratto" className="block text-gray-700 text-sm font-semibold mb-1">Tipo di Contratto:</label>
            <select
              id="tipo_contratto"
              name="tipo_contratto"
              value={formData.tipo_contratto}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleziona un tipo</option>
              {tipoContrattoOptions.map(option => (
                <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Data Pubblicazione */}
          <div className="input-group">
            <label htmlFor="data_pubblicazione" className="block text-gray-700 text-sm font-semibold mb-1">Data Pubblicazione:</label>
            <input
              type="datetime-local"
              id="data_pubblicazione"
              name="data_pubblicazione"
              value={formData.data_pubblicazione}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Retribuzione Minima */}
          <div className="input-group">
            <label htmlFor="retribuzione_minima" className="block text-gray-700 text-sm font-semibold mb-1">Retribuzione Minima (€):</label>
            <input
              type="number"
              id="retribuzione_minima"
              name="retribuzione_minima"
              value={formData.retribuzione_minima}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Retribuzione Massima */}
          <div className="input-group">
            <label htmlFor="retribuzione_massima" className="block text-gray-700 text-sm font-semibold mb-1">Retribuzione Massima (€):</label>
            <input
              type="number"
              id="retribuzione_massima"
              name="retribuzione_massima"
              value={formData.retribuzione_massima}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Settore */}
          <div className="input-group">
            <label htmlFor="settore" className="block text-gray-700 text-sm font-semibold mb-1">Settore:</label>
            <select
              id="settore"
              name="settore"
              value={formData.settore}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleziona un settore</option>
              {settoreOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Modalità Lavoro */}
          <div className="input-group">
            <label htmlFor="modalita_lavoro" className="block text-gray-700 text-sm font-semibold mb-1">Modalità di Lavoro:</label>
            <select
              id="modalita_lavoro"
              name="modalita_lavoro"
              value={formData.modalita_lavoro}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleziona una modalità</option>
              {modalitaLavoroOptions.map(option => (
                <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Esperienza Richiesta */}
          <div className="input-group">
            <label htmlFor="esperienza_richiesta" className="block text-sm font-medium text-gray-700">Esperienza Richiesta:</label>
            <select
              id="esperienza_richiesta"
              name="esperienza_richiesta"
              value={formData.esperienza_richiesta}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleziona esperienza</option>
              {esperienzaRichiestaOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Data Scadenza */}
          <div className="input-group">
            <label htmlFor="scadenza" className="block text-sm font-medium text-gray-700">Data di Scadenza:</label>
            <input
              type="date"
              id="scadenza"
              name="scadenza"
              value={formData.scadenza}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Campo Benefict */}
          <div className="input-group">
            <label htmlFor="benefict" className="block text-gray-700 text-sm font-semibold mb-1">Benefit Legati alla Sostenibilità (es. trasporti green, remote work, impegno ESG):</label>
            <textarea
              id="benefict"
              name="benefict"
              value={formData.benefict}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Es. Trasporti green, Remote Work, Impegno ESG, Certificazioni ISO 14001"
            ></textarea>
          </div>

          {/* Bottoni di azione */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-save mr-2"></i> {isEditing ? 'Salva Modifiche' : 'Crea Offerta'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-times-circle mr-2"></i> Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
