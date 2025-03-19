
CREATE DATABASE IF NOT EXISTS chatdb;
USE chatdb;

CREATE USER IF NOT EXISTS 'chatuser'@'%' IDENTIFIED BY 'ch@tp@ss';
GRANT ALL PRIVILEGES ON chatdb.* TO 'chatuser'@'%';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  message TEXT NOT NULL
);
