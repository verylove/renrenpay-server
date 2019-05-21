class sqlTable {
    static paychecks(Sequelize){
        return {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userid: {//用户id
                type: Sequelize.STRING,
                allowNull: false,
            },
            appid: {//
                type: Sequelize.STRING,
            },
            orderid: {//订单的id
                type:Sequelize.STRING,
                unique: true
            },
            transid:{//支付宝，微信平台获取的交易id
                type: Sequelize.STRING,
                unique: true
            },
            amount: {//金额
                type: Sequelize.FLOAT,
                defaultValue: 0.0
            },
            payway:{//收款方式
                type: Sequelize.TINYINT(1),
                defaultValue: 1
            },
            memo:{//备注
                type:Sequelize.STRING
            },
            status: {//订单状态
                type: Sequelize.TINYINT(1),
                defaultValue: 1,
            }
        }
    }
    static publicSet() {
        return {
            freezeTableName: true,
            paranoid: true,
            timestamps: true,
        }
    }
}

module.exports = sqlTable