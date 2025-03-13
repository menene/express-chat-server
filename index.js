const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 8080;

app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'chatuser',
  password: process.env.DB_PASSWORD || 'ch@tp@ss',
  database: process.env.DB_NAME || 'chatdb'
};

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
