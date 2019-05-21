const Sequelize = require('sequelize')
const Op = Sequelize.Op
const {
    sqlTable,sequelize
} = require('../index.js')

const statistic={
    async set_statistic(data){
        return sqlTable.statistic.bulkCreate(data.list)
    },

    async getToday(data) {
        return sequelize.query(`select w_count,p_count,w_total1,p_total1,w_total2,p_total2 from statistic where userid=? and date=?`,{
            type: Sequelize.QueryTypes.SELECT,
            replacements:[data.userid,data.day]
        })
    },

    async getWeek(data) {
        return sequelize.query(`select w_count,p_count,w_total1,p_total1,w_total2,p_total2,date from statistic where userid=? and date>=? and date<=? order by date`,{
            type: Sequelize.QueryTypes.SELECT,
            replacements:[data.userid,data.startDate,data.endDate]
        })
    },

}

module.exports = statistic