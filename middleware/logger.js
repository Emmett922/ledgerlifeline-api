//Destructures
const { format } = require('date-fns')
const { v4: uuid } = require('uuid') //creates unique id's for objects
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFileName) => {
    //Date object to store the time log was made
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
    //Log item object
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try {
        // If logs directory doesn't exist, create it
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (err) {
        console.log(err)
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    console.log(`${req.method} ${req.path}`)
    next()
}

module.exports = { logEvents, logger }