import linq = require("lazy-linq");

interface Context {
  [key: string]: object[]
}

class DbContext implements Context {
  db: Db;
  [key: string]: any;

  constructor(db: Db) {
    this.db = db;

    for (const tableName of Object.keys(this.db.data)) {
      this[tableName] = linq.asEnumerable(this.db.data[tableName]);
    }
  }
}

type Tables = {
  [key: string]: object[]
}

export class Db {
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
    this.context = new DbContext(this);
  }

  async open() {
    return this.context;
  }
}
