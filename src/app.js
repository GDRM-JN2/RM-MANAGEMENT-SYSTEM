const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const gdrmRoutes = require('./routes/gdrm.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/gdrm', gdrmRoutes);

// TODO fase berikutnya: app.use('/bswp', bswpRoutes), app.use('/ekonomis', ekonomisRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

module.exports = app;
