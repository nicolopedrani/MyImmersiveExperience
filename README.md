# MyImmersiveExperience

MyImmersiveExperience/
├── index.html <-- HTML di ingresso (resta nella root)
├── style.css <-- (opzionale) se non vuoi modularizzare anche lo stile
├── src/ <-- 📦 tutto il codice sorgente TypeScript
│ ├── main.ts <-- Entry point
│ ├── modules/ <-- Moduli TS
│ │ ├── assets.ts
│ │ ├── canvas.ts
│ │ ├── input.ts
│ │ ├── map.ts
│ │ ├── player.ts
│ │ └── sprites.ts
├── assets/ <-- Immagini o file statici usati nel gioco
│ ├── Grass_Middle.png
│ ├── Path_Middle.png
│ ├── Oak_Tree.png
│ └── Player.png
├── deploy.sh
├── vite.config.ts
├── package.json
└── README.md

https://www.piskelapp.com/p/create/sprite/

https://itch.io/game-assets/free/tag-characters/tag-pixel-art/tag-sprites

⸻

🕹️ GameDev-JS — Setup con Vite + GitHub Pages

Questo progetto è un semplice gioco sviluppato in JavaScript modulare. Per semplificare lo sviluppo e ottimizzare la distribuzione, è stato integrato Vite come tool di sviluppo moderno.

⸻

🚀 Setup e sviluppo locale 1. Inizializza il progetto:

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
