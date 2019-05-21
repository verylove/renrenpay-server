class sqlTable {
    static orders(Sequelize){
        return {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userid: {
                type: Sequelize.STRING,
            },
            appid: {//用户应用的id
                type: Sequelize.STRING,
            },
            orderid: {//订单的id
                type:Sequelize.STRING,
                unique: true
            },
            amount: {//金额
                type: Sequelize.BIGINT,
                defaultValue: 0.0
            },
            payway:{//1支付宝，2微信
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            qrcode:{
                type:Sequelize.STRING,
            },
            memo:{//备注
                type:Sequelize.STRING
            },
            state:{//0生成订单，订单成功
                type: Sequelize.TINYINT(1),
                defaultValue: 0
            },
            //付款码备注
            pay_code: {
                type:Sequelize.STRING,
                allowNull: false
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