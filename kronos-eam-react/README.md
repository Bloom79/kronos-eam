# Kronos EAM - React Application

Sistema di gestione per impianti energetici rinnovabili - Versione React per deployment su hosting.

## 🚀 Quick Start

### Prerequisiti
- Node.js 16+ 
- npm o yarn

### Installazione

```bash
# Installa le dipendenze
npm install

# Avvia l'applicazione in modalità sviluppo
npm start
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

### Build per produzione

```bash
# Crea la build ottimizzata
npm run build

# La build sarà nella cartella 'build'
```

## 📁 Struttura del Progetto

```
kronos-eam-react/
├── public/              # File statici
├── src/
│   ├── components/      # Componenti React riutilizzabili
│   ├── contexts/        # Context providers (Theme, Auth, Notifications)
│   ├── pages/          # Pagine dell'applicazione
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Componente principale
│   └── index.tsx       # Entry point
├── package.json
└── README.md
```

## 🌟 Funzionalità Principali

- **Dashboard**: Panoramica completa con metriche e stato integrazioni
- **Gestione Impianti**: Anagrafica centralizzata degli impianti
- **Workflow Management**: Gestione processi burocratici
- **Agenda Intelligente**: Scadenze e promemoria automatici
- **Integrazioni**: Connessioni con GSE, Terna, Dogane, DSO
- **AI Assistant**: Estrazione automatica dati da documenti
- **Multi-tenant**: Supporto per gestione multi-cliente
- **Dark Mode**: Tema chiaro/scuro

## 🛠️ Tecnologie Utilizzate

- **React 18** con TypeScript
- **React Router v6** per la navigazione
- **Tailwind CSS** per lo styling
- **Chart.js** per i grafici
- **Lucide React** per le icone
- **Context API** per lo state management

## 📦 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Trascina la cartella 'build' su Netlify
```

### Server Tradizionale
```bash
npm run build
# Copia il contenuto della cartella 'build' sul server
```

## 🔧 Configurazione

Le variabili d'ambiente possono essere configurate in un file `.env`:

```env
REACT_APP_API_URL=https://api.kronoseam.it
REACT_APP_VERSION=1.0.0
```

## 📱 Responsive Design

L'applicazione è completamente responsive e ottimizzata per:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🔐 Sicurezza

- Autenticazione multi-fattore
- Crittografia dei dati sensibili
- Conformità GDPR
- Isolamento multi-tenant

## 🚧 Sviluppo Futuro

- [ ] Implementazione completa di tutte le pagine
- [ ] Integrazione con backend API
- [ ] Sistema di notifiche real-time
- [ ] PWA support
- [ ] Test automatizzati

## 📄 Licenza

Proprietà di Kronos EAM. Tutti i diritti riservati.