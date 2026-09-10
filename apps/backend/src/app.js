const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const vaultRoutes = require('./routes/vaults');
const yieldRoutes = require('./routes/yield');
const chainRoutes = require('./routes/chain');
const memdb = require('./data/memdb');
const notFoundHandler = require('./middleware/not-found');
const errorHandler = require('./middleware/error');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

app.use('/api/v1/vaults', vaultRoutes);
app.use('/api/v1/yield', yieldRoutes);
app.use('/api/v1/chain', chainRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'lumenvault-api',
    env: process.env.NODE_ENV || 'development',
    mode: memdb.isEnabled() ? 'demo-memory' : 'mongo',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;