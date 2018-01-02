import Db from "./db";
import linq = require("lazy-linq")

export type Tables = {
  [key: string]: IEnumerable<{ __id: number }>
}

export class DbServer<T> {
  tables: T;
  db: Db<T>;

  constructor(tables: T) {
    this.tables = tables;
    this.__reset();
  }

  __reset() {
    this.db = new Db<T>(this, this.tables);
  }

  async open() {
    await this.db.open();
    return this.db;
  }
}

export function table<T>(rows: T[]) : IEnumerable<T> {
  return linq.asEnumerable(rows);
}

export function db<T extends Tables>(tables: T) : DbServer<T> {
  return new DbServer<T>(tables);
}