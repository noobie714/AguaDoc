// src/api.js
const BASE = '/api';

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function apiGetCustomers() {
  const res = await fetch(`${BASE}/customers`);
  return res.json();
}

export async function apiAddCustomer(data) {
  const res = await fetch(`${BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}