#!/bin/sh
# One-shot headless Chrome screenshot. Usage: shot.sh <url> <out.png> [width] [height]
# Each call uses a throwaway profile, so several can run at once.
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE=$(mktemp -d)
rm -f "$2"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
  --user-data-dir="$PROFILE" --window-size="${3:-1440},${4:-2400}" \
  --virtual-time-budget=5000 --screenshot="$2" "$1" >/dev/null 2>&1 &
PID=$!
# Chrome sometimes stays alive after writing the file, so wait for the file and then stop it.
i=0
while [ $i -lt 60 ] && [ ! -s "$2" ]; do sleep 0.5; i=$((i + 1)); done
sleep 1
kill $PID 2>/dev/null
wait $PID 2>/dev/null
rm -rf "$PROFILE"
[ -s "$2" ] && echo "saved $2" || echo "screenshot failed"
