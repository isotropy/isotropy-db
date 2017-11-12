import should from "should";
import * as babel from "babel-core";
import sourceMapSupport from "source-map-support";
import { log } from "util";
import db from "../isotropy-db";

sourceMapSupport.install();

function table(name) {}

describe("Isotropy FS", () => {
  beforeEach(() => {
    const tables = [
      {
        name: "employees",
        rows: [
          {
            __id: "1",
            name: "Liz Lemon",
            job: "Head Writer",
            fans: 10000
          },
          {
            __id: "2",
            name: "Jack Donaghy",
            job: "Vice President",
            fans: 8000
          },
          {
            __id: "3",
            name: "Kenneth Parcell",
            job: "Page",
            fans: 8000
          },
          {
            __id: "4",
            name: "Pete Hornberger",
            job: "Producer",
            fans: 1000
          },
          {
            __id: "5",
            name: "Jenna Maroney",
            job: "Actress",
            fans: 4000
          },
          {
            __id: "6",
            name: "Tracy Jordan",
            job: "Actor",
            fans: 5000
          }
        ]
      },
      {
        name: "orders",
        rows: [
          {
            __id: "1",
            item: "Sabor de Soledad",
            quantity: 44,
            price: 2.4,
            employeeId: "1"
          },
          {
            __id: "2",
            item: "EGOT Pendant",
            quantity: 1,
            price: 12000,
            employeeId: "6"
          },
          {
            __id: "3",
            item: "iPhone X",
            quantity: 1,
            price: 999,
            employeeId: "1"
          },
          {
            __id: "4",
            item: "iPhone X",
            quantity: 1,
            price: 1299,
            employeeId: "2"
          }
        ]
      }
    ];
    db.init(data);
  });

  it(`Creates a connection`, async () => {
    const conn = db(connStr);
    conn.connectionString.should.equal(connStr);
  });

  it(`Returns all records from table`, async () => {
    const results = db(connStr)
      .table("employees")
      .toArray();
    results.length.should.equal(7);
  });

  it(`Inserts a new record`, async () => {
    const id = await db(connStr)
      .table("orders")
      .insert({
        item: "Pampers",
        quantity: 5,
        price: 10,
        employeeId: 6
      });

    table("orders").rows.length.should.equal(6);
  });

  it(`Updates a record`, async () => {
    await db(connStr)
      .table("employees")
      .update(x => x.name === "Jack Donaghy", {
        job: "CEO"
      });

    table("employees")
      .rows.find(x => x.name === "Jack Donaghy")
      .job.should.equal("CEO");
  });

  it(`Deletes a record`, async () => {
    await db(connStr)
      .table("orders")
      .delete(x => x.name === "Jack Donaghy");

    table("employees").rows.every(x => x.name !== "Jack Donaghy");
  });

  it(`Filters with a predicate`, async () => {
    const results = await db(connStr)
      .table("employees")
      .filter(x => x.fans >= 5000)
      .toArray();

    results.length.should.equal(4);
  });

  it(`Sorts`, async () => {
    const results = await db(connStr)
      .table("employees")
      .orderBy("fans")
      .toArray();

    results.length.should.equal(6);
    results[0].name.should.equal("Pete Hornberger");
  });

  it(`Sorts Descending`, async () => {
    const results = await db(connStr)
      .table("employees")
      .orderBy("fans")
      .toArray();

    results.length.should.equal(6);
    results[0].name.should.equal("Liz Lemon");
  });

  it(`Sorts on multiple fields (ascending + ascending)`, async () => {
    const results = await db(connStr)
      .table("employees")
      .orderBy("fans")
      .thenByDescending("name")
      .toArray();

    results.length.should.equal(6);
    results[2].name.should.equal("Kenneth Parcell");
  });

  it(`Sorts on multiple fields (ascending + descending)`, async () => {
    const results = await db(connStr)
      .table("employees")
      .orderBy("fans")
      .thenByDescending("name")
      .toArray();

    results.length.should.equal(6);
    results[2].name.should.equal("Kenneth Parcell");
  });

  it(`Slices results`, async () => {
    const results = await db(connStr)
      .table("employees")
      .slice(2, 3)
      .toArray();

    results.length.should.equal(2);
    results[0].name.should.equal("Jack Donaghy");
    results[1].name.should.equal("Kenneth Parcell");
  });

  it(`Fetches specific fields`, async () => {
    const results = await db(connStr)
      .table("employees")
      .map(x => ({ name: x.name, job: x.job }))
      .toArray();

    results.length.should.equal(6);
    results[0].name.should.equal("Jack Donaghy");
    results[1].name.should.equal("Kenneth Parcell");
  });
});
