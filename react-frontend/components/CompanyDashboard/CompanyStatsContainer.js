// components/CompanyDashboard/CompanyStatsContainer.js
import React from 'react';
// Removed: import styles from './CompanyDashboard.module.css'; // Replaced by Tailwind CSS

export default function CompanyStatsContainer() {
  const stats = [
    { title: 'Offerte Pubblicate', icon: 'fas fa-briefcase', value: '18' }, // Tradotto: Published Offers
    { title: 'Candidature Ricevute', icon: 'fas fa-user-tie', value: '156' }, // Tradotto: Received Applications
    { title: 'Colloqui Programmati', icon: 'fas fa-handshake', value: '23' }, // Tradotto: Scheduled Interviews
    { title: 'Assunzioni Effettuate', icon: 'fas fa-user-check', value: '7' }, // Tradotto: Hires Made
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 mt-4"> {/* Adjusted grid for better responsiveness, especially for larger screens */}
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-5 rounded-xl shadow-md text-center transition-all duration-200 hover:translate-y-[-5px] hover:shadow-lg"> {/* Adjusted padding for better fit */}
          <h3 className="text-gray-800 text-base sm:text-lg font-semibold mb-3 flex flex-col items-center justify-center gap-2"> {/* Adjusted font sizes, flex-col for better stacking on small screens */}
            <i className={`${stat.icon} text-blue-600 text-2xl sm:text-3xl`}></i> {stat.title} {/* Adjusted icon size */}
          </h3>
          <p className="text-blue-600 text-3xl sm:text-4xl font-bold">{stat.value}</p> {/* Adjusted font sizes */}
        </div>
      ))}
    </div>
  );
}
