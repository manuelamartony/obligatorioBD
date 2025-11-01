# Multi-stage Dockerfile para el frontend (Vite + React)
# Stage 1: build
FROM node:18-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias y aprovechar cache
COPY package*.json ./
RUN npm ci --silent

# Copiar el resto y construir
COPY . .
RUN npm run build

# Stage 2: servir con nginx
FROM nginx:stable-alpine

# Limpiar contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar build al html de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de nginx para SPA (history API fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]