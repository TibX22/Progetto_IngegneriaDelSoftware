import React from 'react';
import styles from './CandidateDashboard.module.css'; // Importa il modulo CSS

export default function RecentActivity() {
  const activities = [
    {
      icon: 'fas fa-check',
      title: 'Candidatura accettata',
      description: 'La tua candidatura per "Sviluppatore Frontend Senior" presso TechInnovations è stata accettata.',
    },
    {
      icon: 'fas fa-calendar-alt',
      title: 'Colloquio programmato',
      description: 'Hai un colloquio con DigitalSolutions per la posizione di "Product Manager" il 15 giugno alle 14:30.',
    },
    {
      icon: 'fas fa-envelope-open-text',
      title: 'Nuovo messaggio',
      description: 'Hai ricevuto un messaggio dal recruiter di CreativeMinds riguardo alla tua candidatura.',
    },
  ];

  return (
    <div className={styles.recentActivity}> {/* Applica la classe del modulo CSS */}
      <h2 className={styles.sectionTitle}> {/* Applica la classe del modulo CSS */}
        <i className="fas fa-clock"></i> Attività recenti
      </h2>
      
      <ul className={styles.activityList}> {/* Applica la classe del modulo CSS */}
        {activities.map((activity, index) => (
          <li className={styles.activityItem} key={index}> {/* Applica la classe del modulo CSS */}
            <div className={styles.activityIcon}> {/* Applica la classe del modulo CSS */}
              <i className={activity.icon}></i>
            </div>
            <div>
              <h3 className={styles.activityTitle}>{activity.title}</h3> {/* Applica la classe del modulo CSS */}
              <p className={styles.activityDesc}>{activity.description}</p> {/* Applica la classe del modulo CSS */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
