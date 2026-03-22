import { initializeDatabase } from '../db/init.js';
import { startServer } from './app.js';

async function main(): Promise<void> {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully');

    console.log('Starting server...');
    startServer();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
