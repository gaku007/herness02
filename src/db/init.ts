import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'events.db');

export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, err => {
      if (err) {
        reject(err);
        return;
      }

      // スキーマを読み込んでテーブル作成
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');

      db.exec(schema, err => {
        if (err) {
          reject(err);
          return;
        }

        // サンプルデータ挿入
        insertSampleData(db, resolve, reject);
      });
    });
  });
}

function insertSampleData(
  db: sqlite3.Database,
  resolve: () => void,
  reject: (err: Error) => void
): void {
  // イベントデータ
  const events = [
    {
      id: uuidv4(),
      name: '元気４ Summer Festival 2026',
      date: '2026-07-15',
      description: '真夏のライブイベント。熱いパフォーマンスと限定グッズが勢揃い！',
      thumbnail: 'https://via.placeholder.com/300x200?text=Summer+Festival',
    },
    {
      id: uuidv4(),
      name: '元気４ Winter Live 2026',
      date: '2026-12-20',
      description: '冬の夜空に輝く特別ライブ。冬限定グッズ販売あり。',
      thumbnail: 'https://via.placeholder.com/300x200?text=Winter+Live',
    },
    {
      id: uuidv4(),
      name: '元気４ Spring Concert 2027',
      date: '2027-03-21',
      description: '春の訪れを彩る大型コンサート。新曲初披露や豪華ゲスト出演。',
      thumbnail: 'https://via.placeholder.com/300x200?text=Spring+Concert',
    },
  ];

  db.run('BEGIN TRANSACTION', err => {
    if (err) {
      reject(err);
      return;
    }

    // イベント挿入
    const insertEventStmt = db.prepare(
      'INSERT INTO events (id, name, date, description, thumbnail) VALUES (?, ?, ?, ?, ?)'
    );

    for (const event of events) {
      insertEventStmt.run(event.id, event.name, event.date, event.description, event.thumbnail);
    }

    insertEventStmt.finalize();

    // 商品挿入（チケット + グッズ）
    const insertProductStmt = db.prepare(
      'INSERT INTO products (id, event_id, type, name, description, price, image, stock, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const goodsCategories = [
      'Tシャツ',
      'タオル',
      'ペンライト',
      'ステッカー',
      'ポスター',
      'グラス',
      'アクリルキーホルダー',
      'クッション',
      'パーカー',
      'キャップ',
    ];

    for (const event of events) {
      // チケット（1種類）
      insertProductStmt.run(
        uuidv4(),
        event.id,
        'ticket',
        `${event.name} チケット`,
        'このコンサートの入場チケットです',
        5000,
        'https://via.placeholder.com/200x200?text=Ticket',
        100,
        'チケット'
      );

      // グッズ（20種類）
      for (let i = 1; i <= 20; i++) {
        const categoryIndex = (i - 1) % goodsCategories.length;
        const category = goodsCategories[categoryIndex];
        const price = 1000 + (i % 5) * 500;
        const stock = 50 + Math.floor(Math.random() * 100);

        insertProductStmt.run(
          uuidv4(),
          event.id,
          'goods',
          `${category} vol.${i}`,
          `${event.name}の限定${category}です`,
          price,
          `https://via.placeholder.com/200x200?text=Goods+${i}`,
          stock,
          category
        );
      }
    }

    insertProductStmt.finalize();

    db.run('COMMIT', err => {
      if (err) {
        reject(err);
      } else {
        db.close();
        resolve();
      }
    });
  });
}

export function getDatabase(): sqlite3.Database {
  return new sqlite3.Database(DB_PATH);
}
