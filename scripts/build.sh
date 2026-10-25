#!/bin/sh

#jai sri ram
rm -r ./dist
license-checker --json --out ./licenses/licenses.txt
git status
git add .
git commit $1
git push
npm run build -- --linux
npm run build -- --win
gh release create $1 
find ./dist -type f \( -name '*.exe' -o -name '*.flatpak' -o -name '*.AppImage' \) -exec gh release upload "$1" {} +
