import linq = require("lazy-linq");
import { DbServer } from "./isotropy-db";

function random() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 16; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export default class Db<T extends { [key: string]: any }> {
  state: string;
  server: DbServer<T>;
  cursors: {
    [key: string]: number;
  };
  tables: T;

  constructor(server: DbServer<T>, tables: T) {
    this.state = "CLOSED";
    this.server = server;
    this.tables = tables;

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
    ) as T;
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
    ) as T;
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
    ) as T;
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
    ) as T;
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
