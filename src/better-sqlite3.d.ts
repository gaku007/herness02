declare module 'better-sqlite3' {
  class Database {
    constructor(filePath: string);
    pragma(pragma: string): void;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    close(): void;
  }

  interface Statement {
    run(...params: unknown[]): RunResult;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  interface RunResult {
    lastInsertRowid: number | bigint;
    changes: number;
  }

  export default Database;
}
