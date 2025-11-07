FROM python:3.11-alpine

WORKDIR /app

# Instalar dependencias del sistema (incluye netcat)
RUN apk add --no-cache netcat-openbsd

# Copiar dependencias y instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY src ./src

# Copiar el wait-for-it y darle permisos
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Exponer el puerto de la API (ajustá si usás otro)
EXPOSE 3000

# Usar wait-for-it para esperar a MySQL antes de iniciar la API
CMD ["/wait-for-it.sh", "mysql:3306", "--", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3000"]
