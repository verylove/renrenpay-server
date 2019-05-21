const Sequelize = require('sequelize')
const {
    sqlTable,sequelize
} = require('../index.js')

const paychecks = {
    async addPaychecks(data){
        return sqlTable.paychecks.create({
            userid:data.userid || '',
            appid:data.appid || '',
            orderid:data.orderid || null,
            amount:data.amount || 0,
            payway:data.payway || 1,
            memeo:data.memeo || '',
            transid:data.transid || null
        })
    },

    async getList(data){
        let limit = data.page_size*1;
        let offset = data.page_size * (data.page - 1);
        let w = {}
        if(data.state*1 === 1){//订单支付成功来源
            w = {
                userid: data.userid,
                orderid:{$ne:null},
            }
        }else if(data.state*1 === 0){  //其他来源
            w = {
                userid: data.userid,
                orderid:{$eq:null}
            }
        }else{
            w = {
                userid: data.userid
            }
        }
        return sqlTable.paychecks.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']] ,
            where: w
        })
    },

    async totalAmount(data){
        // return sequelize.query(`select amount,payway,appid from paychecks where userid=? and dayofyear(createdAt)=?`,{
        return sequelize.query(`SELECT amount,payway,appid FROM paychecks WHERE userid=? and DATE_FORMAT( createdAt,'%Y-%m-%d') = DATE_FORMAT(CURDATE(),'%Y-%m-%d') ORDER BY createdAt DESC;`,{
            type:Sequelize.QueryTypes.SELECT,
            replacements:[data.userid],
        })
    },
}
module.exports = paychecks