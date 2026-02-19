// components/CandidateDashboard/CandidateDashboard.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import WelcomeCard from './WelcomeCard';
import StatsContainer from './StatsContainer';
import RecentActivity from './RecentActivity';
import Sidebar from './Sidebar';
import UserProfile from './UserProfile';
import CareerGoals from './CareerGoals';
import JobOffers from './JobOffers';
import AppliedJobs from './AppliedJobs';
import MessaggiPage from './MessaggiPage'; // AGGIORNATO: Importa il componente MessaggiPage
import styles from './CandidateDashboard.module.css';

export default function CandidateDashboard() {
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [currentPath, setCurrentPath] = useState('/dashboard/candidato');

  const toggleSidebar = () => {
    setIsSidebarActive(prev => !prev);
  };

  const navigateTo = useCallback((path) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.location.hash = path.replace('/dashboard/candidato/', '');
    }
    setIsSidebarActive(false);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
      let newPath = '/dashboard/candidato';

      if (hash === 'profilo') {
        newPath = '/dashboard/candidato/profilo';
      } else if (hash === 'obiettivi-carriera') {
        newPath = '/dashboard/candidato/obiettivi-carriera';
      } else if (hash === 'certificazioni') {
        newPath = '/dashboard/candidato/certificazioni';
      } else if (hash === 'badge') {
        newPath = '/dashboard/candidato/badge';
      } else if (hash === 'job-offers') {
        newPath = '/dashboard/candidato/job-offers';
      } else if (hash === 'candidature-inviate') {
        newPath = '/dashboard/candidato/candidature-inviate';
      } else if (hash === 'messaggi') {
        newPath = '/dashboard/candidato/messaggi';
      }

      setCurrentPath(newPath);
    };

    if (typeof window !== 'undefined') {
      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange);
      }
    };
  }, []);

  const renderContent = () => {
    switch (currentPath) {
      case '/dashboard/candidato/profilo':
        return (
          <div className={styles.userProfile}>
            <UserProfile />
          </div>
        );
      case '/dashboard/candidato/obiettivi-carriera':
        return (
          <div className={styles.careerGoals}>
            <CareerGoals />
          </div>
        );
      case '/dashboard/candidato/certificazioni':
        return (
          <div className={styles.certificationsContainer}>
            <h2 className={styles.sectionTitle}>Le Mie Certificazioni</h2>
            <p>Contenuto della pagina delle certificazioni...</p>
          </div>
        );
      case '/dashboard/candidato/badge':
        return (
          <div className={`${styles.welcomeCard} `}>
            <h2 className={styles.sectionTitle}>I Miei Badge</h2>
            <p>Contenuto della pagina dei badge...</p>
          </div>
        );
      case '/dashboard/candidato/job-offers':
        return (
          <div className={styles.jobOffersContainer}>
            <JobOffers />
          </div>
        );
      case '/dashboard/candidato/candidature-inviate':
        return (
          <div className={styles.appliedJobsContainer}>
            <AppliedJobs />
          </div>
        );
      case '/dashboard/candidato/messaggi':
        return (
          <div className={styles.messagesPageContainer}>
            <MessaggiPage /> {/* AGGIORNATO: Ora renderizza il componente */}
          </div>
        );
      case '/dashboard/candidato':
      default:
        return (
          <div className={styles.dashboardContent}>
            <div className={styles.welcomeCard}>
              <WelcomeCard />
            </div>
            <div className={styles.statsContainer}>
              <StatsContainer />
            </div>
            <div className={styles.recentActivity}>
              <RecentActivity />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar
        isActive={isSidebarActive}
        onClose={toggleSidebar}
        onNavigate={navigateTo}
        currentPath={currentPath}
      />

      <div className={`${styles.mainContent} ${isSidebarActive ? '' : styles.sidebarCollapsed}`}>
        <Header onMenuToggle={toggleSidebar} />
        <main>
          {renderContent()}
        </main>
      </div>

      {isSidebarActive && <div className={styles.sidebarOverlay} onClick={toggleSidebar}></div>}
    </div>
  );
}
