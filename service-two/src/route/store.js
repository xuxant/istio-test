const express = require('express')

const router = new express.Router()

const product = [{
    "id": 1,
    "name": "Store Number One."
}, {
    "id": 2,
    "name": "Store Number Two."
}, {
    "id": 3,
    "name": "Store Number Three."
}]

router.get('/', async (req, res) => {
    res.status(200).json({
        "Success": true,
        "message": "Hello World! Welcome to store."
    })
})


router.get('/store', async (req, res) => {
    res.status(200).json({
        "Success": true,
        "data": product
    })
})

router.get('/store/:id',
    async (req, res) => {
        res.status(200).json({
            "Success": true,
            "data": product[(req.params.id - 1)]
        })
    })

module.exports = router