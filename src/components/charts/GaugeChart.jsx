// src/components/charts/GaugeChart.jsx
import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

export default function GaugeChart({ waterLevel, maxCapacity }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const pct = Math.round((waterLevel / maxCapacity) * 100);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [pct, 100 - pct],
          backgroundColor: [pct < 20 ? '#e53e3e' : '#1eb8c8', '#e2e8f0'],
          borderWidth: 0,
        }]
      },
      options: {
        circumference: 180,
        rotation: -90,
        cutout: '75%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
    return () => chartRef.current?.destroy(); // cleanup on unmount
  }, [waterLevel, maxCapacity]);

  return (
    <div className="relative w-36 h-36 mx-auto">
      <canvas ref={canvasRef} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-2xl font-black text-red-500">{pct}%</div>
        <div className="text-xs text-gray-500">{waterLevel}/{maxCapacity} L</div>
      </div>
    </div>
  );
}