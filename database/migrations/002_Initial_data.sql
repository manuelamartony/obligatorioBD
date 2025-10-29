USE obligatorio_bd;

INSERT INTO obligatorio_bd.login(correo, contrasena)
VALUES ('persona1@gmail.com','12345678'),
       ('persona2@gmail.com','23456789'),
       ('persona3@gmail.com','34567890'),
       ('persona4@gmail.com','45678901');

INSERT INTO obligatorio_bd.participante(ci, nombre, apellido, email)
VALUES (12345678,'Manuela','Martony','persona1@gmail.com'),
       (23456789,'Franco','Manfredi','persona2@gmail'),
       (34567890,'Martin','de Leon','persona3@gmail.com'),
       (45678901,'Manuel','Lorenzo','persona4@gmail.com');

INSERT INTO obligatorio_bd.facultad(id_facultad, nombre_facultad)
VALUES (1,'Facultad de Ingenieria'),
       (2,'Facultad de Ciencias Economicas'),
       (3,'Facultad de Salud'),
       (4,'Facultad de Derecho y Artes Liberales'),
       (5,'Escuela de Postgrados');

INSERT INTO obligatorio_bd.programa_academico(nombre_programa, id_facultad, tipo)
VALUES ('Ingenieria-2021',1,'grado'),
       ('MBA',2,'postgrado'),
       ('Enfermeria',3,'grado'),
       ('Derecho',4,'grado'),
       ('Master en Gestion',5,'postgrado');

INSERT INTO obligatorio_bd.participante_programa_académico(id_alumno_programa, ci, nombre_programa, rol)
VALUES (1, 12345678, 'Ingenieria-2021', 'alumno'),
       (2, 23456789, 'MBA', 'alumno'),
       (3, 34567890, 'Derecho', 'docente'),
       (4, 45678901, 'Master en Gestion', 'alumno');

INSERT INTO obligatorio_bd.edificio(nombre_edificio, direccion, departamento)
VALUES('Edificio Central','8 de octubre','Montevideo'),
      ('Mulling','Comandante Braga','Montevideo'),
      ('San Jose','8 de octubre','Montevideo'),
      ('Athanasius','Carlon Anaya','Montevideo'),
      ('Ucu Business','8 de octubre','Montevideo');

INSERT INTO obligatorio_bd.sala(nombre_sala, edificio, capacidad, tipo_sala)
VALUES('M103','Mulling',30,'libre'),
      ('B100','Ucu Business',25,'postgrado'),
      ('200','Edificio Central',15,'docente');

INSERT INTO obligatorio_bd.turno(id_turno, hora_inicio, hora_fin)
VALUES(1,'08:00:00', '9:00:00'),
      (2,'09:00:00', '10:00:00'),
      (3,'10:00:00', '11:00:00'),
      (4,'11:00:00', '12:00:00');

INSERT INTO obligatorio_bd.reserva(id_reserva, nombre_sala, edificio, fecha, id_turno, estado)
VALUES(1,'M103','Mulling','2025-10-29',1,'activa'),
      (2,'B100','Ucu Business','2025-10-19',3,'sin asistencia'),
      (3,'200','Edificio Central','2025-11-29',2,'cancelada'),
      (4,'M103','Mulling','2025-09-29',4,'finalizada');

INSERT INTO obligatorio_bd.reserva_participante(ci, id_reserva, fecha_solicitud_reserva, asistencia)
VALUES (12345678,1,'2025-10-29',true),
       (23456789,2,'2025-10-19',false),
       (34567890,3,'2025-11-29',true),
       (45678901,4,'2025-09-29',false);

INSERT INTO obligatorio_bd.sancion_participante(ci, fecha_inicio, fecha_fin)
VALUES(12345678,'2025-10-29','2025-11-29');


