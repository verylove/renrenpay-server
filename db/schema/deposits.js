class sqlTable {
    // columns
    static deposits(Sequelize) {
        return {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userid: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            orderid: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            tradeid: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            //1支付宝充值，2微信充值，3购买会员，4平台消费
            type: {
                type: Sequelize.TINYINT(6),
                allowNull: false,
            },
            amount: {//
                type: Sequelize.INTEGER
            },
            memo: {
                type: Sequelize.STRING
            },
            status: {//0生成订单 1订单成功
                type: Sequelize.TINYINT(1),
                defaultValue: 1
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
