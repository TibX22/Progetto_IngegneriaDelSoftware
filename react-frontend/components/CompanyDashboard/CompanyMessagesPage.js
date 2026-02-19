// components/CompanyDashboard/CompanyMessagesPage.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function CompanyMessagesPage({ aziendaId }) { // Aggiunto aziendaId come prop
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati per il modale "Nuovo Messaggio"
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageObject, setNewMessageObject] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [newMessageRecipientType, setNewMessageRecipientType] = useState('candidato'); // 'candidato' or 'azienda'
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [selectedRecipientName, setSelectedRecipientName] = useState(''); // Per mostrare il nome selezionato
  const [searchTerm, setSearchTerm] = useState(''); // Per la ricerca di candidati/aziende
  const [searchResults, setSearchResults] = useState([]); // Risultati della ricerca
  const [searching, setSearching] = useState(false); // Stato per la ricerca
  const [sendMessageError, setSendMessageError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Endpoint API Strapi
  const STRAPI_BASE_URL = 'http://localhost:1337';
  const MESSAGES_API_ENDPOINT = 'api/messaggios';
  const CANDIDATES_API_ENDPOINT = 'api/candidatoes'; // Endpoint per i candidati
  const AZIENDAS_API_ENDPOINT = 'api/aziendas'; // Endpoint per le aziende

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

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      // MODIFICA: Popolamento più robusto e meno specifico sui campi, per evitare Bad Request.
      // Chiediamo di popolare 'aziendas' e 'candidatoes', e all'interno di 'candidatoes'
      // chiediamo di popolare 'profilo_candidato'.
      const populateString = 'populate[aziendas]=true&populate[candidatoes][populate][profilo_candidato]=true';
      const response = await fetch(`${STRAPI_BASE_URL}/${MESSAGES_API_ENDPOINT}?${populateString}`, { headers });
      
      if (!response.ok) {
        // Logga il testo della risposta per maggiori dettagli sull'errore 400
        const errorText = await response.text();
        console.error("Errore dettagliato fetchMessages:", errorText);
        throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      
      // Log per debugging: guarda la struttura esatta dei dati ricevuti dopo il popolamento
      console.log("Raw fetched messages data with deep populate:", data.data);

      const fetchedMessages = data.data.map(item => {
        // Accedi direttamente alle proprietà dell'oggetto 'item'
        // come indicato dal tuo console.log per i campi diretti del messaggio
        if (!item || typeof item.oggetto === 'undefined') {
          console.warn("Message item with missing or malformed data:", item);
          return {
            id: item?.id, 
            oggetto: 'Dati messaggio mancanti',
            contenuto: 'Contenuto non disponibile.',
            dataOraInvio: null,
            tipoMessaggio: 'Sconosciuto',
            statoMessaggio: 'Sconosciuto',
            senders: [],
            recipients: []
          };
        }

        return {
          id: item.id,
          oggetto: item.oggetto || 'Nessun Oggetto', 
          contenuto: item.contenuto || 'Nessun contenuto.',
          dataOraInvio: item.dataOraInvio,
          tipoMessaggio: item.tipoMessaggio || 'Generico',
          statoMessaggio: item.statoMessaggio || 'inviato',
          // MODIFICA: Accedi ai nomi/cognomi tramite 'attributes' delle relazioni popolate
          // `az.attributes?.nome` è la struttura corretta quando populate[aziendas]=true
          senders: item.aziendas?.data?.map(az => az.attributes?.nome) || [], 
          // `cand.attributes?.profilo_candidato?.data?.attributes?.nome` è la struttura per doppio populate
          recipients: item.candidatoes?.data?.map(cand => `${cand.attributes?.profilo_candidato?.data?.attributes?.nome || ''} ${cand.attributes?.profilo_candidato?.data?.attributes?.cognome || ''}`.trim()) || [],
        };
      });
      setMessages(fetchedMessages);
    } catch (err) {
      console.error("Errore nel recupero dei messaggi:", err);
      setError('Errore durante il caricamento dei messaggi: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Aggiunto per debug: logga il valore di aziendaId quando il componente lo riceve o aggiorna
  useEffect(() => {
    console.log("CompanyMessagesPage received aziendaId prop:", aziendaId);
  }, [aziendaId]);


  // Funzione per la ricerca di candidati/aziende
  const handleSearchRecipients = useCallback(async (type, term) => {
    if (!term || term.length < 3) { // Minimo 3 caratteri per la ricerca
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setSearchResults([]);
    const headers = getAuthHeaders();
    if (!headers) {
      setSearching(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      let endpoint = '';

      if (type === 'candidato') {
        endpoint = CANDIDATES_API_ENDPOINT;
        // Usa l'operatore $or per cercare il termine nel nome O nel cognome
        queryParams.append('filters[$or][0][profilo_candidato][nome][$containsi]', term);
        queryParams.append('filters[$or][1][profilo_candidato][cognome][$containsi]', term);
        queryParams.append('populate[profilo_candidato]', 'true'); // Assicurati che profilo_candidato sia popolato
      } else if (type === 'azienda') {
        endpoint = AZIENDAS_API_ENDPOINT;
        queryParams.append('filters[nome][$containsi]', term);
      }

      const response = await fetch(`${STRAPI_BASE_URL}/${endpoint}?${queryParams.toString()}`, { headers });

      if (!response.ok) {
        throw new Error(`Errore durante la ricerca: ${response.status}`);
      }
      const data = await response.json();
      
      const results = data.data.map(item => {
        // Log dettagliato dell'oggetto item per debugging
        console.log("Raw item from Strapi (candidato/azienda - search results):", item);
        
        let nameToDisplay = '';
        if (type === 'candidato') {
          // Accesso diretto alla relazione profilo_candidato sull'oggetto item
          const profiloCandidato = item?.profilo_candidato; 
          
          if (profiloCandidato && typeof profiloCandidato === 'object') {
            const nome = profiloCandidato.nome || '';
            const cognome = profiloCandidato.cognome || '';
            
            if (nome || cognome) { 
              nameToDisplay = `${nome} ${cognome}`.trim();
            } else {
              nameToDisplay = `Candidato Sconosciuto (ID: ${item?.id} - Dati profilo vuoti)`; 
            }
          } else {
            nameToDisplay = `Candidato Sconosciuto (ID: ${item?.id} - Profilo non popolato/mancante)`; 
          }
        } else if (type === 'azienda') {
          // Per le aziende, il nome è direttamente sull'item (se l'item stesso è l'oggetto degli attributi)
          // Oppure è sotto item.attributes.nome (se l'item è l'oggetto con id e attributes)
          nameToDisplay = item?.nome || item?.attributes?.nome || `Azienda Sconosciuta (ID: ${item?.id})`; 
        }

        return {
          id: item?.id, 
          name: nameToDisplay,
          type: type
        };
      });
      setSearchResults(results);
    } catch (err) {
      console.error("Errore durante la ricerca dei destinatari:", err);
      setSendMessageError('Errore durante la ricerca: ' + err.message);
    } finally {
      setSearching(false);
    }
  }, [getAuthHeaders]);

  // Gestore per l'invio del messaggio
  const handleSendMessage = async () => {
    if (!newMessageObject || !newMessageContent || !selectedRecipientId) {
      setSendMessageError('Compila tutti i campi e seleziona un destinatario.');
      return;
    }
    // Aggiungi un controllo per assicurarti che aziendaId sia disponibile
    if (!aziendaId) {
      setSendMessageError('ID azienda mittente non disponibile. Impossibile inviare il messaggio.');
      return;
    }

    setSendingMessage(true);
    setSendMessageError(null);
    const headers = getAuthHeaders();
    if (!headers) {
      setSendingMessage(false);
      return;
    }

    // Prepara il payload per Strapi
    const payload = {
      data: {
        oggetto: newMessageObject,
        contenuto: newMessageContent,
        dataOraInvio: new Date().toISOString(), // Data e ora corrente
        statoMessaggio: 'in invio', // Stato iniziale del messaggio
        tipoMessaggio: 'comunicazione', // Puoi definire altri tipi se necessario (es. 'notifica', 'richiesta')
      }
    };

    // Aggiungi la relazione corretta per il destinatario
    if (newMessageRecipientType === 'candidato') {
      payload.data.candidatoes = [selectedRecipientId]; 
    } else if (newMessageRecipientType === 'azienda') {
      payload.data.aziendas = [selectedRecipientId]; // Aggiunge l'azienda destinataria
    }

    // SEMPRE aggiungi l'azienda mittente (l'azienda corrente loggata)
    // Assicurati che il campo 'aziendas' esista e sia un array di ID per le relazioni manyToMany
    if (!payload.data.aziendas) {
      payload.data.aziendas = [];
    }
    // Evita di aggiungere l'azienda mittente due volte se è anche il destinatario
    // Utilizza === per il confronto stretto
    if (newMessageRecipientType === 'azienda' && payload.data.aziendas.includes(aziendaId)) {
        // Già aggiunto come destinatario, non fare nulla
    } else {
        payload.data.aziendas.push(aziendaId);
    }

    try {
      const response = await fetch(`${STRAPI_BASE_URL}/${MESSAGES_API_ENDPOINT}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore HTTP durante l'invio del messaggio: ${response.status} - ${errorText}`);
      }

      // Aggiorna lo stato del messaggio dopo l'invio con successo
      fetchMessages(); 
      handleCloseNewMessageModal(); // Chiudi il modale
      // Puoi aggiungere una notifica di successo qui, es. un toast
    } catch (err) {
      console.error("Errore durante l'invio del messaggio:", err);
      setSendMessageError('Errore durante l\'invio del messaggio: ' + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Funzione per aprire il modale
  const handleOpenNewMessageModal = () => {
    setShowNewMessageModal(true);
    setNewMessageObject('');
    setNewMessageContent('');
    setNewMessageRecipientType('candidato');
    setSelectedRecipientId('');
    setSelectedRecipientName('');
    setSearchTerm('');
    setSearchResults([]);
    setSendMessageError(null);
  };

  // Funzione per chiudere il modale
  const handleCloseNewMessageModal = () => {
    setShowNewMessageModal(false);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-100 text-gray-700 p-8">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-xl">Caricamento messaggi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600">
        <i className="fas fa-exclamation-triangle mr-2"></i> Errore: {error}
      </div>
    );
  }

  return (
    <div className="bg-white ml-65 p-6 rounded-xl shadow-lg mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-comments mr-3 text-blue-600"></i> I Miei Messaggi e Comunicazioni
      </h2>

      {messages.length === 0 ? (
        <p className="text-gray-600">Nessun messaggio o comunicazione disponibile.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map(msg => (
            <li key={msg.id} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-semibold text-gray-800">{msg.oggetto}</p>
                <span className="text-sm text-gray-500">
                  {msg.dataOraInvio ? new Date(msg.dataOraInvio).toLocaleDateString('it-IT') : 'Data Sconosciuta'}
                </span>
              </div>
              <p className="text-gray-700">{msg.contenuto}</p>
              <p className="text-gray-600 text-xs mt-1">
                Tipo: {msg.tipoMessaggio} | Stato: {msg.statoMessaggio}
                {/* Visualizzazione dei mittenti e destinatari */}
                {msg.senders.length > 0 && ` | Mittente: ${msg.senders.join(', ')}`}
                {msg.recipients.length > 0 && ` | Destinatario: ${msg.recipients.join(', ')}`}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleOpenNewMessageModal}
          disabled={!aziendaId} // Disabilita il pulsante se aziendaId non è disponibile
          title={!aziendaId ? "Caricamento ID azienda in corso..." : "Invia un nuovo messaggio"} // Tooltip
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fas fa-plus-circle mr-2"></i> Nuovo Messaggio
        </button>
      </div>

      {/* Modale per la creazione di un nuovo messaggio */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Componi Nuovo Messaggio</h3>

            <div className="mb-4">
              <label htmlFor="messageObject" className="block text-gray-700 text-sm font-bold mb-2">Oggetto:</label>
              <input
                type="text"
                id="messageObject"
                value={newMessageObject}
                onChange={(e) => setNewMessageObject(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Oggetto del messaggio"
                disabled={sendingMessage}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="messageContent" className="block text-gray-700 text-sm font-bold mb-2">Contenuto:</label>
              <textarea
                id="messageContent"
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                rows="5"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Scrivi il tuo messaggio qui..."
                disabled={sendingMessage}
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="recipientType" className="block text-gray-700 text-sm font-bold mb-2">Tipo Destinatario:</label>
              <select
                id="recipientType"
                value={newMessageRecipientType}
                onChange={(e) => {
                  setNewMessageRecipientType(e.target.value);
                  setSelectedRecipientId('');
                  setSelectedRecipientName('');
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={sendingMessage}
              >
                <option value="candidato">Candidato</option>
                <option value="azienda">Azienda</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="searchTerm" className="block text-gray-700 text-sm font-bold mb-2">
                Cerca Destinatario ({newMessageRecipientType === 'candidato' ? 'Nome Candidato' : 'Nome Azienda'}):
              </label>
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearchRecipients(newMessageRecipientType, e.target.value);
                }}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder={`Cerca ${newMessageRecipientType === 'candidato' ? 'candidati...' : 'aziende...'}`}
                disabled={sendingMessage}
              />
              {searching && <p className="text-blue-500 text-sm mt-1">Ricerca in corso...</p>}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded max-h-40 overflow-y-auto">
                  {searchResults.map(result => (
                    <div
                      key={result.id}
                      className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedRecipientId === result.id ? 'bg-blue-100' : ''}`}
                      onClick={() => {
                        setSelectedRecipientId(result.id);
                        setSelectedRecipientName(result.name);
                        setSearchResults([]); // Chiudi i risultati dopo la selezione
                        setSearchTerm(result.name); // Imposta il termine di ricerca con il nome selezionato
                      }}
                    >
                      {result.name}
                    </div>
                  ))}
                </div>
              )}
              {selectedRecipientName && (
                <p className="mt-2 text-green-700 font-semibold">Destinatario selezionato: {selectedRecipientName}</p>
              )}
            </div>

            {sendMessageError && <p className="text-red-500 text-sm mb-4">{sendMessageError}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseNewMessageModal}
                disabled={sendingMessage}
                className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sendingMessage || !selectedRecipientId}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? 'Invio...' : 'Invia Messaggio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
