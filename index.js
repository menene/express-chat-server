const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'chatuser',
  password: process.env.DB_PASSWORD || 'ch@tp@ss',
  database: process.env.DB_NAME || 'chatdb'
};

const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * @swagger
 * tags:
 *   - name: Chat API
 *     description: Endpoints para el chat de la clase
 */

/**
 * @swagger
 * /ping:
 *   get:
 *     tags:
 *       - Chat API
 *     summary: Healthcheck para validar que el API está activo.
 *     responses:
 *       200:
 *         description: Pong.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 */
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

/**
 * @swagger
 * /chats:
 *   get:
 *     tags:
 *       - Chat API
 *     summary: Lista todos los chats de la base de datos.
 *     responses:
 *       200:
 *         description: Lista de todos los chats.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       500:
 *         description: Server error.
 */
app.get('/chats', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id, username, message FROM chats');
    
    await connection.end();
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /chats:
 *   post:
 *     tags:
 *       - Chat API
 *     summary: Crear un nuevo mensaje en el chat.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewChat'
 *     responses:
 *       201:
 *         description: Chat creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Bad request - Missing username or message.
 *       500:
 *         description: Server error.
 */
app.post('/chats', async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message) {
    return res.status(400).json({ error: 'Username and message required' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO chats (username, message) VALUES (?, ?)',
      [username, message]
    );
    const insertedId = result.insertId;
    
    await connection.end();
    
    res.status(201).json({ id: insertedId, username, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat API',
      version: '1.0.0',
      description: 'API para aplicación de chat construida con Express y MySQL'
    },
    servers: [
      {
        url: apiUrl
      }
    ]
  },
  apis: ['./index.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { defaultModelsExpandDepth: -1 }));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
