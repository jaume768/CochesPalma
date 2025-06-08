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
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('admin',   'admin@cochesdb.com',   'hashed_pw1', 'Calle Oficial 1',    1, 1, 'Administrador del sistema',      '600000001', '600000001', 'https://autocasionmallorca.com/cache/autovendes/221225121639203__250x250.jpg', NULL,        'admin');
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('jgarcia', 'jgarcia@mail.com',     'hashed_pw2', 'Av. Libertad 23',    2, 2, 'Vendedor de coches de ocasión',     '600123456', '600123456', 'https://example.com/img/jgarcia.jpg', NULL,        'vendedor');
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('mlopez',  'mlopez@mail.com',      'hashed_pw3', 'C/ Nueva 45',        3, 3, 'Especialista en coches compactos',  '600234567', '600234567', 'https://example.com/img/mlopez.jpg',  NULL,        'vendedor');
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('afernandez','afernandez@mail.com','hashed_pw4', 'Plaza Mayor 10',     4, 4, 'Tu mejor opción en SUVs',            '600345678', '600345678', 'https://example.com/img/afernandez.jpg', NULL,       'vendedor');
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('rrodriguez','rrodriguez@mail.com','hashed_pw5', 'P.º del Prado 5',    5, 5, 'Colectivo de vehículos de lujo',     '600456789', '600456789', 'https://example.com/img/rrodriguez.jpg', NULL,       'vendedor');
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('cperez',  'cperez@mail.com',      'hashed_pw6', 'C/ del Mar 12',      6, 6, 'Anunciante premium',                 '600567890', '600567890', 'https://example.com/img/cperez.jpg','https://example.com/img/concesionario_cperez.jpg','anunciante');
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('lmartinez','lmartinez@mail.com',  'hashed_pw7', 'Av. Centro 100',     7, 7, 'Anunciante de flotas',               '600678901', '600678901', 'https://example.com/img/lmartinez.jpg','https://example.com/img/concesionario_lmartinez.jpg','anunciante');
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('sruiz',   'sruiz@mail.com',       'hashed_pw8', 'C/ Estación 8',      8, 8, 'Publicidad para rentacars',         '600789012', '600789012', 'https://example.com/img/sruiz.jpg',NULL,        'anunciante');
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('jgutierrez','jgutierrez@mail.com','hashed_pw9', 'C/ Molino 99',       9, 9, 'Anuncios destacados de coches',      '600890123', '600890123', 'https://example.com/img/jgutierrez.jpg',NULL,    'anunciante');
INSERT INTO usuarios (username, email, password, direccion, provincia_id, ciudad_id, descripcion, telefono, whatsapp, url_imagen_promocional, url_imagen_concesionario, rol)
VALUES ('mhernandez','mhernandez@mail.com','hashed_pw10','C/ Comercio 2',      10,10,'Divulgación de marcas automotrices','600901234','600901234','https://example.com/img/mhernandez.jpg',NULL,    'anunciante');

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
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('Europcar Madrid', 'https://example.com/rc/europcar.jpg', 'C/ Gran Vía 1, Madrid', 'Alquiler urbano y touring', 'https://europcar.es');
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('Hertz Barcelona','https://example.com/rc/hertz.jpg',  'C/ Rambla 10, Barcelona','Flotas ejecutivas y viajes', 'https://hertz.es');
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('Sixt Valencia',  'https://example.com/rc/sixt.jpg',   'Av. Francia 20, Valencia', 'Coches de alta gama',       'https://sixt.es');
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('Avis Sevilla',   'https://example.com/rc/avis.jpg',   'Plaza Nueva 5, Sevilla',    'Alquiler económico',        'https://avis.es');
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('Enterprise Málaga','https://example.com/rc/enterprise.jpg','C/ Larios 2, Málaga','Servicio 24h y cobertura',   'https://enterprise.es');
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('Budget Alicante','https://example.com/rc/budget.jpg','Av. Maisonnave 30, Alicante','Ofertas semanales',        'https://budget.es');
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('Goldcar Bilbao','https://example.com/rc/goldcar.jpg','C/ Alameda 15, Bilbao','Precios low-cost',             'https://goldcar.es');
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('Alamo Girona',   'https://example.com/rc/alamo.jpg',  'C/ Granollers 8, Girona','Flotas para vacaciones',      'https://alamo.es');
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('Record Granada','https://example.com/rc/record.jpg', 'Av. de la Constitución 1, Granada','Reservas online', 'https://recordrentacar.com');
INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
VALUES ('OK Rent Córdoba','https://example.com/rc/okrent.jpg','C/ Buen Pastor 3, Córdoba','Atención al cliente 24h','https://okrentacar.com');

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
