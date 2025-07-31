#!/bin/bash

# 1. Assicurati di essere sul branch main
echo "🔄 Passaggio al branch main..."
git checkout main

# 2. Build del progetto
echo "🔨 Esecuzione della build del progetto..."
npm run build

# 3. Crea cartella temporanea per la build
echo "📂 Creazione della cartella temporanea per il deploy..."
mkdir ../deploy-tmp
cp -r dist/* ../deploy-tmp/

# 4. Passa al branch gh-pages
echo "🔄 Passaggio al branch gh-pages..."
git checkout gh-pages

# 5. Cancella tutto tranne la cartella .git
echo "🗑️ Pulizia della cartella gh-pages..."
rm -rf *

# 6. Copia i file dalla cartella temporanea nella root
echo "📂 Copia dei file nella cartella gh-pages..."
cp -r ../deploy-tmp/* .

# 7. Aggiungi, committa e pusha
echo "📦 Aggiunta, commit e push dei file..."
git add .
git commit -m "Deploy build automatico $(date +'%Y-%m-%d %H:%M:%S')"
git push origin gh-pages

# 8. Torna al branch main
echo "🔄 Ritorno al branch main..."
git checkout main

# 9. Elimina cartella temporanea
echo "🗑️ Eliminazione della cartella temporanea...s"
rm -rf ../deploy-tmp

echo "🚀 Deploy completato!"
