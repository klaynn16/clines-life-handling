import PasswordLock from './PasswordLock';
import PasswordSetup from './PasswordSetup';

export default function ProtectedApp({ status, onUnlock, onSetup, children }) { if (status === 'setup') return <PasswordSetup onComplete={onSetup} />; if (status === 'locked') return <PasswordLock onUnlock={onUnlock} />; return children; }
