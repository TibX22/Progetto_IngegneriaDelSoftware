# Documento di Installazione del Progetto React + Strapi

## 1. Introduzione
Il presente documento ha lo scopo di fornire una guida dettagliata per l’installazione e la corretta configurazione del progetto, articolato in due componenti principali:

* **react-frontend**: interfaccia utente sviluppata con React/Next.js
* **strapi-backend**: backend sviluppato con Strapi, per la gestione dei contenuti e database

L’obiettivo è consentire all’utente di replicare fedelmente l’ambiente di sviluppo predisposto inizialmente, clonando la repository da GitHub che contiene tutti i file e le configurazioni necessari al corretto funzionamento del progetto.

---

## 2. Prerequisiti
Assicurarsi di avere installato sul proprio sistema i seguenti strumenti:

* Node.js (versione consigliata ≥ 18.x e ≤ 22.x LTS)
  * *Nota per Node 24+: potrebbe essere necessario usare il flag `--ignore-engines`*
* npm (incluso in Node.js)
* Editor di testo (es. Visual Studio Code)
* Git (per clonare la repository)

---

## 3. Struttura del Progetto
Il progetto è suddiviso in due directory distinte all'interno della repository principale:

* **react-frontend**: contiene il codice sorgente del frontend
* **strapi-backend**: contiene il codice sorgente del backend, incluso il database SQLite locale

---

## 4. Procedura di Installazione

### 4.1 Clonazione della Repository
Aprire il terminale e clonare il progetto da GitHub:
```bash
git clone [https://github.com/TUO-USERNAME/Progetto_IngegneriaDelSoftware.git](https://github.com/TUO-USERNAME/Progetto_IngegneriaDelSoftware.git)
cd Progetto_IngegneriaDelSoftware
```
4.2 Installazione del Backend (Strapi)
Spostarsi nella directory del backend:

```Bash
cd strapi-backend
```
Installare le dipendenze:

```Bash
npm install
```
(Se si verificano errori legati alla versione di Node, utilizzare: npm install --ignore-engines)

Avviare Strapi in modalità sviluppo:

```Bash
npm run develop
```
4.3 Installazione del Frontend (React/Next.js)
Aprire un nuovo terminale e accedere alla directory del frontend:

```Bash
cd react-frontend
```
Installare le dipendenze:

```Bash
npm install
```
(Come per il backend, se necessario usare: npm install --ignore-engines)

Avviare l’applicazione:

```Bash
npm run dev
```
5. Accesso al Progetto
Interfaccia Frontend: accessibile da http://localhost:3000

Pannello di Amministrazione Backend: accessibile da http://localhost:1337/admin

Al primo avvio di Strapi sarà necessario creare un account amministratore per accedere al pannello di gestione.

6. Note Finali e Risoluzione Problemi
Variabili d'ambiente: Se presente un file .env.example, copiarlo e rinominarlo in .env, eventualmente personalizzando i valori.

Problemi di Autenticazione (Errore 403 Forbidden): Nel caso l'utente non riesca a registrarsi/aggiornare i propri dati dal frontend, assicurarsi che nel pannello di Strapi (Settings > Roles > Authenticated) siano attivati i permessi update per Users-permissions e create per i tipi di contenuto correlati.

In caso di problemi con l'avvio del progetto, si consiglia:

Di eliminare la cartella node_modules e il file package-lock.json

Rieseguire npm install (o npm install --ignore-engines)

Verificare la versione installata di Node.js

Non modificare le configurazioni avanzate se non strettamente necessario.

7. Riferimenti
Autori del progetto: Tiberio Sasso, Giuseppe Ranieri

Data: 21/06/2025

Corso: Ingegneria del Software, ITPS-MZ
