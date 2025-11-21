USE obligatorio_bd;
INSERT INTO obligatorio_bd.login(correo, contrasena)
VALUES ('manuela.martony@gmail.com', '12345678'),
    ('franco.manfredi@gmail.com', '23456789'),
    ('martin.deleon@gmail.com', '34567890'),
    ('manuel.lorenzo@gmail.com', '45678901'),
    ('sofia.perez@ucu.edu.uy', 'abcdef12'),
    ('agustin.ramos@ucu.edu.uy', 'qwerty98'),
    ('prof.mendez@ucu.edu.uy', 'docente01'),
    ('prof.rodriguez@ucu.edu.uy', 'docente02'),
    ('admin@ucu.edu.uy','admin123');
INSERT INTO obligatorio_bd.usuario(ci, nombre, apellido, email,esAdmin)
VALUES (
        12345678,
        'Manuela',
        'Martony',
        'manuela.martony@gmail.com',
        false
    ),
    (
        23456789,
        'Franco',
        'Manfredi',
        'franco.manfredi@gmail.com',
        false
    ),
    (
        34567890,
        'Martin',
        'de Leon',
        'martin.deleon@gmail.com',
        false
    ),
    (
        45678901,
        'Manuel',
        'Lorenzo',
        'manuel.lorenzo@gmail.com',
        false
    ),
    (
        44444444,
        'Sofia',
        'Perez',
        'sofia.perez@ucu.edu.uy',
        false
    ),
    (
        55555555,
        'Agustin',
        'Ramos',
        'agustin.ramos@ucu.edu.uy',
        false
    ),
    (
        66666666,
        'Carolina',
        'Mendez',
        'prof.mendez@ucu.edu.uy',
        false
    ),
    (
        77777777,
        'Luis',
        'Rodriguez',
        'prof.rodriguez@ucu.edu.uy',
        false
    ),
    (88888888,'Funcionario','Admin','admin@ucu.edu.uy',true);
INSERT INTO obligatorio_bd.facultad(id_facultad, nombre_facultad)
VALUES (1, 'Facultad de Ingenieria'),
    (2, 'Facultad de Ciencias Economicas'),
    (3, 'Facultad de Salud'),
    (4, 'Facultad de Derecho y Artes Liberales'),
    (5, 'Escuela de Postgrados');
INSERT INTO obligatorio_bd.carrera(nombre_carrera, id_facultad, tipo)
VALUES ('Ingenieria Informatica', 1, 'grado'),
    ('Contador Publico', 2, 'grado'),
    ('Enfermeria', 3, 'grado'),
    ('Derecho', 4, 'grado'),
    ('MBA', 5, 'postgrado'),
    ('Maestria en Gestion Educativa', 5, 'postgrado');
INSERT INTO obligatorio_bd.participante_carrera(id_alumno_programa, ci, nombre_carrera, rol)
VALUES (1, 12345678, 'Ingenieria Informatica', 'alumno'),
    (2, 23456789, 'Contador Publico', 'alumno'),
    (3, 34567890, 'Derecho', 'alumno'),
    (4, 44444444, 'MBA', 'alumno'),
    (
        5,
        55555555,
        'Maestria en Gestion Educativa',
        'alumno'
    ),
    (6, 66666666, 'Ingenieria Informatica', 'docente'),
    (7, 77777777, 'Derecho', 'docente'),
    (8,45678901,'MBA','alumno');
INSERT INTO obligatorio_bd.edificio(nombre_edificio, direccion, departamento)
VALUES('Edificio Central', '8 de octubre', 'Montevideo'),
    ('Mulling', 'Comandante Braga', 'Montevideo'),
    ('San Jose', '8 de octubre', 'Montevideo'),
    ('Athanasius', 'Carlon Anaya', 'Montevideo'),
    ('Ucu Business', '8 de octubre', 'Montevideo');
INSERT INTO obligatorio_bd.sala(nombre_sala, edificio, capacidad, tipo_sala)
VALUES ('M101', 'Mulling', 20, 'libre'),
    ('M103', 'Mulling', 30, 'libre'),
    ('B201', 'Ucu Business', 10, 'postgrado'),
    ('B305', 'Ucu Business', 18, 'postgrado'),
    ('C210', 'Edificio Central', 12, 'docente'),
    ('C410', 'Edificio Central', 25, 'libre'),
    ('SJ12', 'San Jose', 8, 'docente'),
    ('AJ10', 'San Jose', 10, 'libre');
INSERT INTO turno (hora_inicio, hora_fin, descripcion)
VALUES ('08:00:00', '09:00:00', 'Turno 08-09'),
    ('09:00:00', '10:00:00', 'Turno 09-10'),
    ('10:00:00', '11:00:00', 'Turno 10-11'),
    ('11:00:00', '12:00:00', 'Turno 11-12'),
    ('12:00:00', '13:00:00', 'Turno 12-13'),
    ('13:00:00', '14:00:00', 'Turno 13-14'),
    ('14:00:00', '15:00:00', 'Turno 14-15'),
    ('15:00:00', '16:00:00', 'Turno 15-16'),
    ('16:00:00', '17:00:00', 'Turno 16-17'),
    ('17:00:00', '18:00:00', 'Turno 17-18'),
    ('18:00:00', '19:00:00', 'Turno 18-19'),
    ('19:00:00', '20:00:00', 'Turno 19-20'),
    ('20:00:00', '21:00:00', 'Turno 20-21'),
    ('21:00:00', '22:00:00', 'Turno 21-22'),
    ('22:00:00', '23:00:00', 'Turno 22-23');
INSERT INTO reserva(
        id_reserva,
        nombre_sala,
        edificio,
        fecha,
        estado,
        id_turno
    )
VALUES (1, 'M103', 'Mulling', '2025-10-29', 'activa', 1),
    (
        2,
        'B201',
        'Ucu Business',
        '2025-10-19',
        'sin asistencia',
        3
    ),
    (
        3,
        'C210',
        'Edificio Central',
        '2025-11-29',
        'cancelada',
        2
    ),
    (
        4,
        'M103',
        'Mulling',
        '2025-09-29',
        'finalizada',
        4
    ),
    (5, 'M101', 'Mulling', '2025-10-30', 'activa', 2),
    (
        6,
        'B305',
        'Ucu Business',
        '2025-10-20',
        'finalizada',
        4
    ),
    (
        7,
        'B201',
        'Ucu Business',
        '2025-10-27',
        'sin asistencia',
        5
    ),
    (
        8,
        'C410',
        'Edificio Central',
        '2025-12-02',
        'activa',
        6
    ),
    (
        9,
        'C210',
        'Edificio Central',
        '2025-11-02',
        'cancelada',
        7
    ),
    (
        10,
        'C410',
        'Edificio Central',
        '2025-11-05',
        'finalizada',
        8
    ),
    (
        11,
        'SJ12',
        'San Jose',
        '2025-10-15',
        'sin asistencia',
        9
    );
INSERT INTO obligatorio_bd.reserva_participante(ci, id_reserva, asistencia)
VALUES (12345678, 1, true),
    (23456789, 2, false),
    (34567890, 3, true),
    (45678901, 4, false),
    (12345678, 5, true),
    (23456789, 5, true),
    (34567890, 6, true),
    (23456789, 7, false),
    (34567890, 7, false),
    (12345678, 8, true),
    (23456789, 9, false),
    (34567890, 10, true),
    (45678901, 10, true),
    (12345678, 11, false),
    (23456789, 11, false);
INSERT INTO obligatorio_bd.sancion_participante(ci, fecha_inicio, fecha_fin)
VALUES(12345678, '2025-12-29', '2026-01-12'),
    (23456789, '2026-01-02', '2026-01-16'),
    (34567890, '2025-12-02', '2025-12-16');