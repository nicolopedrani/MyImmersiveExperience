# 🎮 Interactive CV Platform

An immersive GameBoy-style interactive portfolio featuring advanced AI-powered conversations, multi-room navigation, and intelligent model selection.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Browser Support](https://img.shields.io/badge/Browser-Chrome%20%7C%20Firefox%20%7C%20Safari%20%7C%20Edge-brightgreen)](docs/user-guide/BROWSER_COMPATIBILITY.md)
[![AI Models](https://img.shields.io/badge/AI-DistilBERT%20%7C%20Qwen%20%7C%20Phi--3-blue)](docs/ai-system/AI_MODELS_COMPARISON.md)

## 🚀 **What is this?**

An interactive portfolio website that combines:
- **Retro GameBoy-style interface** with pixel-perfect design
- **Multi-room navigation system** with smooth transitions
- **Advanced AI conversation system** with 3 different models
- **Intelligent network detection** and user consent management
- **Real-time progress tracking** with background model preloading
- **Cross-browser compatibility** with mobile-first responsive design

## ✨ **Key Features**

### 🤖 **Advanced AI System**
- **3 AI Models**: DistilBERT Q&A (65MB), Qwen Chat (500MB), Phi-3 Advanced (1.8GB)
- **Smart Model Selection**: Device capability detection automatically recommends best model
- **Network Speed Detection**: Analyzes connection speed and provides download recommendations
- **Real-time Progress Tracking**: Live download progress with speed and time estimates
- **Background Preloading**: Models load in background during gameplay

### 🎯 **User Experience**
- **One-Time Consent**: Intelligent consent system that only asks once
- **Progressive Enhancement**: Graceful degradation from advanced to basic models
- **Mobile-First Design**: Touch controls for mobile, keyboard shortcuts for desktop
- **Accessibility**: WCAG 2.1 compliant with screen reader support

### 🏗️ **Technical Architecture**
- **Modern TypeScript**: Fully typed codebase with strict mode
- **Modular Design**: Clean separation of concerns across modules
- **WebGPU/WASM Support**: Hardware acceleration with CPU fallback
- **Client-Side Only**: No server required, deployable to any static host

## 🎮 **How it Works**

1. **GameBoy Interface**: Navigate through different rooms using arrow keys or touch controls
2. **Boss Room**: Interact with the main character to start AI conversations
3. **Model Selection**: Choose from 3 AI models based on your device capabilities
4. **Smart Recommendations**: System analyzes your network and suggests optimal model
5. **Real-time Chat**: Ask questions about the CV with instant AI responses

## 📱 **Browser Support**

| Browser | Desktop | Mobile | WebGPU | Notes |
|---------|---------|--------|---------|-------|
| Chrome  | ✅ Full | ✅ Full | ✅ Yes | Best performance |
| Edge    | ✅ Full | ✅ Full | ✅ Yes | Recommended |
| Firefox | ✅ Good | ✅ Good | ⚠️ Limited | WASM fallback |
| Safari  | ⚠️ Basic | ⚠️ Basic | ❌ No | iOS fallback system |

## 🚀 **Quick Start**

### **Option 1: Try Online**
Visit the live demo: [Your GitHub Pages URL]

### **Option 2: Run Locally**
```bash
# Clone the repository
git clone https://github.com/yourusername/MyImmersiveExperience.git
cd MyImmersiveExperience

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### **Option 3: Deploy Static**
```bash
# Build for production
npm run build

# Deploy dist/ folder to any static host
# (GitHub Pages, Netlify, Vercel, etc.)
```

## 📚 **Documentation**

### **For Developers**
- 🏗️ [System Overview](docs/architecture/SYSTEM_OVERVIEW.md) - High-level architecture
- 📁 [Code Organization](docs/development/CODE_ORGANIZATION.md) - File structure and patterns
- 🔧 [Setup Guide](docs/development/SETUP.md) - Development environment setup
- 📖 [API Reference](docs/development/API_REFERENCE.md) - Functions and interfaces

### **For Designers**
- 🎨 [Design System](docs/design/DESIGN_SYSTEM.md) - GameBoy-style design patterns
- 📱 [Responsive Patterns](docs/design/RESPONSIVE_PATTERNS.md) - Mobile/desktop adaptations
- 🧩 [Component Library](docs/design/COMPONENT_LIBRARY.md) - Reusable UI components

### **For Users**
- 🎮 [User Guide](docs/user-guide/USER_GUIDE.md) - How to use the platform
- 🌐 [Browser Compatibility](docs/user-guide/BROWSER_COMPATIBILITY.md) - Supported browsers
- 🐛 [Troubleshooting](docs/user-guide/TROUBLESHOOTING.md) - Common issues and fixes

### **AI System Deep Dive**
- 🤖 [Model Comparison](docs/ai-system/AI_MODELS_COMPARISON.md) - DistilBERT vs Qwen vs Phi-3
- 📶 [Network Detection](docs/ai-system/NETWORK_DETECTION.md) - Speed analysis system
- ✅ [User Consent Flow](docs/ai-system/USER_CONSENT_FLOW.md) - Download approval process
- 📊 [Progress Tracking](docs/ai-system/PROGRESS_TRACKING.md) - Real-time download monitoring

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Game Engine   │────│   Room Manager   │────│   AI Processor  │
│                 │    │                  │    │                 │
│ • Canvas        │    │ • Navigation     │    │ • 3 AI Models   │
│ • Input         │    │ • State Mgmt     │    │ • Progress      │
│ • Rendering     │    │ • Transitions    │    │ • Network Test  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │ Conversation UI  │
                    │                  │
                    │ • GameBoy Style  │
                    │ • Model Selector │
                    │ • Progress Bars  │
                    │ • Consent Dialog │
                    └──────────────────┘
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](docs/development/CONTRIBUTING.md) for:
- Code style guidelines
- Development workflow
- Testing requirements
- Pull request process

## 🎯 **Roadmap**

### **Completed ✅**
- [x] GameBoy-style interface with multi-room navigation
- [x] 3-model AI system (DistilBERT, Qwen, Phi-3)
- [x] Network speed detection and intelligent recommendations
- [x] Real-time progress tracking with background loading
- [x] Cross-browser compatibility with mobile support
- [x] User consent system with one-time approval

### **Planned 🚧**
- [ ] Additional AI models (LLaMA, Claude)
- [ ] Voice interaction support
- [ ] Multiplayer rooms
- [ ] Achievement system
- [ ] Theme customization
- [ ] PWA offline support

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Transformers.js** - For making browser-based AI possible
- **Microsoft Phi-3** - For providing state-of-the-art language models
- **Hugging Face** - For model hosting and excellent documentation
- **GameBoy Design** - Inspired by Nintendo's iconic handheld console

---

**Built with ❤️ using TypeScript, HTML5 Canvas, and cutting-edge browser AI**

*For technical support, feature requests, or contributions, please open an issue on GitHub.*

---

## 🔄 **Development History & Legacy Documentation**

npm init -y

    2.	Installa Vite come dipendenza di sviluppo:

npm install vite --save-dev

    3.	Aggiorna il package.json con gli script Vite:

"scripts": {
"dev": "vite",
"build": "vite build",
"preview": "vite preview"
}

    4.	Avvia il server di sviluppo (hot reload incluso):

npm run dev

Questo apre una pagina locale (es. http://localhost:5173) che si aggiorna automaticamente ogni volta che modifichi i file (main.js, moduli, HTML, CSS, ecc.).

⸻

📦 Build di produzione

Per creare la versione ottimizzata del gioco:

npm run build

Questo comando genera una cartella dist/ con tutti i file minificati e pronti per essere pubblicati.

⸻

🔍 Anteprima locale della build

Per vedere il risultato della build come apparirà online:

npm run preview

⚠️ Questo comando va eseguito dalla root del progetto, non dentro dist/. Vite gestisce internamente il server.

⸻

🌍 Deploy su GitHub Pages

Per pubblicare il gioco su GitHub Pages: 1. Crea un branch chiamato gh-pages (se non esiste):

git checkout -b gh-pages

    2.	Sposta i contenuti della cartella dist/ in root di gh-pages:

Puoi fare questo manualmente o con uno script (es. usando gh-pages npm package, oppure semplicemente copiando i file a mano). 3. Esegui push del branch:

git add .
git commit -m "Deploy build to GitHub Pages"
git push origin gh-pages

    4.	Vai su GitHub → Settings → Pages e imposta la pubblicazione dal branch gh-pages.

⸻

⚙️ Advanced (opzionale ma utile)

🧩 vite.config.js

Puoi creare un file vite.config.js nella root del progetto per:
• Cambiare la root del progetto
• Impostare un base path (utile su GitHub Pages!)
• Aggiungere plugin, alias, ottimizzazioni, ecc.

Esempio utile per GitHub Pages:

// vite.config.js
export default {
base: '/nome-repo/', // 🔁 importante se usi GitHub Pages!
};

⚠️ Sostituisci nome-repo con il nome esatto del repository GitHub.

⸻

📝 Sistemare index.html per Vite

Vite ha una particolarità: carica gli script modulari usando import dinamici. Quindi:
• Nel tuo index.html, assicurati di usare:

<script type="module" src="/main.js"></script>

    •	Se usi percorsi relativi nei moduli, preferisci ./ o assoluti dal root virtuale di Vite (/modules/xyz.js).

Nel sistema di coordinate del canvas HTML5:
• L’origine (0, 0) si trova in alto a sinistra.
• L’asse X cresce verso destra.
• L’asse Y cresce verso il basso.

⸻

🐛 Debug Dashboard (solo in sviluppo)

Durante lo sviluppo è attiva una dashboard di debug visibile in alto a sinistra, che mostra:
• Coordinate del player (x, y)
• Direzione (up, down, left, right)
• Stato (idle, walk)
• Frame dell’animazione corrente
• FPS aggiornati ogni secondo

Questa dashboard serve solo per test e debug locale e non deve essere visibile nella versione pubblicata.

⸻

🔧 Cosa modificare prima della pubblicazione

✅ Metodo 1 — Disabilitarla con un flag in main.js

Nel file main.js, modifica così la chiamata a updateDebugPanel():

// main.js
if (import.meta.env.DEV) {
updateDebugPanel(currentTime);
}

Questo funziona automaticamente con Vite: quando fai npm run dev, import.meta.env.DEV è true.
Quando fai npm run build, la dashboard non verrà eseguita.

⸻

✅ Metodo 2 — Rimuovere il pannello HTML in index.html

Nel file index.html, puoi rimuovere o commentare il blocco HTML della dashboard:

<!--
<div id="debug-panel" style="...">...</div>
-->

Oppure puoi nasconderlo con CSS, se vuoi che resti nel DOM ma invisibile in produzione:

<div id="debug-panel" style="display: none;">...</div>

⸻

✅ Metodo 3 — Rimuovere completamente il modulo debug.js

Se sei pronto per il rilascio definitivo:
• Rimuovi l’import da main.js:

// import { updateDebugPanel } from "./modules/debug.js";

    •	Rimuovi anche la chiamata dentro gameLoop():

// updateDebugPanel(currentTime);

    •	E puoi eliminare direttamente il file modules/debug.js.

⸻

✅ Suggerimento finale

Per la massima flessibilità, ti consiglio di tenere il modulo debug.js nel progetto ma attivarlo solo in sviluppo tramite:

if (import.meta.env.DEV) {
updateDebugPanel(currentTime);
}

---

## 🔤 Introduzione a TypeScript nel progetto

Durante lo sviluppo di questo progetto abbiamo introdotto **TypeScript**, un superset di JavaScript che aggiunge **tipizzazione statica** e altri strumenti per scrivere codice più robusto e manutenibile.

### Perché abbiamo usato TypeScript?

- **Riduce gli errori** di programmazione, segnalando problemi di tipo già in fase di scrittura (ad esempio variabili usate in modo errato o funzioni chiamate con parametri sbagliati).
- **Migliora la leggibilità e documentazione** del codice grazie ai tipi espliciti, facilitando la comprensione e la collaborazione.
- **Rende il codice più scalabile** e facile da mantenere in progetti più grandi o complessi.
- Permette di sfruttare **tool moderni** come Vite che integrano TypeScript senza difficoltà.

### Cosa è stato fatto?

- Rinominati i file `.js` in `.ts` e aggiunti tipi espliciti a variabili, funzioni e oggetti.
- Definiti tipi personalizzati per entità chiave (es. `Player`, `Direction`, `AnimationState`).
- Tipizzato correttamente le funzioni principali per avere controlli statici durante lo sviluppo.
- Modificata la configurazione del progetto per supportare TypeScript con Vite.

### Come funziona con il progetto

Il codice TypeScript viene **compilato in JavaScript** prima di essere eseguito nel browser, quindi:

- Puoi scrivere codice più sicuro e chiaro.
- Il browser continua a eseguire solo JavaScript standard.
- Vite si occupa di trasformare i file `.ts` in `.js` automaticamente durante lo sviluppo e la build.

---

## 🌍 Deploy su GitHub Pages — Guida completa

Per pubblicare questo progetto su GitHub Pages in modo ordinato e sicuro, abbiamo seguito questi passaggi:

### 1. Inizializzazione di Git

Se non lo avevi già fatto:

```bash
git init
git add .
git commit -m "Primo commit"
```

Poi si crea il repository su GitHub e si collega:

```bash
git remote add origin https://github.com/tuo-username/nome-repo.git
git branch -M main
git push -u origin main
```

---

### 2. Creazione del branch `gh-pages`

Questo branch ospiterà **solo i file finali pubblicabili**, quindi conviene separarlo dal codice sorgente.

```bash
git checkout -b gh-pages
git add .
git commit -m "Inizializzazione branch gh-pages"
git push origin gh-pages
```

Poi si torna al branch di sviluppo:

```bash
git checkout main
```

---

### 3. Build di produzione

Per generare i file ottimizzati per la pubblicazione:

```bash
npm run build
```

Questo genera la cartella `dist/` con tutti i file pronti per essere pubblicati.

---

### 4. Copia della build in una cartella temporanea

Per evitare di cancellare file importanti:

```bash
mkdir ../deploy-tmp
cp -r dist/* ../deploy-tmp/
```

---

### 5. Pulizia e pubblicazione su `gh-pages`

Si torna al branch `gh-pages`, si cancella tutto (tranne `.git`), e si copiano i file della `dist`:

```bash
git checkout gh-pages
rm -rf *
cp -r ../deploy-tmp/* .
git add .
git commit -m "Deploy build"
git push origin gh-pages
```

Infine, si rimuove la cartella temporanea:

```bash
rm -rf ../deploy-tmp
```

---

### 6. Configurazione di GitHub Pages

- Vai su GitHub → Repository → Settings → Pages
- Imposta la pubblicazione dal branch `gh-pages` → root

Dopo pochi minuti il sito sarà disponibile a:

```
https://tuo-username.github.io/nome-repo/
```

---

✅ Questo processo separa perfettamente il codice sorgente dalla versione pubblicata del gioco e ti consente di mantenere ordine e controllo sul progetto. Se preferisci, in futuro potresti anche automatizzare tutto con uno script `npm run deploy`.

## 📝 Documentazione completa del progetto

Questo progetto contiene un semplice gioco sviluppato in JavaScript modulare con supporto TypeScript e deploy automatico su GitHub Pages.

---

### Setup e sviluppo locale

1. Inizializza il progetto:

```bash
npm init -y
```

2. Installa Vite come dipendenza di sviluppo:

```bash
npm install vite --save-dev
```

3. Aggiungi gli script di sviluppo e build in `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "./deploy.sh"
}
```

4. Avvia il server di sviluppo con hot reload:

```bash
npm run dev
```

---

### Build di produzione

Per creare la versione ottimizzata del gioco:

```bash
npm run build
```

La build viene generata nella cartella `dist/`.

---

### Deploy su GitHub Pages

#### Passaggi principali

1. Inizializza git e collega il repository GitHub (se non fatto):

```bash
git init
git remote add origin https://github.com/tuo-username/nome-repo.git
git branch -M main
git push -u origin main
```

2. Crea e inizializza il branch `gh-pages`:

```bash
git checkout -b gh-pages
git add .
git commit -m "Inizializzazione branch gh-pages"
git push origin gh-pages
git checkout main
```

3. Genera la build:

```bash
npm run build
```

4. Copia la build in una cartella temporanea fuori dalla root del progetto:

```bash
mkdir ../deploy-tmp
cp -r dist/* ../deploy-tmp/
```

5. Passa al branch `gh-pages`, pulisci e copia i file di build:

```bash
git checkout gh-pages
rm -rf *
cp -r ../deploy-tmp/* .
git add .
git commit -m "Deploy build"
git push origin gh-pages
rm -rf ../deploy-tmp
git checkout main
```

6. Configura GitHub Pages su GitHub impostando la pubblicazione dal branch `gh-pages`.

---

### Debug Dashboard

La dashboard di debug è visibile solo in sviluppo. Puoi disattivarla in produzione modificando `main.ts`:

```ts
if (import.meta.env.DEV) {
  updateDebugPanel(currentTime);
}
```

---

### Uso di TypeScript

Abbiamo convertito i file `.js` in `.ts` per avere:

- Tipizzazione statica e meno errori
- Migliore manutenzione e scalabilità
- Supporto integrato con Vite

Il codice TypeScript viene compilato in JavaScript prima di essere eseguito nel browser.

---

### Script di deploy automatico

Per semplificare il deploy, c’è uno script bash `deploy.sh` che esegue tutti i passaggi per pubblicare la build su GitHub Pages.

Rendi eseguibile lo script con:

```bash
chmod +x deploy.sh
```

E lancialo con:

```bash
npm run deploy
```

---

### Dove trovare aiuto

Se vuoi approfondire o automatizzare ulteriormente il progetto, contattami per:

- Configurazioni avanzate di Vite
- Miglioramenti al workflow di deploy
- Supporto su TypeScript o moduli

---

## 🔄 Come tornare a una versione precedente del branch `main`

Se vuoi tornare a un commit precedente nel branch `main`, puoi farlo in vari modi:

### Visualizzare la lista dei commit

```bash
git log --oneline
```

Questo mostra i commit recenti con hash abbreviati e messaggi.

### Passare temporaneamente a un commit specifico (detached HEAD)

```bash
git checkout <commit-hash>
```

### Tornare indietro definitivamente nel branch `main` (hard reset)

⚠️ Attenzione: elimina le modifiche dopo quel commit localmente

```bash
git checkout main
git reset --hard <commit-hash>
```

Per aggiornare anche il repository remoto (GitHub), dovrai forzare il push:

```bash
git push origin main --force
```

### Creare un nuovo branch da un commit precedente

```bash
git checkout -b nome-branch <commit-hash>
```

Questo ti permette di lavorare sul codice di quel commit senza toccare `main`.

---

## 💡 Consigli utili

- Prima di fare un `reset --hard`, assicurati di aver salvato eventuali modifiche importanti.
- Usa `git stash` per mettere da parte temporaneamente modifiche non committate.

---

---

## 📁 Pulizia e inventario immagini nella cartella All_Assets

### 🔤 Rinominare file con spazi

Per sostituire gli spazi nei nomi dei file con underscore:

```bash
find All_Assets -depth -name "* *" | while read file; do
  new_file="$(dirname "$file")/$(basename "$file" | tr ' ' '_')"
  mv "$file" "$new_file"
done
```

Questo comando rinomina tutti i file e le cartelle con spazi, convertendoli in `_`.

---

### 🗂️ Generare inventario degli asset (nome, dimensione, risoluzione)

1. Installa ImageMagick (se non presente):

```bash
brew install imagemagick
```

2. Esegui questo comando per salvare un inventario dei file immagine:

```bash
find All_Assets -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.tmx" -o -iname "*.tsx" \) | while read file; do
  size=$(du -h "$file" | cut -f1)
  dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
  echo "$file | $size | $dimensions"
done > assets_inventory.txt
```

Questo genera un file `assets_inventory.txt` con righe come:

```
All_Assets/ui/icon.png | 20K | 64x64
All_Assets/tilesets/grass.png | 145K | 512x512
```

Great question — adding a folder to .gitignore prevents future additions, but doesn’t automatically remove files that were already tracked by Git.
To remove that folder from Git while keeping it locally, follow these steps:

⸻

✅ 1. Remove the folder from Git (but not from disk)

Run this command from the root of your repo:

git rm -r --cached path/to/your-folder

    •	--cached: removes it only from Git’s index (GitHub), not from your local filesystem.
    •	Replace path/to/your-folder with the actual path (relative to the repo root).

⸻

✅ 2. Commit the removal

git commit -m "Remove folder from repo and add to .gitignore"

⸻

✅ 3. Push to GitHub

git push origin your-branch-name

⸻

After that, the folder will no longer appear on GitHub, and .gitignore will make sure it won’t be re-added.

Let me know if you want to make this part of a deployment or cleanup script!

---

I want 3 adjustments:

- Cannot find module '../../assets/assets_metadata.json'. Consider using '--resolveJsonModule' to import module with '.json' extension.ts(2732)
- remove the words "reading" , "travel" and "football" in the hobbies room
- add just one football ground. The whole asset FootballGround.png is the football ground. Maybe you can divide it in grid and then reassembly the grid pieces in the room

# CLAUDE CODE

https://docs.anthropic.com/en/docs/claude-code/overview#install-and-authenticate
