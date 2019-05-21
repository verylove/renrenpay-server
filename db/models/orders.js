const Sequelize = require('sequelize')
const {
    sqlTable,
} = require('../index.js')

const orders = {
    async addOrder(data) {
        return sqlTable.orders.create({
            userid: data.userid,
            appid: data.appid,
            orderid: data.orderid || '',
            amount: data.amount || '',
            payway: data.payway || '',
            memo:data.memo || '',
            qrcode:data.qrcode || '',
            pay_code: data.pay_code || ''
        })
    },

    async findOne(data){
        return sqlTable.orders.findOne({
            where:{orderid:data.orderid}
        })
    },

    async findOne2(data){
        return sqlTable.orders.findOne({
            where:{memo:data.memo,userid:data.userid}
        })
    },

    async update(data){
        return sqlTable.orders.update({
            qrcode:data.qrcode
        },{
            where:{
                orderid:data.orderid
            }
        })
    },

    async update2(data){
        return sqlTable.orders.update({
            state:1
        },{
            where:{
                orderid:data.orderid
            }
        })
    },

    async getList(data){
        let limit = data.page_size*1;
        let offset = data.page_size * (data.page - 1);
        let w = {}
        if(data.state === 0){
            w = {
                userid: data.userid,
                status:0
            }
        }else if(data.state === 1){
            w = {
                userid: data.userid,
                status:1
            }
        }else{
            w = {
                userid: data.userid
            }
        }
        return sqlTable.deposits.findAndCountAll({
            limit,
            offset,
            where: w
        })
    }
}

module.exports=orders