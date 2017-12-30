import "mocha";
import "should";
import server from "./db";

const connectionString = "Server=127.0.0.1;Port=5432;Database=myDataBase;";

describe("Isotropy FS", () => {
  beforeEach(() => {
    server.__reset();
  });

  it(`Returns all records from table`, async () => {
    const db = await server.open();
    const results = db.tables.employees.toArray();
    results.length.should.equal(6);
  });

  it(`Makes tables Enumerable`, async () => {
    const db = await server.open();
    const results = await db.tables.employees.where(e => e.fans >= 8000).toArray();
    results.length.should.equal(3);
  });

  it(`Deletes a record`, async () => {
    const db = await server.open();
    await db.delete(t => t.employees, e => e.name === "Liz Lemon");
    const liz = db
      .__data()
      .employees.toArray()
      .length.should.equal(5);
  });

  it(`Inserts a record`, async () => {
    const db = await server.open();
    await db.insert(t => t.orders, {
      item: "Pampers",
      quantity: 5,
      price: 10,
      employeeId: 6
    });
    db
      .__data()
      .orders.toArray()
      .length.should.equal(5);
    db
      .__data()
      .orders.last()
      .__id.should.equal(5);
  });

  it(`Updates a record`, async () => {
    const db = await server.open();
    await db.update(t => t.employees, e => e.name === "Liz Lemon", {
      name: "Elizabeth Miervaldis Lemon"
    });
    const liz = db.__data().employees.first(i => i.__id === 1);
    liz.name.should.equal("Elizabeth Miervaldis Lemon");
  });

  it(`Drops a table`, async () => {
    const db = await server.open();
    await db.dropTable(t => t.orders);
    db
      .__data()
      .orders.toArray()
      .length.should.equal(0);
  });
});
