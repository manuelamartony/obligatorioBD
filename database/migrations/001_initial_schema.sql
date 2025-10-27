-- ======================================================
-- ELIMINAR TABLAS EXISTENTES (en orden correcto)
-- ======================================================

DROP TABLE IF EXISTS reserva_participante;
DROP TABLE IF EXISTS reserva;
DROP TABLE IF EXISTS turno;
DROP TABLE IF EXISTS sala;
DROP TABLE IF EXISTS edificio;
DROP TABLE IF EXISTS participante_programa_académico;
DROP TABLE IF EXISTS programa_academico;
DROP TABLE IF EXISTS facultad;
DROP TABLE IF EXISTS participante;
DROP TABLE IF EXISTS login;

-- ======================================================
-- CREAR TABLAS
-- ======================================================

CREATE TABLE login (
    correo VARCHAR(320) NOT NULL PRIMARY KEY ,
    contrasena VARCHAR(100) NOT NULL
);

CREATE TABLE participante (
    ci INT NOT NULL PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    email VARCHAR(320)
);
CREATE TABLE facultad (
    id_facultad INT NOT NULL PRIMARY KEY ,
    nombre_facultad VARCHAR(100)
);

CREATE TABLE programa_academico (
    nombre_programa VARCHAR(100) NOT NULL PRIMARY KEY ,
    id_facultad INT NOT NULL,
    tipo ENUM( 'grado','postgrado'),
    FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad)

);

CREATE TABLE participante_programa_académico (
    id_alumno_programa INT NOT NULL PRIMARY KEY ,
    ci INT NOT NULL ,
    nombre_programa VARCHAR(100),
    rol ENUM('alumno', 'docente'),
    FOREIGN KEY (ci) REFERENCES participante(ci),
    FOREIGN KEY (nombre_programa) REFERENCES programa_academico(nombre_programa)
);

CREATE TABLE edificio (
    nombre_edificio VARCHAR(100) NOT NULL PRIMARY KEY ,
    direccion VARCHAR(100),
    departamento VARCHAR(100)
);

CREATE TABLE sala (
    nombre_sala VARCHAR(100) NOT NULL ,
    edificio VARCHAR(100)NOT NULL ,
    capacidad INT,
    tipo_sala ENUM(   'libre', 'postgrado','docente'),
    PRIMARY KEY (nombre_sala,edificio),
    FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio)
);

CREATE TABLE turno (
    id_turno INT NOT NULL PRIMARY KEY ,
    hora_inicio TIME NOT NULL ,
    hora_fin TIME NOT NULL
);

CREATE TABLE reserva(
    id_reserva INT PRIMARY KEY ,
    nombre_sala VARCHAR(100),
    edificio VARCHAR(100),
    fecha DATE,
    id_turno INT,
    estado ENUM( 'activa', 'cancelada','sin asistencia','finalizada'),
    FOREIGN KEY (nombre_sala) REFERENCES sala(nombre_sala),
    FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio),
    FOREIGN KEY (id_turno) REFERENCES turno(id_turno)

);

CREATE TABLE reserva_participante(
    ci INT,
    id_reserva INT ,
    fecha_solicitud_reserva DATE,
    asistencia BOOLEAN,
    PRIMARY KEY (ci,id_reserva)
);

CREATE TABLE sancion_participante(
    ci INT,
    fecha_inicio DATE,
    fecha_fin DATE,
    PRIMARY KEY (ci,fecha_inicio,fecha_fin),
    FOREIGN KEY (ci) REFERENCES participante(ci)
);
