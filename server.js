// -- Server Imports -- //
require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

connectDB()

// Comes before anything else
app.use(logger)

// Options for api access to the public
app.use(cors(corsOptions))

// Allows app to receive and parse JSON data
app.use(express.json())

// Parse cookies function
app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

// index.html routing for api splash page
app.use('/', require('./routes/root'))
// route for usersController
app.use('/users', require('./routes/userRoutes'))

// 404 error handling
app.all('*', (req, res) => {
    res.status(404)
    //Incorrect request handling depending on request type
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found'} )
    } else {
        res.type('txt').send('404 Not Found')
    }
})

// Use just before we tell app to listen
app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
