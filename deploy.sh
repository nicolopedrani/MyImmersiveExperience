#!/bin/bash

# 1. Assicurati di essere sul branch main
git checkout main

# 2. Build del progetto
npm run build

# 3. Crea cartella temporanea per la build
mkdir ../deploy-tmp
cp -r dist/* ../deploy-tmp/

# 4. Passa al branch gh-pages
git checkout gh-pages

# 5. Cancella tutto tranne la cartella .git
rm -rf *

# 6. Copia i file dalla cartella temporanea nella root
cp -r ../deploy-tmp/* .

# 7. Aggiungi, committa e pusha
git add .
git commit -m "Deploy build automatico $(date +'%Y-%m-%d %H:%M:%S')"
git push origin gh-pages

# 8. Torna al branch main
git checkout main

# 9. Elimina cartella temporanea
rm -rf ../deploy-tmp

echo "🚀 Deploy completato!"
