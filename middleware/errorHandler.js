const { logEvents } = require('./logger')

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)

    const status = res.statusCode ? res.statusCode : 500 // Server error

    res.status(status)

    res.json({ message: err.message, isCORS: err.message === 'Not allowed by CORS' })
}

module.exports = errorHandler