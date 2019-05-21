const crypto = require('crypto')

const MD5 = data => {
    const md5 = crypto.createHash('md5')
    md5.update(data)
    return md5.digest('hex')
}

module.exports = MD5
