# API de Chat con Express y MySQL

Este proyecto es una API sencilla de chat desarrollada con Express y MySQL. Utiliza Docker Compose para orquestar los contenedores, facilitando su despliegue y desarrollo.

La API ofrece tres endpoints principales:

- **GET `/ping`**: Responde con un mensaje de prueba.
- **GET `/chats`**: Devuelve todos los registros de la tabla `chats`.
- **POST `/chats`**: Inserta un nuevo registro en la tabla `chats` con los campos `username` y `message`.

## Estructura del Proyecto

project/ ├── docker-compose.yml # Configuración de Docker Compose para los contenedores ├── Dockerfile # Dockerfile para la aplicación Express ├── init.sql # Script SQL que crea la tabla chats ├── index.js # Código fuente de la aplicación Express ├── package.json # Dependencias y scripts del proyecto └── package-lock.json # Archivo generado automáticamente por npm (opcional)

## Requisitos

- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) instalados en tu sistema.

## Uso

1. **Construir y levantar los contenedores**

   Desde la raíz del proyecto, ejecuta:

   ```bash
   docker-compose up --build
