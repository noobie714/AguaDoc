// src/pages/ReportsPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { showToast } from '../components/ui/Toast';
import { Chart } from 'chart.js/auto';

export default function ReportsPage() {
  const { state } = useApp();
  const [mode, setMode] = useState('weekly');
  const chartRef  = useRef(null);
  const canvasRef = useRef(null);

  // ── Summary totals (replaces renderReports calculations) ──
  const grossTotal  = state.orders.reduce((sum, o) => sum + o.amount, 0);
  const collected   = state.payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = state.customers.reduce((sum, c) => sum + c.balance, 0);

  // ── Revenue chart (replaces renderReports chart) ──
  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const labels = mode === 'weekly'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = mode === 'weekly'
      ? [200, 320, 280, 400, 350, 420, 380]
      : [1200, 1800, 1500, 2200, 1900, 2500, 2100, 2400, 2000, 2700, 2300, 2800];
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Revenue', data, backgroundColor: '#7c3aed', borderRadius: 5 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { ticks: { font: { size: 11 }, callback: v => '₱' + v.toLocaleString() } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [mode]);

  // ── Export CSV (replaces exportCSV) ──
  function handleExportCSV() {
    const rows = [['Customer', 'Order ID', 'Gallons', 'Amount', 'Payment', 'Date', 'Status']];
    state.orders.forEach(o => {
      const c   = state.customers.find(x => x.id === o.custId);
      const pay = state.payments.find(p => p.custId === o.custId && p.orderId === o.id);
      rows.push([
        c?.name ?? '?',
        '#' + o.id,
        o.gallons,
        '₱' + o.amount,
        pay ? pay.method : 'Unpaid',
        o.date,
        o.status,
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'AguaDoc_Report.csv';
    a.click();
    showToast('📥 CSV exported!');
  }

  // ── Payment method badge ──
  const methodBadge = {
    Cash:   'bg-indigo-100 text-indigo-800',
    GCash:  'bg-green-100 text-green-800',
    Online: 'bg-blue-100 text-blue-800',
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-[15px] font-bold">📊 Reports & Analytics</div>
            <div className="text-xs text-gray-500 mt-0.5">Generate financial summaries and review transaction histories.</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              ⬇ Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent2 transition cursor-pointer"
            >
              🖨 Print
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-green-600 rounded-xl p-3.5 text-white">
            <div className="text-xs opacity-85">Gross Total Sales</div>
            <div className="text-[22px] font-black mt-1">₱{grossTotal}</div>
          </div>
          <div className="bg-blue-600 rounded-xl p-3.5 text-white">
            <div className="text-xs opacity-85">Actual Collections</div>
            <div className="text-[22px] font-black mt-1">₱{collected}</div>
          </div>
          <div className="bg-red-500 rounded-xl p-3.5 text-white">
            <div className="text-xs opacity-85">Outstanding Debts</div>
            <div className="text-[22px] font-black mt-1">₱{outstanding}</div>
          </div>
        </div>

        {/* Weekly / Monthly Toggle */}
        <div className="flex gap-2 mb-3">
          {['weekly', 'monthly'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer
                ${mode === m
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-accent hover:text-accent'}`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-2">
          {mode === 'weekly' ? 'Weekly' : 'Monthly'} Revenue Breakdown
        </div>
        <div className="relative h-[240px] mb-4">
          <canvas ref={canvasRef} />
        </div>

        {/* Transaction History Table */}
        <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-2">
          Customer Transaction History
        </div>
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr>
              {['Customer', 'Order ID', 'Gallons', 'Amount', 'Payment', 'Date', 'Status'].map(h => (
                <th key={h} className="text-left px-2.5 py-2 text-[11.5px] font-semibold text-gray-500 border-b-2 border-gray-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.orders.map(o => {
              const customer = state.customers.find(x => x.id === o.custId);
              const pay      = state.payments.find(p => p.custId === o.custId && p.orderId === o.id);
              return (
                <tr key={o.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  <td className="px-2.5 py-2.5 font-medium">{customer?.name ?? '?'}</td>
                  <td className="px-2.5 py-2.5 font-mono text-gray-600">#{String(o.id).padStart(2, '0')}</td>
                  <td className="px-2.5 py-2.5 text-gray-500">{o.gallons}</td>
                  <td className="px-2.5 py-2.5 font-semibold">₱{o.amount}</td>
                  <td className="px-2.5 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11.5px] font-semibold
                      ${pay ? (methodBadge[pay.method] ?? 'bg-gray-100 text-gray-600') : 'bg-yellow-100 text-yellow-800'}`}>
                      {pay ? pay.method : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-2.5 py-2.5 text-gray-500">{o.date}</td>
                  <td className="px-2.5 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11.5px] font-semibold
                      ${o.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
  );
}
