const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

class Jwt {
    constructor(data) {
        this.data = data
    }

    generateToken() {
        let data = this.data
        let now = Math.floor(Date.now() / 1000)
        let cert = fs.readFileSync(path.join(__dirname, '../keys/master-privatekey.pem'))
        let token = jwt.sign({
            data,
            exp: now + 60 * 60 / 2,
        }, cert, { algorithm: 'RS256' })

        return token
    }

    verifyToken() {
        let token = this.data
        let cert = fs.readFileSync(path.join(__dirname, '../keys/master-public.pem'))
        let res
        try {
            let result = jwt.verify(token, cert, { algorithm: ['RS256'] }) || {}
            let {exp = 0} = result, current = Math.floor(Date.now() / 1000)
            if (current <= exp) {
                res = result.data || {}
            }
        } catch (err) {
            res = 'err'
        }
        return res
    }
}

module.exports = Jwt
