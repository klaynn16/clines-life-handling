import useLocalStorage from './useLocalStorage'; import { STORAGE_KEYS } from '../utils/storageKeys'; import { demoData } from '../data/demoData';
export default function useTransactions() { return useLocalStorage(STORAGE_KEYS.transactions, demoData.transactions); }
