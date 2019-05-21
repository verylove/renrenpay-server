const Sequelize = require('sequelize')
const Op = Sequelize.Op
const {
    sqlTable,
} = require('../index.js')
const trades = {
    //添加充值订单
    async addTrades(data) {
        return sqlTable.trades.create({
            name: data.name,
            amount: data.amount,
            create_account_id: data.userid,
            desc: data.desc,
            day: data.day,
            lv: data.lv
        });
    },
    // 修改商品
    async modifyTrades(data) {
        return sqlTable.trades.update(data, {
            where: {
                id: data.tradeid
            }
        })
    },
    /**
     * deleteTrades
     * 删除商品
     * */
    async deleteTrades(data) {
        return sqlTable.trades.destroy({
            where: {
                id: data.tradeid
            }
        })
    },
    /**
     * 查询订单列表
     * start 开始条数
     * size 查询页面大小
     */
    async getTrades(data) {
        return sqlTable.trades.findAndCountAll({
            attributes:[['id', 'tradeid'], 'name', 'desc', 'amount', 'day', 'lv'],
            limit: data.page_size * 1,
            offset: data.start
        })
    },
    /**
     * 查找指定的商品
     * */
    async findTradeById(trade_id) {
        return sqlTable.trades.findById(trade_id);
    }
};

module.exports = trades;