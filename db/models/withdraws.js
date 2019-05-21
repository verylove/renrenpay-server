const Sequelize = require('sequelize')
const {
    sqlTable,
} = require('../index.js')

const withdraws = {
    async addWithdraw(data) {
        return sqlTable.withdraws.create({
            userid: data.userid,
            uuid: data.uuid,
            type: data.type || '',
            amount: data.amount || 0,
            memo: data.memo || '',
            status: 1
        })
    },

    async updateWithdrawInfo(data) {
        return sqlTable.withdraws.update({
            status: data.status || 0
        }, {
            where: {
                id: data.userid || 0
            }
        })
    },
}

module.exports = withdraws
