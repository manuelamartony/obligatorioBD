USE obligatorio_bd;

INSERT INTO obligatorio_bd.login(correo, contrasena)
VALUES ('manuela.martony@gmail.com','12345678'),
       ('franco.manfredi@gmail.com','23456789'),
       ('martin.deleon@gmail.com','34567890'),
       ('manuel.lorenzo@gmail.com','45678901'),
       ('sofia.perez@ucu.edu.uy','abcdef12'),
       ('agustin.ramos@ucu.edu.uy','qwerty98'),
       ('prof.mendez@ucu.edu.uy','docente01'),
       ('prof.rodriguez@ucu.edu.uy','docente02');

INSERT INTO obligatorio_bd.usuario(ci, nombre, apellido, email)
VALUES (12345678,'Manuela','Martony','manuela.martony@gmail.com'),
       (23456789,'Franco','Manfredi','franco.manfredi@gmail.com'),
       (34567890,'Martin','de Leon','martin.deleon@gmail.com'),
       (45678901,'Manuel','Lorenzo','manuel.lorenzo@gmail.com'),
        (44444444,'Sofía','Pérez','sofia.perez@ucu.edu.uy'),
       (55555555,'Agustín','Ramos','agustin.ramos@ucu.edu.uy'),
       (66666666,'Carolina','Méndez','prof.mendez@ucu.edu.uy'),
       (77777777,'Luis','Rodríguez','prof.rodriguez@ucu.edu.uy');

INSERT INTO obligatorio_bd.facultad(id_facultad, nombre_facultad)
VALUES (1,'Facultad de Ingenieria'),
       (2,'Facultad de Ciencias Economicas'),
       (3,'Facultad de Salud'),
       (4,'Facultad de Derecho y Artes Liberales'),
       (5,'Escuela de Postgrados');

INSERT INTO obligatorio_bd.carrera(nombre_carrera, id_facultad, tipo)
VALUES ('Ingeniería Informática',1,'grado'),
       ('Contador Público',2,'grado'),
       ('Enfermería',3,'grado'),
       ('Derecho',4,'grado'),
       ('MBA',5,'posgrado'),
       ('Maestría en Gestión Educativa',5,'posgrado');

INSERT INTO obligatorio_bd.participante_carrera(id_alumno_programa, ci, nombre_carrera, rol)
VALUES   (1,12345678,'Ingeniería Informática','alumno'),
       (2,23456789,'Contador Público','alumno'),
       (3,34567890,'Derecho','alumno'),
       (4,44444444,'MBA','alumno'),
       (5,55555555,'Maestría en Gestión Educativa','alumno'),
       (6,66666666,'Ingeniería Informática','docente'),
       (7,77777777,'Derecho','docente');


INSERT INTO obligatorio_bd.edificio(nombre_edificio, direccion, departamento)
VALUES('Edificio Central','8 de octubre','Montevideo'),
      ('Mulling','Comandante Braga','Montevideo'),
      ('San Jose','8 de octubre','Montevideo'),
      ('Athanasius','Carlon Anaya','Montevideo'),
      ('Ucu Business','8 de octubre','Montevideo');

INSERT INTO obligatorio_bd.sala(nombre_sala, edificio, capacidad, tipo_sala)
VALUES ('M101','Mulling',20,'libre'),
      ('M103','Mulling',30,'libre'),
      ('B201','Ucu Business',10,'postgrado'),
      ('B305','Ucu Business',18,'postgrado'),
      ('C210','Edificio Central',12,'docente'),
      ('C410','Edificio Central',25,'libre'),
      ('SJ12','San Jose',8,'docente');


INSERT INTO obligatorio_bd.reserva(id_reserva, nombre_sala, edificio, fecha, estado, hora_inicio, hora_fin)
VALUES
      (1,'M103','Mulling','2025-10-29','activa','08:00:00','09:00:00'),
      (2,'B201','Ucu Business','2025-10-19','sin asistencia','10:00:00','11:00:00'),
      (3,'C210','Edificio Central','2025-11-29','cancelada','09:00:00','10:00:00'),
      (4,'M103','Mulling','2025-09-29','finalizada','11:00:00','12:00:00'),
      (5,'M101','Mulling','2025-10-30','activa','09:00:00','10:00:00'),
      (6,'B305','Ucu Business','2025-10-20','finalizada','11:00:00','12:00:00'),
      (7,'B201','Ucu Business','2025-10-27','sin asistencia','12:00:00','13:00:00'),
      (8,'C410','Edificio Central','2025-11-02','activa','13:00:00','14:00:00'),
      (9,'C210','Edificio Central','2025-11-02','cancelada','14:00:00','15:00:00'),
      (10,'C410','Edificio Central','2025-11-05','finalizada','15:00:00','16:00:00'),
      (11,'SJ12','San Jose','2025-10-15','sin asistencia','16:00:00','17:00:00');

INSERT INTO obligatorio_bd.reserva_participante(ci, id_reserva, asistencia)
VALUES (12345678,1,true),
(23456789,2,false),
(34567890,3,true),
(45678901,4,false),
(12345678,5,true),
(23456789,5,true),
(34567890,6,true),
(23456789,7,false),
(34567890,7,false),
(12345678,8,true),
(23456789,9,false),
(34567890,10,true),
(45678901,10,true),
(12345678,11,false),
(23456789,11,false);


INSERT INTO obligatorio_bd.sancion_participante(ci, fecha_inicio, fecha_fin)
VALUES(12345678,'2025-10-29','2025-11-29'),
(23456789,'2025-10-20','2025-12-20'),
(34567890,'2025-10-27','2025-12-27'), 
(12345678,'2025-10-15','2025-12-15'); 


