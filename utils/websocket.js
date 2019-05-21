const WebsocketServer = require('websocket').server
const http = require('http')
const wsMap = new Map()
const ErrorCode = require('../utils/errorCode.js')
const config = require('../conf/default.js')


const httpServer = http.createServer(function (req, res) {
    console.log((new Date()) + ' Received request for ' + req.url)
    res.writeHead(404)
    res.end()
})

function websocket() {
    httpServer.listen(config.websocket.port, function () {
        console.log((new Date()) + ' Server is listening on port ' + config.websocket.port)
    })

    let wsServer = new WebsocketServer({
        httpServer: httpServer,
        autoAcceptConnections: false
    })

    wsServer.on('request', async function (req) {
        // let connection = req.accept('echo-protocol', req.origin);
        console.info(req.resourceURL.query.user)
        console.log((new Date()) + ' Origin: ' + req.origin)
        if (!originIsAllowed(req.origin)) {
            req.reject()
            console.log((new Date()) + ' Connection from origin ' + req.origin + ' rejected.')
            return
        }
        let conn;
        try {
            conn = req.accept('echo-protocol', req.origin);
        } catch (error) {
            wsMap.delete(req.origin)
            return error
        }
        let key = req.resourceURL.query.user;
        if(key) {
            console.info('--->',key);
            wsMap.set(key.toString(), conn)
        } else {
            return
        }
        
        console.log((new Date()) + ' Connection from origin ' + req.origin + ' accepted.')

        conn.on('message', async function (msg) {
            console.log(req.origin + ' >>>',req.resourceURL.query.user)
            console.log('Received message: ' + msg.utf8Data)
        })

        conn.on('close', function (reasonCode, desc) {
            console.log(req.origin + ' >>>')
            console.log('Received close: ' + reasonCode + ' desc: ' + desc)

            wsMap.delete(req.origin)
            console.log((new Date()) + ' Peer ' + conn.remoteAddrress + ' disconnected.')
        })
    })
}

function originIsAllowed(origin) {
    return true
}

websocket.prototype.sendMsg = function(useId, msg) {
    try {
        console.info(useId,msg);
        const connection = wsMap.get(useId + "");
        if(!connection)
            throw {code: ErrorCode.NOT_FIND_PHONE, message: "没有找到设备"}
        connection.sendUTF(msg);
    } catch (error) {
        console.log(error)
        throw {code: ErrorCode.ERRORCODE_SERVER_INSIDE_ERROR, message: "sendMsg error"}
    }

};

module.exports = websocket
