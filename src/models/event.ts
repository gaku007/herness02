import { db } from './database.js';

export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  createdAt: string;
}

/**
 * すべてのイベントを取得
 */
export const getAllEvents = (): Event[] => {
  const stmt = db.prepare('SELECT * FROM events ORDER BY date DESC');
  return stmt.all() as Event[];
};

/**
 * イベント ID でイベントを取得
 */
export const getEventById = (id: number): Event | undefined => {
  const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
  return stmt.get(id) as Event | undefined;
};

/**
 * 新規イベントを作成
 */
export const createEvent = (
  name: string,
  description: string,
  date: string,
  location: string
): Event => {
  const stmt = db.prepare(
    'INSERT INTO events (name, description, date, location) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(name, description, date, location);

  const insertedEvent = getEventById(result.lastInsertRowid as number);
  if (!insertedEvent) {
    throw new Error('Failed to create event');
  }

  return insertedEvent;
};
