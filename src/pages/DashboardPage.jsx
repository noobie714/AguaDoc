// src/pages/DashboardPage.jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'chart.js/auto';
import { useApp } from '../context/AppContext';

const PRICE = 50;

export default function DashboardPage() {
  const { state } = useApp();
  const navigate  = useNavigate();
  const chartRef  = useRef(null);
  const canvasRef = useRef(null);

  // ── Computed values (replaces renderDashboard() calculations) ──
  const totalSales    = state.orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + (o.total ?? o.amount ?? 0), 0);

  const totalDebt     = state.customers
    .reduce((sum, c) => sum + c.balance, 0);

  const pendingOrders = state.orders
    .filter(o => o.status === 'Pending').length;

  const availGallons  = state.inventory.readyGallons;
  const waterPct      = Math.round(
    (state.inventory.waterLevel / state.inventory.maxCapacity) * 100
  );

  // ── Alerts (replaces the alerts[] array in renderDashboard) ──
  const alerts = [];
  if (waterPct < 20)
    alerts.push({ type: 'warn',   msg: `Low water supply! Current level at ${waterPct}%.` });
  state.customers
    .filter(c => c.balance > 0)
    .slice(0, 2)
    .forEach(c =>
      alerts.push({ type: 'danger', msg: `${c.name} has an overdue balance of ₱${c.balance}.` })
    );
  if (pendingOrders > 0)
    alerts.push({ type: 'info',   msg: `${pendingOrders} pending order(s) need attention.` });

  // ── Best customers (replaces bestCustomers table) ──
  const bestCustomers = [...state.customers]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 4);

  // ── Recent orders (replaces recentOrders table) ──
  const recentOrders = [...state.orders]
    .reverse()
    .slice(0, 4);

  // ── Chart (replaces new Chart(dashChart, ...) in renderDashboard) ──
  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Actual',
            data: [200, 320, 280, 400, 350, 420, 380],
            borderColor: '#1eb8c8',
            backgroundColor: 'rgba(30,184,200,.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 3,
          },
          {
            label: 'Predicted',
            data: [220, 300, 290, 380, 360, 410, 395],
            borderColor: '#6b46c1',
            borderDash: [5, 4],
            tension: 0.4,
            fill: false,
            borderWidth: 2,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { ticks: { font: { size: 11 }, callback: v => '₱' + v } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, []);

  // ── Alert style helper ──
  const alertStyle = {
    warn:   'bg-yellow-50 border-l-4 border-yellow-400',
    danger: 'bg-red-50 border-l-4 border-red-400',
    info:   'bg-blue-50 border-l-4 border-blue-400',
  };

  return (
    <div>

      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-r from-navy to-[#1a3a6b] rounded-xl px-6 py-4 text-white flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold">Welcome back, Admin! 👋</h2>
          <p className="text-xs text-white/70 mt-0.5">Here's what's happening in AguaDoc today.</p>
        </div>
        <button
          onClick={() => navigate('/reports')}
          className="bg-accent hover:bg-accent2 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
        >
          📈 Generate Report
        </button>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3 mb-4">

        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="text-xs text-gray-500 mb-1">Total Sales (This Week)</div>
          <div className="text-[22px] font-black text-gray-800">₱{totalSales}</div>
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full font-semibold mt-1 bg-green-100 text-green-800">
            +12.5%
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="text-xs text-gray-500 mb-1">Outstanding Debt</div>
          <div className="text-[22px] font-black text-gray-800">₱{totalDebt}</div>
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full font-semibold mt-1 bg-red-100 text-red-800">
            Needs attention
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="text-xs text-gray-500 mb-1">Pending Orders</div>
          <div className="text-[22px] font-black text-gray-800">{pendingOrders}</div>
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full font-semibold mt-1 bg-blue-100 text-blue-800">
            Active
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="text-xs text-gray-500 mb-1">Available Gallons</div>
          <div className="text-[22px] font-black text-gray-800">{availGallons}</div>
          <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-semibold mt-1
            ${availGallons < 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            {availGallons < 50 ? '⚠ Low Stock' : '✓ Good'}
          </span>
        </div>

      </div>

      {/* ── Chart + Alerts Row ── */}
      <div className="grid grid-cols-[3fr_2fr] gap-3.5 mb-3.5">

        {/* Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[15px] font-bold">📈 Sales Prediction vs Actual</div>
          <div className="text-xs text-gray-500 mt-0.5 mb-3">AI-powered forecast for the current week</div>
          <div className="relative h-[200px]">
            <canvas ref={canvasRef} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-accent mr-1" />
              Actual
            </span>
            <span>
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-purple-600 mr-1" />
              Predicted
            </span>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[15px] font-bold mb-3">⚠ System Alerts</div>
          {alerts.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-6">No alerts 🎉</div>
          ) : (
            alerts.map((alert, i) => (
              <div key={i} className={`flex gap-2.5 p-2.5 rounded-lg mb-2 text-[13px] ${alertStyle[alert.type]}`}>
                <div>
                  <div>{alert.msg}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Today</div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ── Best Customers + Recent Orders Row ── */}
      <div className="grid grid-cols-2 gap-3.5">

        {/* Best Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[15px] font-bold">🏆 Best Customers</div>
          <div className="text-xs text-gray-500 mt-0.5 mb-3">Top buyers this month</div>
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                {['#', 'Customer', 'Orders', 'Total Paid'].map(h => (
                  <th key={h} className="text-left px-2.5 py-2 text-[11.5px] font-semibold text-gray-500 border-b-2 border-gray-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bestCustomers.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  <td className="px-2.5 py-2.5 text-gray-400 font-semibold">{i + 1}</td>
                  <td className="px-2.5 py-2.5 font-medium">{c.name}</td>
                  <td className="px-2.5 py-2.5 text-gray-500">{c.orders}</td>
                  <td className="px-2.5 py-2.5 font-semibold text-gray-700">
                    ₱{c.orders * PRICE * 1.5}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[15px] font-bold mb-3">📦 Recent Orders</div>
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                {['Customer', 'Gallons', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left px-2.5 py-2 text-[11.5px] font-semibold text-gray-500 border-b-2 border-gray-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => {
                // Orders from the customer portal use userId; admin-created orders use custId
                const id = o.userId || o.custId;
                const customer =
                  (state.users     || []).find(u => String(u.id) === String(id)) ||
                  (state.customers || []).find(c => String(c.id) === String(id));
                return (
                  <tr key={o.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                    <td className="px-2.5 py-2.5 font-medium">
                      {customer ? (customer.name || customer.fullName) : '—'}
                    </td>
                    <td className="px-2.5 py-2.5 text-gray-500">{o.quantity ?? o.gallons ?? '—'}</td>
                    <td className="px-2.5 py-2.5 font-semibold">₱{o.total ?? o.amount ?? '—'}</td>
                    <td className="px-2.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-semibold
                        ${o.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : o.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
