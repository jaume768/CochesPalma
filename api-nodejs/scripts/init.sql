-- Fuerza el cliente a leer el script en utf8mb4
SET NAMES 'utf8mb4';
SET character_set_client = 'utf8mb4';
SET character_set_connection = 'utf8mb4';
SET character_set_results = 'utf8mb4';

-- 1. Crear la base de datos y seleccionarla
CREATE DATABASE IF NOT EXISTS concesionario_db 
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE concesionario_db ;

-- 2. Tablas de referencia para provincias y ciudades
CREATE TABLE provincias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE ciudades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  provincia_id INT NOT NULL,
  FOREIGN KEY (provincia_id) REFERENCES provincias(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. Tablas de catálogo para clasificaciones, carrocerías y combustibles
CREATE TABLE clasificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE carrocerias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE combustibles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 4. Tabla de equipamientos (catálogo cerrado)
CREATE TABLE equipamientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 5. Tabla de usuarios (vendedores y anunciantes)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  provincia_id INT NOT NULL,
  ciudad_id INT NOT NULL,
  descripcion TEXT,
  telefono VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  url_imagen_promocional VARCHAR(255),
  url_imagen_concesionario VARCHAR(255),
  rol ENUM('vendedor', 'anunciante', 'admin') NOT NULL DEFAULT 'vendedor',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (provincia_id) REFERENCES provincias(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (ciudad_id) REFERENCES ciudades(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Tabla de coches
CREATE TABLE coches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendedor_id INT NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  observaciones TEXT,
  fecha_incorporacion DATE,
  clasificacion_id INT NOT NULL,
  carroceria_id INT NOT NULL,
  num_puertas TINYINT NOT NULL,
  fecha_matriculado DATE NOT NULL,
  kilometraje INT NOT NULL,
  color VARCHAR(50) NOT NULL,
  combustible_id INT NOT NULL,
  potencia INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (clasificacion_id) REFERENCES clasificaciones(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (carroceria_id) REFERENCES carrocerias(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (combustible_id) REFERENCES combustibles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 7. Tabla de coches destacados
CREATE TABLE coches_destacados (
  coche_id INT NOT NULL PRIMARY KEY,
  fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_fin DATETIME NULL,
  orden INT NOT NULL DEFAULT 1,
  FOREIGN KEY (coche_id) REFERENCES coches(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Tabla de imágenes de cada coche (ordenadas)
CREATE TABLE coche_imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coche_id INT NOT NULL,
  url_foto VARCHAR(255) NOT NULL,
  orden INT NOT NULL,
  FOREIGN KEY (coche_id) REFERENCES coches(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Tabla intermedia para la relación N:M entre coches y equipamientos
CREATE TABLE coche_equipamientos (
  coche_id INT NOT NULL,
  equipamiento_id INT NOT NULL,
  PRIMARY KEY (coche_id, equipamiento_id),
  FOREIGN KEY (coche_id) REFERENCES coches(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (equipamiento_id) REFERENCES equipamientos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. Tabla de leads (personas que quieren vender su coche)
CREATE TABLE leads_venta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  observaciones TEXT,
  fecha_matriculado DATE NOT NULL,
  kilometraje INT NOT NULL,
  color VARCHAR(50) NOT NULL,
  combustible_id INT NOT NULL,
  potencia INT NOT NULL,
  comentario TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (combustible_id) REFERENCES combustibles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 11. Tabla de rentacars
CREATE TABLE rentacars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  url_foto_promocional VARCHAR(255),
  direccion VARCHAR(255) NOT NULL,
  descripcion TEXT,
  url_web VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 12. Relación N:M entre rentacars y ciudades donde operan
CREATE TABLE rentacar_ciudades (
  rentacar_id INT NOT NULL,
  ciudad_id INT NOT NULL,
  PRIMARY KEY (rentacar_id, ciudad_id),
  FOREIGN KEY (rentacar_id) REFERENCES rentacars(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (ciudad_id) REFERENCES ciudades(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;


-- 1. Inserts para provincias
INSERT INTO provincias (nombre) VALUES ('Madrid');
INSERT INTO provincias (nombre) VALUES ('Barcelona');
INSERT INTO provincias (nombre) VALUES ('Valencia');
INSERT INTO provincias (nombre) VALUES ('Sevilla');
INSERT INTO provincias (nombre) VALUES ('Málaga');
INSERT INTO provincias (nombre) VALUES ('Alicante');
INSERT INTO provincias (nombre) VALUES ('Vizcaya');
INSERT INTO provincias (nombre) VALUES ('Girona');
INSERT INTO provincias (nombre) VALUES ('Granada');
INSERT INTO provincias (nombre) VALUES ('Córdoba');

-- 2. Inserts para ciudades
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Madrid', 1);
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Barcelona', 2);
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Valencia', 3);
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Sevilla', 4);
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Málaga', 5);
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Alicante', 6);
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Bilbao', 7);
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Girona', 8);
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Granada', 9);
INSERT INTO ciudades (nombre, provincia_id) VALUES ('Córdoba', 10);

-- 3. Inserts para clasificaciones
INSERT INTO clasificaciones (nombre) VALUES ('Nuevo');
INSERT INTO clasificaciones (nombre) VALUES ('Segunda mano');
INSERT INTO clasificaciones (nombre) VALUES ('Kilómetro 0');
INSERT INTO clasificaciones (nombre) VALUES ('Ocasión');
INSERT INTO clasificaciones (nombre) VALUES ('Flota');
INSERT INTO clasificaciones (nombre) VALUES ('Renting');
INSERT INTO clasificaciones (nombre) VALUES ('Particular');

-- 4. Inserts para carrocerías
INSERT INTO carrocerias (nombre) VALUES ('Turismo');
INSERT INTO carrocerias (nombre) VALUES ('SUV');
INSERT INTO carrocerias (nombre) VALUES ('Familiar');
INSERT INTO carrocerias (nombre) VALUES ('Hatchback');
INSERT INTO carrocerias (nombre) VALUES ('Coupé');
INSERT INTO carrocerias (nombre) VALUES ('Descapotable');
INSERT INTO carrocerias (nombre) VALUES ('Pick-up');
INSERT INTO carrocerias (nombre) VALUES ('Monovolumen');
INSERT INTO carrocerias (nombre) VALUES ('Roadster');
INSERT INTO carrocerias (nombre) VALUES ('Todoterreno');

-- 5. Inserts para combustibles
INSERT INTO combustibles (nombre) VALUES ('Gasolina');
INSERT INTO combustibles (nombre) VALUES ('Diésel');
INSERT INTO combustibles (nombre) VALUES ('Eléctrico');
INSERT INTO combustibles (nombre) VALUES ('Híbrido');

-- 6. Inserts para equipamientos
INSERT INTO equipamientos (nombre) VALUES ('Aire acondicionado');
INSERT INTO equipamientos (nombre) VALUES ('Navegador GPS');
INSERT INTO equipamientos (nombre) VALUES ('Bluetooth');
INSERT INTO equipamientos (nombre) VALUES ('Asientos calefactables');
INSERT INTO equipamientos (nombre) VALUES ('Sensores de aparcamiento');
INSERT INTO equipamientos (nombre) VALUES ('Cámara trasera');
INSERT INTO equipamientos (nombre) VALUES ('Control de crucero');
INSERT INTO equipamientos (nombre) VALUES ('Tapicería de cuero');
INSERT INTO equipamientos (nombre) VALUES ('Techo solar');
INSERT INTO equipamientos (nombre) VALUES ('Llantas de aleación');

-- 7. Inserts para usuarios
INSERT INTO `usuarios` (`id`, `username`, `email`, `password`, `direccion`, `provincia_id`, `ciudad_id`, `descripcion`, `telefono`, `whatsapp`, `url_imagen_promocional`, `url_imagen_concesionario`, `rol`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@cochesdb.com', 'hashed_pw1', 'Calle Oficial 1', 1, 1, 'Administrador del sistema', '600000001', '600000001', 'https://autocasionmallorca.com/cache/autovendes/221225121639203__250x250.jpg', NULL, 'admin', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(2, 'jgarcia', 'jgarcia@mail.com', 'hashed_pw2', 'Av. Libertad 23', 2, 2, 'Vendedor de coches de ocasión', '600123456', '600123456', 'https://example.com/img/jgarcia.jpg', NULL, 'vendedor', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(3, 'mlopez', 'mlopez@mail.com', 'hashed_pw3', 'C/ Nueva 45', 3, 3, 'Especialista en coches compactos', '600234567', '600234567', 'https://example.com/img/mlopez.jpg', NULL, 'vendedor', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(4, 'afernandez', 'afernandez@mail.com', 'hashed_pw4', 'Plaza Mayor 10', 4, 4, 'Tu mejor opción en SUVs', '600345678', '600345678', 'https://example.com/img/afernandez.jpg', NULL, 'vendedor', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(5, 'rrodriguez', 'rrodriguez@mail.com', 'hashed_pw5', 'P.º del Prado 5', 5, 5, 'Colectivo de vehículos de lujo', '600456789', '600456789', 'https://example.com/img/rrodriguez.jpg', NULL, 'vendedor', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(6, 'cperez', 'cperez@mail.com', 'hashed_pw6', 'C/ del Mar 12', 6, 6, 'Anunciante premium', '600567890', '600567890', 'https://example.com/img/cperez.jpg', 'https://example.com/img/concesionario_cperez.jpg', 'anunciante', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(7, 'lmartinez', 'lmartinez@mail.com', 'hashed_pw7', 'Av. Centro 100', 7, 7, 'Anunciante de flotas', '600678901', '600678901', 'https://example.com/img/lmartinez.jpg', 'https://example.com/img/concesionario_lmartinez.jpg', 'anunciante', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(8, 'sruiz', 'sruiz@mail.com', 'hashed_pw8', 'C/ Estación 8', 8, 8, 'Publicidad para rentacars', '600789012', '600789012', 'https://example.com/img/sruiz.jpg', NULL, 'anunciante', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(9, 'jgutierrez', 'jgutierrez@mail.com', 'hashed_pw9', 'C/ Molino 99', 9, 9, 'Anuncios destacados de coches', '600890123', '600890123', 'https://example.com/img/jgutierrez.jpg', NULL, 'anunciante', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(10, 'mhernandez', 'mhernandez@mail.com', 'hashed_pw10', 'C/ Comercio 2', 10, 10, 'Divulgación de marcas automotrices', '600901234', '600901234', 'https://example.com/img/mhernandez.jpg', NULL, 'anunciante', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(11, 'autos_munar', 'autos_munar@autocasionmallorca.com', 'b1bcf66bdeb81d67', 'C/joan alcover,24, Palma', 1, 1, NULL, '971901544', '627235720', 'https://www.autocasionmallorca.com/cache/autovendes/221225113705589__250x250.jpg', '', 'vendedor', '2025-06-10 20:24:15', '2025-06-10 20:24:15'),
(12, 'autos_arbona', 'autos_arbona@autocasionmallorca.com', '45b9a885df6189ee', 'Avda. la marina, 13, Alcudia', 1, 1, NULL, '971545236', '629415190', 'https://www.autocasionmallorca.com/cache/autovendes/221225113559946__250x250.jpg', '', 'vendedor', '2025-06-10 20:24:20', '2025-06-10 20:24:20'),
(13, 'automobil_hermanns_mallorca_s.l.', 'automobil_hermanns_mallorca_s.l.@autocasionmallorca.com', '5a8cfe9435e01a62', 'LLUBI, LLUBI', 1, 1, NULL, '669522995', '669522995', 'https://www.autocasionmallorca.com/cache/autovendes/240723182518869__250x250.jpg', '', 'vendedor', '2025-06-10 20:24:23', '2025-06-10 20:24:23'),
(14, 'mallorca_motor', 'mallorca_motor@autocasionmallorca.com', 'ce82345b2e30a5fe', 'C/ALEXANDRE LABORDE 28, Polígono Can Valero. Palma', 1, 1, NULL, '629083012', '629083012', 'https://www.autocasionmallorca.com/cache/autovendes/221225120702590__250x250.jpg', '', 'vendedor', '2025-06-10 20:24:27', '2025-06-10 20:24:27'),
(15, 'ganga_cars', 'ganga_cars@autocasionmallorca.com', '1c7dd26d09bb99e2', 'C/Creuers, 7, Manacor', 1, 1, NULL, '971845299', '672088602', 'https://www.autocasionmallorca.com/cache/autovendes/210320202840852__250x250.jpeg', '', 'vendedor', '2025-06-10 20:24:33', '2025-06-10 20:24:33'),
(16, 'coches_palma', 'coches_palma@autocasionmallorca.com', '3d3b2eb8ab2ff313', 'Carretera Valldemossa, 55, Palma', 1, 1, NULL, '672162020', '672162020', 'https://www.autocasionmallorca.com/cache/autovendes/250422182419383__250x250.png', '', 'vendedor', '2025-06-10 20:24:52', '2025-06-10 20:24:52'),
(17, 'renault_carlos_iscar', 'renault_carlos_iscar@autocasionmallorca.com', 'fd9a2cdc9935c30a', 'C/asegra, 3. Poligono c′an valero, Palma', 1, 1, NULL, '971456297', '610418166', 'https://www.autocasionmallorca.com/cache/autovendes/221122172127834__250x250.jpg', '', 'vendedor', '2025-06-10 20:24:56', '2025-06-10 20:24:56'),
(18, 'zacari-cars', 'zacari-cars@autocasionmallorca.com', '01f3fa771048664f', 'C/DE LA MAR MEDITERRANEA, 20. Arriba., POLIGON SON BUGADELLES. CALVIA. con cita previa', 1, 1, NULL, '619820236', '619820236', 'https://www.autocasionmallorca.com/cache/autovendes/250311180806128__250x250.jpg', '', 'vendedor', '2025-06-10 20:25:00', '2025-06-10 20:25:00'),
(19, 'automoviles_estelrich', 'automoviles_estelrich@autocasionmallorca.com', '84a4e5cf6e2aafd9', 'Carrer de General Weyler, 16, Es Pla de na Tesa - Marratxi', 1, 1, NULL, '639640495', '639640495', 'https://www.autocasionmallorca.com/cache/autovendes/230616103340651__250x250.jpg', '', 'vendedor', '2025-06-10 20:25:31', '2025-06-10 20:25:31'),
(20, 'buenos_coches', 'buenos_coches@autocasionmallorca.com', 'd7a7d3896eae45a7', 'C/16 de julio. 53, Palma. Poligono Son Castello', 1, 1, NULL, '613864173', '613864173', 'https://www.autocasionmallorca.com/cache/autovendes/240412185526783__250x250.jpg', '', 'vendedor', '2025-06-10 20:25:37', '2025-06-10 20:25:37'),
(21, 'rossello_multimarca', 'rossello_multimarca@autocasionmallorca.com', '2c38bfb2d4213c72', 'Foners, 59 (honderos), Palma', 1, 1, NULL, '971468864', '617746035', 'https://www.autocasionmallorca.com/cache/autovendes/221225121724868__250x250.jpg', '', 'vendedor', '2025-06-10 20:25:41', '2025-06-10 20:25:41'),
(22, 'rollandi_all_cars_s.l.', 'rollandi_all_cars_s.l.@autocasionmallorca.com', '5e44b220e686e81d', 'C/16 DE JULIOL 87, Polígono Son Castelló. Palma', 1, 1, NULL, '661403890', '661403890', 'https://www.autocasionmallorca.com/cache/autovendes/221225121639203__250x250.jpg', '', 'vendedor', '2025-06-10 20:25:57', '2025-06-10 20:25:57'),
(23, 'mobel_cars', 'mobel_cars@autocasionmallorca.com', '578133012be72e90', 'C/ MARE SELVA, 4, SA COMA', 1, 1, NULL, '616400324', '616400324', 'https://www.autocasionmallorca.com/cache/autovendes/230515190615418__250x250.jpg', '', 'vendedor', '2025-06-10 20:26:05', '2025-06-10 20:26:05'),
(24, 'autocenter_mallorca_group', 'autocenter_mallorca_group@autocasionmallorca.com', '1797d18338adf85b', 'calle son bugadelles, 4, Poligono son Bugadelles. Santa Ponsa', 1, 1, NULL, '971696729', '692888810', 'https://www.autocasionmallorca.com/cache/autovendes/221225112939531__250x250.jpg', '', 'vendedor', '2025-06-10 20:27:14', '2025-06-10 20:27:14'),
(25, 'balears_cars', 'balears_cars@autocasionmallorca.com', 'c8ed20c624895ed3', 'Cami son bauzanet, 8, C′an Pastilla. Palma.', 1, 1, NULL, '662378652', '662378652', 'https://www.autocasionmallorca.com/cache/autovendes/250224131542417__250x250.jpg', '', 'vendedor', '2025-06-10 20:28:10', '2025-06-10 20:28:10'),
(26, 'hr_motor', 'hr_motor@autocasionmallorca.com', '7bdd1a6511f50db2', 'Gran Via Asima, 16 esquina, Palma. Son Castello . Palma de Mallorca', 1, 1, NULL, '919943964', '600544978', 'https://www.autocasionmallorca.com/cache/autovendes/241120185714130__250x250.jpg', '', 'vendedor', '2025-06-10 20:29:15', '2025-06-10 20:29:15'),
(27, 'furgo_auto', 'furgo_auto@autocasionmallorca.com', 'a4ca4d8615feafdc', 'C/Pintor Joan Gris, 13 - Manacor   Crta.Palma-Arta, km 42,5 - Manacor  Taller: C/Sant Isidre, 12 - Manacor, Manacor', 1, 1, NULL, '666180692', '663050811', 'https://www.autocasionmallorca.com/cache/autovendes/231213175348416__250x250.jpg', '', 'vendedor', '2025-06-10 20:29:18', '2025-06-10 20:29:18'),
(28, 'garage_34', 'garage_34@autocasionmallorca.com', 'ca0c45fe191b8278', 'Avda. 16 Julio, 11, Polígono Son Castelló. Palma', 1, 1, NULL, '971074303', '649915885', 'https://www.autocasionmallorca.com/cache/autovendes/221225115530716__250x250.jpg', '', 'vendedor', '2025-06-10 20:29:41', '2025-06-10 20:29:41'),
(29, 'autoventa_manacor', 'autoventa_manacor@autocasionmallorca.com', 'c13e952475beed52', 'Pol. industriales de Inca y Manacor, Manacor / Inca', 1, 1, NULL, '971846079', '610449474', 'https://www.autocasionmallorca.com/cache/autovendes/250411093025513__250x250.png', '', 'vendedor', '2025-06-10 20:30:00', '2025-06-10 20:30:00'),
(30, 'g.s.c_cars', 'g.s.c_cars@autocasionmallorca.com', '22aaa2b2484db1fe', 'Binissalem, Binissalem', 1, 1, NULL, '619861389', '619861389', 'https://www.autocasionmallorca.com/cache/autovendes/250419050438264__250x250.jpg', '', 'vendedor', '2025-06-10 20:30:52', '2025-06-10 20:30:52'),
(31, '1000_vehiculos_de_ocasion', '1000_vehiculos_de_ocasion@autocasionmallorca.com', '64090ae23d1b1cb6', 'Gran Via Asima 33, Palma', 1, 1, NULL, '971909100', '650475890', 'https://www.autocasionmallorca.com/cache/autovendes/221225112349789__250x250.jpg', '', 'vendedor', '2025-06-10 20:31:21', '2025-06-10 20:31:21'),
(32, 'talleres_miquel_terrasa', 'talleres_miquel_terrasa@autocasionmallorca.com', 'ef6212691cdb81bd', 'Cami vell de ciutat, 34, Campos', 1, 1, NULL, '607652671', '607652671', 'https://www.autocasionmallorca.com/cache/autovendes/221225122203731__250x250.jpg', '', 'vendedor', '2025-06-10 20:33:50', '2025-06-10 20:33:50'),
(33, '', '@autocasionmallorca.com', '1db6de391f15b881', ', ', 1, 1, NULL, '', '', '', '', 'vendedor', '2025-06-10 20:35:56', '2025-06-10 20:35:56'),
(34, 'k10_mobility', 'k10_mobility@autocasionmallorca.com', 'bd4bc43ddfad7cef', 'CAMI FONDO, 6. POLIGON LLEVANT, Palma', 1, 1, NULL, '627571546', '627571546', 'https://www.autocasionmallorca.com/cache/autovendes/250416204232598__250x250.png', '', 'vendedor', '2025-06-10 20:39:33', '2025-06-10 20:39:33'),
(35, 'citroen_palma', 'citroen_palma@autocasionmallorca.com', 'caa8f72679532031', 'Setze de juliol, 05, Palma', 1, 1, NULL, '871551008', '689590103', 'https://www.autocasionmallorca.com/cache/autovendes/230815184130493__250x250.png', '', 'vendedor', '2025-06-10 20:39:42', '2025-06-10 20:39:42'),
(36, '-perello_auto-_santa_margalida', '-perello_auto-_santa_margalida@autocasionmallorca.com', '19527f532efa2fc6', 'C/ miquel ordines, 51, Sta. Margalida', 1, 1, NULL, '971523160', '717707160', 'https://www.autocasionmallorca.com/cache/autovendes/221225121125994__250x250.jpg', '', 'vendedor', '2025-06-10 20:40:44', '2025-06-10 20:40:44'),
(37, 'clickautos', 'clickautos@autocasionmallorca.com', 'ba9bee1957fb43ce', 'C/ Camp Franc, nº 14, Pol. Ind. Son Oms, Palma', 1, 1, NULL, '971664726', '', 'https://www.autocasionmallorca.com/cache/autovendes/210222155001172__250x250.jpg', '', 'vendedor', '2025-06-10 20:40:57', '2025-06-10 20:40:57'),
(38, 'peugeot_alcudia', 'peugeot_alcudia@autocasionmallorca.com', '84097d5f95565790', 'C/ mar i estany, 7, Port d′Alcudia', 1, 1, NULL, '971546207', '627281539', 'https://www.autocasionmallorca.com/cache/autovendes/221225121013265__250x250.jpg', '', 'vendedor', '2025-06-10 20:41:46', '2025-06-10 20:41:46'),
(39, 'autovidal', 'autovidal@autocasionmallorca.com', '61e3d6318d46b367', 'Gran via asima, 24 pol.son castello, Palma', 1, 1, NULL, '971020020', '617023864', 'https://www.autocasionmallorca.com/cache/autovendes/210622140313181__250x250.png', '', 'vendedor', '2025-06-10 20:47:49', '2025-06-10 20:47:49'),
(40, 'autos_vallespir_son_ferriol', 'autos_vallespir_son_ferriol@autocasionmallorca.com', '213bcfeda158ed38', 'Avd. del cid 44, Son Ferriol', 1, 1, NULL, '610427614', '610427614', 'https://www.autocasionmallorca.com/cache/autovendes/221225114231588__250x250.jpg', '', 'vendedor', '2025-06-10 20:48:48', '2025-06-10 20:48:48'),
(41, 'fr_cars', 'fr_cars@autocasionmallorca.com', '61edf46a36701758', 'C/alfons el magnanim, 33, Palma', 1, 1, NULL, '971658891', '677023718', 'https://www.autocasionmallorca.com/cache/autovendes/221225115116123__250x250.jpg', '', 'vendedor', '2025-06-10 20:49:20', '2025-06-10 20:49:20'),
(42, 'ford_manacor', 'ford_manacor@autocasionmallorca.com', '1eddb04128d4ab0f', 'C/Menestrals, 13, Manacor', 1, 1, NULL, '600468346', '600476097', 'https://www.autocasionmallorca.com/cache/autovendes/240924092235325__250x250.jpeg', '', 'vendedor', '2025-06-10 21:03:35', '2025-06-10 21:03:35'),
(43, 'brunold_mallorca', 'brunold_mallorca@autocasionmallorca.com', '33385de185aafd3f', 'Cami vell de llucmajor, 112, Palma', 1, 1, NULL, '676453259', '676453259', 'https://www.autocasionmallorca.com/cache/autovendes/250519164011981__250x250.jpg', '', 'vendedor', '2025-06-10 21:18:19', '2025-06-10 21:18:19'),
(44, 'abels_global_services', 'abels_global_services@autocasionmallorca.com', '8906b50bd19e292a', 'Av 16 De Julio 87, Palma', 1, 1, NULL, '+34661311555', '661311555', 'https://www.autocasionmallorca.com/cache/autovendes/190225203607889__250x250.jpg', '', 'vendedor', '2025-06-10 21:18:33', '2025-06-10 21:18:33'),
(45, 'auto_freno_oliver,s.a', 'auto_freno_oliver,s.a@autocasionmallorca.com', '49e7d4fcda130ee2', 'C/FERTILITZANTS, 2. POLIGON SON VALENTI, PALMA DE MALLORCA', 1, 1, NULL, '665955404', '665955404', 'https://www.autocasionmallorca.com/cache/autovendes/221225112756202__250x250.jpg', '', 'vendedor', '2025-06-10 21:21:26', '2025-06-10 21:21:26'),
(46, 'autos_tyr', 'autos_tyr@autocasionmallorca.com', '4a7fd961f6e0c2c7', '., Manacor', 1, 1, NULL, '+491722176221', '+491722176221', 'https://www.autocasionmallorca.com/cache/autovendes/200921183737425__250x250.jpg', '', 'vendedor', '2025-06-10 21:21:47', '2025-06-10 21:21:47');

-- 12. Inserts para leads_venta
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('José Pérez',    'jperez@mail.com',    '610000001', 'Toyota Yaris',   'Pintura original',        '2015-05-20',  90000, 'Blanco', 1, 90,  'Interesado en vender rápido');
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('María López',   'mlopez2@mail.com',   '610000002', 'Renault Megane', 'Un poco de desgaste',     '2018-09-15',  75000, 'Rojo',   2, 110, 'Buena oportunidad');
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('Juan García',   'jgarcia2@mail.com',  '610000003', 'Ford Focus',    'Kilómetros altos',        '2012-03-10', 150000, 'Gris',   2, 125, 'Precio negociable');
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('Ana Sánchez',   'asanchez@mail.com',  '610000004', 'Nissan Qashqai', 'Como nuevo',              '2021-07-25', 30000, 'Azul',   2, 140, 'Busco valoración rápida');
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('Carlos Rodríguez','crodriguez@mail.com','610000005','Opel Astra',    'Revisiones al día',       '2017-11-08', 95000, 'Negro',  1, 105, 'Entrego documentación');
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('Laura Martínez','lmartinez2@mail.com','610000006','Hyundai i30',   'Muy cuidado',             '2019-02-14', 60000, 'Blanco', 2, 120, 'Fotos disponibles');
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('Pedro Fernández','pfernandez@mail.com','610000007','Seat Leon',     'Único dueño',            '2020-10-30', 40000, 'Rojo',   1, 115, 'Entrega inmediata');
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('Carmen Ruiz',   'cruiz@mail.com',     '610000008', 'Kia Ceed',      'Buen mantenimiento',      '2016-06-20', 85000, 'Verde',  2, 100, 'Contacto por WhatsApp');
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('Luis Gómez',    'lgomez@mail.com',    '610000009', 'Citroën C3',    'Ideal ciudad',            '2018-12-05', 50000, 'Amarillo',1, 82,  'Precio flexibles');
INSERT INTO leads_venta (nombre, email, telefono, modelo, observaciones, fecha_matriculado, kilometraje, color, combustible_id, potencia, comentario)
VALUES ('Elena Díaz',    'ediaz@mail.com',     '610000010', 'Volkswagen Polo','Kilómetros bajos',       '2022-08-18', 20000, 'Blanco', 1, 95,  'Revisión reciente');

-- 13. Inserts para rentacars
INSERT INTO `rentacars` (`id`, `nombre`, `url_foto_promocional`, `direccion`, `descripcion`, `url_web`, `created_at`, `updated_at`) VALUES
(1, 'Europcar Madrid', 'https://example.com/rc/europcar.jpg', 'C/ Gran Vía 1, Madrid', 'Alquiler urbano y touring', 'https://europcar.es', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(2, 'Hertz Barcelona', 'https://example.com/rc/hertz.jpg', 'C/ Rambla 10, Barcelona', 'Flotas ejecutivas y viajes', 'https://hertz.es', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(3, 'Sixt Valencia', 'https://example.com/rc/sixt.jpg', 'Av. Francia 20, Valencia', 'Coches de alta gama', 'https://sixt.es', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(4, 'Avis Sevilla', 'https://example.com/rc/avis.jpg', 'Plaza Nueva 5, Sevilla', 'Alquiler económico', 'https://avis.es', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(5, 'Enterprise Málaga', 'https://example.com/rc/enterprise.jpg', 'C/ Larios 2, Málaga', 'Servicio 24h y cobertura', 'https://enterprise.es', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(6, 'Budget Alicante', 'https://example.com/rc/budget.jpg', 'Av. Maisonnave 30, Alicante', 'Ofertas semanales', 'https://budget.es', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(7, 'Goldcar Bilbao', 'https://example.com/rc/goldcar.jpg', 'C/ Alameda 15, Bilbao', 'Precios low-cost', 'https://goldcar.es', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(8, 'Alamo Girona', 'https://example.com/rc/alamo.jpg', 'C/ Granollers 8, Girona', 'Flotas para vacaciones', 'https://alamo.es', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(9, 'Record Granada', 'https://example.com/rc/record.jpg', 'Av. de la Constitución 1, Granada', 'Reservas online', 'https://recordrentacar.com', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(10, 'OK Rent Córdoba', 'https://example.com/rc/okrent.jpg', 'C/ Buen Pastor 3, Córdoba', 'Atención al cliente 24h', 'https://okrentacar.com', '2025-06-10 20:21:35', '2025-06-10 20:21:35'),
(11, 'Rentme', 'https://carweb.rent/cache/textes/230801093135441_540x0.jpeg', 'Aeropuerto de Palma', 'RENT ME MALLORCA S.L. Rent a Car es su empresa de alquiler de confianza para sus vacaciones en Mallorca. Con mas de 10 años de experiencia, en esta empresa familiar nos enorgullecemos de darle el mejor servicio y el mejor precio a nuestros clientes.', 'https://rentme.webcar.rent/?uc=carweb&_gl=1*1py32zm*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODM2OTQuNDcuMC4w', '2025-06-10 21:28:17', '2025-06-10 21:28:17'),
(12, 'Xoroi Cars', 'https://carweb.rent/cache/textes/230714132709772_540x0.jpeg', 'Aeropuerto de Palma', 'En Xoroi Rent a Car ofrecemos un trato personalizado con disponibilidad de servicio las 24 horas del día. Disfrute de su vehículo con las mejores garantías de seguridad. Disponemos de sillas para el transporte de bebes y niños, así como porta-bicicletas. Recoja su coche en el aeropuerto de Palma de Mallorca o en su domicilio en la zona de la Colònia de Sant Pere, Betlem, Artà ….', 'https://xoroicars.webcar.rent/?uc=carweb&_gl=1*1ulpi9q*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODUwMDEuNTkuMC4w', '2025-06-10 21:28:19', '2025-06-10 21:28:19'),
(13, 'Iscar', 'https://carweb.rent/cache/textes/230714133920587_540x0.png', 'Aeropuerto de Palma', 'Iscar Rent a Car, compañía de alquiler de vehículos en Mallorca con tarifas low cost todo incluido. Sabemos que su tiempo es muy valioso y queremos ayudaros a que sus vacaciones sean inolvidables y se lleven un bonito recuerdo de la preciosa isla de Mallorca.\n\n* Sin esperas, sin colas, sin sorpresas ni gastos añadidos. * Flota de vehículos nueva y completa. * Hablamos Ingles, Alemán y Español. * Entrega y recogida en aeropuerto sin esperas. * Entrega y recogida en toda la isla - Servicio 24 horas. Llámenos y comprobara que todo lo que le decimos es cierto...', 'https://iscar.webcar.rent/?uc=carweb&_gl=1*z020es*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODQxNjYuMS4wLjA.', '2025-06-10 21:28:21', '2025-06-10 21:28:21'),
(14, 'Authomar', 'https://carweb.rent/cache/textes/230714133753464_540x0.png', 'Aeropuerto de Palma', 'Es una empresa de alquiler de vehículos fundada con la ilusión de un equipo humano con larga experiencia en el sector, y con ganas de dar el mejor servicio posible a nuestros clientes.\n\nNuestro objetivo es dar un trato PERSONALIZADO a cada cliente, porque cada persona es diferente y tiene distintas necesidades, y estar a su servicio el tiempo que dure su estancia entre nosotros.\n\nPonemos a su disposición una flota totalmente nueva, con vehículos de todas las categorías y de marcas reconocidas (Renault, Opel, Audi, Seat, Peugeot, Ford, Volkswagen, Jeep, etc...) equipados con todos los extras... ¡Incluso en nuestros modelos más básicos!\n\nFruto de una amplia experiencia en el sector, AUTHOMAR les ofrece un servicio integral de alquiler de vehículos:\n\n¡Pídanos información sin compromiso!', 'https://authomar.webcar.rent/?uc=carweb&_gl=1*1py32zm*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODM2OTQuNDcuMC4w', '2025-06-10 21:28:24', '2025-06-10 21:28:24'),
(15, 'Autocenter', 'https://carweb.rent/cache/textes/230714134438239_540x0.png', 'Son Bugadelles', 'AUTOCENTER MALLORCA es la empresa de alquiler de coches en la que puede confiar durante sus vacaciones en Mallorca. Las ventajas de alquilar con nosotros:', 'https://minicar.webcar.rent/0/autocenter-mallorca--rent-a-car-Spanish/3?uc=carweb&_gl=1*1rfhbgi*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODUyMjMuNTkuMC4w', '2025-06-10 21:28:26', '2025-06-10 21:28:26'),
(16, 'Autos Roquero', 'https://carweb.rent/cache/textes/230714132454381_540x0.jpeg', 'Aeropuerto de Palma', 'Autos Roquero Rent a Car es su empresa de alquiler de confianza para sus vacaciones en Mallorca. Empresa familiar dedicada al alquiler de coches desde 1978, nos enorgullecemos de dar el mejor servicio al mejor precio a nuestros clientes. Ventajas de alquilar con nosotors son:\n\nPueden solicitar la entrega a domicilio de su coche de alquiler:\n\nEl coste será de hasta 50 euros para entregas o devoluciones en el aeropuerto y Puerto de Palma cuando la duración del alquiler sea de 5 a 7 dias. Gratuito para 8 dias o más.\n\nEl coste será de hasta 15 euros para entregas o devoluciones en Hoteles / domicilios de las siguientes localidades:\n\nPaguera, Camp de Mar, Andratx, Puerto Andratx y Santa Ponsa. Cuando la duración del alquiler sea de 3 a 7 días. Gratuito para 8 dias o más.\n\nDisponemos de vehiculos economicos, medianos, familiares, cabrios, 7 plazas, SUV′s. Colaboramos con muchas marcas como: Seat, Ford, Opel, Fiat, BMW/Mini, Jeep, etc...', 'https://autosroquero.webcar.rent/?uc=carweb&_gl=1*yibs8z*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODY0MjguNjAuMC4w', '2025-06-10 21:28:30', '2025-06-10 21:28:30'),
(17, 'Bennasar', 'https://carweb.rent/cache/textes/230714134637435_540x0.jpeg', 'Felanitx', 'Somos una empresa familiar de más de 50 años de antigüedad, ofreciendo un trato familiar y personalizado a nuestros clientes lo cual avala nuestra profesionalidad y calidad en nuestro servicio.\n\nDisponemos de una amplia gama de vehículos que se adaptan a las necesidades de nuestros clientes, en diferentes marcas y modelos, con servicio de recogida y entrega en el aeropuerto (con un mínimo de 4 días) sin esperas ni colas o directamente en nuestras oficinas de Portocolom y Felanitx (Mallorca).\n\nTambién disponemos de una furgoneta de gran capacidad, ideal para mudanzas y transportes con volumen.\n\nAlquilamos ciclomotores tipo Scooter de 125cc.', 'https://rentacarbennasar.webcar.rent/?uc=carweb&_gl=1*1lpspri*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODUxNDEuNTkuMC4w', '2025-06-10 21:28:32', '2025-06-10 21:28:32'),
(18, 'Rosslind', 'https://carweb.rent/cache/textes/230714122953976_540x0.jpeg', 'Aeropuerto de Palma', 'Nuestra empresa familiar con mas de 25 años de experiencia, para su alquiler de coches en Mallorca. Orgullosos de dar el mejor servicio al mejor precio a nuestros clientes. Le atendemos fluidos en español, alemán, francés, inglés, polaco, italiano y holandés.', 'https://rosslind.webcar.rent/?uc=carweb&_gl=1*h63yh5*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODY2NjcuNTIuMC4w', '2025-06-10 21:28:33', '2025-06-10 21:28:33'),
(19, 'Solymar', 'https://carweb.rent/cache/textes/230714132247935_540x0.jpg', 'Aeropuerto de Palma', 'Sol&Mar Rent a Car es su empresa de alquiler de confianza para sus vacaciones en Mallorca. Con mas de 40 años de experiencia, en esta empresa familiar nos enorgullecemos de dar el mejor servicio al mejor precio a nuestros clientes. Ventajas de alquilar con nosotors son:\n\nDisponemos de vehiculos economicos, medianos, familiares, cabrios, 7 y 9 plazas, y furgonetas. Colaboramos con muchas marcas como, Renault, Opel, Nissan, Fiat, Mini, Seat, etc...', 'https://solymar.webcar.rent/?uc=carweb&_gl=1*1ocyvbm*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODQ3MDUuNS4wLjA.', '2025-06-10 21:28:35', '2025-06-10 21:28:35'),
(20, 'Tripcars', 'https://carweb.rent/cache/textes/230707162111417_540x0.png', 'Capdepera', 'Desde 1988 ofrecemos alquiler de coches en la zona Este de Mallorca. Contamos con 5 oficinas y alquilamos todo tipo de vehículos. Siempre con garantía de servicios, asegurando a todo riesgo sin franquicia.', 'https://tripcars.webcar.rent/0/trip-cars--rent-a-car-Spanish/1?uc=carweb&_gl=1*1cprmbc*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4ODk5NTU3MS41Ny4xLjE2ODg5OTU3MzMuMTMuMC4w', '2025-06-10 21:28:37', '2025-06-10 21:28:37'),
(21, 'Cronomotor', 'https://carweb.rent/cache/textes/230714123622665_540x0.jpg', 'Manacor', 'Su Rent a Car de referencia en la zona de Manacor, especialistas en vehículos de bajo coste en Manacor.\n\nTambién disponemos de vehículos comerciales con alquiler de larga estancia, consúltenos sin compromiso.', 'https://cronomotor.webcar.rent/?uc=carweb&_gl=1*zgekp7*_ga*MTA1MTAyNTM4NC4xNjc2NjIwODk0*_ga_68X8EH3DY1*MTY4OTA3OTIxNi42MS4xLjE2ODkwODYwODMuNjAuMC4w', '2025-06-10 21:28:39', '2025-06-10 21:28:39');

-- 14. Inserts para rentacar_ciudades
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (1, 1);
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (2, 2);
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (3, 3);
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (4, 4);
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (5, 5);
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (6, 6);
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (7, 7);
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (8, 8);
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (9, 9);
INSERT INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (10,10);

