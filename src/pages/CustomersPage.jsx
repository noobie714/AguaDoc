// src/pages/CustomersPage.jsx
// NOTE: This list is for WALK-IN customers who don't have (or won't create) an account.
// Registered app customers aren't added here — their debt tracking can be wired up later
// via apiGetAvailableCustomers() / apiLinkCustomer() in api.js if that's ever needed.
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import { apiAddCustomer } from '../api';

export default function CustomersPage() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]       = useState('All');
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ name: '', phone: '', addr: '' });

  // Replaces filterCustomers()
  const filtered = state.customers.filter(c => {
    if (filter === 'Debtors') return c.balance > 0;
    if (filter === 'Cleared') return c.balance === 0;
    return true;
  });

  // Persists the walk-in customer to the database, then reflects the confirmed row locally.
  async function handleAddCustomer() {
    if (!form.name || !form.phone || !form.addr) return alert('Please fill all fields.');
    setSaving(true);
    try {
      const saved = await apiAddCustomer({
        fullName: form.name,
        email: null,          // walk-ins usually don't have one — kept as NULL, not '', to avoid unique-key clashes
        phone: form.phone,
        address: form.addr,
        balance: 0,
      });
      dispatch({ type: 'ADD_CUSTOMER', payload: { ...saved, orders: 0 } });
      showToast(`✅ ${form.name} added!`);
      setForm({ name: '', phone: '', addr: '' });
      setShowModal(false);
    } catch (err) {
      showToast(`❌ ${err.message || 'Failed to save customer.'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">👥 Customers & Debt</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg text-[12.5px] font-semibold hover:bg-accent2 transition"
        >
          + New Customer
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-3">
        {['All', 'Debtors', 'Cleared'].map(tab => (
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr>
              {['Name', 'Phone', 'Address', 'Balance', 'Orders', 'Actions'].map(h => (
                <th key={h} className="text-left px-3 py-2.5 text-[11.5px] font-semibold text-gray-500 border-b-2 border-gray-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                <td className="px-3 py-2.5 font-medium">{c.fullName}</td>
                <td className="px-3 py-2.5 text-gray-500">{c.phone}</td>
                <td className="px-3 py-2.5 text-gray-500">{c.address}</td>
                <td className={`px-3 py-2.5 font-bold ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₱{c.balance}
                </td>
                <td className="px-3 py-2.5 text-gray-500">{c.orders}</td>
                <td className="px-3 py-2.5">
                  <button className="border border-gray-200 rounded px-2 py-1 text-xs hover:bg-gray-50">
                    ✏ Edit
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                  No walk-in customers yet — click "+ New Customer" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: manual walk-in entry */}
      {showModal && (
        <Modal title="👤 Register New Customer" onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600">Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] mt-1"
                placeholder="e.g. Juan Dela Cruz"
              />
            </div>
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600">Phone Number</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] mt-1"
                placeholder="09123456789"
              />
            </div>
            <div>
              <label className="text-[12.5px] font-semibold text-gray-600">Delivery Address</label>
              <input
                value={form.addr}
                onChange={e => setForm({ ...form, addr: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] mt-1"
                placeholder="e.g. Liloan, Cebu"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-[12.5px] font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomer}
              disabled={saving}
              className="px-4 py-2 bg-accent text-white rounded-lg text-[12.5px] font-semibold hover:bg-accent2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save Customer'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
