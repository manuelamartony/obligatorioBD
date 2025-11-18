-- ======================================================
-- ELIMINAR TABLAS EXISTENTES (en orden correcto)
-- ======================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS programa_academico; -- <--- agregar esta
DROP TABLE IF EXISTS reserva_participante;
DROP TABLE IF EXISTS sancion_participante;
DROP TABLE IF EXISTS participante_carrera;
DROP TABLE IF EXISTS reserva;
DROP TABLE IF EXISTS turno;
DROP TABLE IF EXISTS sala;
DROP TABLE IF EXISTS edificio;
DROP TABLE IF EXISTS carrera;
DROP TABLE IF EXISTS facultad;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS login;

SET FOREIGN_KEY_CHECKS = 1;


USE obligatorio_bd;


-- ======================================================
-- CREAR TABLAS
-- ======================================================
-- Primero las tablas “independientes” o padres
CREATE TABLE login (
                       correo VARCHAR(320) NOT NULL PRIMARY KEY,
                       contrasena VARCHAR(100) NOT NULL
);

CREATE TABLE usuario (
                         ci INT NOT NULL PRIMARY KEY,
                         nombre VARCHAR(50),
                         apellido VARCHAR(50),
                         email VARCHAR(320)
);

CREATE TABLE facultad (
                          id_facultad INT NOT NULL PRIMARY KEY,
                          nombre_facultad VARCHAR(100)
);

-- Tablas que dependen de facultad
CREATE TABLE carrera(
                        nombre_carrera VARCHAR(100) NOT NULL PRIMARY KEY,
                        id_facultad INT NOT NULL,
                        tipo ENUM('grado','postgrado'),
                        FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad)
);

-- Tablas que dependen de usuario y carrera
CREATE TABLE participante_carrera (
                                      id_alumno_programa INT NOT NULL PRIMARY KEY,
                                      ci INT NOT NULL,
                                      nombre_carrera VARCHAR(100),
                                      rol ENUM('alumno', 'docente'),
                                      FOREIGN KEY (ci) REFERENCES usuario(ci),
                                      FOREIGN KEY (nombre_carrera) REFERENCES carrera(nombre_carrera)
);

-- Tablas que dependen de otras entidades físicas
CREATE TABLE edificio (
                          nombre_edificio VARCHAR(100) NOT NULL PRIMARY KEY,
                          direccion VARCHAR(100),
                          departamento VARCHAR(100)
);

CREATE TABLE sala (
                      nombre_sala VARCHAR(100) NOT NULL,
                      edificio VARCHAR(100) NOT NULL,
                      capacidad INT,
                      tipo_sala ENUM('libre', 'postgrado','docente'),
                      PRIMARY KEY (nombre_sala, edificio),
                      FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio)
);

-- Tablas auxiliares
CREATE TABLE turno (
                       id_turno INT AUTO_INCREMENT PRIMARY KEY,
                       hora_inicio TIME NOT NULL,
                       hora_fin TIME NOT NULL,
                       descripcion VARCHAR(50)
);

-- Tablas que dependen de sala y turno
CREATE TABLE reserva(
                        id_reserva INT PRIMARY KEY,
                        nombre_sala VARCHAR(100),
                        edificio VARCHAR(100),
                        fecha DATE,
                        estado ENUM('activa', 'cancelada','sin asistencia','finalizada'),
                        id_turno INT,
                        FOREIGN KEY (id_turno) REFERENCES turno(id_turno),
                        FOREIGN KEY (nombre_sala, edificio) REFERENCES sala(nombre_sala, edificio)
);

CREATE TABLE reserva_participante(
                                     ci INT,
                                     id_reserva INT,
                                     asistencia BOOLEAN,
                                     PRIMARY KEY (ci, id_reserva),
                                     FOREIGN KEY (ci) REFERENCES usuario(ci),
                                     FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva)
);

CREATE TABLE sancion_participante(
                                     ci INT,
                                     fecha_inicio DATE,
                                     fecha_fin DATE,
                                     PRIMARY KEY (ci, fecha_inicio, fecha_fin),
                                     FOREIGN KEY (ci) REFERENCES usuario(ci)
);
