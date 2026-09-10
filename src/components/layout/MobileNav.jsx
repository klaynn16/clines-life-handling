import { NavLink } from 'react-router-dom';
import { navItems } from './Sidebar';
export default function MobileNav({ onLock }) { return <nav className="mobile-nav">{navItems.slice(0, 5).map(([to, icon, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}><span>{icon}</span><small>{label}</small></NavLink>)}<button className="mobile-lock" onClick={onLock} aria-label="Lock Dashboard"><span>🔒</span><small>Lock</small></button></nav>; }
