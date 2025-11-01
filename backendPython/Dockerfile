FROM python:3.11

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y gcc netcat-traditional && rm -rf /var/lib/apt/lists/*


# Copiar requirements e instalarlos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY src/ ./src/

# Copiar y dar permisos al script wait-for-it.sh
COPY wait-for-it.sh wait-for-it.sh
RUN chmod +x wait-for-it.sh

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar el servidor (espera a MySQL)
CMD ["/wait-for-it.sh", "mysql:3306", "--", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3000"]
