import { db, table } from "../isotropy-db";

export default db({
  employees: table([
    {
      __id: 1,
      name: "Liz Lemon",
      job: "Head Writer",
      fans: 10000
    },
    {
      __id: 2,
      name: "Jack Donaghy",
      job: "Vice President",
      fans: 8000
    },
    {
      __id: 3,
      name: "Kenneth Parcell",
      job: "Page",
      fans: 8000
    },
    {
      __id: 4,
      name: "Pete Hornberger",
      job: "Producer",
      fans: 1000
    },
    {
      __id: 5,
      name: "Jenna Maroney",
      job: "Actress",
      fans: 4000
    },
    {
      __id: 6,
      name: "Tracy Jordan",
      job: "Actor",
      fans: 5000
    }
  ]),
  orders: [
    {
      __id: 1,
      item: "Sabor de Soledad",
      quantity: 44,
      price: 2.4,
      employeeId: "1"
    },
    {
      __id: 2,
      item: "EGOT Pendant",
      quantity: 1,
      price: 12000,
      employeeId: "6"
    },
    {
      __id: 3,
      item: "iPhone X",
      quantity: 1,
      price: 999,
      employeeId: "1"
    },
    {
      __id: 4,
      item: "iPhone X",
      quantity: 1,
      price: 1299,
      employeeId: "2"
    }
  ]
})
