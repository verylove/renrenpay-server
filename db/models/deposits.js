const Sequelize = require('sequelize')
const {
    sqlTable,
} = require('../index.js')

const deposits = {
    async addDeposit(data) {
        return sqlTable.deposits.create({
            userid: data.userid,
            orderid: data.orderid,
            type: data.type || 0,
            amount: data.amount || 0,
            memo: data.memo || data.pay_code || data.orderid || '',
            status:data.status || 0
        })
    },

    async updateDepositInfo(data) {
        return sqlTable.deposits.update({
            status: data.status || 0
        }, {
            where: {
                orderid: data.orderid || '0',
            }
        })
    },

    async getDepositList(data) {
        let limit = data.page_size*1;
        let offset = data.page_size * (data.page - 1);
        let w = {};
        if(data.state == 1){//充值的记录
            w = {
                userid: data.userid,
                status:1,
                $or:[{type:1},{type:2}]
            }
        }else if(data.state == 2){ //购买会员的记录
            w = {
                userid: data.userid,
                status:1,
                type:3
            }
        }else if(data.state == 3){//手续费记录
            w = {
                userid: data.userid,
                status:1,
                type:4
            }
        }else{
            w = {
                userid: data.userid,
                status:1
            }
        }
        return sqlTable.deposits.findAndCountAll({
            limit,
            offset,
            where: w
        })
    },

}

module.exports = deposits
