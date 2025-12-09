# frontend/Dockerfile.dev
FROM node:20

WORKDIR /app

# Kopiujemy tylko package.json by zainstalować zależności (cache layer)
COPY package*.json ./

# Instalujemy zależności wewnątrz kontenera
RUN npm ci

# Ustawienia środowiska (w razie potrzeby)
ENV CHOKIDAR_USEPOLLING=true
ENV NODE_ENV=development

# Montujemy kod przez docker-compose, dlatego nie kopiujemy src tutaj

EXPOSE 3000

# Upewnij się, że "start" w package.json uruchamia dev-server na 0.0.0.0
CMD ["npm", "start"]
