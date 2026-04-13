const express = require('express')
const app = express()
require('dotenv').config({ quiet: true })
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

// port
const port = process.env.PORT || 3000

// database connection
mongoose
    .connect(process.env.MONGO_URI, {
        ssl: true
    })
    .then(() => console.log("DB Connection successful"))
    .catch((err) => {
        console.error('DB connection failed:', err.message)
        process.exit(1)
    })

// middlewares
app.use(express.json())
app.use(bodyParser.json())
app.use(cookieParser())


// routes
const authRouter = require('./routes/auth');
const uploadRouter = require("./routes/upload");
const siteRouter = require("./routes/site");

// api endpoints
app.use('/', authRouter);
app.use("/", uploadRouter);
app.use("/", siteRouter);


// dont write anything new below this point
// home route
app.get("/", (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Solardash Server API!'
    })
})

// 404 handler
app.use((req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  err.status = 404
  next(err)
})

// global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: 'Error',
    message: err.message || 'Internal Server Error'
  })
})

// server entry
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})