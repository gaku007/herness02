import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { ApiResponse, BuyerInfo, CartItem, Event, Order, Product } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const DB_PATH = path.join(__dirname, '../../db/events.db');

// ミドルウェア
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// ヘルパー関数：トランザクション内でコールバックを実行
function runInTransaction(db: sqlite3.Database, callback: () => Promise<void>): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('BEGIN TRANSACTION', async err => {
      if (err) {
        reject(err);
        return;
      }

      try {
        await callback();
        db.run('COMMIT', err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (error) {
        db.run('ROLLBACK');
        reject(error);
      }
    });
  });
}

// ヘルパー関数：DB クエリ実行
function dbRun(
  db: sqlite3.Database,
  sql: string,
  params: unknown[] = []
): Promise<{ id: string; lastID: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID.toString(), lastID: this.lastID });
      }
    });
  });
}

function dbAll<T>(db: sqlite3.Database, sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}

function dbGet<T>(
  db: sqlite3.Database,
  sql: string,
  params: unknown[] = []
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as T | undefined);
      }
    });
  });
}

// API エンドポイント

// GET /api/events - イベント一覧取得
app.get('/api/events', async (req: Request, res: Response<ApiResponse<Event[]>>) => {
  const db = new sqlite3.Database(DB_PATH);

  try {
    const events = await dbAll<Event>(db, 'SELECT * FROM events ORDER BY date ASC');
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  } finally {
    db.close();
  }
});

// GET /api/events/:id - イベント詳細取得
app.get('/api/events/:id', async (req: Request, res: Response<ApiResponse<Event>>) => {
  const db = new sqlite3.Database(DB_PATH);
  const { id } = req.params;

  try {
    const event = await dbGet<Event>(db, 'SELECT * FROM events WHERE id = ?', [id]);
    if (!event) {
      res.status(404).json({ success: false, error: 'Event not found' });
      return;
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  } finally {
    db.close();
  }
});

// GET /api/products - 商品一覧取得（イベント別またはすべて）
app.get('/api/products', async (req: Request, res: Response<ApiResponse<Product[]>>) => {
  const db = new sqlite3.Database(DB_PATH);
  const { eventId } = req.query;

  try {
    let sql =
      'SELECT id, event_id as eventId, type, name, description, price, image, stock, category FROM products';
    const params: unknown[] = [];

    if (eventId) {
      sql += ' WHERE event_id = ?';
      params.push(eventId);
    }

    sql += ' ORDER BY type DESC, category, name ASC';

    const products = await dbAll<Product>(db, sql, params);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  } finally {
    db.close();
  }
});

// GET /api/products/:id - 商品詳細取得
app.get('/api/products/:id', async (req: Request, res: Response<ApiResponse<Product>>) => {
  const db = new sqlite3.Database(DB_PATH);
  const { id } = req.params;

  try {
    const product = await dbGet<Product>(
      db,
      'SELECT id, event_id as eventId, type, name, description, price, image, stock, category FROM products WHERE id = ?',
      [id]
    );
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  } finally {
    db.close();
  }
});

// POST /api/orders - 注文作成
app.post(
  '/api/orders',
  async (
    req: Request<unknown, unknown, { buyerInfo: BuyerInfo; items: CartItem[] }>,
    res: Response<ApiResponse<Order>>
  ) => {
    const db = new sqlite3.Database(DB_PATH);
    const { buyerInfo, items } = req.body;

    try {
      const orderId = uuidv4();
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      await runInTransaction(db, async () => {
        // 在庫確認（すべての商品について）
        for (const item of items) {
          const product = await dbGet<Product>(db, 'SELECT stock FROM products WHERE id = ?', [
            item.productId,
          ]);
          if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
          }
        }

        // 注文レコード作成
        await dbRun(
          db,
          `INSERT INTO orders (id, buyer_name, buyer_email, buyer_phone, buyer_address, buyer_postal_code, total_amount, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            buyerInfo.name,
            buyerInfo.email,
            buyerInfo.phoneNumber,
            buyerInfo.address,
            buyerInfo.postalCode,
            totalAmount,
            'completed',
          ]
        );

        // 注文アイテム作成 & 在庫更新
        for (const item of items) {
          await dbRun(
            db,
            `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
             VALUES (?, ?, ?, ?, ?)`,
            [orderId, item.productId, item.name, item.quantity, item.price]
          );

          // 在庫減少
          await dbRun(db, 'UPDATE products SET stock = stock - ? WHERE id = ?', [
            item.quantity,
            item.productId,
          ]);
        }
      });

      const order: Order = {
        id: orderId,
        buyerInfo,
        items,
        totalAmount,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      res.status(201).json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, error: String(error) });
    } finally {
      db.close();
    }
  }
);

// GET /api/orders - 注文履歴取得
app.get('/api/orders', async (req: Request, res: Response<ApiResponse<Order[]>>) => {
  const db = new sqlite3.Database(DB_PATH);
  const { email } = req.query;

  try {
    let sql = `SELECT o.id, o.buyer_name, o.buyer_email as email, o.buyer_phone as phoneNumber,
               o.buyer_address as address, o.buyer_postal_code as postalCode, o.total_amount as totalAmount,
               o.status, o.created_at as createdAt FROM orders o`;
    const params: unknown[] = [];

    if (email) {
      sql += ' WHERE o.buyer_email = ?';
      params.push(email);
    }

    sql += ' ORDER BY o.created_at DESC';

    const orders = await dbAll<{
      id: string;
      buyer_name: string;
      email: string;
      phoneNumber: string;
      address: string;
      postalCode: string;
      totalAmount: number;
      status: string;
      createdAt: string;
    }>(db, sql, params);

    // 各注文のアイテムを取得
    const result: Order[] = await Promise.all(
      orders.map(async o => {
        const items = await dbAll<CartItem>(
          db,
          'SELECT product_id as productId, quantity, price, product_name as name FROM order_items WHERE order_id = ?',
          [o.id]
        );
        return {
          id: o.id,
          buyerInfo: {
            name: o.buyer_name,
            email: o.email,
            phoneNumber: o.phoneNumber,
            address: o.address,
            postalCode: o.postalCode,
          },
          items,
          totalAmount: o.totalAmount,
          createdAt: o.createdAt,
          status: o.status as 'pending' | 'completed' | 'cancelled',
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  } finally {
    db.close();
  }
});

// サーバー起動
export function startServer(): void {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
