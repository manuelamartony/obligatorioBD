# Use official MySQL 8 image as base
FROM mysql:8.0

# Don't bake credentials into the image. Provide at runtime via env vars:
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=obligatorio_bd
# - MYSQL_USER / MYSQL_PASSWORD (optional)

# Copy initialization SQL scripts. These run only on first-time init
# when the target datadir is empty.
COPY migrations /docker-entrypoint-initdb.d/

# Expose default MySQL port
EXPOSE 3306

# The default entrypoint/cmd from the base image starts mysqld
