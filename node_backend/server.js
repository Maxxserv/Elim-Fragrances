
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '..', 'public')));

app.get('/products.json', (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, '..', 'products.json'), 'utf8');
  res.type('application/json').send(data);
});

app.post('/checkout', (req, res) => {
  const order = req.body;
  order.id = Math.floor(Math.random()*1000000);
  const ordersFile = path.join(__dirname, '..', 'orders.json');
  fs.appendFileSync(ordersFile, JSON.stringify(order) + '\n');
  res.json({status:'ok', orderId: order.id});
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('Node server running on http://localhost:' + port));
