const Sequelize = require('sequelize')
const {
    sqlTable,
} = require('../index.js')

const logs = {
    async setLog(data){
        return await sqlTable.logs.create({
            userid:data.userid,
            content:data.content,
            timestamps:data.timestamps
        })
    },
    async setLogs(data){
        return await sqlTable.logs.bulkCreate(data.list)
    },
    async queryLog(data){
        let limit = data.page_size*1;
        let offset = data.page_size * (data.page - 1);
        return sqlTable.deposits.findAndCountAll({
            limit,
            offset,
            where: {
                userid:data.userid
            }
        })
    }
}

module.exports=logs