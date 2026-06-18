import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const navItems = [
  { path: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { path: '/customers',     icon: '👥', label: 'Customers & Debt' },
  { path: '/orders',        icon: '📋', label: 'Order Management' },
  { path: '/payments',      icon: '💳', label: 'Payment & Billing' },
  { path: '/inventory',     icon: '🪣', label: 'Inventory Monitor' },
  { path: '/reports',       icon: '📊', label: 'Reports & Analytics' },
  { path: '/notifications', icon: '🔔', label: 'Notifications' },
  { path: '/predictions',   icon: '🤖', label: 'AI Predictions' },
];

export default function Sidebar({ onLogout }) {
  const { state } = useApp();
  const unread = state.notifications.filter(n => !n.read).length;

  return (
    <aside className="w-[220px] min-w-[220px] bg-navy flex flex-col h-screen">

      {/* Logo */}
      <div className="flex items-center gap-2.5 p-4 border-b border-white/10">
        <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-lg">💧</div>
        <span className="text-white font-bold text-[15px]">AguaDoc</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-2.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-4 py-2.5 text-[13px] border-l-[3px] transition-all cursor-pointer
              ${isActive
                ? 'bg-accent/20 text-accent border-accent font-semibold'
                : 'text-white/60 border-transparent hover:bg-white/10 hover:text-white'}`
            }
          >
            <span className="text-[15px] w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/notifications' && unread > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-white/50 text-[13px] hover:text-white py-2 cursor-pointer"
        >
          🚪 Sign Out
        </button>
      </div>

      {/* Admin Info */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-t border-white/10">
        <div className="w-8 h-8 rounded-full bg-accent2 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
          AD
        </div>
        <div>
          <div className="text-white text-xs font-semibold">Admin User</div>
          <div className="text-white/40 text-[11px]">agua_admin@doc.com</div>
        </div>
      </div>
    </aside>
  );
}