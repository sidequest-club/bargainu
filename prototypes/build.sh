#!/bin/sh
# Builds the three prototypes and the comparison page into prototypes/dist:
#   dist/index.html  comparison page
#   dist/1/ dist/2/ dist/3/  the prototypes
# Usage: ./build.sh            build everything
#        ./build.sh --shots    also retake the home screenshots used on the comparison page
set -e
cd "$(dirname "$0")"

rm -rf dist
mkdir -p dist
n=1
for dir in 1-default 2-impeccable-taste 3-reference; do
  (cd "$dir" && npm install --no-audit --no-fund >/dev/null && npm run build)
  cp -R "$dir/dist" "dist/$n"
  n=$((n + 1))
done
cp -R landing/. dist/

if [ "$1" = "--shots" ]; then
  npx --yes serve dist -l 5180 >/dev/null 2>&1 &
  SERVER=$!
  sleep 3
  for n in 1 2 3; do
    shared/scripts/shot.sh "http://localhost:5180/$n/" "landing/shots/$n-desktop.png" 1440 1100
    shared/scripts/shot.sh "http://localhost:5180/frame#$n/" "landing/shots/$n-mobile.png" 390 1100
  done
  kill $SERVER; pkill -f "serve dist -l 5180" || true
  cp -Rf landing/shots dist/
fi
echo "built prototypes/dist"
