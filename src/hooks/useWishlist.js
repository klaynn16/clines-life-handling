import useLocalStorage from './useLocalStorage'; import { STORAGE_KEYS } from '../utils/storageKeys'; import { demoData } from '../data/demoData';
export default function useWishlist() { return useLocalStorage(STORAGE_KEYS.wishlist, demoData.wishlist); }
