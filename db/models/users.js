const Sequelize = require('sequelize')
const {
    sqlTable,
} = require('../index.js')

const users = {
    async addUser(data) {
        if (data.mobile_phone !== undefined && data.mobile_phone !== null) {
            return sqlTable.users.create({
                mobile_phone: data.mobile_phone,
                // email: '',
                password: data.password,
                lv: data.lv || 0,
                membership_expired: data.membership_expired || 0,
                amount: data.amount || 0
            })
        } else {
            return sqlTable.users.create({
                // mobile_phone: '',
                lv: data.lv || 0,
                amount: data.amount || 0,
                email: data.email,
                membership_expired: data.membership_expired || 0,
                password: data.password,
            })
        }
    },

    async chkUserExist(data) {
        return sqlTable.users.findAndCountAll({
            attributes: ['id', 'mobile_phone', 'email', 'password', 'salt', 'balance', 'lv', 'membership_expired', 'status', 'nickname', 'weixin', 'qq', 'address'],
            where: {
                [Sequelize.Op.or]: [{mobile_phone: data.mobile_phone || 'NA'}, {email: data.email || 'NA'}]
            }
        })
    },

    async getUserById(data) {
        // return sqlTable.users.findById({})
        return sqlTable.users.findOne({
            attributes: [['id', 'userid'], 'mobile_phone', 'email', 'lv', 'membership_expired', 'nickname', 'balance', 'password'],
            where: {
                id: data.userid || 0
            }
        })
    },

    async getUser(data) {
        return sqlTable.users.findOne({
            attributes: ['id', 'mobile_phone', 'email', 'lv', 'membership_expired', 'nickname', 'balance'],
            where: {
                [Sequelize.Op.or]: [{mobile_phone: data.mobile_phone || 'NA'}, {email: data.email || 'NA'}]
            }
        })
    },

    async getUser2(data) {
        return sqlTable.users.findOne({
            attributes: ['mobile_phone', 'email', 'lv', 'membership_expired', 'nickname', 'balance'],
            where: {id: data.userid}
        })
    },

    async getBalance(data) {
        return sqlTable.users.findOne({
            attributes: ['balance', 'membership_expired'],
            where: {
                id: data.userid || 0
            }
        })
    },

    async getMembershipExpired(data) {
        return sqlTable.users.findOne({
            attributes: ['membership_expired'],
            where: {
                id: data.userid || 0
            }
        })
    },

    async updateSalt(data) {
        if (data.mobile_phone !== undefined && data.mobile_phone !== null && data.mobile_phone) {
            return sqlTable.users.update({
                salt: data.salt
            }, {
                where: {
                    mobile_phone: data.mobile_phone || 'NA'
                }
            })
        } else {
            return sqlTable.users.update({
                salt: data.salt
            }, {
                where: {
                    email: data.email || 'NA'
                }
            })
        }
    },

    async updateBalance(data) {
        let balance = 0
        await this.getBalance(data).then(result => {
            balance = result.balance
        })
        balance += data.action === 'deposit' ? parseInt(data.amount) : (-1) * parseInt(data.amount)
        return sqlTable.users.update({
            balance: balance
        }, {
            where: {
                id: data.userid || 0
            }
        })
    },

    async updateMembership(data) {
        return sqlTable.users.update({
            lv: data.lv,
            membership_expired: data.membership_expired,
            balance: data.balance
        }, {
            where: {
                id: data.userid || 0
            }
        })
    },

    async updateMem(data) {
        return sqlTable.users.update({
            lv: data.lv,
            membership_expired: membership_expired
        }, {
            where: {
                id: data.userid || 0
            }
        })
    },

    async updateStatus(data) {
        return sqlTable.users.update({
            status: data.status
        }, {
            where: {
                id: data.userid || 0
            }
        })
    },

    async updateUserBasicInfo(data) {
        return sqlTable.users.update({
            nickname: data.nickname || '',
            weixin: data.weixin || '',
            qq: data.qq || '',
            address: data.address || ''
        }, {
            where: {
                id: data.userid || 0
            }
        })
    },

    async updatePwd(data) {
        return sqlTable.users.update({
            password: data.new_password
        }, {
            where: {
                id: data.userid
            }
        })

    }
}

module.exports = users
