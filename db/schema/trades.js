class sqlTable {
    // 系统商品表
    static trades(Sequelize) {
        return {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: { // 产品名称
                type: Sequelize.STRING,
                allowNull: false,
            },
            amount: { // 产品金额
                type: Sequelize.INTEGER,
                allowNull: false
            },
            create_account_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            desc: { // 商品描述
                type: Sequelize.STRING,
                allowNull: false
            },
            day: { //充值天数
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            lv: { //充值等级
                type: Sequelize.INTEGER,
                defaultValue: 0
            }
        }
    };

    static publicSet() {
        return {
            freezeTableName: true,
            paranoid: true,
            timestamps: true,
        };
    }
}

module.exports = sqlTable;