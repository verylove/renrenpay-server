class sqlTable {
    static statistic(Sequelize) {
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
            appid:{
                type: Sequelize.STRING,
                // allowNull: false,
            },
            w_count:{//微信订单数量
                type: Sequelize.BIGINT,
                defaultValue: 0,
            },
            p_count:{//支付宝订单数量
                type: Sequelize.BIGINT,
                defaultValue: 0,
            },
            w_total1:{//微信已知来源总额
                type: Sequelize.BIGINT,
                defaultValue: 0,
            },
            p_total1:{//支付宝已知来源总额
                type: Sequelize.BIGINT,
                defaultValue: 0,
            },
            w_total2:{//微信未知来源总额
                type: Sequelize.BIGINT,
                defaultValue: 0,
            },
            p_total2:{//支付宝未知来源总额
                type: Sequelize.BIGINT,
                defaultValue: 0,
            },
            // payway:{
            //     type: Sequelize.TINYINT(1),
            //     // defaultValue: 1  
            // },
            // status:{
            //     type: Sequelize.TINYINT(1),
            //     defaultValue: 1
            // },
            date:{
                type: Sequelize.STRING,
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