// src/pages/InventoryPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import { Chart } from 'chart.js/auto';

export default function InventoryPage() {
  const { state, dispatch } = useApp();
  const { inventory, containers } = state;

  const [showAdjustModal, setShowAdjustModal]     = useState(false);
  const [showContainerModal, setShowContainerModal] = useState(false);

  // Quick adjust inputs (inline on page)
  const [wlInput, setWlInput] = useState(inventory.waterLevel);
  const [wcInput, setWcInput] = useState(inventory.maxCapacity);

  // Adjust stock modal form
  const [adjForm, setAdjForm] = useState({
    waterLevel: inventory.waterLevel,
    maxCapacity: inventory.maxCapacity,
    readyGallons: inventory.readyGallons,
  });

  // Add container modal form
  const [contForm, setContForm] = useState({
    id: '', status: 'Ready',
    lastRefill: new Date().toISOString().slice(0, 10),
  });

  // Chart refs
  const gaugeRef   = useRef(null);
  const gaugeCtx   = useRef(null);
  const dailyRef   = useRef(null);
  const dailyCanvasRef = useRef(null);

  const pct = Math.round((inventory.waterLevel / inventory.maxCapacity) * 100);

  // ── Draw gauge (replaces drawGauge) ──
  useEffect(() => {
    const canvas = gaugeCtx.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 140, 140);
    const cx = 70, cy = 70, r = 56;
    const start = Math.PI * 0.75, end = Math.PI * 2.25;
    // Background arc
    ctx.beginPath(); ctx.arc(cx, cy, r, start, end);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();
    // Fill arc
    const fillColor = pct < 20 ? '#e53e3e' : pct < 50 ? '#f59e0b' : '#38a169';
    ctx.beginPath(); ctx.arc(cx, cy, r, start, start + (end - start) * (pct / 100));
    ctx.strokeStyle = fillColor; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();
  }, [pct]);

  // ── Daily gallons bar chart ──
  useEffect(() => {
    if (dailyRef.current) dailyRef.current.destroy();
    const ctx = dailyCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    dailyRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ label: 'Gallons', data: [12, 18, 15, 22, 19, 25, 21], backgroundColor: '#1eb8c8', borderRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { ticks: { font: { size: 10 } } },
        },
      },
    });
    return () => dailyRef.current?.destroy();
  }, []);

  // ── Quick update tank (replaces updateGauge) ──
  function handleUpdateTank() {
    dispatch({ type: 'UPDATE_INVENTORY', payload: { waterLevel: parseInt(wlInput), maxCapacity: parseInt(wcInput) } });
    showToast('✅ Tank levels updated!');
  }

  // ── Save adjustments modal (replaces saveAdjustments) ──
  function handleSaveAdjustments() {
    dispatch({ type: 'UPDATE_INVENTORY', payload: {
      waterLevel: parseInt(adjForm.waterLevel),
      maxCapacity: parseInt(adjForm.maxCapacity),
      readyGallons: parseInt(adjForm.readyGallons),
    }});
    showToast('✅ Stock levels saved!');
    setShowAdjustModal(false);
  }

  // ── Add container (replaces addContainer) ──
  function handleAddContainer() {
    if (!contForm.id.trim()) { showToast('⚠ Enter a container ID.'); return; }
    dispatch({ type: 'ADD_CONTAINER', payload: { id: contForm.id, status: contForm.status, lastRefill: contForm.lastRefill } });
    dispatch({ type: 'UPDATE_INVENTORY', payload: {
      totalGallons: inventory.totalGallons + 1,
      readyGallons: contForm.status === 'Ready' ? inventory.readyGallons + 1 : inventory.readyGallons,
    }});
    showToast(`✅ Container ${contForm.id} added!`);
    setContForm({ id: '', status: 'Ready', lastRefill: new Date().toISOString().slice(0, 10) });
    setShowContainerModal(false);
  }

  // ── Delete container (replaces delContainer) ──
  function handleDeleteContainer(id) {
    if (!confirm(`Remove container ${id}?`)) return;
    dispatch({ type: 'DELETE_CONTAINER', id });
    showToast('🗑 Container removed.');
  }

  const gaugeColor = pct < 20 ? 'text-red-500' : pct < 50 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-[15px] font-bold">🪣 Inventory & Supply Monitor</div>
            <div className="text-xs text-gray-500 mt-0.5">Track source water levels and container availability in real-time.</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowContainerModal(true)}
              className="border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              + Add Container
            </button>
            <button
              onClick={() => { setAdjForm({ waterLevel: inventory.waterLevel, maxCapacity: inventory.maxCapacity, readyGallons: inventory.readyGallons }); setShowAdjustModal(true); }}
              className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent2 transition cursor-pointer"
            >
              ⚙ Adjust Stock
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

          {/* Left: Gauge */}
          <div>
            <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-3">🌊 Tank 1 Sensor</div>
            <div className="text-center py-4">
              <div className="relative w-[140px] h-[140px] mx-auto mb-2">
                <canvas ref={gaugeCtx} width={140} height={140} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className={`text-[22px] font-black ${gaugeColor}`}>{pct}%</div>
                  <div className="text-[11px] text-gray-500">
                    {inventory.waterLevel.toLocaleString()}/{inventory.maxCapacity.toLocaleString()} L
                  </div>
                </div>
              </div>
              {pct < 20 && (
                <div className="text-red-500 text-[12.5px] font-semibold mt-1">⚠ Critical Water Level!</div>
              )}
            </div>

            {/* Quick Adjust */}
            <div>
              <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-2">Quick Adjust</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Water Level (L)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
                    value={wlInput}
                    onChange={e => setWlInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Max Capacity (L)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
                    value={wcInput}
                    onChange={e => setWcInput(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateTank}
                className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent2 cursor-pointer"
              >
                Update Tank
              </button>
            </div>
          </div>

          {/* Right: Container Summary */}
          <div>
            <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-3">5-Gallon Container Summary</div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3.5 text-center">
                <div className="text-[28px] font-black text-green-600">{inventory.readyGallons}</div>
                <div className="text-xs text-gray-500 mt-0.5">Ready for Refill</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3.5 text-center">
                <div className="text-[28px] font-black text-gray-800">{inventory.totalGallons}</div>
                <div className="text-xs text-gray-500 mt-0.5">Total Tracked</div>
              </div>
            </div>

            {/* Daily Chart */}
            <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-2">Daily Gallons Sold</div>
            <div className="relative h-[120px] mb-4">
              <canvas ref={dailyCanvasRef} />
            </div>

            {/* Container Table */}
            <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-2">Container Records</div>
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr>
                  {['Container ID', 'Status', 'Last Refill', ''].map(h => (
                    <th key={h} className="text-left px-2 py-1.5 text-[11.5px] font-semibold text-gray-500 border-b-2 border-gray-100">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {containers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                    <td className="px-2 py-2.5 font-mono font-semibold">{c.id}</td>
                    <td className="px-2 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11.5px] font-semibold
                        ${c.status === 'Ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-gray-500">{c.lastRefill}</td>
                    <td className="px-2 py-2.5">
                      <button
                        onClick={() => handleDeleteContainer(c.id)}
                        className="border border-gray-200 rounded w-7 h-7 flex items-center justify-center text-[13px] hover:bg-gray-50 cursor-pointer"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Adjust Stock Modal ── */}
      {showAdjustModal && (
        <Modal title="⚙ Adjust Tank & Stock Levels" onClose={() => setShowAdjustModal(false)}>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Water Level (Liters)</label>
            <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={adjForm.waterLevel} onChange={e => setAdjForm({ ...adjForm, waterLevel: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Max Tank Capacity (Liters)</label>
            <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={adjForm.maxCapacity} onChange={e => setAdjForm({ ...adjForm, maxCapacity: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Available 5-Gallon Containers</label>
            <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={adjForm.readyGallons} onChange={e => setAdjForm({ ...adjForm, readyGallons: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => setShowAdjustModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-[12.5px] font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button onClick={handleSaveAdjustments} className="px-4 py-2 bg-accent text-white rounded-lg text-[12.5px] font-semibold hover:bg-accent2 cursor-pointer">💾 Save Adjustments</button>
          </div>
        </Modal>
      )}

      {/* ── Add Container Modal ── */}
      {showContainerModal && (
        <Modal title="🪣 Add Container Record" onClose={() => setShowContainerModal(false)}>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Container ID</label>
            <input placeholder="e.g. GAL-010" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={contForm.id} onChange={e => setContForm({ ...contForm, id: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Status</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={contForm.status} onChange={e => setContForm({ ...contForm, status: e.target.value })}>
              <option>Ready</option><option>In Use</option><option>For Cleaning</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Last Refill Date</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={contForm.lastRefill} onChange={e => setContForm({ ...contForm, lastRefill: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => setShowContainerModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-[12.5px] font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button onClick={handleAddContainer} className="px-4 py-2 bg-accent text-white rounded-lg text-[12.5px] font-semibold hover:bg-accent2 cursor-pointer">💾 Save Container</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
