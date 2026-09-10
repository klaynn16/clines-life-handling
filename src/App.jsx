import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import PageContainer from './components/layout/PageContainer';
import EntityModal from './components/common/EntityModal';
import ConfirmDialog from './components/common/ConfirmDialog';
import useLocalStorage from './hooks/useLocalStorage';
import { STORAGE_KEYS } from './utils/storageKeys';
import { demoData } from './data/demoData';
import { deletePdfFile, clearPdfFiles, savePdfFile } from './utils/pdfStorage';
import Dashboard from './pages/Dashboard';
import School from './pages/School';
import Calendar from './pages/Calendar';
import Todo from './pages/Todo';
import Budget from './pages/Budget';
import Wishlist from './pages/Wishlist';
import Goals from './pages/Goals';
import Notes from './pages/Notes';
import Settings from './pages/Settings';
import ProtectedApp from './components/auth/ProtectedApp';
import { getPasswordSecurity, isSessionUnlocked, removePasswordSecurity, setSessionUnlocked } from './utils/passwordSecurity';

export default function App() {
  const [authStatus, setAuthStatus] = useState(() => getPasswordSecurity() ? (isSessionUnlocked() ? 'unlocked' : 'locked') : 'setup');
  const [subjects, setSubjects] = useLocalStorage(STORAGE_KEYS.subjects, demoData.subjects);
  const [assignments, setAssignments] = useLocalStorage(STORAGE_KEYS.assignments, demoData.assignments);
  const [exams, setExams] = useLocalStorage(STORAGE_KEYS.exams, demoData.exams);
  const [projects, setProjects] = useLocalStorage(STORAGE_KEYS.projects, demoData.projects);
  const [tasks, setTasks] = useLocalStorage(STORAGE_KEYS.tasks, demoData.tasks);
  const [events, setEvents] = useLocalStorage(STORAGE_KEYS.events, demoData.events);
  const [transactions, setTransactions] = useLocalStorage(STORAGE_KEYS.transactions, demoData.transactions);
  const [wishlist, setWishlist] = useLocalStorage(STORAGE_KEYS.wishlist, demoData.wishlist);
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.goals, demoData.goals);
  const [notes, setNotes] = useLocalStorage(STORAGE_KEYS.notes, demoData.notes);
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, demoData.settings);
  const [budgetSettings, setBudgetSettings] = useLocalStorage(STORAGE_KEYS.budgetSettings, { savings: 0, monthlyBudget: 0, savingsGoal: { name: '', target: 0 } });
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState('');
  const setters = { subjects: setSubjects, assignments: setAssignments, exams: setExams, projects: setProjects, tasks: setTasks, events: setEvents, transactions: setTransactions, wishlist: setWishlist, goals: setGoals, notes: setNotes };
  const data = { subjects, assignments, exams, projects, tasks, events, transactions, wishlist, goals, notes };
  const notify = msg => { setToast(msg); window.clearTimeout(window.__clineToast); window.__clineToast = window.setTimeout(() => setToast(''), 2600); };
  const openModal = (type, item = null, mode = null) => setModal({ type, item, mode });

  const saveEntity = async rawItem => {
    const type = modal.type;
    const keys = { task: 'tasks', assignment: 'assignments', subject: 'subjects', exam: 'exams', project: 'projects', event: 'events', transaction: 'transactions', wishlist: 'wishlist', goal: 'goals', note: 'notes' };
    const key = keys[type];
    let item = { ...rawItem };
    item.id = item.id || `${type}-${Date.now()}`;
    if (type === 'transaction') {
      item.type = modal.mode?.type || item.type;
      item.amount = Number(item.amount) || 0;
      if (item.amount <= 0) throw new Error('Amount must be greater than ₱0.00.');
      const next = transactions.some(x => x.id === item.id) ? transactions.map(x => x.id === item.id ? item : x) : [item, ...transactions];
      const added = next.filter(x => x.type === 'Income').reduce((sum, x) => sum + Number(x.amount), 0);
      const spent = next.filter(x => x.type === 'Expense').reduce((sum, x) => sum + Number(x.amount), 0);
      const balance = added - spent;
      if (balance < 0) throw new Error(`Insufficient balance. You only have ₱${Math.max(0, added - transactions.filter(x => x.type === 'Expense').reduce((sum, x) => sum + Number(x.amount), 0)).toFixed(2)} available.`);
      if (balance < Number(budgetSettings.savings || 0)) throw new Error(`Not enough available money. ₱${Number(budgetSettings.savings).toFixed(2)} is currently reserved as savings.`);
    }
    if (type === 'note') {
      const { pdfFile, removePdf, ...note } = item;
      item = note;
      if (removePdf && rawItem.pdf?.id) await deletePdfFile(rawItem.pdf.id);
      if (pdfFile) { if (rawItem.pdf?.id) await deletePdfFile(rawItem.pdf.id); item.pdf = await savePdfFile(item.id, pdfFile); }
      if (!item.createdAt) item.createdAt = new Date().toISOString().slice(0, 10);
    }
    setters[key](list => list.some(x => x.id === item.id) ? list.map(x => x.id === item.id ? item : x) : [item, ...list]);
    const labels = { transaction: item.type === 'Income' ? 'Money added' : 'Expense recorded', note: 'Note', task: 'Task', assignment: 'Assignment', subject: 'Subject', exam: 'Exam', project: 'Project', event: 'Event', wishlist: 'Wishlist item', goal: 'Goal' };
    notify(type === 'transaction' ? `${labels[type]}: ${item.type === 'Income' ? '+' : '-'}₱${item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : `${labels[type]} ${modal.item ? 'updated' : 'added'} successfully ♡`);
  };

  const remove = (key, item) => setPendingDelete({ key, item });
  const confirmDelete = async () => { const { key, item } = pendingDelete; if (key === 'notes' && item.pdf?.id) await deletePdfFile(item.pdf.id); setters[key](list => list.filter(x => x.id !== item.id)); setPendingDelete(null); notify(`${key.slice(0, -1)[0].toUpperCase() + key.slice(1, -1)} deleted.`); };
  const update = (key, id, changes) => setters[key](list => list.map(x => x.id === id ? { ...x, ...changes } : x));
  const onToggleTask = task => { update('tasks', task.id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' }); notify(task.status === 'Completed' ? 'Task reopened.' : 'Task completed!'); };
  const resetAll = async () => { if (!window.confirm('Are you sure you want to reset all data? This cannot be undone.')) return; await clearPdfFiles(); Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key)); window.location.reload(); };
  const lockDashboard = () => { setSessionUnlocked(false); setAuthStatus('locked'); };
  const resetPasswordProtection = () => { removePasswordSecurity(); setSessionUnlocked(false); setAuthStatus('setup'); };
  useEffect(() => { document.documentElement.dataset.theme = settings.theme; document.documentElement.dataset.accent = settings.accent; }, [settings]);
  return <ProtectedApp status={authStatus} onUnlock={() => setAuthStatus('unlocked')} onSetup={() => setAuthStatus('unlocked')}><div className="app-shell"><Sidebar onLock={lockDashboard} /><PageContainer><Routes><Route path="/" element={<Dashboard data={data} openModal={openModal} onToggleTask={onToggleTask} />} /><Route path="/school" element={<School data={data} openModal={openModal} remove={remove} update={update} />} /><Route path="/calendar" element={<Calendar data={data} openModal={openModal} remove={remove} />} /><Route path="/todo" element={<Todo data={data} openModal={openModal} remove={remove} update={update} />} /><Route path="/budget" element={<Budget data={data} budgetSettings={budgetSettings} setBudgetSettings={setBudgetSettings} openModal={openModal} remove={remove} update={update} notify={notify} />} /><Route path="/wishlist" element={<Wishlist data={data} openModal={openModal} remove={remove} />} /><Route path="/goals" element={<Goals data={data} openModal={openModal} remove={remove} />} /><Route path="/notes" element={<Notes data={data} openModal={openModal} remove={remove} update={update} notify={notify} />} /><Route path="/settings" element={<Settings settings={settings} setSettings={setSettings} resetAll={resetAll} notify={notify} onResetPasswordProtection={resetPasswordProtection} />} /></Routes></PageContainer><MobileNav onLock={lockDashboard} />{modal && <EntityModal type={modal.type} item={modal.item} mode={modal.mode} onClose={() => setModal(null)} onSave={saveEntity} />}{pendingDelete && <ConfirmDialog message={`Are you sure you want to delete this ${pendingDelete.key.slice(0, -1)}?`} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />}{toast && <div className="toast">✦ {toast}</div>}</div></ProtectedApp>;
}
