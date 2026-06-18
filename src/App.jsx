// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import PaymentsPage from './pages/PaymentsPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import PredictionsPage from './pages/PredictionsPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout onLogout={() => setIsLoggedIn(false)}>
          <Routes>
            <Route path="/"              element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard"     element={<DashboardPage />} />
            <Route path="/customers"     element={<CustomersPage />} />
            <Route path="/orders"        element={<OrdersPage />} />
            <Route path="/payments"      element={<PaymentsPage />} />
            <Route path="/inventory"     element={<InventoryPage />} />
            <Route path="/reports"       element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/predictions"   element={<PredictionsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;