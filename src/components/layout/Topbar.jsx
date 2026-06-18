import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Topbar() {
  const navigate = useNavigate();
  const { state } = useApp();
  const unread = state.notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-200 px-5 h-[52px] flex items-center gap-2.5">
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 max-w-[380px]">
        <span className="text-gray-400">🔍</span>
        <input
          placeholder="Search customers, orders..."
          className="border-none bg-transparent outline-none text-[13px] text-gray-700 w-full placeholder:text-gray-400"
        />
      </div>

      {/* Notification Bell */}
      <div className="ml-auto relative cursor-pointer text-xl p-1" onClick={() => navigate('/notifications')}>
        🔔
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </div>
    </header>
  );
}