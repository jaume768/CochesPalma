#!/bin/sh

while ! nc -z api 3001; do
  sleep 1
done

sleep 30

node /usr/src/app/scripts/scrapeCoches.js

node /usr/src/app/scripts/scrapeRentacars.js

tail -f /dev/null
