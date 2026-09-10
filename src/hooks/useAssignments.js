import useLocalStorage from './useLocalStorage'; import { STORAGE_KEYS } from '../utils/storageKeys'; import { demoData } from '../data/demoData';
export default function useAssignments() { return useLocalStorage(STORAGE_KEYS.assignments, demoData.assignments); }
