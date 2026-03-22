/**
 * EC Site - メインサーバー
 * Express サーバーと SQLite データベースを初期化
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { initializeDatabase, seedSampleData } from './models/database.js';
import { createApiRouter } from './routes/api.js';

// __dirname の代替（ES Module 使用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// ミドルウェア
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// API ルート
app.use('/api', createApiRouter());

// ルートパス
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

/**
 * サーバーを起動
 */
const startServer = (): void => {
  try {
    // データベースを初期化
    initializeDatabase();
    seedSampleData();

    app.listen(PORT, () => {
      console.log(`EC Site server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// サーバー起動
startServer();

export default app;
