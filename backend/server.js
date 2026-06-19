const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

app.use(cors());
app.use(express.json());

// Test Route
app.get('/api', (req, res) => {
  res.json({ message: "✅ AguaDoc Backend is running!" });
});

// ====================== AUTH ROUTES ======================
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await prisma.user.create({
      data: { fullName, email, password, role: 'staff' }
    });
    res.json({ success: true, user: { ...user, password: undefined } });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user && user.password === password) {
      res.json({ success: true, user: { ...user, password: undefined } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ====================== CUSTOMERS CRUD ======================
app.get('/api/customers', async (req, res) => {
  const customers = await prisma.customer.findMany();
  res.json(customers);
});

app.post('/api/customers', async (req, res) => {
  const customer = await prisma.customer.create({ data: req.body });
  res.json(customer);
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(customer);
  } catch (error) {
    res.status(404).json({ message: "Customer not found" });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  await prisma.customer.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 AguaDoc Backend running on http://localhost:${PORT}`);
});