import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState({ api: 'checking', db: 'checking' });

  // Fetch API Health & Tasks on mount
  useEffect(() => {
    checkHealth();
    fetchTasks();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (response.ok && data.status === 'healthy') {
        setHealth({ api: 'online', db: 'online' });
      } else {
        setHealth({ api: 'online', db: 'offline' });
      }
    } catch (err) {
      setHealth({ api: 'offline', db: 'offline' });
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Impossible de charger les tâches.');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setError(null);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la tâche.');
      }

      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
      setNewTaskTitle('');
      checkHealth(); // Proactively refresh health
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleTask = async (id) => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la tâche.');
      }

      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la tâche.');
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path fill="currentColor" d="M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </div>
          <div>
            <h1>TaskCompose</h1>
            <p className="subtitle">M1 Full Stack • TP Docker Compose</p>
          </div>
        </div>

        <div className="status-container">
          <div className={`status-badge ${health.api}`}>
            <span className="indicator"></span>
            API: {health.api === 'online' ? 'En ligne' : health.api === 'offline' ? 'Hors ligne' : 'Vérification...'}
          </div>
          <div className={`status-badge ${health.db}`}>
            <span className="indicator"></span>
            Base de données: {health.db === 'online' ? 'Connectée' : health.db === 'offline' ? 'Erreur' : 'Vérification...'}
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="task-form-section">
          <form onSubmit={addTask} className="task-form">
            <input
              type="text"
              placeholder="Ajouter une nouvelle tâche conteneurisée..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              maxLength={100}
              disabled={health.api === 'offline'}
            />
            <button type="submit" disabled={!newTaskTitle.trim() || health.api === 'offline'}>
              Ajouter
            </button>
          </form>
        </section>

        {error && (
          <div className="error-banner">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <section className="tasks-list-section">
          {loading ? (
            <div className="loading-spinner-container">
              <div className="spinner"></div>
              <p>Chargement des tâches depuis PostgreSQL...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" width="64" height="64">
                <path fill="currentColor" d="M22 2v20H2V2h20m-2 2H4v14h16V4m-6 6v2H8v-2h6m0 4v2H8v-2h6z" />
              </svg>
              <h3>Aucune tâche trouvée</h3>
              <p>Ajoutez une tâche ci-dessus pour tester la persistance.</p>
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.map((task) => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  <div className="task-card-content" onClick={() => toggleTask(task.id)}>
                    <div className="checkbox">
                      {task.completed && (
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M9,16.17L4.83,12l-1.42,1.41L9,19 21,7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <span className="task-title">{task.title}</span>
                  </div>
                  <button 
                    className="delete-btn" 
                    onClick={() => deleteTask(task.id)}
                    title="Supprimer la tâche"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-details">
          <span>Docker Compose Multi-stage Monorepo</span>
          <span className="separator">•</span>
          <span>Ynov CI/CD TP</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
