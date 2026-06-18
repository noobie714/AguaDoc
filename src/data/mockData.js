export const initialState = {
  customers: [
    { id:1, name:'Maria Santos',  phone:'0917-123-4567', addr:'Block 4, Water St',    balance:150, orders:3 },
    { id:2, name:'Juan Dela Cruz',phone:'0918-987-6543', addr:'Lot 2, Aqua Ave',      balance:0,   orders:5 },
    { id:3, name:'Ana Reyes',     phone:'0920-333-4444', addr:'Bldg 1, River Road',   balance:450, orders:8 },
    { id:4, name:'Pedro Garcia',  phone:'0921-999-7890', addr:'Phase 3, Lake View',   balance:0,   orders:2 },
    { id:5, name:'Liza Mendoza',  phone:'0923-111-2222', addr:'Block 7, Spring Lane', balance:200, orders:4 },
  ],
  orders: [
    { id:1, custId:1, type:'Delivery', gallons:3, amount:150, date:'2026-04-10', status:'Pending'   },
    { id:2, custId:2, type:'Walk-in',  gallons:2, amount:100, date:'2026-04-09', status:'Delivered' },
    { id:3, custId:3, type:'Delivery', gallons:5, amount:250, date:'2026-04-09', status:'Delivered' },
    { id:4, custId:4, type:'Walk-in',  gallons:1, amount:50,  date:'2026-04-10', status:'Pending'   },
    { id:5, custId:5, type:'Delivery', gallons:4, amount:200, date:'2026-04-08', status:'Delivered' },
  ],
  payments: [
    { id:1, custId:2, method:'Cash',   amount:100, date:'2026-04-09', orderId:2 },
    { id:2, custId:4, method:'GCash',  amount:50,  date:'2026-04-10', orderId:4 },
    { id:3, custId:3, method:'Online', amount:100, date:'2026-04-09', orderId:3 },
  ],
  inventory: { waterLevel:1500, maxCapacity:10000, readyGallons:45, totalGallons:176 },
  containers: [
    { id:'GAL-001', status:'Ready',      lastRefill:'2026-04-10' },
    { id:'GAL-002', status:'In Use',     lastRefill:'2026-04-09' },
    { id:'GAL-003', status:'Ready',      lastRefill:'2026-04-10' },
  ],
  notifications: [
    { id:1, msg:'Low water supply! Current level at 15%.',         type:'Alert',    time:'4/10 09:00 PM', read:false },
    { id:2, msg:'Ana Reyes has an overdue balance of ₱450.',       type:'Reminder', time:'4/10 08:30 PM', read:false },
    { id:3, msg:'3 pending deliveries scheduled for today.',       type:'System',   time:'4/10 07:00 PM', read:false },
    { id:4, msg:'Maria Santos balance is ₱150 overdue.',           type:'Reminder', time:'4/9 06:00 PM',  read:true  },
    { id:5, msg:'New order placed by Pedro Garcia.',               type:'System',   time:'4/9 05:30 PM',  read:true  },
  ],
  oid:6, pid:4, cid:6, nid:6, contid:4
};