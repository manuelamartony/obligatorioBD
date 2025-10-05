# Configuración de DataGrip

## Conectar al proyecto

1. **Abrir DataGrip**
2. **New → Data Source → MySQL**

3. **Configurar conexión:**
Host: localhost
Port: 3306
Database: obligatorio_bd
User: root
Password: rootpassword
4. **Test Connection** → OK

## Sincronizar schema desde Git

1. **Tools → Database → Import Data Source**
2. Selecciona: `database/migrations/001_initial_schema.sql`
3. Execute

## Exportar cambios

Cuando hagas cambios en DataGrip:

1. Click derecho en la BD → **SQL Scripts → Generate DDL to Clipboard**
2. Crear nuevo archivo: `database/migrations/002_descripcion_cambio.sql`
3. Pegar el DDL
4. Commit y push:
```bash
   git add database/migrations/002_descripcion_cambio.sql
   git commit -m "Add: [descripción del cambio]"
   git push
