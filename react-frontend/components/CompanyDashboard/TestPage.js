// components/CompanyDashboard/TestPage.js
'use client';
import React, { useState, useEffect, useCallback } from 'react';
// IMPORTANTE: Assicurati che TestForm.js sia nella stessa cartella:
// src/components/CompanyDashboard/TestForm.js
import TestForm from './TestForm'; // Componente per il form di creazione/modifica test

export default function TestPage({ aziendaId }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTestForm, setShowTestForm] = useState(false);
  // Ora editingTestId conterrà il documentId del test Strapi (o null se non presente)
  const [editingTestId, setEditingTestId] = useState(null); 

  // Stati per la gestione del modale di conferma
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); // Funzione da eseguire alla conferma

  const STRAPI_BASE_URL = 'http://localhost:1337';
  const TEST_API_ENDPOINT = 'api/tests'; // Endpoint basato sul tuo CT "Test"
  const DOMANDA_API_ENDPOINT = 'api/domandas'; // Endpoint per il CT Domanda

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Migliorata la gestione degli errori in fetchTests
  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${STRAPI_BASE_URL}/${TEST_API_ENDPOINT}?filters[azienda][id]=${aziendaId}&populate=domandas`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null); // Tenta di leggere l'errore JSON
        throw new Error(
          errorData?.error?.message || 
          `Errore ${response.status} durante il recupero dei test`
        );
      }

      const data = await response.json();
      if (!data.data) {
          // Aggiungi un controllo per assicurarti che 'data.data' esista
          throw new Error("Formato dati non valido: 'data' array mancante nella risposta dell'API.");
      }

      setTests(data.data.map(item => {
        // LOG DI DEBUG: Ispeziona l'oggetto 'item' completo ricevuto da Strapi
        console.log("Raw item from Strapi (in TestPage fetchTests):", item); 
        
        // Estrai le proprietà direttamente da 'item', non da 'item.attributes'
        // 'item' qui è l'oggetto singolo dal `data.data.map(item => ...)`
        return { 
          id: item.id, // ID numerico di Strapi
          documentId: item.documentId || item.id, // Usa item.documentId se esiste, altrimenti item.id
          nome: item.nome || '', 
          descrizione: item.descrizione || '',
          punteggioMinimo: item.punteggioMinimo,
          durataMassimaMinuti: item.durataMassimaMinuti,
          attivo: typeof item.attivo === 'boolean' ? item.attivo : true,
          // 'domandas' dovrebbe essere già popolato qui e essere un array di oggetti domanda
          domandas: item.domandas, 
        };
      }));
    } catch (err) {
      console.error("Errore nel recupero dei test:", err);
      setError(err.message); // Usa il messaggio d'errore catturato o un fallback
    } finally {
      setLoading(false);
    }
  }, [aziendaId, getAuthHeaders]);

  useEffect(() => {
    if (aziendaId) {
      fetchTests();
    }
  }, [aziendaId, fetchTests]);

  const handleCreateNewTest = () => {
    setEditingTestId(null);
    setShowTestForm(true);
  };

  // Passa il documentId per la modifica
  const handleEditTest = (testDocumentId) => { 
    console.log("handleEditTest chiamato con Document ID:", testDocumentId); 
    setEditingTestId(testDocumentId);
    setShowTestForm(true);
  };

  // Passa il documentId per la conferma di eliminazione
  const confirmDeleteTest = (testDocumentId) => { 
    setConfirmMessage("Sei sicuro di voler eliminare questo test? Tutte le domande associate verranno rimosse.");
    setConfirmAction(() => () => handleDeleteTest(testDocumentId)); 
    setShowConfirmModal(true);
  };

  // Usa il documentId per l'eliminazione e gestisci 204
  const handleDeleteTest = async (testDocumentId) => {
    if (!testDocumentId) {
      setError("Impossibile eliminare: ID test (documentId) non disponibile per questo test.");
      setShowConfirmModal(false);
      return;
    }

    setShowConfirmModal(false); 
    setLoading(true);

    // Trova il test nello stato corrente per accedere alle sue domande collegate
    const testToDelete = tests.find(test => test.documentId === testDocumentId);

    // Aggiornamento ottimistico dell'UI: rimuove il test eliminato dallo stato locale immediatamente
    setTests(prevTests => prevTests.filter(test => test.documentId !== testDocumentId));

    try {
      // STEP 1: Elimina le domande associate al test
      if (testToDelete && testToDelete.domandas && testToDelete.domandas.length > 0) {
        console.log(`Deleting ${testToDelete.domandas.length} associated questions for test ${testDocumentId}`);
        for (const domanda of testToDelete.domandas) {
          // Usa l'ID numerico della domanda o il suo documentId per l'eliminazione
          const domandaIdForDeletion = domanda.documentId || domanda.id; 
          if (domandaIdForDeletion) {
            const deleteDomandaUrl = `${STRAPI_BASE_URL}/${DOMANDA_API_ENDPOINT}/${domandaIdForDeletion}`;
            console.log("Tentativo di eliminazione domanda con URL:", deleteDomandaUrl);
            const deleteDomandaResponse = await fetch(deleteDomandaUrl, {
              method: 'DELETE',
              headers: getAuthHeaders(),
            });

            if (!deleteDomandaResponse.ok) {
              const errorData = await deleteDomandaResponse.json().catch(() => null);
              console.warn(`Impossibile eliminare la domanda ${domandaIdForDeletion}:`, errorData);
              // Non lanciare un errore qui, continua con l'eliminazione delle altre domande
            }
          }
        }
        console.log("Completata eliminazione domande associate.");
      }

      // STEP 2: Elimina il test principale
      const deleteTestUrl = `${STRAPI_BASE_URL}/${TEST_API_ENDPOINT}/${testDocumentId}`;
      console.log("Tentativo di eliminazione test principale con URL:", deleteTestUrl);
      const response = await fetch(deleteTestUrl, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 204 || response.ok) { 
        console.log("Test principale eliminato con successo.");
        // Resetta lo stato di modifica se il test eliminato era quello in modifica
        if (editingTestId === testDocumentId) {
          setEditingTestId(null);
          setShowTestForm(false);
        }
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 
          `Errore durante l'eliminazione del test principale (status: ${response.status})`
        );
      }
    } catch (err) {
      console.error("Errore durante l'eliminazione del test o delle sue domande:", err);
      setError(err.message || 'Errore durante l\'eliminazione del test');
      // In caso di fallimento, ricarica i test per ripristinare l'UI
      await fetchTests(); 
    } finally {
      setLoading(false);
      // Assicura che la lista sia completamente sincronizzata
      await fetchTests(); 
    }
  };

  const handleSaveSuccess = () => {
    setShowTestForm(false);
    setEditingTestId(null); // Assicurati di resettare l'ID dopo il salvataggio
    fetchTests(); // Ricarica la lista dopo aver salvato
  };

  const handleCancelForm = () => {
    setShowTestForm(false);
    setEditingTestId(null); // Resetta l'ID del test in modifica
  };

  // Componente Modale di Conferma (da integrare direttamente o come componente separato)
  const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <p className="text-lg text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
          >
            Conferma Elimina
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <p className="text-center text-blue-600 text-lg py-8">Caricamento test...</p>;
  if (error) return <p className="text-center text-red-500 text-lg py-8">Errore: {error}</p>;
  if (!aziendaId) return <p className="text-center text-gray-600 text-lg py-8">Caricamento ID azienda...</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-4">Gestione Test di Selezione</h1>

      {!showTestForm && (
        <button
          onClick={handleCreateNewTest}
          className="mb-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center"
        >
          <i className="fas fa-plus-circle mr-2"></i> Crea Nuovo Test
        </button>
      )}

      {showTestForm ? (
        <TestForm
          testId={editingTestId} // Questo sarà il documentId del test
          aziendaId={aziendaId}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancelForm}
        />
      ) : (
        <>
          {tests.length === 0 ? (
            <p className="text-gray-600 text-center py-10">Nessun test di selezione disponibile. Clicca "Crea Nuovo Test" per aggiungerne uno.</p>
          ) : (
            <ul className="space-y-4">
              {tests.map((test) => {
                // LOG AGGIUNTIVO: Mostra id e documentId per ogni test renderizzato
                console.log(`Rendering Test: ID=${test.id}, DocumentId=${test.documentId}, Nome=${test.nome}`);
                return (
                <li key={test.id} className="bg-gray-50 p-4 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-200">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800">{test.nome || 'Test Senza Nome'}</h3> 
                    {test.descrizione && <p className="text-gray-600 text-sm mt-1">{test.descrizione.substring(0, 150)}{test.descrizione.length > 150 ? '...' : ''}</p>}
                    {test.durataMassimaMinuti && <p className="text-gray-500 text-xs mt-1">Durata stimata: {test.durataMassimaMinuti} minuti</p>}
                    {test.punteggioMinimo !== undefined && <p className="text-gray-500 text-xs mt-1">Punteggio minimo per superare: {test.punteggioMinimo}%</p>}
                    <p className="text-gray-500 text-xs mt-1">Domande: {test.domandas?.length || 0}</p> 
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
                    <button
                      onClick={() => handleEditTest(test.documentId)} // Passa test.documentId
                      disabled={!test.documentId} 
                      className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-edit"></i> Modifica
                    </button>
                    <button
                      onClick={() => confirmDeleteTest(test.documentId)} // Passa test.documentId
                      disabled={!test.documentId} 
                      className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-trash"></i> Elimina
                    </button>
                  </div>
                </li>
              );})}
            </ul>
          )}
        </>
      )}

      {showConfirmModal && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}
