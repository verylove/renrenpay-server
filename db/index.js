const Sequelize = require('sequelize')
const SqlTable = require('./sqlTable.js')
const config = require('../conf/default.js')

let sequelize, sqlTable

async function init() {
    sequelize = new Sequelize(config.db.db, config.db.user, config.db.password, {
        host: config.db.host,
        port: config.db.port,
        dialect: config.db.dialect,
        pool: {
            max: 100,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        timezone: '+08:00'
    })
    // init
    sqlTable = new SqlTable(Sequelize, sequelize)
}

init()
module.exports = {Sequelize, sequelize, sqlTable}
