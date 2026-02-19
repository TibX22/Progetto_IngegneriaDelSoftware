// components/CompanyDashboard/PostedJobs.js
import React from 'react';
// Removed: import styles from './CompanyDashboard.module.css'; // Replaced by Tailwind CSS

export default function PostedJobs() {
  const jobs = [
    {
      icon: 'fas fa-code',
      title: 'Sviluppatore Backend Senior', // Tradotto: Senior Backend Developer
      description: 'Cercasi esperto in Node.js e microservizi. Settore IT.', // Tradotto: Seeking an expert in Node.js and microservices. IT sector.
    },
    {
      icon: 'fas fa-paint-brush',
      title: 'Lead UX/UI Designer', // Keeping English as per common practice for job titles
      description: 'Posizione per un designer con esperienza in Figma e prototipazione.', // Tradotto: Position for a designer with experience in Figma and prototyping.
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Digital Marketing Manager', // Keeping English as per common practice for job titles
      description: 'Opportunità per un professionista con forti competenze SEO/SEM.', // Tradotto: Opportunity for a professional with strong SEO/SEM skills.
    },
    {
        icon: 'fas fa-cogs',
        title: 'Ingegnere DevOps', // Tradotto: DevOps Engineer
        description: 'Implementare e gestire pipeline CI/CD e infrastrutture cloud.', // Tradotto: Implement and manage CI/CD pipelines and cloud infrastructure.
    },
    {
        icon: 'fas fa-headset',
        title: 'Specialista Successo Clienti', // Tradotto: Customer Success Specialist
        description: 'Collaborare con i clienti per garantire soddisfazione e fidelizzazione del prodotto.', // Tradotto: Engage with clients to ensure product satisfaction and retention.
    },
  ];

  return (
    <div className="bg-white p-6 sm:p-7 rounded-xl shadow-lg"> {/* Adjusted padding for better responsiveness */}
      <h2 className="text-gray-800 text-2xl sm:text-3xl font-semibold mb-5 flex items-center gap-2 sm:gap-3 border-b pb-3 sm:pb-4 border-gray-200"> {/* Adjusted font sizes, gap, and padding for responsiveness */}
        <i className="fas fa-list-alt text-blue-600 text-xl sm:text-2xl"></i> Le Tue Offerte di Lavoro {/* Tradotto: Your Job Offers */}
      </h2>
      
      <ul className="list-none p-0 m-0">
        {jobs.map((job, index) => (
          <li key={index} className="flex items-start gap-4 sm:gap-5 py-4 sm:py-5 border-b border-gray-200 last:border-b-0"> {/* Adjusted gap and padding for responsiveness */}
            <div className="bg-blue-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center text-lg sm:text-xl flex-shrink-0 shadow-md"> {/* Adjusted size and font size for responsiveness */}
              <i className={job.icon}></i>
            </div>
            <div className="flex-grow">
              <h3 className="text-gray-900 text-lg sm:text-xl font-semibold mb-1">{job.title}</h3> {/* Adjusted font size */}
              <p className="text-gray-600 text-sm sm:text-base">{job.description}</p> {/* Adjusted font size */}
            </div>
            <button className="text-blue-500 hover:text-blue-700 transition-colors duration-200 text-base sm:text-lg"> {/* Adjusted font size */}
              <i className="fas fa-arrow-right"></i>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
