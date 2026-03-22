import { db } from './database.js';

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}

/**
 * すべての注文を取得
 */
export const getAllOrders = (): Order[] => {
  const stmt = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC');
  return stmt.all() as Order[];
};

/**
 * 注文 ID で注文を取得
 */
export const getOrderById = (id: number): Order | undefined => {
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  return stmt.get(id) as Order | undefined;
};

/**
 * 注文のアイテムを取得
 */
export const getOrderItems = (orderId: number): OrderItem[] => {
  const stmt = db.prepare('SELECT * FROM orderItems WHERE orderId = ? ORDER BY id');
  return stmt.all(orderId) as OrderItem[];
};

/**
 * 新規注文を作成（トランザクション）
 */
export const createOrder = (
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  totalPrice: number,
  items: Array<{ productId: number; quantity: number; price: number }>
): Order => {
  const insertOrder = db.prepare(
    'INSERT INTO orders (customerName, customerEmail, customerPhone, totalPrice, status) VALUES (?, ?, ?, ?, ?)'
  );

  const result = insertOrder.run(
    customerName,
    customerEmail,
    customerPhone,
    totalPrice,
    'completed'
  );
  const orderId = result.lastInsertRowid as number;

  const insertOrderItem = db.prepare(
    'INSERT INTO orderItems (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)'
  );

  for (const item of items) {
    insertOrderItem.run(orderId, item.productId, item.quantity, item.price);
  }

  const createdOrder = getOrderById(orderId);
  if (!createdOrder) {
    throw new Error('Failed to create order');
  }

  return createdOrder;
};
