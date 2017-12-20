import linq = require("lazy-linq");
import { debug } from "util";

interface Enumerables {
  [key: string]: object[];
}

class DbContext {
  db: Db;
  tables: Enumerables;

  constructor(db: Db) {
    this.db = db;
    this.tables = Object.keys(this.db.data).reduce(
      (acc, table) => ({
        ...acc,
        [table]: linq.asEnumerable(this.db.data[table])
      }),
      {}
    );
  }

  async insert(table, item) {
    this.tables = Object.keys(this.tables).reduce(
      (acc, t) => ({
        [t]: this.tables[t] === table ? table.concat(item) : this.tables[t]
      }),
      {}
    );
  }

  async update(table, selector, props) {
    this.tables = Object.keys(this.tables).reduce(
      (acc, t) => ({
        [t]:
          this.tables[t] === table
            ? table.map(row => (selector(row) ? { ...row, ...props } : row))
            : this.tables[t]
      }),
      {}
    );
  }

  async delete(table, selector) {
    this.tables = Object.keys(this.tables).reduce(
      (acc, t) => ({
        [t]:
          this.tables[t] === table
            ? table.filter(row => selector(row))
            : this.tables[t]
      }),
      {}
    );
  }
}

type Tables = {
  [key: string]: object[];
};

export default class Db {
  data: Tables;
  originalData: Tables;
  state: string;
  context: DbContext;

  constructor(data: Tables) {
    this.originalData = data;
    this.init(data);
  }

  init(data: Tables) {
    this.state = "CLOSED";
    this.data = data;
    this.context = new DbContext(this);
  }

  async open() {
    return this.context;
  }

  __reset() {
    this.init(this.originalData);
  }
}
