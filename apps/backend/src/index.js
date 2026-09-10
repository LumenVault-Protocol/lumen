const mongoose = require('mongoose');
const cron = require('node-cron');
const app = require('./app');
const config = require('./config');
const memdb = require('./data/memdb');

async function startServer() {
  try {
    await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    memdb.enable();
    console.warn('MongoDB unavailable, falling back to in-memory demo data.');
    console.warn('  - To use the real database, install/start MongoDB and set MONGODB_URI.');
  }

  cron.schedule('*/5 * * * *', () => {
    console.log('Running TVL sync job...');
  });

  cron.schedule('0 * * * *', () => {
    console.log('Running yield update job...');
  });

  const server = app.listen(config.port, () => {
    console.log(`LumenVault API running on port ${config.port}`);
    console.log(`  - Data source: ${memdb.isEnabled() ? 'in-memory demo' : 'MongoDB'}`);
    if (memdb.isEnabled()) {
      console.log(`  - Demo data mode: ${memdb.demoUser} has sample positions`);
    }
  });

  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();

module.exports = app;