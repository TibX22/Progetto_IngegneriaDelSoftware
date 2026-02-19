// components/CompanyDashboard/CompanyWelcomeCard.js
import React from 'react';
// Removed: import styles from './CompanyDashboard.module.css'; // Replaced by Tailwind CSS

export default function CompanyWelcomeCard() {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg"> {/* Adjusted padding for better responsiveness */}
      <h2 className="text-blue-600 text-2xl sm:text-3xl font-bold mb-4">Benvenuto nella Dashboard Aziendale!</h2> {/* Tradotto: Welcome to the Company Dashboard! */}
      <p className="text-gray-700 leading-relaxed mb-6 text-base sm:text-lg">Qui puoi gestire le tue offerte di lavoro, tracciare le candidature e monitorare le tue statistiche di recruiting. Il tuo tasso di successo nelle assunzioni è del 45%, superiore alla media del settore.</p> {/* Tradotto: Here you can manage your job offers, track applications, and monitor your recruiting statistics. Your hiring success rate is 45%, higher than the industry average. */}
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 flex-wrap"> {/* Ensures buttons stack on small screens */}
        <button className="bg-blue-600 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-lg text-base sm:text-lg font-semibold cursor-pointer transition-colors duration-300 hover:bg-blue-700 shadow-lg inline-flex items-center justify-center gap-2 sm:gap-3"> {/* Adjusted padding, font size, and centered content */}
          <i className="fas fa-plus-circle"></i> Pubblica Nuova Offerta {/* Tradotto: Publish New Offer */}
        </button>
        <button className="bg-cyan-600 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-lg text-base sm:text-lg font-semibold cursor-pointer transition-colors duration-300 hover:bg-cyan-700 shadow-lg inline-flex items-center justify-center gap-2 sm:gap-3"> {/* Adjusted padding, font size, and centered content */}
          <i className="fas fa-users"></i> Gestisci Candidati {/* Tradotto: Manage Candidates */}
        </button>
      </div>
    </div>
  );
}
