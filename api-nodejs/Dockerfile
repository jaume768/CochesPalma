FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Añadir este ARG para invalidar la caché cuando cambia package.json
ARG REBUILD=unknown

# Mostrar el valor para saber cuándo se ejecuta
RUN echo "Rebuilding with: $REBUILD"
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
