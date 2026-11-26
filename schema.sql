CREATE DATABASE IF NOT EXISTS helpdesk_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE helpdesk_pro;
CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
 email VARCHAR(190) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
 role ENUM('admin','technician') NOT NULL DEFAULT 'technician'
);
CREATE TABLE IF NOT EXISTS tickets (
 id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(160) NOT NULL,
 description TEXT NOT NULL, customer VARCHAR(120) NOT NULL,
 priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
 status ENUM('open','progress','resolved') NOT NULL DEFAULT 'open',
 assigned_to INT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);
