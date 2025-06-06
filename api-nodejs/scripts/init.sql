-- 1. Crear la base de datos y seleccionarla
CREATE DATABASE IF NOT EXISTS coches_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE coches_db;

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
  rol ENUM('vendedor', 'anunciante') NOT NULL DEFAULT 'vendedor',
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
  fecha_incorporacion DATE NOT NULL DEFAULT CURRENT_DATE,
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

-- 7. Tabla de imágenes de cada coche (ordenadas)
CREATE TABLE coche_imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coche_id INT NOT NULL,
  url_foto VARCHAR(255) NOT NULL,
  orden INT NOT NULL,
  FOREIGN KEY (coche_id) REFERENCES coches(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Tabla intermedia para la relación N:M entre coches y equipamientos
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

-- 9. Tabla de leads (personas que quieren vender su coche)
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

-- 10. Tabla de rentacars
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

-- 11. Relación N:M entre rentacars y ciudades donde operan
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
