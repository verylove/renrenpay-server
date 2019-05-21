const appsTable = require('./schema/apps.js')
const depositsTable = require('./schema/deposits.js')
const usersTable = require('./schema/users.js')
const withdrawsTable = require('./schema/withdraws.js')
const ordersTable = require('./schema/orders.js')
const paychecksTable = require('./schema/paychecks.js')
const paycodeTable = require('./schema/paycode.js')
const tradesTable = require('./schema/trades.js')
const logsTable = require('./schema/logs.js')
const statisticTable = require('./schema/statistic.js')

class sqlTable {
    constructor(Sequelize, sequelize) {
        this.apps = sequelize.define('apps', appsTable.apps(Sequelize), appsTable.publicSet())
        this.deposits = sequelize.define('deposits', depositsTable.deposits(Sequelize), depositsTable.publicSet())
        this.users = sequelize.define('users', usersTable.users(Sequelize), usersTable.publicSet())
        this.withdraws = sequelize.define('withdraws', withdrawsTable.withdraws(Sequelize), withdrawsTable.publicSet())
        this.orders = sequelize.define('orders', ordersTable.orders(Sequelize), ordersTable.publicSet())
        this.paychecks = sequelize.define('paychecks', paychecksTable.paychecks(Sequelize), paychecksTable.publicSet())
        this.paycodes = sequelize.define('paycodes', paycodeTable.paycodes(Sequelize), paycodeTable.publicSet())
        this.trades = sequelize.define('trades', tradesTable.trades(Sequelize), tradesTable.publicSet())
        this.logs = sequelize.define('logs', logsTable.logs(Sequelize), logsTable.publicSet())
        this.statistic = sequelize.define('statistic', statisticTable.statistic(Sequelize),statisticTable.publicSet())
        sequelize.sync({
            logging: false
        })
    }
}

module.exports = sqlTable
