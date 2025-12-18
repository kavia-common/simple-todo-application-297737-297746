import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional themed Todo App
 * - Add, toggle, delete, filter (All/Active/Completed)
 * - Persists to localStorage
 * - Modern styling with blue/amber accents, rounded corners, shadows, transitions
 */

// Types
/**
 * @typedef {{ id: string, title: string, completed: boolean, createdAt: number }} Todo
 */

const STORAGE_KEY = 'todo_app_items_v1';
const STORAGE_FILTER_KEY = 'todo_app_filter_v1';
const DEFAULT_FILTER = 'all'; // 'all' | 'active' | 'completed'

// Helpers
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const loadStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_e) {
    return fallback;
  }
};
const saveStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_e) {
    // ignore write errors
  }
};

// PUBLIC_INTERFACE
export function useTodos() {
  /** Manage todos with localStorage persistence */
  const [todos, setTodos] = useState(() => loadStorage(STORAGE_KEY, []));
  const [filter, setFilter] = useState(() => loadStorage(STORAGE_FILTER_KEY, DEFAULT_FILTER));

  useEffect(() => {
    saveStorage(STORAGE_KEY, todos);
  }, [todos]);

  useEffect(() => {
    saveStorage(STORAGE_FILTER_KEY, filter);
  }, [filter]);

  // PUBLIC_INTERFACE
  const addTodo = (title) => {
    const trimmed = String(title || '').trim();
    if (!trimmed) return;
    setTodos(prev => [{ id: uid(), title: trimmed, completed: false, createdAt: Date.now() }, ...prev]);
  };

  // PUBLIC_INTERFACE
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  // PUBLIC_INTERFACE
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // PUBLIC_INTERFACE
  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const filtered = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);

  const counts = useMemo(() => {
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.length - active;
    return { total: todos.length, active, completed };
  }, [todos]);

  return { todos, filtered, filter, setFilter, addTodo, toggleTodo, deleteTodo, clearCompleted, counts };
}

// PUBLIC_INTERFACE
function App() {
  /** Main SPA component rendering the header, input, list, and filters */
  const { filtered, filter, setFilter, addTodo, toggleTodo, deleteTodo, clearCompleted, counts } = useTodos();
  const [input, setInput] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    addTodo(input);
    setInput('');
  };

  const themeNote = (process.env.REACT_APP_NODE_ENV || 'development');

  return (
    <div className="ocean-app">
      <header className="ocean-header" role="banner">
        <div className="container">
          <div className="brand">
            <div className="logo" aria-hidden="true">✔</div>
            <div className="titles">
              <h1 className="title">Ocean Todos</h1>
              <p className="subtitle">Lightweight, fast, and elegant task tracking</p>
            </div>
          </div>
        </div>
      </header>

      <main className="ocean-main" role="main">
        <div className="container">
          <section className="todo-card" aria-label="Todo input and list">
            <form className="todo-input-row" onSubmit={onSubmit}>
              <input
                type="text"
                className="todo-input"
                placeholder="What needs to be done?"
                aria-label="Add a new todo"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="btn primary" aria-label="Add todo">
                Add
              </button>
            </form>

            <div className="controls">
              <div className="filters" role="tablist" aria-label="Filter todos">
                <FilterButton current={filter} value="all" onChange={setFilter}>All</FilterButton>
                <FilterButton current={filter} value="active" onChange={setFilter}>Active</FilterButton>
                <FilterButton current={filter} value="completed" onChange={setFilter}>Completed</FilterButton>
              </div>
              <div className="meta">
                <span className="count">{counts.active} active</span>
                {counts.completed > 0 && (
                  <button className="btn ghost danger" onClick={clearCompleted} aria-label="Clear completed todos">
                    Clear completed
                  </button>
                )}
              </div>
            </div>

            <ul className="todo-list">
              {filtered.length === 0 && (
                <li className="empty">No todos yet. Add one above to get started.</li>
              )}
              {filtered.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))}
            </ul>
          </section>

          <footer className="footer-note" role="contentinfo">
            <span className="env">Env: {themeNote}</span>
            <span className="hint">Data is stored locally in your browser.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function FilterButton({ current, value, onChange, children }) {
  const active = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`chip ${active ? 'active' : ''}`}
      onClick={() => onChange(value)}
    >
      {children}
    </button>
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  const created = new Date(todo.createdAt);
  const time = created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <li className={`todo ${todo.completed ? 'completed' : ''}`}>
      <label className="todo-left">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
        />
        <span className="checkmark" aria-hidden="true" />
        <span className="title-text">{todo.title}</span>
      </label>
      <div className="todo-right">
        <span className="meta-time" title={created.toLocaleString()}>
          {time}
        </span>
        <button className="icon-btn danger" onClick={onDelete} aria-label={`Delete "${todo.title}"`}>
          ×
        </button>
      </div>
    </li>
  );
}

export default App;
