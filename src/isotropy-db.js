class DbContext {
  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }
}

export function init(connectionString, data) {
  
}

export function open(connectionString) {
  return new DbContext(connectionString)
}


