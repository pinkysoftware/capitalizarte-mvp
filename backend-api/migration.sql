-- ============================================
-- MIGRATION: Agregar campos a tabla datos para la app mobile
-- Run once in phpMyAdmin
-- ============================================

ALTER TABLE `datos`
  ADD COLUMN IF NOT EXISTS `apodo` VARCHAR(50) DEFAULT '' AFTER `telefono`,
  ADD COLUMN IF NOT EXISTS `ciudad` VARCHAR(70) DEFAULT '' AFTER `apodo`,
  ADD COLUMN IF NOT EXISTS `pais` VARCHAR(70) DEFAULT '' AFTER `ciudad`,
  ADD COLUMN IF NOT EXISTS `ocupacion` VARCHAR(100) DEFAULT '' AFTER `pais`,
  ADD COLUMN IF NOT EXISTS `ingreso_mensual` DECIMAL(15,2) DEFAULT 0 AFTER `ocupacion`,
  ADD COLUMN IF NOT EXISTS `gastos_fijos` DECIMAL(15,2) DEFAULT 0 AFTER `ingreso_mensual`,
  ADD COLUMN IF NOT EXISTS `gastos_variables` DECIMAL(15,2) DEFAULT 0 AFTER `gastos_fijos`,
  ADD COLUMN IF NOT EXISTS `nivel_inversor` VARCHAR(30) DEFAULT 'Principiante' AFTER `gastos_variables`,
  ADD COLUMN IF NOT EXISTS `avatar_id` INT DEFAULT 1 AFTER `nivel_inversor`;

-- ============================================
-- TABLA: Transacciones de la app mobile
-- ============================================

CREATE TABLE IF NOT EXISTS `transacciones_app` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `tipo` ENUM('GASTO', 'INGRESO') NOT NULL,
    `naturaleza` ENUM('FIJO', 'VARIABLE') NOT NULL DEFAULT 'VARIABLE',
    `categoria` VARCHAR(50) NOT NULL,
    `monto` DECIMAL(15,2) NOT NULL,
    `descripcion` TEXT,
    `fecha` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_usuario` (`usuario_id`),
    INDEX `idx_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
