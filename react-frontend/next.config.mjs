// next.config.mjs (o .js)
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'via.placeholder.com',
      'randomuser.me',
      'localhost',
      'randomuser.me' // <--- AGGIUNGI QUESTO!
      // Se la tua applicazione Next.js è servita su una porta specifica,
      // e l'errore includeva la porta (es. "localhost:3000"), allora dovresti aggiungere anche quella:
      // 'localhost:3000', // Sostituisci 3000 con la tua porta se diverso
    ],
  },
  // ... altre configurazioni ...
};




export default nextConfig; // o module.exports = nextConfig; se è .js