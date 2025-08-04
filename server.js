const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const farmerRoutes = require('./routes/farmers');
const { Pool } = require('pg');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/',authRoutes);
app.use('/',productRoutes);
app.use('/', categoryRoutes)
app.use('/',farmerRoutes)

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
