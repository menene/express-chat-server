# Chat API — Express + MySQL

A minimal REST API for a class chat application, built with [Express](https://expressjs.com/) and [MySQL](https://www.mysql.com/). Messages are stored in a MySQL database and exposed through a small set of JSON endpoints, with interactive Swagger documentation included.

## What it does

The server exposes these endpoints:

| Method | Path     | Description                                   |
| ------ | -------- | --------------------------------------------- |
| `GET`  | `/ping`  | Healthcheck — returns `{ "message": "pong" }` |
| `GET`  | `/chats` | Returns all chat messages                     |
| `POST` | `/chats` | Creates a new chat message                    |
| `GET`  | `/docs`  | Interactive Swagger UI API documentation      |

Each chat message has the shape:

```json
{
  "id": 1,
  "username": "alice",
  "message": "hello world"
}
```

- **CORS** is enabled for all origins, so the API can be called directly from a browser frontend.
- **Swagger/OpenAPI 3.0** docs are auto-generated from JSDoc annotations in `index.js` and served at `/docs`.
- The server listens on port **8080** inside the container.

### Data model

The `chats` table (see `init.sql`) is created automatically on first startup:

```sql
CREATE TABLE IF NOT EXISTS chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  message TEXT NOT NULL
);
```

## Project structure

```
.
├── index.js                    # Express server + all routes and Swagger config
├── init.sql                    # Creates the database, user, and chats table
├── Dockerfile                  # Builds the Node.js app image
├── docker-compose.yml.example  # MySQL + app services (copy to docker-compose.yml)
├── .env.example                # Environment variable template (copy to .env)
└── package.json
```

## Configuration

The app is configured entirely through environment variables. Copy the templates and fill them in:

```bash
cp .env.example .env
cp docker-compose.yml.example docker-compose.yml
```

`.env` contains two groups of variables:

```ini
# URL used by Swagger as the API server base URL
API_URL=http://localhost:8400

# MySQL container (used to initialize the database)
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=chatdb
MYSQL_USER=chatuser
MYSQL_PASSWORD=ch@tp@ss

# Express app — how it connects to MySQL
DB_HOST=db
DB_USER=chatuser
DB_PASSWORD=ch@tp@ss
DB_NAME=chatdb
```

> **Note:** When running under Docker Compose, `DB_HOST` should be `db` (the name of the MySQL service). The `MYSQL_*` values should match the corresponding `DB_*` values so the app can authenticate.

If no environment variables are provided, `index.js` falls back to these defaults: host `db`, user `chatuser`, password `ch@tp@ss`, database `chatdb`, and `API_URL` `http://localhost:8080`.

## Running with Docker (recommended)

Docker Compose runs both the MySQL database and the Express app together.

```bash
# 1. Create your config files
cp .env.example .env
cp docker-compose.yml.example docker-compose.yml

# 2. Edit .env with your values (see Configuration above)

# 3. Build and start
docker compose up --build
```

Port mappings (from `docker-compose.yml.example`):

- App:   `http://localhost:8400` → container port `8080`
- MySQL: `localhost:33064` → container port `3306`

Once running:

- API base URL: <http://localhost:8400>
- Swagger docs: <http://localhost:8400/docs>
- Healthcheck:  <http://localhost:8400/ping>

The database schema is initialized automatically on first run via `init.sql` (mounted into MySQL's `docker-entrypoint-initdb.d`). Database data persists in the `db_data` Docker volume.

## Running locally (without Docker)

You'll need Node.js and a running MySQL instance.

```bash
# 1. Install dependencies
npm install

# 2. Create the database and table
mysql -u root -p < init.sql

# 3. Set environment variables so the app can reach your MySQL
export DB_HOST=127.0.0.1
export DB_USER=chatuser
export DB_PASSWORD=ch@tp@ss
export DB_NAME=chatdb

# 4. Start the server
npm start
```

The server will start on port **8080**: <http://localhost:8080>

## Usage examples

**Healthcheck:**

```bash
curl http://localhost:8400/ping
# { "message": "pong" }
```

**Create a message:**

```bash
curl -X POST http://localhost:8400/chats \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "message": "hello world"}'
# { "id": 1, "username": "alice", "message": "hello world" }
```

Both `username` and `message` are required; omitting either returns `400 Bad Request`.

**List all messages:**

```bash
curl http://localhost:8400/chats
# [ { "id": 1, "username": "alice", "message": "hello world" } ]
```

## Tech stack

- **express** — HTTP server and routing
- **mysql2** — MySQL client (using the promise API)
- **cors** — Cross-origin request support
- **swagger-jsdoc** + **swagger-ui-express** — Auto-generated API documentation
