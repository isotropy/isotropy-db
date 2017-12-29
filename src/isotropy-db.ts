import Db from "./db";

export class DbServer<T> {
  originalTables: T;
  db: Db<T>;

  constructor(data: T) {
    this.data = data;
    this.__reset();
  }

  __reset() {
    this.db = new Db<T>(this, this.data);
  }

  async open() {
    await this.db.open();
    return this.db;
  }
}

export default function create<T>(data: T) : DbServer<T> {
  return new DbServer<T>(data);
}