# Usa Node 18
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias e instalarlas
COPY package*.json ./
RUN npm install

# Copiar todo el código (aunque montaremos un volumen después)
COPY . .

# Permitir hot reload en WSL/Windows
ENV CHOKIDAR_USEPOLLING=true

# Exponer el puerto de Vite
EXPOSE 5173

# Ejecutar Vite con acceso externo (necesario para Docker)
CMD ["npm", "run", "dev", "--", "--host"]
