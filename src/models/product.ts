import { db } from './database.js';

export interface Product {
  id: number;
  eventId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

/**
 * すべての商品を取得
 */
export const getAllProducts = (): Product[] => {
  const stmt = db.prepare('SELECT * FROM products ORDER BY id DESC');
  return stmt.all() as Product[];
};

/**
 * イベント別に商品を取得
 */
export const getProductsByEventId = (eventId: number): Product[] => {
  const stmt = db.prepare('SELECT * FROM products WHERE eventId = ? ORDER BY id DESC');
  return stmt.all(eventId) as Product[];
};

/**
 * 商品 ID で商品を取得
 */
export const getProductById = (id: number): Product | undefined => {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(id) as Product | undefined;
};

/**
 * 新規商品を作成
 */
export const createProduct = (
  eventId: number,
  name: string,
  description: string,
  price: number,
  stock: number,
  category: string
): Product => {
  const stmt = db.prepare(
    'INSERT INTO products (eventId, name, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(eventId, name, description, price, stock, category);

  const insertedProduct = getProductById(result.lastInsertRowid as number);
  if (!insertedProduct) {
    throw new Error('Failed to create product');
  }

  return insertedProduct;
};

/**
 * 在庫を更新
 */
export const updateStock = (id: number, quantity: number): boolean => {
  const product = getProductById(id);
  if (!product) {
    return false;
  }

  if (product.stock < quantity) {
    return false;
  }

  const stmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
  stmt.run(quantity, id);
  return true;
};
