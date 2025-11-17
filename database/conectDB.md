
## Configuración de la Base de Datos con Docker

## 1. Levantar el contenedor MySQL

docker start obligatorio-mysql

## 2. Copiar los archivos SQL al contenedor


docker cp 001.sql obligatorio-mysql:/001.sql
docker cp 002.sql obligatorio-mysql:/002.sql

## 3. Entrar al contenedor MySQL

docker exec -it obligatorio-mysql mysql -u root -p


Cuando pida contraseña, escribir:
rootpassword

## 4. Ejecutar los scripts SQL dentro de MySQL

Dentro de MySQL:

SOURCE /001.sql;
SOURCE /002.sql;

Esto crea la base, crea las tablas e inserta los datos.

## 5. Verificar contenido (opcional)
SHOW DATABASES;
USE obligatorio_bd;
SHOW TABLES;
SELECT * FROM usuario;
