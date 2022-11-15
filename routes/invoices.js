const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM invoices');
        return res.json({ invoices: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
        if (results.rows.length === 0){
            throw new ExpressError(`Can't find invoice with id ${id}`, 404)
        }
        const code = results.rows[0].comp_code;
        const company = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        return res.json({ invoice: results.rows[0], company: company.rows[0] });

    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
        return res.status(201).json( {invoice: results.rows[0] })
    } catch (e) {
        return next(e);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const results = await db.query('UPDATE invoices SET amt = $1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id])
        if (results.rows.length === 0){
            throw new ExpressError(`Can't update invoice with id ${id}`, 404)
        }
        return res.send({ invoice: results.rows[0]})
    } catch (e) {
        return next(e);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id])
        return res.send({ msg: "BALEETED!" })
    } catch (e) {
        return next(e);
    }
})
// router.delete('/:code', async(req, res, next) => {
//     try{
//         const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
//         return res.send({ msg: "BALEETED!!" })
//     } catch (e) {
//         return next(e);
//     }
// })

module.exports = router;