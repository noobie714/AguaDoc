const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'db.json');

let db = { users: [], customers: [], orders: [], payments: [], inventory: {
  waterLevel: 1500, maxCapacity: 10000, readyGallons: 45, totalGallons: 176
}};

function loadDB() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (!db.inventory) db.inventory = { waterLevel: 1500, maxCapacity: 10000, readyGallons: 45, totalGallons: 176 };
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
    }
  } catch (err) { console.error("Error loading DB:", err); }
}

function saveDB() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

loadDB();

// ====================== ROUTES ======================

app.get('/api', (req, res) => res.json({ message: "✅ AguaDoc Backend is running!" }));

// AUTH
app.post('/api/register', (req, res) => {
  const { fullName, username, email, password, phone, address, gender } = req.body;
  if (db.users.find(u => u.email === email || u.username === username)) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }
  const newUser = {
    id: Date.now().toString(),
    fullName: fullName || username,
    username, email, password, phone, address, gender,
    role: 'customer',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  saveDB();
  res.json({ success: true, user: { ...newUser, password: undefined } });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u =>
    (u.email === username || u.username === username) && u.password === password
  );
  if (user) res.json({ success: true, user: { ...user, password: undefined } });
  else res.status(401).json({ success: false, message: "Invalid credentials" });
});

// CUSTOMERS
app.get('/api/customers', (req, res) => res.json(db.customers));

app.post('/api/customers', (req, res) => {
  const newCustomer = { id: Date.now().toString(), ...req.body, createdAt: new Date().toISOString() };
  db.customers.push(newCustomer);
  saveDB();
  res.json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const idx = db.customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Not found" });
  db.customers[idx] = { ...db.customers[idx], ...req.body };
  saveDB();
  res.json(db.customers[idx]);
});

app.delete('/api/customers/:id', (req, res) => {
  db.customers = db.customers.filter(c => c.id !== req.params.id);
  saveDB();
  res.json({ success: true });
});

// ORDERS
app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  if (userId) return res.json(db.orders.filter(o => o.userId === userId));
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: Date.now().toString(),
    ref: 'ORD-' + Date.now().toString().slice(-6),
    ...req.body,
    date: new Date().toISOString(),
    status: 'Pending'
  };
  db.orders.push(newOrder);
  saveDB();
  res.json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Not found" });
  db.orders[idx] = { ...db.orders[idx], ...req.body };
  saveDB();
  res.json(db.orders[idx]);
});

// PAYMENTS
app.get('/api/payments', (req, res) => res.json(db.payments));

app.post('/api/payments', (req, res) => {
  const newPayment = { id: Date.now().toString(), ...req.body, date: new Date().toISOString() };
  db.payments.push(newPayment);
  saveDB();
  res.json(newPayment);
});

// INVENTORY
app.get('/api/inventory', (req, res) => res.json(db.inventory));

app.put('/api/inventory', (req, res) => {
  db.inventory = { ...db.inventory, ...req.body };
  saveDB();
  res.json(db.inventory);
});

app.listen(PORT, () => console.log(`🚀 AguaDoc Backend running on http://localhost:${PORT}`));