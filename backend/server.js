const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'db.json');

// Load or create database
let db = { 
  users: [], 
  customers: [], 
  orders: [], 
  inventory: [], 
  payments: [] 
};

function loadDB() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
    }
  } catch (err) {
    console.error("Error loading DB:", err);
  }
}

function saveDB() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

loadDB();

// ====================== ROUTES ======================

// Test
app.get('/api', (req, res) => {
  res.json({ message: "✅ AguaDoc Backend is running!" });
});

// AUTH
app.post('/api/register', (req, res) => {
  const { fullName, username, email, password, phone, address, gender } = req.body;
  if (db.users.find(u => u.email === email || u.username === username)) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }
  const newUser = {
    id: Date.now().toString(),
    fullName: fullName || username,
    username,
    email,
    password,
    phone,
    address,
    gender,
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
  if (user) {
    res.json({ success: true, user: { ...user, password: undefined } });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// CUSTOMERS CRUD
app.get('/api/customers', (req, res) => res.json(db.customers));

app.post('/api/customers', (req, res) => {
  const newCustomer = { 
    id: Date.now().toString(), 
    ...req.body, 
    createdAt: new Date().toISOString() 
  };
  db.customers.push(newCustomer);
  saveDB();
  res.json(newCustomer);
});

const PORT_LOG = PORT;
app.listen(PORT, () => {
  console.log(`🚀 AguaDoc Backend running on http://localhost:${PORT_LOG}`);
});