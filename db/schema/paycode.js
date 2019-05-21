class sqlTable {
    static paycodes(Sequelize) {
        return {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            // 用户id
            userid: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            // 付款码
            qrcode: {
                type: Sequelize.STRING,
                allowNull: false
            },
            // 付款信息备注
            pay_code: {
                type: Sequelize.STRING,
                allowNull: false
            },
            // 金额
            amount: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            // 使用次数
            use_num: {
                type: Sequelize.INTEGER,
                defaultValue: 0
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