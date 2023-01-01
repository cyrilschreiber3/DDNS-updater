# Dynamic DNS Updater 

Dynamic DNS Updater is a simple app that updates a DNS record on a DNS provider. It has a simple web interface to configure the DNS record to update. It uses the [Nuxt](https://nuxt.com/) framework that is based on [Vite](https://vitejs.dev/), [Vue3](https://vuejs.org/) and [Nitro](https://nitro.unjs.io/).

The Updater script can be run manually from the web interface or run periodically with api requests to `/api/runscript`.

## Installation
You can easily deploy the app using docker compose with the following `docker-compose.yml` file:
```yaml
version: "3"

services:
  app:
    image: ddns-updater:latest
    container_name: updater-app
    restart: unless-stopped
    depends_on:
      - database
    networks:
      - updater-network
    ports:
      - 3000:3000
    volumes:
      - ./.env:/app/.env

  database:
    image: redis:alpine
    container_name: updater-database
    restart: unless-stopped
    command: redis-server --save 20 1 --loglevel warning
    networks:
      - updater-network
    volumes:
      - app-data:/data

  script-starter:
    image: curlimages/curl:latest
    container_name: updater-starter
    restart: unless-stopped
    depends_on:
      - app
    command:
      [
        "/bin/sh",
        "-c",
        "while true; do sleep 10; echo 'Triggering updater script'; curl 'http://app:3000/api/runscript' -s -H 'Accept: application/json'; sleep 3600; done"
      ]
    networks:
      - updater-network

networks:
  updater-network:
    driver: bridge

volumes:
  app-data:
    driver: local        
```
## Configuration
The app is configured using environment variables in a `.env` file. The following variables are available:
```dotenv
NUXT_DATABASE_NAME= # Name of the database to use (redis or file)

NUXT_INFOMANIAK_PRIVATE_USERNAME= # Username for the Infomaniak DNS API
NUXT_INFOMANIAK_PRIVATE_PASSWORD= # Password for the Infomaniak DNS API

NUXT_HEARTBEAT_URL= # URL to ping for the heartbeat (optional)
```
