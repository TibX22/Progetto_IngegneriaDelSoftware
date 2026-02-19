// app/layout.js
import './globals.css'; // O il tuo file CSS globale per i reset e utility

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        {/* Qui puoi mettere meta tag globali, favicon, link a CDN globali come Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Altri head elements comuni a tutta l'app */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}