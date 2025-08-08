import React, { useState, useEffect } from 'react';
import { fetchTodo } from '../../api';
import './TodoWidget.css';

const TodoWidget = ({ expanded = false }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(new Set());

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchTodo();
      setTodos(response.todo || []);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (index) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedTasks(newCompleted);
  };

  const getTaskPriority = (task, index) => {
    const lowPriorityKeywords = ['email', 'update', 'documentation'];
    const highPriorityKeywords = ['review', 'call', 'meeting', 'client'];
    const urgentKeywords = ['urgent', 'asap', 'today', 'immediate'];
    
    const taskLower = task.toLowerCase();
    
    if (urgentKeywords.some(keyword => taskLower.includes(keyword)) || index === 0) {
      return 'urgent';
    } else if (highPriorityKeywords.some(keyword => taskLower.includes(keyword)) || index <= 2) {
      return 'high';
    } else if (lowPriorityKeywords.some(keyword => taskLower.includes(keyword))) {
      return 'low';
    }
    return 'medium';
  };

  if (loading) {
    return (
      <div className={`todo-widget ${expanded ? 'expanded' : ''}`}>
        <div className="widget-header">
          <h3>Daily Tasks</h3>
          <div className="loading-spinner">
            <div className="spinner-small"></div>
          </div>
        </div>
        <div className="widget-content">
          <div className="loading-state">Loading tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`todo-widget ${expanded ? 'expanded' : ''}`}>
        <div className="widget-header">
          <h3>Daily Tasks</h3>
          <button onClick={loadTodos} className="refresh-btn" title="Retry">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
          </button>
        </div>
        <div className="widget-content">
          <div className="error-state">
            <p>Failed to load tasks</p>
            <small>{error}</small>
          </div>
        </div>
      </div>
    );
  }

  const displayTasks = expanded ? todos : todos.slice(0, 5);
  const completedCount = Array.from(completedTasks).filter(index => index < todos.length).length;
  const completionPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className={`todo-widget ${expanded ? 'expanded' : ''}`}>
      <div className="widget-header">
        <div className="header-content">
          <h3>Daily Tasks</h3>
          <div className="task-stats">
            <span className="completed-count">{completedCount}/{todos.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        <button onClick={loadTodos} className="refresh-btn" title="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
        </button>
      </div>
      
      <div className="widget-content">
        {todos.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3 8-8"></path>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.97 0 3.78.64 5.25 1.72"></path>
            </svg>
            <p>No tasks available</p>
          </div>
        ) : (
          <div className="todo-list">
            {displayTasks.map((task, index) => {
              const priority = getTaskPriority(task, index);
              const isCompleted = completedTasks.has(index);
              
              return (
                <div
                  key={index}
                  className={`todo-item ${priority} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="todo-checkbox">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleTaskCompletion(index)}
                      id={`task-${index}`}
                    />
                    <label htmlFor={`task-${index}`}></label>
                  </div>
                  <div className="todo-content">
                    <p className="todo-text">{task}</p>
                    <div className="todo-meta">
                      <span className={`priority-badge ${priority}`}>
                        {priority.toUpperCase()}
                      </span>
                      <span className="todo-time">Today</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!expanded && todos.length > 5 && (
          <div className="widget-footer">
            <button className="view-all-btn">
              View all {todos.length} tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoWidget;
