// const {
//     Router
// } = require("express")

const express = require('express')

const router = new express.Router()

const product = [{
    "id": 1,
    "name": "Water"
}, {
    "id": 2,
    "name": "Chocolates"
}, {
    "id": 3,
    "name": "IceCream"
}]

router.get('/', async (req, res) => {
    res.status(200).json({
        "Success": true,
        "message": "Hello World! This is the Product dummy service."
    })
})

router.get('/product', async (req, res) => {
    res.status(200).json({
        "Success": true,
        "data": product
    })
})

router.get('/product/:id',
    async (req, res) => {
        res.status(200).json({
            "Success": true,
            "data": product[(req.params.id - 1)]
        })
    })

module.exports = router