import React, { useState } from 'react';
import { Plus, Check, Trash2, Filter, CheckCircle2, Circle } from 'lucide-react';
import { TodoItem } from '../../types';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../../utils/storage';

const INITIAL_TODOS: TodoItem[] = [
  { id: '1', text: 'Buka materi kuliah / tugas kantor', completed: true, priority: 'high', createdAt: Date.now() - 3600000 },
  { id: '2', text: 'Cek email penting & pesan masuk', completed: false, priority: 'medium', createdAt: Date.now() - 1800000 },
  { id: '3', text: 'Istirahat & minum air putih secukupnya', completed: false, priority: 'low', createdAt: Date.now() },
];

export const TodoWidget: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    return loadFromStorage<TodoItem[]>(STORAGE_KEYS.TODOS, INITIAL_TODOS);
  });
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const updateTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    saveToStorage(STORAGE_KEYS.TODOS, newTodos);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newItem: TodoItem = {
      id: String(Date.now()),
      text: inputText.trim(),
      completed: false,
      priority,
      createdAt: Date.now(),
    };

    updateTodos([newItem, ...todos]);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    updateTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    updateTodos(updated);
  };

  const clearCompleted = () => {
    const updated = todos.filter((t) => !t.completed);
    updateTodos(updated);
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  const getPriorityBadge = (p: 'low' | 'medium' | 'high') => {
    if (p === 'high') {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
          Tinggi
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Sedang
        </span>
      );
    }
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        Rendah
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-2.5 text-xs select-none h-full">
      {/* Input Form */}
      <form onSubmit={handleAddTodo} className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tambah tugas baru..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            title="Tambah Tugas"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Selector */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 px-0.5">
          <span>Prioritas:</span>
          <div className="flex items-center gap-1">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  priority === p
                    ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15'
                }`}
              >
                {p === 'high' ? 'Tinggi' : p === 'medium' ? 'Sedang' : 'Rendah'}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Filter Tabs & Stats */}
      <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[11px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Semua ({todos.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-500 text-white'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Aktif ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-blue-500 text-white'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Selesai
          </button>
        </div>

        {todos.some((t) => t.completed) && (
          <button
            type="button"
            onClick={clearCompleted}
            className="text-[10px] text-red-500 hover:underline"
          >
            Hapus Selesai
          </button>
        )}
      </div>

      {/* Todo List Items */}
      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-0.5">
        {filteredTodos.length === 0 ? (
          <div className="py-6 text-center text-neutral-400 dark:text-neutral-500 text-xs">
            {filter === 'completed'
              ? 'Belum ada tugas selesai'
              : filter === 'active'
              ? 'Hebat! Semua tugas sudah selesai 🎉'
              : 'Belum ada tugas hari ini'}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`group flex items-center justify-between gap-2 p-2 rounded-lg border transition-all ${
                todo.completed
                  ? 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent opacity-60'
                  : 'bg-white/60 dark:bg-neutral-800/60 border-black/5 dark:border-white/5 hover:border-blue-500/30'
              }`}
            >
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                onClick={() => toggleTodo(todo.id)}
              >
                <button
                  type="button"
                  className="text-neutral-400 hover:text-blue-500 transition-colors shrink-0"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <span
                  className={`truncate text-xs ${
                    todo.completed
                      ? 'line-through text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-800 dark:text-neutral-200 font-medium'
                  }`}
                >
                  {todo.text}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {getPriorityBadge(todo.priority)}
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  title="Hapus Tugas"
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
