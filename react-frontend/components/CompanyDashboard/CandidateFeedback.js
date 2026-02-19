// components/CompanyDashboard/CandidateFeedback.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function CandidateFeedback({ candidatoId }) { // Riceve candidatoId via props
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    valutazione: '',
    commento: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [aziendaId, setAziendaId] = useState(null); // ID dell'azienda autenticata

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const FEEDBACK_API_ENDPOINT = 'api/feedbacks';
  const USER_ME_API_ENDPOINT = 'api/users/me';
  const AZIENDA_API_ENDPOINT = 'api/aziendas';


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

  // Funzione per ottenere l'ID dell'azienda autenticata
  const fetchAziendaId = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }
    try {
      const userResponse = await fetch(`${STRAPI_BASE_URL}/${USER_ME_API_ENDPOINT}`, { headers });
      if (!userResponse.ok) {
        throw new Error('Errore nel recupero dei dati utente autenticato.');
      }
      const userData = await userResponse.json();
      const authenticatedUserId = userData.id;

      const aziendaResponse = await fetch(`${STRAPI_BASE_URL}/${AZIENDA_API_ENDPOINT}?filters[user]=${authenticatedUserId}`, { headers });
      if (!aziendaResponse.ok) {
        throw new Error('Errore nel recupero dell\'ID azienda.');
      }
      const aziendaData = await aziendaResponse.json();
      if (aziendaData.data && aziendaData.data.length > 0) {
        setAziendaId(aziendaData.data[0].id);
      } else {
        setError('Nessuna azienda trovata per l\'utente autenticato.');
      }
    } catch (err) {
      console.error("Errore nel recupero dell'ID azienda:", err);
      setError('Impossibile recuperare i dati dell\'azienda.');
    } finally {
      // Non impostiamo loading a false qui, perché il loading generale è per i feedback
    }
  }, [getAuthHeaders]);

  // Funzione per recuperare i feedback
  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${STRAPI_BASE_URL}/${FEEDBACK_API_ENDPOINT}?filters[profilo_candidato]=${candidatoId}&populate[azienda][populate]=profilo_azienda`, {
        headers: headers,
      });
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log("Raw feedback data received for processing (with deep populate):", JSON.stringify(data, null, 2));

      setFeedbacks(data.data.map(item => {
        console.log("Current item in map (before checks):", item);

        if (!item || typeof item !== 'object') {
          console.warn("Elemento di feedback malformato o incompleto, saltando:", item);
          return null;
        }

        let aziendaNome = 'N/A';
        if (item.azienda?.profilo_azienda?.nomeAzienda) {
          aziendaNome = item.azienda.profilo_azienda.nomeAzienda;
          console.log("Checking azienda object structure for item ID", item.id, ":", item.azienda);
        } else {
          console.warn("Azienda data or profilo_azienda data is not fully populated for item ID", item.id, ":", item.azienda);
        }
        
        console.log("Processed aziendaNome for item ID", item.id, ":", aziendaNome);

        return {
          id: item.id,
          ...item,
          aziendaNome: aziendaNome,
        };
      }).filter(Boolean));
    } catch (err) {
      console.error("Errore nel recupero dei feedback:", err);
      setError('Errore durante il caricamento dei feedback: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [candidatoId, getAuthHeaders]);

  useEffect(() => {
    if (candidatoId) {
      fetchAziendaId(); // Prima recupera l'ID dell'azienda
    }
  }, [candidatoId, fetchAziendaId]);


  useEffect(() => {
    if (candidatoId && aziendaId) { // Solo dopo aver recuperato aziendaId
      fetchFeedbacks();
    }
  }, [candidatoId, aziendaId, fetchFeedbacks]);


  const handleNewFeedbackChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const headers = getAuthHeaders();
    if (!headers || !aziendaId) {
      setSubmitting(false);
      setSubmitError('Errore di autenticazione o ID azienda non disponibile.');
      return;
    }

    try {
      const response = await fetch(`${STRAPI_BASE_URL}/${FEEDBACK_API_ENDPOINT}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          data: {
            ...newFeedback,
            dataInserita: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
            profilo_candidato: candidatoId,
            azienda: aziendaId, // Associa l'azienda corrente al feedback
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Errore HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Successfully added feedback. Strapi response for new item (POST):", JSON.stringify(responseData, null, 2));

      // Re-fetch dei feedback dopo l'aggiunta
      await fetchFeedbacks();
      setNewFeedback({ valutazione: '', commento: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error("Errore durante l'aggiunta del feedback:", err);
      setSubmitError('Errore durante l\'aggiunta del feedback: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-blue-600">Caricamento feedback...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">Errore: {error}</div>;
  }

  if (!candidatoId) {
    return <div className="text-center p-6 text-red-600">ID Candidato non fornito alla modale di feedback.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6"> {/* Rimosso ml-65 per una migliore centratura nella modale */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Storico Valutazioni Lavorative</h2>

      {feedbacks.length === 0 ? (
        <p className="text-gray-600 mb-4">Nessun feedback disponibile per questo candidato.</p>
      ) : (
        <ul className="space-y-4 mb-6">
          {feedbacks.map(feedback => (
            <li key={feedback.id} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-semibold text-blue-700">Valutazione: {feedback.valutazione}/5</p>
                <p className="text-sm text-gray-500">Data: {new Date(feedback.dataInserita).toLocaleDateString('it-IT')}</p>
              </div>
              <p className="text-gray-700 leading-relaxed">{feedback.commento}</p>
              {feedback.aziendaNome && <p className="text-gray-600 text-sm mt-1">Azienda: {feedback.aziendaNome}</p>}
            </li>
          ))}
        </ul>
      )}

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          <i className="fas fa-plus-circle mr-2"></i> Aggiungi Nuovo Feedback
        </button>
      )}

      {showAddForm && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Aggiungi un Nuovo Feedback</h3>
          <form onSubmit={handleAddFeedbackSubmit} className="space-y-4">
            <div>
              <label htmlFor="valutazione" className="block text-gray-700 text-sm font-bold mb-2">Valutazione (1-5):</label>
              <input
                type="number"
                id="valutazione"
                name="valutazione"
                min="1"
                max="5"
                value={newFeedback.valutazione}
                onChange={handleNewFeedbackChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="commento" className="block text-gray-700 text-sm font-bold mb-2">Commento:</label>
              <textarea
                id="commento"
                name="commento"
                value={newFeedback.commento}
                onChange={handleNewFeedbackChange}
                rows="4"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Invio...' : 'Invia Feedback'}
              </button>
            </div>
            {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
