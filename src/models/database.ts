import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

// __dirname の代替（ES Module 使用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data.db');
export const db = new Database(dbPath);

/**
 * データベースの初期化
 */
export const initializeDatabase = (): void => {
  db.pragma('journal_mode = WAL');

  // イベントテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 商品（グッズ）テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      category TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (eventId) REFERENCES events(id)
    )
  `);

  // 注文テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      totalPrice REAL NOT NULL,
      status TEXT DEFAULT 'completed',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 注文アイテムテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS orderItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    )
  `);

  console.log('Database initialized successfully');
};

/**
 * サンプルデータを投入
 */
export const seedSampleData = (): void => {
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as {
    count: number;
  };

  if (eventCount.count > 0) {
    console.log('Sample data already exists');
    return;
  }

  // イベントのサンプルデータ
  const events = [
    {
      name: '元気3周年記念ライブ',
      description: '元気3周年を記念した特別ライブ',
      date: '2026-06-15',
      location: '渋谷公会堂',
    },
    {
      name: '夏の野外フェスティバル',
      description: '暑い夏を盛り上げるイベント',
      date: '2026-08-20',
      location: '横浜港湾公園',
    },
    {
      name: '冬のスペシャルコンサート',
      description: '寒い冬を温かくするコンサート',
      date: '2026-12-10',
      location: '神奈川県民ホール',
    },
    {
      name: '春の桜の下コンサート',
      description: '春の新シーズンを彩るコンサート',
      date: '2026-04-05',
      location: '上野恩賜公園',
    },
    {
      name: 'ハロウィンスペシャルイベント',
      description: 'ハロウィンを盛り上げるスペシャルイベント',
      date: '2026-10-31',
      location: 'お台場青海',
    },
    {
      name: '新年謝恩祭',
      description: '新年のスタートを切る感謝祭',
      date: '2027-01-15',
      location: '東京ドーム',
    },
  ];

  const insertEvent = db.prepare(
    'INSERT INTO events (name, description, date, location) VALUES (?, ?, ?, ?)'
  );

  const eventIds: number[] = [];
  for (const event of events) {
    const result = insertEvent.run(event.name, event.description, event.date, event.location);
    eventIds.push(result.lastInsertRowid as number);
  }

  // グッズのサンプルデータ（イベント毎に20種類）
  const productTemplates = [
    { category: 'clothing', baseName: 'Tシャツ' },
    { category: 'clothing', baseName: 'パーカー' },
    { category: 'clothing', baseName: 'タンクトップ' },
    { category: 'clothing', baseName: 'ジャージ' },
    { category: 'clothing', baseName: '帽子' },
    { category: 'stationery', baseName: 'ノート' },
    { category: 'stationery', baseName: 'ペン' },
    { category: 'stationery', baseName: 'シール' },
    { category: 'stationery', baseName: 'クリアファイル' },
    { category: 'stationery', baseName: 'マーカー' },
    { category: 'accessory', baseName: 'バッジ' },
    { category: 'accessory', baseName: 'キーホルダー' },
    { category: 'accessory', baseName: 'ブレスレット' },
    { category: 'accessory', baseName: 'ネックレス' },
    { category: 'accessory', baseName: 'リング' },
    { category: 'media', baseName: 'CD' },
    { category: 'media', baseName: 'DVD' },
    { category: 'media', baseName: 'ポスター' },
    { category: 'media', baseName: 'タペストリー' },
    { category: 'other', baseName: 'マグカップ' },
  ];

  const insertProduct = db.prepare(
    'INSERT INTO products (eventId, name, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const prices: { [key: string]: number } = {
    clothing: 3000,
    stationery: 1000,
    accessory: 1500,
    media: 2000,
    other: 1200,
  };

  for (const eventId of eventIds) {
    for (let i = 0; i < productTemplates.length; i++) {
      const template = productTemplates[i];
      const name = `${template.baseName} #${i + 1}`;
      const description = `${name}のグッズです`;
      const price = prices[template.category];
      const stock = Math.floor(Math.random() * 50) + 10;

      insertProduct.run(eventId, name, description, price, stock, template.category);
    }
  }

  console.log('Sample data seeded successfully');
};
