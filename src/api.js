const BASE = '/api';

export async function apiLogin(username, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function apiRegister(data) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// CUSTOMERS
export async function apiGetCustomers() {
  const res = await fetch(`${BASE}/customers`);
  return res.json();
}
export async function apiAddCustomer(data) {
  const res = await fetch(`${BASE}/customers`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function apiUpdateCustomer(id, data) {
  const res = await fetch(`${BASE}/customers/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function apiDeleteCustomer(id) {
  const res = await fetch(`${BASE}/customers/${id}`, { method: 'DELETE' });
  return res.json();
}

// ORDERS
export async function apiGetOrders(userId = null) {
  const url = userId ? `${BASE}/orders?userId=${userId}` : `${BASE}/orders`;
  const res = await fetch(url);
  return res.json();
}
export async function apiAddOrder(data) {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function apiUpdateOrder(id, data) {
  const res = await fetch(`${BASE}/orders/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// PAYMENTS
export async function apiGetPayments() {
  const res = await fetch(`${BASE}/payments`);
  return res.json();
}
export async function apiAddPayment(data) {
  const res = await fetch(`${BASE}/payments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// INVENTORY
export async function apiGetInventory() {
  const res = await fetch(`${BASE}/inventory`);
  return res.json();
}
export async function apiUpdateInventory(data) {
  const res = await fetch(`${BASE}/inventory`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}