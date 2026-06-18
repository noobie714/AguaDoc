// src/components/ui/Modal.jsx
import { useEffect } from 'react';

export default function Modal({ title, onClose, children }) {
  // Close on Escape key press
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl p-6 w-[460px] max-w-[94vw] relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-bold mb-4">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 text-xl hover:text-gray-600 cursor-pointer"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}