# 1. Imagen base: Python
FROM python:3.12-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar sólo requirements primero para aprovechar cache de Docker
COPY requirements.txt ./

# Instalar dependencias del sistema necesarias para compilar extensiones (si hacen falta)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends build-essential gcc libc-dev \
	&& rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del proyecto
COPY . .

# Verificación rápida: fallará la build si uvicorn no se puede importar
RUN python -c "import uvicorn; print('uvicorn OK:', uvicorn.__version__)"

# Exponer el puerto 8000 (FastAPI por defecto)
EXPOSE 8000

# Usar el módulo python para ejecutar uvicorn (más robusto que depender del binario en PATH)
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]