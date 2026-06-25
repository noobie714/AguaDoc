const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');

const app  = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ── DB Connection ──
const pool = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: '',        // XAMPP default is empty password
  database: 'aguadoc',
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection on startup
pool.getConnection()
  .then(conn => { console.log('✅ MySQL connected!'); conn.release(); })
  .catch(err => console.error('❌ MySQL connection failed:', err.message));

// ── Helper ──
const id = () => Date.now().toString();

// ====================== ROUTES ======================

app.get('/api', (req, res) => res.json({ message: '✅ AguaDoc Backend is running!' }));

// ── AUTH ──
app.post('/api/register', async (req, res) => {
  const { fullName, username, email, password, phone, address, gender } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?', [email, username]
    );
    if (existing.length > 0)
      return res.status(400).json({ success: false, message: 'User already exists' });

    const newId = id();
    await pool.query(
      'INSERT INTO users (id, fullName, username, email, password, phone, address, gender, role) VALUES (?,?,?,?,?,?,?,?,?)',
      [newId, fullName || username, username, email, password, phone, address, gender, 'customer']
    );
    res.json({ success: true, user: { id: newId, fullName: fullName || username, username, email, phone, address, gender, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?',
      [username, username, password]
    );
    if (rows.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const { password: _, ...user } = rows[0];
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all registered users (customers)
app.get('/api/users', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, fullName, username, email, phone, address, role FROM users ORDER BY createdAt DESC'
  );
  res.json(rows);
});

// ── CUSTOMERS ──
app.get('/api/customers', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM customers ORDER BY createdAt DESC');
  res.json(rows);
});

app.post('/api/customers', async (req, res) => {
  const { fullName, email, phone, address, balance } = req.body;
  const newId = id();
  await pool.query(
    'INSERT INTO customers (id, fullName, email, phone, address, balance) VALUES (?,?,?,?,?,?)',
    [newId, fullName, email, phone, address, balance || 0]
  );
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [newId]);
  res.json(rows[0]);
});

app.put('/api/customers/:id', async (req, res) => {
  const { fullName, email, phone, address, balance } = req.body;
  await pool.query(
    'UPDATE customers SET fullName=?, email=?, phone=?, address=?, balance=? WHERE id=?',
    [fullName, email, phone, address, balance, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/api/customers/:id', async (req, res) => {
  await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ── ORDERS ──
app.get('/api/orders', async (req, res) => {
  const { userId } = req.query;
  const [rows] = userId
    ? await pool.query('SELECT * FROM orders WHERE userId = ? ORDER BY date DESC', [userId])
    : await pool.query('SELECT * FROM orders ORDER BY date DESC');
  res.json(rows);
});

app.post('/api/orders', async (req, res) => {
  const { userId, type, quantity, status, total, address, payMethod, priority, notes } = req.body;
  const newId  = id();
  const newRef = 'ORD-' + newId.slice(-6);
  await pool.query(
    'INSERT INTO orders (id, ref, userId, type, quantity, status, total, address, payMethod, priority, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [newId, newRef, userId, type, quantity || 1, status || 'Pending', total || 0, address || '', payMethod || '', priority || 'normal', notes || '']
  );
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [newId]);
  res.json(rows[0]);
});

app.put('/api/orders/:id', async (req, res) => {
  const { status, type, quantity } = req.body;
  await pool.query(
    'UPDATE orders SET status=?, type=?, quantity=? WHERE id=?',
    [status, type, quantity, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

// ── PAYMENTS ──
app.get('/api/payments', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM payments ORDER BY date DESC');
  res.json(rows);
});

app.post('/api/payments', async (req, res) => {
  const { custId, amount, method } = req.body;
  const newId = id();
  await pool.query(
    'INSERT INTO payments (id, custId, amount, method) VALUES (?,?,?,?)',
    [newId, custId, amount, method]
  );
  const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [newId]);
  res.json(rows[0]);
});

// ── INVENTORY ──
app.get('/api/inventory', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM inventory WHERE id = 1');
  res.json(rows[0]);
});

app.put('/api/inventory', async (req, res) => {
  const { waterLevel, maxCapacity, readyGallons, totalGallons } = req.body;
  await pool.query(
    'UPDATE inventory SET waterLevel=?, maxCapacity=?, readyGallons=?, totalGallons=? WHERE id=1',
    [waterLevel, maxCapacity, readyGallons, totalGallons]
  );
  const [rows] = await pool.query('SELECT * FROM inventory WHERE id = 1');
  res.json(rows[0]);
});

// ── CONTAINERS ──
app.get('/api/containers', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM containers ORDER BY createdAt DESC');
  res.json(rows);
});

app.post('/api/containers', async (req, res) => {
  const { id: cid, status, lastRefill } = req.body;
  await pool.query(
    'INSERT INTO containers (id, status, lastRefill) VALUES (?,?,?)',
    [cid, status, lastRefill]
  );
  const [rows] = await pool.query('SELECT * FROM containers WHERE id = ?', [cid]);
  res.json(rows[0]);
});

app.delete('/api/containers/:id', async (req, res) => {
  await pool.query('DELETE FROM containers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 AguaDoc Backend running on http://localhost:${PORT}`));