FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Puerto de exposición
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]
