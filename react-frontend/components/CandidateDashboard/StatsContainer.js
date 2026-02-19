import React from 'react';
import styles from './CandidateDashboard.module.css'; // Importa il modulo CSS

export default function StatsContainer() {
  const stats = [
    { title: 'Candidature inviate', icon: 'fas fa-paper-plane', value: '24' },
    { title: 'Candidature accettate', icon: 'fas fa-check-circle', value: '8' },
    { title: 'Colloqui programmati', icon: 'fas fa-comments', value: '5' },
    { title: 'Punteggio profilo', icon: 'fas fa-star', value: '87/100' },
  ];

  return (
    <div className={styles.statsContainer}> {/* Applica la classe del modulo CSS */}
      {stats.map((stat, index) => (
        <div className={styles.statCard} key={index}> {/* Applica la classe del modulo CSS */}
          <h3><i className={stat.icon}></i> {stat.title}</h3>
          <p>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
