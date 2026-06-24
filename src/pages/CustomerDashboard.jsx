import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, CreditCard, LogOut, Bell } from 'lucide-react';
import { apiGetOrders } from '../api';
import RequestServicePage from './RequestServicePage';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',       id: 'dashboard' },
  { icon: ShoppingCart,    label: 'Request Service', id: 'request'   },
  { icon: ShoppingCart,    label: 'My Order',        id: 'orders'    },
  { icon: CreditCard,      label: 'Billing History', id: 'billing'   },
];

const STATUS_STYLE = {
  Pending:   'bg-yellow-50 text-yellow-600',
  Active:    'bg-blue-50 text-blue-600',
  Ready:     'bg-green-50 text-green-600',
  Delivered: 'bg-gray-100 text-gray-500',
};

export default function CustomerDashboard({ user, onLogout }) {
  const [active, setActive]   = useState('dashboard');
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetOrders(user.id)
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.id]);

  const stats = {
    total:     orders.length,
    active:    orders.filter(o => o.status === 'Active' || o.status === 'Pending').length,
    ready:     orders.filter(o => o.status === 'Ready').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  const STATS = [
    { emoji: '📋', label: 'TOTAL ORDER',     key: 'total'     },
    { emoji: '⏳', label: 'ACTIVE SERVICES', key: 'active'    },
    { emoji: '✅', label: 'READY',           key: 'ready'     },
    { emoji: '🏁', label: 'DELIVERED',       key: 'delivered' },
  ];

  const initials  = (user?.username || user?.fullName || 'U').slice(0, 1).toUpperCase();
  const firstName = (user?.fullName || user?.username || 'User').split(' ')[0];
  const recentOrders = [...orders].reverse().slice(0, 10);

  return (
    <div className="flex h-screen bg-[#f0f6fb] overflow-hidden">

      {/* Sidebar */}
      <aside className="w-52 bg-[#0f2a4a] flex flex-col py-6 px-4 shrink-0">
        <div className="flex items-center gap-2 mb-10 px-1">
          <div className="w-8 h-8 bg-[#0ea5c9] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">💧</span>
          </div>
          <span className="text-white font-bold text-base">AguaDoc.</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ icon: Icon, label, id }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left
                ${active === id ? 'bg-[#0ea5c9] text-white' : 'text-gray-300 hover:bg-white/10'}`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>

        {/* Sign Out pinned to bottom of sidebar */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition mt-2"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-4 py-2 max-w-sm">
            <span className="text-gray-400 text-sm">🔍</span>
            <input placeholder="Search orders..." className="bg-transparent text-sm outline-none flex-1 text-gray-500" />
          </div>
          <button className="relative ml-auto text-gray-400 hover:text-gray-600">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center">0</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── Request Service Page ── */}
          {active === 'request' && (
            <RequestServicePage
              user={user}
              onOrderPlaced={() => {
                apiGetOrders(user.id).then(data => setOrders(Array.isArray(data) ? data : []));
                setActive('dashboard');
              }}
            />
          )}

          {/* ── Dashboard Page ── */}
          {active === 'dashboard' && (
            <>
              {/* Welcome banner */}
              <div className="bg-[#0f2a4a] rounded-2xl px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 className="text-white text-lg font-semibold">Good day, {firstName}! 👋</h2>
                  <p className="text-gray-400 text-sm mt-0.5">Here's a summary of your interactions and orders.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0ea5c9] flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-medium">{user?.username || user?.fullName}</p>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                  </div>
                  <button onClick={onLogout}
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm ml-4 border border-white/20 rounded-lg px-3 py-1.5 transition">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {STATS.map(({ emoji, label, key }) => (
                  <div key={key} className="bg-white rounded-2xl px-5 py-5 shadow-sm">
                    <div className="text-2xl mb-3">{emoji}</div>
                    <p className="text-xs text-gray-400 font-semibold tracking-wide">{label}</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-1">
                      {loading ? '...' : stats[key]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#0f172a]">Recent Service & Order Activity</h3>
                  <button
                    onClick={() => setActive('orders')}
                    className="text-xs text-[#0ea5c9] border border-[#0ea5c9] px-3 py-1 rounded-lg hover:bg-[#0ea5c9] hover:text-white transition">
                    View All
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs border-b border-gray-100">
                      <th className="text-left pb-2 font-semibold">REF #</th>
                      <th className="text-left pb-2 font-semibold">TYPE</th>
                      <th className="text-left pb-2 font-semibold">DATE</th>
                      <th className="text-left pb-2 font-semibold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="text-center text-gray-400 py-8">Loading...</td></tr>
                    ) : recentOrders.length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-gray-400 py-8">No activity yet...</td></tr>
                    ) : recentOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-50">
                        <td className="py-2 text-gray-700 font-mono text-xs">{order.ref || order.id}</td>
                        <td className="py-2 text-gray-700">{order.type}</td>
                        <td className="py-2 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-500'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── My Orders Page ── */}
          {active === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-[#0f172a] mb-4">My Orders</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs border-b border-gray-100">
                    <th className="text-left pb-2 font-semibold">REF #</th>
                    <th className="text-left pb-2 font-semibold">TYPE</th>
                    <th className="text-left pb-2 font-semibold">QTY</th>
                    <th className="text-left pb-2 font-semibold">TOTAL</th>
                    <th className="text-left pb-2 font-semibold">DATE</th>
                    <th className="text-left pb-2 font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center text-gray-400 py-8">Loading...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-gray-400 py-8">No orders yet...</td></tr>
                  ) : [...orders].reverse().map(order => (
                    <tr key={order.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700 font-mono text-xs">{order.ref || order.id}</td>
                      <td className="py-2 text-gray-700">{order.type}</td>
                      <td className="py-2 text-gray-700">{order.quantity}</td>
                      <td className="py-2 text-gray-700">₱{order.total}</td>
                      <td className="py-2 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-500'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Billing History ── */}
          {active === 'billing' && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-[#0f172a] mb-4">Billing History</h3>
              <p className="text-gray-400 text-sm text-center py-8">No billing records yet...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}