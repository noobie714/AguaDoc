// src/pages/CustomersPage.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';

export default function CustomersPage() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal]   = useState(false);
  const [filter, setFilter]         = useState('All');
  const [form, setForm]             = useState({ name: '', phone: '', addr: '' });

  // Replaces filterCustomers()
  const filtered = state.customers.filter(c => {
    if (filter === 'Debtors') return c.balance > 0;
    if (filter === 'Cleared') return c.balance === 0;
    return true;
  });

  // Replaces addCustomer()
  function handleAddCustomer() {
    if (!form.name || !form.phone || !form.addr) return alert('Please fill all fields.');
    dispatch({
      type: 'ADD_CUSTOMER',
      payload: { id: state.cid, ...form, balance: 0, orders: 0 }
    });
    setForm({ name: '', phone: '', addr: '' });
    setShowModal(false);
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
                <td className="px-3 py-2.5 font-medium">{c.name}</td>
                <td className="px-3 py-2.5 text-gray-500">{c.phone}</td>
                <td className="px-3 py-2.5 text-gray-500">{c.addr}</td>
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
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title="👤 Register New Customer" onClose={() => setShowModal(false)}>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Full Name</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              placeholder="e.g. Juan Dela Cruz"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Phone Number</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              placeholder="09XX-XXX-XXXX"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Delivery Address</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              placeholder="Enter complete address"
              value={form.addr}
              onChange={e => setForm({ ...form, addr: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-[12.5px] font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomer}
              className="px-4 py-2 bg-accent text-white rounded-lg text-[12.5px] font-semibold hover:bg-accent2"
            >
              💾 Save Customer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}