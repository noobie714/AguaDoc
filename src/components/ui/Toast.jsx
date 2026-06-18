// src/components/ui/Toast.jsx
import { useState, useEffect } from 'react';

let toastFn = null;

export function showToast(msg) {
  if (toastFn) toastFn(msg);
}

export default function Toast() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    toastFn = (m) => {
      setMsg(m);
      setTimeout(() => setMsg(''), 3000);
    };
  }, []);

  if (!msg) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-navy text-white px-5 py-3 rounded-xl text-[13.5px] z-[9999] shadow-xl max-w-xs">
      {msg}
    </div>
  );
}