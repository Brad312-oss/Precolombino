CREATE SCHEMA IF NOT EXISTS `precolombinos`;
USE `precolombinos`;

CREATE TABLE IF NOT EXISTS `cultura` (
`cultura_id` INT NOT NULL AUTO_INCREMENT,
`cultura` VARCHAR(100) NOT NULL,
PRIMARY KEY (`cultura_id`)
);

CREATE TABLE roles (
`rol_id` INT AUTO_INCREMENT PRIMARY KEY,
`nombre` VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO roles (nombre) VALUES ('cliente'), ('operario'), ('admin');

CREATE TABLE IF NOT EXISTS `usuarios` (
`usuario_id` INT NOT NULL AUTO_INCREMENT,
`nombre` VARCHAR(100) NOT NULL,
`apellido` VARCHAR(100) NOT NULL,
`correo` VARCHAR(100) NOT NULL UNIQUE,
`cedula` VARCHAR(100) NOT NULL UNIQUE,
`telefono` VARCHAR(100) NOT NULL,
`direccion` VARCHAR(100) NOT NULL,
`fecha_registro` DATE NOT NULL,
`contraseña` VARCHAR(255),
`id_rol` INT,
`reset_token` VARCHAR(255) DEFAULT NULL,
`reset_token_expira` DATETIME DEFAULT NULL,
`estado` VARCHAR(20) DEFAULT 'activo',
`last_login` DATETIME DEFAULT NULL,
`fecha_baneo` DATETIME NULL,
FOREIGN KEY (`id_rol`) REFERENCES roles(`rol_id`),
PRIMARY KEY (`usuario_id`)
);

CREATE TABLE IF NOT EXISTS `ventas` (
`venta_id` INT NOT NULL AUTO_INCREMENT,
`usuario_id` INT NOT NULL,
`fecha` DATE NOT NULL,
`total` DECIMAL(10,2) NOT NULL,
`estado` VARCHAR(50) DEFAULT 'en proceso',
`tipo_pago` VARCHAR(50),
PRIMARY KEY (`venta_id`),
FOREIGN KEY (`usuario_id`)
REFERENCES `precolombinos`.`usuarios` (`usuario_id`)
ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `piezas` (
`piezas_id` INT NOT NULL AUTO_INCREMENT,
`nombre_pieza` VARCHAR(100) NOT NULL,
PRIMARY KEY (`piezas_id`)
);

CREATE TABLE IF NOT EXISTS `tamanio` (
`tamanio_id` INT NOT NULL AUTO_INCREMENT,
`tamanio` VARCHAR(100) NOT NULL,
PRIMARY KEY (`tamanio_id`)
);

CREATE TABLE IF NOT EXISTS `productos` (
`producto_id` INT NOT NULL AUTO_INCREMENT,
`piezas_id` INT NOT NULL,
`cultura_id` INT NOT NULL,
`tamanio_id` INT NOT NULL,
`descripcion` TEXT NOT NULL,
`imagen` VARCHAR(255) DEFAULT NULL,
`fecha_modificacion` DATE NOT NULL,
`precio` DECIMAL(10,2) NOT NULL,
`stock` INT NOT NULL,
`estado` VARCHAR(20) DEFAULT 'disponible',
`modificado_por` INT,
PRIMARY KEY (`producto_id`),
FOREIGN KEY (`piezas_id`)
REFERENCES `precolombinos`.`piezas` (`piezas_id`)
ON DELETE CASCADE,
FOREIGN KEY (`cultura_id`)
REFERENCES `precolombinos`.`cultura` (`cultura_id`)
ON DELETE CASCADE,
FOREIGN KEY (`tamanio_id`)
REFERENCES `precolombinos`.`tamanio` (`tamanio_id`)
ON DELETE CASCADE,
FOREIGN KEY (`modificado_por`) REFERENCES `usuarios`(`usuario_id`)
);

CREATE TABLE IF NOT EXISTS `detalle_de_venta` (
`detalle_id` INT NOT NULL AUTO_INCREMENT,
`venta_id` INT NOT NULL,
`producto_id` INT NOT NULL,
`cantidad` INT NOT NULL,
`subtotal` DECIMAL(10,2) NOT NULL,
PRIMARY KEY (`detalle_id`),
FOREIGN KEY (`venta_id`)
REFERENCES `precolombinos`.`ventas` (`venta_id`)
ON DELETE CASCADE,
FOREIGN KEY (`producto_id`)
REFERENCES `precolombinos`.`productos` (`producto_id`)
ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `historial_inventario` (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`producto_id` INT NOT NULL,
`admin_id` INT NOT NULL,
`accion` VARCHAR(50),
`cantidad` INT,
`fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (producto_id) REFERENCES productos(producto_id),
FOREIGN KEY (admin_id) REFERENCES usuarios(usuario_id)
);

CREATE TABLE resenas (
  resena_id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  comentario TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(producto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id)
);