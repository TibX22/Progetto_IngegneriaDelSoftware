// components/CompanyDashboard/CompanyReportsPage.js
'use client';

import React, { useState, useEffect } from 'react';

export default function CompanyReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simula il recupero dei dati da un'API
    const fetchReportData = () => {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        try {
          // Dati fittizi per le metriche di recruiting
          const data = {
            tassoRispostaMedio: '75%',
            tempoMedioAssunzione: '32 giorni',
            offertePubblicateMeseCorrente: 15,
            candidatureRicevuteMeseCorrente: 250,
            colloquiProgrammatiMeseCorrente: 45,
            assunzioniEffettuateMeseCorrente: 8,
            tassoAccettazioneOfferte: '85%',
            candidatiPerPosizione: '12',
          };
          setReportData(data);
          setLoading(false);
        } catch (err) {
          setError('Errore durante il caricamento dei dati di report.');
          setLoading(false);
        }
      }, 1000); // Simula un ritardo di rete di 1 secondo
    };

    fetchReportData();
  }, []);

  // Mostra un messaggio di caricamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-blue-600 text-lg">Caricamento report...</p>
      </div>
    );
  }

  // Mostra un messaggio di errore
  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500 text-lg">Errore: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg animate-fadeIn">
      <h2 className="text-blue-700 text-3xl font-bold mb-6 border-b pb-4">Statistiche e Report di Recruiting</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Tasso di Risposta Medio */}
        <div className="bg-blue-50 p-5 rounded-lg shadow-md flex items-center space-x-4">
          <div className="text-blue-600 text-4xl">
            <i className="fas fa-percent"></i> {/* Icona per la percentuale */}
          </div>
          <div>
            <p className="text-gray-700 text-lg">Tasso di Risposta Medio</p>
            <p className="text-blue-800 text-2xl font-bold">{reportData.tassoRispostaMedio}</p>
          </div>
        </div>

        {/* Card: Tempo Medio di Assunzione */}
        <div className="bg-green-50 p-5 rounded-lg shadow-md flex items-center space-x-4">
          <div className="text-green-600 text-4xl">
            <i className="fas fa-clock"></i> {/* Icona per l'orologio */}
          </div>
          <div>
            <p className="text-gray-700 text-lg">Tempo Medio di Assunzione</p>
            <p className="text-green-800 text-2xl font-bold">{reportData.tempoMedioAssunzione}</p>
          </div>
        </div>

        {/* Card: Offerte Pubblicate (Mese Corrente) */}
        <div className="bg-yellow-50 p-5 rounded-lg shadow-md flex items-center space-x-4">
          <div className="text-yellow-600 text-4xl">
            <i className="fas fa-briefcase"></i> {/* Icona per la valigetta */}
          </div>
          <div>
            <p className="text-gray-700 text-lg">Offerte Pubblicate (Mese)</p>
            <p className="text-yellow-800 text-2xl font-bold">{reportData.offertePubblicateMeseCorrente}</p>
          </div>
        </div>

        {/* Card: Candidature Ricevute (Mese Corrente) */}
        <div className="bg-purple-50 p-5 rounded-lg shadow-md flex items-center space-x-4">
          <div className="text-purple-600 text-4xl">
            <i className="fas fa-user-tie"></i> {/* Icona per il candidato */}
          </div>
          <div>
            <p className="text-gray-700 text-lg">Candidature Ricevute (Mese)</p>
            <p className="text-purple-800 text-2xl font-bold">{reportData.candidatureRicevuteMeseCorrente}</p>
          </div>
        </div>

        {/* Card: Colloqui Programmati (Mese Corrente) */}
        <div className="bg-red-50 p-5 rounded-lg shadow-md flex items-center space-x-4">
          <div className="text-red-600 text-4xl">
            <i className="fas fa-handshake"></i> {/* Icona per la stretta di mano */}
          </div>
          <div>
            <p className="text-gray-700 text-lg">Colloqui Programmati (Mese)</p>
            <p className="text-red-800 text-2xl font-bold">{reportData.colloquiProgrammatiMeseCorrente}</p>
          </div>
        </div>

        {/* Card: Assunzioni Effettuate (Mese Corrente) */}
        <div className="bg-teal-50 p-5 rounded-lg shadow-md flex items-center space-x-4">
          <div className="text-teal-600 text-4xl">
            <i className="fas fa-user-check"></i> {/* Icona per l'utente con spunta */}
          </div>
          <div>
            <p className="text-gray-700 text-lg">Assunzioni Effettuate (Mese)</p>
            <p className="text-teal-800 text-2xl font-bold">{reportData.assunzioniEffettuateMeseCorrente}</p>
          </div>
        </div>

        {/* Card: Tasso di Accettazione Offerte */}
        <div className="bg-indigo-50 p-5 rounded-lg shadow-md flex items-center space-x-4">
          <div className="text-indigo-600 text-4xl">
            <i className="fas fa-check-circle"></i> {/* Icona per il cerchio con spunta */}
          </div>
          <div>
            <p className="text-gray-700 text-lg">Tasso Accettazione Offerte</p>
            <p className="text-indigo-800 text-2xl font-bold">{reportData.tassoAccettazioneOfferte}</p>
          </div>
        </div>

        {/* Card: Candidati per Posizione */}
        <div className="bg-orange-50 p-5 rounded-lg shadow-md flex items-center space-x-4">
          <div className="text-orange-600 text-4xl">
            <i className="fas fa-users"></i> {/* Icona per gli utenti */}
          </div>
          <div>
            <p className="text-gray-700 text-lg">Candidati per Posizione</p>
            <p className="text-orange-800 text-2xl font-bold">{reportData.candidatiPerPosizione}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
