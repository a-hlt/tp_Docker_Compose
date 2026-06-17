const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all requests (mainly for development outside Nginx)
app.use(cors());
app.use(express.json());

// Setup PostgreSQL client pool
const dbUrl = process.env.DATABASE_URL || `postgres://${process.env.POSTGRES_USER || 'ynov_user'}:${process.env.POSTGRES_PASSWORD || 'ynov_secure_password_123'}@${process.env.DB_HOST || 'db'}:5432/${process.env.POSTGRES_DB || 'ynov_tasks_db'}`;

const pool = new Pool({
  connectionString: dbUrl,
});

// Helper function to connect and initialize database with retries
async function initializeDbWithRetry(retries = 5, delay = 5000) {
  while (retries > 0) {
    try {
      console.log('Attempting to connect to PostgreSQL...');
      const client = await pool.connect();
      console.log('Connected to database successfully.');
      
      // Create tasks table if it does not exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Database schema verified.');
      client.release();
      return;
    } catch (err) {
      retries -= 1;
      console.error(`Database connection failed. Retries left: ${retries}. Error:`, err.message);
      if (retries === 0) {
        console.error('Could not connect to database, exiting...');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Server error creating task' });
  }
});

// Toggle task status
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Find current status
    const selectResult = await pool.query('SELECT completed FROM tasks WHERE id = $1', [id]);
    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const newCompletedState = !selectResult.rows[0].completed;
    const updateResult = await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
      [newCompletedState, id]
    );
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Error toggling task:', err);
    res.status(500).json({ error: 'Server error updating task' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Server error deleting task' });
  }
});

// Initialize DB and start server
initializeDbWithRetry().then(() => {
  app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
  });
});
