const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM industries`);
        return res.json({ industries: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        let code = req.params.code;
        const results = await db.query(`SELECT * FROM industries WHERE code = $1`, [code]);
        if (results.rows.length === 0){
            throw new ExpressError(`Can't find industry with id ${code}`, 404)
        }
        return res.json(results.rows[0]);
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry', [code, industry]);
        return res.status(201).json({ "Industry created:" : results.rows[0] })
    } catch (e) {
        return next(e);
    }
})


router.post('/:industry_code/:comp_code', async (req, res, next) => {
    try {
        const { industry_code, comp_code } = req.params;
        const results = await db.query('INSERT INTO companies_industries (industry_code, comp_code) VALUES ($1, $2)', [industry_code, comp_code])
        return res.status(201).json({ "Relation created:" : industry_code, comp_code })
    } catch (e) {
        return next(e);
    }
})

module.exports = router;