const Sequelize = require('sequelize')
const Op = Sequelize.Op
const {
    sqlTable,
} = require('../index.js')

const paycodes = {
    async addPayCode(data) {
        return sqlTable.paycodes.create({
            userid: data.userid,
            qrcode: data.qrcode,
            pay_code: data.pay_code,
            amount: data.amount,
            use_num: 0
        })
    },
    async getPayCode(data) {
        return sqlTable.paycodes.findOne({
            where: {
                userid: data.userid,
                amount: data.amount,
                pay_code:{$notIn:data.qrcode}
            },
            order: ["use_num"],
        }, Op.notIn[{qrcode: data.qrcode}])
    },
    async addPayCodeNum(data) {
        return sqlTable.paycodes.update({
            num: data.num + 1
        }, {
            where: {
                id: data.id
            }
        })
    },
    async deletePayCode(data){
        return sqlTable.paycodes.destroy( {
            where: {
                userid: data.userid
            }
        })
    }
};

module.exports = paycodes
