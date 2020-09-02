const express = require('express')

const userRouter = require('./route/product')

const port = 5000

const app = express()
app.use(express.json())


app.use(userRouter)

app.listen(port, () => {
    console.log('Server is listning on port ' + port)
})