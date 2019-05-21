const log4js = require('log4js')

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        httpError: { type: 'dateFile', filename: `${__dirname}/../logs/http/httpError.log`, alwaysIncludePattern: true },
        httpInfo: { type: 'dateFile', filename: `${__dirname}/../logs/httpInfo/httpInfo.log`, alwaysIncludePattern: true }
    },
    categories: {
        default: { appenders: ['out'], level: 'error' },
        httpError: { appenders: ['httpError'], level: 'error' },
        httpInfo: { appenders: ['httpInfo'], level: 'info' }
    }
})

const loggerHttp = log4js.getLogger('httpError')
const loggerHttpInfo = log4js.getLogger('httpInfo')

module.exports = { loggerHttp, loggerHttpInfo }
