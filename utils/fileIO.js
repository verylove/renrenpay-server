const fs = require('fs')
const path = require('path')
const {
    loggerHttp
} = require('./logger.js')

const fileIO = {
    // write into a file
    async writeFile(filename, data) {
        try {
            fs.writeFileSync(path.join(__dirname, filename), data)
            return true
        } catch (err) {
            loggerHttp.error(`writeFile -- ${err}`)
        }
    }
}

module.exports = fileIO
