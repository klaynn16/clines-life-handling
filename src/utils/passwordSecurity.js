export const PASSWORD_SECURITY_KEY = 'cline_password_security';
export const UNLOCKED_SESSION_KEY = 'cline_session_unlocked';
const ITERATIONS = 120000;

const toBase64 = bytes => btoa(String.fromCharCode(...bytes));
const fromBase64 = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));

export const generateSalt = () => { const salt = new Uint8Array(16); crypto.getRandomValues(salt); return toBase64(salt); };
export const hashPassword = async (password, salt) => { const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']); const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromBase64(salt), iterations: ITERATIONS, hash: 'SHA-256' }, key, 256); return toBase64(new Uint8Array(bits)); };
export const getPasswordSecurity = () => { try { const stored = localStorage.getItem(PASSWORD_SECURITY_KEY); return stored ? JSON.parse(stored) : null; } catch { return null; } };
export const savePasswordSecurity = security => localStorage.setItem(PASSWORD_SECURITY_KEY, JSON.stringify({ ...security, algorithm: 'PBKDF2-SHA-256', iterations: ITERATIONS, version: 1 }));
export const createPasswordSecurity = async password => { const salt = generateSalt(); const hash = await hashPassword(password, salt); const security = { salt, hash }; savePasswordSecurity(security); return security; };
export const verifyPassword = async (password, security = getPasswordSecurity()) => { if (!security?.salt || !security?.hash) return false; const hash = await hashPassword(password, security.salt); if (hash.length !== security.hash.length) return false; let result = 0; for (let i = 0; i < hash.length; i += 1) result |= hash.charCodeAt(i) ^ security.hash.charCodeAt(i); return result === 0; };
export const removePasswordSecurity = () => localStorage.removeItem(PASSWORD_SECURITY_KEY);
export const isSessionUnlocked = () => sessionStorage.getItem(UNLOCKED_SESSION_KEY) === 'true';
export const setSessionUnlocked = unlocked => { if (unlocked) sessionStorage.setItem(UNLOCKED_SESSION_KEY, 'true'); else sessionStorage.removeItem(UNLOCKED_SESSION_KEY); };
