import linq = require("lazy-linq");
import { debug } from "util";

interface Enumerables {
  [key: string]: object[];
}

function random() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 16; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

class Db {
  state: string;
  server: DbServer;
  cursors: {
    [key: string]: number;
  };
  tables: Enumerables;

  constructor(server: DbServer, tables: Enumerables) {
    this.state = "CLOSED";
    this.server = server;
    this.tables = Object.keys(tables).reduce(
      (acc, tableName) => ({
        ...acc,
        [tableName]: linq.asEnumerable(tables[tableName])
      }),
      {}
    );
    this.cursors = Object.keys(tables).reduce(
      (acc, tableName) => ({
        ...acc,
        [tableName]: tables[tableName].length
      }),
      {}
    );
  }

  __data() {
    return this.tables;
  }

  async close() {
    this.state = "CLOSED";
  }

  async delete(getTable, selector) {
    const table = getTable(this.tables);
    this.tables = Object.keys(this.tables).reduce(
      (acc, tableName) => ({
        ...acc,
        [tableName]:
          this.tables[tableName] === table
            ? table.where(row => !selector(row))
            : this.tables[tableName]
      }),
      {}
    );
  }

  async dropTable(getTable) {
    const table = getTable(this.tables);
    this.tables = Object.keys(this.tables).reduce(
      (acc, tableName) => ({
        ...acc,
        [tableName]:
          this.tables[tableName] === table
            ? linq.asEnumerable([])
            : this.tables[tableName]
      }),
      {}
    );
  }

  async insert(getTable, _item) {
    const table = getTable(this.tables);

    const items = Array.isArray(_item)
      ? _item.map(i => ({
          ...i,
          __id: this.__updateNextId(table)
        }))
      : [{ ..._item, __id: this.__updateNextId(table) }];

    this.tables = Object.keys(this.tables).reduce(
      (acc, tableName) => ({
        ...acc,
        [tableName]:
          this.tables[tableName] === table
            ? table.concat(items)
            : this.tables[tableName]
      }),
      {}
    );
  }

  async update(getTable, selector, props) {
    const table = getTable(this.tables);
    this.tables = Object.keys(this.tables).reduce(
      (acc, tableName) => ({
        ...acc,
        [tableName]:
          this.tables[tableName] === table
            ? table.select(row => (selector(row) ? { ...row, ...props } : row))
            : this.tables[tableName]
      }),
      {}
    );
  }

  async open() {
    this.state = "OPEN";
  }

  __getTableName(table) {
    return Object.keys(this.tables).find(name => this.tables[name] === table);
  }

  __updateNextId(table) {
    const tableName = this.__getTableName(table);
    if (tableName) {
      const nextId = this.cursors[tableName] + 1;
      this.cursors = Object.keys(this.cursors).reduce(
        (acc, name) => ({
          ...acc,
          [name]: name === tableName ? nextId : this.cursors[name]
        }),
        {}
      );
      return nextId;
    } else {
      throw new Error(`Could not find table in database.`);
    }
  }
}

type Tables = {
  [key: string]: object[];
};

export default class DbServer {
  originalTables: Tables;
  db: Db;

  constructor(tables: Tables) {
    this.originalTables = tables;
    this.__reset();
  }

  __reset() {
    this.db = new Db(this, this.originalTables);
  }

  async open() {
    await this.db.open();
    return this.db;
  }
}
