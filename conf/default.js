const _ = require('lodash')

let config = {
    port: 3000,
    db: {
        host: process.env.host || '127.0.0.1',
        port: process.env.port || 3306,
        db:  process.env.db ||'db_renrenpay',
        dialect: 'mysql',
        user: process.env.username || 'root',
        password:  process.env.password || '123456'
    },
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    websocket: {
        port: 7234
    },
    appid: process.env.appid || '15c821df1e52',
    adminPwd: process.env.adminpwd  || '123456',
    userid: '1',
    pay_userid: process.env.pay_userid ||'2088112172418889'
}

const init = () => {
    if (process.env.NODE_ENV === 'development') {
        const localConfig = {
            db: _.extend(config.db, {
                user: config.user,
                password: db.password
            })
        }
        config = _.extend(config, localConfig)
    }

    if (process.env.NODE_ENV === 'production') {
        const localConfig = {
            db: _.extend(config.db, {
                user: '',
                password: ''
            })
        }
        config = _.extend(config, localConfig)
    }

    return config
}

module.exports = init()
