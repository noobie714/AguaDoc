import { createContext, useContext, useReducer, useEffect } from 'react';
import { apiGetCustomers, apiGetOrders, apiGetPayments, apiGetInventory } from '../api';

const AppContext = createContext(null);

const initialState = {
  customers: [], orders: [], payments: [], containers: [],
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
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    Promise.all([
      apiGetCustomers(),
      apiGetOrders(),
      apiGetPayments(),
      apiGetInventory()
    ]).then(([customers, orders, payments, inventory]) => {
      dispatch({
        type: 'SET_ALL',
        payload: { customers, orders, payments, inventory }
      });
    }).catch(() => {
      console.warn('Backend offline, using empty state.');
      dispatch({ type: 'SET_ALL', payload: { loading: false } });
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