// components/CompanyDashboard/TestForm.js
'use client';
import React, { useState, useEffect, useCallback } from 'react';

export default function TestForm({ testId = null, aziendaId, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '', // Corrisponde a 'nome' nel CT Test
    descrizione: '', // Corrisponde a 'descrizione' nel CT Test
    punteggioMinimo: '', // Corrisponde a 'punteggioMinimo' nel CT Test
    durataMassimaMinuti: '', // Corrisponde a 'durataMassimaMinuti' nel CT Test
    attivo: true, // Corrisponde a 'attivo' nel CT Test
    domandas: [], // Array di oggetti domanda, popolato da Strapi
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // isEditing è true se testId (che ora è il documentId) è presente
  const [isEditing, setIsEditing] = useState(!!testId); 
  const [initialFormData, setInitialFormData] = useState(null); // Per annullare le modifiche

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const TEST_API_ENDPOINT = 'api/tests'; // Endpoint per il CT Test
  const DOMANDA_API_ENDPOINT = 'api/domandas'; // Endpoint per il CT Domanda

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Carica i dati del test se siamo in modalità modifica (usando il documentId)
  useEffect(() => {
    if (isEditing && testId) { // testId qui è il documentId
      console.log("TestForm useEffect: Loading test with identifier:", testId); // LOG AGGIUNTIVO
      const fetchTest = async () => {
        setLoading(true);
        try {
          // Usa il documentId nella chiamata API GET per recuperare il test
          const response = await fetch(`${STRAPI_BASE_URL}/${TEST_API_ENDPOINT}/${testId}?populate=domandas`, {
            headers: getAuthHeaders(),
          });
          if (response.status === 404) { // AGGIUNTO: Gestione specifica per 404
            console.error(`Test con ID ${testId} non trovato. Probabilmente è stato eliminato.`);
            setError('Il test che stai cercando di modificare non esiste più.');
            onCancel(); // Chiudi il form e resetta lo stato del padre
            return; // Esci dalla funzione
          }
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          const testData = data.data?.attributes; // Accedi agli attributi in modo sicuro

          // Mappa le domande recuperate per adattarle allo stato del form
          const loadedDomande = testData?.domandas?.data ? testData.domandas.data.map(d => ({
            id: d.id, // ID numerico di Strapi
            documentId: d.attributes?.documentId || null, // Il documentId della domanda, con optional chaining
            testo: d.attributes?.testo || '',
            tipo: d.attributes?.tipo || 'RISPOSTA MULTIPLA', 
            punteggioMax: d.attributes?.punteggioMax || 1,
            opzioniRisposta: d.attributes?.opzioniRisposta || '', 
          })) : [];

          setFormData({
            nome: testData?.nome || '',
            descrizione: testData?.descrizione || '',
            punteggioMinimo: testData?.punteggioMinimo || '',
            durataMassimaMinuti: testData?.durataMassimaMinuti || '',
            attivo: typeof testData?.attivo === 'boolean' ? testData.attivo : true,
            domandas: loadedDomande,
          });
          setInitialFormData({ 
            nome: testData?.nome || '',
            descrizione: testData?.descrizione || '',
            punteggioMinimo: testData?.punteggioMinimo || '',
            durataMassimaMinuti: testData?.durataMassimaMinuti || '',
            attivo: typeof testData?.attivo === 'boolean' ? testData.attivo : true,
            domandas: loadedDomande,
          });
        } catch (err) {
          console.error("Errore nel recupero del test per la modifica:", err);
          setError('Impossibile caricare il test per la modifica.');
        } finally {
          setLoading(false);
        }
      };
      fetchTest();
    } else if (isEditing && !testId) { // AGGIUNTO: Caso in cui isEditing è true ma testId è null/invalid
        // Questo può succedere se un test viene eliminato mentre il form di modifica è aperto
        console.warn("TestForm: isEditing è true ma testId è null o non valido. Chiudo il form.");
        onCancel(); // Chiudi il form
    }
  }, [testId, isEditing, getAuthHeaders, onCancel]); // Aggiunto onCancel alle dipendenze

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleQuestionChange = (index, e) => {
    const { name, value } = e.target;
    const newDomande = [...formData.domandas];
    newDomande[index] = { ...newDomande[index], [name]: value };
    setFormData((prev) => ({ ...prev, domandas: newDomande }));
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      domandas: [
        ...prev.domandas,
        // Per le nuove domande, non specifichiamo un documentId, sarà generato da Strapi
        { testo: '', tipo: 'RISPOSTA MULTIPLA', punteggioMax: 1, opzioniRisposta: '' }, 
      ],
    }));
  };

  const handleRemoveQuestion = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      domandas: prev.domandas.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Aggiungi controllo aggiuntivo per aziendaId
    if (!aziendaId) {
      setError("ID azienda mancante. Impossibile salvare il test.");
      setLoading(false);
      return;
    }

    try {
      let currentTestDocumentId = testId; // Se in modifica, testId è il documentId

      // STEP 1: Salva/Aggiorna il Test principale
      const testDataToSave = {
        nome: formData.nome,
        descrizione: formData.descrizione,
        punteggioMinimo: parseInt(formData.punteggioMinimo, 10),
        durataMassimaMinuti: formData.durataMassimaMinuti ? parseInt(formData.durataMassimaMinuti, 10) : null,
        attivo: formData.attivo,
        azienda: aziendaId, 
      };

      const testUrl = isEditing
        ? `${STRAPI_BASE_URL}/${TEST_API_ENDPOINT}/${currentTestDocumentId}` // Usa documentId per PUT
        : `${STRAPI_BASE_URL}/${TEST_API_ENDPOINT}`; // POST non include l'ID
      const testMethod = isEditing ? 'PUT' : 'POST';

      console.log("TestForm: Submitting test data to URL:", testUrl, "con metodo:", testMethod); // LOG AGGIUNTIVO
      const testResponse = await fetch(testUrl, {
        method: testMethod,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ data: testDataToSave }),
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        console.error("TestForm: Risposta di errore dall'API test:", errorData); // LOG AGGIUNTIVO
        throw new Error(errorData.error?.message || `Errore nel salvataggio del test: ${testResponse.status}`);
      }

      const testResult = await testResponse.json();
      console.log("TestForm: Risposta API completa dopo creazione/aggiornamento test:", testResult); // LOG AGGIUNTIVO CRUCIALE

      // Se era una nuova creazione, otteniamo il documentId del test appena creato in modo sicuro
      if (!isEditing) {
        // Logica di estrazione del documentId più robusta:
        // Prima prova data.attributes.documentId (standard Strapi)
        // Poi prova data.documentId (se Strapi lo restituisce direttamente a quel livello)
        currentTestDocumentId = testResult.data?.attributes?.documentId || testResult.data?.documentId || null; 
        console.log("TestForm: Nuovo test creato con documentId (estratto dalla risposta):", currentTestDocumentId); // LOG AGGIUNTIVO
      }

      // STEP 2: Gestisci le Domande
      const currentDomandeInBackend = (isEditing && initialFormData?.domandas) ? initialFormData.domandas : [];

      for (const domanda of formData.domandas) {
        // Controllo difensivo per assicurarsi che 'domanda' non sia undefined/null
        if (!domanda) {
          console.warn("Saltando domanda non definita o null nell'array formData.domandas.");
          continue; // Salta questa iterazione
        }

        const domandaPayload = {
          testo: domanda.testo,
          tipo: domanda.tipo,
          punteggioMax: parseInt(domanda.punteggioMax, 10),
          test: currentTestDocumentId, // Usa documentId invece dell'id numerico del test
        };
        if (domanda.tipo === 'RISPOSTA MULTIPLA' && domanda.opzioniRisposta !== undefined) {
          domandaPayload.opzioniRisposta = domanda.opzioniRisposta || ''; // Aggiunto fallback per stringa vuota
        }

        if (domanda.documentId) { // Se la domanda ha un documentId, è esistente -> AGGIORNA
          const updateDomandaUrl = `${STRAPI_BASE_URL}/${DOMANDA_API_ENDPOINT}/${domanda.documentId}`;
          console.log("TestForm: Aggiornamento domanda con URL:", updateDomandaUrl); // LOG AGGIUNTIVO
          const updateResponse = await fetch(updateDomandaUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ data: domandaPayload }),
          });
          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error("TestForm: Errore nell'aggiornamento della domanda:", errorData); // LOG AGGIUNTIVO
            throw new Error(errorData.error?.message || `Errore nell'aggiornamento domanda ${domanda.documentId}`);
          }
        } else { // Nuova domanda -> CREA (non usiamo documentId nell'URL)
          const createDomandaUrl = `${STRAPI_BASE_URL}/${DOMANDA_API_ENDPOINT}`;
          console.log("TestForm: Creazione nuova domanda con URL:", createDomandaUrl); // LOG AGGIUNTIVO
          const createResponse = await fetch(createDomandaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ data: domandaPayload }),
          });
          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            console.error("TestForm: Errore nella creazione della domanda:", errorData); // LOG AGGIUNTIVO
            throw new Error(errorData.error?.message || `Errore nella creazione nuova domanda`);
          }
        }
      }

      // Rimuovi le domande che erano presenti inizialmente ma non sono più nel form
      if (isEditing && initialFormData) {
        const domandeToDelete = currentDomandeInBackend.filter(
          (initialDomanda) => !formData.domandas.some(
            (currentDomanda) => currentDomanda.documentId === initialDomanda.documentId
          )
        );

        for (const domandaToDelete of domandeToDelete) {
          if (domandaToDelete.documentId) { // Assicurati che abbia un documentId da eliminare
            const deleteDomandaUrl = `${STRAPI_BASE_URL}/${DOMANDA_API_ENDPOINT}/${domandaToDelete.documentId}`;
            console.log("TestForm: Tentativo di eliminazione domanda con URL:", deleteDomandaUrl); // LOG AGGIUNTIVO
            const deleteResponse = await fetch(deleteDomandaUrl, {
              method: 'DELETE',
              headers: getAuthHeaders(),
            });
            if (!deleteResponse.ok) {
              const errorData = await deleteResponse.json();
              console.warn(`TestForm: Impossibile eliminare la domanda ${domandaToDelete.documentId}:`, errorData); // LOG AGGIUNTIVO
            }
          }
        }
      }

      onSaveSuccess(); // Notifica al componente padre che il salvataggio è avvenuto con successo
    } catch (err) {
      console.error("Errore nel salvataggio del test/domande:", err);
      setError(`Errore durante il salvataggio: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    setFormData(initialFormData || {
      nome: '',
      descrizione: '',
      punteggioMinimo: '',
      durataMassimaMinuti: '',
      attivo: true, 
      domandas: [],
    });
    onCancel();
  };

  if (loading && isEditing) return <p className="text-center text-blue-600 text-lg py-8">Caricamento test per la modifica...</p>;

  return (
    <div className="bg-white mx-auto p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 border-b pb-3">
        {isEditing ? 'Modifica Test di Selezione' : 'Crea Nuovo Test di Selezione'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campi del Test */}
        <div>
          <label htmlFor="nome" className="block text-gray-700 text-sm font-bold mb-2">Nome Test:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="descrizione" className="block text-gray-700 text-sm font-bold mb-2">Descrizione Test:</label>
          <textarea
            id="descrizione"
            name="descrizione"
            value={formData.descrizione}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <div>
          <label htmlFor="punteggioMinimo" className="block text-gray-700 text-sm font-bold mb-2">Punteggio Minimo per Superare (%):</label>
          <input
            type="number"
            id="punteggioMinimo"
            name="punteggioMinimo"
            value={formData.punteggioMinimo}
            onChange={handleChange}
            required
            min="0"
            max="100"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="durataMassimaMinuti" className="block text-gray-700 text-sm font-bold mb-2">Durata Massima (minuti, opzionale):</label>
          <input
            type="number"
            id="durataMassimaMinuti"
            name="durataMassimaMinuti"
            value={formData.durataMassimaMinuti}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="attivo"
            name="attivo"
            checked={formData.attivo}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="attivo" className="text-gray-700 text-sm font-bold">Test Attivo (Visibile ai candidati)</label>
        </div>

        {/* Sezione Domande */}
        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">Domande del Test</h3>
        {formData.domandas.length === 0 && <p className="text-gray-600 text-sm">Nessuna domanda aggiunta. Clicca "Aggiungi Domanda" per iniziare.</p>}

        {formData.domandas.map((domanda, index) => (
          // Usa documentId come key se disponibile, altrimenti usa l'id numerico o un fallback
          <div key={domanda.documentId || domanda.id || `new-${index}`} className="border border-blue-200 p-4 rounded-md bg-blue-50 mb-4 shadow-sm">
            <label htmlFor={`testo-${index}`} className="block text-blue-700 text-sm font-bold mb-2">Domanda {index + 1}:</label>
            <textarea
              id={`testo-${index}`}
              name="testo"
              value={domanda.testo}
              onChange={(e) => handleQuestionChange(index, e)}
              rows="2"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>

            <div className="mt-3">
              <label htmlFor={`tipo-${index}`} className="block text-blue-700 text-sm font-bold mb-2">Tipo Domanda:</label>
              <select
                id={`tipo-${index}`}
                name="tipo"
                value={domanda.tipo}
                onChange={(e) => handleQuestionChange(index, e)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="RISPOSTA MULTIPLA">RISPOSTA MULTIPLA</option>
                <option value="RISPOSTA APERTA">RISPOSTA APERTA</option>
              </select>
            </div>

            <div className="mt-3">
              <label htmlFor={`punteggioMax-${index}`} className="block text-blue-700 text-sm font-bold mb-2">Punteggio Massimo:</label>
              <input
                type="number"
                id={`punteggioMax-${index}`}
                name="punteggioMax"
                value={domanda.punteggioMax}
                onChange={(e) => handleQuestionChange(index, e)}
                required
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {domanda.tipo === 'RISPOSTA MULTIPLA' && (
              <div className="mt-3">
                <label htmlFor={`opzioniRisposta-${index}`} className="block text-blue-700 text-sm font-bold mb-2">Opzioni di Risposta (separate da virgola):</label>
                <input
                  type="text"
                  id={`opzioniRisposta-${index}`}
                  name="opzioniRisposta"
                  value={domanda.opzioniRisposta}
                  onChange={(e) => handleQuestionChange(index, e)}
                  placeholder="Opzione A, Opzione B, Opzione C"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-gray-500 text-xs mt-1">Es. "Italia, Francia, Germania".</p>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => handleRemoveQuestion(index)}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
              >
                <i className="fas fa-trash mr-2"></i> Rimuovi Domanda
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddQuestion}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> Aggiungi Domanda
        </button>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <i className="fas fa-save"></i> {isEditing ? 'Salva Modifiche Test' : 'Crea Test'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
