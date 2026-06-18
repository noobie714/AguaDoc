// src/pages/OrdersPage.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';

const PRICE = 50;

export default function OrdersPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter]         = useState('All');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [form, setForm] = useState({
    custId: '', type: 'Delivery', gallons: 1,
    date: new Date().toISOString().slice(0, 10),
  });

  // ── Filter orders (replaces renderOrders / filterOrders) ──
  const filtered = state.orders.filter(o => {
    if (['Pending', 'Delivered', 'Cancelled'].includes(filter)) return o.status === filter;
    if (['Delivery', 'Walk-in'].includes(filter))               return o.type === filter;
    return true;
  });

  // ── Mark order as delivered (replaces markDone) ──
  function handleMarkDone(id) {
    dispatch({ type: 'UPDATE_ORDER_STATUS', id, status: 'Delivered' });
    showToast(`✅ Order #${String(id).padStart(2, '0')} delivered!`);
  }

  // ── Delete order (replaces delOrder) ──
  function handleDeleteOrder(id) {
    if (!confirm('Delete this order?')) return;
    dispatch({ type: 'DELETE_ORDER', id });
    showToast('🗑 Order deleted.');
  }

  // ── Place new order (replaces placeOrder) ──
  function handlePlaceOrder() {
    if (!form.custId) { showToast('⚠ Select a customer.'); return; }
    const amount = form.gallons * PRICE;
    const customer = state.customers.find(c => c.id === parseInt(form.custId));
    dispatch({
      type: 'ADD_ORDER',
      payload: {
        id: state.oid,
        custId: parseInt(form.custId),
        type: form.type,
        gallons: parseInt(form.gallons),
        amount,
        date: form.date,
        status: 'Pending',
      },
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: state.nid,
        msg: `New ${form.type} order placed for ${customer?.name} (${form.gallons} gallons).`,
        type: 'System',
        time: new Date().toLocaleDateString('en-PH'),
        read: false,
      },
    });
    showToast(`✅ Order placed for ${customer?.name}!`);
    setShowOrderModal(false);
    setForm({ custId: '', type: 'Delivery', gallons: 1, date: new Date().toISOString().slice(0, 10) });
  }

  // ── Pending deliveries for route modal ──
  const pendingDeliveries = state.orders.filter(o => o.status === 'Pending' && o.type === 'Delivery');

  // ── Badge helpers ──
  const statusBadge = {
    Delivered: 'bg-green-100 text-green-800',
    Cancelled:  'bg-red-100 text-red-800',
    Pending:    'bg-yellow-100 text-yellow-800',
  };
  const typeBadge = {
    Delivery: 'bg-blue-100 text-blue-800',
    'Walk-in': 'bg-green-50 text-green-700',
  };

  const tabs = ['All', 'Pending', 'Delivered', 'Cancelled', 'Delivery', 'Walk-in'];

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-[15px] font-bold">📋 Order Management</div>
            <div className="text-xs text-gray-500 mt-0.5">Track walk-in, schedule deliveries, manage statuses.</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRouteModal(true)}
              className="border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              🚗 Smart Routing
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent2 transition cursor-pointer"
            >
              + New Order
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-3">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer
                ${filter === tab
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-accent hover:text-accent'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr>
              {['Order ID', 'Customer', 'Type', 'Gallons', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-2.5 py-2 text-[11.5px] font-semibold text-gray-500 border-b-2 border-gray-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-6 text-gray-400 text-xs">No orders found.</td></tr>
            ) : (
              filtered.map(o => {
                const customer = state.customers.find(c => c.id === o.custId);
                return (
                  <tr key={o.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                    <td className="px-2.5 py-2.5 font-mono font-semibold text-gray-600">
                      #{String(o.id).padStart(2, '0')}
                    </td>
                    <td className="px-2.5 py-2.5 font-medium">{customer?.name ?? '?'}</td>
                    <td className="px-2.5 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11.5px] font-semibold ${typeBadge[o.type]}`}>
                        {o.type}
                      </span>
                    </td>
                    <td className="px-2.5 py-2.5 text-gray-600">{o.gallons}</td>
                    <td className="px-2.5 py-2.5 font-semibold">₱{o.amount}</td>
                    <td className="px-2.5 py-2.5 text-gray-500">{o.date}</td>
                    <td className="px-2.5 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11.5px] font-semibold ${statusBadge[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-2.5 py-2.5">
                      <div className="flex gap-1">
                        {o.status === 'Pending' && (
                          <button
                            onClick={() => handleMarkDone(o.id)}
                            className="bg-green-600 text-white text-[11px] font-semibold px-2 py-1 rounded cursor-pointer hover:bg-green-700"
                          >
                            ✔ Done
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          className="border border-gray-200 rounded w-7 h-7 flex items-center justify-center text-[13px] hover:bg-gray-50 cursor-pointer"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── New Order Modal ── */}
      {showOrderModal && (
        <Modal title="📋 Create New Order" onClose={() => setShowOrderModal(false)}>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Select Customer</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={form.custId}
              onChange={e => setForm({ ...form, custId: e.target.value })}
            >
              <option value="">-- Select Customer --</option>
              {state.customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="block text-[12.5px] font-semibold mb-1">Order Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option>Delivery</option>
                <option>Walk-in</option>
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold mb-1">Gallons</label>
              <input
                type="number" min="1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
                value={form.gallons}
                onChange={e => setForm({ ...form, gallons: e.target.value })}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Scheduled Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-3.5 py-2.5 flex justify-between font-bold text-[14px] my-2">
            <span>Total Amount:</span>
            <span>₱{form.gallons * PRICE}</span>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => setShowOrderModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-[12.5px] font-semibold hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button onClick={handlePlaceOrder} className="px-4 py-2 bg-accent text-white rounded-lg text-[12.5px] font-semibold hover:bg-accent2 cursor-pointer">
              🚀 Place Order
            </button>
          </div>
        </Modal>
      )}

      {/* ── Smart Route Modal ── */}
      {showRouteModal && (
        <Modal title="🚗 Smart Delivery Routing" onClose={() => setShowRouteModal(false)}>
          <p className="text-[13px] text-gray-500 mb-3">
            Optimized route for today's pending deliveries based on location proximity.
          </p>
          {pendingDeliveries.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-4">No pending deliveries today.</div>
          ) : (
            pendingDeliveries.map((o, i) => {
              const customer = state.customers.find(c => c.id === o.custId);
              return (
                <div key={o.id} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5 mb-2">
                  <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold">{customer?.name ?? '?'} ({o.gallons} gal)</div>
                    <div className="text-xs text-gray-500">📍 {customer?.addr ?? 'N/A'}</div>
                  </div>
                </div>
              );
            })
          )}
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5 text-[13px] mt-3">
            <strong>Total Distance:</strong> 8.4 km &nbsp;|&nbsp;
            <strong>Est. Time:</strong> 45 mins &nbsp;|&nbsp;
            <strong>Stops:</strong> {pendingDeliveries.length}
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => setShowRouteModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-[12.5px] font-semibold hover:bg-gray-50 cursor-pointer">
              Close
            </button>
            <button
              onClick={() => { showToast('📤 Route sent to driver!'); setShowRouteModal(false); }}
              className="px-4 py-2 bg-accent text-white rounded-lg text-[12.5px] font-semibold hover:bg-accent2 cursor-pointer"
            >
              📤 Send to Driver
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
