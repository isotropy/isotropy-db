require("mocha");
require("should");
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
    const results = await db.tables.employees
      .where(e => e.fans >= 8000)
      .toArray();
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
    const id = await db.insert(t => t.orders, {
      item: "Pampers",
      quantity: 5,
      price: 10,
      employeeId: "6"
    });
    id.should.equal(5);
    db
      .__data()
      .orders.toArray()
      .length.should.equal(5);
    db
      .__data()
      .orders.last()
      .__id.should.equal(5);
  });

  it(`Inserts a record`, async () => {
    const db = await server.open();

    const id = await db.insertMany(t => t.orders, [
      {
        item: "Pampers",
        quantity: 5,
        price: 10,
        employeeId: "6"
      },
      {
        item: "Dolce and Banana",
        quantity: 1,
        price: 100,
        employeeId: "6"
      }
    ]);

    id.should.deepEqual([6, 5]);
  });

  it(`Updates a record`, async () => {
    const db = await server.open();
    await db.update(t => t.employees, e => e.name === "Liz Lemon", {
      name: "Elizabeth Miervaldis Lemon"
    });
    const liz = db.__data().employees.first(i => i.__id === "1");
    liz.name.should.equal("Elizabeth Miervaldis Lemon");
  });

  it(`Does a join`, async () => {
    const db = await server.open();
    const lemonsOrders = db.tables.employees
      .join(
        db.tables.orders,
        e => e.__id,
        o => o.employeeId,
        (e, o) => ({
          name: e.name,
          order: o.item
        })
      )
      .where(e => e.name === "Liz Lemon")
      .toArray();
    lemonsOrders.should.deepEqual([
      { name: "Liz Lemon", order: "Sabor de Soledad" },
      { name: "Liz Lemon", order: "iPhone X" }
    ]);
  });

  it(`Drops a table`, async () => {
    const db = await server.open();
    await db.dropTable(t => t.orders);
    db
      .__data()
      .orders.toArray()
      .length.should.equal(0);
  });

  it(`Can do a transaction`, async () => {
    const db = await server.open();

    db.beginTransaction();

    const id = await db.insertMany(t => t.orders, [
      {
        item: "Pampers",
        quantity: 5,
        price: 10,
        employeeId: "6"
      },
      {
        item: "Dolce and Banana",
        quantity: 1,
        price: 100,
        employeeId: "6"
      }
    ]);

    db.commitTransaction();

    db
      .__data()
      .orders.toArray()
      .length.should.equal(6);
  });

  it(`Can rollback a transaction`, async () => {
    const db = await server.open();

    db.beginTransaction();

    const id = await db.insertMany(t => t.orders, [
      {
        item: "Pampers",
        quantity: 5,
        price: 10,
        employeeId: "6"
      },
      {
        item: "Dolce and Banana",
        quantity: 1,
        price: 100,
        employeeId: "6"
      }
    ]);

    db.rollbackTransaction();

    db
      .__data()
      .orders.toArray()
      .length.should.equal(4);
  });
});
