import linq = require("lazy-linq");
import { DbServer } from "./isotropy-db";

export type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
export type Omit<T, K extends keyof T> = { [P in Diff<keyof T, K>]: T[P] };

export type RowBase = { __id: number };

function random() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 16; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export default class Db<T> {
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
        [tableName]: tables[tableName].orderBy(t => t.__id).last().__id
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

  async delete<TRow extends RowBase>(
    tableSelector: ((tables: T) => IEnumerable<TRow>),
    selector: Predicate<TRow>
  ) {
    const table = tableSelector(this.tables);
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

  async dropTable<TRow extends RowBase>(
    tableSelector: ((tables: T) => IEnumerable<TRow>)
  ) {
    const table = tableSelector(this.tables);

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

  //TODO: Remove cast
  //Spread on generics is not supported yet.
  //https://github.com/Microsoft/TypeScript/issues/10727
  async insert<TRow extends RowBase>(
    tableSelector: ((tables: T) => IEnumerable<TRow>),
    item: Omit<TRow, "__id">
  ) {
    const table = tableSelector(this.tables);

    const items: IEnumerable<TRow> = [
      { ...(item as any), __id: this.__updateNextId(table) }
    ] as any;

    this.tables = Object.keys(this.tables).reduce(
      (acc, tableName) => ({
        ...acc,
        [tableName]:
          this.tables[tableName] === table
            ? table.concat(items as IEnumerable<TRow>)
            : this.tables[tableName]
      }),
      {}
    ) as T;
  }

  async insertMany<TRow extends RowBase>(
    tableSelector: ((tables: T) => IEnumerable<TRow>),
    rows: TRow[]
  ) {
    const table = tableSelector(this.tables);

    const items: IEnumerable<TRow> = rows.map(i => ({
      ...(i as any),
      __id: this.__updateNextId(table)
    })) as any;

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

  async update<TRow>(
    tableSelector: ((tables: T) => IEnumerable<TRow>),
    selector: Predicate<TRow>,
    props: Partial<TRow>
  ) {
    const table = tableSelector(this.tables);

    this.tables = Object.keys(this.tables).reduce(
      (acc, tableName) => ({
        ...acc,
        [tableName]:
          this.tables[tableName] === table
            ? table.select(
                row =>
                  selector(row) ? { ...(row as any), ...(props as any) } : row
              )
            : this.tables[tableName]
      }),
      {}
    ) as T;
  }

  async open() {
    this.state = "OPEN";
  }

  __getTableName<TRow extends RowBase>(table: IEnumerable<TRow>) {
    return Object.keys(this.tables).find(name => this.tables[name] === table);
  }

  __updateNextId<TRow extends RowBase>(table: IEnumerable<TRow>) {
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
