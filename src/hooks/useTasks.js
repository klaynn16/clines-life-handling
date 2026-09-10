import useLocalStorage from './useLocalStorage'; import { STORAGE_KEYS } from '../utils/storageKeys'; import { demoData } from '../data/demoData';
export default function useTasks() { return useLocalStorage(STORAGE_KEYS.tasks, demoData.tasks); }
