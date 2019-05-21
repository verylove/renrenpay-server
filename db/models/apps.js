const Sequelize = require('sequelize')
const {
    sqlTable,
} = require('../index.js')

const apps = {
    async addApplication(data) {
        return sqlTable.apps.create({
            userid: data.userid,
            name: data.name,
            callback_url: data.callback_url || '',
            whitelist: data.whitelist || '',
            appid: data.appid,
            appsecret: data.appsecret,
            pay_userid:data.pay_userid,
            status: 1
        })
    },

    async chkAppExist(data) {
        return sqlTable.apps.findAndCountAll({
            where: {
                userid: data.userid,
                name: data.name
            }
        })
    },
    async chkAppExist2(data) {
        return sqlTable.apps.findAndCountAll({
            where: {
                userid: data.userid,
                name: data.name,
                id:{$ne:data.id}
            }
        })
    },
    async getAppCount(data) {
        return sqlTable.apps.findAndCountAll({
            where: {
                userid: data.userid,
            }
        })
    },

    async getApps(data) {
        let limit = data.page_size*1;
        let offset = data.page_size * (data.page - 1);
        return sqlTable.apps.findAndCount({
            limit,
            offset,
            where: {
                userid: data.userid,
            }
        })
    },

    async queryApps(data) {
        return sqlTable.apps.findAll({
            where: {
                appid: data.appid,
            }
        })
    },

    async updateAppInfo(data) {
        return sqlTable.apps.update({
            callback_url: data.callback_url || '',
            whitelist: data.whitelist || '',
            name: data.name,
            pay_userid:data.pay_userid
        }, {
            where: {
                id: data.id || 0,
                userid: data.userid
            }
        })
    },

    async deleteApp(data) {
        return sqlTable.apps.destroy({
            where: {
                id: data.id,
                userid: data.userid
            }
        })
    },

    async allApps(data) {
        return sqlTable.apps.findAll({
            where: {
                userid: data.userid,
            }
        })
    },

    async isMeApp(data) {
        return sqlTable.apps.findAll({
            where: {
                userid: data.userid,
                appid: data.appid
            }
        })
    }
}

module.exports = apps
