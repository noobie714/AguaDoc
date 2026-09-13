import { createContext, useContext, useReducer, useEffect } from 'react';
import { apiGetCustomers, apiGetOrders, apiGetPayments, apiGetInventory, apiGetContainers, apiGetUsers } from '../api';

const AppContext = createContext(null);

const initialState = {
  customers: [], orders: [], payments: [], containers: [], users: [],
  inventory: { readyGallons: 0, totalGallons: 0, waterLevel: 0, maxCapacity: 10000 },
  notifications: [], loading: true
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, ...action.payload, loading: false };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return { ...state, customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CUSTOMER':
      return { ...state, customers: state.customers.filter(c => c.id !== action.id) };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
  return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

useEffect(() => {
  const KEYS = ['customers', 'orders', 'payments', 'inventory', 'containers', 'users'];

  const fetchAll = () => {
    Promise.allSettled([
      apiGetCustomers(),
      apiGetOrders(),
      apiGetPayments(),
      apiGetInventory(),
      apiGetContainers(),
      apiGetUsers()
    ]).then((results) => {
      const payload = {};
      results.forEach((result, i) => {
        const key = KEYS[i];
        if (result.status === 'fulfilled') {
          payload[key] = result.value;
        } else {
          // Don't wipe existing data for this slice — just log so we can see which endpoint is failing.
          console.warn(`Failed to load "${key}":`, result.reason);
        }
      });
      dispatch({ type: 'SET_ALL', payload });
    });
  };

  fetchAll();                                    // initial load
  const interval = setInterval(fetchAll, 8000);  // re-sync every 8s
  return () => clearInterval(interval);
}, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}