// src/context/AppContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import { initialState } from '../data/mockData';
import { apiGetCustomers } from '../api';

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload], cid: state.cid + 1 };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload], oid: state.oid + 1 };
    case 'UPDATE_ORDER_STATUS':
      return { ...state, orders: state.orders.map(o => o.id === action.id ? { ...o, status: action.status } : o) };
    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [...state.payments, action.payload],
        customers: state.customers.map(c => c.id === action.payload.custId
          ? { ...c, balance: Math.max(0, c.balance - action.payload.amount) }
          : c),
        pid: state.pid + 1
      };
    case 'UPDATE_INVENTORY':
      return { ...state, inventory: { ...state.inventory, ...action.payload } };
    case 'ADD_CONTAINER':
      return { ...state, containers: [...state.containers, action.payload] };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications], nid: state.nid + 1 };
    case 'MARK_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n) };
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load customers from backend on startup
  useEffect(() => {
    apiGetCustomers()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          dispatch({ type: 'SET_CUSTOMERS', payload: data });
        }
        // if backend has no customers yet, mockData stays as fallback
      })
      .catch(() => {
        // backend offline — mockData fallback stays
        console.warn('Backend offline, using mock data.');
      });
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