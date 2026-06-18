// src/pages/NotificationsPage.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';

const TABS = ['all', 'system', 'reminders'];

export default function NotificationsPage() {
  const { state, dispatch } = useApp();
  const [tab, setTab]             = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [smsTemplate, setSmsTemplate] = useState(
    'Hi [Name], your AguaDoc balance of [Amount] is overdue. Please settle to continue service. Thank you!'
  );
  const [form, setForm] = useState({ msg: '', type: 'Alert' });

  // Filtered notifications (replaces renderNotifications())
  const filtered = state.notifications.filter(n => {
    if (tab === 'system')    return n.type === 'System';
    if (tab === 'reminders') return n.type === 'Reminder';
    return true;
  });

  const unread  = state.notifications.filter(n => !n.read).length;
  const debtors = state.customers.filter(c => c.balance > 0);
  const firstDebtor = debtors[0];
  const smsPreview  = firstDebtor
    ? smsTemplate.replace('[Name]', firstDebtor.name).replace('[Amount]', '₱' + firstDebtor.balance)
    : 'No customers with balance.';

  // Mark single as read (replaces markRead())
  function handleMarkRead(id) {
    dispatch({ type: 'MARK_READ', id });
  }

  // Mark all read (replaces markAllRead())
  function handleMarkAllRead() {
    dispatch({ type: 'MARK_ALL_READ' });
    showToast('✅ All notifications read.');
  }

  // Add notification (replaces addNotification())
  function handleAddNotification() {
    if (!form.msg.trim()) { showToast('⚠ Enter a message.'); return; }
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: state.nid, msg: form.msg, type: form.type,
        time: new Date().toLocaleDateString('en-PH'), read: false,
      },
    });
    showToast('✅ Notification added!');
    setShowModal(false);
    setForm({ msg: '', type: 'Alert' });
  }

  const dotStyle = {
    Alert:    'bg-red-500',
    Reminder: 'bg-yellow-400',
    System:   'bg-blue-500',
  };
  const badgeStyle = {
    Alert:    'bg-red-100 text-red-800',
    Reminder: 'bg-yellow-100 text-yellow-800',
    System:   'bg-blue-100 text-blue-800',
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[15px] font-bold flex items-center gap-2">
              🔔 Notifications & SMS Center
              {unread > 0 && (
                <span className="bg-red-100 text-red-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">{unread}</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">System alerts, automated reminders, and debt collection messages.</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowModal(true)} className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer">+ Add</button>
            <button onClick={handleMarkAllRead} className="bg-accent hover:bg-accent2 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer">✔ Mark All Read</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

          {/* Left: Notification List */}
          <div>
            {/* Tabs */}
            <div className="flex border-b-2 border-gray-200 mb-3">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 text-[13px] font-medium cursor-pointer border-b-2 -mb-0.5 transition capitalize
                    ${tab === t ? 'text-accent border-accent' : 'text-gray-500 border-transparent hover:text-accent'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Notification Rows */}
            {filtered.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-6">No notifications.</div>
            ) : filtered.map(n => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`flex gap-2.5 p-2.5 rounded-lg mb-1.5 cursor-pointer border transition hover:bg-gray-50
                  ${n.read ? 'border-transparent' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotStyle[n.type]}`} />
                <div className="flex-1">
                  <div className="text-[13px]">{n.msg}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-gray-400">{n.time}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badgeStyle[n.type]}`}>{n.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: SMS Panel */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-[13px] font-bold mb-1">📱 SMS Blast Campaign</div>
            <div className="text-xs text-gray-500 mb-3">Send automated payment reminders to customers with outstanding balances.</div>

            <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-2">Overdue Debtors</div>
            {debtors.length === 0 ? (
              <div className="text-xs text-gray-400 py-2">No debtors 🎉</div>
            ) : debtors.map(c => (
              <div key={c.id} className="flex justify-between items-center py-1.5 text-[13px] border-b border-gray-200 last:border-b-0">
                <span>{c.name}</span>
                <span className="text-red-600 font-bold">₱{c.balance}</span>
              </div>
            ))}

            <div className="mt-3">
              <label className="block text-[12.5px] font-semibold mb-1">Message Template</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent resize-none bg-white"
                value={smsTemplate}
                onChange={e => setSmsTemplate(e.target.value)}
              />
            </div>

            <div className="text-xs font-semibold text-gray-500 mt-2 mb-1">Preview</div>
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[12.5px] text-gray-500 min-h-[50px]">
              {smsPreview}
            </div>
            <button
              onClick={() => showToast(`📤 SMS sent to ${debtors.length} customers!`)}
              className="mt-2 w-full bg-accent hover:bg-accent2 text-white text-xs font-semibold py-2 rounded-lg transition cursor-pointer"
            >
              📤 Send SMS Blast
            </button>
          </div>
        </div>
      </div>

      {/* Add Notification Modal */}
      {showModal && (
        <Modal title="🔔 Add Notification" onClose={() => setShowModal(false)}>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Message</label>
            <input
              placeholder="Enter notification message"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={form.msg}
              onChange={e => setForm({ ...form, msg: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="block text-[12.5px] font-semibold mb-1">Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-accent"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option>Alert</option>
              <option>Reminder</option>
              <option>System</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-[12.5px] font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button onClick={handleAddNotification} className="px-4 py-2 bg-accent hover:bg-accent2 text-white rounded-lg text-[12.5px] font-semibold cursor-pointer transition">💾 Add</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
