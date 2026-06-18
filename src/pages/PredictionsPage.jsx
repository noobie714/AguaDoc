// src/pages/PredictionsPage.jsx
import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Chart } from 'chart.js/auto';
import { showToast } from '../components/ui/Toast';

export default function PredictionsPage() {
  const { state }  = useApp();   // read-only — no dispatch needed
  const canvasRef  = useRef(null);
  const chartRef   = useRef(null);

  // Predictions (replaces renderPredictions())
  const sales    = state.orders.filter(o => o.status === 'Delivered').reduce((s,o) => s + o.amount, 0);
  const avg      = Math.round(sales / 7);
  const predToday = avg;
  const predWeek  = avg * 7;
  const predMonth = avg * 30;

  // Pending deliveries for route (replaces renderRoute())
  const deliveries = state.orders.filter(o => o.status === 'Pending' && o.type === 'Delivery');

  // Debt risk per customer (replaces riskTable logic)
  const riskData = state.customers.map(c => {
    const score    = c.balance > 300 ? 92 : c.balance > 100 ? 58 : c.balance > 0 ? 30 : 5;
    const risk     = score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low';
    const barColor = score > 70 ? '#e53e3e' : score > 40 ? '#f59e0b' : '#38a169';
    const bgColor  = score > 70 ? '#fee2e2' : score > 40 ? '#fef3c7' : '#d1fae5';
    const badgeStyle = score > 70 ? 'bg-red-100 text-red-800' : score > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
    return { ...c, score, risk, barColor, bgColor, badgeStyle };
  });

  // Prediction chart (replaces charts.pred)
  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon+1','Tue+1','Wed+1'],
        datasets: [
          {
            label: 'Actual',
            data: [200,320,280,400,350,420,380,null,null,null],
            borderColor: '#1eb8c8', tension: 0.4, borderWidth: 2, pointRadius: 3, spanGaps: false,
          },
          {
            label: 'Predicted',
            data: [null,null,null,null,null,null,380,395,415,435],
            borderColor: '#f59e0b', borderDash: [5,4], tension: 0.4, borderWidth: 2, pointRadius: 3, spanGaps: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { ticks: { font: { size: 10 }, callback: v => '₱' + v } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, []);

  return (
    <div>

      {/* Sales Prediction Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3.5">
        <div className="text-[15px] font-bold">📈 Sales Prediction</div>
        <div className="text-xs text-gray-500 mt-0.5 mb-3">AI-powered daily and weekly sales forecast based on historical data</div>

        {/* 3 prediction values */}
        <div className="grid grid-cols-3 gap-3 mb-3.5">
          {[
            { label: 'Predicted Today',      value: `₱${predToday}`, note: 'Based on 7-day trend' },
            { label: 'Predicted This Week',   value: `₱${predWeek}`,  note: 'Moving average forecast' },
            { label: 'Predicted This Month',  value: `₱${predMonth}`, note: 'Seasonal pattern applied' },
          ].map(p => (
            <div key={p.label} className="bg-gray-50 rounded-xl p-3.5">
              <div className="text-[11.5px] text-gray-500 font-semibold uppercase tracking-wide mb-1">{p.label}</div>
              <div className="text-[20px] font-black text-gray-800">{p.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{p.note}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="relative h-[180px]">
          <canvas ref={canvasRef} />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-accent mr-1" />Actual Sales</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-400 mr-1" />Predicted</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">

        {/* Debt Risk Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[15px] font-bold">⚠ Debt Risk Prediction</div>
          <div className="text-xs text-gray-500 mt-0.5 mb-3">Customers likely to default on payment</div>
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                {['Customer','Balance','Risk Score','Risk Level'].map(h => (
                  <th key={h} className="text-left px-2 py-1.5 text-[11.5px] font-semibold text-gray-500 border-b-2 border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskData.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  <td className="px-2 py-2.5 font-medium">{c.name}</td>
                  <td className={`px-2 py-2.5 font-bold ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>₱{c.balance}</td>
                  <td className="px-2 py-2.5">
                    <div className="rounded h-1.5 w-full mb-0.5" style={{ background: c.bgColor }}>
                      <div className="h-1.5 rounded" style={{ width: `${c.score}%`, background: c.barColor }} />
                    </div>
                    <small className="text-gray-400 text-[11px]">{c.score}%</small>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11.5px] font-semibold ${c.badgeStyle}`}>{c.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Smart Delivery Routing */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[15px] font-bold">🚗 Smart Delivery Routing</div>
              <div className="text-xs text-gray-500 mt-0.5">Optimized route for pending deliveries</div>
            </div>
            <button
              onClick={() => showToast('🔄 Route re-optimized!')}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              🔄 Re-optimize
            </button>
          </div>

          {deliveries.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-6">No pending deliveries today.</div>
          ) : deliveries.map((o, i) => {
            const customer = state.customers.find(c => c.id === o.custId);
            return (
              <div key={o.id} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg mb-2">
                <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold">{customer?.name ?? '?'} ({o.gallons} gal)</div>
                  <div className="text-xs text-gray-500">📍 {customer?.addr ?? 'N/A'}</div>
                </div>
              </div>
            );
          })}

          <div className="mt-3 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5 text-[13px]">
            <strong>Est. Distance:</strong> 8.4 km &nbsp;|&nbsp;
            <strong>Est. Time:</strong> 45 mins
          </div>
        </div>

      </div>
    </div>
  );
}
