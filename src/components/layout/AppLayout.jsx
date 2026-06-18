import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toast from '../ui/Toast';

export default function AppLayout({ children, onLogout }) {
  return (
    <div className="flex h-screen overflow-hidden font-sans bg-bg text-sm text-gray-800">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
      <Toast />
    </div>
  );
}