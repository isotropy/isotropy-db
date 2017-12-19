import should from "should";
import db from "./db";

const connectionString = "Server=127.0.0.1;Port=5432;Database=myDataBase;"

describe("Isotropy FS", () => {
  beforeEach(() => {
    db.__reset(data);
  });

  it(`Returns all records from table`, async () => {
    const context = db.open();
    context.employees.toArray();
    results.length.should.equal(7);
  });

  // it(`Inserts a new record`, async () => {
  //   const id = await db.open().employees.insert({
  //     item: "Pampers",
  //     quantity: 5,
  //     price: 10,
  //     employeeId: 6
  //   });

  //   const id = await db.open().orders.insert({
  //     item: "Pampers",
  //     quantity: 5,
  //     price: 10,
  //     employeeId: 6
  //   });

  //   data.orders.rows.length.should.equal(6);
  // });

  // it(`Updates a record`, async () => {
  //   await db.open().employees.update(x => x.name === "Jack Donaghy", {
  //     job: "CEO"
  //   });

  //   data.employees.rows
  //     .find(x => x.name === "Jack Donaghy")
  //     .job.should.equal("CEO");
  // });

  // it(`Deletes a record`, async () => {
  //   await db.open().orders.delete(x => x.name === "Jack Donaghy");
  //   table("employees").rows.every(x => x.name !== "Jack Donaghy");
  // });

  // it(`Filters with a predicate`, async () => {
  //   const results = await db.open()
  //     .employees.filter(x => x.fans >= 5000)
  //     .toArray();

  //   results.length.should.equal(4);
  // });

  // it(`Sorts`, async () => {
  //   const results = await db.open()
  //     .employees.orderBy("fans")
  //     .toArray();

  //   results.length.should.equal(6);
  //   results[0].name.should.equal("Pete Hornberger");
  // });

  // it(`Sorts Descending`, async () => {
  //   const results = await db.open()
  //     .employees.orderBy("fans")
  //     .toArray();

  //   results.length.should.equal(6);
  //   results[0].name.should.equal("Liz Lemon");
  // });

  // it(`Sorts on multiple fields (ascending + ascending)`, async () => {
  //   const results = await db.open()
  //     .table("employees")
  //     .orderBy("fans")
  //     .thenByDescending("name")
  //     .toArray();

  //   results.length.should.equal(6);
  //   results[2].name.should.equal("Kenneth Parcell");
  // });

  // it(`Sorts on multiple fields (ascending + descending)`, async () => {
  //   const results = await db.open()
  //     .table("employees")
  //     .orderBy("fans")
  //     .thenByDescending("name")
  //     .toArray();

  //   results.length.should.equal(6);
  //   results[2].name.should.equal("Kenneth Parcell");
  // });

  // it(`Slices results`, async () => {
  //   const results = await db.open()
  //     .table("employees")
  //     .slice(2, 3)
  //     .toArray();

  //   results.length.should.equal(2);
  //   results[0].name.should.equal("Jack Donaghy");
  //   results[1].name.should.equal("Kenneth Parcell");
  // });

  // it(`Fetches specific fields`, async () => {
  //   const results = await db.open()
  //     .table("employees")
  //     .map(x => ({ name: x.name, job: x.job }))
  //     .toArray();

  //   results.length.should.equal(6);
  //   results[0].name.should.equal("Jack Donaghy");
  //   results[1].name.should.equal("Kenneth Parcell");
  // });
});
