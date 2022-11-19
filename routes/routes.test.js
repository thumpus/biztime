process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany = { code: "tst", name: "test company", description: "a test company" };
let testCompany2 = { code: "tst2", name: "test company 2", description: "a second test company" };
let testInvoice = { id: 1, comp_code: "tst", amt: 500, paid: true, add_date: '2018-01-01T05:00:00.000Z', paid_date: '2018-01-02T05:00:00.000Z'};
let testInvoice2 = { id: 2, comp_code: "tst", amt: 53453200, paid: true, add_date: '2018-02-02T05:00:00.000Z', paid_date: '2018-02-03T05:00:00.000Z'};

beforeEach(async function(){
    await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)', 
    [testCompany.code, testCompany.name, testCompany.description]);
    await db.query('INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, comp_code, amt, paid, add_date, paid_date',
    [testInvoice.id, testInvoice.comp_code, testInvoice.amt, testInvoice.paid, '2018-01-01T05:00:00.000Z', '2018-01-02T05:00:00.000Z']);
})

afterEach(async function(){
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM invoices');
})

/// COMPANIES ROUTES ///


describe("GET /companies/", function(){
    test("gets a list of companies", async function(){
        const resp = await request(app).get('/companies');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"companies": [testCompany]});
    })
})

describe("GET /companies/:code", function(){
    test("gets details of a specific company", async function(){
        const resp = await request(app).get(`/companies/${testCompany.code}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"company": testCompany, "invoices": [testInvoice]});
    })
})

describe("POST /companies/", function(){
    test("adds a company to the database", async function(){
        const resp = await request(app).post('/companies').send(testCompany2);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({"company": testCompany2});
    })
})

describe("PUT /companies/:code", function(){
    test("edits existing company", async function(){
        const resp = await request(app).put(`/companies/${testCompany.code}`).send({ code: "tst", name: "edited company", description: "a edited company" });
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"company": { code: "tst", name: "edited company", description: "a edited company" }});

    })
})

describe("DELETE /companies/:code", function(){
    test("deletes existing company", async function(){
        const resp = await request(app).delete(`/companies/${testCompany.code}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ msg: "BALEETED!!" });
    })
})

/// INVOICES ROUTES ///

describe("GET /invoices/", function(){
    test("gets a list of invoices", async function(){
        const resp = await request(app).get('/invoices');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"invoices": [testInvoice]});
    })
})

describe("GET /invoices/:id", function(){
    test("gets a specific invoice by id", async function(){
        const resp = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"company": testCompany, "invoice": testInvoice});
    })
})

describe("POST /invoices/", function(){
    test("adds a new invoice", async function(){
        const resp = await request(app).post('/invoices').send(testInvoice2);
        expect(resp.statusCode).toBe(201);
        expect(resp.body.invoice.amt).toBe(testInvoice2.amt);
    })
})

describe("PUT /invoices/:id", function(){
    test("edits an existing invoice", async function(){
        const resp = await request(app).put(`/invoices/${testInvoice.id}`).send({amt: 25});
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"invoice": { id: 1, comp_code: "tst", amt: 25, paid: true, add_date: '2018-01-01T05:00:00.000Z', paid_date: '2018-01-02T05:00:00.000Z'}})
    })
});

describe("DELETE /invoices/:code", function(){
    test("deletes existing invoice", async function(){
        const resp = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ msg: "BALEETED!" });
    })
})