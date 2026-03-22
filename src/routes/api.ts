import express, { type Router, type Request, type Response } from 'express';
import { getAllEvents, getEventById } from '../models/event.js';
import { createOrder, getAllOrders, getOrderById, getOrderItems } from '../models/order.js';
import {
  getAllProducts,
  getProductById,
  getProductsByEventId,
  updateStock,
} from '../models/product.js';

export const createApiRouter = (): Router => {
  const router = express.Router();

  // ===== イベント API =====
  /**
   * すべてのイベントを取得
   */
  router.get('/events', (_req: Request, res: Response) => {
    try {
      const events = getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  /**
   * イベント ID でイベントを取得
   */
  router.get('/events/:id', (req: Request, res: Response) => {
    try {
      const event = getEventById(Number(req.params.id));
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  });

  // ===== 商品 API =====
  /**
   * すべての商品を取得
   */
  router.get('/products', (_req: Request, res: Response) => {
    try {
      const products = getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  /**
   * イベント別に商品を取得
   */
  router.get('/products/event/:eventId', (req: Request, res: Response) => {
    try {
      const products = getProductsByEventId(Number(req.params.eventId));
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  /**
   * 商品 ID で商品を取得
   */
  router.get('/product/:id', (req: Request, res: Response) => {
    try {
      const product = getProductById(Number(req.params.id));
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  // ===== 注文 API =====
  /**
   * すべての注文を取得
   */
  router.get('/orders', (_req: Request, res: Response) => {
    try {
      const orders = getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  /**
   * 注文 ID で注文を取得（アイテム含む）
   */
  router.get('/orders/:id', (req: Request, res: Response) => {
    try {
      const order = getOrderById(Number(req.params.id));
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const items = getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  /**
   * 新規注文を作成
   */
  router.post('/orders', express.json(), (req: Request, res: Response) => {
    try {
      const { customerName, customerEmail, customerPhone, items } = req.body;

      // バリデーション
      if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
        res.status(400).json({ error: 'Invalid request parameters' });
        return;
      }

      // 在庫確認と合計価格計算
      let totalPrice = 0;
      const cartItems: Array<{ productId: number; quantity: number; price: number }> = [];

      for (const item of items) {
        const product = getProductById(item.productId);
        if (!product) {
          res.status(404).json({ error: `Product ${item.productId} not found` });
          return;
        }

        if (product.stock < item.quantity) {
          res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
          return;
        }

        totalPrice += product.price * item.quantity;
        cartItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // 注文を作成
      const order = createOrder(customerName, customerEmail, customerPhone, totalPrice, cartItems);

      // 在庫を更新
      for (const item of cartItems) {
        updateStock(item.productId, item.quantity);
      }

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  return router;
};
