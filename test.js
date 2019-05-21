let crypto = require('crypto');
const md5 = info => {
    const md5 = crypto.createHash('md5')
    md5.update(info)
    return md5.digest('hex')
}

// console.log(md5("qwerty"))
let dbInfo = {
};
const pwd = md5(md5(dbInfo.password) + dbInfo.salt);
console.log(pwd)